// src/components/tools/MathFormulaTool.tsx
// Profesyonel Matematik & Fen Formül ve Denklem Editörü (LaTeX / Math Paleti).
// Kesirler, karekök, üslü/köklü ifadeler, geometri sembolleri ve kimyasal reaksiyon okları.
// Canlı vektörel önizleme, MEB hazır şablonları ve tahtaya doğrudan damgalama desteği.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Maximize2,
    Minimize2,
    Camera,
    Copy,
    Check,
    RotateCcw,
    Type,
    Sparkles,
    BookOpen,
    Atom,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useToast } from '../common/ToastProvider';

export interface MathFormulaToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

interface PaletteSymbol {
    label: string;
    insertText: string;
    latex: string;
    category: 'basic' | 'power_root' | 'geometry' | 'chemistry' | 'relation';
}

const SYMBOLS: PaletteSymbol[] = [
    // Kesir & Kök & Üs
    { label: 'a/b', insertText: '^{numerator}/_{denominator}', latex: '\\frac{a}{b}', category: 'power_root' },
    { label: '√x', insertText: '√(', latex: '\\sqrt{x}', category: 'power_root' },
    { label: '∛x', insertText: '∛(', latex: '\\sqrt[3]{x}', category: 'power_root' },
    { label: 'x²', insertText: '²', latex: 'x^2', category: 'power_root' },
    { label: 'x³', insertText: '³', latex: 'x^3', category: 'power_root' },
    { label: 'xⁿ', insertText: '^n', latex: 'x^n', category: 'power_root' },
    { label: 'x₁', insertText: '₁', latex: 'x_1', category: 'power_root' },
    { label: 'x₂', insertText: '₂', latex: 'x_2', category: 'power_root' },

    // İşlem & Bağıntı
    { label: '±', insertText: '±', latex: '\\pm', category: 'relation' },
    { label: '·', insertText: '·', latex: '\\cdot', category: 'basic' },
    { label: '×', insertText: '×', latex: '\\times', category: 'basic' },
    { label: '÷', insertText: '÷', latex: '\\div', category: 'basic' },
    { label: '≠', insertText: '≠', latex: '\\neq', category: 'relation' },
    { label: '≈', insertText: '≈', latex: '\\approx', category: 'relation' },
    { label: '≤', insertText: '≤', latex: '\\le', category: 'relation' },
    { label: '≥', insertText: '≥', latex: '\\ge', category: 'relation' },
    { label: '∞', insertText: '∞', latex: '\\infty', category: 'basic' },

    // Geometri
    { label: 'π', insertText: 'π', latex: '\\pi', category: 'geometry' },
    { label: 'Δ', insertText: 'Δ', latex: '\\Delta', category: 'geometry' },
    { label: '∠', insertText: '∠', latex: '\\angle', category: 'geometry' },
    { label: '°', insertText: '°', latex: '^\\circ', category: 'geometry' },
    { label: '⊥', insertText: '⊥', latex: '\\perp', category: 'geometry' },
    { label: '∥', insertText: '∥', latex: '\\parallel', category: 'geometry' },
    { label: 'α', insertText: 'α', latex: '\\alpha', category: 'geometry' },
    { label: 'β', insertText: 'β', latex: '\\beta', category: 'geometry' },
    { label: 'θ', insertText: 'θ', latex: '\\theta', category: 'geometry' },

    // Kimya & Reaksiyon
    { label: '→', insertText: ' → ', latex: '\\rightarrow', category: 'chemistry' },
    { label: '⇄', insertText: ' ⇄ ', latex: '\\rightleftharpoons', category: 'chemistry' },
    { label: '↑', insertText: '↑', latex: '\\uparrow', category: 'chemistry' },
    { label: '↓', insertText: '↓', latex: '\\downarrow', category: 'chemistry' },
    { label: 'H₂O', insertText: 'H₂O', latex: 'H_2O', category: 'chemistry' },
    { label: 'CO₂', insertText: 'CO₂', latex: 'CO_2', category: 'chemistry' },
    { label: 'O₂', insertText: 'O₂', latex: 'O_2', category: 'chemistry' },
];

interface QuickTemplate {
    title: string;
    branch: string;
    text: string;
    latex: string;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
    {
        title: 'Pisagor Bağıntısı',
        branch: 'Matematik',
        text: 'a² + b² = c²',
        latex: 'a^2 + b^2 = c^2',
    },
    {
        title: 'İki Kare Farkı Özdeşliği',
        branch: 'Matematik',
        text: 'a² - b² = (a - b) · (a + b)',
        latex: 'a^2 - b^2 = (a-b)(a+b)',
    },
    {
        title: 'Tam Kare Özdeşliği',
        branch: 'Matematik',
        text: '(a + b)² = a² + 2ab + b²',
        latex: '(a+b)^2 = a^2 + 2ab + b^2',
    },
    {
        title: 'Doğrunun Eğimi Formülü',
        branch: 'Matematik',
        text: 'm = (y₂ - y₁) / (x₂ - x₁)',
        latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
    },
    {
        title: 'Kaldıraç Denge Şartı',
        branch: 'Fen Bilimleri',
        text: 'Kuvvet · Kuvvet Kolu = Yük · Yük Kolu (F · d₁ = P · d₂)',
        latex: 'F \\cdot d_1 = P \\cdot d_2',
    },
    {
        title: 'Eğik Düzlem Formülü',
        branch: 'Fen Bilimleri',
        text: 'Kuvvet · Rampa Boyu = Yük · Yükseklik (F · L = P · h)',
        latex: 'F \\cdot L = P \\cdot h',
    },
    {
        title: 'Katı ve Sıvı Basıncı',
        branch: 'Fen Bilimleri',
        text: 'P = F / S   ve   P = h · d · g',
        latex: 'P = \\frac{F}{S} \\quad \\text{ve} \\quad P = h \\cdot d \\cdot g',
    },
    {
        title: 'Fotosentez Denklemi',
        branch: 'Fen Bilimleri',
        text: '6CO₂ + 6H₂O + Işık → C₆H₁₂O₆ + 6O₂',
        latex: '6CO_2 + 6H_2O \\xrightarrow{Işık} C_6H_{12}O_6 + 6O_2',
    },
    {
        title: 'Oksijenli Solunum Denklemi',
        branch: 'Fen Bilimleri',
        text: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP',
        latex: 'C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + \\text{ATP}',
    },
];

export function MathFormulaTool({ onClose, onInsertImage }: MathFormulaToolProps) {
    const dragControls = useDragControls();
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const toast = useToast();

    const [isMaximized, setIsMaximized] = React.useState(false);
    const [formula, setFormula] = React.useState<string>('a² + b² = c²');
    const [fontSize, setFontSize] = React.useState<number>(36);
    const [fontColor, setFontColor] = React.useState<string>('#ffffff');
    const [bgStyle, setBgStyle] = React.useState<'dark' | 'transparent' | 'white'>('dark');
    const [copied, setCopied] = React.useState(false);

    // Sembol ekleme
    const insertSymbol = (sym: string) => {
        const textarea = inputRef.current;
        if (!textarea) {
            setFormula((prev) => prev + sym);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + sym + text.substring(end);
        setFormula(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + sym.length, start + sym.length);
        }, 10);
    };

    // Panoya kopyala
    const handleCopy = () => {
        navigator.clipboard.writeText(formula);
        setCopied(true);
        toast.success('Formül panoya kopyalandı.');
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Tahtaya Damgala / Vektörel Görsel Oluşturma ────────────────────
    const handleInsertToCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !onInsertImage) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Metin genişliğini ölç
        ctx.font = `bold ${fontSize}px "Cambria Math", "STIX Two Math", "Segoe UI Symbol", "Times New Roman", serif`;
        const lines = formula.split('\n');
        let maxW = 0;
        lines.forEach((l) => {
            const metrics = ctx.measureText(l);
            if (metrics.width > maxW) maxW = metrics.width;
        });

        const padX = 40;
        const padY = 30;
        const lineH = fontSize * 1.4;
        const w = Math.max(300, Math.ceil(maxW + padX * 2));
        const h = Math.max(100, Math.ceil(lines.length * lineH + padY * 2));

        canvas.width = w;
        canvas.height = h;

        // Arka plan
        if (bgStyle === 'dark') {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, 14);
            ctx.fill();
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (bgStyle === 'white') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(0, 0, w, h, 14);
            ctx.fill();
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            // Transparent
            ctx.clearRect(0, 0, w, h);
        }

        // Metin
        ctx.fillStyle = bgStyle === 'white' && fontColor === '#ffffff' ? '#0f172a' : fontColor;
        ctx.font = `bold ${fontSize}px "Cambria Math", "STIX Two Math", "Segoe UI Symbol", "Times New Roman", serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        lines.forEach((line, idx) => {
            const y = padY + lineH * idx + lineH / 2;
            ctx.fillText(line, w / 2, y);
        });

        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, Math.min(500, w), Math.min(300, h));
    };

    return (
        <motion.div
            drag={!isMaximized}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{
                opacity: 1,
                scale: 1,
                width: isMaximized ? '98vw' : '820px',
                height: isMaximized ? '95vh' : '580px',
            }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className={cn(
                'fixed z-[5100] flex flex-col bg-[#13151f]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden',
                isMaximized ? 'top-3 left-3' : 'top-12 left-1/2 -translate-x-1/2'
            )}
        >
            <canvas ref={canvasRef} className="hidden" />

            {/* Üst Başlık Çubuğu */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-950/80 via-[#181a29] to-[#13151f] border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
                        <Type className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                Formül & Denklem Editörü (LaTeX / Math Paleti)
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Matematik & Fen
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Kareköklü, üslü, kesirli ifadeler ve kimyasal reaksiyonları tahtaya damgalayın
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {onInsertImage && (
                        <button
                            type="button"
                            onClick={handleInsertToCanvas}
                            title="Formülü Tahtaya Damgala / Yapıştır"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                        >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Tahtaya Damgala</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Ana Gövde */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                {/* Sol Editör ve Önizleme */}
                <div className="flex-1 flex flex-col p-4 bg-[#0a0c16] overflow-y-auto">
                    {/* Canlı Vektörel Önizleme Kutusu */}
                    <div
                        className={cn(
                            'min-h-[140px] flex items-center justify-center p-6 rounded-2xl border mb-3 transition-colors shadow-inner select-all',
                            bgStyle === 'dark' && 'bg-[#0f172a] border-slate-700 text-white',
                            bgStyle === 'white' && 'bg-white border-slate-300 text-slate-900',
                            bgStyle === 'transparent' && 'bg-transparent border-dashed border-white/20'
                        )}
                        style={{
                            fontFamily: '"Cambria Math", "STIX Two Math", "Times New Roman", serif',
                            fontSize: `${fontSize}px`,
                            color: bgStyle === 'white' && fontColor === '#ffffff' ? '#0f172a' : fontColor,
                        }}
                    >
                        {formula.trim() ? (
                            <div className="text-center font-bold tracking-wider leading-relaxed whitespace-pre-wrap">
                                {formula}
                            </div>
                        ) : (
                            <span className="text-sm font-sans text-slate-500 italic">
                                Formül girmek için aşağıdaki sembollere veya şablonlara tıklayın...
                            </span>
                        )}
                    </div>

                    {/* Metin Giriş Alanı */}
                    <div className="relative flex-1 flex flex-col mb-3">
                        <textarea
                            ref={inputRef}
                            value={formula}
                            onChange={(e) => setFormula(e.target.value)}
                            rows={3}
                            placeholder="Formülü buraya yazın veya sembol paletini kullanın..."
                            className="w-full flex-1 p-3 bg-white/[0.04] border border-white/10 rounded-xl text-white font-mono text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                        />
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-all"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormula('')}
                                className="p-1 rounded-lg bg-white/10 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-all"
                                title="Temizle"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Görsel & Renk Ayarları */}
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 flex-wrap">
                        {/* Boyut Slider */}
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Boyut:</span>
                            <input
                                type="range"
                                min={24}
                                max={64}
                                step={2}
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-24 accent-indigo-500"
                            />
                            <span className="font-mono text-indigo-300">{fontSize}px</span>
                        </div>

                        {/* Renk Seçimi */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Renk:</span>
                            {['#ffffff', '#38bdf8', '#fbbf24', '#34d399', '#f472b6', '#a78bfa'].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setFontColor(c)}
                                    className={cn(
                                        'w-5 h-5 rounded-full border border-white/20 transition-transform',
                                        fontColor === c && 'scale-125 ring-2 ring-indigo-400'
                                    )}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>

                        {/* Arka Plan Stili */}
                        <div className="flex items-center gap-1">
                            <span className="text-slate-400">Zemin:</span>
                            {(['dark', 'white', 'transparent'] as const).map((bg) => (
                                <button
                                    key={bg}
                                    type="button"
                                    onClick={() => setBgStyle(bg)}
                                    className={cn(
                                        'px-2 py-0.5 rounded text-[10.5px] font-semibold border transition-all',
                                        bgStyle === bg
                                            ? 'bg-indigo-600 border-indigo-400 text-white'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                    )}
                                >
                                    {bg === 'dark' ? 'Koyu' : bg === 'white' ? 'Beyaz' : 'Şeffaf'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sağ Sembol & Şablon Paleti */}
                <div className="w-full md:w-[320px] flex-shrink-0 bg-[#171926] border-t md:border-t-0 md:border-l border-white/10 p-3.5 flex flex-col gap-3.5 overflow-y-auto">
                    {/* Sembol Butonları */}
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Matematik & Fen Sembolleri
                        </span>
                        <div className="grid grid-cols-5 gap-1.5">
                            {SYMBOLS.map((sym) => (
                                <button
                                    key={sym.label}
                                    type="button"
                                    onClick={() => insertSymbol(sym.insertText)}
                                    className="h-8 rounded-lg bg-white/5 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/50 text-white font-serif font-bold text-sm transition-all active:scale-95 flex items-center justify-center shadow-sm"
                                    title={sym.label}
                                >
                                    {sym.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MEB Hazır Şablonları */}
                    <div>
                        <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block mb-1.5">
                            Hızlı MEB Formül Şablonları
                        </span>
                        <div className="flex flex-col gap-1.5">
                            {QUICK_TEMPLATES.map((tmpl) => (
                                <button
                                    key={tmpl.title}
                                    type="button"
                                    onClick={() => setFormula(tmpl.text)}
                                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 text-left transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                                            {tmpl.title}
                                        </span>
                                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400">
                                            {tmpl.branch}
                                        </span>
                                    </div>
                                    <div className="text-[11.5px] text-slate-400 font-mono mt-0.5 truncate">
                                        {tmpl.text}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
