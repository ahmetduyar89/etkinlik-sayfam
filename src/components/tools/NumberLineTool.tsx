import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Move, RotateCcw, Plus, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NumberLineToolProps {
    onClose: () => void;
}

type NumberLineMode = 'integers' | 'fractions' | 'decimals';

interface Marker {
    id: string;
    value: string;
    positionRatio: number; // 0 to 1
    color: string;
}

export function NumberLineTool({ onClose }: NumberLineToolProps) {
    const dragControls = useDragControls();
    const [mode, setMode] = React.useState<NumberLineMode>('integers');
    const [rangeType, setRangeType] = React.useState<string>('m5_p5'); // -5 to +5
    const [fractionDenominator, setFractionDenominator] = React.useState<number>(4);
    const [markers, setMarkers] = React.useState<Marker[]>([]);
    const [selectedColor, setSelectedColor] = React.useState<string>('#ef4444');

    // Calculate ticks based on mode
    const ticks = React.useMemo(() => {
        if (mode === 'integers') {
            if (rangeType === 'm5_p5') {
                return Array.from({ length: 11 }, (_, i) => ({
                    val: i - 5,
                    label: String(i - 5),
                    ratio: i / 10,
                }));
            }
            if (rangeType === 'm10_p10') {
                return Array.from({ length: 21 }, (_, i) => ({
                    val: i - 10,
                    label: i % 2 === 0 ? String(i - 10) : '',
                    ratio: i / 20,
                }));
            }
            // 0 to 10
            return Array.from({ length: 11 }, (_, i) => ({
                val: i,
                label: String(i),
                ratio: i / 10,
            }));
        }

        if (mode === 'fractions') {
            const denom = fractionDenominator;
            return Array.from({ length: denom + 1 }, (_, i) => ({
                val: i / denom,
                label: i === 0 ? '0' : i === denom ? '1' : `${i}/${denom}`,
                ratio: i / denom,
            }));
        }

        // decimals 0.0 to 1.0
        return Array.from({ length: 11 }, (_, i) => ({
            val: i / 10,
            label: (i / 10).toFixed(1),
            ratio: i / 10,
        }));
    }, [mode, rangeType, fractionDenominator]);

    const handleLineClick = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        // margins on left and right inside SVG
        const pad = 30;
        const lineWidth = width - pad * 2;
        if (lineWidth <= 0) return;

        let ratio = (clickX - pad) / lineWidth;
        ratio = Math.max(0, Math.min(1, ratio));

        // Snap to closest tick
        let closest = ticks[0];
        let minDiff = 1;
        for (const t of ticks) {
            const diff = Math.abs(t.ratio - ratio);
            if (diff < minDiff) {
                minDiff = diff;
                closest = t;
            }
        }

        // Check if marker exists at snapped point
        const existingIndex = markers.findIndex((m) => Math.abs(m.positionRatio - closest.ratio) < 0.03);
        if (existingIndex >= 0) {
            // Remove marker
            setMarkers((prev) => prev.filter((_, idx) => idx !== existingIndex));
        } else {
            // Add marker
            const newMarker: Marker = {
                id: Date.now().toString(),
                value: closest.label || String(closest.val),
                positionRatio: closest.ratio,
                color: selectedColor,
            };
            setMarkers((prev) => [...prev, newMarker]);
        }
    };

    const svgWidth = 520;
    const svgHeight = 90;
    const pad = 30;
    const lineWidth = svgWidth - pad * 2;
    const lineY = 40;

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            className="fixed z-[11500] pointer-events-auto select-none"
            style={{
                top: 280,
                left: 220,
                touchAction: 'none',
            }}
        >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl text-white w-[560px]">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 gap-2">
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="flex items-center gap-2 cursor-grab active:cursor-grabbing text-xs font-bold text-slate-300 hover:text-white"
                    >
                        <Move className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Sayı Doğrusu Aracı</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setMarkers([])}
                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                            title="Noktaları Temizle"
                        >
                            <RotateCcw className="w-3 h-3" />
                            <span>Temizle</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            title="Kapat"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Sub Controls: Mode Selector */}
                <div className="flex items-center justify-between pt-3 pb-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setMode('integers')}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                                mode === 'integers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                            )}
                        >
                            Tam Sayılar
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('fractions')}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                                mode === 'fractions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                            )}
                        >
                            Kesirler
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('decimals')}
                            className={cn(
                                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                                mode === 'decimals' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                            )}
                        >
                            Ondalık
                        </button>
                    </div>

                    {/* Mode specific sub options */}
                    {mode === 'integers' && (
                        <select
                            value={rangeType}
                            onChange={(e) => setRangeType(e.target.value)}
                            className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none cursor-pointer"
                        >
                            <option value="m5_p5">-5 ile +5 arası</option>
                            <option value="m10_p10">-10 ile +10 arası</option>
                            <option value="0_10">0 ile 10 arası</option>
                        </select>
                    )}

                    {mode === 'fractions' && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <span>Bölüntü (Payda):</span>
                            <div className="flex items-center gap-1 bg-white/5 rounded px-1">
                                {[2, 3, 4, 5, 6, 8, 10].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setFractionDenominator(d)}
                                        className={cn(
                                            'px-1.5 py-0.5 rounded text-[11px] font-mono transition-all',
                                            fractionDenominator === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                        )}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Marker Color Picker */}
                    <div className="flex items-center gap-1">
                        {['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedColor(c)}
                                className={cn(
                                    'w-4 h-4 rounded-full border transition-all',
                                    selectedColor === c ? 'border-white scale-125' : 'border-transparent'
                                )}
                                style={{ backgroundColor: c }}
                                title="İşaretçi Rengi"
                            />
                        ))}
                    </div>
                </div>

                {/* Info guide */}
                <p className="text-[11px] text-slate-400 pb-1">
                    💡 <em>Nokta koymak veya kaldırmak için çizgi üzerindeki kademelere tıklayın.</em>
                </p>

                {/* SVG Number Line Canvas */}
                <div className="bg-slate-800/80 rounded-xl p-2 border border-white/5 flex items-center justify-center">
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        onClick={handleLineClick}
                        className="cursor-pointer overflow-visible"
                    >
                        {/* Main line with arrowheads */}
                        <defs>
                            <marker
                                id="arrow-left"
                                viewBox="0 0 10 10"
                                refX="5"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 10 0 L 0 5 L 10 10 z" fill="#94a3b8" />
                            </marker>
                            <marker
                                id="arrow-right"
                                viewBox="0 0 10 10"
                                refX="5"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                            </marker>
                        </defs>

                        {/* Baseline */}
                        <line
                            x1={pad - 10}
                            y1={lineY}
                            x2={pad + lineWidth + 10}
                            y2={lineY}
                            stroke="#94a3b8"
                            strokeWidth="3"
                            strokeLinecap="round"
                            markerStart="url(#arrow-left)"
                            markerEnd="url(#arrow-right)"
                        />

                        {/* Ticks and Labels */}
                        {ticks.map((t, idx) => {
                            const x = pad + t.ratio * lineWidth;
                            const isMajor = t.val === 0 || t.ratio === 0 || t.ratio === 1;
                            const tickH = isMajor ? 16 : 10;
                            return (
                                <g key={idx}>
                                    <line
                                        x1={x}
                                        y1={lineY - tickH / 2}
                                        x2={x}
                                        y2={lineY + tickH / 2}
                                        stroke={isMajor ? '#f8fafc' : '#cbd5e1'}
                                        strokeWidth={isMajor ? 2.5 : 1.5}
                                    />
                                    {t.label && (
                                        <text
                                            x={x}
                                            y={lineY + 24}
                                            textAnchor="middle"
                                            fill={isMajor ? '#f8fafc' : '#94a3b8'}
                                            fontSize="11"
                                            fontWeight={isMajor ? 'bold' : 'normal'}
                                            fontFamily="monospace"
                                        >
                                            {t.label}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Markers placed by user */}
                        {markers.map((m) => {
                            const x = pad + m.positionRatio * lineWidth;
                            return (
                                <g key={m.id}>
                                    {/* Drop pin marker */}
                                    <line
                                        x1={x}
                                        y1={lineY - 26}
                                        x2={x}
                                        y2={lineY}
                                        stroke={m.color}
                                        strokeWidth="2.5"
                                    />
                                    <circle
                                        cx={x}
                                        cy={lineY - 26}
                                        r="6"
                                        fill={m.color}
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={x}
                                        y={lineY - 35}
                                        textAnchor="middle"
                                        fill="#ffffff"
                                        fontSize="10"
                                        fontWeight="bold"
                                        fontFamily="monospace"
                                    >
                                        {m.value}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}
