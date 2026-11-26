import { ribbonOutline, outlinePath } from '../goodnotes/InkEngine';
import type { GoodnotesPen } from '../goodnotes/types';
import { clamp, distance, type BrushSettings, type StrokePoint } from './models';

/** Strict API for standalone/native adapters, backed by the production ribbon renderer. */
export function brushOutline(points: readonly StrokePoint[], settings: BrushSettings, pen: GoodnotesPen = 'fountain', complete = false) {
    if (![settings.baseWidth, settings.minWidth, settings.maxWidth, settings.smoothingFactor, settings.pressureSensitivity].every(Number.isFinite) ||
        settings.minWidth <= 0 || settings.maxWidth < settings.minWidth || settings.baseWidth <= 0) throw new RangeError('Invalid brush settings');
    let velocity = 0;
    const samples = points.map((p, i) => {
        if (![p.x, p.y, p.pressure, p.timestamp].every(Number.isFinite)) throw new RangeError('Invalid stroke sample');
        const previous = points[Math.max(0, i - 1)];
        const dt = Math.max(1, p.timestamp - previous.timestamp);
        const speed = distance(previous, p) * 1000 / dt;
        velocity += (1 - Math.exp(-dt / 25)) * (speed - velocity);
        return { ...p, p: clamp(p.pressure), velocity, tiltX: p.tilt ?? 0 };
    });
    return ribbonOutline(samples, { pen: settings.type === 'highlighter' || settings.type === 'eraser' ? 'ballpoint' : pen,
        width: settings.baseWidth, sensitivity: clamp(settings.pressureSensitivity), sharpness: .5, settings, complete });
}
export function brushPath(points: readonly StrokePoint[], settings: BrushSettings, pen: GoodnotesPen = 'fountain', complete = false): Path2D {
    return outlinePath(brushOutline(points, settings, pen, complete));
}
