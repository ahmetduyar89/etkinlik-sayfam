# apps/ — Atölyedeki bağımsız çalışmalar

Bu klasör, atölyede kendi adresiyle yayınlanan **bağımsız projeleri** barındırır.
Bu projeler hiçbir derlemeden geçmez; dosyaları olduğu gibi yayınlanır.

```
apps/satranc/index.html   →   https://atölye.tedrisedu.com/satranc/
apps/deneyler/index.html  →   https://atölye.tedrisedu.com/deneyler/
```

Hepsi **bu depoda** durur. Satranç ve deneyler eskiden kendi depolarında yaşıyor,
yayın sırasında klonlanıyordu; artık öyle değil. Bir çalışmayı değiştirmek için
tek yapman gereken buradaki dosyayı düzenleyip commit etmek — ayrı depo, ayrı
yayın adımı yok.

---

## Yeni bir çalışma eklemek

1. Klasörü `apps/` altına koy; içinde `index.html` bulunsun.
2. `src/constants/portal.ts` dosyasındaki `PORTAL_MODULES` listesine kartını ekle
   (aşağıdaki örneğe bak).

Hepsi bu. Bir sonraki yayında `/yeni-calisma/` adresinde açılır.

---

## Bir çalışmayı güncellemek

`apps/satranc/` (ya da `apps/deneyler/`) içindeki dosyayı düzenle, commit et,
push et. Yayın otomatik gider.

Yerelde denemek için:

```bash
npm run dev
```

`http://localhost:5173/satranc/` — yayındaki davranışın aynısı.

---

## Kart eklemek — `src/constants/portal.ts`

```ts
{
    id: 'yeni-calisma',
    title: 'Yeni Çalışma',
    description: 'Kısa açıklama.',
    meta: 'Alt etiket',                // isteğe bağlı
    icon: Beaker,                      // lucide-react ikonu
    accent: {
        icon: 'from-sky-500 to-blue-500',
        strip: 'from-sky-300 via-blue-300 to-indigo-200',
        glow: 'rgba(14, 165, 233, 0.28)',
    },
    kind: 'static',
    href: '/yeni-calisma/',            // klasör adıyla aynı olmalı
    status: 'ready',                   // hazır değilse 'soon' → kart "Yakında" görünür
}
```

---

## Dikkat edilecekler

- **Yollar göreli olmalı.** Proje kendi klasöründen açılır: `./resim.png` ✅,
  `/resim.png` ❌.
- **Klasör adı adres olur.** Türkçe karakter ve boşluk kullanma
  (`satranc` ✅, `satranç` ❌).
- **Yayına gitmeyenler:** `.git`, `.github`, `.claude`, `.vscode`, `.idea`,
  `node_modules`, `.DS_Store` kopyalanmaz.
- **Bu klasör derlenmez.** ESLint ve TypeScript `apps/` altına bakmaz; buradaki
  kod atölyenin kurallarına tabi değildir.
- **Service worker:** bu projeler atölyenin service worker'ına uğramaz. Kendi
  service worker'ı olan projeler (satranç gibi) kendi klasörlerinde sorunsuz
  çalışır.
- **Şifre koruması yok:** atölye şifresi bu sayfaları korumaz; bağlantıyı bilen
  doğrudan açabilir.
