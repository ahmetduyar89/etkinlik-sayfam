# Sihirli Termometre

Çocuklar için termoskop deneyi. React 19 + Vite 7 + TypeScript +
Tailwind CSS 4 + GSAP ile kurulmuş tek sayfalık uygulama.

## Çalıştırma

```bash
npm install
npm run dev        # geliştirme sunucusu
npm run build      # tip kontrolü + üretim derlemesi
npm run typecheck  # yalnızca tip kontrolü
```

## Görsel dil

Kalın lacivert konturlar, düz canlı renkler ve yuvarlak köşeler: boyama
kitabı çıkartması gibi. Düğmeler basınca aşağı iniyor (`.pushable`),
kutuların altında kalın bir gölge var (`.chunky`).

- **Tipografi:** başlıklar ve rakamlar Fredoka, gövde metni Nunito.
- **Renkler:** lacivert `#182b4d`, kırmızı su `#e23b2e`, mor kapak `#7b5be6`,
  sarı oyun hamuru `#ffc93c`, turkuaz `#2ba6c9`, mor düğme `#7b5be6`.
- **Vurgu rengi** sıcaklıkla değişir: turkuaz → yeşil → sarı → kırmızı.
  `--thermal` dolgu ve kenarlıklarda, `--thermal-ink` ise metinde kullanılır;
  sarı gibi açık tonlar beyaz zeminde okunmadığı için ikinciye ihtiyaç var.

Şişenin bir yüzü var. Gözleri arada bir kırpıyor; ağzı ısınırken şaşkın
"o" oluyor, soğurken titriyor, dengede gülümsüyor. Isınırken yanakları
kızarıyor ve içinde kabarcıklar yükseliyor; soğurken kaba buz taneleri
düşüyor. Bunların hepsi `Thermoscope.tsx` içinde, gidişata (`trend`)
bağlı GSAP tween'leriyle sürülüyor.

## Dosya düzeni

```
src/
├── App.tsx                      İki sütunlu düzen: sahne + panel
├── components/
│   ├── SimulationStage.tsx      Sol taraftaki geniş simülasyon alanı
│   ├── Thermoscope.tsx          Termoskop düzeneğinin SVG'si
│   ├── ConceptCard.tsx          Genleşme / büzülme bilgi kartı
│   ├── ControlPanel.tsx         Sağ taraftaki kontrol paneli
│   └── TemperatureSlider.tsx    0–100 °C aralığında kaydırıcı
├── hooks/
│   ├── useSimulation.ts         Ortam sıcaklığı, hazır ortamlar, okumalar
│   └── useLevelMarkers.ts       Keçeli kalem işaretleri
├── lib/
│   ├── constants.ts             Sıcaklık aralığı, hazır ortamlar, metinler
│   ├── motion.ts                Hareket azaltma tercihi
│   ├── thermoscope.ts           SVG geometrisi, id sabitleri, seviye hesabı
│   └── thermal.ts               Sıcaklık → renk dönüşümü, biçimlendirme
└── types/simulation.ts          Tüm tip tanımları
```

## Genişletme noktaları

- **Yeni bir hazır ortam:** `lib/constants.ts` içindeki `ENVIRONMENT_PRESETS`
  dizisine bir kayıt ekleyin, `PresetId` birleşim tipini güncelleyin. Düğme
  panelde kendiliğinden görünür.
- **Kendi görselinizi koymak:** `SimulationStage.tsx` içindeki SVG'yi
  değiştirin. Bileşen yalnızca `state` alır, mantık içermez.
- **Farklı fizik modeli:** `useSimulation.ts` içindeki `step` fonksiyonunu
  değiştirin. `transferRate` seçeneği ısı transfer hızını belirler.
- **Vurgu rengi:** Arayüz `--thermal` CSS değişkenini kullanır; bu değişken
  `App.tsx` içinde ölçülen sıcaklığa göre güncellenir.

## Animasyon: genleşme ve büzülme

Yumuşatmanın tek sahibi GSAP'tir. React tarafında `ambientTemperature`
kullanıcı komutuyla anında değişir; `Thermoscope` bu değişimi `useGSAP` ile
yakalar ve sütunu yeni seviyesine `ease: "power2.out"` ile taşır. Tween
ilerledikçe `onTemperatureChange` her karede çağrılır, okumalar ve arayüzün
vurgu rengi bu değerden beslenir.

```tsx
useGSAP(() => {
  const target = pipetteLevelFromTemperature(ambientTemperature);
  gsap.to(proxy, {
    level: target,
    duration: expansionDuration(target - proxy.level),
    ease: "power2.out",
    overwrite: true,
    onUpdate: () => applyLevel(proxy.level),
  });
}, { dependencies: [ambientTemperature], scope: rootRef });
```

Tween doğrudan `rect` yerine bir vekil nesnenin `level` alanını sürer;
`onUpdate` bu tek değerden hem sütunun `y` ve `height` değerlerini, hem
menisküsü, hem de seviye okunu yazar. Üçü böylece kare kare senkron kalır.
`scaleY` yerine `height` kullanılır: sütun kırpma maskesiyle çizildiği için
ölçekleme kenarları bozar, yükseklik bozmaz.

Süre mesafeye göre 0,45–2,1 saniye arasında değişir (`expansionDuration`).
İşletim sisteminde hareket azaltma açıksa süre sıfırlanır.

### Ölçek

| Sıcaklık | Sütun | Karşılığı |
| --- | --- | --- |
| 0 °C (buzlu su) | %26 | Kapağın hemen üstü |
| 25 °C (oda) | %50 | Pipetin tam ortası |
| 85 °C (sıcak su) | %87 | Pipetin üst kısmı |

Ölçek kasıtlı olarak doğrusal değil: oda sıcaklığı ortaya denk gelsin diye
0–25 °C aralığı, 25–100 °C aralığıyla pipeti yarı yarıya paylaşır. Gerçek
oranı isterseniz `pipetteLevelFromTemperature` tek başına yeter.

## Seviye işaretleri

`useLevelMarkers`, sıvının bulunduğu yüksekliğe keçeli kalemle çizilmiş gibi
yatay bir çizgi bırakır. Seviye React state'inden değil, `getLiquidY()` ile
animasyonun o anki konumundan okunur; bu yüzden tween ortasında da doğru yeri
işaretler. Çizgi soldan sağa uzayarak belirir, yanına o seviyenin karşılık
geldiği sıcaklık yazılır.

```tsx
const thermoscope = useRef<ThermoscopeHandle>(null);
const { markers, markCurrentLevel, clearMarkers } = useLevelMarkers(thermoscope);
```

`markCurrentLevel()` oluşturduğu işareti döndürür; var olan bir işaretin 6
birim yakınına düşerse üst üste binmesin diye `null` döner. Tek tek silmek
için `removeMarker(id)` vardır.

Deneyin klasik akışı: oda sıcaklığında işaretle, buzlu suya koy, yeni seviyeyi
işaretle, sıcak suya koy, tekrar işaretle. Üç çizgi arasındaki mesafe suyun
genleşme miktarını gösterir.

## Bilgi kartı

`ConceptCard`, sütun hareket ettiği sürece simülasyon alanının sol alt
köşesinde durur. Yükselirken genleşmeyi, alçalırken büzülmeyi anlatır.
Belirsizden belirgine gelir (`opacity` 0 → 1, 12 birim yukarı kayarak,
`power2.out`), denge kurulduktan 1,6 saniye sonra solar.

Metin `stable` durumunda değişmez; kart eski metniyle solar, yarı yolda
içerik değiştirmez. `role="status"` ve `aria-live="polite"` sayesinde ekran
okuyucular da değişimi duyurur. Metinleri `lib/constants.ts` içindeki
`CONCEPT_NOTES` tutar.

## GSAP kancaları

SVG'deki elemanlara hem `id` ile hem `ref` ile erişilebilir.

| id | Eleman | Animasyona uygun nitelikler |
| --- | --- | --- |
| `#outer-water` | Dış kaptaki su | `y`, `height`, `fill`, `opacity` |
| `#outer-water-surface` | Dış kabın su yüzeyi | `y1`, `y2`, `stroke` |
| `#bottle-liquid` | Şişedeki renklendirilmiş su | `y`, `height` |
| `#pipette-liquid` | Pipetteki sıvı sütunu | `y`, `height` |
| `#pipette-meniscus` | Sütunun tepesi | `cy` |
| `#level-marker` | Anlık seviye oku | `transform` |
| `#reference-level` | Oda sıcaklığı çizgisi | `y1`, `y2` |
| `#marker-layer` | İşaret katmanı | — |

Seviyeleri elle hesaplamak yerine `lib/thermoscope.ts` içindeki yardımcıları
kullanın; `columnRect` çıktısı doğrudan GSAP'in `attr` eklentisine verilebilir:

```ts
gsap.to("#pipette-liquid", {
  attr: columnRect(PIPETTE_COLUMN, 0.8),
  duration: 1.4,
  ease: "power2.out",
});
```

Kendi zaman çizelgenizi kuracaksanız `SimulationStage`'e `externalAnimation`
verin; bileşen kendi tween'ini kurmaz ve nitelikleri size bırakır:

```tsx
<SimulationStage state={state} thermoscopeRef={thermoscope} externalAnimation />
```
