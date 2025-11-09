// services/recording.ts
import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';
import { FFmpegKit } from 'ffmpeg-kit-react-native';

interface RecordingConfig {
  segmentoSegundos?: number;   // 10s por defecto
  ventanaNSegundos?: number;   // 30s por defecto
  mute?: boolean;              // grabar sin audio si mic no concedido
}
interface RecordingState {
  activo: boolean;
  segundosGrabando: number;
  segmentosEnBuffer: number;
}
interface ClipGuardado {
  pathMp4: string;
  duracion: number; // estimada por suma de segmentos (FFmpeg luego recorta a exacto)
  createdAt: Date;
}
interface Segmento {
  path: string;
  duracion: number;   // seg
  timestamp: number;  // ms (inicio estimado)
}

class RecordingService {
  private activo = false;
  private segundosGrabando = 0;
  private segmentoSegundos = 10;
  private ventanaNSegundos = 30;
  private mute = false;

  private segmentos: Segmento[] = [];
  private intervalo: ReturnType<typeof setInterval> | null = null;

  // CameraView ref (usamos any para evitar choques de tipos entre SDKs)
  private cameraRef: any = null;
  private iniciando = false;

  async iniciarGrabacion(config: RecordingConfig = {}) {
    if (this.activo) return;

    this.segmentoSegundos = config.segmentoSegundos ?? 10;
    this.ventanaNSegundos = config.ventanaNSegundos ?? 30;
    this.mute = !!config.mute;

    await this.ensureDir(`${FileSystem.documentDirectory!}lookout/segments/`);
    await this.ensureDir(`${FileSystem.documentDirectory!}lookout/clips/`);
    await this.ensureDir(`${FileSystem.documentDirectory!}lookout/tmp/`);

    // Audio (no falla si Expo Go)
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    }).catch(() => {});

    this.activo = true;
    this.segundosGrabando = 0;
    this.segmentos = [];

    this.intervalo = setInterval(() => (this.segundosGrabando += 1), 1000);

    await this.iniciarNuevoSegmento();
    console.log('Grabación permanente iniciada');
  }

  async detenerGrabacion() {
    if (!this.activo) return;
    this.activo = false;

    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }

    try {
      this.cameraRef?.stopRecording?.();
    } catch {}

    await this.limpiarSegmentos();
    this.segundosGrabando = 0;
    this.segmentos = [];
    console.log('Grabación detenida');
  }

  /**
   * Guarda los últimos N segundos EXACTOS (30s por defecto) desde el momento de captura.
   * - Dev Client: concatena y recorta con FFmpeg → clip único ~30s.
   * - Expo Go: fallback → copia el último segmento (no concatena).
   */
  async guardarUltimosNsegundos(): Promise<ClipGuardado> {
    if (!this.activo) throw new Error('No hay grabación activa');

    // Cierra el segmento actual para incluirlo hasta "ahora"
    try { this.cameraRef?.stopRecording?.(); } catch {}
    await this.delay(250); // espera a que se escriba

    const ventana = this.ventanaNSegundos;
    const segsNecesarios = Math.ceil(ventana / this.segmentoSegundos);
    const lista = this.segmentos.slice(-segsNecesarios);
    if (!lista.length) {
      await this.iniciarNuevoSegmento();
      throw new Error('No hay segmentos disponibles para guardar');
    }

    const ts = Date.now();
    const outDir = `${FileSystem.documentDirectory!}lookout/clips/`;
    const tmpDir = `${FileSystem.documentDirectory!}lookout/tmp/`;
    const outFinal = `${outDir}clip_${ts}.mp4`;

    // Suma de duración aprox (para saber si debemos recortar)
    const totalDur = lista.reduce((acc, s) => acc + s.duracion, 0);

    // Si FFmpeg está disponible (Dev Client), concatenamos + recortamos a EXACTOS 30s.
    const puedeFFmpeg = await this.ffmpegDisponible();

    if (puedeFFmpeg && lista.length > 1) {
      // 1) Playlist para concat demuxer
      const concatTxt = `${tmpDir}concat_${ts}.txt`;
      const content = lista.map(s => `file '${s.path.replace(/'/g, "'\\''")}'`).join('\n');
      await FileSystem.writeAsStringAsync(concatTxt, content);

      // 2) Concat sin re-encode
      const tempConcat = `${tmpDir}concat_${ts}.mp4`;
      await this.runFFmpeg(`-f concat -safe 0 -i "${concatTxt}" -c copy "${tempConcat}"`);

      // 3) Recortar manteniendo los ÚLTIMOS N s (si sobra)
      const exceso = Math.max(0, totalDur - ventana);
      if (exceso > 0) {
        await this.runFFmpeg(
          `-ss ${exceso.toFixed(2)} -i "${tempConcat}" -t ${ventana} -c copy "${outFinal}"`
        );
      } else {
        await FileSystem.copyAsync({ from: tempConcat, to: outFinal });
      }

      // Limpieza temporal
      await this.silentDelete(concatTxt);
      await this.silentDelete(tempConcat);
    } else {
      // Fallback (Expo Go o un solo segmento): copia el último segmento
      const ultimo = lista[lista.length - 1];
      await FileSystem.copyAsync({ from: ultimo.path, to: outFinal });
    }

    // Relanza la cadena de segmentos (grabación permanente)
    if (this.activo) await this.iniciarNuevoSegmento();

    return {
      pathMp4: outFinal,
      duracion: Math.min(totalDur, ventana),
      createdAt: new Date(),
    };
  }

  getEstado(): RecordingState {
    return {
      activo: this.activo,
      segundosGrabando: this.segundosGrabando,
      segmentosEnBuffer: this.segmentos.length,
    };
  }

  setCameraRef(ref: any) {
    this.cameraRef = ref;
  }

  // ===== Cadena de segmentos (grabación permanente) =====
  private async iniciarNuevoSegmento() {
    if (!this.activo || this.iniciando) return;

    const canRecord =
      this.cameraRef &&
      (typeof this.cameraRef.recordAsync === 'function' ||
        typeof this.cameraRef?.current?.recordAsync === 'function');
    if (!canRecord) {
      console.warn('Camera ref inválido para recordAsync');
      return;
    }

    const rec = this.cameraRef?.recordAsync ?? this.cameraRef?.current?.recordAsync;

    this.iniciando = true;
    try {
      const startedAt = Date.now();

      const result = await rec.call(this.cameraRef, {
        maxDuration: this.segmentoSegundos,
        mute: this.mute, // evita error RECORD_AUDIO en Expo Go si mic no concedido
      });

      const uri = result?.uri;
      if (uri) {
        const segmento: Segmento = {
          path: uri,
          duracion: Math.min(
            this.segmentoSegundos,
            Math.max(1, Math.round((Date.now() - startedAt) / 1000))
          ),
          timestamp: startedAt,
        };
        this.segmentos.push(segmento);

        // Mantener buffer ≈ ventana N (con 1 de margen)
        const maxSegs = Math.ceil(this.ventanaNSegundos / this.segmentoSegundos) + 1;
        while (this.segmentos.length > maxSegs) {
          const viejo = this.segmentos.shift();
          if (viejo) await this.eliminarArchivo(viejo.path);
        }
      }
    } catch (err) {
      console.error('Error durante recordAsync:', err);
    } finally {
      this.iniciando = false;
      if (this.activo) {
        await this.delay(100);
        await this.iniciarNuevoSegmento();
      }
    }
  }

  // ===== Utils =====
  private async ensureDir(dir: string) {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }

  private async limpiarSegmentos() {
    for (const s of this.segmentos) {
      await this.eliminarArchivo(s.path);
    }
    this.segmentos = [];
  }

  private async eliminarArchivo(path: string) {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) await FileSystem.deleteAsync(path, { idempotent: true });
    } catch (e) {
      console.warn('Error eliminando archivo:', e);
    }
  }

  private async silentDelete(path: string) {
    try {
      await FileSystem.deleteAsync(path, { idempotent: true });
    } catch {}
  }

  private delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  private async ffmpegDisponible() {
    try {
      const session = await FFmpegKit.execute('-version');
      const rc = await session.getReturnCode();
      return rc?.isValueSuccess?.() ?? false;
    } catch {
      return false;
    }
  }

  private async runFFmpeg(cmd: string) {
    const session = await FFmpegKit.execute(cmd);
    const returnCode = await session.getReturnCode();
    if (!returnCode?.isValueSuccess()) {
      const logs = await session.getAllLogsAsString();
      throw new Error(`FFmpeg error: ${returnCode?.getValue()} | ${logs}`);
    }
  }

  // opcional: datos overlay
  getOverlayData() {
    return {
      velocidad: Math.floor(Math.random() * 120),
      latitud: -33.4372 + (Math.random() - 0.5) * 0.1,
      longitud: -70.6506 + (Math.random() - 0.5) * 0.1,
      hora: new Date().toLocaleTimeString('es-CL'),
      fecha: new Date().toLocaleDateString('es-CL'),
    };
  }
}

export const recordingService = new RecordingService();
export default recordingService;
