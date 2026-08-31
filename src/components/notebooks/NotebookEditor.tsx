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
    ChevronLeft,
    ChevronRight,
    Cloud,
    Loader2,
    Plus,
    Redo2,
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
import type {
    DrawConfig,
    DrawingCanvasHandle,
    Notebook,
    NotebookContent,
    NotebookPage,
    PaperStyle,
    Stroke,
    TextBoxData,
} from '../../types';

interface NotebookEditorProps {
    notebook: Notebook;
    onClose: () => void;
    /** Defterin üst verisini (ad, kağıt, zemin, sayfa sayısı) günceller. */
    onMetaChange: (patch: Partial<Notebook>) => void;
}

type SaveState = 'idle' | 'saving' | 'saved';

const emptyPage = (): NotebookPage => ({ strokes: [], boxes: [] });

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
    });
    const [isTextBoxMode, setIsTextBoxMode] = React.useState(false);

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
        setSaveState('saving');
        try {
            await saveDocById('notebook_content', notebook.id, {
                pages_json: JSON.stringify(pages),
                updated_at: new Date().toISOString(),
            });
            onMetaChange({ page_count: pages.length, updated_at: new Date().toISOString() });
            setSaveState('saved');
            if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
            savedTimerRef.current = window.setTimeout(() => setSaveState('idle'), 2000);
        } catch {
            setSaveState('idle');
            toast.error('Defter kaydedilemedi.');
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

    const handleDeletePage = async () => {
        const ok = await confirm({
            title: 'Sayfayı sil?',
            message: `${pageInfo.current + 1}. sayfadaki tüm çizim ve notlar silinecek.`,
            confirmLabel: 'Sil',
            cancelLabel: 'Vazgeç',
            variant: 'danger',
        });
        if (!ok) return;
        const idx = pageInfo.current;
        setBoxesByPage((prev) => {
            if (prev.length <= 1) return [[]];
            const next = [...prev];
            next.splice(idx, 1);
            return next;
        });
        canvasRef.current?.deletePage();
        scheduleSave();
    };

    const handleTitleCommit = () => {
        const clean = title.trim() || (notebook.kind === 'whiteboard' ? 'Adsız beyaz tahta' : 'Adsız defter');
        setTitle(clean);
        if (clean !== notebook.title) onMetaChange({ title: clean });
    };

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
            <header className="flex items-center gap-3 px-3 sm:px-5 py-2.5 bg-primary text-white shadow-[0_2px_10px_rgba(15,23,42,0.18)] flex-shrink-0">
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

                {/* Kağıt deseni */}
                <div className="hidden lg:flex items-center gap-1 bg-white/10 rounded-xl p-1 ml-2">
                    {PAPER_STYLES.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => changePaper(p.id)}
                            className={cn(
                                'px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors',
                                paper === p.id ? 'bg-white text-primary' : 'text-white/80 hover:bg-white/15'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
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
                        onClick={() => {
                            canvasRef.current?.undo();
                            scheduleSave();
                        }}
                        title="Geri al"
                        aria-label="Geri al"
                        className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                    >
                        <Undo2 className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        onClick={() => canvasRef.current?.screenshot(true, bgColor)}
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
                        <Redo2 className="w-4 h-4 rotate-180 hidden sm:inline" /> Kaydet
                    </button>
                </div>
            </header>

            {/* Sayfa şeridi */}
            <div className="flex items-center justify-center gap-2 py-1.5 bg-white border-b border-outline-variant flex-shrink-0">
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
                        onClick={handleDeletePage}
                        title="Bu sayfayı sil"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12.5px] font-semibold text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Sil
                    </button>
                )}
            </div>

            {/* Çalışma alanı */}
            <div className="flex-1 min-h-0 relative overflow-hidden">
                <div className="absolute inset-0" style={paperBackground(paper, bgColor)} />

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
                            onPageChange={(current, total) => setPageInfo({ current, total })}
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
            </div>

            {/* Çizim araç çubuğu (sürüklenebilir) */}
            <DrawingToolbar
                onCommand={(type) => {
                    if (type === 'UNDO_DRAWING') {
                        canvasRef.current?.undo();
                        scheduleSave();
                    }
                    if (type === 'CLEAR_DRAWING') {
                        canvasRef.current?.clear();
                        scheduleSave();
                    }
                }}
                config={config}
                setConfig={setConfig}
                bgColor={bgColor}
                onBgColorChange={changeBg}
                onScreenshot={() => canvasRef.current?.screenshot(true, bgColor)}
                isTextBoxMode={isTextBoxMode}
                onTextBoxModeToggle={() => setIsTextBoxMode((m) => !m)}
            />
        </div>
    );
}
