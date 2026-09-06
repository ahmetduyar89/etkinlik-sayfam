// src/components/notebooks/NotebookViewer.tsx
// Öğrencinin gördüğü SALT-OKUNUR defter. `?view=notebook&id=...` bağlantısıyla
// açılır; öğretmenin QR kodunu okutan öğrenci burayı görür.
//
// Çizim aynı DrawingCanvas ile yapılır (enabled=false) — böylece kalem izleri,
// nesne kütüphanesi ve canlı simülasyonlar öğrencide de birebir aynı görünür,
// simülasyonlar çalışmaya devam eder. Hiçbir değişiklik kaydedilmez.
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { TextBoxLayer } from '../tools/TextBoxLayer';
import { FullscreenToggle } from '../common/FullscreenToggle';
import { watchDocById } from '../../lib/firebase';
import { loadNotebookPages } from './notebookContent';
import { watchOps } from './notebookOps';
import { paperBackground } from './paper';
import { firestoreErrorMessage } from './errors';
import type {
    DrawConfig,
    DrawingCanvasHandle,
    Notebook,
    Stroke,
    TextBoxData,
    Viewport,
} from '../../types';

/**
 * Görüntüleyici tuvali "el" aracıyla açılır: sayfa kaydırılıp yakınlaştırılır
 * ama yazılamaz. `enabled={false}` KULLANILMAZ — o kip tuvali saydamlaştırır
 * (etkinlik akışında çizim katmanını gizlemek için) ve öğrenci boş sayfa görür.
 */
const VIEW_CONFIG: DrawConfig = {
    tool: 'pan',
    color: '#000000',
    width: 2,
} as DrawConfig;

interface NotebookViewerProps {
    notebookId: string;
}

export function NotebookViewer({ notebookId }: NotebookViewerProps) {
    const canvasRef = React.useRef<DrawingCanvasHandle>(null);
    const stageRef = React.useRef<HTMLDivElement>(null);

    const [notebook, setNotebook] = React.useState<Notebook | null>(null);
    const [pages, setPages] = React.useState<Stroke[][] | null>(null);
    const [boxesByPage, setBoxesByPage] = React.useState<TextBoxData[][]>([[]]);
    const [pageInfo, setPageInfo] = React.useState({ current: 0, total: 1 });
    const [view, setView] = React.useState<Viewport>({ scale: 1, tx: 0, ty: 0 });
    const [canvasSize, setCanvasSize] = React.useState({ w: 0, h: 0 });
    const [error, setError] = React.useState<string | null>(null);
    /** Son canlı işlemin zamanı: akış sürerken tam içerik indirilmez. */
    const lastOpAtRef = React.useRef(0);
    /** Akış yüzünden ertelenen sürüm; akış susunca indirilir. */
    const pendingRevRef = React.useRef<number | null>(null);

    // Defterin üst verisi canlı dinlenir: öğretmen tahtaya yazıp içerik
    // kaydedildiğinde `content_rev` artar ve sayfa verisi yeniden çekilir.
    // Böylece öğrenci ekranı yenilemeden güncel tahtayı görür; ağır sayfa
    // verisi ise yalnızca gerçekten değiştiğinde iner.
    React.useEffect(() => {
        let cancelled = false;
        /** İçeriği en son hangi sürüm için indirdik. */
        let loadedRev = -1;
        let loading = false;
        /** Art arda gelen değişiklikler için tek tazeleme (debounce). */
        let timer: number | null = null;

        const refresh = async (rev: number) => {
            loading = true;
            const isFirst = loadedRev < 0;
            try {
                const content = await loadNotebookPages(notebookId);
                if (cancelled) return;
                loadedRev = rev;
                const strokes = content.pages.map((p) => p.strokes);
                const page = canvasRef.current?.getCurrentPage() ?? 0;
                setPages(strokes);
                setBoxesByPage(content.pages.map((p) => p.boxes ?? []));
                // İlk yüklemede tuval `initialPages` ile kurulur; sonrakiler
                // tuvale doğrudan verilir ve öğrenci baktığı sayfada kalır.
                if (!isFirst) {
                    canvasRef.current?.loadPages(strokes);
                    canvasRef.current?.goToPage(Math.min(page, strokes.length - 1));
                }
            } catch (e) {
                // İlk yükleme başarısızsa ekran açılamaz; sonraki tazelemelerde
                // eldeki sürüm gösterilmeye devam eder.
                if (!cancelled && loadedRev < 0) {
                    setError(firestoreErrorMessage(e, 'Defter yüklenemedi.'));
                }
            } finally {
                loading = false;
            }
        };

        const unsub = watchDocById<Notebook>(
            'notebooks',
            notebookId,
            (meta) => {
                if (cancelled) return;
                if (!meta) {
                    setError('Bu defter bulunamadı. Bağlantı güncel olmayabilir.');
                    return;
                }
                setNotebook(meta);
                const rev = meta.content_rev ?? 0;
                if (rev === loadedRev) return;
                // Öğretmen yazarken sürüm saniyede bir artar; ilk açılış
                // hemen, sonraki güncellemeler kısa bir beklemeyle yüklenir.
                if (loadedRev < 0) {
                    void refresh(rev);
                    return;
                }
                if (timer) window.clearTimeout(timer);
                timer = window.setTimeout(() => {
                    timer = null;
                    if (loading) return;
                    // Canlı işlem akışı sürerken ekran zaten güncel; ağır
                    // sayfa verisi akış susunca indirilir.
                    if (Date.now() - lastOpAtRef.current < 20000) {
                        // Akış susunca bu sürüm yine de indirilecek.
                        pendingRevRef.current = rev;
                        return;
                    }
                    void refresh(rev);
                }, 1500);
            },
            (e) => {
                if (!cancelled) setError(firestoreErrorMessage(e, 'Defter yüklenemedi.'));
            }
        );
        // Canlı akış susunca, akış sırasında atlanan sürüm bir kez indirilir:
        // sayfa ekleme/silme gibi yapısal değişiklikler ancak böyle gelir.
        const settle = window.setInterval(() => {
            const rev = pendingRevRef.current;
            if (rev === null || loading || Date.now() - lastOpAtRef.current < 20000) return;
            pendingRevRef.current = null;
            void refresh(rev);
        }, 5000);

        return () => {
            cancelled = true;
            if (timer) window.clearTimeout(timer);
            window.clearInterval(settle);
            unsub();
        };
    }, [notebookId]);

    // Ortak çizim akışı: öğretmen tahtaya yazdıkça çizgiler anında burada da
    // belirir. Anlık görüntü senkronu (yukarıdaki dinleyici) daha yavaştır ve
    // arada kaçan bir işlem olursa ekranı yine eşitler.
    const ready = pages !== null;
    React.useEffect(() => {
        if (!ready) return;
        return watchOps(notebookId, (ops) => {
            canvasRef.current?.applyOps(ops);
            lastOpAtRef.current = Date.now();
            for (const op of ops) {
                if (op.type !== 'boxes') continue;
                setBoxesByPage((prev) => {
                    const next = [...prev];
                    while (next.length <= op.page) next.push([]);
                    next[op.page] = op.boxes;
                    return next;
                });
            }
        });
        // Tuval yalnızca ilk yükleme bittikten sonra var olur.
    }, [notebookId, ready]);

    // Öğrenci sayfalar arasında ok tuşlarıyla da gezebilsin.
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown') canvasRef.current?.nextPage();
            if (e.key === 'ArrowLeft' || e.key === 'PageUp') canvasRef.current?.prevPage();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background px-6 text-center">
                <p className="text-[15px] font-bold text-on-surface">Defter açılamadı</p>
                <p className="text-[13.5px] text-on-surface-variant max-w-[420px]">{error}</p>
            </div>
        );
    }

    if (!notebook || pages === null) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">
                    Defter açılıyor…
                </p>
            </div>
        );
    }

    const bgColor = notebook.bg_color || '#ffffff';
    const paper = notebook.paper || 'grid';
    const canGoPrev = pageInfo.current > 0;
    const canGoNext = pageInfo.current < pageInfo.total - 1;

    return (
        <div ref={stageRef} className="h-screen flex flex-col bg-background">
            <header className="flex items-center gap-3 px-4 h-14 bg-white border-b border-outline-variant flex-shrink-0">
                <h1 className="flex-1 min-w-0 truncate text-[15px] font-extrabold text-on-surface">
                    {notebook.title}
                </h1>
                <span className="text-[12.5px] font-bold text-on-surface-variant tabular-nums">
                    {pageInfo.current + 1} / {pageInfo.total}
                </span>
                <FullscreenToggle target={stageRef} />
            </header>

            <div className="flex-1 min-h-0 relative overflow-hidden">
                <div
                    className="absolute inset-0"
                    style={paperBackground(paper, bgColor, view, canvasSize)}
                />
                <DrawingCanvas
                    ref={canvasRef}
                    config={VIEW_CONFIG}
                    enabled
                    whiteboardMode={false}
                    bgColor={bgColor}
                    initialPages={pages}
                    panMode="viewport"
                    onPageChange={(current, total) => setPageInfo({ current, total })}
                    onViewChange={(v, size) => {
                        setView(v);
                        setCanvasSize(size);
                    }}
                />
                <TextBoxLayer
                    boxes={boxesByPage[pageInfo.current] ?? []}
                    enabled={false}
                    view={view}
                    onAdd={() => {}}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                />

                {/* Sayfa okları — dokunmatik cihazda da rahat basılır. */}
                <button
                    type="button"
                    onClick={() => canvasRef.current?.prevPage()}
                    disabled={!canGoPrev}
                    aria-label="Önceki sayfa"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-[3000] w-11 h-11 rounded-full bg-white/90 border border-outline-variant shadow-lg flex items-center justify-center text-on-surface-variant disabled:opacity-0 transition-opacity"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    type="button"
                    onClick={() => canvasRef.current?.nextPage()}
                    disabled={!canGoNext}
                    aria-label="Sonraki sayfa"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-[3000] w-11 h-11 rounded-full bg-white/90 border border-outline-variant shadow-lg flex items-center justify-center text-on-surface-variant disabled:opacity-0 transition-opacity"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
