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

  /* ============================================================
     Cargar registros REALES (ordenados correctamente)
  ============================================================ */
  const loadRegistros = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('registros')
      .select('*')
      .eq('user_id', user.id)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false });

    if (!error && data) {
      setRegistros(data);
    }
    setLoading(false);
  };

  /* ============================================================
     Selección múltiple al mantener presionado
  ============================================================ */
  const handleLongPress = () => {
    setSelectionMode(true);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
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
      Alert.alert('Éxito', 'Registros publicados exitosamente.');
      setSelectionMode(false);
      setSelectedIds(new Set());
      loadRegistros();
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar Registro',
      '¿Seguro deseas eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('registros').delete().eq('id', id);
            if (!error) loadRegistros();
          },
        },
      ]
    );
  };

  const handleCardPress = (registro: Registro) => {
    if (selectionMode) {
      toggleSelection(registro.id);
    } else {
      router.push(`/registros/${registro.id}`);
    }
  };

  /* ============================================================
      UI PRINCIPAL
  ============================================================ */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={Colors.dark.text} size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Registros Guardados</Text>

        {selectionMode ? (
          <TouchableOpacity
            onPress={() => {
              setSelectionMode(false);
              setSelectedIds(new Set());
            }}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      {/* ACTION BAR */}
      {selectionMode && selectedIds.size > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.selectedCount}>{selectedIds.size} seleccionados</Text>

          <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
            <Upload size={20} color="#fff" />
            <Text style={styles.publishButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* CONTENIDO */}
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
              delayLongPress={480}
            >
              {/* HEADER CARD */}
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDate}>
                    {registro.fecha
                      ? new Date(registro.fecha).toLocaleDateString('es-CL')
                      : 'Sin fecha'}
                  </Text>

                  <View style={styles.cardRow}>
                    <Clock size={14} color={Colors.dark.textSecondary} />
                    <Text style={styles.cardTime}>{registro.hora || '--:--:--'}</Text>
                  </View>
                </View>

                {/* BADGE */}
                <View
                  style={[
                    styles.statusBadge,
                    registro.estado === 'publicado' && styles.statusPublicado,
                  ]}
                >
                  {registro.estado === 'publicado' ? (
                    <CheckCircle size={16} color={Colors.dark.secondary} />
                  ) : (
                    <XCircle size={16} color={Colors.dark.textSecondary} />
                  )}

                  <Text
                    style={[
                      styles.statusText,
                      registro.estado === 'publicado' && styles.statusPublicadoText,
                    ]}
                  >
                    {registro.estado === 'publicado' ? 'Publicado' : 'Pendiente'}
                  </Text>
                </View>
              </View>

              {/* BODY */}
              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <MapPin size={16} color={Colors.dark.textSecondary} />
                  <Text style={styles.cardText}>
                    {registro.geo_loc_comuna}, {registro.geo_loc_region}
                  </Text>
                </View>

                <Text style={styles.cardText}>
                  Velocidad: {registro.velocidad_kmh ?? '--'} km/h
                </Text>

                {registro.nota_tag && (
                  <View style={styles.tagBox}>
                    <Text style={styles.tagText}>{registro.nota_tag}</Text>
                  </View>
                )}
              </View>

              {/* ACTION BUTTONS */}
              {!selectionMode && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/registros/${registro.id}`)}
                  >
                    <Play size={18} color={Colors.dark.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() =>
                      router.push(`/registros/edit/${registro.id}`)
                    }
                  >
                    <Edit3 size={18} color={Colors.dark.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(registro.id)}
                  >
                    <Trash2 size={18} color={Colors.dark.error} />
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

/* ============================================================
      ESTILOS
============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: { ...Typography.h3, color: Colors.dark.text },
  cancelText: { ...Typography.body, color: Colors.dark.primary },

  /* SELECCIÓN */
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    alignItems: 'center',
  },
  selectedCount: { ...Typography.body, color: Colors.dark.text },
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
    color: '#fff',
    fontWeight: '600',
  },

  /* CONTENIDO */
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

  /* CARD */
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
    marginBottom: Spacing.sm,
  },
  cardInfo: { gap: 3 },
  cardDate: {
    ...Typography.body,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTime: { ...Typography.bodySmall, color: Colors.dark.textSecondary },

  /* BADGES */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.dark.background,
  },
  statusPublicado: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  statusText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  statusPublicadoText: {
    color: Colors.dark.secondary,
  },

  /* BODY */
  cardBody: { gap: Spacing.xs, marginTop: 4 },
  cardText: { ...Typography.bodySmall, color: Colors.dark.textSecondary },
  tagBox: {
    backgroundColor: Colors.dark.surfaceVariant,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  tagText: {
    ...Typography.caption,
    color: Colors.dark.primary,
  },

  /* ACTIONS */
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionButton: { padding: Spacing.xs },
});
