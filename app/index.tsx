import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Animaciones suaves (sin glow/sombras naranjas)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleContinue = () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname:
          email.toLowerCase() === "admin@lookout.com"
            ? "/auth/password"
            : "/auth/register-step1",
        params: { email },
      });
    }, 400);
  };

  const emailValid = !!email.trim() && /^\S+@\S+\.\S+$/.test(email.trim());

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.avoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Fondo minimal */}
          <View style={styles.bg} />

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.slogan}>Tu voz, tu seguridad vial</Text>
          </Animated.View>

          {/* Card / Form */}
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            <Text style={styles.label}>Correo electrónico</Text>

            <View
              style={[
                styles.inputWrap,
                !emailValid && email.length > 0 ? styles.inputError : null,
              ]}
            >
              <Mail color="#C8CDD2" size={20} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#8A8F98"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            {!emailValid && email.length > 0 && (
              <Text style={styles.errorText}>Ingresa un correo válido.</Text>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.button,
                (!emailValid || loading) && styles.buttonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!emailValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#0B0B0B" />
              ) : (
                <Text style={styles.buttonText}>Continuar</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.hint}>
              Usa <Text style={styles.hintStrong}>admin@lookout.com</Text> para
              acceso directo
            </Text>
          </Animated.View>

          {/* Empujar footer al fondo */}
          <View style={{ flexGrow: 1 }} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2025 <Text style={styles.footerBrand}>LookOut</Text>. Todos los
              derechos reservados.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===================== Estilos ===================== */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0B0B",
  },
  avoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: "100%",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16, // espacio al bottom pero sin “flotar”
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0B0B0B",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: Math.min(width * 0.68, 280),
    height: 120,
  },
  slogan: {
    marginTop: 12,
    fontSize: 16,
    color: "#C8CDD2",
    fontWeight: "600",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#22262B",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E7E9EC",
    marginBottom: 10,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111315",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#22262B",
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#E7E9EC",
    paddingVertical: 10,
  },
  inputError: {
    borderColor: "#6C2A2A",
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#F3A6A6",
  },
  button: {
    backgroundColor: "#F0A259", // acento sobrio
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#2A2F35",
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0B0B0B",
    letterSpacing: 0.4,
  },
  hint: {
    textAlign: "center",
    color: "#A9B0B8",
    fontSize: 12.5,
    marginTop: 14,
  },
  hintStrong: {
    color: "#E7E9EC",
    fontWeight: "700",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: 20,
  },
  footerText: {
    color: "#8A8F98",
    fontSize: 12.5,
    textAlign: "center",
  },
  footerBrand: {
    color: "#C8CDD2",
    fontWeight: "700",
  },
});
