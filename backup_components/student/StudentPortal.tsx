import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Pencil, User, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getFormattedHtml } from '../../utils/format-html';
import { useFirestore } from '../../lib/firebase';
import { DrawingCanvas } from '../drawing/DrawingCanvas';
import { DrawingToolbar } from '../drawing/DrawingToolbar';
import { useToast } from '../common/ToastProvider';
import type { Activity, DrawConfig, DrawingCanvasHandle, Submission } from '../../types';

interface StudentPortalProps {
    act: Activity;
}

export function StudentPortal({ act }: StudentPortalProps) {
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [isStarted, setIsStarted] = useState(!act.is_test);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [drawConfig, setDrawConfig] = useState<DrawConfig>({
        tool: 'pencil',
        color: '#ff4d4d',
        width: 3,
        fillEnabled: false,
        stampIcon: '✅',
    });
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [iframeHeight, setIframeHeight] = useState(1000);
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const canvasRef = React.useRef<DrawingCanvasHandle>(null);
    const submissionsHandler = useFirestore<Submission>('submissions');
    const isMountedRef = React.useRef(true);
    const toast = useToast();

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (isStarted && act.is_test && act.has_timer && act.duration_minutes) {
            const mins = Number(act.duration_minutes);
            if (Number.isFinite(mins) && mins > 0) setTimeLeft(mins * 60);
        }
    }, [isStarted, act]);

    const handleSubmit = React.useCallback(async () => {
        if (isFinished) return;
        setIsFinished(true);
        if (submissionId) {
            try {
                await submissionsHandler.update(submissionId, {
                    submitted_at: new Date().toISOString(),
                });
            } catch (err) {
                console.error('Submission update error:', err);
                toast.error('Cevaplar kaydedilemedi. Lütfen tekrar deneyin.');
            }
        }
    }, [isFinished, submissionId, submissionsHandler, toast]);

    useEffect(() => {
        if (act.is_test && timeLeft === 0 && !isFinished) handleSubmit();
        if (act.is_test && timeLeft !== null && timeLeft > 0 && !isFinished) {
            const timer = window.setInterval(
                () => setTimeLeft((prev) => (prev !== null ? prev - 1 : null)),
                1000
            );
            return () => window.clearInterval(timer);
        }
    }, [timeLeft, isFinished, act.is_test, handleSubmit]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data as { type?: string; height?: number; data?: unknown };
            if (data?.type === 'IFRAME_HEIGHT_SYNC' && (data.height ?? 0) > 0) {
                setIframeHeight(data.height as number);
            }
            if (data?.type === 'SIM_ANSWER' && submissionId) {
                submissionsHandler
                    .update(submissionId, {
                        answers: (data.data ?? {}) as Record<string, unknown>,
                    })
                    .catch((err) => console.error('Answer sync error:', err));
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [submissionId, submissionsHandler]);

    const handleToolbarCommand = (type: string) => {
        if (type === 'UNDO_DRAWING') canvasRef.current?.undo();
        else if (type === 'CLEAR_DRAWING') canvasRef.current?.clear();
        else if (type === 'TOGGLE_WHITEBOARD') setShowWhiteboard((v) => !v);
    };

    const handleStart = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setNameError('Lütfen isminizi girin.');
            return;
        }
        setNameError('');
        setIsStarting(true);
        try {
            const res = await submissionsHandler.add({
                activity_id: act.id,
                student_name: trimmed,
                started_at: new Date().toISOString(),
                answers: {},
                submitted_at: null,
            });
            if (isMountedRef.current) {
                setSubmissionId(res.id);
                setIsStarted(true);
            }
        } catch (err) {
            console.error('Submission create error:', err);
            toast.error('Teste başlanamadı. Bağlantınızı kontrol edip tekrar deneyin.');
        } finally {
            if (isMountedRef.current) setIsStarting(false);
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-100">
                    <Zap className="w-10 h-10" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                        Test Tamamlandı!
                    </h1>
                    <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">
                        Cevaplarınız başarıyla kaydedildi.
                    </p>
                </div>
                <p className="text-slate-500 max-w-sm">
                    Dersi takip ettiğiniz için teşekkürler. Bu sekmeyi kapatabilirsiniz.
                </p>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isStarting) handleStart();
                    }}
                    className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border border-slate-100 text-center space-y-8"
                >
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-200">
                        <User className="w-8 h-8 text-white" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                            {act.title}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">
                            Başlamadan önce lütfen adınızı girin
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label htmlFor="student-name" className="sr-only">
                                Adınız Soyadınız
                            </label>
                            <input
                                id="student-name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (nameError) setNameError('');
                                }}
                                placeholder="Adınız Soyadınız"
                                autoComplete="name"
                                aria-invalid={!!nameError}
                                aria-describedby={nameError ? 'student-name-error' : undefined}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-center text-lg font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                            />
                            {nameError && (
                                <p
                                    id="student-name-error"
                                    role="alert"
                                    className="text-center text-sm font-medium text-red-500"
                                >
                                    {nameError}
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isStarting}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isStarting ? 'Başlatılıyor…' : 'Teste Başla'}
                        </button>
                    </div>
                </motion.form>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-[#0f172a] z-[3000] flex flex-col h-screen overflow-hidden"
            onPointerDown={(e) => e.stopPropagation()}
        >
            <header
                className="h-16 px-4 sm:px-6 border-b border-white/5 flex justify-between items-center bg-slate-900 z-[6000] shrink-0 gap-2"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <span className="font-bold text-slate-200 truncate">
                        {name || act.title}
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {act.has_timer && timeLeft !== null && (
                        <div
                            aria-live="polite"
                            className={cn(
                                'font-black tabular-nums px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2',
                                timeLeft < 60
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-white/5 text-slate-300'
                            )}
                        >
                            <Clock className="w-4 h-4" aria-hidden="true" />
                            {Math.floor(timeLeft / 60)}:
                            {String(timeLeft % 60).padStart(2, '0')}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsDrawingMode(!isDrawingMode)}
                        aria-pressed={isDrawingMode}
                        className={cn(
                            'flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                            isDrawingMode
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        )}
                    >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">
                            {isDrawingMode ? 'Çizimi Kapat' : 'Kalem Modu'}
                        </span>
                    </button>
                    {act.is_test && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 sm:px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                        >
                            Bitir
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 relative bg-white overflow-y-auto overflow-x-hidden custom-scroll">
                <div
                    style={{
                        position: 'relative',
                        width: '100%',
                        minHeight: '100%',
                        height: iframeHeight,
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        srcDoc={getFormattedHtml(act)}
                        title={act.title}
                        sandbox="allow-scripts"
                        className={cn(
                            'w-full h-full border-0',
                            isDrawingMode && drawConfig.tool !== 'pan'
                                ? 'pointer-events-none'
                                : 'pointer-events-auto'
                        )}
                        scrolling="no"
                    />
                    <DrawingCanvas
                        ref={canvasRef}
                        config={drawConfig}
                        enabled={isDrawingMode}
                        whiteboardMode={showWhiteboard}
                    />
                </div>
                <AnimatePresence>
                    {isDrawingMode && (
                        <DrawingToolbar
                            onCommand={handleToolbarCommand}
                            config={drawConfig}
                            setConfig={setDrawConfig}
                            showWhiteboard={showWhiteboard}
                            setShowWhiteboard={setShowWhiteboard}
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
