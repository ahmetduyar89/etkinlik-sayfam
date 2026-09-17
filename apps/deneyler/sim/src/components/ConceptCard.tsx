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
