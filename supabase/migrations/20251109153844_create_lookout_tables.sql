/*
  # Creación de Base de Datos LookOut MVP
  
  ## 1. Nuevas Tablas
  
  ### `users_profile`
  Perfil extendido de usuarios con datos chilenos
  - `id` (uuid, PK, referencia a auth.users)
  - `email` (text)
  - `rut` (text) - Formato chileno: 11.111.111-1
  - `nombre_completo` (text)
  - `telefono` (text)
  - `patente_vehiculo` (text) - Formato chileno: AAAA-11 o AA-BB-11
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `registros`
  Tabla principal de clips de video/grabaciones
  - `id` (uuid, PK)
  - `user_id` (uuid, FK a auth.users)
  - `fecha` (date) - Fecha del registro
  - `hora` (time) - Hora exacta del registro
  - `duracion_segundos` (int) - Duración del clip (default 30s para dash-cam)
  - `geo_loc_comuna` (text) - Comuna chilena
  - `geo_loc_region` (text) - Región de Chile
  - `latitud` (numeric)
  - `longitud` (numeric)
  - `velocidad_kmh` (int) - Velocidad al momento del registro
  - `tipo_modo` (text) - 'movil' o 'estacionario'
  - `estado` (text) - 'pendiente' o 'publicado'
  - `calificacion` (int) - 1-5 estrellas
  - `nota_tag` (text) - Etiqueta o nota del usuario
  - `tipo_evento` (text) - Clasificación del evento
  - `gravedad` (text) - Nivel de seriedad
  - `prioridad` (text) - Nivel de prioridad de atención
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `acciones_registro`
  Acciones asociadas a cada registro (comunicar, compartir, agendar, etc.)
  - `id` (uuid, PK)
  - `registro_id` (uuid, FK a registros)
  - `tipo_accion` (text) - 'comunicar', 'compartir', 'agendar', 'designar', 'comprometer'
  - `descripcion` (text)
  - `responsable` (text)
  - `fecha_compromiso` (date)
  - `completada` (boolean)
  - `created_at` (timestamptz)
  
  ## 2. Seguridad
  
  - RLS habilitado en todas las tablas
  - Políticas restrictivas: usuarios solo acceden a sus propios datos
  - Políticas separadas para SELECT, INSERT, UPDATE, DELETE
  
  ## 3. Índices
  
  - Índice en user_id para búsquedas rápidas
  - Índice en fecha y estado para filtros comunes
  - Índice en tipo_modo para separación de vistas
*/

-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  rut text,
  nombre_completo text,
  telefono text,
  patente_vehiculo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla principal de registros
CREATE TABLE IF NOT EXISTS registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  hora time NOT NULL DEFAULT CURRENT_TIME,
  duracion_segundos int DEFAULT 30,
  geo_loc_comuna text,
  geo_loc_region text,
  latitud numeric,
  longitud numeric,
  velocidad_kmh int DEFAULT 0,
  tipo_modo text DEFAULT 'movil' CHECK (tipo_modo IN ('movil', 'estacionario')),
  estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'publicado')),
  calificacion int CHECK (calificacion >= 1 AND calificacion <= 5),
  nota_tag text,
  tipo_evento text,
  gravedad text,
  prioridad text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de acciones sobre registros
CREATE TABLE IF NOT EXISTS acciones_registro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid NOT NULL REFERENCES registros(id) ON DELETE CASCADE,
  tipo_accion text NOT NULL CHECK (tipo_accion IN ('comunicar', 'compartir', 'agendar', 'designar', 'comprometer')),
  descripcion text,
  responsable text,
  fecha_compromiso date,
  completada boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones_registro ENABLE ROW LEVEL SECURITY;

-- Políticas para users_profile
CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para registros
CREATE POLICY "Users can view own registros"
  ON registros FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own registros"
  ON registros FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own registros"
  ON registros FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own registros"
  ON registros FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para acciones_registro
CREATE POLICY "Users can view own acciones"
  ON acciones_registro FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registros
      WHERE registros.id = acciones_registro.registro_id
      AND registros.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own acciones"
  ON acciones_registro FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registros
      WHERE registros.id = acciones_registro.registro_id
      AND registros.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own acciones"
  ON acciones_registro FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registros
      WHERE registros.id = acciones_registro.registro_id
      AND registros.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM registros
      WHERE registros.id = acciones_registro.registro_id
      AND registros.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own acciones"
  ON acciones_registro FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM registros
      WHERE registros.id = acciones_registro.registro_id
      AND registros.user_id = auth.uid()
    )
  );

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_registros_user_id ON registros(user_id);
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros(estado);
CREATE INDEX IF NOT EXISTS idx_registros_tipo_modo ON registros(tipo_modo);
CREATE INDEX IF NOT EXISTS idx_acciones_registro_id ON acciones_registro(registro_id);