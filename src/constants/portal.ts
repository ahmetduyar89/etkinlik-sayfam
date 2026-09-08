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
//       `kind: 'internal'` kullan ve AppShell içinde karşılığını tanımla.
// ─────────────────────────────────────────────────────────────────────
import type { LucideIcon } from 'lucide-react';
import { Crown, FlaskConical, LayoutGrid } from 'lucide-react';

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
    /** Kartın vurgu rengi — Tailwind sınıfları. */
    accent: { bg: string; text: string; ring: string };
    kind: ModuleKind;
    /** static için hedef yol (ör. '/satranc/'), internal için '/etkinlikler'. */
    href: string;
    status: ModuleStatus;
}

export const PORTAL_MODULES: PortalModule[] = [
    {
        id: 'etkinlikler',
        title: 'Etkinlikler',
        description:
            'İçerik merkezi: sınıf ve üniteye göre etkinlikler, testler, ders defterleri ve QR ile öğrenci paylaşımı.',
        meta: 'İçerik Merkezi · Defterlerim',
        icon: LayoutGrid,
        accent: { bg: 'bg-primary/10', text: 'text-primary', ring: 'hover:ring-primary/30' },
        kind: 'internal',
        href: '/etkinlikler',
        status: 'ready',
    },
    {
        id: 'satranc',
        title: 'Satranç Eğitimi',
        description:
            'İlkokul için çevrimdışı satranç platformu: taş dersleri, bulmacalar, yapay zekâya karşı oyun ve 36 haftalık ders planı.',
        meta: '36 haftalık plan · Çevrimdışı',
        icon: Crown,
        accent: { bg: 'bg-amber-500/10', text: 'text-amber-600', ring: 'hover:ring-amber-400/40' },
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
        accent: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', ring: 'hover:ring-emerald-400/40' },
        kind: 'static',
        href: '/deneyler/',
        status: 'ready',
    },
];

/** Kayıtlı bir bölümü kimliğinden bul. */
export function findModule(id: string): PortalModule | undefined {
    return PORTAL_MODULES.find((m) => m.id === id);
}
