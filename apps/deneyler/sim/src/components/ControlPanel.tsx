import type { JSX } from "react";
import type { SimulationActions, SimulationState } from "../types/simulation";
import { ENVIRONMENT_PRESETS } from "../lib/constants";
import { formatTemperature } from "../lib/thermal";
import { TemperatureSlider } from "./TemperatureSlider";

interface ControlPanelProps {
  readonly state: SimulationState;
  readonly actions: SimulationActions;
  /** Sıvının o anki yüksekliğine bir çizgi bırakır. */
  readonly onMarkLevel: () => void;
  readonly onClearMarkers: () => void;
  readonly markerCount: number;
}

export function ControlPanel({
  state,
  actions,
  onMarkLevel,
  onClearMarkers,
  markerCount,
}: ControlPanelProps): JSX.Element {
  const { ambientTemperature, temperature, activePreset, isSettling, trend } = state;

  return (
    <aside
      aria-label="Kontrol paneli"
      className="chunky flex w-full flex-col gap-6 bg-panel p-5 lg:w-[23rem]"
    >
      <TemperatureSlider value={ambientTemperature} onChange={actions.setAmbientTemperature} />

      <div className="flex flex-col gap-3">
        <h2 className="display text-lg">Şişeyi nereye koyalım?</h2>
        {ENVIRONMENT_PRESETS.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => actions.applyPreset(preset.id)}
              aria-pressed={isActive}
              className={`pushable flex items-center gap-3 px-4 py-3 text-left ${
                isActive ? "bg-sun" : "bg-paper"
              }`}
            >
              <span aria-hidden className="text-3xl leading-none">
                {preset.emoji}
              </span>
              <span>
                <span className="display block text-lg leading-tight">{preset.label}</span>
                <span className="block text-[14px] leading-tight">{preset.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="display text-lg">Çizgi çek</h2>
        <p className="text-[15px] leading-snug">
          Su nereye geldiyse oraya bir çizgi bırak. Sonra başka bir kaba koyup
          çizgilerin arasındaki farka bak.
        </p>
        <button
          type="button"
          onClick={onMarkLevel}
          className="pushable display bg-grape px-4 py-3 text-lg text-white"
        >
          ✏️ Buraya çizgi çek
        </button>
        <button
          type="button"
          onClick={onClearMarkers}
          disabled={markerCount === 0}
          className="pushable bg-paper px-4 py-2 text-[15px]"
        >
          {markerCount === 0 ? "Henüz çizgi yok" : `Çizgileri sil (${markerCount})`}
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t-3 border-dotted border-line pt-4">
        <div>
          <dt className="text-[14px]">Şişedeki su</dt>
          <dd className="display tabular text-xl" style={{ color: "var(--thermal-ink)" }}>
            {formatTemperature(temperature)} °C
          </dd>
        </div>
        <div>
          <dt className="text-[14px]">Şu an</dt>
          <dd className="display text-xl">
            {isSettling
              ? trend === "heating"
                ? "Genleşiyor ⬆️"
                : "Büzülüyor ⬇️"
              : "Duruyor ✋"}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={actions.reset}
        className="pushable bg-paper px-4 py-2.5 text-[15px]"
      >
        ↺ Baştan başla
      </button>
    </aside>
  );
}
