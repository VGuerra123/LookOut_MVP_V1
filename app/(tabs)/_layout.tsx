// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

// ajusta colores si usas un tema centralizado
const bg = '#0b1b2e';
const text = '#cfe5ff';
const active = '#235DE6';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Altura mínima del tab bar + el inset inferior real (en Android varía por gestos/3 botones)
  const baseHeight = 56;
  const tabBarPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = baseHeight + tabBarPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: text,
        tabBarStyle: {
          backgroundColor: bg,
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: tabBarPadding,
          paddingTop: 8,
        },
        sceneStyle: {
          // evita que el contenido quede tapado por la tab bar
          paddingBottom: tabBarHeight,
        },
      }}
    >
      <Tabs.Screen name="mobile" options={{ title: 'Móvil' }} />
      <Tabs.Screen name="estacionario" options={{ title: 'Estacionario' }} />
      <Tabs.Screen name="administracion" options={{ title: 'Administración' }} />
      <Tabs.Screen name="informes" options={{ title: 'Informes' }} />
      {/* Si tienes la ruta "index.tsx" como móvil, ajusta los nombres arriba */}
    </Tabs>
  );
}
