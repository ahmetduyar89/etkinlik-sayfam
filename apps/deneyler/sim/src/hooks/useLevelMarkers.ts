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
