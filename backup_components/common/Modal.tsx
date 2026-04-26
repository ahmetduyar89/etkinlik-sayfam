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
                    className="fixed inset-0 z-[200] flex items-center justify-center px-4"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
                    />
                    <motion.div
                        ref={contentRef}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                        className="relative bg-white border border-neutral-200 rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3
                                id={titleId}
                                className="text-lg font-semibold text-neutral-900 tracking-tight"
                            >
                                {title}
                            </h3>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Kapat"
                                className="p-1.5 hover:bg-neutral-100 rounded-md transition-colors text-neutral-400 hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <X className="w-4 h-4" />
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
