// ── Etkinlik Laboratuvarı (reskin) — Kategori ikonları & posterler ───

function CatIcon({ glyph, size = 18, stroke = 'currentColor', sw = 1.7 }) {
  const c = { width: size, height: size, fill: 'none', stroke, strokeWidth: sw, viewBox: '0 0 24 24', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (glyph) {
    case 'sim': // simülasyon — ekranda dalga
      return <svg {...c}><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M6.5 11c1.2-3 2.3-3 3.5 0s2.3 3 3.5 0 2.3-3 3.5 0" /><path d="M9 20h6M12 16.5V20" /></svg>;
    case 'lab': // laboratuvar — erlen
      return <svg {...c}><path d="M9 3h6M10 3v6.5L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.5V3" /><path d="M7.5 14h9" /></svg>;
    case 'test': // test — onay listesi
      return <svg {...c}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 9 1.5 1.5L12.5 7.5" /><path d="M8 15h8" /></svg>;
    case 'note': // ders notları — kitap
      return <svg {...c}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" /></svg>;
    case 'game': // oyun — kol
      return <svg {...c}><path d="M7 12h4M9 10v4M15.5 11.5h.01M18 13.5h.01" /><rect x="2.5" y="6.5" width="19" height="11" rx="5.5" /></svg>;
    default: // rocket
      return <svg {...c}><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.9.7-2.2-.1-3a2.1 2.1 0 0 0-2.9 0zM12 15l-3-3a22 22 0 0 1 8-11 22 22 0 0 1 0 9 22 22 0 0 1-5 5zM9 12H4s.5-2.8 2-4 4 0 4 0M12 15v5s2.8-.5 4-2 0-4 0-4" /></svg>;
  }
}

function RSubjectDot({ color, size = 8 }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />;
}

// Üretilen poster — branş rengiyle, kategori glifi
function RThumb({ act, h = '100%' }) {
  const c = R_SUBJ_COLOR(act.subject);
  if (act.image_url) {
    return <img src={act.image_url} alt="" style={{ width: '100%', height: h, objectFit: 'cover' }} />;
  }
  const glyph = R_GLYPH(act);
  return (
    <div style={{ position: 'relative', width: '100%', height: h, background: `linear-gradient(140deg, ${c}26, ${c}0d 65%, #ffffff00)`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(115% 85% at 85% 12%, ${c}2e, transparent 55%)` }} />
      <div style={{ color: c, opacity: 0.92 }}><CatIcon glyph={glyph} size={50} stroke={c} sw={1.5} /></div>
    </div>
  );
}

Object.assign(window, { CatIcon, RSubjectDot, RThumb });
