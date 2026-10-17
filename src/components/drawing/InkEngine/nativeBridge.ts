import type { DrawingTool, PenType, Point, Stroke, Viewport } from '../../../types';

export interface NativeInkStrokePayload {
    id: string;
    tool: DrawingTool;
    color: string;
    width: number;
    opacity?: number;
    penType?: PenType;
    points: Point[];
}

export type PencilDoubleTapAction = 'switchEraser' | 'switchPrevious' | 'showColorPalette' | 'showInkAttributes';

type StrokeCompletedListener = (stroke: Stroke) => void;
type DoubleTapListener = (action?: PencilDoubleTapAction) => void;
type SqueezeListener = () => void;
type HoverListener = (data: { x: number; y: number; altitude?: number; azimuth?: number; roll?: number }) => void;

interface WebkitMessageHandler {
    postMessage: (message: Record<string, unknown>) => void;
}

declare global {
    interface Window {
        webkit?: {
            messageHandlers?: {
                inkEngine?: WebkitMessageHandler;
            };
        };
        InkEngineNative?: {
            onStrokeCompleted: (payload: NativeInkStrokePayload) => void;
            onPencilDoubleTap: (action?: PencilDoubleTapAction) => void;
            onPencilSqueeze: () => void;
            onPencilHover: (data: { x: number; y: number; altitude?: number; azimuth?: number; roll?: number }) => void;
        };
    }
}

class NativeInkBridge {
    private strokeListeners = new Set<StrokeCompletedListener>();
    private doubleTapListeners = new Set<DoubleTapListener>();
    private squeezeListeners = new Set<SqueezeListener>();
    private hoverListeners = new Set<HoverListener>();

    constructor() {
        this.installGlobalReceivers();
    }

    private installGlobalReceivers(): void {
        if (typeof window === 'undefined') return;
        window.InkEngineNative = {
            onStrokeCompleted: (payload: NativeInkStrokePayload) => {
                const stroke: Stroke = {
                    id: payload.id || `native-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    tool: payload.tool,
                    color: payload.color,
                    width: payload.width,
                    opacity: payload.opacity,
                    penType: payload.penType,
                    points: payload.points,
                    inkVersion: 2,
                };
                for (const listener of this.strokeListeners) {
                    try { listener(stroke); } catch (e) { console.error('Error in stroke listener:', e); }
                }
            },
            onPencilDoubleTap: (action?: PencilDoubleTapAction) => {
                for (const listener of this.doubleTapListeners) {
                    try { listener(action); } catch (e) { console.error('Error in double tap listener:', e); }
                }
            },
            onPencilSqueeze: () => {
                for (const listener of this.squeezeListeners) {
                    try { listener(); } catch (e) { console.error('Error in squeeze listener:', e); }
                }
            },
            onPencilHover: (data) => {
                for (const listener of this.hoverListeners) {
                    try { listener(data); } catch (e) { console.error('Error in hover listener:', e); }
                }
            },
        };
    }

    /** Returns true if running within a native WKWebView with registered InkEngine message handler. */
    isNativeAvailable(): boolean {
        return typeof window !== 'undefined' &&
            Boolean(window.webkit?.messageHandlers?.inkEngine);
    }

    private postToNative(type: string, data: Record<string, unknown> = {}): boolean {
        if (!this.isNativeAvailable()) return false;
        try {
            window.webkit?.messageHandlers?.inkEngine?.postMessage({ type, ...data });
            return true;
        } catch (e) {
            console.warn('Failed to post message to native InkEngine:', e);
            return false;
        }
    }

    setTool(tool: DrawingTool, width: number, color: string, penType?: PenType, opacity?: number): void {
        this.postToNative('setTool', { tool, width, color, penType, opacity });
    }

    setViewport(view: Viewport, pageBox?: { w: number; h: number } | null): void {
        this.postToNative('setViewport', {
            scale: view.scale,
            tx: view.tx,
            ty: view.ty,
            pageWidth: pageBox?.w,
            pageHeight: pageBox?.h,
        });
    }

    undo(): void {
        this.postToNative('undo');
    }

    redo(): void {
        this.postToNative('redo');
    }

    clear(): void {
        this.postToNative('clear');
    }

    onStrokeCompleted(listener: StrokeCompletedListener): () => void {
        this.strokeListeners.add(listener);
        return () => this.strokeListeners.delete(listener);
    }

    onPencilDoubleTap(listener: DoubleTapListener): () => void {
        this.doubleTapListeners.add(listener);
        return () => this.doubleTapListeners.delete(listener);
    }

    onPencilSqueeze(listener: SqueezeListener): () => void {
        this.squeezeListeners.add(listener);
        return () => this.squeezeListeners.delete(listener);
    }

    onPencilHover(listener: HoverListener): () => void {
        this.hoverListeners.add(listener);
        return () => this.hoverListeners.delete(listener);
    }
}

export const nativeInkBridge = new NativeInkBridge();
