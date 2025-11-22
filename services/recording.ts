import * as FileSystem from "expo-file-system/legacy";
import { Audio } from "expo-av";

interface RecordingConfig {
  segmentoSegundos?: number;
  ventanaNSegundos?: number;
  mute?: boolean;
}

interface Segmento {
  path: string;
  duracion: number;
  timestamp: number;
}

interface ClipGuardado {
  pathMp4: string;
  duracion: number;
  createdAt: Date;
}

class RecordingService {
  private activo = false;
  private iniciando = false;

  private segmentoSegundos = 2;
  private ventanaNSegundos = 30;
  private mute = false;

  private cameraRef: any = null;
  private segmentos: Segmento[] = [];

  private secondsTimer: ReturnType<typeof setInterval> | null = null;
  private segundosGrabados = 0;

  async iniciarGrabacion(config: RecordingConfig = {}) {
    if (this.activo) return;

    this.activo = true;
    this.iniciando = false;

    this.segmentoSegundos = config.segmentoSegundos ?? 2;
    this.ventanaNSegundos = config.ventanaNSegundos ?? 30;
    this.mute = config.mute ?? false;

    await this.prepareDirectories();
    await this.prepareAudio();

    this.segundosGrabados = 0;

    this.secondsTimer = setInterval(() => {
      this.segundosGrabados += 1;
    }, 1000);

    console.log("🎥 Grabación LookOut iniciada");
    this.iniciarNuevoSegmento();
  }

  async detenerGrabacion() {
    if (!this.activo) return;

    this.activo = false;

    if (this.secondsTimer) clearInterval(this.secondsTimer);
    this.secondsTimer = null;

    try {
      this.cameraRef?.stopRecording?.();
    } catch {}

    await this.limpiarSegmentos();

    this.segmentos = [];
    this.segundosGrabados = 0;

    console.log("🛑 Grabación detenida");
  }

  private async iniciarNuevoSegmento() {
    if (!this.activo || this.iniciando) return;
    this.iniciando = true;

    try {
      const rec =
        this.cameraRef?.recordAsync ??
        this.cameraRef?.current?.recordAsync;

      if (!rec) {
        this.iniciando = false;
        setTimeout(() => this.iniciarNuevoSegmento(), 150);
        return;
      }

      const inicio = Date.now();
      const result = await rec.call(this.cameraRef, {
        maxDuration: this.segmentoSegundos,
        mute: this.mute,
      });

      const uri = result?.uri;
      if (uri) {
        const dur = Math.max(
          1,
          Math.round((Date.now() - inicio) / 1000)
        );

        const seg: Segmento = {
          path: uri,
          duracion: dur,
          timestamp: inicio,
        };

        this.segmentos.push(seg);

        // Mantener ventanas de 30s
        let acumulado = this.segmentos.reduce((a, s) => a + s.duracion, 0);
        while (acumulado > this.ventanaNSegundos) {
          const viejo = this.segmentos.shift();
          if (viejo) await this.safeDelete(viejo.path);
          acumulado = this.segmentos.reduce((a, s) => a + s.duracion, 0);
        }
      }
    } catch (err) {
      console.error("❗Error en segmento:", err);
    }

    this.iniciando = false;

    if (this.activo) {
      setTimeout(() => this.iniciarNuevoSegmento(), 100);
    }
  }

  async guardarUltimosNsegundos(): Promise<ClipGuardado> {
    if (!this.activo) throw new Error("No se está grabando");

    try {
      this.cameraRef?.stopRecording?.();
    } catch {}
    await this.delay(200);

    const segs = [...this.segmentos];
    if (!segs.length) throw new Error("Sin segmentos");

    const last = segs[segs.length - 1];

    const dirClips = `${FileSystem.documentDirectory}lookout/clips/`;
    const ts = Date.now();
    const out = `${dirClips}clip_${ts}.mp4`;

    await FileSystem.copyAsync({
      from: last.path,
      to: out,
    });

    return {
      pathMp4: out,
      duracion: last.duracion,
      createdAt: new Date(),
    };
  }

  getOverlayData() {
    return {
      velocidad: Math.floor(Math.random() * 120),
      latitud: -33.4372 + (Math.random() - 0.5) * 0.1,
      longitud: -70.6506 + (Math.random() - 0.5) * 0.1,
      hora: new Date().toLocaleTimeString("es-CL"),
      fecha: new Date().toLocaleDateString("es-CL"),
    };
  }

  getEstado() {
    return {
      activo: this.activo,
      segundosGrabando: this.segundosGrabados,
      segmentosEnBuffer: this.segmentos.length,
    };
  }

  setCameraRef(ref: any) {
    this.cameraRef = ref;
  }

  private async prepareDirectories() {
    const root = `${FileSystem.documentDirectory}lookout/`;
    const dirs = ["segments", "clips", "tmp"];

    for (const d of dirs) {
      const full = `${root}${d}/`;
      const info = await FileSystem.getInfoAsync(full);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(full, { intermediates: true });
      }
    }
  }

  private async prepareAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
    } catch {}
  }

  private async limpiarSegmentos() {
    for (const s of this.segmentos) await this.safeDelete(s.path);
  }

  private async safeDelete(path: string) {
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) await FileSystem.deleteAsync(path, { idempotent: true });
    } catch {}
  }

  private delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }
}

export const recordingService = new RecordingService();
export default recordingService;
