import { distance, type Point, type RecognizedShape, type ShapeRecognizer, type TimerScheduler } from './models';
import { shapeCenter, transformShape } from './geometry';
import { GeometricShapeRecognizer } from './recognition';

export const HOLD_DELAY_MS = 450;
export const HOLD_SLOP_PX = 10;
export type TouchState = 'idle' | 'drawing' | 'holding' | 'shaped';
const browserScheduler: TimerScheduler = {
    set: (callback, delay) => globalThis.setTimeout(callback, delay),
    clear: handle => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/** One owner pointer and one timer per gesture. Predictions must NEVER be passed here.
 * Timers use a generation token so stale callbacks cannot morph a later stroke.
 * end/cancel/tool change/unmount all release pending work through cancel().
 */
export class DrawHoldController {
    state: TouchState = 'idle';
    private owner: number | null = null;
    private timer: unknown;
    private generation = 0;
    private anchor: Point = { x: 0, y: 0 };
    private current: Point = { x: 0, y: 0 };
    private scale = 1;
    private points: readonly Point[] = [];
    private fitted: RecognizedShape | null = null;
    private origin: Point = { x: 0, y: 0 };
    private pivot: Point = { x: 0, y: 0 };
    private publish?: (shape: RecognizedShape) => void;

    constructor(private readonly recognizer: ShapeRecognizer = new GeometricShapeRecognizer(), private readonly scheduler: TimerScheduler = browserScheduler) {}

    begin(pointerId: number, point: Point, points: readonly Point[], scale: number, publish: (shape: RecognizedShape) => void): void {
        this.cancel();
        this.owner = pointerId; this.anchor = { ...point }; this.current = { ...point };
        this.points = points; this.scale = scale; this.publish = publish; this.state = 'drawing'; this.arm();
    }

    move(pointerId: number, point: Point, points: readonly Point[], scale: number, snap = false): boolean {
        if (pointerId !== this.owner || this.state === 'idle') return false;
        this.current = { ...point }; this.points = points;
        if (this.fitted) {
            this.publish?.(transformShape(this.fitted, this.pivot, this.origin, point, snap));
            return true;
        }
        if (scale !== this.scale || distance(this.anchor, point) * scale >= HOLD_SLOP_PX) {
            this.anchor = { ...point }; this.scale = scale; this.disarm(); this.arm();
        }
        return false;
    }

    /** Pointer cancellation has no output; the canvas discards its active preview. */
    end(pointerId: number): void { if (pointerId === this.owner) this.cancel(); }
    cancel(): void {
        this.disarm(); this.state = 'idle'; this.owner = null; this.points = []; this.fitted = null; this.publish = undefined;
    }
    private disarm(): void {
        this.generation++;
        if (this.timer !== undefined) this.scheduler.clear(this.timer);
        this.timer = undefined;
    }
    private arm(): void {
        const token = this.generation;
        this.state = 'holding';
        this.timer = this.scheduler.set(() => {
            if (token !== this.generation || this.owner === null) return;
            this.timer = undefined;
            const shape = this.recognizer.recognize(this.points, this.scale);
            if (!shape) { this.state = 'drawing'; return; }
            this.fitted = shape; this.origin = { ...this.current }; this.pivot = shapeCenter(shape);
            this.state = 'shaped'; this.publish?.(shape);
        }, HOLD_DELAY_MS);
    }
}
