import { memo } from 'react';
import {
    BarChart3,
    Copy,
    Edit3,
    Share2,
    Trash2,
    Settings,
} from 'lucide-react';
import { IconButton } from '../common/IconButton';
import { cn } from '../../utils/cn';
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
    // Determine Bento layout and styling based on title/content match or fallback to index
    const titleLower = act.title.toLowerCase();
    
    let layoutType = index % 9;
    if (titleLower.includes('kuantum')) layoutType = 0;
    else if (titleLower.includes('genetik')) layoutType = 1;
    else if (titleLower.includes('mars')) layoutType = 2;
    else if (titleLower.includes('asit')) layoutType = 3;
    else if (titleLower.includes('test') || titleLower.includes('haftalık')) layoutType = 4;
    else if (titleLower.includes('ısınma') || titleLower.includes('harita')) layoutType = 5;
    else if (titleLower.includes('matematik')) layoutType = 6;
    else if (titleLower.includes('zihin') || titleLower.includes('beyin')) layoutType = 7;
    else if (titleLower.includes('mikro')) layoutType = 8;

    // Map style configurations for each layout
    const glowClasses = [
        "glow-purple", // 0
        "glow-green",  // 1
        "glow-indigo", // 2
        "glow-green border-[#4edea3]/40",  // 3
        "glow-pink",   // 4
        "glow-blue",   // 5
        "glow-blue",   // 6
        "glow-green",  // 7
        "glow-purple", // 8
    ];

    const getActionText = () => {
        if (layoutType === 0) return "Deneye Başla";
        if (layoutType === 2) return "Devam Et";
        if (layoutType === 3) return "Başla";
        if (layoutType === 5) return "Haritayı Aç";
        return "Keşfet";
    };

    const getIcon = () => {
        switch(layoutType) {
            case 0: return "science";
            case 2: return "rocket_launch";
            case 3: return "science";
            case 4: return "quiz";
            case 6: return "calculate";
            case 7: return "psychology";
            case 8: return "photo_library";
            default: return "explore";
        }
    };

    const renderCardContent = () => {
        switch (layoutType) {
            case 0: // Kuantum Alanları (2 Cols Wide, regular height)
                return (
                    <div className="flex-1 flex flex-col justify-between p-8 relative overflow-hidden">
                        <div className="z-10 space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="bg-surface-container-highest px-3 py-1 rounded-full text-xs font-semibold text-[#c2c6d6]">{act.subject || "Physics"}</span>
                                <span className="material-symbols-outlined text-[#adc6ff] text-lg">{getIcon()}</span>
                            </div>
                            <div className="space-y-2 max-w-[60%]">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{act.title}</h3>
                                <p className="text-sm text-[#c2c6d6] leading-relaxed line-clamp-2">{act.description || "Elektronların gizemli dünyasını interaktif simülasyonla deneyimleyin."}</p>
                            </div>
                        </div>
                        
                        <div className="z-10">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenPreview(act.id); }}
                                className="bg-[#571bc1] text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-[#571bc1]/25 hover:scale-105 hover:bg-[#6826df] transition-all active:scale-95"
                            >
                                {getActionText()}
                            </button>
                        </div>

                        {/* BG Graphic */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-[#000]/40 rounded-xl overflow-hidden mr-6 flex items-center justify-center shadow-2xl border border-white/10">
                            <img src={act.image_url || "/images/quantum_glow.png"} className="w-full h-full object-cover opacity-90 hover:scale-110 transition-transform duration-700" alt="visual" />
                        </div>
                    </div>
                );

            case 1: // Genetik Temeller (1 Col, Regular Height, Top graphic layout)
                return (
                    <div className="flex-1 flex flex-col justify-end relative overflow-hidden h-full group/card">
                        <div className="absolute inset-0 w-full h-[60%] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent z-10"></div>
                            <img src={act.image_url || "/images/dna_helix.png"} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" alt="visual" />
                        </div>
                        <div className="p-6 z-20 space-y-2 bg-surface-container/90 backdrop-blur-sm border-t border-white/5">
                            <p className="text-[11px] text-[#4edea3] font-black tracking-widest uppercase">{act.subject || "SCIENCE"}</p>
                            <h3 className="text-xl font-extrabold text-white">{act.title}</h3>
                        </div>
                    </div>
                );

            case 2: // Mars Kolonisi (1 Col, 2 Rows Tall, Rocket layout)
                return (
                    <div className="flex-1 flex flex-col justify-between p-8 relative overflow-hidden h-full group/card">
                        <div className="z-10 space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-[#571bc1]/20 flex items-center justify-center border border-[#571bc1]/40">
                                <span className="material-symbols-outlined text-[#d0bcff] text-2xl">{getIcon()}</span>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-extrabold text-white tracking-tight">{act.title}</h3>
                                <p className="text-sm text-[#c2c6d6] leading-relaxed line-clamp-4">{act.description || "Kızıl gezegende sürdürülebilir bir yaşam alanı inşa etme simülasyonu."}</p>
                            </div>
                        </div>

                        <div className="z-10 space-y-6 pb-6">
                            {/* Progress container */}
                            <div className="space-y-2">
                                <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                                    <div className="w-[45%] h-full bg-[#adc6ff] rounded-full shadow-[0_0_10px_#adc6ff]"></div>
                                </div>
                                <div className="text-[11px] text-[#c2c6d6] font-medium">İlerleme: %45</div>
                            </div>

                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenPreview(act.id); }}
                                className="w-full bg-[#1d2027]/80 border border-white/10 text-white font-bold py-3 px-6 rounded-xl backdrop-blur-md hover:bg-white/5 transition-all active:scale-95"
                            >
                                {getActionText()}
                            </button>
                        </div>

                        {/* Decorative Bottom Asset */}
                        <div className="absolute bottom-0 left-0 w-full h-20 z-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#10131a] z-10"></div>
                            <img src={act.image_url || "/images/holo_world_map.png"} className="w-full h-full object-cover opacity-30 object-bottom saturate-[0.4]" alt="decor" />
                        </div>
                    </div>
                );

            case 3: // Asit-Baz Dengesi (Flask large center layout)
                return (
                    <div className="flex-1 flex flex-col items-center justify-between p-6 text-center relative overflow-hidden">
                        <div className="space-y-4 flex flex-col items-center pt-4">
                            <span className="material-symbols-outlined text-[#4edea3] !text-5xl font-light select-none">{getIcon()}</span>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white leading-tight px-2">{act.title}</h3>
                                <p className="text-xs text-[#c2c6d6] px-4 line-clamp-2">{act.description || "Etkileşimli titrasyon deneyi"}</p>
                            </div>
                        </div>

                        <div className="w-full px-4 pb-2">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenPreview(act.id); }}
                                className="w-full bg-[#00a572] hover:bg-[#00c085] text-white font-bold py-2 rounded-lg transition-all active:scale-95"
                            >
                                {getActionText()}
                            </button>
                        </div>
                    </div>
                );

            case 4: // Haftalık Test (Pink Border, Question icon card)
                return (
                    <div className="flex-1 flex flex-col justify-between p-6 relative">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-xl bg-[#ffb4ab]/10 flex items-center justify-center border border-[#ffb4ab]/25">
                                <span className="material-symbols-outlined text-[#ffb4ab] text-xl">{getIcon()}</span>
                            </div>
                            <span className="text-[11px] text-[#c2c6d6] font-medium">12 Soru</span>
                        </div>

                        <div className="space-y-1.5 mt-8">
                            <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{act.title}</h3>
                            <p className="text-xs text-[#c2c6d6]">{act.subject || "Fizik & Kimya"}</p>
                        </div>
                    </div>
                );

            case 5: // Küresel Isınma Haritası (2 Cols, Map Right)
                return (
                    <div className="flex-1 flex flex-col justify-between p-8 relative overflow-hidden">
                        <div className="z-10 space-y-3 max-w-[60%]">
                            <h3 className="text-3xl font-bold text-white tracking-tight">{act.title}</h3>
                            <p className="text-sm text-[#c2c6d6] leading-relaxed line-clamp-2">{act.description || "Son 50 yıldaki iklim değişikliği verilerini dünya haritası üzerinde inceleyin."}</p>
                        </div>
                        
                        <div className="z-10 mt-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenPreview(act.id); }}
                                className="bg-surface-container-high hover:bg-white/10 text-white border border-white/10 font-semibold px-6 py-2.5 rounded-full transition-all active:scale-95"
                            >
                                {getActionText()}
                            </button>
                        </div>

                        {/* Map Visual right */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[180px] h-[130px] overflow-hidden mr-6 flex items-center justify-center rounded-xl border border-white/10 bg-black/40 shadow-2xl">
                            <img src={act.image_url || "/images/holo_world_map.png"} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" alt="map visual" />
                        </div>
                    </div>
                );

            case 6: // Matematik Lab
            case 7: // Zihin Oyunları
            case 8: // Mikro Dünya
                return (
                    <div className="flex-1 flex flex-col justify-between p-6 relative">
                        <div className="w-9 h-9 flex items-center justify-center">
                            <span className={cn(
                                "material-symbols-outlined text-xl",
                                layoutType === 6 ? "text-[#adc6ff]" : layoutType === 7 ? "text-[#4edea3]" : "text-[#d0bcff]"
                            )}>{getIcon()}</span>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl font-extrabold text-white tracking-tight">{act.title}</h3>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex-1 flex flex-col justify-between p-6 relative">
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-white line-clamp-2">{act.title}</h3>
                            <p className="text-xs text-[#c2c6d6] line-clamp-3 leading-relaxed">{act.description}</p>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onOpenPreview(act.id); }}
                            className="text-xs text-[#adc6ff] font-bold mt-4 flex items-center gap-1 hover:underline"
                        >
                            Göz At <span className="material-symbols-outlined !text-xs">arrow_forward</span>
                        </button>
                    </div>
                );
        }
    };

    return (
        <div 
            className={cn(
                "bento-card h-full group cursor-pointer",
                glowClasses[layoutType] || "glow-purple"
            )}
            onClick={() => onOpenPreview(act.id)}
        >
            {renderCardContent()}

            {/* Hidden premium hover action menu */}
            <div 
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 translate-y-[-10px] group-hover:translate-y-0"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center bg-[#1d2027]/90 backdrop-blur-md rounded-lg border border-white/10 p-1 shadow-2xl shadow-black/50">
                    <IconButton
                        icon={Copy}
                        onClick={() => onCopyHtml(act)}
                        className="hover:bg-white/5 text-[#c2c6d6] hover:text-white w-8 h-8"
                        title="HTML Kopyala"
                    />
                    <IconButton
                        icon={Share2}
                        onClick={() => onCopyLink(act)}
                        className="hover:bg-white/5 text-[#c2c6d6] hover:text-white w-8 h-8"
                        title="Link Paylaş"
                    />
                    <IconButton
                        icon={Edit3}
                        onClick={() => onEdit(act)}
                        className="hover:bg-white/5 text-[#c2c6d6] hover:text-white w-8 h-8"
                        title="Düzenle"
                    />
                    {act.is_test && (
                        <IconButton
                            icon={BarChart3}
                            onClick={() => onShowResults(act.id)}
                            className="text-[#4edea3] hover:bg-[#4edea3]/10 w-8 h-8"
                            title="Sonuçlar"
                        />
                    )}
                    <IconButton
                        icon={Trash2}
                        onClick={() => onRequestDelete(act)}
                        className="text-[#ffb4ab] hover:bg-[#ffb4ab]/10 w-8 h-8"
                        title="Sil"
                    />
                </div>
            </div>
        </div>
    );
}

export const ActivityCard = memo(ActivityCardBase);
