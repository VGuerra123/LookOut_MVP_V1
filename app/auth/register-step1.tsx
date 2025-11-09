import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { User, Phone, IdCard, Car, ArrowLeft } from 'lucide-react-native';

export default function RegisterStep1Screen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [rut, setRut] = useState('');
  const [telefono, setTelefono] = useState('');
  const [patenteVehiculo, setPatenteVehiculo] = useState('');

  const isFormValid = nombreCompleto.trim() && rut.trim() && telefono.trim() && patenteVehiculo.trim();

  const handleContinue = () => {
    if (!isFormValid) return;

    router.push({
      pathname: '/auth/register-step2',
      params: {
        email,
        nombreCompleto,
        rut,
        telefono,
        patenteVehiculo,
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft color={Colors.dark.text} size={24} />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro - Paso 1 de 3</Text>
          <Text style={styles.subtitle}>Datos Básicos</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre Completo</Text>
            <View style={styles.inputContainer}>
              <User color={Colors.dark.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez González"
                placeholderTextColor={Colors.dark.textSecondary}
                value={nombreCompleto}
                onChangeText={setNombreCompleto}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>RUT</Text>
            <View style={styles.inputContainer}>
              <IdCard color={Colors.dark.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="12.345.678-9"
                placeholderTextColor={Colors.dark.textSecondary}
                value={rut}
                onChangeText={setRut}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <Phone color={Colors.dark.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="+56 9 1234 5678"
                placeholderTextColor={Colors.dark.textSecondary}
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Patente Vehículo</Text>
            <View style={styles.inputContainer}>
              <Car color={Colors.dark.textSecondary} size={20} />
              <TextInput
                style={styles.input}
                placeholder="BBBB-12 o BB-CC-12"
                placeholderTextColor={Colors.dark.textSecondary}
                value={patenteVehiculo}
                onChangeText={(text) => setPatenteVehiculo(text.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, !isFormValid && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <Text style={styles.buttonText}>Siguiente</Text>
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
    marginBottom: Spacing.sm,
  },
  email: {
    ...Typography.bodySmall,
    color: Colors.dark.primary,
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
});
