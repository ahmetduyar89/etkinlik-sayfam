// src/components/notebooks/NotebookEditor.tsx
// Tam ekran defter / beyaz tahta editörü.
// Üstte kendi şeridi (başlık, kağıt deseni, zemin rengi, sayfa gezintisi),
// altta mevcut sürüklenebilir çizim araç çubuğu bulunur. İçerik Firestore'a
// otomatik kaydedilir (yazma sonrası ~1.2 sn beklenir).
import React from 'react';
import {
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
} from 'lucide-react';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { TextBoxLayer } from '../tools/TextBoxLayer';
import { usePrompt } from '../common/PromptDialog';
import { useToast } from '../common/ToastProvider';
import { useConfirm } from '../common/ConfirmDialog';
import { fetchDocById, saveDocById } from '../../lib/firebase';
import { cn } from '../../utils/cn';
import { BG_COLORS } from '../../constants/drawing';
import { PAPER_STYLES, paperBackground } from './paper';
import { PageThumbnails } from './PageThumbnails';
import { CONTENT_LIMIT_BYTES, importImageFile } from '../drawing/imageStore';
import { Curtain, Spotlight } from './LessonTools';
import { LessonModeToolbar, type LessonOverlay } from './LessonModeToolbar';
import { NotebookQrModal } from './NotebookQrModal';
import { firestoreErrorMessage } from './errors';
import type {
    DrawConfig,
    DrawingCanvasHandle,
    MathObject,
    Notebook,
    NotebookContent,
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

function parsePages(raw?: string): NotebookPage[] {
    if (!raw) return [emptyPage()];
    try {
        const parsed = JSON.parse(raw) as NotebookPage[];
        if (!Array.isArray(parsed) || parsed.length === 0) return [emptyPage()];
        return parsed.map((p) => ({
            strokes: Array.isArray(p?.strokes) ? p.strokes : [],
            boxes: Array.isArray(p?.boxes) ? p.boxes : [],
        }));
    } catch {
        return [emptyPage()];
    }
}

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
                const content = await fetchDocById<NotebookContent>(
                    'notebook_content',
                    notebook.id
                );
                pages = parsePages(content?.pages_json);
            } catch {
                toast.error('Defter içeriği yüklenemedi, boş sayfa açıldı.');
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
    const save = React.useCallback(async () => {
        const strokePages = canvasRef.current?.getPages() ?? [];
        const boxes = boxesRef.current;
        const total = Math.max(strokePages.length, boxes.length, 1);
        const pages: NotebookPage[] = Array.from({ length: total }, (_, i) => ({
            strokes: strokePages[i] ?? [],
            boxes: boxes[i] ?? [],
        }));
        const pagesJson = JSON.stringify(pages);
        // Firestore doküman sınırı 1 MiB. Fotoğraflar sayfa verisine gömüldüğü
        // için sınırı aşan içerik daha kaydetmeden burada yakalanır; aksi halde
        // sunucu hatası kullanıcıya sebebini söylemez.
        if (pagesJson.length > CONTENT_LIMIT_BYTES) {
            setSaveState('idle');
            toast.error(
                'Defter çok büyüdü (fotoğraflar sınırı aşıyor). Kaydedebilmek için bazı fotoğrafları silin.'
            );
            return;
        }
        setSaveState('saving');
        try {
            await saveDocById('notebook_content', notebook.id, {
                pages_json: pagesJson,
                updated_at: new Date().toISOString(),
            });
            onMetaChange({ page_count: pages.length, updated_at: new Date().toISOString() });
            setSaveState('saved');
            if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
            savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000);
        } catch (e) {
            setSaveState('idle');
            toast.error(firestoreErrorMessage(e, 'Defter kaydedilemedi.'));
        }
    }, [notebook.id, onMetaChange, toast]);

    const scheduleSave = React.useCallback(() => {
        if (isLoading) return;
        if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => {
            saveTimerRef.current = null;
            void save();
        }, 1200);
    }, [isLoading, save]);

    // Editör kapanırken bekleyen değişikliği kaydet.
    React.useEffect(
        () => () => {
            if (saveTimerRef.current) {
                window.clearTimeout(saveTimerRef.current);
                saveTimerRef.current = null;
            }
            if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
        },
        []
    );

    const handleClose = async () => {
        if (saveTimerRef.current) {
            window.clearTimeout(saveTimerRef.current);
            saveTimerRef.current = null;
            await save();
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
        [scheduleSave, toast]
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
        setBoxesByPage((prev) => {
            const next = [...prev];
            while (next.length <= pageInfo.current) next.push([]);
            next[pageInfo.current] = updater(next[pageInfo.current] ?? []);
            return next;
        });
        scheduleSave();
    };

    const handleAddPage = () => {
        setBoxesByPage((prev) => [...prev, []]);
        canvasRef.current?.addPage();
        scheduleSave();
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
        scheduleSave();
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
        scheduleSave();
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
        scheduleSave();
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
                    {/* Kayıt durumu */}
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
            />
            )}

            {showQr && <NotebookQrModal notebook={notebook} onClose={() => setShowQr(false)} />}
        </div>
    );
}
