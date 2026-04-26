import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'default';
}

type Confirm = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<ConfirmOptions | null>(null);
    const resolverRef = useRef<((v: boolean) => void) | null>(null);
    const confirmBtnRef = useRef<HTMLButtonElement>(null);

    const confirm = useCallback<Confirm>((opts) => {
        setState(opts);
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const resolve = useCallback((val: boolean) => {
        resolverRef.current?.(val);
        resolverRef.current = null;
        setState(null);
    }, []);

    React.useEffect(() => {
        if (!state) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') resolve(false);
            if (e.key === 'Enter') resolve(true);
        };
        window.addEventListener('keydown', onKey);
        confirmBtnRef.current?.focus();
        return () => window.removeEventListener('keydown', onKey);
    }, [state, resolve]);

    const value = useMemo(() => confirm, [confirm]);
    const isDanger = state?.variant === 'danger';

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {state && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                        className="fixed inset-0 z-[19000] flex items-center justify-center px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                            onClick={() => resolve(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 space-y-5"
                        >
                            <div className="flex gap-4">
                                <div
                                    className={
                                        'w-10 h-10 shrink-0 rounded-full flex items-center justify-center ' +
                                        (isDanger
                                            ? 'bg-red-50 text-red-600'
                                            : 'bg-indigo-50 text-indigo-600')
                                    }
                                >
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3
                                        id="confirm-title"
                                        className="text-base font-bold text-slate-800"
                                    >
                                        {state.title || 'Emin misiniz?'}
                                    </h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {state.message}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => resolve(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    {state.cancelLabel || 'Vazgeç'}
                                </button>
                                <button
                                    ref={confirmBtnRef}
                                    type="button"
                                    onClick={() => resolve(true)}
                                    className={
                                        'px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ' +
                                        (isDanger
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-indigo-600 hover:bg-indigo-700')
                                    }
                                >
                                    {state.confirmLabel || 'Onayla'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </ConfirmContext.Provider>
    );
}

export function useConfirm(): Confirm {
    const ctx = useContext(ConfirmContext);
    if (!ctx)
        throw new Error('useConfirm must be used within a ConfirmDialogProvider');
    return ctx;
}
