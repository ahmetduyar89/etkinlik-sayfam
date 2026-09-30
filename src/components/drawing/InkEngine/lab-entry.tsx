import React from 'react';
import { InkToolMemory } from './toolMemory';
import { createRoot } from 'react-dom/client';
import { DrawingCanvas } from '../DrawingCanvas';
import { ToolSettingsPanel } from '../ToolSettingsPanel';
import type { DrawConfig, DrawingCanvasHandle, Stroke } from '../../../types';
import '../../../index.css';

function Lab() {
    const [config, setConfig] = React.useState<DrawConfig>({ tool: 'pencil', color: '#172554', width: 4, fillEnabled: false, stampIcon: '', penType: 'fountain' });
    const tools = React.useRef(new InkToolMemory());
    React.useEffect(() => { tools.current.remember(config); }, [config]);
    const ref = React.useRef<DrawingCanvasHandle>(null);
    const [count, setCount] = React.useState(0);
    const [history, setHistory] = React.useState([false, false]);
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
        </header>
        <div className="flex min-h-0 flex-1">
            <section className="w-80 shrink-0 overflow-auto bg-slate-900 p-2">
                <div className="mb-2 flex flex-wrap gap-3 text-white">
                    <button onClick={() => setConfig(tools.current.select(config, 'pencil'))}>Kalem</button>
                    <button onClick={() => setConfig(tools.current.select(config, 'highlighter'))}>Fosforlu</button>
                    <button onClick={() => setConfig({ ...config, tool: 'pan' })}>Taşı</button>
                    <button onClick={() => setConfig({ ...config, tool: 'eraser', eraserMode: 'stroke', width: 2 })}>Nesne silgisi</button>
                    <button onClick={() => setConfig({ ...config, tool: 'eraser', eraserMode: 'pixel', width: 2 })}>Hassas silgi</button>
                    <button onClick={() => setConfig({ ...config, tool: 'lasso' })}>Kement</button>
                </div>
                <ToolSettingsPanel section={config.tool === 'eraser' ? 'eraser' : 'pen'} config={config} setConfig={setConfig} onSelectShapeTool={tool => setConfig({ ...config, tool })} />
                <p className="mt-4 text-sm text-slate-300">Merhaba · hızlı cümle · küçük yazı · spiral · zigzag · nokta · imza. Yakınlaştırmak için tekerlek veya iki parmak kullanın.</p>
            </section>
            <section className="relative min-w-0 flex-1 overflow-hidden" aria-label="Geçici çizim tahtası">
                <DrawingCanvas ref={ref} config={config} enabled whiteboardMode panMode="viewport" onDirty={() => setCount(ref.current?.getPages()[0]?.length ?? 0)} onHistoryChange={(undo, redo) => setHistory([undo, redo])} />
            </section>
        </div>
    </main>;
}
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<Lab />);
