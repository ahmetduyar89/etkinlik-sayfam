// ── Etkinlik Laboratuvarı (reskin) — İçerik Merkezi düzeninde Hub ────
const { useState: useA, useMemo: useAM, useRef: useAR, useEffect: useAE } = React;

const R_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#6366f1",
  "cardStyle": "görsel",
  "showHero": true
}/*EDITMODE-END*/;

const trLo = s => (s || '').toLocaleLowerCase('tr-TR');
function rRecency(s) {
  if (/bugün/i.test(s)) return 0; if (/dün/i.test(s)) return 1;
  const w = (s || '').match(/(\d+)\s*hafta/i); if (w) return +w[1] * 7;
  const d = (s || '').match(/(\d+)\s*gün/i); if (d) return +d[1];
  return 99;
}

function RAddModal({ accent, onClose, onCreate }) {
  const [drag, setDrag] = useA(false), [file, setFile] = useA(null);
  const [title, setTitle] = useA(''), [subject, setSubject] = useA('Matematik');
  const [grade, setGrade] = useA('6'), [category, setCategory] = useA('Simülasyon');
  const ref = useAR(null);
  const take = f => { if (!f) return; setFile(f.name); if (!title) setTitle(f.name.replace(/\.(html?|pdf|zip)$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, m => m.toLocaleUpperCase('tr'))); };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ '--accent': accent }}>
        <div className="modal-head"><h3>Yeni İçerik Ekle</h3><button className="modal-x" onClick={onClose}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button></div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div className={'dropzone' + (drag ? ' drag' : '') + (file ? ' has' : '')} style={{ '--accent': accent }}
            onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); take(e.dataTransfer.files?.[0]); }} onClick={() => ref.current?.click()}>
            <input ref={ref} type="file" accept=".html,.htm,.pdf,.zip" hidden onChange={e => take(e.target.files?.[0])} />
            <div style={{ width: 46, height: 46, borderRadius: 12, background: file ? accent + '1c' : '#f1f5f9', color: file ? accent : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9 4.5-4.5m0 0 4.5 4.5M12 3v13.5" /></svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: file ? '#0f172a' : '#334155' }}>{file || 'HTML dosyasını buraya sürükleyip bırakın'}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{file ? 'Değiştirmek için tıklayın' : '.html, .pdf, .zip'}</div>
          </div>
          <label style={{ display: 'block', marginTop: 18 }}><div className="field-label">İçerik Başlığı</div>
            <input className="field" value={title} onChange={e => setTitle(e.target.value)} placeholder="ör. Kesirlerle Toplama Etkinliği" /></label>
          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            <label style={{ flex: 1 }}><div className="field-label">Kategori</div><select className="field" value={category} onChange={e => setCategory(e.target.value)}>{['Simülasyon', 'Laboratuvar', 'Test', 'Ders Notları', 'Oyun', 'Genel'].map(o => <option key={o}>{o}</option>)}</select></label>
            <label style={{ flex: 1 }}><div className="field-label">Ders</div><select className="field" value={subject} onChange={e => setSubject(e.target.value)}>{R_SUBJECTS.map(s => <option key={s.name}>{s.name}</option>)}</select></label>
            <label style={{ width: 92 }}><div className="field-label">Sınıf</div><select className="field" value={grade} onChange={e => setGrade(e.target.value)}>{R_GRADES.map(g => <option key={g} value={g}>{g}. Sınıf</option>)}</select></label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button className="btn-ghost" onClick={onClose}>İptal</button>
            <button className="btn-primary" style={{ background: accent, flex: 1, justifyContent: 'center', opacity: title.trim() ? 1 : .5 }}
              onClick={() => title.trim() && onCreate({ title: title.trim(), subject, grade_level: grade, category, is_test: category === 'Test', description: 'Yeni eklenen interaktif içerik.' })}>Kütüphaneye Ekle</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RNav({ icon, label, count, active, accent, onClick, dot }) {
  return (
    <button className={'navitem' + (active ? ' navitem-on' : '')} onClick={onClick} style={{ '--accent': accent }}>
      <span style={{ display: 'flex', width: 18, height: 18, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
        {dot ? <RSubjectDot color={dot} size={11} /> : icon}
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {count != null && <span className="navitem-count">{count}</span>}
    </button>
  );
}

function RApp() {
  const [t, setTweak] = useTweaks(R_TWEAKS);
  const accent = t.accent || '#6366f1';
  const [acts, setActs] = useA(() => R_ACTIVITIES.map(a => ({ ...a })));
  const [q, setQ] = useA('');
  const [scope, setScope] = useA('all');           // all | fav | recent
  const [subject, setSubject] = useA(null);
  const [category, setCategory] = useA(null);
  const [grade, setGrade] = useA(null);
  const [view, setView] = useA('grid');
  const [sort, setSort] = useA('recent');
  const [openId, setOpenId] = useA(null);
  const [showAdd, setShowAdd] = useA(false);

  const categories = useAM(() => Array.from(new Set(acts.map(a => a.category || 'Genel'))).sort((a, b) => a.localeCompare(b, 'tr')), [acts]);

  const counts = useAM(() => {
    const subj = {}, cat = {}; let fav = 0, recent = 0;
    acts.forEach(a => {
      subj[a.subject] = (subj[a.subject] || 0) + 1;
      cat[a.category || 'Genel'] = (cat[a.category || 'Genel'] || 0) + 1;
      if (a.fav) fav++; if (rRecency(a.updated) <= 7) recent++;
    });
    return { subj, cat, fav, recent };
  }, [acts]);

  const filtered = useAM(() => {
    let list = acts.slice();
    if (scope === 'fav') list = list.filter(a => a.fav);
    if (scope === 'recent') list = list.filter(a => rRecency(a.updated) <= 7);
    if (subject) list = list.filter(a => a.subject === subject);
    if (category) list = list.filter(a => (a.category || 'Genel') === category);
    if (grade) list = list.filter(a => a.grade_level === grade);
    if (q.trim()) { const n = trLo(q.trim()); list = list.filter(a => trLo([a.title, a.description, a.category, a.subject, a.tags].filter(Boolean).join(' ')).includes(n)); }
    if (sort === 'recent') list.sort((a, b) => rRecency(a.updated) - rRecency(b.updated));
    if (sort === 'used') list.sort((a, b) => (b.uses || 0) - (a.uses || 0));
    if (sort === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
    return list;
  }, [acts, scope, subject, category, grade, q, sort]);

  const title = subject ? subject : category ? category : scope === 'fav' ? 'Favoriler' : scope === 'recent' ? 'Son Açılanlar' : 'Tüm İçerikler';
  const toggleFav = id => setActs(cs => cs.map(a => a.id === id ? { ...a, fav: !a.fav } : a));
  const openAct = openId ? acts.find(a => a.id === openId) : null;
  const open = id => { setOpenId(id); setActs(cs => cs.map(a => a.id === id ? { ...a, updated: 'Bugün', uses: (a.uses || 0) + 1 } : a)); };
  const step = dir => { if (!filtered.length) return; const i = filtered.findIndex(a => a.id === openId); const nx = filtered[(i + dir + filtered.length) % filtered.length]; if (nx) open(nx.id); };
  const reset = () => { setScope('all'); setSubject(null); setCategory(null); setGrade(null); setQ(''); };
  const ic = d => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>;

  return (
    <div className="app" style={{ '--accent': accent }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e8eaee', padding: '11px 22px', display: 'flex', alignItems: 'center', gap: 22, flexShrink: 0, position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
        <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, padding: 0 }}>
          <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.3px', color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>Ahmet <span style={{ color: accent }}>DUYAR</span></span>
          <span style={{ marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid #e5e7eb', fontSize: 13.5, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>İçerik Merkezi</span>
        </button>
        <div className="searchbar" style={{ '--accent': accent }}>
          <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m2.2-5.3a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="İçerik, konu veya tür ara…  (ör. kesir, simülasyon, test)" />
          {q && <button onClick={() => setQ('')} className="search-clear" title="Temizle">✕</button>}
        </div>
        <button className="btn-primary" style={{ background: accent, boxShadow: `0 4px 12px ${accent}40`, flexShrink: 0 }} onClick={() => setShowAdd(true)}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Yeni İçerik
        </button>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>AD</div>
      </header>

      <div className="body-row">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="side-group">
            <RNav icon={ic('M3.75 13.5 16.5 0M3.75 8.25h16.5M3.75 18.75h16.5')} label="Tüm İçerikler" count={acts.length} active={scope === 'all' && !subject && !category} accent={accent} onClick={() => { setScope('all'); setSubject(null); setCategory(null); }} />
            <RNav icon={ic('M11.48 3.5a.56.56 0 0 1 1.04 0l2.12 5.11a.56.56 0 0 0 .48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 0 0-.18.56l1.28 5.39a.56.56 0 0 1-.84.6l-4.72-2.88a.56.56 0 0 0-.59 0l-4.72 2.88a.56.56 0 0 1-.84-.6l1.28-5.39a.56.56 0 0 0-.18-.56l-4.2-3.6a.56.56 0 0 1 .32-.99Z')} label="Favoriler" count={counts.fav} active={scope === 'fav'} accent={accent} onClick={() => { setScope('fav'); setSubject(null); setCategory(null); }} />
            <RNav icon={ic('M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z')} label="Son Açılanlar" count={counts.recent} active={scope === 'recent'} accent={accent} onClick={() => { setScope('recent'); setSubject(null); setCategory(null); }} />
          </div>

          <div className="side-label">Branşlar</div>
          <div className="side-group">
            {R_SUBJECTS.map(s => <RNav key={s.name} dot={s.color} label={s.name} count={counts.subj[s.name] || 0} active={subject === s.name} accent={accent} onClick={() => setSubject(subject === s.name ? null : s.name)} />)}
          </div>

          <div className="side-label">İçerik Türü</div>
          <div className="side-group">
            {categories.map(cat => <RNav key={cat} icon={<CatIcon glyph={R_CAT_GLYPH[cat] || 'rocket'} size={17} sw={1.7} />} label={cat} count={counts.cat[cat] || 0} active={category === cat} accent={accent} onClick={() => setCategory(category === cat ? null : cat)} />)}
          </div>

          <div style={{ marginTop: 'auto', padding: '14px 12px 4px' }}>
            <div className="side-tip">
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 3 }}>İpucu</div>
              <div style={{ fontSize: 11.5, color: '#94a3b8', lineHeight: 1.5 }}>HTML dosyanı buraya sürükleyip bırakarak hızlıca ekleyebilirsin.</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="main">
          <div className="main-inner">
            {t.showHero && (
              <div className="hero">
                <div>
                  <h2>Merhaba, Ahmet Öğretmen</h2>
                  <p>Hazırladığın içerikleri seç, derste tam ekran sun.</p>
                </div>
                <div className="hero-stats">
                  <div className="hero-stat"><b>{acts.length}</b><span>İçerik</span></div>
                  <div className="hero-stat"><b>{counts.fav}</b><span>Favori</span></div>
                  <div className="hero-stat"><b>{counts.recent}</b><span>Bu hafta</span></div>
                </div>
              </div>
            )}

            <div className="toolbar">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
                <h1 style={{ fontSize: 21, fontWeight: 700, color: '#0f172a', fontFamily: 'Poppins, sans-serif', margin: 0 }}>{title}</h1>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{filtered.length} içerik</span>
              </div>
              <div className="grade-chips">
                <button className={'chip' + (grade == null ? ' chip-on' : '')} style={{ '--accent': accent }} onClick={() => setGrade(null)}>Tüm Sınıflar</button>
                {R_GRADES.map(g => <button key={g} className={'chip' + (grade === g ? ' chip-on' : '')} style={{ '--accent': accent }} onClick={() => setGrade(grade === g ? null : g)}>{g}</button>)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
                <select className="sortsel" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="recent">Son güncellenen</option>
                  <option value="used">En çok kullanılan</option>
                  <option value="title">Ada göre (A-Z)</option>
                </select>
                <div className="viewtoggle">
                  <button className={view === 'grid' ? 'on' : ''} style={{ '--accent': accent }} onClick={() => setView('grid')} title="Izgara"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25A2.25 2.25 0 0 1 8.25 10.5H6A2.25 2.25 0 0 1 3.75 8.25Zm9.75 0A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25Zm-9.75 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18Zm9.75 0a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18Z" /></svg></button>
                  <button className={view === 'list' ? 'on' : ''} style={{ '--accent': accent }} onClick={() => setView('list')} title="Liste"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg></button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg></div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#475569', fontFamily: 'Poppins, sans-serif' }}>Sonuç bulunamadı</div>
                <div style={{ fontSize: 13, marginTop: 5 }}>Arama veya filtreleri değiştirmeyi deneyin.</div>
                <button className="btn-ghost" style={{ marginTop: 16 }} onClick={reset}>Filtreleri temizle</button>
              </div>
            ) : view === 'list' ? (
              <div>{filtered.map(a => <RRow key={a.id} act={a} accent={accent} onOpen={() => open(a.id)} onToggleFav={toggleFav} />)}</div>
            ) : (
              <div className="grid" style={{ '--cmin': '216px', '--cgap': '16px' }}>
                {filtered.map(a => <RCard key={a.id} act={a} accent={accent} onOpen={() => open(a.id)} onToggleFav={toggleFav} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAdd && <RAddModal accent={accent} onClose={() => setShowAdd(false)} onCreate={a => { setActs(p => [{ id: 'n' + Date.now(), tags: '', uses: 0, fav: false, ...a }, ...p]); setShowAdd(false); reset(); }} />}
      {openAct && <RPresentationStage act={openAct} onClose={() => setOpenId(null)} onPrev={() => step(-1)} onNext={() => step(1)} />}

      <TweaksPanel>
        <TweakSection label="Görünüm" />
        <TweakColor label="Vurgu rengi" value={t.accent} options={['#6366f1', '#2f6df0', '#8b5cf6', '#10b981']} onChange={v => setTweak('accent', v)} />
        <TweakToggle label="Karşılama başlığı" value={t.showHero} onChange={v => setTweak('showHero', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RApp />);
