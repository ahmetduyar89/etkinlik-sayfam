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
