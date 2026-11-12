import type { BoundingBox, Point } from '../../../types';

/** Conservative bounds: obsolete prediction extents remain until the stroke ends. */
export function extendActiveBounds(previous: BoundingBox, confirmed: Point[], start: number, predicted: Point[]): BoundingBox {
    const bounds = { ...previous };
    const include = (point: Point) => {
        bounds.x1 = Math.min(bounds.x1, point.x);
        bounds.y1 = Math.min(bounds.y1, point.y);
        bounds.x2 = Math.max(bounds.x2, point.x);
        bounds.y2 = Math.max(bounds.y2, point.y);
    };
    for (let i = Math.max(0, start); i < confirmed.length; i++) include(confirmed[i]);
    for (const point of predicted) include(point);
    return bounds;
}
