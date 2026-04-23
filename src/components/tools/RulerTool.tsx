import React from 'react';
import { motion, useDragControls } from 'framer-motion';

interface RulerToolProps {
    onClose: () => void;
}

export function RulerTool({ onClose }: RulerToolProps) {
    const [vertical, setVertical] = React.useState(false);
    const dragControls = useDragControls();
    const cmCount = 20;
    const pxPerCm = 32;
    const totalPx = cmCount * pxPerCm;

    const ticks: { x: number; h: number; label: number | null }[] = [];
    for (let mm = 0; mm <= cmCount * 10; mm++) {
        const x = mm * (pxPerCm / 10);
        const isCm = mm % 10 === 0;
        const isMid = mm % 5 === 0;
        ticks.push({
            x,
            h: isCm ? 22 : isMid ? 15 : 8,
            label: isCm && mm > 0 ? mm / 10 : null,
        });
    }

    const svgW = totalPx + 40;
    const svgH = 52;

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            className="fixed z-[11500] pointer-events-auto select-none"
            style={{
                top: 180,
                left: 80,
                touchAction: 'none',
                transformOrigin: 'center center',
                transform: vertical ? 'rotate(90deg)' : 'none',
            }}
        >
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="cursor-grab active:cursor-grabbing relative"
            >
                <svg
                    width={svgW}
                    height={svgH}
                    aria-label="Cetvel"
                    style={{ display: 'block', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}
                >
                    <rect
                        x="0"
                        y="0"
                        width={svgW}
                        height={svgH}
                        rx="4"
                        fill="rgba(254,243,199,0.97)"
                        stroke="#d97706"
                        strokeWidth="1.5"
                    />
                    {ticks.map((t, i) => (
                        <g key={i}>
                            <line
                                x1={t.x + 20}
                                y1={svgH}
                                x2={t.x + 20}
                                y2={svgH - t.h}
                                stroke="#92400e"
                                strokeWidth={t.label !== null ? 1.5 : 0.8}
                            />
                            {t.label !== null && (
                                <text
                                    x={t.x + 20}
                                    y={svgH - t.h - 3}
                                    textAnchor="middle"
                                    fontSize="8"
                                    fill="#92400e"
                                    fontWeight="bold"
                                >
                                    {t.label}
                                </text>
                            )}
                        </g>
                    ))}
                    <text x="10" y="14" fontSize="8" fill="#b45309" fontWeight="bold">
                        cm
                    </text>
                </svg>
                <div
                    className="absolute top-1 right-1 flex gap-1"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={() => setVertical((v) => !v)}
                        aria-label="Cetveli döndür"
                        className="w-5 h-5 bg-amber-400 rounded text-amber-900 text-[11px] flex items-center justify-center hover:bg-amber-500 font-bold leading-none"
                        title="Döndür"
                    >
                        ↺
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cetveli kapat"
                        className="w-5 h-5 bg-red-400 rounded text-white text-[11px] flex items-center justify-center hover:bg-red-500 font-bold leading-none"
                        title="Kapat"
                    >
                        ×
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
