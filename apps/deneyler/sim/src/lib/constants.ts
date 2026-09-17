import type {
  ConceptNote,
  EnvironmentPreset,
  PresetId,
  TemperatureRange,
} from "../types/simulation";

export const TEMPERATURE_RANGE: TemperatureRange = {
  min: 0,
  max: 100,
  step: 1,
};

export const ROOM_TEMPERATURE = 25;

export const ENVIRONMENT_PRESETS: readonly EnvironmentPreset[] = [
  {
    id: "room",
    label: "Oda sıcaklığı",
    hint: "25 °C, tam ortası",
    emoji: "🏠",
    targetTemperature: ROOM_TEMPERATURE,
  },
  {
    id: "hot",
    label: "Sıcak su",
    hint: "Su genleşir, yukarı çıkar",
    emoji: "🔥",
    targetTemperature: 85,
  },
  {
    id: "ice",
    label: "Buzlu su",
    hint: "Su büzülür, aşağı iner",
    emoji: "🧊",
    targetTemperature: 0,
  },
] as const;

export const PRESET_BY_ID: Readonly<Record<PresetId, EnvironmentPreset>> =
  Object.fromEntries(
    ENVIRONMENT_PRESETS.map((preset) => [preset.id, preset]),
  ) as Record<PresetId, EnvironmentPreset>;

/** Sütun hareket ederken gösterilen açıklamalar. */
export const CONCEPT_NOTES: Readonly<Record<"heating" | "cooling", ConceptNote>> = {
  heating: {
    title: "Genleşme",
    emoji: "🔥",
    body: "Sıcaklığın artmasıyla maddenin yapısındaki tanecikler hızlanır ve daha geniş bir hacme yayılır.",
  },
  cooling: {
    title: "Büzülme",
    emoji: "🧊",
    body: "Sıcaklık azaldığında taneciklerin hızıyla birlikte maddenin hacmi de azalır.",
  },
};
