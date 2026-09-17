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
