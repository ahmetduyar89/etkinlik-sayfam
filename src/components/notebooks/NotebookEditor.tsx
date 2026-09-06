// src/components/notebooks/NotebookEditor.tsx
// Tam ekran defter / beyaz tahta editörü.
// Üstte kendi şeridi (başlık, kağıt deseni, zemin rengi, sayfa gezintisi),
// altta mevcut sürüklenebilir çizim araç çubuğu bulunur. İçerik Firestore'a
// otomatik kaydedilir (yazma sonrası ~1.2 sn beklenir).
import React from 'react';
import {
    AlertTriangle,
    ArrowLeft,
    Camera,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Cloud,
    LayoutTemplate,
    Layers,
    Loader2,
    Plus,
    Redo2,
    Save,
    Trash2,
    Undo2,
    Users,
} from 'lucide-react';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { TextBoxLayer } from '../tools/TextBoxLayer';
import { usePrompt } from '../common/PromptDialog';
import { useToast } from '../common/ToastProvider';
import { useConfirm } from '../common/ConfirmDialog';
import { cn } from '../../utils/cn';
import { BG_COLORS } from '../../constants/drawing';
import { PAPER_STYLES, paperBackground } from './paper';
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
import { LinearGraphTool } from '../tools/LinearGraphTool';
import { MathFormulaTool } from '../tools/MathFormulaTool';
import { firestoreErrorMessage } from './errors';
import type {
    DrawConfig,
    DrawingCanvasHandle,
    MathObject,
    Notebook,
    NotebookOp,
    NotebookPage,
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
    const [paper, setPaper] = React.useState<PaperStyle>(
        notebook.paper || (notebook.kind === 'whiteboard' ? 'blank' : 'grid')
    );
    const [bgColor, setBgColor] = React.useState(notebook.bg_color || '#ffffff');

    const [config, setConfig] = React.useState<DrawConfig>({
        tool: 'pencil',
        color: '#000000',
        width: 2,
        fillEnabled: false,
        stampIcon: '⭐',
        penType: 'fountain',
        snapShapes: false,
        snapAngle: false,
        eraserMode: 'pixel',
    });
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
    const [showLinearGraph, setShowLinearGraph] = React.useState(false);
    const [showMathFormula, setShowMathFormula] = React.useState(false);

    const handleSelectTool = (toolId: string) => {
        if (toolId === 'compass') setShowCompass(true);
        else if (toolId === 'numberLine' || toolId === 'number_line') setShowNumberLine(true);
        else if (toolId === 'calculator') setShowCalculator(true);
        else if (toolId === 'periodicTable' || toolId === 'periodic_table') setShowPeriodicTable(true);
        else if (toolId === '3dStation' || toolId === '3d_station' || toolId === 'station_3d') setShow3DStation(true);
        else if (toolId === 'geogebra' || toolId === 'tool_geogebra') setShowGeogebra(true);
        else if (toolId === 'simpleMachines' || toolId === 'simple_machines' || toolId === 'tool_simple_machines') setShowSimpleMachines(true);
        else if (toolId === 'dnaGenetics' || toolId === 'dna_genetics' || toolId === 'tool_dna_genetics') setShowDnaGenetics(true);
        else if (toolId === 'linearGraph' || toolId === 'linear_graph' || toolId === 'tool_linear_graph') setShowLinearGraph(true);
        else if (toolId === 'mathFormula' || toolId === 'math_formula' || toolId === 'tool_math_formula') setShowMathFormula(true);
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
            setInitialStrokes(pages.map((p) => p.strokes));
            setBoxesByPage(pages.map((p) => p.boxes));
            setPageInfo({ current: 0, total: pages.length });
            setIsLoading(false);
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
        saveTimerRef.current = window.setTimeout(
            () => {
                saveTimerRef.current = null;
                void save();
            },
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

    const changePaper = (next: PaperStyle) => {
        setPaper(next);
        onMetaChange({ paper: next });
    };

    const changeBg = (next: string) => {
        setBgColor(next);
        onMetaChange({ bg_color: next });
    };

    return (
        <div className="fixed inset-0 z-[9000] flex flex-col bg-surface-container-low">
            {/* Üst şerit */}
            <header
                className={cn(
                    'flex items-center gap-3 px-3 sm:px-5 py-2.5 bg-primary text-white shadow-[0_2px_10px_rgba(15,23,42,0.18)] flex-shrink-0',
                    presenting && 'hidden'
                )}
            >
                <button
                    onClick={handleClose}
                    title="Defterlerime dön"
                    aria-label="Defterlerime dön"
                    className="p-2 rounded-xl hover:bg-white/15 transition-colors"
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
                    className="min-w-0 flex-shrink bg-white/10 hover:bg-white/15 focus:bg-white/20 rounded-xl px-3 py-1.5 text-[14px] font-semibold outline-none border border-transparent focus:border-white/40 transition-colors w-[180px] sm:w-[260px]"
                />

                <span className="hidden md:inline text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-white/15">
                    {notebook.kind === 'whiteboard' ? 'Beyaz Tahta' : 'Not Defteri'}
                </span>

                {/* Kağıt şablonu */}
                <div className="relative hidden sm:block ml-1">
                    <button
                        onClick={() => setShowPaperMenu((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={showPaperMenu}
                        title="Sayfa şablonu"
                        className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-xl px-2.5 py-1.5 text-[12.5px] font-semibold transition-colors"
                    >
                        <LayoutTemplate className="w-4 h-4" />
                        <span className="hidden md:inline">{currentPaper?.label ?? 'Şablon'}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
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
                                className="absolute left-0 top-[calc(100%+8px)] z-[9200] w-[268px] max-h-[70vh] overflow-y-auto bg-white text-on-surface rounded-2xl shadow-2xl border border-outline-variant p-2"
                            >
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
                                                    className="w-9 h-9 rounded-lg border border-outline-variant shrink-0"
                                                    style={paperBackground(item.id, '#ffffff')}
                                                    aria-hidden="true"
                                                />
                                                <span className="min-w-0">
                                                    <span className="block text-[12.5px] font-bold leading-tight">
                                                        {item.label}
                                                    </span>
                                                    <span className="block text-[11px] text-on-surface-variant leading-tight truncate">
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

                {/* Zemin rengi */}
                <div className="hidden xl:flex items-center gap-1.5 ml-1">
                    {BG_COLORS.map((b) => (
                        <button
                            key={b.color}
                            onClick={() => changeBg(b.color)}
                            title={b.label}
                            aria-label={`Zemin rengi: ${b.label}`}
                            className={cn(
                                'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                                bgColor === b.color ? 'border-white scale-110' : 'border-white/30'
                            )}
                            style={{ backgroundColor: b.color }}
                        />
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-1.5">
                    {/* Ortak çizim: başka bir cihaz da bu deftere yazıyor */}
                    {collab && (
                        <span
                            className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-white bg-emerald-600/90 rounded-lg px-2 py-1"
                            title="Bu deftere başka bir cihazdan da çiziliyor; değişiklikler anında paylaşılıyor."
                        >
                            <Users className="w-3.5 h-3.5" /> Birlikte çiziliyor
                        </span>
                    )}
                    {/* Kayıt durumu */}
                    {saveBlock === 'conflict' ? (
                        <button
                            onClick={() => void resolveConflict()}
                            title="Defter başka bir cihazda da değişti; hangi sürümün kalacağını seçin."
                            className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-red-600 rounded-lg px-2 py-1 hover:bg-red-500 transition-colors"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> Başka cihazda değişti — seçin
                        </button>
                    ) : saveBlock ? (
                        <span
                            className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-red-600 rounded-lg px-2 py-1"
                            title={
                                saveBlock === 'full'
                                    ? 'Defter azami boyuta ulaştı; otomatik kayıt durdu.'
                                    : 'İçerik yüklenemedi; veriyi korumak için otomatik kayıt durdu.'
                            }
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {saveBlock === 'full' ? 'Defter dolu — kaydedilmiyor' : 'Kayıt durduruldu'}
                        </span>
                    ) : (
                        <span className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-white/85 px-2">
                            {saveState === 'saving' ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Kaydediliyor…
                                </>
                            ) : saveState === 'saved' ? (
                                <>
                                    <Check className="w-3.5 h-3.5" /> Kaydedildi
                                </>
                            ) : (
                                <>
                                    <Cloud className="w-3.5 h-3.5" /> Otomatik kayıt
                                </>
                            )}
                        </span>
                    )}

                    <button
                        onClick={handleUndo}
                        disabled={!history.canUndo}
                        title="Geri al (Ctrl+Z)"
                        aria-label="Geri al"
                        className="p-2 rounded-xl hover:bg-white/15 transition-colors disabled:opacity-35 disabled:hover:bg-transparent"
                    >
                        <Undo2 className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={!history.canRedo}
                        title="İleri al (Ctrl+Shift+Z)"
                        aria-label="İleri al"
                        className="p-2 rounded-xl hover:bg-white/15 transition-colors disabled:opacity-35 disabled:hover:bg-transparent"
                    >
                        <Redo2 className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        onClick={() => canvasRef.current?.screenshot(true, bgColor, paper)}
                        title="Sayfayı görsel olarak indir"
                        aria-label="Sayfayı görsel olarak indir"
                        className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                    >
                        <Camera className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        onClick={() => void save()}
                        className="inline-flex items-center gap-1.5 bg-white text-primary px-3 py-2 rounded-xl text-[13px] font-bold hover:brightness-95 transition"
                    >
                        <Save className="w-4 h-4 hidden sm:inline" /> Kaydet
                    </button>
                </div>
            </header>

            {/* Sayfa şeridi */}
            <div
                className={cn(
                    'flex items-center justify-center gap-2 py-1.5 bg-white border-b border-outline-variant flex-shrink-0',
                    presenting && 'hidden'
                )}
            >
                <button
                    onClick={() => setShowPages((v) => !v)}
                    aria-pressed={showPages}
                    title="Sayfa küçük resimleri"
                    className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors',
                        showPages
                            ? 'bg-primary/10 text-primary'
                            : 'text-on-surface-variant hover:bg-surface-container-high'
                    )}
                >
                    <Layers className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sayfalar</span>
                </button>
                <div className="w-px h-4 bg-outline-variant mx-1" />
                <button
                    onClick={() => canvasRef.current?.prevPage()}
                    disabled={pageInfo.current === 0}
                    aria-label="Önceki sayfa"
                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[12.5px] font-bold text-on-surface tabular-nums px-1">
                    Sayfa {pageInfo.current + 1} / {pageInfo.total}
                </span>
                <button
                    onClick={() => canvasRef.current?.nextPage()}
                    disabled={pageInfo.current >= pageInfo.total - 1}
                    aria-label="Sonraki sayfa"
                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-outline-variant mx-1" />
                <button
                    onClick={handleAddPage}
                    title="Yeni sayfa"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-emerald-600 hover:bg-emerald-50"
                >
                    <Plus className="w-3.5 h-3.5" /> Sayfa
                </button>
                {pageInfo.total > 1 && (
                    <button
                        onClick={() => void handleDeletePage()}
                        title="Bu sayfayı sil"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Sil
                    </button>
                )}
                <div className="w-px h-4 bg-outline-variant mx-1" />
                <LessonModeToolbar
                    overlay={overlay}
                    onOverlayChange={setOverlay}
                    presenting={presenting}
                    onPresentingChange={setPresenting}
                    onShare={() => setShowQr(true)}
                    fullscreenTarget={stageRef}
                />
            </div>

            {/* Çalışma alanı */}
            <div ref={stageRef} className="flex-1 min-h-0 flex bg-background">
                <PageThumbnails
                    open={showPages && !presenting}
                    onClose={() => setShowPages(false)}
                    pages={thumbPages}
                    boxesByPage={boxesByPage}
                    paper={paper}
                    bgColor={bgColor}
                    canvasSize={canvasSize}
                    current={pageInfo.current}
                    onSelect={(i) => canvasRef.current?.goToPage(i)}
                    onAdd={handleAddPage}
                    onDuplicate={handleDuplicatePage}
                    onDelete={(i) => void handleDeletePage(i)}
                    onMove={handleMovePage}
                />

                <div className="flex-1 min-w-0 relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={paperBackground(paper, bgColor, view, canvasSize)}
                />

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
                            onViewChange={handleViewChange}
                            onRequestText={() =>
                                prompt({
                                    title: 'Metin ekle',
                                    placeholder: 'Yazı girin',
                                    confirmLabel: 'Ekle',
                                })
                            }
                        />
                        <TextBoxLayer
                            boxes={currentBoxes}
                            enabled={isTextBoxMode}
                            view={view}
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

            {/* Çizim araç çubuğu (sürüklenebilir) — sunum modunda gizlenir. */}
            {!presenting && (
            <DrawingToolbar
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
                onScreenshot={() => canvasRef.current?.screenshot(true, bgColor, paper)}
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
                onSelectTool={handleSelectTool}
            />
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
        </div>
    );
}
