import React from 'react';
import { motion } from 'framer-motion';
import { PaintBucket, Pentagon } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DashStyle, DrawConfig, DrawingTool, PenType } from '../../types';
import {
    ERASER_MODES,
    STAMP_CATEGORIES,
    make2DShapeTools,
    make3DShapeTools,
} from '../../constants/drawing';
import { PEN_TYPES } from './penEngine';
import { SizePicker } from './SizePicker';
import { DashedLineIcon, EllipseIcon, RightTriangleIcon, SolidLineIcon } from './DrawingIcons';

/** Seçili araca göre gösterilecek ayar grubu. */
export type ToolSettingsSection = 'pen' | 'eraser' | 'shape';

const shape2DTools = make2DShapeTools(SolidLineIcon, DashedLineIcon, EllipseIcon, RightTriangleIcon);
const shape3DTools = make3DShapeTools();

interface ToolSettingsPanelProps {
    section: ToolSettingsSection;
    config: DrawConfig;
    setConfig: (c: DrawConfig) => void;
    /** Panelden şekil aracı seçildiğinde çağrılır (panel açık kalır). */
    onSelectShapeTool: (tool: DrawingTool) => void;
    /** Damga seçildiğinde çağrılır; damga seçimi paneli kapatır. */
    onPickStamp: (emoji: string) => void;
}

const SECTION_TITLES: Record<ToolSettingsSection, string> = {
    pen: 'Kalem Ayarları',
    eraser: 'Silgi Ayarları',
    shape: 'Şekil Oluşturma',
};

function Row({
    label,
    accent,
    children,
}: {
    label: string;
    accent?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    'text-[10px] font-semibold w-[74px] shrink-0 leading-tight uppercase tracking-wider',
                    accent ?? 'text-slate-400'
                )}
            >
                {label}
            </span>
            <div className="flex items-center gap-1 flex-wrap">{children}</div>
        </div>
    );
}

function Toggle({
    title,
    hint,
    checked,
    onChange,
}: {
    title: string;
    hint: string;
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            aria-pressed={checked}
            className={cn(
                'flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-xl border transition-all text-left',
                checked
                    ? 'bg-emerald-600/25 border-emerald-500/60'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/10'
            )}
        >
            <span>
                <span className="block text-[12px] font-bold text-white leading-tight">
                    {title}
                </span>
                <span className="block text-[10.5px] text-slate-400 leading-tight">
                    {hint}
                </span>
            </span>
            <span
                className={cn(
                    'shrink-0 w-9 h-5 rounded-full transition-colors relative',
                    checked ? 'bg-emerald-500' : 'bg-white/20'
                )}
            >
                <span
                    className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                        checked ? 'left-[18px]' : 'left-0.5'
                    )}
                />
            </span>
        </button>
    );
}

/**
 * Seçili aracın ayarları: kalınlık, kalem ucu, silgi modu, şekil ve damgalar.
 * Renk seçimi bilinçli olarak dışarıda: o iş `ColorPalettePanel`'e ait.
 */
export function ToolSettingsPanel({
    section,
    config,
    setConfig,
    onSelectShapeTool,
    onPickStamp,
}: ToolSettingsPanelProps) {
    const penType: PenType = config.penType ?? 'ballpoint';
    const eraserMode = config.eraserMode ?? 'pixel';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            role="dialog"
            aria-label={SECTION_TITLES[section]}
            className="pointer-events-auto flex flex-col gap-2 w-[min(94vw,470px)] max-h-[62vh] overflow-y-auto bg-[#1a1b26]/95 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl"
            onPointerDown={(e) => e.stopPropagation()}
        >
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                {SECTION_TITLES[section]}
            </span>

            <SizePicker
                config={config}
                setConfig={setConfig}
                isEraser={section === 'eraser'}
            />

            {section === 'pen' && (
                <>
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

                    <Row label="Çizgi Deseni">
                        {(
                            [
                                { id: 'solid', label: 'Düz', dash: '' },
                                { id: 'dashed', label: 'Kesikli', dash: '7 4' },
                                { id: 'dotted', label: 'Noktalı', dash: '0.1 5' },
                            ] as { id: DashStyle; label: string; dash: string }[]
                        ).map((opt) => {
                            const active = (config.dash ?? 'solid') === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    aria-label={opt.label}
                                    title={opt.label}
                                    onClick={() => setConfig({ ...config, dash: opt.id })}
                                    className={cn(
                                        'px-2.5 h-9 rounded-lg border transition-all flex items-center',
                                        active
                                            ? 'bg-[#2d3045] border-indigo-500/70'
                                            : 'border-white/10 hover:bg-white/10'
                                    )}
                                >
                                    <svg width="34" height="10" viewBox="0 0 34 10" aria-hidden="true">
                                        <line
                                            x1="2"
                                            y1="5"
                                            x2="32"
                                            y2="5"
                                            stroke={active ? '#ffffff' : '#94a3b8'}
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeDasharray={opt.dash || undefined}
                                        />
                                    </svg>
                                </button>
                            );
                        })}
                    </Row>

                    <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2">
                        <Toggle
                            title="Kaybolan Mürekkep"
                            hint="Çizilen iz birkaç saniyede solar, sayfaya işlenmez"
                            checked={!!config.ephemeral}
                            onChange={() => setConfig({ ...config, ephemeral: !config.ephemeral })}
                        />
                        <Toggle
                            title="Çizgiyle Şekil Çizme (Akıllı Kalem)"
                            hint="Çizilen çizgi, ok, daire, kare ve üçgenleri geometrik şekle çevirir"
                            checked={!!config.snapShapes}
                            onChange={() =>
                                setConfig({ ...config, snapShapes: !config.snapShapes })
                            }
                        />
                        <Toggle
                            title="Açı kilidi (15°)"
                            hint="Çizgi ve okları 15°nin katlarına oturtur"
                            checked={!!config.snapAngle}
                            onChange={() =>
                                setConfig({ ...config, snapAngle: !config.snapAngle })
                            }
                        />
                    </div>
                </>
            )}

            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2">
                <Toggle
                    title="Izgaraya ve Nesnelere Yapışma"
                    hint="Şekiller kareye oturur, taşınan nesne komşularıyla hizalanır"
                    checked={!!config.snapToGrid}
                    onChange={() => setConfig({ ...config, snapToGrid: !config.snapToGrid })}
                />
                <Toggle
                    title="Avuç İçi Reddi"
                    hint="Kalem kullanılırken parmak ve avuç dokunuşları çizmez"
                    checked={config.palmRejection !== false}
                    onChange={() =>
                        setConfig({ ...config, palmRejection: config.palmRejection === false })
                    }
                />
            </div>

            {section === 'eraser' && (
                <Row label="Silgi Modu">
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
                </Row>
            )}

            {section === 'shape' && (
                <>
                    <button
                        type="button"
                        onClick={() => onSelectShapeTool('polygon')}
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
                                    GeoGebra gibi noktalara tıklayarak üçgen, dörtgen ve çokgen
                                    oluşturun
                                </span>
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/25 text-indigo-300 shrink-0">
                            {config.tool === 'polygon' ? 'Seçili' : 'Seç'}
                        </span>
                    </button>

                    <Row label="2B Şekil">
                        {shape2DTools.map((tool) => (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={() => onSelectShapeTool(tool.id)}
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
                    </Row>

                    <Row label="3B Cisimler" accent="text-emerald-400">
                        {shape3DTools.map((tool) => (
                            <button
                                key={tool.id}
                                type="button"
                                onClick={() => onSelectShapeTool(tool.id)}
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
                    </Row>

                    <div className="border-t border-white/10 pt-2">
                        <Toggle
                            title="Açı kilidi (15°)"
                            hint="Çizgi ve okları 15°nin katlarına oturtur"
                            checked={!!config.snapAngle}
                            onChange={() =>
                                setConfig({ ...config, snapAngle: !config.snapAngle })
                            }
                        />
                    </div>

                    {STAMP_CATEGORIES.map((cat) => (
                        <Row key={cat.label} label={cat.label}>
                            {cat.items.map((stamp) => (
                                <button
                                    key={stamp.emoji}
                                    type="button"
                                    onClick={() => onPickStamp(stamp.emoji)}
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
                        </Row>
                    ))}
                </>
            )}
        </motion.div>
    );
}
