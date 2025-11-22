import { NativeModules, NativeEventEmitter } from "react-native";

const { LookoutWakeword } = NativeModules;

let listener: any = null;

export async function startWakeWord(onDetected: () => void) {
  try {
    if (!LookoutWakeword) {
      console.error("❌ Error: módulo nativo no encontrado (LookoutWakeword)");
      return;
    }

    console.log("🎤 Iniciando WakeWord…");

    await LookoutWakeword.initialize(
      "lookout_android.ppn",
      "lookout_ios.ppn",
      "porcupine_params.pv"
    );

    const emitter = new NativeEventEmitter(LookoutWakeword);

    listener = emitter.addListener("onWakeWordDetected", () => {
      console.log("🔥 DETECTADO WAKEWORD");
      onDetected();
    });

    await LookoutWakeword.start();
  } catch (err) {
    console.error("❌ Error iniciando wakeword:", err);
  }
}

export async function stopWakeWord() {
  try {
    if (listener) {
      listener.remove();
      listener = null;
    }

    if (LookoutWakeword) {
      await LookoutWakeword.stop();
      await LookoutWakeword.release();
    }

    console.log("🛑 WakeWord detenido");
  } catch (err) {
    console.error("❌ Error deteniendo wakeword:", err);
  }
}
