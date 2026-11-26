# Termoskop simülasyonu — birleştirilmiş kaynak kod

React 19 + Vite 7 + TypeScript + Tailwind CSS 4 + GSAP.

```bash
npm install
npm run dev
```

Aşağıdaki dosyaların tamamı projenin son halidir. `npm run build` ile
tip kontrolünden ve derlemeden geçer.

## `package.json`

```json
{
  "name": "termal-simulasyon",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "gsap": "^3.15.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.11",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^4.6.0",
    "jsdom": "^30.0.1",
    "tailwindcss": "^4.1.11",
    "typescript": "^5.8.3",
    "vite": "^7.0.0"
  }
}
```

## `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

## `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

## `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "useDefineForClassFields": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

## `tsconfig.node.json`

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["vite.config.ts"]
}
```

## `index.html`

```html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sihirli Termometre Deneyi</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;800&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## `src/main.tsx`

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("#root öğesi bulunamadı. index.html dosyasını kontrol edin.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## `src/index.css`

```css
@import "tailwindcss";

@theme {
  --font-sans: "Nunito", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Fredoka", "Nunito", ui-sans-serif, system-ui, sans-serif;

  --color-ink: #182b4d;
  --color-muted: #5d7396;
  --color-paper: #e4eeff;
  --color-panel: #ffffff;
  --color-line: #c2d6f5;
  --color-sun: #ffc93c;
  --color-berry: #e23b2e;
  --color-sea: #2ba6c9;
  --color-leaf: #3bb273;
  --color-grape: #7b5be6;
  --color-blush: #ff8fa3;
}

:root {
  /* Sıcaklığa göre JS tarafından güncellenir. */
  --thermal: #f2b233;
  /* Aynı rengin metinde okunacak kadar koyu hali. */
  --thermal-ink: #90753f;
  color-scheme: light;
}

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  font-weight: 600;
  color: var(--color-ink);
  background-color: var(--color-paper);
  background-image: radial-gradient(var(--color-line) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  -webkit-font-smoothing: antialiased;
}

.display {
  font-family: var(--font-display);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.tabular {
  font-variant-numeric: tabular-nums;
}

/* Kalın çerçeveli, hafifçe kabarık kutu */
.chunky {
  border: 3px solid var(--color-ink);
  border-radius: 1.25rem;
  box-shadow: 0 5px 0 0 var(--color-line);
}

/* Basılabilir düğme: basınca aşağı iner */
.pushable {
  border: 3px solid var(--color-ink);
  border-radius: 1rem;
  box-shadow: 0 5px 0 0 var(--color-ink);
  transition:
    transform 90ms ease-out,
    box-shadow 90ms ease-out;
}

.pushable:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 1px 0 0 var(--color-ink);
}

.pushable:disabled {
  opacity: 0.45;
  box-shadow: 0 3px 0 0 var(--color-line);
}

:focus-visible {
  outline: 3px solid var(--color-grape);
  outline-offset: 3px;
}

/* Sıcaklık kaydırıcısı */
.thermal-slider {
  appearance: none;
  width: 100%;
  height: 3rem;
  background: transparent;
  cursor: grab;
}

.thermal-slider:active {
  cursor: grabbing;
}

.thermal-slider::-webkit-slider-runnable-track {
  height: 1rem;
  border-radius: 999px;
  border: 3px solid var(--color-ink);
  background: linear-gradient(to right, var(--color-sea), var(--color-sun) 50%, var(--color-berry));
}

.thermal-slider::-moz-range-track {
  height: 1rem;
  border-radius: 999px;
  border: 3px solid var(--color-ink);
  background: linear-gradient(to right, var(--color-sea), var(--color-sun) 50%, var(--color-berry));
}

.thermal-slider::-webkit-slider-thumb {
  appearance: none;
  width: 2.25rem;
  height: 2.25rem;
  margin-top: -0.75rem;
  border-radius: 999px;
  background: #fff;
  border: 4px solid var(--color-ink);
  box-shadow: inset 0 0 0 4px var(--thermal);
}

.thermal-slider::-moz-range-thumb {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: #fff;
  border: 4px solid var(--color-ink);
  box-shadow: inset 0 0 0 4px var(--thermal);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## `src/App.tsx`

```tsx
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
```

## `src/vite-env.d.ts`

```ts
/// <reference types="vite/client" />
```

## `src/types/simulation.ts`

```ts
/** Simülasyonun tüm ortak tip tanımları. */

/** Hazır ortam düğmelerinin kimlikleri. */
export type PresetId = "room" | "hot" | "ice";

/** Sıcaklığın gidişatı: ısınıyor, soğuyor ya da dengede. */
export type ThermalTrend = "heating" | "cooling" | "stable";

/** Kontrol panelindeki bir hazır ortam düğmesinin tanımı. */
export interface EnvironmentPreset {
  readonly id: PresetId;
  /** Düğme üzerinde görünen ad. */
  readonly label: string;
  /** Düğmenin altındaki tek satırlık açıklama. */
  readonly hint: string;
  /** Düğmedeki simge. */
  readonly emoji: string;
  /** Ortamın hedef sıcaklığı (°C). */
  readonly targetTemperature: number;
}

/** Sıcaklık kaydırıcısının sınırları. */
export interface TemperatureRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

/** Simülasyonun o anki durumu. */
export interface SimulationState {
  /** Cismin ölçülen sıcaklığı (°C). Hedefe doğru yumuşak geçer. */
  readonly temperature: number;
  /** Dış ortamın sıcaklığı (°C). Kaydırıcı bu değeri belirler. */
  readonly ambientTemperature: number;
  /** Son basılan hazır ortam düğmesi; kaydırıcı elle oynatılınca null olur. */
  readonly activePreset: PresetId | null;
  /** Sıcaklık hedefe yaklaşırken true. */
  readonly isSettling: boolean;
  /** Sıcaklığın gidişatı. */
  readonly trend: ThermalTrend;
}

/** Sütunun hareketini açıklayan bilgi kartının içeriği. */
export interface ConceptNote {
  readonly title: string;
  readonly emoji: string;
  readonly body: string;
}

/** Keçeli kalemle bırakılan bir seviye işareti. */
export interface LevelMarker {
  readonly id: string;
  /** İşaretin SVG koordinat sistemindeki y değeri. */
  readonly y: number;
  /** Seviyeden geri hesaplanan sıcaklık (°C). */
  readonly temperature: number;
  /** Elde çizilmiş görünsün diye küçük bir eğim (derece). */
  readonly tilt: number;
}

/** Simülasyonu değiştiren eylemler. */
export interface SimulationActions {
  /** Dış ortam sıcaklığını doğrudan ayarlar. */
  setAmbientTemperature: (value: number) => void;
  /** Hazır bir ortama geçer. */
  applyPreset: (id: PresetId) => void;
  /** Başlangıç durumuna döner. */
  reset: () => void;
  /**
   * Animasyonun o anki sıcaklığını bildirir. Thermoscope, GSAP tween'i
   * ilerledikçe her karede çağırır; okumalar bu değerden beslenir.
   */
  reportTemperature: (value: number) => void;
}

/** useSimulation kancasının döndürdüğü değer. */
export interface SimulationApi {
  readonly state: SimulationState;
  readonly actions: SimulationActions;
}

/**
 * Termoskop SVG'sindeki animasyona açık elemanlar. GSAP'e doğrudan
 * verilebilir; her alan o an DOM'daki elemanı döndürür.
 */
export interface ThermoscopeElements {
  /** SVG kökü. */
  readonly root: SVGSVGElement | null;
  /** Dış kaptaki su. `y` ve `height` ile seviyesi değişir. */
  readonly outerWater: SVGRectElement | null;
  /** Dış kaptaki suyun yüzey çizgisi. `y1` ve `y2` ile taşınır. */
  readonly outerWaterSurface: SVGLineElement | null;
  /** Şişenin içindeki renklendirilmiş su. `y` ve `height` ile değişir. */
  readonly bottleLiquid: SVGRectElement | null;
  /** Pipetteki sıvı sütunu. `y` ve `height` ile yükselir, alçalır. */
  readonly pipetteLiquid: SVGRectElement | null;
  /** Sütunun tepesindeki menisküs. `cy` ile taşınır. */
  readonly pipetteMeniscus: SVGEllipseElement | null;
  /** Seviyeyi gösteren ok. `transform` ile taşınır. */
  readonly levelMarker: SVGGElement | null;
  /** Keçeli kalem işaretlerinin bulunduğu katman. */
  readonly markerLayer: SVGGElement | null;
  /** Başlangıç seviyesini gösteren kesikli çizgi. */
  readonly referenceLevel: SVGLineElement | null;
}

/**
 * Termoskop bileşeninin dışarıya verdiği arayüz: elemanlar ve o anki
 * animasyon konumunu okuyan yardımcılar.
 */
export interface ThermoscopeHandle extends ThermoscopeElements {
  /** Sıvı sütununun tepesinin o anki SVG y değeri. */
  getLiquidY: () => number | null;
  /** Sütunun o anki doluluk oranı (0-1). */
  getLiquidLevel: () => number | null;
}

/** useSimulation kancasının ayarları. */
export interface SimulationOptions {
  /** Başlangıç sıcaklığı (°C). */
  readonly initialTemperature?: number;
}
```

## `src/lib/constants.ts`

```ts
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
```

## `src/lib/thermal.ts`

```ts
import { TEMPERATURE_RANGE } from "./constants";

/** Bir sayıyı verilen aralığa sıkıştırır. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Sıcaklığı 0–1 aralığına normalleştirir. */
export function normalize(temperature: number): number {
  const { min, max } = TEMPERATURE_RANGE;
  return clamp((temperature - min) / (max - min), 0, 1);
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

/**
 * Soğuktan sıcağa uzanan renk rampası: turkuaz, yeşil, sarı, kırmızı.
 * Ara tonların da canlı birer renk olması için dört durak kullanılır;
 * doğrudan maviden sarıya geçiş soluk bir yeşile düşerdi.
 */
const RAMP: readonly { readonly at: number; readonly color: Rgb }[] = [
  { at: 0, color: { r: 43, g: 166, b: 201 } },
  { at: 0.34, color: { r: 59, g: 178, b: 115 } },
  { at: 0.67, color: { r: 242, g: 178, b: 51 } },
  { at: 1, color: { r: 226, g: 59, b: 46 } },
];

/** Koyu lacivert; metin kontrastı için karışıma girer. */
const INK: Rgb = { r: 24, g: 43, b: 77 };

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

/** Rampadan 0-1 aralığındaki bir noktanın rengini okur. */
function sample(t: number): Rgb {
  const clamped = clamp(t, 0, 1);
  for (let i = 1; i < RAMP.length; i += 1) {
    const previous = RAMP[i - 1];
    const current = RAMP[i];
    if (previous === undefined || current === undefined) break;
    if (clamped <= current.at) {
      const span = current.at - previous.at;
      return mix(previous.color, current.color, (clamped - previous.at) / span);
    }
  }
  return RAMP[RAMP.length - 1]?.color ?? INK;
}

function toCss({ r, g, b }: Rgb): string {
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Sıcaklığa karşılık gelen renk: soğukta turkuaz, ılıkta yeşil ve sarı,
 * sıcakta kırmızı. Arayüzün tamamı bu renkten beslenir.
 */
export function thermalColor(temperature: number): string {
  return toCss(sample(normalize(temperature)));
}

/**
 * Aynı sıcaklığın metinde kullanılabilecek koyu hali. Sarı gibi açık
 * tonlar beyaz zeminde okunmadığı için renk lacivere doğru karıştırılır.
 */
export function thermalInk(temperature: number): string {
  return toCss(mix(sample(normalize(temperature)), INK, 0.45));
}

/** Sıcaklığı tek ondalıkla ve virgüllü olarak biçimlendirir. */
export function formatTemperature(temperature: number): string {
  return temperature.toFixed(1).replace(".", ",");
}
```

## `src/lib/motion.ts`

```ts
/** İşletim sistemi hareketi azaltmayı istiyorsa geçişler anlık olur. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
```

## `src/lib/thermoscope.ts`

```ts
import { ROOM_TEMPERATURE, TEMPERATURE_RANGE } from "./constants";
import { clamp } from "./thermal";

/**
 * SVG içindeki animasyona açık elemanların id'leri.
 * GSAP tarafında doğrudan seçici olarak kullanılabilir: gsap.to("#pipette-liquid", ...)
 */
export const THERMOSCOPE_IDS = {
  root: "thermoscope",
  outerWater: "outer-water",
  outerWaterSurface: "outer-water-surface",
  bottleLiquid: "bottle-liquid",
  pipetteLiquid: "pipette-liquid",
  pipetteMeniscus: "pipette-meniscus",
  levelMarker: "level-marker",
  referenceLevel: "reference-level",
  markerLayer: "marker-layer",
} as const;

export type ThermoscopeElementId =
  (typeof THERMOSCOPE_IDS)[keyof typeof THERMOSCOPE_IDS];

/** Dikey sınırları olan bir sıvı sütunu. */
export interface LiquidColumn {
  /** Sütunun tamamen dolu olduğu üst sınır (SVG y). */
  readonly top: number;
  /** Sütunun tabanı (SVG y). */
  readonly bottom: number;
}

/** GSAP'in `attr` eklentisine doğrudan verilebilecek dikdörtgen. */
export interface ColumnRect {
  readonly y: number;
  readonly height: number;
}

/** SVG koordinat sisteminin ölçüleri. */
export const THERMOSCOPE_VIEWBOX = { width: 620, height: 680 } as const;

export const PIPETTE_COLUMN: LiquidColumn = { top: 60, bottom: 344 };
export const BOTTLE_COLUMN: LiquidColumn = { top: 326, bottom: 626 };
export const OUTER_WATER_COLUMN: LiquidColumn = { top: 430, bottom: 644 };

/** Düzeneğin renkleri. */
export const PALETTE = {
  ink: "#182b4d",
  liquid: "#e23b2e",
  liquidLight: "#f2685c",
  bubble: "#ffd6d1",
  glass: "#ffffff",
  cap: "#7b5be6",
  capLight: "#a58bf0",
  putty: "#ffc93c",
  puttyDark: "#e0a91f",
  blush: "#ff8fa3",
  frost: "#bfe8f5",
  sun: "#ffc93c",
  leaf: "#3bb273",
  sea: "#2ba6c9",
} as const;

/** Renklendirilmiş suyun rengi. */
export const LIQUID_RED = PALETTE.liquid;

/** Keçeli kalem işaretlerinin rengi. */
export const MARKER_INK = PALETTE.ink;

/** İşaret çizgisinin yatay sınırları (SVG x). */
export const MARKER_LINE = { start: 258, end: 342 } as const;

/* --- Sıcaklık ile seviye arasındaki eşleme -------------------------------- */

/**
 * Buzlu suda sütunun indiği seviye. Kapağın ve hamurun arkasında kalmasın
 * diye pipetin görünen kısmının hemen üstünde durur.
 */
const ICE_LEVEL = 0.26;
/** Oda sıcaklığında sütun pipetin tam ortasındadır. */
const ROOM_LEVEL = 0.5;
/** Ölçeğin üst ucu; sütun pipetten taşmaz. */
const TOP_LEVEL = 0.96;

const COLD_SLOPE = (ROOM_LEVEL - ICE_LEVEL) / (ROOM_TEMPERATURE - TEMPERATURE_RANGE.min);
const WARM_SLOPE = (TOP_LEVEL - ROOM_LEVEL) / (TEMPERATURE_RANGE.max - ROOM_TEMPERATURE);

/**
 * Sıcaklığı pipetteki sıvı seviyesine (0-1) çevirir.
 *
 * Ölçek kasıtlı olarak doğrusal değildir: oda sıcaklığı (25 °C) tam ortaya
 * denk gelir, altındaki 25 derece ile üstündeki 75 derece pipetin yarısını
 * paylaşır. Böylece hem buzlu su hem sıcak su gözle görülür bir fark yaratır.
 * Doğrusal ölçek isterseniz yalnızca bu fonksiyonu değiştirin.
 */
export function pipetteLevelFromTemperature(temperature: number): number {
  const t = clamp(temperature, TEMPERATURE_RANGE.min, TEMPERATURE_RANGE.max);
  const level =
    t <= ROOM_TEMPERATURE
      ? ICE_LEVEL + (t - TEMPERATURE_RANGE.min) * COLD_SLOPE
      : ROOM_LEVEL + (t - ROOM_TEMPERATURE) * WARM_SLOPE;
  return clamp(level, 0, 1);
}

/** pipetteLevelFromTemperature'ın tersi: seviyeden sıcaklığı okur. */
export function temperatureFromPipetteLevel(level: number): number {
  const l = clamp(level, ICE_LEVEL, TOP_LEVEL);
  return l <= ROOM_LEVEL
    ? TEMPERATURE_RANGE.min + (l - ICE_LEVEL) / COLD_SLOPE
    : ROOM_TEMPERATURE + (l - ROOM_LEVEL) / WARM_SLOPE;
}

/** Oda sıcaklığının seviyesi; kesikli referans çizgisi buradadır. */
export const REFERENCE_LEVEL = ROOM_LEVEL;

/* --- Geometri ------------------------------------------------------------- */

/**
 * Bir doluluk oranını (0-1) rect'in `y` ve `height` değerlerine çevirir.
 * Sütun tabandan yukarı doğru dolar.
 */
export function columnRect(column: LiquidColumn, level: number): ColumnRect {
  const span = column.bottom - column.top;
  const height = clamp(level, 0, 1) * span;
  return { y: column.bottom - height, height };
}

/** columnRect'in tersi: bir SVG y değerini doluluk oranına çevirir. */
export function levelFromY(column: LiquidColumn, y: number): number {
  const span = column.bottom - column.top;
  return clamp((column.bottom - y) / span, 0, 1);
}

/**
 * Genleşme veya büzülme animasyonunun süresi (saniye).
 * Kısa mesafeler çabuk, uzun mesafeler daha ağır tamamlanır.
 */
export function expansionDuration(levelDelta: number): number {
  return clamp(0.45 + Math.abs(levelDelta) * 2.2, 0.45, 2.1);
}
```

## `src/hooks/useSimulation.ts`

```ts
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
```

## `src/hooks/useLevelMarkers.ts`

```ts
import { useCallback, useRef, useState, type RefObject } from "react";
import type { LevelMarker, ThermoscopeHandle } from "../types/simulation";
import { temperatureFromPipetteLevel } from "../lib/thermoscope";

/** Bu kadar yakın iki işaret üst üste biner; ikincisi çizilmez (SVG birimi). */
const MIN_GAP = 6;

export interface LevelMarkersApi {
  readonly markers: readonly LevelMarker[];
  /**
   * Sıvının o an bulunduğu yüksekliğe yatay bir çizgi bırakır.
   * Seviyeyi React state'inden değil, animasyonun o anki konumundan okur;
   * bu yüzden tween ortasında da doğru yeri işaretler.
   * Çizilemezse (henüz seviye yoksa veya yakında bir işaret varsa) null döner.
   */
  markCurrentLevel: () => LevelMarker | null;
  removeMarker: (id: string) => void;
  clearMarkers: () => void;
}

export function useLevelMarkers(
  thermoscope: RefObject<ThermoscopeHandle | null>,
): LevelMarkersApi {
  const [markers, setMarkers] = useState<readonly LevelMarker[]>([]);
  const counterRef = useRef(0);
  /** Art arda tıklamalarda bayat okuma olmasın diye state'in aynası. */
  const markersRef = useRef<readonly LevelMarker[]>(markers);
  markersRef.current = markers;

  const markCurrentLevel = useCallback((): LevelMarker | null => {
    const handle = thermoscope.current;
    const y = handle?.getLiquidY();
    const level = handle?.getLiquidLevel();
    if (y == null || level == null) return null;

    if (markersRef.current.some((marker) => Math.abs(marker.y - y) < MIN_GAP)) {
      return null;
    }

    counterRef.current += 1;
    const created: LevelMarker = {
      id: `marker-${counterRef.current}`,
      y,
      temperature: temperatureFromPipetteLevel(level),
      tilt: (Math.random() - 0.5) * 2.4,
    };

    markersRef.current = [...markersRef.current, created];
    setMarkers(markersRef.current);
    return created;
  }, [thermoscope]);

  const removeMarker = useCallback((id: string): void => {
    markersRef.current = markersRef.current.filter((marker) => marker.id !== id);
    setMarkers(markersRef.current);
  }, []);

  const clearMarkers = useCallback((): void => {
    markersRef.current = [];
    setMarkers(markersRef.current);
  }, []);

  return { markers, markCurrentLevel, removeMarker, clearMarkers };
}
```

## `src/components/SimulationStage.tsx`

```tsx
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
```

## `src/components/Thermoscope.tsx`

```tsx
import { useCallback, useImperativeHandle, useRef, type JSX, type Ref } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { LevelMarker, ThermalTrend, ThermoscopeHandle } from "../types/simulation";
import { formatTemperature, thermalColor } from "../lib/thermal";
import { prefersReducedMotion } from "../lib/motion";
import {
  BOTTLE_COLUMN,
  columnRect,
  expansionDuration,
  levelFromY,
  LIQUID_RED,
  MARKER_INK,
  MARKER_LINE,
  OUTER_WATER_COLUMN,
  PALETTE,
  PIPETTE_COLUMN,
  pipetteLevelFromTemperature,
  REFERENCE_LEVEL,
  temperatureFromPipetteLevel,
  THERMOSCOPE_IDS as ID,
  THERMOSCOPE_VIEWBOX,
} from "../lib/thermoscope";

gsap.registerPlugin(useGSAP);

interface ThermoscopeProps {
  /** Dış kaptaki suyun sıcaklığı (°C). Sütunun gideceği hedefi belirler. */
  readonly ambientTemperature: number;
  /** Sütunun gidişatı; şişenin yüz ifadesini ve efektleri belirler. */
  readonly trend: ThermalTrend;
  /** Keçeli kalemle bırakılmış seviye işaretleri. */
  readonly markers: readonly LevelMarker[];
  /** Tween ilerledikçe sütunun karşılık geldiği sıcaklığı bildirir. */
  readonly onTemperatureChange: (value: number) => void;
  /**
   * true ise bileşen kendi tween'ini kurmaz; sıvı seviyesinin kontrolü
   * tamamen dışarıdaki zaman çizelgesine kalır.
   */
  readonly externalAnimation: boolean;
  readonly ref?: Ref<ThermoscopeHandle> | undefined;
}

/** Şişe gövdesinin dış hattı; hem çizim hem de kırpma maskesi olarak kullanılır. */
const BOTTLE_PATH =
  "M256 326 V372 C256 392 212 396 212 424 V604 a16 16 0 0 0 16 16 H372 a16 16 0 0 0 16 -16 V424 C388 396 344 392 344 372 V326 Z";

/** Dış kabın iç hacmi. */
const VESSEL_INTERIOR_PATH =
  "M132 430 V626 a14 14 0 0 0 14 14 H454 a14 14 0 0 0 14 -14 V430 Z";

/** Dış kabın cam gövdesi (üstü açık). */
const VESSEL_OUTLINE_PATH =
  "M124 430 V628 a20 20 0 0 0 20 20 H456 a20 20 0 0 0 20 -20 V430";

/** Kapağın üstünde pipetin çevresini saran oyun hamuru. */
const PUTTY_PATH =
  "M254 306 c1 -13 10 -19 21 -21 c6 -9 14 -11 25 -11 c11 0 19 2 25 11 c11 2 20 8 21 21 Z";

/** Şişenin ağzı: gidişata göre değişir. */
const MOUTHS: Readonly<Record<ThermalTrend, string>> = {
  heating: "M285 522 a15 13 0 1 0 30 0 a15 13 0 1 0 -30 0",
  cooling: "M276 528 l12 -9 l12 9 l12 -9 l12 9",
  stable: "M276 520 Q300 546 324 520",
};

/** Şişenin içinde yükselen kabarcıklar. */
const BUBBLES = [
  { cx: 246, r: 7 },
  { cx: 352, r: 5 },
  { cx: 288, r: 6 },
  { cx: 330, r: 8 },
  { cx: 264, r: 5 },
] as const;

/** Dış kaptaki buz taneleri. */
const FROST = [
  { cx: 168, cy: 520, r: 6 },
  { cx: 196, cy: 592, r: 5 },
  { cx: 160, cy: 604, r: 7 },
  { cx: 420, cy: 512, r: 7 },
  { cx: 440, cy: 578, r: 5 },
  { cx: 404, cy: 610, r: 6 },
] as const;

export function Thermoscope({
  ambientTemperature,
  trend,
  markers,
  onTemperatureChange,
  externalAnimation,
  ref,
}: ThermoscopeProps): JSX.Element {
  const rootRef = useRef<SVGSVGElement | null>(null);
  const outerWaterRef = useRef<SVGRectElement | null>(null);
  const outerWaterSurfaceRef = useRef<SVGLineElement | null>(null);
  const bottleLiquidRef = useRef<SVGRectElement | null>(null);
  const pipetteLiquidRef = useRef<SVGRectElement | null>(null);
  const pipetteMeniscusRef = useRef<SVGEllipseElement | null>(null);
  const levelMarkerRef = useRef<SVGGElement | null>(null);
  const referenceLevelRef = useRef<SVGLineElement | null>(null);
  const markerLayerRef = useRef<SVGGElement | null>(null);
  const eyesRef = useRef<SVGGElement | null>(null);
  const mouthRef = useRef<SVGPathElement | null>(null);
  const blushRef = useRef<SVGGElement | null>(null);
  const bubblesRef = useRef<SVGGElement | null>(null);
  const frostRef = useRef<SVGGElement | null>(null);
  const bubbleLoopRef = useRef<gsap.core.Timeline | null>(null);

  /** GSAP'in tweenlediği vekil nesne. Sütunun tek doğruluk kaynağıdır. */
  const proxy = useRef({ level: pipetteLevelFromTemperature(ambientTemperature) }).current;

  /**
   * Dış kap suyunun o anki rengi. GSAP'in başlangıç değerini hesaplanmış
   * stilden okumasına güvenmek yerine burada tutulur; aksi halde bazı
   * ortamlarda ilk geçiş siyahtan başlar.
   */
  const waterColorRef = useRef(thermalColor(ambientTemperature));

  /** Her renderda tazelenen geri çağırım; tween içinde bayat kapanış olmasın. */
  const reportRef = useRef(onTemperatureChange);
  reportRef.current = onTemperatureChange;

  const getLiquidY = useCallback((): number | null => {
    const raw = pipetteLiquidRef.current?.getAttribute("y");
    return raw == null ? null : Number.parseFloat(raw);
  }, []);

  useImperativeHandle<ThermoscopeHandle, ThermoscopeHandle>(
    ref,
    () => ({
      get root() {
        return rootRef.current;
      },
      get outerWater() {
        return outerWaterRef.current;
      },
      get outerWaterSurface() {
        return outerWaterSurfaceRef.current;
      },
      get bottleLiquid() {
        return bottleLiquidRef.current;
      },
      get pipetteLiquid() {
        return pipetteLiquidRef.current;
      },
      get pipetteMeniscus() {
        return pipetteMeniscusRef.current;
      },
      get levelMarker() {
        return levelMarkerRef.current;
      },
      get referenceLevel() {
        return referenceLevelRef.current;
      },
      get markerLayer() {
        return markerLayerRef.current;
      },
      getLiquidY,
      getLiquidLevel: () => {
        const y = getLiquidY();
        return y == null ? null : levelFromY(PIPETTE_COLUMN, y);
      },
    }),
    [getLiquidY],
  );

  /** Sütunun bulunduğu seviyeyi SVG'ye yazar. Tween her karede bunu çağırır. */
  const applyLevel = useCallback((level: number): void => {
    const { y, height } = columnRect(PIPETTE_COLUMN, level);
    const top = y.toFixed(2);
    pipetteLiquidRef.current?.setAttribute("y", top);
    pipetteLiquidRef.current?.setAttribute("height", height.toFixed(2));
    pipetteMeniscusRef.current?.setAttribute("cy", top);
    levelMarkerRef.current?.setAttribute("transform", `translate(0 ${top})`);
  }, []);

  // Genleşme ve büzülme: ortam sıcaklığı değişince sütun yeni seviyesine akar.
  useGSAP(
    () => {
      if (externalAnimation) return;

      const target = pipetteLevelFromTemperature(ambientTemperature);
      const duration = prefersReducedMotion() ? 0 : expansionDuration(target - proxy.level);
      const water = thermalColor(ambientTemperature);

      gsap.to(proxy, {
        level: target,
        duration,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          applyLevel(proxy.level);
          reportRef.current(temperatureFromPipetteLevel(proxy.level));
        },
        onComplete: () => {
          applyLevel(target);
          reportRef.current(ambientTemperature);
        },
      });

      gsap.fromTo(
        [outerWaterRef.current, outerWaterSurfaceRef.current],
        { fill: waterColorRef.current, stroke: waterColorRef.current },
        {
          fill: water,
          stroke: water,
          duration,
          ease: "power2.out",
          overwrite: "auto",
          onUpdate: () => {
            const current = outerWaterRef.current?.style.fill;
            if (current) waterColorRef.current = current;
          },
          onComplete: () => {
            waterColorRef.current = water;
          },
        },
      );
    },
    { dependencies: [ambientTemperature, externalAnimation], scope: rootRef },
  );

  // Şişe arada bir göz kırpar, kabarcıklar sürekli döner (duraklatılmış olarak).
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.timeline({ repeat: -1, repeatDelay: 3.4, delay: 1.5 }).to(eyesRef.current, {
        scaleY: 0.1,
        duration: 0.09,
        yoyo: true,
        repeat: 1,
        svgOrigin: "300 487",
      });

      const loop = gsap.timeline({ repeat: -1, paused: true });
      BUBBLES.forEach((_bubble, index) => {
        loop.fromTo(
          `#bubble-${index}`,
          { attr: { cy: 600 }, opacity: 0 },
          {
            attr: { cy: 372 },
            opacity: 1,
            duration: 2.4,
            ease: "none",
            keyframes: { opacity: [0, 0.9, 0.9, 0] },
          },
          index * 0.42,
        );
      });
      bubbleLoopRef.current = loop;
    },
    { scope: rootRef },
  );

  // Yüz ifadesi, kabarcıklar ve buz taneleri gidişata göre değişir.
  useGSAP(
    () => {
      const duration = prefersReducedMotion() ? 0 : 0.3;

      gsap.fromTo(
        mouthRef.current,
        { scale: 0.7 },
        { scale: 1, duration, ease: "back.out(2.4)", svgOrigin: "300 526" },
      );
      gsap.to(blushRef.current, {
        opacity: trend === "heating" ? 0.85 : 0,
        duration,
        overwrite: "auto",
      });
      gsap.to(bubblesRef.current, {
        opacity: trend === "heating" ? 1 : 0,
        duration,
        overwrite: "auto",
      });
      gsap.to(frostRef.current, {
        opacity: trend === "cooling" ? 1 : 0,
        duration,
        overwrite: "auto",
      });

      const loop = bubbleLoopRef.current;
      if (loop) {
        if (trend === "heating") loop.play();
        else loop.pause();
      }
    },
    { dependencies: [trend], scope: rootRef },
  );

  // Yeni işaret keçeli kalemle çizilmiş gibi soldan sağa uzar.
  useGSAP(
    () => {
      const fresh = markerLayerRef.current?.querySelector<SVGGElement>('[data-fresh="true"]');
      if (!fresh) return;

      const duration = prefersReducedMotion() ? 0 : 0.32;

      gsap.fromTo(
        fresh.querySelector("line"),
        { attr: { x2: MARKER_LINE.start } },
        { attr: { x2: MARKER_LINE.end }, duration, ease: "power2.out" },
      );
      gsap.fromTo(
        fresh.querySelector("circle"),
        { scale: 0 },
        { scale: 1, duration, ease: "back.out(3)", transformOrigin: "center" },
      );
      gsap.fromTo(
        fresh.querySelector("text"),
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration, delay: duration * 0.35, ease: "power2.out" },
      );
    },
    { dependencies: [markers.length], scope: rootRef },
  );

  // İlk çizimde kullanılacak değerler; sonrasını GSAP sürer.
  const initial = useRef({
    pipette: columnRect(PIPETTE_COLUMN, proxy.level),
    water: columnRect(OUTER_WATER_COLUMN, 0.78),
    bottle: columnRect(BOTTLE_COLUMN, 1),
    waterColor: thermalColor(ambientTemperature),
  }).current;

  const referenceY = columnRect(PIPETTE_COLUMN, REFERENCE_LEVEL).y;
  const lastMarkerId = markers.at(-1)?.id;

  return (
    <svg
      id={ID.root}
      ref={rootRef}
      viewBox={`0 0 ${THERMOSCOPE_VIEWBOX.width} ${THERMOSCOPE_VIEWBOX.height}`}
      className="h-full max-h-[34rem] w-full"
      role="img"
      aria-labelledby="thermoscope-title"
      fontFamily="Fredoka, Nunito, sans-serif"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title id="thermoscope-title">
        Büyük bir kabın içinde duran, kapağı delinmiş ve oyun hamuruyla yalıtılmış
        bir şişe. Şişedeki kırmızı su, kapaktan geçen pipette yükselip alçalıyor.
      </title>

      <defs>
        <clipPath id="vessel-interior">
          <path d={VESSEL_INTERIOR_PATH} />
        </clipPath>
        <clipPath id="bottle-interior">
          <path d={BOTTLE_PATH} />
        </clipPath>
        <clipPath id="pipette-interior">
          <rect x={293} y={50} width={14} height={296} rx={7} />
        </clipPath>
      </defs>

      {/* Dış kap ve içindeki su */}
      <path d={VESSEL_INTERIOR_PATH} fill={PALETTE.glass} />
      <g clipPath="url(#vessel-interior)">
        <rect
          id={ID.outerWater}
          ref={outerWaterRef}
          x={132}
          y={initial.water.y}
          width={336}
          height={initial.water.height}
          fill={initial.waterColor}
          opacity={0.45}
        />
        <line
          id={ID.outerWaterSurface}
          ref={outerWaterSurfaceRef}
          x1={132}
          y1={initial.water.y}
          x2={468}
          y2={initial.water.y}
          stroke={initial.waterColor}
          strokeWidth={5}
        />
        <g ref={frostRef} opacity={0} aria-hidden>
          {FROST.map((dot) => (
            <circle
              key={`${dot.cx}-${dot.cy}`}
              cx={dot.cx}
              cy={dot.cy}
              r={dot.r}
              fill={PALETTE.frost}
              stroke={PALETTE.ink}
              strokeWidth={2.5}
            />
          ))}
        </g>
      </g>
      <path d={VESSEL_OUTLINE_PATH} fill="none" stroke={PALETTE.ink} strokeWidth={5} />

      {/* Şişe ve içindeki renklendirilmiş su */}
      <path d={BOTTLE_PATH} fill={PALETTE.glass} />
      <g clipPath="url(#bottle-interior)">
        <rect
          id={ID.bottleLiquid}
          ref={bottleLiquidRef}
          x={206}
          y={initial.bottle.y}
          width={188}
          height={initial.bottle.height}
          fill={LIQUID_RED}
        />
        <path
          d="M212 424 C240 442 260 410 300 424 C340 438 360 408 388 424 V444 H212 Z"
          fill={PALETTE.liquidLight}
        />
        <g ref={bubblesRef} opacity={0} aria-hidden>
          {BUBBLES.map((bubble, index) => (
            <circle
              key={bubble.cx}
              id={`bubble-${index}`}
              cx={bubble.cx}
              cy={600}
              r={bubble.r}
              fill={PALETTE.bubble}
              stroke="#ffffff"
              strokeWidth={2.5}
            />
          ))}
        </g>
      </g>

      {/* Şişenin yüzü */}
      <g aria-hidden>
        <g ref={blushRef} opacity={0}>
          <ellipse cx={240} cy={514} rx={15} ry={9} fill={PALETTE.blush} />
          <ellipse cx={360} cy={514} rx={15} ry={9} fill={PALETTE.blush} />
        </g>
        <g ref={eyesRef}>
          <circle cx={268} cy={486} r={20} fill="#ffffff" stroke={PALETTE.ink} strokeWidth={4} />
          <circle cx={332} cy={486} r={20} fill="#ffffff" stroke={PALETTE.ink} strokeWidth={4} />
          <circle cx={270} cy={490} r={9} fill={PALETTE.ink} />
          <circle cx={334} cy={490} r={9} fill={PALETTE.ink} />
        </g>
        <path
          ref={mouthRef}
          d={MOUTHS[trend]}
          fill={trend === "heating" ? PALETTE.ink : "none"}
          stroke={PALETTE.ink}
          strokeWidth={5}
        />
      </g>

      <path d={BOTTLE_PATH} fill="none" stroke={PALETTE.ink} strokeWidth={5} />
      <path d="M226 444 V498" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={8} />

      {/* Delikli kapak */}
      <rect
        x={246}
        y={300}
        width={108}
        height={30}
        rx={8}
        fill={PALETTE.cap}
        stroke={PALETTE.ink}
        strokeWidth={4}
      />
      <g stroke={PALETTE.capLight} strokeWidth={3}>
        <line x1={262} y1={309} x2={262} y2={321} />
        <line x1={274} y1={309} x2={274} y2={321} />
        <line x1={326} y1={309} x2={326} y2={321} />
        <line x1={338} y1={309} x2={338} y2={321} />
      </g>

      {/* Kapağı sızdırmaz yapan oyun hamuru */}
      <path d={PUTTY_PATH} fill={PALETTE.putty} stroke={PALETTE.ink} strokeWidth={4} />
      <g stroke={PALETTE.puttyDark} strokeWidth={2.5} opacity={0.9}>
        <line x1={268} y1={296} x2={278} y2={291} />
        <line x1={324} y1={296} x2={332} y2={292} />
      </g>

      {/* Pipet ve içindeki sıvı sütunu */}
      <rect x={286} y={44} width={28} height={302} rx={9} fill={PALETTE.glass} />
      <g clipPath="url(#pipette-interior)">
        <rect
          id={ID.pipetteLiquid}
          ref={pipetteLiquidRef}
          x={293}
          y={initial.pipette.y}
          width={14}
          height={initial.pipette.height}
          fill={LIQUID_RED}
        />
      </g>
      <rect
        x={286}
        y={44}
        width={28}
        height={302}
        rx={9}
        fill="none"
        stroke={PALETTE.ink}
        strokeWidth={4}
      />
      <line x1={294} y1={58} x2={294} y2={330} stroke="#ffffff" strokeOpacity={0.65} strokeWidth={4} />
      <ellipse
        id={ID.pipetteMeniscus}
        ref={pipetteMeniscusRef}
        cx={300}
        cy={initial.pipette.y}
        rx={7}
        ry={2.5}
        fill={PALETTE.liquidLight}
      />

      {/* Ölçeğin iki ucu: güneş ve kar tanesi */}
      <g aria-hidden stroke={PALETTE.ink} strokeWidth={3}>
        <circle cx={232} cy={92} r={13} fill={PALETTE.sun} />
        <g>
          <line x1={232} y1={68} x2={232} y2={74} />
          <line x1={232} y1={110} x2={232} y2={116} />
          <line x1={208} y1={92} x2={214} y2={92} />
          <line x1={250} y1={92} x2={256} y2={92} />
          <line x1={215} y1={75} x2={219} y2={79} />
          <line x1={245} y1={105} x2={249} y2={109} />
          <line x1={249} y1={75} x2={245} y2={79} />
          <line x1={219} y1={105} x2={215} y2={109} />
        </g>
        <g stroke={PALETTE.sea}>
          <line x1={232} y1={246} x2={232} y2={278} />
          <line x1={218} y1={254} x2={246} y2={270} />
          <line x1={218} y1={270} x2={246} y2={254} />
          <line x1={226} y1={250} x2={238} y2={250} />
          <line x1={226} y1={274} x2={238} y2={274} />
        </g>
      </g>

      {/* Oda sıcaklığı çizgisi ve anlık seviye oku */}
      <line
        id={ID.referenceLevel}
        ref={referenceLevelRef}
        x1={266}
        y1={referenceY}
        x2={334}
        y2={referenceY}
        stroke={PALETTE.ink}
        strokeWidth={3}
        strokeDasharray="7 6"
        opacity={0.45}
      />
      <text x={254} y={referenceY - 10} textAnchor="end" fill={MARKER_INK} fontSize={14} opacity={0.7}>
        oda sıcaklığı
      </text>
      <g id={ID.levelMarker} ref={levelMarkerRef} transform={`translate(0 ${initial.pipette.y})`}>
        <path
          d="M366 -9 L346 0 L366 9 Z"
          fill="var(--thermal)"
          stroke={PALETTE.ink}
          strokeWidth={3}
        />
      </g>

      {/* Keçeli kalemle bırakılan seviye işaretleri */}
      <g id={ID.markerLayer} ref={markerLayerRef}>
        {markers.map((marker) => (
          <g
            key={marker.id}
            data-fresh={marker.id === lastMarkerId ? "true" : "false"}
            transform={`rotate(${marker.tilt} ${MARKER_LINE.start} ${marker.y})`}
          >
            <line
              x1={MARKER_LINE.start}
              y1={marker.y}
              x2={MARKER_LINE.end}
              y2={marker.y}
              stroke={MARKER_INK}
              strokeWidth={4}
            />
            <circle
              cx={MARKER_LINE.start}
              cy={marker.y}
              r={6}
              fill={PALETTE.leaf}
              stroke={MARKER_INK}
              strokeWidth={3}
            />
            <text x={378} y={marker.y + 5} className="tabular" fill={MARKER_INK} fontSize={15}>
              {formatTemperature(marker.temperature)} °C
            </text>
          </g>
        ))}
      </g>

      {/* Etiketler */}
      <g fill={MARKER_INK} fontSize={16}>
        <text x={140} y={140} textAnchor="end">
          Pipet
        </text>
        <text x={140} y={296} textAnchor="end">
          Oyun hamuru
        </text>
        <text x={488} y={318}>
          Delikli kapak
        </text>
        <text x={488} y={446}>
          Kırmızı su
        </text>
        <text x={488} y={562}>
          Kaptaki su
        </text>
      </g>
      <g stroke={PALETTE.ink} strokeWidth={2.5} fill="none" opacity={0.6}>
        <path d="M148 135 H280" />
        <path d="M148 291 H258" />
        <path d="M482 313 H358" />
        <path d="M482 441 H392" />
        <path d="M482 557 H430" />
      </g>
    </svg>
  );
}
```

## `src/components/ConceptCard.tsx`

```tsx
import { useRef, type JSX } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { ThermalTrend } from "../types/simulation";
import { CONCEPT_NOTES } from "../lib/constants";
import { prefersReducedMotion } from "../lib/motion";

interface ConceptCardProps {
  /** Sütunun gidişatı. "stable" olunca kart bir süre sonra solar. */
  readonly trend: ThermalTrend;
}

/** Denge kurulduktan sonra kartın ekranda kaldığı süre (saniye). */
const HOLD_AFTER_SETTLE = 2.4;

/**
 * Şişenin ağzından çıkan konuşma balonu. Sıvı yükselirken genleşmeyi,
 * alçalırken büzülmeyi anlatır; belirsizden belirgine gelir.
 */
export function ConceptCard({ trend }: ConceptCardProps): JSX.Element {
  const cardRef = useRef<HTMLDivElement | null>(null);

  /**
   * Son hareketin yönü. Kart solarken metnin yerinde kalması için
   * "stable" durumunda güncellenmez.
   */
  const lastTrend = useRef<"heating" | "cooling" | null>(null);
  if (trend !== "stable") lastTrend.current = trend;
  const note = lastTrend.current === null ? null : CONCEPT_NOTES[lastTrend.current];

  useGSAP(
    () => {
      const card = cardRef.current;
      if (!card || note === null) return;

      const duration = prefersReducedMotion() ? 0 : 0.45;

      if (trend === "stable") {
        gsap.to(card, {
          opacity: 0,
          y: 8,
          duration,
          delay: HOLD_AFTER_SETTLE,
          ease: "power2.in",
          overwrite: true,
        });
        return;
      }

      gsap.fromTo(
        card,
        { opacity: 0, y: 16, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          ease: "back.out(1.7)",
          overwrite: true,
        },
      );
    },
    { dependencies: [trend, note] },
  );

  return (
    <div
      ref={cardRef}
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute bottom-5 left-5 right-5 opacity-0 sm:right-auto sm:max-w-[19rem]"
    >
      {note !== null && (
        <div className="chunky relative bg-sun/25 p-4">
          <span
            aria-hidden
            className="absolute -bottom-[14px] left-9 h-5 w-5 rotate-45 border-b-3 border-r-3 border-ink bg-[#fff4d8]"
          />
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-2xl leading-none">
              {note.emoji}
            </span>
            <h3 className="display text-xl">{note.title}!</h3>
          </div>
          <p className="mt-1.5 text-[15px] leading-snug">{note.body}</p>
        </div>
      )}
    </div>
  );
}
```

## `src/components/ControlPanel.tsx`

```tsx
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
```

## `src/components/TemperatureSlider.tsx`

```tsx
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
```
