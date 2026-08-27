// src/components/common/InstallAppButton.tsx — "Uygulama olarak yükle" düğmesi.
// Yalnızca tarayıcı kurulumu destekliyorsa ve uygulama henüz kurulu değilse görünür.
import { useEffect, useState } from 'react';
import { MonitorDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { INSTALL_STATE_EVENT, canInstall, isRunningStandalone, promptInstall } from '../../lib/pwa';

interface InstallAppButtonProps {
    className?: string;
}

export function InstallAppButton({ className }: InstallAppButtonProps) {
    const [available, setAvailable] = useState(() => canInstall());

    useEffect(() => {
        const sync = () => setAvailable(canInstall());
        window.addEventListener(INSTALL_STATE_EVENT, sync);
        return () => window.removeEventListener(INSTALL_STATE_EVENT, sync);
    }, []);

    if (!available || isRunningStandalone()) return null;

    return (
        <button
            type="button"
            onClick={() => void promptInstall()}
            aria-label="Uygulama olarak yükle"
            title="Bu sayfayı bilgisayarına uygulama olarak kur"
            className={cn(
                'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-[13px] font-semibold transition-all hover:bg-primary/15 active:scale-95',
                className
            )}
        >
            <MonitorDown className="w-4 h-4" />
            <span className="hidden lg:inline">Uygulama olarak yükle</span>
        </button>
    );
}
