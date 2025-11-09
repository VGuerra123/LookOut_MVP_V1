import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Minimize2, Maximize2, Square, Camera } from 'lucide-react-native';
import { recordingService } from '@/services/recording';

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
  const [overlayData, setOverlayData] = useState(recordingService.getOverlayData());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Actualizar estado cada segundo
    const interval = setInterval(() => {
      setEstado(recordingService.getEstado());
      setOverlayData(recordingService.getOverlayData());
    }, 1000);

    // Animación de pulso para el indicador de grabación
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => {
      clearInterval(interval);
      pulseAnimation.stop();
    };
  }, []);

  if (isMinimized) {
    return (
      <View style={styles.minimizedContainer}>
        <View style={styles.minimizedContent}>
          <View style={styles.recordingIndicator}>
            <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.minimizedTimer}>
              {Math.floor(estado.segundosGrabando / 60)}:{(estado.segundosGrabando % 60).toString().padStart(2, '0')}
            </Text>
          </View>

          <View style={styles.minimizedButtons}>
            <TouchableOpacity style={styles.miniButton} onPress={onLookout}>
              <Camera color={Colors.dark.text} size={20} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.miniButton} onPress={onDetener}>
              <Square color={Colors.dark.error} size={20} fill={Colors.dark.error} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.miniButton} onPress={onToggleSize}>
              <Maximize2 color={Colors.dark.text} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.overlayHeader}>
        <View style={styles.recordingBadge}>
          <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.recordingText}>GRABANDO</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={onToggleSize}>
          <Minimize2 color={Colors.dark.text} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.overlayData}>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Velocidad:</Text>
          <Text style={styles.dataValue}>{overlayData.velocidad} km/h</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Ubicación:</Text>
          <Text style={styles.dataValue}>
            {overlayData.latitud.toFixed(4)}, {overlayData.longitud.toFixed(4)}
          </Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Hora:</Text>
          <Text style={styles.dataValue}>{overlayData.hora}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {Math.floor(estado.segundosGrabando / 60)}:{(estado.segundosGrabando % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.timerSubtext}>
            Buffer: {estado.segmentosEnBuffer} segmentos
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.lookoutButton} onPress={onLookout}>
            <Camera color={Colors.dark.text} size={28} />
            <Text style={styles.lookoutButtonText}>LOOKOUT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.stopButton} onPress={onDetener}>
            <Square color={Colors.dark.text} size={28} fill={Colors.dark.text} />
            <Text style={styles.stopButtonText}>DETENER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Estilos minimizados
  minimizedContainer: {
    position: 'absolute',
    top: 60,
    right: Spacing.md,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  minimizedContent: {
    gap: Spacing.sm,
  },
  minimizedTimer: {
    ...Typography.body,
    color: Colors.dark.text,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  minimizedButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  miniButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Estilos completos
  fullContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    padding: Spacing.md,
    paddingTop: 60,
    zIndex: 1000,
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.primary,
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.dark.error,
  },
  recordingText: {
    ...Typography.caption,
    color: Colors.dark.text,
    fontWeight: '700',
    marginLeft: Spacing.sm,
  },
  headerButton: {
    width: 44,
    height: 44,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayData: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  dataValue: {
    ...Typography.body,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  controls: {
    gap: Spacing.md,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    ...Typography.h1,
    color: Colors.dark.text,
    fontWeight: '700',
  },
  timerSubtext: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  lookoutButton: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  lookoutButtonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
  stopButton: {
    flex: 1,
    backgroundColor: Colors.dark.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stopButtonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
});
