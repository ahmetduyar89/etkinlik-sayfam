import type { DrawingCanvasHandle } from '../../../types';

/** Dev-only regression: broad iPad finger contacts must reach pinch, never ink. */
export async function verifyGestures(canvas: HTMLCanvasElement, handle: DrawingCanvasHandle): Promise<string> {
    const rect = canvas.getBoundingClientRect();
    const before = handle.getPages()[0]?.length ?? 0;
    const emit = (type: string, id: number, x: number, pointerType = 'touch', width = 60) =>
        canvas.dispatchEvent(new PointerEvent(type, {bubbles:true, pointerId:id, pointerType,
            clientX:rect.left+x, clientY:rect.top+180, width, height:width,
            pressure:.5, buttons:type === 'pointerup' || type === 'pointercancel' ? 0 : 1}));
    const wait = () => new Promise(resolve => setTimeout(resolve,40));
    const equal = (a: number, b: number) => Math.abs(a-b)<.001;
    handle.resetView(); await wait();
    try {
        // Pencil hover refreshes priority; gestures must still work immediately.
        emit('pointermove', 940, 80, 'pen', 1);
        emit('pointerdown', 941, 100); emit('pointerdown', 942, 200);
        emit('pointermove', 942, 300); await wait();
        if (!equal(handle.getView().scale,2)) throw new Error('Broad contacts did not zoom in');
        emit('pointermove', 942, 150); await wait();
        if (!equal(handle.getView().scale,.5)) throw new Error('Pinch did not zoom out');
        // Translate both contacts while preserving their separation.
        const start = handle.getView();
        emit('pointermove', 941, 160); emit('pointermove', 942, 210); await wait();
        const shifted = handle.getView();
        if (!equal(shifted.scale,start.scale) || !equal(shifted.tx-start.tx,60)) throw new Error('Pinch pan anchor incorrect');
        emit('pointerup', 941, 160); emit('pointerup', 942, 210); await wait();
        if ((handle.getPages()[0]?.length ?? 0) !== before) throw new Error('Gesture produced ink or undo');
        // A cancelled stationary gesture must not undo existing content.
        emit('pointerdown', 941, 100); emit('pointerdown', 942, 200);
        emit('pointercancel', 941, 100); emit('pointerup', 942, 200); await wait();
        if ((handle.getPages()[0]?.length ?? 0) !== before) throw new Error('Cancelled gesture triggered undo');
        // Contacts resting during actual Pencil ink must not change the viewport.
        const penView = handle.getView();
        emit('pointerdown', 940, 80, 'pen', 1);
        emit('pointerdown', 941, 100); emit('pointerdown', 942, 200); emit('pointermove', 942, 300);
        if (!equal(handle.getView().scale,penView.scale)) throw new Error('Palm interrupted active Pencil');
        emit('pointercancel', 940, 80, 'pen', 1); emit('pointercancel', 941, 100); emit('pointercancel', 942, 300);
        return 'İki parmak büyütme/küçültme, kaydırma, geniş temas, Pencil hover ve avuç koruması: geçti';
    } finally {
        emit('pointercancel',941,100); emit('pointercancel',942,200); emit('pointercancel',940,80,'pen',1);
        handle.resetView();
    }
}
