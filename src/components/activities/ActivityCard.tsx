// src/components/activities/ActivityCard.tsx — İÇERİK MERKEZİ (Ünite Rafı)
// Raf ızgarasındaki görsel kart. Aksiyon satırı derste kullanılan üç işlemi
// öne çıkarır (tam ekran aç · QR ile öğrenciye gönder · klasöre taşı); yönetim
// işlemleri (HTML kopyala, link paylaş, düzenle, sonuçlar, sil) hover'da
// açılan menüye taşındı.
import { memo, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
    BarChart3, Copy, Edit3, FolderInput, Maximize2, MoreVertical, QrCode, Share2, Trash2,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatGradeLevel } from '../../constants/education';
import { posterBackground, posterIcon, subjectColor } from '../../constants/appearance';
import type { Activity } from '../../types';

interface ActivityCardProps {
    act: Activity;
    index?: number;
    onOpenPreview: (id: string) => void;
    onOpenFullscreen: (act: Activity) => void;
    onShowQr: (act: Activity) => void;
    onMoveToFolder: (act: Activity) => void;
    onEdit: (act: Activity) => void;
    onRequestDelete: (act: Activity) => void;
    onShowResults: (id: string) => void;
    onCopyLink: (act: Activity) => void;
    onCopyHtml: (act: Activity) => void;
}

function ActivityCardBase({
    act, onOpenPreview, onOpenFullscreen, onShowQr, onMoveToFolder,
    onEdit, onRequestDelete, onShowResults, onCopyLink, onCopyHtml,
}: ActivityCardProps) {
    const c = subjectColor(act.subject);
    const poster = posterBackground(c);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Dışarı tıklama / Esc menüyü kapatır.
    useEffect(() => {
        if (!menuOpen) return;
        const onDown = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    const stop = (fn: () => void) => (e: ReactMouseEvent) => { e.stopPropagation(); fn(); };

    const menuItems: Array<{ icon: typeof Copy; label: string; onClick: () => void; danger?: boolean }> = [
        { icon: Copy, label: 'HTML kopyala', onClick: () => onCopyHtml(act) },
        { icon: Share2, label: 'Bağlantı paylaş', onClick: () => onCopyLink(act) },
        { icon: Edit3, label: 'Düzenle', onClick: () => onEdit(act) },
        ...(act.is_test ? [{ icon: BarChart3, label: 'Sonuçlar', onClick: () => onShowResults(act.id) }] : []),
        { icon: Trash2, label: 'Sil', onClick: () => onRequestDelete(act), danger: true },
    ];

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenPreview(act.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenPreview(act.id); } }}
            className={cn(
                'group relative flex flex-col bg-white border border-outline-variant rounded-[18px] cursor-pointer shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:border-primary hover:-translate-y-[3px] hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)] transition-all duration-200',
                // Açık menü komşu kartların altında kalmasın.
                menuOpen && 'z-30'
            )}
        >
            {/* Poster */}
            <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-t-[17px] flex-shrink-0">
                {act.image_url ? (
                    <img src={act.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                    <>
                        <div className="absolute inset-0" style={{ backgroundImage: poster.base }} />
                        <div className="absolute inset-0" style={{ backgroundImage: poster.glow }} />
                        <span className="material-symbols-outlined !text-[40px] relative" style={{ color: c, opacity: 0.9 }}>
                            {posterIcon(act)}
                        </span>
                    </>
                )}

                {/* Kategori rozeti (sol üst) */}
                <span
                    className="absolute top-2.5 left-2.5 bg-white/[.92] border rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ color: c, borderColor: `${c}33` }}
                >
                    {act.category || 'İçerik'}
                </span>

                {/* Sınıf rozeti (sağ alt) */}
                <span className="absolute bottom-2.5 right-2.5 bg-white/[.92] border border-black/5 rounded-full px-2.5 py-1 text-[11px] font-bold text-on-surface-variant">
                    {formatGradeLevel(act.grade_level)}
                </span>

                {/* Test rozeti (sol alt) */}
                {act.is_test && (
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 bg-white/[.92] px-2 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                        <span className="text-[10px] font-extrabold text-on-error-container tracking-wide">TEST</span>
                    </span>
                )}
            </div>

            {/* Yönetim menüsü (hover'da belirir) */}
            <div ref={menuRef} className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    aria-label="Diğer işlemler"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                    className={cn(
                        'w-8 h-8 rounded-lg bg-white/[.92] border border-black/5 text-on-surface-variant flex items-center justify-center transition-opacity hover:text-on-surface focus:opacity-100',
                        menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                    )}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && (
                    <div className="absolute right-0 top-9 z-30 w-[186px] bg-white border border-outline-variant rounded-xl shadow-[0_16px_32px_rgba(15,23,42,0.14)] p-1.5 flex flex-col">
                        {menuItems.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => { setMenuOpen(false); item.onClick(); }}
                                className={cn(
                                    'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-left transition-colors',
                                    item.danger
                                        ? 'text-error hover:bg-error-container'
                                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                                )}
                            >
                                <item.icon className="w-4 h-4 flex-shrink-0" /> {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Gövde */}
            <div className="flex-1 flex flex-col gap-1.5 min-w-0 px-4 pt-3.5 pb-4">
                <h3 className="text-[15px] font-bold text-on-surface leading-[1.35] line-clamp-2 m-0">{act.title}</h3>
                {act.description && (
                    <p className="text-[12.5px] text-on-surface-variant leading-[1.55] line-clamp-2 m-0">{act.description}</p>
                )}

                {/* Derste kullanılan üç işlem + "Aç" */}
                <div className="flex items-center gap-1.5 mt-auto pt-3 border-t border-surface-container-high">
                    <button
                        type="button"
                        onClick={stop(() => onOpenFullscreen(act))}
                        aria-label="Tam ekran aç"
                        title="Tam ekran aç"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={stop(() => onShowQr(act))}
                        aria-label="QR ile öğrenciye gönder"
                        title="QR ile öğrenciye gönder"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                        <QrCode className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={stop(() => onMoveToFolder(act))}
                        aria-label="Klasöre taşı"
                        title="Klasöre taşı"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                        <FolderInput className="w-5 h-5" />
                    </button>
                    <span className="ml-auto inline-flex items-center gap-1 text-[13px] font-bold text-primary">
                        Aç
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}

export const ActivityCard = memo(ActivityCardBase);
