import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react-native";

export default function EditPerfilScreen() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<any>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [empresa, setEmpresa] = useState("");

  /* ============================================================
        CARGAR PERFIL
  ============================================================ */
  const loadPerfil = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      console.warn("Usuario no encontrado");
      return;
    }

    const userId = data.user.id;

    const { data: perfilData } = await supabase
      .from("usuarios_perfil")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    setPerfil(perfilData);
    setNombre(perfilData?.nombre || "");
    setTelefono(perfilData?.telefono || "");
    setEmpresa(perfilData?.empresa || "");
  };

  useEffect(() => {
    loadPerfil();
  }, []);

  /* ============================================================
        GUARDAR PERFIL
  ============================================================ */
  const savePerfil = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      Alert.alert("Error", "No se pudo validar la sesión");
      return;
    }

    const userId = data.user.id;

    const { error: updateError } = await supabase
      .from("usuarios_perfil")
      .update({
        nombre,
        telefono,
        empresa,
      })
      .eq("user_id", userId);

    if (!updateError) {
      Alert.alert("Éxito", "Perfil actualizado correctamente");
      router.back();
    } else {
      Alert.alert("Error", "No se pudo actualizar la información");
      console.log(updateError);
    }
  };

  /* ============================================================
        UI
  ============================================================ */
  return (
    <View style={styles.container}>
      {/* -------- HEADER -------- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Perfil</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* -------- CONTENT -------- */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Nombre */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>

        {/* Teléfono */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Ej: +56 9 1234 5678"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>

        {/* Empresa */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Empresa / Organización</Text>
          <TextInput
            style={styles.input}
            value={empresa}
            onChangeText={setEmpresa}
            placeholder="Nombre de empresa"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>

        {/* -------- BOTÓN GUARDAR -------- */}
        <TouchableOpacity style={styles.saveButton} onPress={savePerfil}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ============================================================
      ESTILOS 
============================================================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: 60,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Colors.dark.border,
  },

  title: {
    ...Typography.h3,
    color: Colors.dark.text,
    fontWeight: "700",
  },

  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  /* Inputs */
  inputBox: { gap: Spacing.xs },
  label: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    color: Colors.dark.text,
  },

  /* Botón */
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    backgroundColor: Colors.dark.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  saveText: {
    ...Typography.button,
    color: "#fff",
  },
});
