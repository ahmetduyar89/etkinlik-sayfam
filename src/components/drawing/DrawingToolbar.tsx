import React from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
    Camera,
    GripVertical,
    Grid,
    ImagePlus,
    Loader2,
    Minus,
    PaintBucket,
    PenTool,
    Plus,
    Redo,
    Shapes,
    Sigma,
    Sparkles,
    StickyNote,
    Trash2,
    Undo,
    Wand2,
    Pentagon,
    FlaskConical,
    Scale,
    Dna,
    TrendingUp,
    Type,
    FileText,
    Atom,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DrawConfig, DrawingTool, MathObject, PenType } from '../../types';
import {
    BG_COLORS,
    DRAWING_COLORS,
    DRAWING_WIDTHS,
    ERASER_MODES,
    MAIN_TOOLS,
    SHAPE_TOOL_IDS,
    STAMP_CATEGORIES,
    make2DShapeTools,
    make3DShapeTools,
    makeShapeTools,
} from '../../constants/drawing';
import { PEN_TYPES } from './penEngine';
import { ObjectLibraryPanel } from './ObjectLibraryPanel';
import { DashedLineIcon, SolidLineIcon } from './DrawingIcons';

export type ToolbarCommand =
    | 'UNDO_DRAWING'
    | 'REDO_DRAWING'
    | 'CLEAR_DRAWING'
    | 'TOGGLE_WHITEBOARD';

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
    onOpenLibrary?: () => void;
    isLibraryOpen?: boolean;
    /** Matematik kütüphanesinden seçilen nesneyi sayfaya ekler. */
    onInsertMath?: (math: MathObject) => void;
    canUndo?: boolean;
    canRedo?: boolean;
    /** Seçilen fotoğraf dosyalarını sayfaya ekler. */
    onInsertImages?: (files: FileList | File[]) => void;
    /** Fotoğraf işlenirken düğmede bekleme göstergesi çıkar. */
    isInsertingImage?: boolean;
    /** Yakınlaştırma kontrolleri (yalnızca defter/beyaz tahtada). */
    zoom?: number;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onZoomReset?: () => void;
    onSelectTool?: (toolId: string) => void;
}

const shape2DTools = make2DShapeTools(SolidLineIcon, DashedLineIcon);
const shape3DTools = make3DShapeTools();
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
    onSelectTool,
}: DrawingToolbarProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [showShapes, setShowShapes] = React.useState(false);
    const [showExtras, setShowExtras] = React.useState(false);
    const [showPen, setShowPen] = React.useState(false);
    const [showMath, setShowMath] = React.useState(false);
    const [showLab, setShowLab] = React.useState(false);
    const dragControls = useDragControls();

    const penType: PenType = config.penType ?? 'ballpoint';
    const eraserMode = config.eraserMode ?? 'pixel';

    /** Aynı anda tek bir açılır panel görünsün. */
    const openOnly = (which: 'shapes' | 'pen' | 'math' | 'extras' | 'lab' | null) => {
        setShowShapes(which === 'shapes');
        setShowPen(which === 'pen');
        setShowMath(which === 'math');
        setShowExtras(which === 'extras');
        setShowLab(which === 'lab');
    };

    const isShapeTool =
        SHAPE_TOOL_IDS.includes(config.tool) || config.tool === 'stamp';

    const selectTool = (tool: DrawingTool) => {
        setConfig({ ...config, tool });
        setShowShapes(false);
    };

    const bar = (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            role="toolbar"
            aria-label="Çizim araç çubuğu"
            // Tam genişlikte durur: `left: 50%` verilseydi kullanılabilir
            // genişlik ekranın yarısına düşer ve çubuk erken satır atlardı.
            className="fixed bottom-10 left-0 right-0 z-[5000] flex flex-col items-center gap-3 pointer-events-none"
            style={{ touchAction: 'none' }}
        >
            {onInsertMath && (
                <ObjectLibraryPanel
                    open={showMath}
                    onClose={() => setShowMath(false)}
                    onInsert={onInsertMath}
                    onSelectTool={onSelectTool}
                />
            )}

            <AnimatePresence>
                {showPen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="pointer-events-auto flex flex-col gap-2.5 bg-[#1a1b26]/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl w-[min(92vw,430px)]"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Kalem Ucu
                            </span>
                            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                                {PEN_TYPES.map((pen) => (
                                    <button
                                        key={pen.id}
                                        type="button"
                                        onClick={() => setConfig({ ...config, penType: pen.id })}
                                        aria-pressed={penType === pen.id}
                                        className={cn(
                                            'text-left px-2.5 py-1.5 rounded-xl border transition-all',
                                            penType === pen.id
                                                ? 'bg-indigo-600/30 border-indigo-500/60'
                                                : 'bg-white/[0.03] border-white/10 hover:bg-white/10'
                                        )}
                                    >
                                        <span className="block text-[12.5px] font-bold text-white">
                                            {pen.label}
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight">
                                            {pen.hint}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                Silgi
                            </span>
                            <div className="mt-1.5 flex items-center gap-1.5">
                                {ERASER_MODES.map((mode) => (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setConfig({ ...config, eraserMode: mode.id })}
                                        title={mode.hint}
                                        aria-pressed={eraserMode === mode.id}
                                        className={cn(
                                            'px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all',
                                            eraserMode === mode.id
                                                ? 'bg-indigo-600/30 border-indigo-500/60 text-white'
                                                : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/10'
                                        )}
                                    >
                                        {mode.label} silgi
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, snapShapes: !config.snapShapes })}
                                aria-pressed={!!config.snapShapes}
                                className={cn(
                                    'flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl border transition-all text-left',
                                    config.snapShapes
                                        ? 'bg-emerald-600/25 border-emerald-500/60'
                                        : 'bg-white/[0.03] border-white/10 hover:bg-white/10'
                                )}
                            >
                                <span>
                                    <span className="block text-[12.5px] font-bold text-white">
                                        Çizgiyle Şekil Çizme (Akıllı Kalem)
                                    </span>
                                    <span className="block text-[10.5px] text-slate-400 leading-tight">
                                        Çizilen çizgileri, okları, daire, kare ve üçgenleri geometrik şekle çevirir. Çizerken ucunda bekleyerek de yapabilirsiniz.
                                    </span>
                                </span>
                                <span
                                    className={cn(
                                        'shrink-0 w-9 h-5 rounded-full transition-colors relative',
                                        config.snapShapes ? 'bg-emerald-500' : 'bg-white/20'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                                            config.snapShapes ? 'left-[18px]' : 'left-0.5'
                                        )}
                                    />
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setConfig({ ...config, snapAngle: !config.snapAngle })}
                                aria-pressed={!!config.snapAngle}
                                className={cn(
                                    'flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl border transition-all text-left',
                                    config.snapAngle
                                        ? 'bg-emerald-600/25 border-emerald-500/60'
                                        : 'bg-white/[0.03] border-white/10 hover:bg-white/10'
                                )}
                            >
                                <span>
                                    <span className="block text-[12.5px] font-bold text-white">
                                        Açı kilidi (15°)
                                    </span>
                                    <span className="block text-[10.5px] text-slate-400 leading-tight">
                                        Çizgi ve okları 15°nin katlarına oturtur
                                    </span>
                                </span>
                                <span
                                    className={cn(
                                        'shrink-0 w-9 h-5 rounded-full transition-colors relative',
                                        config.snapAngle ? 'bg-emerald-500' : 'bg-white/20'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                                            config.snapAngle ? 'left-[18px]' : 'left-0.5'
                                        )}
                                    />
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showLab && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="pointer-events-auto flex flex-col gap-2.5 max-h-[68vh] overflow-y-auto bg-[#161826]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-indigo-500/30 shadow-2xl w-[min(94vw,560px)]"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
                                    <FlaskConical className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider">
                                    Dinamik Laboratuvar & Matematik Araçları
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
                                    setShowLab(false);
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
                                    setShowLab(false);
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
                                        Kaldıraç, makara, palanga, eğik düzlem ve çıkrık simülasyonu
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    onSelectTool?.('dnaGenetics');
                                    setShowLab(false);
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
                                    setShowLab(false);
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
                                        y = mx + n doğrusu, eğim dik üçgeni ve eksen kesişimleri
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    onSelectTool?.('mathFormula');
                                    setShowLab(false);
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
                                    setShowLab(false);
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

                            <button
                                type="button"
                                onClick={() => {
                                    onSelectTool?.('3dStation');
                                    setShowLab(false);
                                }}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-teal-600/25 border border-white/10 hover:border-teal-500/50 text-left transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 group-hover:scale-110 transition-transform">
                                    <FlaskConical className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-white group-hover:text-teal-200">
                                        3D Fen & Katı Cisim İstasyonu
                                    </span>
                                    <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                        Katı açınımları, 3D mevsimler, atom modeli ve DNA
                                    </span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    onSelectTool?.('pdfViewer');
                                    setShowLab(false);
                                }}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-600/25 border border-white/10 hover:border-rose-500/50 text-left transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 shrink-0 group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-white group-hover:text-rose-200">
                                        PDF Kitap & Soru Kırpıcı
                                    </span>
                                    <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                        MEB kitaplarından veya testlerden soru kırpıp tahtaya yapıştır
                                    </span>
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showShapes && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="pointer-events-auto flex flex-col gap-2 max-h-[62vh] overflow-y-auto bg-[#1a1b26]/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        {/* Noktalarla Çokgen Vurgulu Buton */}
                        <button
                            type="button"
                            onClick={() => selectTool('polygon')}
                            className={cn(
                                'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-left transition-all',
                                config.tool === 'polygon'
                                    ? 'bg-indigo-600/30 border-indigo-500/70 text-white shadow-lg ring-1 ring-indigo-500/50'
                                    : 'bg-white/[0.04] border-white/10 hover:bg-white/10 text-slate-200'
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                                    <Pentagon className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="block text-[12.5px] font-bold text-white leading-tight">
                                        Noktalarla Çokgen (A-B-C...)
                                    </span>
                                    <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                        GeoGebra gibi noktalara tıklayarak üçgen, dörtgen ve çokgen oluşturun
                                    </span>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 shrink-0">
                                {config.tool === 'polygon' ? 'Seçili' : 'Seç'}
                            </span>
                        </button>

                        {/* 2B Şekiller */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-semibold w-[78px] shrink-0 leading-tight">
                                2B Şekil
                            </span>
                            <div className="flex items-center gap-0.5 flex-wrap">
                                {shape2DTools.map((tool) => (
                                    <button
                                        key={tool.id}
                                        type="button"
                                        onClick={() => selectTool(tool.id)}
                                        title={tool.label}
                                        aria-label={tool.label}
                                        className={cn(
                                            'p-2 rounded-xl transition-all',
                                            config.tool === tool.id
                                                ? 'bg-[#2d3045] text-indigo-400 ring-1 ring-indigo-500/50'
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
                                    title="Şekli Doldur / Yarı Saydam Renk"
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

                        {/* 3B Cisimler */}
                        <div className="flex items-center gap-2 border-t border-white/10 pt-2">
                            <span className="text-[10px] text-emerald-400 font-semibold w-[78px] shrink-0 leading-tight">
                                3B Cisimler
                            </span>
                            <div className="flex items-center gap-0.5 flex-wrap">
                                {shape3DTools.map((tool) => (
                                    <button
                                        key={tool.id}
                                        type="button"
                                        onClick={() => selectTool(tool.id)}
                                        title={tool.label}
                                        aria-label={tool.label}
                                        className={cn(
                                            'p-2 rounded-xl transition-all flex items-center justify-center',
                                            config.tool === tool.id
                                                ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/50'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {tool.Icon && <tool.Icon className="w-5 h-5" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {STAMP_CATEGORIES.map((cat) => (
                            <div key={cat.label} className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-semibold w-[78px] shrink-0 leading-tight">
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
                                                // Emoji kendi rengini taşır; π, ×, ∈ gibi metin
                                                // semboller ise yazı rengini kullanır — açıkça
                                                // verilmezse koyu panelde görünmez olurlar.
                                                'w-9 h-9 rounded-xl text-xl leading-none text-slate-100 transition-all hover:bg-white/10 hover:text-white flex items-center justify-center',
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

            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1 max-w-[calc(100vw-20px)] bg-[#1a1b26] p-1.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-300">
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="p-2.5 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing border-r border-white/10"
                    title="Taşı"
                    aria-label="Araç çubuğunu taşı"
                >
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-0.5 px-2 border-white/10 lg:border-r">
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
                        onClick={() => openOnly(showShapes ? null : 'shapes')}
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

                    <button
                        type="button"
                        onClick={() => openOnly(showPen ? null : 'pen')}
                        aria-label="Kalem ucu ve yazma ayarları"
                        aria-expanded={showPen}
                        title="Kalem ucu, silgi, şekil düzeltme"
                        className={cn(
                            'p-2.5 rounded-xl transition-all duration-200 relative',
                            showPen
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <PenTool className="w-5 h-5" />
                        {(config.snapShapes || penType !== 'ballpoint') && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-400 rounded-full border border-[#1a1b26]" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setConfig({ ...config, snapShapes: !config.snapShapes })}
                        aria-label="Çizgiyle Geometrik Şekil Çizme"
                        aria-pressed={!!config.snapShapes}
                        title={
                            config.snapShapes
                                ? 'Çizgiyle Şekil Çizme: Açık (Çizilen şekiller otomatik düzelir)'
                                : 'Çizgiyle Şekil Çizme: Kapalı (Açmak için tıklayın veya kalemle çizerken ucunda bekleyin)'
                        }
                        className={cn(
                            'p-2.5 rounded-xl transition-all duration-200 relative',
                            config.snapShapes
                                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        <Wand2 className="w-5 h-5" />
                        {config.snapShapes && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        )}
                    </button>
                </div>

                <div
                    role="radiogroup"
                    aria-label="Renk"
                    className="flex items-center gap-1.5 px-2 border-white/10 lg:border-r"
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
                                'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
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
                    className="flex items-center gap-2.5 px-2 border-white/10 lg:border-r"
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

                <div className="flex items-center gap-1.5 px-2 border-white/10 lg:border-r">
                    <button
                        type="button"
                        onClick={() => onCommand('UNDO_DRAWING')}
                        disabled={canUndo === false}
                        aria-label="Geri Al"
                        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Geri Al"
                    >
                        <Undo className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onCommand('REDO_DRAWING')}
                        disabled={canRedo === false}
                        aria-label="İleri Al"
                        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="İleri Al"
                    >
                        <Redo className="w-5 h-5" />
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

                <div className="flex items-center gap-1.5 px-2">
                    {onOpenLibrary && (
                        <button
                            type="button"
                            onClick={onOpenLibrary}
                            aria-label="Kütüphane"
                            aria-pressed={isLibraryOpen}
                            className={cn(
                                'px-3 py-2 rounded-xl transition-all flex items-center gap-1 font-bold text-sm shadow-md',
                                isLibraryOpen
                                    ? 'bg-indigo-600 text-white shadow-indigo-600/50 ring-2 ring-indigo-400'
                                    : 'bg-indigo-600/80 hover:bg-indigo-600 text-white hover:shadow-indigo-600/30'
                            )}
                            title="Kütüphane (Matematik & Fen Araçları)"
                        >
                            <span className="font-serif text-base leading-none">∑</span>
                            <span className="text-[11px] leading-none">✨</span>
                        </button>
                    )}
                    {onSelectTool && (
                        <button
                            type="button"
                            onClick={() => openOnly(showLab ? null : 'lab')}
                            aria-label="Laboratuvar ve branş araçları"
                            aria-expanded={showLab}
                            className={cn(
                                'p-2.5 rounded-xl transition-all relative',
                                showLab
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20'
                                    : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10'
                            )}
                            title="Dinamik Laboratuvar & Matematik Araçları"
                        >
                            <FlaskConical className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                        </button>
                    )}
                    {onInsertMath && !onOpenLibrary && (
                        <button
                            type="button"
                            onClick={() => openOnly(showMath ? null : 'math')}
                            aria-label="Nesne kütüphanesi"
                            aria-expanded={showMath}
                            className={cn(
                                'p-2.5 rounded-xl transition-all relative',
                                showMath
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-400/10'
                            )}
                            title="Matematik & Fen Kütüphanesi"
                        >
                            <Sigma className="w-5 h-5" />
                            <Sparkles className="w-2.5 h-2.5 absolute top-1 right-1 text-indigo-300" />
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
                                aria-label="Sayfaya fotoğraf ekle"
                                className="p-2.5 rounded-xl text-slate-400 hover:text-sky-300 hover:bg-sky-400/10 transition-all disabled:opacity-40"
                                title="Fotoğraf Ekle"
                            >
                                {isInsertingImage ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <ImagePlus className="w-5 h-5" />
                                )}
                            </button>
                        </>
                    )}
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
                            onClick={() => openOnly(showExtras ? null : 'extras')}
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
                        className="pointer-events-auto flex items-center gap-2 bg-[#1a1b26]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-2xl"
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

    return (
        <>
            {bar}
            {onZoomIn && onZoomOut && (
                // Yakınlaştırma, sürüklenebilir çubuğu şişirmemesi için
                // ekranın sağ alt köşesinde ayrı durur.
                <div
                    role="group"
                    aria-label="Yakınlaştırma"
                    className="fixed bottom-4 right-4 z-[5000] flex items-center gap-0.5 bg-[#1a1b26]/95 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-xl"
                >
                    <button
                        type="button"
                        onClick={onZoomOut}
                        aria-label="Uzaklaştır"
                        title="Uzaklaştır"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={onZoomReset}
                        aria-label="Yakınlaştırmayı sıfırla"
                        title="%100'e dön"
                        className="min-w-[44px] px-1 py-1 rounded-lg text-[11.5px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all tabular-nums"
                    >
                        %{Math.round((zoom ?? 1) * 100)}
                    </button>
                    <button
                        type="button"
                        onClick={onZoomIn}
                        aria-label="Yakınlaştır"
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
