import React from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Pause, Play, RotateCcw, Settings, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface OverlayTimerProps {
    secs: number;
    running: boolean;
    total: number;
    onToggle: () => void;
    onReset: () => void;
    onSetTotal: (s: number) => void;
    onClose: () => void;
}

export function OverlayTimer({
    secs,
    running,
    total,
    onToggle,
    onReset,
    onSetTotal,
    onClose,
}: OverlayTimerProps) {
    const [showSetup, setShowSetup] = React.useState(false);
    const [inputMins, setInputMins] = React.useState(String(Math.round(total / 60)));
    const dragControls = useDragControls();
    const isLow = secs > 0 && secs < 60;
    const pct = total > 0 ? Math.max(0, secs / total) : 0;
    const r = 28;
    const circ = 2 * Math.PI * r;

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            className="fixed z-[12000] pointer-events-auto select-none"
            style={{ top: 80, right: 24, touchAction: 'none' }}
        >
            <div
                className={cn(
                    'flex flex-col items-center gap-2 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md',
                    isLow ? 'bg-red-950/95 border-red-500/60' : 'bg-[#1a1b26]/95 border-white/10'
                )}
            >
                <div
                    onPointerDown={(e) => dragControls.start(e)}
                    className="cursor-grab active:cursor-grabbing self-stretch flex justify-between items-center pb-1"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Sayaç
                    </span>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => setShowSetup((s) => !s)}
                            aria-label="Süreyi ayarla"
                            className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Settings className="w-3 h-3" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Sayacı kapat"
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
                <div
                    className="relative flex items-center justify-center"
                    style={{ width: 80, height: 80 }}
                >
                    <svg width="80" height="80" className="absolute -rotate-90" aria-hidden="true">
                        <circle
                            cx="40"
                            cy="40"
                            r={r}
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="4"
                        />
                        <circle
                            cx="40"
                            cy="40"
                            r={r}
                            fill="none"
                            stroke={isLow ? '#ef4444' : '#4f46e5'}
                            strokeWidth="4"
                            strokeDasharray={circ}
                            strokeDashoffset={circ * (1 - pct)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s' }}
                        />
                    </svg>
                    <span
                        aria-live="polite"
                        className={cn(
                            'text-xl font-black tabular-nums',
                            isLow ? 'text-red-400' : 'text-white'
                        )}
                    >
                        {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}
                    </span>
                </div>
                <AnimatePresence>
                    {showSetup && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden w-full"
                        >
                            <div className="flex items-center gap-2 pt-1">
                                <label htmlFor="timer-mins" className="sr-only">
                                    Dakika
                                </label>
                                <input
                                    id="timer-mins"
                                    type="number"
                                    min={1}
                                    max={90}
                                    value={inputMins}
                                    onChange={(e) => setInputMins(e.target.value)}
                                    className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm text-center focus:outline-none focus:border-indigo-500"
                                />
                                <span className="text-xs text-slate-400">dk</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const n = parseInt(inputMins, 10);
                                        const s = Number.isFinite(n) ? n * 60 : 0;
                                        if (s > 0) {
                                            onSetTotal(s);
                                            setShowSetup(false);
                                        }
                                    }}
                                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                                >
                                    Ayarla
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={running ? 'Duraklat' : 'Başlat'}
                        className={cn(
                            'p-2 rounded-xl transition-all',
                            running
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                : 'bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600/50'
                        )}
                    >
                        {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        aria-label="Sıfırla"
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
