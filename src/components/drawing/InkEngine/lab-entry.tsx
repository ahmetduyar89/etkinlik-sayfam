import React from 'react';

import { createRoot } from 'react-dom/client';
import { DrawingCanvas } from '../DrawingCanvas';
import { DrawingToolbar } from '../DrawingToolbar';
import type { DrawConfig, DrawingCanvasHandle, Stroke } from '../../../types';
import '../../../index.css';
import { verifyCanvas } from './labVerification';
import { verifyElements } from '../elements/verification';
import { verifyGestures } from './gestureVerification';
import { DeviceTestPanel, type DeviceTestHandle } from './DeviceTestPanel';
import type { InkDiagnostic } from './deviceSession';

export function Lab() {
    const [config, setConfig] = React.useState<DrawConfig>({ tool: 'pencil', color: '#172554', width: 4, fillEnabled: false, stampIcon: '', penType: 'fountain' });

    const ref = React.useRef<DrawingCanvasHandle>(null);
    const deviceTestRef = React.useRef<DeviceTestHandle>(null);
    const [legacyInputFilter, setLegacyInputFilter] = React.useState(false);
    const [deviceTest, setDeviceTest] = React.useState(new URLSearchParams(location.search).get('deviceTest') === '1');
    const record = React.useCallback((event: InkDiagnostic) => deviceTestRef.current?.record(event), []);
    const [zoom, setZoom] = React.useState(1);
    const [count, setCount] = React.useState(0);
    const [history, setHistory] = React.useState([false, false]);
    const [verification, setVerification] = React.useState('');
    const verify = async (gestures = false) => {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas[aria-label="Çizim alanı"]');
        if (!canvas || !ref.current) return;
        setVerification('Kontrol sürüyor…');
        try { setVerification(await (gestures ? verifyGestures(canvas, ref.current) : verifyCanvas(canvas, ref.current, config.tool === 'highlighter'))); }
        catch (error) { setVerification(`Başarısız: ${error instanceof Error ? error.message : error}`); }
    };
    const verifyElementPack = async () => {
        const canvas=document.querySelector<HTMLCanvasElement>('canvas[aria-label="Çizim alanı"]');
        if(!canvas || !ref.current)return;setVerification('Kontrol sürüyor…');
        try {setVerification(await verifyElements(canvas,ref.current));} catch(error) {setVerification(`Başarısız: ${error instanceof Error ? error.message : error}`);}
    };
    const loadStress = () => {
        const strokes: Stroke[] = Array.from({ length: 1000 }, (_, i) => ({
            id: `lab-${i}`, tool: 'pencil', color: '#172554', width: 2, penType: 'ballpoint', inkVersion: 2,
            points: Array.from({ length: 24 }, (_, j) => ({ x: (i % 40) * 24 + j, y: Math.floor(i / 40) * 24 + Math.sin(j / 4) * 7 + 20, p: 0.5 })),
        }));
        ref.current?.loadPages([strokes]);
        setCount(strokes.length);
    };
    return <main className="flex h-screen flex-col bg-slate-100">
        <header className="flex flex-wrap items-center gap-3 bg-slate-950 p-3 text-sm text-white">
            <h1 className="font-bold">Ink Debug Lab</h1>
            <span>Geçici test alanı · Defterlere kaydedilmez · {count} çizgi</span>
            <button onClick={() => ref.current?.undo()} disabled={!history[0]}>Geri al</button>
            <button onClick={() => ref.current?.redo()} disabled={!history[1]}>İleri al</button>
            <button onClick={() => ref.current?.clear()}>Temizle</button>
            <button onClick={loadStress}>1.000 çizgi yükle</button>
            <button onClick={() => setDeviceTest(x => !x)}>Cihaz testi</button>
            <button onClick={() => verify()} disabled={verification === 'Kontrol sürüyor…'}>Motoru doğrula</button>
            <button onClick={() => verify(true)} disabled={verification === 'Kontrol sürüyor…'}>Jestleri doğrula</button>
            <button onClick={verifyElementPack} disabled={verification === 'Kontrol sürüyor…'}>Öğeleri doğrula</button>
            <span aria-label="Yakınlaştırma oranı">{Math.round(zoom * 100)}%</span>
            <output role="status">{verification}</output>
        </header>
        <DrawingToolbar onInsertElement={(src,w,h)=>ref.current?.insertImage(src,w,h)} fixed config={config} setConfig={setConfig} canUndo={history[0]} canRedo={history[1]}
            onCommand={command=>{if(command==='UNDO_DRAWING')ref.current?.undo();if(command==='REDO_DRAWING')ref.current?.redo();if(command==='CLEAR_DRAWING')ref.current?.clear();}}
            onInsertMath={math=>ref.current?.insertMath(math)} onSelectTool={id=>window.alert(`Laboratuvar aracı: ${id}`)}/>
        <div className="flex min-h-0 flex-1">
            <section className="relative min-w-0 flex-1 overflow-hidden" aria-label="Geçici çizim tahtası">
                <DrawingCanvas onConfigChange={patch => setConfig(prev => ({...prev, ...patch}))} ref={ref} config={config} enabled whiteboardMode panMode="viewport" onViewChange={view => setZoom(view.scale)} legacyInputFilter={legacyInputFilter} onInkDiagnostic={deviceTest ? record : undefined} onDirty={() => setCount(ref.current?.getPages()[0]?.length ?? 0)} onHistoryChange={(undo, redo) => setHistory([undo, redo])} />
            </section>
            {deviceTest && <DeviceTestPanel ref={deviceTestRef} legacy={legacyInputFilter} onModeChange={setLegacyInputFilter}/>}
        </div>
    </main>;
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<Lab />);
