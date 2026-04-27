import { memo } from 'react';
import {
    BarChart3,
    Copy,
    Edit3,
    Eye,
    LayoutDashboard,
    Share2,
    Trash2,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { cn } from '../../utils/cn';
import type { Activity } from '../../types';

interface ActivityListItemProps {
    act: Activity;
    onOpenPreview: (id: string) => void;
    onEdit: (act: Activity) => void;
    onRequestDelete: (act: Activity) => void;
    onShowResults: (id: string) => void;
    onCopyLink: (act: Activity) => void;
    onCopyHtml: (act: Activity) => void;
}

function ActivityListItemBase({
    act,
    onOpenPreview,
    onEdit,
    onRequestDelete,
    onShowResults,
    onCopyLink,
    onCopyHtml,
}: ActivityListItemProps) {
    return (
        <div 
            className="group glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-6 hover:border-primary/30 transition-all cursor-pointer neon-glow-hover"
            onClick={() => onOpenPreview(act.id)}
        >
            <div className="w-full sm:w-28 h-24 shrink-0 rounded-xl bg-surface-container-highest flex items-center justify-center overflow-hidden relative">
                {act.image_url ? (
                    <img src={act.image_url} alt={act.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <LayoutDashboard className="w-8 h-8 text-slate-600" />
                )}
                <div className="absolute inset-0 bg-primary-container/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                </div>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{act.title}</h3>
                    {act.is_test && (
                        <span className="px-2 py-0.5 bg-primary-container/20 text-primary text-[9px] font-black rounded-md uppercase tracking-widest border border-primary/20 flex items-center gap-1">
                            <div className="live-indicator w-1 h-1"></div>
                            TEST
                        </span>
                    )}
                    <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-[9px] font-bold rounded-md uppercase tracking-wider border border-white/5">
                        {act.category || 'Genel'}
                    </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-1">
                    {act.description || 'Açıklama girilmedi.'}
                </p>
                <div className="flex items-center gap-4 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => onCopyLink(act)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" /> Linki Kopyala
                    </button>
                    {act.is_test && (
                        <button 
                            onClick={() => onShowResults(act.id)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
                        >
                            <BarChart3 className="w-3.5 h-3.5" /> Sonuçlar
                        </button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5" onClick={(e) => e.stopPropagation()}>
                <IconButton
                    icon={Copy}
                    onClick={() => onCopyHtml(act)}
                    className="bg-transparent hover:bg-white/5 text-slate-500 hover:text-white"
                />
                <IconButton
                    icon={Edit3}
                    onClick={() => onEdit(act)}
                    className="bg-transparent hover:bg-white/5 text-slate-500 hover:text-white"
                />
                <IconButton
                    icon={Trash2}
                    onClick={() => onRequestDelete(act)}
                    className="bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-400"
                />
            </div>
        </div>
    );
}

export const ActivityListItem = memo(ActivityListItemBase);
