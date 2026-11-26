import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DrawConfig } from '../../types';
import { PEN_SIZE_MAX, PEN_SIZE_MIN, PEN_SIZES } from '../../constants/drawing';

/** Ön ayar noktasının kutu içindeki görsel çapı (gerçek kalınlık değil). */
const DOT_MIN = 4;
const DOT_MAX = 20;

/** Önizleme şeridinde çizginin taşmaması için üst sınır. */
const PREVIEW_MAX = 34;

const clamp = (v: number) => Math.min(PEN_SIZE_MAX, Math.max(PEN_SIZE_MIN, v));

/** Ön ayarların görsel noktasını 4–20 px arasına oturtur. */
function dotSize(value: number): number {
    const t = (value - PEN_SIZES[0].value) / (PEN_SIZES[PEN_SIZES.length - 1].value - PEN_SIZES[0].value);
    return Math.round(DOT_MIN + t * (DOT_MAX - DOT_MIN));
}

interface SizePickerProps {
    config: DrawConfig;
    setConfig: (c: DrawConfig) => void;
    /** Silgi bölümünde etiketler ve önizleme değişir. */
    isEraser: boolean;
}

/**
 * Kalem/silgi kalınlığı: ön ayarlar, ince ayar kaydırıcısı ve canlı önizleme.
 *
 * Önizleme şeridi yarı açık yarı koyu: beyaz kalem de siyah kalem de görünür.
 * Fosforlu ve silgi tuvalde kalınlığı katlayarak kullandığı için gerçekleşen
 * kalınlık ayrıca yazılır.
 */
export function SizePicker({ config, setConfig, isEraser }: SizePickerProps) {
    const width = config.width;
    const setWidth = (value: number) => setConfig({ ...config, width: clamp(value) });

    // Tuvaldeki gerçek kalınlık: fosforlu izi 5 kat, silgi yarıçapı 5 kat.
    const eraserDiameter = Math.max(6, width * 5) * 2;
    const effective = isEraser
        ? eraserDiameter
        : config.tool === 'highlighter'
          ? width * 5
          : width;
    const previewStroke = Math.min(PREVIEW_MAX, effective);

    const hint = isEraser
        ? `silgi ≈ ${eraserDiameter} px`
        : config.tool === 'highlighter'
          ? `fosforlu izi ≈ ${width * 5} px`
          : null;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {isEraser ? 'Silgi Ucu' : 'Kalem Kalınlığı'}
                </span>
                <span className="text-[11px] text-slate-300 font-semibold tabular-nums">
                    {width} px
                    {hint && <span className="text-slate-500"> · {hint}</span>}
                </span>
            </div>

            {/* Canlı önizleme: sol yarı açık, sağ yarı koyu zemin — beyaz kalem de
                siyah kalem de görünsün. */}
            <div className="relative h-11 rounded-xl overflow-hidden border border-white/10 flex">
                <div className="flex-1 bg-[#f8fafc]" />
                <div className="flex-1 bg-[#1e293b]" />
                {isEraser ? (
                    <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-slate-500"
                        style={{ width: previewStroke, height: previewStroke }}
                    />
                ) : (
                    <span
                        className="absolute left-4 right-4 top-1/2 -translate-y-1/2 rounded-full"
                        style={{
                            height: previewStroke,
                            backgroundColor: config.color,
                            opacity: config.tool === 'highlighter' ? 0.45 : 1,
                        }}
                    />
                )}
            </div>

            {/* Ön ayarlar */}
            <div role="radiogroup" aria-label="Kalınlık ön ayarları" className="flex items-center gap-1">
                {PEN_SIZES.map((size) => (
                    <button
                        key={size.value}
                        type="button"
                        role="radio"
                        aria-checked={width === size.value}
                        aria-label={`${size.label} (${size.value} piksel)`}
                        title={`${size.label} · ${size.value} px`}
                        onClick={() => setWidth(size.value)}
                        className={cn(
                            'flex-1 h-9 rounded-lg flex items-center justify-center transition-all border',
                            width === size.value
                                ? 'bg-[#2d3045] border-indigo-500/70 ring-1 ring-indigo-500/50'
                                : 'border-transparent hover:bg-white/10'
                        )}
                    >
                        <span
                            className={cn(
                                'rounded-full transition-all',
                                width === size.value ? 'bg-white' : 'bg-slate-400'
                            )}
                            style={{ width: dotSize(size.value), height: dotSize(size.value) }}
                        />
                    </button>
                ))}
            </div>

            {/* İnce ayar */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setWidth(width - 1)}
                    disabled={width <= PEN_SIZE_MIN}
                    aria-label="Kalınlığı azalt"
                    title="Kalınlığı azalt"
                    className="w-9 h-9 shrink-0 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/15 hover:text-white transition-all flex items-center justify-center disabled:opacity-30"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <input
                    type="range"
                    min={PEN_SIZE_MIN}
                    max={PEN_SIZE_MAX}
                    step={1}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    aria-label="Kalınlık"
                    className="range-pen flex-1 h-6"
                />
                <button
                    type="button"
                    onClick={() => setWidth(width + 1)}
                    disabled={width >= PEN_SIZE_MAX}
                    aria-label="Kalınlığı artır"
                    title="Kalınlığı artır"
                    className="w-9 h-9 shrink-0 rounded-lg bg-white/[0.06] text-slate-300 hover:bg-white/15 hover:text-white transition-all flex items-center justify-center disabled:opacity-30"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
