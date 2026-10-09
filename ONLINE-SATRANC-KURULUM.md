# Online Satranç Yönetimi — Kurulum

Güncel mimari ve veri geçişi için [`SISTEM-MIMARISI.md`](./SISTEM-MIMARISI.md)
belgesindeki yayın sırasını izleyin.

## Firebase hazırlığı

1. Firebase Authentication içinde **Email/Password** yöntemini etkinleştirin.
2. Öğretmen hesabını Firebase Authentication kullanıcıları arasına ekleyin.
3. Functions yayınında `TEACHER_EMAIL` istendiğinde bu hesabın e-postasını girin.
4. Anonymous Authentication bu yeni sistem için gerekli değildir.

## Sunucu işlevleri

| İşlev | Görevi |
| --- | --- |
| `bootstrapTeacher` | Doğrulanmış öğretmen hesabına öğretmen rolü verir |
| `saveClass` | Sınıfı, öğrenci numaralarını ve özetlenmiş parolayı kaydeder |
| `deleteClass` | Sınıfın özel giriş ve öğrenci dizin kayıtlarını temizler |
| `loginClass` | Sınıf parolasını sunucuda doğrular ve sınıf tokenı üretir |
| `loginChessGuest` | Ad soyadla yalnız canlı satranç erişimi olan misafir tokenı üretir |
| `loginStudent` | Öğrenci numarasını sunucuda doğrular ve öğrenci tokenı üretir |
| `archiveLiveChessGame` | Biten canlı oyunu öğrenci ve sınıf raporlarına kaydeder |

İşlevleri yayınlama:

```bash
firebase deploy --only functions
```

## Sınıf geçişi

Yeni kurallar yayınlanmadan önce öğretmen hesabıyla siteye girin. **Sınıflar**
sayfasında her sınıfı düzenleyerek:

- En az 6 karakterli sınıf şifresi belirleyin.
- Öğrenci listesini `öğrenci numarası<TAB>ad soyad` biçiminde kaydedin.
- Kartta “Güvenli giriş hazır” durumunu doğrulayın.

Ardından kuralları yayınlayın:

```bash
firebase deploy --only firestore:rules
```

## Kontrol listesi

- Öğretmen girişi Atölye ve Sınıflar sayfasını açıyor.
- Sınıf hesabı yalnız kendi sınıf çalışma alanını açıyor.
- Satranç dersi doğru sınıf listesiyle açılıyor.
- Sınıf maçları ve turnuvaları Satranç Yönetimi ekranına geliyor.
- `?view=satranc` bağlantısı ad soyadla giriş açıyor; öğrenci numarası istemiyor.
- Solda oyun istekleri ve yeni oyun formu, sağda başlayan canlı oyunlar görünüyor.
- İki oyuncu katıldıktan sonra biri “Oyunu başlat” dediğinde oyun ve saat başlıyor.
- Süre, ek süre, renk, görünürlük ve beraberlik teklifi seçimi oyuna uygulanıyor.
- Misafir oturumları sınıf kayıtlarına ve öğrenci listelerine erişemiyor.
- Kayıtlı öğrencilerin biten oyunları ilgili sınıf raporuna ekleniyor; misafirler için sınıf raporu oluşturulmuyor.
- Firestore istemciden `classCredentials` ve `studentLookup` okumayı reddediyor.
