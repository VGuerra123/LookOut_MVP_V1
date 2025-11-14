// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Animated, Pressable, View } from "react-native";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

/* 🎨 PALETA LOOKOUT ELITE PRO */
const BG = "rgba(10,19,34,0.55)"; // navy + glass
const ACTIVE = "#2A82F0";         // azul lookout
const INACTIVE = "#CFE5FF";       // hielo
const OUTLINE = "rgba(255,255,255,0.15)";
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
          fontSize: 11.5,
          fontWeight: "600",
          marginTop: 1,
        },

        /* 💠 GLASSMORPHISM ULTRA OPTIMIZADO */
        tabBarStyle: {
          position: "absolute",
          backgroundColor: BG,
          height: tabHeight,
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 10,
          borderTopWidth: 0,
          borderRadius: 24,
          marginHorizontal: 14,
          marginBottom: 14,
          overflow: "hidden",

          borderWidth: 1,
          borderColor: OUTLINE,

          shadowColor: "#000",
          shadowOpacity: 0.32,
          shadowRadius: 24,
          elevation: 20,
        },

        tabBarButton: (props) => <EliteTabButton {...props} />,
      }}
    >

      {/* 🏠 Inicio */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />

      {/* 📱 Móvil */}
      <Tabs.Screen
        name="mobile"
        options={{
          title: "Móvil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "phone-portrait" : "phone-portrait-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 🖥️ Estacionario */}
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

      {/* 📊 Informes */}
      <Tabs.Screen
        name="informes"
        options={{
          title: "Informes",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "bar-chart" : "bar-chart-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />

      {/* ⚙️ Config */}
      <Tabs.Screen
        name="administracion"
        options={{
          title: "Config",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

/* ============================================================
   ⭐ ELITE TAB BUTTON v4.0 — MOBILE CRITICAL EDITION
============================================================ */
function EliteTabButton({
  children,
  accessibilityState,
  onPress,
}: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected ?? false;

  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.14 : 1,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: focused ? 1 : 0,
        duration: 240,
        useNativeDriver: false,
      }),
      Animated.spring(lift, {
        toValue: focused ? -4 : 0,
        friction: 7,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 2,
      }}
      android_ripple={{ color: "rgba(255,255,255,0.06)" }}
    >
      <Animated.View
        style={[
          {
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 16,

            transform: [{ scale }, { translateY: lift }],

            /* Fondo focus */
            backgroundColor: focused
              ? "rgba(42,130,240,0.18)"
              : "rgba(255,255,255,0.03)",

            borderWidth: focused ? 1 : 0,
            borderColor: "rgba(255,255,255,0.22)",

            /* Glow pro */
            shadowColor: GLOW,
            shadowOpacity: glow.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.9],
            }),
            shadowRadius: glow.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 14],
            }),
            shadowOffset: { width: 0, height: 0 },

            /* 🔥 CENTRADO PERFECTO */
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: 2,
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
