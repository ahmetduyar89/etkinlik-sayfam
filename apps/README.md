# apps/ — Atölyedeki bağımsız çalışmalar

Bu klasördeki her alt klasör, atölyede kendi adresiyle yayınlanan **bağımsız bir
projedir**. İçindeki dosyalar hiçbir derlemeden geçmez; olduğu gibi kopyalanır.

```
apps/satranc/index.html   →   https://atölye.tedrisedu.com/satranc/
apps/deneyler/index.html  →   https://atölye.tedrisedu.com/deneyler/
```

## Yeni bir çalışma eklemek

1. **Klasörü kopyala.** Proje klasörünü `apps/` altına koy; içinde `index.html`
   bulunsun. Alt klasörler, resimler, css/js dosyaları serbestçe kullanılabilir.

2. **Yolları göreli yaz.** Proje kendi klasöründen açılacağı için dosya
   bağlantıları `./resim.png` gibi göreli olmalı. `/resim.png` şeklinde kök
   yol yazarsan dosya bulunamaz.

3. **Ana sayfaya kartını ekle.** `src/constants/portal.ts` dosyasındaki
   `PORTAL_MODULES` listesine bir kayıt ekle:

   ```ts
   {
       id: 'yeni-calisma',
       title: 'Yeni Çalışma',
       description: 'Kısa açıklama.',
       icon: Beaker,                      // lucide-react ikonu
       accent: { bg: 'bg-sky-500/10', text: 'text-sky-600', ring: 'hover:ring-sky-400/40' },
       kind: 'static',
       href: '/yeni-calisma/',            // klasör adıyla aynı olmalı
       status: 'ready',                   // hazır değilse 'soon' → kart "Yakında" görünür
   }
   ```

4. **Yayınla.** `git push` yeter; Netlify derlemeyi kendisi yapar.

## Yerelde denemek

```bash
npm run dev
```

Sonra `http://localhost:5173/satranc/` adresini aç. Yayındaki davranışın aynısı.

## Notlar

- Klasör adı adres olur: `apps/satranc` → `/satranc/`. Türkçe karakter ve
  boşluk kullanma.
- Bu projeler service worker'a uğramaz; her açılışta güncel sürüm gelir.
- Atölye şifresi bu sayfaları korumaz — bağlantıyı bilen doğrudan açabilir.
