import React from 'react';
import { DeviceSession, type InkDiagnostic } from './deviceSession';

export const deviceTestTasks = [
    'Hafif, orta ve güçlü basınçla üç uzun çizgi çiz.',
    'Aynı cümleyi yavaş ve hızlı yaz: “Bugün kalem deneyimini karşılaştırıyorum.”',
    'Küçük e/ş/ğ harfleri, sıkı döngüler ve keskin V köşeleri çiz.',
    'Daire, eğik elips, üçgen, dikdörtgen ve ok çiz; sonda bekleyip sürükle.',
    'Avucunu ekrana koyarak yaz; uç havadayken ve yazarken kalemi döndür.',
];
export interface DeviceTestHandle { record: (event: InkDiagnostic) => void }

export const DeviceTestPanel = React.forwardRef<DeviceTestHandle, { legacy: boolean; onModeChange: (legacy: boolean) => void }>(function DeviceTestPanel({legacy, onModeChange}, ref) {
    const sessions = React.useRef([new DeviceSession(), new DeviceSession(true)]);
    const [report, setReport] = React.useState(sessions.current[0].report());
    const [impressions, setImpressions] = React.useState({ current: '', legacy: '' });
    const [device, setDevice] = React.useState('iPad Air 11 inç · Apple Pencil Pro');
    React.useImperativeHandle(ref, () => ({ record: event => sessions.current[legacy ? 1 : 0].record(event) }), [legacy]);
    React.useEffect(() => {
        const update = () => setReport(sessions.current[legacy ? 1 : 0].report());
        update(); const timer = setInterval(update, 750); return () => clearInterval(timer);
    }, [legacy]);
    const ms = (n: number | null) => n === null ? '—' : `${n.toFixed(2)} ms`;
    const [reportJson, setReportJson] = React.useState('');
    const makeReport = () => {
        const payload = { device, exportedAt: new Date().toISOString(), environment: { userAgent: navigator.userAgent,
            dpr: devicePixelRatio, secureContext: window.isSecureContext, coalescedEvents: typeof PointerEvent !== 'undefined' && 'getCoalescedEvents' in PointerEvent.prototype, predictedEvents: typeof PointerEvent !== 'undefined' && 'getPredictedEvents' in PointerEvent.prototype, viewport: [innerWidth, innerHeight] },
            sessions: sessions.current.map(s => s.report()), impressions, tasks: deviceTestTasks,
            comparison: 'Only the input position filter changes. This is not a comparison with Goodnotes.' };
        return JSON.stringify(payload, null, 2);
    };
    const exportReport = () => {
        const url = URL.createObjectURL(new Blob([makeReport()], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = 'apple-pencil-test.json'; document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
    };
    return <aside className="w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-4 text-xs text-slate-700" aria-label="Apple Pencil cihaz testi">
        <h2 className="text-base font-semibold text-slate-950">Apple Pencil cihaz testi</h2>
        <p className="my-2 leading-5">Önce iki modda aynı beş görevi yap. Kalem türünü ve kalınlığını karşılaştırma sırasında aynı tut.</p>
        <label className="block">Cihaz<input className="my-2 w-full rounded border p-2" value={device} onChange={e => setDevice(e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Karşılaştırma filtresi">
            <button aria-pressed={!legacy} className={`rounded p-2 ${!legacy ? 'bg-blue-700 text-white' : 'bg-slate-100'}`} onClick={() => onModeChange(false)}>Güncel filtre</button>
            <button aria-pressed={legacy} className={`rounded p-2 ${legacy ? 'bg-blue-700 text-white' : 'bg-slate-100'}`} onClick={() => onModeChange(true)}>Önceki konum filtresi</button>
        </div>
        <ol className="my-4 list-inside list-decimal space-y-3 leading-5">{deviceTestTasks.map(task => <li key={task}>{task}</li>)}</ol>
        <dl className="grid grid-cols-2 gap-y-2 border-t pt-3 tabular-nums">
            <dt>Gerçek darbe / örnek</dt><dd>{report.strokes} / {report.samples}</dd>
            <dt>İşaretçi türü</dt><dd>{report.pointerTypes.join(', ') || 'Henüz yok'}</dd>
            <dt>Basınç aralığı</dt><dd>{report.pressureRange?.map(p => p.toFixed(2)).join('–') || '—'}</dd>
            <dt>Örnek aralığı p50</dt><dd>{ms(report.sampleIntervalMs.p50)}</dd>
            <dt>İşleme p95</dt><dd>{ms(report.processingMs.p95)}</dd>
            <dt>Çizim p95</dt><dd>{ms(report.renderMs.p95)}</dd>
            <dt>Kare kuyruğu p95</dt><dd>{ms(report.frameQueueMs.p95)}</dd>
            <dt>Örnek → Canvas p95</dt><dd>{ms(report.sampleToCanvasCompletionMs.p95)}</dd>
            <dt>Filtre farkı p95</dt><dd>{report.filterOffsetScreenPx.p95?.toFixed(2) ?? '—'} px</dd>
        </dl>
        <p className="my-3 leading-5 text-slate-500">Bu süreler tarayıcı içindedir; fiziksel uç–ekran gecikmesi değildir. Sentetik “Motoru doğrula” darbeleri ölçüme dahil edilmez. HTTP üzerinde bazı tarayıcı örnekleme API'leri kullanılamayabilir.</p>
        <label className="block font-medium">Bu mod nasıl hissettirdi?<textarea className="mt-2 w-full rounded border p-2 font-normal" rows={3} placeholder="Gecikme, titreme, köşeler, basınç ve avuç teması…" value={impressions[legacy ? 'legacy' : 'current']} onChange={e => setImpressions({...impressions, [legacy ? 'legacy' : 'current']: e.target.value})}/></label>
        <div className="mt-3 flex gap-2">
            <button className="rounded bg-slate-950 px-3 py-2 text-white" onClick={exportReport}>Raporu indir</button>
            <button className="rounded border px-3 py-2" onClick={() => { sessions.current = [new DeviceSession(), new DeviceSession(true)]; setReport(sessions.current[legacy ? 1 : 0].report()); }}>Ölçümleri sıfırla</button>
        </div>
        <button className="mt-2 rounded border px-3 py-2" onClick={() => setReportJson(makeReport())}>JSON raporunu göster</button>
        {reportJson && <textarea aria-label="JSON cihaz raporu" className="mt-2 w-full rounded border p-2 font-mono" rows={6} readOnly value={reportJson} />}
        <p className="mt-2 text-slate-500">Veriler bu sayfada kalır. Yenilemeden önce raporu indir.</p>
    </aside>;
});
