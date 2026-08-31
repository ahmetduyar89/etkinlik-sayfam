import React from 'react';
import { cn } from '../../utils/cn';
import { Copy, Trash2 } from 'lucide-react';
import {
    DRAWING_COLORS,
    HANDLE_CURSORS,
} from '../../constants/drawing';
import { drawVariableStroke, getPenProfile, samplePressure } from './penEngine';
import { recognizeShape, snapAngle } from './shapeRecognizer';
import { drawMathObject, findMathItem } from './mathObjects';
import type {
    BoundingBox,
    DrawConfig,
    DrawingCanvasHandle,
    DragState,
    MathObject,
    Point,
    Stroke,
} from '../../types';

interface DrawingCanvasProps {
    config: DrawConfig;
    enabled: boolean;
    whiteboardMode: boolean;
    bgColor?: string;
    onPageChange?: (current: number, total: number) => void;
    onRequestText?: () => Promise<string | null>;
    /** Açılışta yüklenecek sayfalar (defter içeriği). */
    initialPages?: Stroke[][];
    /** Çizim verisi her değiştiğinde tetiklenir (otomatik kayıt için). */
    onDirty?: () => void;
    /** Geri al / ileri al düğmelerinin durumunu dışarı bildirir. */
    onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

/** Geri al yığınında tutulan en fazla adım sayısı. */
const HISTORY_LIMIT = 80;

const getBB = (s: Stroke): BoundingBox => {
    let x1 = Math.min(...s.points.map((p) => p.x));
    let y1 = Math.min(...s.points.map((p) => p.y));
    let x2 = Math.max(...s.points.map((p) => p.x));
    let y2 = Math.max(...s.points.map((p) => p.y));

    if (s.tool === 'circle' && s.points.length >= 2) {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        const r = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        x1 = Math.min(x1, p1.x - r);
        y1 = Math.min(y1, p1.y - r);
        x2 = Math.max(x2, p1.x + r);
        y2 = Math.max(y2, p1.y + r);
    }

    // Matematik nesneleri kutularına birebir oturur; serbest çizimde ise
    // parmakla seçimi kolaylaştırmak için bol boşluk bırakılır.
    const pad = s.tool === 'math' ? 6 : Math.max((s.width || 2) / 2 + 6, 24);
    return {
        x1: x1 - pad,
        y1: y1 - pad,
        x2: x2 + pad,
        y2: y2 + pad,
    };
};

const hitTest = (s: Stroke, x: number, y: number): boolean => {
    const bb = getBB(s);
    return x >= bb.x1 && x <= bb.x2 && y >= bb.y1 && y <= bb.y2;
};

const getHandlePositions = (bb: BoundingBox) => {
    const { x1, y1, x2, y2 } = bb;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return [
        { id: 'nw', x: x1, y: y1 },
        { id: 'n', x: mx, y: y1 },
        { id: 'ne', x: x2, y: y1 },
        { id: 'w', x: x1, y: my },
        { id: 'e', x: x2, y: my },
        { id: 'sw', x: x1, y: y2 },
        { id: 's', x: mx, y: y2 },
        { id: 'se', x: x2, y: y2 },
    ];
};

const resizePoints = (
    origPoints: Point[],
    origBB: BoundingBox,
    handle: string,
    dx: number,
    dy: number
): Point[] => {
    const { x1, y1, x2, y2 } = origBB;
    const w = x2 - x1 || 1;
    const h = y2 - y1 || 1;
    const nb = { x1, y1, x2, y2 };
    if (handle.includes('e')) nb.x2 = x2 + dx;
    if (handle.includes('w')) nb.x1 = x1 + dx;
    if (handle.includes('s')) nb.y2 = y2 + dy;
    if (handle.includes('n')) nb.y1 = y1 + dy;
    const sx = (nb.x2 - nb.x1) / w;
    const sy = (nb.y2 - nb.y1) / h;
    return origPoints.map((p) => ({
        x: nb.x1 + (p.x - x1) * sx,
        y: nb.y1 + (p.y - y1) * sy,
    }));
};

const drawShape = (
    tCtx: CanvasRenderingContext2D,
    tool: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    fill?: boolean
) => {
    tCtx.beginPath();
    if (tool === 'rect') tCtx.rect(x1, y1, x2 - x1, y2 - y1);
    else if (tool === 'circle')
        tCtx.arc(
            x1,
            y1,
            Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
            0,
            Math.PI * 2
        );
    else if (tool === 'triangle') {
        tCtx.moveTo((x1 + x2) / 2, y1);
        tCtx.lineTo(x2, y2);
        tCtx.lineTo(x1, y2);
        tCtx.closePath();
    } else if (tool === 'line' || tool === 'dashed') {
        tCtx.moveTo(x1, y1);
        tCtx.lineTo(x2, y2);
    } else if (tool === 'arrow' || tool === 'double_arrow') {
        const h = 15;
        const a = Math.atan2(y2 - y1, x2 - x1);
        tCtx.moveTo(x1, y1);
        tCtx.lineTo(x2, y2);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(x2, y2);
        tCtx.lineTo(x2 - h * Math.cos(a - Math.PI / 6), y2 - h * Math.sin(a - Math.PI / 6));
        tCtx.moveTo(x2, y2);
        tCtx.lineTo(x2 - h * Math.cos(a + Math.PI / 6), y2 - h * Math.sin(a + Math.PI / 6));
        if (tool === 'double_arrow') {
            tCtx.moveTo(x1, y1);
            tCtx.lineTo(x1 + h * Math.cos(a - Math.PI / 6), y1 + h * Math.sin(a - Math.PI / 6));
            tCtx.moveTo(x1, y1);
            tCtx.lineTo(x1 + h * Math.cos(a + Math.PI / 6), y1 + h * Math.sin(a + Math.PI / 6));
        }
    }
    if (fill && !['line', 'dashed', 'arrow', 'double_arrow'].includes(tool)) {
        tCtx.save();
        tCtx.globalAlpha = 0.2;
        tCtx.fill();
        tCtx.restore();
    }
    tCtx.stroke();
};

/** Bir noktanın a–b doğru parçasına uzaklığı (çizgi silgisi için). */
const distanceToSegment = (p: Point, a: Point, b: Point): number => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

/**
 * Çizgi silgisi için gerçek yola göre isabet testi. Serbest çizim ve
 * doğru parçalarında segmentlere, diğerlerinde sınırlayıcı kutuya bakar.
 */
const strokeNearPoint = (s: Stroke, x: number, y: number, radius: number): boolean => {
    const p = { x, y };
    const tolerance = radius + (s.width || 2) / 2;
    if (['pencil', 'highlighter', 'eraser', 'line', 'dashed', 'arrow', 'double_arrow'].includes(s.tool)) {
        if (s.points.length === 1) return Math.hypot(x - s.points[0].x, y - s.points[0].y) <= tolerance;
        const pts =
            ['line', 'dashed', 'arrow', 'double_arrow'].includes(s.tool)
                ? [s.points[0], s.points[s.points.length - 1]]
                : s.points;
        for (let i = 1; i < pts.length; i++) {
            if (distanceToSegment(p, pts[i - 1], pts[i]) <= tolerance) return true;
        }
        return false;
    }
    return hitTest(s, x, y);
};

const drawStroke = (tCtx: CanvasRenderingContext2D, s: Stroke) => {
    if (!s || s.points.length < 1) return;
    if (s.tool === 'math') {
        drawMathObject(tCtx, s);
        return;
    }
    tCtx.save();
    tCtx.strokeStyle = s.color;
    tCtx.fillStyle = s.color;
    tCtx.lineWidth = s.width || 2;
    tCtx.lineCap = 'round';
    tCtx.lineJoin = 'round';
    if (s.tool === 'eraser') tCtx.globalCompositeOperation = 'destination-out';
    if (s.tool === 'highlighter') tCtx.globalAlpha = 0.4;
    if (s.tool === 'dashed') tCtx.setLineDash([12, 6]);

    if (s.tool === 'pencil') {
        // Kalem ucuna göre değişken kalınlık (dolma kalem / fırça hissi).
        tCtx.globalAlpha *= getPenProfile(s.penType).alpha;
        drawVariableStroke(tCtx, s, s.width || 2);
        tCtx.restore();
        return;
    }

    if (['highlighter', 'eraser'].includes(s.tool)) {
        if (s.points.length < 2) {
            tCtx.beginPath();
            tCtx.arc(s.points[0].x, s.points[0].y, (s.width || 2) / 2, 0, Math.PI * 2);
            tCtx.fill();
        } else {
            tCtx.beginPath();
            tCtx.moveTo(s.points[0].x, s.points[0].y);
            for (let i = 1; i < s.points.length - 1; i++) {
                const mid = {
                    x: (s.points[i].x + s.points[i + 1].x) / 2,
                    y: (s.points[i].y + s.points[i + 1].y) / 2,
                };
                tCtx.quadraticCurveTo(s.points[i].x, s.points[i].y, mid.x, mid.y);
            }
            const last = s.points[s.points.length - 1];
            if (last) tCtx.lineTo(last.x, last.y);
            tCtx.stroke();
        }
    } else if (s.tool === 'text') {
        tCtx.font = 'bold 20px Arial';
        tCtx.fillText(s.text || '', s.points[0].x, s.points[0].y);
    } else if (s.tool === 'stamp') {
        tCtx.font = '44px serif';
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText(s.stampIcon || '', s.points[0].x, s.points[0].y);
    } else {
        const p1 = s.points[0];
        const p2 = s.points[s.points.length - 1];
        drawShape(tCtx, s.tool, p1.x, p1.y, p2.x, p2.y, s.fillEnabled);
    }
    tCtx.restore();
};

export const DrawingCanvas = React.forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
    function DrawingCanvas(
        {
            config,
            enabled,
            whiteboardMode,
            bgColor,
            onPageChange,
            onRequestText,
            initialPages,
            onDirty,
            onHistoryChange,
        },
        ref
    ) {
        const canvasRef = React.useRef<HTMLCanvasElement>(null);
        const bufferCanvasRef = React.useRef<HTMLCanvasElement>(null);
        const laserCanvasRef = React.useRef<HTMLCanvasElement>(null);
        const [, setStrokes] = React.useState<Stroke[]>([]);
        const currentStrokeRef = React.useRef<Stroke | null>(null);
        const [selectedIdx, setSelectedIdx] = React.useState<number | null>(null);
        const [selBB, setSelBB] = React.useState<BoundingBox | null>(null);
        const canvasRectRef = React.useRef<DOMRect | null>(null);
        const selectedIdxRef = React.useRef<number | null>(null);
        const dragStateRef = React.useRef<DragState | null>(null);

        const pagesRef = React.useRef<Stroke[][]>(
            initialPages && initialPages.length ? initialPages.map((p) => [...p]) : [[]]
        );
        const currentPageRef = React.useRef(0);
        const onDirtyRef = React.useRef(onDirty);

        // Geri al / ileri al: her adımda çizgi dizisinin sığ kopyası saklanır.
        // Çizgiler asla yerinde değiştirilmez (kopyala-yaz), bu yüzden sığ
        // kopya güvenlidir ve bellek maliyeti düşüktür.
        const historyRef = React.useRef<{ past: Stroke[][]; future: Stroke[][] }>({
            past: [],
            future: [],
        });
        const onHistoryChangeRef = React.useRef(onHistoryChange);

        const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
        const bufferCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
        const laserCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
        const strokesRef = React.useRef<Stroke[]>([...pagesRef.current[0]]);
        const isDrawingRef = React.useRef(false);
        const resizeFrameRef = React.useRef<number | null>(null);
        /** Sürükleme sırasında geçmişe yalnızca bir kez kayıt düşmek için. */
        const gestureDirtyRef = React.useRef(false);

        const SHAPE_TOOLS = React.useMemo(
            () => ['rect', 'circle', 'triangle', 'line', 'dashed', 'arrow', 'double_arrow'],
            []
        );

        const getCanvasSize = () => {
            const c = canvasRef.current;
            if (!c) return { w: 0, h: 0 };
            const dpr = window.devicePixelRatio || 1;
            return { w: c.width / dpr, h: c.height / dpr };
        };

        const deselect = () => {
            selectedIdxRef.current = null;
            setSelectedIdx(null);
            setSelBB(null);
        };

        React.useEffect(() => {
            onDirtyRef.current = onDirty;
        }, [onDirty]);

        React.useEffect(() => {
            onHistoryChangeRef.current = onHistoryChange;
        }, [onHistoryChange]);

        const notifyHistory = React.useCallback(() => {
            onHistoryChangeRef.current?.(
                historyRef.current.past.length > 0,
                historyRef.current.future.length > 0
            );
        }, []);

        /** Değişiklikten HEMEN ÖNCE çağrılır: mevcut durumu geçmişe iter. */
        const pushHistory = React.useCallback(() => {
            const h = historyRef.current;
            h.past.push([...strokesRef.current]);
            if (h.past.length > HISTORY_LIMIT) h.past.shift();
            h.future = [];
            notifyHistory();
        }, [notifyHistory]);

        const resetHistory = React.useCallback(() => {
            historyRef.current = { past: [], future: [] };
            notifyHistory();
        }, [notifyHistory]);

        /** Yeniden çizimi tetikler ve dışarıya "içerik değişti" haberi verir. */
        const commitStrokes = React.useCallback(() => {
            setStrokes([...strokesRef.current]);
            onDirtyRef.current?.();
        }, []);

        const redraw = React.useCallback(() => {
            const bCtx = bufferCtxRef.current;
            const mainCtx = ctxRef.current;
            const buffer = bufferCanvasRef.current;
            const mainCanvas = canvasRef.current;
            if (!bCtx || !mainCtx || !buffer || !mainCanvas) return;
            if (buffer.width === 0 || buffer.height === 0) return;

            const { w, h } = getCanvasSize();
            if (w <= 0 || h <= 0) return;

            bCtx.clearRect(0, 0, w, h);
            strokesRef.current.forEach((s) => drawStroke(bCtx, s));

            mainCtx.clearRect(0, 0, w, h);
            mainCtx.drawImage(buffer, 0, 0, w, h);

            if (selectedIdxRef.current !== null && strokesRef.current[selectedIdxRef.current]) {
                const bb = getBB(strokesRef.current[selectedIdxRef.current]);
                mainCtx.save();
                mainCtx.strokeStyle = '#4f46e5';
                mainCtx.lineWidth = 1.5;
                mainCtx.setLineDash([5, 3]);
                mainCtx.strokeRect(bb.x1, bb.y1, bb.x2 - bb.x1, bb.y2 - bb.y1);
                mainCtx.restore();
            }
        }, []);

        const notifyPageChange = React.useCallback(() => {
            onPageChange?.(currentPageRef.current, pagesRef.current.length);
        }, [onPageChange]);

        const switchPage = React.useCallback(
            (idx: number) => {
                pagesRef.current[currentPageRef.current] = [...strokesRef.current];
                currentPageRef.current = idx;
                strokesRef.current = [...(pagesRef.current[idx] || [])];
                setStrokes([...strokesRef.current]);
                deselect();
                resetHistory();
                window.setTimeout(redraw, 0);
                notifyPageChange();
            },
            [notifyPageChange, redraw, resetHistory]
        );

        React.useImperativeHandle(
            ref,
            () => ({
                undo: () => {
                    const h = historyRef.current;
                    const previous = h.past.pop();
                    if (!previous) return;
                    h.future.push([...strokesRef.current]);
                    strokesRef.current = previous;
                    deselect();
                    commitStrokes();
                    notifyHistory();
                    redraw();
                },
                redo: () => {
                    const h = historyRef.current;
                    const next = h.future.pop();
                    if (!next) return;
                    h.past.push([...strokesRef.current]);
                    strokesRef.current = next;
                    deselect();
                    commitStrokes();
                    notifyHistory();
                    redraw();
                },
                canUndo: () => historyRef.current.past.length > 0,
                canRedo: () => historyRef.current.future.length > 0,
                clear: () => {
                    if (strokesRef.current.length === 0) return;
                    pushHistory();
                    strokesRef.current = [];
                    commitStrokes();
                    deselect();
                    redraw();
                },
                insertMath: (math: MathObject, color?: string) => {
                    const item = findMathItem(math.kind);
                    const { w, h } = getCanvasSize();
                    const boxW = Math.min(item?.size.w ?? 320, Math.max(120, w - 60));
                    const boxH = Math.min(item?.size.h ?? 280, Math.max(100, h - 60));
                    // Sayfanın ortasına, üst üste eklenirse hafif kaydırarak yerleştir.
                    const offset = (strokesRef.current.filter((st) => st.tool === 'math').length % 5) * 18;
                    const x = Math.max(12, (w - boxW) / 2 + offset);
                    const y = Math.max(12, (h - boxH) / 2 + offset);
                    pushHistory();
                    const stroke: Stroke = {
                        tool: 'math',
                        color: color || '#1a1b26',
                        width: 2,
                        points: [
                            { x, y },
                            { x: x + boxW, y: y + boxH },
                        ],
                        math: { ...item?.defaults, ...math },
                    };
                    strokesRef.current.push(stroke);
                    const idx = strokesRef.current.length - 1;
                    selectedIdxRef.current = idx;
                    commitStrokes();
                    setSelectedIdx(idx);
                    setSelBB(getBB(stroke));
                    redraw();
                },
                deleteSelected: () => {
                    if (selectedIdxRef.current !== null) {
                        pushHistory();
                        strokesRef.current = strokesRef.current.filter(
                            (_, i) => i !== selectedIdxRef.current
                        );
                        commitStrokes();
                        deselect();
                        redraw();
                    }
                },
                setSelectedColor: (color: string) => {
                    const idx = selectedIdxRef.current;
                    if (idx !== null && strokesRef.current[idx]) {
                        pushHistory();
                        strokesRef.current = strokesRef.current.map((st, i) =>
                            i === idx ? { ...st, color } : st
                        );
                        commitStrokes();
                        setSelBB({ ...getBB(strokesRef.current[idx]) });
                        redraw();
                    }
                },
                duplicateSelected: () => {
                    if (
                        selectedIdxRef.current !== null &&
                        strokesRef.current[selectedIdxRef.current]
                    ) {
                        const copy: Stroke = JSON.parse(
                            JSON.stringify(strokesRef.current[selectedIdxRef.current])
                        );
                        copy.points = copy.points.map((p) => ({ ...p, x: p.x + 20, y: p.y + 20 }));
                        pushHistory();
                        strokesRef.current.push(copy);
                        const newIdx = strokesRef.current.length - 1;
                        selectedIdxRef.current = newIdx;
                        commitStrokes();
                        setSelectedIdx(newIdx);
                        setSelBB(getBB(copy));
                        redraw();
                    }
                },
                nextPage: () => {
                    if (currentPageRef.current < pagesRef.current.length - 1)
                        switchPage(currentPageRef.current + 1);
                },
                prevPage: () => {
                    if (currentPageRef.current > 0) switchPage(currentPageRef.current - 1);
                },
                addPage: () => {
                    pagesRef.current[currentPageRef.current] = [...strokesRef.current];
                    pagesRef.current.push([]);
                    switchPage(pagesRef.current.length - 1);
                },
                deletePage: () => {
                    if (pagesRef.current.length <= 1) {
                        pushHistory();
                        strokesRef.current = [];
                        commitStrokes();
                        redraw();
                        return;
                    }
                    pagesRef.current.splice(currentPageRef.current, 1);
                    const newIdx = Math.min(
                        currentPageRef.current,
                        pagesRef.current.length - 1
                    );
                    currentPageRef.current = newIdx;
                    strokesRef.current = [...pagesRef.current[newIdx]];
                    commitStrokes();
                    deselect();
                    resetHistory();
                    window.setTimeout(redraw, 0);
                    notifyPageChange();
                },
                getCurrentPage: () => currentPageRef.current,
                getPageCount: () => pagesRef.current.length,
                getPages: () => {
                    pagesRef.current[currentPageRef.current] = [...strokesRef.current];
                    return pagesRef.current.map((page) =>
                        page.map((stroke) => ({
                            ...stroke,
                            points: stroke.points.map((pt) => ({ ...pt })),
                        }))
                    );
                },
                loadPages: (pages: Stroke[][]) => {
                    pagesRef.current = pages.length ? pages.map((p) => [...p]) : [[]];
                    currentPageRef.current = 0;
                    strokesRef.current = [...pagesRef.current[0]];
                    setStrokes([...strokesRef.current]);
                    deselect();
                    resetHistory();
                    window.setTimeout(redraw, 0);
                    notifyPageChange();
                },
                screenshot: (wbMode: boolean, color: string) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const exp = document.createElement('canvas');
                    exp.width = canvas.width;
                    exp.height = canvas.height;
                    const ctx = exp.getContext('2d');
                    if (!ctx) return;
                    const dpr = window.devicePixelRatio || 1;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    if (wbMode) {
                        ctx.fillStyle = color || '#ffffff';
                        ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
                    }
                    ctx.drawImage(
                        canvas,
                        0,
                        0,
                        canvas.width / dpr,
                        canvas.height / dpr
                    );
                    const link = document.createElement('a');
                    link.download = `cizim-sayfa${currentPageRef.current + 1}.png`;
                    link.href = exp.toDataURL('image/png');
                    link.click();
                },
            }),
            [commitStrokes, notifyHistory, notifyPageChange, pushHistory, redraw, resetHistory, switchPage]
        );

        const resize = React.useCallback(() => {
            if (isDrawingRef.current) return;
            const canvas = canvasRef.current;
            const buffer = bufferCanvasRef.current;
            const laser = laserCanvasRef.current;
            if (!canvas || !buffer) return;

            const dpr = window.devicePixelRatio || 1;
            const parent = canvas.parentElement;
            const w = parent ? parent.offsetWidth : window.innerWidth;
            const h = parent ? parent.offsetHeight : window.innerHeight;
            if (w <= 0 || h <= 0) {
                if (resizeFrameRef.current === null) {
                    resizeFrameRef.current = window.requestAnimationFrame(() => {
                        resizeFrameRef.current = null;
                        resize();
                    });
                }
                return;
            }

            [canvas, buffer, laser].forEach((c) => {
                if (!c) return;
                c.width = w * dpr;
                c.height = h * dpr;
                c.style.width = w + 'px';
                c.style.height = h + 'px';
            });

            ctxRef.current = canvas.getContext('2d');
            if (ctxRef.current) {
                ctxRef.current.setTransform(1, 0, 0, 1, 0, 0);
                ctxRef.current.scale(dpr, dpr);
            }

            bufferCtxRef.current = buffer.getContext('2d');
            if (bufferCtxRef.current) {
                bufferCtxRef.current.setTransform(1, 0, 0, 1, 0, 0);
                bufferCtxRef.current.scale(dpr, dpr);
            }

            if (laser) {
                laserCtxRef.current = laser.getContext('2d');
                if (laserCtxRef.current) {
                    laserCtxRef.current.setTransform(1, 0, 0, 1, 0, 0);
                    laserCtxRef.current.scale(dpr, dpr);
                }
            }
            redraw();
        }, [redraw]);

        // Açılışta mevcut sayfa bilgisini bir kez dışarıya bildir.
        React.useEffect(() => {
            notifyPageChange();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        React.useEffect(() => {
            const target = canvasRef.current?.parentElement;
            if (target) {
                const obs = new ResizeObserver(() => resize());
                obs.observe(target);
                resize();
                return () => {
                    obs.disconnect();
                    if (resizeFrameRef.current !== null) {
                        window.cancelAnimationFrame(resizeFrameRef.current);
                    }
                };
            }
            window.addEventListener('resize', resize);
            resize();
            return () => {
                window.removeEventListener('resize', resize);
                if (resizeFrameRef.current !== null) {
                    window.cancelAnimationFrame(resizeFrameRef.current);
                }
            };
        }, [resize]);

        /** Verilen noktaya değen çizgilerin tamamını kaldırır. */
        const eraseStrokesAt = (x: number, y: number) => {
            const radius = Math.max(6, config.width * 3);
            const survivors = strokesRef.current.filter((st) => !strokeNearPoint(st, x, y, radius));
            if (survivors.length === strokesRef.current.length) return;
            if (!gestureDirtyRef.current) {
                pushHistory();
                gestureDirtyRef.current = true;
            }
            strokesRef.current = survivors;
            commitStrokes();
            redraw();
        };

        const startDrawing = async (e: React.PointerEvent) => {
            if (!enabled || ['pan', 'sun'].includes(config.tool)) return;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            canvasRectRef.current = rect;
            const scaleX = rect.width ? (canvasRef.current?.offsetWidth || 1) / rect.width : 1;
            const scaleY = rect.height ? (canvasRef.current?.offsetHeight || 1) / rect.height : 1;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            // Çizgi silgisi: dokunulan çizginin tamamını kaldırır.
            if (config.tool === 'eraser' && config.eraserMode === 'stroke') {
                isDrawingRef.current = true;
                gestureDirtyRef.current = false;
                eraseStrokesAt(x, y);
                return;
            }

            if (config.tool === 'select') {
                if (selectedIdxRef.current !== null && selBB) {
                    for (const h of getHandlePositions(selBB)) {
                        if (Math.hypot(x - h.x, y - h.y) < 10) {
                            const s = strokesRef.current[selectedIdxRef.current];
                            gestureDirtyRef.current = false;
                            dragStateRef.current = {
                                type: 'resize',
                                handle: h.id,
                                startX: x,
                                startY: y,
                                origPoints: JSON.parse(JSON.stringify(s.points)),
                                origBB: { ...selBB },
                            };
                            return;
                        }
                    }
                    if (x >= selBB.x1 && x <= selBB.x2 && y >= selBB.y1 && y <= selBB.y2) {
                        const s = strokesRef.current[selectedIdxRef.current];
                        gestureDirtyRef.current = false;
                        dragStateRef.current = {
                            type: 'move',
                            startX: x,
                            startY: y,
                            origPoints: JSON.parse(JSON.stringify(s.points)),
                        };
                        return;
                    }
                }
                for (let i = strokesRef.current.length - 1; i >= 0; i--) {
                    if (hitTest(strokesRef.current[i], x, y)) {
                        selectedIdxRef.current = i;
                        setSelectedIdx(i);
                        setSelBB(getBB(strokesRef.current[i]));
                        redraw();
                        return;
                    }
                }
                deselect();
                redraw();
                return;
            }

            if (selectedIdxRef.current !== null) {
                deselect();
                redraw();
            }

            if (config.tool === 'text') {
                const val = onRequestText
                    ? await onRequestText()
                    : window.prompt('Metin girin:');
                if (val && val.trim()) {
                    const s: Stroke = {
                        tool: 'text',
                        text: val,
                        color: config.color,
                        points: [{ x, y }],
                    };
                    pushHistory();
                    strokesRef.current.push(s);
                    commitStrokes();
                    redraw();
                }
                return;
            }
            if (config.tool === 'stamp') {
                const s: Stroke = {
                    tool: 'stamp',
                    stampIcon: config.stampIcon,
                    color: '#000',
                    points: [{ x, y }],
                };
                pushHistory();
                strokesRef.current.push(s);
                commitStrokes();
                redraw();
                return;
            }
            isDrawingRef.current = true;
            const first: Point = { x, y };
            if (config.tool === 'pencil') {
                // İlk noktada hız bilgisi yok; orta seviye bir baskıyla başla.
                first.p = samplePressure(e.pressure, e.pointerType, 12, undefined, config.penType);
            }
            currentStrokeRef.current = {
                tool: config.tool,
                color: config.color,
                width:
                    config.tool === 'highlighter'
                        ? config.width * 5
                        : config.tool === 'eraser'
                        ? config.width * 10
                        : config.width,
                fillEnabled: config.fillEnabled,
                penType: config.tool === 'pencil' ? config.penType ?? 'ballpoint' : undefined,
                points: [first],
            };
        };

        const draw = (e: React.PointerEvent) => {
            const rect = canvasRectRef.current || canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            const scaleX = rect.width ? (canvasRef.current?.offsetWidth || 1) / rect.width : 1;
            const scaleY = rect.height ? (canvasRef.current?.offsetHeight || 1) / rect.height : 1;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            if (
                config.tool === 'select' &&
                dragStateRef.current &&
                selectedIdxRef.current !== null
            ) {
                const drag = dragStateRef.current;
                const dx = x - drag.startX;
                const dy = y - drag.startY;
                const idx = selectedIdxRef.current;
                const s = strokesRef.current[idx];
                if (!gestureDirtyRef.current) {
                    pushHistory();
                    gestureDirtyRef.current = true;
                }
                const points =
                    drag.type === 'move'
                        ? drag.origPoints.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))
                        : resizePoints(drag.origPoints, drag.origBB, drag.handle, dx, dy);
                // Kopyala-yaz: geçmişteki anlık görüntüler bozulmasın.
                const updated: Stroke = { ...s, points };
                strokesRef.current[idx] = updated;
                setSelBB(getBB(updated));
                redraw();
                return;
            }

            if (config.tool === 'eraser' && config.eraserMode === 'stroke') {
                if (isDrawingRef.current) eraseStrokesAt(x, y);
                return;
            }

            const cssW = canvasRef.current?.offsetWidth || rect.width;
            const cssH = canvasRef.current?.offsetHeight || rect.height;

            if (config.tool === 'sun') {
                const lCtx = laserCtxRef.current;
                if (lCtx) {
                    lCtx.clearRect(0, 0, cssW, cssH);
                    const cx = x;
                    const cy = y;
                    const r = 12;
                    const g = lCtx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
                    g.addColorStop(0, 'rgba(255,50,50,1)');
                    g.addColorStop(0.3, 'rgba(255,80,80,0.4)');
                    g.addColorStop(1, 'rgba(255,0,0,0)');
                    lCtx.fillStyle = g;
                    lCtx.beginPath();
                    lCtx.arc(cx, cy, r * 3, 0, Math.PI * 2);
                    lCtx.fill();
                    lCtx.fillStyle = '#fff';
                    lCtx.beginPath();
                    lCtx.arc(cx, cy, 2, 0, Math.PI * 2);
                    lCtx.fill();
                }
                return;
            }
            if (!isDrawingRef.current || !currentStrokeRef.current) return;
            const stroke = currentStrokeRef.current;
            const last = stroke.points[stroke.points.length - 1];
            if (!last) return;
            const step = Math.hypot(x - last.x, y - last.y);
            if (step < 0.5) return;

            const oldBB = getBB(stroke);
            if (SHAPE_TOOLS.includes(stroke.tool)) {
                // Şekiller yalnızca başlangıç ve bitiş noktasıyla tanımlanır.
                const start = stroke.points[0];
                const end = config.snapAngle ? snapAngle(start, { x, y }) : { x, y };
                stroke.points = [start, end];
            } else {
                const point: Point = { x, y };
                if (stroke.tool === 'pencil') {
                    point.p = samplePressure(
                        e.pressure,
                        e.pointerType,
                        step,
                        last.p,
                        stroke.penType
                    );
                }
                stroke.points.push(point);
            }
            const newBB = getBB(stroke);
            
            const minX = Math.min(oldBB.x1, newBB.x1);
            const minY = Math.min(oldBB.y1, newBB.y1);
            const maxX = Math.max(oldBB.x2, newBB.x2);
            const maxY = Math.max(oldBB.y2, newBB.y2);
            const width = maxX - minX;
            const height = maxY - minY;

            const mainCtx = ctxRef.current;
            if (mainCtx && bufferCanvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                let sx = Math.floor(minX * dpr);
                let sy = Math.floor(minY * dpr);
                let sw = Math.ceil(width * dpr);
                let sh = Math.ceil(height * dpr);

                const imgW = bufferCanvasRef.current.width;
                const imgH = bufferCanvasRef.current.height;
                
                if (sx < 0) { sw += sx; sx = 0; }
                if (sy < 0) { sh += sy; sy = 0; }
                if (sx + sw > imgW) { sw = imgW - sx; }
                if (sy + sh > imgH) { sh = imgH - sy; }

                mainCtx.clearRect(minX, minY, width, height);
                if (sw > 0 && sh > 0) {
                    mainCtx.drawImage(
                        bufferCanvasRef.current,
                        sx, sy, sw, sh,
                        sx / dpr, sy / dpr, sw / dpr, sh / dpr
                    );
                }
                drawStroke(mainCtx, stroke);
            }
        };

        const stopDrawing = () => {
            if (config.tool === 'select') {
                if (dragStateRef.current) {
                    dragStateRef.current = null;
                    gestureDirtyRef.current = false;
                    commitStrokes();
                }
                return;
            }
            if (config.tool === 'eraser' && config.eraserMode === 'stroke') {
                isDrawingRef.current = false;
                gestureDirtyRef.current = false;
                return;
            }
            if (isDrawingRef.current && currentStrokeRef.current) {
                let stroke = currentStrokeRef.current;
                let snapped = false;

                // Şekil düzeltme: serbest çizilen kapalı/düz şekilleri tanı.
                if (config.snapShapes && stroke.tool === 'pencil') {
                    const recognized = recognizeShape(stroke.points);
                    if (recognized) {
                        stroke = {
                            ...stroke,
                            tool: recognized.tool,
                            points: recognized.points,
                            penType: undefined,
                            fillEnabled: config.fillEnabled,
                        };
                        snapped = true;
                    }
                }

                pushHistory();
                strokesRef.current.push(stroke);
                commitStrokes();
                if (snapped) {
                    // Ana katmanda serbest çizimin izi duruyor; baştan çiz.
                    redraw();
                } else if (bufferCtxRef.current) {
                    drawStroke(bufferCtxRef.current, stroke);
                }
            }
            isDrawingRef.current = false;
            gestureDirtyRef.current = false;
            currentStrokeRef.current = null;
            if (laserCtxRef.current) {
                const cssW = canvasRef.current?.offsetWidth || 0;
                const cssH = canvasRef.current?.offsetHeight || 0;
                laserCtxRef.current.clearRect(0, 0, cssW, cssH);
            }
        };

        const handleCursorStyle = (): string => {
            if (!enabled) return 'default';
            if (config.tool === 'pan') return 'grab';
            if (config.tool === 'select') return 'default';
            return 'crosshair';
        };

        const selStroke =
            selectedIdx !== null ? strokesRef.current[selectedIdx] : null;

        return (
            <>
                <canvas ref={bufferCanvasRef} style={{ display: 'none' }} aria-hidden="true" />
                <canvas
                    ref={canvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                    aria-label="Çizim alanı"
                    className={cn(
                        'absolute left-0 z-[4000] touch-none transition-opacity',
                        enabled
                            ? config.tool === 'pan'
                                ? 'pointer-events-none opacity-100'
                                : 'pointer-events-auto opacity-100'
                            : 'pointer-events-none opacity-0'
                    )}
                    style={{
                        top: 0,
                        backgroundColor: whiteboardMode ? bgColor || '#ffffff' : 'transparent',
                        cursor: handleCursorStyle(),
                    }}
                />
                <canvas
                    ref={laserCanvasRef}
                    aria-hidden="true"
                    className="absolute left-0 z-[4001] pointer-events-none touch-none"
                    style={{ top: 0 }}
                />

                {enabled && selectedIdx !== null && selBB && selStroke && (
                    <div
                        className="absolute left-0 top-0 z-[4500] pointer-events-none"
                        style={{ width: '100%', height: '100%' }}
                    >
                        {getHandlePositions(selBB).map((h) => (
                            <div
                                key={h.id}
                                className="absolute pointer-events-auto bg-white border-2 border-indigo-500 rounded-sm shadow-md hover:bg-indigo-100 transition-colors"
                                style={{
                                    left: h.x - 5,
                                    top: h.y - 5,
                                    width: 10,
                                    height: 10,
                                    cursor: HANDLE_CURSORS[h.id],
                                    zIndex: 4600,
                                }}
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    const s = strokesRef.current[selectedIdxRef.current!];
                                    gestureDirtyRef.current = false;
                                    dragStateRef.current = {
                                        type: 'resize',
                                        handle: h.id,
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        origPoints: JSON.parse(JSON.stringify(s.points)),
                                        origBB: { ...selBB },
                                    };
                                }}
                                onPointerMove={(e) => {
                                    if (!dragStateRef.current || selectedIdxRef.current === null)
                                        return;
                                    const drag = dragStateRef.current;
                                    if (drag.type !== 'resize') return;
                                    const dx = e.clientX - drag.startX;
                                    const dy = e.clientY - drag.startY;
                                    const idx = selectedIdxRef.current;
                                    if (!gestureDirtyRef.current) {
                                        pushHistory();
                                        gestureDirtyRef.current = true;
                                    }
                                    const updated: Stroke = {
                                        ...strokesRef.current[idx],
                                        points: resizePoints(
                                            drag.origPoints,
                                            drag.origBB,
                                            drag.handle,
                                            dx,
                                            dy
                                        ),
                                    };
                                    strokesRef.current[idx] = updated;
                                    setSelBB(getBB(updated));
                                    redraw();
                                }}
                                onPointerUp={(e) => {
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                    dragStateRef.current = null;
                                    gestureDirtyRef.current = false;
                                    commitStrokes();
                                }}
                            />
                        ))}

                        <div
                            role="toolbar"
                            aria-label="Seçim araçları"
                            className="absolute pointer-events-auto flex items-center gap-1 bg-[#1a1b26]/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 shadow-xl"
                            style={{
                                left: selBB.x1,
                                top: Math.max(0, selBB.y1 - 52),
                                zIndex: 4700,
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {DRAWING_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`Renk ${color}`}
                                    className={cn(
                                        'w-5 h-5 rounded-full border-2 transition-all hover:scale-110 shrink-0',
                                        selStroke.color === color
                                            ? 'border-white scale-110'
                                            : 'border-transparent'
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => {
                                        const idx = selectedIdxRef.current;
                                        if (idx !== null && strokesRef.current[idx]) {
                                            pushHistory();
                                            strokesRef.current[idx] = {
                                                ...strokesRef.current[idx],
                                                color,
                                            };
                                            commitStrokes();
                                            setSelBB({ ...getBB(strokesRef.current[idx]) });
                                            redraw();
                                        }
                                    }}
                                />
                            ))}
                            <div className="w-px h-4 bg-white/20 mx-1 shrink-0" aria-hidden="true" />
                            <button
                                type="button"
                                title="Çoğalt"
                                aria-label="Çoğalt"
                                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                onClick={() => {
                                    if (
                                        selectedIdxRef.current !== null &&
                                        strokesRef.current[selectedIdxRef.current]
                                    ) {
                                        const copy: Stroke = JSON.parse(
                                            JSON.stringify(
                                                strokesRef.current[selectedIdxRef.current]
                                            )
                                        );
                                        copy.points = copy.points.map((p) => ({
                                            ...p,
                                            x: p.x + 20,
                                            y: p.y + 20,
                                        }));
                                        pushHistory();
                                        strokesRef.current.push(copy);
                                        const ni = strokesRef.current.length - 1;
                                        selectedIdxRef.current = ni;
                                        commitStrokes();
                                        setSelectedIdx(ni);
                                        setSelBB(getBB(copy));
                                        redraw();
                                    }
                                }}
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                title="Seçili öğeyi sil"
                                aria-label="Seçili öğeyi sil"
                                className="p-1 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-400/10 transition-colors"
                                onClick={() => {
                                    const idx = selectedIdxRef.current;
                                    if (idx !== null) {
                                        pushHistory();
                                        strokesRef.current = strokesRef.current.filter(
                                            (_, i) => i !== idx
                                        );
                                        commitStrokes();
                                        deselect();
                                        redraw();
                                    }
                                }}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }
);
