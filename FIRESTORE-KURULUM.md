# Firestore kuralları

"Defterlerim" bölümü üç yeni koleksiyon kullanır:

| Koleksiyon         | İçerik                                              |
| ------------------ | --------------------------------------------------- |
| `folders`          | Klasörler (iç içe olabilir)                         |
| `notebooks`        | Defter/beyaz tahta bilgileri (ad, kağıt, sayfa sayısı) |
| `notebook_content` | Sayfa çizimleri (JSON)                              |

Firestore güvenlik kuralları bu koleksiyonlara izin vermezse ekranda
**"Firestore güvenlik kuralları bu bölüme izin vermiyor … (permission-denied)"**
uyarısı çıkar ve defter oluşturulamaz.

## Kuralları güncelleme

### Yol 1 — Firebase Konsolu (en pratik)

1. https://console.firebase.google.com adresinden `interaktif-etkinliklerim`
   projesini açın.
2. Sol menüden **Firestore Database → Kurallar (Rules)** sekmesine girin.
3. Bu depodaki [`firestore.rules`](./firestore.rules) dosyasının içeriğini
   kutuya yapıştırın.
4. **Yayınla (Publish)** düğmesine basın. Değişiklik birkaç saniyede etkin olur;
   sonra siteyi yenilemeniz yeterli.

### Yol 2 — Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules --project interaktif-etkinliklerim
```

## Güvenlik notu

Uygulamada Firebase Authentication yok; giriş yalnızca tarayıcıda çalışan basit
bir şifre kilidiyle sağlanıyor. Bu yüzden kurallar açık erişim verir: adresi ve
proje anahtarını bilen biri bu koleksiyonları okuyup yazabilir. Bu, mevcut
`activities` koleksiyonunun bugünkü durumuyla aynıdır. Gerçek koruma için
Firebase Authentication eklenip kurallardaki `if true` koşulları
`if request.auth != null` ile değiştirilmelidir.
