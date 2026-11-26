import type { DrawConfig, DrawingTool } from '../../../types';
import { capturePenSettings, type PenSettings } from './presets';

/** Session-local settings, separate from explicitly saved named presets. */
export class InkToolMemory {
    private textSettings: Partial<DrawConfig> | null = null;
    private pens = new Map<DrawingTool, PenSettings>();
    remember(config: DrawConfig): void {
        if (config.tool === 'text') this.textSettings = {color:config.color, width:config.width, fontFamily:config.fontFamily, textAlign:config.textAlign, bold:config.bold, italic:config.italic};
        if (config.tool === 'pencil' || config.tool === 'highlighter') this.pens.set(config.tool, capturePenSettings(config));
    }
    select(current: DrawConfig, tool: DrawingTool): DrawConfig {
        this.remember(current);
        if (tool === 'text') return { ...current, color:'#182230', width:22, fontFamily:'sans', textAlign:'left', bold:false, italic:false, ...this.textSettings, tool };
        if (tool !== 'pencil' && tool !== 'highlighter') return { ...current, tool };
        const previous = this.pens.get(tool);
        if (previous) return { ...current, ...previous, tool };
        if (tool === 'highlighter') return { ...current, tool, color: '#facc15', width: 4, highlighterOpacity: 0.3, dash: 'solid' };
        return { ...current, tool, color: '#172554', width: 2, penType: 'ballpoint', pressureSensitivity: 'normal', streamlineLevel: 'smooth', dash: 'solid' };
    }
}
