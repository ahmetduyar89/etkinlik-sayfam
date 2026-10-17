# Çevrimiçi sınıf, öğrenci ve satranç planının uygulanması

## Kullanıcı akışı

- Ana girişte öğretmen, sınıf ve öğrenci giriş yolları bulunur.
- Öğretmen ana panelde sınıfları, etkinlikleri, defterleri, satrancı ve keşif bölümlerini yönetir.
- Sınıf kartı sınıfın güncel öğrenci kadrosunu, çalışma atamalarını, sonuçlarını ve turnuvalarını açar. Öğrenci adına dokununca kişisel sonuç görünümü açılır.
- Sınıf hesabıyla kullanıcı adı/şifre girişi yapılır. Sınıf paneli yalnız o sınıfa tanımlanan bölümleri ve çalışmaları gösterir. Yeni ders defteri oluşturma ile sınıfa atama tek sunucu işlemidir.
- Öğrenci giriş bağlantısı `/?view=ogrenci` veya `/?view=ogrenci&classId=...` biçimindedir. Öğretmenin kayıt ettiği ad soyad ve okul numarası sunucuda eşleştirilir. Giriş farklı cihazlarda aynı öğrenci kimliğine bağlanır.
- Canlı satranç girişi `/?view=satranc` aynı öğrenci oturumunu kullanır. Kaydı olmayan ziyaretçiler ayrı misafir seçeneğiyle oynayabilir. Misafir maçları gerçek sınıf öğrencisiyle isim üzerinden otomatik eşleştirilmez.

## Çalışma atama

Öğretmen “Sınıflar → sınıf kartı → Çalışma atama ve sonuçlar” alanında bütün sınıfa veya tek öğrenciye şu çalışmaları atar:

- Etkinlik / test
- Defter
- Deney / simülasyon
- Satranç haftalık ders (1–36)
- Satranç bulmacası (1–1934)
- Satranç mini oyunu
- Bilgisayara karşı satranç (herhangi bir seviye veya belirli seviye)

Başlık, açıklama ve isteğe bağlı son tarih kaydedilir. Yeni atama öğrenci ve sınıf ekranlarına canlı yansır. Son tarih bilgilendirme içindir; süre dolunca otomatik kapatma yoktur. Atamayı kapatmak geçmiş sonuçları silmez.

## Ortak veriler

| Kayıt | Sunucu koleksiyonu |
| --- | --- |
| Sınıflar ve öğrenci kimlikleri | `classes`, `studentLookup` |
| Sınıf/öğrenciye atama | `learning_assignments` |
| Çalışmaya başlama ve sonuç | `learning_results` |
| Eğitim ilerlemesi | `chess_progress` |
| Canlı ve turnuva karşılaşmaları | `chess_matches`, `chess_tournaments`, `liveChessGames` |
| Salon bilgisayar karşılaşmaları | `chess_bot_games` ve `chess_progress.gamesArchive` |
| Etkinlik cevapları | `submissions` |

Atama ve sonuç yazıları callable functions üzerinden yapılır. Öğrenci kimliği tarayıcıdaki isim veya URL'den alınmaz; Firebase oturumundan alınır. Öğrenci başka öğrencinin ilerleme veya çalışma sonucunu değiştiremez. Öğretmen tüm sınıfları, sınıf hesabı kendi sınıfını, öğrenci kendi çalışma sonuçlarını okur. Yeni ekranlar sunucu verisini bekler; önbellekteki veri “güncel” sayılmaz.

## Sonuçların anlamı

- Satranç hafta/bulmaca tamamlaması merkezi ilerlemeden alınır. Daha önce bitirilmiş ders/bulmaca atandığında mevcut tamamlanma ayrıca `existing-progress` olarak gösterilir.
- Mini oyun ve bilgisayar görevi, göreve başladıktan sonra kaydedilmiş yeni bir oyun gerektirir. Mini oyun puanı ve en iyi puan rapora alınır.
- Canlı salon bilgisayar karşılaşmaları sunucuda hamleler yeniden oynanarak yasal ve bitmiş oyun açısından doğrulanır. Aynı oyun kaydı tekrar gönderilse de XP ve oyun sayısı tekrar artırılmaz. Bu kontrol karşı oyuncunun gerçekten yapay zekâ olduğunun kanıtı değildir.
- Test bitince cevap kaydı sunucu onayı alır; doğru öğrenci ve atamayla eşleştirilmiş tamamlanmış test sonucu rapora bağlanır. Kayıt hatasında tamamlandı ekranı açılmaz ve tekrar deneme mümkündür.
- Defter, deney ve test olmayan etkinlikte “Çalışmamı tamamladım” öğrenci beyanıdır; doğru/yanlış puanlama yapıldığı anlamına gelmez.
- Satranç eğitimindeki bilgisayar oyunu arşivi de öğrenci ilerlemesiyle eşitlenir. Salon bilgisayar maçındaki hamle doğrulaması ayrı sunucu kaydında uygulanır.

## Canlıya alma

Yerel kaynak değişikliği, mevcut canlı sunucunun güncellendiği anlamına gelmez. Yayın birlikte yapılmalıdır:

1. Firebase projesi `interaktif-etkinliklerim` üzerinde `functions/index.js`, `learning.js`, `bot-games.js`, `chess-engine.mjs` dahil functions yayını.
2. Güncel `firestore.rules` yayını. Yeni koleksiyon izinleri ve öğrenciye özel ilerleme kuralları olmadan yeni ekranlar çalışmaz.
3. `npm run build:check` ile oluşan `dist` içeriğinin mevcut web barındırma sağlayıcısına yayını. Ana sistem ve `/satranc/` aynı HTTPS origin altında olmalıdır.
4. Öğretmen ve sınıf hesaplarının mevcut sunucu girişlerinin doğrulanması; öğrencilere okul numarası tanımlanması.
5. İki cihazda gerçek oturumlarla atama, açma, ders/mini oyun/test bitirme, admin sonuç takibi, canlı maç arşivi ve internet kesintisi kontrolü.

`npm run functions:check`, `npm --prefix functions test`, `npm run test:live-chess`, `npm run test:chess-cloud`, `npm run type-check`, `npm run build:check` yerel kontrollerdir. Test verisiyle tarayıcı kontrolünde öğrenciye özel görünürlük, farklı sekmelerde sonuç güncellemesi, 414 ve 1024 piksel düzenleri doğrulandı. Bunlar canlı Firebase yayını ve iki gerçek cihaz testinin yerine geçmez.

Geçmiş çevrimdışı satranç kayıtları otomatik aktarılmaz. Geçiş yedeği ve davranışı `SATRANC-CEVRIMICI.md` dosyasında açıklanmıştır.
