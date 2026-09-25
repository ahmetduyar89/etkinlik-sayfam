# Online Satranç Yönetimi — İlk Kurulum

Kod tarafı çevrimdışı kayıtları koruyarak Firestore'a senkron olacak şekilde
hazırdır. Canlı kullanımı açmak için Firebase tarafında aşağıdaki tek seferlik
kurulum yapılmalıdır.

## 1. Öğretmen hesabı oluştur

Firebase Console'da proje içinden **Authentication → Sign-in method** bölümüne
girip hem **Email/Password** hem de **Anonymous (Anonim)** yöntemini etkinleştir.
Anonim yöntem sınıf ekranlarının parola saklamadan yalnızca kendi cihaz
kayıtlarını gönderebilmesini sağlar. Ardından **Users** ekranında öğretmen/admin
için bir e-posta ve parola oluştur.

Bu e-posta adresini yayın ortamına ekle:

```env
VITE_FIREBASE_ADMIN_EMAIL=ogretmen@example.com
```

Parola `.env` dosyasına yazılmaz. Öğretmen giriş ekranında girilir ve Firebase
tarafından doğrulanır.

## 2. Firestore kurallarını yayınla

Önce öğretmen hesabının ve `VITE_FIREBASE_ADMIN_EMAIL` değişkeninin hazır
olduğundan emin ol. Sonra:

```bash
firebase deploy --only firestore:rules --project interaktif-etkinliklerim
```

Yeni koleksiyonların tamamını yalnızca e-posta/parolayla giriş yapan öğretmen
okuyabilir. Sınıf ekranında açılan anonim oturum ise yalnızca kendi oluşturduğu
kayıtları okuyup değiştirebilir:

- `chess_matches`
- `chess_tournaments`
- `chess_progress`
- `chess_sync`

## 3. Siteyi yeniden yayınla

Netlify/Vite derlemesi `/satranc/firebase-config.json` dosyasını mevcut
`VITE_FIREBASE_*` değerlerinden otomatik üretir. Bu dosyada yalnızca Firebase'in
herkese açık web yapılandırması vardır; yönetici parolası bulunmaz.

## 4. Eski kayıtları aktar

Her sınıf bilgisayarında bir kez:

1. Atölye ana sayfasında ilgili sınıf hesabıyla giriş yap.
2. **Satranç Eğitimi** bölümünü aç.
3. Üst çubukta **Buluta kaydediliyor** yazısını kontrol et. Sayfa açıldığında
   o tarayıcıdaki maçlar, turnuvalar ve öğrenci profilleri
   otomatik olarak buluta eklenir.

İlk aktarım bulutta bulunan aynı kimlikli bir kaydın üzerine yazmaz. Sonraki
değişiklikler iki yönlü ve anlık senkronlanır. İnternet yoksa uygulama yerel
kayıtla çalışmaya devam eder; bağlantı geldiğinde değişiklikleri gönderir.

## 5. Kontrol

Admin ana sayfasından **Satranç Yönetimi** kartını aç. Her sınıfta:

- senkronlanan öğrenci profilleri,
- 36 haftalık program ilerlemesi,
- XP/seviye,
- maç ve turnuva sayıları,
- devam eden turnuva ve son cihaz senkronu

canlı görünmelidir.

> Not: Mevcut `classes`, içerik ve defter koleksiyonları eski sınıf girişleriyle
> uyumluluk için henüz açık kuralları kullanmaktadır. Satranç öğrenci gelişim
> kayıtları ise yeni kimlik doğrulamalı koleksiyonlarda tutulur.
