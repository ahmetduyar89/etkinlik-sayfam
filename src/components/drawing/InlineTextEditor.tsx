import React from 'react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Check, GripHorizontal, Italic, Trash2, X } from 'lucide-react';
import type { Viewport } from '../../types';
import { textFontFamily, textLayout } from './textLayout';
import './text-editor.css';

export interface TextDraft {
    sessionId: string;
    worldX: number;
    worldY: number;
    text: string;
    fontSize: number;
    color: string;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    bold?: boolean;
    italic?: boolean;
    boxWidth?: number;
    strokeIdx?: number;
    strokeId?: string;
}
interface Props {
    draft: TextDraft;
    view: Viewport;
    viewport: {w:number; h:number};
    pageBox?: { w: number; h: number } | null;
    containerRef: React.RefObject<HTMLDivElement>;
    onChange: (patch: Partial<TextDraft>) => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete: () => void;
}

export function InlineTextEditor({ draft, view, viewport, pageBox, containerRef, onChange, onSave, onCancel, onDelete }: Props) {
    const [fontInput, setFontInput] = React.useState(String(draft.fontSize));
    React.useEffect(() => setFontInput(String(draft.fontSize)), [draft.fontSize, draft.sessionId]);
    const textarea = React.useRef<HTMLTextAreaElement>(null);
    const drag = React.useRef<{ id: number; x: number; y: number; worldX: number; worldY: number } | null>(null);
    const resize = React.useRef<{id:number; x:number; width:number; left:number} | null>(null);
    React.useLayoutEffect(() => {
        const input = textarea.current;
        input?.focus({ preventScroll: true });
        input?.setSelectionRange(input.value.length, input.value.length);
    }, [draft.sessionId]);
    const layout = textLayout({text:draft.text, width:draft.fontSize, fontFamily:draft.fontFamily, bold:draft.bold, italic:draft.italic, textBoxWidth:draft.boxWidth});
    const width = draft.boxWidth ?? Math.max(160, layout.width);
    const offset = draft.textAlign === 'center' ? width / 2 : draft.textAlign === 'right' ? width : 0;
    const left = (draft.worldX - offset) * view.scale + view.tx;
    const top = draft.worldY * view.scale + view.ty;
    React.useLayoutEffect(() => {
        const input = textarea.current;
        if (!input) return;
        input.style.height = '0px';
        input.style.height = `${Math.max(input.scrollHeight, layout.height)}px`;
    }, [draft.text, draft.boxWidth, draft.fontSize, draft.fontFamily, draft.bold, draft.italic, layout.height]);
    const formatWidth = Math.min(430, viewport.w - 24);
    const fitLeft = (barWidth: number) => Math.max(8 - left, Math.min(0, viewport.w - barWidth - left - 8));
    const actionsTop = Math.max(8 - top, Math.min(top < 56 ? layout.height * view.scale + 10 : -52, viewport.h - top - 56));
    const formatTop = Math.max(8 - top, Math.min(Math.max(layout.height, textarea.current?.scrollHeight ?? 0) * view.scale + (top < 56 ? 62 : 12), viewport.h - top - 130));
    const format = (patch: Partial<TextDraft>) => {
        onChange(patch);
        // Biçimlendirme sonrasında klavye ve seçim yerini koru.
        textarea.current?.focus({ preventScroll: true });
    };
    return <div className="text-editor-layer" data-text-editing>
        <div ref={containerRef} className="text-editor" style={{left, top}} onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            <div className="text-editor-actions" style={{left:fitLeft(216), top:actionsTop}} role="toolbar" aria-label="Metin işlemleri">
                <button type="button" aria-label="Metni taşı" title="Metni sürükleyerek taşı" className="text-editor-move"
                    onPointerDown={e => {
                        e.preventDefault();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        drag.current = {id:e.pointerId, x:e.clientX, y:e.clientY, worldX:draft.worldX, worldY:draft.worldY};
                    }}
                    onPointerMove={e => {
                        const start = drag.current;
                        if (!start || start.id !== e.pointerId) return;
                        const x = start.worldX + (e.clientX - start.x) / view.scale;
                        const y = start.worldY + (e.clientY - start.y) / view.scale;
                        onChange({worldX:pageBox ? Math.max(offset, Math.min(pageBox.w - width + offset, x)) : x, worldY:pageBox ? Math.max(0,Math.min(pageBox.h - layout.height, y)) : y});
                    }} onPointerUp={() => {drag.current=null;}} onPointerCancel={() => {drag.current=null;}}><GripHorizontal size={18}/></button>
                <button type="button" aria-label="Metni kaydet" title="Metni kaydet (⌘/Ctrl + Enter)" onClick={onSave}><Check size={18}/><span>Bitti</span></button>
                <button type="button" aria-label="Metin düzenlemesini iptal et" title="Değişikliklerden vazgeç" onClick={onCancel}><X size={18}/></button>
                <button type="button" aria-label="Metni sil" title="Metni sil" onClick={onDelete}><Trash2 size={18}/></button>
            </div>
            <div className="text-editor-field" style={{width, transform:`scale(${view.scale})`}}>
                <textarea ref={textarea} aria-label="Sayfa metni" placeholder="Buraya yazın…" value={draft.text} wrap={draft.boxWidth ? 'soft' : 'off'}
                    style={{fontSize:draft.fontSize, color:draft.color, fontFamily:textFontFamily(draft.fontFamily), fontWeight:draft.bold ? 'bold' : 'normal', fontStyle:draft.italic ? 'italic' : 'normal', textAlign:draft.textAlign ?? 'left'}}
                    onChange={e => onChange({text:e.target.value})}
                    onKeyDown={e => {
                        e.stopPropagation();
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {e.preventDefault();onSave();}
                    }}/>
                <button type="button" className="text-editor-resize" aria-label="Metin kutusunu genişlet veya daralt" title="Genişliği değiştirmek için sürükleyin"
                    onPointerDown={e => {
                        e.preventDefault();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        resize.current = {id:e.pointerId, x:e.clientX, width, left:draft.worldX-offset};
                    }}
                    onPointerMove={e => {
                        const start = resize.current;
                        if (!start || start.id !== e.pointerId) return;
                        const max = pageBox ? Math.max(80, pageBox.w-start.left) : 1600;
                        const nextWidth = Math.max(80, Math.min(max, start.width+(e.clientX-start.x)/view.scale));
                        const anchorOffset = draft.textAlign === 'center' ? nextWidth/2 : draft.textAlign === 'right' ? nextWidth : 0;
                        onChange({boxWidth:nextWidth, worldX:start.left+anchorOffset});
                    }}
                    onPointerUp={() => {resize.current=null;}}
                    onPointerCancel={() => {resize.current=null;}}
                    onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                        e.preventDefault();
                        const nextWidth = Math.max(80, Math.min(pageBox ? Math.max(80,pageBox.w-draft.worldX+offset) : 1600,width+(e.key === 'ArrowRight' ? 10 : -10)));
                        const anchorOffset = draft.textAlign === 'center' ? nextWidth/2 : draft.textAlign === 'right' ? nextWidth : 0;
                        onChange({boxWidth:nextWidth,worldX:draft.worldX-offset+anchorOffset});
                    }}><span/></button>
            </div>
            <div className="text-editor-format" style={{left:fitLeft(formatWidth), top:formatTop, width:formatWidth}} role="toolbar" aria-label="Metin biçimlendirme">
                <label>Yazı tipi<select aria-label="Yazı tipi" value={draft.fontFamily ?? 'sans'} onChange={e => format({fontFamily:e.target.value})}><option value="sans">Modern</option><option value="serif">Klasik</option><option value="mono">Eş aralıklı</option><option value="cursive">El yazısı</option></select></label>
                <label>Boyut<input aria-label="Yazı boyutu" type="number" min={10} max={120} value={fontInput} onChange={e => {setFontInput(e.target.value);const n=Number(e.target.value);if(n>=10 && n<=120)onChange({fontSize:n});}} onBlur={()=>{const n=Math.max(10,Math.min(120,Number(fontInput)||22));setFontInput(String(n));onChange({fontSize:n});}}/></label>
                <label>Renk<input aria-label="Metin rengi" type="color" value={draft.color} onChange={e => format({color:e.target.value})}/></label>
                <button type="button" aria-label="Kalın metin" aria-pressed={draft.bold ?? false} onPointerDown={e=>e.preventDefault()} onClick={()=>format({bold:!draft.bold})}><Bold size={18}/></button>
                <button type="button" aria-label="İtalik metin" aria-pressed={draft.italic ?? false} onPointerDown={e=>e.preventDefault()} onClick={()=>format({italic:!draft.italic})}><Italic size={18}/></button>
                {([['left','Sola hizala',AlignLeft],['center','Ortala',AlignCenter],['right','Sağa hizala',AlignRight]] as const).map(([align,label,Icon])=><button type="button" key={align} aria-label={label} aria-pressed={(draft.textAlign ?? 'left')===align} onPointerDown={e=>e.preventDefault()} onClick={()=>format({textAlign:align})}><Icon size={18}/></button>)}
            </div>
        </div>
    </div>;
}
