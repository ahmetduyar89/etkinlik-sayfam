import type { DrawConfig } from '../../../types';
export const PRESET_STORAGE_KEY = 'ink.pen-presets.v1';
export const MAX_PEN_PRESETS = 12;
export type PenSettings = Pick<DrawConfig, 'tool' | 'color' | 'width' | 'penType' | 'pressureSensitivity' | 'streamlineLevel' | 'highlighterOpacity' | 'dash'>;
export interface InkPreset { name: string; settings: PenSettings }
export function capturePenSettings(config: DrawConfig): PenSettings {
    return { tool: config.tool === 'highlighter' ? 'highlighter' : 'pencil', color: config.color, width: config.width,
        penType: config.penType ?? 'ballpoint', pressureSensitivity: config.pressureSensitivity ?? 'normal',
        streamlineLevel: config.streamlineLevel ?? 'smooth', highlighterOpacity: config.highlighterOpacity ?? 0.3,
        dash: config.dash ?? 'solid' };
}
/** Only allow known pen fields back into application state. */
export function decodePresets(raw: string | null): InkPreset[] {
    try {
        const data: unknown = JSON.parse(raw ?? '[]');
        if (!Array.isArray(data)) return [];
        return data.slice(0, MAX_PEN_PRESETS).flatMap(entry => {
            if (!entry || typeof entry.name !== 'string' || !entry.settings) return [];
            const s = entry.settings;
            if (!['pencil', 'highlighter'].includes(s.tool) || typeof s.color !== 'string' ||
                !/^#[\da-f]{6}$/i.test(s.color) || typeof s.width !== 'number' || !Number.isFinite(s.width) || s.width < 0.1 || s.width > 50) return [];
            return [{ name: entry.name.trim().slice(0, 32) || 'Kalem', settings: {
                tool: s.tool, color: s.color, width: s.width,
                penType: ['ballpoint', 'fountain', 'brush', 'marker', 'graphite'].includes(s.penType) ? s.penType : 'ballpoint',
                pressureSensitivity: ['soft', 'normal', 'firm'].includes(s.pressureSensitivity) ? s.pressureSensitivity : 'normal',
                streamlineLevel: ['natural', 'smooth', 'calligraphy'].includes(s.streamlineLevel) ? s.streamlineLevel : 'smooth',
                highlighterOpacity: typeof s.highlighterOpacity === 'number' && Number.isFinite(s.highlighterOpacity) ? Math.max(0.2, Math.min(0.4, s.highlighterOpacity)) : 0.3,
                dash: ['solid', 'dashed', 'dotted'].includes(s.dash) ? s.dash : 'solid',
            } }];
        });
    } catch { return []; }
}
