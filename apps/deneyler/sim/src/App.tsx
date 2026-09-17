import { useEffect, useRef, type JSX } from "react";
import { SimulationStage } from "./components/SimulationStage";
import { ControlPanel } from "./components/ControlPanel";
import { useSimulation } from "./hooks/useSimulation";
import { useLevelMarkers } from "./hooks/useLevelMarkers";
import { thermalColor, thermalInk } from "./lib/thermal";
import type { ThermoscopeHandle } from "./types/simulation";

export default function App(): JSX.Element {
  const { state, actions } = useSimulation();

  /**
   * Termoskopun SVG elemanlarına ve animasyonun o anki konumuna erişim.
   * Kendi zaman çizelgenizi kurmak isterseniz:
   *
   *   gsap.to(thermoscope.current?.pipetteLiquid ?? null, {
   *     attr: columnRect(PIPETTE_COLUMN, 0.8),
   *     duration: 1.2,
   *     ease: "power2.out",
   *   });
   *
   * Bu durumda SimulationStage'e externalAnimation ekleyin ki bileşenin
   * kendi tween'i araya girmesin.
   */
  const thermoscope = useRef<ThermoscopeHandle>(null);
  const { markers, markCurrentLevel, clearMarkers } = useLevelMarkers(thermoscope);

  // Arayüzün vurgu rengi sütunun sıcaklığını izler.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--thermal", thermalColor(state.temperature));
    root.style.setProperty("--thermal-ink", thermalInk(state.temperature));
  }, [state.temperature]);

  const handleReset = (): void => {
    actions.reset();
    clearMarkers();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-[80rem] flex-col gap-5 p-4 sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h1 className="display text-3xl sm:text-4xl">
          <span aria-hidden>🌡️</span> Sihirli Termometre
        </h1>
        <p className="chunky bg-panel px-4 py-2 text-[15px]">
          Suyu ısıt, soğut, ne olduğunu izle!
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-5 lg:flex-row lg:items-stretch">
        <SimulationStage
          state={state}
          markers={markers}
          onTemperatureChange={actions.reportTemperature}
          thermoscopeRef={thermoscope}
        />
        <ControlPanel
          state={state}
          actions={{ ...actions, reset: handleReset }}
          onMarkLevel={markCurrentLevel}
          onClearMarkers={clearMarkers}
          markerCount={markers.length}
        />
      </main>
    </div>
  );
}
