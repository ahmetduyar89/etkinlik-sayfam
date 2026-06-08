// ── Etkinlik Laboratuvarı (reskin) — Veri (gerçek modele göre) ───────
// Activity modeli: title, description, category, grade_level, subject, tags, is_test, image_url

const R_SUBJECTS = [
  { name: 'Türkçe', color: '#E8C85A' },
  { name: 'Matematik', color: '#5AC8A8' },
  { name: 'Fen Bilimleri', color: '#E8685A' },
  { name: 'Sosyal Bilgiler', color: '#6366f1' },
  { name: 'İngilizce', color: '#3b82f6' },
  { name: 'Din Kültürü ve Ahlak Bilgisi', color: '#8b5cf6' },
  { name: 'Fizik', color: '#0ea5e9' },
  { name: 'Kimya', color: '#ec4899' },
  { name: 'Biyoloji', color: '#10b981' },
];
const R_SUBJ_COLOR = (name) => (R_SUBJECTS.find(s => s.name === name)?.color) || '#6366f1';
const R_GRADES = ['5', '6', '7', '8', '9', '10', '11', '12'];

// Kategori → görsel tür (üretilen poster + ikon)
const R_CAT_GLYPH = {
  'Simülasyon': 'sim', 'Laboratuvar': 'lab', 'Test': 'test',
  'Ders Notları': 'note', 'Oyun': 'game', 'Genel': 'rocket',
};
const R_GLYPH = (act) => act.is_test ? 'test' : (R_CAT_GLYPH[act.category] || 'rocket');

// Mock etkinlikler (kendi MOCK'undan + birkaç ek; demo'lar canlı çalışır)
const R_ACTIVITIES = [
  { id: 'a1', title: 'Kuantum Alanları', description: 'Elektronların gizemli dünyasını interaktif simülasyonla deneyimleyin.', category: 'Simülasyon', subject: 'Fizik', grade_level: '12', tags: 'kuantum, fizik, atom', is_test: false, demo: 'solar' },
  { id: 'a2', title: 'Genetik Temeller', description: 'DNA sarmalı ve kalıtımın mekanizmalarını derinlemesine inceleyin.', category: 'Ders Notları', subject: 'Biyoloji', grade_level: '10', tags: 'dna, genetik, biyoloji', is_test: false },
  { id: 'a3', title: 'Asit-Baz Dengesi', description: 'Etkileşimli titrasyon deneyi ile pH değişimini gözlemleyin.', category: 'Laboratuvar', subject: 'Kimya', grade_level: '11', tags: 'kimya, asit, baz', is_test: false },
  { id: 'a4', title: 'Fonksiyon Grafiği Simülatörü', description: 'Parabolün katsayılarını değiştirerek grafiğin nasıl değiştiğini keşfedin.', category: 'Simülasyon', subject: 'Matematik', grade_level: '9', tags: 'fonksiyon, grafik, parabol', is_test: false, demo: 'graph' },
  { id: 'a5', title: 'Haftalık Değerlendirme Testi', description: 'Fizik ve Kimya üzerine 20 soruluk haftalık değerlendirme.', category: 'Test', subject: 'Fizik', grade_level: '11', tags: 'fizik, kimya, test', is_test: true },
  { id: 'a6', title: 'Geometrik Cisimler — 3B', description: 'Küp, prizma ve piramitleri döndürerek yüz–ayrıt–köşe sayılarını inceleyin.', category: 'Simülasyon', subject: 'Matematik', grade_level: '7', tags: 'geometri, 3d, cisim', is_test: false, demo: 'cube' },
  { id: 'a7', title: 'Kesirlerle Toplama', description: 'Kesir çubuklarıyla toplama işlemini görselleştiren interaktif etkinlik.', category: 'Oyun', subject: 'Matematik', grade_level: '6', tags: 'kesir, toplama', is_test: false, demo: 'fraction' },
  { id: 'a8', title: 'Mikro Dünya', description: 'Mikroskobik organizmaları keşfedin ve hücre yapılarını inceleyin.', category: 'Laboratuvar', subject: 'Biyoloji', grade_level: '6', tags: 'mikroskop, hücre', is_test: false },
  { id: 'a9', title: 'Sözcük Türleri Testi', description: 'İsim, sıfat, zamir ve fiilleri ayırt etme becerini ölç.', category: 'Test', subject: 'Türkçe', grade_level: '6', tags: 'dil bilgisi, sözcük', is_test: true },
  { id: 'a10', title: 'Osmanlı Kuruluş Dönemi', description: 'Kuruluş dönemini harita ve zaman çizelgesiyle anlatan ders notu.', category: 'Ders Notları', subject: 'Sosyal Bilgiler', grade_level: '7', tags: 'tarih, osmanlı', is_test: false },
  { id: 'a11', title: 'Tenses Practice', description: 'Present, past ve future zamanları sürükle-bırak ile pekiştir.', category: 'Oyun', subject: 'İngilizce', grade_level: '8', tags: 'grammar, tenses', is_test: false },
  { id: 'a12', title: 'Elektrik Devreleri', description: 'Seri ve paralel devreleri kurarak ampul parlaklığını gözlemle.', category: 'Simülasyon', subject: 'Fen Bilimleri', grade_level: '7', tags: 'elektrik, devre', is_test: false },
];

Object.assign(window, { R_SUBJECTS, R_SUBJ_COLOR, R_GRADES, R_CAT_GLYPH, R_GLYPH, R_ACTIVITIES });
