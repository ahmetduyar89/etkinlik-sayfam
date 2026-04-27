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
        <div 
            className="group glass-card rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 neon-glow-hover cursor-pointer h-full"
            onClick={() => onOpenPreview(act.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-56 overflow-hidden">
                {act.image_url ? (
                    <img 
                        src={act.image_url} 
                        alt={act.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                ) : (
                    <div className="w-full h-full bg-surface-container-highest flex items-center justify-center transition-all duration-500 overflow-hidden">
                         {isHovered && (act.html_code || act.js_code) ? (
                            <LivePreview act={act} />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-500">
                                <LayoutDashboard className="w-12 h-12 opacity-20" />
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Önizleme Yok</span>
                            </div>
                        )}
                    </div>
                )}
                
                <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary-fixed font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                    {act.category || 'Genel'}
                </div>
                
                {act.is_test && (
                    <div className="absolute top-4 right-4 bg-primary-container text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-primary-container/20">
                        <div className="live-indicator"></div>
                        Test
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-14 h-14 bg-primary-container text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary-container/40 scale-0 group-hover:scale-100 transition-transform duration-500">
                        <Eye className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                    <h3 className="font-headline-md text-xl text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {act.title}
                    </h3>
                    <p className="text-body-md text-sm text-slate-400 line-clamp-2 leading-relaxed">
                        {act.description || 'Bu etkinlik için henüz bir açıklama girilmemiş.'}
                    </p>
                    
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {tags.map(tag => (
                                <span key={tag} className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                        <IconButton
                            icon={Copy}
                            onClick={() => onCopyHtml(act)}
                            className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                        />
                        <IconButton
                            icon={Share2}
                            onClick={() => onCopyLink(act)}
                            className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                        />
                        <IconButton
                            icon={Edit3}
                            onClick={() => onEdit(act)}
                            className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                        />
                        {act.is_test && (
                            <IconButton
                                icon={BarChart3}
                                onClick={() => onShowResults(act.id)}
                                className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                            />
                        )}
                    </div>
                    
                    <IconButton
                        icon={Trash2}
                        onClick={() => onRequestDelete(act)}
                        className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    />
                </div>
            </div>
        </div>
    );
}

export const ActivityCard = memo(ActivityCardBase);
