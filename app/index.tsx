import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

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
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
        <Image
          source={require('@/assets/images/logo2.webp')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.slogan}>Tu voz, tu seguridad vial</Text>
      </Animated.View>

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
  );
}

/* 🎨 Estilos refinados */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 1.3,
    shadowColor: '#ff7b00',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    elevation: 20,
  },
  logoImage: {
    width: 220,
    height: 140,
    borderRadius: 20,
  },
  slogan: {
    marginTop: 8,
    fontSize: 16,
    color: '#ff7b00',
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 123, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  form: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    padding: Spacing.lg,
    shadowColor: '#ff7b00',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
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
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
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
    backgroundColor: '#ff7b00',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
    shadowColor: '#ff7b00',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 10,
  },
  buttonDisabled: {
    backgroundColor: '#444',
  },
  buttonText: {
    ...Typography.button,
    color: '#fff',
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
    color: '#ff7b00',
  },
});
