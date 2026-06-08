# Devir Paketi: Etkinlik Laboratuvarı — İçerik Merkezi Reskin

> **Hedef repo:** `ahmetduyar89/etkinlik-sayfam` (React 19 + Vite + TypeScript + Tailwind + Firebase)
> **Amaç:** Mevcut **koyu Material-3** temasını, TedrisEDU İçerik Merkezi'nin **açık / indigo / editöryel** görsel sistemine çevirmek. Marka ("Ahmet DUYAR"), tüm mantık, Firebase, veri modeli ve özellikler **aynen korunur** — yalnızca görünüm değişir.

---

## Bu pakette ne var

- `reference/` — Tasarımın **çalışan HTML önizlemesi** (`reference/reskin/Etkinlik Laboratuvarı.html`). Bu dosyalar **referanstır**, doğrudan kopyalanacak üretim kodu değildir. Açıp etkileşime gir: kart ızgarası, akordeon filtreler, arama, tam ekran "Sunum Modu". Hedef = bu görünümü mevcut React/Tailwind ortamında üretmek.
- `new-code/` — Repona **doğrudan konacak** 3 hazır dosya:
  - `tailwind.config.js` → repo kökündeki ile **değiştir**
  - `Navbar.tsx` → `src/components/common/Navbar.tsx` ile **değiştir**
  - `ActivityCard.tsx` → `src/components/activities/ActivityCard.tsx` ile **değiştir**
- Bu README — `App.tsx`, `index.html` ve `src/index.css` için **satır satır sınıf değişiklikleri**.

## Fidelity: **Yüksek (hi-fi)**
Renkler, tipografi, boşluklar ve etkileşimler nihaidir. Birebir bu görünümü uygula.

---

## Uygulama Adımları (özet)

1. **`tailwind.config.js`** → `new-code/tailwind.config.js` ile değiştir. (Token *anahtarları* aynı; *değerler* açık temaya döndü. Token kullanan her şey otomatik açık olur.)
2. **`index.html`** → 2 küçük değişiklik (aşağıda).
3. **`src/index.css`** → 1 küçük değişiklik (aşağıda).
4. **`src/components/common/Navbar.tsx`** → `new-code/Navbar.tsx` ile değiştir.
5. **`src/components/activities/ActivityCard.tsx`** → `new-code/ActivityCard.tsx` ile değiştir.
6. **`src/App.tsx`** → aşağıdaki sınıf eşlemelerini uygula (mantığa dokunma).
7. `npm run dev` ile kontrol et; `npm run build` ve `npm run lint` temiz olmalı.

---

## 1) `index.html`

**(a)** `<html>` etiketinden `dark` sınıfını kaldır:
```diff
- <html lang="tr" class="dark">
+ <html lang="tr">
```

**(b)** Başlık fontu olarak **Poppins** ekle. Mevcut Inter `<link>`'inin yanına:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet"/>
```
(Material Symbols ve Inter linkleri kalsın. `<body>`'deki `bg-background text-on-background` token'ları artık açık tema ürettiği için aynen kalabilir.)

---

## 2) `src/index.css`

`@layer base` ve token kullanımı aynen kalır (artık açık değer üretir). Tek pratik düzeltme — scrollbar koyu→açık:
```diff
  ::-webkit-scrollbar-thumb {
-   @apply bg-white/10 rounded-full hover:bg-white/20 transition-colors;
+   @apply bg-black/10 rounded-full hover:bg-black/20 transition-colors;
  }
```
> `.glass-card`, `.neon-glow-hover`, `.glow-*`, `.bento-*` yardımcıları reskin sonrası kullanılmıyor; silmen gerekmez ama istersen temizleyebilirsin.

---

## 3) `src/App.tsx` — sınıf eşlemeleri

App.tsx'in **mantığı, state'i, JSX yapısı aynı kalır.** Yalnızca aşağıdaki **koyu/sabit-hex sınıfları** karşılıklarıyla değiştir. (Hepsi `className` string'i içinde geçer.)

### Genel sözlük (her yerde geçerli — bul→değiştir)
| Bul | Değiştir |
|---|---|
| `text-white` | `text-on-surface` |
| `text-[#c2c6d6]` | `text-on-surface-variant` |
| `text-[#8c909f]` | `text-on-surface-variant` |
| `border-white/5` , `border-white/10` | `border-outline-variant` |
| `bg-white/5` | `bg-surface-container-high` |
| `hover:bg-white/5` , `hover:bg-white/10` | `hover:bg-surface-container-high` |
| `text-[#adc6ff]` | `text-primary` |
| `bg-[#571bc1] ... shadow-[#571bc1]/20` | `bg-primary text-white shadow-lg shadow-primary/20` |

### Sol filtre paneli (`<aside>`)
- Başlık `h2`: `text-white` → `text-on-surface`. Alt `p`: `text-[#8c909f]` → `text-on-surface-variant`. Üstteki `border-b border-white/5` → `border-b border-outline-variant`.
- **Filtre başlık butonları (4 adet — İçerik Türü / Sınıf / Dersler / Etiketler):**
  - Aktif: `bg-[#571bc1] text-white shadow-lg shadow-[#571bc1]/20` → `bg-primary text-white shadow-lg shadow-primary/20`
  - Pasif: `text-[#c2c6d6] hover:bg-white/5` → `bg-white border border-outline-variant text-on-surface-variant hover:border-primary/40`
- **Akordeon gövde kapsayıcıları** `border-l border-white/10` → `border-l border-outline-variant`.
- **Alt seçenekler** (kategori/ders): seçili `text-white bg-white/10` **ve** `text-[#adc6ff] bg-white/10` → `text-primary bg-primary/10`; pasif `text-[#c2c6d6] hover:text-white` → `text-on-surface-variant hover:text-on-surface`.
- **Sınıf butonları:** seçili `bg-[#adc6ff] text-[#002e6a] border-[#adc6ff]` → `bg-primary text-white border-primary`; pasif `bg-white/5 text-[#c2c6d6] border-white/5 hover:bg-white/10` → `bg-white text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary`.
- **Etiket çipleri:** seçili `bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/20` **ve** `bg-white/20 text-white border-white/20` → `bg-primary/10 text-primary border-transparent`; pasif `bg-white/5 text-[#c2c6d6] border-white/5 hover:bg-white/10` → `bg-white text-on-surface-variant border-outline-variant hover:border-primary`.
- **"Tümünü Sıfırla"**: `text-[#adc6ff] hover:text-[#4d8eff]` → `text-primary hover:brightness-110`. Üst `border-t border-white/5` → `border-t border-outline-variant`.
- **"İçerik Ekle" butonu** (aside altı): `bg-white/5 hover:bg-white/10 border border-white/10 text-white` → `bg-primary hover:brightness-105 border-transparent text-white shadow-[0_4px_12px_rgba(99,102,241,0.28)]`.

### Ana bölüm (`<section>`)
- `h1` "Etkinlik Laboratuvarı": `text-5xl font-black text-white` → `text-4xl md:text-5xl font-extrabold text-on-surface font-headline-lg`.
- Açıklama `p`: `text-[#c2c6d6]` → `text-on-surface-variant`.
- **Arama input'u**: `bg-[#1d2027] hover:bg-[#272a31] border border-white/5 focus:border-[#adc6ff]/40 text-[#e1e2ec] placeholder-[#8c909f] focus:shadow-[0_0_30px_rgba(173,198,255,0.05)]`
  → `bg-white border border-outline-variant focus:border-primary text-on-surface placeholder-on-surface-variant focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]`. Arama ikonu `text-[#8c909f]` → `text-on-surface-variant`.
- Sonuç sayısı `text-[#8c909f]` → `text-on-surface-variant`.
- **Yükleniyor**: spinner `border-[#adc6ff]` kalsın; metin `text-[#8c909f]` → `text-on-surface-variant`.
- **Boş durum**: kapsayıcı `bg-surface-container/40 border border-white/5` → `bg-white border border-outline-variant`; ikon kutusu `bg-white/5 text-[#8c909f] border-white/5` → `bg-surface-container-high text-on-surface-variant border-outline-variant`; `h3 text-white` → `text-on-surface`; `p text-[#c2c6d6]` → `text-on-surface-variant`.
- **Kart listesi (opsiyonel ızgara):** `pagedActivities.map` çevresindeki `<div className="flex flex-col gap-6">` aynen kalabilir (yeni `ActivityCard` yatay tasarımıyla uyumlu). İstersen daha yoğun bir ızgara için `grid grid-cols-1 xl:grid-cols-2 gap-5` yapabilirsin.
- **Sayfalama** butonları: `bg-white/5 hover:bg-white/10 border border-white/10 text-white` → `bg-white hover:bg-surface-container-high border border-outline-variant text-on-surface`; sayfa etiketi `text-[#c2c6d6]` → `text-on-surface-variant`.

### Footer
- `bg-slate-950 ... border-white/5` → `bg-white border-outline-variant`.
- Marka `text-white` → `text-on-surface` (ve `font-headline-xl` artık Poppins). Tüm `text-slate-500` → `text-on-surface-variant`, `hover:text-primary` kalsın.
- Bülten input'u `bg-white/5 border-white/10 text-white` → `bg-surface-container-low border-outline-variant text-on-surface`. "Abone Ol" `bg-primary-container text-white` → `bg-primary text-white`.

### Mobil alt menü (`<nav ... md:hidden>`)
- `bg-slate-950/90 ... border-white/10` → `bg-white/95 border-outline-variant`.
- Aktif `text-primary-container` → `text-primary`; pasif `text-slate-500` → `text-on-surface-variant`.
- Orta (+) buton: `bg-primary-container ... border-[#0b1326]` → `bg-primary ... border-white shadow-[0_8px_20px_rgba(99,102,241,0.4)]`.

### Öğrenci yükleme ekranı (App.tsx başında `isStudentView`)
- `bg-[#0b1326]` → `bg-background`; `text-slate-400` → `text-on-surface-variant`; spinner `border-primary-container` → `border-primary`.

---

## Tasarım Token'ları (referans)

**Yüzeyler / metin (açık):** sayfa `#f4f5f8`, kart/yüzey `#ffffff`, açık gri `#f8fafc / #f1f5f9 / #e8eaee`, ana metin `#0f172a`, ikincil metin `#64748b`, kenarlık `#e8eaee`.
**Vurgu:** primary indigo `#6366f1`, hover `brightness-105`, secondary `#8b5cf6`, success `#10b981`, error `#ef4444`.
**Branş renkleri:** Türkçe `#E8C85A` · Matematik `#5AC8A8` · Fen Bilimleri `#E8685A` · Sosyal Bilgiler `#6366f1` · İngilizce `#3b82f6` · Din Kültürü `#8b5cf6` · Fizik `#0ea5e9` · Kimya `#ec4899` · Biyoloji `#10b981`.
**Tipografi:** gövde/UI = **Inter** (400–800), başlıklar = **Poppins** (600–800, `font-headline-*`).
**Köşe:** kart `1.125rem` (rounded-2xl), buton `0.875rem` (rounded-xl), çip/rozet `9999px`.
**Gölge:** kart `0 1px 3px rgba(15,23,42,.05)`, hover `0 16px 32px rgba(15,23,42,.10)`, primary buton `0 4px 12px rgba(99,102,241,.28)`.
**Kart hover:** `-translate-y-0.5` + indigo kenarlık + büyük gölge (0.2s).

---

## Tam Ekran "Sunum Modu" (ActivityPreviewModal)

Önizlemedeki tam ekran açma davranışı senin mevcut `ActivityPreviewModal` akışına denk gelir. Reskin için modal sahnesini **koyu projeksiyon** olarak bırak (arka plan `#0b0e14`, ortada içerik `16:9` beyaz/koyu panel, üst/alt otomatik gizlenen kontrol çubuğu, Esc kapatır, ←/→ içerikler arası geçer, tam ekran düğmesi `requestFullscreen`). Referans uygulaması: `reference/reskin/r-stage.jsx`. Mevcut modalının iframe ile gerçek `html_code`/`storage_url` yükleme mantığı korunur; yalnızca çerçeve stili bu projeksiyon görünümüne uyarlanır.

---

## Doğrulama kontrol listesi
- [ ] Sayfa açık temada açılıyor (beyaz/açık gri), koyu kalıntı yok.
- [ ] Navbar beyaz, "Ahmet **DUYAR**" indigo vurgulu.
- [ ] Filtre akordeonu açık temada; aktif başlık indigo dolgu.
- [ ] Kartlar: branş renk şeridi, açık zemin, indigo "Aç" butonu, hover'da yükselme + indigo kenarlık.
- [ ] Arama, sayfalama, boş durum, footer, mobil menü açık temaya döndü.
- [ ] `npm run build` ve `npm run lint --max-warnings 0` temiz.

## Dosyalar
- `new-code/tailwind.config.js`, `new-code/Navbar.tsx`, `new-code/ActivityCard.tsx` — doğrudan değiştir.
- `reference/reskin/Etkinlik Laboratuvarı.html` — görsel hedef (tarayıcıda aç).
