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

  /** ⚠️ RUTAS CORRECTAS PARA typedRoutes */
  const menuItems = [
    {
      icon: User,
      title: "Perfil de Usuario",
      description: "Editar información personal",
      onPress: () => router.push("/(tabs)/administracion/perfil"),
    },
    {
      icon: Car,
      title: "Información del Vehículo",
      description: "Gestionar datos del vehículo",
      onPress: () => router.push("/(tabs)/administracion/vehiculo"),
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Preferencias de alertas",
      onPress: () => router.push("/(tabs)/administracion/notificaciones"),
    },
    {
      icon: Lock,
      title: "Privacidad y Seguridad",
      description: "Configuración de seguridad",
      onPress: () => router.push("/(tabs)/administracion/seguridad"),
    },
    {
      icon: HelpCircle,
      title: "Ayuda y Soporte",
      description: "Centro de asistencia",
      onPress: () => router.push("/(tabs)/administracion/ayuda"),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Administración</Text>

        <View style={styles.section}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                style={styles.item}
              >
                <View style={styles.iconBox}>
                  <Icon size={22} color={Colors.dark.primary} />
                </View>

                <View style={styles.textBox}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                </View>

                <ChevronRight size={18} color={Colors.dark.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logout} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.dark.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: Spacing.lg },
  header: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: 20,
    marginTop: 60,
    textAlign: "center",
  },
  section: { gap: Spacing.md },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.dark.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  textBox: { flex: 1, paddingLeft: Spacing.md },
  title: { color: Colors.dark.text, fontWeight: "700" },
  desc: { color: Colors.dark.textSecondary, fontSize: 12 },
  logout: {
    marginTop: 40,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.dark.surface,
    borderWidth: 1.2,
    borderColor: Colors.dark.error,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoutText: { color: Colors.dark.error, fontWeight: "600" },
});
