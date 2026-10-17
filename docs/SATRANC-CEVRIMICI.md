# Satranç çevrimiçi kayıt düzeni

Satranç eğitimi `/satranc/` adresinde, ana Atölye ile aynı HTTPS alan adında çalışır ve ana sistemde açılan Firebase öğretmen, sınıf veya öğrenci oturumunu kullanır. Kod: `apps/satranc/src/services/CloudSyncService.js` ve `CloudRecords.js`. Canlı maç ekranı ayrı `/?view=satranc` bölümüdür.

## Kayıtlar

| Koleksiyon | İçerik | Belge |
| --- | --- | --- |
| `classes` | Sınıf ve öğrenci listesi (yalnız okunur; Atölye › Sınıflar'dan düzenlenir) | sınıf |
| `chess_progress` | Ders/hafta ilerlemesi, XP, bulmaca, oyun arşivi | `sınıf--profil` (`class:<id>` sınıfın ortak ders planı, `student:<id>` öğrenci) |
| `chess_matches` | İki kişilik oyun, turnuva masası ve canlı satranç sonuçları | maç başına bir belge |
| `chess_tournaments` | İsviçre sistemi turnuva, turlar ve masalar | turnuva başına bir belge |

Öğretmen bütün sınıfları görür; sınıf ve öğrenci oturumlarının kapsamı sunucu kimliğinden (`classId`, `studentId` talepleri) gelir. Öğretmen bir sınıf bağlantısıyla (`/satranc/?classId=…`) gelirse o sınıf açılır; sınıf seçilmemişse ders ilerlemesi kaydedilmez ve ekranda uyarı görünür.

## Eşitleme kuralları

- **Hiçbir iş atılmaz.** Firestore kalıcı önbellekle (IndexedDB) çalışır. İnternet yoksa ya da sunucu henüz yanıt vermediyse yazım cihazda bekler ve bağlantı gelince kendiliğinden gönderilir; sayfa yenilense de kaybolmaz.
- **Ekran kilitlenmez.** Yalnız giriş yoksa (veya sunucuya hiç ulaşılamıyorsa) tam ekran uyarı çıkar. Bağlanıyor / kaydediliyor / çevrimdışı durumları üst çubukta, hata ve “sınıf seçin” uyarısı altta şerit olarak gösterilir.
- **İlerleme toplanır, üzerine yazılmaz.** İlerleme belgesine yalnız bu cihazdaki değişiklik gider: sayaçlar artış (`increment`), tamamlanan ders/hafta, bulmaca ve rozetler ekleme (`arrayUnion`), yeni oyunlar arşive ekleme olarak. Akıllı tahta, öğretmen bilgisayarı ve sunucu işlevleri aynı anda yazsa da biri diğerinin işini silmez. Sıfırlama, ilerlemeyi bütünüyle değiştirir.
- **Maçlar ayrı belgedir; turnuva belgesinde son yazan geçerlidir.**
- **Eski yerel veri yüklenmez.** Açılıştaki yerel durum yalnız karşılaştırma tabanıdır; yalnız bu oturumda yapılan işler gönderilir. Önceki cihaz verisi bir defa `satranc-online-migration-backup` anahtarına yedeklenir ve “Yedek” düğmesinden indirilebilir.
- **Canlı satranç:** her oyun bittiğinde `archiveLiveChessGame` işlevi sonucu `liveChessGames` ve ilgili sınıfların `chess_matches` kayıtlarına yazar. Kayıt kimliği masa kodu + oyunun başlangıç zamanıdır; rövanşlar ve yeniden kullanılan masa kodları eski sonucun üzerine yazmaz.

## Öğretmen ekranı

Atölye › Sınıflar › (sınıf): 36 haftalık ders planında tamamlanan haftalar, her turnuvanın puan tablosu (galibiyet 1, beraberlik ½, bay 1; eşitlikte Buchholz) ve son maçlar canlı gösterilir (`src/components/classrooms/ChessClassReport.tsx`).

## Doğrulama

`npm run test:chess-cloud`: açılışta hiçbir şeyin yazılmaması, öğretmenin istenen sınıfı açması, çevrimdışı işin kuyruğa girmesi, ilerlemenin artış/ekleme olarak yazılması, silmenin yayılması, reddedilen yazımın gösterilmesi.

Canlı yayından sonra iki ayrı cihazla (ör. akıllı tahtada sınıf oturumu + öğretmen bilgisayarı) hafta tamamlama, turnuva sonucu ve iki kişilik oyunun öğretmen ekranında göründüğü; internet kesilip geri geldiğinde bekleyen kaydın gittiği denenmelidir. Yerel testler gerçek Firebase bağlantısının doğrulandığı anlamına gelmez.
