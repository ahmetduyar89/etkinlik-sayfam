# Telefonla QR giriş

Telefonunda öğretmen veya sınıf hesabına giriş yapan kullanıcı, sınıftaki
bilgisayarın giriş ekranında **QR kodu göster** düğmesini kullanır. Telefon
kamerasıyla QR okutulur; iki ekrandaki altı haneli kod karşılaştırılır ve
telefonda **Girişi onayla** seçilir. Bilgisayar aynı hesapla ana sayfayı açar.
Telefonun oturumu devam eder; bilgisayarın QR oturumu sekme/tarayıcı oturumuyla
sınırlıdır. Ders sonunda mevcut **Çıkış yap** düğmesi kullanılmalıdır.
Tarayıcının oturum geri yükleme özelliği sekme oturumunu geri getirebilir;
ortak cihazlarda ders sonunda açıkça çıkış yapmak gerekir.

Telefon kamerasının açtığı tarayıcıda oturum bulunmalıdır. Örneğin telefonun
kurulu web uygulamasında giriş yapılıp QR Safari'de açılırsa, Safari'de de bir
kez giriş istenebilir. Telefon girişleri kalıcı olarak saklanır.

## Yayın

Frontend Netlify üzerinden, sunucu fonksiyonları Firebase üzerinden yayınlanır.
Bu değişiklik kendi başına uzak ortama yayın yapmaz.

1. Öğretmen için mevcut Firebase email/password hesabı ve frontend ortamındaki
   `VITE_FIREBASE_ADMIN_EMAIL` ile fonksiyon ortamındaki `TEACHER_EMAIL` aynı
   hesabı göstermelidir. Eski yalnızca yerel şifre girişi QR onayı veremez.
2. Mevcut projeye yeni fonksiyonları ve kuralları yayınlayın:

   ```sh
   firebase deploy --only functions:createQrLogin,functions:inspectQrLogin,functions:approveQrLogin,functions:completeQrLogin,functions:cleanupQrLogins,firestore:rules
   ```

   Fonksiyonların kullandığı mevcut özel token imzalama yetkisi gereklidir.
   Günlük temizlik fonksiyonu Cloud Scheduler kullanır; Firebase projesinin
   bu servisleri destekleyen faturalandırma/servis yapılandırması olmalıdır.
3. Frontend'i mevcut Netlify yayın akışıyla yayınlayın. QR bağlantısı mevcut
   HTTPS site adresini kullanır; ek alan adı veya kamera izni gerekmez.
4. Gerçek telefon ve ayrı bir bilgisayarla öğretmen ve sınıf akışlarını
   deneyin. QR süresi, çıkış ve sekme kapatma davranışını kontrol edin.

## Uygulama ve doğrulama

- `functions/qr-login.js`: anonim istek oluşturma, doğrulanmış telefondan
  inceleme/onaylama, yalnızca isteği oluşturan tarayıcıdan tamamlama.
- QR içinde yalnızca istek kimliği ve okuma sırrı bulunur; hash bölümü sayesinde
  sır HTTP istek adresi/referrer içinde taşınmaz. Bilgisayara özel tamamlama
  sırrı QR içinde yer almaz. Sunucu sırların yalnızca SHA-256 özetlerini saklar.
- İstekler iki dakika geçerlidir. İşlem içindeki durum geçişleri eşzamanlı
  onay/tamamlamaya karşı tek kullanım sağlar. Giriş belirteci Firestore'a
  yazılmaz. Öğretmen email'i, sınıf kimliği ve hesabın aktifliği sunucuda
  kontrol edilir. Hesap tamamlama anında yeniden doğrulanır.
- İstek ve hız sınırı koleksiyonları istemci erişimine kapalıdır. IP adresi
  yerine özeti kullanılır; on dakikada IP başına en fazla 30 QR oluşturulur.
  Süresi dolmuş kayıtlar günlük temizlenir.
- Bağlantı kaybından dolayı tek kullanımlık tamamlama yanıtı kaybolursa yeni QR
  oluşturulmalıdır. Bekleyen istekler yeniden yüklemede taşınmaz.

```sh
npm run build:check
npm run functions:check
npm --prefix functions test
node --test scripts/test-auth-session.mjs
```

Oturum testleri geçici/kalıcı kayıtları, çıkışı ve sekmeler arası tekrar yazmayı
doğrular. Sunucu testleri bellek içi Firestore/Auth taklitleriyle kimlik, süre, sırların
ayrılması, eşzamanlı kullanım, devre dışı hesap, silinmiş sınıf, imzalama hatası
ve hız sınırını doğrular. Gerçek Firebase ve iki cihaz testi yayın sonrası
ayrıca yapılmalıdır.
