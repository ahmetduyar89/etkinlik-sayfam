import { memo } from 'react';
import {
    BarChart3,
    Copy,
    Edit3,
    Share2,
    Trash2,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { cn } from '../../utils/cn';
import { LivePreview } from './LivePreview';
import { formatGradeLevel } from '../../constants/education';
import type { Activity } from '../../types';

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
    index = 0,
    onOpenPreview,
    onEdit,
    onRequestDelete,
    onShowResults,
    onCopyLink,
    onCopyHtml,
}: ActivityCardProps) {
    const titleLower = act.title.toLowerCase();
    let colorType = index % 5; // Use index mod 5 to cycle neon accent colors
    
    // Accent color configurations based on index
    const accents = [
        { border: "bg-[#a855f7]", shadow: "shadow-[#a855f7]/20", text: "text-[#a855f7]", btn: "bg-[#a855f7] hover:bg-[#9333ea]", fallback: "/images/quantum_glow.png" }, // Purple
        { border: "bg-[#22c55e]", shadow: "shadow-[#22c55e]/20", text: "text-[#22c55e]", btn: "bg-[#15803d] hover:bg-[#16a34a]", fallback: "/images/dna_helix.png" },   // Green
        { border: "bg-[#3b82f6]", shadow: "shadow-[#3b82f6]/20", text: "text-[#3b82f6]", btn: "bg-[#2563eb] hover:bg-[#1d4ed8]", fallback: "/images/holo_world_map.png" }, // Blue
        { border: "bg-[#ec4899]", shadow: "shadow-[#ec4899]/20", text: "text-[#ec4899]", btn: "bg-[#db2777] hover:bg-[#be185d]", fallback: "/images/quantum_glow.png" }, // Pink
        { border: "bg-[#f59e0b]", shadow: "shadow-[#f59e0b]/20", text: "text-[#f59e0b]", btn: "bg-[#d97706] hover:bg-[#b45309]", fallback: "/images/holo_world_map.png" }, // Amber
    ];
    const currentAccent = accents[colorType];

    const getActionText = () => {
        if (act.is_test) return "Teste Başla";
        if (titleLower.includes('harita')) return "Haritayı Aç";
        if (titleLower.includes('ders') || titleLower.includes('video')) return "İzle / Oku";
        return "Deneye Başla";
    };

    const renderVisualSlot = () => {
        if (act.image_url) {
            return <img src={act.image_url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="preview" />;
        }
        if (act.html_code || act.js_code || act.storage_url) {
            return (
                <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
                    <LivePreview act={act} />
                </div>
            );
        }
        return <img src={currentAccent.fallback} className="w-full h-full object-cover opacity-80 saturate-[0.6] hover:scale-105 transition-all duration-700" alt="fallback visual" />;
    };

    return (
        <div 
            className="relative flex flex-col md:flex-row bg-surface-container/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden hover:bg-surface-container/60 hover:border-white/10 transition-all duration-300 cursor-pointer shadow-lg shadow-black/20 hover:shadow-2xl group"
            onClick={() => onOpenPreview(act.id)}
        >
            {/* Left Color Stripe accent */}
            <div className={cn("w-2 md:w-2.5 flex-shrink-0 h-full", currentAccent.border)} />
            
            {/* Görsel (Visual Slot) */}
            <div className="w-full md:w-64 lg:w-72 aspect-video md:aspect-auto relative bg-black/30 border-b md:border-b-0 md:border-r border-white/5 flex-shrink-0 overflow-hidden">
                {renderVisualSlot()}
                
                {/* Subtle Live Indicator */}
                {act.is_test && (
                    <div className="absolute top-3 left-3 bg-[#10131a]/80 border border-[#ec4899]/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm z-10">
                        <div className="w-2 h-2 bg-[#ec4899] rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-extrabold text-white tracking-wider uppercase">Test</span>
                    </div>
                )}
            </div>

            {/* Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                
                {/* Header Band: ADI & DERS-SINIF */}
                <div className="bg-[#0a0c10]/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5">
                    <h3 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight leading-tight truncate pr-4 group-hover:text-[#adc6ff] transition-colors">
                        {act.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {act.subject && (
                            <span className="bg-white/5 text-[#c2c6d6] text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/5">
                                {act.subject}
                            </span>
                        )}
                        <span className="bg-[#adc6ff]/10 text-[#adc6ff] text-[10px] lg:text-[11px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-[#adc6ff]/10">
                            {formatGradeLevel(act.grade_level)}
                        </span>
                    </div>
                </div>

                {/* Body & Footer: AÇIKLAMA */}
                <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                    <p className="text-sm lg:text-[15px] text-[#c2c6d6] leading-relaxed line-clamp-3 font-medium">
                        {act.description || "Bu etkileşimli bilim içeriği için henüz bir açıklama girilmemiş. Keşfet butonunu kullanarak hemen içeriğe göz atabilirsiniz."}
                    </p>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => onOpenPreview(act.id)}
                            className={cn(
                                "text-white font-extrabold px-6 py-2.5 rounded-xl text-[13px] tracking-wide shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2",
                                currentAccent.btn,
                                currentAccent.shadow
                            )}
                        >
                            {getActionText()}
                            <span className="material-symbols-outlined !text-[18px]">arrow_right_alt</span>
                        </button>

                        {/* Admin Quick Controls */}
                        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur border border-white/5 p-1 rounded-xl opacity-60 hover:opacity-100 transition-opacity">
                            <IconButton
                                icon={Copy}
                                onClick={() => onCopyHtml(act)}
                                className="w-8 h-8 text-[#c2c6d6] hover:text-white hover:bg-white/5"
                                title="HTML Kopyala"
                            />
                            <IconButton
                                icon={Share2}
                                onClick={() => onCopyLink(act)}
                                className="w-8 h-8 text-[#c2c6d6] hover:text-white hover:bg-white/5"
                                title="Bağlantı Paylaş"
                            />
                            <IconButton
                                icon={Edit3}
                                onClick={() => onEdit(act)}
                                className="w-8 h-8 text-[#c2c6d6] hover:text-white hover:bg-white/5"
                                title="Düzenle"
                            />
                            {act.is_test && (
                                <IconButton
                                    icon={BarChart3}
                                    onClick={() => onShowResults(act.id)}
                                    className="w-8 h-8 text-[#22c55e] hover:bg-[#22c55e]/10"
                                    title="Sonuçlar"
                                />
                            )}
                            <IconButton
                                icon={Trash2}
                                onClick={() => onRequestDelete(act)}
                                className="w-8 h-8 text-[#ef4444] hover:bg-[#ef4444]/10"
                                title="Sil"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export const ActivityCard = memo(ActivityCardBase);
