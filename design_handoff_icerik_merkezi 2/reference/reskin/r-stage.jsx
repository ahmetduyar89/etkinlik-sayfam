// ── Etkinlik Laboratuvarı (reskin) — Sunum Modu ─────────────────────
const { useState: useRS, useEffect: useRE, useRef: useRR } = React;

function RStageBody({ act }) {
  const c = R_SUBJ_COLOR(act.subject);
  if (act.demo === 'fraction') return <FractionDemo color={c} />;
  if (act.demo === 'graph') return <GraphDemo color={c} />;
  if (act.demo === 'solar') return <SolarDemo />;
  if (act.demo === 'cube') return <CubeDemo color={c} />;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: 48 }}>
      <div style={{ width: 124, height: 124, borderRadius: 28, background: c + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c }}>
        <CatIcon glyph={R_GLYPH(act)} size={62} stroke={c} sw={1.4} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>{act.title}</div>
      <div style={{ fontSize: 15, color: '#64748b', maxWidth: 520, lineHeight: 1.6 }}>{act.description}</div>
      <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>Yüklediğin <b style={{ color: c }}>HTML içeriği</b> burada tam ekran açılır.</div>
    </div>
  );
}

function RPresentationStage({ act, onClose, onPrev, onNext }) {
  const rootRef = useRR(null);
  const [chrome, setChrome] = useRS(true);
  const [fs, setFs] = useRS(false);
  const timer = useRR(null);
  const dark = act.demo === 'solar' || act.demo === 'cube';
  const c = R_SUBJ_COLOR(act.subject);

  useRE(() => {
    const onKey = e => { if (e.key === 'Escape' && !document.fullscreenElement) onClose(); if (e.key === 'ArrowRight') onNext(); if (e.key === 'ArrowLeft') onPrev(); };
    const onFs = () => setFs(!!document.fullscreenElement);
    window.addEventListener('keydown', onKey); document.addEventListener('fullscreenchange', onFs);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs); };
  }, [onClose, onNext, onPrev]);

  const wake = () => { setChrome(true); clearTimeout(timer.current); timer.current = setTimeout(() => setChrome(false), 2600); };
  useRE(() => { wake(); return () => clearTimeout(timer.current); }, [act.id]);
  const toggleFs = () => { if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.(); else document.exitFullscreen?.(); };

  return (
    <div ref={rootRef} onMouseMove={wake} style={{ position: 'fixed', inset: 0, zIndex: 1200, background: '#0b0e14', display: 'flex', flexDirection: 'column', animation: 'stageIn .28s ease' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: 'linear-gradient(#0b0e14ee,#0b0e1400)', opacity: chrome ? 1 : 0, transition: 'opacity .4s', pointerEvents: chrome ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="stage-icon-btn" onClick={onClose} title="Kapat (Esc)"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'Poppins, sans-serif' }}>{act.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <RSubjectDot color={c} size={8} /><span style={{ color: '#94a3b8', fontSize: 12.5 }}>{act.subject} · {act.grade_level}. Sınıf · {act.category}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#475569', fontSize: 12, marginRight: 4 }}>Sunum Modu</span>
          <button className="stage-icon-btn" onClick={toggleFs} title="Tam ekran">
            {fs ? <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M15 9h4.5M15 9V4.5M9 15v4.5M9 15H4.5M15 15h4.5M15 15v4.5" /></svg>
              : <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5M20.25 3.75h-4.5m4.5 0v4.5M3.75 20.25v-4.5m0 4.5h4.5M20.25 20.25h-4.5m4.5 0v-4.5" /></svg>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px,6vh,80px)' }}>
        <div style={{ width: '100%', maxWidth: 1180, aspectRatio: '16 / 9', background: dark ? 'radial-gradient(circle at 50% 40%, #131a2a, #080b12)' : '#fff', borderRadius: 18, boxShadow: '0 40px 90px rgba(0,0,0,.55)', overflow: 'hidden', display: 'flex' }}>
          <RStageBody act={act} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 18, opacity: chrome ? 1 : 0, transition: 'opacity .4s', pointerEvents: chrome ? 'auto' : 'none' }}>
        <button className="stage-pill" onClick={onPrev}>← Önceki</button>
        <button className="stage-pill" onClick={onNext}>Sonraki →</button>
      </div>
    </div>
  );
}

Object.assign(window, { RPresentationStage });
