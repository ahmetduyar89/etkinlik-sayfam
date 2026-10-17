import type { Viewport } from '../../../types';

/** Reset the physical page to 100%, keeping its center in the visible canvas. */
export function actualSizePageView(
    page: { x: number; y: number; w: number; h: number } | null,
    canvas: { w: number; h: number },
): Viewport {
    if (!page || canvas.w <= 0 || canvas.h <= 0) return { scale: 1, tx: 0, ty: 0 };
    return {
        scale: 1,
        tx: canvas.w / 2 - (page.x + page.w / 2),
        ty: canvas.h / 2 - (page.y + page.h / 2),
    };
}
