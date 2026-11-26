/* İlkokul modüllerinin ortak yardımcıları: sekmeler, sesli okuma, yıldız sayacı,
   kutlama, bildirim ve parmakla/fareyle sürükle-bırak. Global: window.IK */
(function () {
  const IK = {};
  const appKey = 'ik:' + (location.pathname.split('/').filter(Boolean)[0] || 'app');

  /* Güvenli yerel kayıt — gizli pencerede ya da engellenmiş depolamada sessizce düşer. */
  IK.store = {
    get(k, d) { try { const v = localStorage.getItem(appKey + ':' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(appKey + ':' + k, JSON.stringify(v)); } catch (e) { /* yok say */ } },
  };

  IK.rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  IK.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  IK.shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  IK.$ = (s, r) => (r || document).querySelector(s);
  IK.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  IK.el = (tag, attrs, html) => { const e = document.createElement(tag); if (attrs) for (const k in attrs) { if (k === 'class') e.className = attrs[k]; else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; };

  /* ── Sekmeler: [data-tab="x"] düğmeleri, [data-panel="x"] bölümleri ── */
  IK.tabs = function (onChange) {
    const btns = IK.$$('[data-tab]');
    const show = (id) => {
      btns.forEach((b) => { const on = b.dataset.tab === id; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
      IK.$$('[data-panel]').forEach((p) => p.classList.toggle('active', p.dataset.panel === id));
      IK.store.set('tab', id);
      if (onChange) onChange(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    btns.forEach((b) => { b.setAttribute('role', 'tab'); b.addEventListener('click', () => show(b.dataset.tab)); });
    const saved = IK.store.get('tab');
    show(btns.some((b) => b.dataset.tab === saved) ? saved : btns[0] && btns[0].dataset.tab);
    return show;
  };

  /* ── Sesli okuma ── */
  let voices = [];
  const loadVoices = () => { try { voices = speechSynthesis.getVoices(); } catch (e) { voices = []; } };
  if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  IK.say = function (text, lang) {
    if (!('speechSynthesis' in window)) return;
    lang = lang || 'tr-TR';
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang; u.rate = lang.startsWith('tr') ? 0.9 : 0.85; u.pitch = 1.05;
      const v = voices.find((x) => x.lang === lang) || voices.find((x) => x.lang && x.lang.startsWith(lang.slice(0, 2)));
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* ses yoksa sessiz devam */ }
  };

  /* ── Kısa sesler (WebAudio) ── */
  let ctx;
  IK.beep = function (kind) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === 'bad' ? [220, 180] : kind === 'tick' ? [880] : [523, 659, 784];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = kind === 'bad' ? 'sawtooth' : 'sine'; o.frequency.value = f;
        const t = ctx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === 'bad' ? 0.06 : 0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 0.25);
      });
    } catch (e) { /* yok say */ }
  };

  /* ── Bildirim ── */
  let toastEl, toastT;
  IK.toast = function (msg, kind) {
    if (!toastEl) { toastEl = IK.el('div', { class: 'ik-toast', role: 'status', 'aria-live': 'polite' }); document.body.appendChild(toastEl); }
    toastEl.className = 'ik-toast ' + (kind || '');
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add('show'));
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };

  /* ── Konfeti ── */
  IK.confetti = function () {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = IK.el('canvas', { class: 'ik-confetti' }); document.body.appendChild(c);
    const x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const colors = ['#ff7a45', '#ffb547', '#22a565', '#3b82f6', '#a855f7', '#ec4899'];
    const parts = Array.from({ length: 120 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight * .45, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: IK.pick(colors), a: Math.random() * 6 }));
    let f = 0;
    (function step() {
      x.clearRect(0, 0, c.width, c.height);
      parts.forEach((p) => { p.vy += 0.42; p.x += p.vx; p.y += p.vy; p.a += 0.2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); x.restore(); });
      if (++f < 110) requestAnimationFrame(step); else c.remove();
    })();
  };

  /* ── Yıldızlar ── */
  IK.stars = IK.store.get('stars', 0);
  const paintStars = () => { const s = IK.$('#ik-stars'); if (s) s.textContent = IK.stars; };
  IK.addStar = function (n) { IK.stars += n || 1; IK.store.set('stars', IK.stars); paintStars(); };
  document.addEventListener('DOMContentLoaded', paintStars);

  /* Doğru / yanlış için tek çağrı */
  IK.right = function (msg, stars) { IK.beep('ok'); IK.addStar(stars == null ? 1 : stars); if (msg) IK.toast(msg, 'ok'); };
  IK.wrong = function (msg) { IK.beep('bad'); if (msg) IK.toast(msg, 'bad'); };
  IK.win = function (msg) { IK.beep('ok'); IK.confetti(); IK.addStar(3); IK.toast(msg || 'Harika! 🎉', 'ok'); };

  /* ── Sürükle-bırak (fare + dokunmatik) ──
     IK.drag(el, { zones: '.hedef', onDrop(el, zone), onMove(x,y), data })
     zone bulunamazsa onDrop(el, null) çağrılır. */
  IK.drag = function (el, opt) {
    el.classList.add('ik-drag');
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const dx = e.clientX - r.left, dy = e.clientY - r.top;
      const ghost = el.cloneNode(true);
      ghost.classList.add('ik-ghost'); ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
      ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px'; ghost.style.margin = 0;
      document.body.appendChild(ghost);
      el.style.opacity = .35;
      let hover = null;
      const zoneAt = (cx, cy) => { const t = document.elementFromPoint(cx, cy); return t && opt.zones ? t.closest(opt.zones) : null; };
      const move = (ev) => {
        ghost.style.left = ev.clientX - dx + 'px'; ghost.style.top = ev.clientY - dy + 'px';
        const z = zoneAt(ev.clientX, ev.clientY);
        if (z !== hover) { hover && hover.classList.remove('ik-hover'); hover = z; hover && hover.classList.add('ik-hover'); }
        opt.onMove && opt.onMove(ev.clientX, ev.clientY);
      };
      const up = (ev) => {
        document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
        ghost.remove(); el.style.opacity = '';
        hover && hover.classList.remove('ik-hover');
        opt.onDrop && opt.onDrop(el, zoneAt(ev.clientX, ev.clientY), ev);
      };
      document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
    });
  };

  window.IK = IK;
})();
