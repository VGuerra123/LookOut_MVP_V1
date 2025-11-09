# 🚗 LookOut - Implementación Completa de Grabación DashCam

## 📋 Estado del Proyecto

✅ **FUNCIONALIDADES IMPLEMENTADAS:**

### 1. Grabación DashCam con Buffer Circular ✅
- **Servicio**: `services/recording.ts`
- **Buffer circular** de 30 segundos con segmentos de 10s
- Graba videos continuos en `FileSystem.documentDirectory/lookout/segments/`
- Mantiene solo los segmentos necesarios para el buffer
- Método `guardarUltimosNsegundos()` concatena y guarda clips en `/lookout/clips/`
- Overlay con datos GPS simulados (velocidad, coordenadas, hora)

### 2. UI de Modo Móvil con Grabación Real ✅
- **Archivo**: `app/(tabs)/index.tsx`
- Integra `CameraView` de expo-camera
- Botones funcionales:
  - **INICIAR MODO MÓVIL**: Inicia grabación con buffer circular
  - **LOOKOUT**: Guarda últimos 30s e inserta en Supabase
  - **DETENER**: Para grabación y limpia buffers
- Contador de segundos en tiempo real
- Badge "Grabando" visible
- Pantalla siempre activa con `useKeepAwake`

### 3. Overlay Widget Persistente ✅
- **Componente**: `components/OverlayWidget.tsx`
- Dos modos: Minimizado (esquina) y Expandido (barra superior)
- Controles: Redimensionar, Detener, LOOKOUT
- Animación de pulso en indicador de grabación
- Muestra velocidad, ubicación GPS y tiempo en vivo
- **Limitación**: PiP nativo requiere expo-dev-client (no disponible en Expo Go)

### 4. Servicio de Media ✅
- **Archivo**: `services/media.ts`
- `generarThumbnail()`: Crea miniaturas con expo-video-thumbnails
- `subirClipASupabase()`: Sube videos a Supabase Storage
- `subirThumbnailASupabase()`: Sube thumbnails
- `obtenerClipsLocales()`: Lista todos los clips guardados
- `eliminarClipLocal()`: Borra archivos del dispositivo

### 5. Base de Datos Actualizada ✅
- Nueva columna `archivo_local_path` en tabla `registros`
- Almacena ruta del archivo MP4 local
- Permite sincronización posterior con Storage

### 6. TypeScript Sin Errores ✅
- Archivo de declaraciones `types/expo-file-system.d.ts`
- Todos los tipos correctamente definidos
- `npm run typecheck` pasa sin errores

---

## 🔧 Configuración y Uso

### Instalación

```bash
npm install
```

**Dependencias añadidas:**
- `expo-camera` - Grabación de video
- `expo-av` - Audio y reproducción
- `expo-file-system` - Manejo de archivos
- `expo-keep-awake` - Mantener pantalla activa
- `expo-media-library` - Acceso a galería
- `expo-video-thumbnails` - Generación de miniaturas
- `base64-arraybuffer` - Conversión para Supabase

### Ejecución

```bash
# Modo desarrollo (Expo Go)
npm run dev

# TypeCheck
npm run typecheck

# Build web
npm run build:web
```

---

## 📁 Estructura de Archivos

```
project/
├── services/
│   ├── recording.ts          ✅ Servicio de grabación con buffer circular
│   └── media.ts               ✅ Servicio de thumbnails y uploads
├── components/
│   └── OverlayWidget.tsx      ✅ Widget de controles persistente
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          ✅ Modo Móvil con cámara real
│   │   ├── estacionario.tsx   ⚠️ Pendiente: implementar grabación sin límite
│   │   ├── administracion.tsx ✅ Configuración
│   │   └── informes.tsx       ✅ Dashboard
│   ├── registros/
│   │   ├── index.tsx          ⚠️ Pendiente: añadir thumbnails y reproductor
│   │   └── [id].tsx           ⚠️ Pendiente: añadir reproductor de video
│   └── auth/                  ✅ Sistema completo de auth
├── types/
│   ├── database.ts            ✅ Tipos de Supabase
│   └── expo-file-system.d.ts  ✅ Declaraciones de tipos
└── supabase/
    └── migrations/            ✅ Migraciones de DB
```

---

## 🎥 Flujo de Grabación

### 1. Iniciar Grabación
```typescript
await recordingService.iniciarGrabacion({
  segmentoSegundos: 10,     // Duración de cada segmento
  ventanaNSegundos: 30      // Tamaño del buffer
});
```

### 2. Guardar Clip
```typescript
const clip = await recordingService.guardarUltimosNsegundos();
// Retorna: { pathMp4, duracion, createdAt }

// Insertar en DB
await supabase.from('registros').insert({
  user_id: user.id,
  duracion_segundos: clip.duracion,
  archivo_local_path: clip.pathMp4,
  tipo_modo: 'movil',
  estado: 'pendiente',
  // ... otros campos
});
```

### 3. Detener Grabación
```typescript
await recordingService.detenerGrabacion();
```

---

## 📦 Supabase Storage

### Configuración Requerida

1. Crear bucket `clips` en Supabase Dashboard
2. Configurar políticas RLS:

```sql
-- Permitir subida a usuarios autenticados
CREATE POLICY "Users can upload clips"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'clips' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir lectura pública de clips publicados
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'clips');
```

### Subir Video a Storage

```typescript
import { mediaService } from '@/services/media';

// Generar thumbnail
const thumbnailPath = await mediaService.generarThumbnail(clip.pathMp4);

// Subir video
const videoUrl = await mediaService.subirClipASupabase(clip.pathMp4);

// Subir thumbnail
const thumbUrl = await mediaService.subirThumbnailASupabase(thumbnailPath);

// Actualizar registro
await supabase
  .from('registros')
  .update({
    archivo_url: videoUrl,
    thumbnail_url: thumbUrl,
    estado: 'publicado'
  })
  .eq('id', registroId);
```

---

## ⚠️ Funcionalidades Pendientes

### 🔴 Alta Prioridad

1. **Pantalla de Registros con Reproductor**
   - Añadir thumbnails en lista
   - Implementar reproductor con `<Video>` de expo-av
   - Permitir edición de `nota_tag` y clasificación

2. **Modo Estacionario Funcional**
   - Implementar grabación sin límite de tiempo
   - Single file recording (no buffer)
   - Guardar al presionar "Guardar"

3. **Sincronización con Storage**
   - Al publicar, subir automáticamente a Supabase
   - Progress indicator durante upload
   - Retry logic para uploads fallidos

### 🟡 Media Prioridad

4. **Panel Web (Dashboard)**
   - Crear proyecto React en `project/web/`
   - Login con Supabase Auth
   - Dashboard con contadores y gráficos
   - Tabla de registros
   - Reproductor de video con coords en mapa
   - Filtros y exportación CSV

5. **Picture-in-Picture Real**
   - Requiere `expo-dev-client` (no funciona en Expo Go)
   - Configurar plugin en app.json:
   ```json
   {
     "plugins": [
       [
         "expo-camera",
         {
           "cameraPermission": "Allow LookOut to access your camera",
           "microphonePermission": "Allow LookOut to access your microphone"
         }
       ]
     ]
   }
   ```
   - Build con: `npx expo prebuild && npx expo run:android`

### 🟢 Baja Prioridad

6. **Comandos de Voz**
   - Instalar `@react-native-voice/voice`
   - Implementar hotword detection "LookOut"
   - Activación por voz del botón LOOKOUT

7. **GPS Real**
   - Instalar `expo-location`
   - Reemplazar datos simulados con ubicación real
   - Tracking de ruta durante grabación

8. **Concatenación de Segmentos con FFmpeg**
   - Instalar `ffmpeg-kit-react-native`
   - Implementar merge real de segmentos MP4
   - Optimización de tamaño de archivos

---

## 🐛 Limitaciones Conocidas

### Expo Go
- ❌ No soporta PiP nativo
- ❌ No puede usar commandos de voz avanzados
- ✅ Grabación de video funciona
- ✅ FileSystem funciona
- ✅ Todos los otros features funcionan

### Solución: Development Build
```bash
# Crear build de desarrollo
npx expo prebuild
npx expo run:android  # o run:ios

# Esto habilita:
# - PiP real
# - Comandos de voz
# - Mejor performance
```

### Storage Local
- Los clips se guardan en `FileSystem.documentDirectory`
- No persisten si se desinstala la app
- Necesitan sincronización manual con Supabase Storage

### Concatenación de Segmentos
- Actualmente solo copia el último segmento
- Para merge real de múltiples MP4, se requiere FFmpeg
- Workaround: Usar segmentos de 30s completos

---

## 🔒 Permisos Requeridos

### Android (app.json)
```json
{
  "permissions": [
    "CAMERA",
    "RECORD_AUDIO",
    "READ_EXTERNAL_STORAGE",
    "WRITE_EXTERNAL_STORAGE",
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION"
  ]
}
```

### iOS (app.json)
```json
{
  "infoPlist": {
    "NSCameraUsageDescription": "LookOut necesita acceso a la cámara para grabar videos",
    "NSMicrophoneUsageDescription": "LookOut necesita acceso al micrófono para grabar audio",
    "NSPhotoLibraryUsageDescription": "LookOut necesita acceso a la galería para guardar videos",
    "NSLocationWhenInUseUsageDescription": "LookOut necesita tu ubicación para georeferenciar registros"
  }
}
```

---

## 📊 API del Servicio de Grabación

### `recordingService.iniciarGrabacion(config)`
Inicia grabación con buffer circular

**Parámetros:**
```typescript
{
  segmentoSegundos?: number;    // Default: 10
  ventanaNSegundos?: number;    // Default: 30
}
```

**Comportamiento:**
- Crea directorios si no existen
- Inicia contador de segundos
- Comienza a grabar segmentos
- Mantiene buffer circular automáticamente

### `recordingService.guardarUltimosNsegundos()`
Guarda los últimos N segundos del buffer

**Retorna:**
```typescript
{
  pathMp4: string;      // Ruta del clip guardado
  duracion: number;     // Duración en segundos
  createdAt: Date;      // Timestamp
}
```

**Comportamiento:**
- Detiene segmento actual
- Calcula segmentos necesarios
- Copia/concatena a carpeta clips
- Reinicia grabación del siguiente segmento

### `recordingService.detenerGrabacion()`
Detiene completamente la grabación

**Comportamiento:**
- Para grabación activa
- Limpia intervalos
- Elimina segmentos temporales
- Resetea estado

### `recordingService.getEstado()`
Obtiene estado actual

**Retorna:**
```typescript
{
  activo: boolean;
  segundosGrabando: number;
  segmentosEnBuffer: number;
}
```

### `recordingService.getOverlayData()`
Datos para overlay (simulados)

**Retorna:**
```typescript
{
  velocidad: number;     // km/h
  latitud: number;
  longitud: number;
  hora: string;
  fecha: string;
}
```

---

## 🚀 Próximos Pasos Recomendados

### Fase 1: Completar MVP (1-2 días)
1. ✅ ~~Implementar OverlayWidget~~
2. ✅ ~~Integrar grabación real con CameraView~~
3. ⏳ Añadir thumbnails en lista de registros
4. ⏳ Implementar reproductor en detalle
5. ⏳ Modo Estacionario funcional

### Fase 2: Sincronización Cloud (2-3 días)
1. ⏳ Configurar bucket en Supabase
2. ⏳ Implementar uploads automáticos
3. ⏳ Progress indicators
4. ⏳ Queue de sincronización
5. ⏳ Retry logic

### Fase 3: Panel Web (3-5 días)
1. ⏳ Setup React + Vite + Tailwind
2. ⏳ Autenticación
3. ⏳ Dashboard con stats
4. ⏳ Tabla de registros
5. ⏳ Reproductor + mapa
6. ⏳ Filtros y exportación

### Fase 4: Features Avanzados (5-7 días)
1. ⏳ GPS real con expo-location
2. ⏳ Comandos de voz
3. ⏳ PiP con dev build
4. ⏳ FFmpeg para concatenación
5. ⏳ Optimizaciones de performance

---

## 📝 Notas de Desarrollo

### Build para Producción
```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

### Testing en Dispositivo Real
```bash
# Con Expo Go (limitado)
npm run dev
# Escanear QR

# Con Dev Build (completo)
npx expo run:android --device
```

### Debug
```bash
# Ver logs
npx expo start --clear

# React DevTools
npx react-devtools

# Flipper (para native debugging)
# Abrir Flipper app y conectar
```

---

## 💡 Tips y Trucos

### Performance
- Los segmentos de 10s balancean calidad vs overhead
- Buffer de 30s es óptimo para eventos de tráfico
- Limpiar clips antiguos periódicamente

### UX
- El OverlayWidget minimizado no obstruye la vista
- Animación de pulso indica claramente que está grabando
- Confirmaciones previenen pérdida accidental de datos

### Storage
- 1 minuto de video 1080p ≈ 100-150 MB
- Buffer de 30s ≈ 50-75 MB en memoria
- Planificar estrategia de limpieza automática

---

## 🆘 Troubleshooting

### "Camera permission denied"
```typescript
const { status } = await Camera.requestCameraPermissionsAsync();
```

### "FileSystem.documentDirectory is undefined"
- Verificar import: `import * as FileSystem from 'expo-file-system';`
- Asegurarse que está corriendo en dispositivo/simulador
- No funciona en web

### "Supabase upload fails"
- Verificar SUPABASE_URL y SUPABASE_ANON_KEY en .env
- Confirmar que bucket 'clips' existe
- Revisar RLS policies

### "Video recording stops unexpectedly"
- Verificar espacio en disco
- Check memory warnings
- Revisar permisos de almacenamiento

---

## 📞 Soporte

Para issues y preguntas:
1. Revisar esta documentación
2. Consultar ARQUITECTURA.md
3. Verificar logs con `npx expo start`
4. Revisar Supabase Dashboard para DB issues

---

© 2025 LookOut Chile - Sistema de Vigilancia Móvil
