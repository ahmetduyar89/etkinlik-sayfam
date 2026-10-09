# Satranç Eğitimi — Kullanım Kılavuzu

*Hazırlayan: Ahmet DUYAR*

Bu uygulama **internet gerektirmez**, **kurulum istemez** ve **ücretsizdir**.
Aşağıda üç kullanım yolu var. Çoğu kişi için **1. yol** yeterlidir.

---

## 1. yol — Tek dosya (EN KOLAY, tavsiye edilen)

Sınıfta, evde, USB bellekte — her yerde çalışır.

**`SatrancOkulu.html`** dosyasına **çift tıkla.** Hepsi bu.

- ✅ Sunucu gerekmez
- ✅ İnternet gerekmez
- ✅ Kurulum gerekmez
- ✅ Windows, Mac, Linux — hepsinde aynı
- ✅ Tek dosya (yaklaşık 1 MB), USB'ye kolayca sığar

### Başka bilgisayara taşımak

Sadece **`SatrancOkulu.html`** dosyasını kopyala. Başka hiçbir şeye gerek yok:

- USB belleğe at → okul bilgisayarında çift tıkla
- Kendine e-posta ile gönder → indirip aç
- WhatsApp/Drive ile paylaş → indirip aç

> **İpucu:** Dosyaya sağ tıklayıp *"Birlikte aç → Google Chrome"* seçersen
> her zaman aynı tarayıcıda açılır.

### Akıllı tahtada kullanmak

1. USB belleği akıllı tahtaya tak
2. `SatrancOkulu.html` dosyasına çift tıkla
3. Tarayıcıda **F11** ile tam ekran yap
4. Ders programından o haftanın dersini aç

### İki öğrenciyi tahtaya kaldırmak

Sol menüdeki **İki Kişilik Oyun** bölümü sınıf içi karşılaşmalar içindir:

1. **Düzen** seç: *İki Tahta* (yan yana, her oyuncu kendi gözünden) ya da
   *Tek Tahta* (iki oyuncu aynı tahtayı paylaşır).
2. Tahta **boş** gelir. Paletten taş seçip kareye dokunarak taşları
   öğrenciler dizer. Hazır kuruluş için **Standart Diziliş** düğmesi vardır.
3. **Satranç saati** seç: *Süresiz*, *5 dk*, *10 dk*, *15+10* ya da **Özel**
   (istediğin süreyi dakika olarak belirleyebilir, istersen hamle başına ekleme
   saniyesi de ekleyebilirsin).
4. Oyuncuları seç, kimin başlayacağını belirle ve **Oyunu Başlat**'a bas.
   Üst çubukta bir **sınıf seçiliyse** oyuncular o sınıfın listesinden seçilir
   ve oyun bitince sonuç iki öğrencinin kaydına otomatik işlenir. Sınıf
   seçili değilse ad elle yazılır, sonuç kaydedilmez.
5. İki tahta düzeninde birinde yapılan hamle diğerinde anında görünür;
   sırası gelen oyuncunun tahtası yeşil çerçeveyle belirginleşir.

Tahtaların üstündeki **skor tahtası** üç şey gösterir:

- **İki saat.** Yalnızca sırası gelen oyuncunun saati işler; hamle yapılınca
  saat rakibe geçer. Son 1 dakikada saat sararır, son 10 saniyede kızarır ve
  saliseleri gösterir. Süresi biten oyunu kaybeder — ama rakibinde mat edecek
  taş kalmamışsa oyun beraberlikle biter (FIDE kuralı).
- **Materyal farkı.** Piyon 1, at ve fil 3, kale 5, vezir 9 puandır; rozet
  hangi tarafın kaç puan önde olduğunu yazar. Alınan taş şeridinde de her
  oyuncunun topladığı puan görünür.
- **Maç skoru.** Arka arkaya oynanan oyunlar turnuvadaki gibi toplanır:
  kazanan 1, beraberlik ½ puan. *Aynı Dizilişle Yeniden* skoru sürdürür,
  *Yeni Diziliş* sıfırlar.

Araç çubuğundaki ⏸ düğmesi saati duraklatır (o sırada tahtalar kilitlenir),
⛶ düğmesi menüyü gizleyip tahtaları büyütür (Esc ile çıkılır).
Oyun panelindeki **Beyaz/Siyah pes etti** ve **Beraberlik** düğmeleri, motorun
kendi bulamayacağı sonuçlar içindir. Bitmiş oyunda hamle geri alınırsa kayıt da
geri alınır.

### Sınıflar ve öğrenciler

**Okul listesi uygulamada hazır gelir.** Her bilgisayarda bir kez:
**Sınıflarım** → *Okul listesi hazır* kartına öğretmen şifresini yaz →
**Listeyi Yükle**. Bütün sınıflar ve öğrenciler gelir; üst çubuktan o
bilgisayarın sınıfını seç. Liste şifreli olduğu için siteyi açan başkası
öğrenci adlarını göremez.

Liste değişince (yeni öğrenci, yeni şube) e-Okul'dan yeni *Şube Mevcut
Listesi* Excel'ini indir ve şunu çalıştır, sonra değişiklikleri GitHub'a gönder:

```bash
python3 tools/sinif-listesi-gom.py ~/Downloads/Şube_Mevcut_Listesi.xlsx
```

Bilgisayarlarda *Güncel okul listesi var* kartı çıkar; şifre girilince yalnızca
yeni sınıf ve öğrenciler eklenir, maç ve turnuva kayıtları silinmez. Araç
şifreyi her çalıştırmada sorar; farklı bir şifre yazarsan yeni şifre geçerli olur.

Sol menüdeki **Sınıflarım** bölümünde ayrıca:

1. **Sınıf Ekle** ile sınıfı oluştur (örn. *4-B*).
2. Öğrencileri tek tek yaz ya da **Liste Yapıştır** ile e-Okul/Excel listesini
   yapıştır. Satır başındaki numaralar atılır, BÜYÜK HARF adlar düzeltilir,
   listede zaten olan ad tekrar eklenmez.
3. Sıralama tablosu tüm maçlardan (iki kişilik oyun, turnuva, elle girilen)
   hesaplanır: galibiyet 1, beraberlik ½ puan. Öğrenciye dokununca maç geçmişi
   açılır; yanlış bir kaydı oradan silebilirsin.
4. Gerçek tahtada oynanan maçı **Maç Sonucu Gir** kartından kaydedebilirsin.

Seçili sınıf üst çubukta görünür ve oradan değiştirilebilir. İki Kişilik Oyun
ve Turnuva hep bu sınıfla çalışır.

**Veriler nerede?** Sınıf kayıtları kullanılan bilgisayarın tarayıcısında
durur. Her sınıfın bilgisayarında o sınıfın verileri kalır. Uygulama
güncellense de kayıtlar silinmez; ama tarayıcı verileri temizlenirse silinir.
Bu yüzden ara sıra **Yedekle** ile dosya al; başka bilgisayara taşımak için
orada **Geri Yükle** kullan (geri yükleme o bilgisayardaki sınıf kayıtlarının
yerine geçer).

### Öğretmen ve öğrenci modu

Üst çubuktaki **Öğretmen / Öğrenci** seçimi aynı bilgisayarı güvenle paylaşmayı
kolaylaştırır:

- **Öğretmen** modunda sınıf, turnuva ve rapor araçları görünür.
- **Öğrenci** modunda yönetim araçları gizlenir ve üst çubuktan öğrenci seçilir.
- Her öğrencinin XP, yıldız, rozet, ders, bulmaca, oyun ve mini oyun ilerlemesi
  ayrı bir profilde tutulur.
- Öğretmen modundaki eski ilerleme kaydı korunur; güncellemeden sonra otomatik
  olarak **Öğretmen** profiline taşınır.
- **Raporlar** ekranı seçili sınıfın maçlarını, turnuvalarını ve öğrenci
  profillerindeki XP/ders ilerlemesini birlikte gösterir.

### Bugünkü Çalışmam

Öğrenci modundaki **Bugünkü Çalışmam** bölümü her gün beş bulmacalık kısa bir
set hazırlar. Sistem, öğrencinin yanlış yaptığı, ipucu kullandığı veya henüz
çalışmadığı konulara öncelik verir. Çocuk geliştikçe önerilen konular da
kendiliğinden değişir. Öğretmen, **Raporlar → Bulmaca konuları** bölümünde
sınıfın tema bazındaki doğru, yanlış ve ipucu sayılarını görebilir.

### Turnuva (İsviçre sistemi)

Sol menüdeki **Turnuva** bölümü seçili sınıfla çalışır:

1. Turnuva adını yaz, katılacak öğrencileri işaretle. Tur sayısı otomatik
   önerilir (9 oyuncu → 5 tur), istersen değiştir.
2. **Turnuvayı Oluştur** ile 1. tur eşleşir. İlk tur kurayla belirlenir.
3. Her masanın sonucunu **1-0 / ½-½ / 0-1** düğmeleriyle gir ya da
   **Tahtada Oyna** ile İki Kişilik Oyun ekranında oynat; oyun bitince sonuç
   masaya kendiliğinden yazılır (**Turnuvaya Dön** ile geri gelinir).
4. Turun bütün sonuçları girilince **Sonraki Turu Eşleştir**. Eşit puanlılar
   birbiriyle eşleşir, aynı iki öğrenci tekrar karşılaşmaz, renkler dengelenir.
   Tek sayıda oyuncu varsa bir öğrenci **bay** geçer ve 1 puan alır (kimse
   ikinci kez bay almaz).
5. **Puan Tablosu** puan → Buchholz (rakiplerin puan toplamı) → galibiyet
   sırasıyla dizilir. Son tur bitince **Turnuvayı Bitir** ile kürsü görünür.

Yanlış eşleştirmede **Son Turu Geri Al** kullanılabilir. Turnuvadan ayrılan
öğrenci için tabloda **Çekildi**, sonradan gelen için **Öğrenci ekle** vardır.
Çok küçük gruplarda (5-6 kişi, 4 tur) tekrar eşleşme kaçınılmaz olabilir;
o durumda en az tekrarlı eşleşme seçilir.

---

## 2. yol — Klasörü açmak (geliştirme sürümü)

Kaynak kodu düzenlemek istiyorsan bu yolu kullan.

> ⚠️ **`index.html` dosyasına çift tıklamak ÇALIŞMAZ.**
> Uygulama 54 ayrı JavaScript modülünden oluşur ve tarayıcılar güvenlik gereği
> `file://` üzerinden modül yüklemeyi engeller. Bu yüzden küçük bir yerel
> sunucu gerekir — aşağıdaki başlatıcılar bunu senin için yapar.

### Mac

**`Baslat-Mac.command`** dosyasına çift tıkla. Tarayıcı kendiliğinden açılır.

> İlk açılışta macOS "geliştirici doğrulanamadı" diyebilir.
> Çözüm: dosyaya **sağ tık → Aç** de, sonra çıkan pencerede yine **Aç**'a bas.
> Bunu bir kez yapman yeterli.

### Windows

**`Baslat-Windows.bat`** dosyasına çift tıkla. Tarayıcı kendiliğinden açılır.

> Python kurulu değilse uyarı verir. O durumda 1. yolu (tek dosya) kullan.

### Kapatmak

Açılan siyah pencereyi kapat, ya da içindeyken **Ctrl + C** bas.

---

## 3. yol — İnternete koymak (isteğe bağlı)

Öğrenciler evden de girsin istersen, klasörün tamamını ücretsiz bir statik
site servisine yükleyebilirsin (GitHub Pages, Netlify, Cloudflare Pages).
Uygulama tamamen istemci taraflıdır; veritabanı ya da sunucu kodu gerekmez.

---

## Sık sorulanlar

**İnternet olmadan çalışır mı?**
Evet. Hiçbir bölüm internet kullanmaz. Satranç motoru, 1120 bulmaca ve tüm
dersler uygulamanın içindedir.

**Öğrencilerin ilerlemesi nerede saklanıyor?**
Kullanılan bilgisayarın tarayıcısında (localStorage). Yani ilerleme **o
bilgisayara** özeldir; başka bilgisayarda sıfırdan başlar. Tarayıcı geçmişi
temizlenirse ilerleme de silinir.

**Aynı bilgisayarda birden çok öğrenci varsa?**
Üst çubuktan **Öğrenci** moduna geç ve öğrencinin adını seç. Her öğrencinin
ilerlemesi ayrı tutulur; tarayıcı profili değiştirmeye veya önceki ilerlemeyi
sıfırlamaya gerek yoktur.

**Ses çıkmıyor.**
Tarayıcılar, sayfaya ilk kez tıklanmadan ses çalmaya izin vermez. Ekranda
herhangi bir yere bir kez tıkla. Ayrıca *Ayarlar*'dan "Ses efektleri" ve
"Sesli anlatım" açık olmalı.

**Sesli anlatım okumuyor.**
Sesli anlatım işletim sisteminin Türkçe ses paketini kullanır. Windows'ta
*Ayarlar → Saat ve Dil → Konuşma* bölümünden Türkçe ses eklemek gerekebilir.

**Yazı çok küçük / büyük.**
Tarayıcıda **Ctrl + artı** (Mac'te **Cmd + artı**) ile büyüt, **Ctrl + eksi**
ile küçült. Akıllı tahtada büyütmek okunabilirliği çok artırır.

**Kodda değişiklik yaptım ama görünmüyor.**
Tarayıcı dosyaları önbelleğe almış olabilir. **Ctrl + Shift + R**
(Mac'te **Cmd + Shift + R**) ile sayfayı zorla yenile.

**Tek dosya sürümünü nasıl güncellerim?**
`src/` altında değişiklik yaptıktan sonra şu komutu çalıştır:

```bash
node tools/build-tek-dosya.mjs
```

`SatrancOkulu.html` yeniden üretilir.

---

## Ders programı nasıl kullanılır?

Uygulama **36 haftalık** bir programa göre düzenlenmiştir (haftada 1 ders saati).

1. Uygulamayı aç — ana sayfada **"bu haftanın dersi"** kartı seni karşılar
2. **Dersi Aç**'a bas
3. Karşına 40 dakikalık ders planı gelir:
   - **Kazanım** — dersin hedefi
   - **Isınma (5 dk)** — sınıfa soracağın soru
   - **Anlatım (10 dk)** — tahtada anlatacağın maddeler
   - **Uygulama (20 dk)** — renkli düğmeler, tek tıkla alıştırmayı açar
   - **Kapanış (5 dk)** — kontrol sorusu ve cevabı
4. Ders bitince **"Bu haftayı tamamladım"**a bas

Belirli bir haftaya doğrudan gitmek için: **Ders Programı** menüsünden
istediğin hafta kartına tıkla.

## Oyun arşivi ve inceleme

Bilgisayara karşı tamamlanan oyunlar, o anda seçili olan öğretmen veya öğrenci profiline otomatik kaydedilir. **Gelişimim → Oyun Arşivim** ekranında sonuç, zorluk, renk, süre ve doğruluk bilgisi görülebilir. **Hamleleri incele** ile oyun tahta üzerinde ileri-geri oynatılır; öğrencinin analiz edilen hamlelerinde kalite etiketi ve öğretmen önerisi gösterilir. İstenirse oyun standart `.pgn` dosyası olarak indirilebilir. Her profil için son 100 oyun saklanır ve sınıf yedeğine dahildir.
