// src/components/pdf/PDFOutlineModal.tsx
// PDF İçindekiler (Bölümler & Başlıklar) Gezinme Paneli.

import React from 'react';
import { Bookmark, ChevronRight, FileText, Loader2, X, ListTree } from 'lucide-react';
import { PDFOutlineManager, type PDFOutlineItem } from './PDFOutlineManager';

interface PDFOutlineModalProps {
    open: boolean;
    onClose: () => void;
    pdfDoc: any;
    onJumpToPage: (pageNumber: number) => void;
    currentPage: number;
}

export function PDFOutlineModal({
    open,
    onClose,
    pdfDoc,
    onJumpToPage,
    currentPage,
}: PDFOutlineModalProps) {
    const [outline, setOutline] = React.useState<PDFOutlineItem[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (!open || !pdfDoc) return;
        setLoading(true);
        PDFOutlineManager.getOutline(pdfDoc)
            .then((res) => setOutline(res))
            .finally(() => setLoading(false));
    }, [open, pdfDoc]);

    if (!open) return null;

    const renderTree = (items: PDFOutlineItem[], level = 0) => {
        return items.map((item, idx) => {
            const isCurrent = item.pageNumber === currentPage;
            return (
                <div key={idx} className="space-y-1">
                    <button
                        type="button"
                        onClick={() => {
                            onJumpToPage(item.pageNumber);
                            onClose();
                        }}
                        style={{ paddingLeft: `${Math.max(12, level * 16 + 12)}px` }}
                        className={`w-full text-left py-2 pr-3 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isCurrent
                                ? 'bg-sky-500/20 text-sky-200 font-bold border border-sky-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <span className="truncate pr-2">{item.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            sf. {item.pageNumber}
                        </span>
                    </button>
                    {item.items && item.items.length > 0 && renderTree(item.items, level + 1)}
                </div>
            );
        });
    };

    return (
        <div className="fixed inset-0 z-[6000] flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
            <div className="w-full max-w-md bg-[#161722] text-white border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
                {/* Başlık */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
                        <ListTree className="w-4 h-4" />
                        <span>İçindekiler / Bölümler</span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {loading ? (
                        <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                            <Loader2 className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
                            <p>Bölümler yükleniyor…</p>
                        </div>
                    ) : outline.length === 0 ? (
                        <div className="py-12 text-center text-xs text-slate-400">
                            Bu PDF dosyasında kayıtlı içindekiler tablosu bulunamadı.
                        </div>
                    ) : (
                        renderTree(outline)
                    )}
                </div>
            </div>
        </div>
    );
}
