// src/constants/portal.ts — ATÖLYE KAYIT DEFTERİ
// ─────────────────────────────────────────────────────────────────────
// Ana sayfadaki (atölye.tedrisedu.com) bölüm kartları BURADAN okunur.
// İleride yeni bir çalışma eklemek için tek yapman gereken, aşağıdaki
// listeye bir satır daha yazmak:
//
//   • Statik bir proje ekleyeceksen (satranç ve deneyler gibi):
//       Klasörü `apps/<isim>/` altına koy (içinde index.html olsun) ve buraya
//       `kind: 'static', href: '/<isim>/'` olan bir kayıt ekle. Yayın sırasında
//       klasör olduğu gibi `dist/<isim>/` içine kopyalanır; ayrı bir depo, ayrı
//       bir yayın adımı yoktur.
//
//   • Bu React uygulamasının içinde yaşayan bir bölüm ekleyeceksen:
//       `kind: 'internal'` kullan ve `view` alanına uygulamanın hangi
//       görünümle açılacağını yaz (İçerikler → 'content',
//       Defterlerim → 'notebooks'). Kabuk gerisini halleder.
// ─────────────────────────────────────────────────────────────────────
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Bot, Coins, Crown, Dna, FlaskConical, Globe, LayoutGrid, Music, NotebookPen, Orbit, Puzzle, Shapes, Swords } from 'lucide-react';
import type { MainView } from '../types';

export type ModuleKind = 'internal' | 'static';
export type ModuleStatus = 'ready' | 'soon';

export interface PortalModule {
    /** Kısa kimlik — URL yolunda ve durum kaydında kullanılır. */
    id: string;
    title: string;
    description: string;
    /** Kartın altındaki küçük etiket (ör. "12 simülasyon"). */
    meta?: string;
    icon: LucideIcon;
    /**
     * Kartın renk kimliği. İki parçadır: ikon kutusunun gradyanı ve karta
     * hover'da düşen renkli gölge. Gradyan sınıfları Tailwind tarafından
     * taranabilmesi için tam sınıf adı olarak yazılır (parçalardan
     * birleştirilen string'ler derlemede kaybolur).
     */
    accent: {
        /** İkon kutusunun gradyanı, ör. 'from-indigo-500 to-blue-500'. */
        icon: string;
        /** Kartın üstündeki ince şerit — aynı gradyanın açık tonu. */
        strip: string;
        /** Hover gölgesinin rengi (rgba). */
        glow: string;
    };
    kind: ModuleKind;
    /** static için hedef yol (ör. '/satranc/'), internal için '/etkinlikler'. */
    href: string;
    /**
     * Yalnızca `kind: 'internal'` için: kart açıldığında uygulamanın hangi
     * görünümle başlayacağı. Kabuk bu değeri App'e geçirir.
     */
    view?: MainView;
    status: ModuleStatus;
}

export const PORTAL_MODULES: PortalModule[] = [
    {
        id: 'etkinlikler',
        title: 'Etkinlikler',
        description:
            'İçerik merkezi: sınıf ve üniteye göre etkinlikler, testler, simülasyonlar ve QR ile öğrenci paylaşımı.',
        meta: 'Ünite rafı · Ders modu',
        icon: LayoutGrid,
        accent: {
            icon: 'from-indigo-500 to-blue-500',
            strip: 'from-indigo-400 via-blue-400 to-sky-300',
            glow: 'rgba(99, 102, 241, 0.28)',
        },
        kind: 'internal',
        href: '/etkinlikler',
        view: 'content',
        status: 'ready',
    },
    {
        id: 'defterlerim',
        title: 'Defterlerim',
        description:
            'Ders defterleri: sayfa sayfa not alın, çizim ve simülasyon ekleyin, öğrencilerle salt-okunur bağlantı olarak paylaşın.',
        meta: 'Ders defteri · Çizim',
        icon: NotebookPen,
        accent: {
            icon: 'from-violet-500 to-fuchsia-500',
            strip: 'from-violet-400 via-fuchsia-400 to-pink-300',
            glow: 'rgba(139, 92, 246, 0.28)',
        },
        kind: 'internal',
        href: '/defterlerim',
        view: 'notebooks',
        status: 'ready',
    },
    {
        id: 'satranc',
        title: 'Satranç Eğitimi',
        description:
            'İlkokul için çevrimdışı satranç platformu: taş dersleri, bulmacalar, yapay zekâya karşı oyun ve 36 haftalık ders planı.',
        meta: '36 haftalık plan · Çevrimdışı',
        icon: Crown,
        accent: {
            icon: 'from-amber-400 to-orange-500',
            strip: 'from-amber-300 via-orange-300 to-yellow-200',
            glow: 'rgba(245, 158, 11, 0.28)',
        },
        kind: 'static',
        href: '/satranc/',
        status: 'ready',
    },
    {
        id: 'canli-satranc',
        title: 'Canlı Satranç',
        description:
            'Bağlantıyı alan çocuk adını yazar ve oynar: arkadaşıyla canlı maç, masa kodu ile katılım, rakip yoksa bilgisayara karşı oyun.',
        meta: 'Canlı maç · Şifresiz bağlantı',
        icon: Swords,
        accent: {
            icon: 'from-rose-500 to-orange-500',
            strip: 'from-rose-300 via-orange-300 to-amber-200',
            glow: 'rgba(244, 63, 94, 0.26)',
        },
        kind: 'static',
        href: '/?view=satranc',
        status: 'ready',
    },
    {
        id: 'deneyler',
        title: 'Küçük Mucitler Laboratuvarı',
        description:
            'Çocuklar için interaktif fen deneyleri: pusuladan termometreye, gölge oyunundan ışıldayan devreye 14 etkileşimli düzenek.',
        meta: '14 deney · İnteraktif',
        icon: FlaskConical,
        accent: {
            icon: 'from-emerald-400 to-teal-500',
            strip: 'from-emerald-300 via-teal-300 to-cyan-200',
            glow: 'rgba(16, 185, 129, 0.28)',
        },
        kind: 'static',
        href: '/deneyler/',
        status: 'ready',
    },
    {
        id: 'gunes-sistemi',
        title: '3D Güneş Sistemi Planetaryumu',
        description:
            'İnteraktif 3D uzay laboratuvarı: 8 gezegen, yörüngeler, mevsimler, tutulmalar, Kepler yasaları ve gezegen karşılaştırıcı.',
        meta: '8 Gezegen · 3D Yörünge · Fen Laboratuvarı',
        icon: Orbit,
        accent: {
            icon: 'from-sky-500 to-indigo-600',
            strip: 'from-sky-400 via-indigo-400 to-purple-400',
            glow: 'rgba(56, 189, 248, 0.32)',
        },
        kind: 'static',
        href: '/gunes-sistemi/',
        status: 'ready',
    },
    {
        id: 'akil-oyunlari',
        title: 'Matematiksel Akıl Oyunları',
        description:
            'Mantıksal akıl yürütme ve problem çözme atölyesi: Hanoi Kuleleri, KenKen, Untangle, Sihirli Kareler, Chomp, Monty Hall, Kakuro, Kripto-Aritmetik, Dört Renk, Lazer ve daha fazlası.',
        meta: '17 Akıl Oyunu · Algoritma · Strateji',
        icon: Puzzle,
        accent: {
            icon: 'from-violet-500 to-fuchsia-600',
            strip: 'from-violet-400 via-fuchsia-400 to-pink-300',
            glow: 'rgba(168, 85, 247, 0.3)',
        },
        kind: 'static',
        href: '/akil-oyunlari/',
        status: 'ready',
    },
    {
        id: 'kodlama',
        title: 'Kodlama Parkı',
        description:
            'Görsel blok kodlama, 12 seviyeli labirent algoritması, Turtle geometrisi ve adım adım hata ayıklama atölyesi.',
        meta: '12 Seviye · Blok Kodlama · Turtle Çizim',
        icon: Bot,
        accent: {
            icon: 'from-blue-500 to-indigo-600',
            strip: 'from-blue-400 via-indigo-400 to-cyan-300',
            glow: 'rgba(59, 130, 246, 0.3)',
        },
        kind: 'static',
        href: '/kodlama/',
        status: 'ready',
    },
    {
        id: 'insan-vucudu',
        title: 'İnsan Vücudu Atlası',
        description:
            'İnteraktif 3D anatomi keşfi: İskelet ve organ katmanları, canlı atan kalp ve kan dolaşımı simülasyonu, sanal biyoloji mikroskobu.',
        meta: '3D Anatomi · Canlı Kalp BPM · Sanal Mikroskop',
        icon: Dna,
        accent: {
            icon: 'from-rose-500 to-pink-600',
            strip: 'from-rose-400 via-pink-400 to-red-300',
            glow: 'rgba(244, 63, 94, 0.3)',
        },
        kind: 'static',
        href: '/insan-vucudu/',
        status: 'ready',
    },
    {
        id: 'geometri',
        title: 'Dinamik GeoLaboratuvar',
        description:
            'Görsel geometri atölyesi: İnteraktif çivili Geoboard tahtası, açıölçer (iletki) atölyesi, 3D prizma açınım katlama ve fraktal üretici.',
        meta: 'Geoboard · 3D Açınım Katlama · Fraktallar',
        icon: Shapes,
        accent: {
            icon: 'from-amber-500 to-orange-600',
            strip: 'from-amber-400 via-orange-400 to-yellow-300',
            glow: 'rgba(245, 158, 11, 0.3)',
        },
        kind: 'static',
        href: '/geometri/',
        status: 'ready',
    },
    {
        id: 'muzik',
        title: 'Akustik & Müzik Atölyesi',
        description:
            'Ses fiziği ve enstrüman laboratuvarı: Sanal piyano ve davul kiti, canlı ses dalgası osiloskopu ve 16 adımlı ritim sekanslayıcı.',
        meta: 'Synthesizer · Canlı Osiloskop · 16-Step Beat',
        icon: Music,
        accent: {
            icon: 'from-purple-500 to-pink-600',
            strip: 'from-purple-400 via-pink-400 to-fuchsia-300',
            glow: 'rgba(168, 85, 247, 0.3)',
        },
        kind: 'static',
        href: '/muzik/',
        status: 'ready',
    },
    {
        id: 'turkce',
        title: 'Sözcük Avcıları & Dil Parkı',
        description:
            'Türkçe ve dil becerileri: 5 harfli Sözcük Avı (Wordle & Anagram), TDK İmla Arenası, Noktalama Masalı ve Deyimler Dedektifi.',
        meta: 'Sözcük Avı · TDK İmla · Deyimler Dedektifi',
        icon: BookOpen,
        accent: {
            icon: 'from-teal-500 to-emerald-600',
            strip: 'from-teal-400 via-emerald-400 to-cyan-300',
            glow: 'rgba(20, 184, 166, 0.3)',
        },
        kind: 'static',
        href: '/turkce/',
        status: 'ready',
    },
    {
        id: 'tarih-atlasi',
        title: 'Zaman Kapsülü & Tarih Atlası',
        description:
            'Tarih ve coğrafya kaşifi: Göbeklitepe\'den Cumhuriyet\'e interaktif zaman çizelgesi, 7 bölge Türkiye kültür haritası ve İpek Yolu kervanı.',
        meta: 'Tarihsel Zaman Çizelgesi · Kültür Haritası · İpek Yolu',
        icon: Globe,
        accent: {
            icon: 'from-amber-600 to-yellow-600',
            strip: 'from-amber-400 via-yellow-400 to-orange-300',
            glow: 'rgba(217, 119, 6, 0.3)',
        },
        kind: 'static',
        href: '/tarih-atlasi/',
        status: 'ready',
    },
    {
        id: 'finans-pazar',
        title: 'Küçük Girişimciler Pazarı',
        description:
            'Finansal okuryazarlık ve cebir: Market kasası para üstü hesaplama, denge terazisi ile denklem çözme ve limonata standı bütçe simülasyonu.',
        meta: 'Kasa Para Üstü · Cebir Terazisi · Bütçe Yönetimi',
        icon: Coins,
        accent: {
            icon: 'from-emerald-500 to-teal-600',
            strip: 'from-emerald-400 via-teal-400 to-cyan-300',
            glow: 'rgba(16, 185, 129, 0.3)',
        },
        kind: 'static',
        href: '/finans-pazar/',
        status: 'ready',
    },
];

/** Kayıtlı bir bölümü kimliğinden bul. */
export function findModule(id: string): PortalModule | undefined {
    return PORTAL_MODULES.find((m) => m.id === id);
}

/** Uygulama içi bir görünümün hangi bölüme karşılık geldiğini bul. */
export function findModuleByView(view: MainView): PortalModule | undefined {
    return PORTAL_MODULES.find((m) => m.kind === 'internal' && m.view === view);
}
