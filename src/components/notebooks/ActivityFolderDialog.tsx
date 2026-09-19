// src/components/notebooks/ActivityFolderDialog.tsx
// Bir etkinliğin hangi klasörlerde görüneceğini işaretlemeye yarayan pencere.
// Etkinlik kopyalanmaz; yalnızca `folder_ids` listesi güncellenir.
import React from 'react';
import { Check, Folder } from 'lucide-react';
import { Modal } from '../common/Modal';
import { cn } from '../../utils/cn';

export interface FolderOption {
    id: string;
    label: string;
    depth: number;
}

interface ActivityFolderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    activityTitle: string;
    folders: FolderOption[];
    /** Etkinliğin şu anda bulunduğu klasörler. */
    selectedIds: string[];
    onSave: (ids: string[]) => Promise<void>;
}

export function ActivityFolderDialog({
    isOpen,
    onClose,
    activityTitle,
    folders,
    selectedIds,
    onSave,
}: ActivityFolderDialogProps) {
    const [selected, setSelected] = React.useState<Set<string>>(new Set(selectedIds));
    const [isSaving, setIsSaving] = React.useState(false);

    // Pencere her açıldığında mevcut üyelikle başlar.
    React.useEffect(() => {
        if (isOpen) setSelected(new Set(selectedIds));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, activityTitle]);

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const submit = async () => {
        setIsSaving(true);
        try {
            await onSave(Array.from(selected));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`"${activityTitle}" hangi klasörlerde?`}>
            <p className="text-[12.5px] text-on-surface-variant mb-3">
                Bir etkinlik birden fazla klasörde görünebilir. İşareti kaldırmak etkinliği
                silmez, yalnızca o klasörden çıkarır.
            </p>

            <div className="flex flex-col gap-1 max-h-[46vh] overflow-y-auto">
                {folders.length === 0 ? (
                    <p className="text-[13px] text-on-surface-variant py-6 text-center">
                        Henüz klasör yok. Önce bir klasör oluşturun.
                    </p>
                ) : (
                    folders.map((f) => {
                        const checked = selected.has(f.id);
                        return (
                            <button
                                key={f.id}
                                type="button"
                                onClick={() => toggle(f.id)}
                                aria-pressed={checked}
                                style={{ paddingLeft: 12 + f.depth * 16 }}
                                className={cn(
                                    'flex items-center gap-3 pr-3 py-2.5 rounded-xl text-left transition-colors',
                                    checked ? 'bg-primary/10' : 'hover:bg-surface-container-high'
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
                                <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" fill="#3b82f6" />
                                <span className="text-[13.5px] font-medium text-on-surface truncate">
                                    {f.label}
                                </span>
                            </button>
                        );
                    })
                )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-4 mt-3 border-t border-outline-variant">
                <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    disabled={selected.size === 0}
                    className="px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 disabled:opacity-35 hover:bg-red-50 transition-colors"
                >
                    Tüm klasörlerden çıkar
                </button>
                <div className="flex items-center gap-2">
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
                        disabled={isSaving}
                        className="px-4 py-2.5 rounded-xl bg-primary text-white text-[13.5px] font-semibold disabled:opacity-40 hover:brightness-105 transition"
                    >
                        {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
