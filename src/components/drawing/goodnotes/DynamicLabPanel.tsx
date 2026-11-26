import { AnimatePresence, motion } from 'framer-motion';
import { FlaskConical, Atom, Scale, Dna, TrendingUp, Type, Sparkles } from 'lucide-react';
import { cn } from '../../../utils/cn';
export function DynamicLabPanel({ open, onClose, onSelectTool, fixed = false }: {
    open: boolean;
    onClose: () => void;
    onSelectTool?: (id: string) => void;
    fixed?: boolean;
}) {
    return (<>
            <AnimatePresence>
                {open && (<div className={cn('pointer-events-none z-[5001]', fixed ? 'absolute top-2 right-4 sm:right-24' : 'relative')}>
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="pointer-events-auto flex flex-col gap-2.5 max-h-[68vh] overflow-y-auto bg-[#161826]/95 backdrop-blur-xl p-3.5 rounded-2xl border border-indigo-500/30 shadow-2xl w-[min(94vw,560px)]" onPointerDown={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
                                        <FlaskConical className="w-4 h-4"/>
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                                        Dinamik Laboratuvar & Branş Araçları
                                    </span>
                                </div>
                                <span className="text-[10px] text-indigo-300 font-semibold bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                    Canlı Deney
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button type="button" onClick={() => {
                onSelectTool?.('moleculeBuilder');
                onClose();
            }} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-indigo-600/25 border border-white/10 hover:border-indigo-500/50 text-left transition-all group">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Atom className="w-5 h-5"/>
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

                                <button type="button" onClick={() => {
                onSelectTool?.('simpleMachines');
                onClose();
            }} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-indigo-600/25 border border-white/10 hover:border-indigo-500/50 text-left transition-all group">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Scale className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-indigo-200">
                                            Basit Makineler Laboratuvarı
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            Kaldıraç, makara, palanga, eğik düzlem ve çıkrık
                                        </span>
                                    </div>
                                </button>

                                <button type="button" onClick={() => {
                onSelectTool?.('dnaGenetics');
                onClose();
            }} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-purple-600/25 border border-white/10 hover:border-purple-500/50 text-left transition-all group">
                                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Dna className="w-5 h-5"/>
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

                                <button type="button" onClick={() => {
                onSelectTool?.('linearGraph');
                onClose();
            }} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-blue-600/25 border border-white/10 hover:border-blue-500/50 text-left transition-all group">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-bold text-white group-hover:text-blue-200">
                                            Doğrusal Denklem & Grafik Damgası
                                        </span>
                                        <span className="block text-[10.5px] text-slate-400 leading-tight mt-0.5">
                                            y = mx + n doğrusu, eğim dik üçgeni ve kesişimler
                                        </span>
                                    </div>
                                </button>

                                <button type="button" onClick={() => {
                onSelectTool?.('mathFormula');
                onClose();
            }} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-emerald-600/25 border border-white/10 hover:border-emerald-500/50 text-left transition-all group">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Type className="w-5 h-5"/>
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

                                <button type="button" onClick={() => {
                onSelectTool?.('geogebra');
                onClose();
            }} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-indigo-600/25 border border-white/10 hover:border-indigo-500/50 text-left transition-all group">
                                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0 group-hover:scale-110 transition-transform">
                                        <Sparkles className="w-5 h-5"/>
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
                            </div>
                        </motion.div>
                    </div>)}
            </AnimatePresence>

    </>);
}
