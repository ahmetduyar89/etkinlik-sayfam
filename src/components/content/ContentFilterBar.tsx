// src/components/content/ContentFilterBar.tsx — Tür çipleri + sıralama şeridi
// Tür listesi `allCategories`'ten dinamik üretilir; "Tümü" her zaman başta durur.
import { ArrowDownUp } from 'lucide-react';
import { cn } from '../../utils/cn';
import { categoryIcon } from '../../constants/appearance';

export type SortBy = 'unit' | 'title';

interface ContentFilterBarProps {
    categories: string[];
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
    sortBy: SortBy;
    onToggleSort: () => void;
}

export function ContentFilterBar({ categories, selectedCategory, onSelectCategory, sortBy, onToggleSort }: ContentFilterBarProps) {
    const chips: Array<{ label: string; value: string | null; icon: string }> = [
        { label: 'Tümü', value: null, icon: 'apps' },
        ...categories.map((c) => ({ label: c, value: c, icon: categoryIcon(c) })),
    ];

    return (
        <div className="flex items-center gap-2.5 flex-wrap bg-white border border-outline-variant rounded-[18px] px-4 py-3 mb-6">
            {chips.map((chip) => {
                const active = selectedCategory === chip.value;
                return (
                    <button
                        key={chip.label}
                        type="button"
                        onClick={() => onSelectCategory(chip.value)}
                        aria-pressed={active}
                        className={cn(
                            'inline-flex items-center gap-2 h-11 px-[18px] rounded-full text-[13.5px] font-semibold border transition-colors',
                            active
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
                        )}
                    >
                        <span className="material-symbols-outlined !text-[18px]">{chip.icon}</span>
                        {chip.label}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={onToggleSort}
                className="ml-auto inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-white border border-outline-variant text-[13.5px] font-semibold text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
                <ArrowDownUp className="w-[18px] h-[18px]" />
                {sortBy === 'unit' ? 'Ünite sırası' : 'Ada göre (A-Z)'}
            </button>
        </div>
    );
}
