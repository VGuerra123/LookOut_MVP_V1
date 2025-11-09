import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Video, Play, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { recordingService } from '@/services/recording';
import OverlayWidget from '@/components/OverlayWidget';
import { useKeepAwake } from 'expo-keep-awake';

export default function MovilScreen() {
  useKeepAwake(); // Mantener pantalla activa

  const router = useRouter();
  const { signOut } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newRecordsCount, setNewRecordsCount] = useState(0);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    loadNewRecordsCount();
  }, []);

  const loadNewRecordsCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('registros')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('tipo_modo', 'movil')
      .eq('estado', 'pendiente');

    setNewRecordsCount(data?.length || 0);
  };

  const handleStartRecording = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso Denegado', 'Se necesita acceso a la cámara para grabar');
        return;
      }
    }

    try {
      // Configurar referencia de cámara en el servicio
      recordingService.setCameraRef(cameraRef.current);

      // Iniciar grabación con buffer de 30 segundos
      await recordingService.iniciarGrabacion({
        segmentoSegundos: 10,
        ventanaNSegundos: 30,
      });

      setIsRecording(true);
    } catch (error) {
      console.error('Error iniciando grabación:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const handleStopRecording = async () => {
    try {
      await recordingService.detenerGrabacion();
      setIsRecording(false);
      setIsMinimized(false);
    } catch (error) {
      console.error('Error deteniendo grabación:', error);
      Alert.alert('Error', 'No se pudo detener la grabación');
    }
  };

  const handleLookout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      // Guardar últimos 30 segundos
      const clip = await recordingService.guardarUltimosNsegundos();
      const overlayData = recordingService.getOverlayData();

      // Insertar registro en Supabase
      const { error } = await supabase.from('registros').insert({
        user_id: user.id,
        duracion_segundos: Math.round(clip.duracion),
        geo_loc_comuna: 'Santiago Centro',
        geo_loc_region: 'Región Metropolitana',
        latitud: overlayData.latitud,
        longitud: overlayData.longitud,
        velocidad_kmh: overlayData.velocidad,
        tipo_modo: 'movil',
        estado: 'pendiente',
        nota_tag: '',
        archivo_local_path: clip.pathMp4,
      });

      if (error) {
        Alert.alert('Error', 'No se pudo guardar el clip');
      } else {
        Alert.alert('¡Éxito!', `Clip de ${Math.round(clip.duracion)}s guardado correctamente`);
        loadNewRecordsCount();
      }
    } catch (error) {
      console.error('Error en handleLookout:', error);
      Alert.alert('Error', 'No se pudo guardar el clip');
    }
  };

  const handleSignOut = async () => {
    if (isRecording) {
      Alert.alert('Advertencia', 'Detén la grabación antes de cerrar sesión');
      return;
    }

    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Permiso de Cámara</Text>
          <Text style={styles.permissionText}>
            Se necesita acceso a la cámara para grabar videos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isRecording && (
        <OverlayWidget
          onDetener={handleStopRecording}
          onLookout={handleLookout}
          onToggleSize={() => setIsMinimized(!isMinimized)}
          isMinimized={isMinimized}
        />
      )}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>LookOut Móvil</Text>
            {newRecordsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{newRecordsCount} nuevos registros</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={handleSignOut}>
            <LogOut color={Colors.dark.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        {!isRecording ? (
          <View style={styles.startContainer}>
            <View style={styles.iconContainer}>
              <Video color={Colors.dark.primary} size={64} />
            </View>
            <Text style={styles.startTitle}>Modo Dash-Cam</Text>
            <Text style={styles.startDescription}>
              Inicia la grabación en bucle de 30 segundos.{'\n'}
              Usa el botón "LOOKOUT" para guardar clips importantes.
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartRecording}>
              <Play color={Colors.dark.text} size={24} />
              <Text style={styles.startButtonText}>INICIAR MODO MÓVIL</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {!isMinimized && (
              <View style={styles.cameraContainer}>
                <CameraView
                  ref={cameraRef}
                  style={styles.camera}
                  facing="back"
                  mode="video"
                />
              </View>
            )}

            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.viewRecordsButton}
                onPress={() => router.push('/registros')}
              >
                <Text style={styles.viewRecordsText}>Ver Registros Guardados</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: 60,
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
  },
  badge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  startTitle: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  startDescription: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  startButtonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
  cameraContainer: {
    height: 400,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
  },
  camera: {
    flex: 1,
  },
  controls: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  viewRecordsButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  viewRecordsText: {
    ...Typography.body,
    color: Colors.dark.primary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
});
