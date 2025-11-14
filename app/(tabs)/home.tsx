// app/(tabs)/home.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';

import { useState, useEffect, useRef } from 'react';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Video, Play, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { recordingService } from '@/services/recording';
import OverlayWidget from '@/components/OverlayWidget';
import { useKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  useKeepAwake();

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
      recordingService.setCameraRef(cameraRef.current);

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

      const clip = await recordingService.guardarUltimosNsegundos();
      const overlayData = recordingService.getOverlayData();

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

      if (!error) {
        Alert.alert(
          '¡Éxito!',
          `Clip de ${Math.round(clip.duracion)}s guardado correctamente`
        );
        loadNewRecordsCount();
      } else {
        Alert.alert('Error', 'No se pudo guardar el clip');
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
        <Text style={styles.permissionLoading}>Cargando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Image
            source={require('@/assets/images/icon.png')}
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

  return (
    <View style={styles.container}>
      {/* Widget flotante */}
      {isRecording && (
        <OverlayWidget
          onDetener={handleStopRecording}
          onLookout={handleLookout}
          onToggleSize={() => setIsMinimized(!isMinimized)}
          isMinimized={isMinimized}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
          />
        </View>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Modo DashCam</Text>

          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButton}
          >
            <LogOut color={Colors.dark.textSecondary} size={24} />
          </TouchableOpacity>
        </View>

        {/* BADGE */}
        {newRecordsCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {newRecordsCount} nuevos registros
            </Text>
          </View>
        )}

        {/* MODO NO INICIADO */}
        {!isRecording && (
          <View style={styles.startContainer}>
            <View style={styles.iconContainer}>
              <Video color={Colors.dark.primary} size={64} />
            </View>

            <Text style={styles.startDescription}>
              Graba continuamente los últimos 30 segundos.{'\n'}
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

        {/* MODO GRABANDO */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  /** ScrollView */
  content: {
    paddingTop: 30,
    paddingBottom: 80,
    paddingHorizontal: Spacing.lg,
  },

  /** Logo */
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 58,
    resizeMode: 'contain',
    opacity: 0.9,
  },

  /** Header */
  headerRow: {
    marginTop: 10,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOutButton: {
    padding: 6,
    borderRadius: 10,
  },

  title: {
    ...Typography.h2,
    color: Colors.dark.text,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /** Badge */
  badge: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 5,
    marginBottom: 24,
    shadowColor: Colors.dark.primary,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  badgeText: {
    color: Colors.dark.text,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  /** Inicio */
  startContainer: {
    marginTop: 20,
    alignItems: 'center',
  },

  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
  },

  startDescription: {
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontSize: 15,
  },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderRadius: 14,
    gap: 12,
    shadowColor: Colors.dark.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  startButtonText: {
    color: Colors.dark.text,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  /** Cámara */
  cameraContainer: {
    marginTop: 10,
    height: 420,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
  },
  camera: {
    flex: 1,
  },

  /** Permisos */
  permissionLoading: {
    textAlign: 'center',
    marginTop: 100,
    color: Colors.dark.text,
  },
  permissionCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    textAlign: 'center',
    maxWidth: 260,
  },
  permissionButton: {
    marginTop: 20,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
