export interface Activity {
    id: string;
    title: string;
    description?: string;
    category?: string;
    grade_level?: string;
    subject?: string;
    tags?: string;
    image_url?: string;
    is_test?: boolean;
    has_timer?: boolean;
    duration_minutes?: string | number;
    html_code?: string;
    js_code?: string;
    css_code?: string;
    external_libs?: string;
    content_mode?: 'raw_html' | 'composed';
    storage_url?: string;
    created_at?: string;
}

export interface Submission {
    id: string;
    activity_id: string;
    student_name: string;
    started_at: string;
    submitted_at: string | null;
    answers: Record<string, unknown>;
    created_at?: string;
}

export type DrawingTool =
    | 'select'
    | 'pencil'
    | 'pan'
    | 'highlighter'
    | 'sun'
    | 'eraser'
    | 'text'
    | 'stamp'
    | 'rect'
    | 'circle'
    | 'triangle'
    | 'line'
    | 'arrow'
    | 'double_arrow'
    | 'dashed';

export interface Point {
    x: number;
    y: number;
}

export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface Stroke {
    tool: DrawingTool;
    color: string;
    width?: number;
    fillEnabled?: boolean;
    points: Point[];
    text?: string;
    stampIcon?: string;
}

export interface DrawConfig {
    tool: DrawingTool;
    color: string;
    width: number;
    fillEnabled: boolean;
    stampIcon: string;
}

export interface TextBoxData {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
}

export type DragState =
    | { type: 'move'; startX: number; startY: number; origPoints: Point[] }
    | {
          type: 'resize';
          handle: string;
          startX: number;
          startY: number;
          origPoints: Point[];
          origBB: BoundingBox;
      };

export interface DrawingCanvasHandle {
    undo: () => void;
    clear: () => void;
    deleteSelected: () => void;
    setSelectedColor: (color: string) => void;
    duplicateSelected: () => void;
    nextPage: () => void;
    prevPage: () => void;
    addPage: () => void;
    deletePage: () => void;
    getCurrentPage: () => number;
    getPageCount: () => number;
    screenshot: (wbMode: boolean, color: string) => void;
}

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}
