import React from 'react';
import { cn } from '../../utils/cn';
import { Copy, Trash2 } from 'lucide-react';
import { DRAWING_COLORS, HANDLE_CURSORS } from '../../constants/drawing';
import { samplePressure, smoothTowards } from './penEngine';
import { adjustSnappedShape, recognizeShape, snapAngle } from './shapeRecognizer';
import { findLibraryItem, getSimSpec, isAnimated, objectRect } from './libraryObjects';
import { onImageReady } from './imageStore';
import { applyOpToStrokes, newStrokeId, withIds } from './strokeOps';
import { withAlpha } from './objectDrawing';
import { drawPaper } from '../notebooks/paper';
import {
    SHAPE_TOOLS,
    drawStroke,
    erasePixels,
    maxHalfWidth,
    strokeNearSegment,
    getBB,
    getHandlePositions,
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
        const polyPointsRef = React.useRef<Point[]>([]);
        const [polyCount, setPolyCount] = React.useState<number>(0);

        React.useEffect(() => {
            if (config.tool !== 'polygon' && polyPointsRef.current.length > 0) {
                polyPointsRef.current = [];
                setPolyCount(0);
                clearOverlay();
            }
        }, [config.tool]);

        React.useEffect(() => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape' && polyPointsRef.current.length > 0) {
                    polyPointsRef.current = [];
                    setPolyCount(0);
                    clearOverlay();
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, []);

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
        /** Çizim sürerken gelen yeniden boyutlandırma isteği (sonra uygulanır). */
        const pendingResizeRef = React.useRef(false);
        const resizeRef = React.useRef<(() => void) | null>(null);
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

        /**
         * İşaretçi olayını tuvalin EKRAN koordinatına çevirir (CSS ölçeği
         * dahil). Yakınlaştırma çapasının `toWorld` ile aynı ölçüyü kullanması
         * şart; aksi halde üst katmanda ölçek varken zoom kayıyordu.
         */
        const toCanvasPoint = (clientX: number, clientY: number): Point => {
            const canvas = canvasRef.current;
            const rect = canvas?.getBoundingClientRect();
            if (!canvas || !rect) return { x: 0, y: 0 };
            const cssX = rect.width ? canvas.offsetWidth / rect.width : 1;
            const cssY = rect.height ? canvas.offsetHeight / rect.height : 1;
            return { x: (clientX - rect.left) * cssX, y: (clientY - rect.top) * cssY };
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
            // Çizim ortasında tuvali yeniden boyutlandırmak çizgiyi bozar;
            // istek kaydedilir ve kalem kalkınca uygulanır.
            if (isDrawingRef.current) {
                pendingResizeRef.current = true;
                return;
            }
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

        React.useEffect(() => {
            resizeRef.current = resize;
        }, [resize]);

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
                const { x: sx, y: sy } = toCanvasPoint(e.clientX, e.clientY);
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
            polyPointsRef.current = [];
            setPolyCount(0);
            if (!isDrawingRef.current && !currentStrokeRef.current) return;
            isDrawingRef.current = false;
            currentStrokeRef.current = null;
            lassoRef.current = null;
            redraw();
        };

        /** Silgi ucunun yarıçapı (dünya birimi). İmleç de bu daireyi çizer. */
        const eraserRadius = () => Math.max(6, config.width * 5);

        /**
         * İşaretçi olayının taşıdığı ARA örnekler.
         *
         * Tarayıcı, 120-240 Hz çalışan kalem ve dokunmatik tahtalarda kareye
         * tek bir `pointermove` verir; aradaki gerçek örnekler
         * `getCoalescedEvents()` içinde gelir. Okunmazsa hızlı hareketlerde
         * köşeler kesilir.
         */
        const coalescedSamples = (
            e: React.PointerEvent
        ): { clientX: number; clientY: number; pressure: number; pointerType: string }[] => {
            const native = e.nativeEvent as PointerEvent;
            const list =
                typeof native?.getCoalescedEvents === 'function'
                    ? native.getCoalescedEvents()
                    : [];
            if (!list || list.length === 0) {
                return [
                    {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        pressure: e.pressure,
                        pointerType: e.pointerType,
                    },
                ];
            }
            return list.map((ev) => ({
                clientX: ev.clientX,
                clientY: ev.clientY,
                pressure: ev.pressure,
                pointerType: ev.pointerType || e.pointerType,
            }));
        };

        /** Değişen bölgeye yalnızca son N nokta çiziliyorsa o kadarını çiz. */
        const TAIL_POINTS = 16;

        /**
         * Uzun çizgilerde her işaretçi olayında bütün noktaları taramak
         * gereksiz: değişen bölgeye yalnızca çizginin ucu giriyorsa sadece
         * son birkaç nokta çizilir. Çizginin daha eski bir bölümü (kendi
         * üstüne kıvrılan bir karalama gibi) bölgeye giriyorsa tamamı çizilir.
         */
        const paintableTail = (stroke: Stroke, region: BoundingBox, half: number): Stroke => {
            const pts = stroke.points;
            if (pts.length <= TAIL_POINTS) return stroke;
            const cut = pts.length - TAIL_POINTS;
            const x1 = region.x1 - half;
            const y1 = region.y1 - half;
            const x2 = region.x2 + half;
            const y2 = region.y2 + half;
            for (let i = 0; i < cut; i++) {
                const a = pts[i];
                const b = pts[i + 1];
                if (
                    Math.max(a.x, b.x) >= x1 &&
                    Math.min(a.x, b.x) <= x2 &&
                    Math.max(a.y, b.y) >= y1 &&
                    Math.min(a.y, b.y) <= y2
                ) {
                    return stroke;
                }
            }
            return { ...stroke, points: pts.slice(cut) };
        };

        /**
         * Çizimin YALNIZCA değişen bölgesini tazeler.
         *
         * Bölge tampondan geri alınır, sonra çizim o bölgeye kırpılarak
         * yeniden çizilir. Kırpma olmadan her işaretçi olayında çizginin
         * tamamı yeniden taranıyordu; uzun çizgilerde olay başına maliyet
         * sürekli büyüyordu.
         */
        const repaintStrokeRegion = (
            stroke: Stroke,
            region: BoundingBox | null,
            // Yalnızca okunabilirlik için: bölgeye çizilen parçanın ait olduğu
            // bütün çizim. Çizim mantığı parçayı kullanır.
            _whole?: Stroke
        ) => {
            const mainCtx = ctxRef.current;
            const buffer = bufferCanvasRef.current;
            if (!mainCtx || !buffer || !region) return;
            const v = viewRef.current;
            const minX = region.x1 * v.scale + v.tx;
            const minY = region.y1 * v.scale + v.ty;
            const width = (region.x2 - region.x1) * v.scale;
            const height = (region.y2 - region.y1) * v.scale;
            const dpr = window.devicePixelRatio || 1;

            let sx = Math.floor(minX * dpr);
            let sy = Math.floor(minY * dpr);
            let sw = Math.ceil(width * dpr) + 1;
            let sh = Math.ceil(height * dpr) + 1;
            if (sx < 0) {
                sw += sx;
                sx = 0;
            }
            if (sy < 0) {
                sh += sy;
                sy = 0;
            }
            if (sx + sw > buffer.width) sw = buffer.width - sx;
            if (sy + sh > buffer.height) sh = buffer.height - sy;

            applyIdentity(mainCtx);
            mainCtx.clearRect(minX, minY, width, height);
            if (sw > 0 && sh > 0) {
                mainCtx.drawImage(buffer, sx, sy, sw, sh, sx / dpr, sy / dpr, sw / dpr, sh / dpr);
            }

            mainCtx.save();
            mainCtx.beginPath();
            mainCtx.rect(minX, minY, width, height);
            mainCtx.clip();
            applyView(mainCtx);
            drawStroke(mainCtx, stroke);
            mainCtx.restore();
            applyIdentity(mainCtx);
        };

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

        /**
         * Silgi hareketi boyunca ekrana yeniden çizimi kareye sıkıştırır ve
         * React durumunu hareket bitene kadar güncellemez: yüzlerce çizimli
         * bir sayfada her işaretçi olayında tam yeniden çizim + yeniden
         * render yapmak silgiyi takılmalı hâle getiriyordu.
         */
        const eraseDirtyRef = React.useRef(false);
        const eraseFrameRef = React.useRef<number | null>(null);
        const scheduleEraseRedraw = () => {
            if (eraseFrameRef.current !== null) return;
            eraseFrameRef.current = window.requestAnimationFrame(() => {
                eraseFrameRef.current = null;
                redraw();
            });
        };

        /** Çizgi silgisi: silginin yolu boyunca dokunduğu çizimleri kaldırır. */
        const eraseStrokesAlong = (a: Point, b: Point) => {
            const radius = eraserRadius();
            const survivors = strokesRef.current.filter(
                (st) => !isSelectable(st) || !strokeNearSegment(st, a, b, radius)
            );
            if (survivors.length === strokesRef.current.length) return;
            markGesture();
            const kept = new Set(survivors);
            for (const st of strokesRef.current) {
                if (!kept.has(st) && st.id) erasedIdsRef.current.push(st.id);
            }
            erasedRef.current = true;
            eraseDirtyRef.current = true;
            strokesRef.current = survivors;
            scheduleEraseRedraw();
        };

        /**
         * Piksel silgisi: serbest çizimleri gerçekten keser.
         * Eskiden üste `destination-out` bir katman konuyordu; o katman normal
         * bir çizim olduğu için seçilip kenara çekilebiliyor ve altındaki
         * "silinmiş" içerik geri geliyordu.
         */
        const erasePixelsAlong = (a: Point, b: Point) => {
            const next = erasePixels(strokesRef.current, a.x, a.y, b.x, b.y, eraserRadius());
            if (!next) return;
            markGesture();
            erasedRef.current = true;
            eraseDirtyRef.current = true;
            strokesRef.current = next;
            scheduleEraseRedraw();
        };

        /** Silginin bir önceki konumu — yol boyunca silmek için. */
        const lastErasePointRef = React.useRef<Point | null>(null);

        /** Silgiyi `a → b` yolu boyunca uygular. */
        const eraseAlong = (a: Point, b: Point) => {
            if (config.eraserMode === 'stroke') eraseStrokesAlong(a, b);
            else erasePixelsAlong(a, b);
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

        /** Çokgen oluşturma önizlemesini (lastik kılavuz, noktalar, A-B-C) üst katmana çizer. */
        const drawPolygonOverlay = (curPos: Point) => {
            const oCtx = overlayCtxRef.current;
            if (!oCtx) return;
            const pts = polyPointsRef.current;
            if (pts.length === 0) return;

            const { w, h } = getCanvasSize();
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
            applyView(oCtx);

            const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const v = viewRef.current;

            // 1. Mevcut kenarlar
            oCtx.save();
            oCtx.beginPath();
            oCtx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                oCtx.lineTo(pts[i].x, pts[i].y);
            }
            oCtx.lineTo(curPos.x, curPos.y);

            if (pts.length >= 2 && config.fillEnabled) {
                oCtx.closePath();
                oCtx.save();
                oCtx.globalAlpha = 0.15;
                oCtx.fillStyle = config.color;
                oCtx.fill();
                oCtx.restore();
            }

            oCtx.strokeStyle = config.color;
            oCtx.lineWidth = config.width || 2;
            oCtx.stroke();
            oCtx.restore();

            // 2. İmlece giden kesikli lastik kılavuz (rubberband)
            oCtx.save();
            oCtx.setLineDash([4, 4]);
            oCtx.strokeStyle = withAlpha(config.color, 0.7);
            oCtx.lineWidth = 1.5;
            oCtx.beginPath();
            oCtx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
            oCtx.lineTo(curPos.x, curPos.y);
            oCtx.stroke();
            oCtx.restore();

            // 3. Başlangıç noktasına yaklaşılmış mı (manyetik kilit)
            const p0 = pts[0];
            const screenDist = Math.hypot((curPos.x - p0.x) * v.scale, (curPos.y - p0.y) * v.scale);
            const isNearStart = pts.length >= 2 && screenDist <= 24;

            // 4. Köşe noktaları ve etiketleri
            pts.forEach((p, idx) => {
                const isStart = idx === 0;
                oCtx.save();
                oCtx.beginPath();
                oCtx.arc(p.x, p.y, isStart && isNearStart ? 7 : 4.5, 0, Math.PI * 2);
                oCtx.fillStyle = isStart && isNearStart ? '#10b981' : '#ffffff';
                oCtx.fill();
                oCtx.lineWidth = 2;
                oCtx.strokeStyle = isStart && isNearStart ? '#059669' : config.color;
                oCtx.stroke();

                const letter = labels[idx % labels.length];
                oCtx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                oCtx.textAlign = 'center';
                oCtx.textBaseline = 'bottom';
                oCtx.strokeStyle = '#ffffff';
                oCtx.lineWidth = 3;
                oCtx.strokeText(letter, p.x, p.y - 7);
                oCtx.fillStyle = '#0f172a';
                oCtx.fillText(letter, p.x, p.y - 7);
                oCtx.restore();
            });

            // Başlangıç noktasına yakınsa "Kapat (Tıkla)" rozeti
            if (isNearStart) {
                oCtx.save();
                oCtx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                oCtx.textAlign = 'center';
                oCtx.textBaseline = 'top';
                oCtx.fillStyle = '#059669';
                oCtx.fillText('Kapat (Tıkla)', p0.x, p0.y + 10);
                oCtx.restore();
            }

            applyIdentity(oCtx);
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
            // İşaretçiyi yakala: el tuvalin kenarından ya da üstteki araç
            // çubuğunun üzerinden geçtiğinde çizgi ortadan kesilmesin.
            try {
                e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
                /* bazı tarayıcılar reddedebilir; yakalamasız da çalışır */
            }
            pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

            // Çift parmak: yakınlaştırma/kaydırma kipine geç.
            if (viewportEnabled && pointersRef.current.size === 2) {
                cancelCurrentStroke();
                clearOverlay();
                const [a, b] = [...pointersRef.current.values()];
                const center = toCanvasPoint((a.x + b.x) / 2, (a.y + b.y) / 2);
                pinchRef.current = {
                    dist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
                    scale: viewRef.current.scale,
                    centerX: center.x,
                    centerY: center.y,
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
                lastErasePointRef.current = { x, y };
                eraseAlong({ x, y }, { x, y });
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
                // Kutuya değil mürekkebe bak: köşegen bir çizginin kutusundaki
                // boş köşeye tıklayınca o çizgi seçiliyordu. Tolerans ekran
                // uzayında sabit tutulur ki yakınlaştırmada da parmakla
                // isabet ettirilebilsin.
                const pickTolerance = 10 / viewRef.current.scale;
                for (let i = strokesRef.current.length - 1; i >= 0; i--) {
                    if (!isSelectable(strokesRef.current[i])) continue;
                    if (strokeNearPoint(strokesRef.current[i], x, y, pickTolerance)) {
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

            if (config.tool === 'polygon') {
                const pts = polyPointsRef.current;
                const v = viewRef.current;
                if (pts.length >= 2) {
                    const p0 = pts[0];
                    const screenDist = Math.hypot((x - p0.x) * v.scale, (y - p0.y) * v.scale);
                    const lastP = pts[pts.length - 1];
                    const distToLast = Math.hypot((x - lastP.x) * v.scale, (y - lastP.y) * v.scale);

                    if (screenDist <= 24 || (pts.length >= 3 && distToLast <= 10)) {
                        const s: Stroke = {
                            id: newStrokeId(),
                            tool: 'polygon',
                            color: config.color,
                            width: config.width,
                            fillEnabled: config.fillEnabled,
                            points: [...pts],
                        };
                        pushHistory();
                        strokesRef.current.push(s);
                        commitStrokes();
                        emit({ type: 'add', page: currentPageRef.current, strokes: [s] });
                        polyPointsRef.current = [];
                        setPolyCount(0);
                        clearOverlay();
                        redraw();
                        return;
                    }
                }

                polyPointsRef.current.push({ x, y });
                setPolyCount(polyPointsRef.current.length);
                drawPolygonOverlay({ x, y });
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
                const focus = {
                    x: pinch.centerX - (pinch.centerX - pinch.tx) * (scale / pinch.scale),
                    y: pinch.centerY - (pinch.centerY - pinch.ty) * (scale / pinch.scale),
                };
                applyViewChange({ scale, tx: focus.x, ty: focus.y });
                return;
            }

            // Tek parmak / fare ile kaydırma
            const pan = panRef.current;
            if (pan) {
                applyViewChange({
                    ...viewRef.current,
                    tx: pan.tx + (e.clientX - pan.x),
                    ty: pan.ty + (e.clientY - pan.y),
                });
                return;
            }

            const { x, y } = toWorld(e.clientX, e.clientY);

            if (config.tool === 'polygon') {
                if (polyPointsRef.current.length > 0) {
                    drawPolygonOverlay({ x, y });
                }
                return;
            }

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
                    // Ara noktalar dahil: hızlı geçişte mürekkep atlanmasın.
                    for (const sample of coalescedSamples(e)) {
                        const pt = toWorld(sample.clientX, sample.clientY);
                        eraseAlong(lastErasePointRef.current ?? pt, pt);
                        lastErasePointRef.current = pt;
                    }
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

            if (!stroke.points.length) return;

            if (SHAPE_TOOLS.includes(stroke.tool)) {
                // Şekiller yalnızca başlangıç ve bitiş noktasıyla tanımlanır.
                const oldBB = getBB(stroke);
                const start = stroke.points[0];
                const end = config.snapAngle ? snapAngle(start, { x, y }) : { x, y };
                stroke.points = [start, end];
                repaintStrokeRegion(stroke, unionBB([oldBB, getBB(stroke)]));
                return;
            }

            // Serbest çizim: tarayıcının kareye sıkıştırdığı ARA noktalar da
            // işlenir. Yalnızca son konumu almak, 120-240 Hz kalemlerde hızlı
            // hareketlerde köşeleri kesiyordu.
            const half = maxHalfWidth(stroke);
            let dirty: BoundingBox | null = null;
            const grow = (a: Point, b: Point) => {
                const box = {
                    x1: Math.min(a.x, b.x) - half - 2,
                    y1: Math.min(a.y, b.y) - half - 2,
                    x2: Math.max(a.x, b.x) + half + 2,
                    y2: Math.max(a.y, b.y) + half + 2,
                };
                dirty = dirty ? unionBB([dirty, box]) : box;
            };

            for (const sample of coalescedSamples(e)) {
                const raw = toWorld(sample.clientX, sample.clientY);
                const last = stroke.points[stroke.points.length - 1];
                if (!last) break;
                const rawStep = Math.hypot(raw.x - last.x, raw.y - last.y);
                if (rawStep * viewRef.current.scale < 0.5) continue;

                // Dokunmatik tahtaların sinyal gürültüsünü süz: yavaş
                // hareketlerde yumuşat, hızlı hareketlerde olduğu gibi bırak.
                const point: Point = smoothTowards(
                    last,
                    raw,
                    rawStep * viewRef.current.scale
                );
                const step = Math.hypot(point.x - last.x, point.y - last.y);

                if (stroke.tool === 'pencil') {
                    // Hız = ekranda alınan yol / geçen süre. Sadece mesafeye
                    // bakmak işaretçi olay sıklığını hız sanmak olurdu.
                    const now = performance.now();
                    const elapsed = Math.max(1, now - lastPointTimeRef.current);
                    lastPointTimeRef.current = now;
                    point.p = samplePressure(
                        sample.pressure,
                        sample.pointerType,
                        (step * viewRef.current.scale) / elapsed,
                        last.p,
                        stroke.penType
                    );
                }
                stroke.points.push(point);
                grow(last, point);
            }

            if (dirty) repaintStrokeRegion(paintableTail(stroke, dirty, half), dirty, stroke);

            // Kalem modunda "Çiz ve Bekle": yalnızca akıllı kalem açıkken.
            // Her zaman açık olması, uzun bir eğri çizerken duraksayan
            // öğretmenin çizimini habersizce şekle çeviriyordu.
            if (stroke.tool === 'pencil' && config.snapShapes) {
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
            if (e) {
                pointersRef.current.delete(e.pointerId);
                if (e.currentTarget?.hasPointerCapture?.(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }
            }
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
                lastErasePointRef.current = null;
                window.setTimeout(flushPendingOps, 0);
                gestureDirtyRef.current = false;
                // Hareket boyunca React durumu güncellenmedi (her olayda
                // yeniden render silgiyi takıyordu); sonunda bir kez yazılır.
                if (eraseDirtyRef.current) {
                    eraseDirtyRef.current = false;
                    commitStrokes();
                    redraw();
                }
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
            // Çizim sürerken ertelenen yeniden boyutlandırma şimdi uygulanır.
            if (pendingResizeRef.current) {
                pendingResizeRef.current = false;
                resizeRef.current?.();
            }
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
                    // Yakalama koptuğunda (sistem müdahalesi) çizim kapatılır.
                    // Normal kalem kalkışında yakalama zaten stopDrawing
                    // içinde bırakıldığı için burada iş kalmaz.
                    onLostPointerCapture={(e) => {
                        if (isDrawingRef.current || dragStateRef.current || panRef.current) {
                            stopDrawing(e);
                        }
                    }}
                    // Tuvalden çıkmak çizimi BİTİRMEZ; yalnızca silgi ucu
                    // göstergesi temizlenir. Çizim, işaretçi yakalandığı için
                    // dışarıda da sürer ve kalem kalkınca kapanır.
                    onPointerLeave={() => {
                        if (!isDrawingRef.current && config.tool === 'eraser') clearOverlay();
                    }}
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

                {enabled && config.tool === 'polygon' && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[4600] pointer-events-none flex items-center gap-2.5 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-indigo-500/50 rounded-full shadow-2xl text-white text-[13px] font-medium transition-all">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>
                            {polyCount === 0
                                ? 'Noktalarla Çokgen (A-B-C): Tuvale tıklayarak köşe noktaları ekleyin.'
                                : `${polyCount} nokta eklendi. Kapatmak için ilk noktaya (A) tıklayın.`}
                        </span>
                        <span className="text-[11px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full ml-1">
                            İptal: Esc
                        </span>
                    </div>
                )}

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
