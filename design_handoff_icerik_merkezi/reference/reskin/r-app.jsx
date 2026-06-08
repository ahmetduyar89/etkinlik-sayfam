// ── Etkinlik Laboratuvarı (reskin) — Hub ────────────────────────────
const { useState: useA, useMemo: useAM, useRef: useAR } = React;

const R_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": "#6366f1",
  "defaultView": "grid"
}/*EDITMODE-END*/;

const trLo = s => (s || '').toLocaleLowerCase('tr-TR');

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
            <label style={{ width: 96 }}><div className="field-label">Sınıf</div><select className="field" value={grade} onChange={e => setGrade(e.target.value)}>{R_GRADES.map(g => <option key={g} value={g}>{g}. Sınıf</option>)}</select></label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button className="btn-ghost" onClick={onClose}>İptal</button>
            <button className="rbtn-primary" style={{ '--accent': accent, flex: 1, justifyContent: 'center', opacity: title.trim() ? 1 : .5 }}
              onClick={() => title.trim() && onCreate({ title: title.trim(), subject, grade_level: grade, category, is_test: category === 'Test', description: 'Yeni eklenen interaktif içerik.' })}>Kütüphaneye Ekle</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterHead({ icon, label, open, accent, onToggle }) {
  return (
    <button className={'rfilter-head' + (open ? ' on' : '')} style={{ '--accent': accent }} onClick={onToggle}>
      {icon}<span>{label}</span>
      <svg className="chev" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
    </button>
  );
}

function RApp() {
  const [t, setTweak] = useTweaks(R_TWEAKS);
  const accent = t.accent || '#6366f1';
  const [acts, setActs] = useA(() => R_ACTIVITIES.map(a => ({ ...a })));
  const [search, setSearch] = useA('');
  const [group, setGroup] = useA('category');
  const [fCat, setFCat] = useA(null), [fGrade, setFGrade] = useA(null), [fSubj, setFSubj] = useA(null), [fTag, setFTag] = useA(null);
  const [view, setView] = useA(t.defaultView || 'grid');
  const [openId, setOpenId] = useA(null);
  const [showAdd, setShowAdd] = useA(false);

  React.useEffect(() => { setView(t.defaultView || 'grid'); }, [t.defaultView]);

  const cats = useAM(() => Array.from(new Set(acts.map(a => a.category || 'Genel'))).sort((a, b) => a.localeCompare(b, 'tr')), [acts]);
  const tags = useAM(() => Array.from(new Set(acts.flatMap(a => (a.tags || '').split(',').map(s => s.trim()).filter(Boolean)))).sort(), [acts]);

  const filtered = useAM(() => {
    const n = trLo(search.trim());
    return acts.filter(a => {
      if (n && !trLo([a.title, a.description, a.category, a.subject, a.tags].filter(Boolean).join(' ')).includes(n)) return false;
      if (fCat && (a.category || 'Genel') !== fCat) return false;
      if (fGrade && a.grade_level !== fGrade) return false;
      if (fSubj && a.subject !== fSubj) return false;
      if (fTag && !(a.tags || '').split(',').map(s => s.trim()).includes(fTag)) return false;
      return true;
    });
  }, [acts, search, fCat, fGrade, fSubj, fTag]);

  const openAct = openId ? acts.find(a => a.id === openId) : null;
  const step = dir => { if (!filtered.length) return; const i = filtered.findIndex(a => a.id === openId); const nx = filtered[(i + dir + filtered.length) % filtered.length]; if (nx) setOpenId(nx.id); };
  const reset = () => { setFCat(null); setFGrade(null); setFSubj(null); setFTag(null); setSearch(''); };
  const ic = d => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={d} /></svg>;

  return (
    <div className="rapp" style={{ '--accent': accent }}>
      {/* Navbar */}
      <header className="rnav">
        <div className="rnav-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div className="rbrand">Ahmet <b>DUYAR</b></div>
            <nav className="rnav-links">
              <a className="rnav-link on" href="#">Keşfet</a>
              <a className="rnav-link" href="#">Kategoriler</a>
              <a className="rnav-link" href="#">Hakkında</a>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="rbtn-primary" onClick={() => setShowAdd(true)}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>İçerik Ekle</button>
            <button className="rnav-icon" title="Bildirimler"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.9 17.1a3 3 0 0 1-5.8 0m9-3.6V11a6 6 0 1 0-12 0v2.5c0 .6-.2 1.1-.6 1.5L4 17h16l-.5-2a2 2 0 0 1-.6-1.5Z" /></svg></button>
            <div className="ravatar">AD</div>
          </div>
        </div>
      </header>

      <main className="rmain">
        {/* Sidebar filters */}
        <aside className="rside">
          <div className="rside-title">Filtreler</div>
          <FilterHead icon={ic('M4 6h16M4 12h16M4 18h16')} label="İçerik Türü" open={group === 'category'} accent={accent} onToggle={() => setGroup(group === 'category' ? null : 'category')} />
          {group === 'category' && <div className="rfilter-body">
            <button className={'rsub' + (fCat === null ? ' on' : '')} style={{ '--accent': accent }} onClick={() => setFCat(null)}>Tümü</button>
            {cats.map(c => <button key={c} className={'rsub' + (fCat === c ? ' on' : '')} style={{ '--accent': accent }} onClick={() => setFCat(fCat === c ? null : c)}>{c}</button>)}
          </div>}

          <FilterHead icon={ic('M12 14 4 9l8-5 8 5-8 5ZM6 11v5l6 3.5L18 16v-5')} label="Sınıf Seviyeleri" open={group === 'grade'} accent={accent} onToggle={() => setGroup(group === 'grade' ? null : 'grade')} />
          {group === 'grade' && <div className="rgrade-grid">
            {R_GRADES.map(g => <button key={g} className={'rgrade' + (fGrade === g ? ' on' : '')} style={{ '--accent': accent }} onClick={() => setFGrade(fGrade === g ? null : g)}>{g}</button>)}
          </div>}

          <FilterHead icon={ic('M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z')} label="Dersler" open={group === 'subject'} accent={accent} onToggle={() => setGroup(group === 'subject' ? null : 'subject')} />
          {group === 'subject' && <div className="rfilter-body">
            <button className={'rsub' + (fSubj === null ? ' on' : '')} style={{ '--accent': accent }} onClick={() => setFSubj(null)}>Tümü</button>
            {R_SUBJECTS.map(s => <button key={s.name} className={'rsub rsub-dot' + (fSubj === s.name ? ' on' : '')} style={{ '--accent': accent }} onClick={() => setFSubj(fSubj === s.name ? null : s.name)}><RSubjectDot color={s.color} size={9} />{s.name}</button>)}
          </div>}

          <FilterHead icon={ic('M7 7h.01M3 5.5 12 3l9 2.5v6L12 21l-9-9.5z')} label="Etiketler" open={group === 'tag'} accent={accent} onToggle={() => setGroup(group === 'tag' ? null : 'tag')} />
          {group === 'tag' && <div className="rtags">
            <button className={'rtag' + (fTag === null ? ' on' : '')} style={{ '--accent': accent }} onClick={() => setFTag(null)}>Tümü</button>
            {tags.map(tg => <button key={tg} className={'rtag' + (fTag === tg ? ' on' : '')} style={{ '--accent': accent }} onClick={() => setFTag(fTag === tg ? null : tg)}>{tg}</button>)}
          </div>}

          <div style={{ marginTop: 8, borderTop: '1px solid #eef2f7', paddingTop: 8 }}>
            <button className="rreset" style={{ '--accent': accent }} onClick={reset}>Tümünü Sıfırla</button>
          </div>
        </aside>

        {/* Content */}
        <section className="rcontent">
          <div className="rhead">
            <h1>Etkinlik Laboratuvarı</h1>
            <p>Hazırladığın interaktif simülasyonları, ders notlarını ve testleri seç, derste tam ekran sun.</p>
          </div>
          <div className="rsearch">
            <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m2.2-5.3a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Deney, konu veya etiket ara…" />
          </div>
          <div className="rtoolbar">
            <div className="rcount">{filtered.length} içerik bulundu</div>
            <div className="rviewtoggle">
              <button className={view === 'grid' ? 'on' : ''} style={{ '--accent': accent }} onClick={() => setView('grid')} title="Izgara"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25A2.25 2.25 0 0 1 8.25 10.5H6A2.25 2.25 0 0 1 3.75 8.25Zm9.75 0A2.25 2.25 0 0 1 15.75 3.75H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25Zm-9.75 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18Zm9.75 0a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18Z" /></svg></button>
              <button className={view === 'list' ? 'on' : ''} style={{ '--accent': accent }} onClick={() => setView('list')} title="Liste"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg></button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rempty">
              <div style={{ fontSize: 16, fontWeight: 700, color: '#475569', fontFamily: 'Poppins, sans-serif' }}>İçerik bulunamadı</div>
              <div style={{ fontSize: 13, marginTop: 5 }}>Arama terimini değiştir veya filtreleri temizle.</div>
              <button className="btn-ghost" style={{ marginTop: 16 }} onClick={reset}>Filtreleri temizle</button>
            </div>
          ) : view === 'grid' ? (
            <div className="rgrid">{filtered.map(a => <RGridCard key={a.id} act={a} onOpen={() => setOpenId(a.id)} />)}</div>
          ) : (
            <div>{filtered.map(a => <RListRow key={a.id} act={a} onOpen={() => setOpenId(a.id)} />)}</div>
          )}
        </section>
      </main>

      <footer className="rfooter">© 2026 Ahmet DUYAR · Etkinlik Laboratuvarı — interaktif eğitim içerik merkezi</footer>

      {showAdd && <RAddModal accent={accent} onClose={() => setShowAdd(false)} onCreate={a => { setActs(p => [{ id: 'n' + Date.now(), tags: '', ...a }, ...p]); setShowAdd(false); reset(); }} />}
      {openAct && <RPresentationStage act={openAct} onClose={() => setOpenId(null)} onPrev={() => step(-1)} onNext={() => step(1)} />}

      <TweaksPanel>
        <TweakSection label="Görünüm" />
        <TweakColor label="Vurgu rengi" value={t.accent} options={['#6366f1', '#2f6df0', '#8b5cf6', '#10b981']} onChange={v => setTweak('accent', v)} />
        <TweakRadio label="Varsayılan görünüm" value={t.defaultView} options={['grid', 'list']} onChange={v => setTweak('defaultView', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RApp />);
