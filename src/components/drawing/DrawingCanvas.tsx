import React from 'react';
import { cn } from '../../utils/cn';
import { Copy, Trash2 } from 'lucide-react';
import { DRAWING_COLORS, HANDLE_CURSORS } from '../../constants/drawing';
import { samplePressure } from './penEngine';
import { adjustSnappedShape, recognizeShape, snapAngle } from './shapeRecognizer';
import { findLibraryItem, getSimSpec, isAnimated, objectRect } from './libraryObjects';
import { onImageReady } from './imageStore';
import { applyOpToStrokes, newStrokeId, withIds } from './strokeOps';
import { drawPaper } from '../notebooks/paper';
import {
    SHAPE_TOOLS,
    drawStroke,
    erasePixels,
    getBB,
    getHandlePositions,
    hitTest,
    isSelectable,
    resizePoints,
    strokeInPolygon,
    strokeNearPoint,
    unionBB,
} from './strokeRenderer';
import type {
    BoundingBox,
    DrawConfig,
    DrawingCanvasHandle,
    DragState,
    DrawingTool,
    MathObject,
    NotebookOp,
    PaperStyle,
    Point,
    Stroke,
    Viewport,
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
    /**
     * Yerel bir değişikliğin diğer cihazlara yayınlanabilir hâli (ortak
     * çizim). Verilmezse çizim tek cihazda kalır; kalıcı kayıt her hâlükârda
     * `onDirty` üzerinden yürür.
     */
    onLocalOp?: (op: NotebookOp) => void;
    /** Geri al / ileri al düğmelerinin durumunu dışarı bildirir. */
    onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
    /**
     * "El" aracının anlamı:
     *  - `passthrough` (varsayılan): tuval tıklamaları geçirir, altındaki
     *    etkinlik sayfası kaydırılabilir. Mevcut etkinlik ekranları böyle çalışır.
     *  - `viewport`: el aracı çalışma alanını kaydırır, tekerlek ve çift parmak
     *    yakınlaştırır. Defter/beyaz tahta bu kipi kullanır.
     */
    panMode?: 'passthrough' | 'viewport';
    /**
     * Yakınlaştırma/kaydırma ya da tuval boyutu değiştiğinde tetiklenir.
     * `size`, kağıt deseninin çizimle aynı hizada durması için gerekir.
     */
    onViewChange?: (view: Viewport, size: { w: number; h: number }) => void;
}

/** Geri al yığınında tutulan en fazla adım sayısı. */
const HISTORY_LIMIT = 80;
const MIN_SCALE = 0.25;
const MAX_SCALE = 5;

const IDENTITY_VIEW: Viewport = { scale: 1, tx: 0, ty: 0 };

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
            onLocalOp,
            onHistoryChange,
            panMode = 'passthrough',
            onViewChange,
        },
        ref
    ) {
        const canvasRef = React.useRef<HTMLCanvasElement>(null);
        const bufferCanvasRef = React.useRef<HTMLCanvasElement>(null);
        const overlayCanvasRef = React.useRef<HTMLCanvasElement>(null);
        const [strokes, setStrokes] = React.useState<Stroke[]>([]);
        const currentStrokeRef = React.useRef<Stroke | null>(null);
        const holdTimerRef = React.useRef<number | null>(null);
        const heldShapeRef = React.useRef<{
            originalStroke: Stroke;
            snappedShape: { tool: DrawingTool; points: Point[] };
        } | null>(null);

        const cancelHoldTimer = React.useCallback(() => {
            if (holdTimerRef.current !== null) {
                window.clearTimeout(holdTimerRef.current);
                holdTimerRef.current = null;
            }
        }, []);

        const [selectedIdxs, setSelectedIdxs] = React.useState<number[]>([]);
        const [selBB, setSelBB] = React.useState<BoundingBox | null>(null);
        const selectedIdxsRef = React.useRef<number[]>([]);
        const selBBRef = React.useRef<BoundingBox | null>(null);
        const dragStateRef = React.useRef<DragState | null>(null);
        const lassoRef = React.useRef<Point[] | null>(null);

        const viewportEnabled = panMode === 'viewport';
        const viewRef = React.useRef<Viewport>({ ...IDENTITY_VIEW });
        const [view, setViewState] = React.useState<Viewport>({ ...IDENTITY_VIEW });
        const onViewChangeRef = React.useRef(onViewChange);
        /** Aktif işaretçiler — çift parmak yakınlaştırmayı tanımak için. */
        const pointersRef = React.useRef(new Map<number, Point>());
        const pinchRef = React.useRef<{
            dist: number;
            scale: number;
            centerX: number;
            centerY: number;
            tx: number;
            ty: number;
        } | null>(null);
        const panRef = React.useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

        const pagesRef = React.useRef<Stroke[][]>(
            initialPages && initialPages.length ? initialPages.map((p) => withIds(p)) : [[]]
        );
        const currentPageRef = React.useRef(0);
        const onDirtyRef = React.useRef(onDirty);
        const onLocalOpRef = React.useRef(onLocalOp);
        /** Silgi hareketinde bir şey silindi mi (bitince tek yayın yapılır). */
        const erasedRef = React.useRef(false);
        /** Çizgi silgisinin bu harekette kaldırdığı çizimlerin kimlikleri. */
        const erasedIdsRef = React.useRef<string[]>([]);
        /** Çizim/sürükleme sürerken bekletilen uzak işlemler. */
        const pendingOpsRef = React.useRef<NotebookOp[]>([]);

        const historyRef = React.useRef<{ past: Stroke[][]; future: Stroke[][] }>({
            past: [],
            future: [],
        });
        const onHistoryChangeRef = React.useRef(onHistoryChange);

        const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
        const bufferCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
        const overlayCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
        const strokesRef = React.useRef<Stroke[]>([...pagesRef.current[0]]);
        const isDrawingRef = React.useRef(false);
        /** Kalem baskısını gerçek hızdan üretmek için son nokta zamanı. */
        const lastPointTimeRef = React.useRef(0);
        const resizeFrameRef = React.useRef<number | null>(null);
        /** Sürükleme sırasında geçmişe yalnızca bir kez kayıt düşmek için. */
        const gestureDirtyRef = React.useRef(false);
        /** Sürüklemede kare sıkıştırma ve statik katman önbelleği. */
        const dragFrameRef = React.useRef<number | null>(null);
        const pendingDragRef = React.useRef<(() => void) | null>(null);
        const dragCachedRef = React.useRef(false);
        /** Simülasyon kontrolü sürüklenirken geçmişe tek kayıt düşmek için. */
        const simGestureRef = React.useRef(false);
        /** Canlı simülasyonların animasyon zamanı (saniye) ve döngü kimliği. */
        const simTimeRef = React.useRef(0);
        const simFrameRef = React.useRef<number | null>(null);
        const simStartRef = React.useRef(0);

        const getCanvasSize = () => {
            const c = canvasRef.current;
            if (!c) return { w: 0, h: 0 };
            const dpr = window.devicePixelRatio || 1;
            return { w: c.width / dpr, h: c.height / dpr };
        };

        // ── Görünüm dönüşümleri ──────────────────────────────────────
        const applyIdentity = (c: CanvasRenderingContext2D) => {
            const dpr = window.devicePixelRatio || 1;
            c.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const applyView = (c: CanvasRenderingContext2D) => {
            const dpr = window.devicePixelRatio || 1;
            const v = viewRef.current;
            c.setTransform(dpr * v.scale, 0, 0, dpr * v.scale, dpr * v.tx, dpr * v.ty);
        };

        /** İşaretçi olayını çalışma alanı (dünya) koordinatına çevirir. */
        const toWorld = (clientX: number, clientY: number): Point => {
            const canvas = canvasRef.current;
            const rect = canvas?.getBoundingClientRect();
            if (!canvas || !rect) return { x: 0, y: 0 };
            // Üst katmanlarda CSS ölçeği varsa telafi et.
            const cssX = rect.width ? canvas.offsetWidth / rect.width : 1;
            const cssY = rect.height ? canvas.offsetHeight / rect.height : 1;
            const sx = (clientX - rect.left) * cssX;
            const sy = (clientY - rect.top) * cssY;
            const v = viewRef.current;
            return { x: (sx - v.tx) / v.scale, y: (sy - v.ty) / v.scale };
        };

        const toScreenPoint = (p: Point, v: Viewport): Point => ({
            x: p.x * v.scale + v.tx,
            y: p.y * v.scale + v.ty,
        });

        /** Şu anda görünen dünya dikdörtgeni. */
        const visibleWorldRect = React.useCallback(() => {
            const canvas = canvasRef.current;
            const dpr = window.devicePixelRatio || 1;
            const w = canvas ? canvas.width / dpr : 0;
            const h = canvas ? canvas.height / dpr : 0;
            const v = viewRef.current;
            return { x: -v.tx / v.scale, y: -v.ty / v.scale, w: w / v.scale, h: h / v.scale };
        }, []);

        const deselect = () => {
            selectedIdxsRef.current = [];
            selBBRef.current = null;
            setSelectedIdxs([]);
            setSelBB(null);
        };

        const setSelection = (idxs: number[]) => {
            selectedIdxsRef.current = idxs;
            const bb = unionBB(
                idxs.map((i) => strokesRef.current[i]).filter(Boolean).map(getBB)
            );
            selBBRef.current = bb;
            setSelectedIdxs(idxs);
            setSelBB(bb);
        };

        /** Seçim değiştikten sonra sınırlayıcı kutuyu tazeler. */
        const refreshSelectionBB = () => {
            const bb = unionBB(
                selectedIdxsRef.current
                    .map((i) => strokesRef.current[i])
                    .filter(Boolean)
                    .map(getBB)
            );
            selBBRef.current = bb;
            setSelBB(bb);
        };

        React.useEffect(() => {
            onDirtyRef.current = onDirty;
        }, [onDirty]);

        React.useEffect(() => {
            onLocalOpRef.current = onLocalOp;
        }, [onLocalOp]);

        /** Yerel değişikliği diğer cihazlara duyurur (ortak çizim). */
        const emit = React.useCallback((op: NotebookOp) => {
            onLocalOpRef.current?.(op);
        }, []);

        /** Geçerli sayfanın tamamını yayınlar (geri al, temizle, silgi). */
        const emitPage = React.useCallback(() => {
            onLocalOpRef.current?.({
                type: 'page_set',
                page: currentPageRef.current,
                strokes: strokesRef.current,
            });
        }, []);

        React.useEffect(() => {
            onHistoryChangeRef.current = onHistoryChange;
        }, [onHistoryChange]);

        React.useEffect(() => {
            onViewChangeRef.current = onViewChange;
        }, [onViewChange]);

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

        /**
         * Statik katmanı (tampon) çizer. `exclude` verilirse o indeksler
         * atlanır — sürükleme sırasında yalnızca hareket eden çizimler
         * her karede yeniden çizilsin diye kullanılır.
         */
        const paintBuffer = React.useCallback((exclude?: Set<number>) => {
            const bCtx = bufferCtxRef.current;
            const buffer = bufferCanvasRef.current;
            if (!bCtx || !buffer || buffer.width === 0 || buffer.height === 0) return;
            const { w, h } = getCanvasSize();
            if (w <= 0 || h <= 0) return;

            applyIdentity(bCtx);
            bCtx.clearRect(0, 0, w, h);
            applyView(bCtx);
            strokesRef.current.forEach((s, i) => {
                if (exclude?.has(i)) return;
                drawStroke(bCtx, s, simTimeRef.current);
            });
        }, []);

        /**
         * Ana katmanı tampondan tazeler. `live` verilirse (sürükleme sırasında
         * hareket eden çizimler) tamponun üstüne çizilir.
         */
        const paintMain = React.useCallback((live?: Stroke[]) => {
            const mainCtx = ctxRef.current;
            const buffer = bufferCanvasRef.current;
            if (!mainCtx || !buffer || buffer.width === 0 || buffer.height === 0) return;
            const { w, h } = getCanvasSize();
            if (w <= 0 || h <= 0) return;

            applyIdentity(mainCtx);
            mainCtx.clearRect(0, 0, w, h);
            mainCtx.drawImage(buffer, 0, 0, w, h);

            if (live && live.length) {
                applyView(mainCtx);
                live.forEach((s) => drawStroke(mainCtx, s, simTimeRef.current));
                applyIdentity(mainCtx);
            }

            // Seçim çerçevesi ekran uzayında çizilir ki kalınlığı sabit kalsın.
            const bb = selBBRef.current;
            if (bb && selectedIdxsRef.current.length > 0) {
                const v = viewRef.current;
                const a = toScreenPoint({ x: bb.x1, y: bb.y1 }, v);
                const b = toScreenPoint({ x: bb.x2, y: bb.y2 }, v);
                mainCtx.save();
                mainCtx.strokeStyle = '#4f46e5';
                mainCtx.lineWidth = 1.5;
                mainCtx.setLineDash([5, 3]);
                mainCtx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
                // Çoklu seçimde her parçanın kendi çerçevesi soluk gösterilir.
                if (selectedIdxsRef.current.length > 1) {
                    mainCtx.strokeStyle = 'rgba(79,70,229,0.35)';
                    mainCtx.lineWidth = 1;
                    selectedIdxsRef.current.forEach((i) => {
                        const s = strokesRef.current[i];
                        if (!s) return;
                        const sb = getBB(s);
                        const p1 = toScreenPoint({ x: sb.x1, y: sb.y1 }, v);
                        const p2 = toScreenPoint({ x: sb.x2, y: sb.y2 }, v);
                        mainCtx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
                    });
                }
                mainCtx.restore();
            }
        }, []);

        /** Sayfadaki animasyonlu (canlı) simülasyonların indeksleri. */
        const animatedIndexes = React.useCallback(() => {
            const out: number[] = [];
            strokesRef.current.forEach((st, i) => {
                if (isAnimated(st)) out.push(i);
            });
            return out;
        }, []);

        const redraw = React.useCallback(() => {
            // Canlı simülasyonlar tampona girmez: her karede üstte yeniden
            // çizilecekleri için statik katmanın dışında tutulurlar.
            const animated = animatedIndexes();
            if (animated.length === 0) {
                paintBuffer();
                paintMain();
                return;
            }
            paintBuffer(new Set(animated));
            paintMain(animated.map((i) => strokesRef.current[i]));
        }, [animatedIndexes, paintBuffer, paintMain]);

        /** Sayfada canlı (animasyonlu) simülasyon var mı. */
        const hasAnimated = React.useMemo(
            () => strokes.some(isAnimated),
            [strokes]
        );

        /**
         * Canlı simülasyon varken her karede yalnızca onları yeniden çizer.
         * Döngü, sayfadaki içerik değiştikçe yeniden kurulur; animasyonlu
         * nesne yoksa hiç çalışmaz.
         */
        React.useEffect(() => {
            if (!hasAnimated) return;
            let cancelled = false;
            if (simStartRef.current === 0) simStartRef.current = performance.now();
            const tick = () => {
                if (cancelled) return;
                simTimeRef.current = (performance.now() - simStartRef.current) / 1000;
                const animated = animatedIndexes();
                // Sürükleme sırasında tampon seçime göre ayarlı; karışmasın.
                if (animated.length > 0 && !dragCachedRef.current) {
                    const live = animated.map((i) => strokesRef.current[i]);
                    // Devam eden çizim de her karede yeniden basılmalı; aksi
                    // halde animasyon ana katmanı temizlerken kalem izi kaybolur.
                    if (isDrawingRef.current && currentStrokeRef.current) {
                        live.push(currentStrokeRef.current);
                    }
                    paintMain(live);
                }
                simFrameRef.current = window.requestAnimationFrame(tick);
            };
            simFrameRef.current = window.requestAnimationFrame(tick);
            return () => {
                cancelled = true;
                if (simFrameRef.current !== null) {
                    window.cancelAnimationFrame(simFrameRef.current);
                    simFrameRef.current = null;
                }
            };
        }, [animatedIndexes, hasAnimated, paintMain]);

        /** Görünümü değiştirir ve yeniden çizer. */
        const applyViewChange = React.useCallback(
            (next: Viewport) => {
                const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale));
                const v = { scale, tx: next.tx, ty: next.ty };
                viewRef.current = v;
                setViewState(v);
                onViewChangeRef.current?.(v, getCanvasSize());
                redraw();
            },
            [redraw]
        );

        /** Ekrandaki bir noktayı sabit tutarak yakınlaştırır. */
        const zoomAt = React.useCallback(
            (factor: number, screenX: number, screenY: number) => {
                const v = viewRef.current;
                const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
                const k = scale / v.scale;
                applyViewChange({
                    scale,
                    tx: screenX - (screenX - v.tx) * k,
                    ty: screenY - (screenY - v.ty) * k,
                });
            },
            [applyViewChange]
        );

        // Fotoğraf yüklenince sayfayı tazele.
        React.useEffect(() => onImageReady(() => redraw()), [redraw]);

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


        /**
         * Uzak işlemleri uygular. Kullanıcı o sırada çiziyor ya da bir nesneyi
         * sürüklüyorsa iş kuyrukta bekletilir: hareketin ortasında listeyi
         * değiştirmek hem ekranı titretir hem de sürüklenen çizimin indeksini
         * kaydırır.
         */
        const applyOps = React.useCallback(
            (ops: NotebookOp[]) => {
                if (isDrawingRef.current || dragStateRef.current) {
                    pendingOpsRef.current.push(...ops);
                    return;
                }
                let touched = false;
                // Seçim indekse dayanır; uzak değişiklikten sonra aynı
                // çizimleri kimliklerinden bulup seçimi koruruz.
                const selectedIds = selectedIdxsRef.current
                    .map((i) => strokesRef.current[i]?.id)
                    .filter((id): id is string => !!id);

                for (const op of ops) {
                    if (op.type === 'boxes') continue; // metin kutuları editörde
                    const isCurrent = op.page === currentPageRef.current;
                    const list = isCurrent ? strokesRef.current : pagesRef.current[op.page];
                    // Henüz bizde olmayan bir sayfaya gelen işlem atlanır;
                    // anlık görüntü senkronu sayfayı zaten getirecek.
                    if (!list) continue;

                    const next = applyOpToStrokes(list, op);
                    if (next === list) continue;
                    if (isCurrent) {
                        strokesRef.current = next;
                        touched = true;
                    } else {
                        pagesRef.current[op.page] = next;
                    }
                }
                if (!touched) return;

                setStrokes([...strokesRef.current]);
                const kept = selectedIds
                    .map((id) => strokesRef.current.findIndex((st) => st.id === id))
                    .filter((i) => i >= 0);
                if (kept.length) setSelection(kept);
                else if (selectedIdxsRef.current.length) deselect();
                redraw();
            },
            [redraw]
        );

        /** Hareket bitince bekleyen uzak işlemleri uygular. */
        const flushPendingOps = React.useCallback(() => {
            if (pendingOpsRef.current.length === 0) return;
            const queued = pendingOpsRef.current;
            pendingOpsRef.current = [];
            applyOps(queued);
        }, [applyOps]);

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
                    emitPage();
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
                    emitPage();
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
                    emitPage();
                    deselect();
                    redraw();
                },
                insertMath: (math: MathObject, color?: string) => {
                    const item = findLibraryItem(math.kind);
                    const vis = visibleWorldRect();
                    const scale = viewRef.current.scale;
                    // Ekranda hep benzer büyüklükte ve kendi en-boy oranında
                    // görünsün diye dünya boyutu yakınlaştırmaya göre ölçeklenir.
                    const targetW = (item?.size.w ?? 380) / scale;
                    const targetH = (item?.size.h ?? 280) / scale;
                    const maxW = vis.w * 0.90;
                    const maxH = vis.h * 0.85;
                    const fitRatio = Math.min(1, maxW / targetW, maxH / targetH);
                    const boxW = targetW * fitRatio;
                    const boxH = targetH * fitRatio;
                    const offset =
                        (strokesRef.current.filter((st) => st.tool === 'math').length % 5) *
                        (18 / scale);
                    const x = vis.x + (vis.w - boxW) / 2 + offset;
                    const y = vis.y + (vis.h - boxH) / 2 + offset;
                    pushHistory();
                    const stroke: Stroke = {
                        id: newStrokeId(),
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
                    commitStrokes();
                    emit({ type: 'add', page: currentPageRef.current, strokes: [stroke] });
                    setSelection([strokesRef.current.length - 1]);
                    redraw();
                },
                insertImage: (src: string, width: number, height: number) => {
                    const vis = visibleWorldRect();
                    const maxW = vis.w * 0.6;
                    const maxH = vis.h * 0.6;
                    const ratio = Math.min(maxW / width, maxH / height, 1 / viewRef.current.scale);
                    const w = width * ratio;
                    const h = height * ratio;
                    const x = vis.x + (vis.w - w) / 2;
                    const y = vis.y + (vis.h - h) / 2;
                    pushHistory();
                    const stroke: Stroke = {
                        id: newStrokeId(),
                        tool: 'image',
                        color: '#000000',
                        src,
                        points: [
                            { x, y },
                            { x: x + w, y: y + h },
                        ],
                    };
                    strokesRef.current.push(stroke);
                    commitStrokes();
                    emit({ type: 'add', page: currentPageRef.current, strokes: [stroke] });
                    setSelection([strokesRef.current.length - 1]);
                    redraw();
                },
                zoomBy: (factor: number) => {
                    const { w, h } = getCanvasSize();
                    zoomAt(factor, w / 2, h / 2);
                },
                resetView: () => applyViewChange({ ...IDENTITY_VIEW }),
                getView: () => ({ ...viewRef.current }),
                deleteSelected: () => {
                    const idxs = new Set(selectedIdxsRef.current);
                    if (idxs.size === 0) return;
                    pushHistory();
                    const removed = strokesRef.current
                        .filter((_, i) => idxs.has(i))
                        .map((st) => st.id)
                        .filter((id): id is string => !!id);
                    strokesRef.current = strokesRef.current.filter((_, i) => !idxs.has(i));
                    commitStrokes();
                    if (removed.length)
                        emit({ type: 'remove', page: currentPageRef.current, ids: removed });
                    deselect();
                    redraw();
                },
                setSelectedColor: (color: string) => {
                    const idxs = new Set(selectedIdxsRef.current);
                    if (idxs.size === 0) return;
                    pushHistory();
                    strokesRef.current = strokesRef.current.map((st, i) =>
                        idxs.has(i) ? { ...st, color } : st
                    );
                    commitStrokes();
                    emit({
                        type: 'update',
                        page: currentPageRef.current,
                        strokes: strokesRef.current.filter((_, i) => idxs.has(i)),
                    });
                    refreshSelectionBB();
                    redraw();
                },
                duplicateSelected: () => {
                    const idxs = selectedIdxsRef.current;
                    if (idxs.length === 0) return;
                    const offset = 20 / viewRef.current.scale;
                    const copies = idxs
                        .map((i) => strokesRef.current[i])
                        .filter(Boolean)
                        .map((s) => {
                            const copy: Stroke = JSON.parse(JSON.stringify(s));
                            copy.id = newStrokeId();
                            copy.points = copy.points.map((p) => ({
                                ...p,
                                x: p.x + offset,
                                y: p.y + offset,
                            }));
                            return copy;
                        });
                    if (copies.length === 0) return;
                    pushHistory();
                    const first = strokesRef.current.length;
                    strokesRef.current.push(...copies);
                    commitStrokes();
                    emit({ type: 'add', page: currentPageRef.current, strokes: copies });
                    setSelection(copies.map((_, i) => first + i));
                    redraw();
                },
                nextPage: () => {
                    if (currentPageRef.current < pagesRef.current.length - 1)
                        switchPage(currentPageRef.current + 1);
                },
                prevPage: () => {
                    if (currentPageRef.current > 0) switchPage(currentPageRef.current - 1);
                },
                goToPage: (index: number) => {
                    if (index >= 0 && index < pagesRef.current.length && index !== currentPageRef.current)
                        switchPage(index);
                },
                addPage: () => {
                    pagesRef.current[currentPageRef.current] = [...strokesRef.current];
                    pagesRef.current.push([]);
                    switchPage(pagesRef.current.length - 1);
                },
                duplicatePage: () => {
                    pagesRef.current[currentPageRef.current] = [...strokesRef.current];
                    const copy: Stroke[] = JSON.parse(
                        JSON.stringify(pagesRef.current[currentPageRef.current])
                    );
                    pagesRef.current.splice(currentPageRef.current + 1, 0, copy);
                    switchPage(currentPageRef.current + 1);
                },
                movePage: (from: number, to: number) => {
                    const pages = pagesRef.current;
                    if (
                        from === to ||
                        from < 0 ||
                        to < 0 ||
                        from >= pages.length ||
                        to >= pages.length
                    )
                        return;
                    pages[currentPageRef.current] = [...strokesRef.current];
                    const [moved] = pages.splice(from, 1);
                    pages.splice(to, 0, moved);
                    // Taşınan sayfa açıksa onunla birlikte git.
                    let next = currentPageRef.current;
                    if (currentPageRef.current === from) next = to;
                    else if (from < currentPageRef.current && to >= currentPageRef.current) next -= 1;
                    else if (from > currentPageRef.current && to <= currentPageRef.current) next += 1;
                    currentPageRef.current = next;
                    strokesRef.current = [...(pages[next] || [])];
                    setStrokes([...strokesRef.current]);
                    deselect();
                    resetHistory();
                    commitStrokes();
                    window.setTimeout(redraw, 0);
                    notifyPageChange();
                },
                deletePage: () => {
                    if (pagesRef.current.length <= 1) {
                        pushHistory();
                        strokesRef.current = [];
                        commitStrokes();
                        emitPage();
                        redraw();
                        return;
                    }
                    pagesRef.current.splice(currentPageRef.current, 1);
                    const newIdx = Math.min(currentPageRef.current, pagesRef.current.length - 1);
                    currentPageRef.current = newIdx;
                    strokesRef.current = [...pagesRef.current[newIdx]];
                    commitStrokes();
                    deselect();
                    resetHistory();
                    window.setTimeout(redraw, 0);
                    notifyPageChange();
                },
                applyOps: (ops: NotebookOp[]) => applyOps(ops),
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
                    pagesRef.current = pages.length ? pages.map((p) => withIds(p)) : [[]];
                    currentPageRef.current = 0;
                    strokesRef.current = [...pagesRef.current[0]];
                    setStrokes([...strokesRef.current]);
                    deselect();
                    resetHistory();
                    window.setTimeout(redraw, 0);
                    notifyPageChange();
                },
                screenshot: (wbMode: boolean, color: string, paper?: PaperStyle) => {
                    const canvas = canvasRef.current;
                    const buffer = bufferCanvasRef.current;
                    if (!canvas || !buffer) return;
                    const exp = document.createElement('canvas');
                    exp.width = canvas.width;
                    exp.height = canvas.height;
                    const ctx = exp.getContext('2d');
                    if (!ctx) return;
                    const dpr = window.devicePixelRatio || 1;
                    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                    const w = canvas.width / dpr;
                    const h = canvas.height / dpr;
                    if (wbMode) {
                        ctx.fillStyle = color || '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                    }
                    // Kağıt deseni ekranda CSS arka planıdır; çıktıda da
                    // görünsün diye aynı desen tuvale çizilir.
                    if (paper && paper !== 'blank') {
                        drawPaper(ctx, paper, wbMode ? color || '#ffffff' : 'transparent', w, h, viewRef.current);
                    }
                    // Seçim çerçevesi görüntüye girmesin diye tampon kullanılır.
                    ctx.drawImage(buffer, 0, 0, w, h);
                    const link = document.createElement('a');
                    link.download = `cizim-sayfa${currentPageRef.current + 1}.png`;
                    link.href = exp.toDataURL('image/png');
                    link.click();
                },
            }),
            [
                applyOps,
                applyViewChange,
                commitStrokes,
                emit,
                emitPage,
                notifyHistory,
                notifyPageChange,
                pushHistory,
                redraw,
                resetHistory,
                switchPage,
                visibleWorldRect,
                zoomAt,
            ]
        );

        const resize = React.useCallback(() => {
            if (isDrawingRef.current) return;
            const canvas = canvasRef.current;
            const buffer = bufferCanvasRef.current;
            const overlay = overlayCanvasRef.current;
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

            [canvas, buffer, overlay].forEach((c) => {
                if (!c) return;
                c.width = w * dpr;
                c.height = h * dpr;
                c.style.width = w + 'px';
                c.style.height = h + 'px';
            });

            ctxRef.current = canvas.getContext('2d');
            bufferCtxRef.current = buffer.getContext('2d');
            if (overlay) overlayCtxRef.current = overlay.getContext('2d');
            [ctxRef.current, bufferCtxRef.current, overlayCtxRef.current].forEach((c) => {
                if (c) applyIdentity(c);
            });
            onViewChangeRef.current?.(viewRef.current, { w, h });
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

        // Tekerlek: Ctrl/⌘ ile yakınlaştırma, düz kaydırma ile gezinme.
        React.useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas || !viewportEnabled || !enabled) return;
            const onWheel = (e: WheelEvent) => {
                e.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const sx = e.clientX - rect.left;
                const sy = e.clientY - rect.top;
                if (e.ctrlKey || e.metaKey) {
                    zoomAt(Math.exp(-e.deltaY / 320), sx, sy);
                } else {
                    const v = viewRef.current;
                    applyViewChange({ ...v, tx: v.tx - e.deltaX, ty: v.ty - e.deltaY });
                }
            };
            canvas.addEventListener('wheel', onWheel, { passive: false });
            return () => canvas.removeEventListener('wheel', onWheel);
        }, [applyViewChange, enabled, viewportEnabled, zoomAt]);

        /** Devam eden çizimi iptal eder (çift parmak dokunuşunda). */
        const cancelCurrentStroke = () => {
            cancelHoldTimer();
            heldShapeRef.current = null;
            if (!isDrawingRef.current && !currentStrokeRef.current) return;
            isDrawingRef.current = false;
            currentStrokeRef.current = null;
            lassoRef.current = null;
            redraw();
        };

        /** Silgi ucunun yarıçapı (dünya birimi). */
        const eraserRadius = () => Math.max(6, config.width * 5);

        /**
         * Sürükleme başlarken seçili olmayan her şeyi tampona sabitler.
         * Böylece her karede yalnızca hareket eden çizimler yeniden çizilir;
         * yüzlerce çizimli bir sayfada boyutlandırma takılmaz.
         */
        const beginDragCache = () => {
            paintBuffer(new Set(selectedIdxsRef.current));
            dragCachedRef.current = true;
        };

        /** Sürükleme sırasında yalnızca seçili çizimleri tazeler. */
        const paintDrag = () => {
            paintMain(
                selectedIdxsRef.current.map((i) => strokesRef.current[i]).filter(Boolean)
            );
        };

        const endDragCache = () => {
            if (dragFrameRef.current !== null) {
                window.cancelAnimationFrame(dragFrameRef.current);
                dragFrameRef.current = null;
            }
            pendingDragRef.current = null;
            if (!dragCachedRef.current) return;
            dragCachedRef.current = false;
            redraw();
        };

        /**
         * İşaretçi olaylarını ekran karesine sıkıştırır. Fare/kalem saniyede
         * 120'ye kadar olay üretebilir; her birinde yeniden çizmek yerine
         * karede bir kez, en son konumla çizilir.
         */
        const scheduleDrag = (apply: () => void) => {
            pendingDragRef.current = apply;
            if (dragFrameRef.current !== null) return;
            dragFrameRef.current = window.requestAnimationFrame(() => {
                dragFrameRef.current = null;
                const job = pendingDragRef.current;
                pendingDragRef.current = null;
                job?.();
            });
        };

        /** Geçmişe bu hareket için bir kez kayıt düşer. */
        const markGesture = () => {
            if (gestureDirtyRef.current) return;
            pushHistory();
            gestureDirtyRef.current = true;
        };

        /** Çizgi silgisi: dokunulan çizimin tamamını kaldırır. */
        const eraseStrokesAt = (x: number, y: number) => {
            const radius = Math.max(6, config.width * 3);
            const survivors = strokesRef.current.filter(
                (st) => !isSelectable(st) || !strokeNearPoint(st, x, y, radius)
            );
            if (survivors.length === strokesRef.current.length) return;
            markGesture();
            const kept = new Set(survivors);
            for (const st of strokesRef.current) {
                if (!kept.has(st) && st.id) erasedIdsRef.current.push(st.id);
            }
            erasedRef.current = true;
            strokesRef.current = survivors;
            commitStrokes();
            redraw();
        };

        /**
         * Piksel silgisi: serbest çizimleri gerçekten keser.
         * Eskiden üste `destination-out` bir katman konuyordu; o katman normal
         * bir çizim olduğu için seçilip kenara çekilebiliyor ve altındaki
         * "silinmiş" içerik geri geliyordu.
         */
        const erasePixelsAt = (x: number, y: number) => {
            const next = erasePixels(strokesRef.current, x, y, eraserRadius());
            if (!next) return;
            markGesture();
            erasedRef.current = true;
            strokesRef.current = next;
            commitStrokes();
            redraw();
        };

        /** Silgi ucunu üst katmanda daire olarak gösterir. */
        const drawEraserCursor = (x: number, y: number) => {
            const oCtx = overlayCtxRef.current;
            if (!oCtx) return;
            const { w, h } = getCanvasSize();
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
            const v = viewRef.current;
            const c = toScreenPoint({ x, y }, v);
            oCtx.save();
            oCtx.beginPath();
            oCtx.arc(c.x, c.y, eraserRadius() * v.scale, 0, Math.PI * 2);
            oCtx.fillStyle = 'rgba(148,163,184,0.20)';
            oCtx.strokeStyle = 'rgba(71,85,105,0.75)';
            oCtx.lineWidth = 1.5;
            oCtx.fill();
            oCtx.stroke();
            oCtx.restore();
        };

        /** Kement önizlemesini üst katmana çizer. */
        const drawLassoPreview = () => {
            const oCtx = overlayCtxRef.current;
            const poly = lassoRef.current;
            const { w, h } = getCanvasSize();
            if (!oCtx) return;
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
            if (!poly || poly.length < 2) return;
            const v = viewRef.current;
            oCtx.save();
            oCtx.strokeStyle = '#4f46e5';
            oCtx.fillStyle = 'rgba(79,70,229,0.10)';
            oCtx.lineWidth = 1.5;
            oCtx.setLineDash([6, 4]);
            oCtx.beginPath();
            poly.forEach((p, i) => {
                const s = toScreenPoint(p, v);
                if (i === 0) oCtx.moveTo(s.x, s.y);
                else oCtx.lineTo(s.x, s.y);
            });
            oCtx.closePath();
            oCtx.fill();
            oCtx.stroke();
            oCtx.restore();
        };

        const clearOverlay = () => {
            const oCtx = overlayCtxRef.current;
            if (!oCtx) return;
            const { w, h } = getCanvasSize();
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
        };

        const startDrawing = async (e: React.PointerEvent) => {
            if (!enabled) return;
            pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

            // Çift parmak: yakınlaştırma/kaydırma kipine geç.
            if (viewportEnabled && pointersRef.current.size === 2) {
                cancelCurrentStroke();
                clearOverlay();
                const [a, b] = [...pointersRef.current.values()];
                const canvas = canvasRef.current;
                const rect = canvas?.getBoundingClientRect();
                pinchRef.current = {
                    dist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
                    scale: viewRef.current.scale,
                    centerX: (a.x + b.x) / 2 - (rect?.left ?? 0),
                    centerY: (a.y + b.y) / 2 - (rect?.top ?? 0),
                    tx: viewRef.current.tx,
                    ty: viewRef.current.ty,
                };
                return;
            }
            if (pointersRef.current.size > 1) return;

            if (config.tool === 'sun') return;

            // El aracı: defterde çalışma alanını kaydırır, etkinlik ekranlarında
            // tıklamaları alttaki sayfaya geçirir (tuval zaten pointer-events:none).
            if (config.tool === 'pan') {
                if (!viewportEnabled) return;
                panRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    tx: viewRef.current.tx,
                    ty: viewRef.current.ty,
                };
                return;
            }

            const { x, y } = toWorld(e.clientX, e.clientY);

            // Kement: serbest bir çerçeve çizip içine düşenleri seçer.
            if (config.tool === 'lasso') {
                deselect();
                lassoRef.current = [{ x, y }];
                isDrawingRef.current = true;
                redraw();
                return;
            }

            // Silgi hiçbir kipte çizim nesnesi üretmez; doğrudan içeriği düzenler.
            if (config.tool === 'eraser') {
                isDrawingRef.current = true;
                gestureDirtyRef.current = false;
                if (config.eraserMode === 'stroke') eraseStrokesAt(x, y);
                else erasePixelsAt(x, y);
                drawEraserCursor(x, y);
                return;
            }

            if (config.tool === 'select') {
                const bb = selBBRef.current;
                if (selectedIdxsRef.current.length > 0 && bb) {
                    const v = viewRef.current;
                    // Tutamaçlar ekran uzayında sabit büyüklükte olduğu için
                    // yakınlık testi de ekran uzayında yapılır.
                    const screen = toScreenPoint({ x, y }, v);
                    for (const h of getHandlePositions(bb)) {
                        const hs = toScreenPoint(h, v);
                        if (Math.hypot(screen.x - hs.x, screen.y - hs.y) < 12) {
                            gestureDirtyRef.current = false;
                            dragStateRef.current = {
                                type: 'resize',
                                handle: h.id,
                                startX: x,
                                startY: y,
                                orig: selectedIdxsRef.current.map((i) =>
                                    JSON.parse(JSON.stringify(strokesRef.current[i].points))
                                ),
                                origBB: { ...bb },
                            };
                            beginDragCache();
                            return;
                        }
                    }
                    if (x >= bb.x1 && x <= bb.x2 && y >= bb.y1 && y <= bb.y2) {
                        gestureDirtyRef.current = false;
                        dragStateRef.current = {
                            type: 'move',
                            startX: x,
                            startY: y,
                            orig: selectedIdxsRef.current.map((i) =>
                                JSON.parse(JSON.stringify(strokesRef.current[i].points))
                            ),
                        };
                        beginDragCache();
                        return;
                    }
                }
                for (let i = strokesRef.current.length - 1; i >= 0; i--) {
                    if (!isSelectable(strokesRef.current[i])) continue;
                    if (hitTest(strokesRef.current[i], x, y)) {
                        // Shift ile tıklamak seçime ekler/çıkarır.
                        if (e.shiftKey) {
                            const current = selectedIdxsRef.current;
                            setSelection(
                                current.includes(i)
                                    ? current.filter((n) => n !== i)
                                    : [...current, i]
                            );
                        } else {
                            setSelection([i]);
                        }
                        redraw();
                        return;
                    }
                }
                deselect();
                redraw();
                return;
            }

            if (selectedIdxsRef.current.length > 0) {
                deselect();
                redraw();
            }

            if (config.tool === 'text') {
                const val = onRequestText ? await onRequestText() : window.prompt('Metin girin:');
                if (val && val.trim()) {
                    const s: Stroke = {
                        id: newStrokeId(),
                        tool: 'text',
                        text: val,
                        color: config.color,
                        points: [{ x, y }],
                    };
                    pushHistory();
                    strokesRef.current.push(s);
                    commitStrokes();
                    emit({ type: 'add', page: currentPageRef.current, strokes: [s] });
                    redraw();
                }
                return;
            }
            if (config.tool === 'stamp') {
                const s: Stroke = {
                    id: newStrokeId(),
                    tool: 'stamp',
                    stampIcon: config.stampIcon,
                    // Emoji damgalar kendi renklerini korur; metin sembolleri
                    // (π, ×, ∈…) seçili kalem rengini alır. Sabit siyah kalırsa
                    // koyu zeminli sayfalarda görünmezler.
                    color: config.color,
                    points: [{ x, y }],
                };
                pushHistory();
                strokesRef.current.push(s);
                commitStrokes();
                emit({ type: 'add', page: currentPageRef.current, strokes: [s] });
                redraw();
                return;
            }

            cancelHoldTimer();
            heldShapeRef.current = null;
            isDrawingRef.current = true;
            const first: Point = { x, y };
            lastPointTimeRef.current = performance.now();
            if (config.tool === 'pencil') {
                // İlk noktada hız bilgisi yok; orta hızla başla.
                first.p = samplePressure(e.pressure, e.pointerType, 0.5, undefined, config.penType);
            }
            currentStrokeRef.current = {
                id: newStrokeId(),
                tool: config.tool,
                color: config.color,
                width: config.tool === 'highlighter' ? config.width * 5 : config.width,
                fillEnabled: config.fillEnabled,
                penType: config.tool === 'pencil' ? config.penType ?? 'ballpoint' : undefined,
                points: [first],
            };
        };

        const draw = (e: React.PointerEvent) => {
            if (pointersRef.current.has(e.pointerId)) {
                pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }

            // Çift parmak yakınlaştırma
            const pinch = pinchRef.current;
            if (pinch && pointersRef.current.size >= 2) {
                const [a, b] = [...pointersRef.current.values()];
                const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
                const scale = Math.min(
                    MAX_SCALE,
                    Math.max(MIN_SCALE, (pinch.scale * dist) / pinch.dist)
                );
                const k = scale / pinch.scale;
                applyViewChange({
                    scale,
                    tx: pinch.centerX - (pinch.centerX - pinch.tx) * k,
                    ty: pinch.centerY - (pinch.centerY - pinch.ty) * k,
                });
                return;
            }

            // El aracıyla kaydırma
            const pan = panRef.current;
            if (pan) {
                applyViewChange({
                    scale: viewRef.current.scale,
                    tx: pan.tx + (e.clientX - pan.x),
                    ty: pan.ty + (e.clientY - pan.y),
                });
                return;
            }

            const { x, y } = toWorld(e.clientX, e.clientY);

            if (config.tool === 'lasso' && isDrawingRef.current && lassoRef.current) {
                const last = lassoRef.current[lassoRef.current.length - 1];
                if (Math.hypot(x - last.x, y - last.y) * viewRef.current.scale >= 3) {
                    lassoRef.current.push({ x, y });
                    drawLassoPreview();
                }
                return;
            }

            if (config.tool === 'select' && dragStateRef.current && selectedIdxsRef.current.length) {
                const drag = dragStateRef.current;
                const dx = x - drag.startX;
                const dy = y - drag.startY;
                scheduleDrag(() => {
                    markGesture();
                    // Kopyala-yaz: geçmişteki anlık görüntüler bozulmasın.
                    selectedIdxsRef.current.forEach((idx, n) => {
                        const s = strokesRef.current[idx];
                        if (!s) return;
                        const orig = drag.orig[n];
                        const points =
                            drag.type === 'move'
                                ? orig.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy }))
                                : resizePoints(orig, drag.origBB, drag.handle, dx, dy);
                        strokesRef.current[idx] = { ...s, points };
                    });
                    refreshSelectionBB();
                    paintDrag();
                });
                return;
            }

            if (config.tool === 'eraser') {
                if (isDrawingRef.current) {
                    if (config.eraserMode === 'stroke') eraseStrokesAt(x, y);
                    else erasePixelsAt(x, y);
                }
                drawEraserCursor(x, y);
                return;
            }

            if (config.tool === 'sun') {
                const oCtx = overlayCtxRef.current;
                if (oCtx) {
                    const { w, h } = getCanvasSize();
                    const v = viewRef.current;
                    const s = toScreenPoint({ x, y }, v);
                    applyIdentity(oCtx);
                    oCtx.clearRect(0, 0, w, h);
                    const r = 12;
                    const g = oCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 3);
                    g.addColorStop(0, 'rgba(255,50,50,1)');
                    g.addColorStop(0.3, 'rgba(255,80,80,0.4)');
                    g.addColorStop(1, 'rgba(255,0,0,0)');
                    oCtx.fillStyle = g;
                    oCtx.beginPath();
                    oCtx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
                    oCtx.fill();
                    oCtx.fillStyle = '#fff';
                    oCtx.beginPath();
                    oCtx.arc(s.x, s.y, 2, 0, Math.PI * 2);
                    oCtx.fill();
                }
                return;
            }

            if (!isDrawingRef.current || !currentStrokeRef.current) return;
            const stroke = currentStrokeRef.current;

            // Draw-and-hold ile şekil kilitlendiyse ve kullanıcı parmağını kaldırmadan sürüklüyorsa:
            if (heldShapeRef.current && stroke.tool !== 'pencil') {
                const adjusted = adjustSnappedShape(heldShapeRef.current.snappedShape, { x, y }, config.snapAngle);
                currentStrokeRef.current = {
                    ...stroke,
                    tool: adjusted.tool,
                    points: adjusted.points,
                };
                paintMain([currentStrokeRef.current]);
                return;
            }

            const last = stroke.points[stroke.points.length - 1];
            if (!last) return;
            const step = Math.hypot(x - last.x, y - last.y);
            if (step * viewRef.current.scale < 0.5) return;

            const oldBB = getBB(stroke);
            if (SHAPE_TOOLS.includes(stroke.tool)) {
                // Şekiller yalnızca başlangıç ve bitiş noktasıyla tanımlanır.
                const start = stroke.points[0];
                const end = config.snapAngle ? snapAngle(start, { x, y }) : { x, y };
                stroke.points = [start, end];
            } else {
                const point: Point = { x, y };
                if (stroke.tool === 'pencil') {
                    // Hız = ekranda alınan yol / geçen süre. Sadece mesafeye
                    // bakmak işaretçi olay sıklığını hız sanmak olurdu.
                    const now = performance.now();
                    const elapsed = Math.max(1, now - lastPointTimeRef.current);
                    lastPointTimeRef.current = now;
                    point.p = samplePressure(
                        e.pressure,
                        e.pointerType,
                        (step * viewRef.current.scale) / elapsed,
                        last.p,
                        stroke.penType
                    );
                }
                stroke.points.push(point);
            }
            const newBB = getBB(stroke);

            // Yalnızca değişen bölgeyi tamponla tazeleyip üstüne çiz.
            const mainCtx = ctxRef.current;
            const buffer = bufferCanvasRef.current;
            if (mainCtx && buffer) {
                const v = viewRef.current;
                const minX = Math.min(oldBB.x1, newBB.x1) * v.scale + v.tx;
                const minY = Math.min(oldBB.y1, newBB.y1) * v.scale + v.ty;
                const maxX = Math.max(oldBB.x2, newBB.x2) * v.scale + v.tx;
                const maxY = Math.max(oldBB.y2, newBB.y2) * v.scale + v.ty;
                const width = maxX - minX;
                const height = maxY - minY;
                const dpr = window.devicePixelRatio || 1;

                let sx = Math.floor(minX * dpr);
                let sy = Math.floor(minY * dpr);
                let sw = Math.ceil(width * dpr);
                let sh = Math.ceil(height * dpr);
                const imgW = buffer.width;
                const imgH = buffer.height;
                if (sx < 0) {
                    sw += sx;
                    sx = 0;
                }
                if (sy < 0) {
                    sh += sy;
                    sy = 0;
                }
                if (sx + sw > imgW) sw = imgW - sx;
                if (sy + sh > imgH) sh = imgH - sy;

                applyIdentity(mainCtx);
                mainCtx.clearRect(minX, minY, width, height);
                if (sw > 0 && sh > 0) {
                    mainCtx.drawImage(
                        buffer,
                        sx,
                        sy,
                        sw,
                        sh,
                        sx / dpr,
                        sy / dpr,
                        sw / dpr,
                        sh / dpr
                    );
                }
                applyView(mainCtx);
                drawStroke(mainCtx, stroke);
                applyIdentity(mainCtx);
            }

            // Kalem modunda "Çiz ve Bekle" (Draw-and-Hold) zamanlayıcısı:
            if (stroke.tool === 'pencil') {
                cancelHoldTimer();
                holdTimerRef.current = window.setTimeout(() => {
                    if (!isDrawingRef.current || !currentStrokeRef.current) return;
                    const cur = currentStrokeRef.current;
                    if (cur.points.length >= 4) {
                        const recognized = recognizeShape(cur.points);
                        if (recognized) {
                            heldShapeRef.current = {
                                originalStroke: { ...cur },
                                snappedShape: recognized,
                            };
                            currentStrokeRef.current = {
                                ...cur,
                                tool: recognized.tool,
                                points: recognized.points,
                                penType: undefined,
                                fillEnabled: config.fillEnabled,
                            };
                            paintMain([currentStrokeRef.current]);

                            // Görsel dokunsal geri bildirim: uca yeşil bir halka
                            const oCtx = overlayCtxRef.current;
                            if (oCtx) {
                                const v = viewRef.current;
                                const sp = toScreenPoint({ x, y }, v);
                                oCtx.save();
                                oCtx.strokeStyle = '#10b981';
                                oCtx.lineWidth = 2.5;
                                oCtx.beginPath();
                                oCtx.arc(sp.x, sp.y, 14, 0, Math.PI * 2);
                                oCtx.stroke();
                                oCtx.restore();
                                window.setTimeout(clearOverlay, 240);
                            }
                        }
                    }
                }, 400);
            }
        };

        const stopDrawing = (e?: React.PointerEvent) => {
            if (e) pointersRef.current.delete(e.pointerId);
            if (pointersRef.current.size < 2) pinchRef.current = null;
            if (panRef.current) {
                panRef.current = null;
                return;
            }

            if (config.tool === 'lasso') {
                const poly = lassoRef.current;
                lassoRef.current = null;
                isDrawingRef.current = false;
                clearOverlay();
                if (poly && poly.length >= 3) {
                    const picked: number[] = [];
                    strokesRef.current.forEach((s, i) => {
                        if (isSelectable(s) && strokeInPolygon(s, poly)) picked.push(i);
                    });
                    if (picked.length) setSelection(picked);
                }
                redraw();
                return;
            }

            if (config.tool === 'select') {
                if (dragStateRef.current) {
                    dragStateRef.current = null;
                    window.setTimeout(flushPendingOps, 0);
                    gestureDirtyRef.current = false;
                    endDragCache();
                    commitStrokes();
                    // Taşıma/boyutlandırma bittiğinde son hâl yayınlanır;
                    // hareket boyunca her kare için yayın yapılmaz.
                    const moved = new Set(selectedIdxsRef.current);
                    const changed = strokesRef.current.filter((_, i) => moved.has(i));
                    if (changed.length)
                        emit({ type: 'update', page: currentPageRef.current, strokes: changed });
                }
                return;
            }
            if (config.tool === 'eraser') {
                isDrawingRef.current = false;
                window.setTimeout(flushPendingOps, 0);
                gestureDirtyRef.current = false;
                // Silgi hareketi boyunca değil, bitince tek yayın yapılır.
                // Piksel silgisi çizgileri böldüğü için sayfanın tamamı gider.
                if (erasedRef.current) {
                    erasedRef.current = false;
                    if (config.eraserMode === 'stroke') {
                        if (erasedIdsRef.current.length)
                            emit({
                                type: 'remove',
                                page: currentPageRef.current,
                                ids: erasedIdsRef.current,
                            });
                    } else {
                        // Piksel silgisi çizgileri bölerek kopyaladığı için
                        // kimlikler tekrar edebilir; önce benzersizleştirilir.
                        strokesRef.current = withIds(strokesRef.current);
                        commitStrokes();
                        emitPage();
                    }
                    erasedIdsRef.current = [];
                }
                clearOverlay();
                return;
            }
            cancelHoldTimer();
            if (isDrawingRef.current && currentStrokeRef.current) {
                let stroke = currentStrokeRef.current;
                let snapped = false;

                if (heldShapeRef.current) {
                    snapped = true;
                    heldShapeRef.current = null;
                } else if (config.snapShapes && stroke.tool === 'pencil') {
                    // Şekil düzeltme: serbest çizilen kapalı/düz şekilleri tanı.
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
                emit({ type: 'add', page: currentPageRef.current, strokes: [stroke] });
                if (snapped) {
                    // Ana katmanda serbest çizimin izi duruyor; baştan çiz.
                    redraw();
                } else if (bufferCtxRef.current) {
                    applyView(bufferCtxRef.current);
                    drawStroke(bufferCtxRef.current, stroke);
                    applyIdentity(bufferCtxRef.current);
                }
            }
            isDrawingRef.current = false;
            gestureDirtyRef.current = false;
            currentStrokeRef.current = null;
            heldShapeRef.current = null;
            // Çizim biterken bekleyen uzak işlemler uygulanır.
            window.setTimeout(flushPendingOps, 0);
            if (config.tool === 'sun') clearOverlay();
        };

        const handleCursorStyle = (): string => {
            if (!enabled) return 'default';
            if (config.tool === 'pan') return panRef.current ? 'grabbing' : 'grab';
            if (config.tool === 'select') return 'default';
            if (config.tool === 'eraser') return 'none';
            return 'crosshair';
        };

        const selectedStrokes = selectedIdxs
            .map((i) => strokesRef.current[i])
            .filter(Boolean);
        const selColor =
            selectedStrokes.length && selectedStrokes.every((s) => s.color === selectedStrokes[0].color)
                ? selectedStrokes[0].color
                : null;
        const selSim = selectedIdxs.length === 1 ? strokesRef.current[selectedIdxs[0]] : null;
        const selSimMath = selSim?.tool === 'math' ? selSim.math : undefined;
        const simSpec = selSimMath ? getSimSpec(selSimMath.kind) : undefined;
        const simRect = selSim ? objectRect(selSim) : null;
        const simControls =
            simSpec?.controls && simRect && selSimMath ? simSpec.controls(simRect, selSimMath) : [];

        const selScreenBB = selBB
            ? {
                  x1: selBB.x1 * view.scale + view.tx,
                  y1: selBB.y1 * view.scale + view.ty,
                  x2: selBB.x2 * view.scale + view.tx,
                  y2: selBB.y2 * view.scale + view.ty,
              }
            : null;

        /**
         * Seçili simülasyonun ayarını değiştirir. Sürükleme boyunca geçmişe
         * yalnızca bir kez kayıt düşülür.
         */
        const patchSim = (patch: Record<string, number>, startGesture: boolean) => {
            const idx = selectedIdxsRef.current[0];
            const st = strokesRef.current[idx];
            if (!st?.math) return;
            if (startGesture) {
                if (!simGestureRef.current) {
                    pushHistory();
                    simGestureRef.current = true;
                }
            } else {
                pushHistory();
            }
            strokesRef.current[idx] = {
                ...st,
                math: { ...st.math, sim: { ...st.math.sim, ...patch } },
            };
            commitStrokes();
            redraw();
        };

        /** Seçili çizimleri toplu günceller (renk, çoğalt, sil). */
        const mutateSelection = (fn: (idxs: number[]) => void) => {
            if (selectedIdxsRef.current.length === 0) return;
            pushHistory();
            fn(selectedIdxsRef.current);
            commitStrokes();
            redraw();
        };

        return (
            <>
                <canvas ref={bufferCanvasRef} style={{ display: 'none' }} aria-hidden="true" />
                <canvas
                    ref={canvasRef}
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerCancel={stopDrawing}
                    onPointerLeave={stopDrawing}
                    aria-label="Çizim alanı"
                    className={cn(
                        'absolute left-0 z-[4000] touch-none transition-opacity',
                        enabled
                            ? config.tool === 'pan' && !viewportEnabled
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
                    ref={overlayCanvasRef}
                    aria-hidden="true"
                    className="absolute left-0 z-[4001] pointer-events-none touch-none"
                    style={{ top: 0 }}
                />

                {enabled && selectedIdxs.length > 0 && selBB && selScreenBB && (
                    <div
                        className="absolute left-0 top-0 z-[4500] pointer-events-none"
                        style={{ width: '100%', height: '100%' }}
                    >
                        {getHandlePositions(selScreenBB).map((h) => (
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
                                    gestureDirtyRef.current = false;
                                    dragStateRef.current = {
                                        type: 'resize',
                                        handle: h.id,
                                        startX: e.clientX,
                                        startY: e.clientY,
                                        orig: selectedIdxsRef.current.map((i) =>
                                            JSON.parse(JSON.stringify(strokesRef.current[i].points))
                                        ),
                                        origBB: { ...selBB },
                                    };
                                    beginDragCache();
                                }}
                                onPointerMove={(e) => {
                                    const drag = dragStateRef.current;
                                    if (!drag || drag.type !== 'resize') return;
                                    // Tutamaç ekran uzayında sürüklenir; dünya
                                    // farkı için ölçeğe bölünür.
                                    const scale = viewRef.current.scale;
                                    const dx = (e.clientX - drag.startX) / scale;
                                    const dy = (e.clientY - drag.startY) / scale;
                                    scheduleDrag(() => {
                                        markGesture();
                                        selectedIdxsRef.current.forEach((idx, n) => {
                                            const s = strokesRef.current[idx];
                                            if (!s) return;
                                            strokesRef.current[idx] = {
                                                ...s,
                                                points: resizePoints(
                                                    drag.orig[n],
                                                    drag.origBB,
                                                    drag.handle,
                                                    dx,
                                                    dy
                                                ),
                                            };
                                        });
                                        refreshSelectionBB();
                                        paintDrag();
                                    });
                                }}
                                onPointerUp={(e) => {
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                    dragStateRef.current = null;
                                    gestureDirtyRef.current = false;
                                    endDragCache();
                                    commitStrokes();
                                }}
                            />
                        ))}

                        {/* Canlı simülasyonun üzerindeki etkileşim noktaları */}
                        {simControls.map((ctrl) => {
                            const pos = toScreenPoint({ x: ctrl.x, y: ctrl.y }, view);
                            const isToggle = ctrl.type === 'toggle';
                            const hasLabel = Boolean(ctrl.label && ctrl.label.trim().length > 0);

                            return (
                                <button
                                    key={ctrl.id}
                                    type="button"
                                    title={ctrl.label}
                                    aria-label={ctrl.label ?? ctrl.id}
                                    className={cn(
                                        'absolute pointer-events-auto shadow-md transition-all select-none',
                                        isToggle
                                            ? hasLabel
                                                ? cn(
                                                      'px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer backdrop-blur-md',
                                                      ctrl.on
                                                          ? 'bg-amber-500 text-slate-950 border border-amber-400 font-bold shadow-amber-500/25'
                                                          : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-white/20 hover:border-amber-400/50'
                                                  )
                                                : cn(
                                                      'w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer active:scale-95',
                                                      ctrl.on ? 'bg-amber-400 border-amber-600' : 'bg-white border-amber-500'
                                                  )
                                            : 'w-6 h-6 rounded-full bg-amber-400/95 border-2 border-amber-600 cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 shadow-amber-500/40 flex items-center justify-center'
                                    )}
                                    style={{
                                        left: pos.x,
                                        top: pos.y,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 4650,
                                        touchAction: 'none',
                                    }}
                                    onPointerDown={(e) => {
                                        e.stopPropagation();
                                        if (isToggle) return;
                                        e.currentTarget.setPointerCapture(e.pointerId);
                                        simGestureRef.current = false;
                                    }}
                                    onPointerMove={(e) => {
                                        if (ctrl.type !== 'drag') return;
                                        if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
                                        if (!simSpec?.onControl || !simRect || !selSimMath) return;
                                        const world = toWorld(e.clientX, e.clientY);
                                        patchSim(
                                            simSpec.onControl(simRect, selSimMath, ctrl.id, world),
                                            true
                                        );
                                    }}
                                    onPointerUp={(e) => {
                                        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                                            e.currentTarget.releasePointerCapture(e.pointerId);
                                        }
                                        simGestureRef.current = false;
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isToggle) return;
                                        if (!simSpec?.onControl || !simRect || !selSimMath) return;
                                        patchSim(
                                            simSpec.onControl(simRect, selSimMath, ctrl.id, {
                                                x: ctrl.x,
                                                y: ctrl.y,
                                            }),
                                            false
                                        );
                                    }}
                                >
                                    {isToggle ? (
                                        hasLabel ? (
                                            <>
                                                {ctrl.on !== undefined && (
                                                    <span
                                                        className={cn(
                                                            'w-2 h-2 rounded-full shrink-0',
                                                            ctrl.on ? 'bg-slate-950' : 'bg-amber-400'
                                                        )}
                                                    />
                                                )}
                                                <span>{ctrl.label}</span>
                                            </>
                                        ) : (
                                            <span
                                                className={cn(
                                                    'w-2 h-2 rounded-full',
                                                    ctrl.on ? 'bg-slate-900' : 'bg-amber-500'
                                                )}
                                            />
                                        )
                                    ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900 pointer-events-none" />
                                    )}
                                </button>
                            );
                        })}

                        {/* Simülasyon ayarları */}
                        {simSpec?.params && selSimMath && (() => {
                            const popupW = 230;
                            const popupH = (simSpec.params.length || 1) * 34 + 24;
                            const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
                            const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
                            const popupLeft = Math.max(8, Math.min(selScreenBB.x1, screenW - popupW - 16));
                            const fitsBelow = selScreenBB.y2 + popupH + 16 <= screenH;
                            const popupTop = fitsBelow
                                ? selScreenBB.y2 + 8
                                : Math.max(8, selScreenBB.y1 - popupH - 8);

                            return (
                                <div
                                    className="absolute pointer-events-auto flex flex-col gap-1.5 bg-[#1a1b26]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-xl"
                                    style={{
                                        left: popupLeft,
                                        top: popupTop,
                                        minWidth: popupW,
                                        zIndex: 4700,
                                    }}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    {simSpec.params.map((prm) => {
                                        const value = selSimMath.sim?.[prm.key] ?? prm.min;
                                        return (
                                            <label key={prm.key} className="flex items-center gap-2">
                                                <span className="text-[10.5px] font-semibold text-slate-300 w-[104px] shrink-0 leading-tight">
                                                    {prm.label}
                                                </span>
                                                <input
                                                    type="range"
                                                    min={prm.min}
                                                    max={prm.max}
                                                    step={prm.step ?? 1}
                                                    value={value}
                                                    onChange={(e) =>
                                                        patchSim(
                                                            { [prm.key]: Number(e.target.value) },
                                                            true
                                                        )
                                                    }
                                                    onPointerUp={() => {
                                                        simGestureRef.current = false;
                                                    }}
                                                    className="flex-1 accent-amber-400 h-1"
                                                />
                                                <span className="text-[10.5px] font-bold text-white tabular-nums w-[42px] text-right shrink-0">
                                                    {typeof value === 'number'
                                                        ? Number.isInteger(value)
                                                            ? value
                                                            : Number(value.toFixed(2))
                                                        : value}
                                                    {prm.unit ? ` ${prm.unit}` : ''}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            );
                        })()}

                        <div
                            role="toolbar"
                            aria-label="Seçim araçları"
                            className="absolute pointer-events-auto flex items-center gap-1 bg-[#1a1b26]/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 shadow-xl"
                            style={{
                                left: Math.max(4, selScreenBB.x1),
                                top: Math.max(0, selScreenBB.y1 - 52),
                                zIndex: 4700,
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {selectedIdxs.length > 1 && (
                                <span className="text-[11px] font-bold text-slate-300 px-1 tabular-nums shrink-0">
                                    {selectedIdxs.length} öğe
                                </span>
                            )}
                            {DRAWING_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`Renk ${color}`}
                                    className={cn(
                                        'w-5 h-5 rounded-full border-2 transition-all hover:scale-110 shrink-0',
                                        selColor === color ? 'border-white scale-110' : 'border-transparent'
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() =>
                                        mutateSelection((idxs) => {
                                            const set = new Set(idxs);
                                            strokesRef.current = strokesRef.current.map((st, i) =>
                                                set.has(i) ? { ...st, color } : st
                                            );
                                            refreshSelectionBB();
                                        })
                                    }
                                />
                            ))}
                            <div className="w-px h-4 bg-white/20 mx-1 shrink-0" aria-hidden="true" />
                            <button
                                type="button"
                                title="Çoğalt"
                                aria-label="Çoğalt"
                                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                onClick={() =>
                                    mutateSelection((idxs) => {
                                        const offset = 20 / viewRef.current.scale;
                                        const copies = idxs
                                            .map((i) => strokesRef.current[i])
                                            .filter(Boolean)
                                            .map((s) => {
                                                const copy: Stroke = JSON.parse(JSON.stringify(s));
                                                copy.points = copy.points.map((p) => ({
                                                    ...p,
                                                    x: p.x + offset,
                                                    y: p.y + offset,
                                                }));
                                                return copy;
                                            });
                                        const first = strokesRef.current.length;
                                        strokesRef.current.push(...copies);
                                        setSelection(copies.map((_, i) => first + i));
                                    })
                                }
                            >
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                title="Seçili öğeleri sil"
                                aria-label="Seçili öğeleri sil"
                                className="p-1 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-400/10 transition-colors"
                                onClick={() =>
                                    mutateSelection((idxs) => {
                                        const set = new Set(idxs);
                                        strokesRef.current = strokesRef.current.filter(
                                            (_, i) => !set.has(i)
                                        );
                                        deselect();
                                    })
                                }
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
