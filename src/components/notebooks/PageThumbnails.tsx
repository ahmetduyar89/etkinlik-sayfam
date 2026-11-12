// src/components/notebooks/PageThumbnails.tsx
// Defterin sayfalarını küçük önizlemelerle listeleyen profesyonel yan panel.
// Tıklayınca o sayfaya gidilir; sayfa eklenebilir, çoğaltılabilir,
// silinebilir, döndürülebilir, yer imi (bookmark) eklenebilir ve sırası değiştirilebilir.

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    Copy,
    GripVertical,
    Plus,
    Trash2,
    X,
    Bookmark,
    PenTool,
    RotateCw,
    Star,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { drawStroke } from '../drawing/strokeRenderer';
import { paperBackground } from './paper';
import { getPdfDocument } from '../../lib/pdfStorage';
import type { PaperStyle, Stroke, TextBoxData } from '../../types';

/** Küçük resmin genişliği (CSS px). */
const THUMB_WIDTH = 116;

interface PageThumbnailProps {
    strokes: Stroke[];
    boxes: TextBoxData[];
    /** Çalışma alanının gerçek boyutu — en/boy oranı buradan gelir. */
    canvasSize: { w: number; h: number };
    pdfId?: string;
    pdfUrl?: string;
    pageIndex?: number;
    rotation?: number;
}

function PageThumbnail({
    strokes,
    boxes,
    canvasSize,
    pdfId,
    pdfUrl,
    pageIndex = 0,
    rotation = 0,
}: PageThumbnailProps) {
    const ref = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        let isCancelled = false;
        const canvas = ref.current;
        if (!canvas) return;
        const srcW = canvasSize.w || 1000;
        const srcH = canvasSize.h || 700;
        const scale = THUMB_WIDTH / srcW;
        const h = Math.max(60, Math.round(srcH * scale));
        const dpr = window.devicePixelRatio || 1;
        canvas.width = THUMB_WIDTH * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${THUMB_WIDTH}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, THUMB_WIDTH, h);

        (async () => {
            if (pdfId) {
                try {
                    const doc = await getPdfDocument(pdfId, undefined, pdfUrl);
                    if (isCancelled) return;
                    const pageNum = pageIndex + 1;
                    if (pageNum <= doc.numPages) {
                        const page = await doc.getPage(pageNum);
                        if (isCancelled) return;
                        const origVp = page.getViewport({ scale: 1 });
                        const targetRot = ((origVp.rotation || 0) + (rotation || 0)) % 360;
                        const pdfScale = (THUMB_WIDTH / origVp.width) * dpr;
                        const thumbVp = page.getViewport({ scale: pdfScale, rotation: targetRot });
                        await page.render({ canvasContext: ctx, viewport: thumbVp }).promise;
                    }
                } catch {
                    // PDF sayfası çizilemediyse devam et
                }
            }
            if (isCancelled) return;
            ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
            strokes.forEach((s) => drawStroke(ctx, s));

            // Yapışkan notlar basit kutu olarak temsil edilir.
            boxes.forEach((b) => {
                ctx.save();
                ctx.fillStyle = b.color;
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') ctx.roundRect(b.x, b.y, 150, 60, 10);
                else ctx.rect(b.x, b.y, 150, 60);
                ctx.fill();
                ctx.restore();
            });
        })();

        return () => {
            isCancelled = true;
        };
    }, [strokes, boxes, canvasSize.w, canvasSize.h, pdfId, pdfUrl, pageIndex, rotation]);

    return <canvas ref={ref} aria-hidden="true" className="block" />;
}

interface PageThumbnailsProps {
    open: boolean;
    onClose: () => void;
    pages: Stroke[][];
    boxesByPage: TextBoxData[][];
    paper: PaperStyle;
    bgColor: string;
    canvasSize: { w: number; h: number };
    current: number;
    pdfId?: string;
    pdfUrl?: string;
    bookmarks?: number[];
    onToggleBookmark?: (pageNumber: number) => void;
    rotations?: Record<number, number>;
    onRotatePage?: (pageNumber: number) => void;
    onSelect: (index: number) => void;
    onAdd: () => void;
    onDuplicate: (index: number) => void;
    onDelete: (index: number) => void;
    onMove: (from: number, to: number) => void;
}

export function PageThumbnails({
    open,
    onClose,
    pages,
    boxesByPage,
    paper,
    bgColor,
    canvasSize,
    current,
    pdfId,
    pdfUrl,
    bookmarks = [],
    onToggleBookmark,
    rotations = {},
    onRotatePage,
    onSelect,
    onAdd,
    onDuplicate,
    onDelete,
    onMove,
}: PageThumbnailsProps) {
    const activeRef = React.useRef<HTMLButtonElement>(null);
    const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const [filterOnlyBookmarks, setFilterOnlyBookmarks] = React.useState(false);

    // Aktif sayfa değiştiğinde listeyi otomatik kaydır.
    React.useEffect(() => {
        if (open) {
            activeRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [current, open]);

    // ── Sayfa sürükle-bırak sıralaması ────────────────────────────────
    const [drag, setDrag] = React.useState<{ from: number; over: number } | null>(null);
    const dragFromRef = React.useRef<number | null>(null);

    const startDrag = (e: React.PointerEvent, index: number) => {
        e.preventDefault();
        dragFromRef.current = index;
        setDrag({ from: index, over: index });
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const moveDrag = (e: React.PointerEvent) => {
        if (dragFromRef.current === null) return;
        const y = e.clientY;
        let target = pages.length;
        for (let i = 0; i < pages.length; i++) {
            const el = itemRefs.current[i];
            if (!el) continue;
            const r = el.getBoundingClientRect();
            if (y < r.top + r.height / 2) {
                target = i;
                break;
            }
        }
        setDrag({ from: dragFromRef.current, over: target });
    };

    const endDrag = (e: React.PointerEvent) => {
        if (dragFromRef.current === null) return;
        const from = dragFromRef.current;
        const over = drag?.over ?? from;
        dragFromRef.current = null;
        setDrag(null);
        try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
            /* yut */
        }
        if (over === from || over === from + 1) return;
        const target = over > from ? over - 1 : over;
        onMove(from, target);
    };

    /** İki öğe arasına düşen bırakma çizgisi. */
    const dropLine = (at: number) =>
        drag && drag.over === at && drag.over !== drag.from && drag.over !== drag.from + 1 ? (
            <div
                key={`drop-${at}`}
                aria-hidden="true"
                className="h-1 -my-1 rounded-full bg-primary"
            />
        ) : null;

    // Küçük resimde kağıt deseni de ölçeklenerek gösterilir.
    const thumbScale = THUMB_WIDTH / (canvasSize.w || 1000);
    const paperStyle = paperBackground(paper, bgColor, { scale: thumbScale, tx: 0, ty: 0 }, canvasSize);

    return (
        <AnimatePresence>
            {open && (
                <motion.aside
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 176, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    aria-label="Sayfalar"
                    className="relative flex-shrink-0 h-full bg-[#181926] text-white border-r border-white/10 overflow-hidden select-none"
                >
                    <div className="w-[176px] h-full flex flex-col">
                        {/* Başlık ve Filtre */}
                        <div className="p-2 border-b border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                                    Sayfalar ({pages.length})
                                </span>
                                <button
                                    onClick={onClose}
                                    aria-label="Sayfa panelini kapat"
                                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Tümü vs Yer İmleri Sekmesi */}
                            <div className="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px]">
                                <button
                                    type="button"
                                    onClick={() => setFilterOnlyBookmarks(false)}
                                    className={cn(
                                        'flex-1 py-1 rounded font-semibold transition-all text-center',
                                        !filterOnlyBookmarks ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'
                                    )}
                                >
                                    Tümü
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterOnlyBookmarks(true)}
                                    className={cn(
                                        'flex-1 py-1 rounded font-semibold transition-all flex items-center justify-center gap-1',
                                        filterOnlyBookmarks ? 'bg-primary text-white shadow' : 'text-slate-400 hover:text-white'
                                    )}
                                >
                                    <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
                                    <span>({bookmarks.length})</span>
                                </button>
                            </div>
                        </div>

                        {/* Sayfa Kartları Listesi */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2.5">
                            {pages.map((strokes, i) => {
                                const pageNumber = i + 1;
                                const isBookmarked = bookmarks.includes(pageNumber);
                                if (filterOnlyBookmarks && !isBookmarked) return null;

                                const hasNotes = strokes.length > 0 || (boxesByPage[i] && boxesByPage[i].length > 0);
                                const pageRotation = rotations[pageNumber] || 0;

                                return (
                                    <React.Fragment key={i}>
                                        {dropLine(i)}
                                        <div
                                            ref={(el) => {
                                                itemRefs.current[i] = el;
                                            }}
                                            className={cn(
                                                'group relative transition-opacity',
                                                drag?.from === i ? 'opacity-40' : ''
                                            )}
                                        >
                                            <button
                                                ref={i === current ? activeRef : undefined}
                                                onClick={() => onSelect(i)}
                                                aria-current={i === current}
                                                aria-label={`${pageNumber}. sayfaya git`}
                                                className={cn(
                                                    'block w-full rounded-lg overflow-hidden border-2 transition-all',
                                                    i === current
                                                        ? 'border-sky-500 shadow-md ring-1 ring-sky-500/50'
                                                        : 'border-white/10 hover:border-sky-500/50'
                                                )}
                                            >
                                                <div style={paperStyle}>
                                                    <PageThumbnail
                                                        strokes={strokes}
                                                        boxes={boxesByPage[i] ?? []}
                                                        canvasSize={canvasSize}
                                                        pdfId={pdfId}
                                                        pdfUrl={pdfUrl}
                                                        pageIndex={i}
                                                        rotation={pageRotation}
                                                    />
                                                </div>
                                            </button>

                                            {/* Sol Alt: Sayfa Numarası ve Not İndikatörü */}
                                            <div className="absolute bottom-1 left-1 flex items-center gap-1 pointer-events-none">
                                                <span
                                                    className={cn(
                                                        'px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums',
                                                        i === current
                                                            ? 'bg-sky-500 text-white'
                                                            : 'bg-black/70 text-white'
                                                    )}
                                                >
                                                    {pageNumber}
                                                </span>
                                                {hasNotes && (
                                                    <span className="p-0.5 rounded bg-black/70 text-sky-400" title="Anotasyon/Not mevcut">
                                                        <PenTool className="w-2.5 h-2.5" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Sağ Alt: Yer İmi (Bookmark) Butonu */}
                                            {onToggleBookmark && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleBookmark(pageNumber);
                                                    }}
                                                    title={isBookmarked ? 'Yer imini kaldır' : 'Sayfayı yer imlerine ekle'}
                                                    className={cn(
                                                        'absolute bottom-1 right-8 w-6 h-6 rounded flex items-center justify-center transition-all',
                                                        isBookmarked
                                                            ? 'bg-amber-500/90 text-white opacity-100 shadow'
                                                            : 'bg-black/50 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-400'
                                                    )}
                                                >
                                                    <Bookmark className={cn('w-3.5 h-3.5', isBookmarked && 'fill-white')} />
                                                </button>
                                            )}

                                            {/* Sürükleme tutamacı */}
                                            <div
                                                role="button"
                                                tabIndex={-1}
                                                aria-label={`${pageNumber}. sayfayı sürükleyerek taşı`}
                                                title="Sürükleyerek sırala"
                                                onPointerDown={(e) => startDrag(e, i)}
                                                onPointerMove={moveDrag}
                                                onPointerUp={endDrag}
                                                onPointerCancel={endDrag}
                                                style={{ touchAction: 'none' }}
                                                className="absolute bottom-1 right-1 w-6 h-6 rounded bg-[#202234] border border-white/20 text-slate-300 hover:text-white flex items-center justify-center shadow-sm cursor-grab active:cursor-grabbing opacity-60 group-hover:opacity-100 transition-opacity"
                                            >
                                                <GripVertical className="w-3.5 h-3.5" />
                                            </div>

                                            {/* Üst Eylemler: Döndür, Taşı, Çoğalt, Sil */}
                                            <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                <div className="flex gap-0.5">
                                                    {onRotatePage && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onRotatePage(pageNumber);
                                                            }}
                                                            aria-label="Sayfayı 90° döndür"
                                                            title="Sayfayı 90° Döndür"
                                                            className="w-5 h-5 rounded bg-[#202234] border border-white/20 text-slate-300 hover:text-sky-300 flex items-center justify-center shadow-sm"
                                                        >
                                                            <RotateCw className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => onMove(i, i - 1)}
                                                        disabled={i === 0}
                                                        aria-label="Sayfayı yukarı taşı"
                                                        title="Yukarı taşı"
                                                        className="w-5 h-5 rounded bg-[#202234] border border-white/20 text-slate-300 hover:text-white disabled:opacity-30 flex items-center justify-center shadow-sm"
                                                    >
                                                        <ChevronUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onMove(i, i + 1)}
                                                        disabled={i === pages.length - 1}
                                                        aria-label="Sayfayı aşağı taşı"
                                                        title="Aşağı taşı"
                                                        className="w-5 h-5 rounded bg-[#202234] border border-white/20 text-slate-300 hover:text-white disabled:opacity-30 flex items-center justify-center shadow-sm"
                                                    >
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    <button
                                                        onClick={() => onDuplicate(i)}
                                                        aria-label="Sayfayı çoğalt"
                                                        title="Çoğalt"
                                                        className="w-5 h-5 rounded bg-[#202234] border border-white/20 text-slate-300 hover:text-white flex items-center justify-center shadow-sm"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(i)}
                                                        disabled={pages.length <= 1}
                                                        aria-label="Sayfayı sil"
                                                        title="Sil"
                                                        className="w-5 h-5 rounded bg-[#202234] border border-white/20 text-rose-400 hover:bg-rose-500/20 disabled:opacity-30 flex items-center justify-center shadow-sm"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                            {dropLine(pages.length)}

                            <button
                                onClick={onAdd}
                                className="w-full py-2.5 rounded-lg border-2 border-dashed border-white/20 text-slate-300 hover:border-sky-400 hover:text-sky-300 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
                            >
                                <Plus className="w-4 h-4" /> Sayfa Ekle
                            </button>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
