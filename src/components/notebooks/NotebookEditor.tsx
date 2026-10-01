// src/components/notebooks/NotebookEditor.tsx
// Tam ekran defter / beyaz tahta editörü.
// Üstte kendi şeridi (başlık, kağıt deseni, zemin rengi, sayfa gezintisi),
// altta mevcut sürüklenebilir çizim araç çubuğu bulunur. İçerik Firestore'a
// otomatik kaydedilir (yazma sonrası ~1.2 sn beklenir).
import React from 'react';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Bookmark,
    Camera,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Cloud,
    FileDown,
    FileText,
    FileUp,
    Image as ImageIcon,
    LayoutTemplate,
    Layers,
    ListTree,
    Loader2,
    Maximize2,
    Minimize2,
    Plus,
    Tv,
    Printer,
    QrCode,
    Redo2,
    RotateCw,
    Save,
    Scissors,
    Search,
    Share2,
    Trash2,
    Undo2,
    Unlink,
    Users,
} from 'lucide-react';
import {
    buildMultiPagePdf,
    canvasToJpegBytes,
    downloadFile,
    printCanvases,
    type PageImageInput,
} from '../../utils/pdfExport';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { useSurfaceTint } from '../../utils/surfaceTint';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { TextBoxLayer } from '../tools/TextBoxLayer';
import { PDFWorkspaceSearchModal } from '../pdf/PDFWorkspaceSearchModal';
import { PDFOutlineModal } from '../pdf/PDFOutlineModal';
import { PDFDebugOverlay } from '../pdf/PDFDebugOverlay';
import { usePrompt } from '../common/PromptDialog';
import { useToast } from '../common/ToastProvider';
import { useConfirm } from '../common/ConfirmDialog';
import { cn } from '../../utils/cn';
import { BG_COLORS } from '../../constants/drawing';
import { PAPER_STYLES, paperBackground } from './paper';
import { PAGE_SIZES, pageDims } from '../../constants/pageSizes';
import { PageThumbnails } from './PageThumbnails';
import { importImageFile } from '../drawing/imageStore';
import { measurePages } from './pageCodec';
import { publishOp, pruneOps, watchOps } from './notebookOps';
import {
    MAX_CONTENT_BYTES,
    NotebookConflictError,
    NotebookTooLargeError,
    WRITER_ID,
    loadNotebookPages,
    saveNotebookPages,
} from './notebookContent';
import { Curtain, Spotlight } from './LessonTools';
import { LessonModeToolbar, type LessonOverlay } from './LessonModeToolbar';
import { NotebookQrModal } from './NotebookQrModal';
import { CompassTool } from '../tools/CompassTool';
import { NumberLineTool } from '../tools/NumberLineTool';
import { MiniCalculatorTool } from '../tools/MiniCalculatorTool';
import { PeriodicTableTool } from '../tools/PeriodicTableTool';
import { Interactive3DStationTool } from '../tools/Interactive3DStationTool';
import { GeoGebraStudioTool } from '../tools/GeoGebraStudioTool';
import { SimpleMachinesTool } from '../tools/SimpleMachinesTool';
import { DnaGeneticsTool } from '../tools/DnaGeneticsTool';
import { MoleculeBuilderTool } from '../tools/MoleculeBuilderTool';
import { LinearGraphTool } from '../tools/LinearGraphTool';
import { MathFormulaTool } from '../tools/MathFormulaTool';
import { PdfViewerTool } from '../tools/PdfViewerTool';
import { PdfPageBackground } from './PdfPageBackground';
import { savePdfToDB, getPdfDocument, loadPdfFromDB, uploadPdfToCloud } from '../../lib/pdfStorage';
import { firestoreErrorMessage } from './errors';
import type {
    DrawConfig,
    DrawingCanvasHandle,
    MathObject,
    Notebook,
    NotebookOp,
    NotebookPage,
    PageSize,
    PaperStyle,
    Stroke,
    TextBoxData,
    Viewport,
} from '../../types';

interface NotebookEditorProps {
    notebook: Notebook;
    onClose: () => void;
    /** Defterin üst verisini (ad, kağıt, zemin, sayfa sayısı) günceller. */
    onMetaChange: (patch: Partial<Notebook>) => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

/** Otomatik kaydı durduran engelin sebebi. */
type SaveBlock = 'full' | 'load' | 'conflict' | null;

const emptyPage = (): NotebookPage => ({ strokes: [], boxes: [] });

/** Şablonları menüde başlıklandırmak için gruplara ayırır. */
const PAPER_GROUPS = PAPER_STYLES.reduce<
    { label: string; items: typeof PAPER_STYLES[number][] }[]
>((groups, style) => {
    const existing = groups.find((g) => g.label === style.group);
    if (existing) existing.items.push(style);
    else groups.push({ label: style.group, items: [style] });
    return groups;
}, []);

export function NotebookEditor({ notebook, onClose, onMetaChange }: NotebookEditorProps) {
    const canvasRef = React.useRef<DrawingCanvasHandle>(null);

    // Defter tam ekran açılır; kurulu uygulamada saat/pil şeridi üst şeridin
    // rengini alsın, araya beyaz bir bant girmesin.
    useSurfaceTint('#6366f1');
    /** Bağlı PDF sayfasının işlenmiş tuvali — PNG çıktısında arka plan olur. */
    const pdfCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const handlePdfCanvas = React.useCallback((c: HTMLCanvasElement | null) => {
        pdfCanvasRef.current = c;
    }, []);
    const prompt = usePrompt();
    const toast = useToast();
    const confirm = useConfirm();

    const [isLoading, setIsLoading] = React.useState(true);
    const [initialStrokes, setInitialStrokes] = React.useState<Stroke[][] | null>(null);
    const [boxesByPage, setBoxesByPage] = React.useState<TextBoxData[][]>([[]]);
    const [pageInfo, setPageInfo] = React.useState({ current: 0, total: 1 });
    const [saveState, setSaveState] = React.useState<SaveState>('idle');
    /**
     * Otomatik kaydı durduran engel: 'full' içerik sınırı aşıldı, 'load'
     * içerik okunamadı, 'conflict' defter başka bir cihazda da değişti
     * (hepsinde yazmak veriyi silmek olurdu).
     */
    const [saveBlock, setSaveBlock] = React.useState<SaveBlock>(null);
    const saveBlockRef = React.useRef<SaveBlock>(null);
    /** Sınır uyarısı her kayıt denemesinde değil, bir kez gösterilir. */
    const fullWarnedRef = React.useRef(false);
    /** Çakışma uyarısı da her denemede değil, bir kez gösterilir. */
    const conflictWarnedRef = React.useRef(false);
    /** Son kaydedilen içerik parçaları; değişmeyen parça yeniden yazılmaz. */
    const chunksRef = React.useRef<string[]>([]);
    /** Kaydedilmemiş değişiklik var mı (kapanış uyarısı için). */
    const dirtyRef = React.useRef(false);
    const savingRef = React.useRef(false);
    const editRevisionRef = React.useRef(0);
    /** Elimizdeki içeriğin sürümü; başka cihazdaki kayıt bunu ileri taşır. */
    const revRef = React.useRef(0);
    /** Çakışmada kullanıcı "benimkini kaydet" dedi: sonraki kayıt zorlanır. */
    const forceSaveRef = React.useRef(false);
    /** Uzak içerik indirilirken ikinci bir indirme başlamasın. */
    const applyingRef = React.useRef(false);
    /** Art arda gelen uzak değişiklikler için tek tazeleme (debounce). */
    const remoteTimerRef = React.useRef<number | null>(null);
    /** "Başka cihazda güncellendi" bilgisini seyrek göstermek için. */
    const remoteToastAtRef = React.useRef(0);
    /** Son uzak çizim işleminin zamanı: ortak çizim sürüyor mu. */
    const collabAtRef = React.useRef(0);
    /** Ortak çizim göstergesi (şeritte "birlikte çiziliyor" rozeti). */
    const [collab, setCollab] = React.useState(false);
    /** Tam eşitlemeyi sayaçtan çağırmak için (tanım sırası nedeniyle). */
    const applyRemoteRef = React.useRef<(() => Promise<void>) | null>(null);
    /** `save` içinden yeniden kayıt planlamak için (tanım sırası nedeniyle). */
    const scheduleSaveRef = React.useRef<(() => void) | null>(null);
    /** Yayını bekleyen yapışkan not durumu (seyreltme için). */
    const pendingBoxesRef = React.useRef<{ page: number; boxes: TextBoxData[] } | null>(null);
    const boxTimerRef = React.useRef<number | null>(null);

    const [title, setTitle] = React.useState(notebook.title);
    const [pageSize, setPageSize] = React.useState<PageSize>(notebook.page_size ?? 'free');
    const [paper, setPaper] = React.useState<PaperStyle>(
        notebook.paper || (notebook.kind === 'whiteboard' ? 'blank' : 'grid')
    );
    const [bgColor, setBgColor] = React.useState(notebook.bg_color || '#ffffff');

    const [config, setConfig] = React.useState<DrawConfig>(() => {
        let savedPenType: any = 'marker';
        let savedWidth = 4;
        try {
            const pt = localStorage.getItem('notebook_pen_type');
            if (pt) savedPenType = pt;
            const pw = localStorage.getItem('notebook_pen_width');
            if (pw) savedWidth = parseFloat(pw) || 4;
        } catch {}

        return {
            tool: 'pencil',
            color: '#000000',
            width: savedWidth,
            fillEnabled: false,
            stampIcon: '⭐',
            penType: savedPenType,
            streamlineLevel: 'smooth',
            snapShapes: true,
            snapAngle: false,
            eraserMode: 'pixel',
        };
    });

    React.useEffect(() => {
        try {
            if (config.penType) localStorage.setItem('notebook_pen_type', config.penType);
            if (config.width) localStorage.setItem('notebook_pen_width', String(config.width));
        } catch {}
    }, [config.penType, config.width]);

    const [compactHeader, setCompactHeader] = React.useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('notebook_compact_header');
            if (saved !== null) return saved === 'true';
            // Akıllı tahta veya geniş dokunmatik ekranlarda varsayılan kompakt mod
            return window.innerWidth >= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        } catch {
            return false;
        }
    });
    const [hideHeader, setHideHeader] = React.useState<boolean>(false);

    const toggleCompactHeader = () => {
        setCompactHeader((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('notebook_compact_header', String(next));
            } catch {}
            return next;
        });
    };

    const [isTextBoxMode, setIsTextBoxMode] = React.useState(false);

    // ── Ders modu ─────────────────────────────────────────────────────
    // Yalnızca görünümü etkiler; defter içeriğine dokunmaz, kaydedilmez.
    const [overlay, setOverlay] = React.useState<LessonOverlay>('none');
    const [presenting, setPresenting] = React.useState(false);
    const [showQr, setShowQr] = React.useState(false);
    const stageRef = React.useRef<HTMLDivElement>(null);
    const [history, setHistory] = React.useState({ canUndo: false, canRedo: false });
    const [showPaperMenu, setShowPaperMenu] = React.useState(false);
    const [showPages, setShowPages] = React.useState(false);
    const [view, setView] = React.useState<Viewport>({ scale: 1, tx: 0, ty: 0 });
    const [canvasSize, setCanvasSize] = React.useState({ w: 1000, h: 700 });
    const [isInsertingImage, setIsInsertingImage] = React.useState(false);
    /** Küçük resim panelinde gösterilen sayfa verisi (gecikmeli tazelenir). */
    const [thumbPages, setThumbPages] = React.useState<Stroke[][]>([]);
    const [showCompass, setShowCompass] = React.useState(false);
    const [showNumberLine, setShowNumberLine] = React.useState(false);
    const [showCalculator, setShowCalculator] = React.useState(false);
    const [showPeriodicTable, setShowPeriodicTable] = React.useState(false);
    const [show3DStation, setShow3DStation] = React.useState(false);
    const [showGeogebra, setShowGeogebra] = React.useState(false);
    const [showSimpleMachines, setShowSimpleMachines] = React.useState(false);
    const [showDnaGenetics, setShowDnaGenetics] = React.useState(false);
    const [showMoleculeBuilder, setShowMoleculeBuilder] = React.useState(false);
    const [showLinearGraph, setShowLinearGraph] = React.useState(false);
    const [showMathFormula, setShowMathFormula] = React.useState(false);
    const [showPdfViewer, setShowPdfViewer] = React.useState(false);
    const [showPdfMenu, setShowPdfMenu] = React.useState(false);
    const [showExportMenu, setShowExportMenu] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);
    const [exportProgress, setExportProgress] = React.useState('');

    const [pdfDocInstance, setPdfDocInstance] = React.useState<any>(null);
    const [isPdfMissing, setIsPdfMissing] = React.useState(false);
    const [showSearchModal, setShowSearchModal] = React.useState(false);
    const [showOutlineModal, setShowOutlineModal] = React.useState(false);
    const [showPdfDebug, setShowPdfDebug] = React.useState(false);

    // Çoklu cihaz bulut eşitlemesi:
    // Bu cihazda PDF varsa ve henüz buluta yüklenmemişse arka planda Firebase Storage'a yükle
    React.useEffect(() => {
        if (notebook.pdf_id && !notebook.pdf_url) {
            loadPdfFromDB(notebook.pdf_id).then((buffer) => {
                if (buffer) {
                    uploadPdfToCloud(notebook.pdf_id!, notebook.pdf_name || 'belge.pdf', buffer).then(({ url, path }) => {
                        if (url) {
                            onMetaChange({ pdf_url: url, pdf_storage_path: path });
                        }
                    });
                }
            });
        }
    }, [notebook.pdf_id, notebook.pdf_url, notebook.pdf_name, onMetaChange]);

    const handleToggleBookmark = (pageNum: number) => {
        const curBookmarks = notebook.pdf_bookmarks || [];
        const nextBookmarks = curBookmarks.includes(pageNum)
            ? curBookmarks.filter((p) => p !== pageNum)
            : [...curBookmarks, pageNum].sort((a, b) => a - b);
        onMetaChange({ pdf_bookmarks: nextBookmarks });
        toast.info(curBookmarks.includes(pageNum) ? `Sayfa ${pageNum} yer imlerinden çıkarıldı.` : `Sayfa ${pageNum} yer imlerine eklendi.`);
    };

    const handleRotatePage = (pageNum: number) => {
        const curRotations = notebook.pdf_rotations || {};
        const cur = curRotations[pageNum] || 0;
        const next = (cur + 90) % 360;
        const nextRotations = { ...curRotations, [pageNum]: next };
        onMetaChange({ pdf_rotations: nextRotations });
        toast.info(`Sayfa ${pageNum} ${next}° döndürüldü.`);
    };

    const handleRotateCurrentPage = () => {
        handleRotatePage(pageInfo.current + 1);
    };

    const handleSelectTool = (toolId: string) => {
        if (toolId === 'compass') setShowCompass(true);
        else if (toolId === 'numberLine' || toolId === 'number_line') setShowNumberLine(true);
        else if (toolId === 'calculator') setShowCalculator(true);
        else if (toolId === 'periodicTable' || toolId === 'periodic_table') setShowPeriodicTable(true);
        else if (toolId === '3dStation' || toolId === '3d_station' || toolId === 'station_3d') setShow3DStation(true);
        else if (toolId === 'geogebra' || toolId === 'tool_geogebra') setShowGeogebra(true);
        else if (toolId === 'simpleMachines' || toolId === 'simple_machines' || toolId === 'tool_simple_machines') setShowSimpleMachines(true);
        else if (toolId === 'dnaGenetics' || toolId === 'dna_genetics' || toolId === 'tool_dna_genetics') setShowDnaGenetics(true);
        else if (toolId === 'moleculeBuilder' || toolId === 'molecule_builder' || toolId === 'tool_molecule_builder') setShowMoleculeBuilder(true);
        else if (toolId === 'linearGraph' || toolId === 'linear_graph' || toolId === 'tool_linear_graph') setShowLinearGraph(true);
        else if (toolId === 'mathFormula' || toolId === 'math_formula' || toolId === 'tool_math_formula') setShowMathFormula(true);
        else if (toolId === 'pdfViewer' || toolId === 'pdf_viewer' || toolId === 'tool_pdf_viewer') setShowPdfViewer(true);
    };

    const boxesRef = React.useRef<TextBoxData[][]>([[]]);
    boxesRef.current = boxesByPage;
    const saveTimerRef = React.useRef<number | null>(null);
    const savedTimerRef = React.useRef<number | null>(null);

    // ── İçeriği yükle ────────────────────────────────────────────────
    React.useEffect(() => {
        let alive = true;
        (async () => {
            let pages: NotebookPage[] = [emptyPage()];
            try {
                const content = await loadNotebookPages(notebook.id);
                pages = content.pages;
                // Okunan parça sayısı bilinsin ki defter küçüldüğünde artan
                // parçalar ilk kayıtta silinsin.
                chunksRef.current = new Array<string>(content.chunkCount).fill('');
                revRef.current = content.rev;
            } catch {
                // İçerik okunamadıysa boş sayfa açılır ama otomatik kayıt
                // kilitlenir: aksi halde ilk kayıt gerçek içeriği silerdi.
                if (alive) {
                    setSaveBlock('load');
                    saveBlockRef.current = 'load';
                }
                toast.error(
                    'Defter içeriği yüklenemedi. Veriyi korumak için kayıt durduruldu; sayfayı yenileyin.'
                );
            }
            if (!alive) return;
            const targetTotal = Math.max(pages.length, notebook.pdf_total_pages || notebook.page_count || 1);
            while (pages.length < targetTotal) {
                pages.push(emptyPage());
            }
            setInitialStrokes(pages.map((p) => p.strokes));
            setBoxesByPage(pages.map((p) => p.boxes));
            setPageInfo({ current: 0, total: pages.length });
            setIsLoading(false);
            // Sayfa ölçüsü tanımlıysa defter açılırken sayfanın tamamı
            // görünsün; yakınlaştırma yine serbesttir. PDF bağlı defterlerde
            // ölçü PDF'ten gelir; kutusu olmayan eski defterlerde görünüme
            // hiç dokunulmaz (eskiden olduğu gibi açılır).
            const openBox = notebook.pdf_id
                ? notebook.pdf_box ?? null
                : pageDims(notebook.page_size);
            window.setTimeout(() => {
                if (openBox) canvasRef.current?.fitPage();
            }, 80);
        })();
        return () => {
            alive = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notebook.id]);

    // ── Kaydetme ─────────────────────────────────────────────────────
    /** Tuvaldeki çizimlerle metin kutularını tek bir sayfa dizisinde toplar. */
    const collectPages = React.useCallback((): NotebookPage[] => {
        const strokePages = canvasRef.current?.getPages() ?? [];
        const boxes = boxesRef.current;
        const total = Math.max(strokePages.length, boxes.length, 1);
        return Array.from({ length: total }, (_, i) => ({
            strokes: strokePages[i] ?? [],
            boxes: boxes[i] ?? [],
        }));
    }, []);

    const save = React.useCallback(async () => {
        // İçerik okunamadıysa yazmak defteri silmek olurdu.
        if (saveBlockRef.current === 'load') return;
        // Çakışma kullanıcı seçim yapana kadar her 1,2 saniyede bir yeniden
        // denenmesin; yalnızca "benim sürümüm kalsın" denince yazılır.
        if (saveBlockRef.current === 'conflict' && !forceSaveRef.current) return;
        const pages = collectPages();
        setSaveState('saving');
        try {
            // İçerik 1 MiB'lık doküman sınırını aşarsa parçalara bölünerek
            // yazılır; defter büyüdükçe kayıt durmaz.
            const force = forceSaveRef.current;
            forceSaveRef.current = false;
            const result = await saveNotebookPages(notebook.id, pages, {
                previous: chunksRef.current,
                baseRev: revRef.current,
                force,
            });
            chunksRef.current = result.parts;
            revRef.current = result.rev;
            dirtyRef.current = false;
            setSaveBlock(null);
            saveBlockRef.current = null;
            fullWarnedRef.current = false;
            conflictWarnedRef.current = false;
            // Sayfa sayısı ve sürüm, üst veri dokümanına aynı işlem içinde
            // yazıldı; burada ayrıca güncellemeye gerek yok.
            setSaveState('saved');
            if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
            savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000);
        } catch (e) {
            setSaveState('idle');
            if (e instanceof NotebookConflictError) {
                // Ortak çizim sürerken çakışma beklenen bir durumdur: iki
                // taraf da aynı operasyonları uyguladığı için içerikler
                // aynıdır, kaydı sunucudaki sürümün üstüne yazmak yeterli.
                if (Date.now() - collabAtRef.current < 20000) {
                    revRef.current = e.serverRev;
                    forceSaveRef.current = true;
                    scheduleSaveRef.current?.();
                    return;
                }
                // Ortak çizim yoksa defter başka bir cihazda ayrıca
                // düzenlenmiş demektir; hangi sürümün kalacağına kullanıcı
                // şerideki rozetten karar verir.
                setSaveBlock('conflict');
                saveBlockRef.current = 'conflict';
                if (conflictWarnedRef.current) return;
                conflictWarnedRef.current = true;
                toast.error(
                    'Bu defter başka bir cihazda da değiştirildi. Değişiklikleriniz kaydedilmedi; şeritteki uyarıdan seçim yapın.'
                );
                return;
            }
            if (!(e instanceof NotebookTooLargeError)) {
                toast.error(firestoreErrorMessage(e, 'Defter kaydedilemedi.'));
                return;
            }
            setSaveBlock('full');
            saveBlockRef.current = 'full';
            // Yazmaya devam edildikçe otomatik kayıt saniyede bir denenir;
            // uyarı yalnızca sınır ilk aşıldığında çıkar.
            if (fullWarnedRef.current) return;
            fullWarnedRef.current = true;
            const { imageBytes } = measurePages(pages);
            toast.error(
                imageBytes * 2 > e.bytes
                    ? 'Defter doldu: yerin çoğunu fotoğraflar kaplıyor. Kaydedebilmek için birkaç fotoğrafı silin.'
                    : 'Defter doldu: çizim verisi sınıra ulaştı. Kaydedebilmek için bazı sayfaları silin ya da kalanını yeni bir deftere çizin.'
            );
        }
    }, [collectPages, notebook.id, toast]);

    // ── Ortak çizim ──────────────────────────────────────────────────
    // Anlık görüntü saniyeler arayla yazılır; o kadar beklemek "aynı anda
    // çizme" hissini yok eder. Bu yüzden her değişiklik ayrıca küçük bir
    // operasyon olarak yayınlanır ve karşı tuvale hemen uygulanır.
    const handleLocalOp = React.useCallback(
        (op: NotebookOp) => {
            void publishOp(notebook.id, op);
        },
        [notebook.id]
    );

    /**
     * Yapışkan not yayınını seyreltir: metin kutusuna yazarken her tuş
     * vuruşu bir kayıt üretirdi. Son hâl her zaman gönderilir.
     */
    const publishBoxes = React.useCallback(
        (page: number, boxes: TextBoxData[]) => {
            pendingBoxesRef.current = { page, boxes };
            if (boxTimerRef.current) return;
            boxTimerRef.current = window.setTimeout(() => {
                boxTimerRef.current = null;
                const pending = pendingBoxesRef.current;
                pendingBoxesRef.current = null;
                if (pending) handleLocalOp({ type: 'boxes', ...pending });
            }, 400);
        },
        [handleLocalOp]
    );

    React.useEffect(() => {
        if (isLoading) return;
        // Kapanmış sekmelerden kalan işlem kayıtlarını topla.
        void pruneOps(notebook.id);
        return watchOps(notebook.id, (ops) => {
            canvasRef.current?.applyOps(ops);
            // Gelen çizimi bu cihaz da kaydeder: karşı sekme kaydetmeden
            // kapanırsa çizim yalnızca geçici işlem kaydında kalırdı.
            // Kirli sayıldığı için anlık görüntü tazelemesi de atlanır —
            // zaten işlem akışıyla senkronuz.
            scheduleSaveRef.current?.();
            // Metin kutuları tuvalde değil, bu bileşende tutulur.
            for (const op of ops) {
                if (op.type !== 'boxes') continue;
                setBoxesByPage((prev) => {
                    const next = [...prev];
                    while (next.length <= op.page) next.push([]);
                    next[op.page] = op.boxes;
                    return next;
                });
            }
            collabAtRef.current = Date.now();
            setCollab(true);
        });
    }, [isLoading, notebook.id]);

    // Ortak çizim durunca rozeti söndür ve içeriği bir kez tam eşitle:
    // akış sırasında atlanan anlık görüntü tazelemesi burada telafi edilir.
    React.useEffect(() => {
        if (!collab) return;
        const timer = window.setInterval(() => {
            if (Date.now() - collabAtRef.current <= 20000) return;
            setCollab(false);
            if (!dirtyRef.current) void applyRemoteRef.current?.();
        }, 5000);
        return () => window.clearInterval(timer);
    }, [collab]);

    // ── Canlı senkron ────────────────────────────────────────────────
    // Defter üst verisi (`notebooks/{id}`) zaten canlı dinleniyor; içerik
    // kaydı oraya `content_rev` yazdığı için başka bir cihazın kaydı bu küçük
    // doküman üzerinden duyulur, ağır sayfa verisi ancak gerekince indirilir.
    const applyRemote = React.useCallback(async () => {
        if (applyingRef.current) return;
        applyingRef.current = true;
        try {
            const content = await loadNotebookPages(notebook.id);
            const strokes = content.pages.map((p) => p.strokes);
            const page = canvasRef.current?.getCurrentPage() ?? 0;
            canvasRef.current?.loadPages(strokes);
            setInitialStrokes(strokes);
            setBoxesByPage(content.pages.map((p) => p.boxes));
            // Kullanıcı baktığı sayfada kalsın; defter kısaldıysa son sayfaya.
            canvasRef.current?.goToPage(Math.min(page, strokes.length - 1));
            chunksRef.current = new Array<string>(content.chunkCount).fill('');
            revRef.current = content.rev;
            dirtyRef.current = false;
            conflictWarnedRef.current = false;
            setSaveBlock(null);
            saveBlockRef.current = null;
            // Karşı taraf yazmaya devam ederken her kayıt bir bildirim
            // olmasın; bilgi mesajı seyrek gösterilir.
            const now = Date.now();
            if (now - remoteToastAtRef.current > 30000) {
                remoteToastAtRef.current = now;
                toast.info('Defter, başka bir cihazdaki değişikliklerle güncellendi.');
            }
        } catch {
            toast.error('Defterin güncel hâli alınamadı. Bağlantıyı kontrol edip sayfayı yenileyin.');
        } finally {
            applyingRef.current = false;
        }
    }, [notebook.id, toast]);
    applyRemoteRef.current = applyRemote;

    React.useEffect(() => {
        if (isLoading || saveBlockRef.current === 'load') return;
        const rev = notebook.content_rev ?? 0;
        // Kendi yazdığımız sürüm ve eski sürümler yok sayılır.
        if (rev <= revRef.current || notebook.content_writer === WRITER_ID) return;
        // Kaydedilmemiş çizim varken ekranı değiştirmek çizimi silmek olurdu;
        // bu durum ilk kayıt denemesinde çakışma olarak kullanıcıya sorulur.
        if (dirtyRef.current) return;
        // Ortak çizim sürerken içerik zaten işlem akışıyla senkron; her
        // kayıtta tüm sayfaları yeniden indirmek boşuna trafik olurdu.
        // Akış susunca yukarıdaki sayaç bir kez tam eşitleme yapar.
        if (Date.now() - collabAtRef.current < 20000) return;
        // Karşı taraf yazarken sürüm saniyede bir artar; art arda gelen
        // değişiklikler için tek bir tazeleme yeter.
        if (remoteTimerRef.current) window.clearTimeout(remoteTimerRef.current);
        remoteTimerRef.current = window.setTimeout(() => {
            remoteTimerRef.current = null;
            if (!dirtyRef.current) void applyRemote();
        }, 1500);
    }, [applyRemote, isLoading, notebook.content_rev, notebook.content_writer]);

    /**
     * Sayfa yapısı değişimlerinde kullanılır: metin kutusu durumu bir sonraki
     * render'da güncellendiği için kayıt bir tık sonraya bırakılır, ama
     * otomatik kaydın 1,2 saniyesi beklenmez — diğer cihaz yeni sayfa
     * düzenini hemen görsün.
     */
    const saveSoon = React.useCallback(() => {
        window.setTimeout(() => void save(), 50);
    }, [save]);

    const scheduleSave = React.useCallback(() => {
        if (isLoading) return;
        dirtyRef.current = true;
        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        /**
         * Kalem kağıttayken kaydetme.
         *
         * Kayıt, bütün sayfaları kopyalayıp JSON'a çevirir; bu iş ana iş
         * parçacığını yüz milisaniyelerce kilitleyebilir. Çizimin ortasına
         * denk geldiğinde işaretçi olayları birikir ve çizgi kalemin
         * gerisinde kalıp sıçrar. Hareket bitene kadar beklenir.
         */
        const deadline = Date.now() + 6000;
        const runWhenIdle = () => {
            saveTimerRef.current = null;
            // Erteleme sonsuza kadar sürmesin: bir işaretçi olayı düşerse
            // (tarayıcı "pointerup" göndermezse) defter yine de kaydedilir.
            if (canvasRef.current?.isBusy() && Date.now() < deadline) {
                saveTimerRef.current = window.setTimeout(runWhenIdle, 350);
                return;
            }
            void save();
        };
        saveTimerRef.current = window.setTimeout(
            runWhenIdle,
            // Ortak çizimde canlılığı işlem akışı sağlar; anlık görüntü daha
            // seyrek yazılır, iki cihaz birbirini sürekli tetiklemesin.
            Date.now() - collabAtRef.current < 20000 ? 3000 : 1200
        );
    }, [isLoading, save]);
    scheduleSaveRef.current = scheduleSave;

    /** Çakışmayı kullanıcı çözer: kendi sürümünü yazar ya da diğerini alır. */
    const resolveConflict = React.useCallback(async () => {
        const keepMine = await confirm({
            title: 'Defter başka bir cihazda değişti',
            message:
                'Bu defter siz yazarken başka bir cihazda da değiştirildi. Kendi sürümünüzü kaydederseniz diğer cihazda yapılan değişiklikler silinir; diğer cihazdakini yüklerseniz sizin kaydedilmemiş değişiklikleriniz kaybolur.',
            confirmLabel: 'Benim sürümümü kaydet',
            cancelLabel: 'Diğer cihazdakini yükle',
            variant: 'danger',
        });
        if (keepMine) {
            forceSaveRef.current = true;
            conflictWarnedRef.current = false;
            await save();
        } else {
            await applyRemote();
        }
    }, [applyRemote, confirm, save]);

    // Editör kapanırken bekleyen değişikliği kaydet.
    React.useEffect(
        () => () => {
            if (saveTimerRef.current) {
                window.clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
            if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
            if (remoteTimerRef.current) window.clearTimeout(remoteTimerRef.current);
            if (boxTimerRef.current) window.clearTimeout(boxTimerRef.current);
        },
        []
    );

    const handleClose = async () => {
        if (saveTimerRef.current) {
            window.clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
            await save();
        }
        // Kayıt engelliyken kapanış sessizce veri kaybettirmesin.
        if (saveBlockRef.current && dirtyRef.current) {
            const ok = await confirm({
                title: 'Kaydedilemeyen değişiklikler var',
                message:
                    saveBlockRef.current === 'full'
                        ? 'Defter dolduğu için son değişiklikler kaydedilemedi. Kapatırsanız bu değişiklikler kaybolur.'
                        : saveBlockRef.current === 'conflict'
                          ? 'Defter başka bir cihazda da değiştirildiği için son değişiklikler kaydedilmedi. Kapatırsanız bu değişiklikler kaybolur.'
                          : 'Defter içeriği yüklenemediği için değişiklikler kaydedilmedi. Kapatırsanız bu değişiklikler kaybolur.',
                confirmLabel: 'Yine de kapat',
                cancelLabel: 'Defterde kal',
                variant: 'danger',
            });
            if (!ok) return;
        }
        onClose();
    };

    const handleUndo = React.useCallback(() => {
        canvasRef.current?.undo();
        scheduleSave();
    }, [scheduleSave]);

    const handleRedo = React.useCallback(() => {
        canvasRef.current?.redo();
        scheduleSave();
    }, [scheduleSave]);

    // Klavye kısayolları: Ctrl/Cmd+Z geri al, Ctrl+Shift+Z veya Ctrl+Y ileri al.
    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            const target = e.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
            if (target?.isContentEditable) return;
            const key = e.key.toLowerCase();
            if (key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if ((key === 'z' && e.shiftKey) || key === 'y') {
                e.preventDefault();
                handleRedo();
            } else if (key === 's') {
                e.preventDefault();
                void save();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleRedo, handleUndo, save]);

    const handleInsertMath = React.useCallback(
        (math: MathObject) => {
            canvasRef.current?.insertMath(math, config.color === '#ffffff' ? '#1a1b26' : config.color);
            setConfig((c) => ({ ...c, tool: 'select' }));
            scheduleSave();
        },
        [config.color, scheduleSave]
    );

    const handleInsertImages = React.useCallback(
        async (files: FileList | File[]) => {
            const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
            if (list.length === 0) return;
            setIsInsertingImage(true);
            try {
                for (const file of list) {
                    const img = await importImageFile(file);
                    // Fotoğraf sayfa verisine gömüldüğü için sınırı aşacaksa
                    // eklenmeden durdurulur; yoksa eklenir ama defter bir daha
                    // kaydedilemez.
                    if (measurePages(collectPages()).bytes + img.dataUrl.length > MAX_CONTENT_BYTES) {
                        toast.error(
                            'Bu fotoğraf deftere sığmıyor: defter neredeyse dolu. Birkaç fotoğrafı silin ya da yeni bir defter açın.'
                        );
                        break;
                    }
                    canvasRef.current?.insertImage(img.dataUrl, img.width, img.height);
                }
                setConfig((c) => ({ ...c, tool: 'select' }));
                scheduleSave();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Fotoğraf eklenemedi.');
            } finally {
                setIsInsertingImage(false);
            }
        },
        [collectPages, scheduleSave, toast]
    );

    // Panodan yapıştırma (ekran görüntüsü / kopyalanan fotoğraf).
    React.useEffect(() => {
        const onPaste = (e: ClipboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
            const files = Array.from(e.clipboardData?.files ?? []).filter((f) =>
                f.type.startsWith('image/')
            );
            if (files.length === 0) return;
            e.preventDefault();
            void handleInsertImages(files);
        };
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, [handleInsertImages]);

    // ── Görünüm (yakınlaştırma / kaydırma) ───────────────────────────
    const handleViewChange = React.useCallback(
        (next: Viewport, size: { w: number; h: number }) => {
            setView(next);
            setCanvasSize((prev) => (prev.w === size.w && prev.h === size.h ? prev : size));
        },
        []
    );

    // ── Sayfa yönetimi ───────────────────────────────────────────────
    const currentBoxes = boxesByPage[pageInfo.current] ?? [];

    const updateCurrentBoxes = (updater: (list: TextBoxData[]) => TextBoxData[]) => {
        const page = pageInfo.current;
        const boxes = updater(boxesRef.current[page] ?? []);
        setBoxesByPage((prev) => {
            const next = [...prev];
            while (next.length <= page) next.push([]);
            next[page] = boxes;
            return next;
        });
        // Yapışkan notlar da diğer cihazlara gitsin.
        publishBoxes(page, boxes);
        scheduleSave();
    };

    const handleAddPage = () => {
        setBoxesByPage((prev) => [...prev, []]);
        canvasRef.current?.addPage();
        // Sayfa yapısı işlem akışıyla değil, anlık görüntüyle paylaşılır;
        // diğer cihaz beklemesin diye hemen yazılır.
        saveSoon();
    };

    /**
     * Sayfayı siler. Çizimler canvas'ta, yapışkan notlar burada tutulduğu
     * için iki taraf da aynı sırayla güncellenmeli.
     */
    const handleDeletePage = async (index = pageInfo.current) => {
        const ok = await confirm({
            title: 'Sayfayı sil?',
            message: `${index + 1}. sayfadaki tüm çizim ve notlar silinecek.`,
            confirmLabel: 'Sil',
            cancelLabel: 'Vazgeç',
            variant: 'danger',
        });
        if (!ok) return;
        canvasRef.current?.goToPage(index);
        setBoxesByPage((prev) => {
            if (prev.length <= 1) return [[]];
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
        canvasRef.current?.deletePage();
        // Sayfa yapısı anlık görüntüyle paylaşılır; hemen yazılır.
        saveSoon();
    };

    const handleDuplicatePage = (index: number) => {
        canvasRef.current?.goToPage(index);
        setBoxesByPage((prev) => {
            const next = [...prev];
            const copy = (next[index] ?? []).map((b) => ({
                ...b,
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            }));
            next.splice(index + 1, 0, copy);
            return next;
        });
        canvasRef.current?.duplicatePage();
        // Sayfa yapısı anlık görüntüyle paylaşılır; hemen yazılır.
        saveSoon();
    };

    const handleMovePage = (from: number, to: number) => {
        if (to < 0 || to >= pageInfo.total || from === to) return;
        setBoxesByPage((prev) => {
            const next = [...prev];
            while (next.length < pageInfo.total) next.push([]);
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved ?? []);
            return next;
        });
        canvasRef.current?.movePage(from, to);
        // Sayfa yapısı anlık görüntüyle paylaşılır; hemen yazılır.
        saveSoon();
    };

    const pdfAttachInputRef = React.useRef<HTMLInputElement>(null);

    const handleJumpToPage = async () => {
        const input = await prompt({
            title: 'Sayfaya Git',
            message: `Gitmek istediğiniz sayfa numarasını girin (1 - ${pageInfo.total}):`,
            defaultValue: String(pageInfo.current + 1),
            placeholder: 'Örn. 12',
            confirmLabel: 'Git',
        });
        if (!input) return;
        const target = parseInt(input.trim(), 10);
        if (!Number.isNaN(target) && target >= 1 && target <= pageInfo.total) {
            canvasRef.current?.goToPage(target - 1);
        } else {
            toast.error(`Lütfen 1 ile ${pageInfo.total} arasında geçerli bir numara girin.`);
        }
    };

    const handleAttachPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        try {
            toast.info('PDF işleniyor ve sayfalara bağlanıyor…');
            const buffer = await file.arrayBuffer();
            const pdfId = 'pdf_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
            await savePdfToDB(pdfId, file.name, buffer);
            const doc = await getPdfDocument(pdfId, buffer);
            const numPages = doc.numPages || 1;

            if (numPages > pageInfo.total) {
                setBoxesByPage((prev) => {
                    const next = [...prev];
                    while (next.length < numPages) next.push([]);
                    return next;
                });
                for (let i = pageInfo.total; i < numPages; i++) {
                    canvasRef.current?.addPage();
                }
            }

            onMetaChange({
                pdf_id: pdfId,
                pdf_name: file.name,
                pdf_total_pages: numPages,
                page_count: Math.max(pageInfo.total, numPages),
            });

            // Buluta yükleme (Tüm cihazlarda anında açılabilmesi için)
            uploadPdfToCloud(pdfId, file.name, buffer).then(({ url, path }) => {
                if (url) {
                    onMetaChange({ pdf_url: url, pdf_storage_path: path });
                    toast.success('PDF bulut ile eşitlendi, tüm cihazlarınızda hazır.');
                }
            });

            toast.success(`"${file.name}" deftere bağlandı (${numPages} sayfa).`);
        } catch (err: any) {
            toast.error('PDF eklenemedi: ' + (err?.message || 'Hata'));
        }
    };

    const handleUnlinkPdf = () => {
        if (!notebook.pdf_id) return;
        if (
            !window.confirm(
                'Bağlı PDF belgesini kaldırmak istediğinizden emin misiniz?\n(Sayfalarınız ve çizimleriniz korunacaktır)'
            )
        )
            return;
        onMetaChange({
            pdf_id: undefined,
            pdf_name: undefined,
            pdf_total_pages: undefined,
            pdf_box: undefined,
        });
        setShowPdfMenu(false);
        toast.success('PDF bağlantısı kaldırıldı. Sayfalarınız korunuyor.');
    };

    const handleExportPdf = async (allPages: boolean) => {
        try {
            setIsExporting(true);
            setExportProgress(allPages ? 'Sayfalar taranıyor…' : 'Sayfa hazırlanıyor…');
            setShowExportMenu(false);

            let pdfDoc: any = null;
            if (notebook.pdf_id) {
                try {
                    pdfDoc = await getPdfDocument(notebook.pdf_id, undefined, notebook.pdf_url);
                } catch (err) {
                    console.warn('Bağlı PDF yüklenemedi:', err);
                }
            }

            const pagesToExport = allPages
                ? Array.from({ length: pageInfo.total }, (_, i) => i)
                : [pageInfo.current];

            const renderedPages: PageImageInput[] = [];

            for (let idx = 0; idx < pagesToExport.length; idx++) {
                const pageIndex = pagesToExport[idx];
                const pageRotation = notebook.pdf_rotations?.[pageIndex + 1] || 0;
                setExportProgress(
                    allPages
                        ? `Sayfa ${idx + 1} / ${pagesToExport.length} hazırlanıyor…`
                        : 'Sayfa işleniyor…'
                );

                let pdfBgCanvas: HTMLCanvasElement | null = null;
                if (pdfDoc && pageIndex < pdfDoc.numPages) {
                    try {
                        const page = await pdfDoc.getPage(pageIndex + 1);
                        const unscaled = page.getViewport({ scale: 1 });
                        const targetW = pdfBox ? pdfBox.w : (pageDims(pageSize)?.w ?? 1200);
                        const fitScale = targetW / unscaled.width;
                        const targetRot = ((page.rotate || 0) + pageRotation) % 360;
                        const viewport = page.getViewport({ scale: fitScale * 2, rotation: targetRot });
                        const c = document.createElement('canvas');
                        c.width = viewport.width;
                        c.height = viewport.height;
                        const ctx = c.getContext('2d');
                        if (ctx) {
                            await page.render({ canvasContext: ctx, viewport }).promise;
                            pdfBgCanvas = c;
                        }
                    } catch (e) {
                        console.warn(`PDF sayfa ${pageIndex + 1} render edilemedi:`, e);
                    }
                }

                const pageCanvas = canvasRef.current?.renderPageToCanvas(
                    pageIndex,
                    false,
                    bgColor,
                    paper,
                    pdfBgCanvas
                );

                if (pageCanvas) {
                    const imgData = await canvasToJpegBytes(pageCanvas, 0.92);
                    renderedPages.push({
                        width: imgData.width,
                        height: imgData.height,
                        jpegBytes: imgData.bytes,
                        rotation: pageRotation,
                    });
                }
            }

            if (renderedPages.length === 0) {
                toast.error('Dışa aktarılacak sayfa bulunamadı.');
                setIsExporting(false);
                return;
            }

            setExportProgress('PDF belgesi derleniyor…');
            const pdfBlob = buildMultiPagePdf(renderedPages);
            const fileName = allPages
                ? `${title || 'Defter'}.pdf`
                : `${title || 'Defter'}_Sayfa_${pageInfo.current + 1}.pdf`;

            downloadFile(pdfBlob, fileName);
            toast.success(
                allPages
                    ? `Defter ${renderedPages.length} sayfa olarak PDF indirildi.`
                    : `Sayfa ${pageInfo.current + 1} PDF olarak indirildi.`
            );
        } catch (err: any) {
            console.error('PDF dışa aktarım hatası:', err);
            toast.error('PDF oluşturulamadı: ' + (err?.message || 'Bilinmeyen hata'));
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPng = () => {
        try {
            canvasRef.current?.screenshot(true, bgColor, paper, pdfCanvasRef.current);
            toast.success('Sayfa görseli (PNG) indirildi.');
        } catch (err: any) {
            toast.error('Görsel kaydedilemedi: ' + (err?.message || 'Hata'));
        } finally {
            setShowExportMenu(false);
        }
    };

    const handlePrint = () => {
        try {
            const c = canvasRef.current?.renderPageToCanvas(
                pageInfo.current,
                false,
                bgColor,
                paper,
                pdfCanvasRef.current
            );
            if (c) {
                printCanvases([c]);
            }
        } catch (err: any) {
            toast.error('Yazdırma başlatılamadı: ' + (err?.message || 'Hata'));
        } finally {
            setShowExportMenu(false);
        }
    };

    const handleTitleCommit = () => {
        const clean = title.trim() || (notebook.kind === 'whiteboard' ? 'Adsız beyaz tahta' : 'Adsız defter');
        setTitle(clean);
        if (clean !== notebook.title) onMetaChange({ title: clean });
    };

    // Küçük resim paneli açıkken sayfa verisini gecikmeli topla; getPages()
    // derin kopya ürettiği için her çizim darbesinde çağrılmamalı.
    React.useEffect(() => {
        if (!showPages || isLoading) return;
        const timer = window.setTimeout(() => {
            setThumbPages(canvasRef.current?.getPages() ?? []);
        }, 350);
        return () => window.clearTimeout(timer);
    }, [showPages, isLoading, pageInfo, saveState, boxesByPage]);

    const currentPaper = PAPER_STYLES.find((p) => p.id === paper);
    const currentPageSize = PAGE_SIZES.find((p) => p.id === pageSize);
    // Sayfa kutusu: PDF bağlıysa PDF sayfası, değilse seçilen kağıt ölçüsü.
    const hasPdf = !!notebook.pdf_id;
    const pdfBox = hasPdf ? notebook.pdf_box ?? null : null;
    // PDF bağlı defterlerde sayfayı PDF belirler; kağıt ölçüsü uygulanmaz.
    // Eski defterlerde PDF kutusu kayıtlı olmadığı için sayfa sınırı çizilmez.
    const pageBox = hasPdf ? pdfBox : pageDims(pageSize);

    const changePaper = (next: PaperStyle) => {
        setPaper(next);
        onMetaChange({ paper: next });
    };

    const changePageSize = (next: PageSize) => {
        setPageSize(next);
        onMetaChange({ page_size: next });
        // Yeni ölçüde sayfanın tamamı görünsün.
        window.setTimeout(() => canvasRef.current?.fitPage(), 60);
    };

    const changeBg = (next: string) => {
        setBgColor(next);
        onMetaChange({ bg_color: next });
    };

    const renderPdfDropdown = (compact = false) => (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setShowPdfMenu((v) => !v);
                    setShowExportMenu(false);
                }}
                aria-haspopup="menu"
                aria-expanded={showPdfMenu}
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl font-semibold transition-colors',
                    compact ? 'px-2 py-1 text-[11.5px]' : 'px-2.5 py-1.5 text-[12.5px]',
                    notebook.pdf_id
                        ? 'bg-rose-500/25 border border-rose-300/30 text-rose-100 hover:bg-rose-500/35'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                )}
                title={notebook.pdf_id ? `Bağlı PDF: ${notebook.pdf_name || 'PDF'}` : 'PDF İşlemleri'}
            >
                <FileText className={cn('w-3.5 h-3.5', notebook.pdf_id ? 'text-rose-200' : 'text-white')} />
                <span className={compact ? 'max-w-[70px] truncate hidden sm:inline' : 'max-w-[100px] sm:max-w-[140px] truncate'}>
                    {notebook.pdf_id ? (notebook.pdf_name || 'PDF') : 'PDF'}
                </span>
                {notebook.pdf_id && notebook.pdf_total_pages && !compact && (
                    <span className="text-[11px] opacity-75 hidden sm:inline">
                        · {notebook.pdf_total_pages} sf
                    </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-70 ml-0.5" />
            </button>

            {showPdfMenu && (
                <>
                    <div
                        className="fixed inset-0 z-[9100]"
                        onClick={() => setShowPdfMenu(false)}
                        aria-hidden="true"
                    />
                    <div
                        role="menu"
                        aria-label="PDF Menüsü"
                        className="absolute right-0 sm:left-0 sm:right-auto top-[calc(100%+8px)] z-[9200] w-[280px] bg-white text-on-surface rounded-2xl shadow-2xl border border-outline-variant p-2 animate-in fade-in zoom-in-95 duration-150"
                    >
                        {notebook.pdf_id ? (
                            <>
                                <div className="px-2.5 py-2 mb-1 bg-rose-500/10 rounded-xl border border-rose-200/50">
                                    <div className="flex items-center gap-2 text-rose-700 font-bold text-[12.5px]">
                                        <FileText className="w-4 h-4 shrink-0" />
                                        <span className="truncate">{notebook.pdf_name || 'PDF Belgesi'}</span>
                                    </div>
                                    <p className="text-[11px] text-rose-600/80 mt-0.5">
                                        {notebook.pdf_total_pages ? `${notebook.pdf_total_pages} sayfa bağlı (GoodNotes Modu)` : 'PDF sayfaları bağlı'}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPdfMenu(false);
                                        pdfAttachInputRef.current?.click();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                                >
                                    <FileUp className="w-4 h-4 text-primary shrink-0" />
                                    <div>
                                        <div>PDF Belgesini Değiştir</div>
                                        <div className="text-[10.5px] font-normal text-on-surface-variant">Yeni bir dosya yükleyip bağlayın</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleUnlinkPdf}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Unlink className="w-4 h-4 shrink-0" />
                                    <div>
                                        <div>PDF Bağlantısını Kaldır</div>
                                        <div className="text-[10.5px] font-normal text-red-500/80">Çizimleriniz korunur, arka plan kalkar</div>
                                    </div>
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPdfMenu(false);
                                    pdfAttachInputRef.current?.click();
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                            >
                                <FileUp className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                    <div>PDF Belgesi Bağla</div>
                                    <div className="text-[10.5px] font-normal text-on-surface-variant">GoodNotes modu: PDF sayfalarının üzerine not alın</div>
                                </div>
                            </button>
                        )}

                        <div className="h-px bg-outline-variant my-1.5" />

                        <button
                            type="button"
                            onClick={() => {
                                setShowPdfMenu(false);
                                setShowPdfViewer(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                            <Scissors className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                                <div>PDF & Soru Kırpıcı</div>
                                <div className="text-[10.5px] font-normal text-on-surface-variant">MEB veya diğer PDF'lerden soru kesip sayfaya yapıştırın</div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    const renderExportDropdown = (compact = false) => (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setShowExportMenu((v) => !v);
                    setShowPdfMenu(false);
                }}
                aria-haspopup="menu"
                aria-expanded={showExportMenu}
                className={cn(
                    'inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors',
                    compact ? 'px-2 py-1 text-[11.5px]' : 'px-2.5 py-1.5 text-[12.5px]'
                )}
                title="Dışa Aktar ve Paylaş"
            >
                <Share2 className="w-3.5 h-3.5" />
                <span className={compact ? 'hidden md:inline' : 'hidden sm:inline'}>Dışa Aktar</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showExportMenu && (
                <>
                    <div
                        className="fixed inset-0 z-[9100]"
                        onClick={() => setShowExportMenu(false)}
                        aria-hidden="true"
                    />
                    <div
                        role="menu"
                        aria-label="Dışa Aktarma Menüsü"
                        className="absolute right-0 top-[calc(100%+8px)] z-[9200] w-[270px] bg-white text-on-surface rounded-2xl shadow-2xl border border-outline-variant p-2 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <p className="px-2.5 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            PDF Dışa Aktarma
                        </p>

                        <button
                            type="button"
                            onClick={() => void handleExportPdf(true)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                            <FileDown className="w-4 h-4 text-rose-600 shrink-0" />
                            <div>
                                <div>Tüm Defteri PDF Olarak İndir</div>
                                <div className="text-[10.5px] font-normal text-on-surface-variant">
                                    {pageInfo.total} sayfanın tamamı tek bir PDF belgesinde
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => void handleExportPdf(false)}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                            <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                            <div>
                                <div>Bu Sayfayı PDF İndir</div>
                                <div className="text-[10.5px] font-normal text-on-surface-variant">
                                    Yalnızca mevcut sayfa ({pageInfo.current + 1}. sayfa)
                                </div>
                            </div>
                        </button>

                        <div className="h-px bg-outline-variant my-1.5" />
                        <p className="px-2.5 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Görsel & Yazdırma
                        </p>

                        <button
                            type="button"
                            onClick={handleExportPng}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                            <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                                <div>Sayfayı Görsel (PNG) İndir</div>
                                <div className="text-[10.5px] font-normal text-on-surface-variant">Mevcut sayfanın ekran görüntüsü</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                            <Printer className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                                <div>Sayfayı Yazdır</div>
                                <div className="text-[10.5px] font-normal text-on-surface-variant">Yazıcıya veya kağıda doğrudan baskı</div>
                            </div>
                        </button>

                        <div className="h-px bg-outline-variant my-1.5" />
                        <p className="px-2.5 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                            Öğrenci Paylaşımı
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setShowExportMenu(false);
                                setShowQr(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-[12.5px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                            <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                                <div>Öğrenciye Gönder (QR Kod)</div>
                                <div className="text-[10.5px] font-normal text-on-surface-variant">Akıllı tahtadan öğrencilere canlı paylaşım</div>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );

    const renderPaperDropdown = (compact = false) => (
        <div className="relative">
            <button
                onClick={() => setShowPaperMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showPaperMenu}
                title="Sayfa şablonu ve boyutu"
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border transition-colors',
                    compact
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 px-2 py-0.5 text-[11.5px] text-white'
                        : 'bg-surface-container-low hover:bg-surface-container px-2.5 py-1 border-outline-variant text-[12px] font-medium text-on-surface'
                )}
            >
                <LayoutTemplate className={cn('w-3.5 h-3.5', compact ? 'text-sky-300' : 'text-primary')} />
                <span className="hidden md:inline">
                    {currentPaper?.label ?? 'Şablon'}
                    {pageSize !== 'free' && currentPageSize
                        ? ` · ${currentPageSize.label}`
                        : ''}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {showPaperMenu && (
                <>
                    <div
                        className="fixed inset-0 z-[9100]"
                        onClick={() => setShowPaperMenu(false)}
                        aria-hidden="true"
                    />
                    <div
                        role="menu"
                        aria-label="Sayfa şablonu"
                        className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] z-[9200] w-[268px] max-h-[70vh] overflow-y-auto bg-white text-on-surface rounded-2xl shadow-2xl border border-outline-variant p-2 animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="mb-2">
                            <p className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                Sayfa Boyutu
                            </p>
                            {hasPdf && (
                                <p className="px-2 pb-1.5 text-[11px] text-on-surface-variant leading-tight">
                                    {pdfBox
                                        ? 'Bu defterde sayfa, bağlı PDF sayfasının ölçüsündedir.'
                                        : 'PDF bağlı defter: sayfa ölçüsü PDF yerleşiminden gelir.'}
                                </p>
                            )}
                            <div
                                className={cn(
                                    'grid grid-cols-2 gap-1',
                                    hasPdf && 'opacity-40 pointer-events-none'
                                )}
                            >
                                {PAGE_SIZES.map((size) => (
                                    <button
                                        key={size.id}
                                        role="menuitemradio"
                                        aria-checked={pageSize === size.id}
                                        title={size.hint}
                                        onClick={() => {
                                            changePageSize(size.id);
                                            setShowPaperMenu(false);
                                        }}
                                        className={cn(
                                            'px-2 py-1.5 rounded-lg text-left transition-colors border',
                                            pageSize === size.id
                                                ? 'bg-primary/10 border-primary/40'
                                                : 'border-transparent hover:bg-surface-container-high'
                                        )}
                                    >
                                        <span className="block text-[12px] font-bold leading-tight">
                                            {size.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="h-px bg-outline-variant my-2" />
                        </div>

                        {PAPER_GROUPS.map((group) => (
                            <div key={group.label} className="mb-1.5 last:mb-0">
                                <p className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                    {group.label}
                                </p>
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        role="menuitemradio"
                                        aria-checked={paper === item.id}
                                        onClick={() => {
                                            changePaper(item.id);
                                            setShowPaperMenu(false);
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-left transition-colors',
                                            paper === item.id
                                                ? 'bg-primary/10'
                                                : 'hover:bg-surface-container-high'
                                        )}
                                    >
                                        <span
                                            className="w-8 h-8 rounded-lg border border-outline-variant shrink-0"
                                            style={paperBackground(item.id, bgColor)}
                                            aria-hidden="true"
                                        />
                                        <span className="min-w-0">
                                            <span className="block text-[12px] font-bold leading-tight">
                                                {item.label}
                                            </span>
                                            <span className="block text-[10.5px] text-on-surface-variant leading-tight truncate">
                                                {item.hint}
                                            </span>
                                        </span>
                                        {paper === item.id && (
                                            <Check className="w-4 h-4 text-primary ml-auto shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    const renderCompactHeader = () => (
        <header className="flex items-center justify-between px-2 sm:px-3 py-1 bg-primary text-white shadow-sm flex-shrink-0 relative z-[6000] text-xs h-[38px]">
            {/* Sol: Geri + Başlık + Sayfalar + Sayfa Gezintisi */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <button
                    type="button"
                    onClick={handleClose}
                    title="Defterlerime dön"
                    aria-label="Defterlerime dön"
                    className="p-1 rounded-lg hover:bg-white/15 transition-colors shrink-0"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>

                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleCommit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    aria-label="Defter adı"
                    className="bg-white/10 hover:bg-white/15 focus:bg-white/20 rounded-lg px-2 py-0.5 text-[12px] font-semibold outline-none border border-transparent focus:border-white/40 transition-colors w-[100px] sm:w-[150px] truncate"
                />

                <div className="w-px h-3.5 bg-white/20 mx-0.5 shrink-0" />

                {/* Sayfalar Çekmecesi */}
                <button
                    type="button"
                    onClick={() => setShowPages((v) => !v)}
                    title="Sayfa Küçük Resimleri"
                    className={cn(
                        'p-1 rounded-lg transition-colors shrink-0',
                        showPages ? 'bg-white/25 text-white' : 'hover:bg-white/15 text-white/80'
                    )}
                >
                    <Layers className="w-3.5 h-3.5" />
                </button>

                {/* Sayfa Gezintisi & Ekleme */}
                <div className="flex items-center gap-0.5 shrink-0 bg-white/10 rounded-lg px-0.5 py-0.5">
                    <button
                        type="button"
                        onClick={() => canvasRef.current?.prevPage()}
                        disabled={pageInfo.current === 0}
                        title="Önceki Sayfa"
                        className="p-0.5 rounded hover:bg-white/15 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleJumpToPage}
                        title="Sayfaya Git"
                        className="px-1 text-[11px] font-bold tabular-nums hover:underline"
                    >
                        {pageInfo.current + 1}/{pageInfo.total}
                    </button>
                    <button
                        type="button"
                        onClick={() => canvasRef.current?.nextPage()}
                        disabled={pageInfo.current >= pageInfo.total - 1}
                        title="Sonraki Sayfa"
                        className="p-0.5 rounded hover:bg-white/15 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleAddPage}
                        title="Yeni Sayfa Ekle"
                        className="p-0.5 rounded hover:bg-white/15 text-emerald-300 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Orta: Kağıt Şablonu & Hızlı Zemin Renkleri */}
            <div className="hidden md:flex items-center gap-2">
                {renderPaperDropdown(true)}
                <div className="flex items-center gap-1">
                    {BG_COLORS.slice(0, 4).map((b) => (
                        <button
                            key={b.color}
                            onClick={() => changeBg(b.color)}
                            title={b.label}
                            className={cn(
                                'w-3.5 h-3.5 rounded-full border transition-transform hover:scale-110',
                                bgColor === b.color ? 'border-white ring-1 ring-white/60 scale-110' : 'border-white/30'
                            )}
                            style={{ backgroundColor: b.color }}
                        />
                    ))}
                </div>
            </div>

            {/* Sağ: Ders Sunum Araçları, PDF, Dışa Aktar, Geri/İleri, Kaydet, Mod Butonları */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <LessonModeToolbar
                    overlay={overlay}
                    onOverlayChange={setOverlay}
                    presenting={presenting}
                    onPresentingChange={setPresenting}
                    fullscreenTarget={stageRef}
                />

                <div className="w-px h-3.5 bg-white/20 mx-0.5 shrink-0" />

                {renderPdfDropdown(true)}
                {renderExportDropdown(true)}

                {/* Geri / İleri */}
                <div className="flex items-center">
                    <button
                        onClick={handleUndo}
                        disabled={!history.canUndo}
                        title="Geri Al"
                        className="p-1 rounded-lg hover:bg-white/15 disabled:opacity-30 transition-colors"
                    >
                        <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={!history.canRedo}
                        title="İleri Al"
                        className="p-1 rounded-lg hover:bg-white/15 disabled:opacity-30 transition-colors"
                    >
                        <Redo2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Kaydet */}
                <button
                    onClick={() => void save()}
                    title="Kaydet"
                    className="p-1 sm:px-2 sm:py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                    {saveState === 'saving' ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Save className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden lg:inline">Kaydet</span>
                </button>

                <div className="w-px h-3.5 bg-white/20 mx-0.5 shrink-0" />

                {/* Standart 2 Satırlı Menüye Geç */}
                <button
                    type="button"
                    onClick={toggleCompactHeader}
                    title="Standart Menüye Geç (2 Satır)"
                    className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Tam Tuval - Üst Menüyü Gizle */}
                <button
                    type="button"
                    onClick={() => setHideHeader(true)}
                    title="Üst Menüyü Tamamen Gizle (Tam Tuval Alanı)"
                    className="p-1 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors"
                >
                    <ChevronUp className="w-3.5 h-3.5" />
                </button>
            </div>
        </header>
    );

    return (
        <div className="fixed inset-0 z-[9000] flex flex-col bg-surface-container-low">
            {/* Tam Tuval / Üst Menü Gizli İken Yüzen Mini Menü Kapsülü */}
            {hideHeader && !presenting && (
                <div className="absolute top-2 left-3 z-[6500] flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-xl shadow-xl text-xs select-none">
                    <button
                        type="button"
                        onClick={handleClose}
                        title="Defterlerime dön"
                        className="p-1 hover:bg-white/15 rounded-lg text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="w-px h-3.5 bg-white/20" />
                    <button
                        type="button"
                        onClick={() => canvasRef.current?.prevPage()}
                        disabled={pageInfo.current === 0}
                        className="p-1 hover:bg-white/15 rounded-lg disabled:opacity-30 text-slate-300 hover:text-white"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleJumpToPage}
                        className="px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums hover:bg-white/15 text-white"
                    >
                        {pageInfo.current + 1} / {pageInfo.total}
                    </button>
                    <button
                        type="button"
                        onClick={() => canvasRef.current?.nextPage()}
                        disabled={pageInfo.current >= pageInfo.total - 1}
                        className="p-1 hover:bg-white/15 rounded-lg disabled:opacity-30 text-slate-300 hover:text-white"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={handleAddPage}
                        title="Sayfa Ekle"
                        className="p-1 hover:bg-white/15 rounded-lg text-emerald-400"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-3.5 bg-white/20" />
                    <button
                        type="button"
                        onClick={() => setHideHeader(false)}
                        title="Üst Menüyü Göster"
                        className="flex items-center gap-1 px-2 py-0.5 hover:bg-white/15 rounded-lg font-medium text-sky-400 text-xs transition-colors"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>Menü</span>
                    </button>
                </div>
            )}

            {/* AKILLI TAHTA / KOMPAKT MOD (Tek Slim Satır) */}
            {!hideHeader && !presenting && compactHeader && renderCompactHeader()}

            {/* STANDART MOD (2 Satırlı Geniş Menü) */}
            {!hideHeader && !presenting && !compactHeader && (
                <>
                    {/* Üst şerit - Belge ve Dışa Aktarma Başlığı */}
                    <header
                        className="flex items-center justify-between px-3 sm:px-4 py-2 bg-primary text-white shadow-[0_2px_10px_rgba(15,23,42,0.18)] flex-shrink-0 relative z-[6000]"
                    >
                {/* Sol: Geri düğmesi, Başlık, Defter türü */}
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={handleClose}
                        title="Defterlerime dön"
                        aria-label="Defterlerime dön"
                        className="p-1.5 sm:p-2 rounded-xl hover:bg-white/15 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-[18px] h-[18px]" />
                    </button>

                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleCommit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        }}
                        aria-label="Defter adı"
                        className="bg-white/10 hover:bg-white/15 focus:bg-white/20 rounded-xl px-2.5 sm:px-3 py-1.5 text-[13.5px] sm:text-[14px] font-semibold outline-none border border-transparent focus:border-white/40 transition-colors w-[130px] sm:w-[220px] md:w-[260px] truncate"
                    />

                    <span className="hidden lg:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/15 shrink-0">
                        {notebook.kind === 'whiteboard' ? 'Beyaz Tahta' : 'Not Defteri'}
                    </span>
                </div>

                {/* Sağ: PDF Menüsü, Dışa Aktarma & Paylaşma, Geri/İleri, Otomatik Kayıt, Kaydet */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Ortak çizim bildirimi */}
                    {collab && (
                        <span
                            className="hidden xl:flex items-center gap-1.5 text-[11.5px] font-semibold text-white bg-emerald-600/90 rounded-lg px-2 py-1"
                            title="Bu deftere başka bir cihazdan da çiziliyor; değişiklikler anında paylaşılıyor."
                        >
                            <Users className="w-3.5 h-3.5" /> Birlikte
                        </span>
                    )}

                    {/* PDF Menüsü */}
                    {renderPdfDropdown(false)}

                    {/* Dışa Aktar */}
                    {renderExportDropdown(false)}

                    <div className="w-px h-4 bg-white/20 mx-0.5" />

                    {/* Kayıt durumu */}
                    {saveBlock === 'conflict' ? (
                        <button
                            onClick={() => void resolveConflict()}
                            title="Defter başka bir cihazda da değişti; hangi sürümün kalacağını seçin."
                            className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white bg-red-600 rounded-lg px-2 py-1 hover:bg-red-500 transition-colors"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Çakışma</span>
                        </button>
                    ) : saveBlock ? (
                        <span
                            className="flex items-center gap-1.5 text-[11.5px] font-semibold text-white bg-red-600 rounded-lg px-2 py-1"
                            title={
                                saveBlock === 'full'
                                    ? 'Defter azami boyuta ulaştı; otomatik kayıt durdu.'
                                    : 'İçerik yüklenemedi; veriyi korumak için otomatik kayıt durdu.'
                            }
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{saveBlock === 'full' ? 'Dolu' : 'Durduruldu'}</span>
                        </span>
                    ) : (
                        <span
                            className="hidden md:flex items-center gap-1 text-[11.5px] font-medium text-white/80 px-1"
                            title={saveState === 'saving' ? 'Kaydediliyor…' : saveState === 'saved' ? 'Değişiklikler kaydedildi' : 'Buluta otomatik kaydedilir'}
                        >
                            {saveState === 'saving' ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                    <span className="hidden lg:inline">Kaydediliyor…</span>
                                </>
                            ) : saveState === 'saved' ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                                    <span className="hidden lg:inline">Kaydedildi</span>
                                </>
                            ) : (
                                <>
                                    <Cloud className="w-3.5 h-3.5 text-white/70" />
                                    <span className="hidden lg:inline">Kayıtlı</span>
                                </>
                            )}
                        </span>
                    )}

                    {/* Geri / İleri */}
                    <div className="flex items-center">
                        <button
                            onClick={handleUndo}
                            disabled={!history.canUndo}
                            title="Geri al (Ctrl+Z)"
                            aria-label="Geri al"
                            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!history.canRedo}
                            title="İleri al (Ctrl+Shift+Z)"
                            aria-label="İleri al"
                            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Kaydet butonu */}
                    <button
                        onClick={() => void save()}
                        className="inline-flex items-center gap-1.5 bg-white text-primary px-3 py-1.5 rounded-xl text-[12.5px] font-bold hover:bg-white/95 active:scale-95 transition shadow-sm"
                    >
                        <Save className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Kaydet</span>
                    </button>

                    <div className="w-px h-4 bg-white/20 mx-0.5" />

                    {/* Akıllı Tahta / Kompakt Mod Geçiş Butonu */}
                    <button
                        type="button"
                        onClick={toggleCompactHeader}
                        title="Akıllı Tahta / Kompakt Mod (Menüyü Tek Satıra İndir)"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-semibold transition-colors shrink-0"
                    >
                        <Tv className="w-3.5 h-3.5 text-sky-300" />
                        <span className="hidden md:inline">Kompakt</span>
                    </button>

                    {/* Üst Menüyü Gizle */}
                    <button
                        type="button"
                        onClick={() => setHideHeader(true)}
                        title="Üst Menüyü Gizle (Tam Tuval Alanı)"
                        className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors shrink-0"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* İkincil Şerit - Sayfa Gezintisi, Kağıt Şablonu & Ders Sunum Araçları */}
            <div
                className={cn(
                    'flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white dark:bg-surface-container border-b border-outline-variant flex-shrink-0 relative z-[5500] text-[12.5px]',
                    presenting && 'hidden'
                )}
            >
                {/* Sol: Sayfalar paneli butonu, Sayfa gezintisi, Sayfa Ekle / Sil */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                        onClick={() => setShowPages((v) => !v)}
                        aria-pressed={showPages}
                        title="Sayfa küçük resimleri"
                        className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors',
                            showPages
                                ? 'bg-primary/10 text-primary'
                                : 'text-on-surface-variant hover:bg-surface-container-high'
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Sayfalar</span>
                    </button>

                    <div className="w-px h-4 bg-outline-variant mx-0.5" />

                    <button
                        onClick={() => canvasRef.current?.prevPage()}
                        disabled={pageInfo.current === 0}
                        aria-label="Önceki sayfa"
                        className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={handleJumpToPage}
                        title="Sayfaya git (tıklayın)"
                        className="text-[12px] font-bold text-on-surface tabular-nums px-2 py-0.5 rounded-md hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant"
                    >
                        {pageInfo.current + 1} / {pageInfo.total}
                    </button>

                    <button
                        onClick={() => canvasRef.current?.nextPage()}
                        disabled={pageInfo.current >= pageInfo.total - 1}
                        aria-label="Sonraki sayfa"
                        className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Yer İmi (Bookmark) Ekle / Kaldır */}
                    <button
                        type="button"
                        onClick={() => handleToggleBookmark(pageInfo.current + 1)}
                        title={
                            notebook.pdf_bookmarks?.includes(pageInfo.current + 1)
                                ? 'Bu sayfa yer imlerinde (kaldırmak için tıklayın)'
                                : 'Bu sayfayı yer imlerine ekle'
                        }
                        className={cn(
                            'p-1.5 rounded-lg transition-colors',
                            notebook.pdf_bookmarks?.includes(pageInfo.current + 1)
                                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                                : 'text-on-surface-variant hover:text-amber-500 hover:bg-surface-container-high'
                        )}
                    >
                        <Bookmark
                            className={cn(
                                'w-3.5 h-3.5',
                                notebook.pdf_bookmarks?.includes(pageInfo.current + 1) && 'fill-amber-400'
                            )}
                        />
                    </button>

                    {/* Sayfayı 90° Döndür */}
                    <button
                        type="button"
                        onClick={handleRotateCurrentPage}
                        title="Bu sayfayı 90° saat yönünde döndür"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                    >
                        <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* PDF Arama & Bölümler & Tanı Paneli */}
                    {notebook.pdf_id && (
                        <>
                            <div className="w-px h-4 bg-outline-variant mx-0.5" />
                            <button
                                type="button"
                                onClick={() => setShowSearchModal(true)}
                                title="PDF İçinde Ara (Metin Arama)"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Ara</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowOutlineModal(true)}
                                title="İçindekiler / Bölümler"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                            >
                                <ListTree className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Bölümler</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowPdfDebug((v) => !v)}
                                title="PDF Tanı & Performans Paneli (FPS, Zoom, Koordinat)"
                                className={cn(
                                    'p-1.5 rounded-lg transition-colors',
                                    showPdfDebug
                                        ? 'text-emerald-500 bg-emerald-500/10'
                                        : 'text-on-surface-variant hover:text-emerald-500 hover:bg-surface-container-high'
                                )}
                            >
                                <Activity className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}

                    <div className="w-px h-4 bg-outline-variant mx-0.5" />

                    <button
                        onClick={handleAddPage}
                        title="Yeni sayfa ekle"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sayfa</span>
                    </button>

                    {pageInfo.total > 1 && (
                        <button
                            onClick={() => void handleDeletePage()}
                            title="Bu sayfayı sil"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sil</span>
                        </button>
                    )}
                </div>

                {/* Orta: Kağıt Şablonu & Zemin Rengi */}
                <div className="flex items-center gap-2">
                    {/* Kağıt şablonu dropdown */}
                    {renderPaperDropdown(false)}

                    {/* Zemin renkleri */}
                    <div className="hidden sm:flex items-center gap-1 ml-0.5">
                        {BG_COLORS.map((b) => (
                            <button
                                key={b.color}
                                onClick={() => changeBg(b.color)}
                                title={b.label}
                                aria-label={`Zemin rengi: ${b.label}`}
                                className={cn(
                                    'w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-transform hover:scale-110 shadow-xs',
                                    bgColor === b.color ? 'border-primary ring-2 ring-primary/30 scale-110' : 'border-outline-variant/60'
                                )}
                                style={{ backgroundColor: b.color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Sağ: Ders & Sunum Modu Araçları (Spot, Perde, Sunum, Tam Ekran) */}
                <div className="flex items-center gap-1">
                    <LessonModeToolbar
                        overlay={overlay}
                        onOverlayChange={setOverlay}
                        presenting={presenting}
                        onPresentingChange={setPresenting}
                        fullscreenTarget={stageRef}
                    />
                </div>
            </div>
        </>
    )}

    {/* Gizli PDF Dosya Seçici */}
    <input
        ref={pdfAttachInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleAttachPdf}
        className="hidden"
    />

            {/* GoodNotes Tarzı Sabit Çizim Araç Çubuğu */}
            {!presenting && (
                <DrawingToolbar
                    fixed
                    onCommand={(type) => {
                        if (type === 'UNDO_DRAWING') handleUndo();
                        if (type === 'REDO_DRAWING') handleRedo();
                        if (type === 'CLEAR_DRAWING') {
                            canvasRef.current?.clear();
                            scheduleSave();
                        }
                    }}
                    config={config}
                    setConfig={setConfig}
                    bgColor={bgColor}
                    onBgColorChange={changeBg}
                    paper={paper}
                    onPaperChange={changePaper}
                    onScreenshot={() =>
                        canvasRef.current?.screenshot(true, bgColor, paper, pdfCanvasRef.current)
                    }
                    isTextBoxMode={isTextBoxMode}
                    onTextBoxModeToggle={() => setIsTextBoxMode((m) => !m)}
                    onInsertMath={handleInsertMath}
                    canUndo={history.canUndo}
                    canRedo={history.canRedo}
                    onInsertImages={(files) => void handleInsertImages(files)}
                    isInsertingImage={isInsertingImage}
                    zoom={view.scale}
                    onZoomIn={() => canvasRef.current?.zoomBy(1.25)}
                    onZoomOut={() => canvasRef.current?.zoomBy(0.8)}
                    onZoomReset={() => canvasRef.current?.resetView()}
                    onZoomFit={
                        pageBox ? () => canvasRef.current?.fitPage() : undefined
                    }
                    onSelectTool={handleSelectTool}
                />
            )}

            {/* Çalışma alanı */}
            <div ref={stageRef} className="flex-1 min-h-0 flex bg-background relative z-0">
                <PageThumbnails
                    open={showPages && !presenting}
                    onClose={() => setShowPages(false)}
                    pages={thumbPages}
                    boxesByPage={boxesByPage}
                    paper={paper}
                    bgColor={bgColor}
                    canvasSize={pageBox ?? canvasSize}
                    current={pageInfo.current}
                    pdfId={notebook.pdf_id}
                    pdfUrl={notebook.pdf_url}
                    bookmarks={notebook.pdf_bookmarks || []}
                    onToggleBookmark={handleToggleBookmark}
                    rotations={notebook.pdf_rotations || {}}
                    onRotatePage={handleRotatePage}
                    onSelect={(i) => canvasRef.current?.goToPage(i)}
                    onAdd={handleAddPage}
                    onDuplicate={handleDuplicatePage}
                    onDelete={(i) => void handleDeletePage(i)}
                    onMove={handleMovePage}
                />

                <div className="flex-1 min-w-0 relative overflow-hidden">
                {/* Kağıt katmanı. Sayfa ölçüsü tanımlıysa desen ekranın değil
                    SAYFANIN kutusuna oturur: Cornell, soru/cevap ve deney
                    raporu gibi bölmeli şablonlar artık yakınlaştırınca da
                    içerikle birlikte hareket eder. */}
                {pageBox ? (
                    <div
                        className="absolute shadow-[0_8px_30px_rgba(15,23,42,0.18)] ring-1 ring-black/10"
                        style={{
                            left: view.tx,
                            top: view.ty,
                            width: pageBox.w * view.scale,
                            height: pageBox.h * view.scale,
                            ...paperBackground(
                                paper,
                                bgColor,
                                { scale: view.scale, tx: 0, ty: 0 },
                                pageBox
                            ),
                        }}
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={paperBackground(paper, bgColor, view, canvasSize)}
                    />
                )}

                {/* GoodNotes Tarzı Doğrudan PDF Sayfası */}
                {notebook.pdf_id && (
                    <PdfPageBackground
                        pdfId={notebook.pdf_id}
                        pdfName={notebook.pdf_name}
                        pdfUrl={notebook.pdf_url}
                        rotation={notebook.pdf_rotations?.[pageInfo.current + 1] || 0}
                        pageNumber={pageInfo.current + 1}
                        view={view}
                        canvasSize={canvasSize}
                        box={pdfBox}
                        onCanvasReady={handlePdfCanvas}
                        onCloudUrlReady={(url, path) => onMetaChange({ pdf_url: url, pdf_storage_path: path })}
                        onDocLoaded={(doc) => setPdfDocInstance(doc)}
                        onMissingChange={(missing) => setIsPdfMissing(missing)}
                    />
                )}

                {isLoading || initialStrokes === null ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">
                            Defter açılıyor…
                        </p>
                    </div>
                ) : (
                    <>
                        <DrawingCanvas
                            ref={canvasRef}
                            config={config}
                            enabled
                            whiteboardMode={false}
                            bgColor={bgColor}
                            initialPages={initialStrokes}
                            onDirty={scheduleSave}
                            onLocalOp={handleLocalOp}
                            onHistoryChange={(canUndo, canRedo) =>
                                setHistory({ canUndo, canRedo })
                            }
                            onPageChange={(current, total) => setPageInfo({ current, total })}
                            panMode="viewport"
                            pageBox={pageBox}
                            onViewChange={handleViewChange}
                            onConfigChange={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
                        />
                        <TextBoxLayer
                            boxes={currentBoxes}
                            enabled={isTextBoxMode}
                            view={view}
                            pageBox={pageBox}
                            onAdd={(b) => updateCurrentBoxes((list) => [...list, b])}
                            onUpdate={(id, upd) =>
                                updateCurrentBoxes((list) =>
                                    list.map((b) => (b.id === id ? upd : b))
                                )
                            }
                            onDelete={(id) =>
                                updateCurrentBoxes((list) => list.filter((b) => b.id !== id))
                            }
                        />
                    </>
                )}

                {/* Ders modu örtüleri — tuvalin üstünde durur, içeriğe dokunmaz. */}
                {overlay === 'spotlight' && <Spotlight onExit={() => setOverlay('none')} />}
                {overlay === 'curtain' && <Curtain onExit={() => setOverlay('none')} />}

                {/* Sunum modunda araç çubukları gizli; çıkış için tek düğme. */}
                {presenting && (
                    <button
                        type="button"
                        onClick={() => setPresenting(false)}
                        className="absolute top-3 right-3 z-[4400] px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-[12px] font-bold hover:bg-slate-900"
                    >
                        Sunumdan çık
                    </button>
                )}
                {presenting && (
                    <>
                        <button
                            type="button"
                            onClick={() => canvasRef.current?.prevPage()}
                            disabled={pageInfo.current === 0}
                            aria-label="Önceki sayfa"
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-[4400] w-12 h-12 rounded-full bg-white/90 border border-outline-variant shadow-lg flex items-center justify-center text-on-surface-variant disabled:opacity-0"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            type="button"
                            onClick={() => canvasRef.current?.nextPage()}
                            disabled={pageInfo.current >= pageInfo.total - 1}
                            aria-label="Sonraki sayfa"
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-[4400] w-12 h-12 rounded-full bg-white/90 border border-outline-variant shadow-lg flex items-center justify-center text-on-surface-variant disabled:opacity-0"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}
                </div>
            </div>

            {/* Dışa Aktarma İlerleme Modalı */}
            {isExporting && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-surface-container rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-outline-variant flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3.5">
                            <Loader2 className="w-7 h-7 animate-spin" />
                        </div>
                        <h3 className="text-base font-bold text-on-surface">PDF Dışa Aktarılıyor</h3>
                        <p className="text-sm text-on-surface-variant mt-1.5 mb-4">{exportProgress}</p>
                        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                            <div className="bg-primary h-full rounded-full animate-pulse w-3/4 transition-all duration-300" />
                        </div>
                    </div>
                </div>
            )}

            {showQr && <NotebookQrModal notebook={notebook} onClose={() => setShowQr(false)} />}

            {showCompass && (
                <CompassTool
                    onClose={() => setShowCompass(false)}
                    onDrawCircle={(_cx, _cy, r) => {
                        toast.success(`Yarıçapı ${r}px olan çember çizildi.`);
                    }}
                />
            )}
            {showNumberLine && <NumberLineTool onClose={() => setShowNumberLine(false)} />}
            {showCalculator && <MiniCalculatorTool onClose={() => setShowCalculator(false)} />}
            {showPeriodicTable && <PeriodicTableTool onClose={() => setShowPeriodicTable(false)} />}
            {show3DStation && (
                <Interactive3DStationTool
                    onClose={() => setShow3DStation(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                        toast.success('3D model görüntüsü tahta sayfasına yapıştırıldı.');
                    }}
                />
            )}
            {showGeogebra && (
                <GeoGebraStudioTool
                    onClose={() => setShowGeogebra(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                        toast.success('GeoGebra çizimi tahta sayfasına yapıştırıldı.');
                    }}
                />
            )}
            {showSimpleMachines && (
                <SimpleMachinesTool
                    onClose={() => setShowSimpleMachines(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                        toast.success('Basit makineler düzeneği tahta sayfasına yapıştırıldı.');
                    }}
                />
            )}
            {showDnaGenetics && (
                <DnaGeneticsTool
                    onClose={() => setShowDnaGenetics(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                        toast.success('DNA / Çaprazlama tablosu tahta sayfasına yapıştırıldı.');
                    }}
                />
            )}
            {showMoleculeBuilder && (
                <MoleculeBuilderTool
                    onClose={() => setShowMoleculeBuilder(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                        toast.success('Molekül modeli tahta sayfasına yapıştırıldı.');
                    }}
                />
            )}
            {showLinearGraph && (
                <LinearGraphTool
                    onClose={() => setShowLinearGraph(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                        toast.success('Doğrusal denklem grafiği tahta sayfasına yapıştırıldı.');
                    }}
                />
            )}
            {showMathFormula && (
                <MathFormulaTool
                    onClose={() => setShowMathFormula(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                        toast.success('Matematik formülü tahta sayfasına yapıştırıldı.');
                    }}
                />
            )}
            {showPdfViewer && (
                <PdfViewerTool
                    onClose={() => setShowPdfViewer(false)}
                    onInsertImage={(dataUrl, w, h) => {
                        canvasRef.current?.insertImage(dataUrl, w, h);
                    }}
                />
            )}

            {/* PDF Metin Arama Modalı */}
            <PDFWorkspaceSearchModal
                open={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                pdfDoc={pdfDocInstance}
                currentPage={pageInfo.current + 1}
                onJumpToPage={(p) => canvasRef.current?.goToPage(p - 1)}
            />

            {/* PDF İçindekiler / Bölümler Modalı */}
            <PDFOutlineModal
                open={showOutlineModal}
                onClose={() => setShowOutlineModal(false)}
                pdfDoc={pdfDocInstance}
                currentPage={pageInfo.current + 1}
                onJumpToPage={(p) => canvasRef.current?.goToPage(p - 1)}
            />

            {/* PDF Tanı & Performans Paneli (Diagnostics Debug Overlay) */}
            <PDFDebugOverlay
                visible={showPdfDebug}
                onClose={() => setShowPdfDebug(false)}
                pageIndex={pageInfo.current}
                totalPages={pageInfo.total}
                view={view}
                canvasSize={canvasSize}
                pageBox={pdfBox}
                rotation={notebook.pdf_rotations?.[pageInfo.current + 1] || 0}
                annotationCount={thumbPages[pageInfo.current]?.length || 0}
                isCloudSynced={Boolean(notebook.pdf_url)}
                isPdfMissing={isPdfMissing}
                pdfName={notebook.pdf_name}
            />
        </div>
    );
}
