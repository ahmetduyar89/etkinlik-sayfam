import React from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
    Camera,
    GripVertical,
    Grid,
    ImagePlus,
    Loader2,
    Minus,
    Plus,
    Redo,
    Shapes,
    Sparkles,
    StickyNote,
    Trash2,
    Undo,
    FlaskConical,
    Scale,
    Dna,
    TrendingUp,
    Type,
    FileText,
    Atom,
    Maximize2,
    Minimize2,
    Ruler,
    Compass,
    Triangle,
    Scan,
    PanelTop,
    PanelBottom,
    BookOpen,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Italic,
    MousePointer2,
    PenTool,
    Pencil as PencilIcon,
    Highlighter,
    Eraser,
    Lasso,
    RectangleHorizontal,
    ChevronDown,
    Check,
    Square,
    Circle,
    Diamond,
    Star,
    MoveRight,
    RotateCcw,
    SlidersHorizontal,
    Eye,
    EyeOff,
    Palette,
    Hand,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DrawConfig, DrawingTool, MathObject, PaperStyle, RulerKind } from '../../types';
import { BG_COLORS, SHAPE_TOOL_IDS } from '../../constants/drawing';
import {
    TOOLBAR_DENSITY_LABELS,
    useToolbarScale,
} from '../../hooks/useToolbarScale';
import { ObjectLibraryPanel } from './ObjectLibraryPanel';
import {
    ToolSettingsPanel,
    type ToolSettingsSection,
} from './ToolSettingsPanel';
import { ColorPalettePanel } from './ColorPalettePanel';
import { InkToolMemory } from './InkEngine/toolMemory';

export type ToolbarCommand =
    | 'UNDO_DRAWING'
    | 'REDO_DRAWING'
    | 'CLEAR_DRAWING'
    | 'TOGGLE_WHITEBOARD';

interface DrawingToolbarProps {
    onCommand: (type: ToolbarCommand) => void;
    config: DrawConfig;
    setConfig: (c: DrawConfig) => void;
    fixed?: boolean;
    showWhiteboard?: boolean;
    setShowWhiteboard?: (val: boolean) => void;
    bgColor?: string;
    onBgColorChange?: (c: string) => void;
    paper?: PaperStyle;
    onPaperChange?: (p: PaperStyle) => void;
    onScreenshot?: () => void;
    isTextBoxMode?: boolean;
    onTextBoxModeToggle?: () => void;
    onOpenLibrary?: () => void;
    isLibraryOpen?: boolean;
    onInsertMath?: (math: MathObject) => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onInsertImages?: (files: FileList | File[]) => void;
    isInsertingImage?: boolean;
    zoom?: number;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onZoomReset?: () => void;
    onZoomFit?: () => void;
    onSelectTool?: (toolId: string) => void;
}

type PanelId = 'settings' | 'shapes' | 'colors' | 'math' | 'lab' | 'extras' | 'penType' | 'eraserMode' | 'penWidth';

const RULER_LABELS: Record<RulerKind | 'off', string> = {
    off: 'Kapalı',
    ruler: 'Cetvel',
    setsquare: 'Gönye',
    protractor: 'Açıölçer',
};

function sectionForTool(tool: DrawingTool): ToolSettingsSection | null {
    if (tool === 'pencil' || tool === 'highlighter') return 'pen';
    if (tool === 'eraser') return 'eraser';
    if (SHAPE_TOOL_IDS.includes(tool) || tool === 'stamp') return 'shape';
    return null;
}

const PEN_NAMES: Record<string, string> = {
    marker: 'Tahta Kalemi',
    ballpoint: 'Tükenmez',
    fountain: 'Dolma',
    brush: 'Fırça',
    calligraphy: 'Kaligrafi',
    graphite: 'Kurşun',
};

// Goodnotes signature standard palette
const GOODNOTES_PEN_COLORS = ['#0f172a', '#2563eb', '#dc2626', '#16a34a', '#d97706'];
const GOODNOTES_HIGHLIGHTER_COLORS = ['#fef08a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#fed7aa'];
const GOODNOTES_TAPE_COLORS = [
    { id: '#facc15', label: 'Sarı' },
    { id: '#f472b6', label: 'Pembe' },
    { id: '#60a5fa', label: 'Mavi' },
    { id: '#4ade80', label: 'Yeşil' },
];

export function DrawingToolbar({
    onCommand,
    config,
    setConfig,
    fixed = false,
    showWhiteboard,
    setShowWhiteboard,
    bgColor,
    onBgColorChange,
    paper,
    onPaperChange,
    onScreenshot,
    isTextBoxMode,
    onTextBoxModeToggle,
    onOpenLibrary,
    isLibraryOpen,
    onInsertMath,
    canUndo,
    canRedo,
    onInsertImages,
    isInsertingImage,
    zoom,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onZoomFit,
    onSelectTool,
}: DrawingToolbarProps) {
    const toolMemoryRef = React.useRef(new InkToolMemory());
    React.useEffect(() => {
        toolMemoryRef.current.remember(config);
    }, [config]);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [panel, setPanel] = React.useState<PanelId | null>(null);
    const [penWidthSliderOpen, setPenWidthSliderOpen] = React.useState(false);
    const [dockPosition, setDockPosition] = React.useState<'bottom' | 'top'>(() => {
        try {
            return (localStorage.getItem('notebook_toolbar_dock') as 'bottom' | 'top') || 'bottom';
        } catch {
            return 'bottom';
        }
    });

    const toggleDock = () => {
        setDockPosition((prev) => {
            const next = prev === 'bottom' ? 'top' : 'bottom';
            try {
                localStorage.setItem('notebook_toolbar_dock', next);
            } catch {
                /* no-op */
            }
            return next;
        });
    };

    const [contextualCollapsed, setContextualCollapsed] = React.useState<boolean>(() => {
        try {
            return localStorage.getItem('notebook_contextual_collapsed') === 'true';
        } catch {
            return false;
        }
    });

    const toggleContextual = () => {
        setContextualCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('notebook_contextual_collapsed', String(next));
            } catch {
                /* no-op */
            }
            return next;
        });
    };

    const dragControls = useDragControls();
    const barRef = React.useRef<HTMLDivElement>(null);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const { density, cycleDensity } = useToolbarScale(barRef);

    const showMath = panel === 'math';
    const showLab = panel === 'lab';
    const showExtras = panel === 'extras';

    const openOnly = (which: PanelId | null) => setPanel(which);

    const isShapeTool = SHAPE_TOOL_IDS.includes(config.tool) || config.tool === 'stamp';
    const settingsSection: ToolSettingsSection =
        panel === 'shapes' ? 'shape' : sectionForTool(config.tool) ?? 'pen';
    const settingsOpen = panel === 'settings' || panel === 'shapes';

    const toggleColors = () => setPanel((prev) => (prev === 'colors' ? null : 'colors'));

    /**
     * Goodnotes & Notability aracı seçimi:
     * - Cetvel (ruler) seçili araç değişimlerinde KORUNUR.
     * - Aktif araca tekrar tıklandığında ayar paneli açılır/kapanır.
     */
    const selectTool = (tool: DrawingTool) => {
        if (config.tool === tool) {
            const section = sectionForTool(tool);
            if (section) {
                setPanel((prev) => (prev === 'settings' ? null : 'settings'));
            }
        } else {
            const next = toolMemoryRef.current.select(config, tool);
            // KURAL: Cetvel açıkken araç değişirse cetvel ASLA kapanmaz.
            if (config.ruler) {
                next.ruler = config.ruler;
            }
            setConfig(next);
            setPanel(null);
            setPenWidthSliderOpen(false);
        }
    };

    /** Kalem ucu değiştirme */
    const changePenType = (penType: DrawConfig['penType']) => {
        setConfig({
            ...config,
            tool: 'pencil',
            penType,
        });
        setPanel(null);
    };

    /** Şekil aracı değiştirme */
    const selectShape = (tool: DrawingTool) => {
        setConfig({ ...config, tool });
    };

    /** Cetvel döngüsü */
    const cycleRuler = () => {
        const order: (RulerKind | null)[] = [null, 'ruler', 'setsquare', 'protractor'];
        const at = order.indexOf(config.ruler ?? null);
        const nextRuler = order[(at + 1) % order.length];
        setConfig({ ...config, ruler: nextRuler });
    };

    // Dışarı tıklandığında açık popover'ları kapat
    React.useEffect(() => {
        if (!panel && !penWidthSliderOpen) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) {
                setPanel(null);
                setPenWidthSliderOpen(false);
            }
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [panel, penWidthSliderOpen]);

    // Klavye kısayolları
    React.useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const target = e.target as HTMLElement | null;
            if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
            if (target?.isContentEditable) return;

            const key = e.key.toLowerCase();
            if (key === 'p') selectTool('pencil');
            else if (key === 'e') selectTool('eraser');
            else if (key === 'h') selectTool('highlighter');
            else if (key === 's') selectTool('rect');
            else if (key === 'v') selectTool('select');
            else if (key === 't') selectTool('text');
            else if (key === 'l' && !e.shiftKey) selectTool('sun');
            else if (key === 'k') {
                if (onOpenLibrary) onOpenLibrary();
                else if (onInsertMath) openOnly(panel === 'math' ? null : 'math');
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [panel, config, onInsertMath, onOpenLibrary]);

    // Popover paneller
    const popovers = (
        <>
            {onInsertMath && (
                <div className={cn('pointer-events-none z-[5001]', fixed ? 'absolute top-2 left-1/2 -translate-x-1/2' : 'relative')}>
                    <ObjectLibraryPanel
                        open={showMath}
                        onClose={() => setPanel(null)}
                        onInsert={onInsertMath}
                        onSelectTool={onSelectTool}
                    />
                </div>
            )}

            <AnimatePresence>
                {panel === 'colors' && (
                    <div className={cn('pointer-events-none z-[5001]', fixed ? 'absolute top-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-48' : 'relative')}>
                        <ColorPalettePanel config={config} setConfig={setConfig} />
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {settingsOpen && (
                    <div className={cn('pointer-events-none z-[5001]', fixed ? 'absolute top-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-24' : 'relative')}>
                        <ToolSettingsPanel
                            section={settingsSection}
                            config={config}
                            setConfig={setConfig}
                            onSelectShapeTool={selectShape}
                            onPickStamp={(emoji) => {
                                setConfig({ ...config, tool: 'stamp', stampIcon: emoji });
                                setPanel(null);
                            }}
                        />
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {penWidthSliderOpen && (
                    <div className={cn('pointer-events-none z-[5001]', fixed ? 'absolute top-2 left-1/2 -translate-x-1/2' : 'relative')}>
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            className="pointer-events-auto flex flex-col gap-2 p-3 rounded-2xl bg-[#1a1b26]/95 backdrop-blur-xl border border-white/10 shadow-2xl w-64 text-slate-200"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span>Kalınlık Ayarı</span>
                                <span className="text-sky-400 font-bold">{config.width}px</span>
                            </div>
                            <input
                                type="range"
                                min={config.tool === 'highlighter' ? 4 : 0.5}
                                max={config.tool === 'highlighter' ? 48 : 24}
                                step={0.5}
                                value={config.width}
                                onChange={(e) => setConfig({ ...config, width: Number(e.target.value) })}
                                className="w-full accent-sky-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>İnce</span>
                                <span>Orta</span>
                                <span>Kalın</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLab && (
                    <div className={cn('pointer-events-none z-[5001]', fixed ? 'absolute top-2 right-4 sm:right-24' : 'relative')}>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="pointer-events-auto flex flex-col gap-2.5 max-h-[68vh] overflow-y-auto bg-[#161826]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-indigo-500/30 shadow-2xl w-[min(94vw,560px)]"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
                                        <FlaskConical className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                        Dinamik Laboratuvar & Branş Araçları
                                    </span>
                                </div>
                                <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                    Canlı Deney
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectTool?.('moleculeBuilder');
                                        setPanel(null);
                                    }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-indigo-600/25 border border-white/10 hover:border-indigo-500/50 text-left transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Atom className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-indigo-200">
                                            Molekül İnşa Laboratuvarı
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            PhET standardı kovalent bağ, manyetik kenetlenme & 3D model
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectTool?.('simpleMachines');
                                        setPanel(null);
                                    }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-indigo-600/25 border border-white/10 hover:border-indigo-500/50 text-left transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Scale className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-indigo-200">
                                            Basit Makineler Laboratuvarı
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            Kaldıraç, makara, palanga, eğik düzlem ve çıkrık
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectTool?.('dnaGenetics');
                                        setPanel(null);
                                    }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 text-left transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Dna className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-purple-200">
                                            DNA, Genetik & Çaprazlama
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            Punnett karesi, fenotip oranları ve nükleotid bulmacası
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectTool?.('linearGraph');
                                        setPanel(null);
                                    }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-blue-600/25 border border-white/10 hover:border-blue-500/50 text-left transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-blue-200">
                                            Doğrusal Denklem & Grafik Damgası
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            y = mx + n doğrusu, eğim dik üçgeni ve kesişimler
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectTool?.('mathFormula');
                                        setPanel(null);
                                    }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-600/25 border border-white/10 hover:border-emerald-500/50 text-left transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Type className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-emerald-200">
                                            Formül & LaTeX Editörü
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            Kesirler, karekök, üs ve kimyasal reaksiyon okları
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelectTool?.('geogebra');
                                        setPanel(null);
                                    }}
                                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-indigo-600/25 border border-white/10 hover:border-indigo-500/50 text-left transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-indigo-200">
                                            GeoGebra Studio
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            Klasik Geometri, Fonksiyonlar, 3D Geometri ve CAS
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showExtras && (onBgColorChange || onPaperChange) && (
                    <div className={cn('pointer-events-none z-[5001]', fixed ? 'absolute top-2 right-4 sm:right-24' : 'relative')}>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="pointer-events-auto flex flex-col gap-2.5 bg-[#1a1b26]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl max-w-[95vw]"
                            onPointerDown={(e) => e.stopPropagation()}
                        >
                            {onBgColorChange && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0 w-16">
                                        Zemin
                                    </span>
                                    <div role="radiogroup" aria-label="Arka Plan Rengi" className="flex items-center gap-1.5 flex-wrap">
                                        {BG_COLORS.map(({ color, label }) => (
                                            <button
                                                key={color}
                                                type="button"
                                                role="radio"
                                                aria-checked={bgColor === color}
                                                onClick={() => onBgColorChange(color)}
                                                className={cn(
                                                    'w-5 h-5 rounded-full border transition-all',
                                                    bgColor === color
                                                        ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-110'
                                                        : 'border-white/30 hover:scale-105'
                                                )}
                                                style={{ backgroundColor: color }}
                                                title={label}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-white/10">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
                                    Izgaraya Hizalama
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setConfig({ ...config, snapToGrid: !config.snapToGrid })}
                                    className={cn(
                                        'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                                        config.snapToGrid
                                            ? 'bg-emerald-600/90 text-white shadow-sm'
                                            : 'bg-white/5 text-slate-400 hover:text-slate-200'
                                    )}
                                >
                                    <Grid className="w-3.5 h-3.5" />
                                    <span>{config.snapToGrid ? 'Açık' : 'Kapalı'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );

    /* ------------------------------------------------------------- */
    /* 1. TIER 1: ANA ARAÇ ÇUBUĞU (Kompakt, Taşmayan Goodnotes Kapsülü) */
    /* ------------------------------------------------------------- */
    const isPen = config.tool === 'pencil';
    const isEraser = config.tool === 'eraser';
    const isHighlighter = config.tool === 'highlighter';
    const isLasso = config.tool === 'lasso';
    const isTape = config.tool === 'tape';
    const isText = config.tool === 'text';
    const isLaser = config.tool === 'sun';
    const isPan = config.tool === 'pan';
    const isSelect = config.tool === 'select';

    const hasContextualContent = Boolean(
        isPen ||
        isEraser ||
        isHighlighter ||
        isShapeTool ||
        isTape ||
        isText ||
        isLasso ||
        (config.ruler && !isPen && !isEraser && !isShapeTool && !isHighlighter && !isTape && !isText && !isLasso)
    );

    const mainToolsTier1 = (
        <div className="grid grid-cols-[auto_1fr_auto] items-center w-full max-w-[1400px] px-2 sm:px-4 py-1 mx-auto gap-2">
            {/* Sol: Sürükleme Tutamacı & Goodnotes Geri / İleri Al Kapsülü */}
            <div className="flex items-center justify-start gap-1.5 min-w-0 shrink-0">
                {!fixed && (
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="p-1.5 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing border-r border-white/10 shrink-0"
                        title="Taşı"
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                )}
                <div className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl p-0.5 shadow-sm shrink-0">
                    <button
                        type="button"
                        onClick={() => onCommand('UNDO_DRAWING')}
                        disabled={canUndo === false}
                        title="Geri Al (Ctrl+Z)"
                        className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-25 disabled:hover:bg-transparent"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <div className="w-px h-3.5 bg-white/10 mx-0.5" />
                    <button
                        type="button"
                        onClick={() => onCommand('REDO_DRAWING')}
                        disabled={canRedo === false}
                        title="İleri Al (Ctrl+Shift+Z)"
                        className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-25 disabled:hover:bg-transparent"
                    >
                        <Redo className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Orta Kapsül: Birincil Araçlar (Taşma yapmaz, tam ortalanmış Goodnotes kapsülü) */}
            <div className="flex items-center justify-center">
                <div className="flex items-center bg-[#1e2030]/80 border border-white/10 rounded-2xl p-1 shadow-md shrink-0 gap-0.5 sm:gap-1">
                {/* 1. Seçim (V) */}
                <button
                    type="button"
                    onClick={() => selectTool('select')}
                    title="Seç & Düzenle (V)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isSelect ? 'bg-[#2f334d] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <MousePointer2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 2. Kalem (P) - Tükenmez/Dolma/Fırça/Kurşun kapsayıcı */}
                <button
                    type="button"
                    onClick={() => selectTool('pencil')}
                    title="Kalem (P) - Ayarlar için tekrar tıklayın"
                    className={cn(
                        'p-2 rounded-xl transition-all relative group',
                        isPen ? 'bg-[#2f334d] text-sky-300 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <PenTool className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    <span
                        className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full border border-[#1a1b26]"
                        style={{ backgroundColor: config.color }}
                    />
                </button>

                {/* 3. Silgi (E) */}
                <button
                    type="button"
                    onClick={() => selectTool('eraser')}
                    title="Silgi (E)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isEraser ? 'bg-[#2f334d] text-rose-300 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Eraser className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 4. Fosforlu Kalem (H) */}
                <button
                    type="button"
                    onClick={() => selectTool('highlighter')}
                    title="Fosforlu Kalem (H)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isHighlighter ? 'bg-[#2f334d] text-yellow-300 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Highlighter className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 5. Şekiller (S) */}
                <button
                    type="button"
                    onClick={() => selectTool(isShapeTool ? config.tool : 'rect')}
                    title="Şekiller (S)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isShapeTool ? 'bg-[#2f334d] text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Shapes className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 6. Kement (Lasso) */}
                <button
                    type="button"
                    onClick={() => selectTool('lasso')}
                    title="Kement (Çoklu Seçim)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isLasso ? 'bg-[#2f334d] text-purple-300 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Lasso className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 7. Çalışma Bandı (Tape - Active Recall) */}
                <button
                    type="button"
                    onClick={() => selectTool('tape')}
                    title="Çalışma Bandı (Active Recall)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isTape ? 'bg-[#2f334d] text-amber-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <RectangleHorizontal className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 8. Metin (T) */}
                <button
                    type="button"
                    onClick={() => selectTool('text')}
                    title="Metin (T)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isText ? 'bg-[#2f334d] text-emerald-300 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Type className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 9. Cetvel & Gönye (Ruler) */}
                <button
                    type="button"
                    onClick={cycleRuler}
                    title={`Ölçü Aracı: ${RULER_LABELS[config.ruler ?? 'off']} (tıklayarak değiştirin)`}
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        config.ruler ? 'bg-indigo-600/40 text-indigo-300 ring-1 ring-indigo-400/50 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    {config.ruler === 'protractor' ? (
                        <Compass className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    ) : config.ruler === 'setsquare' ? (
                        <Triangle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    ) : (
                        <Ruler className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                    )}
                </button>

                {/* 10. Lazer (L) */}
                <button
                    type="button"
                    onClick={() => selectTool('sun')}
                    title="Lazer İşaretçi (L)"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isLaser ? 'bg-[#2f334d] text-rose-400 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Sparkles className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* 11. El / Kaydır (Pan) */}
                <button
                    type="button"
                    onClick={() => selectTool('pan')}
                    title="Kaydır / El"
                    className={cn(
                        'p-2 rounded-xl transition-all relative',
                        isPan ? 'bg-[#2f334d] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Hand className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>
            </div>
            </div>

            {/* Sağ Yardımcılar: Kütüphane, Dinamik Laboratuvar, Fotoğraf, Zoom */}
            <div className="flex items-center justify-end gap-1 shrink-0">
                {(onOpenLibrary || onInsertMath) && (
                    <button
                        type="button"
                        onClick={() => {
                            if (onOpenLibrary) onOpenLibrary();
                            else if (onInsertMath) openOnly(showMath ? null : 'math');
                        }}
                        title="Kütüphane (K)"
                        className={cn(
                            'p-2 rounded-xl transition-all flex items-center gap-1.5',
                            (isLibraryOpen || showMath) ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="text-xs font-semibold hidden md:inline">Kütüphane</span>
                    </button>
                )}

                {onSelectTool && (
                    <button
                        type="button"
                        onClick={() => openOnly(showLab ? null : 'lab')}
                        title="Laboratuvar & Branş Araçları"
                        className={cn(
                            'p-2 rounded-xl transition-all relative',
                            showLab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10'
                        )}
                    >
                        <FlaskConical className="w-4 h-4" />
                    </button>
                )}

                {onInsertImages && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.length) onInsertImages(e.target.files);
                                e.target.value = '';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isInsertingImage}
                            title="Fotoğraf Ekle"
                            className="p-2 rounded-xl text-slate-400 hover:text-sky-300 hover:bg-sky-400/10 transition-all disabled:opacity-40"
                        >
                            {isInsertingImage ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ImagePlus className="w-4 h-4" />
                            )}
                        </button>
                    </>
                )}

                {setShowWhiteboard && (
                    <button
                        type="button"
                        onClick={() => onCommand('TOGGLE_WHITEBOARD')}
                        title="Yazı Tahtası"
                        className={cn(
                            'p-2 rounded-xl transition-all',
                            showWhiteboard ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                )}

                {onScreenshot && (
                    <button
                        type="button"
                        onClick={onScreenshot}
                        title="Sayfayı PNG Olarak İndir"
                        className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                )}

                {/* Zoom Kontrolleri (Fixed modunda) */}
                {fixed && onZoomIn && onZoomOut && (
                    <div className="flex items-center gap-0.5 pl-1 ml-1 border-l border-white/10" role="group" aria-label="Yakınlaştırma">
                        <button
                            type="button"
                            onClick={onZoomOut}
                            title="Uzaklaştır"
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                        {onZoomFit && (
                            <button
                                type="button"
                                onClick={onZoomFit}
                                title="Sayfaya Sığdır"
                                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <Scan className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onZoomReset}
                            title="%100"
                            className="px-1 text-[11px] font-bold text-slate-300 hover:text-white tabular-nums"
                        >
                            %{Math.round((zoom ?? 1) * 100)}
                        </button>
                        <button
                            type="button"
                            onClick={onZoomIn}
                            title="Yakınlaştır"
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                {/* Sağ: Yoğunluk / Boyut Değiştirici (Çift Oklu Büyütme/Küçültme) & Dock Butonu */}
                <div className="flex items-center gap-1 pl-1 ml-1 border-l border-white/10 shrink-0">
                    <button
                        type="button"
                        onClick={cycleDensity}
                        title={`Araç Çubuğu Boyutu: ${TOOLBAR_DENSITY_LABELS[density]} (Büyütmek/küçültmek için tıklayın)`}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                    >
                        {density === 'large' ? <Minimize2 className="w-3.5 h-3.5 text-sky-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                    {!fixed && (
                        <button
                            type="button"
                            onClick={toggleDock}
                            title={dockPosition === 'bottom' ? 'Üste Sabitle' : 'Alta Sabitle'}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            {dockPosition === 'bottom' ? <PanelTop className="w-3.5 h-3.5" /> : <PanelBottom className="w-3.5 h-3.5" />}
                        </button>
                    )}
                    {hasContextualContent && (
                        <button
                            type="button"
                            onClick={toggleContextual}
                            title={contextualCollapsed ? 'Alt Araç Menüsünü Aç' : 'Alt Araç Menüsünü Gizle'}
                            className={cn(
                                'p-1.5 rounded-xl transition-all flex items-center justify-center',
                                contextualCollapsed
                                    ? 'text-sky-400 bg-sky-500/10 hover:bg-sky-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                            )}
                        >
                            <ChevronDown
                                className={cn(
                                    'w-3.5 h-3.5 transition-transform duration-200',
                                    !contextualCollapsed && 'rotate-180'
                                )}
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    /* ------------------------------------------------------------- */
    /* 2. TIER 2: GOODNOTES 6 BAĞLAMSAL ŞERİT (Contextual Sub-Bar)   */
    /* ------------------------------------------------------------- */
    const contextualBar = hasContextualContent ? (
        <div className="flex items-center justify-center w-full max-w-[1280px] px-2 sm:px-4 py-1 mx-auto">
            {/* Orta: Aktif Araca Göre Dinamik Olarak Değişen Goodnotes Bağlamsal Kapsülü (Tam ortalanmış) */}
            <div className="flex items-center justify-center min-w-0">
                {/* A. KALEM AKTİFKEN (Goodnotes Pen Contextual Bar) */}
                {isPen && (
                    <motion.div
                        key="pen-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2 py-1 shadow-sm gap-2 sm:gap-3 max-w-full overflow-x-auto no-scrollbar"
                    >
                        {/* Kalem Türü Seçici Dropdown Butonu */}
                        <button
                            type="button"
                            onClick={() => setPanel((p) => (p === 'settings' ? null : 'settings'))}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors shrink-0"
                            title="Kalem Ayarları & Uç Seçimi"
                        >
                            <PenTool className="w-3.5 h-3.5 text-sky-400" />
                            <span>{PEN_NAMES[config.penType ?? 'marker'] || 'Tahta Kalemi'}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {/* Hızlı Kalem Uçları (Tahta Kalemi, Tükenmez, Dolma, Fırça, Kurşun) */}
                        <div className="flex items-center gap-1 shrink-0">
                            {[
                                { id: 'marker', label: 'Tahta Kalemi' },
                                { id: 'ballpoint', label: 'Tükenmez' },
                                { id: 'fountain', label: 'Dolma' },
                                { id: 'brush', label: 'Fırça' },
                                { id: 'graphite', label: 'Kurşun' },
                            ].map((p) => {
                                const active = (config.penType ?? 'marker') === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => changePenType(p.id as any)}
                                        className={cn(
                                            'px-2 py-1 rounded-lg text-[11px] font-semibold transition-all',
                                            active
                                                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Goodnotes İmzası: Şekil Tanıma (Çiz ve Bekle) Butonu */}
                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, snapShapes: !config.snapShapes })}
                            title={config.snapShapes ? 'Otomatik Şekil Tanıma (Çiz ve Bekle) Açık' : 'Otomatik Şekil Tanıma Kapalı (Açmak için tıklayın)'}
                            className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all shrink-0',
                                config.snapShapes
                                    ? 'bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/50 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <Shapes className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Şekil</span>
                            {config.snapShapes && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                            )}
                        </button>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Goodnotes İmzası: 3 Kalınlık Çizgisi (- ━ ━━) */}
                        <div className="flex items-center gap-1.5 shrink-0" title="Kalınlık Önayarları">
                            {[
                                { width: 3, label: 'İnce', h: 2 },
                                { width: 6, label: 'Orta', h: 3.5 },
                                { width: 10, label: 'Kalın', h: 5 },
                            ].map((sz) => {
                                const isCurrent = Math.abs(config.width - sz.width) <= 0.6;
                                return (
                                    <button
                                        key={sz.label}
                                        type="button"
                                        onClick={() => {
                                            if (isCurrent) setPenWidthSliderOpen((o) => !o);
                                            else setConfig({ ...config, width: sz.width });
                                        }}
                                        title={`${sz.label} (${sz.width}px) - Değiştirmek için tekrar tıklayın`}
                                        className={cn(
                                            'w-8 h-6 rounded-lg flex items-center justify-center transition-all',
                                            isCurrent
                                                ? 'bg-white/20 ring-1 ring-white/60 shadow-xs'
                                                : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                                        )}
                                    >
                                        <span
                                            className="rounded-full bg-white transition-all"
                                            style={{ width: 14, height: sz.h }}
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Goodnotes Renk Noktaları (3-5 nokta + Palet Düğmesi) */}
                        <div className="flex items-center gap-1.5 shrink-0" title="Mürekkep Renkleri">
                            {GOODNOTES_PEN_COLORS.map((clr) => {
                                const active = config.color.toLowerCase() === clr.toLowerCase();
                                return (
                                    <button
                                        key={clr}
                                        type="button"
                                        onClick={() => setConfig({ ...config, color: clr })}
                                        className={cn(
                                            'w-5 h-5 rounded-full transition-transform border border-white/20',
                                            active
                                                ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1a1b26] scale-110 shadow-sm'
                                                : 'hover:scale-105 opacity-85 hover:opacity-100'
                                        )}
                                        style={{ backgroundColor: clr }}
                                    />
                                );
                            })}
                            <button
                                type="button"
                                onClick={toggleColors}
                                title="Özel Renk Seçici"
                                className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center hover:scale-105 transition-transform"
                                style={{ backgroundColor: config.color }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* B. SİLGİ AKTİFKEN (Goodnotes Eraser Contextual Bar) */}
                {isEraser && (
                    <motion.div
                        key="eraser-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2 py-1 shadow-sm gap-2 sm:gap-3"
                    >
                        {/* Silgi Modu (Çizgi Silgisi vs Piksel Silgisi) */}
                        <button
                            type="button"
                            onClick={() =>
                                setConfig({
                                    ...config,
                                    eraserMode: config.eraserMode === 'stroke' ? 'pixel' : 'stroke',
                                })
                            }
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors shrink-0"
                            title="Silgi Modu (Tıklayarak değiştirin)"
                        >
                            <Eraser className="w-3.5 h-3.5 text-rose-400" />
                            <span>{config.eraserMode === 'stroke' ? 'Çizgi Silgisi' : 'Piksel Silgisi'}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {/* Goodnotes: Kaleme Otomatik Geri Dön Switchi */}
                        <button
                            type="button"
                            onClick={() =>
                                setConfig({
                                    ...config,
                                    autoSwitchBackEraser: !config.autoSwitchBackEraser,
                                })
                            }
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0',
                                config.autoSwitchBackEraser
                                    ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Silme bittiğinde otomatik önceki kaleme geri dön"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Kaleme Dön</span>
                        </button>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Goodnotes 3 Dairesel Silgi Boyutu: Küçük, Orta, Büyük */}
                        <div className="flex items-center gap-2 shrink-0" title="Silgi Boyutu">
                            {[
                                { size: 10, label: 'Küçük', r: 3 },
                                { size: 22, label: 'Orta', r: 5 },
                                { size: 38, label: 'Büyük', r: 7.5 },
                            ].map((sz) => {
                                const isCurrent = Math.abs((config.width || 22) - sz.size) <= 5;
                                return (
                                    <button
                                        key={sz.label}
                                        type="button"
                                        onClick={() => setConfig({ ...config, width: sz.size })}
                                        title={`${sz.label} Silgi (${sz.size}px)`}
                                        className={cn(
                                            'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                                            isCurrent
                                                ? 'border-2 border-sky-400 bg-sky-400/20 shadow-xs scale-105'
                                                : 'border border-white/30 hover:border-white/60 hover:scale-105'
                                        )}
                                    >
                                        <span
                                            className="rounded-full bg-white/90"
                                            style={{ width: sz.r * 2, height: sz.r * 2 }}
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Çizimi Temizle Düğmesi */}
                        <button
                            type="button"
                            onClick={() => onCommand('CLEAR_DRAWING')}
                            className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-400/15 transition-colors shrink-0"
                            title="Tüm Çizimi Temizle"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Temizle</span>
                        </button>
                    </motion.div>
                )}

                {/* C. ŞEKİLLER AKTİFKEN (Goodnotes Shapes Contextual Bar) */}
                {isShapeTool && (
                    <motion.div
                        key="shapes-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2 py-1 shadow-sm gap-2 sm:gap-3 max-w-full overflow-x-auto no-scrollbar"
                    >
                        {/* Goodnotes: Çiz ve Bekle (Draw & Hold) Otomatik Tanıma Toggle */}
                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, snapShapes: !config.snapShapes })}
                            className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-semibold transition-all shrink-0',
                                config.snapShapes
                                    ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Çizip bekleyince otomatik kusursuz şekle dönüştür"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span className="hidden sm:inline">Çiz & Bekle</span>
                        </button>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Hızlı 2D Şekil İkonları */}
                        <div className="flex items-center gap-1 shrink-0">
                            {[
                                { id: 'line', icon: Minus, label: 'Doğru' },
                                { id: 'arrow', icon: MoveRight, label: 'Ok' },
                                { id: 'rect', icon: Square, label: 'Dikdörtgen' },
                                { id: 'circle', icon: Circle, label: 'Daire' },
                                { id: 'triangle', icon: Triangle, label: 'Üçgen' },
                                { id: 'diamond', icon: Diamond, label: 'Baklava' },
                                { id: 'star', icon: Star, label: 'Yıldız' },
                            ].map((sh) => {
                                const Icon = sh.icon;
                                const active = config.tool === sh.id;
                                return (
                                    <button
                                        key={sh.id}
                                        type="button"
                                        onClick={() => selectShape(sh.id as any)}
                                        title={sh.label}
                                        className={cn(
                                            'p-1.5 rounded-lg transition-all',
                                            active
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Dolgu Modu (Yok / Saydam / Opak) */}
                        <button
                            type="button"
                            onClick={() => {
                                const modes: ('none' | 'transparent' | 'solid')[] = ['none', 'transparent', 'solid'];
                                const cur = config.shapeFillMode ?? (config.fillEnabled ? 'solid' : 'none');
                                const next = modes[(modes.indexOf(cur) + 1) % modes.length];
                                setConfig({
                                    ...config,
                                    shapeFillMode: next,
                                    fillEnabled: next !== 'none',
                                });
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors shrink-0"
                            title="Şekil Dolgu Modu"
                        >
                            <span>Dolgu:</span>
                            <span className="text-sky-300 font-bold">
                                {config.shapeFillMode === 'solid'
                                    ? 'Opak'
                                    : config.shapeFillMode === 'transparent'
                                    ? 'Saydam'
                                    : 'Yok'}
                            </span>
                        </button>

                        {/* Kenarlık Deseni (Düz / Kesikli / Noktalı) */}
                        <button
                            type="button"
                            onClick={() => {
                                const styles: ('solid' | 'dashed' | 'dotted')[] = ['solid', 'dashed', 'dotted'];
                                const cur = config.shapeBorderStyle ?? 'solid';
                                const next = styles[(styles.indexOf(cur) + 1) % styles.length];
                                setConfig({ ...config, shapeBorderStyle: next, dash: next });
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors shrink-0"
                            title="Kenarlık Deseni"
                        >
                            <span>Kenar:</span>
                            <span className="text-indigo-300 font-bold">
                                {config.shapeBorderStyle === 'dashed'
                                    ? 'Kesikli'
                                    : config.shapeBorderStyle === 'dotted'
                                    ? 'Noktalı'
                                    : 'Düz'}
                            </span>
                        </button>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Goodnotes İmzası: 3 Kalınlık Çizgisi */}
                        <div className="flex items-center gap-1.5 shrink-0" title="Şekil Çizgi Kalınlığı">
                            {[
                                { width: 2, label: 'İnce', h: 1.5 },
                                { width: 4, label: 'Orta', h: 3 },
                                { width: 7, label: 'Kalın', h: 5 },
                            ].map((sz) => {
                                const isCurrent = Math.abs(config.width - sz.width) <= 0.6;
                                return (
                                    <button
                                        key={sz.label}
                                        type="button"
                                        onClick={() => setConfig({ ...config, width: sz.width })}
                                        title={`${sz.label} (${sz.width}px)`}
                                        className={cn(
                                            'w-7 h-6 rounded-lg flex items-center justify-center transition-all',
                                            isCurrent
                                                ? 'bg-white/20 ring-1 ring-white/60 shadow-xs'
                                                : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                                        )}
                                    >
                                        <span
                                            className="rounded-full bg-white transition-all"
                                            style={{ width: 12, height: sz.h }}
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Şekil Renkleri */}
                        <div className="flex items-center gap-1.5 shrink-0" title="Şekil Rengi">
                            {GOODNOTES_PEN_COLORS.map((clr) => {
                                const active = config.color.toLowerCase() === clr.toLowerCase();
                                return (
                                    <button
                                        key={clr}
                                        type="button"
                                        onClick={() => setConfig({ ...config, color: clr })}
                                        className={cn(
                                            'w-5 h-5 rounded-full transition-transform border border-white/20',
                                            active
                                                ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1a1b26] scale-110 shadow-sm'
                                                : 'hover:scale-105 opacity-85 hover:opacity-100'
                                        )}
                                        style={{ backgroundColor: clr }}
                                    />
                                );
                            })}
                            <button
                                type="button"
                                onClick={toggleColors}
                                title="Özel Renk Seçici"
                                className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center hover:scale-105 transition-transform"
                                style={{ backgroundColor: config.color }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* D. FOSFORLU KALEM AKTİFKEN */}
                {isHighlighter && (
                    <motion.div
                        key="highlighter-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2 py-1 shadow-sm gap-2 sm:gap-3 max-w-full overflow-x-auto no-scrollbar"
                    >
                        {/* Düz Çizgi Otomatik Kilitleme */}
                        <button
                            type="button"
                            onClick={() =>
                                setConfig({
                                    ...config,
                                    highlighterAutoStraight: !config.highlighterAutoStraight,
                                })
                            }
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0',
                                config.highlighterAutoStraight
                                    ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Çizerken düz çizgiye otomatik hizala"
                        >
                            <Ruler className="w-3.5 h-3.5" />
                            <span>Düz Çizgi</span>
                        </button>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Fosforlu Kalınlıkları */}
                        <div className="flex items-center gap-1.5 shrink-0" title="Fosforlu Kalınlıkları">
                            {[
                                { width: 10, label: 'İnce', h: 3 },
                                { width: 18, label: 'Orta', h: 5 },
                                { width: 30, label: 'Kalın', h: 7 },
                            ].map((sz) => {
                                const isCurrent = Math.abs(config.width - sz.width) <= 2;
                                return (
                                    <button
                                        key={sz.label}
                                        type="button"
                                        onClick={() => setConfig({ ...config, width: sz.width })}
                                        title={`${sz.label} (${sz.width}px)`}
                                        className={cn(
                                            'w-8 h-6 rounded-lg flex items-center justify-center transition-all',
                                            isCurrent
                                                ? 'bg-white/20 ring-1 ring-white/60 shadow-xs'
                                                : 'hover:bg-white/10 opacity-70 hover:opacity-100'
                                        )}
                                    >
                                        <span
                                            className="rounded-sm bg-yellow-300/80"
                                            style={{ width: 14, height: sz.h }}
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Fosforlu Renkleri */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {GOODNOTES_HIGHLIGHTER_COLORS.map((clr) => {
                                const active = config.color.toLowerCase() === clr.toLowerCase();
                                return (
                                    <button
                                        key={clr}
                                        type="button"
                                        onClick={() => setConfig({ ...config, color: clr })}
                                        className={cn(
                                            'w-5 h-5 rounded-full transition-transform border border-white/20',
                                            active
                                                ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1a1b26] scale-110 shadow-sm'
                                                : 'hover:scale-105 opacity-85 hover:opacity-100'
                                        )}
                                        style={{ backgroundColor: clr }}
                                    />
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* E. ÇALIŞMA BANDI (TAPE) AKTİFKEN */}
                {isTape && (
                    <motion.div
                        key="tape-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2 py-1 shadow-sm gap-2 sm:gap-3"
                    >
                        {/* Tümünü Göster / Gizle */}
                        <button
                            type="button"
                            onClick={() => {
                                const nextHidden = config.tapeHidden === false ? true : false;
                                setConfig({ ...config, tapeHidden: nextHidden });
                            }}
                            className={cn(
                                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all shrink-0',
                                config.tapeHidden === false
                                    ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                                    : 'bg-white/5 text-slate-300 hover:text-white'
                            )}
                        >
                            {config.tapeHidden === false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{config.tapeHidden === false ? 'Tüm Bantları Kapat' : 'Tüm Bantları Göster'}</span>
                        </button>

                        <div className="w-px h-4 bg-white/10 shrink-0" />

                        {/* Bant Renkleri */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {GOODNOTES_TAPE_COLORS.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setConfig({ ...config, color: t.id })}
                                    title={t.label}
                                    className={cn(
                                        'w-5 h-5 rounded-md border border-white/20 transition-transform',
                                        config.color === t.id ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                                    )}
                                    style={{ backgroundColor: t.id }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* F. METİN ARACI AKTİFKEN */}
                {isText && (
                    <motion.div
                        key="text-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2 py-1 shadow-sm gap-2 max-w-full overflow-x-auto no-scrollbar"
                    >
                        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 shrink-0">
                            {[
                                { id: 'sans', label: 'Sans' },
                                { id: 'serif', label: 'Serif' },
                                { id: 'mono', label: 'Mono' },
                                { id: 'cursive', label: 'Yazı' },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    className={cn(
                                        'px-2 py-0.5 text-xs rounded transition-all font-medium',
                                        (config.fontFamily || 'sans') === f.id
                                            ? 'bg-sky-500 text-white font-semibold'
                                            : 'text-slate-300 hover:text-white'
                                    )}
                                    onClick={() => setConfig({ ...config, fontFamily: f.id })}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Boyut Stepper */}
                        <div className="flex items-center gap-0.5 bg-white/5 px-1 py-0.5 rounded-lg border border-white/10 shrink-0">
                            <button
                                type="button"
                                className="p-1 text-slate-300 hover:text-white"
                                onClick={() => setConfig({ ...config, width: Math.max(12, (config.width || 22) - 2) })}
                            >
                                <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-sky-400 px-1 min-w-[20px] text-center">
                                {config.width || 22}
                            </span>
                            <button
                                type="button"
                                className="p-1 text-slate-300 hover:text-white"
                                onClick={() => setConfig({ ...config, width: Math.min(72, (config.width || 22) + 2) })}
                            >
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Stil & Hizalama */}
                        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 shrink-0">
                            <button
                                type="button"
                                className={cn('p-1 rounded', config.bold ? 'bg-sky-500 text-white font-bold' : 'text-slate-300 hover:text-white')}
                                onClick={() => setConfig({ ...config, bold: !config.bold })}
                            >
                                <Bold className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                className={cn('p-1 rounded', config.italic ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white')}
                                onClick={() => setConfig({ ...config, italic: !config.italic })}
                            >
                                <Italic className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10 shrink-0">
                            {[
                                { id: 'left', icon: AlignLeft },
                                { id: 'center', icon: AlignCenter },
                                { id: 'right', icon: AlignRight },
                            ].map((a) => {
                                const Icon = a.icon;
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        className={cn('p-1 rounded', (config.textAlign || 'left') === a.id ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white')}
                                        onClick={() => setConfig({ ...config, textAlign: a.id as any })}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* G. KEMENT AKTİFKEN */}
                {isLasso && (
                    <motion.div
                        key="lasso-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2 py-1 shadow-sm gap-2"
                    >
                        <span className="text-[11px] font-semibold text-slate-400">Kement Seçimi:</span>
                        {[
                            { id: 'handwriting', label: 'El Yazısı', key: 'lassoFilterHandwriting' },
                            { id: 'shapes', label: 'Şekiller', key: 'lassoFilterShapes' },
                            { id: 'text', label: 'Metin', key: 'lassoFilterText' },
                            { id: 'images', label: 'Resimler', key: 'lassoFilterImages' },
                        ].map((flt) => {
                            const active = (config as any)[flt.key] !== false;
                            return (
                                <button
                                    key={flt.id}
                                    type="button"
                                    onClick={() => setConfig({ ...config, [flt.key]: !active })}
                                    className={cn(
                                        'px-2 py-0.5 rounded-lg text-xs font-medium transition-all',
                                        active ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-500/40' : 'text-slate-400 hover:text-white'
                                    )}
                                >
                                    {flt.label}
                                </button>
                            );
                        })}
                    </motion.div>
                )}

                {/* H. CETVEL AÇIKKEN BİLGİ VE HIZLI GEÇİŞ */}
                {config.ruler && !isPen && !isEraser && !isShapeTool && !isHighlighter && !isTape && !isText && !isLasso && (
                    <motion.div
                        key="ruler-context"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center bg-[#1e2030]/90 border border-white/10 rounded-2xl px-2.5 py-1 shadow-sm gap-2"
                    >
                        <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                            <Ruler className="w-3.5 h-3.5" />
                            {RULER_LABELS[config.ruler]} Açık
                        </span>
                        <div className="w-px h-3.5 bg-white/10" />
                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, ruler: null })}
                            className="text-xs text-rose-400 hover:underline px-1"
                        >
                            Kapat
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    ) : null;

    /* ------------------------------------------------------------- */
    /* 3. BİRLEŞİK İKİ KATMANLI RENDER                               */
    /* ------------------------------------------------------------- */
    const toolbarLayout = (
        <div ref={barRef} className="flex flex-col items-center w-full select-none">
            {mainToolsTier1}
            {!contextualCollapsed && contextualBar}
        </div>
    );

    const bar = fixed ? (
        <div
            ref={rootRef}
            role="toolbar"
            aria-label="Çizim araçları"
            className="relative w-full z-[5000] bg-[#161722] border-b border-white/10 flex flex-col flex-shrink-0 shadow-sm"
        >
            {toolbarLayout}
            <div className="absolute top-full left-0 right-0 z-[5001] pointer-events-none">
                {popovers}
            </div>
        </div>
    ) : (
        <motion.div
            ref={rootRef}
            key={dockPosition}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            role="toolbar"
            aria-label="Çizim araçları"
            className={cn(
                'fixed left-1/2 -translate-x-1/2 z-[4000] flex flex-col items-center select-none pointer-events-none transition-all duration-300 ease-out',
                dockPosition === 'bottom' ? 'bottom-6' : 'top-6'
            )}
        >
            <div className="pointer-events-auto flex flex-col items-center relative bg-[#161722]/95 backdrop-blur-xl p-1 rounded-3xl border border-white/10 shadow-2xl">
                {popovers}
                {toolbarLayout}
            </div>
        </motion.div>
    );

    return (
        <>
            {bar}
            {!fixed && onZoomIn && onZoomOut && (
                <div
                    role="group"
                    aria-label="Yakınlaştırma"
                    className="fixed bottom-4 right-4 z-[5000] flex items-center gap-0.5 bg-[#1a1b26]/95 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-xl"
                >
                    <button
                        type="button"
                        onClick={onZoomOut}
                        title="Uzaklaştır"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    {onZoomFit && (
                        <button
                            type="button"
                            onClick={onZoomFit}
                            title="Sayfaya sığdır"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <Scan className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onZoomReset}
                        title="%100'e dön"
                        className="min-w-[44px] px-1 py-1 rounded-lg text-[11.5px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all tabular-nums"
                    >
                        %{Math.round((zoom ?? 1) * 100)}
                    </button>
                    <button
                        type="button"
                        onClick={onZoomIn}
                        title="Yakınlaştır"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );
}
