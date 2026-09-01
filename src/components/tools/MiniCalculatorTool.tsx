import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Move, Minus, Square } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MiniCalculatorToolProps {
    onClose: () => void;
}

export function MiniCalculatorTool({ onClose }: MiniCalculatorToolProps) {
    const dragControls = useDragControls();
    const [display, setDisplay] = React.useState('0');
    const [prevValue, setPrevValue] = React.useState<number | null>(null);
    const [operation, setOperation] = React.useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = React.useState(false);
    const [minimized, setMinimized] = React.useState(false);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clearAll = () => {
        setDisplay('0');
        setPrevValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const clearDisplay = () => {
        setDisplay('0');
    };

    const toggleSign = () => {
        const val = parseFloat(display);
        if (!isNaN(val)) {
            setDisplay(String(-val));
        }
    };

    const inputPercent = () => {
        const val = parseFloat(display);
        if (!isNaN(val)) {
            setDisplay(String(val / 100));
        }
    };

    const inputSqrt = () => {
        const val = parseFloat(display);
        if (!isNaN(val) && val >= 0) {
            setDisplay(String(Math.sqrt(val)));
            setWaitingForOperand(true);
        }
    };

    const performOperation = (nextOp: string) => {
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
        } else if (operation) {
            const current = prevValue || 0;
            let newValue = current;

            switch (operation) {
                case '+':
                    newValue = current + inputValue;
                    break;
                case '-':
                    newValue = current - inputValue;
                    break;
                case '×':
                    newValue = current * inputValue;
                    break;
                case '÷':
                    newValue = inputValue !== 0 ? current / inputValue : 0;
                    break;
                default:
                    break;
            }

            // round to avoid float precision issues
            const rounded = Math.round(newValue * 1e10) / 1e10;
            setDisplay(String(rounded));
            setPrevValue(rounded);
        }

        setWaitingForOperand(true);
        setOperation(nextOp === '=' ? null : nextOp);
    };

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
                left: 100,
                touchAction: 'none',
            }}
        >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl text-white w-64 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
                    <div
                        onPointerDown={(e) => dragControls.start(e)}
                        className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-xs font-bold text-slate-300 hover:text-white"
                    >
                        <Move className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Hesap Makinesi</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setMinimized(!minimized)}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title={minimized ? 'Genişlet' : 'Küçült'}
                        >
                            {minimized ? <Square className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
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

                {/* Display Screen */}
                <div className="px-3 py-3 bg-black/40 text-right">
                    <div className="text-[10px] text-slate-400 font-mono h-4">
                        {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
                    </div>
                    <div className="text-2xl font-mono font-bold tracking-wider text-white overflow-hidden text-ellipsis whitespace-nowrap">
                        {display}
                    </div>
                </div>

                {/* Keypad (hidden if minimized) */}
                {!minimized && (
                    <div className="p-3 grid grid-cols-4 gap-1.5 bg-slate-900/50">
                        <button
                            type="button"
                            onClick={clearAll}
                            className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-colors"
                        >
                            AC
                        </button>
                        <button
                            type="button"
                            onClick={inputSqrt}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
                        >
                            √
                        </button>
                        <button
                            type="button"
                            onClick={inputPercent}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
                        >
                            %
                        </button>
                        <button
                            type="button"
                            onClick={() => performOperation('÷')}
                            className={cn(
                                'p-2.5 rounded-xl text-xs font-bold transition-colors',
                                operation === '÷' ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            )}
                        >
                            ÷
                        </button>

                        <button
                            type="button"
                            onClick={() => inputDigit('7')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            7
                        </button>
                        <button
                            type="button"
                            onClick={() => inputDigit('8')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            8
                        </button>
                        <button
                            type="button"
                            onClick={() => inputDigit('9')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            9
                        </button>
                        <button
                            type="button"
                            onClick={() => performOperation('×')}
                            className={cn(
                                'p-2.5 rounded-xl text-xs font-bold transition-colors',
                                operation === '×' ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            )}
                        >
                            ×
                        </button>

                        <button
                            type="button"
                            onClick={() => inputDigit('4')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            4
                        </button>
                        <button
                            type="button"
                            onClick={() => inputDigit('5')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            5
                        </button>
                        <button
                            type="button"
                            onClick={() => inputDigit('6')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            6
                        </button>
                        <button
                            type="button"
                            onClick={() => performOperation('-')}
                            className={cn(
                                'p-2.5 rounded-xl text-xs font-bold transition-colors',
                                operation === '-' ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            )}
                        >
                            -
                        </button>

                        <button
                            type="button"
                            onClick={() => inputDigit('1')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            1
                        </button>
                        <button
                            type="button"
                            onClick={() => inputDigit('2')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            2
                        </button>
                        <button
                            type="button"
                            onClick={() => inputDigit('3')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            3
                        </button>
                        <button
                            type="button"
                            onClick={() => performOperation('+')}
                            className={cn(
                                'p-2.5 rounded-xl text-xs font-bold transition-colors',
                                operation === '+' ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            )}
                        >
                            +
                        </button>

                        <button
                            type="button"
                            onClick={toggleSign}
                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors"
                        >
                            ±
                        </button>
                        <button
                            type="button"
                            onClick={() => inputDigit('0')}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            0
                        </button>
                        <button
                            type="button"
                            onClick={inputDecimal}
                            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors"
                        >
                            .
                        </button>
                        <button
                            type="button"
                            onClick={() => performOperation('=')}
                            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors shadow-lg shadow-indigo-600/30"
                        >
                            =
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
