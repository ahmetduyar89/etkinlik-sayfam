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
import { PortalCard } from '../common/PortalCard';
import { IconButton } from '../common/IconButton';
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
        <PortalCard className="p-4 flex flex-col sm:flex-row items-center gap-4 bg-white border-2 border-indigo-50 hover:border-indigo-300 shadow-md !rounded-2xl transition-all group">
            <button
                type="button"
                className="w-full sm:w-24 h-24 shrink-0 bg-indigo-50/50 rounded-xl border-2 border-indigo-100 flex items-center justify-center cursor-pointer overflow-hidden relative focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                onClick={() => onOpenPreview(act.id)}
                aria-label={`${act.title} önizlemesini aç`}
            >
                {act.image_url ? (
                    <img
                        src={act.image_url}
                        alt={act.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <LayoutDashboard className="w-8 h-8 text-indigo-200" aria-hidden="true" />
                )}
                <div className="absolute inset-0 bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
            </button>

            <button
                type="button"
                className="flex-1 min-w-0 space-y-1 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                onClick={() => onOpenPreview(act.id)}
            >
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 truncate">{act.title}</h3>
                    {act.is_test && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded-md uppercase tracking-widest border border-amber-200">
                            TEST
                        </span>
                    )}
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-md uppercase tracking-wider">
                        {act.category || 'Genel'}
                    </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-1 font-medium">
                    {act.description || 'Açıklama girilmedi.'}
                </p>
                <div className="flex items-center gap-4 pt-1">
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopyLink(act);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                onCopyLink(act);
                            }
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 uppercase tracking-tight hover:text-indigo-800 transition-colors"
                    >
                        <Share2 className="w-3.5 h-3.5" aria-hidden="true" /> Linki Kopyala
                    </span>
                    {act.is_test && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowResults(act.id);
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onShowResults(act.id);
                                }
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-tight hover:text-emerald-800 transition-colors"
                        >
                            <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" /> Sonuçlar
                        </span>
                    )}
                </div>
            </button>

            <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-xl border border-slate-100">
                <IconButton
                    icon={Copy}
                    onClick={() => onCopyHtml(act)}
                    aria-label="HTML kodunu kopyala"
                    title="HTML Kodunu Kopyala"
                />
                <IconButton
                    icon={Edit3}
                    onClick={() => onEdit(act)}
                    aria-label="Düzenle"
                    title="Düzenle"
                />
                <IconButton
                    icon={Trash2}
                    onClick={() => onRequestDelete(act)}
                    className="hover:bg-red-50 hover:text-red-500 text-neutral-400"
                    aria-label="Sil"
                    title="Sil"
                />
            </div>
        </PortalCard>
    );
}

export const ActivityListItem = memo(ActivityListItemBase);
