import React, { useEffect, useRef, useState } from 'react';
import { PenTool, Highlighter, Eraser, Lasso, Hand, Type, Shapes, Undo, Redo, BookOpen, FlaskConical, ChevronDown, SlidersHorizontal, ImagePlus, Camera, Minus, Plus, Scan, X, Grid2X2, Ruler, Circle, Square, Triangle, Diamond, ArrowUpRight, Paintbrush, Pencil, Check } from 'lucide-react';
import type { DrawConfig, DrawingTool, PaperStyle } from '../../../types';
import type { DrawingToolbarProps } from './toolbarTypes';
import { ObjectLibraryPanel } from '../ObjectLibraryPanel';
import { DynamicLabPanel } from './DynamicLabPanel';
import { InkToolMemory } from '../InkEngine/toolMemory';
import { MM_TO_PX, type GoodnotesPen } from './types';
import { ribbonOutline } from './InkEngine';
import './toolbar.css';
const names: Record<GoodnotesPen, string> = { fountain: 'Dolma Kalem', ballpoint: 'Tükenmez Kalem', brush: 'Fırça Kalem' };
const pastel = ['#182230', '#2563eb', '#e34c55', '#8a5cf5', '#28a878', '#f4bb44', '#f5a6bd', '#b7d9f2', '#b9ddc6', '#dec9f0', '#ffffff', '#000000'];
type Panel = 'pen' | 'lasso' | 'eraser' | 'color' | 'width' | 'library' | 'lab' | 'page' | 'shapes' | null;
interface Preferences {
    colors: string[];
    widths: number[];
    pens: Partial<Record<GoodnotesPen, {
        tipSharpness: number;
        pressureResponse: number;
    }>>;
}
function readPreferences(): Preferences {
    const defaults = { colors: ['#ffffff', '#182230', '#0085ff', '#008565', '#ff302b', '#ff9f1c', '#8a5cf5'], widths: [.3, .5, .7], pens: {} };
    try {
        const p = JSON.parse(localStorage.getItem('goodnotes-toolbar-v3') || 'null');
        if (!p)
            return defaults;
        return { colors: Array.isArray(p.colors) && (p.colors.length === 3 || p.colors.length === 7) && p.colors.every((x: unknown) => typeof x === 'string' && /^#[0-9a-f]{6}$/i.test(x)) ? [...p.colors, ...defaults.colors.filter(c => !p.colors.includes(c))].slice(0, 7) : defaults.colors,
            widths: Array.isArray(p.widths) && p.widths.length === 3 && p.widths.every((x: unknown) => typeof x === 'number' && x >= .1 && x <= 5) ? p.widths : defaults.widths, pens: Object.fromEntries((['fountain','ballpoint','brush'] as const).flatMap(pen => {
                const saved = p.pens?.[pen];
                if (!saved || !Number.isFinite(saved.tipSharpness) || !Number.isFinite(saved.pressureResponse)) return [];
                return [[pen, {tipSharpness: Math.max(0,Math.min(1,saved.tipSharpness)), pressureResponse: Math.max(0,Math.min(1,saved.pressureResponse))}]];
            })) };
    }
    catch {
        return defaults;
    }
}
function Range({ label, value, min = 0, max = 100, step = 1, unit = '%', onChange }: {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    onChange: (n: number) => void;
}) {
    return <label className="gn-range"><span>{label}<b>{Number(value.toFixed(2))}{unit}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)}/></label>;
}
export function GoodnotesPenToolbar(props: DrawingToolbarProps) {
    const { config, setConfig, fixed = false, compact = false, onOpenLibrary } = props;
    const [panel, setPanel] = useState<Panel>(null), [slot, setSlot] = useState(0), [prefs, setPrefs] = useState(readPreferences);
    const [lastShape, setLastShape] = useState<DrawingTool>('rect');
    const [hex, setHex] = useState(config.color);
    const root = useRef<HTMLDivElement>(null), file = useRef<HTMLInputElement>(null), memory = useRef(new InkToolMemory());
    const pen: GoodnotesPen = config.penType === 'fountain' || config.penType === 'brush' ? config.penType : 'ballpoint';
    // Migrate retired tips only for new input; saved strokes retain their engine.
    useEffect(() => { if (config.penType && !['ballpoint', 'fountain', 'brush'].includes(config.penType))
        setConfig({ ...config, penType: 'ballpoint' }); }, [config, setConfig]);
    const preview = ribbonOutline(Array.from({ length: 80 }, (_, i) => ({ x: 12 + i * 3.2, y: 28 + Math.sin(i / 8) * 14, p: .2 + .8 * (.5 + .5 * Math.sin(i / 13)), velocity: 400 })), { pen, width: 3, sharpness: config.tipSharpness ?? .5, sensitivity: config.pressureResponse ?? .65, complete: true }).map(p => `${p.x},${p.y}`).join(' ');
    const restored = useRef(false);
    useEffect(() => { if (restored.current)
        return; restored.current = true; const saved = prefs.pens[pen]; if (saved)
        setConfig({ ...config, ...saved }); }, [config, pen, prefs.pens, setConfig]);
    useEffect(() => { memory.current.remember(config); }, [config]);
    useEffect(() => { try {
        localStorage.setItem('goodnotes-toolbar-v3', JSON.stringify(prefs));
    }
    catch { /* storage optional */ } }, [prefs]);
    useEffect(() => {
        if (!panel)
            return;
        const outside = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node))
            setPanel(null); };
        const escape = (e: KeyboardEvent) => { if (e.key === 'Escape')
            setPanel(null); };
        document.addEventListener('pointerdown', outside);
        document.addEventListener('keydown', escape);
        return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
    }, [panel]);
    const patch = (p: Partial<DrawConfig>) => setConfig({ ...config, ...p });
    const select = React.useCallback((tool: DrawingTool) => { const next = memory.current.select(config, tool); setConfig(tool === 'eraser' ? {...next, eraserMode:config.eraserMode ?? 'stroke', eraserSize:config.eraserSize ?? 'medium'} : next); setPanel(null); }, [config, setConfig]);
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented)
                return;
            const el = e.target as HTMLElement;
            if (el.isContentEditable || el.closest('input,textarea,select,button,[role="dialog"]'))
                return;
            const tools: Record<string, DrawingTool> = { p: 'pencil', e: 'eraser', h: 'highlighter', l: 'lasso', v: 'select', t: 'text' };
            if (tools[e.key.toLowerCase()]) {
                e.preventDefault();
                select(tools[e.key.toLowerCase()]);
            }
            if (e.key.toLowerCase() === 'k') {
                e.preventDefault();
                onOpenLibrary ? onOpenLibrary() : setPanel('library');
            }
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
    }, [select, onOpenLibrary]);
    const toggle = (p: Panel) => setPanel(panel === p ? null : p);
    const brushSetting = (p: Partial<DrawConfig>) => {
        patch(p);
        setPrefs({ ...prefs, pens: { ...prefs.pens, [pen]: { tipSharpness: config.tipSharpness ?? .5, pressureResponse: config.pressureResponse ?? .65, ...p } } });
    };
    const color = (value: string) => {
        setHex(value);
        if (!/^#[0-9a-f]{6}$/i.test(value))
            return;
        const colors = [...prefs.colors];
        colors[slot] = value;
        setPrefs({ ...prefs, colors });
        patch({ color: value });
    };
    const button = (title: string, Icon: typeof PenTool, action: () => void, active = false, disabled = false) => <button type="button" key={title} data-tone={Icon === Eraser ? 'rose' : Icon === Highlighter ? 'amber' : Icon === Shapes || Icon === FlaskConical || Icon === Lasso ? 'violet' : Icon === Hand || Icon === BookOpen ? 'teal' : 'blue'} className={`gn-icon ${active ? 'is-active' : ''}`} title={title} aria-label={title} aria-pressed={active ? true : undefined} onClick={action} disabled={disabled}><Icon size={21}/></button>;
    return <div ref={root} data-tool={config.tool} className={`gn-toolbar ${fixed ? 'gn-fixed' : 'gn-floating'} ${compact ? 'gn-compact' : ''}`} onPointerDown={e => e.stopPropagation()}>
        <div className="gn-main" role="toolbar" aria-label="Ana çizim araçları">
            {button('Kement (L)', Lasso, () => config.tool === 'lasso' ? toggle('lasso') : select('lasso'), config.tool === 'lasso')}
            {button('Kalem (P)', PenTool, () => config.tool === 'pencil' ? toggle('pen') : select('pencil'), config.tool === 'pencil')}
            {button('Fosforlu kalem (H)', Highlighter, () => select('highlighter'), config.tool === 'highlighter')}
            {button('Silgi (E)', Eraser, () => config.tool === 'eraser' ? toggle('eraser') : select('eraser'), config.tool === 'eraser')}
            {button('Metin (T)', Type, () => select('text'), config.tool === 'text')}
            {props.onInsertImages && button('Görsel ekle', ImagePlus, () => file.current?.click(), false, props.isInsertingImage)}
            {button('Şekiller', Shapes, () => select(lastShape), ['line','arrow','circle','ellipse','rect','triangle','diamond'].includes(config.tool))}
            {button('Sayfayı taşı', Hand, () => select('pan'), config.tool === 'pan')}
            <span className="gn-main-divider"/>
            {button('Kütüphane', BookOpen, () => onOpenLibrary ? onOpenLibrary() : toggle('library'), props.isLibraryOpen || panel === 'library')}
            {props.onSelectTool && button('Dinamik Laboratuvar', FlaskConical, () => toggle('lab'), panel === 'lab')}
            {button('Sayfa ve yazma ayarları', Grid2X2, () => toggle('page'), panel === 'page')}
        </div>
        <div className="gn-context-row">
            <div className="gn-history" role="toolbar" aria-label="Çizim geçmişi">
                {button('Geri al', Undo, () => props.onCommand('UNDO_DRAWING'), false, props.canUndo === false)}
                {button('İleri al', Redo, () => props.onCommand('REDO_DRAWING'), false, props.canRedo === false)}
            </div>
            {(config.tool === 'pencil' || config.tool === 'highlighter' || ['line','arrow','circle','ellipse','rect','triangle','diamond'].includes(config.tool)) && <div className="gn-context" role="toolbar" aria-label="Kalem araç çubuğu">
                {config.tool === 'pencil' && <div className="gn-group gn-tips">
                    {(['fountain','ballpoint','brush'] as const).map(p => <button type="button" key={p} data-tone={p === 'fountain' ? 'blue' : p === 'ballpoint' ? 'teal' : 'violet'} className={`gn-tip ${pen === p ? 'is-active' : ''}`} aria-label={names[p]} aria-pressed={pen === p} onClick={() => {
                        if (pen === p) toggle('pen');
                        else patch({penType:p, tipSharpness:prefs.pens[p]?.tipSharpness ?? .5, pressureResponse:prefs.pens[p]?.pressureResponse ?? .65});
                    }}>{p === 'fountain' ? <PenTool/> : p === 'ballpoint' ? <Pencil/> : <Paintbrush/>}{pen === p && <ChevronDown size={13}/>}</button>)}
                </div>}
                {config.tool === 'highlighter' && <button type="button" className="gn-tip is-active" aria-label="Fosforlu kalem ayarları" onClick={() => { setSlot(0); toggle('width'); }}><Highlighter/><ChevronDown size={13}/></button>}
                {['line','arrow','circle','ellipse','rect','triangle','diamond'].includes(config.tool) && <div className="gn-group gn-shape-tools">
                    {([['line','Çizgi',Minus],['arrow','Ok',ArrowUpRight],['rect','Dikdörtgen',Square],['circle','Daire',Circle],['ellipse','Elips',Circle],['triangle','Üçgen',Triangle],['diamond','Eşkenar dörtgen',Diamond]] as const).map(([tool,label,Icon]) => <button type="button" key={tool} className={`gn-tip ${config.tool === tool ? 'is-active' : ''}`} aria-label={label} aria-pressed={config.tool === tool} onClick={() => { setLastShape(tool); select(tool); }}><Icon className={tool === 'ellipse' ? 'gn-ellipse-icon' : undefined}/></button>)}
                    <button type="button" className={`gn-tip ${config.fillEnabled ? 'is-active' : ''}`} aria-label="Şekli doldur" aria-pressed={config.fillEnabled} onClick={() => patch({fillEnabled:!config.fillEnabled})}><Square fill={config.fillEnabled ? 'currentColor' : 'none'}/></button>
                </div>}
                <span className="gn-divider"/>
                <div className="gn-group" aria-label="Üç hızlı kalınlık">
                    {prefs.widths.map((w,i) => <button type="button" key={i} className={`gn-width ${Math.abs(config.width-w*MM_TO_PX)<.05 ? 'is-selected' : ''}`} aria-label={`${w} mm · düzenlemek için çift dokun`} aria-pressed={Math.abs(config.width-w*MM_TO_PX)<.05} title={`${w} mm`} onClick={() => { if(Math.abs(config.width-w*MM_TO_PX)<.05) {setSlot(i);toggle('width');} else patch({width:w*MM_TO_PX}); }} onDoubleClick={() => {setSlot(i);setPanel('width');}}><span style={{height:Math.max(2,w*8)}}/></button>)}
                </div>
                <span className="gn-divider"/>
                <div className="gn-group" aria-label="Hızlı renkler">
                    {prefs.colors.slice(0,5).map((c,i) => <button type="button" key={i} className={`gn-color ${config.color.toLowerCase() === c.toLowerCase() ? 'is-selected' : ''}`} style={{'--ink':c} as React.CSSProperties} aria-label={`Renk ${i+1}: ${c}`} aria-pressed={config.color.toLowerCase() === c.toLowerCase()} onClick={() => {
                        if(config.color.toLowerCase() === c.toLowerCase()) {setSlot(i);setHex(c);toggle('color');}
                        else patch({color:c});
                    }} onDoubleClick={() => {setSlot(i);setHex(c);setPanel('color');}}><span>{config.color.toLowerCase() === c.toLowerCase() && <ChevronDown size={14} color={c === '#ffffff' ? '#182230' : '#ffffff'}/>}</span></button>)}
                    <button type="button" className="gn-color gn-custom-color" aria-label="Renk paleti" style={{'--ink':config.color} as React.CSSProperties} onClick={() => {const i=prefs.colors.indexOf(config.color);setSlot(i<0?0:i);setHex(config.color);toggle('color');}}><span><SlidersHorizontal size={15} color={config.color === '#ffffff' ? '#182230' : '#ffffff'}/></span></button>
                </div>
            </div>}
            {config.tool === 'eraser' && <div className="gn-context gn-eraser-context" role="toolbar" aria-label="Silgi araç çubuğu">
                <button type="button" className="gn-eraser-kind" aria-expanded={panel === 'eraser'} onClick={() => toggle('eraser')}><Eraser/><span>{config.eraserMode === 'stroke' ? 'Çizgi' : config.eraserMode === 'precision' ? 'Detaylı' : 'Standart'}</span><ChevronDown size={16}/></button>
                <button type="button" className={`gn-tip ${config.autoSwitchBackEraser ? 'is-active' : ''}`} aria-label="Silme sonrası kaleme dön" aria-pressed={config.autoSwitchBackEraser ?? false} onClick={() => patch({autoSwitchBackEraser:!config.autoSwitchBackEraser})}><PenTool size={22}/></button>
                <span className="gn-divider"/>
                {(['small','medium','large'] as const).map((size,i) => <button type="button" className={`gn-eraser-size ${config.eraserSize === size ? 'is-selected' : ''}`} aria-label={`${['Küçük','Orta','Büyük'][i]} silgi`} aria-pressed={config.eraserSize === size} key={size} onClick={() => patch({eraserSize:size})}><span style={{width:20+i*15,height:20+i*15}}/></button>)}
            </div>}
            {config.tool === 'lasso' && <button type="button" className="gn-context gn-lasso-trigger" onClick={() => toggle('lasso')} aria-expanded={panel === 'lasso'}><Lasso size={23}/><span>{config.lassoMode === 'rect' ? 'Dikdörtgen seçim' : 'Serbest seçim'}</span><ChevronDown size={16}/></button>}
            {props.onZoomOut && <div className="gn-zoom">{button('Uzaklaştır', Minus, () => props.onZoomOut?.())}<button type="button" onClick={props.onZoomReset}>%{Math.round((props.zoom ?? 1)*100)}</button>{button('Yakınlaştır', Plus, () => props.onZoomIn?.())}{props.onZoomFit && button('Sayfaya sığdır', Scan, props.onZoomFit)}</div>}
        </div>
        {panel && panel !== 'library' && panel !== 'lab' && <div className="gn-popover" role="dialog" aria-label="Araç ayarları"><div className="gn-popover-heading"><b>{({ pen: 'Kalem', lasso: 'Kement', eraser: 'Silgi', color: 'Renk paleti', width: 'Çizgi kalınlığı', page: 'Sayfa ve yazma', shapes: 'Şekiller' })[panel]}</b><button type="button" onClick={() => setPanel(null)} aria-label="Ayarları kapat"><X size={17}/></button></div>
            {panel === 'pen' && <>
                <div className="gn-pen-tabs">{(['fountain', 'ballpoint', 'brush'] as const).map(p => <button type="button" className={pen === p ? 'is-active' : ''} key={p} onClick={() => patch({ tool: 'pencil', penType: p, tipSharpness: prefs.pens[p]?.tipSharpness ?? .5, pressureResponse: prefs.pens[p]?.pressureResponse ?? .65 })}><PenTool size={22}/>{names[p]}</button>)}</div>
                <svg viewBox="0 0 280 55" className="gn-preview" aria-label="Kalem karakteri ön izlemesi"><polygon points={preview} fill={config.color}/><path d="M12 50h256" stroke="#e7eaf0"/></svg>
                <p>{pen === 'ballpoint' ? 'Sabit genişlik. Net ve dengeli el yazısı.' : pen === 'fountain' ? 'Açılı uç. Hıza, basınca ve kalem eğimine duyarlı.' : 'Dinamik basınç. Dolgun vuruşlar ve ince bitişler.'}</p>
                <Range label="Çizgi kalınlığı" min={.1} max={5} step={.05} unit=" mm" value={config.width / MM_TO_PX} onChange={w => patch({ width: w * MM_TO_PX })}/>
                {pen === 'fountain' && <Range label="Uç keskinliği" value={(config.tipSharpness ?? .5) * 100} onChange={v => brushSetting({ tipSharpness: v / 100 })}/>}
                {pen !== 'ballpoint' && <Range label="Basınç duyarlılığı" value={(config.pressureResponse ?? .65) * 100} onChange={v => brushSetting({ pressureResponse: v / 100 })}/>}
                <label className="gn-toggle">Çiz ve bekle<input type="checkbox" checked={config.snapShapes ?? true} onChange={e => patch({ snapShapes: e.target.checked })}/></label>
                <label className="gn-toggle">Karalayarak sil<input type="checkbox" checked={config.smartScribbleErase ?? true} onChange={e => patch({ smartScribbleErase: e.target.checked })}/></label>
            </>}
            {panel === 'color' && <><div className="gn-palette">{pastel.map(c => <button type="button" key={c} style={{ background: c }} title={c} aria-label={c} onClick={() => color(c)}/>)}</div><label className="gn-hex">HEX<input value={hex} onChange={e => color(e.target.value)} maxLength={7} aria-invalid={!/^#[0-9a-f]{6}$/i.test(hex)}/><input type="color" value={prefs.colors[slot]} onChange={e => color(e.target.value)} aria-label="Özel renk"/></label><p>{slot + 1}. hızlı renk slotu düzenleniyor.</p></>}
            {panel === 'width' && <><Range label={`${slot + 1}. kalınlık slotu`} min={.1} max={5} step={.05} unit=" mm" value={prefs.widths[slot]} onChange={w => { const widths = [...prefs.widths]; widths[slot] = w; setPrefs({ ...prefs, widths }); patch({ width: w * MM_TO_PX }); }}/><p>1 mm = {MM_TO_PX.toFixed(2)} sayfa pikseli. Görünüm yakınlaştırması çizgi boyutunu değiştirmez.</p></>}
            {panel === 'eraser' && <>
                <div className="gn-eraser-types">{([['precision','Detaylı Silgi'],['pixel','Standart Silgi'],['stroke','Çizgi Silgisi']] as const).map(([mode,label]) => <button type="button" key={mode} className={(config.eraserMode ?? 'pixel') === mode ? 'is-active' : ''} aria-pressed={(config.eraserMode ?? 'pixel') === mode} onClick={() => patch({eraserMode:mode})}><Eraser size={32}/><span>{label}</span>{(config.eraserMode ?? 'pixel') === mode && <Check size={15}/>}</button>)}</div>
                <p>{config.eraserMode === 'stroke' ? 'Dokunduğun fırça darbesinin tamamını sil.' : config.eraserMode === 'precision' ? 'Küçük temas alanıyla çizginin istediğin bölümünü hassasça sil.' : 'Silginin geçtiği bölümlerdeki mürekkebi sil.'}</p>
                <label className="gn-toggle">Silme sonrası kaleme dön<input type="checkbox" checked={config.autoSwitchBackEraser ?? false} onChange={e => patch({autoSwitchBackEraser:e.target.checked})}/></label>
            </>}
            {panel === 'lasso' && <>
                <div className="gn-options"><button type="button" className={config.lassoMode !== 'rect' ? 'is-active' : ''} onClick={() => patch({ lassoMode: 'freeform' })}>Serbest seçim</button><button type="button" className={config.lassoMode === 'rect' ? 'is-active' : ''} onClick={() => patch({ lassoMode: 'rect' })}>Dikdörtgen seçim</button></div>
                {([['lassoFilterHandwriting', 'El yazısı'], ['lassoFilterShapes', 'Şekiller'], ['lassoFilterText', 'Metin'], ['lassoFilterImages', 'Görseller']] as const).map(([key, label]) => <label className="gn-toggle" key={key}>{label}<input type="checkbox" checked={config[key] !== false} onChange={e => patch({ [key]: e.target.checked })}/></label>)}
            </>}
            {panel === 'shapes' && <div className="gn-options">{([['line', 'Çizgi'], ['circle', 'Daire'], ['ellipse', 'Elips'], ['triangle', 'Üçgen'], ['rect', 'Dikdörtgen'], ['arrow', 'Ok']] as const).map(([t, n]) => <button type="button" key={t} onClick={() => select(t)}>{n}</button>)}</div>}
            {panel === 'page' && <>
                <label className="gn-toggle">Avuç içi reddi<input type="checkbox" checked={config.palmRejection ?? true} onChange={e => patch({ palmRejection: e.target.checked })}/></label>
                <label className="gn-toggle">Çiz ve bekle<input type="checkbox" checked={config.snapShapes ?? true} onChange={e => patch({ snapShapes: e.target.checked })}/></label>
                <label className="gn-toggle">Karalayarak sil<input type="checkbox" checked={config.smartScribbleErase ?? true} onChange={e => patch({ smartScribbleErase: e.target.checked })}/></label>
                {props.onPaperChange && <label className="gn-hex">Kağıt<select value={props.paper} onChange={e => props.onPaperChange?.(e.target.value as PaperStyle)}>{[['blank', 'Boş'], ['grid', 'Kareli'], ['lined', 'Çizgili'], ['dotted', 'Noktalı'], ['graph_mm', 'Milimetrik']].map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select></label>}
                {props.onBgColorChange && <label className="gn-hex">Kağıt rengi<input type="color" value={props.bgColor ?? '#ffffff'} onChange={e => props.onBgColorChange?.(e.target.value)}/></label>}
                <div className="gn-options"><button type="button" className={config.ruler ? 'is-active' : ''} onClick={() => patch({ ruler: config.ruler ? null : 'ruler' })}><Ruler size={16}/> Cetvel</button>{props.onInsertImages && <button type="button" disabled={props.isInsertingImage} onClick={() => file.current?.click()}><ImagePlus size={16}/> Görsel ekle</button>}{props.onScreenshot && <button type="button" onClick={props.onScreenshot}><Camera size={16}/> Ekran görüntüsü</button>}{props.setShowWhiteboard && <button type="button" onClick={() => props.setShowWhiteboard?.(!props.showWhiteboard)}>Beyaz tahta</button>}</div>
            </>}
        </div>}
        {props.onInsertMath && <div className="gn-library"><ObjectLibraryPanel open={panel === 'library'} onClose={() => setPanel(null)} onInsert={props.onInsertMath} onSelectTool={props.onSelectTool}/></div>}
        <div className="gn-lab"><DynamicLabPanel open={panel === 'lab'} onClose={() => setPanel(null)} onSelectTool={props.onSelectTool}/></div>
        <input ref={file} type="file" accept="image/*" multiple hidden onChange={e => { if (e.target.files)
        props.onInsertImages?.(e.target.files); e.target.value = ''; }}/>
    </div>;
}
