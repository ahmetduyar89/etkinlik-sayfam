import { motion, useDragControls } from 'framer-motion';

interface ProtractorToolProps {
    onClose: () => void;
}

export function ProtractorTool({ onClose }: ProtractorToolProps) {
    const dragControls = useDragControls();
    const r = 110;
    const cx = r + 10;
    const cy = r + 10;

    const marks = Array.from({ length: 19 }, (_, i) => {
        const deg = i * 10;
        const rad = Math.PI - (deg * Math.PI) / 180;
        const isMajor = deg % 30 === 0;
        const innerR = isMajor ? r - 20 : r - 13;
        const textR = r - 28;
        return { deg, rad, innerR, textR, isMajor };
    });

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            className="fixed z-[11500] pointer-events-auto select-none"
            style={{ top: 250, left: 200, touchAction: 'none' }}
        >
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="cursor-grab active:cursor-grabbing relative"
            >
                <svg
                    width={r * 2 + 20}
                    height={r + 30}
                    aria-label="Açıölçer"
                    style={{ display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))' }}
                >
                    <path
                        d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy} Z`}
                        fill="rgba(147,197,253,0.88)"
                        stroke="#2563eb"
                        strokeWidth="2"
                    />
                    {marks.map((m) => {
                        const x1 = cx + r * Math.cos(m.rad);
                        const y1 = cy - r * Math.sin(m.rad);
                        const x2 = cx + m.innerR * Math.cos(m.rad);
                        const y2 = cy - m.innerR * Math.sin(m.rad);
                        const tx = cx + m.textR * Math.cos(m.rad);
                        const ty = cy - m.textR * Math.sin(m.rad);
                        return (
                            <g key={m.deg}>
                                <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#1e40af"
                                    strokeWidth={m.isMajor ? 1.5 : 0.8}
                                />
                                {m.isMajor && (
                                    <text
                                        x={tx}
                                        y={ty}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="9"
                                        fill="#1e40af"
                                        fontWeight="bold"
                                    >
                                        {m.deg}°
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    {Array.from({ length: 37 }, (_, i) => {
                        const deg = i * 5;
                        if (deg % 10 === 0) return null;
                        const rad = Math.PI - (deg * Math.PI) / 180;
                        return (
                            <line
                                key={deg}
                                x1={cx + r * Math.cos(rad)}
                                y1={cy - r * Math.sin(rad)}
                                x2={cx + (r - 8) * Math.cos(rad)}
                                y2={cy - (r - 8) * Math.sin(rad)}
                                stroke="#1e40af"
                                strokeWidth="0.6"
                            />
                        );
                    })}
                    <line
                        x1={cx - r}
                        y1={cy}
                        x2={cx + r}
                        y2={cy}
                        stroke="#1e40af"
                        strokeWidth="2"
                    />
                    <circle cx={cx} cy={cy} r="3" fill="#1e40af" />
                    <text x={cx - r + 4} y={cy + 14} fontSize="8" fill="#1e40af" fontWeight="bold">
                        0°
                    </text>
                    <text x={cx + r - 14} y={cy + 14} fontSize="8" fill="#1e40af" fontWeight="bold">
                        180°
                    </text>
                </svg>
                <button
                    type="button"
                    onClick={onClose}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label="Açıölçeri kapat"
                    className="absolute top-0 right-0 w-5 h-5 bg-red-400 rounded-full text-white text-[11px] flex items-center justify-center hover:bg-red-500 font-bold leading-none"
                    title="Kapat"
                >
                    ×
                </button>
            </div>
        </motion.div>
    );
}
