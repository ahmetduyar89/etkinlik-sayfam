// src/components/common/InstallAppButton.tsx — "Uygulama olarak yükle" düğmesi.
// Yalnızca tarayıcı kurulumu destekliyorsa ve uygulama henüz kurulu değilse görünür.
import { useCallback, useEffect, useState } from 'react';
import { MonitorDown, Share, PlusSquare } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Modal } from './Modal';
import { cn } from '../../utils/cn';
import { INSTALL_STATE_EVENT, canInstall, isAppleMobile, isRunningStandalone, promptInstall } from '../../lib/pwa';

interface InstallAppButtonProps {
    className?: string;
}

export function InstallAppButton({ className }: InstallAppButtonProps) {
    const [available, setAvailable] = useState(() => canInstall() || isAppleMobile());
    const [guideOpen, setGuideOpen] = useState(false);
    const closeGuide = useCallback(() => setGuideOpen(false), []);

    useEffect(() => {
        const sync = () => setAvailable(!isRunningStandalone() && (canInstall() || isAppleMobile()));
        window.addEventListener(INSTALL_STATE_EVENT, sync);
        const standalone = window.matchMedia('(display-mode: standalone)');
        standalone.addEventListener('change', sync);
        return () => {
            window.removeEventListener(INSTALL_STATE_EVENT, sync);
            standalone.removeEventListener('change', sync);
        };
    }, []);

    if (!available || isRunningStandalone()) return null;

    return (
        <>
        <button
            type="button"
            onClick={() => isAppleMobile() ? setGuideOpen(true) : void promptInstall()}
            aria-label="Uygulama olarak yükle"
            title="Ana ekrana uygulama olarak ekle"
            className={cn(
                'min-h-11 min-w-11 flex-shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-[13px] font-semibold transition-all hover:bg-primary/15 active:scale-95',
                className
            )}
        >
            <MonitorDown className="w-4 h-4" />
            <span className="hidden lg:inline">Uygulama olarak yükle</span>
        </button>
        {createPortal(
            <Modal isOpen={guideOpen} onClose={closeGuide} title="iPad / iPhone’a uygulama olarak ekle">
                <div className="space-y-5 text-slate-600 text-base leading-relaxed">
                    <p>Atölye’yi ana ekranınızdan, kendi penceresinde açın.</p>
                    <ol className="space-y-4 list-decimal pl-6">
                        <li>Bu siteyi <strong>Safari</strong> ile açın.</li>
                        <li><Share className="inline w-5 h-5 text-indigo-600" aria-hidden="true" /> <strong>Paylaş</strong> menüsüne dokunun. Gerekirse <strong>Daha Fazla</strong> seçeneğini açın.</li>
                        <li><PlusSquare className="inline w-5 h-5 text-indigo-600" aria-hidden="true" /> <strong>Ana Ekrana Ekle</strong> seçeneğini seçin. Varsa <strong>Web Uygulaması Olarak Aç</strong> seçeneğini açık bırakın.</li>
                        <li><strong>Ekle</strong> düğmesine dokunun; ardından ana ekrandaki Atölye simgesini açın.</li>
                    </ol>
                    <p className="rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-900">Etkinlikler internet bağlantısıyla güncel kalır. Yeni uygulama sürümü hazır olduğunda bildirim görünür; çalışmanızı kaydedip “Güncelle”ye dokunun.</p>
                    <button type="button" onClick={closeGuide} className="min-h-11 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">Anladım</button>
                </div>
            </Modal>, document.body
        )}
        </>
    );
}
