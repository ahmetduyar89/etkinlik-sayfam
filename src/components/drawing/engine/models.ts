/** Public, renderer-independent contracts. Coordinates are logical document pixels. */
export interface Point { x: number; y: number }
export interface StrokePoint extends Point {
    pressure: number;
    tilt?: number;
    timestamp: number;
}
export interface BrushSettings {
    type: 'pen' | 'highlighter' | 'shapeTool' | 'eraser';
    color: string;
    baseWidth: number;
    minWidth: number;
    maxWidth: number;
    pressureSensitivity: number;
    smoothingFactor: number;
}
export type RecognizedShape =
    | { kind: 'line'; start: Point; end: Point }
    | { kind: 'arrow'; start: Point; end: Point; headAngle: number }
    | { kind: 'circle'; center: Point; radius: number }
    | { kind: 'ellipse'; center: Point; radiusX: number; radiusY: number; rotation: number }
    | { kind: 'polygon'; points: Point[]; isClosed: boolean };

export interface ShapeRecognizer {
    /** scale converts document coordinates to screen pixels for all tolerances. */
    recognize(points: readonly Point[], scale?: number): RecognizedShape | null;
}
export interface TimerScheduler {
    set(callback: () => void, delayMs: number): unknown;
    clear(handle: unknown): void;
}
export const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
