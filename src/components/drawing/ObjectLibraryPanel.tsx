// src/components/drawing/ObjectLibraryPanel.tsx
// Yazma alanına hazır matematik ve fen nesnesi ekleme paneli.
// Her öğe küçük bir canvas önizlemesiyle listelenir; parametresi olan
// nesnelerde (kesir, açı, fonksiyon…) önce değerler sorulur.

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
    LIBRARY_GROUPS,
    drawLibraryObject,
    type MathCatalogItem,
} from './libraryObjects';
import { validateExpression } from './expression';
import type { MathObject, Stroke } from '../../types';

interface ObjectLibraryPanelProps {
    open: boolean;
    onClose: () => void;
    onInsert: (math: MathObject) => void;
    onSelectTool?: (toolId: string) => void;
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
        drawLibraryObject(ctx, preview);
    }, [item, color]);

    return <canvas ref={ref} aria-hidden="true" className="pointer-events-none" />;
}

export function ObjectLibraryPanel({ open, onClose, onInsert, onSelectTool }: ObjectLibraryPanelProps) {
    const [group, setGroup] = React.useState(0);
    const [tab, setTab] = React.useState(0);
    const [pending, setPending] = React.useState<MathCatalogItem | null>(null);
    const [values, setValues] = React.useState<Record<string, string>>({});

    const [query, setQuery] = React.useState('');

    const categories = LIBRARY_GROUPS[group]?.categories ?? LIBRARY_GROUPS[0].categories;
    const category = categories[tab] ?? categories[0];

    /**
     * Arama yazılınca gruplar/kategoriler devre dışı kalır ve tüm kütüphane
     * (70'e yakın nesne) ad ve ipucu üzerinden taranır. Türkçe'de büyük/küçük
     * harf dönüşümü 'I/ı' ve 'İ/i' yüzünden özel olduğundan `tr` yerelini
     * kullanmak gerekir; aksi hâlde "ışık" araması "IŞIK"ı bulamıyordu.
     */
    const fold = (t: string) => t.toLocaleLowerCase('tr');
    const results = React.useMemo(() => {
        const q = fold(query.trim());
        if (!q) return null;
        const hits: Array<{ item: MathCatalogItem; where: string }> = [];
        for (const g of LIBRARY_GROUPS) {
            for (const cat of g.categories) {
                for (const item of cat.items) {
                    // Kategori ve ders adı da taranır: "optik" ya da "8. sınıf"
                    // yazan biri o gruptaki her nesneyi bulabilsin.
                    const hay = fold(
                        `${item.label} ${item.hint ?? ''} ${cat.label} ${g.label}`
                    );
                    if (hay.includes(q)) hits.push({ item, where: `${g.label} · ${cat.label}` });
                }
            }
        }
        return hits;
    }, [query]);

    const beginInsert = (item: MathCatalogItem) => {
        if (item.kind.startsWith('tool_')) {
            if (onSelectTool) {
                if (item.kind === 'tool_compass') onSelectTool('compass');
                else if (item.kind === 'tool_number_line') onSelectTool('numberLine');
                else if (item.kind === 'tool_calculator') onSelectTool('calculator');
                else if (item.kind === 'tool_periodic_table') onSelectTool('periodicTable');
                else if (item.kind === 'tool_3d_station') onSelectTool('3dStation');
                else if (item.kind === 'tool_geogebra') onSelectTool('geogebra');
                else if (item.kind === 'tool_simple_machines') onSelectTool('simpleMachines');
                else if (item.kind === 'tool_dna_genetics') onSelectTool('dnaGenetics');
                else if (item.kind === 'tool_linear_graph') onSelectTool('linearGraph');
                else if (item.kind === 'tool_math_formula') onSelectTool('mathFormula');
                else if (item.kind === 'tool_pdf_viewer') onSelectTool('pdfViewer');
            }
            onClose();
            return;
        }
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
                // Metin alanı her nesnede `expr` değil: element sembolü gibi
                // değerler `text` alanına yazılır.
                if (raw && (field.key === 'expr' || field.key === 'text')) math[field.key] = raw;
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
                    aria-label="Nesne kütüphanesi"
                    className="pointer-events-auto w-[min(94vw,680px)] max-h-[64vh] flex flex-col bg-[#1a1b26]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-1.5 px-3 pt-2.5 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                                Kütüphane
                            </span>
                            {/* Üst kademe: branş grupları */}
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 max-w-[calc(100%-48px)]">
                                {LIBRARY_GROUPS.map((g, i) => (
                                    <button
                                        key={g.label}
                                        type="button"
                                        onClick={() => {
                                            setGroup(i);
                                            setTab(0);
                                            setPending(null);
                                        }}
                                        aria-pressed={i === group}
                                        className={cn(
                                            'px-3 py-1 rounded-full text-[12px] font-bold whitespace-nowrap transition-all shrink-0',
                                            i === group
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Kütüphaneyi kapat"
                                className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <input
                            type="search"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setPending(null);
                            }}
                            placeholder="Nesne ara — örn. kaldıraç, üçgen, devre"
                            aria-label="Kütüphanede ara"
                            className="w-full h-8 px-3 rounded-lg bg-white/[0.06] border border-white/10 text-[12.5px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                        />

                        {/* Alt kademe: seçili dersin kategorileri */}
                        <div className={cn('flex items-center gap-1 flex-wrap', results && 'hidden')}>
                            {categories.map((cat, i) => (
                                <button
                                    key={cat.label}
                                    type="button"
                                    onClick={() => {
                                        setTab(i);
                                        setPending(null);
                                    }}
                                    className={cn(
                                        'px-2.5 py-1 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors',
                                        i === tab
                                            ? 'bg-white text-[#1a1b26]'
                                            : 'text-slate-400 hover:text-white hover:bg-white/10'
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3">
                        {results && results.length === 0 && (
                            <p className="text-[12.5px] text-slate-400 text-center py-6">
                                “{query}” için sonuç yok.
                            </p>
                        )}
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
                            {(results ? results.map((r) => r.item) : category.items).map((item) => (
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
                                    <span className="bg-white rounded-lg p-1 flex items-center justify-center relative overflow-hidden">
                                        <MathPreview item={item} color="#1a1b26" />
                                        {item.kind.startsWith('tool_') && (
                                            <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] font-bold px-1 rounded shadow">
                                                Araç
                                            </span>
                                        )}
                                        {item.kind.includes('_3d') && (
                                            <span className="absolute top-1 right-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow tracking-wider animate-pulse">
                                                3D
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[11.5px] font-semibold text-slate-200 leading-tight">
                                        {item.label}
                                    </span>
                                    {results && (
                                        <span className="text-[10px] text-slate-500 leading-tight">
                                            {results.find((r) => r.item.kind === item.kind)?.where}
                                        </span>
                                    )}
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
