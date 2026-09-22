import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { classroomId } from '../lib/classroomScope';
import { fetchDocById } from '../lib/firebase';
import { readDraft, writeDraft, clearDraft } from '../lib/drafts';
import { loadNotebookPages, saveNotebookPages, NotebookConflictError } from '../components/notebooks/notebookContent';
import type { Activity, DrawingCanvasHandle, NotebookPage, Stroke, TextBoxData } from '../types';
import { useConfirm } from '../components/common/ConfirmDialog';
interface WorkDraft { pages: NotebookPage[]; baseRev: number; completed: boolean; page: number; answers?: Record<string, unknown>; }
export function useActivityWork(activity: Activity, canvas: RefObject<DrawingCanvasHandle>, boxes: TextBoxData[], setBoxes: (boxes: TextBoxData[]) => void) {
    const enabled = !!classroomId;
    const key = `activity:${activity.id}`;
    const contentId = `activity-${activity.id}`;
    const [ready, setReady] = useState(!enabled);
    const [initialPages, setInitialPages] = useState<Stroke[][]>([[]]);
    const [status, setStatus] = useState(enabled ? 'Çalışma yükleniyor…' : '');
    const [completed, setCompleted] = useState(false);
    const [conflict, setConflict] = useState(false);
    const boxesRef = useRef(boxes); boxesRef.current = boxes;
    const completeRef = useRef(false);
    const answersRef = useRef<Record<string, unknown>>({});
    const rev = useRef(0);
    const parts = useRef<string[]>([]);
    const dirty = useRef(false);
    const generation = useRef(0);
    const inFlight = useRef<Promise<boolean> | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const loaded = useRef(false);
    const mounted = useRef(true);
    const confirm = useConfirm();
    const report = (message: string) => { if (mounted.current) setStatus(message); };
    const capture = useCallback((): WorkDraft => ({
        pages: (canvas.current?.getPages() || initialPages).map((strokes, i) => ({ strokes, boxes: i === 0 ? boxesRef.current : [] })),
        baseRev: rev.current, answers: answersRef.current, completed: completeRef.current, page: canvas.current?.getCurrentPage() || 0,
    }), [canvas, initialPages]);
    const captureRef = useRef(capture); captureRef.current = capture;
    const save = useCallback(async (force = false): Promise<boolean> => {
        if (!enabled || !loaded.current || !dirty.current) return true;
        if (inFlight.current) return inFlight.current;
        const version = generation.current;
        const snapshot = captureRef.current();
        const work = (async () => {
            let token: string | null = null;
            try { token = await writeDraft(key, snapshot); }
            catch { report('Cihaz yedeği yazılamadı. Buluta kaydediliyor…'); }
            if (!navigator.onLine) { report(token ? 'Cihazda saklandı · Bağlantı bekleniyor' : 'Kaydedilemedi · Bu pencereyi kapatmayın'); return false; }
            report('Kaydediliyor…');
            try {
                const result = await saveNotebookPages(contentId, snapshot.pages, { previous: parts.current, baseRev: rev.current, force, localBackup: false,
                    metadata: { collection: 'activity_work', id: activity.id, fields: { title: activity.title, answers: snapshot.answers || {}, completed: snapshot.completed, current_page: snapshot.page, created_at: new Date().toISOString() } },
                });
                rev.current = result.rev; parts.current = result.parts;
                if (token) await clearDraft(key, token).catch(() => undefined);
                if (generation.current === version) { dirty.current = false; report('Kaydedildi'); }
                else report('Yeni değişiklikler kaydediliyor…');
                if (mounted.current) setConflict(false);
                return true;
            } catch (err) {
                if (err instanceof NotebookConflictError) {
                    if (mounted.current) setConflict(true);
                    report('Başka cihazda değişti · Çakışmayı çöz');
                } else report(token ? 'Buluta kaydedilemedi · Cihaz yedeği var · Yeniden dene' : 'Kaydedilemedi · Bu pencereyi kapatmayın');
                return false;
            }
        })();
        inFlight.current = work;
        try { return await work; } finally { inFlight.current = null; }
    }, [activity.id, activity.title, contentId, enabled, key]);
    const saveRef = useRef(save); saveRef.current = save;
    const markDirty = useCallback(() => {
        if (!enabled || !loaded.current) return;
        dirty.current = true; generation.current++;
        report('Kaydedilmeyi bekliyor…');
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => { void saveRef.current(); }, 800);
    }, [enabled]);
    useEffect(() => {
        if (!enabled) return;
        mounted.current = true;
        let cancelled = false;
        (async () => {
            try {
                const draft = await readDraft<WorkDraft>(key).catch(() => null);
                let content;
                let meta: { completed?: boolean; current_page?: number; answers?: Record<string, unknown> } | null = null;
                try {
                    [content, meta] = await Promise.all([loadNotebookPages(contentId), fetchDocById<{ completed?: boolean; current_page?: number; answers?: Record<string, unknown> }>('activity_work', activity.id)]);
                } catch (error) { if (!draft) throw error; }
                if (cancelled) return;
                const pending = draft?.value;
                const pages = pending?.pages || content!.pages;
                rev.current = pending?.baseRev ?? content!.rev;
                parts.current = new Array(content?.chunkCount || 0).fill('');
                setInitialPages(pages.map(p => p.strokes));
                setBoxes(pages[0]?.boxes || []);
                boxesRef.current = pages[0]?.boxes || [];
                completeRef.current = pending?.completed ?? meta?.completed ?? false;
                setCompleted(completeRef.current);
                answersRef.current = pending?.answers ?? meta?.answers ?? {};
                loaded.current = true; setReady(true);
                dirty.current = !!pending;
                report(pending ? 'Cihazdaki kaydedilmemiş çalışma geri yüklendi' : 'Buluttan yüklendi');
                if (pending) setTimeout(() => { if (!cancelled) void saveRef.current(); }, 1000);
                setTimeout(() => { if (!cancelled) canvas.current?.goToPage(pending?.page ?? meta?.current_page ?? 0); }, 50);
            } catch { report('Çalışma yüklenemedi. Veriyi korumak için düzenleme kapalı; yeniden açın.'); }
        })();
        const beforeUnload = (e: BeforeUnloadEvent) => { if (dirty.current) { e.preventDefault(); e.returnValue = ''; } };
        const online = () => { void saveRef.current(); };
        const interval = setInterval(() => { if (dirty.current && !inFlight.current) void saveRef.current(); }, 15000);
        window.addEventListener('beforeunload', beforeUnload); window.addEventListener('online', online);
        return () => { cancelled = true; mounted.current = false; clearInterval(interval); if (timer.current) clearTimeout(timer.current); window.removeEventListener('beforeunload', beforeUnload); window.removeEventListener('online', online); };
        // This hook is remounted for each activity; setBoxes is a React setter.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity.id]);
    const previousBoxes = useRef(boxes);
    useEffect(() => { if (previousBoxes.current !== boxes && ready) markDirty(); previousBoxes.current = boxes; }, [boxes, ready, markDirty]);
    const close = async (onClose: () => void) => {
        if (timer.current) clearTimeout(timer.current);
        if (!enabled || !dirty.current) { onClose(); return; }
        if (await save()) {
            // Changes made during the first write must also finish before closing.
            if (!dirty.current || await save()) { if (!dirty.current) onClose(); }
        }
    };
    const retry = async () => {
        if (!conflict) { await save(); return; }
        if (await confirm({ title: 'Etkinlik iki cihazda değişti', message: 'Bu cihazdaki çalışmayı buluttaki sürümün üzerine kaydetmek istiyor musunuz? Diğer cihazın son değişikliklerinin yerini alır.', confirmLabel: 'Bu çalışmayı kaydet', cancelLabel: 'Vazgeç', variant: 'danger' })) await save(true);
    };
    const toggleCompleted = () => { completeRef.current = !completeRef.current; setCompleted(completeRef.current); markDirty(); };
    const recordAnswers = useCallback((answers: Record<string, unknown>) => {
        if (!loaded.current) return;
        try { if (JSON.stringify(answers).length > 100000) return; } catch { return; }
        answersRef.current = answers;
        markDirty();
    }, [markDirty]);
    return { enabled, ready, initialPages, status, completed, markDirty, close, retry, toggleCompleted, recordAnswers };
}
