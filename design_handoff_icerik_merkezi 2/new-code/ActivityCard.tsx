// src/components/activities/ActivityCard.tsx — İÇERİK MERKEZİ RESKIN
// İçerik Merkezi GÖRSEL IZGARA kartı. Tüm props/aksiyonlar AYNI kalır
// (önizleme açma, düzenle, sil, sonuçlar, link/HTML kopyala).
// App.tsx artık bunları bir CSS grid içinde render eder (aşağıda).
import { memo } from 'react';
import { BarChart3, Copy, Edit3, Share2, Trash2 } from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { formatGradeLevel } from '../../constants/education';
import type { Activity } from '../../types';

const SUBJECT_COLOR: Record<string, string> = {
    'Türkçe': '#E8C85A', 'Matematik': '#5AC8A8', 'Fen Bilimleri': '#E8685A',
    'Sosyal Bilgiler': '#6366f1', 'İngilizce': '#3b82f6', 'Din Kültürü ve Ahlak Bilgisi': '#8b5cf6',
    'Fizik': '#0ea5e9', 'Kimya': '#ec4899', 'Biyoloji': '#10b981',
};
const subjectColor = (s?: string) => (s && SUBJECT_COLOR[s]) || '#6366f1';

interface ActivityCardProps {
    act: Activity;
    index?: number;
    onOpenPreview: (id: string) => void;
    onEdit: (act: Activity) => void;
    onRequestDelete: (act: Activity) => void;
    onShowResults: (id: string) => void;
    onCopyLink: (act: Activity) => void;
    onCopyHtml: (act: Activity) => void;
}

function ActivityCardBase({ act, onOpenPreview, onEdit, onRequestDelete, onShowResults, onCopyLink, onCopyHtml }: ActivityCardProps) {
    const c = subjectColor(act.subject);
    const titleLower = act.title.toLowerCase();

    const posterIcon = () => {
        const cat = (act.category || '').toLowerCase();
        if (act.is_test) return 'quiz';
        if (titleLower.includes('harita') || cat.includes('coğraf')) return 'public';
        if (cat.includes('oyun')) return 'sports_esports';
        if (cat.includes('ders') || titleLower.includes('video')) return 'menu_book';
        if (cat.includes('lab') || cat.includes('deney')) return 'science';
        if (cat.includes('sim')) return 'animation';
        return 'rocket_launch';
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenPreview(act.id)}
            className="group flex flex-col bg-white border border-outline-variant rounded-2xl overflow-hidden cursor-pointer shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)] transition-all duration-200"
        >
            {/* Poster */}
            <div className="relative w-full aspect-[16/10]">
                {act.image_url ? (
                    <img src={act.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden"
                        style={{ backgroundImage: `linear-gradient(140deg, ${c}26, ${c}0d 65%, #ffffff00)` }}>
                        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(115% 85% at 85% 12%, ${c}33, transparent 55%)` }} />
                        <span className="material-symbols-outlined !text-[50px]" style={{ color: c, opacity: 0.9 }}>{posterIcon()}</span>
                    </div>
                )}

                {/* Kategori rozeti (sol üst) */}
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ color: c, borderColor: `${c}33` }}>
                    {act.category || 'İçerik'}
                </span>

                {/* Sınıf çipi (sağ alt) */}
                <span className="absolute bottom-2.5 right-2.5 bg-white/90 text-on-surface-variant text-[11px] font-bold px-2.5 py-1 rounded-full border border-black/5">
                    {formatGradeLevel(act.grade_level)}
                </span>

                {/* Test rozeti */}
                {act.is_test && (
                    <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 bg-white/90 px-2 py-1 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
                        <span className="text-[10px] font-extrabold text-on-error-container tracking-wide">TEST</span>
                    </span>
                )}
            </div>

            {/* Gövde */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-[15px] font-bold text-on-surface leading-snug line-clamp-2 min-h-[40px] font-sans">
                    {act.title}
                </h3>
                <p className="text-[12.5px] text-on-surface-variant leading-relaxed line-clamp-2 mt-1.5">
                    {act.description}
                </p>

                <div className="flex items-center justify-between mt-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-on-surface-variant">
                        <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                        {act.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-primary">
                        Aç
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" /></svg>
                    </span>
                </div>

                {/* Yönetici kontrolleri — hover'da görünür (tıklama kartı açmaz) */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <IconButton icon={Copy} onClick={() => onCopyHtml(act)} className="w-7 h-7 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" title="HTML Kopyala" />
                    <IconButton icon={Share2} onClick={() => onCopyLink(act)} className="w-7 h-7 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" title="Bağlantı Paylaş" />
                    <IconButton icon={Edit3} onClick={() => onEdit(act)} className="w-7 h-7 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" title="Düzenle" />
                    {act.is_test && (
                        <IconButton icon={BarChart3} onClick={() => onShowResults(act.id)} className="w-7 h-7 text-tertiary hover:bg-tertiary-container" title="Sonuçlar" />
                    )}
                    <IconButton icon={Trash2} onClick={() => onRequestDelete(act)} className="w-7 h-7 text-error hover:bg-error-container ml-auto" title="Sil" />
                </div>
            </div>
        </div>
    );
}

export const ActivityCard = memo(ActivityCardBase);
