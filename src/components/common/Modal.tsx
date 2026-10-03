import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const titleId = React.useId();

    useEffect(() => {
        if (!isOpen) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            previouslyFocused?.focus?.();
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    // z-13000: çizim tuvalinin (4000/4001), araç çubuklarının ve
                    // taşınabilir araçların (11500) ÜSTÜNDE. Önceden 200'dü ve
                    // tuvalin altında kalıyordu — tuval üstünde açılan modallara
                    // tıklanamıyor, tıklamalar kaleme gidip sayfaya çizik atıyordu.
                    // Onay/soru pencereleri (19000/19500) ve bildirimler (20000)
                    // bir modalın içinden açılabildiği için onların altında kalır.
                    className="fixed inset-0 z-[13000] flex items-center justify-center px-4"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/30 backdrop-blur-md"
                    />
                    <motion.div
                        ref={contentRef}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        className="relative bg-white border border-outline-variant rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.18)] overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3
                                id={titleId}
                                className="font-headline-md text-xl text-on-surface tracking-tight"
                            >
                                {title}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Kapat"
                                className="p-2 hover:bg-surface-container-high rounded-xl transition-all text-on-surface-variant hover:text-on-surface"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto custom-scroll -mr-4 pr-4 flex-1">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
