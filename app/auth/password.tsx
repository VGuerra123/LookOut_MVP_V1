import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Lock, ArrowLeft } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function PasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuth();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!password.trim()) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert("Error", "Credenciales inválidas. Intenta nuevamente.");
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Botón volver */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft color={Colors.dark.text} size={24} />
          </TouchableOpacity>

          {/* Header con logo */}
          <View style={styles.header}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.slogan}>Tu voz, tu seguridad vial</Text>
          </View>

          {/* Tarjeta / Formulario */}
          <View style={styles.card}>
            <View style={{ alignItems: "center", marginBottom: Spacing.md }}>
              <Text style={styles.title}>Ingresar Contraseña</Text>
              {!!email && <Text style={styles.subtitle}>{email}</Text>}
            </View>

            <View style={{ gap: Spacing.sm }}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <Lock color={Colors.dark.textSecondary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Ingresa tu contraseña"
                  placeholderTextColor={Colors.dark.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  returnKeyType="done"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.button, !password.trim() && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={!password.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.dark.text} />
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer abajo */}
          <View style={{ flexGrow: 1 }} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 <Text style={styles.footerBrand}>LookOut</Text>. Todos los derechos
              reservados.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.dark.background, // #0B0B0B en tu theme
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  backButton: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: Math.min(width * 0.68, 280),
    height: 120,
  },
  slogan: {
    marginTop: Spacing.xs,
    ...Typography.caption,
    color: Colors.dark.textSecondary, // sobrio
  },
  card: {
    width: "100%",
    backgroundColor: Colors.dark.surface, // p.ej. #111315
    borderRadius: BorderRadius.lg ?? BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.dark.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.primary,
    marginTop: Spacing.xs,
  },
  label: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface, // consistente
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    height: 48,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.dark.text,
    paddingVertical: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.dark.disabled,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: Spacing.lg,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  footerBrand: {
    color: "#C8CDD2",
    fontWeight: "700",
  },
});
