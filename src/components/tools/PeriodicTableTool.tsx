import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Move, Info, Search } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PeriodicTableToolProps {
    onClose: () => void;
}

interface ElementData {
    number: number;
    symbol: string;
    name: string;
    mass: number;
    period: number;
    group: number;
    category: 'alkali' | 'alkaline_earth' | 'transition' | 'nonmetal' | 'halogen' | 'noble_gas' | 'metalloid' | 'post_transition';
    electrons: string;
    state: 'Gaz' | 'Katı' | 'Sıvı';
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    alkali: { bg: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/40', text: 'text-red-300', label: 'Alkali Metal' },
    alkaline_earth: { bg: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/40', text: 'text-orange-300', label: 'Toprak Alkali' },
    transition: { bg: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40', text: 'text-yellow-300', label: 'Geçiş Metali' },
    metalloid: { bg: 'bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/40', text: 'text-teal-300', label: 'Yarı Metal' },
    nonmetal: { bg: 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40', text: 'text-emerald-300', label: 'Ametal' },
    halogen: { bg: 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-500/40', text: 'text-sky-300', label: 'Halojen' },
    noble_gas: { bg: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/40', text: 'text-purple-300', label: 'Soygaz' },
    post_transition: { bg: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40', text: 'text-blue-300', label: 'Zayıf Metal' },
};

const ELEMENTS: ElementData[] = [
    { number: 1, symbol: 'H', name: 'Hidrojen', mass: 1.008, period: 1, group: 1, category: 'nonmetal', electrons: '1', state: 'Gaz' },
    { number: 2, symbol: 'He', name: 'Helyum', mass: 4.0026, period: 1, group: 18, category: 'noble_gas', electrons: '2', state: 'Gaz' },
    { number: 3, symbol: 'Li', name: 'Lityum', mass: 6.94, period: 2, group: 1, category: 'alkali', electrons: '2, 1', state: 'Katı' },
    { number: 4, symbol: 'Be', name: 'Berilyum', mass: 9.0122, period: 2, group: 2, category: 'alkaline_earth', electrons: '2, 2', state: 'Katı' },
    { number: 5, symbol: 'B', name: 'Bor', mass: 10.81, period: 2, group: 13, category: 'metalloid', electrons: '2, 3', state: 'Katı' },
    { number: 6, symbol: 'C', name: 'Karbon', mass: 12.011, period: 2, group: 14, category: 'nonmetal', electrons: '2, 4', state: 'Katı' },
    { number: 7, symbol: 'N', name: 'Azot', mass: 14.007, period: 2, group: 15, category: 'nonmetal', electrons: '2, 5', state: 'Gaz' },
    { number: 8, symbol: 'O', name: 'Oksijen', mass: 15.999, period: 2, group: 16, category: 'nonmetal', electrons: '2, 6', state: 'Gaz' },
    { number: 9, symbol: 'F', name: 'Flor', mass: 18.998, period: 2, group: 17, category: 'halogen', electrons: '2, 7', state: 'Gaz' },
    { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, period: 2, group: 18, category: 'noble_gas', electrons: '2, 8', state: 'Gaz' },
    { number: 11, symbol: 'Na', name: 'Sodyum', mass: 22.990, period: 3, group: 1, category: 'alkali', electrons: '2, 8, 1', state: 'Katı' },
    { number: 12, symbol: 'Mg', name: 'Magnezyum', mass: 24.305, period: 3, group: 2, category: 'alkaline_earth', electrons: '2, 8, 2', state: 'Katı' },
    { number: 13, symbol: 'Al', name: 'Alüminyum', mass: 26.982, period: 3, group: 13, category: 'post_transition', electrons: '2, 8, 3', state: 'Katı' },
    { number: 14, symbol: 'Si', name: 'Silisyum', mass: 28.085, period: 3, group: 14, category: 'metalloid', electrons: '2, 8, 4', state: 'Katı' },
    { number: 15, symbol: 'P', name: 'Fosfor', mass: 30.974, period: 3, group: 15, category: 'nonmetal', electrons: '2, 8, 5', state: 'Katı' },
    { number: 16, symbol: 'S', name: 'Kükürt', mass: 32.06, period: 3, group: 16, category: 'nonmetal', electrons: '2, 8, 6', state: 'Katı' },
    { number: 17, symbol: 'Cl', name: 'Klor', mass: 35.45, period: 3, group: 17, category: 'halogen', electrons: '2, 8, 7', state: 'Gaz' },
    { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, period: 3, group: 18, category: 'noble_gas', electrons: '2, 8, 8', state: 'Gaz' },
    { number: 19, symbol: 'K', name: 'Potasyum', mass: 39.098, period: 4, group: 1, category: 'alkali', electrons: '2, 8, 8, 1', state: 'Katı' },
    { number: 20, symbol: 'Ca', name: 'Kalsiyum', mass: 40.078, period: 4, group: 2, category: 'alkaline_earth', electrons: '2, 8, 8, 2', state: 'Katı' },
    { number: 26, symbol: 'Fe', name: 'Demir', mass: 55.845, period: 4, group: 8, category: 'transition', electrons: '2, 8, 14, 2', state: 'Katı' },
    { number: 29, symbol: 'Cu', name: 'Bakır', mass: 63.546, period: 4, group: 11, category: 'transition', electrons: '2, 8, 18, 1', state: 'Katı' },
    { number: 30, symbol: 'Zn', name: 'Çinko', mass: 65.38, period: 4, group: 12, category: 'transition', electrons: '2, 8, 18, 2', state: 'Katı' },
    { number: 35, symbol: 'Br', name: 'Brom', mass: 79.904, period: 4, group: 17, category: 'halogen', electrons: '2, 8, 18, 7', state: 'Sıvı' },
    { number: 47, symbol: 'Ag', name: 'Gümüş', mass: 107.87, period: 5, group: 11, category: 'transition', electrons: '2, 8, 18, 18, 1', state: 'Katı' },
    { number: 53, symbol: 'I', name: 'İyot', mass: 126.90, period: 5, group: 17, category: 'halogen', electrons: '2, 8, 18, 18, 7', state: 'Katı' },
    { number: 79, symbol: 'Au', name: 'Altın', mass: 196.97, period: 6, group: 11, category: 'transition', electrons: '2, 8, 18, 32, 18, 1', state: 'Katı' },
];

export function PeriodicTableTool({ onClose }: PeriodicTableToolProps) {
    const dragControls = useDragControls();
    const [selectedElement, setSelectedElement] = React.useState<ElementData>(ELEMENTS[0]); // default Hydrogen
    const [search, setSearch] = React.useState('');

    const filteredElements = React.useMemo(() => {
        if (!search.trim()) return ELEMENTS;
        const q = search.toLocaleLowerCase('tr').trim();
        return ELEMENTS.filter(
            (e) =>
                e.symbol.toLowerCase().includes(q) ||
                e.name.toLocaleLowerCase('tr').includes(q) ||
                String(e.number).includes(q)
        );
    }, [search]);

    const activeColor = CATEGORY_COLORS[selectedElement.category] || CATEGORY_COLORS.nonmetal;

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            className="fixed z-[11500] pointer-events-auto select-none"
            style={{
                top: 150,
                left: 180,
                touchAction: 'none',
            }}
        >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl text-white w-[640px] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-xs font-bold text-slate-200 hover:text-white"
                    >
                        <Move className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Periyodik Tablo Hızlı Referansı</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Element ara..."
                                className="bg-slate-800 border border-white/10 rounded-lg pl-6 pr-2 py-1 text-xs text-white outline-none w-28 focus:w-36 transition-all"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            title="Kapat"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-[1fr_210px] gap-4">
                    {/* Elements Grid */}
                    <div className="space-y-2">
                        <div className="text-[11px] text-slate-400 font-medium">
                            Element Seçin ({filteredElements.length} element):
                        </div>
                        <div className="grid grid-cols-6 gap-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
                            {filteredElements.map((el) => {
                                const cat = CATEGORY_COLORS[el.category];
                                const isSelected = selectedElement.number === el.number;
                                return (
                                    <button
                                        key={el.number}
                                        type="button"
                                        onClick={() => setSelectedElement(el)}
                                        className={cn(
                                            'p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative',
                                            cat.bg,
                                            isSelected ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-90'
                                        )}
                                    >
                                        <span className="text-[9px] text-slate-400 absolute top-0.5 left-1 font-mono">
                                            {el.number}
                                        </span>
                                        <span className={cn('text-sm font-bold mt-1', cat.text)}>
                                            {el.symbol}
                                        </span>
                                        <span className="text-[9px] text-slate-300 truncate w-full">
                                            {el.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Category legend */}
                        <div className="pt-2 flex flex-wrap gap-1.5 text-[9px] text-slate-400">
                            {Object.entries(CATEGORY_COLORS).slice(0, 5).map(([key, c]) => (
                                <span key={key} className="flex items-center gap-1">
                                    <span className={cn('w-2 h-2 rounded-full', c.text.replace('text-', 'bg-'))} />
                                    {c.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Selected Element Detail Card */}
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <span className="text-xs font-bold text-slate-400">Atom No: {selectedElement.number}</span>
                                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10', activeColor.text)}>
                                    {activeColor.label}
                                </span>
                            </div>

                            <div className="text-center my-3">
                                <div className={cn('text-4xl font-extrabold font-mono', activeColor.text)}>
                                    {selectedElement.symbol}
                                </div>
                                <div className="text-base font-bold text-white mt-1">
                                    {selectedElement.name}
                                </div>
                                <div className="text-xs text-slate-400 font-mono">
                                    Kütle: {selectedElement.mass} g/mol
                                </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/10">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Periyot:</span>
                                    <span className="font-bold text-white">{selectedElement.period}. Periyot</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Grup:</span>
                                    <span className="font-bold text-white">{selectedElement.group} ({selectedElement.group <= 2 ? `${selectedElement.group}A` : selectedElement.group >= 13 ? `${selectedElement.group - 10}A` : `${selectedElement.group}B`})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Elektron Katmanı:</span>
                                    <span className="font-mono font-bold text-indigo-300">{selectedElement.electrons}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Oda Koşulları:</span>
                                    <span className="font-medium text-white">{selectedElement.state}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-400 flex items-center gap-1">
                            <Info className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>Öğretmen ve öğrenci hızlı referansı</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
