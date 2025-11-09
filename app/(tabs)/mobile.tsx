// app/(tabs)/mobile.tsx
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import recordingService from '@/services/recording';

// Si ya tienes un tema central, puedes reemplazar estos tokens por tus imports.
const Colors = {
  dark: {
    background: '#0a1b2e',
    primary: '#235DE6',
    text: '#F8FAFF',
  },
};
const Spacing = { xs: 6, sm: 8, md: 12, lg: 16 };
const BorderRadius = { md: 12, lg: 16 };
const Typography = {
  bodySmall: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: '600' as const },
};

export default function MobileDashcamScreen() {
  const insets = useSafeAreaInsets();
  const camRef = useRef<CameraView | null>(null);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();

  const [status, setStatus] = useState(recordingService.getEstado());

  // vincular la ref de cámara al servicio
  useEffect(() => {
    recordingService.setCameraRef(camRef.current);
  });

  // refrescar estado (segundos / buffer)
  useEffect(() => {
    const id = setInterval(() => setStatus(recordingService.getEstado()), 500);
    return () => clearInterval(id);
  }, []);

  async function ensurePerms() {
    // Cámara
    if (!camPerm?.granted) {
      const res = await requestCamPerm();
      if (!res.granted) {
        Alert.alert('Permiso requerido', 'Debes otorgar permiso de CÁMARA para grabar.');
        return { ok: false, mute: true };
      }
    }
    // Micrófono → si no lo conceden, grabamos en mute (Expo Go a veces no pide RECORD_AUDIO)
    let mute = false;
    if (!micPerm?.granted) {
      const res = await requestMicPerm();
      if (!res.granted) {
        mute = true;
        if (Platform.OS === 'android') {
          Alert.alert(
            'Micrófono denegado',
            'Se grabará SIN audio. Puedes habilitar el micrófono en Ajustes → Permisos.'
          );
        }
      }
    }
    return { ok: true, mute };
  }

  async function onStart() {
    const { ok, mute } = await ensurePerms();
    if (!ok) return;
    try {
      // Grabación PERMANENTE (segmentos encadenados) con ventana de 30s
      await recordingService.iniciarGrabacion({
        segmentoSegundos: 10,
        ventanaNSegundos: 30,
        mute, // si no hay micrófono, graba sin audio
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar la grabación');
    }
  }

  async function onLookOut() {
    try {
      // Guarda los ÚLTIMOS 30s: con Dev Client usa FFmpeg para concatenar/recortar;
      // en Expo Go hace fallback (último segmento)
      const clip = await recordingService.guardarUltimosNsegundos();
      Alert.alert('Clip guardado', `Ruta: ${clip.pathMp4}\nDuración: ${clip.duracion}s`);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo guardar el clip');
    }
  }

  async function onStop() {
    await recordingService.detenerGrabacion();
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrap}>
        <CameraView ref={camRef} style={StyleSheet.absoluteFillObject} />
        {status.activo && (
          <View style={styles.badge}>
            <View style={styles.dot} />
            <Text style={styles.badgeText}>
              Grabando · {status.segundosGrabando}s · Buf: {status.segmentosEnBuffer}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TouchableOpacity style={[styles.btn, styles.start]} onPress={onStart}>
          <Text style={styles.btnText}>INICIAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.capture]}
          onPress={onLookOut}
          disabled={!status.activo}
        >
          <Text style={styles.btnText}>CAPTURAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.stop]}
          onPress={onStop}
          disabled={!status.activo}
        >
          <Text style={styles.btnText}>DETENER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  cameraWrap: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
  },
  badge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: '#00000088',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: { width: 10, height: 10, borderRadius: 99, backgroundColor: '#ff4d4f' },
  badgeText: { ...Typography.bodySmall, color: '#fff' },
  controls: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  start: { backgroundColor: Colors.dark.primary },
  capture: { backgroundColor: '#1f2937' },
  stop: { backgroundColor: '#ef4444' },
  btnText: { ...Typography.button, color: Colors.dark.text },
});
