// src/components/drawing/grade8MathSims.ts
// 8. Sınıf LGS Matematik için canlı simülasyonlar.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    fillShape,
    fitText,
    fmtNum,
    isIconSize,
    label,
    line,
    panel,
    roundRect,
    simValue,
    withAlpha,
    type Ctx,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

// ── 1. Cebir Karoları & Özdeşlikler Alan Modeli ─────────────────────
interface AlgebraTilesState {
    mode: number; // 0: (a+b)^2, 1: (a-b)^2, 2: a^2 - b^2, 3: (x+a)(x+b)
    a: number;    // 1 - 4
    b: number;    // 1 - 3
}

function algebraTilesState(o: MathObject): AlgebraTilesState {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 3, 0);
    const a = clamp(simValue(o, 'a', 3), 1, 4);
    const b = clamp(simValue(o, 'b', 2), 1, 3);
    return { mode, a, b };
}

export const algebraTilesRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = algebraTilesState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Model Çizim Alanı
    const drawW = r.w * (icon ? 0.9 : 0.52);
    const drawH = r.h * 0.72;
    const cx0 = r.x + fs * 2.0;
    const cy0 = r.y + fs * 2.8;

    const unit = Math.min(drawW / 7.5, drawH / 7.5);
    const aPx = s.a * unit;
    const bPx = s.b * unit;

    // Mod 0: (a+b)^2 = a^2 + 2ab + b^2
    if (s.mode === 0) {
        const x = cx0 + (drawW - (aPx + bPx)) / 2;
        const y = cy0 + (drawH - (aPx + bPx)) / 2;

        // a^2 karesi (Sol üst - Mavi)
        k.c.save();
        k.c.fillStyle = '#38bdf8';
        k.c.fillRect(x, y, aPx, aPx);
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 1.5;
        k.c.strokeRect(x, y, aPx, aPx);

        // a*b dikdörtgeni (Sağ üst - Yeşil)
        k.c.fillStyle = '#4ade80';
        k.c.fillRect(x + aPx, y, bPx, aPx);
        k.c.strokeRect(x + aPx, y, bPx, aPx);

        // a*b dikdörtgeni (Sol alt - Yeşil)
        k.c.fillRect(x, y + aPx, aPx, bPx);
        k.c.strokeRect(x, y + aPx, aPx, bPx);

        // b^2 karesi (Sağ alt - Sarı)
        k.c.fillStyle = '#facc15';
        k.c.fillRect(x + aPx, y + aPx, bPx, bPx);
        k.c.strokeRect(x + aPx, y + aPx, bPx, bPx);
        k.c.restore();

        if (!icon) {
            label(k, 'a²', x + aPx / 2, y + aPx / 2, 'center', 'middle', 0.65);
            label(k, 'ab', x + aPx + bPx / 2, y + aPx / 2, 'center', 'middle', 0.65);
            label(k, 'ab', x + aPx / 2, y + aPx + bPx / 2, 'center', 'middle', 0.65);
            label(k, 'b²', x + aPx + bPx / 2, y + aPx + bPx / 2, 'center', 'middle', 0.65);

            // Kenar uzunlukları
            label(k, 'a', x + aPx / 2, y - fs * 0.4, 'center', 'bottom', 0.55);
            label(k, 'b', x + aPx + bPx / 2, y - fs * 0.4, 'center', 'bottom', 0.55);
            label(k, 'a', x - fs * 0.4, y + aPx / 2, 'right', 'middle', 0.55);
            label(k, 'b', x - fs * 0.4, y + aPx + bPx / 2, 'right', 'middle', 0.55);
        }
    } else if (s.mode === 1) {
        // (a-b)^2 = a^2 - 2ab + b^2
        const x = cx0 + (drawW - aPx) / 2;
        const y = cy0 + (drawH - aPx) / 2;

        k.c.save();
        k.c.fillStyle = '#cbd5e1';
        k.c.fillRect(x, y, aPx, aPx);
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 1.5;
        k.c.strokeRect(x, y, aPx, aPx);

        // (a-b)^2 karesi (İçte kalan esas alan - Mavi)
        const ambPx = Math.max(10, aPx - bPx);
        k.c.fillStyle = '#38bdf8';
        k.c.fillRect(x, y, ambPx, ambPx);
        k.c.strokeRect(x, y, ambPx, ambPx);

        // Çıkarılan b dilimleri
        k.c.fillStyle = 'rgba(239, 68, 68, 0.35)';
        k.c.fillRect(x + ambPx, y, bPx, aPx);
        k.c.fillRect(x, y + ambPx, aPx, bPx);
        k.c.restore();

        if (!icon) {
            label(k, '(a−b)²', x + ambPx / 2, y + ambPx / 2, 'center', 'middle', 0.65);
            label(k, 'Tüm Alan: a²', x + aPx / 2, y + aPx + fs * 0.8, 'center', 'top', 0.55);
        }
    } else if (s.mode === 2) {
        // a^2 - b^2 = (a-b)(a+b)
        const x = cx0 + (drawW - aPx) / 2;
        const y = cy0 + (drawH - aPx) / 2;

        k.c.save();
        k.c.fillStyle = '#38bdf8';
        k.c.fillRect(x, y, aPx, aPx);
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 1.5;
        k.c.strokeRect(x, y, aPx, aPx);

        // Kesilen b^2 köşesi
        k.c.fillStyle = '#ef4444';
        k.c.fillRect(x + aPx - bPx, y, bPx, bPx);
        k.c.strokeRect(x + aPx - bPx, y, bPx, bPx);
        k.c.restore();

        if (!icon) {
            label(k, 'a² − b²', x + (aPx - bPx) / 2, y + aPx / 2, 'center', 'middle', 0.65);
            label(k, 'Kesilen: b²', x + aPx - bPx / 2, y + bPx / 2, 'center', 'middle', 0.5);
        }
    } else {
        // (x+a)(x+b) = x^2 + (a+b)x + ab
        const x = cx0 + (drawW - (aPx + bPx)) / 2;
        const y = cy0 + (drawH - (aPx + bPx)) / 2;

        k.c.save();
        k.c.fillStyle = '#38bdf8';
        k.c.fillRect(x, y, aPx, aPx);
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 1.5;
        k.c.strokeRect(x, y, aPx, aPx);

        k.c.fillStyle = '#4ade80';
        k.c.fillRect(x + aPx, y, bPx, aPx);
        k.c.strokeRect(x + aPx, y, bPx, aPx);

        k.c.fillRect(x, y + aPx, aPx, bPx);
        k.c.strokeRect(x, y + aPx, aPx, bPx);

        k.c.fillStyle = '#facc15';
        k.c.fillRect(x + aPx, y + aPx, bPx, bPx);
        k.c.strokeRect(x + aPx, y + aPx, bPx, bPx);
        k.c.restore();

        if (!icon) {
            label(k, 'x²', x + aPx / 2, y + aPx / 2, 'center', 'middle', 0.65);
            label(k, `${s.b}x`, x + aPx + bPx / 2, y + aPx / 2, 'center', 'middle', 0.65);
            label(k, `${s.a}x`, x + aPx / 2, y + aPx + bPx / 2, 'center', 'middle', 0.65);
            label(k, `${s.a * s.b}`, x + aPx + bPx / 2, y + aPx + bPx / 2, 'center', 'middle', 0.65);
        }
    }

    // Sağ Formül ve Açıklama Paneli
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.40;
        const ph = r.h * 0.76;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.2;
        panel(k, px, py, pw, ph);

        const titles = [
            'Tam Kare Toplamı: (a+b)²',
            'Tam Kare Farkı: (a−b)²',
            'İki Kare Farkı: a² − b²',
            'Çarpanlara Ayırma: (x+a)(x+b)',
        ];
        label(k, titles[s.mode], px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);

        // Özdeşlik bağıntısı
        let formula = '';
        let calc = '';
        if (s.mode === 0) {
            formula = '(a + b)² = a² + 2ab + b²';
            calc = `(${s.a} + ${s.b})² = ${s.a * s.a} + ${2 * s.a * s.b} + ${s.b * s.b} = ${(s.a + s.b) ** 2}`;
        } else if (s.mode === 1) {
            formula = '(a − b)² = a² − 2ab + b²';
            calc = `(${s.a} − ${s.b})² = ${s.a * s.a} − ${2 * s.a * s.b} + ${s.b * s.b} = ${(s.a - s.b) ** 2}`;
        } else if (s.mode === 2) {
            formula = 'a² − b² = (a − b)(a + b)';
            calc = `${s.a}² − ${s.b}² = (${s.a - s.b})·(${s.a + s.b}) = ${s.a ** 2 - s.b ** 2}`;
        } else {
            formula = '(x + a)(x + b) = x² + (a+b)x + ab';
            calc = `(x + ${s.a})(x + ${s.b}) = x² + ${s.a + s.b}x + ${s.a * s.b}`;
        }

        label(k, formula, px + fs * 0.5, py + fs * 2.2, 'left', 'middle', 0.60);
        label(k, calc, px + fs * 0.5, py + fs * 3.4, 'left', 'middle', 0.55);

        line(k, px + fs * 0.5, py + fs * 4.6, px + pw - fs * 0.5, py + fs * 4.6, 1);
        label(k, 'Geometrik Alan İspatı:', px + fs * 0.5, py + fs * 5.5, 'left', 'middle', 0.52);
        const expl = s.mode === 0
            ? 'Kenarı (a+b) olan karenin alanı; 1 adet a² karesi, 2 adet ab dikdörtgeni ve 1 adet b² karesinin alanları toplamıdır.'
            : s.mode === 1
              ? 'Tüm büyük a² alanından 2 adet ab şeridi çıkarıldığında, köşedeki b² iki kez çıkarıldığı için bir kez eklenir.'
              : 'a² karesinden köşedeki b² kesilip atıldığında kalan parça katlanarak (a−b) ve (a+b) kenarlı dikdörtgen oluşturur.';
        label(k, fitText(k, [expl], pw - fs * 1.0, 0.46), px + fs * 0.5, py + fs * 6.8, 'left', 'middle', 0.46);

        label(k, `a = ${s.a} br  |  b = ${s.b} br`, px + fs * 0.5, py + ph - fs * 0.8, 'left', 'middle', 0.5);
    }

    if (!icon) {
        label(k, 'Cebir Karoları & Özdeşlikler Alan Modeli', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const algebraTilesSpec: SimSpec = {
    controls: (r) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            { id: 'btn_mode', x: r.x + fs * 16.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Özdeşlik Modunu Değiştir' },
            { id: 'btn_inc_a', x: r.x + fs * 2.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'a Kenarını Artır' },
            { id: 'btn_inc_b', x: r.x + fs * 8.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'b Kenarını Artır' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_mode') {
            const cur = simValue(o, 'mode', 0);
            return { mode: (cur + 1) % 4 };
        }
        if (id === 'btn_inc_a') {
            const cur = simValue(o, 'a', 3);
            return { a: (cur % 4) + 1 };
        }
        if (id === 'btn_inc_b') {
            const cur = simValue(o, 'b', 2);
            return { b: (cur % 3) + 1 };
        }
        return {};
    },
    params: [
        { key: 'mode', label: 'Özdeşlik (0-3)', min: 0, max: 3, step: 1 },
        { key: 'a', label: 'a Kenarı', min: 1, max: 4, step: 1 },
        { key: 'b', label: 'b Kenarı', min: 1, max: 3, step: 1 },
    ],
};

// ── 2. Pisagor Bağıntısı & Üçgen Eşitsizliği Lab ─────────────────────
interface PythagorasState {
    mode: number; // 0: Üçgen Eşitsizliği, 1: Pisagor Teoremi
    a: number;    // Kenar a
    b: number;    // Kenar b
    c: number;    // Kenar c
    isValidTriangle: boolean;
}

function pythagorasState(o: MathObject): PythagorasState {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0);
    const a = clamp(simValue(o, 'a', 6), 2, 12);
    const b = clamp(simValue(o, 'b', 8), 2, 12);
    const c = clamp(simValue(o, 'c', 10), 2, 18);

    // Üçgen eşitsizliği: |b-c| < a < b+c
    const isValidTriangle = a + b > c && a + c > b && b + c > a;
    return { mode, a, b, c, isValidTriangle };
}

export const pythagorasRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = pythagorasState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const drawW = r.w * (icon ? 0.9 : 0.52);
    const drawH = r.h * 0.72;
    const cx = r.x + fs * 2.0 + drawW / 2;
    const cy = r.y + fs * 2.5 + drawH / 2;

    if (s.mode === 0) {
        // Üçgen Eşitsizliği Çubuk Modu
        const barY = cy - fs * 2.0;
        const scale = drawW / 28;

        // 3 çubuk yan yana
        const aLen = s.a * scale;
        const bLen = s.b * scale;
        const cLen = s.c * scale;

        // Taban c çubuğu
        const x0 = cx - cLen / 2;
        const yBase = cy + fs * 2.5;

        k.c.save();
        // Çubuk c (Mavi taban)
        k.c.strokeStyle = '#0284c7';
        k.c.lineWidth = 4.5;
        line(k, x0, yBase, x0 + cLen, yBase, 4.5);

        // Çubuk a (Kırmızı)
        k.c.strokeStyle = '#ef4444';
        line(k, x0, yBase, x0 + Math.cos(Math.PI / 4) * aLen, yBase - Math.sin(Math.PI / 4) * aLen, 4.5);

        // Çubuk b (Yeşil)
        k.c.strokeStyle = '#10b981';
        line(k, x0 + cLen, yBase, x0 + cLen - Math.cos(Math.PI / 4) * bLen, yBase - Math.sin(Math.PI / 4) * bLen, 4.5);
        k.c.restore();

        if (!icon) {
            label(k, `c = ${s.c} cm (Taban)`, cx, yBase + fs * 0.8, 'center', 'top', 0.55);
            label(k, `a = ${s.a}`, x0 - fs * 0.4, yBase - fs * 1.5, 'right', 'middle', 0.52);
            label(k, `b = ${s.b}`, x0 + cLen + fs * 0.4, yBase - fs * 1.5, 'left', 'middle', 0.52);

            const statusText = s.isValidTriangle ? '✓ ÜÇGEN OLUŞUR' : '❌ ÜÇGEN OLUŞMAZ (Uçlar Kapanmaz)';
            k.c.fillStyle = s.isValidTriangle ? '#16a34a' : '#dc2626';
            label(k, statusText, cx, cy - fs * 4.2, 'center', 'middle', 0.68);
        }
    } else {
        // Pisagor Modu (a^2 + b^2 = c^2)
        const scale = Math.min(drawW / 24, drawH / 22);
        const aLen = s.a * scale;
        const bLen = s.b * scale;

        const xBase = cx - aLen / 2;
        const yBase = cy + bLen / 3;

        // Dik üçgen (a dik, b yatay, c hipotenüs)
        k.c.save();
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 2.5;

        // Üçgen köşeleri: A(xBase, yBase - aLen), B(xBase, yBase), C(xBase + bLen, yBase)
        line(k, xBase, yBase, xBase, yBase - aLen, 2.5);
        line(k, xBase, yBase, xBase + bLen, yBase, 2.5);
        line(k, xBase, yBase - aLen, xBase + bLen, yBase, 3.0);

        // Diklik işareti
        k.c.strokeRect(xBase, yBase - fs * 0.8, fs * 0.8, fs * 0.8);
        k.c.beginPath();
        k.c.arc(xBase + fs * 0.4, yBase - fs * 0.4, 1.5, 0, Math.PI * 2);
        k.c.fill();

        // a kenarı üzerine kurulan kare (Sol - Kırmızı)
        k.c.fillStyle = 'rgba(239, 68, 68, 0.35)';
        k.c.fillRect(xBase - aLen, yBase - aLen, aLen, aLen);
        k.c.strokeRect(xBase - aLen, yBase - aLen, aLen, aLen);

        // b kenarı üzerine kurulan kare (Alt - Yeşil)
        k.c.fillStyle = 'rgba(34, 197, 94, 0.35)';
        k.c.fillRect(xBase, yBase, bLen, bLen);
        k.c.strokeRect(xBase, yBase, bLen, bLen);
        k.c.restore();

        if (!icon) {
            const cHyp = Math.hypot(s.a, s.b);
            label(k, `a² = ${s.a ** 2}`, xBase - aLen / 2, yBase - aLen / 2, 'center', 'middle', 0.58);
            label(k, `b² = ${s.b ** 2}`, xBase + bLen / 2, yBase + bLen / 2, 'center', 'middle', 0.58);
            label(k, `c = ${fmtNum(cHyp, 1)} br`, (xBase + xBase + bLen) / 2 + fs * 0.8, (yBase - aLen + yBase) / 2 - fs * 0.8, 'center', 'middle', 0.58);
        }
    }

    // Sağ Analiz Paneli
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.40;
        const ph = r.h * 0.76;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.2;
        panel(k, px, py, pw, ph);

        if (s.mode === 0) {
            label(k, 'Üçgen Eşitsizliği Kuralı', px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);
            label(k, '|b − c| < a < b + c', px + fs * 0.5, py + fs * 2.2, 'left', 'middle', 0.60);

            const diffBC = Math.abs(s.b - s.c);
            const sumBC = s.b + s.c;
            label(k, `|${s.b} − ${s.c}| < ${s.a} < ${s.b} + ${s.c}`, px + fs * 0.5, py + fs * 3.4, 'left', 'middle', 0.55);
            label(k, `${diffBC} < ${s.a} < ${sumBC}  ${s.isValidTriangle ? '✓ (Şart sağlandı)' : '❌ (Sağlanmadı)'}`, px + fs * 0.5, py + fs * 4.4, 'left', 'middle', 0.55);

            line(k, px + fs * 0.5, py + fs * 5.6, px + pw - fs * 0.5, py + fs * 5.6, 1);
            label(k, 'LGS İpucu: Bir üçgenin çizilebilmesi için', px + fs * 0.5, py + fs * 6.5, 'left', 'middle', 0.48);
            label(k, 'herhangi iki kenarın toplamı daima', px + fs * 0.5, py + fs * 7.3, 'left', 'middle', 0.48);
            label(k, 'üçüncü kenardan BÜYÜK olmalıdır.', px + fs * 0.5, py + fs * 8.1, 'left', 'middle', 0.48);
        } else {
            label(k, 'Pisagor Bağıntısı (a² + b² = c²)', px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);
            label(k, `${s.a}² + ${s.b}² = c²`, px + fs * 0.5, py + fs * 2.2, 'left', 'middle', 0.60);
            const sumSq = s.a ** 2 + s.b ** 2;
            const cHyp = Math.sqrt(sumSq);
            label(k, `${s.a ** 2} + ${s.b ** 2} = ${sumSq} = c²`, px + fs * 0.5, py + fs * 3.4, 'left', 'middle', 0.55);
            label(k, `c = √${sumSq} ≈ ${fmtNum(cHyp, 2)} br`, px + fs * 0.5, py + fs * 4.4, 'left', 'middle', 0.60);

            line(k, px + fs * 0.5, py + fs * 5.6, px + pw - fs * 0.5, py + fs * 5.6, 1);
            label(k, 'Özel Dik Üçgenler (LGS):', px + fs * 0.5, py + fs * 6.5, 'left', 'middle', 0.52);
            label(k, '• 3 - 4 - 5  (ve katları: 6-8-10, 9-12-15)', px + fs * 0.5, py + fs * 7.4, 'left', 'middle', 0.48);
            label(k, '• 5 - 12 - 13', px + fs * 0.5, py + fs * 8.2, 'left', 'middle', 0.48);
            label(k, '• 8 - 15 - 17', px + fs * 0.5, py + fs * 9.0, 'left', 'middle', 0.48);
        }
    }

    if (!icon) {
        label(k, 'Pisagor & Üçgen Eşitsizliği Laboratuvarı', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const pythagorasSpec: SimSpec = {
    controls: (r) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            { id: 'btn_mode', x: r.x + fs * 16.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Eşitsizlik / Pisagor Modu Değiştir' },
            { id: 'btn_inc_a', x: r.x + fs * 2.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'a Kenarını Değiştir' },
            { id: 'btn_inc_b', x: r.x + fs * 8.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'b Kenarını Değiştir' },
            { id: 'btn_inc_c', x: r.x + fs * 14.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'c Kenarını Değiştir' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_mode') {
            const cur = simValue(o, 'mode', 0);
            return { mode: (cur + 1) % 2 };
        }
        if (id === 'btn_inc_a') {
            const cur = simValue(o, 'a', 6);
            return { a: (cur % 10) + 3 };
        }
        if (id === 'btn_inc_b') {
            const cur = simValue(o, 'b', 8);
            return { b: (cur % 10) + 3 };
        }
        if (id === 'btn_inc_c') {
            const cur = simValue(o, 'c', 10);
            return { c: (cur % 12) + 4 };
        }
        return {};
    },
    params: [
        { key: 'mode', label: 'Mod (0:Eşitsizlik, 1:Pisagor)', min: 0, max: 1, step: 1 },
        { key: 'a', label: 'a Kenarı', min: 2, max: 12, step: 1 },
        { key: 'b', label: 'b Kenarı', min: 2, max: 12, step: 1 },
        { key: 'c', label: 'c Kenarı', min: 2, max: 18, step: 1 },
    ],
};

// ── 3. Eğim Rampası & Doğrusal Denklem ──────────────────────────────
interface SlopeState {
    dx: number; // Yatay uzunluk (1 - 10)
    dy: number; // Dikey yükseklik (1 - 8)
    mode: number; // 0: Rampa ve Araba, 1: Koordinat Düzlemi Doğrusu
}

function slopeState(o: MathObject): SlopeState {
    const dx = clamp(simValue(o, 'dx', 6), 2, 10);
    const dy = clamp(simValue(o, 'dy', 3), 1, 8);
    const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0);
    return { dx, dy, mode };
}

export const slopeRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = slopeState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const drawW = r.w * (icon ? 0.9 : 0.54);
    const drawH = r.h * 0.72;
    const cx0 = r.x + fs * 2.0;
    const cy0 = r.y + fs * 2.8;

    const slopeVal = s.dy / s.dx;
    const slopePercent = Math.round(slopeVal * 100);

    if (s.mode === 0) {
        // Rampa ve Araba Modu
        const unit = Math.min(drawW / 12, drawH / 10);
        const rampaW = s.dx * unit;
        const rampaH = s.dy * unit;

        const xBase = cx0 + (drawW - rampaW) / 2;
        const yBase = cy0 + drawH - fs * 2.0;

        // Zemin ve Rampa Üçgeni
        k.c.save();
        k.c.fillStyle = 'rgba(56, 189, 248, 0.25)';
        k.c.beginPath();
        k.c.moveTo(xBase, yBase);
        k.c.lineTo(xBase + rampaW, yBase);
        k.c.lineTo(xBase + rampaW, yBase - rampaH);
        k.c.closePath();
        k.c.fill();

        k.c.strokeStyle = k.color;
        k.c.lineWidth = 2.5;
        k.c.stroke();

        // Rampa üzerindeki araba
        const carFrac = 0.5;
        const carX = xBase + rampaW * carFrac;
        const carY = yBase - rampaH * carFrac;
        const angle = Math.atan2(rampaH, rampaW);

        k.c.translate(carX, carY);
        k.c.rotate(-angle);
        k.c.fillStyle = '#ef4444';
        k.c.fillRect(-fs * 1.2, -fs * 1.4, fs * 2.4, fs * 1.0);
        k.c.fillStyle = '#1e293b';
        k.c.beginPath();
        k.c.arc(-fs * 0.7, -fs * 0.4, 3.5, 0, Math.PI * 2);
        k.c.arc(fs * 0.7, -fs * 0.4, 3.5, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();

        if (!icon) {
            label(k, `Yatay = ${s.dx} m`, xBase + rampaW / 2, yBase + fs * 0.8, 'center', 'top', 0.55);
            label(k, `Dikey = ${s.dy} m`, xBase + rampaW + fs * 0.5, yBase - rampaH / 2, 'left', 'middle', 0.55);
        }
    } else {
        // Koordinat Düzlemi Doğrusu
        const cx = cx0 + drawW / 2;
        const cy = cy0 + drawH / 2;
        const step = drawW / 14;

        // Eksenler
        line(k, cx0, cy, cx0 + drawW, cy, 1.5);
        line(k, cx, cy0, cx, cy0 + drawH, 1.5);

        // Doğru çizimi (y = m*x)
        const x1 = cx - 5 * step;
        const y1 = cy + 5 * step * slopeVal;
        const x2 = cx + 5 * step;
        const y2 = cy - 5 * step * slopeVal;

        k.c.save();
        k.c.strokeStyle = '#dc2626';
        k.c.lineWidth = 3;
        line(k, x1, y1, x2, y2, 3);
        k.c.restore();

        if (!icon) {
            label(k, 'x', cx0 + drawW - fs * 0.5, cy - fs * 0.5, 'right', 'bottom', 0.5);
            label(k, 'y', cx + fs * 0.5, cy0 + fs * 0.5, 'left', 'top', 0.5);
        }
    }

    // Sağ Analiz Paneli
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.38;
        const ph = r.h * 0.76;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.2;
        panel(k, px, py, pw, ph);

        label(k, 'Eğim Analizi (m)', px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);

        label(k, 'Eğim = Dikey Uzunluk / Yatay Uzunluk', px + fs * 0.5, py + fs * 2.2, 'left', 'middle', 0.55);
        label(k, `m = ${s.dy} / ${s.dx} = ${fmtNum(slopeVal, 2)}`, px + fs * 0.5, py + fs * 3.4, 'left', 'middle', 0.65);
        label(k, `Yüzde Eğim: %${slopePercent}`, px + fs * 0.5, py + fs * 4.6, 'left', 'middle', 0.58);

        line(k, px + fs * 0.5, py + fs * 5.8, px + pw - fs * 0.5, py + fs * 5.8, 1);
        label(k, 'LGS Eğim Kuralları:', px + fs * 0.5, py + fs * 6.8, 'left', 'middle', 0.52);
        label(k, '• Sağa yatık doğru → Pozitif eğim (m > 0)', px + fs * 0.5, py + fs * 7.7, 'left', 'middle', 0.48);
        label(k, '• Sola yatık doğru → Negatif eğim (m < 0)', px + fs * 0.5, py + fs * 8.5, 'left', 'middle', 0.48);
        label(k, '• Yatay doğru → Eğim sıfırdır (m = 0)', px + fs * 0.5, py + fs * 9.3, 'left', 'middle', 0.48);
    }

    if (!icon) {
        label(k, 'Eğim & Doğrusal Denklem Simülatörü', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const slopeSpec: SimSpec = {
    controls: (r) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            { id: 'btn_mode', x: r.x + fs * 16.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Rampa / Koordinat Modu' },
            { id: 'btn_inc_dy', x: r.x + fs * 2.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'Dikey Yüksekliği Artır' },
            { id: 'btn_inc_dx', x: r.x + fs * 9.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'Yatay Tabanı Artır' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_mode') {
            const cur = simValue(o, 'mode', 0);
            return { mode: (cur + 1) % 2 };
        }
        if (id === 'btn_inc_dy') {
            const cur = simValue(o, 'dy', 3);
            return { dy: (cur % 7) + 1 };
        }
        if (id === 'btn_inc_dx') {
            const cur = simValue(o, 'dx', 6);
            return { dx: (cur % 9) + 2 };
        }
        return {};
    },
    params: [
        { key: 'dy', label: 'Dikey Yükseklik', min: 1, max: 8, step: 1 },
        { key: 'dx', label: 'Yatay Uzunluk', min: 2, max: 10, step: 1 },
    ],
};

// ── 4. Daire Grafiği ↔ Sütun Grafiği Dönüştürücü ───────────────────
interface ChartDataState {
    nTotal: number; // Toplam kişi/ürün sayısı (örn: 72)
    a1: number;     // 1. dilim açısı (örn: 120°)
    a2: number;     // 2. dilim açısı (örn: 90°)
    a3: number;     // 3. dilim açısı (örn: 60°)
    a4: number;     // 4. dilim açısı (kalan: 90°)
}

function chartDataState(o: MathObject): ChartDataState {
    const nTotal = clamp(simValue(o, 'total', 72), 36, 360);
    const a1 = clamp(simValue(o, 'a1', 120), 30, 200);
    const a2 = clamp(simValue(o, 'a2', 90), 30, 150);
    const a3 = clamp(simValue(o, 'a3', 60), 20, 100);
    const a4 = Math.max(10, 360 - (a1 + a2 + a3));
    return { nTotal, a1, a2, a3, a4 };
}

export const chartConverterRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = chartDataState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    // Sol Taraf: Daire Grafiği (360°)
    const pieR = Math.min(r.w * 0.18, r.h * 0.28);
    const pieX = r.x + fs * 2.0 + pieR;
    const pieY = r.y + fs * 3.5 + pieR;

    const slices = [
        { name: 'Türkçe', ang: s.a1, color: '#38bdf8' },
        { name: 'Matematik', ang: s.a2, color: '#ef4444' },
        { name: 'Fen', ang: s.a3, color: '#22c55e' },
        { name: 'Sosyal', ang: s.a4, color: '#f59e0b' },
    ];

    let curAng = -Math.PI / 2;
    slices.forEach((sl) => {
        const rad = (sl.ang * Math.PI) / 180;
        k.c.save();
        k.c.fillStyle = sl.color;
        k.c.beginPath();
        k.c.moveTo(pieX, pieY);
        k.c.arc(pieX, pieY, pieR, curAng, curAng + rad);
        k.c.closePath();
        k.c.fill();
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 1.5;
        k.c.stroke();
        k.c.restore();

        if (!icon) {
            const midRad = curAng + rad / 2;
            const tx = pieX + Math.cos(midRad) * (pieR * 0.65);
            const ty = pieY + Math.sin(midRad) * (pieR * 0.65);
            label(k, `${sl.ang}°`, tx, ty, 'center', 'middle', 0.52);
        }
        curAng += rad;
    });

    // Orta/Sağ Taraf: Sütun Grafiği (Kişi Sayıları)
    const barAreaW = r.w * (icon ? 0.9 : 0.46);
    const barAreaH = r.h * 0.62;
    const bx0 = r.x + r.w - barAreaW - fs * 1.0;
    const by0 = r.y + fs * 3.5;
    const bbot = by0 + barAreaH;

    if (!icon && k.o.labels !== false) {
        panel(k, bx0 - fs * 0.5, by0 - fs * 1.0, barAreaW + fs * 1.0, barAreaH + fs * 2.2);
        label(k, `Sütun Grafiği (Toplam: ${s.nTotal} Soru/Öğrenci)`, bx0, by0 - fs * 0.4, 'left', 'bottom', 0.58);

        // Eksenler
        line(k, bx0, bbot, bx0 + barAreaW, bbot, 1.5);
        line(k, bx0, bbot, bx0, by0, 1.5);

        const colW = (barAreaW - fs * 3.0) / 4;
        slices.forEach((sl, i) => {
            const count = Math.round((s.nTotal * sl.ang) / 360);
            const maxVal = s.nTotal * 0.6;
            const barH = clamp((count / maxVal) * (barAreaH - fs * 1.5), 10, barAreaH - fs * 1.5);
            const barX = bx0 + fs * 1.5 + i * (colW + fs * 0.5);
            const barY = bbot - barH;

            k.c.save();
            k.c.fillStyle = sl.color;
            k.c.fillRect(barX, barY, colW, barH);
            k.c.strokeStyle = k.color;
            k.c.lineWidth = 1.2;
            k.c.strokeRect(barX, barY, colW, barH);
            k.c.restore();

            label(k, `${count}`, barX + colW / 2, barY - fs * 0.3, 'center', 'bottom', 0.52);
            label(k, sl.name.slice(0, 3), barX + colW / 2, bbot + fs * 0.4, 'center', 'top', 0.48);
        });

        // Oran orantı formül satırı
        label(k, '💡 Kural: (360° / Toplam) = (Dilim Açısı / Sütun Değeri)', bx0, bbot + fs * 1.6, 'left', 'top', 0.46);
    }

    if (!icon) {
        label(k, 'Daire Grafiği ↔ Sütun Grafiği Dönüştürücü', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const chartConverterSpec: SimSpec = {
    controls: (r) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        return [
            { id: 'btn_preset', x: r.x + fs * 18.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Örnek Soru Açısı Değiştir' },
            { id: 'btn_total', x: r.x + fs * 2.5, y: r.y + r.h - fs * 1.0, type: 'toggle', label: 'Toplam Sayıyı Değiştir (72 / 120 / 360)' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_total') {
            const cur = simValue(o, 'total', 72);
            return { total: cur === 72 ? 120 : cur === 120 ? 360 : 72 };
        }
        if (id === 'btn_preset') {
            const a1 = simValue(o, 'a1', 120);
            return {
                a1: a1 === 120 ? 150 : a1 === 150 ? 90 : 120,
                a2: a1 === 120 ? 60 : a1 === 150 ? 120 : 90,
            };
        }
        return {};
    },
    params: [
        { key: 'total', label: 'Toplam Veri Sayısı', min: 36, max: 360, step: 36 },
        { key: 'a1', label: '1. Açı (Türkçe)', min: 30, max: 180, step: 10 },
        { key: 'a2', label: '2. Açı (Matematik)', min: 30, max: 150, step: 10 },
    ],
};

// ── 5. Silindir ve Koni Açınımı ─────────────────────────────────────
interface NetFoldState {
    mode: number;  // 0: Silindir, 1: Koni
    fold: number;  // 0.0 (Kapalı 3D) - 1.0 (Tam Açık 2D)
    r: number;     // Yarıçap (cm)
    h: number;     // Yükseklik (cm)
}

function netFoldState(o: MathObject): NetFoldState {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0);
    const fold = clamp(simValue(o, 'fold', 1.0), 0.0, 1.0);
    const r = clamp(simValue(o, 'rad', 3), 2, 5);
    const h = clamp(simValue(o, 'h', 8), 5, 12);
    return { mode, fold, r, h };
}

export const cylinderConeNetRender: Renderer = (k) => {
    const r = k.r;
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const s = netFoldState(k.o);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const drawW = r.w * (icon ? 0.9 : 0.55);
    const drawH = r.h * 0.72;
    const cx = r.x + fs * 2.0 + drawW / 2;
    const cy = r.y + fs * 2.8 + drawH / 2;

    if (s.mode === 0) {
        // Silindir Açınımı
        // Açıkken: Ortada Dikdörtgen (2*pi*r x h), üstte ve altta 2 daire (r)
        const scale = Math.min(drawW / 22, drawH / 20);
        const rectW = 2 * Math.PI * s.r * scale * s.fold + (1 - s.fold) * (2 * s.r * scale);
        const rectH = s.h * scale;
        const circleR = s.r * scale;

        k.c.save();
        // Yanal Yüzey (Dikdörtgen)
        k.c.fillStyle = 'rgba(56, 189, 248, 0.35)';
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 2;
        k.c.fillRect(cx - rectW / 2, cy - rectH / 2, rectW, rectH);
        k.c.strokeRect(cx - rectW / 2, cy - rectH / 2, rectW, rectH);

        // Üst Taban Dairesi
        const topCircleY = cy - rectH / 2 - circleR * s.fold - (1 - s.fold) * 2;
        k.c.fillStyle = '#f59e0b';
        k.c.beginPath();
        if (s.fold > 0.5) {
            k.c.arc(cx, topCircleY, circleR, 0, Math.PI * 2);
        } else {
            // 3D görünümde elips
            k.c.ellipse(cx, cy - rectH / 2, rectW / 2, circleR * 0.4, 0, 0, Math.PI * 2);
        }
        k.c.fill();
        k.c.stroke();

        // Alt Taban Dairesi
        const botCircleY = cy + rectH / 2 + circleR * s.fold + (1 - s.fold) * 2;
        k.c.beginPath();
        if (s.fold > 0.5) {
            k.c.arc(cx, botCircleY, circleR, 0, Math.PI * 2);
        } else {
            k.c.ellipse(cx, cy + rectH / 2, rectW / 2, circleR * 0.4, 0, 0, Math.PI * 2);
        }
        k.c.fill();
        k.c.stroke();
        k.c.restore();

        if (!icon) {
            if (s.fold > 0.8) {
                label(k, `2·π·r = ${fmtNum(2 * 3 * s.r, 0)} cm (Uzun Kenar)`, cx, cy - rectH / 2 - fs * 0.4, 'center', 'bottom', 0.52);
                label(k, `h = ${s.h} cm`, cx + rectW / 2 + fs * 0.5, cy, 'left', 'middle', 0.52);
                label(k, `r = ${s.r}`, cx, topCircleY, 'center', 'middle', 0.50);
            }
        }
    } else {
        // Koni Açınımı
        // Açıkken: Daire Dilimi (açı alpha = 360 * r / l) + Taban Dairesi (r)
        const lHyp = Math.hypot(s.r, s.h);
        const alpha = Math.round((360 * s.r) / lHyp);
        const scale = Math.min(drawW / 22, drawH / 20);
        const lPx = lHyp * scale * 0.85;
        const circleR = s.r * scale * 0.85;

        k.c.save();
        k.c.fillStyle = 'rgba(168, 85, 247, 0.35)';
        k.c.strokeStyle = k.color;
        k.c.lineWidth = 2;

        // Daire Dilimi
        const startA = -Math.PI / 2 - ((alpha / 2) * Math.PI) / 180;
        const endA = startA + (alpha * Math.PI) / 180;
        const apexY = cy - fs * 2.0;

        k.c.beginPath();
        k.c.moveTo(cx, apexY);
        k.c.arc(cx, apexY, lPx, startA, endA);
        k.c.closePath();
        k.c.fill();
        k.c.stroke();

        // Taban Dairesi
        const tabanY = apexY + lPx + circleR + fs * 0.5;
        k.c.fillStyle = '#f59e0b';
        k.c.beginPath();
        k.c.arc(cx, tabanY, circleR, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();
        k.c.restore();

        if (!icon) {
            label(k, `α = ${alpha}°`, cx, apexY + fs * 1.5, 'center', 'middle', 0.55);
            label(k, `Ana Doğru ℓ = ${fmtNum(lHyp, 1)} cm`, cx + lPx * 0.6, apexY + lPx * 0.5, 'left', 'middle', 0.52);
            label(k, `r = ${s.r} cm`, cx, tabanY, 'center', 'middle', 0.50);
        }
    }

    // Sağ Bilgi Paneli
    if (!icon && k.o.labels !== false) {
        const pw = r.w * 0.38;
        const ph = r.h * 0.76;
        const px = r.x + r.w - pw - fs * 1.0;
        const py = r.y + fs * 2.2;
        panel(k, px, py, pw, ph);

        if (s.mode === 0) {
            label(k, 'Silindir Yüzey Açınımı', px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);
            label(k, '• Yan Yüzey = Dikdörtgen', px + fs * 0.5, py + fs * 2.2, 'left', 'middle', 0.55);
            label(k, '• Dikdörtgenin Kenarları: (2·π·r) ve (h)', px + fs * 0.5, py + fs * 3.2, 'left', 'middle', 0.50);
            label(k, `• Yanal Alan = 2·π·r·h ≈ ${fmtNum(2 * 3 * s.r * s.h, 0)} cm²`, px + fs * 0.5, py + fs * 4.2, 'left', 'middle', 0.55);
            label(k, `• Taban Alanları (2 adet) = 2·(π·r²) ≈ ${fmtNum(2 * 3 * s.r ** 2, 0)} cm²`, px + fs * 0.5, py + fs * 5.2, 'left', 'middle', 0.50);

            line(k, px + fs * 0.5, py + fs * 6.4, px + pw - fs * 0.5, py + fs * 6.4, 1);
            label(k, 'LGS Kuralı: Dikdörtgenin uzun kenarı,', px + fs * 0.5, py + fs * 7.4, 'left', 'middle', 0.48);
            label(k, 'taban dairesinin ÇEVRESİNE eşittir!', px + fs * 0.5, py + fs * 8.2, 'left', 'middle', 0.50);
        } else {
            label(k, 'Koni Yüzey Açınımı', px + fs * 0.5, py + fs * 0.8, 'left', 'middle', 0.62);
            label(k, '• Yan Yüzey = Daire Dilimi', px + fs * 0.5, py + fs * 2.2, 'left', 'middle', 0.55);
            label(k, '• Alt Yüzey = Daire', px + fs * 0.5, py + fs * 3.2, 'left', 'middle', 0.55);
            label(k, 'Temel Koni Formülü (LGS):', px + fs * 0.5, py + fs * 4.5, 'left', 'middle', 0.55);
            label(k, '  α / 360° = r / ℓ', px + fs * 1.5, py + fs * 5.6, 'left', 'middle', 0.65);
        }
    }

    if (!icon) {
        label(k, 'Silindir & Koni Açınımı Simülatörü', r.x + fs * 1.5, r.y + fs * 1.2, 'left', 'middle', 0.75);
    }

    k.c.restore();
};

export const cylinderConeNetSpec: SimSpec = {
    controls: (r, o) => {
        const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
        const s = netFoldState(o);
        return [
            { id: 'btn_mode', x: r.x + fs * 16.5, y: r.y + fs * 1.2, type: 'toggle', label: 'Silindir / Koni Modunu Değiştir' },
            { id: 'btn_fold', x: r.x + fs * 2.5, y: r.y + r.h - fs * 1.0, type: 'toggle', on: s.fold > 0.5, label: 'Aç / Kapat (2D/3D)' },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        if (id === 'btn_mode') {
            const cur = simValue(o, 'mode', 0);
            return { mode: (cur + 1) % 2 };
        }
        if (id === 'btn_fold') {
            const cur = simValue(o, 'fold', 1.0);
            return { fold: cur > 0.5 ? 0.0 : 1.0 };
        }
        return {};
    },
    params: [
        { key: 'fold', label: 'Açılma Oranı (0:3D, 1:2D)', min: 0, max: 1, step: 0.1 },
        { key: 'rad', label: 'Yarıçap r', min: 2, max: 5, step: 0.5 },
        { key: 'h', label: 'Yükseklik h', min: 5, max: 12, step: 1 },
    ],
};

// ── Katalog ve Dışa Aktarım ──────────────────────────────────────────
export const GRADE8_MATH_RENDERERS: Record<string, Renderer> = {
    algebra_tiles_sim: algebraTilesRender,
    pythagoras_inequality_sim: pythagorasRender,
    slope_linear_sim: slopeRender,
    data_chart_converter_sim: chartConverterRender,
    cylinder_cone_net_sim: cylinderConeNetRender,
};

export const GRADE8_MATH_SPECS: Record<string, SimSpec> = {
    algebra_tiles_sim: algebraTilesSpec,
    pythagoras_inequality_sim: pythagorasSpec,
    slope_linear_sim: slopeSpec,
    data_chart_converter_sim: chartConverterSpec,
    cylinder_cone_net_sim: cylinderConeNetSpec,
};

export const GRADE8_MATH_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'algebra_tiles_sim',
        label: 'Cebir Karoları & Özdeşlikler',
        hint: '(a+b)², (a−b)² ve a²−b² alan modelleri ile geometrik çarpanlara ayırma',
        size: { w: 600, h: 380 },
        defaults: { labels: true, sim: { mode: 0, a: 3, b: 2 } },
    },
    {
        kind: 'pythagoras_inequality_sim',
        label: 'Pisagor & Üçgen Eşitsizliği',
        hint: '|b−c| < a < b+c çubuk kapanma testi ve a² + b² = c² alan ispatı',
        size: { w: 620, h: 380 },
        defaults: { labels: true, sim: { mode: 0, a: 6, b: 8, c: 10 } },
    },
    {
        kind: 'slope_linear_sim',
        label: 'Eğim Rampası & Doğru Grafiği',
        hint: 'Dikey/yatay rampa eğimi (m = dy/dx); pozitif, negatif ve sıfır eğim',
        size: { w: 600, h: 380 },
        defaults: { labels: true, sim: { dx: 6, dy: 3, mode: 0 } },
    },
    {
        kind: 'data_chart_converter_sim',
        label: 'Daire ↔ Sütun Grafiği Çevirici',
        hint: '360° daire dilim açıları ile sütun grafiği frekanslarını eşzamanlı oranla',
        size: { w: 620, h: 400 },
        defaults: { labels: true, sim: { total: 72, a1: 120, a2: 90, a3: 60 } },
    },
    {
        kind: 'cylinder_cone_net_sim',
        label: 'Silindir & Koni Açınımı',
        hint: '3D katıdan 2D açınıma geçiş; dikdörtgen (2πr x h) ve daire dilimi (α/360 = r/ℓ)',
        size: { w: 600, h: 380 },
        defaults: { labels: true, sim: { mode: 0, fold: 1.0, rad: 3, h: 8 } },
    },
];
