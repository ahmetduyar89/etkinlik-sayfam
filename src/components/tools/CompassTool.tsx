import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, RotateCw, Check, Move } from 'lucide-react';

interface CompassToolProps {
    onClose: () => void;
    onDrawCircle?: (cx: number, cy: number, radius: number) => void;
}

export function CompassTool({ onClose, onDrawCircle }: CompassToolProps) {
    const dragControls = useDragControls();
    const [radius, setRadius] = React.useState(120); // pixel radius
    const [angle, setAngle] = React.useState(0); // rotation in degrees
    const [isDrawing, setIsDrawing] = React.useState(false);
    const toolRef = React.useRef<HTMLDivElement>(null);

    // Compass dimensions
    // Needle tip is at (cx, cy) = (160, 260) inside the component bounding box
    const needleX = 160;
    const needleY = 260;
    const topJointX = 160;
    const topJointY = 50;

    // Pencil tip relative to needle:
    const pencilX = needleX + radius;
    const pencilY = needleY;

    const handleDraw = () => {
        setIsDrawing(true);
        if (toolRef.current && onDrawCircle) {
            const rect = toolRef.current.getBoundingClientRect();
            // Actual screen position of needle tip
            const rad = (angle * Math.PI) / 180;
            // Center is rotated around needle point:
            const cx = rect.left + needleX;
            const cy = rect.top + needleY;
            onDrawCircle(cx, cy, radius);
        }
        setTimeout(() => setIsDrawing(false), 500);
    };

    return (
        <motion.div
            ref={toolRef}
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            className="fixed z-[11500] pointer-events-auto select-none"
            style={{
                top: 200,
                left: 300,
                touchAction: 'none',
            }}
        >
            <div className="relative bg-slate-900/90 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-2xl text-white min-w-[280px]">
                {/* Header controls */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-2">
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-xs font-bold text-slate-300 hover:text-white"
                    >
                        <Move className="w-3.5 h-3.5 text-indigo-400" />
                        <span>İnteraktif Pergel</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setAngle((a) => (a + 15) % 360)}
                            className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                            title="15° Döndür"
                        >
                            <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleDraw}
                            className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-bold flex items-center gap-1 transition-colors shadow"
                            title="Çember Çiz"
                        >
                            <Check className="w-3 h-3" />
                            <span>Çiz</span>
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

                {/* Radius Slider & Info */}
                <div className="pt-2 pb-1 flex items-center justify-between text-xs text-slate-300">
                    <span>Yarıçap (r): <strong className="text-white font-mono">{radius}px</strong> ({Math.round(radius / 3.78) / 10} cm)</span>
                    <span className="text-[10px] text-slate-400 font-mono">{angle}°</span>
                </div>
                <input
                    type="range"
                    min="40"
                    max="220"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-2"
                />

                {/* Visual SVG representation of the compass */}
                <div
                    className="relative flex items-center justify-center p-2 overflow-visible"
                    style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: `${needleX}px ${needleY}px`,
                        transition: isDrawing ? 'transform 0.4s ease-in-out' : 'none',
                    }}
                >
                    <svg
                        width={needleX + radius + 40}
                        height={needleY + 30}
                        viewBox={`0 0 ${needleX + radius + 40} ${needleY + 30}`}
                        className="overflow-visible"
                    >
                        {/* Needle / Center target */}
                        <circle cx={needleX} cy={needleY} r="5" fill="#ef4444" />
                        <circle cx={needleX} cy={needleY} r="12" fill="none" stroke="#ef4444" strokeDasharray="2 2" />

                        {/* Dashed radius guide */}
                        <line
                            x1={needleX}
                            y1={needleY}
                            x2={pencilX}
                            y2={pencilY}
                            stroke="#6366f1"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                        />

                        {/* Top Hinge (Tepe Mafsalı) */}
                        <circle cx={topJointX} cy={topJointY} r="10" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
                        <circle cx={topJointX} cy={topJointY} r="4" fill="#1e293b" />
                        <rect x={topJointX - 3} y={topJointY - 24} width="6" height="20" rx="3" fill="#cbd5e1" />

                        {/* Needle Leg (İğneli Sabit Kol) */}
                        <line
                            x1={topJointX}
                            y1={topJointY}
                            x2={needleX}
                            y2={needleY - 6}
                            stroke="#94a3b8"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                        <polygon
                            points={`${needleX - 3},${needleY - 6} ${needleX + 3},${needleY - 6} ${needleX},${needleY}`}
                            fill="#cbd5e1"
                        />

                        {/* Pencil Leg (Kalemli Hareketli Kol) */}
                        <line
                            x1={topJointX}
                            y1={topJointY}
                            x2={pencilX}
                            y2={pencilY - 14}
                            stroke="#6366f1"
                            strokeWidth="7"
                            strokeLinecap="round"
                        />
                        {/* Pencil Tip */}
                        <rect
                            x={pencilX - 4}
                            y={pencilY - 18}
                            width="8"
                            height="14"
                            rx="2"
                            fill="#f59e0b"
                        />
                        <polygon
                            points={`${pencilX - 4},${pencilY - 4} ${pencilX + 4},${pencilY - 4} ${pencilX},${pencilY}`}
                            fill="#1e293b"
                        />
                        {/* Pencil Lead Point */}
                        <circle cx={pencilX} cy={pencilY} r="3" fill="#4f46e5" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}
