/** @type {import('tailwindcss').Config} */
// ─────────────────────────────────────────────────────────────────────
// İÇERİK MERKEZİ RESKIN — Açık tema (light) Tailwind config.
// Token ANAHTARLARI aynı kaldı; yalnızca DEĞERLER koyu M3'ten açık
// İçerik Merkezi paletine çevrildi. Böylece `bg-surface`, `text-on-surface`,
// `bg-background` gibi token tabanlı sınıflar otomatik olarak açık temaya döner.
// (Sabit hex kullanan yerler bileşen dosyalarında ayrıca güncellendi.)
// ─────────────────────────────────────────────────────────────────────
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // darkMode artık kullanılmıyor (tek tema = açık). İstersen "class" bırak,
    // ama index.html'deki <html class="dark"> kaldırılmalı.
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // ── Primary (indigo) ──
                "primary": "#6366f1",
                "on-primary": "#ffffff",
                "primary-container": "#e0e3ff",
                "on-primary-container": "#312e81",
                "inverse-primary": "#818cf8",
                // ── Secondary (violet) ──
                "secondary": "#8b5cf6",
                "on-secondary": "#ffffff",
                "secondary-container": "#ede9fe",
                "on-secondary-container": "#5b21b6",
                // ── Tertiary (emerald) ──
                "tertiary": "#10b981",
                "on-tertiary": "#ffffff",
                "tertiary-container": "#d1fae5",
                "on-tertiary-container": "#065f46",
                // ── Error ──
                "error": "#ef4444",
                "on-error": "#ffffff",
                "error-container": "#fee2e2",
                "on-error-container": "#b91c1c",
                // ── Fixed tints ──
                "primary-fixed": "#e0e3ff",
                "primary-fixed-dim": "#c7cbff",
                "on-primary-fixed": "#1e1b4b",
                "on-primary-fixed-variant": "#3730a3",
                "secondary-fixed": "#ede9fe",
                "secondary-fixed-dim": "#ddd6fe",
                "on-secondary-fixed": "#2e1065",
                "on-secondary-fixed-variant": "#6d28d9",
                "tertiary-fixed": "#d1fae5",
                "tertiary-fixed-dim": "#a7f3d0",
                "on-tertiary-fixed": "#022c22",
                "on-tertiary-fixed-variant": "#047857",
                // ── Surfaces (light) ──
                "surface": "#ffffff",
                "surface-dim": "#eef1f5",
                "surface-bright": "#ffffff",
                "surface-container-lowest": "#ffffff",
                "surface-container-low": "#f8fafc",
                "surface-container": "#ffffff",
                "surface-container-high": "#f1f5f9",
                "surface-container-highest": "#e8eaee",
                "on-surface": "#0f172a",
                "on-surface-variant": "#64748b",
                "inverse-surface": "#0f172a",
                "inverse-on-surface": "#ffffff",
                "outline": "#cbd5e1",
                "outline-variant": "#e8eaee",
                "surface-tint": "#6366f1",
                "background": "#f4f5f8",
                "on-background": "#0f172a",
                "surface-variant": "#f1f5f9",
                // ── Branş (ders) renkleri — ActivityCard / rozetler için ──
                "subj-turkce": "#E8C85A",
                "subj-matematik": "#5AC8A8",
                "subj-fen": "#E8685A",
                "subj-sosyal": "#6366f1",
                "subj-ingilizce": "#3b82f6",
                "subj-din": "#8b5cf6",
                "subj-fizik": "#0ea5e9",
                "subj-kimya": "#ec4899",
                "subj-biyoloji": "#10b981",
            },
            fontFamily: {
                // Gövde / UI = Inter, başlıklar = Poppins (İçerik Merkezi sistemi)
                sans: ["Inter", "sans-serif"],
                "headline-xl": ["Poppins", "sans-serif"],
                "headline-lg": ["Poppins", "sans-serif"],
                "headline-md": ["Poppins", "sans-serif"],
                "display-lg": ["Poppins", "sans-serif"],
                "body-lg": ["Inter", "sans-serif"],
                "body-md": ["Inter", "sans-serif"],
                "button": ["Inter", "sans-serif"],
                "label-md": ["Inter", "sans-serif"],
            },
            borderRadius: {
                "xl": "0.875rem",
                "2xl": "1.125rem",
                "3xl": "1.5rem",
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
