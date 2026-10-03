// src/components/notebooks/ActivityPicker.tsx
// Klasöre eklenecek etkinlikleri seçme penceresi. Etkinlikler silinmez veya
// kopyalanmaz; yalnızca `folder_id` alanları hedef klasöre ayarlanır.
import React from 'react';
import { Check, Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { cn } from '../../utils/cn';
import { formatGradeLevel } from '../../constants/education';
import type { Activity } from '../../types';

interface ActivityPickerProps {
    isOpen: boolean;
    onClose: () => void;
    /** Seçilebilecek tüm etkinlikler. */
    activities: Activity[];
    /** Hedef klasörün adı (başlıkta gösterilir). */
    folderName: string;
    /** Bu klasörde zaten bulunan etkinliklerin id'leri. */
    existingIds: Set<string>;
    onAdd: (ids: string[]) => Promise<void>;
}

export function ActivityPicker({
    isOpen,
    onClose,
    activities,
    folderName,
    existingIds,
    onAdd,
}: ActivityPickerProps) {
    const [search, setSearch] = React.useState('');
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = React.useState(false);

    // Pencere her açıldığında seçim ve arama sıfırlanır.
    React.useEffect(() => {
        if (isOpen) {
            setSelected(new Set());
            setSearch('');
        }
    }, [isOpen]);

    const needle = search.trim().toLocaleLowerCase('tr');
    const list = React.useMemo(() => {
        const filtered = needle
            ? activities.filter((a) =>
                  [a.title, a.subject, a.category, a.tags]
                      .filter(Boolean)
                      .join(' ')
                      .toLocaleLowerCase('tr')
                      .includes(needle)
              )
            : activities;
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    }, [activities, needle]);

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const submit = async () => {
        if (selected.size === 0) return;
        setIsSaving(true);
        try {
            await onAdd(Array.from(selected));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`"${folderName}" klasörüne etkinlik ekle`}>
            <div className="flex items-center gap-2.5 bg-surface-container-high rounded-xl px-3 py-2 mb-3">
                <Search className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Etkinlik ara…"
                    aria-label="Etkinlik ara"
                    className="flex-1 bg-transparent outline-none text-[13px] text-on-surface placeholder-on-surface-variant min-w-0"
                />
            </div>

            <div className="flex flex-col gap-1 max-h-[46vh] overflow-y-auto">
                {list.length === 0 ? (
                    <p className="text-[13px] text-on-surface-variant py-6 text-center">
                        {needle ? 'Eşleşen etkinlik yok.' : 'Henüz etkinlik yok.'}
                    </p>
                ) : (
                    list.map((a) => {
                        const already = existingIds.has(a.id);
                        const checked = selected.has(a.id);
                        return (
                            <button
                                key={a.id}
                                type="button"
                                disabled={already}
                                onClick={() => toggle(a.id)}
                                aria-pressed={checked}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                                    already
                                        ? 'opacity-45 cursor-not-allowed'
                                        : checked
                                        ? 'bg-primary/10'
                                        : 'hover:bg-surface-container-high'
                                )}
                            >
                                <span
                                    className={cn(
                                        'w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center flex-shrink-0',
                                        checked
                                            ? 'bg-primary border-primary text-white'
                                            : 'border-outline-variant'
                                    )}
                                >
                                    {checked && <Check className="w-3 h-3" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[13.5px] font-semibold text-on-surface truncate">
                                        {a.title}
                                    </span>
                                    <span className="block text-[11.5px] text-on-surface-variant truncate">
                                        {[
                                            a.subject,
                                            a.grade_level ? formatGradeLevel(a.grade_level) : '',
                                            a.category,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ') || 'Genel'}
                                    </span>
                                </span>
                                {already && (
                                    <span className="text-[11.5px] font-semibold text-on-surface-variant flex-shrink-0">
                                        Bu klasörde
                                    </span>
                                )}
                            </button>
                        );
                    })
                )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-outline-variant">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-[13.5px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                    Vazgeç
                </button>
                <button
                    type="button"
                    onClick={submit}
                    disabled={selected.size === 0 || isSaving}
                    className="px-4 py-2.5 rounded-xl bg-primary text-white text-[13.5px] font-semibold disabled:opacity-40 hover:brightness-105 transition"
                >
                    {isSaving ? 'Ekleniyor…' : `Ekle${selected.size ? ` (${selected.size})` : ''}`}
                </button>
            </div>
        </Modal>
    );
}
