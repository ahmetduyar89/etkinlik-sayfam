// src/components/notebooks/PageThumbnails.tsx
// Defterin sayfalarını küçük önizlemelerle listeleyen yan panel.
// Tıklayınca o sayfaya gidilir; sayfa eklenebilir, çoğaltılabilir,
// silinebilir ve sırası değiştirilebilir.

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Trash2, X } from 'lucide-react';
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
    pageIndex?: number;
}

function PageThumbnail({ strokes, boxes, canvasSize, pdfId, pageIndex = 0 }: PageThumbnailProps) {
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
                    const doc = await getPdfDocument(pdfId);
                    if (isCancelled) return;
                    const pageNum = pageIndex + 1;
                    if (pageNum <= doc.numPages) {
                        const page = await doc.getPage(pageNum);
                        if (isCancelled) return;
                        const origVp = page.getViewport({ scale: 1 });
                        const pdfScale = (THUMB_WIDTH / origVp.width) * dpr;
                        const thumbVp = page.getViewport({ scale: pdfScale });
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
    }, [strokes, boxes, canvasSize.w, canvasSize.h, pdfId, pageIndex]);

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
    onSelect,
    onAdd,
    onDuplicate,
    onDelete,
    onMove,
}: PageThumbnailsProps) {
    const activeRef = React.useRef<HTMLButtonElement>(null);
    const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    /** Sürükleme durumu: nereden başladı, şu an nereye bırakılacak. */
    const [drag, setDrag] = React.useState<{ from: number; over: number } | null>(null);
    const dragRef = React.useRef<{ from: number; startY: number; active: boolean } | null>(null);
    const overRef = React.useRef(0);

    // Sayfa değişince listede görünür olsun.
    React.useEffect(() => {
        if (open) activeRef.current?.scrollIntoView({ block: 'nearest' });
    }, [open, current]);

    /** İmlecin dikey konumuna karşılık gelen ekleme noktası (0..sayfa sayısı). */
    const insertionAt = (clientY: number): number => {
        let index = 0;
        for (let i = 0; i < pages.length; i++) {
            const el = itemRefs.current[i];
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (clientY > rect.top + rect.height / 2) index = i + 1;
        }
        return index;
    };

    const startDrag = (e: React.PointerEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        dragRef.current = { from: index, startY: e.clientY, active: false };
        overRef.current = index;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const moveDrag = (e: React.PointerEvent) => {
        const state = dragRef.current;
        if (!state) return;
        // Küçük titremeler sürükleme sayılmasın.
        if (!state.active && Math.abs(e.clientY - state.startY) < 5) return;
        state.active = true;
        overRef.current = insertionAt(e.clientY);
        setDrag({ from: state.from, over: overRef.current });
    };

    const endDrag = (e: React.PointerEvent) => {
        const state = dragRef.current;
        dragRef.current = null;
        if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }
        setDrag(null);
        if (!state?.active) return;
        // Ekleme noktası, taşınan öğe listeden çıkarıldıktan sonraki hedefe çevrilir.
        const target = overRef.current > state.from ? overRef.current - 1 : overRef.current;
        if (target !== state.from) onMove(state.from, target);
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
                    animate={{ width: 168, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    aria-label="Sayfalar"
                    className="relative flex-shrink-0 h-full bg-white border-r border-outline-variant overflow-hidden"
                >
                    <div className="w-[168px] h-full flex flex-col">
                        <div className="flex items-center gap-1 px-2.5 py-2 border-b border-outline-variant">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                                Sayfalar
                            </span>
                            <span className="text-[11px] font-semibold text-on-surface-variant tabular-nums">
                                ({pages.length})
                            </span>
                            <button
                                onClick={onClose}
                                aria-label="Sayfa panelini kapat"
                                className="ml-auto p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
                            {pages.map((strokes, i) => (
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
                                            aria-label={`${i + 1}. sayfaya git`}
                                            className={cn(
                                                'block w-full rounded-lg overflow-hidden border-2 transition-all',
                                                i === current
                                                    ? 'border-primary shadow-md'
                                                    : 'border-outline-variant hover:border-primary/50'
                                            )}
                                        >
                                            <div style={paperStyle}>
                                                <PageThumbnail
                                                    strokes={strokes}
                                                    boxes={boxesByPage[i] ?? []}
                                                    canvasSize={canvasSize}
                                                    pdfId={pdfId}
                                                    pageIndex={i}
                                                />
                                            </div>
                                        </button>

                                        <span
                                            className={cn(
                                                'absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums pointer-events-none',
                                                i === current
                                                    ? 'bg-primary text-white'
                                                    : 'bg-black/55 text-white'
                                            )}
                                        >
                                            {i + 1}
                                        </span>

                                        {/*
                                          Sürükleme tutamacı. Sürükleme yalnızca
                                          buradan başlar; böylece liste dokunmatik
                                          ekranda normal şekilde kaydırılabilir.
                                        */}
                                        <div
                                            role="button"
                                            tabIndex={-1}
                                            aria-label={`${i + 1}. sayfayı sürükleyerek taşı`}
                                            title="Sürükleyerek sırala"
                                            onPointerDown={(e) => startDrag(e, i)}
                                            onPointerMove={moveDrag}
                                            onPointerUp={endDrag}
                                            onPointerCancel={endDrag}
                                            style={{ touchAction: 'none' }}
                                            className="absolute bottom-1 right-1 w-6 h-6 rounded bg-white/90 border border-outline-variant text-on-surface-variant hover:text-primary flex items-center justify-center shadow-sm cursor-grab active:cursor-grabbing opacity-60 group-hover:opacity-100 transition-opacity"
                                        >
                                            <GripVertical className="w-3.5 h-3.5" />
                                        </div>

                                        <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                            <div className="flex gap-0.5">
                                                <button
                                                    onClick={() => onMove(i, i - 1)}
                                                    disabled={i === 0}
                                                    aria-label="Sayfayı yukarı taşı"
                                                    title="Yukarı taşı"
                                                    className="w-5 h-5 rounded bg-white/95 border border-outline-variant text-on-surface-variant hover:text-primary disabled:opacity-30 flex items-center justify-center shadow-sm"
                                                >
                                                    <ChevronUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => onMove(i, i + 1)}
                                                    disabled={i === pages.length - 1}
                                                    aria-label="Sayfayı aşağı taşı"
                                                    title="Aşağı taşı"
                                                    className="w-5 h-5 rounded bg-white/95 border border-outline-variant text-on-surface-variant hover:text-primary disabled:opacity-30 flex items-center justify-center shadow-sm"
                                                >
                                                    <ChevronDown className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="flex gap-0.5">
                                                <button
                                                    onClick={() => onDuplicate(i)}
                                                    aria-label="Sayfayı çoğalt"
                                                    title="Çoğalt"
                                                    className="w-5 h-5 rounded bg-white/95 border border-outline-variant text-on-surface-variant hover:text-primary flex items-center justify-center shadow-sm"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(i)}
                                                    disabled={pages.length <= 1}
                                                    aria-label="Sayfayı sil"
                                                    title="Sil"
                                                    className="w-5 h-5 rounded bg-white/95 border border-outline-variant text-red-500 hover:bg-red-50 disabled:opacity-30 flex items-center justify-center shadow-sm"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            ))}
                            {dropLine(pages.length)}

                            <button
                                onClick={onAdd}
                                className="w-full py-3 rounded-lg border-2 border-dashed border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5 text-[12px] font-semibold"
                            >
                                <Plus className="w-4 h-4" /> Sayfa ekle
                            </button>
                        </div>
                    </div>
                </motion.aside>
            )}
        </AnimatePresence>
    );
}
