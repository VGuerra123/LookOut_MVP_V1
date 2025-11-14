import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import {
  User,
  Car,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function AdministracionScreen() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/");
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: User,
      title: "Perfil de Usuario",
      description: "Editar información personal",
      onPress: () => router.push("/(tabs)/administracion/perfil/index"),
    },
    {
      icon: Car,
      title: "Información del Vehículo",
      description: "Gestionar datos del vehículo",
      onPress: () => router.push("/(tabs)/administracion/vehiculo/index"),
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Preferencias de alertas",
      onPress: () => router.push("/(tabs)/administracion/notificaciones/index"),
    },
    {
      icon: Lock,
      title: "Privacidad y Seguridad",
      description: "Configuración de seguridad",
      onPress: () => router.push("/(tabs)/administracion/seguridad/index"),
    },
    {
      icon: HelpCircle,
      title: "Ayuda y Soporte",
      description: "Centro de asistencia",
      onPress: () => router.push("/(tabs)/administracion/ayuda/index"),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administración</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración de Cuenta</Text>

          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={styles.menuIcon}>
                  <IconComponent size={22} color={Colors.dark.primary} />
                </View>

                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>
                    {item.description}
                  </Text>
                </View>

                <ChevronRight size={18} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sesión</Text>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={Colors.dark.error} />
            <Text style={styles.signOutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>LookOut v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 LookOut Chile</Text>
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
    alignItems: "center",
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
    fontWeight: "700",
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
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    elevation: 2,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.dark.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  menuTitle: {
    ...Typography.body,
    color: Colors.dark.text,
    fontWeight: "700",
  },
  menuDescription: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.dark.error,
  },
  signOutText: {
    ...Typography.button,
    color: Colors.dark.error,
    fontWeight: "700",
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: "center",
    gap: Spacing.xs,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
});
