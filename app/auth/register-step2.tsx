import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function RegisterStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    nombreCompleto: string;
    rut: string;
    telefono: string;
    patenteVehiculo: string;
  }>();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  const handleContinue = () => {
    if (!isCodeComplete) return;

    router.push({
      pathname: '/auth/register-step3',
      params: {
        ...params,
        verificationCode: code.join(''),
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color={Colors.dark.text} size={24} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro - Paso 2 de 3</Text>
          <Text style={styles.subtitle}>Verificación de Código</Text>
          <Text style={styles.description}>
            Ingresa el código de 6 dígitos enviado a{'\n'}
            <Text style={styles.email}>{params.email}</Text>
          </Text>
        </View>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !isCodeComplete && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!isCodeComplete}
        >
          <Text style={styles.buttonText}>Verificar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendText}>Reenviar código</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
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
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  email: {
    color: Colors.dark.primary,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    textAlign: 'center',
    ...Typography.h2,
    color: Colors.dark.text,
  },
  codeInputFilled: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.surfaceVariant,
  },
  button: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.dark.disabled,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.dark.text,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  resendText: {
    ...Typography.body,
    color: Colors.dark.primary,
  },
});
