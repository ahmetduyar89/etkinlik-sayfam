import { memo, useState } from 'react';
import {
    BarChart3,
    Copy,
    Edit3,
    Eye,
    LayoutDashboard,
    Share2,
    Trash2,
} from 'lucide-react';
import { PortalCard } from '../common/PortalCard';
import { IconButton } from '../common/IconButton';
import { LivePreview } from './LivePreview';
import { cn } from '../../utils/cn';
import type { Activity } from '../../types';

interface ActivityCardProps {
    act: Activity;
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
    const [isHovered, setIsHovered] = useState(false);

    const tags = act.tags
        ? act.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
        : [];

    return (
        <PortalCard
            className="p-0 h-full flex flex-col justify-between border-2 border-indigo-50 hover:border-indigo-300 shadow-lg shadow-indigo-100/20 cursor-pointer"
            onClick={() => onOpenPreview(act.id)}
        >
            <div className="p-6 space-y-5">
                <div className="flex justify-between items-start gap-3">
                    <h3 className="text-[17px] font-bold tracking-tight leading-snug text-slate-800 line-clamp-2">
                        {act.title}
                    </h3>
                    <div className="flex gap-2 shrink-0">
                        {act.is_test && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-md uppercase tracking-widest border border-amber-200">
                                TEST
                            </span>
                        )}
                        <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {act.category || 'Genel'}
                        </span>
                    </div>
                </div>
                <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed h-[40px] font-medium">
                    {act.description || 'Açıklama girilmedi.'}
                </p>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div
                    className="aspect-[16/10] bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 relative group overflow-hidden flex items-center justify-center shadow-inner"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {act.image_url ? (
                        <div className="absolute inset-0 w-full h-full">
                            <img
                                src={act.image_url}
                                alt={act.title}
                                loading="lazy"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-indigo-900/10 group-hover:bg-transparent transition-colors duration-500" />
                        </div>
                    ) : act.html_code || act.js_code ? (
                        <div className="absolute inset-0 w-full h-full transition-all duration-500 overflow-hidden">
                            {isHovered ? (
                                <LivePreview act={act} />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-indigo-50/30">
                                    <LayoutDashboard
                                        className="w-8 h-8 text-indigo-200"
                                        aria-hidden="true"
                                    />
                                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                                        Tıkla veya üzerine gel
                                    </span>
                                </div>
                            )}
                            <div
                                className={cn(
                                    'absolute inset-0 transition-opacity duration-300',
                                    isHovered ? 'bg-indigo-900/5' : 'bg-transparent'
                                )}
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <LayoutDashboard
                                className="w-10 h-10 text-indigo-200"
                                aria-hidden="true"
                            />
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-indigo-900/10 backdrop-blur-[2px] z-10">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-300/50">
                            <Eye className="w-4 h-4" aria-hidden="true" />
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="px-6 py-4 bg-slate-50 border-t-2 border-slate-100 flex justify-between items-center z-20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex gap-1">
                    <IconButton
                        icon={Copy}
                        onClick={() => onCopyHtml(act)}
                        aria-label="HTML kodunu kopyala"
                        title="HTML Kodunu Kopyala"
                    />
                    <IconButton
                        icon={Share2}
                        onClick={() => onCopyLink(act)}
                        aria-label="Öğrenci linkini kopyala"
                        title="Öğrenci Linki Kopyala"
                    />
                    <IconButton
                        icon={Edit3}
                        onClick={() => onEdit(act)}
                        aria-label="Düzenle"
                        title="Düzenle"
                    />
                    {act.is_test && (
                        <IconButton
                            icon={BarChart3}
                            onClick={() => onShowResults(act.id)}
                            className="text-emerald-500 bg-emerald-50 hover:bg-emerald-100"
                            aria-label="Sonuçları görüntüle"
                            title="Sonuçları Gör"
                        />
                    )}
                </div>
                <IconButton
                    icon={Trash2}
                    onClick={() => onRequestDelete(act)}
                    className="hover:bg-red-50 hover:text-red-500 text-neutral-400"
                    aria-label="Etkinliği sil"
                    title="Sil"
                />
            </div>
        </PortalCard>
    );
}

export const ActivityCard = memo(ActivityCardBase);
