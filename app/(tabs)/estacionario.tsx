import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { HardDrive } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function EstacionarioScreen() {
  const [newRecordsCount, setNewRecordsCount] = useState(0);

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
      .eq('tipo_modo', 'estacionario')
      .eq('estado', 'pendiente');

    setNewRecordsCount(data?.length || 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Modo Estacionario</Text>
          {newRecordsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{newRecordsCount} nuevos registros</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
          <HardDrive color={Colors.dark.textSecondary} size={64} />
          <Text style={styles.emptyTitle}>Modo Estacionario</Text>
          <Text style={styles.emptyDescription}>
            Este modo permite grabación continua activada por comando de voz,{'\n'}
            sin límite de duración predefinido.
          </Text>
          <Text style={styles.emptyDescription}>
            Los registros comienzan a guardarse desde que se confirma el comando de voz.{'\n'}
            No se puede recuperar contenido anterior al comando.
          </Text>
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
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
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
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
    maxWidth: 320,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
