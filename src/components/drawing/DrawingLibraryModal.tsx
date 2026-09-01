import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
    LIBRARY_ITEMS,
    LIBRARY_SUB_CATEGORIES,
    type LibraryCategory,
    type LibraryItem,
    type LibrarySubCategory,
} from '../../constants/drawing-library';

interface DrawingLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTool: (item: LibraryItem) => void;
}

export function DrawingLibraryModal({
    isOpen,
    onClose,
    onSelectTool,
}: DrawingLibraryModalProps) {
    const [selectedCategory, setSelectedCategory] = React.useState<LibraryCategory>('Matematik');
    const [selectedSubCategory, setSelectedSubCategory] = React.useState<LibrarySubCategory>('Sayılar & Modelleme');

    // Sync subcategory when category changes
    const handleCategoryChange = (cat: LibraryCategory) => {
        setSelectedCategory(cat);
        const subCats = LIBRARY_SUB_CATEGORIES[cat];
        if (subCats && subCats.length > 0) {
            setSelectedSubCategory(subCats[0]);
        }
    };

    const currentSubCategories = LIBRARY_SUB_CATEGORIES[selectedCategory] || [];

    const filteredItems = React.useMemo(() => {
        return LIBRARY_ITEMS.filter(
            (item) =>
                item.category === selectedCategory &&
                item.subCategory === selectedSubCategory
        );
    }, [selectedCategory, selectedSubCategory]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[12000] flex items-center justify-center pointer-events-auto p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="relative bg-[#1a1b26]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-white w-full max-w-[760px] overflow-hidden flex flex-col max-h-[85vh]"
                >
                    {/* Top Bar: Title & Main Category Tabs & Close */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                                    KÜTÜPHANE
                                </span>
                            </div>

                            {/* Main Tabs: Matematik, Fen, Simülasyon */}
                            <div className="flex items-center gap-1.5">
                                {(['Matematik', 'Fen', 'Simülasyon'] as LibraryCategory[]).map((cat) => {
                                    const isActive = selectedCategory === cat;
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategoryChange(cat)}
                                            className={cn(
                                                'px-4 py-1.5 rounded-full text-xs font-bold transition-all',
                                                isActive
                                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Kapat"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Sub-categories horizontal pill bar */}
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 overflow-x-auto custom-scroll">
                        {currentSubCategories.map((subCat) => {
                            const isSubActive = selectedSubCategory === subCat;
                            return (
                                <button
                                    key={subCat}
                                    type="button"
                                    onClick={() => setSelectedSubCategory(subCat)}
                                    className={cn(
                                        'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                                        isSubActive
                                            ? 'bg-white text-slate-900 shadow'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    {subCat}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Items Grid */}
                    <div className="p-6 overflow-y-auto max-h-[480px] custom-scroll">
                        {filteredItems.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-sm">
                                Bu kategoride henüz içerik bulunmuyor.
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                                {filteredItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onSelectTool(item)}
                                        className="group relative flex flex-col items-center justify-between p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/5 hover:border-indigo-500/50 transition-all hover:scale-[1.02] shadow-sm hover:shadow-indigo-500/10 text-center"
                                    >
                                        {/* White Rounded Square for Icon/Model */}
                                        <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center p-2.5 shadow-md group-hover:shadow-lg transition-all relative overflow-hidden">
                                            <LibraryCardIcon iconType={item.iconType} />
                                            {item.actionType === 'tool' && (
                                                <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] font-bold px-1 rounded shadow">
                                                    Araç
                                                </span>
                                            )}
                                        </div>

                                        {/* Item Title */}
                                        <span className="mt-2.5 text-[11px] font-semibold text-slate-200 group-hover:text-white line-clamp-2 leading-tight">
                                            {item.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div className="px-6 py-2.5 bg-black/20 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            İçeriği tahtaya veya çalışma alanına eklemek için tıklayın.
                        </span>
                        <span>{filteredItems.length} içerik</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

/**
 * Clean SVG Illustrations matching the exact card designs in the user's reference screenshot
 */
function LibraryCardIcon({ iconType }: { iconType: string }) {
    switch (iconType) {
        case 'fraction_pie':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <circle cx="30" cy="30" r="24" strokeWidth="2.5" />
                    <line x1="30" y1="6" x2="30" y2="54" strokeWidth="2.5" />
                    <line x1="6" y1="30" x2="54" y2="30" strokeWidth="2.5" />
                    {/* One shaded quarter */}
                    <path d="M 30 30 L 54 30 A 24 24 0 0 0 30 6 Z" fill="#94a3b8" stroke="none" />
                </svg>
            );

        case 'fraction_bar':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="6" y="14" width="48" height="32" rx="2" strokeWidth="2.5" />
                    <line x1="16" y1="14" x2="16" y2="46" strokeWidth="2" />
                    <line x1="26" y1="14" x2="26" y2="46" strokeWidth="2" />
                    <line x1="36" y1="14" x2="36" y2="46" strokeWidth="2" />
                    <line x1="46" y1="14" x2="46" y2="46" strokeWidth="2" />
                    {/* First bar shaded */}
                    <rect x="6" y="14" width="10" height="32" fill="#94a3b8" stroke="none" />
                </svg>
            );

        case 'base_ten_blocks':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    {/* Hundred flat / Ten rod / unit cube */}
                    <rect x="8" y="10" width="18" height="40" strokeWidth="1.5" />
                    <line x1="17" y1="10" x2="17" y2="50" strokeWidth="1" />
                    {/* Rows */}
                    <line x1="8" y1="18" x2="26" y2="18" strokeWidth="1" />
                    <line x1="8" y1="26" x2="26" y2="26" strokeWidth="1" />
                    <line x1="8" y1="34" x2="26" y2="34" strokeWidth="1" />
                    <line x1="8" y1="42" x2="26" y2="42" strokeWidth="1" />
                    {/* Single units */}
                    <rect x="36" y="14" width="8" height="8" strokeWidth="1.5" />
                    <rect x="46" y="14" width="8" height="8" strokeWidth="1.5" />
                    <rect x="36" y="24" width="8" height="8" strokeWidth="1.5" />
                </svg>
            );

        case 'hundred_chart':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="8" y="8" width="44" height="44" strokeWidth="2" />
                    {/* 10x10 Grid lines */}
                    {[16, 25, 34, 43].map((pos) => (
                        <React.Fragment key={pos}>
                            <line x1={pos} y1="8" x2={pos} y2="52" strokeWidth="1" strokeDasharray="1 1" />
                            <line x1="8" y1={pos} x2="52" y2={pos} strokeWidth="1" strokeDasharray="1 1" />
                        </React.Fragment>
                    ))}
                </svg>
            );

        case 'multiplication_table':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="8" y="8" width="44" height="44" strokeWidth="2" />
                    <line x1="8" y1="18" x2="52" y2="18" strokeWidth="2" fill="#e2e8f0" />
                    <line x1="18" y1="8" x2="18" y2="52" strokeWidth="2" />
                    {[27, 36, 45].map((pos) => (
                        <React.Fragment key={pos}>
                            <line x1={pos} y1="8" x2={pos} y2="52" strokeWidth="0.8" />
                            <line x1="8" y1={pos} x2="52" y2={pos} strokeWidth="0.8" />
                        </React.Fragment>
                    ))}
                    <text x="13" y="15" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">×</text>
                </svg>
            );

        case 'venn_diagram':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <circle cx="23" cy="30" r="17" strokeWidth="2" />
                    <circle cx="37" cy="30" r="17" strokeWidth="2" />
                </svg>
            );

        case 'analog_clock':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <circle cx="30" cy="30" r="22" strokeWidth="2.5" />
                    {/* Clock ticks */}
                    <line x1="30" y1="10" x2="30" y2="13" strokeWidth="2" />
                    <line x1="50" y1="30" x2="47" y2="30" strokeWidth="2" />
                    <line x1="30" y1="50" x2="30" y2="47" strokeWidth="2" />
                    <line x1="10" y1="30" x2="13" y2="30" strokeWidth="2" />
                    {/* Hands showing 3:00 */}
                    <line x1="30" y1="30" x2="42" y2="30" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="30" y1="30" x2="30" y2="16" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="30" cy="30" r="2" fill="#0f172a" />
                </svg>
            );

        case 'balance_scale':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    {/* Base & Column */}
                    <line x1="18" y1="50" x2="42" y2="50" strokeWidth="3" strokeLinecap="round" />
                    <line x1="30" y1="50" x2="30" y2="20" strokeWidth="2.5" />
                    {/* Fulcrum triangle */}
                    <polygon points="30,20 25,27 35,27" fill="#0f172a" />
                    {/* Balance Beam */}
                    <line x1="10" y1="20" x2="50" y2="20" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Pans */}
                    <line x1="14" y1="20" x2="14" y2="33" strokeWidth="1.5" />
                    <line x1="46" y1="20" x2="46" y2="33" strokeWidth="1.5" />
                    <path d="M 8 33 Q 14 38 20 33 Z" strokeWidth="1.5" fill="#e2e8f0" />
                    <path d="M 40 33 Q 46 38 52 33 Z" strokeWidth="1.5" fill="#e2e8f0" />
                </svg>
            );

        case 'compass':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-indigo-600" fill="none">
                    <circle cx="30" cy="14" r="4" strokeWidth="2" fill="#4f46e5" />
                    <line x1="30" y1="14" x2="16" y2="48" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="30" y1="14" x2="44" y2="48" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 22 36 Q 30 40 38 36" strokeWidth="1.5" strokeDasharray="2 2" stroke="#4f46e5" />
                    <circle cx="16" cy="48" r="2" fill="#ef4444" stroke="none" />
                    <circle cx="44" cy="48" r="2.5" fill="#4f46e5" stroke="none" />
                </svg>
            );

        case 'number_line':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <line x1="6" y1="30" x2="54" y2="30" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Ticks */}
                    {[12, 21, 30, 39, 48].map((x) => (
                        <line key={x} x1={x} y1="23" x2={x} y2="37" strokeWidth="2" />
                    ))}
                    {/* Marker point */}
                    <circle cx="30" cy="19" r="3.5" fill="#ef4444" stroke="none" />
                    <line x1="30" y1="19" x2="30" y2="30" stroke="#ef4444" strokeWidth="1.5" />
                </svg>
            );

        case 'calculator':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="12" y="8" width="36" height="44" rx="4" strokeWidth="2" />
                    <rect x="17" y="13" width="26" height="8" rx="1.5" fill="#e2e8f0" stroke="none" />
                    {/* Keypad dots */}
                    {[27, 34, 41].map((y) => (
                        <React.Fragment key={y}>
                            <rect x="17" y={y} width="6" height="4" rx="1" fill="#64748b" stroke="none" />
                            <rect x="27" y={y} width="6" height="4" rx="1" fill="#64748b" stroke="none" />
                            <rect x="37" y={y} width="6" height="4" rx="1" fill="#4f46e5" stroke="none" />
                        </React.Fragment>
                    ))}
                </svg>
            );

        case 'periodic_table':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="8" y="10" width="44" height="40" rx="3" strokeWidth="2" />
                    <rect x="13" y="15" width="9" height="9" rx="1" fill="#ef4444" stroke="none" />
                    <rect x="38" y="15" width="9" height="9" rx="1" fill="#a855f7" stroke="none" />
                    <rect x="13" y="27" width="9" height="9" rx="1" fill="#f97316" stroke="none" />
                    <rect x="25" y="27" width="9" height="9" rx="1" fill="#3b82f6" stroke="none" />
                    <rect x="38" y="27" width="9" height="9" rx="1" fill="#10b981" stroke="none" />
                    <text x="30" y="44" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">Tablo</text>
                </svg>
            );

        case 'ruler':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="6" y="18" width="48" height="24" rx="2" strokeWidth="2" />
                    {[12, 18, 24, 30, 36, 42, 48].map((x, i) => (
                        <line key={x} x1={x} y1="18" x2={x} y2={i % 2 === 0 ? 30 : 25} strokeWidth="1.5" />
                    ))}
                </svg>
            );

        case 'protractor':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <path d="M 8 40 A 22 22 0 0 1 52 40 Z" strokeWidth="2" fill="#e0f2fe" />
                    <circle cx="30" cy="40" r="2" fill="#0f172a" stroke="none" />
                    <line x1="16" y1="40" x2="44" y2="40" strokeWidth="1" />
                </svg>
            );

        case 'cartesian_grid':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="8" y="8" width="44" height="44" strokeWidth="1" strokeDasharray="2 2" stroke="#cbd5e1" />
                    <line x1="30" y1="4" x2="30" y2="56" strokeWidth="2" />
                    <line x1="4" y1="30" x2="56" y2="30" strokeWidth="2" />
                    <text x="52" y="27" fontSize="7" fontWeight="bold" fill="#0f172a">x</text>
                    <text x="33" y="12" fontSize="7" fontWeight="bold" fill="#0f172a">y</text>
                </svg>
            );

        case 'cube_3d':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    {/* Front square */}
                    <rect x="12" y="22" width="26" height="26" strokeWidth="2" />
                    {/* Back square */}
                    <rect x="22" y="12" width="26" height="26" strokeWidth="1.5" strokeDasharray="2 2" stroke="#94a3b8" />
                    {/* Connecting lines */}
                    <line x1="12" y1="22" x2="22" y2="12" strokeWidth="2" />
                    <line x1="38" y1="22" x2="48" y2="12" strokeWidth="2" />
                    <line x1="38" y1="48" x2="48" y2="38" strokeWidth="2" />
                    <line x1="12" y1="48" x2="22" y2="38" strokeWidth="1.5" strokeDasharray="2 2" stroke="#94a3b8" />
                </svg>
            );

        case 'beaker':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <path d="M 16 12 L 14 12 L 16 46 Q 16 50 20 50 L 40 50 Q 44 50 44 46 L 44 12 Z" strokeWidth="2" />
                    {/* Liquid level */}
                    <path d="M 17 32 Q 30 35 43 32 L 43 47 Q 43 49 40 49 L 20 49 Q 17 49 17 47 Z" fill="#60a5fa" stroke="none" />
                    {/* Graduation marks */}
                    <line x1="20" y1="22" x2="26" y2="22" strokeWidth="1.5" />
                    <line x1="20" y1="30" x2="28" y2="30" strokeWidth="1.5" />
                    <line x1="20" y1="38" x2="26" y2="38" strokeWidth="1.5" />
                </svg>
            );

        case 'electric_circuit':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <rect x="12" y="14" width="36" height="32" rx="2" strokeWidth="2" />
                    {/* Battery on top */}
                    <rect x="25" y="11" width="10" height="6" fill="#ffffff" stroke="none" />
                    <line x1="26" y1="10" x2="26" y2="18" strokeWidth="2.5" />
                    <line x1="32" y1="12" x2="32" y2="16" strokeWidth="1.5" />
                    {/* Bulb on bottom */}
                    <circle cx="30" cy="46" r="6" fill="#fef08a" strokeWidth="1.5" />
                    <path d="M 28 44 L 32 48 M 32 44 L 28 48" strokeWidth="1" stroke="#f59e0b" />
                </svg>
            );

        case 'dna_helix':
            return (
                <svg viewBox="0 0 60 60" className="w-full h-full stroke-slate-900" fill="none">
                    <path d="M 18 10 Q 30 25 42 40 Q 30 50 18 50" strokeWidth="2" stroke="#6366f1" />
                    <path d="M 42 10 Q 30 25 18 40 Q 30 50 42 50" strokeWidth="2" stroke="#ec4899" />
                    <line x1="22" y1="18" x2="38" y2="18" strokeWidth="1.5" />
                    <line x1="27" y1="28" x2="33" y2="28" strokeWidth="1.5" />
                    <line x1="22" y1="38" x2="38" y2="38" strokeWidth="1.5" />
                </svg>
            );

        default:
            return (
                <div className="text-xl font-bold text-slate-800">
                    📐
                </div>
            );
    }
}
