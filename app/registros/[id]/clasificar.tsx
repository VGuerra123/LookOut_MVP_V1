import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import {
  ArrowLeft,
  ChevronDown,
  Save,
  Info,
  Check,
} from "lucide-react-native";

export default function ClasificarRegistroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [registro, setRegistro] = useState<any>(null);

  // CAMPOS EDITABLES
  const [tipoEvento, setTipoEvento] = useState("");
  const [gravedad, setGravedad] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [nota, setNota] = useState("");
  const [estado, setEstado] = useState("pendiente");

  const [openSelect, setOpenSelect] = useState<string | null>(null);

  /* ============================================================
      Cargar registro
  ============================================================ */
  useEffect(() => {
    loadRegistro();
  }, []);

  const loadRegistro = async () => {
    const { data, error } = await supabase
      .from("registros")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (data && !error) {
      setRegistro(data);
      setTipoEvento(data.tipo_evento || "");
      setGravedad(data.gravedad || "");
      setPrioridad(data.prioridad || "");
      setNota(data.nota_tag || "");
      setEstado(data.estado || "pendiente");
    }
    setLoading(false);
  };

  /* ============================================================
      Guardar cambios en Supabase
  ============================================================ */
  const handleSave = async () => {
    const { error } = await supabase
      .from("registros")
      .update({
        tipo_evento: tipoEvento,
        gravedad,
        prioridad,
        nota_tag: nota,
        estado,
      })
      .eq("id", id);

    if (!error) {
      Alert.alert("Éxito", "Registro actualizado correctamente");
      router.back();
    } else {
      Alert.alert("Error", "No se pudieron guardar los cambios");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando…</Text>
      </View>
    );
  }

  /* ============================================================
      SELECTORS REUTILIZABLES
  ============================================================ */
  const Selector = ({ label, value, onPress }: any) => (
    <TouchableOpacity style={styles.selector} onPress={onPress}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorValueBox}>
        <Text style={styles.selectorValue}>{value || "Seleccionar…"}</Text>
        <ChevronDown size={20} color={Colors.dark.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const OptionList = ({ options, onSelect }: any) => (
    <View style={styles.optionsBox}>
      {options.map((op: string) => (
        <TouchableOpacity
          key={op}
          style={styles.optionItem}
          onPress={() => {
            onSelect(op);
            setOpenSelect(null);
          }}
        >
          <Text style={styles.optionText}>{op}</Text>
          <Check size={20} color={Colors.dark.primary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  /* ============================================================
      RENDER
  ============================================================ */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Clasificar Registro</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Info size={22} color={Colors.dark.primary} />
          <Text style={styles.infoText}>
            Clasifica este registro para continuar el flujo de revisión,
            seguimiento y acciones posteriores.
          </Text>
        </View>

        {/* SELECTOR: Tipo de Evento */}
        <Selector
          label="Tipo de Evento"
          value={tipoEvento}
          onPress={() => setOpenSelect("tipo")}
        />
        {openSelect === "tipo" && (
          <OptionList
            options={[
              "Conducción peligrosa",
              "Incidente vial",
              "Disputa con terceros",
              "Falla mecánica",
              "Otro",
            ]}
            onSelect={setTipoEvento}
          />
        )}

        {/* SELECTOR: Gravedad */}
        <Selector
          label="Gravedad"
          value={gravedad}
          onPress={() => setOpenSelect("gravedad")}
        />
        {openSelect === "gravedad" && (
          <OptionList
            options={["Leve", "Moderada", "Grave"]}
            onSelect={setGravedad}
          />
        )}

        {/* SELECTOR: Prioridad */}
        <Selector
          label="Prioridad"
          value={prioridad}
          onPress={() => setOpenSelect("prioridad")}
        />
        {openSelect === "prioridad" && (
          <OptionList
            options={["Alta", "Media", "Baja"]}
            onSelect={setPrioridad}
          />
        )}

        {/* SELECTOR: Estado */}
        <Selector
          label="Estado"
          value={estado === "publicado" ? "Publicado" : "Pendiente"}
          onPress={() => setOpenSelect("estado")}
        />
        {openSelect === "estado" && (
          <OptionList
            options={["pendiente", "publicado"]}
            onSelect={setEstado}
          />
        )}

        {/* NOTA / TAG */}
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Nota / Tag</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Conductor no respetó señal..."
            placeholderTextColor={Colors.dark.textSecondary}
            value={nota}
            onChangeText={setNota}
            multiline
          />
        </View>

        {/* BOTÓN GUARDAR */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={22} color="#fff" />
          <Text style={styles.saveText}>Guardar Clasificación</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ============================================================
      ESTILOS
============================================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    alignItems: "center",
  },
  title: {
    ...Typography.h3,
    color: Colors.dark.text,
  },

  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...Typography.body,
    color: Colors.dark.textSecondary,
  },

  infoCard: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoText: {
    ...Typography.body,
    color: Colors.dark.text,
    flex: 1,
  },

  selector: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.xs,
  },
  selectorLabel: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  selectorValueBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectorValue: {
    ...Typography.body,
    color: Colors.dark.text,
  },

  optionsBox: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  optionText: {
    ...Typography.body,
    color: Colors.dark.text,
  },

  inputBox: {
    gap: Spacing.xs,
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.dark.textSecondary,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minHeight: 90,
    textAlignVertical: "top",
    color: Colors.dark.text,
  },

  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: Colors.dark.primary,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    alignItems: "center",
    marginBottom: 40,
  },
  saveText: {
    ...Typography.button,
    color: "#fff",
  },
});
