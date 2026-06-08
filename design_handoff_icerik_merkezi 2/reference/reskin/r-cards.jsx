// ── Etkinlik Laboratuvarı (reskin) — İçerik Merkezi tarzı kartlar ────

function RFav({ on, onClick, light }) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick && onClick(); }} className="fav-star" title={on ? 'Favorilerden çıkar' : 'Favorile'}
      style={{ color: on ? '#f59e0b' : (light ? '#ffffffcc' : '#cbd5e1') }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.48 3.5a.56.56 0 0 1 1.04 0l2.12 5.11a.56.56 0 0 0 .48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.39a.56.56 0 0 1-.84.6l-4.72-2.88a.56.56 0 0 0-.59 0l-4.72 2.88a.56.56 0 0 1-.84-.6l1.28-5.39a.56.56 0 0 0-.18-.56l-4.2-3.6a.56.56 0 0 1 .32-.99l5.52-.44a.56.56 0 0 0 .48-.35L11.48 3.5Z" />
      </svg>
    </button>
  );
}

function RTypePill({ act }) {
  const c = R_SUBJ_COLOR(act.subject);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px 4px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: '#ffffffe6', color: c, backdropFilter: 'blur(4px)', border: `1px solid ${c}33` }}>
      <CatIcon glyph={R_GLYPH(act)} size={13} stroke={c} sw={2} />
      {act.category || 'İçerik'}
    </span>
  );
}

function RGradeChip({ act }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, background: '#ffffffe6', color: '#475569', border: '1px solid #00000010' }}>{act.grade_level}. Sınıf</span>;
}

// Görsel ızgara kartı (İçerik Merkezi .ccard-visual ile birebir)
function RCard({ act, accent, onOpen, onToggleFav }) {
  const c = R_SUBJ_COLOR(act.subject);
  return (
    <div className="ccard ccard-visual" role="button" tabIndex={0} onClick={onOpen} style={{ '--accent': accent }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10' }}>
        <RThumb act={act} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}><RTypePill act={act} /></div>
        <div style={{ position: 'absolute', top: 8, right: 8 }}><RFav on={act.fav} onClick={() => onToggleFav(act.id)} /></div>
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}><RGradeChip act={act} /></div>
        {act.is_test && <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: '#ffffffe6', borderRadius: 999, padding: '3px 9px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} className="rblink" /><span style={{ fontSize: 10, fontWeight: 800, letterSpacing: .6, color: '#b91c1c' }}>TEST</span>
        </div>}
      </div>
      <div style={{ padding: '13px 15px 15px', textAlign: 'left' }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', fontFamily: 'Inter, sans-serif', lineHeight: 1.32, minHeight: 38 }} className="clamp2">{act.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
            <RSubjectDot color={c} />{act.subject}
          </span>
          <span style={{ color: '#b8c0cc', fontSize: 11.5, fontWeight: 500 }}>{act.updated}</span>
        </div>
      </div>
    </div>
  );
}

// Liste satırı (İçerik Merkezi .crow ile birebir)
function RRow({ act, accent, onOpen, onToggleFav }) {
  const c = R_SUBJ_COLOR(act.subject);
  return (
    <div className="crow" onClick={onOpen} style={{ '--accent': accent }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: c + '1c', color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CatIcon glyph={R_GLYPH(act)} size={22} stroke={c} sw={1.7} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3, color: '#94a3b8', fontSize: 11.5 }}>
          <RSubjectDot color={c} size={7} /><span style={{ color: '#64748b', fontWeight: 600 }}>{act.subject}</span>
          <span>·</span>{act.category}
        </div>
      </div>
      <span className="crow-col" style={{ width: 84 }}>{act.grade_level}. Sınıf</span>
      <span className="crow-col" style={{ width: 96 }}>{act.updated}</span>
      <span className="crow-col" style={{ width: 70 }}>{act.uses} kez</span>
      <RFav on={act.fav} onClick={() => onToggleFav(act.id)} />
      <button className="crow-open" onClick={e => { e.stopPropagation(); onOpen(); }} style={{ background: accent }}>
        Aç
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" /></svg>
      </button>
    </div>
  );
}

Object.assign(window, { RCard, RRow, RFav });
