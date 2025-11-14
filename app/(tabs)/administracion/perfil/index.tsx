import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Edit3, Mail, Phone, Building2 } from "lucide-react-native";

export default function PerfilScreen() {
  const router = useRouter();
  const [perfil, setPerfil] = useState<any>(null);

  useEffect(() => {
    loadPerfil();
  }, []);

  const loadPerfil = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("usuarios_perfil")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setPerfil({
      ...data,
      email: user.email,
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil de Usuario</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* AVATAR */}
        <View style={styles.avatarBox}>
          <Image
            source={
              perfil?.avatar
                ? { uri: perfil.avatar }
                : require("@/assets/images/icon.png")
            }
            style={styles.avatar}
          />
          <Text style={styles.nameText}>
            {perfil?.nombre || "Sin nombre definido"}
          </Text>
        </View>

        {/* DATOS */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Mail size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.value}>{perfil?.email || "—"}</Text>
          </View>

          <View style={styles.row}>
            <Phone size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.value}>{perfil?.telefono || "—"}</Text>
          </View>

          <View style={styles.row}>
            <Building2 size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.value}>{perfil?.empresa || "—"}</Text>
          </View>
        </View>

        {/* BOTÓN EDITAR */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push("/(tabs)/administracion/perfil/edit")}
        >
          <Edit3 size={20} color="#fff" />
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
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
    borderColor: Colors.dark.border,
    alignItems: "center",
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
    fontWeight: "700",
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  avatarBox: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
  },
  nameText: {
    ...Typography.h3,
    color: Colors.dark.text,
    fontWeight: "700",
  },

  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  value: {
    ...Typography.body,
    color: Colors.dark.text,
  },

  editButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  editButtonText: {
    ...Typography.button,
    color: "#fff",
  },
});
