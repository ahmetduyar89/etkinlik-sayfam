# Satranç çevrimiçi kayıt düzeni

Satranç eğitimi `/satranc/` adresinde, ana Atölye ile aynı HTTPS alan adında çalışır. Ana sistemde açılan Firebase öğretmen, sınıf veya öğrenci oturumunu kullanır. `file://` veya USB üzerinden çevrimiçi kayıt yapılamaz. Canlı maç ekranı ayrı `/ ?view=satranc` bölümüdür; bu değişiklik eğitim, turnuva ve rapor bölümünün kayıt akışını düzeltir.

- Sınıf ve öğrenci listeleri `classes` koleksiyonundan canlı okunur. Düzenleme ana Atölye Sınıflar ekranında yapılır.
- Maçlar `chess_matches`, turnuvalar `chess_tournaments`, eğitim sonuçları `chess_progress` koleksiyonlarından canlı alınır.
- Öğretmen bütün sınıfları görür. Sınıf ve öğrenci oturumlarının kapsamı doğrulanmış sunucu kimliğinden belirlenir. URL veya yerel oturum kaydı yetki kaynağı değildir.
- Başlangıçta dört akıştan da sunucu verisi gelmesi beklenir. Önbellekteki kayıtlar güncel sunucu verisi olarak gösterilmez.
- Değişen ve silinen kayıtlar birlikte çevrimiçi işlemle gönderilir. İşlem öncesinde mevcut sunucu verisi kontrol edilir. Başka cihaz aynı kaydı değiştirmişse eski veri üzerine yazılmaz; yeniden bağlantı ve işlemin tekrarı istenir.
- Kayıt sunucu onayı beklerken “Sunucuya kaydediliyor” görünür. İnternet, giriş veya kayıt hatası varsa uygulama işlemleri durdurulur. Bağlantı gelince canlı akış yeniden güncellenir; hata durumunda “Tekrar bağlan” kullanılabilir.
- Yerel kayıtlar açılışta buluta yüklenmez. Önceki veriler bir defa `satranc-online-migration-backup` anahtarına ayrı yedeklenir. “Yedek” düğmesinden indirilebilir. Bu yedek otomatik aktarılmaz; geçmiş veriler için sınıf/öğrenci kimlikleri doğrulanarak ayrı aktarım yapılmalıdır. Tarayıcı deposunun silinmesi bu yedeği de siler.

## Doğrulama

`npm run test:chess-cloud`: sunucu önce okuma, eski kayıtların gönderilmemesi, öğretmenin tüm sınıfları okuması, silme, turnuvayı yeniden açma/tur azaltma, sunucu onayı, bağlantı kesintisi ve eşzamanlı değişiklik çakışması.

`npm run build:check`: üretim derlemesi ve Firebase web yapılandırmasının statik satranç uygulamasına eklenmesi.

Canlı yayına alındıktan sonra iki ayrı cihaz/oturumla sınıf listesi, maç, turnuva ve ilerleme değişikliklerinin admin panelinde ve diğer cihazda görülmesi doğrulanmalıdır. Oturumsuz erişim, internet kesintisi ve yetki hatası da denenmelidir. Yerel otomatik testler gerçek Firebase bağlantısının ve canlı yayının doğrulandığı anlamına gelmez.
