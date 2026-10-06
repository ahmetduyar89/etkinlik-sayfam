import { QrLoginHelpButton } from '../common/QrLogin';
// src/components/portal/PortalHome.tsx — ATÖLYE ANA SAYFASI
// ─────────────────────────────────────────────────────────────────────
// Aydınlık, eğitsel bir kapak: kareli defter dokusu üzerinde yumuşak renk
// bulutları ve her çalışmanın kendi renk kimliğini taşıyan kartlar.
//
// Kartların içeriği `src/constants/portal.ts` içindeki kayıt defterinden
// gelir; yeni bir çalışma eklemek için bu dosyaya dokunmaya gerek yoktur.
// ─────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Sparkles, Crown, School } from 'lucide-react';
import { PORTAL_HOME_ENTRIES, PORTAL_MODULES, type PortalFolder, type PortalModule } from '../../constants/portal';
import { cn } from '../../utils/cn';
import { InstallAppButton } from '../common/InstallAppButton';
import { lockApp } from '../../utils/auth';

/** Kartlar sırayla belirsin; sayfa tek seferde "yapışmasın". */
const listVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

interface PortalHomeProps {
    /** Uygulama içinde yaşayan bir bölüm açılacağında çağrılır. */
    onOpenInternal: (id: string) => void;
    folder?: PortalFolder;
}

export function PortalHome({ onOpenInternal, folder }: PortalHomeProps) {
    const modules = folder
        ? PORTAL_MODULES.filter((mod) => folder.moduleIds.includes(mod.id))
        : PORTAL_HOME_ENTRIES;
    const hazirSayisi = modules.filter((m) => m.status === 'ready').length;
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (folder) {
            window.scrollTo(0, 0);
            headingRef.current?.focus({ preventScroll: true });
        }
    }, [folder]);

    return (
        <div className="relative min-h-[100svh] overflow-hidden bg-[#f6f7fb] font-sans">
            <Zemin />

            <div className="relative">
                <header className="border-b border-white/70 bg-white/70 backdrop-blur-xl">
                    <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 sm:gap-3 px-3 py-3 sm:py-4 sm:px-8">
                        <span className="font-headline-lg text-[19px] font-extrabold tracking-[-0.02em] text-slate-900">
                            Ahmet <span className="text-primary">DUYAR</span>
                        </span>
                        <span className="hidden border-l border-slate-200 pl-3 text-[13px] font-medium text-slate-500 sm:inline">
                            Atölye
                        </span>
                        <span className="hidden lg:inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2 py-0.5 rounded-full text-[11px] font-bold">
                            <Crown className="w-3 h-3 text-amber-600" />
                            Öğretmen / Admin
                        </span>
                        <div className="flex-1" />

                        <button
                            type="button"
                            onClick={() => onOpenInternal('siniflar')}
                            aria-label="Sınıflar yönetimini aç"
                            title="Sınıflar"
                            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <School className="h-[18px] w-[18px]" aria-hidden="true" />
                            <span className="hidden sm:inline">Sınıflar</span>
                        </button>
                        <QrLoginHelpButton />
                        <InstallAppButton />
                        <button
                            type="button"
                            onClick={lockApp}
                            title="Çıkış yap"
                            aria-label="Çıkış yap"
                            className="flex min-h-11 shrink-0 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-900/5 hover:text-slate-700"
                        >
                            <Lock className="h-[18px] w-[18px]" />
                        </button>
                    </div>
                </header>

                <main className="mx-auto max-w-[1240px] px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-7 sm:px-8 sm:pt-16">
                    {folder && (
                        <button
                            type="button"
                            onClick={() => onOpenInternal('portal')}
                            className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Atölye’ye dön
                        </button>
                    )}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-[12px] font-semibold text-indigo-600 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                            {hazirSayisi} {folder ? 'çalışma' : 'bölüm'} hazır
                        </span>

                        <h1 ref={headingRef} tabIndex={-1} className="font-headline-lg mt-5 text-[34px] font-extrabold leading-[1.1] tracking-[-0.035em] text-slate-900 outline-none sm:text-[46px]">
                            {folder?.title ?? 'Atölye'}
                        </h1>
                        <p className="mt-3 max-w-[540px] text-[15px] leading-relaxed text-slate-500 sm:text-[16px]">
                            {folder?.description ?? 'Derslerde kullandığım bütün çalışmalar tek yerde. Devam etmek için bir bölüm seçin.'}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={listVariants}
                        initial="hidden"
                        animate="show"
                        className="mt-9 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                        {modules.map((mod) => (
                            <ModuleCard key={mod.id} mod={mod} onOpenInternal={onOpenInternal} />
                        ))}
                    </motion.div>

                </main>
            </div>
        </div>
    );
}

/**
 * Sayfanın zemini: kareli defter dokusu ve üzerine düşen yumuşak renk
 * bulutları. Tamamen dekoratif olduğu için ekran okuyuculardan gizlidir.
 */
function Zemin() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {/* Kareli defter dokusu — üstte belirgin, aşağı indikçe siliniyor. */}
            <div
                className="absolute inset-0 opacity-[0.55]"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, rgba(148,163,184,0.16) 1px, transparent 1px),' +
                        'linear-gradient(to bottom, rgba(148,163,184,0.16) 1px, transparent 1px)',
                    backgroundSize: '46px 46px',
                    maskImage: 'linear-gradient(to bottom, black, transparent 78%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 78%)',
                }}
            />
            {/* Renk bulutları — kartların renk kimliğini zemine taşır. */}
            <div className="absolute -left-40 -top-48 h-[520px] w-[520px] rounded-full bg-indigo-300/25 blur-[120px]" />
            <div className="absolute -right-32 -top-24 h-[440px] w-[440px] rounded-full bg-violet-300/20 blur-[120px]" />
            <div className="absolute -bottom-40 left-1/3 h-[460px] w-[460px] rounded-full bg-emerald-200/25 blur-[120px]" />
            <div className="absolute -bottom-24 right-10 h-[360px] w-[360px] rounded-full bg-amber-200/25 blur-[110px]" />
        </div>
    );
}

function ModuleCard({ mod, onOpenInternal }: { mod: PortalModule; onOpenInternal: (id: string) => void }) {
    const isSoon = mod.status === 'soon';

    const body = (
        <>
            {/* Üst şerit — kartın renk kimliği. */}
            <span
                className={cn(
                    'absolute inset-x-0 top-0 h-1 rounded-t-[24px] bg-gradient-to-r transition-opacity',
                    mod.accent.strip,
                    isSoon ? 'opacity-40' : 'opacity-90 group-hover:opacity-100'
                )}
            />

            <div className="flex items-start gap-4">
                <span
                    className={cn(
                        'flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white transition-transform duration-300',
                        mod.accent.icon,
                        !isSoon && 'group-hover:scale-[1.06]'
                    )}
                    style={isSoon ? undefined : { boxShadow: `0 10px 22px -10px ${mod.accent.glow}` }}
                >
                    <mod.icon className="h-[26px] w-[26px]" strokeWidth={1.9} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="font-headline-md flex flex-wrap items-center gap-x-2 gap-y-1 text-[17px] font-bold leading-snug tracking-[-0.015em] text-slate-900">
                        {mod.title}
                        {isSoon && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                                Yakında
                            </span>
                        )}
                    </h2>
                    {mod.meta && (
                        <p className="mt-1 text-[12px] font-semibold text-slate-400">{mod.meta}</p>
                    )}
                </div>
            </div>

            <p className="mt-4 text-[13.5px] leading-relaxed text-slate-500">{mod.description}</p>

            {!isSoon && (
                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-slate-400 transition-colors group-hover:text-primary">
                    Aç
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </span>
            )}
        </>
    );

    const base =
        'group relative flex w-full flex-col overflow-hidden rounded-[24px] border border-white bg-white/85 p-6 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-18px_rgba(15,23,42,0.25)] backdrop-blur-sm';

    if (isSoon) {
        return (
            <motion.div variants={cardVariants} className={cn(base, 'opacity-70')} aria-disabled="true">
                {body}
            </motion.div>
        );
    }

    const interactive =
        'transition-all duration-300 hover:-translate-y-1 hover:border-white hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7fb]';

    // Hover'da kartın altına kendi renginde yumuşak bir gölge düşer.
    const hoverGolge = { '--kart-golge': mod.accent.glow } as React.CSSProperties;

    const ortak = {
        variants: cardVariants,
        className: cn(base, interactive, 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_22px_44px_-24px_var(--kart-golge)]'),
        style: hoverGolge,
    };

    if (mod.kind === 'internal' || mod.kind === 'folder') {
        return (
            <motion.button type="button" onClick={() => onOpenInternal(mod.id)} {...ortak}>
                {body}
            </motion.button>
        );
    }

    return (
        <motion.a href={mod.href} {...ortak}>
            {body}
        </motion.a>
    );
}
