// app/(tabs)/home.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from "react-native";

import { useState, useEffect, useRef } from "react";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Video, Play, LogOut } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { CameraView, useCameraPermissions } from "expo-camera";
import recordingService from "@/services/recording";
import OverlayWidget from "@/components/OverlayWidget";
import { useKeepAwake } from "expo-keep-awake";
import { useRouter } from "expo-router";
import { useWakeWord } from "@/hooks/useWakeWord";

export default function HomeScreen() {
  useKeepAwake();

  const router = useRouter();
  const { signOut } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newRecordsCount, setNewRecordsCount] = useState(0);
  const cameraRef = useRef<any>(null);

  // ===========================================================================================
  //  🔊 WAKEWORD — “lookout” → guardar últimos 30s
  // ===========================================================================================
  useWakeWord(async () => {
    console.log("WAKEWORD → LOOKOUT DETECTADO");

    if (isRecording) {
      await handleLookout();
    }
  });

  // ===========================================================================================
  //  CARGAR CONTADOR
  // ===========================================================================================
  useEffect(() => {
    loadNewRecordsCount();
  }, []);

  const loadNewRecordsCount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("registros")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .eq("tipo_modo", "movil")
      .eq("estado", "pendiente");

    setNewRecordsCount(data?.length || 0);
  };

  // ===========================================================================================
  //  AUTO-START si ya hay permisos
  // ===========================================================================================
  useEffect(() => {
    if (permission?.granted && !isRecording) {
      startBufferRecording();
    }
  }, [permission]);

  // ===========================================================================================
  //  INICIAR GRABACIÓN PERMANENTE
  // ===========================================================================================
  const startBufferRecording = async () => {
    try {
      recordingService.setCameraRef(cameraRef.current);

      await recordingService.iniciarGrabacion({
        segmentoSegundos: 2,
        ventanaNSegundos: 30,
      });

      setIsRecording(true);
    } catch (err) {
      console.error("error iniciar:", err);
      Alert.alert("Error", "No se pudo iniciar grabación");
    }
  };

  const handleStartRecording = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permiso Denegado",
          "Necesitas acceso a la cámara para grabar"
        );
        return;
      }
    }
    await startBufferRecording();
  };

  // ===========================================================================================
  //  GUARDAR ÚLTIMOS 30s
  // ===========================================================================================
  const handleLookout = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const clip = await recordingService.guardarUltimosNsegundos();
      const overlay = recordingService.getOverlayData();

      const { error } = await supabase.from("registros").insert({
        user_id: user.id,
        duracion_segundos: Math.round(clip.duracion),
        tipo_modo: "movil",
        estado: "pendiente",
        archivo_local_path: clip.pathMp4,
        latitud: overlay.latitud,
        longitud: overlay.longitud,
        velocidad_kmh: overlay.velocidad,
        geo_loc_comuna: "Santiago Centro",
        geo_loc_region: "Región Metropolitana",
      });

      if (!error) {
        loadNewRecordsCount();
        Alert.alert("Guardado", "Se guardó el último evento (30s)");
      }
    } catch (err) {
      console.error("LOOKOUT error", err);
      Alert.alert("Error", "No se pudo guardar el evento");
    }
  };

  // ===========================================================================================
  //  DETENER GRABACIÓN
  // ===========================================================================================
  const handleStopRecording = async () => {
    try {
      await recordingService.detenerGrabacion();
      setIsRecording(false);
      setIsMinimized(false);
    } catch (err) {
      console.error("error stop:", err);
    }
  };

  // ===========================================================================================
  //  CERRAR SESIÓN
  // ===========================================================================================
  const handleSignOut = async () => {
    if (isRecording) {
      Alert.alert("Advertencia", "Detén la grabación antes de salir");
      return;
    }
    await signOut();
    router.replace("/");
  };

  // ===========================================================================================
  //  UI — PERMISOS
  // ===========================================================================================
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionLoading}>Cargando permisos…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
          <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
          <Text style={styles.permissionText}>
            Se necesita acceso a la cámara para grabar videos
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ===========================================================================================
  //  RENDER PRINCIPAL
  // ===========================================================================================
  return (
    <View style={styles.container}>
      {/* Overlay flotante */}
      {isRecording && (
        <OverlayWidget
          onDetener={handleStopRecording}
          onLookout={handleLookout}
          onToggleSize={() => setIsMinimized(!isMinimized)}
          isMinimized={isMinimized}
        />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.title}>Modo DashCam</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <LogOut size={24} color="#89A0B3" />
          </TouchableOpacity>
        </View>

        {newRecordsCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {newRecordsCount} nuevos registros
            </Text>
          </View>
        )}

        {!isRecording && (
          <View style={styles.startContainer}>
            <View style={styles.iconContainer}>
              <Video color={Colors.dark.primary} size={64} />
            </View>

            <Text style={styles.startDescription}>
              Graba continuamente los últimos 30 segundos.{"\n"}
              Usa “LOOKOUT” para guardar eventos importantes.
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartRecording}
            >
              <Play color={Colors.dark.text} size={24} />
              <Text style={styles.startButtonText}>INICIAR MODO MÓVIL</Text>
            </TouchableOpacity>
          </View>
        )}

        {isRecording && !isMinimized && (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              mode="video"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ===== ESTILOS ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    paddingTop: 30,
    paddingBottom: 80,
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 58,
    resizeMode: "contain",
    opacity: 0.9,
  },
  headerRow: {
    marginTop: 10,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signOutButton: {
    padding: 6,
    borderRadius: 10,
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
    fontWeight: "800",
  },
  badge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 5,
    marginBottom: 24,
  },
  badgeText: {
    color: Colors.dark.text,
    fontWeight: "700",
  },
  startContainer: { marginTop: 20, alignItems: "center" },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: Colors.dark.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  startDescription: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    fontSize: 15,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 14,
  },
  startButtonText: {
    color: Colors.dark.text,
    fontWeight: "800",
  },
  cameraContainer: {
    marginTop: 10,
    height: 420,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
  },
  camera: { flex: 1 },
  permissionLoading: { textAlign: "center", marginTop: 100, color: "#fff" },
  permissionCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  permissionTitle: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginTop: 12,
  },
  permissionText: {
    color: Colors.dark.textSecondary,
    marginTop: 8,
    textAlign: "center",
    maxWidth: 260,
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: { color: "#fff", fontWeight: "700" },
});
