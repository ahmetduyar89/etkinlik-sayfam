import type { JSX, Ref } from "react";
import type { LevelMarker, SimulationState, ThermoscopeHandle } from "../types/simulation";
import { formatTemperature } from "../lib/thermal";
import { Thermoscope } from "./Thermoscope";
import { ConceptCard } from "./ConceptCard";

interface SimulationStageProps {
  readonly state: SimulationState;
  readonly markers: readonly LevelMarker[];
  /** Tween ilerledikçe sütunun sıcaklığını bildirir. */
  readonly onTemperatureChange: (value: number) => void;
  /** GSAP ile animasyon vermek için SVG elemanlarına erişim. */
  readonly thermoscopeRef?: Ref<ThermoscopeHandle> | undefined;
  /** true ise sıvı seviyesini bileşenin kendi tween'i değil, siz sürersiniz. */
  readonly externalAnimation?: boolean;
}

/** Sol taraftaki geniş simülasyon alanı. */
export function SimulationStage({
  state,
  markers,
  onTemperatureChange,
  thermoscopeRef,
  externalAnimation = false,
}: SimulationStageProps): JSX.Element {
  const { temperature, ambientTemperature, trend } = state;

  return (
    <section
      aria-label="Simülasyon alanı"
      className="chunky relative flex min-h-[30rem] flex-1 flex-col overflow-hidden bg-panel"
    >
      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-6">
        <Thermoscope
          ambientTemperature={ambientTemperature}
          trend={trend}
          markers={markers}
          onTemperatureChange={onTemperatureChange}
          externalAnimation={externalAnimation}
          ref={thermoscopeRef}
        />
        <ConceptCard trend={trend} />
      </div>

      <div className="relative border-t-3 border-dotted border-line px-5 py-4">
        <p className="display text-lg">
          {trend === "heating"
            ? "Su ısındı, tanecikler hızlandı, sütun yukarı tırmanıyor!"
            : trend === "cooling"
              ? "Su soğudu, tanecikler yavaşladı, sütun aşağı iniyor!"
              : "Şişe ile kap aynı sıcaklıkta, sütun olduğu yerde duruyor."}
        </p>
        <p className="tabular mt-0.5 text-[15px]">
          Kaptaki su {formatTemperature(ambientTemperature)} °C · şişedeki su{" "}
          {formatTemperature(temperature)} °C
        </p>
      </div>
    </section>
  );
}
