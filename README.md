# 🚗 LookOut - Sistema de Grabación y Vigilancia Móvil

**LookOut** es una aplicación móvil tipo Dash-Cam desarrollada con **Expo/React Native** que permite grabar, gestionar y clasificar eventos durante la conducción en Chile.

---

## 📋 Índice

1. [Características Principales](#características-principales)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración Inicial](#configuración-inicial)
5. [Guía de Uso](#guía-de-uso)
6. [Base de Datos](#base-de-datos)
7. [Diseño y Tema](#diseño-y-tema)
8. [Flujos de Usuario](#flujos-de-usuario)
9. [Limitaciones Técnicas](#limitaciones-técnicas)
10. [Próximos Pasos](#próximos-pasos)

---

## ✨ Características Principales

### 🎥 Modo Dash-Cam (Móvil)
- **Grabación en bucle de 30 segundos**: Simulación de grabación continua que se reinicia automáticamente
- **Captura de clips**: Botón "CAPTURAR" guarda el último búfer de 30 segundos
- **Modo pantalla bloqueada**: Permite bloquear la pantalla mientras continúa la grabación
- **Overlay de datos GPS**: Muestra ubicación, velocidad y hora en tiempo real (simulado)
- **Comandos de voz** (conceptual): "LookOut" para iniciar, "Capturar" para guardar

### 📊 Gestión de Registros
- **Vista de lista completa**: Todos los clips guardados con datos esenciales
- **Selección múltiple**: Long-press para activar modo de selección
- **Publicación por lote**: Cambia el estado de múltiples registros a "Publicado"
- **Edición y etiquetado**: Añade notas/tags a cada registro
- **Eliminación con confirmación**: Protección contra borrado accidental
- **Vista de detalle**: Información completa del registro con clasificación y acciones

### 🔐 Autenticación Completa
- **Login por email**: Detecta si es usuario nuevo o existente
- **Registro de 3 pasos**:
  1. **Datos básicos**: RUT, nombre, teléfono, patente (formato chileno)
  2. **Verificación**: Código de 6 dígitos con navegación automática de cursor
  3. **Contraseña y licencia**: Validación de coincidencia y checkboxes obligatorios
- **Integración con Supabase Auth**: Sistema de autenticación robusto

### 📱 Navegación por Tabs
1. **Móvil**: Modo Dash-Cam activo
2. **Estacionario**: Vista de registros sin límite de duración
3. **Administración**: Configuración de cuenta y perfil
4. **Informes**: Dashboard con estadísticas, tareas y gráficos

---

## 🛠 Tecnologías Utilizadas

### Frontend
- **Expo SDK 54**: Framework de React Native
- **Expo Router**: Navegación basada en archivos
- **TypeScript**: Tipado estático para mayor seguridad
- **React Native**: Framework multiplataforma

### Backend
- **Supabase**: Base de datos PostgreSQL con Row Level Security (RLS)
- **Supabase Auth**: Sistema de autenticación integrado

### Diseño
- **Material Design 3.0** (Dark Mode)
- **Lucide React Native**: Iconos vectoriales
- **Paleta personalizada**: Naranja (#FF6B35) y Verde (#4CAF50)

---

## 📁 Estructura del Proyecto

```
project/
├── app/                          # Rutas de la aplicación (Expo Router)
│   ├── index.tsx                 # Pantalla de login inicial
│   ├── _layout.tsx               # Layout raíz con AuthProvider
│   ├── auth/                     # Flujo de autenticación
│   │   ├── password.tsx          # Login con contraseña
│   │   ├── register-step1.tsx    # Registro: Datos básicos
│   │   ├── register-step2.tsx    # Registro: Verificación código
│   │   └── register-step3.tsx    # Registro: Contraseña y licencia
│   ├── (tabs)/                   # Navegación por tabs
│   │   ├── _layout.tsx           # Configuración de tabs
│   │   ├── index.tsx             # Móvil (Dash-Cam)
│   │   ├── estacionario.tsx      # Modo estacionario
│   │   ├── administracion.tsx    # Configuración
│   │   └── informes.tsx          # Dashboard e informes
│   └── registros/                # Gestión de clips guardados
│       ├── index.tsx             # Lista de registros
│       └── [id].tsx              # Detalle del registro
│
├── components/                   # Componentes reutilizables (vacío por ahora)
│
├── constants/
│   └── theme.ts                  # Colores, tipografía, espaciado
│
├── contexts/
│   └── AuthContext.tsx           # Context de autenticación
│
├── lib/
│   └── supabase.ts               # Cliente de Supabase
│
├── types/
│   └── database.ts               # Tipos TypeScript para la BD
│
├── .env                          # Variables de entorno
└── package.json                  # Dependencias del proyecto
```

---

## ⚙️ Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Variables de Entorno

El archivo `.env` ya está configurado con las credenciales de Supabase:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Base de Datos

La base de datos ya está configurada con las siguientes tablas:
- `users_profile`: Perfiles de usuario extendidos
- `registros`: Clips de video/grabaciones
- `acciones_registro`: Acciones sobre los registros

**RLS (Row Level Security)** está habilitado en todas las tablas para proteger los datos de cada usuario.

### 4. Ejecutar la Aplicación

```bash
npm run dev
```

Escanea el código QR con **Expo Go** en tu dispositivo móvil.

---

## 📖 Guía de Uso

### Login y Registro

1. **Pantalla de Login**
   - Ingresa tu correo electrónico
   - Si es `admin@lookout.com` → ir a pantalla de contraseña
   - Cualquier otro email → flujo de registro de 3 pasos

2. **Registro Paso 1**
   - Completa: Nombre, RUT (formato chileno), Teléfono, Patente
   - Ejemplo RUT: `12.345.678-9`
   - Ejemplo Patente: `BBBB-12` o `BB-CC-12`

3. **Registro Paso 2**
   - Ingresa código de 6 dígitos (simulado)
   - El cursor avanza automáticamente
   - Backspace navega al campo anterior

4. **Registro Paso 3**
   - Ingresa y confirma tu contraseña
   - Acepta ambos checkboxes (Términos y Licencia)
   - El botón se activa solo cuando todo es válido

### Modo Dash-Cam

1. **Iniciar Grabación**
   - Presiona "INICIAR MODO MÓVIL"
   - El timer cuenta de 0 a 30 segundos en bucle

2. **Durante la Grabación**
   - **Capturar**: Guarda el último búfer de 30s
   - **Bloquear Pantalla**: Simula modo bloqueado
   - **Detener**: Finaliza la grabación

3. **Overlay de Datos**
   - 🌍 Ubicación: Comuna y Región
   - ⏱ Velocidad en km/h
   - 🕐 Hora actual

### Gestión de Registros

1. **Ver Registros**
   - Desde la pantalla Móvil: "Ver Registros Guardados"
   - Cada tarjeta muestra: Fecha, hora, ubicación, estado

2. **Selección Múltiple**
   - **Long-press** sobre una tarjeta para activar modo selección
   - Marca varios registros
   - Presiona "Publicar" para cambiar su estado

3. **Acciones Individuales**
   - ▶️ **Play**: Ver detalle del registro
   - ✏️ **Edit**: Editar nota/tag
   - 🗑️ **Delete**: Eliminar con confirmación

4. **Vista de Detalle**
   - Reproducción simulada del video
   - Información general (fecha, hora, ubicación, velocidad)
   - Clasificación (tipo de evento, gravedad, prioridad)
   - Acciones: Comunicar, Compartir, Agendar, Designar, Comprometer

---

## 🗄️ Base de Datos

### Tabla: `users_profile`

Perfil extendido de cada usuario autenticado.

| Campo              | Tipo   | Descripción                        |
|--------------------|--------|------------------------------------|
| `id`               | uuid   | FK a `auth.users(id)`              |
| `email`            | text   | Correo electrónico                 |
| `rut`              | text   | RUT chileno (formato: 11.111.111-1)|
| `nombre_completo`  | text   | Nombre completo del usuario        |
| `telefono`         | text   | Número de teléfono                 |
| `patente_vehiculo` | text   | Patente del vehículo (AAAA-11)     |

### Tabla: `registros`

Almacena todos los clips de video guardados.

| Campo              | Tipo        | Descripción                              |
|--------------------|-------------|------------------------------------------|
| `id`               | uuid        | Primary Key                              |
| `user_id`          | uuid        | FK a `auth.users(id)`                    |
| `fecha`            | date        | Fecha del registro                       |
| `hora`             | time        | Hora exacta                              |
| `duracion_segundos`| int         | Duración (default: 30s)                  |
| `geo_loc_comuna`   | text        | Comuna chilena                           |
| `geo_loc_region`   | text        | Región de Chile                          |
| `latitud`          | numeric     | Coordenada GPS                           |
| `longitud`         | numeric     | Coordenada GPS                           |
| `velocidad_kmh`    | int         | Velocidad al momento del registro        |
| `tipo_modo`        | text        | 'movil' o 'estacionario'                 |
| `estado`           | text        | 'pendiente' o 'publicado'                |
| `calificacion`     | int         | 1-5 estrellas                            |
| `nota_tag`         | text        | Etiqueta del usuario                     |
| `tipo_evento`      | text        | Clasificación del evento                 |
| `gravedad`         | text        | Nivel de seriedad                        |
| `prioridad`        | text        | Nivel de prioridad                       |

### Tabla: `acciones_registro`

Acciones realizadas sobre cada registro.

| Campo             | Tipo | Descripción                                      |
|-------------------|------|--------------------------------------------------|
| `id`              | uuid | Primary Key                                      |
| `registro_id`     | uuid | FK a `registros(id)`                             |
| `tipo_accion`     | text | 'comunicar', 'compartir', 'agendar', 'designar' |
| `descripcion`     | text | Descripción de la acción                         |
| `responsable`     | text | Persona responsable                              |
| `fecha_compromiso`| date | Fecha comprometida                               |
| `completada`      | bool | Estado de la acción                              |

### Seguridad (RLS)

Todas las tablas tienen **Row Level Security** habilitado:
- Los usuarios solo pueden ver/editar/eliminar **sus propios datos**
- Las políticas están separadas por operación (SELECT, INSERT, UPDATE, DELETE)
- La autenticación es requerida para todas las operaciones

---

## 🎨 Diseño y Tema

### Paleta de Colores

```typescript
Colors.dark = {
  background: '#0A0A0A',        // Negro profundo
  surface: '#1C1C1E',           // Gris antracita
  surfaceVariant: '#2C2C2E',    // Gris medio
  primary: '#FF6B35',           // Naranja vibrante (acciones)
  secondary: '#4CAF50',         // Verde (activo/publicado)
  error: '#FF3B30',             // Rojo (errores/eliminación)
  text: '#FFFFFF',              // Blanco
  textSecondary: '#8E8E93',     // Gris claro
  border: '#38383A',            // Bordes sutiles
}
```

### Tipografía

Basada en **Material Design**:
- **H1**: 32px, Bold
- **H2**: 24px, SemiBold
- **H3**: 20px, SemiBold
- **Body**: 16px, Regular
- **Body Small**: 14px, Regular
- **Caption**: 12px, Regular

### Espaciado

Sistema de 8px:
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

---

## 🔄 Flujos de Usuario

### Flujo de Autenticación

```
[Login Screen]
    ↓
¿Email = admin@lookout.com?
    ├── SÍ → [Password Screen] → [Tabs]
    └── NO → [Register Step 1]
                ↓
            [Register Step 2]
                ↓
            [Register Step 3]
                ↓
              [Tabs]
```

### Flujo de Grabación

```
[Tab: Móvil]
    ↓
[INICIAR MODO MÓVIL]
    ↓
[Grabación Activa]
    ├── Timer: 0→30s (bucle)
    ├── Overlay GPS
    └── Botones:
        ├── CAPTURAR → Guarda clip en DB
        ├── Bloquear Pantalla → Modo bloqueado
        └── Detener → Vuelve a inicio
```

### Flujo de Gestión de Registros

```
[Ver Registros Guardados]
    ↓
[Lista de Registros]
    ├── Tap simple → [Vista Detalle]
    ├── Long-press → [Modo Selección]
    │       ↓
    │   [Publicar seleccionados]
    └── Swipe/Icono → [Eliminar con confirmación]
```

---

## ⚠️ Limitaciones Técnicas

### Funcionalidades Simuladas

Este es un **prototipo MVP**, por lo tanto algunas funcionalidades son simulaciones:

1. **Cámara Real**
   - La vista de cámara es un placeholder
   - No se graban videos reales
   - Para implementar cámara real, necesitas:
     - Build nativo (no funciona en web preview)
     - Permisos de cámara
     - Librería: `expo-camera`

2. **Comandos de Voz**
   - No están implementados
   - Concepto: Usar `expo-speech` o `react-native-voice`

3. **GPS Real**
   - Ubicación y velocidad son datos placeholder
   - Para GPS real: `expo-location`

4. **Grabación de Video**
   - No se almacenan archivos de video
   - Solo se guardan metadatos en la BD

### Compatibilidad

- **Web Preview**: ✅ Funciona (sin cámara)
- **Expo Go**: ✅ Funciona (sin cámara)
- **Development Build**: ⚠️ Necesario para cámara real
- **Production Build**: ⚠️ Necesario para publicación

---

## 🚀 Próximos Pasos

### Fase 2: Funcionalidades Reales

1. **Implementar Cámara Real**
   ```bash
   # Crear development build
   npx expo prebuild
   npx expo run:android  # o run:ios
   ```

2. **Grabación de Video Real**
   - Usar `expo-camera` con modo de grabación
   - Almacenar videos en dispositivo o Supabase Storage
   - Implementar bucle de 30s real con FFmpeg

3. **Comandos de Voz**
   - Integrar `@react-native-voice/voice`
   - Configurar palabras clave: "LookOut", "Capturar"

4. **GPS y Sensores**
   - `expo-location` para GPS real
   - `expo-sensors` para acelerómetro/giroscopio

### Fase 3: Funcionalidades Avanzadas

- 🔔 Notificaciones push
- 🌐 Compartir videos por redes sociales
- 📊 Gráficos avanzados en Dashboard
- 🗺️ Mapa de registros con heatmap
- ☁️ Backup automático en la nube
- 🎥 Reproducción de videos en la app

### Fase 4: Producción

- 🔒 Configuración SSL/TLS
- 📱 Publicación en App Store / Google Play
- 🧪 Testing automatizado
- 📈 Analytics y monitoreo
- 💳 Sistema de suscripciones (RevenueCat)

---

## 📄 Licencia

Este proyecto es un prototipo MVP desarrollado para demostración y uso interno.

© 2025 LookOut Chile

---

## 🆘 Soporte

Para cualquier duda o problema:
1. Revisa esta documentación completa
2. Verifica la consola de errores en Expo
3. Consulta la documentación oficial:
   - [Expo Docs](https://docs.expo.dev)
   - [Supabase Docs](https://supabase.com/docs)
   - [React Native Docs](https://reactnative.dev)

---

## 🎉 ¡Listo para Usar!

Tu aplicación **LookOut** está completamente configurada y lista para ejecutarse.

```bash
npm run dev
```

Escanea el QR con **Expo Go** y comienza a explorar todas las funcionalidades del prototipo MVP.
