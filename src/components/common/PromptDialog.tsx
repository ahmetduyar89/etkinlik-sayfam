import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface PromptOptions {
    title?: string;
    message?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

type Prompt = (opts: PromptOptions) => Promise<string | null>;

const PromptContext = createContext<Prompt | null>(null);

export function PromptDialogProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<PromptOptions | null>(null);
    const [value, setValue] = useState('');
    const resolverRef = useRef<((v: string | null) => void) | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const prompt = useCallback<Prompt>((opts) => {
        setState(opts);
        setValue(opts.defaultValue ?? '');
        return new Promise((resolve) => {
            resolverRef.current = resolve;
        });
    }, []);

    const close = useCallback((result: string | null) => {
        resolverRef.current?.(result);
        resolverRef.current = null;
        setState(null);
    }, []);

    React.useEffect(() => {
        if (!state) return;
        inputRef.current?.focus();
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [state, close]);

    const value$ = useMemo(() => prompt, [prompt]);

    return (
        <PromptContext.Provider value={value$}>
            {children}
            <AnimatePresence>
                {state && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="prompt-title"
                        className="fixed inset-0 z-[19500] flex items-center justify-center px-4"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                            onClick={() => close(null)}
                        />
                        <motion.form
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                close(value);
                            }}
                            className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md p-6 space-y-4"
                        >
                            <div className="space-y-1">
                                <h3
                                    id="prompt-title"
                                    className="text-base font-bold text-slate-800"
                                >
                                    {state.title || 'Metin'}
                                </h3>
                                {state.message && (
                                    <p className="text-sm text-slate-500">{state.message}</p>
                                )}
                            </div>
                            <input
                                ref={inputRef}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                placeholder={state.placeholder}
                                className="w-full border-2 border-indigo-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => close(null)}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    {state.cancelLabel || 'Vazgeç'}
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                                >
                                    {state.confirmLabel || 'Ekle'}
                                </button>
                            </div>
                        </motion.form>
                    </div>
                )}
            </AnimatePresence>
        </PromptContext.Provider>
    );
}

export function usePrompt(): Prompt {
    const ctx = useContext(PromptContext);
    if (!ctx)
        throw new Error('usePrompt must be used within a PromptDialogProvider');
    return ctx;
}
