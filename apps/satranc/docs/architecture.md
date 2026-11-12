# Satranç Eğitim Platformu Mimari Planı

## Ürün Hedefi

İlkokul 1-4. sınıf öğrencilerinin satrancı tek başına, güvenli ve eğlenceli biçimde öğrenebileceği; HTML, CSS ve JavaScript ile çevrimdışı çalışan bir PWA uygulaması.

## Kullanılan Teknolojiler

- HTML5: tek giriş noktası `index.html`
- CSS3: responsive düzen, "çıkartma" (sticker) kart dili, CSS tahta ve animasyonlar
- JavaScript ES Modules: modüler ekran, veri, servis ve motor katmanları
- Web Audio API: yerleşik ses efektleri, dış dosya gerektirmez
- LocalStorage: profil, XP, rozet, ilerleme ve ayar kaydı
- Service Worker: offline önbellek
- Kendi satranç motorumuz: `src/engine/` altında sıfırdan yazılmış kural motoru ve yapay zekâ (harici kütüphane yok)

## Dosya Ağacı

```text
index.html
manifest.webmanifest
service-worker.js
docs/
  architecture.md
tools/
  generate-puzzles.mjs   # Bulmaca üreteci (motorla doğrular)
  verify-puzzles.mjs     # Sevk edilen bulmaca dosyasının bağımsız denetimi
  verify-lessons.mjs     # Ders FEN'lerini, hedeflerini ve yolculuk `par` değerlerini denetler
  verify-board.mjs       # Kare renklerinin motorla uyumunu denetler (a1 koyu, h1 açık)
  verify-plan.mjs        # 36 haftalık programın tüm etkinlik bağlantılarını denetler
  dev-server.mjs         # Geliştirme için küçük statik sunucu (ES modülleri file:// ile açılmaz)
src/
  app.js
  components/
    ChessBoard.js    # Etkileşimli oyun tahtası (yasal hamleler, terfi, çevirme)
    LessonBoard.js   # Ders tahtası: keşfet / hedef / bul / sıra / yolculuk modları
    PieceGlyph.js    # Kavuklu şah + fil çizimi (haç yok) ve taş RENKLENDİRME katmanı
    Icon.js          # SVG ikon seti
    ProgressRing.js  # Dairesel ilerleme göstergesi
  pages/
    HomePage.js
    PlanPage.js
    LearnPage.js
    BoardPage.js
    PiecesPage.js
    RulesPage.js
    TacticsPage.js
    OpeningsPage.js
    EndgamesPage.js
    PuzzlesPage.js
    MiniGamesPage.js
    PlayPage.js
    DuelPage.js
    BadgesPage.js
    ProfilePage.js
    SettingsPage.js
    ClassesPage.js      # Sınıflarım: sınıf/öğrenci yönetimi, sıralama, maç geçmişi, yedek
    TournamentPage.js   # İsviçre sistemi turnuva
  engine/
    Chess.js        # Kural motoru (0x88): hamle üretimi, FEN/SAN, mat/pat/beraberlik
    Evaluator.js    # Konum değerlendirme: materyal, kare tabloları, piyon yapısı
    Ai.js           # Alfa-beta arama, 3 zorluk seviyesi, hamle sınıflandırma
    Coach.js        # Konumu çocuk diline çeviren analiz (asılı taş, tehdit, en iyi hamle)
  games/            # Mini oyunlar — her oyun ayrı dosya, ortak GameShell iskeleti
    GameShell.js    # Puan, tur, süre, seri ve bitiş ekranı
    MoveTarget.js   # Taşı Yerine Sürükle
    SquareFinder.js # Doğru Kareyi Bul
    PieceQuiz.js    # Taşı Tanı
    MateDash.js     # Matı Bul (60 saniye)
    GuessMove.js    # Hamleyi Tahmin Et
    MemoryFlash.js  # Hızlı Hafıza
    MatchMoves.js   # Eşleştirme
  animations/
    effects.js
  audio/
    SoundService.js
  assets/
    icons/
      app-icon.svg
  data/
    lessons.js        # Sol menü gezinme öğeleri
    introLessons.js   # "Satrancı Tanıyalım" 5 bölüm + sorular
    pieceLessons.js   # Taş dersleri (keşif, görev, alma, quiz)
    ruleLessons.js    # Kural dersleri (rok, geçerken alma, terfi, mat, pat)
    tacticLessons.js  # Taktik desenleri (çatal, şiş, açmaz, çifte şah, boğma matı)
    openingLines.js   # Açılış dizileri + açıklamalar
    endgameLessons.js # Oyun sonu teknikleri + motora karşı alıştırma
    weeklyPlan.js     # 36 haftalık ders programı: kazanım, 40 dk akış, etkinlik bağlantıları
    curriculum.js     # TÜM derslerin tek kaynağı; yüzdeler ve seviye sistemi
    puzzles.js        # 1120 doğrulanmış bulmaca (otomatik üretilir)
    badges.js         # 20 rozet; koşullar tanımın içinde (current/target)
  models/
    progress.js
  services/
    ProgressService.js  # İlerleme + `onChange` aboneliği (üst çubuk sayaçları)
    GameService.js   # Oyun akışı, hamle kalitesi, ipucu, doğruluk raporu
    ClassroomService.js # Sınıflar, öğrenciler, maç kayıtları, turnuvalar, yedek
    SwissPairing.js  # İsviçre sistemi puanlama ve eşleştirme (saf fonksiyonlar)
    RosterCrypto.js  # Gömülü şifreli okul listesini WebCrypto ile çözer
  styles/
    base.css        # Tasarım sistemi: renk paleti, yazı tipi, köşe ve gölge ölçeği
    layout.css
    classes.css     # Sınıflarım, Turnuva, üst çubuk sınıf seçicisi
    components.css
    board.css
    chessboard.css
    play.css
    duel.css        # İki kişilik oyun: kurulum paleti, skor tahtası (saatler,
                    # materyal farkı, maç skoru) ve yan yana iki tahta
    games.css
    lessons.css     # Ders sayfaları + Tanıyalım, Öğretmen, Profil, Rozet, Ayarlar
    plan.css        # 36 haftalık program: ünite renkleri, hafta kartları, ders planı
    theme.css       # Neşeli tema katmanı — EN SON yüklenir, sayfa CSS'lerinin
                    # yapısını değiştirmeden yalnızca GÖRÜNÜMÜ ortak dile taşır
  utils/
    dom.js
    router.js
```

## Ekran Wireframe Planı

- Ana Menü: hoş geldiniz, XP özeti ve "bu haftanın dersi" kartı (tamamlanmamış ilk hafta), altta mod kartları.
- Ders Programı: 6 renkli ünite, 36 hafta kartı; hafta detayında kazanım + 40 dakikalık akış
  (Isınma 5 / Anlatım 10 / Uygulama 20 / Kapanış 5) ve tek tıkla açılan etkinlik bağlantıları.
- Satrancı Tanıyalım: 5 bölümlük yolculuk (nedir, tarihçe, dünya/Türkiye, zekâ, nasıl başlarım) + her bölümde soru.
- Satranç Tahtası: 5 etkileşimli ders — Kareler, Sütun & Yatay, Merkez, Kare Renkleri, Kurulum.
- Taşları Öğren: taş seçici + sekiz aşama (Keşfet → Engeller → 3-4 Görev → Yolculuk → Taş Alma → 2 soruluk Quiz), tümü etkileşimli.
- Kurallar: rok, geçerken alma, terfi, mat ve pat tahtada bizzat uygulanır; metin kuralları kart olarak.
- Taktikler: çatal, şiş, açmaz, çifte şah, mat ağı ve boğma matı — çocuk doğru hamleyi kendi
  bulur, sonra bir soruyla DESENİ anladığını gösterir. Ders ancak soru doğru cevaplanınca tamamlanır.
- Açılışlar: çocuk beyazı oynar, siyah senaryodan gelir; her hamlenin amacı açıklanır, sonda quiz.
- Oyun Sonları: teknik adımları + tek hamlelik uygulama, ardından MOTORA KARŞI alıştırma.
- Bulmacalar: zorluk filtreleri, tahta, çözüm animasyonu ve yıldız puanı.
- Mini Oyunlar: sürükle-bırak, doğru kare, taşı tanı, hafıza ve eşleştirme.
- Bilgisayara Karşı: seviye seçimi, hamle geri al, ipucu, analiz ve oyun sonu raporu.
- İki Kişilik Oyun: iki öğrenci karşı karşıya. Tahta BOŞ gelir, taşları çocuklar
  paletten seçip dizer (ya da "Standart Diziliş"). İki düzen vardır: tek tahta
  (isteğe bağlı otomatik çevirme) ve AYNI SAYFADA yan yana iki tahta — soldaki
  beyazı, sağdaki siyahı temsil eder, her biri kendi oyuncusunun gözünden çizilir
  ve TEK konumu paylaştıkları için hamle iki tahtada da anında görünür.
  Tahtaların üstündeki SKOR TAHTASI turnuva satrancının üç aracını taşır:
  iki satranç saati (Süresiz / 5 dk / 10 dk / 15+10 Fischer eklemeli, duraklatma
  düğmesiyle), tahtadaki materyal farkı (piyon 1 … vezir 9) ve oyunlar boyunca
  biriken maç skoru (kazanan 1, beraberlik ½).
- Sınıflarım: sınıf ve öğrenci (ad soyad) yönetimi, e-Okul listesinden toplu ekleme,
  maçlardan hesaplanan sıralama, öğrenci maç geçmişi, elle sonuç girişi ve JSON yedek.
  Veri `services/ClassroomService.js` içinde, ilerlemeden ayrı localStorage anahtarında
  ("satranc-okulu-siniflar") durur. Üst çubuktaki seçici aktif sınıfı belirler;
  İki Kişilik Oyun öğrencileri buradan seçer ve biten oyunu kaydeder.
  Okul listesi `data/classRoster.js` içinde ŞİFRELİ gömülüdür (üretici:
  `tools/sinif-listesi-gom.py`, PBKDF2 + HMAC-SHA256 akış şifresi + HMAC doğrulama).
  Öğretmen şifresiyle çözülüp mevcut kayıtlara birleştirilir; kimlikler sabit
  olduğu için liste güncellemesi yalnızca eksikleri ekler.
- Turnuva: aktif sınıfın İsviçre sistemi turnuvaları (`services/SwissPairing.js`):
  puan gruplarında üst yarı–alt yarı eşleşmesi, tekrar eşleşme ve çift bay engeli,
  renk dengesi, Buchholz eşitlik bozma. Masa sonucu elle ya da "Tahtada Oyna" ile
  İki Kişilik Oyun ekranından (#/duello?turnuva=…&masa=…) girilir.
- Yapay Zeka Öğretmeni: serbest oynanan tahta + gerçek konum analizi (Coach.js) ve soru-cevap.
- Rozetler: 20 rozet, gruplara ayrılmış; kilitli olanlar ilerleme çubuğuyla ("4/7") gösterilir.
- Profil: seviye/unvan, XP çubuğu, bölüm bölüm ilerleme, oyun istatistikleri, mini oyun rekorları.
- Ayarlar: ses efektleri, sesli anlatım, animasyon, yüksek kontrast (iOS tarzı anahtarlar) ve onaylı ilerleme sıfırlama.
- İmza: kenar menüsünün altında ince bir "Hazırlayan: Ahmet DUYAR" satırı, ana sayfanın altında imza kartı.

## 36 Haftalık Ders Programı

Haftada 1 ders saati (40 dk) esasına göre 6 üniteye bölünmüştür:

| Ünite | Hafta | İçerik |
|---|---|---|
| 👋 Tanışma ve Tahta | 1-4 | Satranç nedir, tarihçe, kareler, merkez, kurulum |
| ♟️ Taşları Tanıyorum | 5-12 | Altı taş, taş değerleri, ünite değerlendirmesi |
| 📕 Oyunun Kuralları | 13-20 | Şah, mat, pat, rok, terfi, geçerken alma |
| 🎮 Oyunu Oynuyorum | 21-26 | Oyun görgüsü, açılış ilkeleri, 6 açılış |
| 🎯 Taktik Ustası | 27-32 | Çatal, şiş, açmaz, çifte şah, mat ağı, feda |
| 🏆 Oyun Sonu ve Turnuva | 33-36 | Şah+vezir, şah+kale, muhalefet, sınıf turnuvası |

Her haftanın etkinlik bağlantıları derin bağlantı (`#/pieces?tas=knight`) kullanır ve
`tools/verify-plan.mjs` ile denetlenir: var olmayan bir derse işaret eden hafta olamaz.

## Arayüz Güncelleme Kuralı

`ProgressService.save()` her durum değişikliğinin TEK geçiş noktasıdır ve
`onChange` abonelerini uyarır. `app.js` buna abone olup üst çubuktaki XP ve
yıldız sayaçlarını YERİNDE günceller.

Sayfa yeniden çizilmez — bu bilinçli bir karardır: çocuk dersin ortasındayken
`render()` çağırmak ekranı sıfırlar, az önce cevapladığı soruyu ve tahtadaki
konumu yok ederdi. Yalnızca iki yazı değişir, ardından kısa bir vurgu animasyonu
oynar (ilkokul çağındaki bir çocuk için ödülün GÖRÜLMESİ, kaydedilmesi kadar
önemlidir).

## Veri Modeli

- `progress`: tamamlanan dersler, çözülmüş bulmacalar, XP, yıldızlar, rozetler,
  oyun sonuçları ve mini oyun rekorları (`miniGames`).
- `settings`: ses efektleri, sesli anlatım, animasyon, yüksek kontrast.
- `curriculum`: bölüm → ders kimlikleri eşlemesi. Yüzdeler buradan HESAPLANIR;
  hiçbir yerde sabit "toplam ders sayısı" yazmaz.
- `badge`: id, başlık, açıklama, grup ve `current(state)` + `target` çifti.
  Rozet koşulu tanımın içindedir, ProgressService'e kopyalanmaz.
- `puzzle`: id, FEN, seviye, tema, tek doğru çözüm (SAN), tam varyant, ipucu.

## Tasarım Dili

İlkokul 1-4. sınıf için tasarım bilinçli olarak SOMUT ve RENKLİDİR:

- **Renk paleti** `base.css` içindeki `:root` bloğunda tek kaynaktan gelir:
  deniz yeşili (marka), mor, gök mavisi, güneş sarısı, mercan, pembe ve yeşil.
  Her renk üç tonda tanımlıdır: `--x` (ana), `--x-dark` (gölge/dudak), `--x-soft` (zemin).
- **Çıkartma kartlar**: beyaz zemin, 2-3 piksel çerçeve, çok yumuşak köşeler
  (`--r-sm`…`--r-xl`) ve altında sert bir renk dudağı + yumuşak bulut gölgesi.
- **Basılabilir düğmeler**: altlarında koyu bir dudak vardır; tıklanınca aşağı
  iner ve dudak incelir. Küçük çocuklar için bu geri bildirim renk değişiminden
  çok daha anlaşılırdır.
- **Renk kodlu gezinme**: kenar menüdeki her satır, ana menüdeki her kutucuk ve
  her mini oyun kartı kendi rengini `--tone` değişkeninden alır (CSS `nth-child`
  ile döner). Çocuk bölümü adından önce renginden hatırlar.
- **Ünite renkleri** `weeklyPlan.js` içindeki `color` alanından gelir ve
  `--unit` değişkeniyle ders programı ekranına taşınır.
- **Yüksek kontrast** ayarı açıldığında süslemeler (dekoratif at, renk lekeleri,
  başlık gradyanı) kapanır; renkler koyulaşır, çizgiler kalınlaşır. Tahta da
  beyaz/koyu yeşile, taşlar saf beyaz/siyaha iner.

### Tahta ve taşlar

- **Kareler**: krem `#ffeec4` ve turkuaz `#38b6a1`. İkisi de bilinçli olarak ORTA
  tondadır; çok koyu bir yeşil fildişi taşı, çok açık bir krem ise koyu taşı yutardı.
- **Taşların tamamı KENDİ VEKTÖR ÇİZİMİMİZDİR** (`PieceGlyph.js`); Unicode satranç
  sembolleri (♙ ♞ ♜ ♛ ...) artık kullanılmaz. Üç nedeni var:
  1. *Haç sorunu*: Unicode şahın (♔ ♚) ve filin (♗ ♝) tepesinde haç vardır. Şah
     padişah kavuğu ve sorgucuyla, fil tepe topuyla çizilir.
  2. *Görünüm*: yazı tipi çizimleri kalın ve tıknazdır; "beyaz" semboller (♙ ♘ ♖ ♕)
     ise yalnızca çizgidir — içleri boş olduğu için altındaki karenin rengini
     gösterir, yani beyaz taş hiçbir zaman BEYAZ görünmez.
  3. *Tutarlılık*: semboller sistem yazı tipinden gelir (macOS'ta Apple Symbols,
     Windows'ta Segoe UI Symbol) ve ölçüleri farklıdır. Taşlar bir bilgisayarda
     kareye otururken diğerinde kayıyor ve küçülüyordu. Vektörde bu belirsizlik yoktur.
- **Ortak görüş kutusu**: bütün taşlar `6 0 33 42.6` kutusunu paylaşır. Kutu en uzun
  taşın (şah) mürekkebini çerçeveler; kaideler aynı çizgiye oturur, boylar doğal
  oranında kalır — piyon kısa, vezir uzun. Kutu = mürekkep olduğu için taş,
  karede geometrik olarak ortalandığında GÖRSEL olarak da ortalanır; hizayı
  hesaplamak için yazı tipi metriği gerekmez.
- **Ölçü**: taş `1em` boyunda çizilir, tahtada yazı ölçüsü `10cqw`'dir (1 kare =
  12.5cqw), yani taş kareyi %80 doldurur.
- **Renk TEK KAYNAKTAN gelir**: her çizim `.pc-w` / `.pc-b` sınıfını taşır
  (`components.css`). Gövde `currentColor` ile dolar, ince dış hat `--pc-line`,
  iç çizgiler (sarık katları, filin yarığı, atın yelesi ve gözü) `--pc-detail`
  rengini alır. Tahta, terfi penceresi, alınan taş şeridi, ders kartları, taş
  seçici ve mini oyunlar aynı iki sınıfı kullanır.

### İki kişilik oyunda saat

Süre TEK yerde tutulur: `clock[renk]` oyuncunun bankasıdır ve yalnızca saat el
değiştirdiğinde güncellenir; ekranda görünen kalan süre her karede
"banka − (şimdi − saatin başladığı an)" olarak HESAPLANIR. Sayaçtan bir tık
düşürmek (`remaining -= 1`) daha kolay olurdu ama yanlış olurdu: tarayıcı sekme
arka plandayken zamanlayıcıları seyrekleştirir, saniyeler sessizce kaybolur ve
oyunun sonunda saatler gerçekte geçen süreyi göstermez.

Oyun TEK bir yerde biter (`endGame`): hem motorun bulduğu sonuçlar (mat, pat,
beraberlik) hem de motorun BİLMEDİĞİ sonuç (süre bitmesi) oradan geçer. Süre
bitince rakipte mat edecek taş yoksa oyun beraberlikle biter — FIDE kuralı.

Yönlendirici sayfalara "kapanıyorsun" demediği için temizliği saatin kendisi
yapar: her tıkta sayfanın kökü hâlâ DOM'da mı diye bakar, değilse sayacı kapatır.

## Animasyon Planı

- Sayfa geçişleri: hafif fade + yukarı kayma.
- Kartlar: hover ile parıltı, düşük ölçek büyümesi.
- 3D tahta: CSS perspective, kare hover glow, taş hareketinde transform geçişi.
- Rozetler: kazanımda parıltı ve parçacık efekti.
- Quiz: doğru yanıtta yeşil pulse, yanlış yanıtta kısa yatay sallanma.
- Ses: buton, taş hareketi, başarı, hata ve rozet efektleri Web Audio ile üretilir.

## Genişleme Noktaları

- Gerçek Three.js ve 3D modeller `src/models/` altına eklenebilir.
- Satranç motoru tamamen kendi kodumuzdur; harici kütüphane (chess.js / Stockfish) gerekmez.
- Kare rengi TEK kaynaktan gelir: `Chess.js` içindeki `isLightSquare()`. Tahta bileşeni
  formülü tekrarlamaz; `tools/verify-board.mjs` bunu her çalıştırmada denetler.
- `Chess.js` standart perft testleriyle doğrulanmıştır (başlangıç d4=197281, Kiwipete d3=97862, Pozisyon 3/4/5 dahil).
- Ders içerikleri (FEN + hamle dizileri) elle yazılır ama `tools/verify-lessons.mjs` ile motorla denetlenir:
  konum kurallara uygun mu, çözüm yasal mı, mat iddiası doğru mu, dizi baştan sona oynanabiliyor mu.
- Bulmacalar `tools/generate-puzzles.mjs` ile üretilir ve `tools/verify-puzzles.mjs` ile bağımsız denetlenir.
  Şu an 1120 bulmaca vardır (Kolay 620 / Orta 344 / Zor 156) ve her birinin TEK doğru çözümü doğrulanmıştır.
  Sayıyı artırmak için üretecin hedef değerlerini yükseltip iki komutu sırayla çalıştırmak yeterlidir.
