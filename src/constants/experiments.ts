// src/constants/experiments.ts — Küçük Mucitler Deney Kataloğu
export interface ExperimentItem {
    id: string;
    file: string;
    title: string;
    category: string;
    icon: string;
    summary: string;
}

export const EXPERIMENTS_CATALOG: ExperimentItem[] = [
    {
        id: 'basit-pusula',
        file: 'basit-pusula.html',
        title: 'Basit Pusula Yapımı',
        category: 'Manyetizma',
        icon: '🧭',
        summary: 'İğne ve su ile kuzeyi gösteren doğal pusula simülasyonu.',
    },
    {
        id: 'isildayan-devre',
        file: 'isildayan-devre.html',
        title: 'Işıldayan Devre: İletken Dedektifi',
        category: 'Elektrik',
        icon: '💡',
        summary: 'Maddelerin iletken ve yalıtkanlığını test eden interaktif devre.',
    },
    {
        id: 'termometre',
        file: 'termometre.html',
        title: 'Sihirli Termometre',
        category: 'Isı & Sıcaklık',
        icon: '🌡️',
        summary: 'Sıvıların genleşme prensibiyle çalışan el yapımı termometre.',
    },
    {
        id: 'renk-kulesi',
        file: 'renk-kulesi.html',
        title: 'Sihirli Renk Kulesi (Yoğunluk)',
        category: 'Madde & Yoğunluk',
        icon: '🧪',
        summary: 'Farklı yoğunluktaki sıvıların üst üste sıralanması.',
    },
    {
        id: 'surtunme-kuvveti',
        file: 'surtunme-kuvveti.html',
        title: 'Sürtünme Kuvveti: Yüzeyler Yarışıyor',
        category: 'Kuvvet & Hareket',
        icon: '🏎️',
        summary: 'Farklı zeminlerde cisimlerin kayma hızları ve sürtünme etkisi.',
    },
    {
        id: 'balonlu-itme-araci',
        file: 'balonlu-itme-araci.html',
        title: 'Balonlu İtme Aracı (Etki-Tepki)',
        category: 'Kuvvet & Hareket',
        icon: '🚀',
        summary: 'Havanın geri itme kuvvetiyle hareket eden roket araba.',
    },
    {
        id: 'miknatisli-balik-tutma',
        file: 'miknatisli-balik-tutma.html',
        title: 'Mıknatıslı Balık Tutma',
        category: 'Manyetizma',
        icon: '🎣',
        summary: 'Manyetik çekim kuvveti ile nesneleri sınıflandırma.',
    },
    {
        id: 'golge-oyunu',
        file: 'golge-oyunu.html',
        title: 'Gölge Oyunu: Sihirli Kukla',
        category: 'Işık & Gölgeler',
        icon: '🎭',
        summary: 'Işık kaynağına olan mesafeye göre gölge boyutunun değişimi.',
    },
    {
        id: 'gunes-ve-golge',
        file: 'gunes-ve-golge.html',
        title: 'Gölgem Değişiyor mu? (Güneş ve Gölge)',
        category: 'Işık & Astronomi',
        icon: '☀️',
        summary: 'Günün saatlerine göre gölge boyu ve yönünün değişimi.',
    },
    {
        id: 'bardaktaki-su-dokulmuyor',
        file: 'bardaktaki-su-dokulmuyor.html',
        title: 'Bardaktaki Su Dökülmüyor',
        category: 'Hava Basıncı',
        icon: '🥛',
        summary: 'Açık hava basıncının sıvıları tutma gücü.',
    },
    {
        id: 'basinc-uzmani-pipetler',
        file: 'basinc-uzmani-pipetler.html',
        title: 'Basınç Uzmanı Pipetler',
        category: 'Hava Basıncı',
        icon: '🥤',
        summary: 'Hava sıkışması ve basınç odaklaması ile deney.',
    },
    {
        id: 'balonu-sisiren-gaz',
        file: 'balonu-sisiren-gaz.html',
        title: 'Balonu Şişiren Gaz (Kimyasal Tepkime)',
        category: 'Kimya',
        icon: '🎈',
        summary: 'Sirke ve karbonat tepkimesi ile karbondioksit üretimi.',
    },
    {
        id: 'seker-eriyor-mu',
        file: 'seker-eriyor-mu.html',
        title: 'Şeker Eriyor mu? (Çözünme Hızı)',
        category: 'Kimya',
        icon: '☕',
        summary: 'Sıcaklık ve karıştırmanın çözünme hızına etkisi.',
    },
    {
        id: 'vucudumuzu-taniyalim',
        file: 'vucudumuzu-taniyalim.html',
        title: 'Vücudumuzu Tanıyalım: İç Organlar',
        category: 'Biyoloji',
        icon: '🫀',
        summary: 'Kalp, akciğer, mide ve iç organların yerleri ve görevleri.',
    },
    {
        id: 'kalbimiz-kani-pompaliyor',
        file: 'kalbimiz-kani-pompaliyor.html',
        title: 'Kalbimiz Kanı Pompalıyor',
        category: 'Biyoloji',
        icon: '❤️',
        summary: 'Kalp kapakçıkları ve kan dolaşımının çalışma modeli.',
    },
    {
        id: 'sogan-zarinda-hucre-kesfi',
        file: 'sogan-zarinda-hucre-kesfi.html',
        title: 'Soğan Zarında Hücre Keşfi (Mikroskop)',
        category: 'Biyoloji',
        icon: '🔬',
        summary: 'Bitki hücre yapısı, hücre duvarı ve çekirdek incelemesi.',
    },
    {
        id: 'sihirli-mercek',
        file: 'sihirli-mercek.html',
        title: 'Sihirli Mercek: Büyülü Bardak',
        category: 'Optik',
        icon: '🔍',
        summary: 'Işığın kırılması ve su dolu bardağın mercek etkisi.',
    },
    {
        id: 'pipet-flut',
        file: 'pipet-flut.html',
        title: 'Sihirli Pipet Flütü',
        category: 'Ses Fiziği',
        icon: '🎵',
        summary: 'Hava sütunu uzunluğuna göre ses perdesi ve frekans değişimi.',
    },
    {
        id: 'titresen-bardak',
        file: 'titresen-bardak.html',
        title: 'Sihirli Titreşen Bardak',
        category: 'Ses Fiziği',
        icon: '📢',
        summary: 'Ses dalgalarının titreşimi ve ses iletimi.',
    },
    {
        id: 'yagmurolcer',
        file: 'yagmurolcer.html',
        title: 'Sihirli Yağmurölçer',
        category: 'Meteoroloji',
        icon: '🌧️',
        summary: 'Hava durumu gözlemi ve yağış miktarı ölçümü.',
    },
    {
        id: 'akilli-sehir-enerji',
        file: 'akilli-sehir-enerji.html',
        title: 'Akıllı Şehir Enerji Şebekesi',
        category: 'Mühendislik',
        icon: '🏙️',
        summary: 'Yenilenebilir enerji kaynakları ile şehir elektrik yönetimi.',
    },
    {
        id: 'deprem-muhendisleri',
        file: 'deprem-muhendisleri.html',
        title: 'Deprem Mühendisleri: Şehri Koru',
        category: 'Mühendislik',
        icon: '🏗️',
        summary: 'Farklı bina yapılarının sarsıntıya dayanıklılığı.',
    },
];

export function findExperimentByFile(file: string): ExperimentItem | undefined {
    return EXPERIMENTS_CATALOG.find((exp) => exp.file === file || exp.id === file);
}
