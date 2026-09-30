import type { Point, PenType } from '../../../types';
import { samplePressure, smoothTowards } from '../penEngine';

export const INK_CONFIGURATION = Object.freeze({
    minCutoff: 8, beta: 0.025, derivativeCutoff: 12,
    velocityTimeConstant: 0.025, predictionCount: 8, predictionHorizonMs: 35,
    cornerCosine: 0.35,
});

/** Feature detection, chronological samples and exact duplicate removal. */
export function actualSamples(event: PointerEvent): PointerEvent[] {
    const samples = [...(event.getCoalescedEvents?.() ?? []), event]
        .filter(p => p.pointerId === event.pointerId && Number.isFinite(p.timeStamp))
        .sort((a, b) => a.timeStamp - b.timeStamp);
    return samples.filter((p, i) => !i || p.timeStamp !== samples[i - 1].timeStamp ||
        p.clientX !== samples[i - 1].clientX || p.clientY !== samples[i - 1].clientY ||
        p.pressure !== samples[i - 1].pressure);
}

export function predictedSamples(event: PointerEvent): PointerEvent[] {
    const source = event as PointerEvent & { getPredictedEvents?: () => PointerEvent[] };
    return (source.getPredictedEvents?.() ?? []).filter(p => p.pointerId === event.pointerId &&
        p.timeStamp > event.timeStamp && p.timeStamp - event.timeStamp <= INK_CONFIGURATION.predictionHorizonMs)
        .sort((a, b) => a.timeStamp - b.timeStamp).slice(0, INK_CONFIGURATION.predictionCount);
}

const alpha = (cutoff: number, dt: number) => 1 / (1 + 1 / (2 * Math.PI * cutoff * dt));

/** Per-stroke state; prediction runs on a copy and cannot affect confirmed input. */
export class InkInput {
    constructor(private readonly smoothing = 1, private readonly legacy = false) {}
    private raw?: Point;
    private filtered?: Point;
    private dx = 0;
    private dy = 0;
    private time = 0;
    private velocity = 0;
    private direction?: Point;

    fork(): InkInput { return Object.assign(new InkInput(), this); }

    sample(event: PointerEvent, position: Point, pen?: PenType, constrained = false): Point | null {
        if (this.raw && event.timeStamp <= this.time) return null;
        const dt = this.raw ? Math.min(0.1, Math.max(0.001, (event.timeStamp - this.time) / 1000)) : 1 / 120;
        const vx = this.raw ? (position.x - this.raw.x) / dt : 0;
        const vy = this.raw ? (position.y - this.raw.y) / dt : 0;
        const da = alpha(INK_CONFIGURATION.derivativeCutoff, dt);
        this.dx += da * (vx - this.dx);
        this.dy += da * (vy - this.dy);
        const speed = Math.hypot(vx, vy);
        const va = 1 - Math.exp(-dt / INK_CONFIGURATION.velocityTimeConstant);
        this.velocity += va * (speed - this.velocity);
        const previousDirection = this.direction;
        const corner = previousDirection && speed > 0 &&
            (vx * previousDirection.x + vy * previousDirection.y) / speed < INK_CONFIGURATION.cornerCosine;
        const a = constrained || corner ? 1 : alpha(INK_CONFIGURATION.minCutoff / this.smoothing +
            INK_CONFIGURATION.beta / this.smoothing * Math.hypot(this.dx, this.dy), dt);
        const p = samplePressure(event.pressure, event.pointerType, this.velocity / 1000, this.filtered?.p, pen);
        const point: Point = {
            x: this.filtered ? this.filtered.x + a * (position.x - this.filtered.x) : position.x,
            y: this.filtered ? this.filtered.y + a * (position.y - this.filtered.y) : position.y,
            p, timestamp: event.timeStamp, pressure: event.pressure,
            velocity: this.velocity, tiltX: event.tiltX || 0, tiltY: event.tiltY || 0,
            twist: event.twist || 0,
        };
        if (this.legacy && this.filtered && !constrained) {
            const legacy = smoothTowards(this.filtered, position,
                Math.hypot(position.x - this.filtered.x, position.y - this.filtered.y), 0.45 * this.smoothing);
            point.x = legacy.x;
            point.y = legacy.y;
        }
        this.raw = position;
        this.filtered = point;
        this.time = event.timeStamp;
        if (speed > 0) this.direction = { x: vx / speed, y: vy / speed };
        return point;
    }
}
