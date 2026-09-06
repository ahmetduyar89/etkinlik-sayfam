import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { GripHorizontal, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { TextBoxData, Viewport } from '../../types';
import { TEXTBOX_COLORS, getTextBoxTextColor } from '../../constants/drawing';

interface TextBoxItemProps {
    box: TextBoxData;
    view: Viewport;
    onUpdate: (next: TextBoxData) => void;
    onDelete: () => void;
}

function TextBoxItem({ box, view, onUpdate, onDelete }: TextBoxItemProps) {
    const [editing, setEditing] = React.useState(box.text === '');
    const textRef = React.useRef<HTMLTextAreaElement>(null);
    const dragControls = useDragControls();

    React.useEffect(() => {
        if (editing) textRef.current?.focus();
    }, [editing]);

    const textColor = getTextBoxTextColor(box.color);

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={(_, info) => {
                // Konumu dünya koordinatında sakla; ölçek geri alınır.
                onUpdate({
                    ...box,
                    x: box.x + info.offset.x / view.scale,
                    y: box.y + info.offset.y / view.scale,
                });
            }}
            className="absolute group pointer-events-auto"
            style={{
                // Notlar da çizimlerle aynı dünya koordinatında durur;
                // yakınlaştırma ölçek, kaydırma ise konum olarak uygulanır.
                left: box.x * view.scale + view.tx,
                top: box.y * view.scale + view.ty,
                transform: `scale(${view.scale})`,
                transformOrigin: '0 0',
                zIndex: 4800,
                minWidth: 120,
                maxWidth: 320,
                touchAction: 'none',
            }}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div
                className="relative rounded-xl shadow-xl border border-black/10 overflow-visible"
                style={{ backgroundColor: box.color, padding: '8px 12px' }}
            >
                <div
                    onPointerDown={(e) => {
                        e.stopPropagation();
                        dragControls.start(e);
                    }}
                    aria-label="Taşı"
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-black/20 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                    <GripHorizontal className="w-3 h-2" style={{ color: textColor }} />
                </div>

                {editing ? (
                    <textarea
                        ref={textRef}
                        value={box.text}
                        onChange={(e) => onUpdate({ ...box, text: e.target.value })}
                        onBlur={() => {
                            if (box.text.trim()) setEditing(false);
                        }}
                        className="bg-transparent resize-none outline-none w-full min-w-[100px]"
                        style={{
                            color: textColor,
                            fontSize: box.fontSize,
                            lineHeight: 1.4,
                            minHeight: 40,
                        }}
                        rows={3}
                        aria-label="Not metni"
                    />
                ) : (
                    <p
                        onDoubleClick={() => setEditing(true)}
                        style={{
                            color: textColor,
                            fontSize: box.fontSize,
                            lineHeight: 1.4,
                            cursor: 'text',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        {box.text || <span className="opacity-40">Çift tıklayarak yazın…</span>}
                    </p>
                )}

                <div className="absolute -top-3 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div
                        role="radiogroup"
                        aria-label="Not rengi"
                        className="flex gap-0.5 bg-[#1a1b26]/90 backdrop-blur-sm rounded-full px-1.5 py-1 border border-white/10"
                    >
                        {TEXTBOX_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                role="radio"
                                aria-checked={box.color === c}
                                aria-label={`Renk ${c}`}
                                onClick={() => onUpdate({ ...box, color: c })}
                                className={cn(
                                    'w-4 h-4 rounded-full border transition-all hover:scale-125',
                                    box.color === c ? 'border-white scale-125' : 'border-transparent'
                                )}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={onDelete}
                        aria-label="Notu sil"
                        className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

interface TextBoxLayerProps {
    boxes: TextBoxData[];
    onUpdate: (id: string, next: TextBoxData) => void;
    onDelete: (id: string) => void;
    onAdd: (box: TextBoxData) => void;
    enabled: boolean;
    /** Çalışma alanının yakınlaştırma/kaydırma durumu. */
    view?: Viewport;
}

const IDENTITY_VIEW: Viewport = { scale: 1, tx: 0, ty: 0 };

export function TextBoxLayer({
    boxes,
    onUpdate,
    onDelete,
    onAdd,
    enabled,
    view = IDENTITY_VIEW,
}: TextBoxLayerProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (!enabled) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onAdd({
            id: Date.now().toString(),
            x: (e.clientX - rect.left - view.tx) / view.scale - 60,
            y: (e.clientY - rect.top - view.ty) / view.scale - 20,
            text: '',
            color: '#fff9c4',
            fontSize: 15,
        });
    };

    return (
        <div
            className={cn(
                'absolute inset-0 z-[4800]',
                enabled ? 'pointer-events-auto cursor-text' : 'pointer-events-none'
            )}
            onClick={handleClick}
        >
            {boxes.map((b) => (
                <TextBoxItem
                    key={b.id}
                    box={b}
                    view={view}
                    onUpdate={(upd) => onUpdate(b.id, upd)}
                    onDelete={() => onDelete(b.id)}
                />
            ))}
        </div>
    );
}
