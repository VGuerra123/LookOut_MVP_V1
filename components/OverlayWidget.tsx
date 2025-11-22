import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from "react-native";

import { useState, useRef, useEffect } from "react";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Minimize2, Maximize2, Square, Camera } from "lucide-react-native";
import { recordingService } from "@/services/recording";
import * as Haptics from "expo-haptics";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface OverlayWidgetProps {
  onDetener: () => void;
  onLookout: () => void;
  onToggleSize: () => void;
  isMinimized: boolean;
}

export default function OverlayWidget({
  onDetener,
  onLookout,
  onToggleSize,
  isMinimized,
}: OverlayWidgetProps) {
  const [estado, setEstado] = useState(recordingService.getEstado());
  const [overlayData, setOverlayData] = useState(
    recordingService.getOverlayData()
  );

  /** Animación pulso */
  const pulseAnim = useRef(new Animated.Value(1)).current;

  /** Animación flash LookOut */
  const flashAnim = useRef(new Animated.Value(0)).current;

  /** Posición de la burbuja flotante */
  const pan = useRef(new Animated.ValueXY({ x: SCREEN_W - 90, y: 100 })).current;

  /** DRAG BURBUJA */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isMinimized,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gesture) => {
        // Adhesión al borde más cercano
        const finalX = gesture.moveX > SCREEN_W / 2 ? SCREEN_W - 70 : 20;

        Animated.spring(pan, {
          toValue: { x: finalX, y: gesture.moveY - 40 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  /** Intervalos */
  useEffect(() => {
    const interval = setInterval(() => {
      setEstado(recordingService.getEstado());
      setOverlayData(recordingService.getOverlayData());
    }, 1000);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      clearInterval(interval);
      pulse.stop();
    };
  }, []);

  /** Flash LookOut */
  const triggerFlash = () => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  /** Cuando presionan LOOKOUT */
  const handleLookoutPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    triggerFlash();
    onLookout();
  };

  /** ============================
   *         MODO MINIMIZADO
   * ============================ */
  if (isMinimized) {
    return (
      <>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.bubble,
            {
              transform: [...pan.getTranslateTransform()],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.recordingDotMini,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />

          <TouchableOpacity onPress={handleLookoutPress}>
            <Camera size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onDetener}>
            <Square size={22} color="#ff4444" fill="#ff4444" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleSize}>
            <Maximize2 size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Flash animation */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flashOverlay,
            {
              opacity: flashAnim,
            },
          ]}
        />
      </>
    );
  }

  /** ============================
   *         MODO COMPLETO
   * ============================ */
  return (
    <>
      <View style={styles.fullContainer}>
        {/* HEADER */}
        <View style={styles.overlayHeader}>
          <View style={styles.recordingBadge}>
            <Animated.View
              style={[
                styles.recordingDot,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <Text style={styles.recordingText}>GRABANDO</Text>
          </View>

          <TouchableOpacity style={styles.headerButton} onPress={onToggleSize}>
            <Minimize2 size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* DATOS */}
        <View style={styles.overlayData}>
          <Text style={styles.dataLine}>
            Velocidad: <Text style={styles.dataValue}>{overlayData.velocidad} km/h</Text>
          </Text>

          <Text style={styles.dataLine}>
            Ubicación:{" "}
            <Text style={styles.dataValue}>
              {overlayData.latitud.toFixed(4)}, {overlayData.longitud.toFixed(4)}
            </Text>
          </Text>

          <Text style={styles.dataLine}>
            Hora: <Text style={styles.dataValue}>{overlayData.hora}</Text>
          </Text>
        </View>

        {/* CONTROLES */}
        <View style={styles.controls}>
          <Text style={styles.timerText}>
            {Math.floor(estado.segundosGrabando / 60)}:
            {(estado.segundosGrabando % 60).toString().padStart(2, "0")}
          </Text>

          <Text style={styles.timerSub}>
            Buffer: {estado.segmentosEnBuffer} segmentos
          </Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.lookoutButton}
              onPress={handleLookoutPress}
            >
              <Camera size={28} color="#fff" />
              <Text style={styles.lookoutText}>LOOKOUT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.stopButton} onPress={onDetener}>
              <Square size={28} color="#fff" fill="#fff" />
              <Text style={styles.stopText}>DETENER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Flash */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: flashAnim }]}
      />
    </>
  );
}

/* =======================================================================
   ESTILOS
======================================================================= */

const styles = StyleSheet.create({
  /* --- Burbuja flotante --- */
  bubble: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.85)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 40,
    gap: 10,
    zIndex: 2000,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  recordingDotMini: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.error,
  },

  /* --- Flash --- */
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
    zIndex: 9999,
  },

  /* --- Modo completo --- */
  fullContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    paddingTop: 60,
    paddingHorizontal: Spacing.md,
    paddingBottom: 14,
    backgroundColor: "rgba(0,0,0,0.92)",
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
    zIndex: 1000,
  },

  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.error,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.background,
  },

  recordingText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
  },

  headerButton: {
    backgroundColor: Colors.dark.surface,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  overlayData: {
    marginBottom: 14,
    gap: 6,
  },

  dataLine: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },

  dataValue: {
    color: Colors.dark.text,
    fontWeight: "700",
  },

  controls: {
    alignItems: "center",
    gap: 8,
  },

  timerText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "700",
  },

  timerSub: {
    color: Colors.dark.textSecondary,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  lookoutButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  lookoutText: {
    color: "#fff",
    fontWeight: "800",
  },

  stopButton: {
    flex: 1,
    backgroundColor: Colors.dark.error,
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  stopText: {
    color: "#fff",
    fontWeight: "800",
  },
});
