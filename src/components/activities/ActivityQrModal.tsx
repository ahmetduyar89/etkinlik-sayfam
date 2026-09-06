// src/components/activities/ActivityQrModal.tsx — Öğrenci linkini QR olarak göster
// Derste tahtaya yansıtılıp öğrencilerin kendi cihazlarından okutması içindir.
// Link üretimi `handleCopyLink` ile birebir aynıdır.
import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../../utils/clipboard';
import { Modal } from '../common/Modal';
import type { Activity } from '../../types';

interface ActivityQrModalProps {
    activity: Activity;
    onClose: () => void;
}

export function ActivityQrModal({ activity, onClose }: ActivityQrModalProps) {
    // Link üretimi App.tsx'teki `handleCopyLink` ile birebir aynıdır.
    const link = `${window.location.origin}${window.location.pathname}?view=student&id=${activity.id}`;
    const [copied, setCopied] = useState(false);
    const [failed, setFailed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const copy = async () => {
        const ok = await copyText(link);
        setCopied(ok);
        setFailed(!ok);
        if (ok) {
            window.setTimeout(() => setCopied(false), 2000);
        } else {
            // Pano engellenmişse bağlantıyı seçip kullanıcıya bırak.
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    };

    return (
        <Modal isOpen onClose={onClose} title="Öğrenciye gönder">
            <div className="flex flex-col items-center gap-5 py-2">
                <p className="text-[13.5px] text-on-surface-variant text-center max-w-[380px]">
                    <b className="text-on-surface">{activity.title}</b> etkinliğini açmak için öğrenciler bu kodu
                    kendi cihazlarıyla okutabilir.
                </p>

                <div className="p-4 bg-white border border-outline-variant rounded-[22px] shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                    <QRCodeSVG value={link} size={220} level="M" marginSize={0} fgColor="#0f172a" bgColor="#ffffff" />
                </div>

                <div className="w-full flex items-center gap-2.5 bg-surface-container-high rounded-2xl px-4 h-12">
                    {/* Salt-okunur girdi: pano engellenirse elle seçilip kopyalanabilir. */}
                    <input
                        ref={inputRef}
                        type="text"
                        readOnly
                        value={link}
                        aria-label="Öğrenci bağlantısı"
                        onFocus={(e) => e.currentTarget.select()}
                        className="flex-1 min-w-0 bg-transparent text-[13px] text-on-surface-variant focus:outline-none"
                    />
                    <button
                        type="button"
                        onClick={copy}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white border border-outline-variant text-[12.5px] font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                </div>

                {failed && (
                    <p role="status" className="text-[12.5px] font-semibold text-amber-700 text-center -mt-2">
                        Tarayıcı panoya erişemedi. Bağlantı seçili — kopyalamak için
                        Ctrl+C (Mac'te ⌘+C) ya da telefonda basılı tutup “Kopyala”.
                    </p>
                )}
            </div>
        </Modal>
    );
}
