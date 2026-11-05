import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(join(tmpdir(), 'ink-test-'));
try {
    await build({ entryPoints: ['src/components/drawing/InkEngine/input.ts', 'src/components/drawing/InkEngine/pageViewport.ts', 'src/components/notebooks/pageCodec.ts', 'src/components/drawing/InkEngine/physics.ts', 'src/components/drawing/penEngine.ts', 'src/components/drawing/InkEngine/graphite.ts', 'src/components/drawing/InkEngine/frameQueue.ts', 'src/components/drawing/InkEngine/spatialIndex.ts', 'src/components/drawing/InkEngine/history.ts', 'src/components/drawing/InkEngine/activeBounds.ts', 'src/components/drawing/InkEngine/presets.ts', 'src/components/drawing/InkEngine/toolMemory.ts', 'src/components/drawing/InkEngine/simplification.ts', 'src/components/drawing/InkEngine/nativeBridge.ts', 'src/components/drawing/InkEngine/geometry.ts', 'src/components/drawing/InkEngine/deviceProfile.ts', 'src/components/drawing/InkEngine/delegatedInk.ts', 'src/components/drawing/goodnotes/InkEngine.ts'], outdir: dir, bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' } });
    const { actualSizePageView } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/pageViewport.mjs')));
    for (const [page, canvas] of [
        [{x:0,y:0,w:794,h:1123},{w:1373,h:700}],
        [{x:0,y:0,w:1123,h:794},{w:600,h:900}],
        [{x:40,y:80,w:500,h:700},{w:1000,h:800}],
    ]) {
        const view = actualSizePageView(page,canvas);
        assert.equal(view.scale,1,'100% reset must not fit the page');
        assert.equal((page.x+page.w/2)*view.scale+view.tx,canvas.w/2,'horizontal page center');
        assert.equal((page.y+page.h/2)*view.scale+view.ty,canvas.h/2,'vertical page center');
    }
    assert.deepEqual(actualSizePageView(null,{w:1000,h:800}),{scale:1,tx:0,ty:0},'unbounded canvas reset');
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
    const { widthFactor, nibFactor, TOOL_PHYSICS, eraserContactRadius } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/physics.mjs')));
    const { getStrokeOutlinePoints, getInkPath } = await import(pathToFileURL(join(dir, 'drawing/penEngine.mjs')));
    for (const [eraserSize, radius] of [['small',12],['medium',24],['large',48],['custom',10]]) {
        assert.equal(eraserContactRadius({eraserSize,width:2,eraserMode:'pixel'}),radius);
        assert.equal(eraserContactRadius({eraserSize,width:2,eraserMode:'precision'}),radius/2);
        assert.equal(eraserContactRadius({eraserSize,width:2,eraserMode:'stroke'}),radius);
    }
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

    // ---- Ink v5: smart-board profile, centripetal centreline, capsule union ----
    const { centripetalSpline, inkRadii, traceCapsules, traceCentreline } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/geometry.mjs')));
    const { detectInputProfile, INK_PROFILES } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/deviceProfile.mjs')));
    const { DelegatedInk, opaqueInkColor } = await import(pathToFileURL(join(dir, 'drawing/InkEngine/delegatedInk.mjs')));
    const { interpolate } = await import(pathToFileURL(join(dir, 'drawing/goodnotes/InkEngine.mjs')));
    const board = { screenWidth: 3840, maxTouchPoints: 20 }, tablet = { screenWidth: 1366, maxTouchPoints: 5 };
    assert.equal(detectInputProfile({ pointerType: 'touch', pressure: 0 }, 'auto', tablet), 'board', 'touch ink uses the board profile');
    assert.equal(detectInputProfile({ pointerType: 'pen', pressure: .5 }, 'auto', board), 'board', 'binary-pressure pen on a board');
    assert.equal(detectInputProfile({ pointerType: 'pen', pressure: .37, tiltX: 20 }, 'auto', board), 'stylus');
    assert.equal(detectInputProfile({ pointerType: 'pen', pressure: .5 }, 'auto', tablet), 'stylus', 'tablet midpoint pressure stays stylus');
    assert.equal(detectInputProfile({ pointerType: 'touch', pressure: 0 }, 'off', board), 'stylus');
    assert.equal(detectInputProfile({ pointerType: 'mouse', pressure: .5 }, 'on', tablet), 'board');
    assert.ok(INK_PROFILES.board.palmContactPx > INK_PROFILES.stylus.palmContactPx);

    // Deterministic IR-like jitter: slow horizontal writing at 90 Hz with ±2 px noise.
    let seed = 7;
    const noise = () => { seed = (seed * 16807) % 2147483647; return (seed / 2147483647 - .5) * 4; };
    const touch = (t, x, y) => ({ pointerId: 2, pointerType: 'touch', timeStamp: t, clientX: x, clientY: y, pressure: 0, tiltX: 0, tiltY: 0, twist: 0 });
    const jitterRms = (profile, smoothing = 1) => {
        const input = new InkInput(smoothing, false, profile, 1);
        seed = 7;
        let sum = 0, n = 0;
        for (let i = 0; i < 180; i++) {
            const t = i * 11, x = 100 + i * .45, y = 200 + noise();
            const p = input.sample(touch(t, x, y), { x, y });
            if (p && i > 20) { sum += (p.y - 200) ** 2; n++; }
            assert.ok(!input.corner || profile !== 'board', 'slow board jitter never forms corners');
        }
        return Math.sqrt(sum / n);
    };
    const stylusRms = jitterRms('stylus'), boardRms = jitterRms('board'), strongRms = jitterRms('board', 1.35);
    assert.ok(boardRms < stylusRms * .65, `board profile removes jitter (${boardRms.toFixed(2)} vs ${stylusRms.toFixed(2)})`);
    assert.ok(strongRms <= boardRms, 'stronger stabilisation is steadier');
    {
        // Fast strokes must not lag: One Euro raises the cutoff with speed.
        const input = new InkInput(1, false, 'board', 1);
        let last;
        for (let i = 0; i < 40; i++) last = input.sample(touch(i * 11, i * 16, 0), { x: i * 16, y: 0 });
        assert.ok(39 * 16 - last.x < 10, `fast board lag is bounded (${(39 * 16 - last.x).toFixed(1)} px)`);
        // Filtering runs in screen space: the same hand motion at 2× zoom keeps the same screen lag.
        const zoomed = new InkInput(1, false, 'board', 2);
        let z;
        for (let i = 0; i < 40; i++) z = zoomed.sample(touch(i * 11, i * 16, 0), { x: i * 8, y: 0 });
        assert.ok(Math.abs((39 * 8 - z.x) * 2 - (39 * 16 - last.x)) < .5, 'zoom-independent filtering');
        // A real, fast direction change still bypasses the filter.
        const sharp = new InkInput(1, false, 'board', 1);
        for (let i = 0; i < 10; i++) sharp.sample(touch(i * 11, i * 10, 0), { x: i * 10, y: 0 });
        sharp.sample(touch(110, 90, 10), { x: 90, y: 10 });
        assert.ok(sharp.corner, 'fast reversal is a corner');
        assert.equal(sharp.fork().profile, 'board', 'forked prediction state keeps the profile');
    }
    const predictEvent = { ...event(100, 0), getPredictedEvents: () => [event(110), event(118), event(130)] };
    assert.deepEqual(predictedSamples(predictEvent, 20).map(p => p.timeStamp), [110, 118], 'board prediction horizon');

    // Fast hairpin (letter turnaround) with uneven spacing: uniform Catmull–Rom hooks past the tip.
    const uneven = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 102, y: 1 }, { x: 100, y: 2 }, { x: 0, y: 2 }].map((p, i) => ({ ...p, p: .5, timestamp: i * 10 }));
    const tip = line => Math.max(...line.map(p => p.x));
    const centripetal = centripetalSpline(uneven);
    assert.ok(tip(interpolate(uneven)) > 104, 'uniform spline overshoots the turn (reference)');
    assert.ok(tip(centripetal) <= 102.5, `centripetal turn stays at the pen tip (${tip(centripetal).toFixed(2)})`);
    for (const p of uneven) assert.ok(centripetal.some(q => q.x === p.x && q.y === p.y), 'spline passes through every sample');
    assert.equal(centripetalSpline([{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }]).length, 1, 'repeated taps collapse to one point');

    // Capsule union: finite, consistent winding, radii within the pen's bounds.
    const record = () => { const calls = []; return { calls, moveTo: (x, y) => calls.push(['M', x, y]), lineTo: (x, y) => calls.push(['L', x, y]),
        arc: (x, y, r, a, b, ccw) => calls.push(['A', x, y, r, a, b, ccw]), closePath: () => calls.push(['Z']) }; };
    const loop = Array.from({ length: 60 }, (_, i) => { const a = i / 59 * Math.PI * 4; return { x: a * 3 - 5 * Math.sin(a), y: 5 * Math.cos(a), p: .3 + .6 * (i % 7) / 7, velocity: 300, timestamp: i * 8 }; });
    for (const pen of ['fountain', 'brush']) {
        const sink = record();
        traceCapsules(sink, loop, { pen, width: 3, sharpness: .5, sensitivity: .65, complete: true });
        assert.ok(sink.calls.length > 50 && sink.calls.every(c => c.slice(1).every(v => typeof v === 'boolean' || Number.isFinite(v))), `${pen}: finite capsules`);
        assert.ok(sink.calls.filter(c => c[0] === 'A').every(c => c[6] === true), `${pen}: every arc shares one winding (no nonzero holes)`);
        const radii = inkRadii(centripetalSpline(loop), { pen, width: 3, sharpness: .5, sensitivity: .65, complete: true });
        assert.ok(radii.every(r => r >= 3 * .06 - 1e-9 && r <= 3 * 1.4 + 1e-9), `${pen}: radii stay within bounds`);
    }
    {
        const dot = record();
        traceCapsules(dot, [{ x: 5, y: 5, p: .5 }], { pen: 'fountain', width: 3, sharpness: .5, sensitivity: .65, complete: true });
        assert.deepEqual(dot.calls.map(c => c[0]), ['M', 'A', 'Z'], 'single tap is a dot');
        const line = record();
        traceCentreline(line, loop);
        assert.ok(line.calls[0][0] === 'M' && line.calls.slice(1).every(c => c[0] === 'L'), 'ballpoint centreline is a single open polyline');
    }
    globalThis.Path2D = class { moveTo() {} lineTo() {} arc() {} quadraticCurveTo() {} closePath() {} };
    const { inkLineWidth } = await import(pathToFileURL(join(dir, 'drawing/penEngine.mjs')));
    const v5 = { tool: 'pencil', color: '#000', width: 3, penType: 'ballpoint', inkVersion: 5, points: loop };
    assert.equal(inkLineWidth(v5, 3), 3, 'v5 ballpoint renders as a stroked line');
    assert.equal(inkLineWidth({ ...v5, penType: 'fountain' }, 3), null, 'v5 fountain renders as a filled union');
    assert.equal(inkLineWidth({ ...v5, inkVersion: 4 }, 3), null, 'older strokes keep their renderer');
    assert.ok(getInkPath(v5, 3) && getInkPath(v5, 3) === getInkPath(v5, 3), 'v5 paths use the geometry cache');
    delete globalThis.Path2D;
    assert.deepEqual(decodePages(encodePages([{ strokes: [v5], boxes: [] }]))[0].strokes[0].inkVersion, 5, 'v5 survives save/load');

    assert.ok(opaqueInkColor('#1a2b3c') && opaqueInkColor('#abc') && !opaqueInkColor('#1a2b3c80') && !opaqueInkColor('rgba(0,0,0,.5)'));
    const trail = new DelegatedInk();
    trail.update({ isTrusted: false, type: 'pointermove' }, '#000000', 3);
    assert.equal(trail.active, false, 'no presenter without the Ink API');

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
