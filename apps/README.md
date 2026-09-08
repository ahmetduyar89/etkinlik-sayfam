# apps/ — Atölyedeki bağımsız çalışmalar

Bu klasör, atölyede kendi adresiyle yayınlanan **bağımsız projeleri** barındırır.
Bu projeler hiçbir derlemeden geçmez; dosyaları olduğu gibi yayınlanır.

```
apps/satranc/index.html   →   https://atölye.tedrisedu.com/satranc/
apps/deneyler/index.html  →   https://atölye.tedrisedu.com/deneyler/
```

İki yol vardır: proje **kendi GitHub deposunda** yaşayabilir (önerilen), ya da
klasör **doğrudan bu depoda** durabilir.

---

## Yol 1 — Kendi deposu olan proje (önerilen)

Şu an satranç ve deneyler böyle çalışıyor:

| Bölüm      | Depo                                          |
| ---------- | --------------------------------------------- |
| `satranc`  | https://github.com/ahmetduyar89/satranc        |
| `deneyler` | https://github.com/ahmetduyar89/deneyler       |

Depolar `apps/apps.json` dosyasında listelidir. `npm run dev` ve `npm run build`
her çalıştığında bu depolar otomatik çekilir; klasörler bu depoya işlenmez.

**Avantajı:** satranç ve deneyler kendi depolarında gelişmeye devam eder.
Oraya yaptığın push, atölyenin bir sonraki yayınında otomatik yansır.

### Yeni bir depo eklemek

1. `apps/apps.json` dosyasına bir satır ekle:

   ```json
   {
       "dir": "yeni-calisma",
       "repo": "https://github.com/ahmetduyar89/yeni-calisma.git",
       "branch": "main"
   }
   ```

2. `src/constants/portal.ts` dosyasındaki `PORTAL_MODULES` listesine kartını ekle
   (aşağıdaki örneğe bak).

3. `npm run fetch-apps` — depo `apps/yeni-calisma/` içine iner.

### Bir bölümü güncellemek

Kendi deposuna push etmen yeterli. Atölyeyi yeniden yayınladığında (ana depoya
herhangi bir push, ya da Netlify panelinden **Trigger deploy**) yeni sürüm gelir.

---

## Yol 2 — Kendi deposu olmayan proje

Klasörü doğrudan `apps/` altına koy; içinde `index.html` bulunsun. Bu klasör
normal şekilde bu depoya işlenir. `apps/apps.json` dosyasına eklemeye gerek yok.

---

## Kart eklemek — `src/constants/portal.ts`

```ts
{
    id: 'yeni-calisma',
    title: 'Yeni Çalışma',
    description: 'Kısa açıklama.',
    meta: 'Alt etiket',                // isteğe bağlı
    icon: Beaker,                      // lucide-react ikonu
    accent: { bg: 'bg-sky-500/10', text: 'text-sky-600', ring: 'hover:ring-sky-400/40' },
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
- **Service worker:** bu projeler atölyenin service worker'ına uğramaz. Kendi
  service worker'ı olan projeler (satranç gibi) kendi klasörlerinde sorunsuz
  çalışır.
- **Şifre koruması yok:** atölye şifresi bu sayfaları korumaz; bağlantıyı bilen
  doğrudan açabilir.

## Yerelde denemek

```bash
npm run dev
```

`http://localhost:5173/satranc/` — yayındaki davranışın aynısı.
