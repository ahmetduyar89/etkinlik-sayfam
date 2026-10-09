import type { Stroke } from '../../types';

export function textFontFamily(family?: string): string {
    if (family === 'serif') return 'Georgia, Cambria, "Times New Roman", serif';
    if (family === 'mono') return 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    if (family === 'cursive') return 'Caveat, "Comic Sans MS", cursive';
    return 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
}

let measuringContext: CanvasRenderingContext2D | null = null;
export function textLayout(stroke: Pick<Stroke, 'text' | 'width' | 'fontFamily' | 'bold' | 'italic' | 'textBoxWidth'>) {
    const fontSize = stroke.width && stroke.width > 4 ? stroke.width : 20;
    const font = `${stroke.italic ? 'italic ' : ''}${stroke.bold ? 'bold ' : ''}${fontSize}px ${textFontFamily(stroke.fontFamily)}`;
    if (!measuringContext && typeof document !== 'undefined') measuringContext = document.createElement('canvas').getContext('2d');
    if (measuringContext) measuringContext.font = font;
    const measure = (text: string) => measuringContext?.measureText(text).width ?? text.length * fontSize * .62;
    const boxWidth = stroke.textBoxWidth;
    const lines: string[] = [];
    for (const paragraph of (stroke.text ?? '').split('\n')) {
        if (!boxWidth || measure(paragraph) <= boxWidth) { lines.push(paragraph); continue; }
        let line = '';
        for (const token of paragraph.match(/\S+\s*|\s+/gu) ?? []) {
            if (line && measure(line + token.trimEnd()) > boxWidth) { lines.push(line.trimEnd()); line = ''; }
            for (const char of token) {
                if (line && measure(line + char) > boxWidth) { lines.push(line.trimEnd()); line = ''; }
                line += char;
            }
        }
        lines.push(line.trimEnd());
    }
    return {
        font, fontSize, lines,
        width: boxWidth ?? Math.max(24, ...lines.map(measure)),
        height: Math.max(1, lines.length) * fontSize * 1.25,
    };
}
