// src/components/notebooks/NotebookQrModal.tsx — Defteri öğrenciye gönder
// Tahtaya yansıtılıp öğrencilerin kendi cihazlarından okutması içindir.
// Açılan bağlantı salt-okunurdur; öğrenci defteri değiştiremez.
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { Notebook } from '../../types';

interface NotebookQrModalProps {
    notebook: Notebook;
    onClose: () => void;
}

export function NotebookQrModal({ notebook, onClose }: NotebookQrModalProps) {
    // NotebookViewer'ın beklediği biçim: ?view=notebook&id=...
    const link = `${window.location.origin}${window.location.pathname}?view=notebook&id=${notebook.id}`;
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <Modal isOpen onClose={onClose} title="Öğrenciye gönder">
            <div className="flex flex-col items-center gap-5 py-2">
                <p className="text-[13.5px] text-on-surface-variant text-center max-w-[380px]">
                    <b className="text-on-surface">{notebook.title}</b> defterini açmak için öğrenciler
                    bu kodu kendi cihazlarıyla okutabilir. Bağlantı yalnızca görüntülemek içindir.
                </p>

                <div className="p-4 bg-white border border-outline-variant rounded-[22px] shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                    <QRCodeSVG value={link} size={220} level="M" marginSize={0} fgColor="#0f172a" bgColor="#ffffff" />
                </div>

                <div className="w-full flex items-center gap-2.5 bg-surface-container-high rounded-2xl px-4 h-12">
                    <span className="flex-1 min-w-0 truncate text-[13px] text-on-surface-variant">{link}</span>
                    <button
                        type="button"
                        onClick={copy}
                        className="flex-shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white border border-outline-variant text-[12.5px] font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Kopyalandı' : 'Kopyala'}
                    </button>
                </div>

                <p className="text-[12px] text-on-surface-variant text-center">
                    Öğrenci sayfayı açtığında defterin o anki hâlini görür; sonradan yaptığın
                    değişiklikler sayfayı yenilediğinde görünür.
                </p>
            </div>
        </Modal>
    );
}
