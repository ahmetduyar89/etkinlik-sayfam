// ── TedrisEDU İçerik Merkezi — Sunum Modu (Projeksiyon Sahnesi) ──────
const { useState: useStateS, useEffect: useEffectS, useRef: useRefS } = React;

/* ░░ Canlı demo 1 — Kesir aracı ░░ */
function FractionDemo({ color }) {
  const [a, setA] = useStateS({ n: 1, d: 2 });
  const [b, setB] = useStateS({ n: 1, d: 4 });
  const gcd = (x, y) => (y ? gcd(y, x % y) : x);
  const sumN = a.n * b.d + b.n * a.d, sumD = a.d * b.d;
  const g = gcd(sumN, sumD) || 1;
  const Bar = ({ f }) => (
    <div style={{ display: 'flex', gap: 4, width: '100%' }}>
      {Array.from({ length: f.d }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 64, borderRadius: 8, background: i < f.n ? color : color + '22', border: `2px solid ${color}`, transition: 'background .2s' }} />
      ))}
    </div>
  );
  const Stepper = ({ label, v, set }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 92, color: '#475569', fontWeight: 600 }}>{label}</span>
      {['Pay', 'Payda'].map((lbl, idx) => (
        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="frac-btn" onClick={() => set(idx === 0 ? { ...v, n: Math.max(0, v.n - 1) } : { ...v, d: Math.max(1, v.d - 1), n: Math.min(v.n, Math.max(1, v.d - 1)) })}>−</button>
          <div style={{ width: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{idx === 0 ? v.n : v.d}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{lbl}</div>
          </div>
          <button className="frac-btn" onClick={() => set(idx === 0 ? { ...v, n: Math.min(v.d, v.n + 1) } : { ...v, d: Math.min(12, v.d + 1) })}>+</button>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 26, justifyContent: 'center', padding: '0 8%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}><Bar f={a} /><span style={{ fontSize: 40, fontWeight: 800, color: color }}>+</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}><Bar f={b} /><span style={{ fontSize: 40, fontWeight: 800, color: '#cbd5e1' }}>=</span></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Stepper label="1. kesir" v={a} set={setA} />
        <Stepper label="2. kesir" v={b} set={setB} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, fontWeight: 800 }}>
        <span style={{ fontSize: 22, color: '#64748b' }}>Toplam =</span>
        <span style={{ fontSize: 44, color: color }}>{sumN / g}<span style={{ color: '#94a3b8' }}>/</span>{sumD / g}</span>
        <span style={{ fontSize: 18, color: '#94a3b8' }}>≈ {(sumN / sumD).toFixed(2)}</span>
      </div>
    </div>
  );
}

/* ░░ Canlı demo 2 — Fonksiyon grafiği ░░ */
function GraphDemo({ color }) {
  const [a, setA] = useStateS(0.5), [b, setB] = useStateS(-1);
  const W = 520, H = 360, ox = W / 2, oy = H / 2, sc = 32;
  const pts = [];
  for (let px = 0; px <= W; px += 4) { const x = (px - ox) / sc; const y = a * x * x + b * x; pts.push(`${px},${oy - y * sc}`); }
  const Ctl = ({ label, v, set, min, max }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#475569', fontWeight: 600 }}>
      <span style={{ width: 96 }}>{label} = <b style={{ color }}>{v}</b></span>
      <input type="range" min={min} max={max} step="0.1" value={v} onChange={e => set(parseFloat(e.target.value))} style={{ accentColor: color, width: 240 }} />
    </label>
  );
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
      <svg width={W} height={H} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
        {Array.from({ length: 17 }).map((_, i) => <line key={'v' + i} x1={i * sc} y1={0} x2={i * sc} y2={H} stroke="#eef2f7" />)}
        {Array.from({ length: 12 }).map((_, i) => <line key={'h' + i} x1={0} y1={i * sc} x2={W} y2={i * sc} stroke="#eef2f7" />)}
        <line x1={0} y1={oy} x2={W} y2={oy} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={ox} y1={0} x2={ox} y2={H} stroke="#cbd5e1" strokeWidth="1.5" />
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a' }}>y = <span style={{ color }}>{a}</span>x² {b < 0 ? '−' : '+'} <span style={{ color }}>{Math.abs(b)}</span>x</div>
        <Ctl label="a" v={a} set={setA} min={-2} max={2} />
        <Ctl label="b" v={b} set={setB} min={-3} max={3} />
      </div>
    </div>
  );
}

/* ░░ Canlı demo 3 — Güneş sistemi ░░ */
function SolarDemo() {
  const planets = [
    { r: 70, size: 12, c: '#9ca3af', dur: 6, name: 'Merkür' },
    { r: 110, size: 18, c: '#E8C85A', dur: 10, name: 'Venüs' },
    { r: 158, size: 20, c: '#3b82f6', dur: 15, name: 'Dünya' },
    { r: 210, size: 16, c: '#E8685A', dur: 22, name: 'Mars' },
    { r: 270, size: 34, c: '#d8a05a', dur: 34, name: 'Jüpiter' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 620, height: 620 }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #fde68a, #f59e0b 55%, #ea580c)', boxShadow: '0 0 60px #f59e0b88' }} />
        {planets.map(p => (
          <div key={p.name} style={{ position: 'absolute', left: '50%', top: '50%', width: p.r * 2, height: p.r * 2, marginLeft: -p.r, marginTop: -p.r, border: '1px solid #ffffff1a', borderRadius: '50%', animation: `orbit ${p.dur}s linear infinite` }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, marginLeft: -p.size / 2, marginTop: -p.size / 2, width: p.size, height: p.size, borderRadius: '50%', background: p.c, boxShadow: `0 0 12px ${p.c}aa` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ░░ Canlı demo 4 — 3B döner küp ░░ */
function CubeDemo({ color }) {
  const faces = [
    { t: 'rotateY(0deg) translateZ(90px)' }, { t: 'rotateY(180deg) translateZ(90px)' },
    { t: 'rotateY(90deg) translateZ(90px)' }, { t: 'rotateY(-90deg) translateZ(90px)' },
    { t: 'rotateX(90deg) translateZ(90px)' }, { t: 'rotateX(-90deg) translateZ(90px)' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
      <div style={{ perspective: 900 }}>
        <div style={{ width: 180, height: 180, position: 'relative', transformStyle: 'preserve-3d', animation: 'spin3d 14s linear infinite' }}>
          {faces.map((f, i) => (
            <div key={i} style={{ position: 'absolute', width: 180, height: 180, transform: f.t, background: color + '24', border: `2px solid ${color}`, borderRadius: 10, boxSizing: 'border-box' }} />
          ))}
        </div>
      </div>
      <div style={{ color: '#fff' }}>
        <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 18 }}>Küp</div>
        {[['Yüz', '6'], ['Ayrıt', '12'], ['Köşe', '8']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', width: 200, padding: '10px 0', borderBottom: '1px solid #ffffff22', fontSize: 18 }}>
            <span style={{ color: '#94a3b8' }}>{k}</span><b style={{ color }}>{v}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ░░ Placeholder sahne — yüklenmiş HTML içeriği ░░ */
function PlaceholderStage({ content }) {
  const subj = SUBJECT_BY_ID[content.subject], c = subj.color;
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center', padding: 40 }}>
      <div style={{ width: 132, height: 132, borderRadius: 28, background: c + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c }}>
        <TypeIcon type={content.type} size={64} stroke={c} sw={1.4} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{content.title}</div>
      <div style={{ fontSize: 15, color: '#64748b', maxWidth: 440, lineHeight: 1.6 }}>
        Yüklediğiniz <b style={{ color: c }}>{TYPE_BY_ID[content.type].name}</b> içeriği burada tam ekran açılır. Gerçek kullanımda bu alan dosyanızı gösterir.
      </div>
    </div>
  );
}

function StageBody({ content }) {
  const c = SUBJECT_BY_ID[content.subject].color;
  if (content.demo === 'fraction') return <FractionDemo color={c} />;
  if (content.demo === 'graph') return <GraphDemo color={c} />;
  if (content.demo === 'solar') return <SolarDemo />;
  if (content.demo === 'cube') return <CubeDemo color={c} />;
  return <PlaceholderStage content={content} />;
}

function PresentationStage({ content, onClose, onPrev, onNext }) {
  const rootRef = useRefS(null);
  const [chrome, setChrome] = useStateS(true);
  const [fs, setFs] = useStateS(false);
  const hideTimer = useRefS(null);
  const dark = content.demo === 'solar' || content.demo === 'cube';

  useEffectS(() => {
    const onKey = e => {
      if (e.key === 'Escape' && !document.fullscreenElement) onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs); };
  }, [onClose, onNext, onPrev]);

  const wake = () => {
    setChrome(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChrome(false), 2600);
  };
  useEffectS(() => { wake(); return () => clearTimeout(hideTimer.current); }, [content.id]);

  const toggleFs = () => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const subj = SUBJECT_BY_ID[content.subject];
  return (
    <div ref={rootRef} onMouseMove={wake} style={{ position: 'fixed', inset: 0, zIndex: 1200, background: '#0b0e14', display: 'flex', flexDirection: 'column', animation: 'stageIn .28s ease' }}>
      {/* Üst çubuk */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', background: 'linear-gradient(#0b0e14ee, #0b0e1400)', opacity: chrome ? 1 : 0, transition: 'opacity .4s', pointerEvents: chrome ? 'auto' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="stage-icon-btn" onClick={onClose} title="Kapat (Esc)">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'Poppins, sans-serif' }}>{content.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <SubjectDot color={subj.color} size={8} />
              <span style={{ color: '#94a3b8', fontSize: 12.5 }}>{subj.name} · {content.grade}. Sınıf · {TYPE_BY_ID[content.type].name}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#475569', fontSize: 12, marginRight: 4 }}>Sunum Modu</span>
          <button className="stage-icon-btn" onClick={toggleFs} title="Tam ekran">
            {fs
              ? <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" /></svg>
              : <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>}
          </button>
        </div>
      </div>

      {/* Sahne */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(28px, 6vh, 80px)' }}>
        <div style={{ width: '100%', maxWidth: 1180, aspectRatio: '16 / 9', background: dark ? 'radial-gradient(circle at 50% 40%, #131a2a, #080b12)' : '#fff', borderRadius: 18, boxShadow: '0 40px 90px rgba(0,0,0,.55)', overflow: 'hidden', position: 'relative', display: 'flex' }}>
          <StageBody content={content} />
        </div>
      </div>

      {/* Alt gezinme */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '18px', opacity: chrome ? 1 : 0, transition: 'opacity .4s', pointerEvents: chrome ? 'auto' : 'none' }}>
        <button className="stage-pill" onClick={onPrev}>← Önceki</button>
        <button className="stage-pill" onClick={onNext}>Sonraki →</button>
      </div>
    </div>
  );
}

Object.assign(window, { PresentationStage, FractionDemo, GraphDemo, SolarDemo, CubeDemo });
