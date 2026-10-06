# Apple Pencil cihaz testi — 6 Ekim 2026

Kaynak: kullanıcının paylaştığı `apple-pencil-test.json`. Bildirilen cihaz iPad Air 11 inç ve Apple Pencil Pro; girdi türü her iki oturumda `pen`. Safari'nin masaüstü biçimindeki user-agent değeri tek başına cihaz modelini doğrulamaz.

| Ölçüm | Güncel filtre | Önceki konum filtresi |
| --- | ---: | ---: |
| Gerçek darbe | 114 | 98 |
| Kabul edilen örnek | 3103 | 4129 |
| Basınç aralığı | 0–0,657 | 0–0,824 |
| Aktif örnek aralığı medyan / p95 | 17 / 21 ms | 17 / 21 ms |
| İşleme p95 | 1 ms | 1 ms |
| Canvas çizim p95 | 2 ms | 3 ms |
| Kare kuyruğu p95 | 2 ms | 1 ms |
| Son örnek → Canvas tamamlanması medyan / p95 | 6 / 12 ms | 6 / 12 ms |
| Ham konumdan filtre farkı medyan / p95 | 1,95 / 4,62 px | 1,48 / 2,53 px |

## Değerlendirme

212 darbe ve 7232 kabul edilen örnekte gerçek kalem girdisi ve değişken basınç kaydedildi. İki filtrenin ölçülen örnek → Canvas gecikmesi eşit. Güncel filtrenin çizim p95 değeri daha düşük, önceki filtrenin kare kuyruğu p95 değeri daha düşük; ayrı dağılımların p95 değerleri toplanarak toplam gecikme hesaplanamaz.

Önceki filtre ham koordinatlardan daha az sapmış. Filtre farkı, geometrik sapma ölçüsüdür; fiziksel gecikme veya çizgi doğruluğu puanı değildir. Görevlerin hızı, uzunluğu ve basıncı farklı olabilir; oturumlar aynı ham hareketin tekrar oynatıldığı kontrollü bir deney değildir. Bu rapor tek başına güncel filtrenin kötü veya önceki filtrenin daha iyi olduğunu kanıtlamaz.

Basınç üst sınırları oturumdan oturuma farklıdır. Bunlar gözlenen uygulanan basınç değerleridir; donanımın azami basınç değeri veya otomatik normalizasyon hedefi olarak kullanılmamalıdır. Basıncın değiştiği doğrulanıyor; çizgi kalitesinin iyi olduğu yalnızca bu aralıktan çıkarılamaz.

## Sınırlar ve karar

- HTTP ortamı güvenli bağlam değil; `getCoalescedEvents` raporda kullanılamıyor. Tahmin API'si mevcut fakat rapor tahminlerin gerçekten üretildiği sayısını içermiyor.
- 17 ms medyan kabul edilen örnek aralığı yaklaşık 59 örnek/sn ölçeğindedir. Bu, digitizer'ın ya da ekranın donanım frekansını ölçmez; hareket etmeyen mükerrer örnekler filtrelenmektedir.
- Sayaçlar fiziksel uç–ekran gecikmesini, avuç reddinin başarısını, köşe doğruluğunu veya şekil tanımanın başarı oranını ölçmez.
- İşleme/çizim dağılımlarında en fazla son 4096 gözlem tutulur; Safari süreleri milisaniye ölçeğinde yuvarlamış olabilir. 1 ms farkları kesin üstünlük olarak yorumlamayın.
- Raporun yazım hissi alanları boş; kullanıcı sohbet içinde “Belirgin fark hissetmedim” yanıtını verdi. Goodnotes'a ait karşılaştırma verisi yok.

Kullanıcı belirgin fark hissetmediğini bildirdi. Mevcut rapor ve bu yorum basınç eğrisini yeniden kalibre etmeyi veya varsayılan filtreyi değiştirmeyi gerekçelendirmiyor. Güncel filtre varsayılan olarak korunuyor; motor parametreleri bu ölçümlerden hareketle değiştirilmedi. Daha yüksek örnekleme desteğini değerlendirmek için güvenli bağlamda API kullanılabilirliği ayrıca sınanabilir; bunun otomatik olarak daha iyi yazım sağlayacağı varsayılmamalıdır.
