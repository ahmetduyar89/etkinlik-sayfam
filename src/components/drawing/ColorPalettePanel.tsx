import React from 'react';
import { motion } from 'framer-motion';
import { Check, Pipette } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DrawConfig } from '../../types';
import { DRAWING_COLORS } from '../../constants/drawing';
import {
    COLOR_FAMILIES,
    RECENT_COLORS_KEY,
    RECENT_COLORS_LIMIT,
    colorLabel,
} from '../../constants/colorPalette';

/** Koyu renkte beyaz, açık renkte siyah onay işareti göstermek için. */
function isLightColor(hex: string): boolean {
    const v = hex.replace('#', '');
    if (v.length !== 6) return false;
    const r = parseInt(v.slice(0, 2), 16);
    const g = parseInt(v.slice(2, 4), 16);
    const b = parseInt(v.slice(4, 6), 16);
    // ITU-R BT.601 parlaklık
    return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

function readRecentColors(): string[] {
    try {
        const raw = window.localStorage.getItem(RECENT_COLORS_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return Array.isArray(parsed)
            ? parsed.filter((c): c is string => typeof c === 'string')
            : [];
    } catch {
        return [];
    }
}

/** Seçilen rengi listenin başına alır, tekrarları temizler. */
function pushRecentColor(color: string): string[] {
    const next = [color, ...readRecentColors().filter((c) => c !== color)].slice(
        0,
        RECENT_COLORS_LIMIT
    );
    try {
        window.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
    } catch {
        /* gizli sekmede yazılamayabilir, önemsiz */
    }
    return next;
}

interface SwatchProps {
    color: string;
    label: string;
    selected: boolean;
    size: 'sm' | 'md';
    onPick: (color: string) => void;
}

function Swatch({ color, label, selected, size, onPick }: SwatchProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => onPick(color)}
            className={cn(
                'rounded-lg border transition-all flex items-center justify-center hover:scale-110',
                size === 'md' ? 'w-7 h-7' : 'w-6 h-6',
                selected
                    ? 'border-white ring-2 ring-white/70 scale-110'
                    : 'border-black/20 hover:border-white/60'
            )}
            style={{ backgroundColor: color }}
        >
            {selected && (
                <Check
                    className={cn(
                        'w-3.5 h-3.5',
                        isLightColor(color) ? 'text-slate-900' : 'text-white'
                    )}
                    strokeWidth={3}
                />
            )}
        </button>
    );
}

interface ColorPalettePanelProps {
    config: DrawConfig;
    setConfig: (c: DrawConfig) => void;
}

/**
 * Yalnızca renk seçimi. Kalem ucu, kalınlık gibi ayarlar ayrı panelde durur;
 * böylece renge tıklayan öğretmen doğrudan kartelayı görür.
 */
export function ColorPalettePanel({ config, setConfig }: ColorPalettePanelProps) {
    const [recent, setRecent] = React.useState<string[]>(() => readRecentColors());

    const pick = (color: string) => {
        setConfig({ ...config, color });
        setRecent(pushRecentColor(color));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            role="dialog"
            aria-label="Renk paleti"
            className="pointer-events-auto flex flex-col gap-2.5 w-[min(94vw,360px)] max-h-[62vh] overflow-y-auto bg-[#1a1b26]/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Renk Paleti
                </span>
                <span className="flex items-center gap-1.5">
                    <span
                        className="w-5 h-5 rounded-md border border-white/30"
                        style={{ backgroundColor: config.color }}
                    />
                    <span className="text-[11px] font-mono text-slate-300 uppercase tabular-nums">
                        {config.color}
                    </span>
                </span>
            </div>

            <div role="radiogroup" aria-label="Sık kullanılan renkler">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Sık Kullanılan
                </span>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    {DRAWING_COLORS.map((color) => (
                        <Swatch
                            key={color}
                            color={color}
                            label={`Renk ${color}`}
                            size="md"
                            selected={config.color === color}
                            onPick={pick}
                        />
                    ))}
                </div>
            </div>

            <div role="radiogroup" aria-label="Renk kartelası">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Kartela
                </span>
                {/* Sütun = renk ailesi, satır = açıktan koyuya ton.
                    `grid-flow-col` ile hücreler sütun sütun dolar. */}
                <div
                    className="mt-1 grid grid-flow-col gap-1 w-max"
                    style={{ gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}
                >
                    {COLOR_FAMILIES.map((family, familyIndex) =>
                        family.tones.map((color, toneIndex) => (
                            <Swatch
                                key={`${family.name}-${color}`}
                                color={color}
                                label={colorLabel(familyIndex, toneIndex)}
                                size="sm"
                                selected={config.color === color}
                                onPick={pick}
                            />
                        ))
                    )}
                </div>
            </div>

            {recent.length > 0 && (
                <div role="radiogroup" aria-label="Son kullanılan renkler">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        Son Kullanılan
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {recent.map((color) => (
                            <Swatch
                                key={`recent-${color}`}
                                color={color}
                                label={`Son kullanılan ${color}`}
                                size="md"
                                selected={config.color === color}
                                onPick={pick}
                            />
                        ))}
                    </div>
                </div>
            )}

            <label
                className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 transition-all cursor-pointer"
                title="Kendi renginizi seçin"
            >
                <span className="flex items-center gap-2">
                    <Pipette className="w-4 h-4 text-slate-300" />
                    <span className="text-[12px] font-semibold text-white">Özel renk</span>
                </span>
                <input
                    type="color"
                    value={config.color}
                    onChange={(e) => pick(e.target.value)}
                    aria-label="Özel renk seç"
                    className="w-10 h-7 rounded-md bg-transparent border border-white/20 cursor-pointer"
                />
            </label>
        </motion.div>
    );
}
