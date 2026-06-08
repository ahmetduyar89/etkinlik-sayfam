// src/components/activities/ActivityCard.tsx — İÇERİK MERKEZİ RESKIN (açık tema)
// Tüm props ve aksiyonlar AYNI. Sadece koyu/neon görünüm, açık İçerik Merkezi
// stiline ve branş rengine çevrildi.
import { memo } from 'react';
import { BarChart3, Copy, Edit3, Share2, Trash2, ChevronRight } from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { formatGradeLevel } from '../../constants/education';
import type { Activity } from '../../types';

// Branş → renk (tasarım sistemiyle uyumlu)
const SUBJECT_COLOR: Record<string, string> = {
    'Türkçe': '#E8C85A',
    'Matematik': '#5AC8A8',
    'Fen Bilimleri': '#E8685A',
    'Sosyal Bilgiler': '#6366f1',
    'İngilizce': '#3b82f6',
    'Din Kültürü ve Ahlak Bilgisi': '#8b5cf6',
    'Fizik': '#0ea5e9',
    'Kimya': '#ec4899',
    'Biyoloji': '#10b981',
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

function ActivityCardBase({
    act,
    onOpenPreview,
    onEdit,
    onRequestDelete,
    onShowResults,
    onCopyLink,
    onCopyHtml,
}: ActivityCardProps) {
    const titleLower = act.title.toLowerCase();
    const c = subjectColor(act.subject);

    const getPosterIcon = () => {
        const cat = (act.category || '').toLowerCase();
        if (act.is_test) return 'quiz';
        if (titleLower.includes('harita') || cat.includes('coğraf')) return 'public';
        if (cat.includes('oyun') || titleLower.includes('oyun')) return 'sports_esports';
        if (cat.includes('ders') || titleLower.includes('ders') || titleLower.includes('video')) return 'menu_book';
        if (cat.includes('lab') || cat.includes('deney')) return 'science';
        if (cat.includes('sim')) return 'animation';
        return 'rocket_launch';
    };

    const getActionText = () => {
        if (act.is_test) return 'Teste Başla';
        if (titleLower.includes('harita')) return 'Haritayı Aç';
        if (titleLower.includes('ders') || titleLower.includes('video')) return 'İzle / Oku';
        return 'Aç';
    };

    const renderPoster = () => {
        if (act.image_url) {
            return <img src={act.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" loading="lazy" />;
        }
        return (
            <div
                className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden select-none"
                style={{ backgroundImage: `linear-gradient(140deg, ${c}26, ${c}0d 65%, #ffffff00)` }}
            >
                <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(115% 85% at 85% 12%, ${c}33, transparent 55%)` }} />
                <span className="material-symbols-outlined relative !text-[52px] group-hover:scale-110 transition-transform duration-500" style={{ color: c, opacity: 0.92 }}>
                    {getPosterIcon()}
                </span>
                <span className="absolute bottom-2.5 right-3 text-[9.5px] font-extrabold uppercase tracking-widest" style={{ color: c, opacity: 0.62 }}>
                    {act.category || 'İçerik'}
                </span>
            </div>
        );
    };

    return (
        <div
            className="group relative flex flex-col md:flex-row bg-white border border-outline-variant rounded-2xl overflow-hidden hover:border-primary hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-[0_1px_3px_rgba(15,23,42,0.05)]"
            onClick={() => onOpenPreview(act.id)}
        >
            {/* Branş renk şeridi */}
            <div className="w-1.5 md:w-2 flex-shrink-0" style={{ background: c }} />

            {/* Poster */}
            <div className="w-full md:w-60 lg:w-64 aspect-video md:aspect-auto relative bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant flex-shrink-0 overflow-hidden">
                {renderPoster()}
                {act.is_test && (
                    <div className="absolute top-3 left-3 bg-white/90 border border-error/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm z-10">
                        <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-extrabold text-on-error-container tracking-wider uppercase">Test</span>
                    </div>
                )}
            </div>

            {/* İçerik */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-outline-variant">
                    <h3 className="text-lg lg:text-xl font-bold text-on-surface tracking-tight leading-tight truncate pr-4 font-headline-md group-hover:text-primary transition-colors">
                        {act.title}
                    </h3>
                    <div className="flex items-center gap-2.5 flex-shrink-0">
                        {act.subject && (
                            <span className="inline-flex items-center gap-1.5 bg-surface-container-high text-on-surface-variant text-[10px] lg:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg">
                                <span className="w-2 h-2 rounded-full" style={{ background: c }} />
                                {act.subject}
                            </span>
                        )}
                        <span className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg" style={{ background: `${c}1a`, color: c }}>
                            {formatGradeLevel(act.grade_level)}
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between gap-5">
                    <p className="text-sm lg:text-[15px] text-on-surface-variant leading-relaxed line-clamp-2 font-medium">
                        {act.description || 'Bu interaktif içerik için henüz bir açıklama girilmemiş. Açmak için karta tıklayın.'}
                    </p>

                    <div className="flex items-center justify-between mt-auto" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onOpenPreview(act.id)}
                            className="text-white font-bold px-5 py-2.5 rounded-xl text-[13px] tracking-wide shadow-[0_4px_12px_rgba(99,102,241,0.28)] bg-primary hover:brightness-105 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            {getActionText()}
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1 bg-surface-container-low border border-outline-variant p-1 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity">
                            <IconButton icon={Copy} onClick={() => onCopyHtml(act)} className="w-8 h-8 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" title="HTML Kopyala" />
                            <IconButton icon={Share2} onClick={() => onCopyLink(act)} className="w-8 h-8 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" title="Bağlantı Paylaş" />
                            <IconButton icon={Edit3} onClick={() => onEdit(act)} className="w-8 h-8 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" title="Düzenle" />
                            {act.is_test && (
                                <IconButton icon={BarChart3} onClick={() => onShowResults(act.id)} className="w-8 h-8 text-tertiary hover:bg-tertiary-container" title="Sonuçlar" />
                            )}
                            <IconButton icon={Trash2} onClick={() => onRequestDelete(act)} className="w-8 h-8 text-error hover:bg-error-container" title="Sil" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const ActivityCard = memo(ActivityCardBase);
