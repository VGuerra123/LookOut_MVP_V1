import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export interface ThumbnailResult {
  pathPng: string;
  width: number;
  height: number;
}

class MediaService {
  /**
   * Genera una miniatura (thumbnail) de un video
   */
  async generarThumbnail(pathMp4: string): Promise<string> {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(pathMp4, {
        time: 1000, // 1 segundo
        quality: 0.7,
      });

      return uri;
    } catch (error) {
      console.error('Error generando thumbnail:', error);
      throw new Error('No se pudo generar la miniatura del video');
    }
  }

  /**
   * Sube un clip de video a Supabase Storage
   */
  async subirClipASupabase(pathMp4: string): Promise<string> {
    try {
      // Leer el archivo como base64
      const fileContent = await FileSystem.readAsStringAsync(pathMp4, {
        encoding: 'base64',
      });

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileName = `clip_${timestamp}.mp4`;
      const filePath = `clips/${fileName}`;

      // Convertir base64 a ArrayBuffer
      const arrayBuffer = decode(fileContent);

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from('clips')
        .upload(filePath, arrayBuffer, {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (error) {
        console.error('Error subiendo a Supabase:', error);
        throw error;
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('clips')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error en subirClipASupabase:', error);
      throw new Error('No se pudo subir el video a Supabase');
    }
  }

  /**
   * Sube un thumbnail a Supabase Storage
   */
  async subirThumbnailASupabase(pathPng: string): Promise<string> {
    try {
      const fileContent = await FileSystem.readAsStringAsync(pathPng, {
        encoding: 'base64',
      });

      const timestamp = Date.now();
      const fileName = `thumb_${timestamp}.png`;
      const filePath = `thumbnails/${fileName}`;

      const arrayBuffer = decode(fileContent);

      const { data, error } = await supabase.storage
        .from('clips')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/png',
          upsert: false,
        });

      if (error) {
        console.error('Error subiendo thumbnail:', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('clips')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error en subirThumbnailASupabase:', error);
      throw new Error('No se pudo subir el thumbnail');
    }
  }

  /**
   * Obtiene todos los clips locales
   */
  async obtenerClipsLocales(): Promise<string[]> {
    try {
      const clipsDir = `${FileSystem.documentDirectory!}lookout/clips/`;
      const dirInfo = await FileSystem.getInfoAsync(clipsDir);

      if (!dirInfo.exists) {
        return [];
      }

      const files = await FileSystem.readDirectoryAsync(clipsDir);
      return files
        .filter((file) => file.endsWith('.mp4'))
        .map((file) => `${clipsDir}${file}`);
    } catch (error) {
      console.error('Error obteniendo clips locales:', error);
      return [];
    }
  }

  /**
   * Elimina un clip local
   */
  async eliminarClipLocal(path: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
    } catch (error) {
      console.error('Error eliminando clip local:', error);
      throw new Error('No se pudo eliminar el clip local');
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async obtenerInfoArchivo(path: string): Promise<FileSystem.FileInfo | null> {
    try {
      const info = await FileSystem.getInfoAsync(path);
      return info;
    } catch (error) {
      console.error('Error obteniendo info del archivo:', error);
      return null;
    }
  }

  /**
   * Calcula el tamaño de un archivo en MB
   */
  async obtenerTamanoMB(path: string): Promise<number> {
    const info = await this.obtenerInfoArchivo(path);
    if (info && info.exists && info.size) {
      return info.size / (1024 * 1024); // Convertir a MB
    }
    return 0;
  }
}

export const mediaService = new MediaService();
export default mediaService;
