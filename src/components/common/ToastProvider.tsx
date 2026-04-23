import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ToastMessage, ToastVariant } from '../../types';

interface ToastContextValue {
    show: (message: string, variant?: ToastVariant) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
    success: 'bg-emerald-600 border-emerald-500',
    error: 'bg-red-600 border-red-500',
    info: 'bg-slate-800 border-slate-700',
};

const VARIANT_ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const show = useCallback(
        (message: string, variant: ToastVariant = 'info') => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            setToasts((prev) => [...prev, { id, message, variant }]);
            window.setTimeout(() => dismiss(id), 3800);
        },
        [dismiss]
    );

    const value = useMemo<ToastContextValue>(
        () => ({
            show,
            success: (m) => show(m, 'success'),
            error: (m) => show(m, 'error'),
            info: (m) => show(m, 'info'),
        }),
        [show]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="fixed top-4 right-4 z-[20000] flex flex-col gap-2 pointer-events-none"
            >
                <AnimatePresence>
                    {toasts.map((t) => {
                        const Icon = VARIANT_ICONS[t.variant];
                        return (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20 }}
                                role="status"
                                className={cn(
                                    'pointer-events-auto flex items-start gap-3 min-w-[260px] max-w-sm rounded-xl border px-4 py-3 text-white shadow-xl',
                                    VARIANT_STYLES[t.variant]
                                )}
                            >
                                <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                                <p className="flex-1 text-sm font-medium leading-snug">
                                    {t.message}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => dismiss(t.id)}
                                    aria-label="Bildirimi kapat"
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}
