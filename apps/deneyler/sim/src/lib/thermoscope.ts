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
