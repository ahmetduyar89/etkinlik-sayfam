// src/lib/navigation.ts — Atölye kabuğunun basit yönlendirmesi
// ─────────────────────────────────────────────────────────────────────
// Harici bir router kütüphanesi kullanmıyoruz; tek ihtiyacımız "şu an
// atölye ana sayfasında mıyız, yoksa bir bölümün içinde miyiz" bilgisi.
//
// ÖNEMLİ: Öğrencilere daha önce dağıtılmış bağlantılar kökte çalışır
// (…/?view=student&id=… ve …/?view=notebook&id=…). Bu yüzden React
// uygulaması kökte kalır; bölüm adı yalnızca yol olarak eklenir.
// ─────────────────────────────────────────────────────────────────────
import { PORTAL_MODULES } from '../constants/portal';

/** Ana sayfa (kart ekranı) ya da içerideki bir bölümün kimliği. */
export type Section = 'portal' | string;

/** Bu React uygulamasının içinde açılabilen bölümler. */
const INTERNAL_IDS = PORTAL_MODULES.filter((m) => m.kind === 'internal').map((m) => m.id);

/** Adres çubuğundaki yoldan aktif bölümü çıkarır. */
export function sectionFromLocation(): Section {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (INTERNAL_IDS.includes(path)) return path;
    // Eski bağlantılarla uyum: /?app=etkinlikler
    const app = new URLSearchParams(window.location.search).get('app');
    if (app && INTERNAL_IDS.includes(app)) return app;
    return 'portal';
}

/** Sayfayı yeniden yüklemeden bölüm değiştirir (geri tuşu çalışır). */
export function goToSection(section: Section): void {
    const path = section === 'portal' ? '/' : `/${section}`;
    if (window.location.pathname !== path) {
        window.history.pushState({ section }, '', path + window.location.search);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
}
