// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Animated, Pressable } from "react-native";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

/* PALETA LOOKOUT */
const BG = "rgba(10,22,40,0.72)";
const INACTIVE = "#CFE5FF";
const ACTIVE = "#2A82F0";
const GLOW = "rgba(42,130,240,0.55)";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabHeight = 60 + Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },

        // 🔥 Barra estilo glass PRO
        tabBarStyle: {
          position: "absolute",
          backgroundColor: BG,
          height: tabHeight,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
          borderTopWidth: 0,
          borderRadius: 22,
          marginHorizontal: 10,
          marginBottom: 10,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 18,
          elevation: 12,
        },

        tabBarButton: (props) => <UltraAnimatedButton {...props} />,
      }}
    >

      {/* 🏠 HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 📱 MÓVIL */}
      <Tabs.Screen
        name="mobile"
        options={{
          title: "Móvil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "phone-portrait" : "phone-portrait-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 🖥️ ESTACIONARIO */}
      <Tabs.Screen
        name="estacionario"
        options={{
          title: "Estacionario",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "desktop" : "desktop-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* ⚙️ ADMIN */}
      <Tabs.Screen
        name="administracion"
        options={{
          title: "Admin",
          href: "/(tabs)/administracion", // 🔥 Importantísimo
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 📊 INFORMES */}
      <Tabs.Screen
        name="informes"
        options={{
          title: "Informes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
}

/* ============================================================
   ULTRA ANIMATED BUTTON 
============================================================ */
function UltraAnimatedButton({
  children,
  accessibilityState,
  onPress,
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;

  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.22 : 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: focused ? 1 : 0,
        duration: 260,
        useNativeDriver: false,
      }),
    ]).start();
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View
        style={[
          {
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 14,
            backgroundColor: focused
              ? "rgba(42,130,240,0.20)"
              : "rgba(255,255,255,0.05)",
            transform: [{ scale }],
            borderWidth: focused ? 1 : 0,
            borderColor: focused ? "rgba(255,255,255,0.22)" : "transparent",
            shadowColor: GLOW,
            shadowOpacity: focused ? 0.85 : 0,
            shadowRadius: focused ? 18 : 0,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
