// app/registros/[id].tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Play,
  MapPin,
  Clock,
  Gauge,
  MessageSquare,
  Share2,
  Calendar,
  Users,
  FileCheck,
  ChevronRight,
} from "lucide-react-native";

import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";

export default function RegistroDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [registro, setRegistro] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ============================================================
      Cargar registro
  ============================================================ */
  const loadRegistro = async () => {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error) setRegistro(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRegistro();
  }, [id]);

  /* ============================================================
      Estados de carga
  ============================================================ */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loading}>Cargando registro…</Text>
      </View>
    );
  }

  if (!registro) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loading}>Registro no encontrado</Text>
      </View>
    );
  }

  const fechaHora =
    registro.fecha && registro.hora
      ? `${registro.fecha} ${registro.hora}`
      : "Sin fecha";

  return (
    <View style={styles.container}>
      {/* ===================== HEADER ===================== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color={Colors.dark.text} size={24} />
        </TouchableOpacity>

        <Text style={styles.title}>Detalle del Registro</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ===================== MAPA ===================== */}
        <View style={styles.mapCard}>
          <Image
            source={require("@/assets/images/mapa_demo.png")}
            style={styles.map}
            resizeMode="cover"
          />
          <View style={styles.mapPin}>
            <MapPin color="#fff" size={22} />
          </View>
        </View>

        {/* ===================== VIDEO ===================== */}
        <View style={styles.videoCard}>
          <Play size={44} color={Colors.dark.primary} />
          <Text style={styles.videoText}>Reproducir Clip</Text>
          <Text style={styles.videoDuration}>
            {registro.duracion_segundos ?? "—"}s
          </Text>
        </View>

        {/* ===================== INFORMACIÓN GENERAL ===================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>

          <View style={styles.infoCard}>
            {/* FECHA */}
            <InfoRow
              icon={<Clock size={22} color={Colors.dark.textSecondary} />}
              label="Fecha y Hora"
              value={fechaHora}
            />

            {/* UBICACIÓN */}
            <InfoRow
              icon={<MapPin size={22} color={Colors.dark.textSecondary} />}
              label="Ubicación"
              value={`${registro.geo_loc_comuna ?? "—"}, ${
                registro.geo_loc_region ?? "—"
              }`}
            />

            {/* VELOCIDAD */}
            <InfoRow
              icon={<Gauge size={22} color={Colors.dark.textSecondary} />}
              label="Velocidad"
              value={
                registro.velocidad_kmh
                  ? `${registro.velocidad_kmh} km/h`
                  : "—"
              }
            />

            {/* COORDENADAS */}
            <InfoRow
              icon={<MapPin size={22} color={Colors.dark.textSecondary} />}
              label="Coordenadas"
              value={`Lat: ${registro.latitud ?? "—"} | Lng: ${
                registro.longitud ?? "—"
              }`}
            />

            {/* MODO */}
            <InfoRow
              label="Modo"
              value={registro.tipo_modo}
              icon={null}
            />

            {/* ESTADO */}
            <InfoRow
              label="Estado"
              value={registro.estado}
              icon={null}
            />

            {/* CALIFICACIÓN */}
            <InfoRow
              label="Calificación"
              value={registro.calificacion ? `${registro.calificacion} ⭐` : "No evaluado"}
              icon={null}
            />

            {/* NOTA */}
            <InfoRow
              label="Nota / Tag"
              value={registro.nota_tag ?? "—"}
              icon={null}
            />
          </View>
        </View>

        {/* ===================== CLASIFICACIÓN ===================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clasificación</Text>

          <View style={styles.classGrid}>
            <ClassField label="Tipo de Evento" value={registro.tipo_evento} />
            <ClassField label="Gravedad" value={registro.gravedad} />
            <ClassField label="Prioridad" value={registro.prioridad} />
          </View>
        </View>

        {/* ===================== ACCIONES ===================== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>

          <View style={styles.actionGrid}>
            <Action icon={MessageSquare} label="Comunicar" />
            <Action icon={Share2} label="Compartir" />
            <Action icon={Calendar} label="Agendar" />
            <Action icon={Users} label="Designar" />
            <Action icon={FileCheck} label="Comprometer" />
          </View>
        </View>

        {/* ===================== BOTÓN A CLASIFICAR ===================== */}
        <TouchableOpacity
          style={styles.classButton}
          onPress={() => router.push(`/registros/${id}/clasificar`)}
        >
          <Text style={styles.classButtonText}>Clasificar Registro</Text>
          <ChevronRight size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ============================================================
      COMPONENTES REUTILIZABLES
============================================================ */
const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    {icon && <View>{icon}</View>}
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const ClassField = ({ label, value }: any) => (
  <View style={styles.classField}>
    <Text style={styles.classFieldLabel}>{label}</Text>
    <View style={styles.classFieldBox}>
      <Text style={styles.classFieldValue}>{value || "Sin asignar"}</Text>
    </View>
  </View>
);

const Action = ({ icon: Icon, label }: any) => (
  <View style={styles.actionCard}>
    <Icon size={24} color={Colors.dark.primary} />
    <Text style={styles.actionText}>{label}</Text>
  </View>
);

/* ============================================================
      ESTILOS
============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: 60,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: Colors.dark.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.dark.text,
  },

  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  /* MAPA */
  mapCard: {
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  map: { width: "100%", height: "100%" },
  mapPin: {
    position: "absolute",
    top: "46%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -20 }],
    backgroundColor: Colors.dark.primary,
    padding: 6,
    borderRadius: 12,
  },

  /* VIDEO */
  videoCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  videoText: {
    ...Typography.body,
    color: Colors.dark.text,
  },
  videoDuration: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },

  /* SECCIONES */
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.dark.text,
  },

  /* INFO GENERAL */
  infoCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.dark.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.dark.text,
    fontWeight: "600",
  },

  /* CLASIFICACIÓN */
  classGrid: {
    gap: Spacing.md,
  },
  classField: {
    gap: Spacing.xs,
  },
  classFieldLabel: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  classFieldBox: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  classFieldValue: {
    ...Typography.body,
    color: Colors.dark.text,
  },

  /* ACCIONES */
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionCard: {
    width: "30%",
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  actionText: {
    ...Typography.caption,
    color: Colors.dark.text,
    textAlign: "center",
  },

  /* BOTÓN CLASIFICAR */
  classButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  classButtonText: {
    ...Typography.button,
    color: "#fff",
  },
});
