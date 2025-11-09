export interface UserProfile {
  id: string;
  email: string;
  rut: string | null;
  nombre_completo: string | null;
  telefono: string | null;
  patente_vehiculo: string | null;
  created_at: string;
  updated_at: string;
}

export interface Registro {
  id: string;
  user_id: string;
  fecha: string;
  hora: string;
  duracion_segundos: number;
  geo_loc_comuna: string | null;
  geo_loc_region: string | null;
  latitud: number | null;
  longitud: number | null;
  velocidad_kmh: number;
  tipo_modo: 'movil' | 'estacionario';
  estado: 'pendiente' | 'publicado';
  calificacion: number | null;
  nota_tag: string | null;
  tipo_evento: string | null;
  gravedad: string | null;
  prioridad: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccionRegistro {
  id: string;
  registro_id: string;
  tipo_accion: 'comunicar' | 'compartir' | 'agendar' | 'designar' | 'comprometer';
  descripcion: string | null;
  responsable: string | null;
  fecha_compromiso: string | null;
  completada: boolean;
  created_at: string;
}

export interface RegistroFormData {
  geo_loc_comuna: string;
  geo_loc_region: string;
  velocidad_kmh: number;
  tipo_modo: 'movil' | 'estacionario';
}
