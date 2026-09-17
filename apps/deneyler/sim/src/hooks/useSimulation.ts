import { useCallback, useMemo, useState } from "react";
import type {
  PresetId,
  SimulationApi,
  SimulationOptions,
  ThermalTrend,
} from "../types/simulation";
import { PRESET_BY_ID, ROOM_TEMPERATURE, TEMPERATURE_RANGE } from "../lib/constants";
import { clamp } from "../lib/thermal";

/** Bu farkın altında sütun durmuş kabul edilir (°C). */
const SETTLE_EPSILON = 0.05;

/**
 * Simülasyonun durumunu tutar. Ortam sıcaklığı kullanıcının komutuyla
 * anında değişir; şişedeki suyun sıcaklığı ise Thermoscope'taki GSAP
 * tween'i ilerledikçe reportTemperature ile geri bildirilir. Böylece
 * yumuşatmanın tek sahibi GSAP olur.
 */
export function useSimulation(options: SimulationOptions = {}): SimulationApi {
  const initialTemperature = options.initialTemperature ?? ROOM_TEMPERATURE;

  const [ambientTemperature, setAmbient] = useState<number>(initialTemperature);
  const [temperature, setTemperature] = useState<number>(initialTemperature);
  const [activePreset, setActivePreset] = useState<PresetId | null>("room");

  const setAmbientTemperature = useCallback((value: number): void => {
    setAmbient(clamp(value, TEMPERATURE_RANGE.min, TEMPERATURE_RANGE.max));
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((id: PresetId): void => {
    setAmbient(PRESET_BY_ID[id].targetTemperature);
    setActivePreset(id);
  }, []);

  const reset = useCallback((): void => {
    setAmbient(ROOM_TEMPERATURE);
    setActivePreset("room");
  }, []);

  const reportTemperature = useCallback((value: number): void => {
    setTemperature(value);
  }, []);

  const difference = ambientTemperature - temperature;
  const isSettling = Math.abs(difference) > SETTLE_EPSILON;
  const trend: ThermalTrend = !isSettling ? "stable" : difference > 0 ? "heating" : "cooling";

  return useMemo<SimulationApi>(
    () => ({
      state: { temperature, ambientTemperature, activePreset, isSettling, trend },
      actions: { setAmbientTemperature, applyPreset, reset, reportTemperature },
    }),
    [
      temperature,
      ambientTemperature,
      activePreset,
      isSettling,
      trend,
      setAmbientTemperature,
      applyPreset,
      reset,
      reportTemperature,
    ],
  );
}
