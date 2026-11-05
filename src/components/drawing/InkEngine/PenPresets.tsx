import React from 'react';
import type { DrawConfig } from '../../../types';
import { capturePenSettings, decodePresets, MAX_PEN_PRESETS, PRESET_STORAGE_KEY, type InkPreset } from './presets';

export function PenPresets({ config, setConfig }: { config: DrawConfig; setConfig: (config: DrawConfig) => void }) {
    const [presets, setPresets] = React.useState<InkPreset[]>(() => {
        try { return decodePresets(localStorage.getItem(PRESET_STORAGE_KEY)); } catch { return []; }
    });
    const [name, setName] = React.useState('');
    const [message, setMessage] = React.useState('');
    React.useEffect(() => {
        const refresh = (event: StorageEvent) => {
            if (event.key === PRESET_STORAGE_KEY || event.key === null) setPresets(decodePresets(event.newValue));
        };
        window.addEventListener('storage', refresh);
        return () => window.removeEventListener('storage', refresh);
    }, []);
    const save = (next: InkPreset[]) => {
        try {
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
            setPresets(next);
            setMessage('Kaydedildi.');
        } catch { setMessage('Tarayıcı kaydı yapılamadı. Depolama alanını kontrol edin.'); }
    };
    return <details className="border-t border-white/10 pt-2 text-xs">
        <summary className="cursor-pointer font-semibold">Kayıtlı kalemler ({presets.length}/{MAX_PEN_PRESETS})</summary>
        <p className="my-2 text-slate-400">Bu tarayıcıda saklanır.</p>
        <div className="flex gap-1">
            <input aria-label="Kalem ayarı adı" placeholder="Örn. Mavi ince" maxLength={32} value={name}
                onChange={e => setName(e.target.value)} className="min-w-0 flex-1 rounded bg-slate-800 p-2" />
            <button type="button" disabled={!name.trim() || presets.length >= MAX_PEN_PRESETS}
                className="rounded bg-indigo-600 px-2 disabled:opacity-40"
                onClick={() => { save([...presets, { name: name.trim(), settings: capturePenSettings(config) }]); }}>Kaydet</button>
        </div>
        <ul className="mt-2 flex flex-col gap-1">
            {presets.map((preset, index) => <li key={`${index}-${preset.name}`} className="flex items-center gap-2">
                <button type="button" className="flex min-w-0 flex-1 items-center gap-2 rounded bg-white/5 p-2 text-left"
                    onClick={() => { setConfig({ ...config, ...preset.settings }); setMessage(`${preset.name} uygulandı.`); }}>
                    <span className="h-3 w-3 shrink-0 rounded-full border border-white/30" style={{ backgroundColor: preset.settings.color }} />
                    <span className="truncate">{preset.name}</span>
                </button>
                <button type="button" aria-label={`${preset.name} ayarını sil`} onClick={() => save(presets.filter((_, i) => i !== index))} className="p-2 text-slate-400">Sil</button>
            </li>)}
        </ul>
        <p role="status" className="mt-1 text-slate-400">{message}</p>
    </details>;
}
