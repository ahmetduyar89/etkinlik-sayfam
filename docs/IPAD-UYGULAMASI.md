# iPad’de Atölye

Atölye, web sitesiyle aynı verileri kullanan ve ana ekrandan kendi penceresinde açılan bir web uygulamasıdır. App Store kurulumu gerekmez.

## Kurulum

1. Yayındaki HTTPS adresini iPad’de Safari ile açın.
2. Giriş ekranı, Atölye veya sınıf ekranındaki **Uygulama olarak yükle** düğmesinden rehberi açın.
3. Safari’de **Paylaş → Ana Ekrana Ekle** yolunu izleyin. Bazı sürümlerde seçenek **Daha Fazla** altında bulunur.
4. Varsa **Web Uygulaması Olarak Aç** açık kalsın. **Ekle**ye dokunun.
5. Ana ekrandaki **Atölye** simgesini açın. Kurulu uygulamada yeniden giriş gerekebilir.

## Güncellik ve bağlantı

- Etkinlik listesi mevcut Firebase canlı aboneliğini kullanır. İnternete bağlı, açık uygulama içerik değişikliklerini alır; uygulama kapalıyken sürekli çalışması gerekmez.
- Uygulama yeni sürümü açılışta, tekrar öne geldiğinde, bağlantı geri geldiğinde ve açıkken düzenli aralıklarla kontrol eder. Yeni sürüm bildirimi çıkınca çalışmanızı kaydedip **Güncelle**ye dokunun.
- Başka bir açık pencere güncellendiğinde çalışma ekranı kendiliğinden yenilenmez.
- İlk başarılı yüklemeden sonra uygulamanın başlangıç ekranı çevrimdışı açılabilir. Bu, tüm etkinliklerin, videoların, satranç/deney uygulamalarının veya Firebase verilerinin çevrimdışı kullanılabileceği anlamına gelmez. Oturum doğrulama ve veri kaydetme için bağlantı gerekir.
- İnternet kesildiğinde bağlantı uyarısı gösterilir. Bu uyarı cihazın ağ durumunu gösterir; sunucuya tüm kayıtların ulaştığını garanti etmez.

## Yayın ve kontrol

`npm run build:check` uygulamayı derler. Yayın için oluşan `dist` klasörü kullanılmalıdır; `public/sw.js` doğrudan yayınlanmamalıdır. Derleme başlangıç dosyalarını önbellek listesine ekler ve içeriklerden sürüm kimliği üretir. Yeni sürüm eksik dosyalarla kurulamaz. Aynı kökteki diğer uygulamaların önbellekleri korunur.

`npm run test:pwa` çevrimdışı kabuğu, ağdan güncel içerik alımını, başarısız kurulum davranışını ve bağımsız uygulamaların ayrı kalmasını kontrol eder.

Gerçek iPad’de son kontrol: dikey/yatay kullanım, Split View, ana ekrandan açılış, giriş, etkinlik ekleme sonrası ikinci cihazda görünme, defterde Apple Pencil kullanımı ve yeni yayın sonrası güncelleme bildirimi.
