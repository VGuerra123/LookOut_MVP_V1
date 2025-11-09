// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext'; // ✅ importa tu contexto

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Evita solaparse con la barra de navegación del sistema
      NavigationBar.setBehaviorAsync('inset-swipe').catch(() => {});
      NavigationBar.setBackgroundColorAsync('#0a1b2e').catch(() => {});
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* ✅ ahora todo el árbol de rutas tiene acceso a useAuth */}
        <Slot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
