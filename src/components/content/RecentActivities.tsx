// src/components/content/RecentActivities.tsx — "Son kullanılanlar" satır kartları
// Kaynak: localStorage (bkz. useRecentActivities). Derste en son açılan
// etkinlikleri tek dokunuşla yeniden açmak içindir.
import { Maximize2 } from 'lucide-react';
import { formatGradeLevel } from '../../constants/education';
import { categoryIcon, subjectColor } from '../../constants/appearance';
import { formatRecentTime, type RecentEntry } from '../../hooks/useRecentActivities';
import type { Activity } from '../../types';

interface RecentActivitiesProps {
    entries: Array<{ entry: RecentEntry; activity: Activity }>;
    onOpen: (act: Activity) => void;
}

export function RecentActivities({ entries, onOpen }: RecentActivitiesProps) {
    if (entries.length === 0) return null;

    return (
        <section id="son-kullanilanlar" className="scroll-mt-24">
            <div className="flex items-center gap-3 mt-[34px] mb-3.5">
                <h3 className="font-headline-md text-[16.5px] font-bold text-on-surface m-0">Son kullanılanlar</h3>
                <span className="flex-1 h-px bg-outline-variant" />
            </div>

            <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(268px,1fr))]">
                {entries.map(({ entry, activity }) => {
                    const c = subjectColor(activity.subject);
                    const meta = [formatRecentTime(entry.at), formatGradeLevel(activity.grade_level), activity.unit]
                        .filter(Boolean)
                        .join(' · ');
                    return (
                        <button
                            key={activity.id}
                            type="button"
                            onClick={() => onOpen(activity)}
                            className="text-left bg-white border border-outline-variant rounded-[18px] p-4 flex gap-3.5 items-center hover:border-primary hover:shadow-[0_16px_32px_rgba(15,23,42,0.10)] transition-all"
                        >
                            <span
                                className="w-[52px] h-[52px] rounded-[15px] flex items-center justify-center flex-shrink-0"
                                style={{ background: `${c}1a`, color: c }}
                            >
                                <span className="material-symbols-outlined !text-[25px]">{categoryIcon(activity.category)}</span>
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[14.5px] font-bold text-on-surface truncate">{activity.title}</span>
                                <span className="block text-[12.5px] text-on-surface-variant mt-[3px] truncate">{meta}</span>
                            </span>
                            <Maximize2 className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
