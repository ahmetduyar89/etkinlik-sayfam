// src/components/content/LibraryTree.tsx — Sol kütüphane ağacı
// Sınıf → ünite ağacı, branşlar, içerik türleri ve etiketler. Geniş ekranda
// sabit (sticky) bir kolon, <1024px'te üstteki menü düğmesiyle açılan çekmece.
import type { ReactNode } from 'react';
import { ChevronDown, ChevronRight, History, Layers, LayoutGrid, Tag } from 'lucide-react';
import { cn } from '../../utils/cn';
import { GRADE_LEVELS, SUBJECTS } from '../../constants/education';
import { subjectColor } from '../../constants/appearance';

interface LibraryTreeProps {
    totalCount: number;
    /** Sınıf → o sınıftaki içerik sayısı. */
    gradeCounts: Record<string, number>;
    /** Sınıf → ünite adları (o sınıfta içeriği olanlar). */
    unitsByGrade: Record<string, string[]>;
    /** `${sınıf}|${ünite}` → içerik sayısı. */
    unitCounts: Record<string, number>;
    subjectCounts: Record<string, number>;
    categories: string[];
    tags: string[];

    openGrades: Record<string, boolean>;
    onToggleGradeOpen: (grade: string) => void;

    selectedGradeLevel: string | null;
    selectedUnit: string | null;
    selectedSubject: string | null;
    selectedCategory: string | null;
    selectedTag: string | null;

    hasAnyFilter: boolean;
    hasRecents: boolean;

    onSelectAll: () => void;
    onSelectRecents: () => void;
    onSelectGrade: (grade: string) => void;
    onSelectUnit: (grade: string, unit: string) => void;
    onSelectSubject: (subject: string) => void;
    onSelectCategory: (category: string) => void;
    onSelectTag: (tag: string) => void;
}

function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <div className="px-3 pt-[18px] pb-1.5 text-[10.5px] font-bold uppercase tracking-[1.4px] text-on-surface-variant/60">
            {children}
        </div>
    );
}

interface TreeRowProps {
    active?: boolean;
    onClick: () => void;
    icon?: ReactNode;
    dot?: string;
    label: string;
    count?: number;
    indent?: boolean;
}

function TreeRow({ active = false, onClick, icon, dot, label, count, indent = false }: TreeRowProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? 'true' : undefined}
            title={label}
            className={cn(
                'w-full flex items-center gap-2.5 p-3 rounded-xl text-[13.5px] text-left transition-colors',
                indent && 'ml-4 w-[calc(100%-16px)]',
                active
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-on-surface-variant font-medium hover:bg-surface-container-high'
            )}
        >
            <span className={cn('w-[18px] h-[18px] flex items-center justify-center flex-shrink-0', active ? 'text-primary' : 'text-slate-400')}>
                {dot ? <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} /> : icon}
            </span>
            <span className="flex-1 min-w-0 truncate">{label}</span>
            {count != null && (
                <span className={cn('text-[11.5px] font-semibold flex-shrink-0', active ? 'text-primary' : 'text-slate-400')}>
                    {count}
                </span>
            )}
        </button>
    );
}

export function LibraryTree(props: LibraryTreeProps) {
    const {
        totalCount, gradeCounts, unitsByGrade, unitCounts, subjectCounts, categories, tags,
        openGrades, onToggleGradeOpen, selectedGradeLevel, selectedUnit, selectedSubject,
        selectedCategory, selectedTag, hasAnyFilter, hasRecents,
        onSelectAll, onSelectRecents, onSelectGrade, onSelectUnit, onSelectSubject,
        onSelectCategory, onSelectTag,
    } = props;

    const grades = GRADE_LEVELS.filter((g) => gradeCounts[g]);
    const subjects = SUBJECTS.filter((s) => subjectCounts[s]);

    return (
        <nav className="flex flex-col gap-0.5" aria-label="Kütüphane">
            <TreeRow
                active={!hasAnyFilter}
                onClick={onSelectAll}
                icon={<LayoutGrid className="w-[18px] h-[18px]" />}
                label="Tüm İçerikler"
                count={totalCount}
            />
            {hasRecents && (
                <TreeRow onClick={onSelectRecents} icon={<History className="w-[18px] h-[18px]" />} label="Son kullanılanlar" />
            )}

            {grades.length > 0 && <SectionLabel>Sınıflar</SectionLabel>}
            {grades.map((grade) => {
                const isOpen = !!openGrades[grade];
                const units = unitsByGrade[grade] || [];
                return (
                    <div key={grade} className="contents">
                        <TreeRow
                            active={selectedGradeLevel === grade && !selectedUnit}
                            onClick={() => { onSelectGrade(grade); onToggleGradeOpen(grade); }}
                            icon={isOpen ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronRight className="w-[18px] h-[18px]" />}
                            label={`${grade}. Sınıf`}
                            count={gradeCounts[grade]}
                        />
                        {isOpen && units.map((unit) => (
                            <TreeRow
                                key={`${grade}|${unit}`}
                                indent
                                active={selectedUnit === unit && selectedGradeLevel === grade}
                                onClick={() => onSelectUnit(grade, unit)}
                                icon={<Layers className="w-[18px] h-[18px]" />}
                                label={unit}
                                count={unitCounts[`${grade}|${unit}`]}
                            />
                        ))}
                    </div>
                );
            })}

            {subjects.length > 0 && <SectionLabel>Branşlar</SectionLabel>}
            {subjects.map((subject) => (
                <TreeRow
                    key={subject}
                    active={selectedSubject === subject}
                    onClick={() => onSelectSubject(subject)}
                    dot={subjectColor(subject)}
                    label={subject}
                    count={subjectCounts[subject]}
                />
            ))}

            {categories.length > 0 && <SectionLabel>İçerik Türü</SectionLabel>}
            {categories.map((category) => (
                <TreeRow
                    key={category}
                    active={selectedCategory === category}
                    onClick={() => onSelectCategory(category)}
                    icon={<Tag className="w-[18px] h-[18px]" />}
                    label={category}
                />
            ))}

            {tags.length > 0 && (
                <>
                    <SectionLabel>Etiketler</SectionLabel>
                    <div className="flex flex-wrap gap-1.5 px-2 pt-1">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => onSelectTag(tag)}
                                className={cn(
                                    'px-2.5 py-1 rounded-full text-[11.5px] font-semibold border transition-colors',
                                    selectedTag === tag
                                        ? 'bg-primary/10 text-primary border-transparent'
                                        : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
                                )}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </nav>
    );
}
