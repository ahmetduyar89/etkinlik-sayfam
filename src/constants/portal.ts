// src/constants/portal.ts — ATÖLYE KAYIT DEFTERİ
// ─────────────────────────────────────────────────────────────────────
// Ana sayfadaki (atölye.tedrisedu.com) bölüm kartları BURADAN okunur.
// İleride yeni bir çalışma eklemek için tek yapman gereken, aşağıdaki
// listeye bir satır daha yazmak:
//
//   • Kendi GitHub deposu olan bir proje ekleyeceksen:
//       1) `apps/apps.json` dosyasına depo adresini yaz.
//       2) Buraya `kind: 'static', href: '/<isim>/'` olan bir kayıt ekle.
//     Yayın sırasında depo çekilir ve `dist/<isim>/` içine kopyalanır.
//
//   • Kendi deposu olmayan statik bir proje ekleyeceksen:
//       Klasörü doğrudan `apps/<isim>/` altına koy (içinde index.html olsun)
//       ve yine buraya bir kayıt ekle.
//
//   • Bu React uygulamasının içinde yaşayan bir bölüm ekleyeceksen:
//       `kind: 'internal'` kullan ve `view` alanına uygulamanın hangi
//       görünümle açılacağını yaz (İçerikler → 'content',
//       Defterlerim → 'notebooks'). Kabuk gerisini halleder.
// ─────────────────────────────────────────────────────────────────────
import type { LucideIcon } from 'lucide-react';
import { Crown, FlaskConical, LayoutGrid, NotebookPen } from 'lucide-react';
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
];

/** Kayıtlı bir bölümü kimliğinden bul. */
export function findModule(id: string): PortalModule | undefined {
    return PORTAL_MODULES.find((m) => m.id === id);
}

/** Uygulama içi bir görünümün hangi bölüme karşılık geldiğini bul. */
export function findModuleByView(view: MainView): PortalModule | undefined {
    return PORTAL_MODULES.find((m) => m.kind === 'internal' && m.view === view);
}
