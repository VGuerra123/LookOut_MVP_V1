# 👨‍💻 Instrucciones para Desarrollador Senior

## 🎯 ESTADO ACTUAL DEL PROYECTO

Has recibido un proyecto **LookOut** con las siguientes funcionalidades **COMPLETAMENTE IMPLEMENTADAS**:

### ✅ IMPLEMENTADO Y FUNCIONANDO

1. **Sistema de Grabación DashCam**
   - Servicio completo en `services/recording.ts`
   - Buffer circular de 30 segundos
   - Grabación real con expo-camera
   - Overlay con datos GPS simulados

2. **UI Modo Móvil**
   - Archivo: `app/(tabs)/index.tsx`
   - Cámara real integrada
   - Widget overlay minimizable
   - Botones funcionales (INICIAR, LOOKOUT, DETENER)

3. **Servicios de Media**
   - Archivo: `services/media.ts`
   - Generación de thumbnails
   - Upload a Supabase Storage (API lista)
   - Gestión de archivos locales

4. **Base de Datos**
   - Columna `archivo_local_path` añadida
   - Migración aplicada exitosamente
   - RLS policies intactas

5. **TypeScript**
   - 100% sin errores
   - Tipos completos en `types/`
   - Declaraciones de expo-file-system

---

## 🚀 INICIO RÁPIDO

```bash
# 1. Instalar dependencias (ya instaladas)
npm install

# 2. Verificar que compila
npm run typecheck

# 3. Iniciar desarrollo
npm run dev

# 4. Escanear QR con Expo Go
# Login: admin@lookout.com / admin123
```

---

## 📋 TUS TAREAS PENDIENTES

### 🔴 CRÍTICO - Completar MVP (Estimado: 1-2 días)

#### Tarea 1: Pantalla de Registros con Thumbnails
**Archivo**: `app/registros/index.tsx`

```typescript
// HACER:
// 1. Importar mediaService y useState para thumbnails
import { mediaService } from '@/services/media';
import { Image } from 'react-native';

// 2. Al cargar registros, generar thumbnails si tienen archivo_local_path
const loadRegistrosConThumbnails = async () => {
  const { data } = await supabase
    .from('registros')
    .select('*')
    .eq('user_id', user.id);

  for (const registro of data) {
    if (registro.archivo_local_path && !registro.thumbnail_path) {
      const thumbPath = await mediaService.generarThumbnail(
        registro.archivo_local_path
      );
      registro.thumbnail_path = thumbPath;
    }
  }
  setRegistros(data);
};

// 3. En el render, mostrar imagen si existe thumbnail
<Image
  source={{ uri: registro.thumbnail_path || 'placeholder' }}
  style={styles.thumbnail}
/>

// 4. Añadir botón "Publicar" que suba a Storage
const handlePublish = async (id: string) => {
  const registro = registros.find(r => r.id === id);
  if (!registro.archivo_local_path) return;

  // Mostrar loading
  setUploading(true);

  // Subir video
  const videoUrl = await mediaService.subirClipASupabase(
    registro.archivo_local_path
  );

  // Subir thumbnail
  const thumbUrl = await mediaService.subirThumbnailASupabase(
    registro.thumbnail_path
  );

  // Actualizar DB
  await supabase
    .from('registros')
    .update({
      archivo_url: videoUrl,
      thumbnail_url: thumbUrl,
      estado: 'publicado'
    })
    .eq('id', id);

  setUploading(false);
  loadRegistros();
};
```

#### Tarea 2: Detalle con Reproductor de Video
**Archivo**: `app/registros/[id].tsx`

```typescript
// HACER:
// 1. Importar Video de expo-av
import { Video, ResizeMode } from 'expo-av';

// 2. Estado para reproducción
const [videoStatus, setVideoStatus] = useState({});
const videoRef = useRef(null);

// 3. Reemplazar placeholder con componente Video
<Video
  ref={videoRef}
  source={{
    uri: registro.archivo_url || registro.archivo_local_path
  }}
  useNativeControls
  resizeMode={ResizeMode.CONTAIN}
  isLooping
  onPlaybackStatusUpdate={status => setVideoStatus(status)}
  style={styles.video}
/>

// 4. Añadir controles custom si deseas
<View style={styles.controls}>
  <TouchableOpacity onPress={() => {
    videoStatus.isPlaying
      ? videoRef.current.pauseAsync()
      : videoRef.current.playAsync()
  }}>
    <Text>{videoStatus.isPlaying ? 'Pausar' : 'Reproducir'}</Text>
  </TouchableOpacity>
</View>

// 5. Permitir editar nota_tag
const [notaTag, setNotaTag] = useState(registro.nota_tag);

const guardarNota = async () => {
  await supabase
    .from('registros')
    .update({ nota_tag: notaTag })
    .eq('id', registro.id);
};

<TextInput
  value={notaTag}
  onChangeText={setNotaTag}
  onBlur={guardarNota}
  placeholder="Agregar nota..."
/>
```

#### Tarea 3: Modo Estacionario Funcional
**Archivo**: `app/(tabs)/estacionario.tsx`

```typescript
// HACER:
// 1. Implementar grabación sin límite de tiempo
import { CameraView } from 'expo-camera';
import { Audio } from 'expo-av';

const [recording, setRecording] = useState(null);
const [isRecording, setIsRecording] = useState(false);
const cameraRef = useRef(null);

const iniciarGrabacion = async () => {
  if (cameraRef.current) {
    // Sin maxDuration = grabación ilimitada
    const video = await cameraRef.current.recordAsync();
    setRecording(video);
    setIsRecording(true);
  }
};

const detenerGrabacion = () => {
  if (cameraRef.current) {
    cameraRef.current.stopRecording();
    setIsRecording(false);
  }
};

const guardarClip = async () => {
  if (!recording) return;

  // Guardar en DB
  await supabase.from('registros').insert({
    archivo_local_path: recording.uri,
    tipo_modo: 'estacionario',
    estado: 'pendiente',
    // ... otros campos
  });

  Alert.alert('Guardado', 'Clip estacionario guardado');
};

// 2. UI con botones
<CameraView ref={cameraRef} style={styles.camera} />
<TouchableOpacity onPress={isRecording ? detenerGrabacion : iniciarGrabacion}>
  <Text>{isRecording ? 'DETENER' : 'GRABAR'}</Text>
</TouchableOpacity>
{!isRecording && recording && (
  <TouchableOpacity onPress={guardarClip}>
    <Text>GUARDAR</Text>
  </TouchableOpacity>
)}
```

---

### 🟡 IMPORTANTE - Configurar Supabase Storage

#### Paso 1: Crear Bucket
1. Ir a Supabase Dashboard
2. Storage → New bucket
3. Nombre: `clips`
4. Public: ✅ (sí)
5. Crear

#### Paso 2: Configurar RLS Policies
```sql
-- Permitir subida a usuarios autenticados
CREATE POLICY "Users can upload clips"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'clips'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir lectura pública
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'clips');

-- Permitir eliminar propios archivos
CREATE POLICY "Users can delete own clips"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'clips'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 🟢 OPCIONAL - Panel Web (Estimado: 3-5 días)

#### Crear Proyecto Web
```bash
cd project/
mkdir web
cd web

# Crear proyecto Vite + React
npm create vite@latest . -- --template react-ts

# Instalar Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Instalar deps
npm install @supabase/supabase-js react-router-dom react-leaflet chart.js
```

#### Estructura Recomendada
```
web/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Registros.tsx
│   │   └── Detalle.tsx
│   ├── components/
│   │   ├── VideoPlayer.tsx
│   │   ├── MapView.tsx
│   │   └── Stats.tsx
│   ├── lib/
│   │   └── supabase.ts
│   └── App.tsx
└── package.json
```

#### Dashboard Básico
```typescript
// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    movil: 0,
    estacionario: 0,
    publicados: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data } = await supabase
      .from('registros')
      .select('*');

    setStats({
      total: data.length,
      movil: data.filter(r => r.tipo_modo === 'movil').length,
      estacionario: data.filter(r => r.tipo_modo === 'estacionario').length,
      publicados: data.filter(r => r.estado === 'publicado').length,
    });
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      <StatCard title="Total" value={stats.total} />
      <StatCard title="Móvil" value={stats.movil} />
      <StatCard title="Estacionario" value={stats.estacionario} />
      <StatCard title="Publicados" value={stats.publicados} />
    </div>
  );
}
```

---

## 🔧 TOOLS Y HELPERS

### Debugging
```bash
# Ver logs de Expo
npx expo start --clear

# React DevTools
npx react-devtools

# Inspeccionar DB
supabase db inspect
```

### Testing en Dispositivo Real
```bash
# Con Expo Go (limitado, sin PiP)
npm run dev

# Dev Build (completo, con PiP)
npx expo prebuild
npx expo run:android
npx expo run:ios
```

### Verificar Storage
```typescript
// En cualquier componente, para debug
const testStorage = async () => {
  const { data, error } = await supabase.storage
    .from('clips')
    .list();
  console.log('Files in Storage:', data);
};
```

---

## 📖 RECURSOS ÚTILES

### Documentación
- **Expo Camera**: https://docs.expo.dev/versions/latest/sdk/camera/
- **Expo AV**: https://docs.expo.dev/versions/latest/sdk/av/
- **Expo File System**: https://docs.expo.dev/versions/latest/sdk/filesystem/
- **Supabase Storage**: https://supabase.com/docs/guides/storage

### Archivos de Referencia en el Proyecto
- `README_IMPLEMENTACION.md` - Guía técnica completa
- `RESUMEN_IMPLEMENTACION.md` - Estado actual y entregables
- `ARQUITECTURA.md` - Diseño del sistema
- `services/recording.ts` - Ejemplo de servicio bien estructurado

---

## 🐛 TROUBLESHOOTING COMÚN

### "Cannot find module 'expo-file-system'"
```bash
npm install expo-file-system
```

### "Camera not recording"
- Verificar permisos concedidos
- Revisar que `cameraRef.current` no es null
- Check logs: `npx expo start --clear`

### "Supabase upload fails"
- Verificar `.env` tiene SUPABASE_URL y SUPABASE_ANON_KEY
- Confirmar bucket 'clips' existe
- Revisar RLS policies en Dashboard

### "TypeScript errors"
```bash
# Regenerar tipos
npm run typecheck

# Si persiste, limpiar
rm -rf node_modules
npm install
```

---

## ✅ CHECKLIST DE COMPLETITUD

Antes de considerar el MVP completo:

- [ ] Thumbnails en lista de registros
- [ ] Reproductor de video funcional
- [ ] Botón "Publicar" sube a Storage
- [ ] Modo Estacionario graba sin límite
- [ ] Supabase Storage configurado
- [ ] RLS policies aplicadas
- [ ] Tests manuales en dispositivo real
- [ ] Documentación actualizada

### Opcionales (Fase 2):
- [ ] Panel web básico
- [ ] GPS real implementado
- [ ] PiP con dev build
- [ ] Comandos de voz
- [ ] FFmpeg concatenación

---

## 🎯 OBJETIVOS DE CALIDAD

### Performance
- Videos se graben sin lag
- UI fluida (60fps)
- Uploads rápidos (progress indicator)

### UX
- Feedback inmediato en acciones
- Confirmaciones en operaciones destructivas
- Estados de carga claros

### Code Quality
- TypeScript sin errores
- Comentarios útiles
- Código reutilizable
- Tests básicos

---

## 📞 SOPORTE

Si tienes dudas:

1. **Lee la documentación**:
   - README_IMPLEMENTACION.md (técnico)
   - RESUMEN_IMPLEMENTACION.md (ejecutivo)

2. **Revisa el código existente**:
   - `services/recording.ts` tiene ejemplos de buenas prácticas
   - `components/OverlayWidget.tsx` muestra UI/UX polish

3. **Check logs**:
   ```bash
   npx expo start --clear
   ```

4. **Supabase Dashboard**:
   - Ver datos: Table Editor
   - Ver storage: Storage
   - Ver logs: Logs

---

## 🚀 ÉXITO DEL PROYECTO

El MVP está **80% completo**. Las tareas críticas son:

1. **Reproductor** (2-4 horas)
2. **Thumbnails** (2-3 horas)
3. **Modo Estacionario** (3-4 horas)
4. **Storage Config** (1 hora)

**Total estimado**: 1-2 días de trabajo enfocado.

Una vez completado, tendrás un **producto viable** listo para:
- Demo a stakeholders
- Beta testing
- Feedback de usuarios

---

**¡Éxito con la implementación!** 🎉

El código base está sólido, bien estructurado y listo para extender.

---

© 2025 LookOut Chile
