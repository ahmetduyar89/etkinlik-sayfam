import React from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
    Camera,
    GripVertical,
    Grid,
    PaintBucket,
    Shapes,
    StickyNote,
    Trash2,
    Undo,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DrawConfig, DrawingTool } from '../../types';
import {
    BG_COLORS,
    DRAWING_COLORS,
    DRAWING_WIDTHS,
    MAIN_TOOLS,
    SHAPE_TOOL_IDS,
    STAMP_CATEGORIES,
    makeShapeTools,
} from '../../constants/drawing';
import { DashedLineIcon, SolidLineIcon } from './DrawingIcons';

export type ToolbarCommand = 'UNDO_DRAWING' | 'CLEAR_DRAWING' | 'TOGGLE_WHITEBOARD';

interface DrawingToolbarProps {
    onCommand: (type: ToolbarCommand) => void;
    config: DrawConfig;
    setConfig: (c: DrawConfig) => void;
    showWhiteboard?: boolean;
    setShowWhiteboard?: (val: boolean) => void;
    bgColor?: string;
    onBgColorChange?: (c: string) => void;
    onScreenshot?: () => void;
    isTextBoxMode?: boolean;
    onTextBoxModeToggle?: () => void;
}

const shapeTools = makeShapeTools(SolidLineIcon, DashedLineIcon);

export function DrawingToolbar({
    onCommand,
    config,
    setConfig,
    showWhiteboard,
    setShowWhiteboard,
    bgColor,
    onBgColorChange,
    onScreenshot,
    isTextBoxMode,
    onTextBoxModeToggle,
}: DrawingToolbarProps) {
    const [showShapes, setShowShapes] = React.useState(false);
    const [showExtras, setShowExtras] = React.useState(false);
    const dragControls = useDragControls();

    const isShapeTool =
        SHAPE_TOOL_IDS.includes(config.tool) || config.tool === 'stamp';

    const selectTool = (tool: DrawingTool) => {
        setConfig({ ...config, tool });
        setShowShapes(false);
    };

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            initial={{ left: '50%', x: '-50%', y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            role="toolbar"
            aria-label="Çizim araç çubuğu"
            className="fixed bottom-10 z-[5000] flex flex-col items-center gap-3 pointer-events-auto"
            style={{ touchAction: 'none' }}
        >
            <AnimatePresence>
                {showShapes && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="flex flex-col gap-2 bg-[#1a1b26]/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-medium w-12 shrink-0">
                                Şekil
                            </span>
                            <div className="flex items-center gap-0.5">
                                {shapeTools.map((tool) => (
                                    <button
                                        key={tool.id}
                                        type="button"
                                        onClick={() => selectTool(tool.id)}
                                        title={tool.label}
                                        aria-label={tool.label}
                                        className={cn(
                                            'p-2 rounded-xl transition-all',
                                            config.tool === tool.id
                                                ? 'bg-[#2d3045] text-white'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {tool.Icon ? (
                                            <tool.Icon className="w-5 h-5" />
                                        ) : tool.Svg ? (
                                            <tool.Svg />
                                        ) : null}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setConfig({ ...config, fillEnabled: !config.fillEnabled })
                                    }
                                    title="Şekli Doldur"
                                    aria-label="Şekli Doldur"
                                    aria-pressed={config.fillEnabled}
                                    className={cn(
                                        'p-2 rounded-xl transition-all ml-1 border',
                                        config.fillEnabled
                                            ? 'bg-indigo-600/40 text-indigo-300 border-indigo-500/50'
                                            : 'text-slate-500 hover:text-white hover:bg-white/5 border-white/10'
                                    )}
                                >
                                    <PaintBucket className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {STAMP_CATEGORIES.map((cat) => (
                            <div key={cat.label} className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-medium w-12 shrink-0">
                                    {cat.label}
                                </span>
                                <div className="flex items-center gap-0.5 flex-wrap">
                                    {cat.items.map((stamp) => (
                                        <button
                                            key={stamp.emoji}
                                            type="button"
                                            onClick={() => {
                                                setConfig({
                                                    ...config,
                                                    tool: 'stamp',
                                                    stampIcon: stamp.emoji,
                                                });
                                                setShowShapes(false);
                                            }}
                                            title={stamp.label}
                                            aria-label={`${cat.label}: ${stamp.label}`}
                                            className={cn(
                                                'w-9 h-9 rounded-xl text-xl transition-all hover:bg-white/10 flex items-center justify-center',
                                                config.tool === 'stamp' &&
                                                    config.stampIcon === stamp.emoji
                                                    ? 'bg-[#2d3045] ring-2 ring-indigo-500'
                                                    : ''
                                            )}
                                        >
                                            {stamp.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-1 bg-[#1a1b26] p-1.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-300">
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="p-2.5 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing border-r border-white/10"
                    title="Taşı"
                    aria-label="Araç çubuğunu taşı"
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-0.5 px-2 border-r border-white/10">
                    {MAIN_TOOLS.map((tool) => (
                        <button
                            key={tool.id}
                            type="button"
                            onClick={() => selectTool(tool.id)}
                            title={tool.label}
                            aria-label={tool.label}
                            aria-pressed={config.tool === tool.id}
                            className={cn(
                                'p-2.5 rounded-xl transition-all duration-200 group relative',
                                config.tool === tool.id
                                    ? 'bg-[#2d3045] text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <tool.icon className="w-5 h-5" />
                            {config.tool === tool.id && (
                                <motion.div
                                    layoutId="activeTool"
                                    className="absolute inset-0 border-2 border-emerald-500/50 rounded-xl pointer-events-none"
                                />
                            )}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => setShowShapes(!showShapes)}
                        aria-label="Şekiller ve damgalar"
                        aria-expanded={showShapes}
                        className={cn(
                            'p-2.5 rounded-xl transition-all duration-200 relative',
                            isShapeTool
                                ? 'bg-[#2d3045] text-indigo-400'
                                : 'text-slate-400 hover:text-white hover:bg-white/5',
                            showShapes ? 'bg-white/10 text-white' : ''
                        )}
                        title="Şekiller & Damgalar"
                    >
                        {config.tool === 'stamp' ? (
                            <span className="text-xl leading-none">
                                {config.stampIcon || '✅'}
                            </span>
                        ) : (
                            <Shapes className="w-5 h-5" />
                        )}
                        {isShapeTool && config.tool !== 'stamp' && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-[#1a1b26]" />
                        )}
                    </button>
                </div>

                <div
                    role="radiogroup"
                    aria-label="Renk"
                    className="flex items-center gap-2 px-4 border-r border-white/10"
                >
                    {DRAWING_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            role="radio"
                            aria-checked={config.color === color}
                            aria-label={`Renk ${color}`}
                            onClick={() => setConfig({ ...config, color })}
                            className={cn(
                                'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                                config.color === color
                                    ? 'border-white scale-110'
                                    : 'border-transparent'
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>

                <div
                    role="radiogroup"
                    aria-label="Kalınlık"
                    className="flex items-center gap-3 px-4 border-r border-white/10"
                >
                    {DRAWING_WIDTHS.map((size) => (
                        <button
                            key={size}
                            type="button"
                            role="radio"
                            aria-checked={config.width === size}
                            aria-label={`${size} piksel`}
                            onClick={() => setConfig({ ...config, width: size })}
                            className={cn(
                                'rounded-full bg-slate-400 transition-all hover:bg-white',
                                config.width === size
                                    ? 'bg-white scale-125 ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#1a1b26]'
                                    : 'hover:scale-110'
                            )}
                            style={{ width: size + 4 + 'px', height: size + 4 + 'px' }}
                            title={`${size}px`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-1.5 px-2 border-r border-white/10">
                    <button
                        type="button"
                        onClick={() => onCommand('UNDO_DRAWING')}
                        aria-label="Geri Al"
                        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                        title="Geri Al"
                    >
                        <Undo className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onCommand('CLEAR_DRAWING')}
                        aria-label="Çizimi Temizle"
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Temizle"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    {setShowWhiteboard && (
                        <button
                            type="button"
                            onClick={() => onCommand('TOGGLE_WHITEBOARD')}
                            aria-label="Yazı Tahtası"
                            aria-pressed={showWhiteboard}
                            className={cn(
                                'p-2.5 rounded-xl transition-all',
                                showWhiteboard
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Yazı Tahtası"
                        >
                            <Grid className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 px-2">
                    {onTextBoxModeToggle && (
                        <button
                            type="button"
                            onClick={onTextBoxModeToggle}
                            aria-label="Metin kutusu ekle"
                            aria-pressed={isTextBoxMode}
                            className={cn(
                                'p-2.5 rounded-xl transition-all',
                                isTextBoxMode
                                    ? 'bg-amber-500 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Metin Kutusu Ekle"
                        >
                            <StickyNote className="w-5 h-5" />
                        </button>
                    )}
                    {onScreenshot && (
                        <button
                            type="button"
                            onClick={onScreenshot}
                            aria-label="Çizimi PNG olarak indir"
                            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                            title="Çizimi PNG Olarak İndir"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    )}
                    {onBgColorChange && (
                        <button
                            type="button"
                            onClick={() => setShowExtras((s) => !s)}
                            aria-label="Arka plan rengi"
                            aria-expanded={showExtras}
                            className={cn(
                                'p-2.5 rounded-xl transition-all relative',
                                showExtras
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Arka Plan Rengi"
                        >
                            <div
                                className="w-5 h-5 rounded-full border-2 border-white/40"
                                style={{ backgroundColor: bgColor || '#ffffff' }}
                            />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showExtras && onBgColorChange && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        role="radiogroup"
                        aria-label="Arka Plan"
                        className="flex items-center gap-2 bg-[#1a1b26]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">
                            Arka Plan
                        </span>
                        {BG_COLORS.map(({ color, label }) => (
                            <button
                                key={color}
                                type="button"
                                role="radio"
                                aria-checked={(bgColor || '#ffffff') === color}
                                onClick={() => onBgColorChange(color)}
                                className={cn(
                                    'w-7 h-7 rounded-full border-2 transition-all hover:scale-110 shrink-0',
                                    (bgColor || '#ffffff') === color
                                        ? 'border-white scale-110'
                                        : 'border-transparent'
                                )}
                                style={{ backgroundColor: color }}
                                title={label}
                                aria-label={label}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
