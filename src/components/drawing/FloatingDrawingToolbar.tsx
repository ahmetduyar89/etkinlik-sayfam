import { useLayoutEffect, useRef, useState } from 'react';
import { GripVertical, PanelTopClose, Pencil } from 'lucide-react';
import { DrawingToolbar } from './DrawingToolbar';
import type { DrawingToolbarProps } from './goodnotes/toolbarTypes';
import './floating-toolbar.css';

/** Viewport overlay, outside the scrolling and zoomed content. */
export function FloatingDrawingToolbar(props: DrawingToolbarProps) {
    const layer = useRef<HTMLDivElement>(null);
    const palette = useRef<HTMLDivElement>(null);
    const drag = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(null);
    const [position, setPosition] = useState({ left: 12, top: 12 });
    const [collapsed, setCollapsed] = useState(false);
    const constrain = (left: number, top: number) => {
        const host = layer.current, bar = palette.current;
        if (!host || !bar) return { left, top };
        return {
            left: Math.max(8, Math.min(left, host.clientWidth - bar.offsetWidth - 8)),
            top: Math.max(8, Math.min(top, host.clientHeight - bar.offsetHeight - 8)),
        };
    };
    useLayoutEffect(() => {
        const resize = () => setPosition(p => {
            const next = constrain(p.left, p.top);
            return next.left === p.left && next.top === p.top ? p : next;
        });
        const observer = new ResizeObserver(resize);
        if (layer.current) observer.observe(layer.current);
        if (palette.current) observer.observe(palette.current);
        resize();
        return () => observer.disconnect();
    }, []);
    return <div ref={layer} className="content-ink-layer">
        <div ref={palette} className="content-ink-palette" style={position} onPointerDown={e => e.stopPropagation()}>
            <button type="button" className="content-ink-handle" aria-label="Kalem araçlarını taşı" title="Sürükleyerek taşı · ok tuşlarıyla taşı"
                onPointerDown={e => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, ...position };
                }}
                onPointerMove={e => {
                    const start = drag.current;
                    if (start?.id === e.pointerId) setPosition(constrain(start.left + e.clientX - start.x, start.top + e.clientY - start.y));
                }}
                onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}
                onKeyDown={e => {
                    const delta: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
                    if (!delta[e.key]) return;
                    e.preventDefault();
                    const [x, y] = delta[e.key];
                    setPosition(p => constrain(p.left + x, p.top + y));
                }}><GripVertical size={18}/></button>
            <div className="content-ink-tools" hidden={collapsed}><DrawingToolbar {...props} fixed compact /></div>
            <button type="button" className="content-ink-collapse" onClick={() => setCollapsed(v => !v)} aria-expanded={!collapsed}
                aria-label={collapsed ? 'Kalem araçlarını aç' : 'Kalem araçlarını küçült'} title={collapsed ? 'Kalem araçlarını aç' : 'Kalem araçlarını küçült'}>
                {collapsed ? <Pencil size={20}/> : <PanelTopClose size={20}/>}
            </button>
        </div>
    </div>;
}
