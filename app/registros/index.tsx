import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Trash2,
  Upload,
  Edit3,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Registro } from '@/types/database';

export default function RegistrosScreen() {
  const router = useRouter();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRegistros();
  }, []);

  const loadRegistros = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRegistros(data);
    }
    setLoading(false);
  };

  const handleLongPress = () => {
    setSelectionMode(true);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handlePublish = async () => {
    if (selectedIds.size === 0) return;

    const idsArray = Array.from(selectedIds);
    const { error } = await supabase
      .from('registros')
      .update({ estado: 'publicado' })
      .in('id', idsArray);

    if (!error) {
      Alert.alert('Éxito', 'Videos publicados exitosamente');
      setSelectionMode(false);
      setSelectedIds(new Set());
      loadRegistros();
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Estás seguro que deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('registros')
              .delete()
              .eq('id', id);

            if (!error) {
              loadRegistros();
            }
          },
        },
      ]
    );
  };

  const handleCardPress = (registro: Registro) => {
    if (selectionMode) {
      toggleSelection(registro.id);
    } else {
      router.push({
        pathname: '/registros/[id]',
        params: { id: registro.id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={Colors.dark.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Registros Guardados</Text>
        {selectionMode && (
          <TouchableOpacity onPress={() => {
            setSelectionMode(false);
            setSelectedIds(new Set());
          }}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectionMode && selectedIds.size > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.selectedCount}>{selectedIds.size} seleccionados</Text>
          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Upload color={Colors.dark.text} size={20} />
            <Text style={styles.publishButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={styles.emptyText}>Cargando...</Text>
        ) : registros.length === 0 ? (
          <Text style={styles.emptyText}>No hay registros guardados</Text>
        ) : (
          registros.map((registro) => (
            <TouchableOpacity
              key={registro.id}
              style={[
                styles.card,
                selectionMode && selectedIds.has(registro.id) && styles.cardSelected,
              ]}
              onPress={() => handleCardPress(registro)}
              onLongPress={handleLongPress}
              delayLongPress={500}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDate}>
                    {new Date(registro.fecha).toLocaleDateString('es-CL')}
                  </Text>
                  <View style={styles.cardRow}>
                    <Clock color={Colors.dark.textSecondary} size={14} />
                    <Text style={styles.cardTime}>{registro.hora}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  registro.estado === 'publicado' && styles.statusPublicado,
                ]}>
                  {registro.estado === 'publicado' ? (
                    <CheckCircle color={Colors.dark.secondary} size={16} />
                  ) : (
                    <XCircle color={Colors.dark.textSecondary} size={16} />
                  )}
                  <Text style={[
                    styles.statusText,
                    registro.estado === 'publicado' && styles.statusPublicadoText,
                  ]}>
                    {registro.estado === 'publicado' ? 'Publicado' : 'Pendiente'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <MapPin color={Colors.dark.textSecondary} size={16} />
                  <Text style={styles.cardText}>
                    {registro.geo_loc_comuna}, {registro.geo_loc_region}
                  </Text>
                </View>
                <Text style={styles.cardText}>Velocidad: {registro.velocidad_kmh} km/h</Text>
                {registro.nota_tag && (
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>{registro.nota_tag}</Text>
                  </View>
                )}
              </View>

              {!selectionMode && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      router.push({
                        pathname: '/registros/[id]',
                        params: { id: registro.id },
                      });
                    }}
                  >
                    <Play color={Colors.dark.primary} size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      router.push({
                        pathname: '/registros/edit/[id]',
                        params: { id: registro.id },
                      });
                    }}
                  >
                    <Edit3 color={Colors.dark.textSecondary} size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(registro.id)}
                  >
                    <Trash2 color={Colors.dark.error} size={18} />
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
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
  cancelText: {
    ...Typography.body,
    color: Colors.dark.primary,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  selectedCount: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  publishButtonText: {
    ...Typography.bodySmall,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.surfaceVariant,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardInfo: {
    gap: Spacing.xs,
  },
  cardDate: {
    ...Typography.body,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTime: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.background,
  },
  statusPublicado: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  statusText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  statusPublicadoText: {
    color: Colors.dark.secondary,
  },
  cardBody: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardText: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  tagContainer: {
    backgroundColor: Colors.dark.surfaceVariant,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.dark.primary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
});
