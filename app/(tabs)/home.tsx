import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Smartphone, HardDrive, Settings, BarChart3 } from "lucide-react-native";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Novedades</Text>

      {/* Bloque principal */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={() => router.push("/(tabs)/mobile")}>
          <Smartphone size={28} color={Colors.dark.primary} />
          <View>
            <Text style={styles.label}>Móvil</Text>
            <Text style={styles.value}>3 nuevos registros</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/(tabs)/estacionario")}
        >
          <HardDrive size={28} color={Colors.dark.primary} />
          <View>
            <Text style={styles.label}>Estacionario</Text>
            <Text style={styles.value}>2 nuevos registros</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Menú secundario */}
      <Text style={[styles.title, { marginTop: 40 }]}>Menú</Text>

      <View style={styles.menuGroup}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(tabs)/administracion")}
        >
          <Settings size={26} color={Colors.dark.text} />
          <Text style={styles.menuText}>Administración</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(tabs)/informes")}
        >
          <BarChart3 size={26} color={Colors.dark.text} />
          <Text style={styles.menuText}>Informes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.dark.background,
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  label: {
    ...Typography.body,
    color: Colors.dark.text,
    fontSize: 15,
  },
  value: {
    ...Typography.caption,
    color: Colors.dark.primary,
    fontWeight: "700",
    marginTop: 2,
  },
  menuGroup: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.md,
  },
  menuText: {
    ...Typography.body,
    color: Colors.dark.text,
    fontSize: 17,
    fontWeight: "600",
  },
});
