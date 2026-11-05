# Çizim ve şekil motoru

Bu modül Goodnotes'un kaynak kodu değildir. Uygulamanın mevcut Canvas2D, belge,
ortak çizim, seçim ve geri alma altyapısına bağlanan bağımsız TypeScript motorudur.

## Sorumluluklar

| Dosya | Sorumluluk |
| --- | --- |
| `models.ts` | StrokePoint, BrushSettings, ayrıştırılmış RecognizedShape union, tanıyıcı ve zamanlayıcı arayüzleri |
| `geometry.ts` | İteratif RDP, yay uzunluğuna göre örnekleme, açı kilidi, benzerlik dönüşümü, Path2D çıktısı |
| `recognition.ts` | Doğru, ok, çember, dönmüş elips, üçgen ve ortogonal dikdörtgen tanıma |
| `DrawHold.ts` | Tek işaretçi sahipliği, bekleme, iptal ve şekli basılı sürükleme durum makinesi |
| `inking.ts` | Katı StrokePoint/BrushSettings API'sini üretimdeki spline/ribbon çizicisine bağlar |
| `adapter.ts` | Tanınan geometriyi mevcut Stroke kayıt biçimine dönüştürür |

Girdi akışı: `PointerEvent → actualSamples → InkInput → onaylanmış Stroke.points`.
`actualSamples` aynı işaretçinin coalesced örneklerini sıralar. One Euro filtresi
koordinatları hız ve keskin köşelere göre süzer; hız üstel olarak filtrelenir.
Kalem basıncı korunur, fare/parmakta hızdan bir basınç tahmini üretilir.
Predicted örnekler `InkInput.fork()` üzerinde hesaplanır ve yalnızca bir karelik
önizlemeye girer. Kayıt, tanıma ve bekleme zamanlayıcısına girmez. Şekil tanıma ayrı onaylanmış ham koordinat tamponunu kullanır; çizim filtresi köşeleri değiştiremez.

Sunum akışı: `Catmull–Rom merkez çizgisi → basınç/hız/uç kalınlığı → zaman tabanlı
lerp → sol/sağ poligon konturu → Path2D → Canvas.fill`. Ballpoint sabit genişlikte
kalır; dolma ve fırça basınca/hıza duyarlıdır. v4 fırçalarda genişlik taban genişliğin
0.12–2.8 katıyla sınırlandırılır. Zaman tabanlı yarıçap filtresi örnekleme hızına
bağlı kalınlık sıçramalarını azaltır. Fırça bitiş sivriltmesi tamamlanmış darbeye
uygulanır. Zaman/keskinlik/basınç gibi ayarlar darbe üzerinde yakalanır.

Yeni tarayıcı kalemleri `inkVersion: 4` taşır; eski v2/v3 kayıtları eski genişlik
davranışını korur. Path önbelleği mevcut WeakMap üzerinden çalışır. Sunum kare
başına bir kez yapılır; onaylanmış girişler sunum hızından bağımsız toplanır.
Fosforlu kalem açık zeminde multiply, koyu zeminde screen kullanır. Şekle dönüşürse
`shapeInk` ve `opacity` alanları bu davranışı korur.

## Çiz ve bekle

`idle → holding → shaped`; tanıma başarısızsa `drawing`; bitiş/iptalde `idle`.
Başlangıçta 450 ms'lik tek zamanlayıcı kurulur. Ham işaretçi konumu bekleme
başlangıcından 10 ekran pikseline ulaşırsa zamanlayıcı yeniden kurulur. Küçük
titremeler zamanlayıcıyı sıfırlamaz. Sürekli küçük hareketler toplamda eşiği
aştığında sıfırlanır. Filtrelenmiş koordinatlar duraklama kararında kullanılmaz.

Her hareket işaretçi kimliğine göre doğrulanır. İptal, araç değiştirme, yeni darbe,
çoklu parmak gezinmesi ve unmount zamanlayıcıyı temizler. Nesil belirteci eski
callback'lerin yeni darbeyi değiştirmesini önler. Şekle geçişte bekleyen predicted
sunumu iptal edilir. Pointercancel taslağı atar; pointerup tek Stroke kaydeder.

Şekle kilitlenen andaki geometri, ham parmak konumu ve pivot saklanır. Sürükleme
her seferinde bu orijinal geometriye ölçek/dönüş uygular; bir önceki önizleme
üzerinden dönüşüm yapılmaz. Böylece başlangıçta sıçrama veya biriken hata olmaz.
Doğru ve ok başlangıç noktasından; kapalı şekiller merkezlerinden dönüşür.
Shift/açı kilidi dönüşü 45 derece yönlerine kilitleyebilir.

## Tanıma

Toleranslar ekran pikselidir: belge koordinatları view scale ile normalize edilir.
Epsilon 4 px (istenen 3–6 aralığı), doğrunun maksimum sapması 8 px, kapanış
mesafesi 25 px, minimum görünür boyut 32 px. Doğrular 45 derece katlarına ±5 derece
yakınsa kilitlenir. Yol uzunluğu kontrolü geri kıvrılan bir çizimi doğru yapmaz.

Kapalı eğri, başlangıç köşe olmak zorunda kalmasın diye en uzak noktada iki RDP
parçasına ayrılır. 40 derece üzeri dönüşler köşe adaylarıdır. Üçgen kenar hatası ve
alan kontrolünden; dikdörtgen ayrıca ±15 derece dik açı kontrolünden geçer. Karşı
kenar yönlerinin ortalamasıyla dikdörtgen gerçekten ortogonal hâle getirilir.

Daire/elips fit'i yay uzunluğuna göre 96 örnek kullanır: duraklamalar ve sensörün
örnekleme yoğunluğu merkezi kaydırmaz. PCA ana ekseni döndürülmüş elipsleri bulur.
Yarıçapın normalize standart sapması %18 altındaysa, eksenler de benzerse daire
adayıdır. Elips normalize yarıçap RMS hatası %9'u geçemez. Açısal kapsam ve yön
kontrolü eksik yayları, yinelenen döngüleri ve karalamaları reddeder. Köşe kontrolü
önceliklidir: bir karenin yarıçap varyansı da düşük olabilir; onu yanlışlıkla
çembere dönüştürmemek gerekir. Ok için doğru gövde, geri dönüş ve gövdenin iki
yanındaki kanatlar zorunludur; tek kanca ok sayılmaz.

Sonuç `shapePath()` ile gerçek vektör Path2D'ye veya `shapeToStroke()` ile uygulama
Stroke'una çevrilir. Elips `rotation`, çokgen gerçek köşeler, ok `arrowHeadAngle`
ile saklanır. Sayfa codec'i geometrik koordinatları mevcut 0.1 px hassasiyette
saklar; dönüş açısı ve blend metadatası korunur.

## Doğrulama

```sh
node scripts/test-draw-hold.mjs
node scripts/test-goodnotes.mjs
node scripts/test-ink-engine.mjs
npm run build:check
```

`/ink-lab.html` içindeki **Motoru doğrula** yalnızca geliştirme laboratuvarında
sentetik pen olayları gönderir: altı şekli, basılı sürüklemeyi, yabancı işaretçiyi,
pointercancel'i ve geri al/ileri alı gerçek React tuval işleyicileriyle sınar.
Laboratuvar defterlere kaydetmez. Apple Pencil basıncı, palm rejection ve gerçek
ekran gecikmesi sentetik testlerle kanıtlanamaz; fiziksel cihaz testi gerekir.

## Tasarım referansları

- [Goodnotes Pen Tool](https://support.goodnotes.com/hc/en-us/articles/7353756785679-Write-and-customize-ink-with-the-Pen-tool)
- [Goodnotes Shape Tool](https://support.goodnotes.com/hc/en-us/articles/13682939148943-Draw-shapes-and-build-diagrams-in-Goodnotes)
- [perfect-freehand: merkez çizgisi ve kontur ayrımı](https://github.com/steveruizok/perfect-freehand)
- [tldraw: araç/durum makinesi ayrımı](https://tldraw.dev/docs/tools)
- [GoodNotes-Ink: bağımsız kalem motoru yaklaşımı](https://github.com/connectedGraph/goodnotes-ink)

Bu projelerden kaynak kodu kopyalanmamıştır; uygulama bu depoda bağımsız yazılmıştır.

## iPad / Apple Pencil cihaz kabul testi

`ink-lab.html?deviceTest=1` geçici çizim alanında güncel ve önceki konum filtresini aynı fırça ile karşılaştırır. Cihaz paneli basınç aralığını, kabul edilen gerçek girdi örneklerini, filtre sapmasını ve tarayıcı işleme/Canvas sürelerini kaydeder. Sentetik motor doğrulaması bu ölçümlere katılmaz; fare örnekleri `mouse`, Pencil örnekleri tarayıcının bildirdiği `pen` olarak raporlanır. Her dağılımın son 4096 gözlemi tutulur; yüzdelikler pointer işleyicisi dışında hesaplanır.

İki modda paneldeki beş görevi yapıp öznel yazım hissini ayrı ayrı not edin ve JSON raporu indirin. Modlar yalnızca konum filtresini değiştirir; bu test doğrudan Goodnotes karşılaştırması değildir. Veriler sayfa belleğindedir, yenileme öncesi indirilmelidir. HTTP bağlantısında coalesced/predicted API desteği tarayıcı tarafından kısıtlanabilir. Örnekten Canvas tamamlanmasına kadar geçen süre fiziksel ekran gecikmesini ölçmez; cihazda hissedilen gecikme ayrıca değerlendirilmelidir.

Ölçüm birim testi: `node scripts/test-device-session.mjs`.
