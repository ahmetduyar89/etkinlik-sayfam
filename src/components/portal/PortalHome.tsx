// src/components/portal/PortalHome.tsx — ATÖLYE ANA SAYFASI
// Bölüm kartları `src/constants/portal.ts` içindeki kayıt defterinden gelir;
// yeni bir çalışma eklemek için bu dosyaya dokunmaya gerek yoktur.
import { ArrowUpRight, Lock } from 'lucide-react';
import { PORTAL_MODULES, type PortalModule } from '../../constants/portal';
import { cn } from '../../utils/cn';
import { InstallAppButton } from '../common/InstallAppButton';
import { lockApp } from '../../utils/auth';

interface PortalHomeProps {
    /** Uygulama içinde yaşayan bir bölüm açılacağında çağrılır. */
    onOpenInternal: (id: string) => void;
}

export function PortalHome({ onOpenInternal }: PortalHomeProps) {
    return (
        <div className="min-h-screen bg-background font-sans">
            <header className="border-b border-outline-variant bg-white">
                <div className="max-w-[1120px] mx-auto px-5 sm:px-8 py-4 flex items-center gap-3">
                    <span className="text-[19px] font-extrabold tracking-[-0.02em] text-on-surface font-headline-lg">
                        Ahmet <span className="text-primary">DUYAR</span>
                    </span>
                    <span className="hidden sm:inline text-[13px] text-on-surface-variant border-l border-outline-variant pl-3">
                        Atölye
                    </span>
                    <div className="flex-1" />
                    <InstallAppButton />
                    <button
                        type="button"
                        onClick={lockApp}
                        title="Çıkış yap"
                        aria-label="Çıkış yap"
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
                    >
                        <Lock className="w-[18px] h-[18px]" />
                    </button>
                </div>
            </header>

            <main className="max-w-[1120px] mx-auto px-5 sm:px-8 py-10 sm:py-14">
                <h1 className="text-[28px] sm:text-[34px] font-extrabold font-headline-lg tracking-[-0.03em] text-on-surface">
                    Atölye
                </h1>
                <p className="mt-2 text-[15px] text-on-surface-variant max-w-[560px]">
                    Bütün çalışmalar tek yerde. Devam etmek için bir bölüm seçin.
                </p>

                <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {PORTAL_MODULES.map((mod) => (
                        <ModuleCard key={mod.id} mod={mod} onOpenInternal={onOpenInternal} />
                    ))}
                </div>

                <p className="mt-10 text-[12.5px] text-on-surface-variant">
                    Yeni bir çalışma eklemek için: deposunu <code className="px-1 py-0.5 rounded bg-surface-container-high">apps/apps.json</code> dosyasına,
                    kartını <code className="px-1 py-0.5 rounded bg-surface-container-high">src/constants/portal.ts</code> dosyasına ekleyin.
                </p>
            </main>
        </div>
    );
}

function ModuleCard({ mod, onOpenInternal }: { mod: PortalModule; onOpenInternal: (id: string) => void }) {
    const isSoon = mod.status === 'soon';

    const body = (
        <>
            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                        mod.accent.bg,
                        mod.accent.text
                    )}
                >
                    <mod.icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-[17px] font-bold font-headline-md text-on-surface tracking-tight flex items-center gap-2">
                        {mod.title}
                        {isSoon && (
                            <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                                Yakında
                            </span>
                        )}
                    </h2>
                    {mod.meta && (
                        <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5">{mod.meta}</p>
                    )}
                </div>
                {!isSoon && (
                    <ArrowUpRight className="w-5 h-5 text-on-surface-variant flex-shrink-0" aria-hidden="true" />
                )}
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-on-surface-variant">{mod.description}</p>
        </>
    );

    const base =
        'text-left w-full bg-white border border-outline-variant rounded-[22px] p-5 sm:p-6 transition-all';

    if (isSoon) {
        return (
            <div className={cn(base, 'opacity-60 cursor-not-allowed')} aria-disabled="true">
                {body}
            </div>
        );
    }

    if (mod.kind === 'internal') {
        return (
            <button
                type="button"
                onClick={() => onOpenInternal(mod.id)}
                className={cn(base, 'ring-2 ring-transparent hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]', mod.accent.ring)}
            >
                {body}
            </button>
        );
    }

    return (
        <a
            href={mod.href}
            className={cn(base, 'block ring-2 ring-transparent hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]', mod.accent.ring)}
        >
            {body}
        </a>
    );
}
