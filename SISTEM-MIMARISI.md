# Atölye sistemi — hedef mimari ve geçiş

Bu depo artık üç doğrulanmış oturum türü kullanır:

| Rol | Giriş | Yetki |
| --- | --- | --- |
| Öğretmen | Firebase e-posta/parola | Tüm sınıflar, içerikler ve raporlar |
| Sınıf | Sınıf kullanıcı adı/parolası | Yalnız kendi sınıf kaydı ve çalışmaları |
| Öğrenci | Okul genelinde benzersiz öğrenci numarası | Kendi kimliğiyle canlı satranç |

Sınıf parolaları `classes` belgelerinde tutulmaz. `classCredentials` koleksiyonu
yalnız Cloud Functions tarafından okunabilir ve parola `scrypt` özeti olarak saklanır.
Öğrenci numarası dizini olan `studentLookup` da istemcilere kapalıdır.

## Ana akış

```text
Giriş
├── Öğretmen → Atölye → Sınıflar / içerikler / raporlar
├── Sınıf     → yalnız kendi çalışma alanı
└── Öğrenci   → öğrenci numarası → canlı satranç salonu
```

Canlı satranç koltukları doğrulanmış `studentId` ve `classId` taşır. Oyun ilk kez
bittiğinde `archiveLiveChessGame` işlevi sonucu `liveChessGames` koleksiyonuna
ve ilgili sınıfların `chess_matches` kayıtlarına yazar.

## Güvenlik sınırları

- `teachers`: yalnız ilgili öğretmen.
- `classes`: öğretmen tümünü, sınıf yalnız kendi belgesini görür.
- `classCredentials`, `studentLookup`: bütün istemcilere kapalı.
- İçerikler: paylaşım bağlantıları için okunabilir, yalnız öğretmen yazabilir.
- Sınıf satranç kayıtları: öğretmen tümünü, sınıf yalnız kendi `classId` verisini görür.
- Canlı satranç: yalnız doğrulanmış öğretmen, sınıf veya öğrenci oturumu.

## İlk yayın sırası

Canlı sistemi kilitlememek için sıra önemlidir:

1. Firebase Authentication'da **Email/Password** yöntemini etkinleştirin.
2. `TEACHER_EMAIL` Functions parametresini öğretmen hesabının e-postası olarak tanımlayın.
3. Önce Functions'ı yayınlayın.
4. Siteyi yayınlayıp öğretmen hesabıyla bir kez giriş yapın. Bu işlem öğretmen rolünü oluşturur.
5. **Sınıflar** sayfasında her eski sınıfı düzenleyin:
   - En az 6 karakterli yeni sınıf şifresi belirleyin.
   - Öğrencileri `numara<TAB>ad soyad` biçiminde kaydedin.
6. Bütün sınıf kartlarında “Güvenli giriş hazır” göründüğünü doğrulayın.
7. Son olarak yeni `firestore.rules` dosyasını yayınlayın.

Örnek yayın komutları:

```bash
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## Eski veri geçişi

- Mevcut sınıf ve öğrenci adları silinmez.
- Öğrenci numarası bulunmayan kayıt sınıf içinde görünmeye devam eder.
- Numara eklenmeyen öğrenci canlı satranca giriş yapamaz.
- Eski `password` alanı yeni giriş sisteminde kullanılmaz.
- Sınıf düzenlenip kaydedildiğinde güvenli kimlik belgesi ve öğrenci numarası dizini üretilir.

## Yerel çalışma

Ana uygulama:

```bash
npm run dev
```

Sunucu işlevlerinin sözdizimi kontrolü:

```bash
npm --prefix functions run check
```

Yerelde tam giriş testi için Firebase Emulator Suite veya yayımlanmış Functions gerekir.
