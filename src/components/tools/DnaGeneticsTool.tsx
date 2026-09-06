// src/components/tools/DnaGeneticsTool.tsx
// 8. Sınıf LGS Fen Bilimleri - DNA, Genetik Kod ve Mendel Çaprazlama Laboratuvarı.
// Punnett karesi ile genotip/fenotip olasılık hesaplamaları ve interaktif nükleotid eşleşme bulmacası.

import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import {
    X,
    Maximize2,
    Minimize2,
    Camera,
    Dna,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Info,
    RefreshCw,
    Play,
    Pause,
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface DnaGeneticsToolProps {
    onClose: () => void;
    onInsertImage?: (dataUrl: string, width: number, height: number) => void;
}

type GeneticsTab = 'punnett' | 'dna_puzzle';

interface TraitOption {
    id: string;
    name: string;
    domLetter: string;
    recLetter: string;
    domName: string;
    recName: string;
    domColor: string;
    recColor: string;
    domEmoji: string;
    recEmoji: string;
}

const TRAITS: TraitOption[] = [
    {
        id: 'flower_color',
        name: 'Çiçek Rengi',
        domLetter: 'M',
        recLetter: 'm',
        domName: 'Mor Çiçek (Baskın)',
        recName: 'Beyaz Çiçek (Çekinik)',
        domColor: '#a855f7',
        recColor: '#e2e8f0',
        domEmoji: '🌸',
        recEmoji: '💮',
    },
    {
        id: 'seed_shape',
        name: 'Tohum Şekli',
        domLetter: 'D',
        recLetter: 'd',
        domName: 'Düz Tohum (Baskın)',
        recName: 'Buruşuk Tohum (Çekinik)',
        domColor: '#10b981',
        recColor: '#ca8a04',
        domEmoji: '🟢',
        recEmoji: '🟤',
    },
    {
        id: 'seed_color',
        name: 'Tohum Rengi',
        domLetter: 'S',
        recLetter: 's',
        domName: 'Sarı Tohum (Baskın)',
        recName: 'Yeşil Tohum (Çekinik)',
        domColor: '#eab308',
        recColor: '#22c55e',
        domEmoji: '🟡',
        recEmoji: '🟢',
    },
    {
        id: 'plant_height',
        name: 'Boy Uzunluğu',
        domLetter: 'U',
        recLetter: 'u',
        domName: 'Uzun Boy (Baskın)',
        recName: 'Kısa Boy (Çekinik)',
        domColor: '#06b6d4',
        recColor: '#64748b',
        domEmoji: '🌲',
        recEmoji: '🌱',
    },
];

type BaseType = 'A' | 'T' | 'G' | 'C';

export function DnaGeneticsTool({ onClose, onInsertImage }: DnaGeneticsToolProps) {
    const dragControls = useDragControls();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const [activeTab, setActiveTab] = React.useState<GeneticsTab>('punnett');
    const [isMaximized, setIsMaximized] = React.useState(false);

    // ── Punnett Karesi Durumları ──────────────────────────────────────
    const [selectedTrait, setSelectedTrait] = React.useState<TraitOption>(TRAITS[0]);
    // 0: Saf Baskın (AA), 1: Melez Baskın (Aa), 2: Saf Çekinik (aa)
    const [p1GenotypeIdx, setP1GenotypeIdx] = React.useState<number>(1); // Melez (Mm)
    const [p2GenotypeIdx, setP2GenotypeIdx] = React.useState<number>(1); // Melez (Mm)

    // ── DNA Bulmacası Durumları ───────────────────────────────────────
    const initialChain1: BaseType[] = ['A', 'T', 'G', 'C', 'T', 'A', 'C', 'G'];
    const [chain1, setChain1] = React.useState<BaseType[]>(initialChain1);
    const [userChain2, setUserChain2] = React.useState<(BaseType | null)[]>(new Array(8).fill(null));
    const [replicationStep, setReplicationStep] = React.useState<number>(0);
    const [isReplicating, setIsReplicating] = React.useState(false);

    // ── Çaprazlama Matematiksel Analizi ────────────────────────────────
    const getAlleles = (idx: number, trait: TraitOption): [string, string] => {
        if (idx === 0) return [trait.domLetter, trait.domLetter];
        if (idx === 1) return [trait.domLetter, trait.recLetter];
        return [trait.recLetter, trait.recLetter];
    };

    const p1Alleles = getAlleles(p1GenotypeIdx, selectedTrait);
    const p2Alleles = getAlleles(p2GenotypeIdx, selectedTrait);

    // 4 yavru kombinasyonu
    const offspring = [
        [p1Alleles[0], p2Alleles[0]].sort((a, b) => (a === selectedTrait.domLetter ? -1 : 1)).join(''),
        [p1Alleles[0], p2Alleles[1]].sort((a, b) => (a === selectedTrait.domLetter ? -1 : 1)).join(''),
        [p1Alleles[1], p2Alleles[0]].sort((a, b) => (a === selectedTrait.domLetter ? -1 : 1)).join(''),
        [p1Alleles[1], p2Alleles[1]].sort((a, b) => (a === selectedTrait.domLetter ? -1 : 1)).join(''),
    ];

    // Genotip istatistikleri
    const homDomStr = selectedTrait.domLetter + selectedTrait.domLetter;
    const hetStr = selectedTrait.domLetter + selectedTrait.recLetter;
    const homRecStr = selectedTrait.recLetter + selectedTrait.recLetter;

    const countHomDom = offspring.filter((g) => g === homDomStr).length;
    const countHet = offspring.filter((g) => g === hetStr).length;
    const countHomRec = offspring.filter((g) => g === homRecStr).length;

    const pctHomDom = (countHomDom / 4) * 100;
    const pctHet = (countHet / 4) * 100;
    const pctHomRec = (countHomRec / 4) * 100;

    // Fenotip istatistikleri
    const pctDomPheno = pctHomDom + pctHet;
    const pctRecPheno = pctHomRec;

    // ── DNA Replikasyonu Animasyonu ───────────────────────────────────
    React.useEffect(() => {
        if (!isReplicating) return;
        const interval = setInterval(() => {
            setReplicationStep((s) => {
                if (s >= 100) {
                    setIsReplicating(false);
                    return 100;
                }
                return s + 4;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [isReplicating]);

    // DNA Tamamlama kontrolü
    const correctPairs: Record<BaseType, BaseType> = {
        A: 'T',
        T: 'A',
        G: 'C',
        C: 'G',
    };

    const isChain2Complete = userChain2.every((b) => b !== null);
    const isChain2Correct =
        isChain2Complete && userChain2.every((b, i) => b === correctPairs[chain1[i]]);

    // ── Tahtaya Damgalama (Canvas Çizimi) ──────────────────────────────
    const handleInsertToCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !onInsertImage) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = 620;
        const h = 420;
        canvas.width = w;
        canvas.height = h;

        // Koyu şık kart arka planı
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, w - 2, h - 2);

        if (activeTab === 'punnett') {
            // Başlık
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText(`Mendel Genetik Çaprazlama (${selectedTrait.name})`, 30, 40);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px sans-serif';
            ctx.fillText(
                `Ebeveyn 1: ${p1Alleles.join('')} × Ebeveyn 2: ${p2Alleles.join('')}`,
                30,
                65
            );

            // Punnett Karesi Tablosu
            const tX = 50;
            const tY = 100;
            const sz = 75;

            // Gamet başlıkları
            ctx.font = 'bold 18px sans-serif';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText(p1Alleles[0], tX + sz + sz / 2 - 8, tY + 28);
            ctx.fillText(p1Alleles[1], tX + sz * 2 + sz / 2 - 8, tY + 28);

            ctx.fillText(p2Alleles[0], tX + 20, tY + sz + sz / 2 + 6);
            ctx.fillText(p2Alleles[1], tX + 20, tY + sz * 2 + sz / 2 + 6);

            // 4 yavru hücresi
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 2; c++) {
                    const idx = r * 2 + c;
                    const cellX = tX + sz * (c + 1);
                    const cellY = tY + sz * (r + 1) - 15;
                    const val = offspring[idx];

                    ctx.fillStyle = val.includes(selectedTrait.domLetter)
                        ? 'rgba(168, 85, 247, 0.25)'
                        : 'rgba(226, 232, 240, 0.15)';
                    ctx.fillRect(cellX, cellY, sz, sz);

                    ctx.strokeStyle = '#6366f1';
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(cellX, cellY, sz, sz);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 22px sans-serif';
                    ctx.fillText(val, cellX + 20, cellY + 45);
                }
            }

            // Sağ Analiz Paneli
            const rightX = 310;
            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Genotip Dağılımı:', rightX, 115);

            ctx.font = '13px sans-serif';
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(`• ${homDomStr} (Saf Baskın): %${pctHomDom}`, rightX, 145);
            ctx.fillText(`• ${hetStr} (Melez Baskın): %${pctHet}`, rightX, 175);
            ctx.fillText(`• ${homRecStr} (Saf Çekinik): %${pctHomRec}`, rightX, 205);

            ctx.fillStyle = '#cbd5e1';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Fenotip Dağılımı:', rightX, 250);

            ctx.fillStyle = selectedTrait.domColor;
            ctx.fillText(`• %${pctDomPheno} ${selectedTrait.domName}`, rightX, 280);

            ctx.fillStyle = '#94a3b8';
            ctx.fillText(`• %${pctRecPheno} ${selectedTrait.recName}`, rightX, 310);

            // Alt LGS İpucu
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'italic 12px sans-serif';
            ctx.fillText('LGS Notu: Çekinik fenotip ancak her iki ebeveynden de çekinik gen gelirse ortaya çıkar.', 30, 395);
        } else {
            // DNA Bulmacası Çizimi
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 18px sans-serif';
            ctx.fillText('DNA Çift Sarmalı ve Nükleotid Eşlenmesi', 30, 40);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px sans-serif';
            ctx.fillText('Adenin = Timin (İkili Bağ)  ·  Guanin ≡ Sitozin (Üçlü Bağ)', 30, 65);

            // DNA Zinciri
            for (let i = 0; i < chain1.length; i++) {
                const b1 = chain1[i];
                const b2 = userChain2[i] || '?';
                const y = 110 + i * 32;

                // 1. Zincir bazı
                ctx.fillStyle = getBaseColor(b1);
                ctx.fillRect(80, y, 40, 24);
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(b1, 95, y + 17);

                // Hidrojen bağları
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = b1 === 'A' || b1 === 'T' ? 2 : 3;
                ctx.beginPath();
                ctx.moveTo(125, y + 8);
                ctx.lineTo(205, y + 8);
                ctx.moveTo(125, y + 16);
                ctx.lineTo(205, y + 16);
                if (b1 === 'G' || b1 === 'C') {
                    ctx.moveTo(125, y + 12);
                    ctx.lineTo(205, y + 12);
                }
                ctx.stroke();

                // 2. Zincir bazı
                ctx.fillStyle = b2 === '?' ? '#334155' : getBaseColor(b2 as BaseType);
                ctx.fillRect(210, y, 40, 24);
                ctx.fillStyle = b2 === '?' ? '#94a3b8' : '#000000';
                ctx.font = 'bold 14px sans-serif';
                ctx.fillText(b2, 225, y + 17);
            }

            // Sayısal eşitlik kutusu
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(310, 110, 280, 160);
            ctx.strokeStyle = '#475569';
            ctx.strokeRect(310, 110, 280, 160);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText('Nükleotid Eşitlikleri (LGS):', 325, 140);

            ctx.fillStyle = '#e2e8f0';
            ctx.font = '12.5px sans-serif';
            ctx.fillText('• Toplam Nükleotid = Toplam Fosfat', 325, 170);
            ctx.fillText('• Toplam Nükleotid = Toplam Deoksiriboz', 325, 195);
            ctx.fillText('• Toplam Adenin = Toplam Timin', 325, 220);
            ctx.fillText('• Toplam Guanin = Toplam Sitozin', 325, 245);
        }

        const dataUrl = canvas.toDataURL('image/png');
        onInsertImage(dataUrl, 580, 390);
    };

    function getBaseColor(b: BaseType): string {
        switch (b) {
            case 'A':
                return '#ef4444'; // Kırmızı (Adenin)
            case 'T':
                return '#3b82f6'; // Mavi (Timin)
            case 'G':
                return '#10b981'; // Yeşil (Guanin)
            case 'C':
                return '#f59e0b'; // Sarı (Sitozin)
        }
    }

    return (
        <motion.div
            ref={containerRef}
            drag={!isMaximized}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{
                opacity: 1,
                scale: 1,
                width: isMaximized ? '98vw' : '780px',
                height: isMaximized ? '95vh' : '570px',
            }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className={cn(
                'fixed z-[5100] flex flex-col bg-[#13151f]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden',
                isMaximized ? 'top-3 left-3' : 'top-12 left-1/2 -translate-x-1/2'
            )}
        >
            <canvas ref={canvasRef} className="hidden" />

            {/* Üst Başlık Çubuğu */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-purple-950/80 via-[#1a172c] to-[#13151f] border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-400">
                        <Dna className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                DNA & Genetik Kod ve Mendel Çaprazlama
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                8. Sınıf Fen
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Punnett karesi olasılıkları, nükleotid eşleşmesi ve DNA replikasyonu
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {onInsertImage && (
                        <button
                            type="button"
                            onClick={handleInsertToCanvas}
                            title="Tahtaya Aktar / Damgala"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
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

            {/* Modül Seçim Sekmeleri */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/20">
                <button
                    type="button"
                    onClick={() => setActiveTab('punnett')}
                    className={cn(
                        'flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
                        activeTab === 'punnett'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <span>🌱 1. Mendel Genetik Çaprazlama (Punnett Karesi)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('dna_puzzle')}
                    className={cn(
                        'flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all',
                        activeTab === 'dna_puzzle'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    <Dna className="w-3.5 h-3.5" />
                    <span>2. Nükleotid Dizilim & Replikasyon Bulmacası</span>
                </button>
            </div>

            {/* İçerik */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                {activeTab === 'punnett' ? (
                    <>
                        {/* Sol Punnett Tablosu & Karakter Seçimi */}
                        <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-[#0f1019]">
                            {/* Bezelye Karakteri Seçimi */}
                            <div className="flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar">
                                {TRAITS.map((trait) => (
                                    <button
                                        key={trait.id}
                                        type="button"
                                        onClick={() => setSelectedTrait(trait)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all',
                                            selectedTrait.id === trait.id
                                                ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                        )}
                                    >
                                        <span>{trait.domEmoji}</span>
                                        <span>{trait.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Ebeveyn Seçiciler */}
                            <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 my-2">
                                <div>
                                    <span className="text-[11px] font-bold text-amber-400 block mb-1">
                                        Ebeveyn 1 (Anne Genotipi):
                                    </span>
                                    <div className="grid grid-cols-3 gap-1">
                                        {[
                                            {
                                                idx: 0,
                                                label: `${selectedTrait.domLetter}${selectedTrait.domLetter}`,
                                                sub: 'Saf Baskın',
                                            },
                                            {
                                                idx: 1,
                                                label: `${selectedTrait.domLetter}${selectedTrait.recLetter}`,
                                                sub: 'Melez Baskın',
                                            },
                                            {
                                                idx: 2,
                                                label: `${selectedTrait.recLetter}${selectedTrait.recLetter}`,
                                                sub: 'Saf Çekinik',
                                            },
                                        ].map((g) => (
                                            <button
                                                key={g.idx}
                                                type="button"
                                                onClick={() => setP1GenotypeIdx(g.idx)}
                                                className={cn(
                                                    'p-1.5 rounded-lg border text-center transition-all',
                                                    p1GenotypeIdx === g.idx
                                                        ? 'bg-amber-600/30 border-amber-400 text-white font-bold'
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                                )}
                                            >
                                                <span className="block text-xs font-mono">{g.label}</span>
                                                <span className="block text-[9px] text-slate-300/70">{g.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] font-bold text-emerald-400 block mb-1">
                                        Ebeveyn 2 (Baba Genotipi):
                                    </span>
                                    <div className="grid grid-cols-3 gap-1">
                                        {[
                                            {
                                                idx: 0,
                                                label: `${selectedTrait.domLetter}${selectedTrait.domLetter}`,
                                                sub: 'Saf Baskın',
                                            },
                                            {
                                                idx: 1,
                                                label: `${selectedTrait.domLetter}${selectedTrait.recLetter}`,
                                                sub: 'Melez Baskın',
                                            },
                                            {
                                                idx: 2,
                                                label: `${selectedTrait.recLetter}${selectedTrait.recLetter}`,
                                                sub: 'Saf Çekinik',
                                            },
                                        ].map((g) => (
                                            <button
                                                key={g.idx}
                                                type="button"
                                                onClick={() => setP2GenotypeIdx(g.idx)}
                                                className={cn(
                                                    'p-1.5 rounded-lg border text-center transition-all',
                                                    p2GenotypeIdx === g.idx
                                                        ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold'
                                                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                                                )}
                                            >
                                                <span className="block text-xs font-mono">{g.label}</span>
                                                <span className="block text-[9px] text-slate-300/70">{g.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 2x2 Punnett Karesi */}
                            <div className="flex-1 flex flex-col items-center justify-center p-2">
                                <div className="grid grid-cols-[50px_90px_90px] gap-2 items-center text-center">
                                    {/* Üst başlık boşluğu */}
                                    <div />
                                    <div className="text-sm font-bold font-mono text-amber-400 bg-amber-500/10 py-1 rounded-md border border-amber-500/20">
                                        {p1Alleles[0]}
                                    </div>
                                    <div className="text-sm font-bold font-mono text-amber-400 bg-amber-500/10 py-1 rounded-md border border-amber-500/20">
                                        {p1Alleles[1]}
                                    </div>

                                    {/* 1. Satır */}
                                    <div className="text-sm font-bold font-mono text-emerald-400 bg-emerald-500/10 py-3 rounded-md border border-emerald-500/20">
                                        {p2Alleles[0]}
                                    </div>
                                    <div className="p-3 bg-purple-900/30 border-2 border-purple-500/40 rounded-xl shadow-md">
                                        <span className="block text-lg font-mono font-extrabold text-white">
                                            {offspring[0]}
                                        </span>
                                        <span className="text-[10px] text-purple-200">
                                            {offspring[0].includes(selectedTrait.domLetter)
                                                ? selectedTrait.domEmoji
                                                : selectedTrait.recEmoji}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-purple-900/30 border-2 border-purple-500/40 rounded-xl shadow-md">
                                        <span className="block text-lg font-mono font-extrabold text-white">
                                            {offspring[1]}
                                        </span>
                                        <span className="text-[10px] text-purple-200">
                                            {offspring[1].includes(selectedTrait.domLetter)
                                                ? selectedTrait.domEmoji
                                                : selectedTrait.recEmoji}
                                        </span>
                                    </div>

                                    {/* 2. Satır */}
                                    <div className="text-sm font-bold font-mono text-emerald-400 bg-emerald-500/10 py-3 rounded-md border border-emerald-500/20">
                                        {p2Alleles[1]}
                                    </div>
                                    <div className="p-3 bg-purple-900/30 border-2 border-purple-500/40 rounded-xl shadow-md">
                                        <span className="block text-lg font-mono font-extrabold text-white">
                                            {offspring[2]}
                                        </span>
                                        <span className="text-[10px] text-purple-200">
                                            {offspring[2].includes(selectedTrait.domLetter)
                                                ? selectedTrait.domEmoji
                                                : selectedTrait.recEmoji}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-purple-900/30 border-2 border-purple-500/40 rounded-xl shadow-md">
                                        <span className="block text-lg font-mono font-extrabold text-white">
                                            {offspring[3]}
                                        </span>
                                        <span className="text-[10px] text-purple-200">
                                            {offspring[3].includes(selectedTrait.domLetter)
                                                ? selectedTrait.domEmoji
                                                : selectedTrait.recEmoji}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sağ İstatistik & Olasılık Paneli */}
                        <div className="w-full md:w-[290px] flex-shrink-0 bg-[#171926] border-t md:border-t-0 md:border-l border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
                            <div>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                                    Genotip Olasılıkları
                                </span>
                                <div className="flex flex-col gap-2">
                                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-mono text-purple-300 font-bold">{homDomStr} (Saf Baskın)</span>
                                            <span className="font-bold text-white">%{pctHomDom}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-purple-500" style={{ width: `${pctHomDom}%` }} />
                                        </div>
                                    </div>

                                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-mono text-indigo-300 font-bold">{hetStr} (Melez Baskın)</span>
                                            <span className="font-bold text-white">%{pctHet}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${pctHet}%` }} />
                                        </div>
                                    </div>

                                    <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-mono text-slate-300 font-bold">{homRecStr} (Saf Çekinik)</span>
                                            <span className="font-bold text-white">%{pctHomRec}</span>
                                        </div>
                                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-500" style={{ width: `${pctHomRec}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                                    Fenotip (Dış Görünüş)
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-center">
                                        <span className="text-2xl block mb-1">{selectedTrait.domEmoji}</span>
                                        <span className="text-xs font-bold text-white block">
                                            %{pctDomPheno}
                                        </span>
                                        <span className="text-[10px] text-purple-200/80 leading-tight block mt-0.5">
                                            {selectedTrait.domName.split(' ')[0]}
                                        </span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-center">
                                        <span className="text-2xl block mb-1">{selectedTrait.recEmoji}</span>
                                        <span className="text-xs font-bold text-white block">
                                            %{pctRecPheno}
                                        </span>
                                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                                            {selectedTrait.recName.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-start gap-1.5">
                                <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                                <span>
                                    <strong>Mendel Kuralı:</strong> Baskın gen ({selectedTrait.domLetter}) çekinik geni ({selectedTrait.recLetter}) baskılar. Çekinik özellik yalnızca saf halde ({homRecStr}) fenotipte görülür.
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    /* DNA Nükleotid & Replikasyon Bulmacası */
                    <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                        {/* Sol Zincir Eşleme Alanı */}
                        <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-[#0d0e17]">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-bold text-white">
                                        Karşı Zinciri Doğru Nükleotidlerle Tamamlayın
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Adenin (A) ↔ Timin (T) &nbsp;|&nbsp; Guanin (G) ↔ Sitozin (C)
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUserChain2(new Array(8).fill(null))}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                                    title="Sıfırla"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>

                            {/* DNA Çift Sarmal Zincirleri */}
                            <div className="flex-1 flex flex-col gap-2 max-w-[440px] mx-auto w-full py-2">
                                {chain1.map((b1, idx) => {
                                    const userB2 = userChain2[idx];
                                    const isCorrect = userB2 === correctPairs[b1];
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5"
                                        >
                                            {/* 1. Zincir */}
                                            <div
                                                className="w-10 h-8 rounded-lg flex items-center justify-center font-bold text-black font-mono shadow-sm"
                                                style={{ backgroundColor: getBaseColor(b1) }}
                                            >
                                                {b1}
                                            </div>

                                            {/* Hidrojen Bağları */}
                                            <div className="flex-1 flex items-center justify-center gap-1 px-4">
                                                <div className="flex flex-col gap-1 w-full max-w-[60px]">
                                                    <div className="h-0.5 bg-slate-600 rounded-full" />
                                                    <div className="h-0.5 bg-slate-600 rounded-full" />
                                                    {(b1 === 'G' || b1 === 'C') && (
                                                        <div className="h-0.5 bg-slate-600 rounded-full" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-bold">
                                                    {b1 === 'A' || b1 === 'T' ? '2’li Bağ' : '3’lü Bağ'}
                                                </span>
                                            </div>

                                            {/* 2. Zincir (Kullanıcı Seçimi) */}
                                            {userB2 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const copy = [...userChain2];
                                                        copy[idx] = null;
                                                        setUserChain2(copy);
                                                    }}
                                                    className={cn(
                                                        'w-10 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-black shadow-md transition-transform active:scale-90',
                                                        isCorrect ? 'ring-2 ring-emerald-400' : 'ring-2 ring-red-400'
                                                    )}
                                                    style={{ backgroundColor: getBaseColor(userB2) }}
                                                >
                                                    {userB2}
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    {(['A', 'T', 'G', 'C'] as BaseType[]).map((btnBase) => (
                                                        <button
                                                            key={btnBase}
                                                            type="button"
                                                            onClick={() => {
                                                                const copy = [...userChain2];
                                                                copy[idx] = btnBase;
                                                                setUserChain2(copy);
                                                            }}
                                                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-black font-mono transition-transform hover:scale-110 active:scale-95"
                                                            style={{ backgroundColor: getBaseColor(btnBase) }}
                                                        >
                                                            {btnBase}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tamamlanma Durumu */}
                            {isChain2Complete && (
                                <div
                                    className={cn(
                                        'mt-2 p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold',
                                        isChain2Correct
                                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                            : 'bg-red-950/40 border-red-500/50 text-red-300'
                                    )}
                                >
                                    {isChain2Correct ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                            <span>Harika! Tüm baz çiftleri kusursuz eşleşti. (A=T, G≡C)</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                            <span>Bazı eşleşmeler hatalı! Lütfen yanlış nükleotidleri düzeltin.</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sağ Replikasyon & Formül Paneli */}
                        <div className="w-full md:w-[280px] flex-shrink-0 bg-[#171926] border-t md:border-t-0 md:border-l border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
                            <div>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                                    Nükleotidin Yapısı
                                </span>
                                <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-2 text-xs text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px]">
                                            P
                                        </span>
                                        <span>Fosfat</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded bg-blue-500 text-white font-bold flex items-center justify-center text-[10px]">
                                            D
                                        </span>
                                        <span>Deoksiriboz Şekeri</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded bg-purple-500 text-white font-bold flex items-center justify-center text-[10px]">
                                            B
                                        </span>
                                        <span>Organik Baz (A, T, G, C)</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                                    DNA Kendini Eşleme (Replikasyon)
                                </span>
                                <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex flex-col gap-2.5">
                                    <p className="text-[11px] text-slate-300 leading-relaxed">
                                        DNA fermuar gibi açılır. Sitoplazmadaki serbest nükleotidler çekirdeğe girerek eşlenir.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplicationStep(0);
                                            setIsReplicating(true);
                                        }}
                                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>{isReplicating ? 'Eşleniyor...' : 'Replikasyonu Canlandır'}</span>
                                    </button>

                                    {replicationStep > 0 && (
                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-1">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-100"
                                                style={{ width: `${replicationStep}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[10.5px] text-indigo-200">
                                <strong>LGS Soru Kalıbı:</strong> Bir DNA molekülünde daima:{' '}
                                <span className="font-mono underline">Toplam Nükleotid = Fosfat = Şeker = Baz</span>{' '}
                                eşitliği vardır.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
