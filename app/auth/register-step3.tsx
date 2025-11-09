import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Lock, ArrowLeft, CheckSquare, Square } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterStep3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    nombreCompleto: string;
    rut: string;
    telefono: string;
    patenteVehiculo: string;
    verificationCode: string;
  }>();

  const { signUp } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [licenseAccepted, setLicenseAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password && password === confirmPassword;
  const isFormValid = passwordsMatch && termsAccepted && licenseAccepted;

  const handleRegister = async () => {
    if (!isFormValid) return;

    setLoading(true);

    const { error } = await signUp(params.email, password, {
      nombre_completo: params.nombreCompleto,
      rut: params.rut,
      telefono: params.telefono,
      patente_vehiculo: params.patenteVehiculo,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'No se pudo completar el registro. Intenta nuevamente.');
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color={Colors.dark.text} size={24} />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro - Paso 3 de 3</Text>
          <Text style={styles.subtitle}>Contraseña y Licencia</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Lock color={Colors.dark.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={Colors.dark.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <View style={[
              styles.inputContainer,
              confirmPassword && !passwordsMatch && styles.inputError,
            ]}>
              <Lock color={Colors.dark.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                placeholderTextColor={Colors.dark.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
            {confirmPassword && !passwordsMatch && (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            )}
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              {termsAccepted ? (
                <CheckSquare color={Colors.dark.primary} size={24} />
              ) : (
                <Square color={Colors.dark.textSecondary} size={24} />
              )}
              <Text style={styles.checkboxText}>
                Acepto los{' '}
                <Text style={styles.link}>Términos y Condiciones</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setLicenseAccepted(!licenseAccepted)}
            >
              {licenseAccepted ? (
                <CheckSquare color={Colors.dark.primary} size={24} />
              ) : (
                <Square color={Colors.dark.textSecondary} size={24} />
              )}
              <Text style={styles.checkboxText}>
                Acepto la{' '}
                <Text style={styles.link}>Licencia de Uso</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, !isFormValid && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.dark.text} />
            ) : (
              <Text style={styles.buttonText}>Completar Registro</Text>
            )}
          </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: Spacing.lg,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },
  form: {
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  label: {
    ...Typography.body,
    color: Colors.dark.text,
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
  inputError: {
    borderColor: Colors.dark.error,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.dark.text,
    paddingVertical: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.dark.error,
    marginTop: Spacing.xs,
  },
  checkboxContainer: {
    marginTop: Spacing.xs,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkboxText: {
    ...Typography.bodySmall,
    color: Colors.dark.text,
    flex: 1,
  },
  link: {
    color: Colors.dark.primary,
    textDecorationLine: 'underline',
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
});
