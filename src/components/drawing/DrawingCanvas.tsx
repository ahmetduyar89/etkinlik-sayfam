import React from 'react';
import { cn } from '../../utils/cn';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    Check,
    Plus,
    Minus,
    PaintBucket,
    ChevronsDown,
    ChevronsUp,
    Copy,
    Edit3,
    FlipHorizontal,
    FlipVertical,
    GripHorizontal,
    RotateCw,
    Sigma,
    Trash2,
} from 'lucide-react';
import { DRAWING_COLORS, HANDLE_CURSORS } from '../../constants/drawing';
import { filterHookArtifact, getPenProfile, samplePressure, smoothTowards } from './penEngine';
import { adjustSnappedShape, recognizeShape, snapAngle } from './shapeRecognizer';
import { recognizeEquation } from './equationRecognizer';
import {
    RULER_SNAP_PX,
    type RulerState,
    drawRuler,
    rulerHitBody,
    rulerRotateHandle,
    snapToRuler,
} from './rulerTool';
import { findLibraryItem, getSimSpec, isAnimated, objectRect } from './libraryObjects';
import { importImageFile, onImageReady } from './imageStore';
import { applyOpToStrokes, newStrokeId, withIds } from './strokeOps';
import { withAlpha } from './objectDrawing';
import { drawPaper, paperBackground } from '../notebooks/paper';
import {
    SHAPE_TOOLS,
    drawStroke,
    erasePixels,
    maxHalfWidth,
    rotateStroke,
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
    DashStyle,
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
    paper?: PaperStyle;
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
     * Sayfanın dünya ölçüsü; verilmezse çalışma alanı sınırsızdır. Kağıt
     * ölçüsünden ya da bağlı PDF sayfasından gelir.
     */
    pageBox?: { w: number; h: number } | null;
    /**
     * Yakınlaştırma/kaydırma ya da tuval boyutu değiştiğinde tetiklenir.
     * `size`, kağıt deseninin çizimle aynı hizada durması için gerekir.
     */
    onViewChange?: (view: Viewport, size: { w: number; h: number }) => void;
    /** Üst araç çubuğu ayarlarını (font, boyut, renk) tuvalden güncellemek için. */
    onConfigChange?: (patch: Partial<DrawConfig>) => void;
}

/** Geri al yığınında tutulan en fazla adım sayısı. */
const HISTORY_LIMIT = 80;
const MIN_SCALE = 0.25;
const MAX_SCALE = 5;

const IDENTITY_VIEW: Viewport = { scale: 1, tx: 0, ty: 0 };

/** Seçim araç çubuğundaki hızlı kalınlıklar. */
const SELECTION_WIDTHS = [2, 6, 12];

export const DrawingCanvas = React.forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
    function DrawingCanvas(
        {
            config,
            enabled,
            whiteboardMode,
            bgColor,
            paper,
            onPageChange,
            onRequestText,
            initialPages,
            onDirty,
            onLocalOp,
            onHistoryChange,
            panMode = 'passthrough',
            pageBox,
            onViewChange,
            onConfigChange,
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

        interface InlineTextState {
            worldX: number;
            worldY: number;
            text: string;
            fontSize: number;
            color: string;
            fontFamily?: string;
            textAlign?: 'left' | 'center' | 'right';
            bold?: boolean;
            italic?: boolean;
            strokeIdx?: number;
        }
        const [inlineText, setInlineText] = React.useState<InlineTextState | null>(null);
        const lastTextClickRef = React.useRef<{ idx: number; time: number }>({ idx: -1, time: 0 });
        const activeStrokeBBRef = React.useRef<BoundingBox | null>(null);
        const textareaRef = React.useRef<HTMLTextAreaElement>(null);
        const textBoxContainerRef = React.useRef<HTMLDivElement>(null);
        const inlineTextRef = React.useRef<InlineTextState | null>(null);
        inlineTextRef.current = inlineText;

        const isIOS = React.useMemo(() => {
            if (typeof navigator === 'undefined') return false;
            return (
                /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
            );
        }, []);

        React.useEffect(() => {
            if (inlineText && textareaRef.current) {
                // iPad / iOS klavye açılışı için anında odaklan
                textareaRef.current.focus();
                const len = textareaRef.current.value.length;
                textareaRef.current.setSelectionRange(len, len);
            }
        }, [inlineText]);

        // Araç çubuğundaki metin ayarları değiştiğinde aktif metin kutusunu gerçek zamanlı güncelle
        React.useEffect(() => {
            if (!inlineText) return;
            setInlineText((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    color: config.color,
                    fontSize: config.width && config.width >= 10 ? config.width : prev.fontSize,
                    fontFamily: config.fontFamily || prev.fontFamily,
                    textAlign: config.textAlign || prev.textAlign,
                    bold: config.bold !== undefined ? config.bold : prev.bold,
                    italic: config.italic !== undefined ? config.italic : prev.italic,
                };
            });
        }, [config.color, config.width, config.fontFamily, config.textAlign, config.bold, config.italic]);

        // Ölçü aracı açılıp kapanınca konumlanır ve üst katman tazelenir.
        React.useEffect(() => {
            if (!config.ruler) {
                rulerRef.current = null;
            } else if (!rulerRef.current || rulerRef.current.kind !== config.ruler) {
                const rect = visibleWorldRect();
                rulerRef.current = {
                    kind: config.ruler,
                    x: rect.x + rect.w / 2,
                    y: rect.y + rect.h / 2,
                    angle: 0,
                };
            }
            clearOverlay();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [config.ruler]);

        // Araç değişince üst katmandaki geçici göstergeler silinir: lazer izi,
        // silgi dairesi ve yarım kalmış çokgen ekranda asılı kalıyordu.
        React.useEffect(() => {
            if (config.tool !== 'polygon' && polyPointsRef.current.length > 0) {
                polyPointsRef.current = [];
                setPolyCount(0);
            }
            clearOverlay();
        }, [config.tool]);

        // Çizim kapatıldığında da (ör. sunum kipi) iz bırakmasın.
        React.useEffect(() => {
            if (!enabled) clearOverlay();
        }, [enabled]);

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
        /**
         * Çift parmak jestinin başlangıç durumu: parmak arası mesafe, o anki
         * ölçek ve parmakların ORTA NOKTASININ altında kalan dünya noktası.
         * Görünüm her karede bu dünya noktası güncel orta noktaya gelecek
         * şekilde kurulur; böylece aynı jest hem yakınlaştırır hem kaydırır.
         */
        const pinchRef = React.useRef<{
            dist: number;
            scale: number;
            worldX: number;
            worldY: number;
            /** Tuvalin ekrandaki yeri; jest boyunca yeniden ölçülmez. */
            map: { left: number; top: number; sx: number; sy: number };
        } | null>(null);
        const panRef = React.useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

        /** Ekranda duran ölçü aracı (cetvel/gönye/açıölçer) ve sürükleme kipi. */
        const rulerRef = React.useRef<RulerState | null>(null);
        const rulerDragRef = React.useRef<{
            mode: 'move' | 'rotate';
            grabX: number;
            grabY: number;
            startAngle: number;
        } | null>(null);
        /** Çizgi cetvelin hangi kenarına oturdu (hareket boyunca sabit kalır). */
        const rulerEdgeRef = React.useRef<[Point, Point] | null>(null);

        /** Döndürme sürüklemesi: başlangıç açısı ve çizimlerin ilk hâli. */
        const rotateRef = React.useRef<{
            center: Point;
            startAngle: number;
            orig: Stroke[];
        } | null>(null);
        const [rotationHint, setRotationHint] = React.useState<number | null>(null);
        /** Tanınan denklemin onay bekleyen hâli. */
        const [equationDraft, setEquationDraft] = React.useState<string | null>(null);

        /** Son kalem (stylus) olayının zamanı — avuç içi reddi için. */
        const lastPenAtRef = React.useRef(0);
        /** Kalem kullanıldıktan sonra parmağın yok sayılacağı süre. */
        const PEN_PRIORITY_MS = 1200;
        /** Sürücü temas alanı bildiriyorsa bu genişlikten büyüğü avuç sayılır. */
        const PALM_CONTACT_PX = 45;

        /** Çok parmak dokunuşu (2 = geri al, 3 = ileri al) izleme. */
        const tapRef = React.useRef<{
            maxPointers: number;
            start: number;
            moved: number;
            origin: Map<number, Point>;
        } | null>(null);

        /** Kaybolan mürekkep: sayfaya işlenmeyen, solup giden çizgiler. */
        const ephemeralRef = React.useRef<{ stroke: Stroke; born: number }[]>([]);
        const ephemeralFrameRef = React.useRef<number | null>(null);
        /** Çizginin ekranda kalma ve solma süreleri. */
        const EPHEMERAL_LIFE = 4000;
        const EPHEMERAL_FADE = 1400;

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
        /** Hız sıçramalarını yumuşatmak için hareketli ortalama hızı (px/ms). */
        const lastVelocityRef = React.useRef(0.4);
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

        /** Lazer aracı için sönen kuyruk noktaları ve animasyon döngüsü */
        const laserTrailRef = React.useRef<{ x: number; y: number; time: number }[]>([]);
        const laserPosRef = React.useRef<{ x: number; y: number } | null>(null);
        const laserRafRef = React.useRef<number | null>(null);

        /** Koyu arka plan kontrolü (fosforlu kalem ve kontrast ayarları için) */
        const isDark = React.useMemo(() => {
            return bgColor === '#1a1a2e' || bgColor === '#111827';
        }, [bgColor]);

        /**
         * Sayfanın dünya koordinatındaki dikdörtgeni.
         *
         * Sol üst köşe orijindedir: yeni bir defter açıldığında görünüm de
         * orijinde olduğu için çizim doğal olarak sayfanın içinde başlar.
         */
        const pageRect = React.useMemo(
            () => (pageBox ? { x: 0, y: 0, w: pageBox.w, h: pageBox.h } : null),
            [pageBox]
        );
        const pageRectRef = React.useRef(pageRect);
        pageRectRef.current = pageRect;

        /**
         * Sayfalı defterlerde çalışma masasının kendisi çizim yüzeyi değildir.
         * Küçük bir tolerans kalem ucunun tam kenarda kesilmesini engeller;
         * kaydedilen mürekkep yine aşağıdaki canvas kırpmasıyla sayfada kalır.
         */
        const isInsidePage = (point: Point, tolerance = 0) => {
            const page = pageRectRef.current;
            if (!page) return true;
            return (
                point.x >= page.x - tolerance &&
                point.x <= page.x + page.w + tolerance &&
                point.y >= page.y - tolerance &&
                point.y <= page.y + page.h + tolerance
            );
        };

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
        /**
         * Tuvalin ekrandaki yeri ve CSS ölçeği.
         *
         * `getBoundingClientRect` yerleşimi (layout) hesaplatır; jest boyunca
         * her işaretçi olayında çağırmak, aynı anda süren React render'larıyla
         * birleşince kaydırmayı takılmalı yapar. Jest başında bir kez ölçülüp
         * saklanır.
         */
        const canvasMetrics = () => {
            const canvas = canvasRef.current;
            const rect = canvas?.getBoundingClientRect();
            if (!canvas || !rect) return { left: 0, top: 0, sx: 1, sy: 1 };
            return {
                left: rect.left,
                top: rect.top,
                sx: rect.width ? canvas.offsetWidth / rect.width : 1,
                sy: rect.height ? canvas.offsetHeight / rect.height : 1,
            };
        };

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
            setEquationDraft(null);
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
            const page = pageRectRef.current;
            if (page) {
                bCtx.save();
                bCtx.beginPath();
                bCtx.rect(page.x, page.y, page.w, page.h);
                bCtx.clip();
            }
            strokesRef.current.forEach((s, i) => {
                if (exclude?.has(i)) return;
                if (inlineTextRef.current?.strokeIdx === i) return;
                drawStroke(bCtx, s, simTimeRef.current, isDark);
            });
            if (page) bCtx.restore();
        }, [isDark]);

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
                const page = pageRectRef.current;
                if (page) {
                    mainCtx.save();
                    mainCtx.beginPath();
                    mainCtx.rect(page.x, page.y, page.w, page.h);
                    mainCtx.clip();
                }
                live.forEach((s) => drawStroke(mainCtx, s, simTimeRef.current, isDark));
                if (page) mainCtx.restore();
                applyIdentity(mainCtx);
            }

            // Sayfa dışı masa yüzeyini belirginleştir. Mürekkep üstteki
            // çizim adımlarında zaten sayfa kutusuna kırpılmıştır.
            const page = pageRectRef.current;
            if (page) {
                const pv = viewRef.current;
                const px = page.x * pv.scale + pv.tx;
                const py = page.y * pv.scale + pv.ty;
                const pw = page.w * pv.scale;
                const ph = page.h * pv.scale;
                mainCtx.save();
                mainCtx.fillStyle = 'rgba(226, 232, 240, 0.78)';
                mainCtx.fillRect(0, 0, w, Math.max(0, py));
                mainCtx.fillRect(0, py + ph, w, Math.max(0, h - py - ph));
                mainCtx.fillRect(0, py, Math.max(0, px), ph);
                mainCtx.fillRect(px + pw, py, Math.max(0, w - px - pw), ph);
                mainCtx.strokeStyle = 'rgba(15, 23, 42, 0.28)';
                mainCtx.lineWidth = 1;
                mainCtx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
                mainCtx.restore();
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

        /**
         * Görünümü değiştirir ve yeniden çizer.
         *
         * İşaretçi olayları ekran karesinden daha sık gelir (tablette saniyede
         * 120'ye kadar). Her olayda hem bütün sayfayı yeniden çizmek hem de
         * React durumunu güncellemek — ki bu, kağıt deseni ve metin kutuları
         * görünümü takip etsin diye defter ekranının tamamını yeniden
         * render eder — kaydırmayı takılmalı hâle getiriyordu. Görünüm artık
         * KAREDE BİR kez uygulanır: `viewRef` anında güncellenir (isabet
         * testleri ve dünya/ekran dönüşümleri doğru kalsın), ekrana yansıması
         * bir sonraki çizim karesine bırakılır.
         */
        const viewFrameRef = React.useRef<number | null>(null);
        const pendingViewRef = React.useRef<Viewport | null>(null);

        const flushView = React.useCallback(() => {
            const pending = pendingViewRef.current;
            pendingViewRef.current = null;
            if (!pending) return;
            // Jest sürerken bu bileşenin kendi durumu güncellenmez: `view`
            // yalnızca seçim tutamaçlarının ve metin kutusu imlecinin DOM
            // konumunu besler, mürekkep ve seçim çerçevesi zaten `viewRef` ile
            // çizilir. Hareket bitince (stopDrawing) bir kez eşitlenir.
            if (!pinchRef.current && !panRef.current) setViewState(pending);
            onViewChangeRef.current?.(pending, getCanvasSize());
            redraw();
            if (rulerRef.current) clearOverlay();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [redraw]);

        /** Jest bitince görünüm durumunu tuvalin gerçek görünümüyle eşitler. */
        const syncViewState = React.useCallback(() => {
            setViewState((prev) => {
                const v = viewRef.current;
                return prev.scale === v.scale && prev.tx === v.tx && prev.ty === v.ty
                    ? prev
                    : { ...v };
            });
        }, []);

        const applyViewChange = React.useCallback(
            (next: Viewport) => {
                const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale));
                const v = { scale, tx: next.tx, ty: next.ty };
                viewRef.current = v;
                pendingViewRef.current = v;
                if (viewFrameRef.current !== null) return;
                viewFrameRef.current = window.requestAnimationFrame(() => {
                    viewFrameRef.current = null;
                    flushView();
                });
            },
            [flushView]
        );

        React.useEffect(
            () => () => {
                if (viewFrameRef.current !== null) {
                    window.cancelAnimationFrame(viewFrameRef.current);
                    viewFrameRef.current = null;
                }
            },
            []
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

        const doUndo = React.useCallback(() => {
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [commitStrokes, emitPage, notifyHistory, redraw]);

        const doRedo = React.useCallback(() => {
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [commitStrokes, emitPage, notifyHistory, redraw]);

        const commitInlineText = React.useCallback(
            (textValue?: string) => {
                if (!inlineText) return;
                const text = (textValue !== undefined ? textValue : inlineText.text).trim();
                if (inlineText.strokeIdx !== undefined) {
                    const idx = inlineText.strokeIdx;
                    const existing = strokesRef.current[idx];
                    if (existing) {
                        pushHistory();
                        if (!text) {
                            const removedId = existing.id;
                            strokesRef.current.splice(idx, 1);
                            commitStrokes();
                            if (removedId)
                                emit({ type: 'remove', page: currentPageRef.current, ids: [removedId] });
                            deselect();
                        } else {
                            const updated: Stroke = {
                                ...existing,
                                text,
                                color: inlineText.color,
                                width: inlineText.fontSize,
                                fontFamily: inlineText.fontFamily,
                                textAlign: inlineText.textAlign,
                                bold: inlineText.bold,
                                italic: inlineText.italic,
                            };
                            strokesRef.current[idx] = updated;
                            commitStrokes();
                            emit({ type: 'update', page: currentPageRef.current, strokes: [updated] });
                        }
                        redraw();
                    }
                } else if (text) {
                    pushHistory();
                    const s: Stroke = {
                        id: newStrokeId(),
                        tool: 'text',
                        text,
                        color: inlineText.color,
                        width: inlineText.fontSize,
                        fontFamily: inlineText.fontFamily,
                        textAlign: inlineText.textAlign,
                        bold: inlineText.bold,
                        italic: inlineText.italic,
                        points: [{ x: inlineText.worldX, y: inlineText.worldY }],
                    };
                    strokesRef.current.push(s);
                    commitStrokes();
                    emit({ type: 'add', page: currentPageRef.current, strokes: [s] });
                    setSelection([strokesRef.current.length - 1]);
                    redraw();
                }
                setInlineText(null);
            },
            [commitStrokes, deselect, emit, inlineText, pushHistory, redraw, setSelection]
        );

        // Metin modu dışına çıkıldığında açık metni kaydet
        React.useEffect(() => {
            if (config.tool !== 'text' && inlineTextRef.current) {
                commitInlineText();
            }
        }, [config.tool, commitInlineText]);

        // Sayfa dışına veya farklı bir alana tıklandığında metin kutusunu tamamla ve sayfaya işle
        React.useEffect(() => {
            if (!inlineText) return;
            const onPointerDownOutside = (e: PointerEvent) => {
                if (textBoxContainerRef.current?.contains(e.target as Node)) {
                    return;
                }
                const target = e.target as HTMLElement | null;
                // Toolbar veya araç butonlarına basıldığında (yazı tipi, renk, kalın vb. değiştirirken) kutuyu kapatma
                if (
                    target?.closest(
                        '[data-drawing-toolbar], [aria-label*="araç"], [aria-label*="Araç"], [title*="Yazı"], [title*="Metin"], [title*="Font"], [title*="Renk"], [title*="Boyut"]'
                    )
                ) {
                    return;
                }
                // Tuval üzerine basıldığında zaten startDrawing commitInlineText() çağırıp yeni kutuyu açacaktır
                if (canvasRef.current && canvasRef.current === target) {
                    return;
                }
                commitInlineText();
            };
            window.addEventListener('pointerdown', onPointerDownOutside);
            return () => window.removeEventListener('pointerdown', onPointerDownOutside);
        }, [inlineText, commitInlineText]);

        const insertImageAt = React.useCallback(
            (src: string, width: number, height: number, cx?: number, cy?: number) => {
                const vis = visibleWorldRect();
                const maxW = vis.w * 0.6;
                const maxH = vis.h * 0.6;
                const ratio = Math.min(maxW / width, maxH / height, 1 / viewRef.current.scale);
                const w = width * ratio;
                const h = height * ratio;
                const x = cx !== undefined ? cx - w / 2 : vis.x + (vis.w - w) / 2;
                const y = cy !== undefined ? cy - h / 2 : vis.y + (vis.h - h) / 2;
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
            [commitStrokes, emit, pushHistory, redraw, setSelection, visibleWorldRect]
        );

        React.useImperativeHandle(
            ref,
            () => ({
                undo: doUndo,
                redo: doRedo,
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
                    insertImageAt(src, width, height);
                },
                zoomBy: (factor: number) => {
                    const { w, h } = getCanvasSize();
                    zoomAt(factor, w / 2, h / 2);
                },
                resetView: () => applyViewChange({ ...IDENTITY_VIEW }),
                fitPage: () => {
                    const page = pageRectRef.current;
                    const { w, h } = getCanvasSize();
                    if (!page || w <= 0 || h <= 0) {
                        applyViewChange({ ...IDENTITY_VIEW });
                        return;
                    }
                    // Kenarlarda biraz boşluk bırakarak sayfayı ekrana oturt.
                    const margin = 24;
                    const scale = Math.min(
                        (w - margin * 2) / page.w,
                        (h - margin * 2) / page.h
                    );
                    applyViewChange({
                        scale,
                        tx: (w - page.w * scale) / 2 - page.x * scale,
                        ty: (h - page.h * scale) / 2 - page.y * scale,
                    });
                },
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
                isBusy: () =>
                    isDrawingRef.current ||
                    dragStateRef.current !== null ||
                    pointersRef.current.size > 0,
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
                renderPageToCanvas: (
                    pageIdx: number,
                    wbMode: boolean,
                    color: string,
                    paper?: PaperStyle,
                    background?: HTMLCanvasElement | null
                ) => {
                    const canvas = canvasRef.current;
                    const buffer = bufferCanvasRef.current;
                    if (!canvas || !buffer) return null;
                    const dpr = window.devicePixelRatio || 1;
                    const page = pageRectRef.current;
                    const exp = document.createElement('canvas');

                    const w = page ? page.w : canvas.width / dpr;
                    const h = page ? page.h : canvas.height / dpr;
                    const outScale = page ? 2 : dpr;
                    exp.width = Math.round(w * outScale);
                    exp.height = Math.round(h * outScale);
                    const ctx = exp.getContext('2d');
                    if (!ctx) return null;
                    ctx.setTransform(outScale, 0, 0, outScale, 0, 0);

                    if (wbMode || page) {
                        ctx.fillStyle = color || '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                    }
                    if (paper && paper !== 'blank') {
                        drawPaper(
                            ctx,
                            paper,
                            wbMode || page ? color || '#ffffff' : 'transparent',
                            w,
                            h,
                            page ? { scale: 1, tx: 0, ty: 0 } : viewRef.current
                        );
                    }

                    if (page && background && background.width > 0) {
                        ctx.drawImage(background, 0, 0, w, h);
                    }

                    const isDark = color === '#1a1a2e' || color === '#111827';
                    const pageStrokes =
                        pageIdx === currentPageRef.current
                            ? strokesRef.current
                            : (pagesRef.current[pageIdx] || []);

                    if (page) {
                        ctx.save();
                        ctx.translate(-page.x, -page.y);
                        pageStrokes.forEach((st) =>
                            drawStroke(ctx, st, simTimeRef.current, isDark)
                        );
                        ctx.restore();
                    } else {
                        ctx.drawImage(buffer, 0, 0, w, h);
                    }

                    return exp;
                },
                screenshot: (
                    wbMode: boolean,
                    color: string,
                    paper?: PaperStyle,
                    background?: HTMLCanvasElement | null
                ) => {
                    const canvas = canvasRef.current;
                    const buffer = bufferCanvasRef.current;
                    if (!canvas || !buffer) return;
                    const dpr = window.devicePixelRatio || 1;
                    const page = pageRectRef.current;
                    const exp = document.createElement('canvas');

                    // Sayfa boyutu tanımlıysa çıktı EKRANIN değil SAYFANIN
                    // tamamıdır; aynı defter her cihazda aynı kadrajla çıkar.
                    const w = page ? page.w : canvas.width / dpr;
                    const h = page ? page.h : canvas.height / dpr;
                    // Kağıt ölçüsünde çıktı için iki kat çözünürlük yeterli.
                    const outScale = page ? 2 : dpr;
                    exp.width = Math.round(w * outScale);
                    exp.height = Math.round(h * outScale);
                    const ctx = exp.getContext('2d');
                    if (!ctx) return;
                    ctx.setTransform(outScale, 0, 0, outScale, 0, 0);

                    if (wbMode || page) {
                        ctx.fillStyle = color || '#ffffff';
                        ctx.fillRect(0, 0, w, h);
                    }
                    if (paper && paper !== 'blank') {
                        drawPaper(
                            ctx,
                            paper,
                            wbMode || page ? color || '#ffffff' : 'transparent',
                            w,
                            h,
                            page ? { scale: 1, tx: 0, ty: 0 } : viewRef.current
                        );
                    }

                    if (page && background && background.width > 0) {
                        ctx.drawImage(background, 0, 0, w, h);
                    }

                    if (page) {
                        ctx.save();
                        ctx.translate(-page.x, -page.y);
                        strokesRef.current.forEach((st) =>
                            drawStroke(ctx, st, simTimeRef.current, isDark)
                        );
                        ctx.restore();
                    } else {
                        ctx.drawImage(buffer, 0, 0, w, h);
                    }

                    const link = document.createElement('a');
                    link.download = `cizim-sayfa${currentPageRef.current + 1}.png`;
                    link.href = exp.toDataURL('image/png');
                    link.click();
                },
            }),
            [
                applyOps,
                applyViewChange,
                doRedo,
                doUndo,
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

        // Pano (Clipboard) yapıştırma: Cmd+V / Ctrl+V ile görsel veya metin yapıştır.
        React.useEffect(() => {
            if (!enabled) return;

            const handlePaste = async (e: ClipboardEvent) => {
                const activeTag = document.activeElement?.tagName?.toLowerCase();
                if (
                    activeTag === 'input' ||
                    activeTag === 'textarea' ||
                    document.activeElement?.getAttribute('contenteditable') === 'true'
                ) {
                    return;
                }

                const items = e.clipboardData?.items;
                if (!items || items.length === 0) return;

                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        if (file) {
                            e.preventDefault();
                            try {
                                const imported = await importImageFile(file);
                                insertImageAt(imported.dataUrl, imported.width, imported.height);
                            } catch (err) {
                                console.error('Pano görseli eklenemedi:', err);
                            }
                            return;
                        }
                    }
                }

                const text = e.clipboardData?.getData('text/plain');
                if (text && text.trim()) {
                    e.preventDefault();
                    const vis = visibleWorldRect();
                    const s: Stroke = {
                        id: newStrokeId(),
                        tool: 'text',
                        text: text.trim(),
                        color: config.color,
                        width: 24,
                        points: [{ x: vis.x + vis.w * 0.35, y: vis.y + vis.h * 0.45 }],
                    };
                    pushHistory();
                    strokesRef.current.push(s);
                    commitStrokes();
                    emit({ type: 'add', page: currentPageRef.current, strokes: [s] });
                    setSelection([strokesRef.current.length - 1]);
                    redraw();
                }
            };

            window.addEventListener('paste', handlePaste);
            return () => window.removeEventListener('paste', handlePaste);
        }, [commitStrokes, config.color, emit, enabled, insertImageAt, pushHistory, redraw, setSelection, visibleWorldRect]);

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

        // Lazer aracı kapatıldığında veya bileşen kapandığında animasyonu durdur
        React.useEffect(() => {
            if (config.tool !== 'sun') {
                if (laserRafRef.current) {
                    cancelAnimationFrame(laserRafRef.current);
                    laserRafRef.current = null;
                }
                laserTrailRef.current = [];
                laserPosRef.current = null;
            }
        }, [config.tool]);

        React.useEffect(() => {
            return () => {
                if (laserRafRef.current) {
                    cancelAnimationFrame(laserRafRef.current);
                    laserRafRef.current = null;
                }
            };
        }, []);

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

        /** Kareli defter adımı; yapışma bu ızgaraya yapılır. */
        const GRID_STEP = 26;
        /** Yapışma mesafesi (ekran pikseli). */
        const SNAP_PX = 7;

        /** Sürükleme sırasında gösterilen hizalama kılavuzları (dünya birimi). */
        const guidesRef = React.useRef<{ x: number[]; y: number[] }>({ x: [], y: [] });

        /** Bir değeri ızgaraya yapıştırır (yeterince yakınsa). */
        const snapToGridValue = (value: number, tolerance: number): number => {
            const nearest = Math.round(value / GRID_STEP) * GRID_STEP;
            return Math.abs(nearest - value) <= tolerance ? nearest : value;
        };

        /**
         * Diğer çizimlerin kenar ve merkez çizgilerini toplar.
         * Taşınan seçim bu değerlere yapışır ve kılavuz çizgi gösterilir.
         */
        const alignmentTargets = (exclude: Set<number>) => {
            const xs: number[] = [];
            const ys: number[] = [];
            strokesRef.current.forEach((st, i) => {
                if (exclude.has(i) || !isSelectable(st)) return;
                const bb = getBB(st);
                xs.push(bb.x1, (bb.x1 + bb.x2) / 2, bb.x2);
                ys.push(bb.y1, (bb.y1 + bb.y2) / 2, bb.y2);
            });
            return { xs, ys };
        };

        /**
         * Taşıma farkını (dx, dy) ızgaraya ve komşu nesnelere yapıştırır.
         * Kılavuz çizgiler `guidesRef` içine yazılır.
         */
        const snapMove = (
            bb: BoundingBox,
            dx: number,
            dy: number,
            targets: { xs: number[]; ys: number[] }
        ): { dx: number; dy: number } => {
            const tol = SNAP_PX / viewRef.current.scale;
            const guides: { x: number[]; y: number[] } = { x: [], y: [] };
            const edgesX = [bb.x1 + dx, (bb.x1 + bb.x2) / 2 + dx, bb.x2 + dx];
            const edgesY = [bb.y1 + dy, (bb.y1 + bb.y2) / 2 + dy, bb.y2 + dy];

            let bestX: { delta: number; guide: number } | null = null;
            for (const edge of edgesX) {
                for (const target of targets.xs) {
                    const diff = target - edge;
                    if (Math.abs(diff) <= tol && (!bestX || Math.abs(diff) < Math.abs(bestX.delta))) {
                        bestX = { delta: diff, guide: target };
                    }
                }
            }
            let bestY: { delta: number; guide: number } | null = null;
            for (const edge of edgesY) {
                for (const target of targets.ys) {
                    const diff = target - edge;
                    if (Math.abs(diff) <= tol && (!bestY || Math.abs(diff) < Math.abs(bestY.delta))) {
                        bestY = { delta: diff, guide: target };
                    }
                }
            }

            let outX = dx;
            let outY = dy;
            if (bestX) {
                outX = dx + bestX.delta;
                guides.x.push(bestX.guide);
            } else {
                // Nesne yoksa ızgaraya yapış: kutunun sol kenarı hizalanır.
                const snapped = snapToGridValue(bb.x1 + dx, tol);
                outX = dx + (snapped - (bb.x1 + dx));
            }
            if (bestY) {
                outY = dy + bestY.delta;
                guides.y.push(bestY.guide);
            } else {
                const snapped = snapToGridValue(bb.y1 + dy, tol);
                outY = dy + (snapped - (bb.y1 + dy));
            }
            guidesRef.current = guides;
            return { dx: outX, dy: outY };
        };

        /** Şekil çizerken bir noktayı ızgaraya yapıştırır. */
        const snapPoint = (p: Point): Point => {
            if (!config.snapToGrid) return p;
            const tol = SNAP_PX / viewRef.current.scale;
            return { ...p, x: snapToGridValue(p.x, tol), y: snapToGridValue(p.y, tol) };
        };

        /** Hizalama kılavuzlarını üst katmana çizer. */
        const drawGuides = () => {
            const oCtx = overlayCtxRef.current;
            const guides = guidesRef.current;
            if (!oCtx) return;
            const canvas = canvasRef.current;
            const dpr = window.devicePixelRatio || 1;
            const w = canvas ? canvas.width / dpr : 0;
            const h = canvas ? canvas.height / dpr : 0;
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
            if (guides.x.length === 0 && guides.y.length === 0) return;
            const v = viewRef.current;
            oCtx.save();
            oCtx.strokeStyle = '#f43f5e';
            oCtx.lineWidth = 1;
            oCtx.setLineDash([5, 4]);
            for (const gx of guides.x) {
                const sx = gx * v.scale + v.tx;
                oCtx.beginPath();
                oCtx.moveTo(sx, 0);
                oCtx.lineTo(sx, h);
                oCtx.stroke();
            }
            for (const gy of guides.y) {
                const sy = gy * v.scale + v.ty;
                oCtx.beginPath();
                oCtx.moveTo(0, sy);
                oCtx.lineTo(w, sy);
                oCtx.stroke();
            }
            oCtx.restore();
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
            // iOS/iPadOS WebKit'te getCoalescedEvents() örnekleri ters sırada veya
            // mikro-titreşimlerle döndüren bir çekirdek hatasına sahiptir. Kalın uçlu
            // fosforlu kalemlerde katlanma ve kesikler oluşmaması için iOS'ta ana olay kullanılır.
            if (isIOS) {
                return [
                    {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        pressure: e.pressure,
                        pointerType: e.pointerType,
                    },
                ];
            }
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
            const page = pageRectRef.current;
            if (page) {
                mainCtx.beginPath();
                mainCtx.rect(page.x, page.y, page.w, page.h);
                mainCtx.clip();
            }
            drawStroke(mainCtx, stroke, 0, isDark);
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

        /**
         * Kaybolan mürekkebi üst katmanda solarak çizer.
         *
         * Sayfaya işlenmediği için geri al geçmişine girmez ve kayıtta yer
         * kaplamaz; ders anlatırken geçici vurgular için kullanılır.
         */
        const paintEphemeral = React.useCallback(() => {
            const oCtx = overlayCtxRef.current;
            if (!oCtx) {
                ephemeralFrameRef.current = null;
                return;
            }
            const now = performance.now();
            ephemeralRef.current = ephemeralRef.current.filter(
                (item) => now - item.born < EPHEMERAL_LIFE
            );
            const canvas = canvasRef.current;
            const dpr = window.devicePixelRatio || 1;
            const w = canvas ? canvas.width / dpr : 0;
            const h = canvas ? canvas.height / dpr : 0;
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
            if (ephemeralRef.current.length === 0) {
                ephemeralFrameRef.current = null;
                return;
            }
            applyView(oCtx);
            for (const item of ephemeralRef.current) {
                const age = now - item.born;
                const remaining = EPHEMERAL_LIFE - age;
                const alpha = remaining >= EPHEMERAL_FADE ? 1 : Math.max(0, remaining / EPHEMERAL_FADE);
                oCtx.save();
                oCtx.globalAlpha = alpha;
                drawStroke(oCtx, item.stroke, 0, isDark);
                oCtx.restore();
            }
            applyIdentity(oCtx);
            ephemeralFrameRef.current = window.requestAnimationFrame(paintEphemeral);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        const addEphemeral = (stroke: Stroke) => {
            ephemeralRef.current.push({ stroke, born: performance.now() });
            if (ephemeralFrameRef.current === null) {
                ephemeralFrameRef.current = window.requestAnimationFrame(paintEphemeral);
            }
        };

        React.useEffect(
            () => () => {
                if (ephemeralFrameRef.current !== null) {
                    window.cancelAnimationFrame(ephemeralFrameRef.current);
                }
            },
            []
        );

        /**
         * Bu işaretçi yok sayılmalı mı? (Avuç içi reddi)
         *
         * Kalem kullanılırken gelen parmak dokunuşları ve sürücünün geniş
         * bildirdiği temaslar (avuç, bilek) çizim başlatmaz. Görünüm jestleri
         * bundan etkilenmez: iki parmak yakınlaştırma yine çalışır.
         */
        const isPalmTouch = (e: React.PointerEvent): boolean => {
            if (e.pointerType === 'pen') {
                lastPenAtRef.current = performance.now();
                return false;
            }
            if (config.palmRejection === false || e.pointerType !== 'touch') return false;
            if (performance.now() - lastPenAtRef.current < PEN_PRIORITY_MS) return true;
            return (e.width ?? 0) > PALM_CONTACT_PX || (e.height ?? 0) > PALM_CONTACT_PX;
        };

        /** Çok parmak dokunuşunu izlemeye başlar/genişletir. */
        const trackTapStart = (e: React.PointerEvent) => {
            const count = pointersRef.current.size;
            if (count < 2) {
                tapRef.current = null;
                return;
            }
            const origin = new Map(pointersRef.current);
            tapRef.current = {
                maxPointers: Math.max(count, tapRef.current?.maxPointers ?? 0),
                start: tapRef.current?.start ?? performance.now(),
                moved: tapRef.current?.moved ?? 0,
                origin,
            };
        };

        /** Parmaklar kalkınca dokunuşu değerlendirir: 2 = geri al, 3 = ileri al. */
        const resolveTap = () => {
            const tap = tapRef.current;
            if (!tap || pointersRef.current.size > 0) return;
            tapRef.current = null;
            if (performance.now() - tap.start > 400 || tap.moved > 16) return;
            if (tap.maxPointers === 2) doUndo();
            else if (tap.maxPointers >= 3) doRedo();
        };

        /**
         * Üst katmanı temizler ve açıksa ölçü aracını yeniden çizer.
         *
         * Cetvel bu katmanda durduğu için her temizlikten sonra geri konur;
         * aksi halde silgi imleci ya da araç değişimi cetveli siliyor olurdu.
         */
        const clearOverlay = () => {
            const oCtx = overlayCtxRef.current;
            if (!oCtx) return;
            const { w, h } = getCanvasSize();
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
            if (rulerRef.current) drawRuler(oCtx, rulerRef.current, viewRef.current);
        };

        /** Lazer aracı için sönen neon kuyruk ve parlak işaretçi ucu çizer */
        const renderLaser = () => {
            const oCtx = overlayCtxRef.current;
            if (!oCtx) return;
            const now = performance.now();
            const trail = laserTrailRef.current;
            const DURATION = 1200; // ms

            // Süresi dolan noktaları temizle
            while (trail.length > 0 && now - trail[0].time > DURATION) {
                trail.shift();
            }

            const { w, h } = getCanvasSize();
            const v = viewRef.current;
            applyIdentity(oCtx);
            oCtx.clearRect(0, 0, w, h);
            if (rulerRef.current) drawRuler(oCtx, rulerRef.current, v);

            // Sönen neon lazer kuyruğu
            if (trail.length > 1) {
                oCtx.save();
                oCtx.lineJoin = 'round';

                for (let i = 0; i < trail.length - 1; i++) {
                    const p1 = toScreenPoint(trail[i], v);
                    const p2 = toScreenPoint(trail[i + 1], v);
                    const age = now - trail[i + 1].time;
                    const progress = Math.max(0, Math.min(1, 1 - age / DURATION));
                    const alpha = Math.pow(progress, 1.4);
                    const width = Math.max(2, 7 * progress);

                    // lineCap='butt' prevents overlapping circular caps from creating bead-like artifacts
                    oCtx.lineCap = i === 0 ? 'round' : 'butt';

                    // 1. Dış neon hale
                    oCtx.beginPath();
                    oCtx.moveTo(p1.x, p1.y);
                    oCtx.lineTo(p2.x, p2.y);
                    oCtx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.35})`;
                    oCtx.lineWidth = width * 2.6;
                    oCtx.stroke();

                    // 2. Ana canlı lazer ışını
                    oCtx.beginPath();
                    oCtx.moveTo(p1.x, p1.y);
                    oCtx.lineTo(p2.x, p2.y);
                    oCtx.strokeStyle = `rgba(255, 40, 40, ${alpha * 0.95})`;
                    oCtx.lineWidth = width;
                    oCtx.stroke();

                    // 3. Parlak beyaz iç çekirdek
                    oCtx.beginPath();
                    oCtx.moveTo(p1.x, p1.y);
                    oCtx.lineTo(p2.x, p2.y);
                    oCtx.strokeStyle = `rgba(255, 235, 235, ${alpha})`;
                    oCtx.lineWidth = Math.max(1, width * 0.35);
                    oCtx.stroke();
                }
                oCtx.restore();
            }

            // Parlayan lazer ucu göstergesi (işaretçi aktifse)
            const pos = laserPosRef.current;
            if (pos && config.tool === 'sun') {
                const s = toScreenPoint(pos, v);
                const r = 9;
                const g = oCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 2.8);
                g.addColorStop(0, 'rgba(255, 255, 255, 1)');
                g.addColorStop(0.25, 'rgba(255, 55, 55, 0.9)');
                g.addColorStop(0.65, 'rgba(239, 68, 68, 0.35)');
                g.addColorStop(1, 'rgba(239, 68, 68, 0)');

                oCtx.fillStyle = g;
                oCtx.beginPath();
                oCtx.arc(s.x, s.y, r * 2.8, 0, Math.PI * 2);
                oCtx.fill();

                oCtx.fillStyle = '#ffffff';
                oCtx.beginPath();
                oCtx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
                oCtx.fill();
            }

            // Kuyrukta nokta varsa ya da lazer aracı seçiliyken işaretçi tuvaldeyse döngüyü sürdür
            if (trail.length > 0 || (config.tool === 'sun' && pos)) {
                laserRafRef.current = requestAnimationFrame(renderLaser);
            } else {
                laserRafRef.current = null;
                if (!pos) {
                    clearOverlay();
                }
            }
        };

        /**
         * Çift parmak jestini o anki parmak konumlarına göre kurar.
         *
         * Parmak eklenip çıkarıldığında da çağrılır: aksi hâlde kalan
         * parmaklar eski ölçüye göre hesaplanır ve sayfa bir anda sıçrardı.
         */
        const anchorPinch = () => {
            const pointers = [...pointersRef.current.values()];
            if (pointers.length < 2) {
                pinchRef.current = null;
                return;
            }
            const [a, b] = pointers;
            const map = canvasMetrics();
            const center = {
                x: ((a.x + b.x) / 2 - map.left) * map.sx,
                y: ((a.y + b.y) / 2 - map.top) * map.sy,
            };
            const v = viewRef.current;
            pinchRef.current = {
                dist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
                scale: v.scale,
                worldX: (center.x - v.tx) / v.scale,
                worldY: (center.y - v.ty) / v.scale,
                map,
            };
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
            trackTapStart(e);

            // Çift parmak: yakınlaştırma/kaydırma kipine geç.
            if (viewportEnabled && pointersRef.current.size === 2) {
                cancelCurrentStroke();
                clearOverlay();
                anchorPinch();
                return;
            }
            if (pointersRef.current.size > 1) return;

            // Avuç içi reddi: kalem elde dururken parmak çizmez.
            if (isPalmTouch(e)) return;

            // Ölçü aracı: gövdesinden taşınır, tutamağından döndürülür.
            const ruler = rulerRef.current;
            if (ruler) {
                const world = toWorld(e.clientX, e.clientY);
                const handle = rulerRotateHandle(ruler);
                const handleDist =
                    Math.hypot(world.x - handle.x, world.y - handle.y) * viewRef.current.scale;
                if (handleDist <= 18) {
                    rulerDragRef.current = {
                        mode: 'rotate',
                        grabX: world.x,
                        grabY: world.y,
                        startAngle: ruler.angle - Math.atan2(world.y - ruler.y, world.x - ruler.x),
                    };
                    return;
                }
                if (rulerHitBody(ruler, world)) {
                    rulerDragRef.current = {
                        mode: 'move',
                        grabX: world.x - ruler.x,
                        grabY: world.y - ruler.y,
                        startAngle: ruler.angle,
                    };
                    return;
                }
            }

            if (config.tool === 'sun') {
                isDrawingRef.current = true;
                const { x, y } = toWorld(e.clientX, e.clientY);
                laserPosRef.current = { x, y };
                laserTrailRef.current.push({ x, y, time: performance.now() });
                if (!laserRafRef.current) {
                    laserRafRef.current = requestAnimationFrame(renderLaser);
                }
                return;
            }

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

            // A4/B5/PDF gibi gerçek sayfalarda gri masa yalnızca gezinme
            // alanıdır. İçerik araçları sayfa dışında yeni nesne başlatmaz.
            if (!isInsidePage({ x, y }, 1 / viewRef.current.scale)) {
                if (inlineTextRef.current) {
                    commitInlineText();
                }
                if (config.tool === 'select' && selectedIdxsRef.current.length) {
                    deselect();
                    redraw();
                }
                return;
            }

            // Kement: varsa seçili nesnelerin tutamacına veya içine dokunulduğunda taşı/boyutlandır.
            if (config.tool === 'lasso' && selectedIdxsRef.current.length > 0 && selBBRef.current) {
                const bb = selBBRef.current;
                const v = viewRef.current;
                const screen = toScreenPoint({ x, y }, v);
                let handled = false;
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
                        handled = true;
                        break;
                    }
                }
                if (!handled && x >= bb.x1 && x <= bb.x2 && y >= bb.y1 && y <= bb.y2) {
                    gestureDirtyRef.current = false;
                    dragStateRef.current = {
                        type: 'move',
                        startX: x,
                        startY: y,
                        orig: selectedIdxsRef.current.map((i) =>
                            JSON.parse(JSON.stringify(strokesRef.current[i].points))
                        ),
                        origBB: { ...bb },
                    };
                    beginDragCache();
                    handled = true;
                }
                if (handled) return;
            }

            // Kement: tek dokunuş bir nesneye isabet ederse onu seçer; aksi halde çerçeve çizer.
            if (config.tool === 'lasso') {
                const pickTolerance = 10 / viewRef.current.scale;
                for (let i = strokesRef.current.length - 1; i >= 0; i--) {
                    if (!isSelectable(strokesRef.current[i])) continue;
                    if (strokeNearPoint(strokesRef.current[i], x, y, pickTolerance)) {
                        setSelection([i]);
                        redraw();
                        return;
                    }
                }
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
                            origBB: { ...bb },
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
                        const hitStroke = strokesRef.current[i];
                        const isDoubleTextClick =
                            hitStroke.tool === 'text' &&
                            lastTextClickRef.current.idx === i &&
                            Date.now() - lastTextClickRef.current.time < 350;
                        lastTextClickRef.current = { idx: i, time: Date.now() };

                        if (isDoubleTextClick) {
                            setInlineText({
                                worldX: hitStroke.points[0].x,
                                worldY: hitStroke.points[0].y,
                                text: hitStroke.text || '',
                                fontSize: hitStroke.width && hitStroke.width > 4 ? hitStroke.width : 22,
                                color: hitStroke.color,
                                fontFamily: hitStroke.fontFamily || 'sans',
                                textAlign: hitStroke.textAlign || 'left',
                                bold: Boolean(hitStroke.bold),
                                italic: Boolean(hitStroke.italic),
                                strokeIdx: i,
                            });
                            return;
                        }

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
                if (inlineText) {
                    commitInlineText();
                }
                const pickTolerance = 14 / viewRef.current.scale;
                for (let i = strokesRef.current.length - 1; i >= 0; i--) {
                    const st = strokesRef.current[i];
                    if (st.tool === 'text' && strokeNearPoint(st, x, y, pickTolerance)) {
                        const fontSize = st.width && st.width > 4 ? st.width : 22;
                        const fontFam = st.fontFamily || 'sans';
                        const align = st.textAlign || 'left';
                        const isBold = Boolean(st.bold);
                        const isItalic = Boolean(st.italic);
                        deselect();
                        setInlineText({
                            worldX: st.points[0].x,
                            worldY: st.points[0].y,
                            text: st.text || '',
                            fontSize,
                            color: st.color,
                            fontFamily: fontFam,
                            textAlign: align,
                            bold: isBold,
                            italic: isItalic,
                            strokeIdx: i,
                        });
                        onConfigChange?.({
                            color: st.color,
                            width: fontSize,
                            fontFamily: fontFam,
                            textAlign: align,
                            bold: isBold,
                            italic: isItalic,
                        });
                        redraw();
                        return;
                    }
                }
                deselect();
                setInlineText({
                    worldX: x,
                    worldY: y,
                    text: '',
                    fontSize: config.width && config.width >= 10 ? config.width : 22,
                    color: config.color,
                    fontFamily: config.fontFamily || 'sans',
                    textAlign: config.textAlign || 'left',
                    bold: Boolean(config.bold),
                    italic: Boolean(config.italic),
                });
                redraw();
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
            // Şekil araçlarında başlangıç noktası da ızgaraya oturur.
            const firstRulerHit = rulerRef.current
                ? snapToRuler(
                      rulerRef.current,
                      { x, y },
                      RULER_SNAP_PX / viewRef.current.scale
                  )
                : null;
            if (firstRulerHit) rulerEdgeRef.current = firstRulerHit.edge;
            const first: Point = firstRulerHit
                ? { x: firstRulerHit.point.x, y: firstRulerHit.point.y }
                : SHAPE_TOOLS.includes(config.tool)
                  ? snapPoint({ x, y })
                  : { x, y };
            lastPointTimeRef.current = performance.now();
            lastVelocityRef.current = 0.4;
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
                dash: config.dash && config.dash !== 'solid' ? config.dash : undefined,
                points: [first],
            };
            activeStrokeBBRef.current = { x1: first.x, y1: first.y, x2: first.x, y2: first.y };
        };

        const draw = (e: React.PointerEvent) => {
            if (e.pointerType === 'pen') lastPenAtRef.current = performance.now();
            if (pointersRef.current.has(e.pointerId)) {
                pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }

            // Çok parmak dokunuşu mu, yoksa gerçek bir hareket mi?
            const tap = tapRef.current;
            if (tap) {
                const origin = tap.origin.get(e.pointerId);
                if (origin) {
                    tap.moved = Math.max(
                        tap.moved,
                        Math.hypot(e.clientX - origin.x, e.clientY - origin.y)
                    );
                }
            }

            // Çift parmak: yakınlaştırma VE kaydırma.
            // Parmakların orta noktası nereye giderse, jest başladığında onun
            // altında duran dünya noktası da oraya taşınır. Yalnızca ölçek
            // hesaplansaydı (eski hâli) parmaklar birlikte kaydırıldığında
            // aralarındaki mesafe değişmediği için sayfa yerinde kalırdı.
            const pinch = pinchRef.current;
            if (pinch && pointersRef.current.size >= 2) {
                const [a, b] = [...pointersRef.current.values()];
                const dist = Math.hypot(b.x - a.x, b.y - a.y) || 1;
                const scale = Math.min(
                    MAX_SCALE,
                    Math.max(MIN_SCALE, (pinch.scale * dist) / pinch.dist)
                );
                const { map } = pinch;
                const centerX = ((a.x + b.x) / 2 - map.left) * map.sx;
                const centerY = ((a.y + b.y) / 2 - map.top) * map.sy;
                applyViewChange({
                    scale,
                    tx: centerX - pinch.worldX * scale,
                    ty: centerY - pinch.worldY * scale,
                });
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

            // Ölçü aracı sürükleniyor.
            const rulerDrag = rulerDragRef.current;
            const rulerNow = rulerRef.current;
            if (rulerDrag && rulerNow) {
                if (rulerDrag.mode === 'move') {
                    rulerNow.x = x - rulerDrag.grabX;
                    rulerNow.y = y - rulerDrag.grabY;
                } else {
                    let angle =
                        rulerDrag.startAngle + Math.atan2(y - rulerNow.y, x - rulerNow.x);
                    // 15°'nin katlarına yakınsa oraya otursun.
                    const step = Math.PI / 12;
                    const snapped = Math.round(angle / step) * step;
                    if (Math.abs(angle - snapped) < (3 * Math.PI) / 180) angle = snapped;
                    rulerNow.angle = angle;
                }
                clearOverlay();
                return;
            }

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

            if ((config.tool === 'select' || config.tool === 'lasso') && dragStateRef.current && selectedIdxsRef.current.length) {
                const drag = dragStateRef.current;
                let dx = x - drag.startX;
                let dy = y - drag.startY;
                if (config.snapToGrid && drag.type === 'move' && drag.origBB) {
                    // Izgaraya ve komşu nesnelere yapış; kılavuzları göster.
                    const snapped = snapMove(
                        drag.origBB,
                        dx,
                        dy,
                        alignmentTargets(new Set(selectedIdxsRef.current))
                    );
                    dx = snapped.dx;
                    dy = snapped.dy;
                }
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
                    if (config.snapToGrid && drag.type === 'move') drawGuides();
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
                laserPosRef.current = { x, y };
                if (isDrawingRef.current) {
                    laserTrailRef.current.push({ x, y, time: performance.now() });
                }
                if (!laserRafRef.current) {
                    laserRafRef.current = requestAnimationFrame(renderLaser);
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
                const rulerHit = rulerRef.current
                    ? snapToRuler(
                          rulerRef.current,
                          { x, y },
                          RULER_SNAP_PX / viewRef.current.scale
                      )
                    : null;
                let end = rulerHit
                    ? rulerHit.point
                    : config.snapAngle
                      ? snapAngle(start, { x, y })
                      : snapPoint({ x, y });

                // Doğru çizgilerde (line, arrow, double_arrow, dashed) akıllı açı kilitlemesi (0, 30, 45, 60, 90)
                if (
                    !rulerHit &&
                    !config.snapAngle &&
                    ['line', 'arrow', 'double_arrow', 'dashed'].includes(stroke.tool)
                ) {
                    const dx = end.x - start.x;
                    const dy = end.y - start.y;
                    const r = Math.hypot(dx, dy);
                    if (r > 18) {
                        const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
                        const targets = [
                            0, 30, 45, 60, 90, 120, 135, 150, 180,
                            -30, -45, -60, -90, -120, -135, -150, -180,
                        ];
                        for (const target of targets) {
                            if (Math.abs(deg - target) < 5) {
                                const rad = (target * Math.PI) / 180;
                                end = { x: start.x + r * Math.cos(rad), y: start.y + r * Math.sin(rad) };
                                break;
                            }
                        }
                    }
                }

                stroke.points = [start, end];
                repaintStrokeRegion(stroke, unionBB([oldBB, getBB(stroke)]));
                return;
            }

            // Serbest çizim: tarayıcının kareye sıkıştırdığı ARA noktalar da
            // Serbest çizim: çizgi parça parça kesikli görünmesin diye
            // aktif çizimin önceki ve yeni sınırlarını kapsayan temiz bölge tazelenir.
            const oldBB = activeStrokeBBRef.current || getBB(stroke);
            let addedPoints = 0;

            for (const sample of coalescedSamples(e)) {
                let raw = toWorld(sample.clientX, sample.clientY);

                // Cetvel/gönye kenarına oturt: hareket boyunca aynı kenarda
                // kalınır, böylece çizgi cetvel boyunca düz gider.
                const ruler = rulerRef.current;
                if (ruler) {
                    const tol = RULER_SNAP_PX / viewRef.current.scale;
                    const edge = rulerEdgeRef.current;
                    if (edge) {
                        const [a, b] = edge;
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const lenSq = dx * dx + dy * dy || 1;
                        const t = ((raw.x - a.x) * dx + (raw.y - a.y) * dy) / lenSq;
                        raw = { ...raw, x: a.x + t * dx, y: a.y + t * dy };
                    } else {
                        const hit = snapToRuler(ruler, raw, tol);
                        if (hit) {
                            rulerEdgeRef.current = hit.edge;
                            raw = hit.point;
                        }
                    }
                }

                const last = stroke.points[stroke.points.length - 1];
                if (!last) break;
                const rawStep = Math.hypot(raw.x - last.x, raw.y - last.y);
                const minStepPx = 0.6;
                if (rawStep * viewRef.current.scale < minStepPx) continue;

                // Dokunmatik tahtaların sinyal gürültüsünü süz: yavaş
                // hareketlerde yumuşat, hızlı hareketlerde olduğu gibi bırak.
                const baseStreamline = getPenProfile(stroke.penType).streamline;
                const levelMultiplier =
                    config.streamlineLevel === 'natural'
                        ? 0.5
                        : config.streamlineLevel === 'calligraphy'
                        ? 1.35
                        : 1.0;
                const streamlineFactor = Math.min(0.85, baseStreamline * levelMultiplier);

                const point: Point = rulerEdgeRef.current
                    ? { x: raw.x, y: raw.y }
                    : smoothTowards(last, raw, rawStep * viewRef.current.scale, streamlineFactor);
                const step = Math.hypot(point.x - last.x, point.y - last.y);

                if (stroke.tool === 'pencil') {
                    // Hız = ekranda alınan yol / geçen süre.
                    const now = performance.now();
                    const elapsed = Math.max(1, now - lastPointTimeRef.current);
                    lastPointTimeRef.current = now;
                    const instantV = (step * viewRef.current.scale) / elapsed;
                    // Hız sıçramalarını üstel hareketli ortalama ile süz
                    const smoothedV = lastVelocityRef.current * 0.35 + instantV * 0.65;
                    lastVelocityRef.current = smoothedV;

                    point.p = samplePressure(
                        sample.pressure,
                        sample.pointerType,
                        smoothedV,
                        last.p,
                        stroke.penType
                    );
                }
                stroke.points.push(point);
                addedPoints++;
            }

            if (addedPoints > 0) {
                const newBB = getBB(stroke);
                activeStrokeBBRef.current = newBB;
                const pad = maxHalfWidth(stroke) + 16;
                const dirty = unionBB([
                    { x1: oldBB.x1 - pad, y1: oldBB.y1 - pad, x2: oldBB.x2 + pad, y2: oldBB.y2 + pad },
                    { x1: newBB.x1 - pad, y1: newBB.y1 - pad, x2: newBB.x2 + pad, y2: newBB.y2 + pad },
                ]);
                repaintStrokeRegion(stroke, dirty, stroke);
            }

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
                // İki parmak = geri al, üç parmak = ileri al.
                resolveTap();
            }
            // Parmak sayısı değişti: jest kalan parmaklara göre yeniden kurulur
            // (ikiden aza inince kapanır), yoksa görünüm sıçrar.
            if (pinchRef.current) anchorPinch();
            if (!pinchRef.current && !panRef.current) syncViewState();
            if (rulerDragRef.current) {
                rulerDragRef.current = null;
                return;
            }
            rulerEdgeRef.current = null;
            if (panRef.current) {
                panRef.current = null;
                syncViewState();
                return;
            }

            if (config.tool === 'lasso' && dragStateRef.current) {
                dragStateRef.current = null;
                guidesRef.current = { x: [], y: [] };
                clearOverlay();
                window.setTimeout(flushPendingOps, 0);
                gestureDirtyRef.current = false;
                endDragCache();
                commitStrokes();
                const moved = new Set(selectedIdxsRef.current);
                const changed = strokesRef.current.filter((_, i) => moved.has(i));
                if (changed.length)
                    emit({ type: 'update', page: currentPageRef.current, strokes: changed });
                redraw();
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
                    guidesRef.current = { x: [], y: [] };
                    clearOverlay();
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
            if (config.tool === 'sun') {
                isDrawingRef.current = false;
                // Çizim bittiğinde lazer kuyruğu rAF döngüsünde yumuşakça sönerek kaybolur
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

                if (!snapped && stroke.tool === 'pencil') {
                    // Kalemi tahtadan kaldırırken oluşan son çengel/kanca sapmalarını temizle
                    stroke.points = filterHookArtifact(stroke.points);
                }

                if (config.ephemeral && (stroke.tool === 'pencil' || stroke.tool === 'highlighter')) {
                    // Kaybolan mürekkep: sayfaya girmez, üst katmanda solar.
                    addEphemeral(stroke);
                    currentStrokeRef.current = null;
                    isDrawingRef.current = false;
                    gestureDirtyRef.current = false;
                    heldShapeRef.current = null;
                    redraw();
                    window.setTimeout(flushPendingOps, 0);
                    return;
                }

                pushHistory();
                strokesRef.current.push(stroke);
                commitStrokes();
                emit({ type: 'add', page: currentPageRef.current, strokes: [stroke] });
                redraw();
            }
            isDrawingRef.current = false;
            gestureDirtyRef.current = false;
            currentStrokeRef.current = null;
            heldShapeRef.current = null;
            // Çizim biterken bekleyen uzak işlemler uygulanır.
            window.setTimeout(flushPendingOps, 0);
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

        /**
         * Onaylanan denklemi sayfaya yazar: el yazısı izleri kaldırılır,
         * yerine aynı yükseklikte düzgün bir metin konur.
         */
        const applyEquation = () => {
            const text = (equationDraft ?? '').trim();
            const idxs = selectedIdxsRef.current;
            const bb = selBBRef.current;
            setEquationDraft(null);
            if (!text || idxs.length === 0 || !bb) return;
            const set = new Set(idxs);
            const inkColor = strokesRef.current[idxs[0]]?.color ?? config.color;
            const height = Math.max(18, Math.min(72, (bb.y2 - bb.y1) * 0.62));
            const label: Stroke = {
                id: newStrokeId(),
                tool: 'text',
                text,
                color: inkColor,
                width: height,
                points: [{ x: bb.x1 + 24, y: (bb.y1 + bb.y2) / 2 }],
            };
            pushHistory();
            const removed = strokesRef.current
                .filter((_, i) => set.has(i))
                .map((st) => st.id)
                .filter((id): id is string => !!id);
            strokesRef.current = strokesRef.current.filter((_, i) => !set.has(i));
            strokesRef.current.push(label);
            commitStrokes();
            if (removed.length)
                emit({ type: 'remove', page: currentPageRef.current, ids: removed });
            emit({ type: 'add', page: currentPageRef.current, strokes: [label] });
            deselect();
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

        const rotateSelection90 = () => {
            const idxs = selectedIdxsRef.current;
            if (idxs.length === 0) return;
            const bb = selBBRef.current;
            if (!bb) return;
            const center = { x: (bb.x1 + bb.x2) / 2, y: (bb.y1 + bb.y2) / 2 };

            pushHistory();
            const updatedStrokes: Stroke[] = [];
            idxs.forEach((idx) => {
                const st = strokesRef.current[idx];
                if (!st) return;
                const rotated = rotateStroke(st, center, Math.PI / 2);
                strokesRef.current[idx] = rotated;
                updatedStrokes.push(rotated);
            });
            refreshSelectionBB();
            commitStrokes();
            emit({ type: 'update', page: currentPageRef.current, strokes: updatedStrokes });
            redraw();
        };

        const flipSelectionH = () => {
            const idxs = selectedIdxsRef.current;
            if (idxs.length === 0) return;
            const bb = selBBRef.current;
            if (!bb) return;
            const cx = (bb.x1 + bb.x2) / 2;

            pushHistory();
            const updatedStrokes: Stroke[] = [];
            idxs.forEach((idx) => {
                const st = strokesRef.current[idx];
                if (!st) return;

                let newStroke: Stroke;
                if (['image', 'math'].includes(st.tool)) {
                    const itemBB = getBB(st);
                    const itemCx = (itemBB.x1 + itemBB.x2) / 2;
                    const targetCx = 2 * cx - itemCx;
                    const dx = targetCx - itemCx;
                    newStroke = {
                        ...st,
                        points: st.points.map((p) => ({ ...p, x: p.x + dx })),
                        flipX: !st.flipX,
                        rotation: st.rotation ? -st.rotation : undefined,
                    };
                } else if (
                    ['rect', 'circle', 'ellipse', 'triangle', 'right_triangle', 'text', 'stamp'].includes(
                        st.tool
                    )
                ) {
                    const itemBB = getBB(st);
                    const itemCx = (itemBB.x1 + itemBB.x2) / 2;
                    const targetCx = 2 * cx - itemCx;
                    const dx = targetCx - itemCx;
                    newStroke = {
                        ...st,
                        points: st.points.map((p) => ({ ...p, x: p.x + dx })),
                        flipX: !st.flipX,
                        rotation: st.rotation ? -st.rotation : undefined,
                    };
                } else {
                    newStroke = {
                        ...st,
                        points: st.points.map((p) => ({ ...p, x: 2 * cx - p.x })),
                    };
                }
                strokesRef.current[idx] = newStroke;
                updatedStrokes.push(newStroke);
            });
            refreshSelectionBB();
            commitStrokes();
            emit({ type: 'update', page: currentPageRef.current, strokes: updatedStrokes });
            redraw();
        };

        const flipSelectionV = () => {
            const idxs = selectedIdxsRef.current;
            if (idxs.length === 0) return;
            const bb = selBBRef.current;
            if (!bb) return;
            const cy = (bb.y1 + bb.y2) / 2;

            pushHistory();
            const updatedStrokes: Stroke[] = [];
            idxs.forEach((idx) => {
                const st = strokesRef.current[idx];
                if (!st) return;

                let newStroke: Stroke;
                if (['image', 'math'].includes(st.tool)) {
                    const itemBB = getBB(st);
                    const itemCy = (itemBB.y1 + itemBB.y2) / 2;
                    const targetCy = 2 * cy - itemCy;
                    const dy = targetCy - itemCy;
                    newStroke = {
                        ...st,
                        points: st.points.map((p) => ({ ...p, y: p.y + dy })),
                        flipY: !st.flipY,
                        rotation: st.rotation ? -st.rotation : undefined,
                    };
                } else if (
                    ['rect', 'circle', 'ellipse', 'triangle', 'right_triangle', 'text', 'stamp'].includes(
                        st.tool
                    )
                ) {
                    const itemBB = getBB(st);
                    const itemCy = (itemBB.y1 + itemBB.y2) / 2;
                    const targetCy = 2 * cy - itemCy;
                    const dy = targetCy - itemCy;
                    newStroke = {
                        ...st,
                        points: st.points.map((p) => ({ ...p, y: p.y + dy })),
                        flipY: !st.flipY,
                        rotation: st.rotation ? -st.rotation : undefined,
                    };
                } else {
                    newStroke = {
                        ...st,
                        points: st.points.map((p) => ({ ...p, y: 2 * cy - p.y })),
                    };
                }
                strokesRef.current[idx] = newStroke;
                updatedStrokes.push(newStroke);
            });
            refreshSelectionBB();
            commitStrokes();
            emit({ type: 'update', page: currentPageRef.current, strokes: updatedStrokes });
            redraw();
        };

        const bringSelectionToFront = () => {
            const idxs = selectedIdxsRef.current;
            if (idxs.length === 0) return;
            pushHistory();
            const selSet = new Set(idxs);
            const unselected: Stroke[] = [];
            const selected: Stroke[] = [];
            strokesRef.current.forEach((st, i) => {
                if (selSet.has(i)) selected.push(st);
                else unselected.push(st);
            });
            strokesRef.current = [...unselected, ...selected];
            const newIdxs = selected.map((_, i) => unselected.length + i);
            selectedIdxsRef.current = newIdxs;
            setSelectedIdxs(newIdxs);
            commitStrokes();
            emit({ type: 'page_set', page: currentPageRef.current, strokes: strokesRef.current });
            redraw();
        };

        const sendSelectionToBack = () => {
            const idxs = selectedIdxsRef.current;
            if (idxs.length === 0) return;
            pushHistory();
            const selSet = new Set(idxs);
            const unselected: Stroke[] = [];
            const selected: Stroke[] = [];
            strokesRef.current.forEach((st, i) => {
                if (selSet.has(i)) selected.push(st);
                else unselected.push(st);
            });
            strokesRef.current = [...selected, ...unselected];
            const newIdxs = selected.map((_, i) => i);
            selectedIdxsRef.current = newIdxs;
            setSelectedIdxs(newIdxs);
            commitStrokes();
            emit({ type: 'page_set', page: currentPageRef.current, strokes: strokesRef.current });
            redraw();
        };

        const alignSelection = (alignType: 'left' | 'center' | 'right') => {
            const idxs = selectedIdxsRef.current;
            if (idxs.length <= 1) return;
            const bb = selBBRef.current;
            if (!bb) return;

            pushHistory();
            const updatedStrokes: Stroke[] = [];
            idxs.forEach((idx) => {
                const st = strokesRef.current[idx];
                if (!st) return;
                const sBB = getBB(st);
                let dx = 0;
                if (alignType === 'left') {
                    dx = bb.x1 - sBB.x1;
                } else if (alignType === 'center') {
                    const overallCx = (bb.x1 + bb.x2) / 2;
                    const itemCx = (sBB.x1 + sBB.x2) / 2;
                    dx = overallCx - itemCx;
                } else if (alignType === 'right') {
                    dx = bb.x2 - sBB.x2;
                }
                const newStroke = {
                    ...st,
                    points: st.points.map((p) => ({ ...p, x: p.x + dx })),
                };
                strokesRef.current[idx] = newStroke;
                updatedStrokes.push(newStroke);
            });
            refreshSelectionBB();
            commitStrokes();
            emit({ type: 'update', page: currentPageRef.current, strokes: updatedStrokes });
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
                    onDragOver={(e) => {
                        if (
                            e.dataTransfer.types.includes('Files') ||
                            e.dataTransfer.types.includes('text/plain')
                        ) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                        }
                    }}
                    onDrop={async (e) => {
                        e.preventDefault();
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const clientX = e.clientX - rect.left;
                        const clientY = e.clientY - rect.top;
                        const v = viewRef.current;
                        const dropWorldX = (clientX - v.tx) / v.scale;
                        const dropWorldY = (clientY - v.ty) / v.scale;

                        const files = Array.from(e.dataTransfer.files).filter((f) =>
                            f.type.startsWith('image/')
                        );
                        if (files.length > 0) {
                            for (const file of files) {
                                try {
                                    const imported = await importImageFile(file);
                                    insertImageAt(
                                        imported.dataUrl,
                                        imported.width,
                                        imported.height,
                                        dropWorldX,
                                        dropWorldY
                                    );
                                } catch (err) {
                                    console.error('Görsel bırakılamadı:', err);
                                }
                            }
                            return;
                        }

                        const text = e.dataTransfer.getData('text/plain');
                        if (text && text.trim()) {
                            const s: Stroke = {
                                id: newStrokeId(),
                                tool: 'text',
                                text: text.trim(),
                                color: config.color,
                                width: 24,
                                points: [{ x: dropWorldX, y: dropWorldY }],
                            };
                            pushHistory();
                            strokesRef.current.push(s);
                            commitStrokes();
                            emit({ type: 'add', page: currentPageRef.current, strokes: [s] });
                            setSelection([strokesRef.current.length - 1]);
                            redraw();
                        }
                    }}
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
                        laserPosRef.current = null;
                        if (!isDrawingRef.current && laserTrailRef.current.length === 0) {
                            if (laserRafRef.current) {
                                cancelAnimationFrame(laserRafRef.current);
                                laserRafRef.current = null;
                            }
                            clearOverlay();
                        }
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
                        ...(whiteboardMode && paper && paper !== 'blank'
                            ? paperBackground(paper, bgColor || '#ffffff', viewRef.current)
                            : {}),
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
                        {/* Döndürme tutamağı: kutunun üstünde ayrı bir daire.
                            Sürüklerken 15°'nin katlarına yakınsa oraya oturur. */}
                        <div
                            className="absolute pointer-events-auto bg-white border-2 border-emerald-500 rounded-full shadow-md hover:bg-emerald-100 transition-colors flex items-center justify-center"
                            style={{
                                left: (selScreenBB.x1 + selScreenBB.x2) / 2 - 9,
                                top: selScreenBB.y1 - 34,
                                width: 18,
                                height: 18,
                                cursor: 'grab',
                                zIndex: 4600,
                                touchAction: 'none',
                            }}
                            title="Döndür (15° adımlara oturur)"
                            aria-label="Seçimi döndür"
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                try {
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                } catch {
                                    /* yakalama reddedilse de sürükleme çalışır */
                                }
                                const bb = selBBRef.current;
                                if (!bb) return;
                                const center = {
                                    x: (bb.x1 + bb.x2) / 2,
                                    y: (bb.y1 + bb.y2) / 2,
                                };
                                const world = toWorld(e.clientX, e.clientY);
                                rotateRef.current = {
                                    center,
                                    startAngle: Math.atan2(world.y - center.y, world.x - center.x),
                                    orig: selectedIdxsRef.current.map((i) =>
                                        JSON.parse(JSON.stringify(strokesRef.current[i]))
                                    ),
                                };
                                gestureDirtyRef.current = false;
                                beginDragCache();
                            }}
                            onPointerMove={(e) => {
                                const rot = rotateRef.current;
                                if (!rot) return;
                                const world = toWorld(e.clientX, e.clientY);
                                const now = Math.atan2(
                                    world.y - rot.center.y,
                                    world.x - rot.center.x
                                );
                                let angle = now - rot.startAngle;
                                // 15°'ye yakınsa oraya yapış (±4°).
                                const step = Math.PI / 12;
                                const snapped = Math.round(angle / step) * step;
                                if (Math.abs(angle - snapped) < (4 * Math.PI) / 180) {
                                    angle = snapped;
                                }
                                scheduleDrag(() => {
                                    markGesture();
                                    selectedIdxsRef.current.forEach((idx, n) => {
                                        const base = rot.orig[n];
                                        if (!base) return;
                                        strokesRef.current[idx] = rotateStroke(
                                            base,
                                            rot.center,
                                            angle
                                        );
                                    });
                                    refreshSelectionBB();
                                    paintDrag();
                                });
                                setRotationHint(Math.round((angle * 180) / Math.PI));
                            }}
                            onPointerUp={(e) => {
                                if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                }
                                if (!rotateRef.current) return;
                                rotateRef.current = null;
                                gestureDirtyRef.current = false;
                                setRotationHint(null);
                                endDragCache();
                                commitStrokes();
                                const moved = new Set(selectedIdxsRef.current);
                                const changed = strokesRef.current.filter((_, i) => moved.has(i));
                                if (changed.length) {
                                    emit({
                                        type: 'update',
                                        page: currentPageRef.current,
                                        strokes: changed,
                                    });
                                }
                            }}
                        />
                        {rotationHint !== null && (
                            <div
                                className="absolute pointer-events-none bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow"
                                style={{
                                    left: (selScreenBB.x1 + selScreenBB.x2) / 2 + 16,
                                    top: selScreenBB.y1 - 40,
                                    zIndex: 4700,
                                }}
                            >
                                {rotationHint}°
                            </div>
                        )}

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
                                    try {
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                } catch {
                                    /* yakalama reddedilse de sürükleme çalışır */
                                }
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
                                        try {
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                } catch {
                                    /* yakalama reddedilse de sürükleme çalışır */
                                }
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

                        {/* Tanınan denklem: onaylanmadan sayfaya işlenmez. */}
                        {equationDraft !== null && (
                            <div
                                className="absolute pointer-events-auto flex items-center gap-2 bg-[#1a1b26]/95 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 shadow-xl"
                                style={{
                                    left: Math.max(4, selScreenBB.x1),
                                    top: Math.max(0, selScreenBB.y2 + 10),
                                    zIndex: 4700,
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                            >
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                    Denklem
                                </span>
                                <input
                                    autoFocus
                                    value={equationDraft}
                                    onChange={(e) => setEquationDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') setEquationDraft(null);
                                        if (e.key === 'Enter') applyEquation();
                                    }}
                                    aria-label="Tanınan denklem"
                                    className="bg-white/10 focus:bg-white/15 rounded-lg px-2 py-1 text-[14px] font-mono text-white outline-none border border-white/15 focus:border-indigo-400 w-[220px]"
                                />
                                <button
                                    type="button"
                                    onClick={applyEquation}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-colors"
                                >
                                    Uygula
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEquationDraft(null)}
                                    className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-[12px] font-semibold transition-colors"
                                >
                                    Vazgeç
                                </button>
                            </div>
                        )}

                        <div
                            role="toolbar"
                            aria-label="Seçim araçları"
                            className="absolute pointer-events-auto flex items-center gap-1 bg-[#1a1b26]/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 shadow-xl"
                            style={{
                                left: Math.max(8, Math.min(selScreenBB.x1, getCanvasSize().w - 360)),
                                top: Math.max(8, selScreenBB.y1 < 60 ? selScreenBB.y2 + 10 : selScreenBB.y1 - 52),
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
                            {/* El yazısı denklemi metne çevir. Yalnızca kalem izi
                                seçiliyken anlamlı olduğu için orada görünür. */}
                            {selectedStrokes.some(
                                (st) => st.tool === 'pencil' || st.tool === 'highlighter'
                            ) && (
                                <>
                                    <div
                                        className="w-px h-4 bg-white/20 mx-1 shrink-0"
                                        aria-hidden="true"
                                    />
                                    <button
                                        type="button"
                                        aria-label="El yazısı denklemi tanı"
                                        title="El yazısı denklemi metne çevir"
                                        className="px-2 h-6 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-all shrink-0 flex items-center gap-1"
                                        onClick={() =>
                                            setEquationDraft(
                                                recognizeEquation(selectedStrokes) || ''
                                            )
                                        }
                                    >
                                        <Sigma className="w-3.5 h-3.5" />
                                        <span className="text-[11px] font-semibold">Tanı</span>
                                    </button>
                                </>
                            )}

                            <div className="w-px h-4 bg-white/20 mx-1 shrink-0" aria-hidden="true" />

                            {/* Seçime toplu kalınlık ve desen: renk gibi, tek
                                dokunuşta bütün seçime uygulanır. */}
                            {SELECTION_WIDTHS.map((w) => (
                                <button
                                    key={w}
                                    type="button"
                                    aria-label={`Kalınlık ${w} piksel`}
                                    title={`Kalınlık ${w} px`}
                                    className="w-6 h-6 rounded-md hover:bg-white/10 transition-all shrink-0 flex items-center justify-center"
                                    onClick={() =>
                                        mutateSelection((idxs) => {
                                            const set = new Set(idxs);
                                            strokesRef.current = strokesRef.current.map((st, i) =>
                                                set.has(i) && st.width !== undefined
                                                    ? {
                                                          ...st,
                                                          width:
                                                              st.tool === 'highlighter' ? w * 5 : w,
                                                      }
                                                    : st
                                            );
                                            refreshSelectionBB();
                                        })
                                    }
                                >
                                    <span
                                        className="rounded-full bg-slate-300"
                                        style={{ width: w + 2, height: w + 2 }}
                                    />
                                </button>
                            ))}
                            <button
                                type="button"
                                aria-label="Çizgi desenini değiştir"
                                title="Düz / kesikli / noktalı"
                                className="w-7 h-6 rounded-md hover:bg-white/10 transition-all shrink-0 flex items-center justify-center"
                                onClick={() =>
                                    mutateSelection((idxs) => {
                                        const set = new Set(idxs);
                                        const order: (DashStyle | undefined)[] = [
                                            undefined,
                                            'dashed',
                                            'dotted',
                                        ];
                                        strokesRef.current = strokesRef.current.map((st, i) => {
                                            if (!set.has(i)) return st;
                                            const at = order.indexOf(st.dash);
                                            const next = order[(at + 1) % order.length];
                                            return { ...st, dash: next };
                                        });
                                        refreshSelectionBB();
                                    })
                                }
                            >
                                <svg width="20" height="8" viewBox="0 0 20 8" aria-hidden="true">
                                    <line
                                        x1="1"
                                        y1="4"
                                        x2="19"
                                        y2="4"
                                        stroke="#cbd5e1"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeDasharray="5 3"
                                    />
                                </svg>
                            </button>

                            {/* Şekil veya çokgen seçiliyse iç dolgusu açma/kapama */}
                            {selectedStrokes.some(
                                (st) => SHAPE_TOOLS.includes(st.tool as any) || st.tool === 'polygon'
                            ) && (
                                <button
                                    type="button"
                                    aria-label="Şekil iç dolgusunu aç / kapat"
                                    title="Şekil İç Dolgusu"
                                    className={cn(
                                        'px-2 h-6 rounded-md transition-all shrink-0 flex items-center gap-1 text-[11px]',
                                        selectedStrokes
                                            .filter(
                                                (st) =>
                                                    SHAPE_TOOLS.includes(st.tool as any) ||
                                                    st.tool === 'polygon'
                                            )
                                            .every((st) => st.fillEnabled)
                                            ? 'bg-sky-500/20 text-sky-400 font-semibold'
                                            : 'text-slate-300 hover:text-white hover:bg-white/10'
                                    )}
                                    onClick={() =>
                                        mutateSelection((idxs) => {
                                            const set = new Set(idxs);
                                            const anyUnfilled = strokesRef.current.some(
                                                (st, i) =>
                                                    set.has(i) &&
                                                    (SHAPE_TOOLS.includes(st.tool as any) ||
                                                        st.tool === 'polygon') &&
                                                    !st.fillEnabled
                                            );
                                            strokesRef.current = strokesRef.current.map((st, i) =>
                                                set.has(i) &&
                                                (SHAPE_TOOLS.includes(st.tool as any) ||
                                                    st.tool === 'polygon')
                                                    ? { ...st, fillEnabled: anyUnfilled }
                                                    : st
                                            );
                                            refreshSelectionBB();
                                        })
                                    }
                                >
                                    <PaintBucket className="w-3.5 h-3.5" />
                                    <span>Dolgu</span>
                                </button>
                            )}

                            <div className="w-px h-4 bg-white/20 mx-1 shrink-0" aria-hidden="true" />

                            {/* Tek metin seçiliyken doğrudan düzenleme düğmesi */}
                            {selectedStrokes.length === 1 && selectedStrokes[0].tool === 'text' && (
                                <>
                                    <button
                                        type="button"
                                        title="Metni Düzenle"
                                        aria-label="Metni Düzenle"
                                        className="px-2 h-6 rounded-md text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 transition-all shrink-0 flex items-center gap-1 font-semibold text-[11px]"
                                        onClick={() => {
                                            const idx = selectedIdxs[0];
                                            const st = strokesRef.current[idx];
                                            if (st) {
                                                setInlineText({
                                                    worldX: st.points[0].x,
                                                    worldY: st.points[0].y,
                                                    text: st.text || '',
                                                    fontSize: st.width && st.width > 4 ? st.width : 20,
                                                    color: st.color,
                                                    fontFamily: st.fontFamily || 'sans',
                                                    textAlign: st.textAlign || 'left',
                                                    bold: Boolean(st.bold),
                                                    italic: Boolean(st.italic),
                                                    strokeIdx: idx,
                                                });
                                            }
                                        }}
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Düzenle</span>
                                    </button>
                                    <div className="w-px h-4 bg-white/20 mx-1 shrink-0" aria-hidden="true" />
                                </>
                            )}

                            {/* Döndürme ve Çevirme (Ayna) */}
                            <button
                                type="button"
                                title="90° Saat Yönünde Döndür"
                                aria-label="90° Döndür"
                                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                onClick={rotateSelection90}
                            >
                                <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                title="Yatay Çevir (Ayna)"
                                aria-label="Yatay Çevir"
                                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                onClick={flipSelectionH}
                            >
                                <FlipHorizontal className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                title="Dikey Çevir (Ayna)"
                                aria-label="Dikey Çevir"
                                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                onClick={flipSelectionV}
                            >
                                <FlipVertical className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-px h-4 bg-white/20 mx-1 shrink-0" aria-hidden="true" />

                            {/* Katman Sıralama: En Öne / En Arkaya */}
                            <button
                                type="button"
                                title="En Öne Getir"
                                aria-label="En Öne Getir"
                                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                onClick={bringSelectionToFront}
                            >
                                <ChevronsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                title="En Arkaya Gönder"
                                aria-label="En Arkaya Gönder"
                                className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                onClick={sendSelectionToBack}
                            >
                                <ChevronsDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Çoklu Seçim Hizalama Araçları */}
                            {selectedIdxs.length > 1 && (
                                <>
                                    <div className="w-px h-4 bg-white/20 mx-1 shrink-0" aria-hidden="true" />
                                    <button
                                        type="button"
                                        title="Sola Hizala"
                                        aria-label="Sola Hizala"
                                        className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                        onClick={() => alignSelection('left')}
                                    >
                                        <AlignLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        title="Ortaya Hizala"
                                        aria-label="Ortaya Hizala"
                                        className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                        onClick={() => alignSelection('center')}
                                    >
                                        <AlignCenter className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        title="Sağa Hizala"
                                        aria-label="Sağa Hizala"
                                        className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors shrink-0"
                                        onClick={() => alignSelection('right')}
                                    >
                                        <AlignRight className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}

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

                {/* GoodNotes & Notability Standardı: Sayfa Üzerinde Doğrudan, Tam Tıklanan Noktada Metin Kutusu */}
                {inlineText && (
                    <div
                        className="absolute left-0 top-0 w-full h-full z-[5000] pointer-events-none overflow-visible"
                        aria-label="Metin kutusu katmanı"
                    >
                        <div
                            ref={textBoxContainerRef}
                            className="absolute pointer-events-auto flex flex-col items-start transition-none"
                            style={{
                                left: inlineText.worldX * view.scale + view.tx,
                                top: inlineText.worldY * view.scale + view.ty,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {/* Üst Taşıma ve İşlem Başlığı (GoodNotes Minimal Tutamaç) */}
                            <div
                                className={cn(
                                    'absolute flex items-center justify-between gap-1.5 select-none z-10',
                                    inlineText.worldY * view.scale + view.ty < 36
                                        ? 'top-full mt-1.5 left-0'
                                        : '-top-7 left-0'
                                )}
                            >
                                <div
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold cursor-move shadow-md active:opacity-80"
                                    title="Metin Kutusunu Taşı"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const startX = e.clientX;
                                        const startY = e.clientY;
                                        const origX = inlineText.worldX;
                                        const origY = inlineText.worldY;
                                        const scale = viewRef.current.scale;
                                        const onMove = (me: PointerEvent) => {
                                            const dx = (me.clientX - startX) / scale;
                                            const dy = (me.clientY - startY) / scale;
                                            setInlineText((p) =>
                                                p ? { ...p, worldX: origX + dx, worldY: origY + dy } : null
                                            );
                                        };
                                        const onUp = () => {
                                            window.removeEventListener('pointermove', onMove);
                                            window.removeEventListener('pointerup', onUp);
                                        };
                                        window.addEventListener('pointermove', onMove);
                                        window.addEventListener('pointerup', onUp);
                                    }}
                                >
                                    <GripHorizontal className="w-3.5 h-3.5 opacity-90" />
                                    <span className="text-[10px] uppercase tracking-wider font-bold">Metin</span>
                                </div>

                                {inlineText.strokeIdx !== undefined && (
                                    <button
                                        type="button"
                                        title="Metni Sil"
                                        aria-label="Metni Sil"
                                        className="p-1 text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const idx = inlineText.strokeIdx!;
                                            pushHistory();
                                            const removedId = strokesRef.current[idx]?.id;
                                            strokesRef.current.splice(idx, 1);
                                            commitStrokes();
                                            if (removedId)
                                                emit({
                                                    type: 'remove',
                                                    page: currentPageRef.current,
                                                    ids: [removedId],
                                                });
                                            deselect();
                                            redraw();
                                            setInlineText(null);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            {/* Doğrudan Sayfa Üzerindeki Şeffaf Metin Kutusu Çerçevesi */}
                            <div
                                className="relative border-2 border-dashed border-sky-400/90 rounded-sm bg-transparent group"
                                style={{
                                    minWidth: `${Math.max(120, inlineText.fontSize * view.scale * 3)}px`,
                                }}
                            >
                                {/* 4 Köşe GoodNotes Tutamacı */}
                                <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-sky-500 border-2 border-white rounded-full pointer-events-none shadow-sm" />
                                <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-sky-500 border-2 border-white rounded-full pointer-events-none shadow-sm" />
                                <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-sky-500 border-2 border-white rounded-full pointer-events-none shadow-sm" />
                                <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-sky-500 border-2 border-white rounded-full pointer-events-none shadow-sm" />

                                <textarea
                                    ref={textareaRef}
                                    autoFocus
                                    value={inlineText.text}
                                    placeholder="Metin yazın..."
                                    rows={Math.max(1, inlineText.text.split('\n').length)}
                                    className="w-full bg-transparent border-0 outline-none resize-none p-0.5 block leading-tight overflow-hidden text-slate-900 dark:text-white"
                                    style={{
                                        color: inlineText.color,
                                        fontSize: `${inlineText.fontSize * view.scale}px`,
                                        lineHeight: 1.25,
                                        fontFamily:
                                            inlineText.fontFamily === 'serif'
                                                ? 'Georgia, Cambria, "Times New Roman", serif'
                                                : inlineText.fontFamily === 'mono'
                                                ? 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
                                                : inlineText.fontFamily === 'cursive'
                                                ? 'Caveat, "Comic Sans MS", cursive'
                                                : 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: inlineText.bold ? 'bold' : 'normal',
                                        fontStyle: inlineText.italic ? 'italic' : 'normal',
                                        textAlign: inlineText.textAlign || 'left',
                                        caretColor: '#0284c7',
                                    }}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setInlineText((prev) => (prev ? { ...prev, text: val } : null));
                                    }}
                                    onInput={(e) => {
                                        const target = e.currentTarget;
                                        target.style.height = 'auto';
                                        target.style.height = `${target.scrollHeight}px`;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            e.preventDefault();
                                            commitInlineText();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
);
