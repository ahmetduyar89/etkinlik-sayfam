// src/components/drawing/MathLibraryPanel.tsx
// Yazma alanına hazır matematik/geometri nesnesi ekleme paneli.
// Her öğe küçük bir canvas önizlemesiyle listelenir; parametresi olan
// nesnelerde (kesir, açı, fonksiyon…) önce değerler sorulur.

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
    MATH_CATEGORIES,
    drawMathObject,
    type MathCatalogItem,
} from './mathObjects';
import { validateExpression } from './expression';
import type { MathObject, Stroke } from '../../types';

interface MathLibraryPanelProps {
    open: boolean;
    onClose: () => void;
    onInsert: (math: MathObject) => void;
}

/** Katalog öğesini küçük bir canvas'a çizen önizleme. */
function MathPreview({ item, color }: { item: MathCatalogItem; color: string }) {
    const ref = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const w = 78;
        const h = 62;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const preview: Stroke = {
            tool: 'math',
            color,
            width: 1.2,
            points: [
                { x: 4, y: 4 },
                { x: w - 4, y: h - 4 },
            ],
            // Etiketler bu boyutta okunmadığı için önizlemede kapatılır.
            math: { ...item.defaults, kind: item.kind, labels: false },
        };
        drawMathObject(ctx, preview);
    }, [item, color]);

    return <canvas ref={ref} aria-hidden="true" className="pointer-events-none" />;
}

export function MathLibraryPanel({ open, onClose, onInsert }: MathLibraryPanelProps) {
    const [tab, setTab] = React.useState(0);
    const [pending, setPending] = React.useState<MathCatalogItem | null>(null);
    const [values, setValues] = React.useState<Record<string, string>>({});

    const category = MATH_CATEGORIES[tab] ?? MATH_CATEGORIES[0];

    const beginInsert = (item: MathCatalogItem) => {
        if (!item.fields?.length) {
            onInsert({ ...item.defaults, kind: item.kind });
            onClose();
            return;
        }
        setPending(item);
        setValues(
            Object.fromEntries(
                item.fields.map((f) => [f.key, String(item.defaults?.[f.key] ?? '')])
            )
        );
    };

    const exprError = React.useMemo(() => {
        if (!pending?.fields?.some((f) => f.key === 'expr')) return null;
        const raw = values.expr?.trim();
        if (!raw) return 'Bir ifade yazın.';
        return validateExpression(raw);
    }, [pending, values]);

    const confirmInsert = () => {
        if (!pending || exprError) return;
        const math: MathObject = { ...pending.defaults, kind: pending.kind };
        for (const field of pending.fields ?? []) {
            const raw = values[field.key]?.trim() ?? '';
            if (field.type === 'text') {
                if (raw) math.expr = raw;
            } else {
                const num = Number(raw.replace(',', '.'));
                if (Number.isFinite(num)) {
                    const clamped = Math.min(field.max ?? num, Math.max(field.min ?? num, num));
                    math[field.key as 'n' | 'k' | 'm'] = clamped;
                }
            }
        }
        onInsert(math);
        setPending(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 14, scale: 0.97 }}
                    role="dialog"
                    aria-label="Matematik nesne kütüphanesi"
                    className="pointer-events-auto w-[min(92vw,620px)] max-h-[62vh] flex flex-col bg-[#1a1b26]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-white/10">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                            Kütüphane
                        </span>
                        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
                            {MATH_CATEGORIES.map((cat, i) => (
                                <button
                                    key={cat.label}
                                    type="button"
                                    onClick={() => {
                                        setTab(i);
                                        setPending(null);
                                    }}
                                    className={cn(
                                        'px-2.5 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors',
                                        i === tab
                                            ? 'bg-white text-[#1a1b26]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Kütüphaneyi kapat"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
                            {category.items.map((item) => (
                                <button
                                    key={item.kind}
                                    type="button"
                                    onClick={() => beginInsert(item)}
                                    title={item.hint}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all text-center',
                                        pending?.kind === item.kind
                                            ? 'border-indigo-500 bg-indigo-500/15'
                                            : 'border-white/10 bg-white/[0.03] hover:bg-white/10 hover:border-white/25'
                                    )}
                                >
                                    <span className="bg-white rounded-lg p-1 flex items-center justify-center">
                                        <MathPreview item={item} color="#1a1b26" />
                                    </span>
                                    <span className="text-[11.5px] font-semibold text-slate-200 leading-tight">
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {pending && (
                        <div className="border-t border-white/10 p-3 bg-black/25">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-[12.5px] font-bold text-white">{pending.label}</span>
                                <span className="text-[11px] text-slate-400">{pending.hint}</span>
                            </div>
                            <div className="flex flex-wrap items-end gap-2">
                                {pending.fields?.map((field) => (
                                    <label key={field.key} className="flex flex-col gap-1">
                                        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
                                            {field.label}
                                        </span>
                                        <input
                                            value={values[field.key] ?? ''}
                                            onChange={(e) =>
                                                setValues((v) => ({ ...v, [field.key]: e.target.value }))
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') confirmInsert();
                                            }}
                                            inputMode={field.type === 'number' ? 'numeric' : 'text'}
                                            className={cn(
                                                'bg-white/10 text-white rounded-lg px-2.5 py-1.5 text-[13px] outline-none border border-white/15 focus:border-indigo-400',
                                                field.type === 'text' ? 'w-52' : 'w-24'
                                            )}
                                        />
                                    </label>
                                ))}
                                <button
                                    type="button"
                                    onClick={confirmInsert}
                                    disabled={!!exprError}
                                    className="inline-flex items-center gap-1.5 bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-2 rounded-xl text-[13px] font-bold hover:brightness-110 transition"
                                >
                                    <Check className="w-4 h-4" /> Sayfaya ekle
                                </button>
                            </div>
                            {exprError && (
                                <p className="mt-2 text-[11.5px] font-semibold text-amber-300">{exprError}</p>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
