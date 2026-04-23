import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface PageNavProps {
    current: number;
    total: number;
    onPrev: () => void;
    onNext: () => void;
    onAdd: () => void;
    onDelete: () => void;
}

export function PageNav({ current, total, onPrev, onNext, onAdd, onDelete }: PageNavProps) {
    return (
        <div
            role="group"
            aria-label="Sayfa gezintisi"
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[5100] flex items-center gap-2 bg-[#1a1b26]/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-xl pointer-events-auto"
        >
            <button
                type="button"
                onClick={onPrev}
                disabled={current === 0}
                aria-label="Önceki sayfa"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <span
                className="text-xs font-bold text-white tabular-nums px-2"
                aria-live="polite"
            >
                {current + 1} / {total}
            </span>
            <button
                type="button"
                onClick={onNext}
                disabled={current === total - 1}
                aria-label="Sonraki sayfa"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" aria-hidden="true" />
            <button
                type="button"
                onClick={onAdd}
                title="Yeni sayfa ekle"
                aria-label="Yeni sayfa ekle"
                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition-all"
            >
                <Plus className="w-4 h-4" />
            </button>
            {total > 1 && (
                <button
                    type="button"
                    onClick={onDelete}
                    title="Bu sayfayı sil"
                    aria-label="Bu sayfayı sil"
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
