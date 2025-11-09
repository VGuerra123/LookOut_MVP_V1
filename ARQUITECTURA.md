# 🏗️ Arquitectura del Proyecto LookOut

Este documento explica en detalle la arquitectura técnica de LookOut, la organización del código y las decisiones de diseño.

---

## 📐 Arquitectura General

### Patrón de Diseño

LookOut utiliza una **arquitectura basada en componentes** con los siguientes patrones:

1. **Context API** para gestión de estado global (autenticación)
2. **File-based routing** con Expo Router
3. **Component composition** para reutilización de UI
4. **Backend as a Service** con Supabase

```
┌─────────────────────────────────────────┐
│          FRONTEND (React Native)        │
│  ┌─────────────────────────────────┐   │
│  │   Expo Router (Navegación)      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Context API (Auth)            │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Components & Screens          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                 ↕
┌─────────────────────────────────────────┐
│        BACKEND (Supabase)               │
│  ┌─────────────────────────────────┐   │
│  │   PostgreSQL Database           │   │
│  │   + Row Level Security (RLS)    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │   Supabase Auth                 │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 📂 Organización de Carpetas

### `/app` - Rutas y Pantallas

Esta carpeta contiene todas las **rutas** de la aplicación usando el sistema de **file-based routing** de Expo Router.

#### Estructura:

```
app/
├── index.tsx                 # Login inicial
├── _layout.tsx               # Layout raíz con providers
├── auth/                     # Módulo de autenticación
│   ├── password.tsx
│   ├── register-step1.tsx
│   ├── register-step2.tsx
│   └── register-step3.tsx
├── (tabs)/                   # Navegación principal
│   ├── _layout.tsx           # Config de tabs
│   ├── index.tsx             # Tab: Móvil
│   ├── estacionario.tsx      # Tab: Estacionario
│   ├── administracion.tsx    # Tab: Administración
│   └── informes.tsx          # Tab: Informes
└── registros/                # Gestión de clips
    ├── index.tsx             # Lista
    └── [id].tsx              # Detalle dinámico
```

#### Convenciones de Nomenclatura:

- `index.tsx` → Ruta raíz del directorio
- `[id].tsx` → Ruta dinámica con parámetro
- `(tabs)/` → Grupo de rutas (el paréntesis no aparece en la URL)
- `_layout.tsx` → Layout compartido para rutas hijas

---

### `/components` - Componentes Reutilizables

Actualmente vacío. En el futuro contendrá:

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── Modal.tsx
├── features/
│   ├── RegistroCard.tsx
│   ├── VideoPlayer.tsx
│   └── StatCard.tsx
└── layout/
    ├── Header.tsx
    └── SafeArea.tsx
```

**Principio**: Un componente por archivo, exportado como default.

---

### `/constants` - Configuración de Diseño

#### `theme.ts`

Define todos los **valores de diseño** en un solo lugar:

```typescript
export const Colors = {
  dark: {
    background: '#0A0A0A',
    primary: '#FF6B35',
    // ...
  }
}

export const Spacing = { xs: 4, sm: 8, md: 16, ... }
export const BorderRadius = { sm: 8, md: 12, ... }
export const Typography = { h1: {...}, body: {...}, ... }
```

**Por qué**: Centralizar los valores de diseño facilita cambios globales y mantiene consistencia visual.

---

### `/contexts` - Estado Global

#### `AuthContext.tsx`

Gestiona el estado de autenticación en toda la app:

```typescript
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email, password) => Promise<{error}>;
  signUp: (email, password, userData) => Promise<{error}>;
  signOut: () => Promise<void>;
}
```

**Responsabilidades**:
1. Mantener la sesión activa
2. Escuchar cambios de autenticación
3. Proveer métodos para login/registro/logout
4. Sincronizar con Supabase Auth

**Por qué Context API**:
- Evita prop drilling
- Acceso global sin Redux
- Integración nativa con React

---

### `/lib` - Clientes y Utilidades

#### `supabase.ts`

Cliente singleton de Supabase:

```typescript
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Importante para móvil
    },
  }
);
```

**Configuración clave**:
- `autoRefreshToken`: Refresca el token automáticamente
- `persistSession`: Mantiene la sesión en localStorage/AsyncStorage
- `detectSessionInUrl`: Deshabilitado para evitar conflictos en móvil

---

### `/types` - Definiciones TypeScript

#### `database.ts`

Define las interfaces que coinciden con las tablas de Supabase:

```typescript
export interface Registro {
  id: string;
  user_id: string;
  fecha: string;
  hora: string;
  // ...
}
```

**Por qué**: TypeScript nos da:
- Autocompletado en el IDE
- Detección de errores en tiempo de desarrollo
- Documentación implícita del schema

---

## 🔐 Sistema de Autenticación

### Flujo Completo

```
┌─────────────────┐
│  Login Screen   │
│  (index.tsx)    │
└────────┬────────┘
         │
         ├─── admin@lookout.com?
         │    ├─ SÍ → Password Screen
         │    └─ NO → Register Flow
         │
┌────────▼────────┐
│ Register Step 1 │  ← Datos básicos (RUT, nombre, patente)
└────────┬────────┘
         │
┌────────▼────────┐
│ Register Step 2 │  ← Código de 6 dígitos
└────────┬────────┘
         │
┌────────▼────────┐
│ Register Step 3 │  ← Contraseña + Términos
└────────┬────────┘
         │
┌────────▼────────┐
│   AuthContext   │  ← signUp() → Supabase
└────────┬────────┘
         │
┌────────▼────────┐
│  Insert Profile │  ← users_profile table
└────────┬────────┘
         │
┌────────▼────────┐
│   (tabs) Home   │  ← Usuario autenticado
└─────────────────┘
```

### Protección de Rutas

Actualmente no hay protección explícita. Para implementarla:

```typescript
// En _layout.tsx de (tabs)
const { user, loading } = useAuth();

if (loading) return <LoadingScreen />;
if (!user) return <Redirect href="/" />;

return <Tabs>...</Tabs>;
```

---

## 🗄️ Base de Datos

### Modelo de Datos

```
┌──────────────────┐
│   auth.users     │  (Tabla de Supabase Auth)
└────────┬─────────┘
         │ 1
         │
         │ 1:1
         │
┌────────▼─────────┐
│  users_profile   │  (Perfil extendido)
│  - rut           │
│  - nombre        │
│  - telefono      │
│  - patente       │
└──────────────────┘

┌──────────────────┐
│   auth.users     │
└────────┬─────────┘
         │ 1
         │
         │ 1:N
         │
┌────────▼─────────┐
│    registros     │  (Clips de video)
│  - fecha         │
│  - hora          │
│  - ubicación     │
│  - velocidad     │
│  - estado        │
└────────┬─────────┘
         │ 1
         │
         │ 1:N
         │
┌────────▼─────────┐
│ acciones_registro│  (Acciones sobre clips)
│  - tipo_accion   │
│  - responsable   │
│  - completada    │
└──────────────────┘
```

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS:

#### Política Ejemplo: `users_profile`

```sql
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
```

**Cómo funciona**:
1. `TO authenticated` → Solo usuarios autenticados
2. `USING (auth.uid() = id)` → El ID del usuario debe coincidir con el ID del registro

Esto garantiza que **cada usuario solo ve sus propios datos**.

---

## 🎨 Sistema de Diseño

### Metodología

LookOut usa un **sistema de diseño basado en tokens**:

```
Token → Constant → Component
```

#### Ejemplo:

```typescript
// 1. Token definido en theme.ts
Colors.dark.primary = '#FF6B35';

// 2. Usado en StyleSheet
const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.dark.primary,  // Token
  }
});

// 3. Aplicado al componente
<TouchableOpacity style={styles.button}>
```

### Convenciones de Estilo

1. **Usar `StyleSheet.create()`** siempre
   - Mejor performance
   - Validación de tipos
   - Autocompletado

2. **Un objeto de estilos por componente**
   ```typescript
   const styles = StyleSheet.create({...});
   ```

3. **Nombrar estilos semánticamente**
   ```typescript
   // ✅ Bueno
   container, header, title, button

   // ❌ Malo
   box1, text2, btnRed
   ```

---

## 🔄 Gestión de Estado

### Estrategia de Estado

```
┌─────────────────────────────────┐
│     Global State (Context)      │
│  - Auth session                 │
│  - User data                    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Local State (useState/useRef)  │
│  - Form inputs                  │
│  - UI toggles                   │
│  - Timers                       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│    Server State (Supabase)      │
│  - Registros                    │
│  - User profile                 │
│  - Acciones                     │
└─────────────────────────────────┘
```

### Cuándo Usar Cada Tipo

| Tipo de Dato | Estado Local | Context | Supabase |
|--------------|--------------|---------|----------|
| Input de formulario | ✅ | ❌ | ❌ |
| Usuario autenticado | ❌ | ✅ | ✅ |
| Lista de registros | ❌ | ❌ | ✅ |
| Modal abierto/cerrado | ✅ | ❌ | ❌ |
| Timer de grabación | ✅ | ❌ | ❌ |

---

## 🚀 Flujo de Datos

### Ejemplo: Guardar un Registro

```
┌──────────────┐
│   Usuario    │
│ Presiona     │
│ "CAPTURAR"   │
└──────┬───────┘
       │
┌──────▼───────┐
│ handleCapture│  ← Función en index.tsx (Tab Móvil)
│   async ()   │
└──────┬───────┘
       │
┌──────▼───────┐
│ supabase     │  ← Cliente de Supabase
│ .from()      │
│ .insert()    │
└──────┬───────┘
       │
┌──────▼───────┐
│  PostgreSQL  │  ← Base de datos
│  + RLS check │
└──────┬───────┘
       │
┌──────▼───────┐
│  Response    │  ← {data, error}
└──────┬───────┘
       │
┌──────▼───────┐
│   Alert      │  ← Feedback al usuario
│  "Guardado"  │
└──────────────┘
```

### Código Simplificado:

```typescript
const handleCapture = async () => {
  // 1. Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Insertar registro
  const { error } = await supabase.from('registros').insert({
    user_id: user.id,
    duracion_segundos: 30,
    geo_loc_comuna: 'Santiago Centro',
    velocidad_kmh: 45,
    tipo_modo: 'movil',
    estado: 'pendiente',
  });

  // 3. Feedback
  if (error) {
    Alert.alert('Error', 'No se pudo guardar');
  } else {
    Alert.alert('Éxito', 'Clip guardado');
  }
};
```

---

## 🧩 Componentes Clave

### 1. Pantalla de Login (index.tsx)

**Responsabilidad**: Punto de entrada, detecta si es usuario nuevo o existente.

**Lógica principal**:
```typescript
if (email === 'admin@lookout.com') {
  router.push('/auth/password');
} else {
  router.push('/auth/register-step1');
}
```

---

### 2. Registro Paso 2 (register-step2.tsx)

**Responsabilidad**: Código de verificación de 6 dígitos con navegación inteligente.

**Lógica de navegación de cursor**:
```typescript
// Avanzar al siguiente campo
if (text && index < 5) {
  inputRefs.current[index + 1]?.focus();
}

// Retroceder con Backspace
if (key === 'Backspace' && !code[index] && index > 0) {
  inputRefs.current[index - 1]?.focus();
}
```

---

### 3. Modo Dash-Cam ((tabs)/index.tsx)

**Responsabilidad**: Simulación de grabación en bucle con timer y overlay.

**Timer en bucle**:
```typescript
useEffect(() => {
  let interval;
  if (isRecording) {
    interval = setInterval(() => {
      setTimer((prev) => {
        if (prev >= 30) return 0;  // ← Reinicia el bucle
        return prev + 1;
      });
    }, 1000);
  }
  return () => clearInterval(interval);
}, [isRecording]);
```

---

### 4. Lista de Registros (registros/index.tsx)

**Responsabilidad**: Mostrar clips guardados con selección múltiple.

**Long-press para selección**:
```typescript
<TouchableOpacity
  onPress={() => handleCardPress(registro)}
  onLongPress={handleLongPress}
  delayLongPress={500}  // ← 500ms para activar
>
```

---

## 🔧 Utilidades y Helpers

### Formateo de Datos

```typescript
// Fecha chilena
new Date(registro.fecha).toLocaleDateString('es-CL')
// → "09/01/2025"

// Hora 24h
new Date().toLocaleTimeString('es-CL', {
  hour: '2-digit',
  minute: '2-digit'
})
// → "14:30"
```

### Navegación entre Pantallas

```typescript
// Navegación simple
router.push('/registros');

// Navegación con parámetros
router.push({
  pathname: '/registros/[id]',
  params: { id: registro.id }
});

// Reemplazar (sin volver atrás)
router.replace('/(tabs)');
```

---

## 📱 Navegación por Tabs

### Configuración ((tabs)/_layout.tsx)

```typescript
<Tabs
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: Colors.dark.primary,
    tabBarStyle: { backgroundColor: Colors.dark.surface }
  }}
>
  <Tabs.Screen name="index" options={{ title: 'Móvil' }} />
  <Tabs.Screen name="estacionario" options={{ title: 'Estacionario' }} />
  <Tabs.Screen name="administracion" options={{ title: 'Administración' }} />
  <Tabs.Screen name="informes" options={{ title: 'Informes' }} />
</Tabs>
```

**Iconos**: Se usan componentes de `lucide-react-native`.

---

## ⚡ Optimizaciones

### Performance

1. **useCallback para funciones**
   ```typescript
   const handlePress = useCallback(() => {
     // ...
   }, [dependencies]);
   ```

2. **useMemo para cálculos costosos**
   ```typescript
   const filteredData = useMemo(() => {
     return registros.filter(r => r.estado === 'pendiente');
   }, [registros]);
   ```

3. **FlatList para listas largas**
   ```typescript
   <FlatList
     data={registros}
     renderItem={({ item }) => <RegistroCard registro={item} />}
     keyExtractor={(item) => item.id}
   />
   ```

### Seguridad

1. **RLS en todas las tablas**: Protección a nivel de base de datos
2. **Validación de entrada**: Campos requeridos antes de enviar
3. **HTTPS**: Todas las conexiones a Supabase son seguras
4. **Tokens refrescados**: `autoRefreshToken: true`

---

## 🧪 Testing (Futuro)

### Estructura Sugerida

```
__tests__/
├── unit/
│   ├── utils.test.ts
│   └── formatters.test.ts
├── integration/
│   ├── auth.test.ts
│   └── registros.test.ts
└── e2e/
    ├── login-flow.test.ts
    └── recording-flow.test.ts
```

### Herramientas Recomendadas

- **Jest**: Testing unitario
- **React Native Testing Library**: Testing de componentes
- **Detox**: Testing E2E

---

## 📊 Métricas y Monitoreo (Futuro)

### Analytics Sugeridos

```typescript
// Eventos a trackear
analytics.track('video_captured', {
  duration: 30,
  location: 'Santiago Centro',
  mode: 'movil'
});

analytics.track('registro_published', {
  count: selectedIds.size
});
```

### Herramientas

- **Sentry**: Tracking de errores
- **Amplitude / Mixpanel**: Analytics de usuario
- **Firebase Analytics**: Eventos custom

---

## 🔄 CI/CD (Futuro)

### Pipeline Sugerido

```yaml
# .github/workflows/main.yml
build:
  - npm install
  - npm run typecheck
  - npm run lint
  - npm test
  - eas build --platform android
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [React Native](https://reactnative.dev/docs/getting-started)

### Tutoriales Recomendados

- [Supabase Auth + React Native](https://supabase.com/docs/guides/auth/auth-helpers/react-native)
- [Expo Camera](https://docs.expo.dev/versions/latest/sdk/camera/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

---

Este documento debe actualizarse conforme el proyecto evoluciona. Cada nueva feature o cambio arquitectónico debe reflejarse aquí.
