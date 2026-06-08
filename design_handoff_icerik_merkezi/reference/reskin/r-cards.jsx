// ── Etkinlik Laboratuvarı (reskin) — Kartlar (açık tema) ─────────────

function RTypePill({ act, light }) {
  const c = R_SUBJ_COLOR(act.subject);
  const label = act.is_test ? 'Test' : (act.category || 'İçerik');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px 4px 7px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: light ? 'rgba(255,255,255,.22)' : '#ffffffe6', color: light ? '#fff' : c,
      backdropFilter: 'blur(4px)', border: light ? '1px solid rgba(255,255,255,.25)' : `1px solid ${c}33` }}>
      <CatIcon glyph={R_GLYPH(act)} size={13} stroke={light ? '#fff' : c} sw={2} />
      {label}
    </span>
  );
}

function RGradeChip({ act, light }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
    background: light ? 'rgba(255,255,255,.2)' : '#ffffffe6', color: light ? '#fff' : '#475569',
    border: light ? '1px solid rgba(255,255,255,.25)' : '1px solid #00000010' }}>{act.grade_level}. Sınıf</span>;
}

const RAdmin = () => (
  <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
    {[
      'M8 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1M16 3h4v4M10 14 20 4', // share/copy-ish
      'm16.5 3.5 4 4L8 20l-4.5.5L4 16z', // edit
      'M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7', // trash
    ].map((d, i) => (
      <button key={i} className="radmin-btn" title="Yönetici">
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>
      </button>
    ))}
  </div>
);

// Izgara kartı (görsel, İçerik Merkezi hissi)
function RGridCard({ act, onOpen }) {
  const c = R_SUBJ_COLOR(act.subject);
  return (
    <div className="rcard" role="button" tabIndex={0} onClick={onOpen}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
        <RThumb act={act} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}><RTypePill act={act} /></div>
        <div style={{ position: 'absolute', top: 9, right: 10 }}><RGradeChip act={act} /></div>
        {act.is_test && <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6, background: '#ffffffe6', borderRadius: 999, padding: '3px 9px' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444' }} className="rblink" /><span style={{ fontSize: 10, fontWeight: 800, letterSpacing: .6, color: '#b91c1c' }}>TEST</span>
        </div>}
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: 'Poppins, sans-serif', lineHeight: 1.28, letterSpacing: '-.2px' }} className="rclamp2">{act.title}</div>
        <p style={{ margin: '7px 0 0', fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }} className="rclamp2">{act.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
            <RSubjectDot color={c} />{act.subject}
          </span>
          <span className="ropen-pill">Aç
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" /></svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// Liste satırı (senin yatay kart düzenin, açık tema)
function RListRow({ act, onOpen }) {
  const c = R_SUBJ_COLOR(act.subject);
  return (
    <div className="rrow" role="button" tabIndex={0} onClick={onOpen}>
      <div style={{ width: 6, alignSelf: 'stretch', background: c, borderRadius: 99, flexShrink: 0 }} />
      <div style={{ width: 132, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '1px solid #eef2f7' }}>
        <RThumb act={act} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</h3>
        </div>
        <p style={{ margin: '5px 0 0', fontSize: 12.5, color: '#94a3b8', lineHeight: 1.5 }} className="rclamp2">{act.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8, fontSize: 11.5, color: '#94a3b8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontWeight: 600 }}><RSubjectDot color={c} size={7} />{act.subject}</span>
          <span>·</span><span>{act.grade_level}. Sınıf</span>
          <span>·</span><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CatIcon glyph={R_GLYPH(act)} size={13} stroke="#94a3b8" sw={1.8} />{act.category}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
        <button className="ropen-btn" onClick={e => { e.stopPropagation(); onOpen(); }}>Aç
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" /></svg>
        </button>
        <RAdmin />
      </div>
    </div>
  );
}

Object.assign(window, { RGridCard, RListRow, RTypePill, RGradeChip });
