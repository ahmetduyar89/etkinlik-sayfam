import type { DrawingCanvasHandle, Point } from '../../../types';

/** Development-only browser acceptance test. Uses the same React pointer handlers as hardware. */
export async function verifyCanvas(canvas: HTMLCanvasElement, handle: DrawingCanvasHandle, highlighter = false): Promise<string> {
    const rect = canvas.getBoundingClientRect();
    const offset = { x: rect.left + 120, y: rect.top + 100 };
    const segment = (a: Point, b: Point) => Array.from({ length: 25 }, (_, i) => ({ x: a.x + (b.x - a.x) * i / 24, y: a.y + (b.y - a.y) * i / 24 }));
    const polygon = (vertices: Point[]) => vertices.flatMap((a, i) => segment(a, vertices[(i + 1) % vertices.length]));
    const circle = Array.from({ length: 81 }, (_, i) => ({ x: 80 + 60 * Math.cos(i * Math.PI / 40), y: 80 + 60 * Math.sin(i * Math.PI / 40) }));
    const ellipse = circle.map(p => ({ x: p.x * 1.5, y: p.y })).map(p => ({ x: p.x * Math.cos(.6) - p.y * Math.sin(.6), y: p.x * Math.sin(.6) + p.y * Math.cos(.6) }));
    const arrow = [...segment({ x: 0, y: 0 }, { x: 160, y: 0 }), ...segment({ x: 160, y: 0 }, { x: 130, y: -20 }), ...segment({ x: 130, y: -20 }, { x: 160, y: 0 }), ...segment({ x: 160, y: 0 }, { x: 130, y: 20 })];
    const dispatch = (type: string, p: Point, pointerId = 909) => canvas.dispatchEvent(new PointerEvent(type, {
        bubbles: true, pointerId, pointerType: 'pen', isPrimary: true,
        clientX: offset.x + p.x, clientY: offset.y + p.y, buttons: type === 'pointerup' ? 0 : 1,
        pressure: .65, tiltX: 20, tiltY: 5,
    }));
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const initialCount = handle.getPages()[0]?.length ?? 0;
    const cases: [Point[], string, boolean][] = [
        [segment({ x: 0, y: 0 }, { x: 160, y: 3 }), 'line', true],
        [circle, 'circle', false], [ellipse, 'ellipse', true],
        [polygon([{ x: 0, y: 0 }, { x: 130, y: 0 }, { x: 130, y: 80 }, { x: 0, y: 80 }]), 'polygon', true],
        [polygon([{ x: 0, y: 0 }, { x: 130, y: 80 }, { x: 0, y: 100 }]), 'polygon', false],
        [arrow, 'arrow', true],
    ];
    for (const [index, [points, expected, drag]] of cases.entries()) {
        offset.x = rect.left + 60 + (index % 2) * 300;
        offset.y = rect.top + 60 + Math.floor(index / 2) * 220;
        dispatch('pointerdown', points[0]);
        for (const point of points.slice(1)) dispatch('pointermove', point);
        await wait(520);
        // A foreign touch must neither transform nor commit the owned pen stroke.
        dispatch('pointermove', { x: 450, y: 400 }, 910);
        dispatch('pointerup', { x: 450, y: 400 }, 910);
        const end = points[points.length - 1];
        const target = drag ? { x: end.x + 40, y: end.y + 50 } : end;
        if (drag) dispatch('pointermove', target);
        dispatch('pointerup', target);
        await wait(30);
        const stored = handle.getPages()[0]?.at(-1);
        if (stored?.tool !== expected) throw new Error(`${expected}: got ${stored?.tool}`);
        if (highlighter && stored.shapeInk !== 'highlighter') throw new Error('Highlighter blend missing');
        if (expected === 'ellipse' && !stored.rotation) throw new Error('Ellipse rotation missing');
    }
    const beforeCancel = handle.getPages()[0]?.length ?? 0;
    dispatch('pointerdown', circle[0]);
    circle.slice(1).forEach(p => dispatch('pointermove', p));
    dispatch('pointercancel', circle[circle.length - 1]);
    await wait(520);
    if ((handle.getPages()[0]?.length ?? 0) !== beforeCancel) throw new Error('Cancelled ink committed');
    handle.undo(); await wait(30); handle.redo(); await wait(30);
    if ((handle.getPages()[0]?.length ?? 0) !== initialCount + cases.length) throw new Error('Undo/redo mismatch');
    return '6 şekil, basılı sürükleme, işaretçi sahipliği, iptal ve geri al/ileri al: geçti';
}
