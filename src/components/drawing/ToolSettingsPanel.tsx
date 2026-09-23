import React from 'react';
import { motion } from 'framer-motion';
import {
    Square,
    Circle,
    Triangle,
    MoveRight,
    ArrowRightLeft,
    PaintBucket,
    PenTool,
    Feather,
    Brush,
    Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DrawConfig, DrawingTool, EraserMode, PenType } from '../../types';
import { DashedLineIcon, RightTriangleIcon, SolidLineIcon } from './DrawingIcons';

export type ToolSettingsSection = 'pen' | 'eraser' | 'shape';

interface ToolSettingsPanelProps {
    section: ToolSettingsSection;
    config: DrawConfig;
    setConfig: (c: DrawConfig) => void;
    onSelectShapeTool: (tool: DrawingTool) => void;
    onPickStamp?: (emoji: string) => void;
}

const PEN_TIPS: { id: PenType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'ballpoint', label: 'Tükenmez', icon: PenTool },
    { id: 'fountain', label: 'Dolma', icon: Feather },
    { id: 'brush', label: 'Fırça', icon: Brush },
    { id: 'marker', label: 'Keçeli', icon: Sparkles },
];

const PEN_PRESETS = [1.5, 3, 5, 8];
const HIGHLIGHTER_PRESETS = [10, 16, 24, 32];
const ERASER_PRESETS = [
    { value: 8, label: 'İnce' },
    { value: 18, label: 'Orta' },
    { value: 36, label: 'Geniş' },
];
const SHAPE_PRESETS = [
    { value: 2, label: 'İnce' },
    { value: 4, label: 'Orta' },
    { value: 6, label: 'Kalın' },
];

const SHAPES_LIST: {
    id: DrawingTool;
    label: string;
    Icon?: React.ComponentType<{ className?: string }>;
    Svg?: React.ComponentType;
}[] = [
    { id: 'rect', label: 'Dikdörtgen', Icon: Square },
    { id: 'circle', label: 'Daire', Icon: Circle },
    { id: 'triangle', label: 'Üçgen', Icon: Triangle },
    { id: 'right_triangle', label: 'Dik Üçgen', Svg: RightTriangleIcon },
    { id: 'line', label: 'Düz Çizgi', Svg: SolidLineIcon },
    { id: 'arrow', label: 'Ok', Icon: MoveRight },
    { id: 'double_arrow', label: 'Çift Ok', Icon: ArrowRightLeft },
    { id: 'dashed', label: 'Kesikli Çizgi', Svg: DashedLineIcon },
];

export function ToolSettingsPanel({
    section,
    config,
    setConfig,
    onSelectShapeTool,
}: ToolSettingsPanelProps) {
    const isHighlighter = config.tool === 'highlighter';
    const penType: PenType = config.penType ?? 'ballpoint';
    const eraserMode: EraserMode = config.eraserMode ?? 'pixel';

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-label="Araç Ayarları"
            className="pointer-events-auto flex flex-col gap-3 w-[min(92vw,310px)] bg-[#1a1b26]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-2xl text-slate-200"
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* 1. KALEM & FOSFORLU BÖLÜMÜ */}
            {section === 'pen' && (
                <>
                    {/* Kalem Ucu Seçimi (Sadece Kalemde) */}
                    {!isHighlighter && (
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                                Kalem Ucu
                            </span>
                            <div className="grid grid-cols-4 gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
                                {PEN_TIPS.map((tip) => {
                                    const active = penType === tip.id;
                                    const Icon = tip.icon;
                                    return (
                                        <button
                                            key={tip.id}
                                            type="button"
                                            onClick={() => setConfig({ ...config, penType: tip.id })}
                                            className={cn(
                                                'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                                active
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span>{tip.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Kalınlık Seçimi */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {isHighlighter ? 'Fosforlu Kalınlığı' : 'Kalınlık'}
                            </span>
                            <span className="text-xs font-bold text-indigo-400 tabular-nums">
                                {config.width} px
                            </span>
                        </div>

                        {/* Ön Ayarlar */}
                        <div className="grid grid-cols-4 gap-1.5 mb-2">
                            {(isHighlighter ? HIGHLIGHTER_PRESETS : PEN_PRESETS).map((preset) => {
                                const active = config.width === preset;
                                return (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => setConfig({ ...config, width: preset })}
                                        className={cn(
                                            'py-1 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1',
                                            active
                                                ? 'bg-indigo-600/30 border-indigo-500/70 text-white ring-1 ring-indigo-500/40'
                                                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        <span
                                            className={cn('rounded-full', active ? 'bg-white' : 'bg-slate-400')}
                                            style={{
                                                width: Math.min(10, Math.max(3, preset / (isHighlighter ? 4 : 1))),
                                                height: Math.min(10, Math.max(3, preset / (isHighlighter ? 4 : 1))),
                                            }}
                                        />
                                        <span>{preset}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Kaydırıcı */}
                        <input
                            type="range"
                            min={isHighlighter ? 4 : 1}
                            max={isHighlighter ? 50 : 30}
                            step={0.5}
                            value={config.width}
                            onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
                            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                        />
                    </div>

                    {/* Yazı Akıcılığı / Titreme Engelleme (GoodNotes Stabilizatör) */}
                    {!isHighlighter && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    Yazı Akıcılığı (GoodNotes)
                                </span>
                                <span className="text-[10px] text-indigo-400 font-medium">
                                    {config.streamlineLevel === 'natural'
                                        ? 'Doğal'
                                        : config.streamlineLevel === 'calligraphy'
                                        ? 'Kaligrafi'
                                        : 'Akıcı (Önerilen)'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 text-center">
                                {[
                                    { id: 'natural', label: 'Doğal' },
                                    { id: 'smooth', label: 'Akıcı' },
                                    { id: 'calligraphy', label: 'Kaligrafi' },
                                ].map((lvl) => {
                                    const active = (config.streamlineLevel ?? 'smooth') === lvl.id;
                                    return (
                                        <button
                                            key={lvl.id}
                                            type="button"
                                            onClick={() =>
                                                setConfig({
                                                    ...config,
                                                    streamlineLevel: lvl.id as 'natural' | 'smooth' | 'calligraphy',
                                                })
                                            }
                                            className={cn(
                                                'py-1.5 rounded-lg text-xs font-semibold transition-all',
                                                active
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            )}
                                        >
                                            {lvl.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Akıllı Kalem (Şekil Tanıma) */}
                    {!isHighlighter && (
                        <div className="pt-2 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, snapShapes: !config.snapShapes })}
                                className={cn(
                                    'w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left',
                                    config.snapShapes
                                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                                        : 'bg-white/[0.03] border-white/10 hover:bg-white/5 text-slate-300'
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <div>
                                        <span className="block text-xs font-semibold leading-none">
                                            Şekil Tanıma
                                        </span>
                                        <span className="block text-[10px] text-slate-400 mt-0.5">
                                            Çiz ve bekle (düzgün şekle çevir)
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'w-8 h-4.5 rounded-full p-0.5 transition-colors relative',
                                        config.snapShapes ? 'bg-indigo-600' : 'bg-white/20'
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'w-3.5 h-3.5 rounded-full bg-white transition-transform',
                                            config.snapShapes ? 'translate-x-3.5' : 'translate-x-0'
                                        )}
                                    />
                                </div>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* 2. SİLGİ BÖLÜMÜ */}
            {section === 'eraser' && (
                <>
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                            Silgi Türü
                        </span>
                        <div className="grid grid-cols-2 gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, eraserMode: 'pixel' })}
                                className={cn(
                                    'py-1.5 rounded-lg text-xs font-semibold transition-all text-center',
                                    eraserMode === 'pixel'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                Piksel Silgisi
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, eraserMode: 'stroke' })}
                                className={cn(
                                    'py-1.5 rounded-lg text-xs font-semibold transition-all text-center',
                                    eraserMode === 'stroke'
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                )}
                            >
                                Çizgi Silgisi
                            </button>
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-1 px-1">
                            {eraserMode === 'pixel'
                                ? 'Dokunulan yeri siler'
                                : 'Dokunulan çizginin tamamını siler'}
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Silgi Boyutu
                            </span>
                            <span className="text-xs font-bold text-indigo-400 tabular-nums">
                                {config.width} px
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 mb-2">
                            {ERASER_PRESETS.map((preset) => {
                                const active = config.width === preset.value;
                                return (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => setConfig({ ...config, width: preset.value })}
                                        className={cn(
                                            'py-1 rounded-lg text-xs font-semibold border transition-all text-center',
                                            active
                                                ? 'bg-indigo-600/30 border-indigo-500/70 text-white ring-1 ring-indigo-500/40'
                                                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>

                        <input
                            type="range"
                            min={4}
                            max={60}
                            step={1}
                            value={config.width}
                            onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
                            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                        />
                    </div>
                </>
            )}

            {/* 3. ŞEKİLLER BÖLÜMÜ */}
            {section === 'shape' && (
                <>
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                            2B Geometrik Şekiller
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                            {SHAPES_LIST.map((shape) => {
                                const active = config.tool === shape.id;
                                const Icon = shape.Icon;
                                const Svg = shape.Svg;
                                return (
                                    <button
                                        key={shape.id}
                                        type="button"
                                        onClick={() => onSelectShapeTool(shape.id)}
                                        title={shape.label}
                                        className={cn(
                                            'h-10 rounded-xl border flex items-center justify-center transition-all',
                                            active
                                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                                                : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        {Icon ? <Icon className="w-5 h-5" /> : Svg ? <Svg /> : null}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, fillEnabled: !config.fillEnabled })}
                            className={cn(
                                'w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left',
                                config.fillEnabled
                                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                                    : 'bg-white/[0.03] border-white/10 hover:bg-white/5 text-slate-300'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                <PaintBucket className="w-4 h-4 text-indigo-400" />
                                <div>
                                    <span className="block text-xs font-semibold leading-none">
                                        Şekil Dolgusu
                                    </span>
                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                        İçini yarı saydam renkle doldur
                                    </span>
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'w-8 h-4.5 rounded-full p-0.5 transition-colors relative',
                                    config.fillEnabled ? 'bg-indigo-600' : 'bg-white/20'
                                )}
                            >
                                <div
                                    className={cn(
                                        'w-3.5 h-3.5 rounded-full bg-white transition-transform',
                                        config.fillEnabled ? 'translate-x-3.5' : 'translate-x-0'
                                    )}
                                />
                            </div>
                        </button>
                    </div>

                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                            Çizgi Kalınlığı
                        </span>
                        <div className="grid grid-cols-3 gap-1.5">
                            {SHAPE_PRESETS.map((preset) => {
                                const active = config.width === preset.value;
                                return (
                                    <button
                                        key={preset.value}
                                        type="button"
                                        onClick={() => setConfig({ ...config, width: preset.value })}
                                        className={cn(
                                            'py-1.5 rounded-lg text-xs font-semibold border transition-all text-center',
                                            active
                                                ? 'bg-indigo-600/30 border-indigo-500/70 text-white ring-1 ring-indigo-500/40'
                                                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        {preset.label} ({preset.value}px)
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
}
