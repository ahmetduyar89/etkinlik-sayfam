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
