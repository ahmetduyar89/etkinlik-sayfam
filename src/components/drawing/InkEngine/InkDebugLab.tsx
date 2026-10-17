import React from 'react';
import type { Point } from '../../../types';

export interface InkMetrics {
    samples: number; points: number; predictions: number; processingMs: number; renderMs: number;
    pressure: number; velocity: number; tilt: number;
    raw: Point[]; filtered: Point[]; predicted: Point[];
}
export const emptyInkMetrics = (): InkMetrics => ({ samples: 0, points: 0, predictions: 0,
    processingMs: 0, renderMs: 0, pressure: 0, velocity: 0, tilt: 0, raw: [], filtered: [], predicted: [] });

/** Mounted only in development with ?inkDebug=1. Sampling never sets React state. */
export function InkDebugLab({ metrics, legacy }: {
    metrics: React.MutableRefObject<InkMetrics>;
    legacy: React.MutableRefObject<boolean>;
}) {
    const [snapshot, setSnapshot] = React.useState({ ...metrics.current, fps: 0, sampleRate: 0 });
    React.useEffect(() => {
        let frame = 0, frames = 0, last = performance.now(), samples = metrics.current.samples;
        const tick = (now: number) => {
            frames++;
            if (now - last >= 500) {
                const seconds = (now - last) / 1000;
                setSnapshot({ ...metrics.current, fps: frames / seconds, sampleRate: (metrics.current.samples - samples) / seconds });
                samples = metrics.current.samples;
                frames = 0;
                last = now;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [metrics]);
    const points = [...snapshot.raw, ...snapshot.filtered, ...snapshot.predicted];
    const minX = Math.min(...points.map(p => p.x), points[0]?.x ?? 0), minY = Math.min(...points.map(p => p.y), points[0]?.y ?? 0);
    const width = Math.max(1, ...points.map(p => p.x - minX));
    const height = Math.max(1, ...points.map(p => p.y - minY));
    const scale = Math.min(230 / width, 90 / height);
    const path = (list: Point[]) => list.map(p => `${5 + (p.x - minX) * scale},${5 + (p.y - minY) * scale}`).join(' ');
    return <aside className="absolute right-3 top-3 z-[6000] w-72 rounded-xl bg-slate-950/95 p-3 text-xs text-white shadow-xl"
        aria-label="Ink Debug Lab" onPointerDown={e => e.stopPropagation()}>
        <strong>Ink Debug Lab</strong>
        <p className="my-2 text-slate-400">Tarayıcı ölçümleri; fiziksel uç-ekran gecikmesi ölçülmez.</p>
        <dl className="grid grid-cols-2 gap-1 tabular-nums">
            <dt>rAF / kare aralığı</dt><dd>{snapshot.fps.toFixed(0)} Hz / {(1000 / (snapshot.fps || 1)).toFixed(1)} ms</dd>
            <dt>Giriş örneği</dt><dd>{snapshot.sampleRate.toFixed(0)}/sn</dd>
            <dt>Gerçek / tahmini</dt><dd>{snapshot.points} / {snapshot.predictions}</dd>
            <dt>Giriş işleme / çizim</dt><dd>{snapshot.processingMs.toFixed(2)} / {snapshot.renderMs.toFixed(2)} ms</dd>
            <dt>Basınç / hız</dt><dd>{snapshot.pressure.toFixed(2)} / {snapshot.velocity.toFixed(0)} br/sn</dd>
            <dt>Eğim büyüklüğü</dt><dd>{snapshot.tilt.toFixed(0)}°</dd>
        </dl>
        <svg viewBox="0 0 240 100" className="mt-2 w-full bg-slate-900" aria-label="Ham, filtreli ve tahmini noktalar">
            <polyline points={path(snapshot.raw)} fill="none" stroke="#fb7185" strokeWidth="1" />
            <polyline points={path(snapshot.filtered)} fill="none" stroke="#38bdf8" strokeWidth="1" />
            <polyline points={path(snapshot.predicted)} fill="none" stroke="#facc15" strokeWidth="2" />
        </svg>
        <p className="mt-1"><span className="text-rose-400">Ham</span> · <span className="text-sky-400">Filtreli</span> · <span className="text-yellow-400">Tahmini</span> (son 160 nokta)</p>
        <label className="mt-3 flex items-center gap-2"><input type="checkbox" defaultChecked={legacy.current}
            onChange={e => { legacy.current = e.target.checked; }} />Eski konum filtresiyle karşılaştır</label>
        <p className="mt-1 text-slate-400">Sonraki çizgiye uygulanır; yalnız konum filtresi değişir.</p>
    </aside>;
}
