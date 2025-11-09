import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  ArrowLeft,
  Play,
  MapPin,
  Clock,
  Gauge,
  AlertCircle,
  MessageSquare,
  Share2,
  Calendar,
  Users,
  FileCheck,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Registro } from '@/types/database';

export default function RegistroDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistro();
  }, [id]);

  const loadRegistro = async () => {
    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      setRegistro(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!registro) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Registro no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={Colors.dark.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalle del Registro</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.videoPreview}>
          <Play color={Colors.dark.text} size={48} />
          <Text style={styles.videoText}>Reproducir Video</Text>
          <Text style={styles.videoDuration}>{registro.duracion_segundos}s</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Clock color={Colors.dark.textSecondary} size={20} />
              <View>
                <Text style={styles.infoLabel}>Fecha y Hora</Text>
                <Text style={styles.infoValue}>
                  {new Date(registro.fecha).toLocaleDateString('es-CL')} {registro.hora}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <MapPin color={Colors.dark.textSecondary} size={20} />
              <View>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>
                  {registro.geo_loc_comuna}, {registro.geo_loc_region}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Gauge color={Colors.dark.textSecondary} size={20} />
              <View>
                <Text style={styles.infoLabel}>Velocidad</Text>
                <Text style={styles.infoValue}>{registro.velocidad_kmh} km/h</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clasificación</Text>
          <View style={styles.classificationGrid}>
            <View style={styles.classificationItem}>
              <Text style={styles.classificationLabel}>Tipo de Evento</Text>
              <TextInput
                style={styles.classificationInput}
                placeholder="Ej: Incidente de tráfico"
                placeholderTextColor={Colors.dark.textSecondary}
                value={registro.tipo_evento || ''}
                editable={false}
              />
            </View>
            <View style={styles.classificationItem}>
              <Text style={styles.classificationLabel}>Gravedad</Text>
              <TextInput
                style={styles.classificationInput}
                placeholder="Ej: Leve, Moderada, Grave"
                placeholderTextColor={Colors.dark.textSecondary}
                value={registro.gravedad || ''}
                editable={false}
              />
            </View>
            <View style={styles.classificationItem}>
              <Text style={styles.classificationLabel}>Prioridad de Atención</Text>
              <TextInput
                style={styles.classificationInput}
                placeholder="Ej: Alta, Media, Baja"
                placeholderTextColor={Colors.dark.textSecondary}
                value={registro.prioridad || ''}
                editable={false}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <MessageSquare color={Colors.dark.primary} size={24} />
              <Text style={styles.actionText}>Comunicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Share2 color={Colors.dark.primary} size={24} />
              <Text style={styles.actionText}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Calendar color={Colors.dark.primary} size={24} />
              <Text style={styles.actionText}>Agendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Users color={Colors.dark.primary} size={24} />
              <Text style={styles.actionText}>Designar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <FileCheck color={Colors.dark.primary} size={24} />
              <Text style={styles.actionText}>Comprometer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.dark.text,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  videoPreview: {
    height: 240,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  videoText: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  videoDuration: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.dark.text,
  },
  infoGrid: {
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  classificationGrid: {
    gap: Spacing.md,
  },
  classificationItem: {
    gap: Spacing.xs,
  },
  classificationLabel: {
    ...Typography.bodySmall,
    color: Colors.dark.text,
  },
  classificationInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  actionCard: {
    width: '30%',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.dark.text,
    textAlign: 'center',
  },
});
