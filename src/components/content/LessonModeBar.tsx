// src/components/content/LessonModeBar.tsx — "Devam eden ders" şeridi
// Ders Modu açıkken sayfanın en üstünde durur; en son açılan etkinliği tek
// dokunuşla tam ekran açmak, QR ile öğrenciye göndermek ve düzenlemek içindir.
import { Edit3, Maximize2, QrCode } from 'lucide-react';
import { formatGradeLevel } from '../../constants/education';
import type { Activity } from '../../types';

interface LessonModeBarProps {
    activity: Activity;
    onOpenFullscreen: (act: Activity) => void;
    onShowQr: (act: Activity) => void;
    onEdit: (act: Activity) => void;
}

export function LessonModeBar({ activity, onOpenFullscreen, onShowQr, onEdit }: LessonModeBarProps) {
    const meta = ['Devam eden ders', formatGradeLevel(activity.grade_level), activity.unit || activity.subject]
        .filter(Boolean)
        .join(' · ');

    return (
        <section className="flex flex-col md:flex-row md:items-center gap-[26px] bg-inverse-surface text-white rounded-[22px] px-7 py-[26px] mb-[26px]">
            <div className="flex-1 min-w-0">
                <span className="inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[1.4px] text-[#a5b4fc]">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {meta}
                </span>
                <h2 className="font-headline-md text-[27px] font-bold tracking-[-0.02em] mt-3">{activity.title}</h2>
                {activity.description && (
                    <p className="text-[14.5px] text-slate-400 leading-relaxed mt-2 max-w-[640px]">{activity.description}</p>
                )}
            </div>

            <div className="flex gap-2.5 flex-shrink-0">
                <button
                    type="button"
                    onClick={() => onOpenFullscreen(activity)}
                    className="inline-flex items-center gap-2 h-14 px-[26px] rounded-2xl bg-primary text-white text-[15.5px] font-bold hover:brightness-110 transition-all"
                >
                    <Maximize2 className="w-[21px] h-[21px]" /> Tam ekran aç
                </button>
                <button
                    type="button"
                    onClick={() => onShowQr(activity)}
                    aria-label="QR ile öğrenciye gönder"
                    title="QR ile öğrenciye gönder"
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[.08] text-slate-200 hover:bg-white/[.16] transition-colors"
                >
                    <QrCode className="w-[21px] h-[21px]" />
                </button>
                <button
                    type="button"
                    onClick={() => onEdit(activity)}
                    aria-label="Etkinliği düzenle"
                    title="Etkinliği düzenle"
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[.08] text-slate-200 hover:bg-white/[.16] transition-colors"
                >
                    <Edit3 className="w-[21px] h-[21px]" />
                </button>
            </div>
        </section>
    );
}
