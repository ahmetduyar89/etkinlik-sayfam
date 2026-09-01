export type LibraryCategory = 'Matematik' | 'Fen' | 'Simülasyon';

export type LibrarySubCategory =
    // Matematik
    | 'Koordinat & Grafik'
    | 'Geometri'
    | 'Geometrik Cisimler'
    | 'Sayılar & Modelleme'
    // Fen
    | 'Kimya & Madde'
    | 'Fizik & Kuvvet'
    | 'Biyoloji & Canlılar'
    // Simülasyon
    | 'Matematik Lab'
    | 'Fen Lab';

export interface LibraryItem {
    id: string;
    title: string;
    category: LibraryCategory;
    subCategory: LibrarySubCategory;
    iconType: string;
    actionType: 'tool' | 'stamp' | 'template';
    toolId?: 'compass' | 'numberLine' | 'calculator' | 'periodicTable' | 'ruler' | 'protractor';
    description?: string;
}

export const LIBRARY_SUB_CATEGORIES: Record<LibraryCategory, LibrarySubCategory[]> = {
    Matematik: [
        'Koordinat & Grafik',
        'Geometri',
        'Geometrik Cisimler',
        'Sayılar & Modelleme',
    ],
    Fen: [
        'Kimya & Madde',
        'Fizik & Kuvvet',
        'Biyoloji & Canlılar',
    ],
    Simülasyon: [
        'Matematik Lab',
        'Fen Lab',
    ],
};

export const LIBRARY_ITEMS: LibraryItem[] = [
    // ────────────── MATEMATİK > SAYILAR & MODELLEME ──────────────
    {
        id: 'calculator',
        title: 'Hesap Makinesi',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'calculator',
        actionType: 'tool',
        toolId: 'calculator',
        description: 'Dört işlem ve kök hesaplama',
    },
    {
        id: 'fraction_pie',
        title: 'Kesir Pastası',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'fraction_pie',
        actionType: 'stamp',
        description: 'Daire kesir modeli (1/4 parçalı)',
    },
    {
        id: 'fraction_bar',
        title: 'Kesir Çubuğu',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'fraction_bar',
        actionType: 'stamp',
        description: 'Dikdörtgen kesir çubuğu modeli',
    },
    {
        id: 'base_ten_blocks',
        title: 'Onluk Taban Blokları',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'base_ten_blocks',
        actionType: 'stamp',
        description: 'Birlik, onluk ve yüzlük bloklar',
    },
    {
        id: 'hundred_chart',
        title: "100'lük Tablo",
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'hundred_chart',
        actionType: 'stamp',
        description: "1'den 100'e sayı tablosu",
    },
    {
        id: 'multiplication_table',
        title: 'Çarpım Tablosu',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'multiplication_table',
        actionType: 'stamp',
        description: '10x10 çarpım tablosu ızgarası',
    },
    {
        id: 'venn_diagram',
        title: 'Venn Şeması',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'venn_diagram',
        actionType: 'stamp',
        description: 'Kesişen iki küme modeli',
    },
    {
        id: 'analog_clock',
        title: 'Analog Saat',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'analog_clock',
        actionType: 'stamp',
        description: 'Saat ve dakika kadranı',
    },
    {
        id: 'balance_scale',
        title: 'Denge Terazisi',
        category: 'Matematik',
        subCategory: 'Sayılar & Modelleme',
        iconType: 'balance_scale',
        actionType: 'stamp',
        description: 'Eşit kollu terazi modeli',
    },

    // ────────────── MATEMATİK > KOORDİNAT & GRAFİK ──────────────
    {
        id: 'number_line_tool',
        title: 'Sayı Doğrusu Aracı',
        category: 'Matematik',
        subCategory: 'Koordinat & Grafik',
        iconType: 'number_line',
        actionType: 'tool',
        toolId: 'numberLine',
        description: 'Ayarlanabilir interaktif sayı doğrusu',
    },
    {
        id: 'cartesian_grid',
        title: 'Koordinat Düzlemi',
        category: 'Matematik',
        subCategory: 'Koordinat & Grafik',
        iconType: 'cartesian_grid',
        actionType: 'stamp',
        description: 'x ve y eksenli kartezyen ızgara',
    },
    {
        id: 'quadrant1_grid',
        title: '1. Bölge Koordinat',
        category: 'Matematik',
        subCategory: 'Koordinat & Grafik',
        iconType: 'quadrant1_grid',
        actionType: 'stamp',
        description: 'Pozitif eksenler koordinat modeli',
    },
    {
        id: 'bar_chart_template',
        title: 'Sütun Grafiği',
        category: 'Matematik',
        subCategory: 'Koordinat & Grafik',
        iconType: 'bar_chart',
        actionType: 'stamp',
        description: 'Veri grafiği çizim şablonu',
    },

    // ────────────── MATEMATİK > GEOMETRİ ──────────────
    {
        id: 'compass_tool',
        title: 'İnteraktif Pergel',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'compass',
        actionType: 'tool',
        toolId: 'compass',
        description: 'Sabit yarıçapla çember/yay çizimi',
    },
    {
        id: 'ruler_tool_item',
        title: 'Cetvel',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'ruler',
        actionType: 'tool',
        toolId: 'ruler',
        description: '20 cm taşınabilir cetvel',
    },
    {
        id: 'protractor_tool_item',
        title: 'Açıölçer',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'protractor',
        actionType: 'tool',
        toolId: 'protractor',
        description: '180° dereceli açıölçer (iletki)',
    },
    {
        id: 'right_triangle',
        title: 'Dik Üçgen',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'right_triangle',
        actionType: 'stamp',
        description: 'Diklik sembollü dik üçgen',
    },
    {
        id: 'equilateral_triangle',
        title: 'Eşkenar Üçgen',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'equilateral_triangle',
        actionType: 'stamp',
        description: 'Eşit kenarlı üçgen modeli',
    },
    {
        id: 'parallelogram',
        title: 'Paralelkenar',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'parallelogram',
        actionType: 'stamp',
        description: 'Paralelkenar geometri şablonu',
    },
    {
        id: 'trapezoid',
        title: 'Yamuk',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'trapezoid',
        actionType: 'stamp',
        description: 'Yamuk geometri şablonu',
    },
    {
        id: 'circle_radius',
        title: 'Yarıçaplı Çember',
        category: 'Matematik',
        subCategory: 'Geometri',
        iconType: 'circle_radius',
        actionType: 'stamp',
        description: 'Merkez (O) ve yarıçap (r) gösterimli',
    },

    // ────────────── MATEMATİK > GEOMETRİK CİSİMLER ──────────────
    {
        id: 'cube_3d',
        title: 'Küp (3B)',
        category: 'Matematik',
        subCategory: 'Geometrik Cisimler',
        iconType: 'cube_3d',
        actionType: 'stamp',
        description: '3 Boyutlu tel kafes küp',
    },
    {
        id: 'cube_net',
        title: 'Küp Açınımı',
        category: 'Matematik',
        subCategory: 'Geometrik Cisimler',
        iconType: 'cube_net',
        actionType: 'stamp',
        description: '6 kareli küp yüzey açınımı',
    },
    {
        id: 'cylinder_3d',
        title: 'Silindir',
        category: 'Matematik',
        subCategory: 'Geometrik Cisimler',
        iconType: 'cylinder_3d',
        actionType: 'stamp',
        description: 'Taban daireli silindir modeli',
    },
    {
        id: 'cone_3d',
        title: 'Koni',
        category: 'Matematik',
        subCategory: 'Geometrik Cisimler',
        iconType: 'cone_3d',
        actionType: 'stamp',
        description: 'Tepe noktalı dairesel koni',
    },
    {
        id: 'pyramid_3d',
        title: 'Kare Piramit',
        category: 'Matematik',
        subCategory: 'Geometrik Cisimler',
        iconType: 'pyramid_3d',
        actionType: 'stamp',
        description: 'Kare tabanlı piramit modeli',
    },
    {
        id: 'prism_3d',
        title: 'Dikdörtgen Prizma',
        category: 'Matematik',
        subCategory: 'Geometrik Cisimler',
        iconType: 'prism_3d',
        actionType: 'stamp',
        description: 'Dikdörtgenler prizması modeli',
    },

    // ────────────── FEN > KİMYA & MADDE ──────────────
    {
        id: 'periodic_table_tool',
        title: 'Periyodik Tablo',
        category: 'Fen',
        subCategory: 'Kimya & Madde',
        iconType: 'periodic_table',
        actionType: 'tool',
        toolId: 'periodicTable',
        description: 'Element detaylı hızlı periyodik sistem',
    },
    {
        id: 'beaker',
        title: 'Beherglas',
        category: 'Fen',
        subCategory: 'Kimya & Madde',
        iconType: 'beaker',
        actionType: 'stamp',
        description: 'Ölçekli laboratuvar beher kabı',
    },
    {
        id: 'test_tube',
        title: 'Deney Tüpü',
        category: 'Fen',
        subCategory: 'Kimya & Madde',
        iconType: 'test_tube',
        actionType: 'stamp',
        description: 'Kimya deney tüpü modeli',
    },
    {
        id: 'erlenmeyer',
        title: 'Erlenmayer',
        category: 'Fen',
        subCategory: 'Kimya & Madde',
        iconType: 'erlenmeyer',
        actionType: 'stamp',
        description: 'Konik laboratuvar balonu',
    },
    {
        id: 'atom_model',
        title: 'Atom Modeli',
        category: 'Fen',
        subCategory: 'Kimya & Madde',
        iconType: 'atom_model',
        actionType: 'stamp',
        description: 'Çekirdek ve elektron yörüngeleri',
    },
    {
        id: 'ph_scale',
        title: 'pH Renk Skalası',
        category: 'Fen',
        subCategory: 'Kimya & Madde',
        iconType: 'ph_scale',
        actionType: 'stamp',
        description: '0-14 Asit ve Baz renk cetveli',
    },

    // ────────────── FEN > FİZİK & KUVVET ──────────────
    {
        id: 'electric_circuit',
        title: 'Elektrik Devresi',
        category: 'Fen',
        subCategory: 'Fizik & Kuvvet',
        iconType: 'electric_circuit',
        actionType: 'stamp',
        description: 'Pil, lamba ve anahtar devre şeması',
    },
    {
        id: 'magnet_bars',
        title: 'Mıknatıs (N-S)',
        category: 'Fen',
        subCategory: 'Fizik & Kuvvet',
        iconType: 'magnet_bars',
        actionType: 'stamp',
        description: 'Kutup çizgili çubuk mıknatıs',
    },
    {
        id: 'dynamometer',
        title: 'Dinamometre',
        category: 'Fen',
        subCategory: 'Fizik & Kuvvet',
        iconType: 'dynamometer',
        actionType: 'stamp',
        description: 'Newton ölçümlü kuvvet yayı',
    },
    {
        id: 'pulley_system',
        title: 'Makara Sistemi',
        category: 'Fen',
        subCategory: 'Fizik & Kuvvet',
        iconType: 'pulley_system',
        actionType: 'stamp',
        description: 'Basit makineler makara şablonu',
    },
    {
        id: 'light_refraction',
        title: 'Işık Kırılması',
        category: 'Fen',
        subCategory: 'Fizik & Kuvvet',
        iconType: 'light_refraction',
        actionType: 'stamp',
        description: 'Gelen ve kırılan ışın şeması',
    },

    // ────────────── FEN > BİYOLOJİ & CANLILAR ──────────────
    {
        id: 'dna_helix',
        title: 'DNA Sarmalı',
        category: 'Fen',
        subCategory: 'Biyoloji & Canlılar',
        iconType: 'dna_helix',
        actionType: 'stamp',
        description: 'Çift sarmallı genetik model',
    },
    {
        id: 'plant_cell',
        title: 'Bitki Hücresi',
        category: 'Fen',
        subCategory: 'Biyoloji & Canlılar',
        iconType: 'plant_cell',
        actionType: 'stamp',
        description: 'Hücre duvarı ve kloroplastlı yapı',
    },
    {
        id: 'animal_cell',
        title: 'Hayvan Hücresi',
        category: 'Fen',
        subCategory: 'Biyoloji & Canlılar',
        iconType: 'animal_cell',
        actionType: 'stamp',
        description: 'Çekirdek ve sitoplazma şeması',
    },
    {
        id: 'food_pyramid',
        title: 'Besin Piramidi',
        category: 'Fen',
        subCategory: 'Biyoloji & Canlılar',
        iconType: 'food_pyramid',
        actionType: 'stamp',
        description: 'Üreticiden tüketiciye ekoloji',
    },
    {
        id: 'human_heart',
        title: 'Kalp Şeması',
        category: 'Fen',
        subCategory: 'Biyoloji & Canlılar',
        iconType: 'human_heart',
        actionType: 'stamp',
        description: '4 odacıklı dolaşım sistemi modeli',
    },

    // ────────────── SİMÜLASYON ──────────────
    {
        id: 'sim_circuit',
        title: 'Devre Simülasyonu',
        category: 'Simülasyon',
        subCategory: 'Fen Lab',
        iconType: 'electric_circuit',
        actionType: 'stamp',
        description: 'Etkileşimli lamba ve pil simülasyonu',
    },
    {
        id: 'sim_balance',
        title: 'Terazi Dengeleme',
        category: 'Simülasyon',
        subCategory: 'Matematik Lab',
        iconType: 'balance_scale',
        actionType: 'stamp',
        description: 'Kütle eşleme ve denklem kurma',
    },
    {
        id: 'sim_fraction',
        title: 'Kesir Simülatörü',
        category: 'Simülasyon',
        subCategory: 'Matematik Lab',
        iconType: 'fraction_pie',
        actionType: 'stamp',
        description: 'Pay ve paydayı dinamik değiştirme',
    },
];
