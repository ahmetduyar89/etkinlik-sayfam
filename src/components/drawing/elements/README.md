# Özgün öğe koleksiyonu

42 yerel öğe: 16 PNG sticker, 6 GIF, 8 PNG çalışma kartı ve 12 PNG matematik sembolü. Çizimler, kart metinleri ve animasyonlar `scripts/generate-elements.py` ile oluşturulur; dışarıdan medya veya kullanıcı çizimi kullanılmaz. PNG ve GIF dosyaları şeffaf kenarlıdır. Yeniden üretim Pillow ve macOS Arial yazı tiplerini gerektirir.

`ElementsPanel` tür sekmeleri, Türkçe arama, kategoriler, favoriler ve son kullanılanları sunar. Favori/son öğe kimlikleri tarayıcıda saklanır; kişisel medya veya telemetri yüklenmez. `onInsertElement` mevcut `insertImage` yolunu kullanır; görsel standart resim nesnesi olarak taşınır, boyutlandırılır, döndürülür, silinir ve kaydedilir. Kart metinleri resmin parçasıdır; metin kutusu gibi düzenlenmez.

GIF önizlemeleri gerçek GIF dosyalarıdır. Canvas'ta tarayıcının GIF karelerini drawImage ile güncellemesine güvenilmez; aynı özgün karelerden üretilen PNG şeridi, `strokeRenderer` içinde zamanla örneklenir. GIF kimlikleri mevcut canlı nesne döngüsüne katılır; yalnızca GIF olan sayfalarda çizim 80 ms aralıkla yapılır ve sekme gizliyken durur. Hareket azaltma tercihi açıksa ilk kare statik tampona girer, GIF için animasyon döngüsü çalışmaz. PNG/PDF çıktısı o anda işlenen tek kareyi içerir.

Varlıklar `public/elements` altında sürümlenmiş, aynı kaynaktan sunulan yerel kaynaklardır; kayıtlı sayfadaki resim nesnesi bu yolu tutar. Kayıtları başka projeye taşırken bu varlıklar da korunmalıdır.

Doğrulama: `node scripts/test-elements.mjs`. Laboratuvarda “Öğeleri doğrula” düğmesi gerçek tuvalde ekleme, GIF piksel değişimi ve geri al/ileri al akışını denetler.
