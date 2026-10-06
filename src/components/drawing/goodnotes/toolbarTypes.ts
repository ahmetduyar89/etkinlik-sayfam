import type { DrawConfig, MathObject, PaperStyle } from '../../../types';
export type ToolbarCommand = 'UNDO_DRAWING' | 'REDO_DRAWING' | 'CLEAR_DRAWING' | 'TOGGLE_WHITEBOARD';
export interface DrawingToolbarProps {
    onCommand: (type: ToolbarCommand) => void;
    config: DrawConfig;
    setConfig: (c: DrawConfig) => void;
    fixed?: boolean;
    /** Single writing row for the notebook workspace. */
    compact?: boolean;
    showWhiteboard?: boolean;
    setShowWhiteboard?: (val: boolean) => void;
    bgColor?: string;
    onBgColorChange?: (c: string) => void;
    paper?: PaperStyle;
    onPaperChange?: (p: PaperStyle) => void;
    onScreenshot?: () => void;
    isTextBoxMode?: boolean;
    onTextBoxModeToggle?: () => void;
    onOpenLibrary?: () => void;
    isLibraryOpen?: boolean;
    onInsertMath?: (math: MathObject) => void;
    canUndo?: boolean;
    canRedo?: boolean;
    /** Insert an original built-in PNG or animated element without lossy image import. */
    onInsertElement?: (src: string, width: number, height: number) => void;
    onInsertImages?: (files: FileList | File[]) => void;
    isInsertingImage?: boolean;
    zoom?: number;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onZoomReset?: () => void;
    onZoomFit?: () => void;
    onSelectTool?: (toolId: string) => void;
}
