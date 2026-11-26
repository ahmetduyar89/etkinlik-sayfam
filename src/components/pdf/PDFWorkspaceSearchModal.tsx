// src/components/pdf/PDFWorkspaceSearchModal.tsx
// PDF Doküman İçi Arama ve Sonuç Gezinme Paneli.

import React from 'react';
import { Search, X, Loader2, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { PDFSearchEngine, type PDFSearchMatch } from './PDFSearchEngine';

interface PDFWorkspaceSearchModalProps {
    open: boolean;
    onClose: () => void;
    pdfDoc: any;
    onJumpToPage: (pageNumber: number) => void;
    currentPage: number;
}

export function PDFWorkspaceSearchModal({
    open,
    onClose,
    pdfDoc,
    onJumpToPage,
    currentPage,
}: PDFWorkspaceSearchModalProps) {
    const [query, setQuery] = React.useState('');
    const [isSearching, setIsSearching] = React.useState(false);
    const [results, setResults] = React.useState<PDFSearchMatch[]>([]);
    const [searched, setSearched] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const searchEngineRef = React.useRef<PDFSearchEngine | null>(null);

    React.useEffect(() => {
        if (pdfDoc) {
            searchEngineRef.current = new PDFSearchEngine(pdfDoc);
        }
    }, [pdfDoc]);

    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQuery('');
            setResults([]);
            setSearched(false);
        }
    }, [open]);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = query.trim();
        if (!trimmed || !searchEngineRef.current) return;

        setIsSearching(true);
        setSearched(true);
        try {
            const matches = await searchEngineRef.current.search(trimmed);
            setResults(matches);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[6000] flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
            <div className="w-full max-w-lg bg-[#161722] text-white border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
                {/* Arama Girişi */}
                <form onSubmit={handleSearch} className="flex items-center px-4 py-3 border-b border-white/10 gap-3">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="PDF içinde kelime veya kavram ara…"
                        className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                    {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                    ) : (
                        query && (
                            <button
                                type="button"
                                onClick={() => {
                                    setQuery('');
                                    setResults([]);
                                    setSearched(false);
                                }}
                                className="p-1 text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )
                    )}
                    <button
                        type="submit"
                        disabled={!query.trim() || isSearching}
                        className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-40"
                    >
                        Ara
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </form>

                {/* Sonuç Listesi */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {isSearching && (
                        <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                            <Loader2 className="w-6 h-6 animate-spin text-sky-400 mx-auto" />
                            <p>Tüm PDF sayfaları taranıyor…</p>
                        </div>
                    )}

                    {!isSearching && searched && results.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-400">
                            "{query}" için eşleşme bulunamadı.
                        </div>
                    )}

                    {!isSearching && !searched && (
                        <div className="py-8 text-center text-xs text-slate-500">
                            Dokümandaki konu, terim veya soru numaralarını aratabilirsiniz.
                        </div>
                    )}

                    {!isSearching && results.length > 0 && (
                        <div className="text-[11px] text-slate-400 px-2 font-medium">
                            {results.length} sayfada eşleşme bulundu:
                        </div>
                    )}

                    {results.map((r) => {
                        const isCurrent = r.pageNumber === currentPage;
                        return (
                            <button
                                key={r.pageNumber}
                                type="button"
                                onClick={() => {
                                    onJumpToPage(r.pageNumber);
                                    onClose();
                                }}
                                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                                    isCurrent
                                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-200'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-300'
                                }`}
                            >
                                <div className="p-2 rounded-lg bg-white/5 text-sky-400 shrink-0 mt-0.5">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                                        <span>Sayfa {r.pageNumber}</span>
                                        <span className="text-[10px] text-slate-400 font-normal">
                                            {r.totalMatchesInPage} eşleşme
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                                        {r.snippet}
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 self-center" />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
