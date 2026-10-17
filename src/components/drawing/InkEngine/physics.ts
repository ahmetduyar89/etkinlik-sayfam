import type { DrawConfig, PenType, Point, PressureSensitivity } from '../../../types';

export const PRESSURE_GAMMA: Record<PressureSensitivity, number> = { soft: 0.65, normal: 1, firm: 1.65 };
export const TOOL_PHYSICS: Record<PenType, { min: number; max: number; velocity: number; tilt: number }> = {
    ballpoint: { min: 0.88, max: 1.12, velocity: 0.02, tilt: 0 },
    fountain: { min: 0.25, max: 1.85, velocity: 0.22, tilt: 0.12 },
    brush: { min: 0.15, max: 2.8, velocity: 0.3, tilt: 0.5 },
    calligraphy: { min: 0.2, max: 2.3, velocity: 0.15, tilt: 0.3 },
    marker: { min: 0.94, max: 1.06, velocity: 0, tilt: 0 },
    graphite: { min: 0.35, max: 2.4, velocity: 0.08, tilt: 0.85 },
};
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export function widthFactor(point: Point, pen: PenType = 'ballpoint', sensitivity: PressureSensitivity = 'normal'): number {
    const model = TOOL_PHYSICS[pen] ?? TOOL_PHYSICS.ballpoint;
    const pressure = Math.pow(clamp(point.p ?? 0.5, 0, 1), PRESSURE_GAMMA[sensitivity] ?? 1);
    const speed = clamp((point.velocity ?? 0) / 1600, 0, 1);
    const tilt = clamp(Math.hypot(point.tiltX ?? 0, point.tiltY ?? 0) / 90, 0, 1);
    return clamp((model.min + (model.max - model.min) * pressure) *
        (1 - speed * model.velocity) * (1 + tilt * model.tilt), model.min, model.max);
}

/** Support radius of an elliptical nib along the stroke normal.
 * Supports Apple Pencil tilt, azimuth, and Apple Pencil Pro barrel roll (twist). */
export function nibFactor(point: Point, tangent: { x: number; y: number }, pen?: PenType): number {
    if (pen !== 'fountain' && pen !== 'brush' && pen !== 'calligraphy') return 1;
    const tilt = Math.hypot(point.tiltX ?? 0, point.tiltY ?? 0);
    // If twist is provided (Apple Pencil Pro barrel roll: 0..359 deg), use it;
    // otherwise fallback to tilt orientation or default 45-deg calligraphic angle.
    let angle = Math.PI / 4;
    if (typeof point.twist === 'number' && point.twist !== 0) {
        angle = (point.twist * Math.PI) / 180;
    } else if (tilt > 5) {
        angle = Math.atan2(point.tiltY ?? 0, point.tiltX ?? 0);
    }
    const normalX = -tangent.y, normalY = tangent.x;
    const major = normalX * Math.cos(angle) + normalY * Math.sin(angle);
    const minor = -normalX * Math.sin(angle) + normalY * Math.cos(angle);
    const eccentricity = pen === 'calligraphy' ? 0.35 : pen === 'brush' ? 0.75 : 0.65;
    return Math.hypot(major, minor * eccentricity);
}

/** Shared by erasing and its cursor; precision uses half the normal contact radius. */
export function eraserContactRadius(config: Pick<DrawConfig, 'eraserMode' | 'eraserSize' | 'width'>): number {
    const radius = config.eraserSize === 'small' ? 12 : config.eraserSize === 'medium' ? 24 : config.eraserSize === 'large' ? 48 : Math.max(6, config.width * 5);
    return config.eraserMode === 'precision' ? radius * 0.5 : radius;
}
