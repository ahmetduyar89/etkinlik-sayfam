import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(join(tmpdir(), 'ink-test-'));
try {
    await build({ entryPoints: ['src/components/drawing/InkEngine/input.ts', 'src/components/notebooks/pageCodec.ts', 'src/components/drawing/InkEngine/physics.ts', 'src/components/drawing/penEngine.ts', 'src/components/drawing/InkEngine/graphite.ts', 'src/components/drawing/InkEngine/frameQueue.ts', 'src/components/drawing/InkEngine/spatialIndex.ts', 'src/components/drawing/InkEngine/history.ts', 'src/components/drawing/InkEngine/activeBounds.ts', 'src/components/drawing/InkEngine/presets.ts', 'src/components/drawing/InkEngine/toolMemory.ts', 'src/components/drawing/InkEngine/simplification.ts', 'src/components/drawing/InkEngine/nativeBridge.ts'], outdir: dir, bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' } });
    const { InkInput, actualSamples, predictedSamples } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/input.mjs')));
    const { encodePages, decodePages } = await import(pathToFileURL(join(dir, 'notebooks/pageCodec.mjs')));
    const event = (timeStamp, x = 0, pressure = 0.5) => ({ pointerId: 1, pointerType: 'pen', timeStamp, clientX: x, clientY: 0, pressure, tiltX: 25, tiltY: 10, twist: 40 });
    const current = event(20, 20);
    current.getCoalescedEvents = () => [event(20, 20), event(10, 10)];
    assert.deepEqual(actualSamples(current).map(p => p.timeStamp), [10, 20]);
    current.getPredictedEvents = () => [event(100), event(30), event(15)];
    assert.deepEqual(predictedSamples(current).map(p => p.timeStamp), [30]);
    const a = new InkInput(), b = new InkInput();
    const first = a.sample(event(0), { x: 0, y: 0 });
    b.sample(event(0), { x: 0, y: 0 });
    assert.equal(first.p, 0.5, 'hardware midpoint pressure must be preserved');
    a.fork().sample(event(10, 500), { x: 500, y: 0 });
    const point = a.sample(event(20, 20), { x: 20, y: 0 });
    assert.deepEqual(point, b.sample(event(20, 20), { x: 20, y: 0 }), 'predictions cannot mutate confirmed state');
    assert.equal(a.sample(event(10), { x: 1, y: 1 }), null);
    const pages = [{ strokes: [{ tool: 'pencil', color: '#000', points: [first, point] }], boxes: [] }];
    assert.deepEqual(decodePages(encodePages(pages)), pages, 'rich points survive save/load');
    assert.deepEqual(decodePages('[{"strokes":[{"tool":"pencil","points":[[1,2,0.5],{"x":3,"y":4}]}]}]')[0].strokes[0].points, [{ x: 1, y: 2, p: 0.5 }, { x: 3, y: 4 }]);
    const { widthFactor, nibFactor, TOOL_PHYSICS } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/physics.mjs')));
    const { getStrokeOutlinePoints, getInkPath } = await import(pathToFileURL(join(dir, 'drawing/penEngine.mjs')));
    for (const pen of Object.keys(TOOL_PHYSICS)) {
        const low = widthFactor({ p: 0.1 }, pen);
        const high = widthFactor({ p: 0.9 }, pen);
        assert.ok(high > low, `${pen}: pressure response`);
        assert.ok(widthFactor({ p: 0.5 }, pen, 'soft') >= widthFactor({ p: 0.5 }, pen, 'firm'));
        for (let i = 0; i < 100; i++) {
            const width = widthFactor({ p: i / 100, velocity: i * 100, tiltX: 80, tiltY: 80 }, pen);
            assert.ok(width >= TOOL_PHYSICS[pen].min && width <= TOOL_PHYSICS[pen].max, `${pen}: bounds`);
        }
    }
    assert.ok(widthFactor({ p: 0.3, tiltX: 70 }, 'graphite') > widthFactor({ p: 0.3 }, 'graphite'));
    assert.ok(widthFactor({ p: 0.5, velocity: 1200 }, 'brush') < widthFactor({ p: 0.5 }, 'brush'));
    assert.notEqual(nibFactor({}, { x: 1, y: 1 }, 'fountain'), nibFactor({}, { x: -1, y: 1 }, 'fountain'));
    const oldPoints = [{ x: 0, y: 0, p: 0.4 }, { x: 20, y: 10, p: 0.7 }];
    assert.deepEqual(getStrokeOutlinePoints(oldPoints, 3, 'fountain'), getStrokeOutlinePoints(oldPoints, 3, 'fountain', {}));
    const lowDot = getStrokeOutlinePoints([{ x: 0, y: 0, p: 0.1 }], 3, 'brush', { inkVersion: 2 });
    const highDot = getStrokeOutlinePoints([{ x: 0, y: 0, p: 0.9 }], 3, 'brush', { inkVersion: 2 });
    assert.ok(highDot[0].x > lowDot[0].x, 'dots respond to pressure');
    const versioned = [{ strokes: [{ ...pages[0].strokes[0], inkVersion: 2, pressureSensitivity: 'firm', opacity: 0.3 }], boxes: [] }];
    assert.deepEqual(decodePages(encodePages(versioned)), versioned);
    const { InkFrameQueue } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/frameQueue.mjs')));
    const { forEachGraphiteStamp, graphiteDensity, GRAPHITE_CONFIG } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/graphite.mjs')));
    let pendingFrame, scheduled = 0, cancelled = 0, displayed = '';
    const queue = new InkFrameQueue(callback => { pendingFrame = callback; return ++scheduled; }, () => { cancelled++; pendingFrame = null; });
    queue.schedule(() => { displayed = 'old'; });
    queue.schedule(() => { displayed = 'latest'; });
    assert.equal(scheduled, 1, 'one presentation callback per frame');
    pendingFrame(16);
    assert.equal(displayed, 'latest');
    queue.schedule(() => { displayed = 'stale'; });
    queue.cancel();
    assert.equal(cancelled, 1);
    assert.equal(pendingFrame, null);
    assert.equal(displayed, 'latest', 'cancelled previews cannot overwrite committed ink');
    const stamps = points => { const out = []; forEachGraphiteStamp(points, p => out.push(p)); return out; };
    const short = stamps([{ x: 0, y: 0, p: 0.5 }, { x: 10, y: 0, p: 0.5 }]);
    const extended = stamps([{ x: 0, y: 0, p: 0.5 }, { x: 10, y: 0, p: 0.5 }, { x: 20, y: 0, p: 0.5 }]);
    assert.deepEqual(extended.slice(0, short.length), short, 'extending a stroke must not shimmer existing grain');
    assert.ok(graphiteDensity(0.9) > graphiteDensity(0.1));
    assert.equal(stamps([{ x: 0, y: 0 }, { x: 100000, y: 0 }]).length, GRAPHITE_CONFIG.maxStamps);
    assert.equal(stamps([{ x: 0, y: 0 }, { x: 0, y: 0 }]).length, 1);
    const { SpatialIndex, DocumentSpatialIndex } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/spatialIndex.mjs')));
    const spatial = new SpatialIndex();
    const entries = Array.from({ length: 1000 }, (_, i) => ({ id: i, x1: i % 40 * 40 - 800, y1: Math.floor(i / 40) * 40 - 500, x2: i % 40 * 40 - 770, y2: Math.floor(i / 40) * 40 - 470 }));
    entries.forEach(item => spatial.set(item, item));
    for (let i = 0; i < 100; i++) {
        const box = { x1: i * 17 - 850, y1: i * 9 - 550, x2: i * 17 - 800, y2: i * 9 - 500 };
        const brute = entries.filter(p => p.x1 <= box.x2 && p.x2 >= box.x1 && p.y1 <= box.y2 && p.y2 >= box.y1);
        assert.deepEqual(spatial.query(box), new Set(brute), 'grid matches exhaustive search');
    }
    const huge = { x1: -1e10, y1: -1e10, x2: 1e10, y2: 1e10 };
    spatial.set(huge, huge);
    assert.ok(spatial.query({ x1: 0, y1: 0, x2: 1, y2: 1 }).has(huge));
    spatial.delete(huge);
    assert.equal(spatial.query(huge).size, 1000);
    const remote = { x1: 1e30, y1: 1e30, x2: 1e30, y2: 1e30 };
    spatial.set(remote, remote);
    assert.ok(spatial.query(remote).has(remote), 'large coordinates cannot trap the grid loop');
    let boundsCalls = 0;
    const documentIndex = new DocumentSpatialIndex(item => { boundsCalls++; return item; });
    const page = entries.slice();
    documentIndex.query(page, huge);
    documentIndex.query(page, huge);
    assert.equal(boundsCalls, 1000, 'unchanged documents reuse bounds');
    documentIndex.query(page.slice(1), huge);
    assert.equal(boundsCalls, 1000, 'erasing does not rebuild survivor geometry');
    documentIndex.invalidate();
    assert.equal(documentIndex.query([entries[0]], huge).size, 1);
    const { InkHistory } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/history.mjs')));
    const ha = { id: 'a' }, hb = { id: 'b' }, hc = { id: 'c' }, replacement = { id: 'b', color: 'red' };
    const history = new InkHistory(80, item => item.id);
    history.begin([ha, hb]); history.finish([ha, hb, hc]);
    assert.equal(history.retainedChanges, 1, 'adding one stroke retains only that stroke');
    assert.deepEqual(history.undo([ha, hb, hc]), [ha, hb]);
    assert.deepEqual(history.redo([ha, hb]), [ha, hb, hc]);
    history.begin([ha, hb, hc]); history.finish([ha, replacement, hc]);
    assert.deepEqual(history.undo([ha, replacement, hc]), [ha, hb, hc]);
    assert.deepEqual(history.redo([ha, hb, hc]), [ha, replacement, hc]);
    history.begin([ha, replacement, hc]); history.finish([hc, replacement, ha]);
    assert.deepEqual(history.undo([hc, replacement, ha]), [ha, replacement, hc]);
    const remoteStroke = { id: 'remote' };
    assert.deepEqual(history.undo([ha, replacement, hc, remoteStroke]), [ha, hb, hc, remoteStroke], 'remote additions survive local undo');
    history.reset();
    history.begin([ha, hb]); history.finish([ha, replacement]);
    const remoteReplacement = { id: 'b', color: 'blue' };
    assert.deepEqual(history.undo([ha, remoteReplacement]), [ha, remoteReplacement], 'newer remote edits win');
    history.reset();
    history.begin([ha, hb]); history.finish([ha, replacement]);
    assert.deepEqual(history.undo([ha]), [ha], 'remote deletion is not resurrected');
    history.reset();
    history.begin([ha, hb, hc]); history.finish([ha]);
    assert.deepEqual(history.undo([ha]), [ha, hb, hc], 'eraser gesture restores all removed strokes together');
    history.begin([ha, hb, hc]); history.finish([ha, hb, hc]);
    assert.ok(history.canRedo, 'no-op gesture preserves redo');
    const limited = new InkHistory(2);
    let currentHistory = [];
    for (const object of [ha, hb, hc]) { limited.begin(currentHistory); currentHistory = [...currentHistory, object]; limited.finish(currentHistory); }
    assert.equal(limited.retainedChanges, 2);
    const deletedAddition = new InkHistory(80, item => item.id);
    deletedAddition.begin([ha]); deletedAddition.finish([ha, hb]);
    assert.deepEqual(deletedAddition.undo([ha]), [ha]);
    assert.equal(deletedAddition.redo([ha]), null, 'no-effect undo must not create a resurrection redo');
    const largeHistory = new InkHistory(80, item => item.id);
    let largePage = Array.from({ length: 1000 }, (_, i) => ({ id: `original-${i}` }));
    for (let i = 0; i < 80; i++) {
        largeHistory.begin(largePage);
        largePage = [...largePage, { id: `added-${i}` }];
        largeHistory.finish(largePage);
    }
    assert.equal(largeHistory.retainedChanges, 80, '80 additions do not retain 80 full page snapshots');
    const splitHistory = new InkHistory(80, item => item.id);
    const fragmentA = { id: 'b', part: 1 }, fragmentB = { id: 'b-split', part: 2 };
    splitHistory.begin([ha, hb, hc]); splitHistory.finish([ha, fragmentA, fragmentB, hc]);
    assert.deepEqual(splitHistory.undo([ha, fragmentA, fragmentB, hc]), [ha, hb, hc]);
    assert.deepEqual(splitHistory.redo([ha, hb, hc]), [ha, fragmentA, fragmentB, hc]);
    // Recording Path2D stand-in checks cache lifecycle; browser test covers actual rendering.
    globalThis.Path2D = class { moveTo() {} quadraticCurveTo() {} closePath() {} };
    const cachedStroke = { tool: 'pencil', color: '#000', points: [{ x: 0, y: 0 }, { x: 20, y: 10 }], inkVersion: 2 };
    const cachedPath = getInkPath(cachedStroke, 3);
    assert.equal(getInkPath(cachedStroke, 3), cachedPath, 'static geometry is reused');
    cachedStroke.points.push({ x: 30, y: 20 });
    assert.notEqual(getInkPath(cachedStroke, 3), cachedPath, 'active appended samples invalidate geometry');
    const resizedPath = getInkPath(cachedStroke, 6);
    assert.notEqual(resizedPath, cachedPath);
    assert.equal(getInkPath(cachedStroke, 6), resizedPath);
    cachedStroke.points = cachedStroke.points.map(p => ({ ...p, x: p.x + 50 }));
    assert.notEqual(getInkPath(cachedStroke, 6), resizedPath, 'transforms invalidate geometry');
    delete globalThis.Path2D;
    const { extendActiveBounds } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/activeBounds.mjs')));
    const previousBounds = { x1: 0, y1: 0, x2: 10, y2: 10 };
    const inaccessibleOldPoint = new Proxy({}, { get() { throw new Error('Old points must not be scanned'); } });
    const grown = extendActiveBounds(previousBounds, [inaccessibleOldPoint, { x: 20, y: -5 }], 1, [{ x: 25, y: 12 }]);
    assert.deepEqual(grown, { x1: 0, y1: -5, x2: 25, y2: 12 });
    assert.deepEqual(previousBounds, { x1: 0, y1: 0, x2: 10, y2: 10 });
    assert.deepEqual(extendActiveBounds(grown, [{ x: 18, y: 8 }], 0, []), grown, 'old predictions remain inside repaint bounds');
    const { decodePresets, capturePenSettings } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/presets.mjs')));
    const preset = { name: 'Mavi ince', settings: capturePenSettings({ tool: 'pencil', color: '#123456', width: 2, penType: 'fountain' }) };
    assert.deepEqual(decodePresets(JSON.stringify([preset])), [preset]);
    assert.deepEqual(decodePresets('broken-json'), []);
    assert.deepEqual(decodePresets(JSON.stringify([{ name: 'bad', settings: { tool: 'image', color: '#123456', width: 2 } }])), []);
    const sanitized = decodePresets(JSON.stringify([{ ...preset, settings: { ...preset.settings, width: 2, injected: 'ignored', highlighterOpacity: 99 } }]))[0];
    assert.equal(sanitized.settings.highlighterOpacity, 0.4);
    assert.equal(sanitized.settings.injected, undefined);
    assert.equal(decodePresets(JSON.stringify(Array(20).fill(preset))).length, 12);
    const { InkToolMemory } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/toolMemory.mjs')));
    const memory = new InkToolMemory();
    const thinPen = { tool: 'pencil', color: '#123456', width: 1.5, penType: 'fountain', pressureSensitivity: 'firm', snapShapes: true };
    const marker = memory.select(thinPen, 'highlighter');
    assert.equal(marker.highlighterOpacity, 0.3);
    const wideMarker = { ...marker, width: 8, color: '#ffff00', highlighterOpacity: 0.25 };
    const restoredPen = memory.select(wideMarker, 'pencil');
    assert.equal(restoredPen.width, 1.5);
    assert.equal(restoredPen.color, '#123456');
    assert.equal(restoredPen.pressureSensitivity, 'firm');
    const erasing = memory.select(restoredPen, 'eraser');
    const restoredMarker = memory.select({ ...erasing, width: 20 }, 'highlighter');
    assert.equal(restoredMarker.width, 8);
    assert.equal(restoredMarker.highlighterOpacity, 0.25);
    assert.equal(restoredMarker.snapShapes, true);
    const { simplifyStroke } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/simplification.mjs')));
    const straightLine = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i, p: 0.5 }));
    const simplifiedLine = simplifyStroke(straightLine, 0.4);
    assert.equal(simplifiedLine.length, 2, 'collinear points are reduced to endpoints');
    assert.deepEqual(simplifiedLine[0], straightLine[0]);
    assert.deepEqual(simplifiedLine[1], straightLine[99]);

    const vShape = [
        ...Array.from({ length: 50 }, (_, i) => ({ x: i, y: i * 2, p: 0.5 })),
        ...Array.from({ length: 50 }, (_, i) => ({ x: 50 + i, y: 100 - i * 2, p: 0.5 })),
    ];
    const simplifiedV = simplifyStroke(vShape, 0.4);
    assert.ok(simplifiedV.length < 10, 'V shape is compacted');
    assert.ok(simplifiedV.some(p => p.x === 49 || p.x === 50), 'sharp corner apex is preserved');

    const twistNibA = nibFactor({ twist: 0 }, { x: 1, y: 0 }, 'fountain');
    const twistNibB = nibFactor({ twist: 90 }, { x: 1, y: 0 }, 'fountain');
    assert.notEqual(twistNibA, twistNibB, 'barrel roll twist modulates nib radius');
    const brushNib = nibFactor({ twist: 45 }, { x: 0, y: 1 }, 'brush');
    assert.ok(brushNib > 0.5 && brushNib < 1.5, 'brush nib factor is bounded');

    globalThis.window = {
        webkit: { messageHandlers: { inkEngine: { postMessage() {} } } },
    };
    const { nativeInkBridge } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/nativeBridge.mjs')));
    let receivedStroke = null;
    const unsub = nativeInkBridge.onStrokeCompleted(s => { receivedStroke = s; });
    globalThis.window.InkEngineNative.onStrokeCompleted({ id: 'test-1', tool: 'pencil', color: '#ff0000', width: 2, points: [{ x: 10, y: 20 }] });
    assert.equal(receivedStroke?.id, 'test-1');
    assert.equal(receivedStroke?.color, '#ff0000');
    unsub();

    const start = performance.now();
    for (let stroke = 0; stroke < 1000; stroke++) {
        const input = new InkInput();
        for (let i = 0; i < 100; i++) {
            const p = input.sample(event(i * 8, i), { x: i, y: Math.sin(i / 10) * 20 });
            assert.ok(Number.isFinite(p.x) && Number.isFinite(p.velocity));
        }
    }
    console.log(`Ink checks passed; 100,000 synthetic samples: ${(performance.now() - start).toFixed(1)} ms (CPU only, not display latency).`);
} finally { await rm(dir, { recursive: true, force: true }); }
