import type { ChangeEvent, JSX } from "react";
import { TEMPERATURE_RANGE } from "../lib/constants";
import { formatTemperature } from "../lib/thermal";

interface TemperatureSliderProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
}

export function TemperatureSlider({ value, onChange }: TemperatureSliderProps): JSX.Element {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(Number(event.target.value));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="ambient-temperature" className="display text-lg">
          Suyun sıcaklığı
        </label>
        <output
          htmlFor="ambient-temperature"
          className="display tabular chunky bg-panel px-3 py-1 text-2xl"
          style={{ color: "var(--thermal-ink)", boxShadow: "0 4px 0 0 var(--thermal)" }}
        >
          {formatTemperature(value)} °C
        </output>
      </div>

      <input
        id="ambient-temperature"
        type="range"
        className="thermal-slider mt-2"
        min={TEMPERATURE_RANGE.min}
        max={TEMPERATURE_RANGE.max}
        step={TEMPERATURE_RANGE.step}
        value={value}
        onChange={handleChange}
        aria-valuetext={`${formatTemperature(value)} santigrat derece`}
      />

      <div className="flex justify-between text-[15px]">
        <span>🧊 buz gibi</span>
        <span>kaynar 🔥</span>
      </div>
    </div>
  );
}
