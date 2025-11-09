import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { TrendingUp, CheckCircle, AlertTriangle, Clock } from 'lucide-react-native';

export default function InformesScreen() {
  const statsData = [
    {
      icon: TrendingUp,
      label: 'Total Registros',
      value: '47',
      change: '+12%',
      color: Colors.dark.primary,
    },
    {
      icon: CheckCircle,
      label: 'Publicados',
      value: '32',
      change: '+8%',
      color: Colors.dark.secondary,
    },
    {
      icon: AlertTriangle,
      label: 'Pendientes',
      value: '15',
      change: '-5%',
      color: '#FFA000',
    },
    {
      icon: Clock,
      label: 'Esta Semana',
      value: '8',
      change: '+2',
      color: '#2196F3',
    },
  ];

  const taskData = [
    { title: 'Revisar incidentes pendientes', status: 'pending', priority: 'high' },
    { title: 'Publicar registros validados', status: 'in_progress', priority: 'medium' },
    { title: 'Actualizar datos de vehículo', status: 'pending', priority: 'low' },
    { title: 'Compartir reporte mensual', status: 'completed', priority: 'medium' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard e Informes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <IconComponent color={stat.color} size={24} />
                  </View>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={[styles.statChange, { color: stat.color }]}>
                    {stat.change}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tareas Pendientes</Text>
          {taskData.map((task, index) => (
            <View key={index} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View
                  style={[
                    styles.taskStatus,
                    task.status === 'completed' && styles.taskStatusCompleted,
                    task.status === 'in_progress' && styles.taskStatusInProgress,
                  ]}
                />
                <Text style={styles.taskTitle}>{task.title}</Text>
              </View>
              <View style={styles.taskFooter}>
                <View
                  style={[
                    styles.priorityBadge,
                    task.priority === 'high' && styles.priorityHigh,
                    task.priority === 'medium' && styles.priorityMedium,
                    task.priority === 'low' && styles.priorityLow,
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {task.priority === 'high' && 'Alta'}
                    {task.priority === 'medium' && 'Media'}
                    {task.priority === 'low' && 'Baja'}
                  </Text>
                </View>
                <Text style={styles.taskStatusText}>
                  {task.status === 'completed' && 'Completada'}
                  {task.status === 'in_progress' && 'En Progreso'}
                  {task.status === 'pending' && 'Pendiente'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución por Comuna</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationItem}>
              <Text style={styles.locationName}>Santiago Centro</Text>
              <View style={styles.locationBar}>
                <View style={[styles.locationBarFill, { width: '70%' }]} />
              </View>
              <Text style={styles.locationCount}>14 registros</Text>
            </View>
            <View style={styles.locationItem}>
              <Text style={styles.locationName}>Providencia</Text>
              <View style={styles.locationBar}>
                <View style={[styles.locationBarFill, { width: '50%' }]} />
              </View>
              <Text style={styles.locationCount}>10 registros</Text>
            </View>
            <View style={styles.locationItem}>
              <Text style={styles.locationName}>Las Condes</Text>
              <View style={styles.locationBar}>
                <View style={[styles.locationBarFill, { width: '40%' }]} />
              </View>
              <Text style={styles.locationCount}>8 registros</Text>
            </View>
            <View style={styles.locationItem}>
              <Text style={styles.locationName}>Otras Comunas</Text>
              <View style={styles.locationBar}>
                <View style={[styles.locationBarFill, { width: '30%' }]} />
              </View>
              <Text style={styles.locationCount}>15 registros</Text>
            </View>
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
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.dark.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  statValue: {
    ...Typography.h2,
    color: Colors.dark.text,
  },
  statChange: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  taskStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.textSecondary,
  },
  taskStatusCompleted: {
    backgroundColor: Colors.dark.secondary,
  },
  taskStatusInProgress: {
    backgroundColor: Colors.dark.primary,
  },
  taskTitle: {
    ...Typography.body,
    color: Colors.dark.text,
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  priorityBadge: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  priorityHigh: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  priorityMedium: {
    backgroundColor: 'rgba(255, 160, 0, 0.2)',
  },
  priorityLow: {
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
  },
  priorityText: {
    ...Typography.caption,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  taskStatusText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  locationCard: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  locationItem: {
    gap: Spacing.xs,
  },
  locationName: {
    ...Typography.bodySmall,
    color: Colors.dark.text,
  },
  locationBar: {
    height: 8,
    backgroundColor: Colors.dark.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  locationBarFill: {
    height: '100%',
    backgroundColor: Colors.dark.primary,
  },
  locationCount: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
});
