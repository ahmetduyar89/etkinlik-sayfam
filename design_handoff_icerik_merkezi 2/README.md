# Devir Paketi: Etkinlik Laboratuvarı — İçerik Merkezi Reskin

> **Hedef repo:** `ahmetduyar89/etkinlik-sayfam` (React + Vite + TypeScript + Tailwind + Firebase)
> **Amaç:** Mevcut **koyu Material-3** arayüzünü, **İçerik Merkezi** açık/indigo düzenine çevirmek:
> üst arama'lı başlık · düz sol menü (Tüm İçerikler · Branşlar · İçerik Türü · Etiketler) · karşılama başlığı ·
> sınıf çipleri · **görsel kart ızgarası** · tıkla→tam ekran sunum. Marka ("Ahmet DUYAR"), tüm mantık,
> Firebase, veri modeli ve özellikler **aynen korunur** — yalnızca düzen + görünüm değişir.

---

## Bu pakette ne var

- `reference/reskin/Etkinlik Laboratuvarı.html` — Tasarımın **çalışan HTML önizlemesi** (görsel hedef). Tarayıcıda aç: kart ızgarası, düz sol menü, arama, favoriler, sınıf çipleri, tam ekran "Sunum Modu". Bu dosyalar **referanstır**, doğrudan kopyalanacak üretim kodu değil.
- `new-code/` — Repona **doğrudan konacak** dosyalar:
  | Paket dosyası | Repodaki hedef | İşlem |
  |---|---|---|
  | `tailwind.config.js` | `tailwind.config.js` | tümüyle **değiştir** |
  | `App.tsx` | `src/App.tsx` | tümüyle **değiştir** |
  | `Navbar.tsx` | `src/components/common/Navbar.tsx` | tümüyle **değiştir** |
  | `ActivityCard.tsx` | `src/components/activities/ActivityCard.tsx` | tümüyle **değiştir** |
- Bu README — `index.html` ve `src/index.css` için 2 küçük elle değişiklik + entegrasyon notları.

## Fidelity: **Yüksek (hi-fi)** — birebir bu görünümü uygula.

---

## Uygulama Adımları

### 1) `tailwind.config.js` → değiştir
`new-code/tailwind.config.js` ile değiştir. Token *anahtarları* aynı; *değerler* açık temaya döndü (indigo primary `#6366f1`, açık yüzeyler, koyu metin) + başlıklar için **Poppins** (`font-headline-*`) + branş renkleri (`subj-*`).

### 2) `index.html` → 2 küçük değişiklik
```diff
- <html lang="tr" class="dark">
+ <html lang="tr">
```
Inter `<link>`'inin yanına **Poppins** ekle:
```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet"/>
```
(Inter ve Material Symbols linkleri kalsın. `<body>`'deki token sınıfları artık açık tema üretir.)

### 3) `src/index.css` → scrollbar
```diff
  ::-webkit-scrollbar-thumb {
-   @apply bg-white/10 rounded-full hover:bg-white/20 transition-colors;
+   @apply bg-black/10 rounded-full hover:bg-black/20 transition-colors;
  }
```
> `body/html`'deki `user-select: none` ve token sınıfları kalsın. `.glow-*`, `.bento-*`, `.neon-*` yardımcıları artık kullanılmıyor; silmek zorunda değilsin.

### 4) `src/components/common/Navbar.tsx` → değiştir
`new-code/Navbar.tsx`. **Önemli:** Yeni Navbar artık **props alır** — marka + geniş arama + "Yeni İçerik":
```ts
<Navbar search={search} onSearchChange={setSearch} onAdd={openCreate} />
```
Bu çağrı zaten yeni `App.tsx` içindedir; ek bir şey yapma.

### 5) `src/components/activities/ActivityCard.tsx` → değiştir
`new-code/ActivityCard.tsx`. Yatay koyu kart → **görsel ızgara kartı**: branş rengiyle poster + kategori rozeti + sınıf çipi + başlık + kısa açıklama + "Aç". Tüm yönetici aksiyonları (HTML kopyala, paylaş, düzenle, sonuçlar, sil) **hover'da** korunur. `index`, `onOpenPreview`, `onEdit`, `onRequestDelete`, `onShowResults`, `onCopyLink`, `onCopyHtml` props'ları **aynıdır**.

### 6) `src/App.tsx` → değiştir
`new-code/App.tsx`. **Tüm mantık korunur**: Firebase `useFirestore` sync, arama+debounce, filtreler (kategori/sınıf/ders/etiket), sayfalama (12/sayfa), önizleme/ekleme/düzenleme/silme, link & HTML kopyalama, öğrenci görünümü (`?view=student&id=`). Sadece JSX/düzen İçerik Merkezi yapısına geçti.

**Entegrasyon notları (Claude Code dikkat):**
- **`MOCK_ACTIVITIES`**: Pakette kısaltıldı — kendi orijinal App.tsx'indeki tam MOCK listesini koruyabilirsin (Firebase boşken yedek veri).
- **`useFirestore`, `ActivityForm`, `ActivityPreviewModal`, `ResultsModal`, `StudentPortal`, `Modal`, `useToast`, `useConfirm`** mevcut bileşenlerin/hook'ların **aynen** kullanılır; imzaları senin reponda olduğu gibi kalır.
- **`ActivityListItem`** artık import edilmiyor: liste görünümü (`viewMode === 'list'`) yeni `ActivityCard`'ı tek sütun olarak dizer. İstersen `ActivityListItem.tsx` dosyasını silebilirsin (zorunlu değil).
- **Favoriler / Son Açılanlar** (önizlemedeki sol menüde var) `Activity` modelinde **alan gerektirir** (`favorite?: boolean`, `last_opened_at?`). Şemaya eklemek istemezsen sol menüde **Tüm İçerikler + Branşlar + İçerik Türü + Etiketler** yeterli (paket bu faithful sürümü içerir). Eklemek istersen: modele `favorite` ekle, kartta yıldız toggle'ı + Firestore update bağla, menüye iki öğe ekle.
- **`material-symbols-outlined`** ikon fontu poster ikonları için kullanılmaya devam eder (index.html'de zaten yüklü).

---

## Tam Ekran "Sunum Modu" (ActivityPreviewModal)
Karta tıklayınca açılan tam ekran akışın korunur (gerçek `html_code`/`storage_url` iframe ile yüklenir). Görsel olarak **koyu projeksiyon** çerçevesine uyarla: arka plan `#0b0e14`, ortada `16:9` içerik paneli, üstte başlık+branş+sınıf+kategori satırı ve kapat (Esc) + tam ekran (`requestFullscreen`) düğmeleri, altta ←/→ ile içerikler arası geçiş; kontrol çubuğu 2.6 sn'de otomatik gizlenir. Referans: `reference/reskin/r-stage.jsx`.

---

## Tasarım Token'ları
**Yüzey/metin (açık):** sayfa `#f4f5f8`, kart `#ffffff`, açık gri `#f8fafc / #f1f5f9 / #e8eaee`, ana metin `#0f172a`, ikincil `#64748b`, kenarlık `#e8eaee`.
**Vurgu:** primary indigo `#6366f1` (hover `brightness-105`), secondary `#8b5cf6`, success `#10b981`, error `#ef4444`.
**Branş renkleri:** Türkçe `#E8C85A` · Matematik `#5AC8A8` · Fen Bilimleri `#E8685A` · Sosyal Bilgiler `#6366f1` · İngilizce `#3b82f6` · Din Kültürü `#8b5cf6` · Fizik `#0ea5e9` · Kimya `#ec4899` · Biyoloji `#10b981`.
**Tipografi:** gövde/UI = **Inter** (400–800), başlıklar = **Poppins** (600–800).
**Köşe:** kart `1.125rem`, buton `0.875rem`, çip/rozet `9999px`.
**Gölge:** kart `0 1px 3px rgba(15,23,42,.05)`, hover `0 16px 32px rgba(15,23,42,.10)`, primary buton `0 4px 12px rgba(99,102,241,.28)`.
**Kart hover:** `-translate-y-0.5` + indigo kenarlık + büyük gölge, 0.2s.
**Izgara:** `repeat(auto-fill, minmax(216px, 1fr))`, gap 16px.

---

## Doğrulama Kontrol Listesi
- [ ] Sayfa açık temada açılıyor (beyaz/açık gri), koyu kalıntı yok.
- [ ] Üst başlık: marka "Ahmet **DUYAR** · İçerik Merkezi" + ortada geniş arama + "Yeni İçerik".
- [ ] Sol menü düz (akordeon değil): Tüm İçerikler + Branşlar (renk noktalı, sayılı) + İçerik Türü + Etiketler.
- [ ] Karşılama başlığı + sayaçlar; sınıf çipleri 5–12; sıralama + ızgara/liste.
- [ ] Kartlar görsel ızgarada; hover'da yükselme + indigo kenarlık + yönetici kontrolleri.
- [ ] Karta tıklayınca önizleme/sunum açılıyor; arama, filtre, sayfalama, ekleme/silme çalışıyor.
- [ ] `npm run build` ve `npm run lint --max-warnings 0` temiz.

## Dosyalar
- `new-code/tailwind.config.js`, `new-code/App.tsx`, `new-code/Navbar.tsx`, `new-code/ActivityCard.tsx` — doğrudan değiştir.
- `reference/reskin/Etkinlik Laboratuvarı.html` — görsel hedef (tarayıcıda aç).
