import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!email.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (email.toLowerCase() === 'admin@lookout.com') {
        router.push({
          pathname: '/auth/password',
          params: { email },
        });
      } else {
        router.push({
          pathname: '/auth/register-step1',
          params: { email },
        });
      }
    }, 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>LookOut</Text>
          <Text style={styles.subtitle}>Sistema de Grabación y Vigilancia</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Correo Electrónico</Text>
          <View style={styles.inputContainer}>
            <Mail color={Colors.dark.textSecondary} size={20} />
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={Colors.dark.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, !email.trim() && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!email.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.dark.text} />
            ) : (
              <Text style={styles.buttonText}>Continuar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.hint}>
            <Text style={styles.hintText}>
              Usa <Text style={styles.hintEmail}>admin@lookout.com</Text> para acceso directo
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    ...Typography.h1,
    color: Colors.dark.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
  label: {
    ...Typography.body,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.dark.text,
    paddingVertical: Spacing.md,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.dark.disabled,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
  hint: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  hintText: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  hintEmail: {
    color: Colors.dark.primary,
  },
});
