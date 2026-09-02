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
    unit?: string;
    /** Etkinliğin eklendiği klasörler ("Defterlerim"). Boşsa hiçbir klasörde değil. */
    folder_ids?: string[];
    /**
     * Eski tek klasör alanı. Yeni kayıtlarda kullanılmaz; okurken
     * `activityFolderIds()` yardımcısı bu alanı da hesaba katar.
     * @deprecated `folder_ids` kullanın.
     */
    folder_id?: string | null;
}

export interface Unit {
    id: string;
    grade_level: string;
    subject: string;
    name: string;
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
    | 'math'
    | 'image'
    | 'lasso'
    | 'rect'
    | 'circle'
    | 'triangle'
    | 'line'
    | 'arrow'
    | 'double_arrow'
    | 'dashed';

/** Kalem ucu karakteri: yazma hissini belirler. */
export type PenType = 'ballpoint' | 'fountain' | 'brush' | 'marker';

/** Silgi davranışı: piksel silgisi mi, çizgiyi komple silen silgi mi. */
export type EraserMode = 'pixel' | 'stroke';

export interface Point {
    x: number;
    y: number;
    /** 0..1 arası uç baskısı; dolma/fırça kalemde kalınlığı belirler. */
    p?: number;
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
    /** Serbest çizim kalemlerinde uç karakteri (varsayılan: ballpoint). */
    penType?: PenType;
    /** `tool === 'math'` olduğunda çizilecek matematik nesnesi. */
    math?: MathObject;
    /** `tool === 'image'` olduğunda görselin data URL'i. */
    src?: string;
}

/** Çalışma alanının yakınlaştırma ve kaydırma durumu. */
export interface Viewport {
    /** 1 = %100. */
    scale: number;
    /** Ekran uzayındaki yatay kaydırma (px). */
    tx: number;
    /** Ekran uzayındaki dikey kaydırma (px). */
    ty: number;
}

/** Kütüphaneden eklenebilen hazır matematik/geometri nesneleri. */
export type MathObjectKind =
    // Koordinat & grafik
    | 'axes'
    | 'axes_q1'
    | 'number_line'
    | 'function_plot'
    | 'unit_circle'
    | 'polar_grid'
    // Geometri
    | 'angle'
    | 'triangle_labeled'
    | 'right_triangle'
    | 'circle_parts'
    | 'polygon'
    | 'ruler_strip'
    // Cisimler
    | 'cube'
    | 'rect_prism'
    | 'cylinder'
    | 'cone'
    | 'sphere'
    | 'pyramid'
    // Sayılar & modelleme
    | 'fraction_circle'
    | 'fraction_bar'
    | 'base_ten'
    | 'hundred_grid'
    | 'times_table'
    | 'venn'
    | 'clock'
    | 'balance'
    // İnteraktif araçlar
    | 'tool_compass'
    | 'tool_number_line'
    | 'tool_calculator'
    | 'tool_periodic_table'
    // ── Fen: laboratuvar ────────────────────────────────────────────
    | 'beaker'
    | 'flask'
    | 'graduated_cylinder'
    | 'test_tube'
    | 'heating_setup'
    | 'thermometer'
    // ── Fen: elektrik ve devre ──────────────────────────────────────
    | 'battery'
    | 'bulb'
    | 'resistor'
    | 'switch'
    | 'meter'
    | 'circuit_series'
    | 'circuit_parallel'
    // ── Fen: optik ──────────────────────────────────────────────────
    | 'convex_lens'
    | 'concave_lens'
    | 'plane_mirror'
    | 'concave_mirror'
    | 'prism'
    // ── Fen: kuvvet ve hareket ──────────────────────────────────────
    | 'force_arrows'
    | 'inclined_plane'
    | 'pulley'
    | 'lever'
    | 'spring_scale'
    // ── Fen: madde ve canlılar ──────────────────────────────────────
    | 'bohr_atom'
    | 'element_card'
    | 'states_of_matter'
    | 'animal_cell'
    | 'plant_cell'
    | 'sun_earth_moon'
    // ── Canlı simülasyonlar ─────────────────────────────────────────
    | 'optics_bench'
    | 'refraction_sim'
    | 'circuit_sim'
    | 'matter_sim'
    // ── 8. sınıf üniteleri ──────────────────────────────────────────
    | 'seasons_sim'
    | 'punnett_sim'
    | 'liquid_pressure_sim'
    | 'solid_pressure_sim'
    | 'lever_sim'
    | 'pulley_sim'
    | 'incline_sim'
    | 'division_sim'
    | 'ph_sim'
    | 'pyramid_sim'
    | 'electro_sim'
    // ── Canlı matematik ─────────────────────────────────────────────
    | 'equation_sim'
    | 'area_perimeter_sim'
    | 'probability_sim'
    | 'transform_sim'
    | 'data_stats_sim'
    | 'net_fold_sim'
    | 'fraction_add_sim'
    | 'scale_zoom_sim'
    // ── Etkileşimli fen ─────────────────────────────────────────────
    | 'moon_phase_sim'
    | 'label_drag_sim'
    | 'heating_curve_sim'
    | 'density_sim'
    | 'refraction_sim'
    | 'motion_graph_sim'
    | 'electron_config_sim'
    | 'balance_eq_sim'
    | 'photosynthesis_sim'
    | 'dna_pair_sim'
    | 'net_force_sim'
    | 'energy_sim'
    | 'solubility_sim'
    | 'sorting_sim'
    | 'sequence_sim'
    | 'match_sim'
    | 'angles_sim'
    | 'ohm_sim'
    | 'eclipse_sim'
    | 'selection_sim'
    | 'slope_sim'
    | 'pythagoras_sim'
    | 'sound_wave_sim'
    | 'gas_pressure_sim'
    | 'ion_bond_sim'
    | 'circulation_sim'
    | 'measure_read_sim'
    | 'ratio_sim'
    | 'spring_sim'
    | 'electromagnet_sim'
    | 'mass_conservation_sim'
    | 'food_web_sim';

/**
 * Matematik nesnesinin parametreleri. Nesne, `points[0]` ve `points[1]` ile
 * verilen dikdörtgenin içine çizilir; böylece mevcut taşı/ölçekle mantığı
 * hiçbir değişiklik olmadan çalışır.
 */
export interface MathObject {
    kind: MathObjectKind;
    /** Bölme/dilim/kenar sayısı (kesir paydası, çokgen kenarı, tablo boyutu…). */
    n?: number;
    /** Vurgulanan miktar (kesir payı, açı derecesi, saat…). */
    k?: number;
    /** Ek değer (saatte dakika, fonksiyonda x aralığı…). */
    m?: number;
    /** Fonksiyon grafiği için ifade, ör. "x^2 - 3". */
    expr?: string;
    /** Nesnenin üzerine yazılacak serbest metin (element sembolü, etiket…). */
    text?: string;
    /** Etiketler (sayı, derece, isim) çizilsin mi. */
    labels?: boolean;
    /**
     * Canlı simülasyonların kullanıcı tarafından ayarlanan değerleri
     * (odak uzaklığı, sıcaklık, anahtar durumu…). Yalnızca kalıcı ayarlar
     * burada tutulur; animasyonun anlık evresi saklanmaz, zamandan üretilir.
     */
    sim?: Record<string, number>;
}

export interface DrawConfig {
    tool: DrawingTool;
    color: string;
    width: number;
    fillEnabled: boolean;
    stampIcon: string;
    /** Serbest çizim kaleminin ucu. */
    penType?: PenType;
    /** Serbest çizilen şekli tanıyıp düzgün şekle çevir. */
    snapShapes?: boolean;
    /** Şekil/çizgi çizerken 15° açı kilidi. */
    snapAngle?: boolean;
    /** Silgi davranışı. */
    eraserMode?: EraserMode;
}

export interface TextBoxData {
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
}

/**
 * Sürükleme durumu. `orig`, seçili çizimlerin sürükleme başındaki nokta
 * listeleridir (seçim sırasıyla aynı hizada).
 */
export type DragState =
    | { type: 'move'; startX: number; startY: number; orig: Point[][] }
    | {
          type: 'resize';
          handle: string;
          startX: number;
          startY: number;
          orig: Point[][];
          origBB: BoundingBox;
      };

export interface DrawingCanvasHandle {
    undo: () => void;
    redo: () => void;
    /** Geri al / ileri al yığınlarında iş var mı. */
    canUndo: () => boolean;
    canRedo: () => boolean;
    clear: () => void;
    /** Kütüphaneden seçilen matematik nesnesini sayfanın ortasına ekler. */
    insertMath: (math: MathObject, color?: string) => void;
    /** Sıkıştırılmış bir görseli sayfanın ortasına ekler. */
    insertImage: (src: string, width: number, height: number) => void;
    /** Görünümü verilen çarpanla yakınlaştırır (ekranın ortasına göre). */
    zoomBy: (factor: number) => void;
    /** Yakınlaştırmayı %100'e döndürür ve kaydırmayı sıfırlar. */
    resetView: () => void;
    getView: () => Viewport;
    deleteSelected: () => void;
    setSelectedColor: (color: string) => void;
    duplicateSelected: () => void;
    nextPage: () => void;
    prevPage: () => void;
    addPage: () => void;
    deletePage: () => void;
    /** Belirtilen sayfaya geçer. */
    goToPage: (index: number) => void;
    /** Geçerli sayfanın bir kopyasını hemen arkasına ekler. */
    duplicatePage: () => void;
    /** Sayfayı yeni sıraya taşır. */
    movePage: (from: number, to: number) => void;
    getCurrentPage: () => number;
    getPageCount: () => number;
    /** Tüm sayfaların çizim verisini (kayıt için) döndürür. */
    getPages: () => Stroke[][];
    /** Kayıtlı sayfa verisini canvas'a yükler. */
    loadPages: (pages: Stroke[][]) => void;
    /**
     * Sayfayı PNG olarak indirir. `paper` verilirse kağıt deseni de çizilir —
     * desen ekranda CSS arka planı olduğundan aksi hâlde çıktıda görünmez.
     */
    screenshot: (wbMode: boolean, color: string, paper?: PaperStyle) => void;
}

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    variant: ToastVariant;
    message: string;
}

// ── Defter / Klasör (Not Defteri modülü) ────────────────────────────────
export type NotebookKind = 'notebook' | 'whiteboard';

export type PaperStyle =
    | 'grid'
    | 'lined'
    | 'dotted'
    | 'blank'
    | 'graph_mm'
    | 'isometric'
    | 'coordinate'
    | 'cornell'
    | 'music'
    | 'handwriting'
    | 'wide_lined'
    | 'todo';

export interface DriveFolder {
    id: string;
    name: string;
    parent_id: string | null;
    color?: string;
    subject?: string;
    grade_level?: string;
    created_at?: string;
}

export interface Notebook {
    id: string;
    title: string;
    kind: NotebookKind;
    parent_id: string | null;
    paper: PaperStyle;
    bg_color?: string;
    page_count?: number;
    subject?: string;
    grade_level?: string;
    favorite?: boolean;
    updated_at?: string;
    created_at?: string;
}

/** Tek bir defter sayfası: çizimler + metin kutuları. */
export interface NotebookPage {
    strokes: Stroke[];
    boxes: TextBoxData[];
}

/**
 * Defter içeriği ayrı bir koleksiyonda tutulur; liste ekranı ağır
 * sayfa verisini indirmesin diye yalnızca açıldığında çekilir.
 * Firestore iç içe dizi desteklemediği için `pages_json` string'tir.
 */
export interface NotebookContent {
    id: string;
    pages_json: string;
    updated_at?: string;
}
