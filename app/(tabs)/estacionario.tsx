// app/(tabs)/estacionario.tsx
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { HardDrive, MapPin, ChevronRight } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

export default function EstacionarioScreen() {
  const router = useRouter();
  const [newRecordsCount, setNewRecordsCount] = useState(0);
  const [registros, setRegistros] = useState<any[]>([]);

  /* ============================================================
     Cargar registros estacionarios
  ============================================================ */
  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("registros")
      .select("*")
      .eq("user_id", user.id)
      .eq("tipo_modo", "estacionario")
      .order("fecha_hora", { ascending: false });

    setRegistros(data || []);

    const nuevos = data?.filter((item) => item.estado === "pendiente") || [];
    setNewRecordsCount(nuevos.length);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      
      {/* ============================ HEADER ============================ */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Modo Estacionario</Text>

          {newRecordsCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{newRecordsCount} nuevos registros</Text>
            </View>
          )}
        </View>

        <HardDrive size={42} color={Colors.dark.primary} />
      </View>

      {/* ============================ DESCRIPCIÓN ============================ */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descText}>
          Este modo graba mediante comando de voz y continúa en forma indefinida.
        </Text>
        <Text style={styles.descText}>
          Una vez activado el comando, los registros comienzan a guardarse sin recuperación
          de contenido previo.
        </Text>
      </View>

      {/* ============================ MAPA ============================ */}
      <View style={styles.mapCard}>
        <Image
          source={require("@/assets/images/mapa_demo.png")}
          style={styles.map}
          resizeMode="cover"
        />

        <View style={styles.geofencePin}>
          <MapPin size={22} color="#fff" />
        </View>
      </View>

      {/* ============================ REGISTROS ============================ */}
      <Text style={styles.subtitle}>Registros Estacionarios</Text>

      <View style={styles.list}>
        {registros.length === 0 && (
          <Text style={styles.empty}>No hay registros todavía…</Text>
        )}

        {registros.map((reg, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => router.push(`/registros/${reg.id}`)}
          >
            <View style={styles.iconWrap}>
              <HardDrive size={22} color={Colors.dark.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{reg.geo_loc_comuna}</Text>
              <Text style={styles.itemSubtitle}>
                {reg.fecha_hora
                  ? new Date(reg.fecha_hora).toLocaleString("es-CL")
                  : "Sin fecha"}
              </Text>
            </View>

            <ChevronRight size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

/* ============================================================
   ESTILOS
============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    padding: Spacing.lg,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.dark.text,
  },
  badge: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginTop: 6,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.dark.text,
    fontWeight: "600",
  },

  /* DESCRIPCIÓN */
  descriptionCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.xl,
    gap: 6,
  },
  descText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },

  /* MAPA */
  mapCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    height: 200,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  geofencePin: {
    position: "absolute",
    top: "46%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -20 }],
    backgroundColor: Colors.dark.primary,
    padding: 6,
    borderRadius: 20,
  },

  subtitle: {
    ...Typography.h3,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },

  /* LISTADO */
  list: {
    gap: Spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.md,
  },
  iconWrap: {
    backgroundColor: Colors.dark.surfaceVariant,
    padding: 10,
    borderRadius: BorderRadius.md,
  },
  itemTitle: {
    ...Typography.body,
    color: Colors.dark.text,
    fontWeight: "600",
  },
  itemSubtitle: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
    marginTop: 3,
  },

  empty: {
    ...Typography.body,
    textAlign: "center",
    color: Colors.dark.textSecondary,
    marginTop: 20,
  },
});
