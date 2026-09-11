// src/constants/activities-10-geometri.ts
// 10. Sınıf Matematik — Yeni Maarif Modeli "Geometrik Şekiller" Ünitesi Etkinlikleri
// Yüksek etkileşimli, dokunmatik uyumlu, canlı hesaplamalı dinamik geometri simülasyonları
import type { Activity } from '../types';

/* ─────────────────────────────────────────────────────────────────────────────
   1. DİK ÜÇGENDE TRİGONOMETRİK ORANLAR VE TRİGONOMETRİK ÖZDEŞLİKLER
   ───────────────────────────────────────────────────────────────────────────── */
const HTML_TRIGONOMETRI = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dik Üçgende Trigonometrik Oranlar ve Özdeşlikler</title>
<style>
  :root {
    --bg-main: #0f172a;
    --bg-card: #1e293b;
    --border: #334155;
    --primary: #38bdf8;
    --accent: #f59e0b;
    --success: #10b981;
    --purple: #a855f7;
    --text: #f8fafc;
    --text-muted: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; }
  body { background: var(--bg-main); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
  header { background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .badge { background: rgba(56, 189, 248, 0.15); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px; }
  .title-group h1 { font-size: 17px; font-weight: 700; color: #fff; }
  .title-group p { font-size: 12px; color: var(--text-muted); }
  
  .tabs { display: flex; gap: 6px; background: rgba(15, 23, 42, 0.6); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
  .tab-btn { background: transparent; border: none; color: var(--text-muted); padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .tab-btn.active { background: var(--primary); color: #0f172a; font-weight: 700; }

  .layout { display: grid; grid-template-columns: 1fr 340px; flex: 1; min-height: 0; }
  @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }

  .canvas-container { position: relative; width: 100%; height: 100%; min-height: 480px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%); }
  svg { width: 100%; height: 100%; touch-action: none; }

  .sidebar { background: var(--bg-card); border-left: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
  .card { background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--primary); display: flex; align-items: center; justify-content: space-between; }
  
  .ratio-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .ratio-box { background: rgba(30, 41, 59, 0.7); border: 1px solid var(--border); border-radius: 10px; padding: 10px; text-align: center; }
  .ratio-name { font-size: 11px; color: var(--text-muted); font-weight: 600; }
  .ratio-calc { font-size: 11px; color: #cbd5e1; margin-top: 2px; }
  .ratio-val { font-size: 16px; font-weight: 800; color: #fff; margin-top: 2px; }
  .ratio-box.sin .ratio-val { color: var(--primary); }
  .ratio-box.cos .ratio-val { color: var(--success); }
  .ratio-box.tan .ratio-val { color: var(--accent); }
  .ratio-box.cot .ratio-val { color: var(--purple); }

  .identity-pill { background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 10px; padding: 10px; text-align: center; font-size: 13px; font-weight: 600; color: #e2e8f0; line-height: 1.5; }
  .identity-calc { font-size: 12px; color: #a855f7; font-weight: 700; margin-top: 4px; }

  .control-group { display: flex; flex-direction: column; gap: 6px; }
  .control-group label { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #cbd5e1; }
  input[type=range] { width: 100%; accent-color: var(--primary); cursor: pointer; }

  .quick-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .btn-sm { background: rgba(51, 65, 85, 0.6); border: 1px solid var(--border); color: #cbd5e1; font-size: 11px; font-weight: 600; padding: 5px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
  .btn-sm:hover { background: var(--border); color: #fff; }

  .vertex-dot { cursor: grab; transition: fill 0.2s, r 0.2s; }
  .vertex-dot:hover { r: 10; fill: #fbbf24; }
  .vertex-dot:active { cursor: grabbing; r: 11; }
  .helper-text { font-size: 11px; color: var(--text-muted); line-height: 1.4; }
</style>
</head>
<body>

<header>
  <div class="title-group">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
      <span class="badge">10. Sınıf Maarif Modeli</span>
      <span style="font-size:12px; color:#38bdf8; font-weight:600;">Geometrik Şekiller</span>
    </div>
    <h1>Dik Üçgende Trigonometrik Oranlar ve Özdeşlikler Laboratuvarı</h1>
  </div>
  <div class="tabs">
    <button class="tab-btn active" onclick="switchView('triangle')">Dik Üçgen Modeli</button>
    <button class="tab-btn" onclick="switchView('circle')">Birim Çember Modeli</button>
  </div>
</header>

<div class="layout">
  <div class="canvas-container">
    <svg id="svgCanvas" viewBox="0 0 650 480">
      <defs>
        <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g id="gridLayer" opacity="0.12"></g>
      <g id="shapeLayer"></g>
      <g id="labelLayer"></g>
      <g id="interactiveLayer"></g>
    </svg>
  </div>

  <div class="sidebar">
    <div class="card">
      <div class="card-title">
        <span>Canlı Kontroller</span>
        <span id="angleBadge" style="color:var(--primary); font-size:14px; font-weight:800;">36.9°</span>
      </div>
      <div class="control-group">
        <label><span>Açı (α)</span><span id="angleValText">37°</span></label>
        <input type="range" id="angleSlider" min="10" max="80" value="37" step="1">
      </div>
      <div class="control-group">
        <label><span>Üçgen Boyutu (Ölçek)</span><span id="scaleValText">1.0x</span></label>
        <input type="range" id="scaleSlider" min="0.6" max="1.5" value="1.0" step="0.05">
      </div>
      <div class="quick-btns">
        <button class="btn-sm" onclick="setPreset(30)">30°</button>
        <button class="btn-sm" onclick="setPreset(45)">45°</button>
        <button class="btn-sm" onclick="setPreset(60)">60°</button>
        <button class="btn-sm" onclick="setPreset(36.87)">3-4-5 Üçgeni</button>
      </div>
      <p class="helper-text">💡 Tepe noktasını (A) veya açı sürgüsünü serbestçe hareket ettirin. Boyut değişse dahi oranların sabit kaldığını gözlemleyin.</p>
    </div>

    <div class="card">
      <div class="card-title">Trigonometrik Oranlar</div>
      <div class="ratio-grid">
        <div class="ratio-box sin">
          <div class="ratio-name">sin α = Karşı / Hipotenüs</div>
          <div class="ratio-calc" id="sinCalc">3.00 / 5.00</div>
          <div class="ratio-val" id="sinVal">0.600</div>
        </div>
        <div class="ratio-box cos">
          <div class="ratio-name">cos α = Komşu / Hipotenüs</div>
          <div class="ratio-calc" id="cosCalc">4.00 / 5.00</div>
          <div class="ratio-val" id="cosVal">0.800</div>
        </div>
        <div class="ratio-box tan">
          <div class="ratio-name">tan α = Karşı / Komşu</div>
          <div class="ratio-calc" id="tanCalc">3.00 / 4.00</div>
          <div class="ratio-val" id="tanVal">0.750</div>
        </div>
        <div class="ratio-box cot">
          <div class="ratio-name">cot α = Komşu / Karşı</div>
          <div class="ratio-calc" id="cotCalc">4.00 / 3.00</div>
          <div class="ratio-val" id="cotVal">1.333</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Temel Özdeşlik Doğrulayıcı</div>
      <div class="identity-pill">
        <div>sin²α + cos²α = 1</div>
        <div class="identity-calc" id="pythIdentity">(0.60)² + (0.80)² = 0.36 + 0.64 = 1.000 ✓</div>
      </div>
      <div class="identity-pill" style="margin-top:6px; background:rgba(245, 158, 11, 0.1); border-color:rgba(245, 158, 11, 0.3);">
        <div>tan α · cot α = 1</div>
        <div class="identity-calc" style="color:var(--accent);" id="tanCotIdentity">0.750 · 1.333 = 1.000 ✓</div>
      </div>
      <p class="helper-text" style="margin-top:6px;">Maarif Modeli Keşfi: Üçgenin kenarları ne kadar büyürse büyüsün, açı değişmediği sürece oranlar üçgen benzerliği gereği sabittir.</p>
    </div>
  </div>
</div>

<script>
let currentMode = 'triangle';
let alphaDeg = 36.87;
let scale = 1.0;
const svg = document.getElementById('svgCanvas');
const shapeLayer = document.getElementById('shapeLayer');
const labelLayer = document.getElementById('labelLayer');
const interactiveLayer = document.getElementById('interactiveLayer');

function switchView(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && mode === 'triangle') || (i === 1 && mode === 'circle'));
  });
  render();
}

function setPreset(deg) {
  alphaDeg = deg;
  document.getElementById('angleSlider').value = Math.round(deg);
  render();
}

document.getElementById('angleSlider').addEventListener('input', (e) => {
  alphaDeg = parseFloat(e.target.value);
  render();
});

document.getElementById('scaleSlider').addEventListener('input', (e) => {
  scale = parseFloat(e.target.value);
  document.getElementById('scaleValText').innerText = scale.toFixed(2) + 'x';
  render();
});

function render() {
  const rad = (alphaDeg * Math.PI) / 180;
  const sinV = Math.sin(rad);
  const cosV = Math.cos(rad);
  const tanV = Math.tan(rad);
  const cotV = 1 / Math.tan(rad);

  document.getElementById('angleBadge').innerText = alphaDeg.toFixed(1) + '°';
  document.getElementById('angleValText').innerText = alphaDeg.toFixed(1) + '°';

  const hyp = 5 * scale;
  const opp = hyp * sinV;
  const adj = hyp * cosV;

  document.getElementById('sinCalc').innerText = opp.toFixed(2) + ' / ' + hyp.toFixed(2);
  document.getElementById('sinVal').innerText = sinV.toFixed(3);
  document.getElementById('cosCalc').innerText = adj.toFixed(2) + ' / ' + hyp.toFixed(2);
  document.getElementById('cosVal').innerText = cosV.toFixed(3);
  document.getElementById('tanCalc').innerText = opp.toFixed(2) + ' / ' + adj.toFixed(2);
  document.getElementById('tanVal').innerText = tanV.toFixed(3);
  document.getElementById('cotCalc').innerText = adj.toFixed(2) + ' / ' + opp.toFixed(2);
  document.getElementById('cotVal').innerText = cotV.toFixed(3);

  const sinSq = (sinV * sinV).toFixed(3);
  const cosSq = (cosV * cosV).toFixed(3);
  document.getElementById('pythIdentity').innerText = '(' + sinV.toFixed(2) + ')² + (' + cosV.toFixed(2) + ')² = ' + sinSq + ' + ' + cosSq + ' = 1.000 ✓';
  document.getElementById('tanCotIdentity').innerText = tanV.toFixed(2) + ' · ' + cotV.toFixed(2) + ' = 1.000 ✓';

  shapeLayer.innerHTML = '';
  labelLayer.innerHTML = '';
  interactiveLayer.innerHTML = '';

  if (currentMode === 'triangle') {
    renderTriangleMode(rad, sinV, cosV, hyp, opp, adj);
  } else {
    renderCircleMode(rad, sinV, cosV);
  }
}

function renderTriangleMode(rad, sinV, cosV, hyp, opp, adj) {
  const ox = 110;
  const oy = 380;
  const basePx = 280 * scale * cosV;
  const heightPx = 280 * scale * sinV;

  const B = { x: ox, y: oy };
  const C = { x: ox + basePx, y: oy };
  const A = { x: ox + basePx, y: oy - heightPx };

  const triPath = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  triPath.setAttribute('points', \`\${B.x},\${B.y} \${C.x},\${C.y} \${A.x},\${A.y}\`);
  triPath.setAttribute('fill', 'rgba(56, 189, 248, 0.08)');
  triPath.setAttribute('stroke', '#38bdf8');
  triPath.setAttribute('stroke-width', '3');
  shapeLayer.appendChild(triPath);

  const sq = 18;
  const rightAngle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  rightAngle.setAttribute('d', \`M \${C.x - sq} \${C.y} L \${C.x - sq} \${C.y - sq} L \${C.x} \${C.y - sq}\`);
  rightAngle.setAttribute('fill', 'none');
  rightAngle.setAttribute('stroke', '#94a3b8');
  rightAngle.setAttribute('stroke-width', '2');
  shapeLayer.appendChild(rightAngle);

  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('cx', C.x - sq/2);
  dot.setAttribute('cy', C.y - sq/2);
  dot.setAttribute('r', '2.5');
  dot.setAttribute('fill', '#94a3b8');
  shapeLayer.appendChild(dot);

  const arcR = 40;
  const arcX = B.x + arcR * Math.cos(0);
  const arcY = B.y;
  const endArcX = B.x + arcR * Math.cos(rad);
  const endArcY = B.y - arcR * Math.sin(rad);

  const arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arcPath.setAttribute('d', \`M \${arcX} \${arcY} A \${arcR} \${arcR} 0 0 0 \${endArcX} \${endArcY}\`);
  arcPath.setAttribute('fill', 'none');
  arcPath.setAttribute('stroke', '#f59e0b');
  arcPath.setAttribute('stroke-width', '2.5');
  shapeLayer.appendChild(arcPath);

  addText(B.x + 50, B.y - 12, 'α = ' + alphaDeg.toFixed(1) + '°', '#f59e0b', '13px', 'bold');
  addText(B.x - 16, B.y + 12, 'B', '#fff', '15px', 'bold');
  addText(C.x + 12, C.y + 12, 'C (90°)', '#fff', '15px', 'bold');
  addText(A.x + 10, A.y - 10, 'A', '#fff', '16px', 'bold');

  const midAB = { x: (B.x + A.x) / 2 - 25, y: (B.y + A.y) / 2 - 15 };
  addText(midAB.x, midAB.y, 'Hipotenüs (c = ' + hyp.toFixed(1) + ')', '#38bdf8', '13px', 'bold');

  const midAC = { x: C.x + 16, y: (C.y + A.y) / 2 };
  addText(midAC.x, midAC.y, 'Karşı (b = ' + opp.toFixed(1) + ')', '#f59e0b', '13px', 'bold', 'start');

  const midBC = { x: (B.x + C.x) / 2, y: B.y + 24 };
  addText(midBC.x, midBC.y, 'Komşu (a = ' + adj.toFixed(1) + ')', '#10b981', '13px', 'bold', 'middle');

  const handleA = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  handleA.setAttribute('cx', A.x);
  handleA.setAttribute('cy', A.y);
  handleA.setAttribute('r', '8');
  handleA.setAttribute('fill', '#38bdf8');
  handleA.setAttribute('stroke', '#fff');
  handleA.setAttribute('stroke-width', '2.5');
  handleA.setAttribute('class', 'vertex-dot');
  interactiveLayer.appendChild(handleA);

  enableDrag(handleA, B);
}

function renderCircleMode(rad, sinV, cosV) {
  const cx = 325;
  const cy = 240;
  const r = 160;

  const axisColor = '#475569';
  const axLineX = createLine(cx - r - 40, cy, cx + r + 40, cy, axisColor, 1.5);
  const axLineY = createLine(cx, cy + r + 30, cx, cy - r - 30, axisColor, 1.5);
  shapeLayer.appendChild(axLineX);
  shapeLayer.appendChild(axLineY);

  addText(cx + r + 50, cy + 4, 'x (cos)', '#10b981', '13px', 'bold');
  addText(cx + 8, cy - r - 35, 'y (sin)', '#38bdf8', '13px', 'bold');

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', cx);
  circle.setAttribute('cy', cy);
  circle.setAttribute('r', r);
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', '#334155');
  circle.setAttribute('stroke-width', '2');
  circle.setAttribute('stroke-dasharray', '4 4');
  shapeLayer.appendChild(circle);

  const px = cx + r * cosV;
  const py = cy - r * sinV;

  const projY = createLine(px, py, px, cy, '#38bdf8', 2.5);
  projY.setAttribute('stroke-dasharray', '3 3');
  shapeLayer.appendChild(projY);

  const projX = createLine(cx, cy, px, cy, '#10b981', 3);
  shapeLayer.appendChild(projX);

  const radiusLine = createLine(cx, cy, px, py, '#f59e0b', 3);
  shapeLayer.appendChild(radiusLine);

  addText(px + 12, py - 8, 'P(cos α, sin α) = (' + cosV.toFixed(2) + ', ' + sinV.toFixed(2) + ')', '#fff', '13px', 'bold');
  addText((cx + px) / 2, cy + 18, 'cos α = ' + cosV.toFixed(2), '#10b981', '12px', 'bold', 'middle');
  addText(px + 10, (cy + py) / 2, 'sin α = ' + sinV.toFixed(2), '#38bdf8', '12px', 'bold', 'start');
  addText((cx + px) / 2 - 15, (cy + py) / 2 - 15, 'r = 1', '#f59e0b', '12px', 'bold');

  const handleP = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  handleP.setAttribute('cx', px);
  handleP.setAttribute('cy', py);
  handleP.setAttribute('r', '9');
  handleP.setAttribute('fill', '#f59e0b');
  handleP.setAttribute('stroke', '#fff');
  handleP.setAttribute('stroke-width', '2.5');
  handleP.setAttribute('class', 'vertex-dot');
  interactiveLayer.appendChild(handleP);

  enableCircleDrag(handleP, cx, cy);
}

function enableDrag(el, origin) {
  let isDragging = false;
  el.addEventListener('pointerdown', (e) => {
    isDragging = true;
    el.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const pt = svgPoint(e);
    const dx = pt.x - origin.x;
    const dy = origin.y - pt.y;
    if (dx > 20 && dy > 10) {
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      deg = Math.max(10, Math.min(80, deg));
      alphaDeg = deg;
      document.getElementById('angleSlider').value = Math.round(deg);
      render();
    }
  });
  window.addEventListener('pointerup', () => { isDragging = false; });
}

function enableCircleDrag(el, cx, cy) {
  let isDragging = false;
  el.addEventListener('pointerdown', (e) => {
    isDragging = true;
    el.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const pt = svgPoint(e);
    const dx = pt.x - cx;
    const dy = cy - pt.y;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg < 5) deg = 5;
    if (deg > 85) deg = 85;
    alphaDeg = deg;
    document.getElementById('angleSlider').value = Math.round(deg);
    render();
  });
  window.addEventListener('pointerup', () => { isDragging = false; });
}

function svgPoint(e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

function createLine(x1, y1, x2, y2, stroke, width) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', stroke);
  line.setAttribute('stroke-width', width);
  return line;
}

function addText(x, y, text, fill, size, weight='normal', anchor='start') {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('fill', fill);
  t.setAttribute('font-size', size);
  t.setAttribute('font-weight', weight);
  t.setAttribute('text-anchor', anchor);
  t.textContent = text;
  labelLayer.appendChild(t);
}

render();
</script>
</body>
</html>`;


/* ─────────────────────────────────────────────────────────────────────────────
   2. SİNÜS VE KOSİNÜS TEOREMLERİ
   ───────────────────────────────────────────────────────────────────────────── */
const HTML_SINUS_KOSINUS = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sinüs ve Kosinüs Teoremleri Kaşifi</title>
<style>
  :root {
    --bg-main: #090d16;
    --bg-card: #151c2e;
    --border: #23304d;
    --primary: #38bdf8;
    --accent: #f59e0b;
    --success: #10b981;
    --rose: #f43f5e;
    --text: #f8fafc;
    --text-muted: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; }
  body { background: var(--bg-main); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
  header { background: rgba(21, 28, 46, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .badge { background: rgba(56, 189, 248, 0.15); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; }
  .title-group h1 { font-size: 17px; font-weight: 700; color: #fff; }
  .tabs { display: flex; gap: 6px; background: rgba(9, 13, 22, 0.7); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
  .tab-btn { background: transparent; border: none; color: var(--text-muted); padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .tab-btn.active { background: var(--primary); color: #090d16; font-weight: 700; }

  .layout { display: grid; grid-template-columns: 1fr 360px; flex: 1; min-height: 0; }
  @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }

  .canvas-container { position: relative; width: 100%; height: 100%; min-height: 500px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #151c2e 0%, #090d16 100%); }
  svg { width: 100%; height: 100%; touch-action: none; }

  .sidebar { background: var(--bg-card); border-left: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
  .card { background: rgba(9, 13, 22, 0.5); border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--primary); }

  .formula-box { background: rgba(35, 48, 77, 0.5); border: 1px solid var(--border); border-radius: 10px; padding: 12px; font-family: monospace; font-size: 13px; line-height: 1.6; }
  .formula-highlight { color: var(--accent); font-weight: 700; }
  .pill-row { display: flex; gap: 6px; }
  .pill { flex: 1; background: rgba(21, 28, 46, 0.8); border: 1px solid var(--border); border-radius: 8px; padding: 8px; text-align: center; }
  .pill-lbl { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
  .pill-val { font-size: 14px; font-weight: 800; color: #fff; margin-top: 2px; }

  .theorem-state { padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-align: center; }
  .state-right { background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
  .state-acute { background: rgba(56, 189, 248, 0.15); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); }
  .state-obtuse { background: rgba(244, 63, 94, 0.15); color: var(--rose); border: 1px solid rgba(244, 63, 94, 0.3); }

  .vertex-handle { cursor: grab; transition: r 0.2s, stroke-width 0.2s; }
  .vertex-handle:hover { r: 12; stroke-width: 4; }
  .vertex-handle:active { cursor: grabbing; r: 14; }
  .btn-grp { display: flex; gap: 6px; flex-wrap: wrap; }
  .btn { background: rgba(35, 48, 77, 0.6); border: 1px solid var(--border); color: #cbd5e1; font-size: 11px; font-weight: 600; padding: 6px 10px; border-radius: 6px; cursor: pointer; }
  .btn:hover { background: var(--primary); color: #090d16; }
</style>
</head>
<body>

<header>
  <div class="title-group">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
      <span class="badge">10. Sınıf Geometri</span>
      <span style="font-size:12px; color:#38bdf8; font-weight:600;">Geometrik Şekiller</span>
    </div>
    <h1>Sinüs ve Kosinüs Teoremleri Kaşifi</h1>
  </div>
  <div class="tabs">
    <button class="tab-btn active" onclick="setMode('cosine')">Kosinüs Teoremi</button>
    <button class="tab-btn" onclick="setMode('sine')">Sinüs Teoremi & Çevrel Çember</button>
  </div>
</header>

<div class="layout">
  <div class="canvas-container">
    <svg id="svg" viewBox="0 0 650 500">
      <defs>
        <radialGradient id="circumGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g id="circumLayer"></g>
      <g id="polyLayer"></g>
      <g id="textLayer"></g>
      <g id="handleLayer"></g>
    </svg>
  </div>

  <div class="sidebar">
    <div class="card">
      <div class="card-title">Örnek Üçgen Konumları</div>
      <div class="btn-grp">
        <button class="btn" onclick="presetRight()">Dik Üçgen (90° - Pisagor)</button>
        <button class="btn" onclick="presetEqui()">Eşkenar Üçgen (60°)</button>
        <button class="btn" onclick="presetObtuse()">Geniş Açılı Üçgen (120°)</button>
      </div>
      <p style="font-size:11px; color:var(--text-muted); line-height:1.4;">💡 A, B ve C köşelerini tutup dilediğiniz gibi sürükleyin. Açılar ve kenarlar anlık olarak yeniden hesaplanır.</p>
    </div>

    <div id="cosinePanel" class="card">
      <div class="card-title">Kosinüs Teoremi: a² = b² + c² - 2bc·cos(A)</div>
      <div id="angleStateBadge" class="theorem-state state-acute">A Açısı: Dar Açı (&lt;90°)</div>

      <div class="formula-box">
        <div><strong>a²:</strong> <span id="val_a2">25.00</span></div>
        <div><strong>b² + c²:</strong> <span id="val_b2c2">25.00</span></div>
        <div><strong>-2bc·cos(A):</strong> <span id="val_diff">0.00</span></div>
        <hr style="border:none; border-top:1px solid var(--border); margin:6px 0;">
        <div style="font-weight:700; color:var(--primary);">a = √(b² + c² - 2bc·cos A)</div>
      </div>

      <div class="pill-row">
        <div class="pill"><div class="pill-lbl">A Açısı</div><div class="pill-val" id="disp_angA" style="color:var(--accent);">60.0°</div></div>
        <div class="pill"><div class="pill-lbl">cos(A)</div><div class="pill-val" id="disp_cosA">0.500</div></div>
      </div>
      <p style="font-size:11px; color:var(--text-muted);">A = 90° olduğunda cos(90°) = 0 olur ve teorem tam Pisagor teoremine (a² = b² + c²) indirgenir.</p>
    </div>

    <div id="sinePanel" class="card" style="display:none;">
      <div class="card-title">Sinüs Teoremi: a/sin(A) = b/sin(B) = c/sin(C) = 2R</div>
      <div class="formula-box">
        <div><strong>a / sin(A):</strong> <span id="disp_ratioA" class="formula-highlight">12.40</span></div>
        <div><strong>b / sin(B):</strong> <span id="disp_ratioB" class="formula-highlight">12.40</span></div>
        <div><strong>c / sin(C):</strong> <span id="disp_ratioC" class="formula-highlight">12.40</span></div>
        <hr style="border:none; border-top:1px solid var(--border); margin:6px 0;">
        <div style="color:var(--success); font-weight:700;">Çevrel Çap (2R): <span id="disp_2R">12.40</span></div>
      </div>
      <div class="pill-row">
        <div class="pill"><div class="pill-lbl">Çevrel Yarıçap (R)</div><div class="pill-val" id="disp_R" style="color:var(--success);">6.20</div></div>
      </div>
      <p style="font-size:11px; color:var(--text-muted);">Maarif Modeli Keşfi: Üçgenin kenarlarının karşılarındaki açıların sinüslerine oranı hep sabittir ve çevrel çemberin çapına (2R) eşittir.</p>
    </div>
  </div>
</div>

<script>
let mode = 'cosine';
const svg = document.getElementById('svg');
const circumLayer = document.getElementById('circumLayer');
const polyLayer = document.getElementById('polyLayer');
const textLayer = document.getElementById('textLayer');
const handleLayer = document.getElementById('handleLayer');

let A = { x: 320, y: 120 };
let B = { x: 150, y: 390 };
let C = { x: 490, y: 390 };

function setMode(m) {
  mode = m;
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && m === 'cosine') || (i === 1 && m === 'sine'));
  });
  document.getElementById('cosinePanel').style.display = m === 'cosine' ? 'flex' : 'none';
  document.getElementById('sinePanel').style.display = m === 'sine' ? 'flex' : 'none';
  render();
}

function presetRight() {
  A = { x: 150, y: 150 };
  B = { x: 150, y: 390 };
  C = { x: 470, y: 390 };
  render();
}
function presetEqui() {
  A = { x: 320, y: 125 };
  B = { x: 160, y: 400 };
  C = { x: 480, y: 400 };
  render();
}
function presetObtuse() {
  A = { x: 260, y: 220 };
  B = { x: 130, y: 390 };
  C = { x: 520, y: 390 };
  render();
}

function dist(p1, p2) { return Math.hypot(p2.x - p1.x, p2.y - p1.y); }

function getAngles(a, b, c) {
  const cosA = Math.max(-1, Math.min(1, (b*b + c*c - a*a) / (2*b*c)));
  const cosB = Math.max(-1, Math.min(1, (a*a + c*c - b*b) / (2*a*c)));
  const cosC = Math.max(-1, Math.min(1, (a*a + b*b - c*c) / (2*a*b)));
  return {
    A: Math.acos(cosA),
    B: Math.acos(cosB),
    C: Math.acos(cosC),
    cosA, cosB, cosC
  };
}

function getCircumcenter(A, B, C) {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  if (Math.abs(d) < 1e-5) return null;
  const ux = ((A.x*A.x + A.y*A.y) * (B.y - C.y) + (B.x*B.x + B.y*B.y) * (C.y - A.y) + (C.x*C.x + C.y*C.y) * (A.y - B.y)) / d;
  const uy = ((A.x*A.x + A.y*A.y) * (C.x - B.x) + (B.x*B.x + B.y*B.y) * (A.x - C.x) + (C.x*C.x + C.y*C.y) * (B.x - A.x)) / d;
  return { x: ux, y: uy, r: Math.hypot(A.x - ux, A.y - uy) };
}

function render() {
  polyLayer.innerHTML = '';
  textLayer.innerHTML = '';
  handleLayer.innerHTML = '';
  circumLayer.innerHTML = '';

  const aPx = dist(B, C);
  const bPx = dist(A, C);
  const cPx = dist(A, B);

  const scale = 32;
  const a = aPx / scale;
  const b = bPx / scale;
  const c = cPx / scale;

  const angs = getAngles(a, b, c);
  const degA = (angs.A * 180) / Math.PI;
  const degB = (angs.B * 180) / Math.PI;
  const degC = (angs.C * 180) / Math.PI;

  const circum = getCircumcenter(A, B, C);
  if (mode === 'sine' && circum && circum.r < 800) {
    const cCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cCircle.setAttribute('cx', circum.x);
    cCircle.setAttribute('cy', circum.y);
    cCircle.setAttribute('r', circum.r);
    cCircle.setAttribute('fill', 'url(#circumGlow)');
    cCircle.setAttribute('stroke', '#10b981');
    cCircle.setAttribute('stroke-width', '2');
    cCircle.setAttribute('stroke-dasharray', '5 4');
    circumLayer.appendChild(cCircle);

    const cDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cDot.setAttribute('cx', circum.x);
    cDot.setAttribute('cy', circum.y);
    cDot.setAttribute('r', '4');
    cDot.setAttribute('fill', '#10b981');
    circumLayer.appendChild(cDot);
    addText(circum.x + 8, circum.y - 8, 'O (Çevrel Merkez)', '#10b981', '11px', 'bold');
  }

  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', \`\${A.x},\${A.y} \${B.x},\${B.y} \${C.x},\${C.y}\`);
  poly.setAttribute('fill', 'rgba(56, 189, 248, 0.08)');
  poly.setAttribute('stroke', '#38bdf8');
  poly.setAttribute('stroke-width', '3.5');
  polyLayer.appendChild(poly);

  drawAngleArc(A, B, C, degA, '#f59e0b');

  const midBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 + 18 };
  const midAC = { x: (A.x + C.x) / 2 + 14, y: (A.y + C.y) / 2 };
  const midAB = { x: (A.x + B.x) / 2 - 20, y: (A.y + B.y) / 2 };

  addText(midBC.x, midBC.y, 'a = ' + a.toFixed(1), '#fff', '13px', 'bold', 'middle');
  addText(midAC.x, midAC.y, 'b = ' + b.toFixed(1), '#fff', '13px', 'bold', 'start');
  addText(midAB.x, midAB.y, 'c = ' + c.toFixed(1), '#fff', '13px', 'bold', 'end');

  addText(A.x, A.y - 18, 'A (' + degA.toFixed(1) + '°)', '#f59e0b', '14px', 'bold', 'middle');
  addText(B.x - 14, B.y + 14, 'B (' + degB.toFixed(1) + '°)', '#38bdf8', '14px', 'bold', 'end');
  addText(C.x + 14, C.y + 14, 'C (' + degC.toFixed(1) + '°)', '#38bdf8', '14px', 'bold', 'start');

  createHandle(A, 'A');
  createHandle(B, 'B');
  createHandle(C, 'C');

  if (mode === 'cosine') {
    const a2 = a * a;
    const b2c2 = b * b + c * c;
    const diff = -2 * b * c * angs.cosA;

    document.getElementById('val_a2').innerText = a2.toFixed(2);
    document.getElementById('val_b2c2').innerText = b2c2.toFixed(2);
    document.getElementById('val_diff').innerText = (diff >= 0 ? '+' : '') + diff.toFixed(2);
    document.getElementById('disp_angA').innerText = degA.toFixed(1) + '°';
    document.getElementById('disp_cosA').innerText = angs.cosA.toFixed(3);

    const badge = document.getElementById('angleStateBadge');
    if (Math.abs(degA - 90) < 1.0) {
      badge.className = 'theorem-state state-right';
      badge.innerText = 'A Açısı = 90° (Tam Pisagor: a² = b² + c²)';
    } else if (degA < 90) {
      badge.className = 'theorem-state state-acute';
      badge.innerText = 'A Açısı: Dar Açı (cos A > 0  ⟹  a² < b² + c²)';
    } else {
      badge.className = 'theorem-state state-obtuse';
      badge.innerText = 'A Açısı: Geniş Açı (cos A < 0  ⟹  a² > b² + c²)';
    }
  } else {
    const sinA = Math.sin(angs.A);
    const sinB = Math.sin(angs.B);
    const sinC = Math.sin(angs.C);

    const rA = a / sinA;
    const rB = b / sinB;
    const rC = c / sinC;
    const R = circum ? circum.r / scale : rA / 2;

    document.getElementById('disp_ratioA').innerText = rA.toFixed(2);
    document.getElementById('disp_ratioB').innerText = rB.toFixed(2);
    document.getElementById('disp_ratioC').innerText = rC.toFixed(2);
    document.getElementById('disp_2R').innerText = (2 * R).toFixed(2);
    document.getElementById('disp_R').innerText = R.toFixed(2);
  }
}

function drawAngleArc(V, P1, P2, deg, color) {
  const r = 32;
  const a1 = Math.atan2(P1.y - V.y, P1.x - V.x);
  const a2 = Math.atan2(P2.y - V.y, P2.x - V.x);
  const startX = V.x + r * Math.cos(a1);
  const startY = V.y + r * Math.sin(a1);
  const endX = V.x + r * Math.cos(a2);
  const endY = V.y + r * Math.sin(a2);

  const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  arc.setAttribute('d', \`M \${startX} \${startY} A \${r} \${r} 0 0 1 \${endX} \${endY}\`);
  arc.setAttribute('fill', 'none');
  arc.setAttribute('stroke', color);
  arc.setAttribute('stroke-width', '2.5');
  polyLayer.appendChild(arc);
}

function createHandle(pt, name) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', pt.x);
  c.setAttribute('cy', pt.y);
  c.setAttribute('r', '9');
  c.setAttribute('fill', name === 'A' ? '#f59e0b' : '#38bdf8');
  c.setAttribute('stroke', '#fff');
  c.setAttribute('stroke-width', '2.5');
  c.setAttribute('class', 'vertex-handle');
  handleLayer.appendChild(c);

  let isDrag = false;
  c.addEventListener('pointerdown', (e) => {
    isDrag = true;
    c.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDrag) return;
    const p = svgPoint(e);
    pt.x = Math.max(40, Math.min(610, p.x));
    pt.y = Math.max(40, Math.min(460, p.y));
    render();
  });
  window.addEventListener('pointerup', () => { isDrag = false; });
}

function svgPoint(e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

function addText(x, y, text, fill, size, weight='normal', anchor='start') {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('fill', fill);
  t.setAttribute('font-size', size);
  t.setAttribute('font-weight', weight);
  t.setAttribute('text-anchor', anchor);
  t.textContent = text;
  textLayer.appendChild(t);
}

render();
</script>
</body>
</html>`;


/* ─────────────────────────────────────────────────────────────────────────────
   3. ÜÇGENDE YARDIMCI ELEMANLAR (AÇIORTAY, KENARORTAY, YÜKSEKLİK & EULER DOĞRUSU)
   ───────────────────────────────────────────────────────────────────────────── */
const HTML_YARDIMCI_ELEMANLAR = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Üçgende Yardımcı Elemanlar ve Özel Merkezler</title>
<style>
  :root {
    --bg-main: #0b1120;
    --bg-card: #1e293b;
    --border: #334155;
    --g-color: #38bdf8;
    --i-color: #f59e0b;
    --h-color: #f43f5e;
    --o-color: #10b981;
    --euler: #eab308;
    --text: #f8fafc;
    --text-muted: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; }
  body { background: var(--bg-main); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
  header { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .badge { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; }
  .title-group h1 { font-size: 17px; font-weight: 700; color: #fff; }

  .layout { display: grid; grid-template-columns: 1fr 350px; flex: 1; min-height: 0; }
  @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }

  .canvas-container { position: relative; width: 100%; height: 100%; min-height: 520px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #1e293b 0%, #0b1120 100%); }
  svg { width: 100%; height: 100%; touch-action: none; }

  .sidebar { background: var(--bg-card); border-left: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
  .card { background: rgba(11, 17, 32, 0.6); border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #38bdf8; }

  .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; border: 1px solid var(--border); background: rgba(30, 41, 59, 0.5); cursor: pointer; transition: all 0.15s; }
  .toggle-row:hover { background: rgba(51, 65, 85, 0.6); }
  .toggle-lbl { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: #e2e8f0; }
  .dot-marker { width: 10px; height: 10px; border-radius: 50%; }
  input[type=checkbox] { accent-color: #38bdf8; width: 16px; height: 16px; cursor: pointer; }

  .preset-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .btn-sm { background: rgba(51, 65, 85, 0.6); border: 1px solid var(--border); color: #cbd5e1; font-size: 11px; font-weight: 600; padding: 5px 9px; border-radius: 6px; cursor: pointer; }
  .btn-sm:hover { background: #38bdf8; color: #0b1120; font-weight: 700; }

  .info-badge { font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border); padding: 10px; border-radius: 10px; }
  .vertex-handle { cursor: grab; transition: r 0.2s; }
  .vertex-handle:hover { r: 12; }
  .vertex-handle:active { cursor: grabbing; r: 14; }
</style>
</head>
<body>

<header>
  <div class="title-group">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
      <span class="badge">10. Sınıf Geometri</span>
      <span style="font-size:12px; color:#38bdf8; font-weight:600;">Geometrik Şekiller</span>
    </div>
    <h1>Üçgende Yardımcı Elemanlar ve Euler Doğrusu</h1>
  </div>
</header>

<div class="layout">
  <div class="canvas-container">
    <svg id="svg" viewBox="0 0 650 520">
      <defs></defs>
      <g id="layerElements"></g>
      <g id="layerTriangle"></g>
      <g id="layerCenters"></g>
      <g id="layerLabels"></g>
      <g id="layerHandles"></g>
    </svg>
  </div>

  <div class="sidebar">
    <div class="card">
      <div class="card-title">Hızlı Üçgen Türleri</div>
      <div class="preset-row">
        <button class="btn-sm" onclick="setPreset('acute')">Dar Açılı</button>
        <button class="btn-sm" onclick="setPreset('right')">Dik Açılı</button>
        <button class="btn-sm" onclick="setPreset('obtuse')">Geniş Açılı</button>
        <button class="btn-sm" onclick="setPreset('iso')">İkizkenar</button>
      </div>
      <p style="font-size:11px; color:var(--text-muted);">A, B ve C köşelerini tutup serbestçe gezdirin.</p>
    </div>

    <div class="card">
      <div class="card-title">Özel Merkezler & Katmanlar</div>
      
      <label class="toggle-row">
        <span class="toggle-lbl">
          <span class="dot-marker" style="background:var(--g-color);"></span>
          <span>Ağırlık Merkezi (G) & Kenarortay</span>
        </span>
        <input type="checkbox" id="chkG" checked onchange="render()">
      </label>

      <label class="toggle-row">
        <span class="toggle-lbl">
          <span class="dot-marker" style="background:var(--h-color);"></span>
          <span>Diklik Merkezi (H) & Yükseklik</span>
        </span>
        <input type="checkbox" id="chkH" checked onchange="render()">
      </label>

      <label class="toggle-row">
        <span class="toggle-lbl">
          <span class="dot-marker" style="background:var(--o-color);"></span>
          <span>Çevrel Çember Merkezi (O) & Kenar Orta Dikme</span>
        </span>
        <input type="checkbox" id="chkO" checked onchange="render()">
      </label>

      <label class="toggle-row">
        <span class="toggle-lbl">
          <span class="dot-marker" style="background:var(--i-color);"></span>
          <span>İç Teğet Çember Merkezi (I) & Açıortay</span>
        </span>
        <input type="checkbox" id="chkI" onchange="render()">
      </label>

      <label class="toggle-row" style="background:rgba(234, 179, 8, 0.12); border-color:rgba(234, 179, 8, 0.4);">
        <span class="toggle-lbl">
          <span class="dot-marker" style="background:var(--euler);"></span>
          <strong style="color:var(--euler);">Euler Doğrusu (H - G - O)</strong>
        </span>
        <input type="checkbox" id="chkEuler" checked onchange="render()">
      </label>
    </div>

    <div class="card">
      <div class="card-title">Maarif Modeli Keşif Notları</div>
      <div class="info-badge" id="discoveryNote">
        • <strong>Ağırlık Merkezi (G):</strong> Kenarortayların kesişim noktasıdır ve her kenarortayı 2:1 oranında böler.<br><br>
        • <strong>Euler Doğrusu:</strong> Eşkenar olmayan her üçgende Diklik Merkezi (H), Ağırlık Merkezi (G) ve Çevrel Merkez (O) daima doğrusal olup HG = 2·GO bağıntısı sağlanır!
      </div>
    </div>
  </div>
</div>

<script>
const svg = document.getElementById('svg');
const layerElements = document.getElementById('layerElements');
const layerTriangle = document.getElementById('layerTriangle');
const layerCenters = document.getElementById('layerCenters');
const layerLabels = document.getElementById('layerLabels');
const layerHandles = document.getElementById('layerHandles');

let A = { x: 280, y: 110 };
let B = { x: 130, y: 410 };
let C = { x: 520, y: 410 };

function setPreset(type) {
  if (type === 'acute') { A = { x: 310, y: 110 }; B = { x: 140, y: 410 }; C = { x: 500, y: 410 }; }
  else if (type === 'right') { A = { x: 140, y: 160 }; B = { x: 140, y: 410 }; C = { x: 500, y: 410 }; }
  else if (type === 'obtuse') { A = { x: 230, y: 220 }; B = { x: 120, y: 410 }; C = { x: 530, y: 410 }; }
  else if (type === 'iso') { A = { x: 320, y: 100 }; B = { x: 170, y: 420 }; C = { x: 470, y: 420 }; }
  render();
}

function dist(p1, p2) { return Math.hypot(p2.x - p1.x, p2.y - p1.y); }

function getCentroid(A, B, C) {
  return { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
}

function getCircumcenter(A, B, C) {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  if (Math.abs(d) < 1e-4) return null;
  const ux = ((A.x*A.x + A.y*A.y)*(B.y - C.y) + (B.x*B.x + B.y*B.y)*(C.y - A.y) + (C.x*C.x + C.y*C.y)*(A.y - B.y)) / d;
  const uy = ((A.x*A.x + A.y*A.y)*(C.x - B.x) + (B.x*B.x + B.y*B.y)*(A.x - C.x) + (C.x*C.x + C.y*C.y)*(B.x - A.x)) / d;
  return { x: ux, y: uy, r: Math.hypot(A.x - ux, A.y - uy) };
}

function getOrthocenter(A, B, C, G, O) {
  if (!O) return null;
  return { x: 3 * G.x - 2 * O.x, y: 3 * G.y - 2 * O.y };
}

function getIncenter(A, B, C) {
  const a = dist(B, C);
  const b = dist(A, C);
  const c = dist(A, B);
  const p = a + b + c;
  return {
    x: (a * A.x + b * B.x + c * C.x) / p,
    y: (a * A.y + b * B.y + c * C.y) / p,
    r: Math.sqrt(((p/2 - a)*(p/2 - b)*(p/2 - c)) / (p/2))
  };
}

function render() {
  layerElements.innerHTML = '';
  layerTriangle.innerHTML = '';
  layerCenters.innerHTML = '';
  layerLabels.innerHTML = '';
  layerHandles.innerHTML = '';

  const showG = document.getElementById('chkG').checked;
  const showH = document.getElementById('chkH').checked;
  const showO = document.getElementById('chkO').checked;
  const showI = document.getElementById('chkI').checked;
  const showEuler = document.getElementById('chkEuler').checked;

  const G = getCentroid(A, B, C);
  const O = getCircumcenter(A, B, C);
  const H = getOrthocenter(A, B, C, G, O);
  const I = getIncenter(A, B, C);

  const M_BC = { x: (B.x + C.x)/2, y: (B.y + C.y)/2 };
  const M_AC = { x: (A.x + C.x)/2, y: (A.y + C.y)/2 };
  const M_AB = { x: (A.x + B.x)/2, y: (A.y + B.y)/2 };

  const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  tri.setAttribute('points', \`\${A.x},\${A.y} \${B.x},\${B.y} \${C.x},\${C.y}\`);
  tri.setAttribute('fill', 'rgba(56, 189, 248, 0.05)');
  tri.setAttribute('stroke', '#cbd5e1');
  tri.setAttribute('stroke-width', '3');
  layerTriangle.appendChild(tri);

  if (showG) {
    layerElements.appendChild(createLine(A.x, A.y, M_BC.x, M_BC.y, '#38bdf8', 1.5, '4 3'));
    layerElements.appendChild(createLine(B.x, B.y, M_AC.x, M_AC.y, '#38bdf8', 1.5, '4 3'));
    layerElements.appendChild(createLine(C.x, C.y, M_AB.x, M_AB.y, '#38bdf8', 1.5, '4 3'));
    drawCenter(G, '#38bdf8', 'G (Ağırlık Merkezi)');
  }

  if (showO && O) {
    const cCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cCircle.setAttribute('cx', O.x);
    cCircle.setAttribute('cy', O.y);
    cCircle.setAttribute('r', O.r);
    cCircle.setAttribute('fill', 'none');
    cCircle.setAttribute('stroke', '#10b981');
    cCircle.setAttribute('stroke-width', '1.5');
    cCircle.setAttribute('stroke-dasharray', '5 4');
    layerElements.appendChild(cCircle);

    layerElements.appendChild(createLine(M_BC.x, M_BC.y, O.x, O.y, '#10b981', 1.5, '3 3'));
    layerElements.appendChild(createLine(M_AC.x, M_AC.y, O.x, O.y, '#10b981', 1.5, '3 3'));
    layerElements.appendChild(createLine(M_AB.x, M_AB.y, O.x, O.y, '#10b981', 1.5, '3 3'));

    drawCenter(O, '#10b981', 'O (Çevrel Merkez)');
  }

  if (showH && H) {
    layerElements.appendChild(createLine(A.x, A.y, H.x, H.y, '#f43f5e', 1.5, '3 3'));
    layerElements.appendChild(createLine(B.x, B.y, H.x, H.y, '#f43f5e', 1.5, '3 3'));
    layerElements.appendChild(createLine(C.x, C.y, H.x, H.y, '#f43f5e', 1.5, '3 3'));
    drawCenter(H, '#f43f5e', 'H (Diklik Merkezi)');
  }

  if (showI && I) {
    const iCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    iCircle.setAttribute('cx', I.x);
    iCircle.setAttribute('cy', I.y);
    iCircle.setAttribute('r', I.r);
    iCircle.setAttribute('fill', 'none');
    iCircle.setAttribute('stroke', '#f59e0b');
    iCircle.setAttribute('stroke-width', '1.5');
    layerElements.appendChild(iCircle);

    layerElements.appendChild(createLine(A.x, A.y, I.x, I.y, '#f59e0b', 1.5, '2 2'));
    layerElements.appendChild(createLine(B.x, B.y, I.x, I.y, '#f59e0b', 1.5, '2 2'));
    layerElements.appendChild(createLine(C.x, C.y, I.x, I.y, '#f59e0b', 1.5, '2 2'));
    drawCenter(I, '#f59e0b', 'I (İç Teğet Merkez)');
  }

  if (showEuler && H && O) {
    const dx = O.x - H.x;
    const dy = O.y - H.y;
    const p1 = { x: H.x - dx * 0.4, y: H.y - dy * 0.4 };
    const p2 = { x: O.x + dx * 0.4, y: O.y + dy * 0.4 };
    const eulerLine = createLine(p1.x, p1.y, p2.x, p2.y, '#eab308', 3);
    eulerLine.setAttribute('stroke-dasharray', '8 4');
    layerElements.appendChild(eulerLine);

    addText((H.x + O.x)/2 + 10, (H.y + O.y)/2 - 10, 'Euler Doğrusu', '#eab308', '12px', 'bold');
  }

  addText(A.x, A.y - 14, 'A', '#fff', '16px', 'bold', 'middle');
  addText(B.x - 14, B.y + 12, 'B', '#fff', '16px', 'bold', 'end');
  addText(C.x + 14, C.y + 12, 'C', '#fff', '16px', 'bold', 'start');

  createHandle(A);
  createHandle(B);
  createHandle(C);
}

function drawCenter(pt, color, label) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', pt.x);
  c.setAttribute('cy', pt.y);
  c.setAttribute('r', '6');
  c.setAttribute('fill', color);
  c.setAttribute('stroke', '#fff');
  c.setAttribute('stroke-width', '2');
  layerCenters.appendChild(c);

  addText(pt.x + 10, pt.y - 6, label, color, '11.5px', 'bold');
}

function createLine(x1, y1, x2, y2, stroke, width, dash='') {
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', x1);
  l.setAttribute('y1', y1);
  l.setAttribute('x2', x2);
  l.setAttribute('y2', y2);
  l.setAttribute('stroke', stroke);
  l.setAttribute('stroke-width', width);
  if (dash) l.setAttribute('stroke-dasharray', dash);
  return l;
}

function createHandle(pt) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', pt.x);
  c.setAttribute('cy', pt.y);
  c.setAttribute('r', '9');
  c.setAttribute('fill', '#fff');
  c.setAttribute('stroke', '#38bdf8');
  c.setAttribute('stroke-width', '3');
  c.setAttribute('class', 'vertex-handle');
  layerHandles.appendChild(c);

  let isDrag = false;
  c.addEventListener('pointerdown', (e) => {
    isDrag = true;
    c.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDrag) return;
    const p = svgPoint(e);
    pt.x = Math.max(50, Math.min(600, p.x));
    pt.y = Math.max(50, Math.min(470, p.y));
    render();
  });
  window.addEventListener('pointerup', () => { isDrag = false; });
}

function svgPoint(e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

function addText(x, y, text, fill, size, weight='normal', anchor='start') {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('fill', fill);
  t.setAttribute('font-size', size);
  t.setAttribute('font-weight', weight);
  t.setAttribute('text-anchor', anchor);
  t.textContent = text;
  layerLabels.appendChild(t);
}

render();
</script>
</body>
</html>`;


/* ─────────────────────────────────────────────────────────────────────────────
   4. ÜÇGENİN ALANI (CAVALIERI İLKESİ, TABAN-YÜKSEKLİK VE SİNÜSLÜ ALAN)
   ───────────────────────────────────────────────────────────────────────────── */
const HTML_UCGENIN_ALANI = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Üçgenin Alanı ve Dinamik Alan Korunumu</title>
<style>
  :root {
    --bg-main: #0c1322;
    --bg-card: #192238;
    --border: #2a3857;
    --primary: #38bdf8;
    --accent: #f59e0b;
    --success: #10b981;
    --purple: #c084fc;
    --text: #f8fafc;
    --text-muted: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; user-select: none; }
  body { background: var(--bg-main); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }
  header { background: rgba(25, 34, 56, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .badge { background: rgba(56, 189, 248, 0.15); color: var(--primary); border: 1px solid rgba(56, 189, 248, 0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; }
  .title-group h1 { font-size: 17px; font-weight: 700; color: #fff; }
  
  .tabs { display: flex; gap: 6px; background: rgba(12, 19, 34, 0.7); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
  .tab-btn { background: transparent; border: none; color: var(--text-muted); padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .tab-btn.active { background: var(--primary); color: #0c1322; font-weight: 700; }

  .layout { display: grid; grid-template-columns: 1fr 340px; flex: 1; min-height: 0; }
  @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }

  .canvas-container { position: relative; width: 100%; height: 100%; min-height: 500px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #192238 0%, #0c1322 100%); }
  svg { width: 100%; height: 100%; touch-action: none; }

  .sidebar { background: var(--bg-card); border-left: 1px solid var(--border); padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
  .card { background: rgba(12, 19, 34, 0.6); border: 1px solid var(--border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
  .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--primary); display: flex; justify-content: space-between; }

  .area-box { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 12px; padding: 14px; text-align: center; }
  .area-label { font-size: 11px; font-weight: 700; color: var(--primary); text-transform: uppercase; }
  .area-val { font-size: 28px; font-weight: 800; color: #fff; margin: 4px 0; }
  .area-calc { font-size: 12px; color: var(--text-muted); font-family: monospace; }

  .slider-row { display: flex; flex-direction: column; gap: 6px; }
  .slider-row label { display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; color: #cbd5e1; }
  input[type=range] { width: 100%; accent-color: var(--primary); cursor: pointer; }

  .anim-btn { background: var(--primary); color: #0c1322; border: none; font-size: 12px; font-weight: 700; padding: 10px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .anim-btn:hover { filter: brightness(1.1); }

  .vertex-handle { cursor: grab; transition: r 0.2s; }
  .vertex-handle:hover { r: 12; }
  .vertex-handle:active { cursor: grabbing; r: 14; }
  .info-badge { font-size: 11.5px; color: var(--text-muted); line-height: 1.5; background: rgba(15, 23, 42, 0.7); border: 1px solid var(--border); padding: 10px; border-radius: 10px; }
</style>
</head>
<body>

<header>
  <div class="title-group">
    <div style="display:flex; align-items:center; gap:8px; margin-bottom:2px;">
      <span class="badge">10. Sınıf Geometri</span>
      <span style="font-size:12px; color:#38bdf8; font-weight:600;">Geometrik Şekiller</span>
    </div>
    <h1>Üçgenin Alanı ve Dinamik Alan Korunumu</h1>
  </div>
  <div class="tabs">
    <button class="tab-btn active" onclick="setMode('cavalieri')">Cavalieri (Alan Kaydırma)</button>
    <button class="tab-btn" onclick="setMode('sineArea')">Sinüslü Alan Formülü</button>
  </div>
</header>

<div class="layout">
  <div class="canvas-container">
    <svg id="svg" viewBox="0 0 650 500">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        </pattern>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <g id="guideLayer"></g>
      <g id="triangleLayer"></g>
      <g id="heightLayer"></g>
      <g id="labelLayer"></g>
      <g id="handleLayer"></g>
    </svg>
  </div>

  <div class="sidebar">
    <div class="card">
      <div class="card-title">Anlık Alan Hesabı</div>
      <div class="area-box">
        <div class="area-label" id="areaLabel">Alan(ABC)</div>
        <div class="area-val" id="areaVal">36.0</div>
        <div class="area-calc" id="areaCalc">(Taban · Yükseklik) / 2</div>
      </div>
    </div>

    <div id="cavalieriPanel" class="card">
      <div class="card-title">Cavalieri Alan Kaydırma</div>
      <button class="anim-btn" id="playBtn" onclick="toggleAnimation()">▶ Otomatik Kaydırmayı Başlat</button>

      <div class="slider-row">
        <label><span>Tepe Noktası (A) Konumu</span><span id="posValText">Orta</span></label>
        <input type="range" id="apexSlider" min="90" max="550" value="320" step="1">
      </div>

      <div class="slider-row">
        <label><span>Yükseklik (h)</span><span id="heightValText">180 px</span></label>
        <input type="range" id="heightSlider" min="100" max="280" value="180" step="5">
      </div>

      <div class="info-badge">
        🎯 <strong>Cavalieri İlkesi:</strong> Tepe noktası A, tabana paralel doğru boyunca sağa veya sola ne kadar kaydırılırsa kaydırılsın, <strong>yükseklik (h)</strong> ve <strong>taban (|BC|)</strong> değişmediği için üçgenin alanı <strong>kesinlikle değişmez</strong>.
      </div>
    </div>

    <div id="sineAreaPanel" class="card" style="display:none;">
      <div class="card-title">Alan = ½ · b · c · sin(A)</div>
      
      <div class="slider-row">
        <label><span>A Açısı (α)</span><span id="sineAngleText" style="color:var(--accent); font-weight:700;">60°</span></label>
        <input type="range" id="sineAngleSlider" min="10" max="170" value="60" step="1">
      </div>

      <div class="info-badge">
        📐 <strong>Maksimum Alan Keşfi:</strong> İki kenar (b ve c) sabitken, sinüs fonksiyonu en büyük değerini (1.00) 90°'de aldığından, alan <strong>A = 90° (dik üçgen)</strong> olduğunda maksimuma ulaşır!
      </div>
    </div>
  </div>
</div>

<script>
let mode = 'cavalieri';
const svg = document.getElementById('svg');
const guideLayer = document.getElementById('guideLayer');
const triangleLayer = document.getElementById('triangleLayer');
const heightLayer = document.getElementById('heightLayer');
const labelLayer = document.getElementById('labelLayer');
const handleLayer = document.getElementById('handleLayer');

const B = { x: 150, y: 400 };
const C = { x: 490, y: 400 };

let apexX = 320;
let heightVal = 180;
let isAnimating = false;
let animSpeed = 2;
let sineAngle = 60;

function setMode(m) {
  mode = m;
  if (isAnimating) toggleAnimation();
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && m === 'cavalieri') || (i === 1 && m === 'sineArea'));
  });
  document.getElementById('cavalieriPanel').style.display = m === 'cavalieri' ? 'flex' : 'none';
  document.getElementById('sineAreaPanel').style.display = m === 'sineArea' ? 'flex' : 'none';
  render();
}

function toggleAnimation() {
  isAnimating = !isAnimating;
  const btn = document.getElementById('playBtn');
  btn.innerText = isAnimating ? '⏸ Animasyonu Duraklat' : '▶ Otomatik Kaydırmayı Başlat';
  if (isAnimating) loop();
}

function loop() {
  if (!isAnimating) return;
  apexX += animSpeed;
  if (apexX > 540 || apexX < 100) animSpeed = -animSpeed;
  document.getElementById('apexSlider').value = apexX;
  render();
  requestAnimationFrame(loop);
}

document.getElementById('apexSlider').addEventListener('input', (e) => {
  apexX = parseFloat(e.target.value);
  render();
});

document.getElementById('heightSlider').addEventListener('input', (e) => {
  heightVal = parseFloat(e.target.value);
  document.getElementById('heightValText').innerText = heightVal + ' px';
  render();
});

document.getElementById('sineAngleSlider').addEventListener('input', (e) => {
  sineAngle = parseFloat(e.target.value);
  document.getElementById('sineAngleText').innerText = sineAngle + '°';
  render();
});

function render() {
  guideLayer.innerHTML = '';
  triangleLayer.innerHTML = '';
  heightLayer.innerHTML = '';
  labelLayer.innerHTML = '';
  handleLayer.innerHTML = '';

  const scale = 25;
  const baseLen = (C.x - B.x) / scale;

  if (mode === 'cavalieri') {
    const A = { x: apexX, y: B.y - heightVal };
    const hLen = heightVal / scale;
    const area = (baseLen * hLen) / 2;

    const parallelY = A.y;
    const pLine = createLine(50, parallelY, 600, parallelY, '#f59e0b', 1.5, '5 4');
    guideLayer.appendChild(pLine);
    addText(605, parallelY + 4, 'd // BC', '#f59e0b', '11px', 'bold');

    const bLine = createLine(50, B.y, 600, B.y, '#475569', 1.5);
    guideLayer.appendChild(bLine);

    const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    tri.setAttribute('points', \`\${A.x},\${A.y} \${B.x},\${B.y} \${C.x},\${C.y}\`);
    tri.setAttribute('fill', 'url(#areaGrad)');
    tri.setAttribute('stroke', '#38bdf8');
    tri.setAttribute('stroke-width', '3');
    triangleLayer.appendChild(tri);

    const hDrop = createLine(A.x, A.y, A.x, B.y, '#f43f5e', 2, '4 3');
    heightLayer.appendChild(hDrop);

    const sq = 12;
    const hSq = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hSq.setAttribute('d', \`M \${A.x} \${B.y - sq} L \${A.x + sq} \${B.y - sq} L \${A.x + sq} \${B.y}\`);
    hSq.setAttribute('fill', 'none');
    hSq.setAttribute('stroke', '#f43f5e');
    hSq.setAttribute('stroke-width', '1.5');
    heightLayer.appendChild(hSq);

    addText(A.x + 8, (A.y + B.y)/2, 'h = ' + hLen.toFixed(1), '#f43f5e', '12px', 'bold');
    addText((B.x + C.x)/2, B.y + 24, 'Taban = ' + baseLen.toFixed(1), '#38bdf8', '13px', 'bold', 'middle');

    addText(A.x, A.y - 14, 'A', '#fff', '16px', 'bold', 'middle');
    addText(B.x - 14, B.y + 6, 'B', '#fff', '15px', 'bold', 'end');
    addText(C.x + 14, C.y + 6, 'C', '#fff', '15px', 'bold', 'start');

    createHandle(A);

    document.getElementById('areaVal').innerText = area.toFixed(2);
    document.getElementById('areaCalc').innerText = '(' + baseLen.toFixed(1) + ' · ' + hLen.toFixed(1) + ') / 2';
  } else {
    const bLenPx = 220;
    const cLenPx = 240;
    const rad = (sineAngle * Math.PI) / 180;

    const A = { x: 220, y: 350 };
    const C_pt = { x: A.x + bLenPx, y: A.y };
    const B_pt = { x: A.x + cLenPx * Math.cos(rad), y: A.y - cLenPx * Math.sin(rad) };

    const bUnit = bLenPx / scale;
    const cUnit = cLenPx / scale;
    const sinV = Math.sin(rad);
    const area = 0.5 * bUnit * cUnit * sinV;

    const tri = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    tri.setAttribute('points', \`\${A.x},\${A.y} \${B_pt.x},\${B_pt.y} \${C_pt.x},\${C_pt.y}\`);
    tri.setAttribute('fill', 'url(#areaGrad)');
    tri.setAttribute('stroke', '#38bdf8');
    tri.setAttribute('stroke-width', '3');
    triangleLayer.appendChild(tri);

    const arcR = 40;
    const arcPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arcPath.setAttribute('d', \`M \${A.x + arcR} \${A.y} A \${arcR} \${arcR} 0 0 0 \${A.x + arcR * Math.cos(rad)} \${A.y - arcR * Math.sin(rad)}\`);
    arcPath.setAttribute('fill', 'none');
    arcPath.setAttribute('stroke', '#f59e0b');
    arcPath.setAttribute('stroke-width', '2.5');
    guideLayer.appendChild(arcPath);

    addText(A.x + 50, A.y - 12, 'α = ' + sineAngle + '°', '#f59e0b', '13px', 'bold');
    addText(A.x - 14, A.y + 8, 'A', '#fff', '15px', 'bold', 'end');
    addText(B_pt.x, B_pt.y - 12, 'B', '#fff', '15px', 'bold', 'middle');
    addText(C_pt.x + 12, C_pt.y + 8, 'C', '#fff', '15px', 'bold', 'start');

    addText((A.x + C_pt.x)/2, A.y + 20, 'b = ' + bUnit.toFixed(1), '#38bdf8', '12px', 'bold', 'middle');
    addText((A.x + B_pt.x)/2 - 15, (A.y + B_pt.y)/2, 'c = ' + cUnit.toFixed(1), '#38bdf8', '12px', 'bold', 'end');

    createHandle(B_pt, true);

    document.getElementById('areaVal').innerText = area.toFixed(2);
    document.getElementById('areaCalc').innerText = '½ · ' + bUnit.toFixed(1) + ' · ' + cUnit.toFixed(1) + ' · sin(' + sineAngle + '°)';
  }
}

function createLine(x1, y1, x2, y2, stroke, width, dash='') {
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  l.setAttribute('x1', x1);
  l.setAttribute('y1', y1);
  l.setAttribute('x2', x2);
  l.setAttribute('y2', y2);
  l.setAttribute('stroke', stroke);
  l.setAttribute('stroke-width', width);
  if (dash) l.setAttribute('stroke-dasharray', dash);
  return l;
}

function createHandle(pt, isSineMode=false) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', pt.x);
  c.setAttribute('cy', pt.y);
  c.setAttribute('r', '9');
  c.setAttribute('fill', '#f59e0b');
  c.setAttribute('stroke', '#fff');
  c.setAttribute('stroke-width', '2.5');
  c.setAttribute('class', 'vertex-handle');
  handleLayer.appendChild(c);

  let isDrag = false;
  c.addEventListener('pointerdown', (e) => {
    isDrag = true;
    c.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDrag) return;
    const p = svgPoint(e);
    if (!isSineMode) {
      apexX = Math.max(90, Math.min(550, p.x));
      document.getElementById('apexSlider').value = apexX;
    } else {
      const dx = p.x - 220;
      const dy = 350 - p.y;
      let deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
      deg = Math.max(10, Math.min(170, deg));
      sineAngle = deg;
      document.getElementById('sineAngleSlider').value = deg;
      document.getElementById('sineAngleText').innerText = deg + '°';
    }
    render();
  });
  window.addEventListener('pointerup', () => { isDrag = false; });
}

function svgPoint(e) {
  const p = svg.createSVGPoint();
  p.x = e.clientX;
  p.y = e.clientY;
  return p.matrixTransform(svg.getScreenCTM().inverse());
}

function addText(x, y, text, fill, size, weight='normal', anchor='start') {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('fill', fill);
  t.setAttribute('font-size', size);
  t.setAttribute('font-weight', weight);
  t.setAttribute('text-anchor', anchor);
  t.textContent = text;
  labelLayer.appendChild(t);
}

render();
</script>
</body>
</html>`;

export const DEFAULT_GEOMETRI_FOLDERS: any[] = [
    {
        id: 'folder-10-geometrik-sekiller',
        name: 'Geometrik Şekiller',
        parent_id: null,
        color: '#3b82f6',
        grade_level: '10',
        subject: 'Matematik',
        created_at: '2026-09-05T12:00:00.000Z',
    },
    {
        id: 'folder-10-trigonometri',
        name: 'Dik Üçgende Trigonometrik Oranlar ve Trigonometrik Özdeşlikler',
        parent_id: 'folder-10-geometrik-sekiller',
        color: '#38bdf8',
        grade_level: '10',
        subject: 'Matematik',
        created_at: '2026-09-05T12:05:00.000Z',
    },
    {
        id: 'folder-10-sin-cos-teoremleri',
        name: 'Sinüs ve Kosinüs Teoremleri',
        parent_id: 'folder-10-geometrik-sekiller',
        color: '#10b981',
        grade_level: '10',
        subject: 'Matematik',
        created_at: '2026-09-05T12:10:00.000Z',
    },
    {
        id: 'folder-10-yardimci-elemanlar',
        name: 'Üçgende Yardımcı Elemanlar',
        parent_id: 'folder-10-geometrik-sekiller',
        color: '#f59e0b',
        grade_level: '10',
        subject: 'Matematik',
        created_at: '2026-09-05T12:15:00.000Z',
    },
    {
        id: 'folder-10-ucgenin-alani',
        name: 'Üçgenin Alanı',
        parent_id: 'folder-10-geometrik-sekiller',
        color: '#c084fc',
        grade_level: '10',
        subject: 'Matematik',
        created_at: '2026-09-05T12:20:00.000Z',
    },
];

export const GEOMETRI_10_ACTIVITIES: Activity[] = [
    {
        id: 'geo10-1-trigonometri',
        title: 'Dik Üçgende Trigonometrik Oranlar ve Trigonometrik Özdeşlikler',
        description: 'Dinamik dik üçgen ve birim çember üzerinde sin, cos, tan ve cot oranlarının benzerlikten ötürü sabitliğini ve sin²α + cos²α = 1 temel özdeşliğini keşfedin.',
        category: 'Simülasyon',
        subject: 'Matematik',
        grade_level: '10',
        unit: 'Geometrik Şekiller',
        tags: '10.sınıf, matematik, geometri, trigonometri, dik üçgen, özdeşlikler, geogebra',
        content_mode: 'raw_html',
        html_code: HTML_TRIGONOMETRI,
        folder_ids: ['folder-10-trigonometri', 'folder-10-geometrik-sekiller'],
        is_test: false,
        created_at: '2026-09-05T12:00:00.000Z',
    },
    {
        id: 'geo10-2-sin-cos-teoremleri',
        title: 'Sinüs ve Kosinüs Teoremleri: Dinamik Üçgen & Çevrel Çember',
        description: 'Üçgen köşelerini serbestçe hareket ettirerek Kosinüs Teoreminin Pisagor ile ilişkisini ve Sinüs Teoreminin çevrel çember çapı (2R) ile olan mükemmel uyumunu inceleyin.',
        category: 'Simülasyon',
        subject: 'Matematik',
        grade_level: '10',
        unit: 'Geometrik Şekiller',
        tags: '10.sınıf, matematik, geometri, kosinüs teoremi, sinüs teoremi, çevrel çember, pisagor',
        content_mode: 'raw_html',
        html_code: HTML_SINUS_KOSINUS,
        folder_ids: ['folder-10-sin-cos-teoremleri', 'folder-10-geometrik-sekiller'],
        is_test: false,
        created_at: '2026-09-05T12:10:00.000Z',
    },
    {
        id: 'geo10-3-yardimci-elemanlar',
        title: 'Üçgende Yardımcı Elemanlar, Özel Merkezler ve Euler Doğrusu',
        description: 'Kenarortay (Ağırlık Merkezi G), Diklik Merkezi (H), Çevrel Çember Merkezi (O) ve İç Teğet Merkezi (I) ile H-G-O Euler Doğrusunu dinamik olarak gözlemleyin.',
        category: 'Simülasyon',
        subject: 'Matematik',
        grade_level: '10',
        unit: 'Geometrik Şekiller',
        tags: '10.sınıf, matematik, geometri, açıortay, kenarortay, yükseklik, ağırlık merkezi, euler doğrusu',
        content_mode: 'raw_html',
        html_code: HTML_YARDIMCI_ELEMANLAR,
        folder_ids: ['folder-10-yardimci-elemanlar', 'folder-10-geometrik-sekiller'],
        is_test: false,
        created_at: '2026-09-05T12:20:00.000Z',
    },
    {
        id: 'geo10-4-ucgenin-alani',
        title: 'Üçgenin Alanı: Cavalieri İlkesi, Taban-Yükseklik ve Sinüslü Alan',
        description: 'Tepe noktasını paralel hat boyunca kaydırarak alanın korunduğunu (Cavalieri ilkesi) görün ve aradaki açı değiştikçe sinüslü alan formülünü deneyimleyin.',
        category: 'Simülasyon',
        subject: 'Matematik',
        grade_level: '10',
        unit: 'Geometrik Şekiller',
        tags: '10.sınıf, matematik, geometri, üçgenin alanı, cavalieri, sinüslü alan, yükseklik',
        content_mode: 'raw_html',
        html_code: HTML_UCGENIN_ALANI,
        folder_ids: ['folder-10-ucgenin-alani', 'folder-10-geometrik-sekiller'],
        is_test: false,
        created_at: '2026-09-05T12:30:00.000Z',
    },
];
