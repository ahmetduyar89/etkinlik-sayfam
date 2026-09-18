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
    Sigma,
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
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DrawConfig, DrawingTool, MathObject, RulerKind } from '../../types';
import { BG_COLORS, MAIN_TOOLS, SHAPE_TOOL_IDS } from '../../constants/drawing';
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
    /** Görünümü sayfaya sığdırır (yalnızca sayfa ölçüsü tanımlıysa). */
    onZoomFit?: () => void;
    onSelectTool?: (toolId: string) => void;
}

type PanelId = 'settings' | 'shapes' | 'colors' | 'math' | 'lab' | 'extras';

/** Ölçü aracı düğmesinin ipucu metinleri. */
const RULER_LABELS: Record<RulerKind | 'off', string> = {
    off: 'Kapalı',
    ruler: 'Cetvel',
    setsquare: 'Gönye',
    protractor: 'Açıölçer',
};

/** Hangi aracın hangi ayar grubunu açacağı. Seç/kement/el ayarsızdır. */
function sectionForTool(tool: DrawingTool): ToolSettingsSection | null {
    if (tool === 'pencil' || tool === 'highlighter' || tool === 'sun') return 'pen';
    if (tool === 'eraser') return 'eraser';
    if (SHAPE_TOOL_IDS.includes(tool) || tool === 'stamp') return 'shape';
    return null;
}

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
    onZoomFit,
    onSelectTool,
}: DrawingToolbarProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    /** Aynı anda tek bir açılır panel görünür. */
    const [panel, setPanel] = React.useState<PanelId | null>(null);
    const dragControls = useDragControls();
    const barRef = React.useRef<HTMLDivElement>(null);
    const rootRef = React.useRef<HTMLDivElement>(null);
    const { scale, density, cycleDensity } = useToolbarScale(barRef);

    const showMath = panel === 'math';
    const showLab = panel === 'lab';
    const showExtras = panel === 'extras';

    const openOnly = (which: PanelId | null) => setPanel(which);

    const isShapeTool =
        SHAPE_TOOL_IDS.includes(config.tool) || config.tool === 'stamp';

    /**
     * Şekil düğmesi, seçili araç ne olursa olsun şekil ayarlarını açar.
     * Seç/kement/el gibi ayarsız araçlarda renk düğmesi kalem ayarlarını
     * gösterir; renk ve kalınlık bir sonraki çizim için geçerli olur.
     */
    const settingsSection: ToolSettingsSection =
        panel === 'shapes' ? 'shape' : sectionForTool(config.tool) ?? 'pen';
    const settingsOpen = panel === 'settings' || panel === 'shapes';

    const toggleColors = () =>
        setPanel((prev) => (prev === 'colors' ? null : 'colors'));

    /**
     * Araca tıklamak hem aracı seçer hem de o araca ait ayarları açar:
     * kalem boyutu/rengi, silgi modu ya da şekil seçenekleri aynı yerde.
     * Aynı araca yeniden tıklanması paneli kapatır.
     */
    const selectTool = (tool: DrawingTool) => {
        setConfig({ ...config, tool });
        const section = sectionForTool(tool);
        if (!section) {
            setPanel(null);
            return;
        }
        setPanel((prev) =>
            prev === 'settings' && config.tool === tool ? null : 'settings'
        );
    };

    /** Panelden şekil seçilince panel açık kalsın (art arda deneme yapılabilsin). */
    const selectShapeTool = (tool: DrawingTool) => setConfig({ ...config, tool });

    // Tahtaya dokunulduğunda açık panel kapanır; çizim alanını kapatmasın.
    React.useEffect(() => {
        if (!panel) return;
        const onPointerDown = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setPanel(null);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [panel]);

    const bar = (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            ref={rootRef}
            role="toolbar"
            aria-label="Çizim araç çubuğu"
            // Tam genişlikte durur: `left: 50%` verilseydi kullanılabilir
            // genişlik ekranın yarısına düşer ve çubuk erken satır atlardı.
            className="fixed bottom-10 left-0 right-0 z-[5000] pointer-events-none"
            style={{ touchAction: 'none' }}
        >
            {/* Ölçek yalnızca bu sarmalayıcıya uygulanır: sürükleme transformu
                framer-motion'da dış katmanda kaldığı için ikisi çakışmaz. */}
            <div
                className="flex flex-col items-center gap-3"
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'bottom center',
                    transition: 'transform 180ms ease-out',
                }}
            >
            {onInsertMath && (
                <ObjectLibraryPanel
                    open={showMath}
                    onClose={() => setPanel(null)}
                    onInsert={onInsertMath}
                    onSelectTool={onSelectTool}
                />
            )}

            <AnimatePresence>
                {panel === 'colors' && (
                    <ColorPalettePanel config={config} setConfig={setConfig} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {settingsOpen && (
                    <ToolSettingsPanel
                        section={settingsSection}
                        config={config}
                        setConfig={setConfig}
                        onSelectShapeTool={selectShapeTool}
                        onPickStamp={(emoji) => {
                            setConfig({ ...config, tool: 'stamp', stampIcon: emoji });
                            setPanel(null);
                        }}
                    />
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
                                        Kaldıraç, makara, palanga, eğik düzlem ve çıkrık simülasyonu
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
                                        y = mx + n doğrusu, eğim dik üçgeni ve eksen kesişimleri
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

                            <button
                                type="button"
                                onClick={() => {
                                    onSelectTool?.('3dStation');
                                    setPanel(null);
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
                                    setPanel(null);
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


            {/* Tek satırda kalır: sığmazsa `useToolbarScale` ölçeği küçültür,
                böylece tahtada çubuk ikinci satıra taşıp ekranı kaplamaz. */}
            <div
                ref={barRef}
                className="pointer-events-auto flex flex-nowrap items-center justify-center gap-0.5 bg-[#1a1b26] p-1.5 rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.45)] border border-white/5"
            >
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="p-2 text-slate-500 hover:text-white cursor-grab active:cursor-grabbing border-r border-white/10"
                    title="Taşı"
                    aria-label="Araç çubuğunu taşı"
                >
                    <GripVertical className="w-[18px] h-[18px]" />
                </div>

                <div className="flex items-center gap-0.5 px-1.5 border-white/10 border-r">
                    {MAIN_TOOLS.map((tool) => (
                        <button
                            key={tool.id}
                            type="button"
                            onClick={() => selectTool(tool.id)}
                            title={tool.label}
                            aria-label={tool.label}
                            aria-pressed={config.tool === tool.id}
                            className={cn(
                                'p-2 rounded-lg transition-all duration-200 group relative',
                                config.tool === tool.id
                                    ? 'bg-[#2d3045] text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <tool.icon className="w-[18px] h-[18px]" />
                            {config.tool === tool.id && (
                                <motion.div
                                    layoutId="activeTool"
                                    className="absolute inset-0 border-2 border-emerald-500/50 rounded-lg pointer-events-none"
                                />
                            )}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => openOnly(panel === 'shapes' ? null : 'shapes')}
                        aria-label="Şekiller ve damgalar"
                        aria-expanded={panel === 'shapes'}
                        className={cn(
                            'p-2 rounded-lg transition-all duration-200 relative',
                            isShapeTool
                                ? 'bg-[#2d3045] text-indigo-400'
                                : 'text-slate-400 hover:text-white hover:bg-white/5',
                            panel === 'shapes' ? 'bg-white/10 text-white' : ''
                        )}
                        title="Şekiller & Damgalar"
                    >
                        {config.tool === 'stamp' ? (
                            <span className="text-xl leading-none">
                                {config.stampIcon || '✅'}
                            </span>
                        ) : (
                            <Shapes className="w-[18px] h-[18px]" />
                        )}
                        {isShapeTool && config.tool !== 'stamp' && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-[#1a1b26]" />
                        )}
                    </button>
                </div>
                <div className="flex items-center gap-1 px-1.5 border-white/10 border-r">
                    {/* Ölçü aracı: tahtada cetvelle düz çizgi çekmek için. */}
                    <button
                        type="button"
                        onClick={() => {
                            const order: (RulerKind | null)[] = [
                                null,
                                'ruler',
                                'setsquare',
                                'protractor',
                            ];
                            const at = order.indexOf(config.ruler ?? null);
                            setConfig({ ...config, ruler: order[(at + 1) % order.length] });
                        }}
                        aria-label={`Ölçü aracı: ${RULER_LABELS[config.ruler ?? 'off']}`}
                        aria-pressed={!!config.ruler}
                        title={`Ölçü aracı: ${RULER_LABELS[config.ruler ?? 'off']} (değiştirmek için tıklayın)`}
                        className={cn(
                            'p-2 rounded-lg transition-all relative',
                            config.ruler
                                ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500/40'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                        )}
                    >
                        {config.ruler === 'protractor' ? (
                            <Compass className="w-[18px] h-[18px]" />
                        ) : config.ruler === 'setsquare' ? (
                            <Triangle className="w-[18px] h-[18px]" />
                        ) : (
                            <Ruler className="w-[18px] h-[18px]" />
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-1 px-1.5 border-white/10 border-r">
                    {/* Yalnızca renk: kalem ucu/kalınlık aracın kendi panelinde. */}
                    <button
                        type="button"
                        onClick={toggleColors}
                        aria-label="Renk seçimi"
                        aria-expanded={panel === 'colors'}
                        title="Renk paleti"
                        className={cn(
                            'p-1.5 rounded-lg transition-all',
                            panel === 'colors' ? 'bg-white/10' : 'hover:bg-white/5'
                        )}
                    >
                        <span
                            className="block w-[20px] h-[20px] rounded-md border-2 border-white/50 shadow-inner"
                            style={{ backgroundColor: config.color }}
                        />
                    </button>
                </div>

                <div className="flex items-center gap-1 px-1.5 border-white/10 border-r">
                    <button
                        type="button"
                        onClick={() => onCommand('UNDO_DRAWING')}
                        disabled={canUndo === false}
                        aria-label="Geri Al"
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Geri Al"
                    >
                        <Undo className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onCommand('REDO_DRAWING')}
                        disabled={canRedo === false}
                        aria-label="İleri Al"
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                        title="İleri Al"
                    >
                        <Redo className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onCommand('CLEAR_DRAWING')}
                        aria-label="Çizimi Temizle"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        title="Temizle"
                    >
                        <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                    {setShowWhiteboard && (
                        <button
                            type="button"
                            onClick={() => onCommand('TOGGLE_WHITEBOARD')}
                            aria-label="Yazı Tahtası"
                            aria-pressed={showWhiteboard}
                            className={cn(
                                'p-2 rounded-lg transition-all',
                                showWhiteboard
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Yazı Tahtası"
                        >
                            <Grid className="w-[18px] h-[18px]" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1 px-1.5">
                    {onOpenLibrary && (
                        <button
                            type="button"
                            onClick={onOpenLibrary}
                            aria-label="Kütüphane"
                            aria-pressed={isLibraryOpen}
                            className={cn(
                                'px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 font-bold text-[13px] shadow-md',
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
                                'p-2 rounded-lg transition-all relative',
                                showLab
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-white/20'
                                    : 'text-slate-400 hover:text-purple-300 hover:bg-purple-500/10'
                            )}
                            title="Dinamik Laboratuvar & Matematik Araçları"
                        >
                            <FlaskConical className="w-[18px] h-[18px]" />
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
                                'p-2 rounded-lg transition-all relative',
                                showMath
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:text-indigo-300 hover:bg-indigo-400/10'
                            )}
                            title="Matematik & Fen Kütüphanesi"
                        >
                            <Sigma className="w-[18px] h-[18px]" />
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
                                className="p-2 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-400/10 transition-all disabled:opacity-40"
                                title="Fotoğraf Ekle"
                            >
                                {isInsertingImage ? (
                                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                                ) : (
                                    <ImagePlus className="w-[18px] h-[18px]" />
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
                                'p-2 rounded-lg transition-all',
                                isTextBoxMode
                                    ? 'bg-amber-500 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Metin Kutusu Ekle"
                        >
                            <StickyNote className="w-[18px] h-[18px]" />
                        </button>
                    )}
                    {onScreenshot && (
                        <button
                            type="button"
                            onClick={onScreenshot}
                            aria-label="Çizimi PNG olarak indir"
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"
                            title="Çizimi PNG Olarak İndir"
                        >
                            <Camera className="w-[18px] h-[18px]" />
                        </button>
                    )}
                    {onBgColorChange && (
                        <button
                            type="button"
                            onClick={() => openOnly(showExtras ? null : 'extras')}
                            aria-label="Arka plan rengi"
                            aria-expanded={showExtras}
                            className={cn(
                                'p-2 rounded-lg transition-all relative',
                                showExtras
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            title="Arka Plan Rengi"
                        >
                            <div
                                className="w-[18px] h-[18px] rounded-full border-2 border-white/40"
                                style={{ backgroundColor: bgColor || '#ffffff' }}
                            />
                        </button>
                    )}

                    {/* Akıllı tahtada çubuk büyük duruyorsa kullanıcı buradan
                        küçültür; tercih tarayıcıda saklanır. */}
                    <button
                        type="button"
                        onClick={cycleDensity}
                        aria-label={`Araç çubuğu boyutu: ${TOOLBAR_DENSITY_LABELS[density]}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                        title={`Araç çubuğu boyutu: ${TOOLBAR_DENSITY_LABELS[density]} (değiştirmek için tıklayın)`}
                    >
                        {density === 'large' ? (
                            <Minimize2 className="w-[18px] h-[18px]" />
                        ) : (
                            <Maximize2 className="w-[18px] h-[18px]" />
                        )}
                    </button>
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
            </div>
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
                    {onZoomFit && (
                        <button
                            type="button"
                            onClick={onZoomFit}
                            aria-label="Sayfaya sığdır"
                            title="Sayfaya sığdır"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <Scan className="w-4 h-4" />
                        </button>
                    )}
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
