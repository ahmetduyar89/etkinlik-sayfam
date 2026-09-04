// src/components/drawing/electricSims.ts
// Elektrik konularının simülasyonları: elektroskop ve yükler arası kuvvet.

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
    smooth,
    smoothPath,
    withAlpha,
    type Ctx,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

// ── Elektroskop (Elektriklenme) ──────────────────────────────────────
//
// Kilit fikir: yaprakların açılması yükün İŞARETİNİ değil, MİKTARINI
// gösterir. Çubuk yalnız yaklaştırılırsa yükler yer değiştirir (etki ile
// elektriklenme) ve çubuk uzaklaşınca yapraklar kapanır; dokundurulursa
// yük elektroskoba geçer ve kalıcı olur.

const SCOPE_MAX_Q = 3;

function scopeState(o: MathObject) {
    const q = clampInt(simValue(o, 'q', 0), -SCOPE_MAX_Q, SCOPE_MAX_Q, 0);
    const rod = simValue(o, 'rod', -1) >= 0 ? 1 : -1;
    // 0: çubuk uzakta, 1: çubuk yaklaştırıldı (dokunmadan)
    const near = simValue(o, 'near', 0) > 0.5;
    // Etki ile yükleme: çubuğun yükü, kendi işaretini yapraklara iter.
    const leafCharge = near ? q + rod : q;
    return {
        q,
        rod,
        near,
        leafCharge,
        spread: Math.min(3, Math.abs(leafCharge)),
    };
}

function scopeGeom(r: Rect) {
    const fs = Math.max(9, Math.min(20, Math.min(r.w, r.h) / 13));
    const icon = isIconSize(r);
    const cx = r.x + r.w * (icon ? 0.5 : 0.42);
    const top = r.y + (icon ? r.h * 0.06 : fs * 2.6);
    const bottom = r.y + r.h - (icon ? r.h * 0.06 : fs * 3.4);
    const height = bottom - top;
    return {
        fs,
        icon,
        cx,
        top,
        bottom,
        height,
        knobR: height * 0.075,
        jarTop: top + height * 0.26,
        jarW: Math.min(r.w * 0.3, height * 0.62),
        pivotY: top + height * 0.46,
        leafLen: height * 0.32,
    };
}

/** Küçük + / − yük işareti. */
function chargeMark(k: Ctx, x: number, y: number, sign: number, size: number) {
    k.c.save();
    k.c.lineWidth = Math.max(1, size * 0.22);
    line(k, x - size, y, x + size, y, k.c.lineWidth);
    if (sign > 0) line(k, x, y - size, x, y + size, k.c.lineWidth);
    k.c.restore();
}

export const electroscopeRender: Renderer = (k) => {
    const r = k.r;
    const s = scopeState(k.o);
    const g = scopeGeom(r);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';
    k.c.lineCap = 'round';

    // Cam fanus: omuzlu, hafif şişkin gövde
    const jw = g.jarW / 2;
    const jarPts: Array<[number, number]> = [
        [g.cx - jw * 0.44, g.jarTop],
        [g.cx - jw * 0.94, g.jarTop + g.height * 0.13],
        [g.cx - jw, g.bottom - g.height * 0.05],
        [g.cx - jw * 0.98, g.bottom],
        [g.cx, g.bottom],
        [g.cx + jw * 0.98, g.bottom],
        [g.cx + jw, g.bottom - g.height * 0.05],
        [g.cx + jw * 0.94, g.jarTop + g.height * 0.13],
        [g.cx + jw * 0.44, g.jarTop],
    ];
    k.c.save();
    k.c.globalAlpha = 0.045;
    smoothPath(k, jarPts);
    k.c.fill();
    k.c.restore();
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.75);
    smooth(k, jarPts, false, Math.max(1.4, k.lw));
    // Fanusun tabanı: düz kenar
    line(k, g.cx - jw * 0.98, g.bottom, g.cx + jw * 0.98, g.bottom, Math.max(1.4, k.lw));
    k.c.restore();
    // Camda parlama
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.25);
    smooth(
        k,
        [
            [g.cx - jw * 0.62, g.jarTop + g.height * 0.16],
            [g.cx - jw * 0.72, g.jarTop + g.height * 0.3],
            [g.cx - jw * 0.66, g.jarTop + g.height * 0.44],
        ],
        false,
        1.2
    );
    k.c.restore();

    // Ahşap taban
    k.c.save();
    k.c.globalAlpha = 0.16;
    roundRect(k, g.cx - jw * 1.25, g.bottom, jw * 2.5, g.height * 0.075, 4);
    k.c.fill();
    k.c.restore();
    k.c.lineWidth = Math.max(1.4, k.lw);
    roundRect(k, g.cx - jw * 1.25, g.bottom, jw * 2.5, g.height * 0.075, 4);
    k.c.stroke();

    // Tıpa ve iletken çubuk
    k.c.save();
    k.c.globalAlpha = 0.2;
    roundRect(k, g.cx - jw * 0.5, g.jarTop - g.height * 0.045, jw, g.height * 0.06, 3);
    k.c.fill();
    k.c.restore();
    roundRect(k, g.cx - jw * 0.5, g.jarTop - g.height * 0.045, jw, g.height * 0.06, 3);
    k.c.stroke();
    line(k, g.cx, g.top + g.knobR, g.cx, g.pivotY, Math.max(2, k.lw * 1.4));

    // Topuz
    k.c.beginPath();
    k.c.arc(g.cx, g.top + g.knobR * 0.9, g.knobR, 0, Math.PI * 2);
    k.c.stroke();
    k.c.save();
    k.c.globalAlpha = 0.14;
    k.c.fill();
    k.c.restore();
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.35);
    k.c.beginPath();
    k.c.arc(g.cx - g.knobR * 0.3, g.top + g.knobR * 0.65, g.knobR * 0.45, Math.PI * 0.9, Math.PI * 1.5);
    k.c.stroke();
    k.c.restore();

    // Yapraklar: yük miktarı arttıkça açılır
    const angle = (4 + s.spread * 11) * (Math.PI / 180);
    for (const dir of [-1, 1]) {
        const tipX = g.cx + dir * Math.sin(angle) * g.leafLen;
        const tipY = g.pivotY + Math.cos(angle) * g.leafLen;
        const wide = g.leafLen * 0.11;
        k.c.save();
        k.c.globalAlpha = 0.18;
        k.c.beginPath();
        k.c.moveTo(g.cx, g.pivotY);
        k.c.lineTo(tipX - dir * wide * 0.2, tipY);
        k.c.lineTo(tipX + dir * wide, tipY - wide * 0.3);
        k.c.closePath();
        k.c.fill();
        k.c.restore();
        k.c.lineWidth = Math.max(1.2, k.lw * 0.9);
        k.c.beginPath();
        k.c.moveTo(g.cx, g.pivotY);
        k.c.lineTo(tipX - dir * wide * 0.2, tipY);
        k.c.lineTo(tipX + dir * wide, tipY - wide * 0.3);
        k.c.closePath();
        k.c.stroke();
        // Yaprak üzerindeki yük işaretleri
        if (!g.icon && s.leafCharge !== 0) {
            const sign = Math.sign(s.leafCharge);
            for (let i = 0; i < Math.min(2, Math.abs(s.leafCharge)); i++) {
                chargeMark(
                    k,
                    g.cx + dir * Math.sin(angle) * g.leafLen * (0.45 + i * 0.32),
                    g.pivotY + Math.cos(angle) * g.leafLen * (0.45 + i * 0.32),
                    sign,
                    g.fs * 0.2
                );
            }
        }
    }

    // Topuzdaki yükler: etki ile yükleme sırasında zıt işaret toplanır
    if (!g.icon) {
        const knobSign = s.near ? -s.rod : Math.sign(s.q);
        if (knobSign !== 0) {
            for (let i = -1; i <= 1; i++) {
                chargeMark(k, g.cx + i * g.knobR * 0.55, g.top + g.knobR * 0.9, knobSign, g.fs * 0.2);
            }
        }
    }

    // Yüklü çubuk (ebonit / cam): yakınken topuza yaklaşır
    const rodX = g.cx - (s.near ? g.jarW * 0.62 : g.jarW * 1.5);
    const rodY = g.top + g.knobR * 0.9;
    k.c.save();
    k.c.globalAlpha = 0.14;
    roundRect(k, rodX - g.jarW * 0.9, rodY - g.fs * 0.42, g.jarW * 0.9, g.fs * 0.84, g.fs * 0.4);
    k.c.fill();
    k.c.restore();
    k.c.lineWidth = Math.max(1.4, k.lw);
    roundRect(k, rodX - g.jarW * 0.9, rodY - g.fs * 0.42, g.jarW * 0.9, g.fs * 0.84, g.fs * 0.4);
    k.c.stroke();
    if (!g.icon) {
        for (let i = 0; i < 3; i++) {
            chargeMark(k, rodX - g.jarW * (0.2 + i * 0.24), rodY, s.rod, g.fs * 0.2);
        }
    }

    if (g.icon || k.o.labels === false) {
        k.c.restore();
        return;
    }

    // Okuma paneli
    const px = r.x + r.w * 0.6;
    const pw = r.w - (px - r.x) - 6;
    const ph = g.fs * 7.4;
    const py = g.top + g.height * 0.06;
    panel(k, px, py, pw, ph);
    const lines: Array<[string, string]> = [
        ['Çubuk', s.rod > 0 ? 'pozitif yüklü' : 'negatif yüklü'],
        ['Konum', s.near ? 'topuza yakın' : 'uzakta'],
        ['Elektroskop', s.q === 0 ? 'nötr' : `${s.q > 0 ? '+' : '−'}${Math.abs(s.q)} yüklü`],
        ['Yapraklar', s.spread === 0 ? 'kapalı' : s.spread === 1 ? 'az açık' : s.spread === 2 ? 'açık' : 'çok açık'],
    ];
    lines.forEach(([name, value], i) => {
        const y = py + g.fs * (1.1 + i * 1.55);
        label(k, name, px + g.fs * 0.6, y, 'left', 'middle', 0.58);
        label(k, fitText(k, [value], pw - g.fs * 4.4, 0.64), px + pw - g.fs * 0.6, y, 'right', 'middle', 0.64);
    });

    const mode = s.near
        ? 'Etki ile elektriklenme: çubuk uzaklaşınca yapraklar kapanır'
        : s.q === 0
          ? 'Elektroskop nötr: yapraklar kapalı'
          : 'Dokunma ile yüklendi: yük elektroskopta kaldı, yapraklar açık kalır';
    label(k, fitText(k, [mode, s.near ? 'Etki ile elektriklenme' : 'Dokunma ile elektriklenme'], r.w - 10, 0.7), r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.7);
    label(
        k,
        fitText(
            k,
            ['Yaprakların açıklığı yükün miktarını gösterir, işaretini değil', 'Elektroskop'],
            r.w - g.fs * 5,
            0.8,
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8,
    );
    k.c.restore();
};

export const electroscopeSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = scopeState(o);
        const g = scopeGeom(r);
        return [
            {
                id: 'near',
                x: g.cx - g.jarW * (s.near ? 1.3 : 2.1),
                y: g.top + g.knobR * 0.9,
                type: 'toggle',
                label: s.near ? 'Çubuğu uzaklaştır' : 'Çubuğu topuza yaklaştır',
                on: s.near,
            },
            {
                id: 'touch',
                x: r.x + r.w - 14,
                y: r.y + 14,
                type: 'toggle',
                label: 'Çubuğu topuza dokundur (yük aktar)',
                on: false,
            },
            {
                id: 'rod',
                x: r.x + r.w - 40,
                y: r.y + 14,
                type: 'toggle',
                label: s.rod > 0 ? 'Negatif yüklü çubuğa geç' : 'Pozitif yüklü çubuğa geç',
                on: s.rod > 0,
            },
            {
                id: 'ground',
                x: r.x + r.w - 66,
                y: r.y + 14,
                type: 'toggle',
                label: 'Topraklayarak boşalt',
                on: s.q === 0,
            },
        ];
    },
    onControl: (_r, o, id): Record<string, number> => {
        const s = scopeState(o);
        if (id === 'near') return { near: s.near ? 0 : 1 };
        if (id === 'rod') return { rod: s.rod > 0 ? -1 : 1 };
        if (id === 'ground') return { q: 0, near: 0 };
        // Dokunma: yük elektroskoba geçer ve çubuk çekilir.
        if (id === 'touch') {
            return { q: clamp(s.q + s.rod, -SCOPE_MAX_Q, SCOPE_MAX_Q), near: 0 };
        }
        return {};
    },
    params: [
        { key: 'q', label: 'Elektroskop yükü', min: -SCOPE_MAX_Q, max: SCOPE_MAX_Q, step: 1 },
        { key: 'rod', label: 'Çubuk yükü (−1 / +1)', min: -1, max: 1, step: 2 },
        { key: 'near', label: 'Çubuk yakın (0/1)', min: 0, max: 1, step: 1 },
    ],
};

// ── Kayıt ────────────────────────────────────────────────────────────

// ── Yükler arası kuvvet (Elektriklenme) ──────────────────────────────
//
// Kilit fikir: aynı işaretli yükler birbirini iter, zıt işaretliler
// çeker. Kuvvetin büyüklüğü yüklerin çarpımıyla doğru, uzaklığın
// KARESİYLE ters orantılıdır — uzaklık iki katına çıkınca kuvvet dörtte
// bire iner. İki küreye etkiyen kuvvetler eşit büyüklükte ve zıt yönlüdür.

const COULOMB_STEPS = [-2, -1, 0, 1, 2] as const;

interface CoulombState {
    q1: number;
    q2: number;
    /** Küre merkezleri arası uzaklık (birim). */
    d: number;
    /** Bağıl kuvvet büyüklüğü (birim). */
    f: number;
    attract: boolean;
    zero: boolean;
}

const coulombState = (o: MathObject): CoulombState => {
    const q1 = clampInt(simValue(o, 'q1', 2), -2, 2, 2);
    const q2 = clampInt(simValue(o, 'q2', -1), -2, 2, -1);
    const d = clamp(simValue(o, 'd', 3), 1, 6);
    const prod = q1 * q2;
    return { q1, q2, d, f: Math.abs(prod) / (d * d), attract: prod < 0, zero: prod === 0 };
};

/** Yüklü küre: sehpası, yük işaretleri ve parlaklığıyla. */
function chargedSphere(k: Ctx, cx: number, cy: number, R: number, q: number, fs: number, icon: boolean) {
    // Yalıtkan sehpa
    if (!icon) {
        line(k, cx, cy + R, cx, cy + R * 2.1, Math.max(1.6, k.lw));
        line(k, cx - R * 0.7, cy + R * 2.1, cx + R * 0.7, cy + R * 2.1, Math.max(2, k.lw * 1.2));
    }
    fillShape(k, () => k.c.arc(cx, cy, R, 0, Math.PI * 2), 0.1);
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.8, k.lw);
    k.c.arc(cx, cy, R, 0, Math.PI * 2);
    k.c.stroke();
    // Parlama
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    k.c.beginPath();
    k.c.lineWidth = 1.4;
    k.c.arc(cx, cy, R * 0.68, Math.PI * 1.05, Math.PI * 1.5);
    k.c.stroke();
    k.c.restore();
    if (icon) return;

    const n = Math.abs(q);
    const sign = q > 0 ? 1 : -1;
    const marks = n === 0 ? 2 : n * 2;
    for (let i = 0; i < marks; i++) {
        const a = (i / marks) * Math.PI * 2 + 0.5;
        const mx = cx + Math.cos(a) * R * 0.52;
        const my = cy + Math.sin(a) * R * 0.52;
        const sg = n === 0 ? (i % 2 === 0 ? 1 : -1) : sign;
        const sz = fs * 0.3;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, n === 0 ? 0.5 : 0.9);
        line(k, mx - sz, my, mx + sz, my, 1.8);
        if (sg > 0) line(k, mx, my - sz, mx, my + sz, 1.8);
        k.c.restore();
    }
}

export const coulombRender: Renderer = (k) => {
    const r = k.r;
    const s = coulombState(k.o);
    const icon = isIconSize(r);
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);

    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineJoin = 'round';

    const stage: Rect = icon
        ? r
        : { x: r.x + fs * 0.5, y: r.y + fs * 2.2, w: r.w * 0.63, h: r.h - fs * 3.4 };
    const cy = stage.y + stage.h * (icon ? 0.5 : 0.42);
    const R = Math.min(stage.h * 0.17, stage.w * 0.1);
    const unit = (stage.w - R * 2.6) / 6;
    const x1 = stage.x + R * 1.3;
    const x2 = x1 + s.d * unit;

    chargedSphere(k, x1, cy, R, s.q1, fs, icon);
    chargedSphere(k, x2, cy, R, s.q2, fs, icon);

    // Kuvvet okları: eşit büyüklükte, zıt yönlü
    const maxLen = Math.min(unit * 1.6, stage.w * 0.22);
    const len = s.zero ? 0 : clamp(s.f / 4, 0.12, 1) * maxLen;
    if (!s.zero) {
        k.c.save();
        k.c.strokeStyle = k.color;
        const w = Math.max(2.2, k.lw * 1.5);
        if (s.attract) {
            arrow(k, x1 + R * 1.1, cy, x1 + R * 1.1 + len, cy, fs * 0.5, w);
            arrow(k, x2 - R * 1.1, cy, x2 - R * 1.1 - len, cy, fs * 0.5, w);
        } else {
            arrow(k, x1 - R * 1.1, cy, x1 - R * 1.1 - len, cy, fs * 0.5, w);
            arrow(k, x2 + R * 1.1, cy, x2 + R * 1.1 + len, cy, fs * 0.5, w);
        }
        k.c.restore();
    }

    if (icon) {
        k.c.restore();
        return;
    }

    // Uzaklık ölçüsü
    const my = cy + R * 2.9;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    line(k, x1, cy + R * 2.2, x1, my + fs * 0.4, 1);
    line(k, x2, cy + R * 2.2, x2, my + fs * 0.4, 1);
    arrow(k, x1, my, x2, my, fs * 0.4, 1.3);
    arrow(k, x2, my, x1, my, fs * 0.4, 1.3);
    k.c.restore();
    label(k, `d = ${fmtNum(s.d, 1)} birim`, (x1 + x2) / 2, my + fs * 0.55, 'center', 'top', 0.58);
    label(k, `q₁ = ${s.q1 > 0 ? '+' : ''}${s.q1}`, x1, cy - R * 1.35, 'center', 'bottom', 0.62);
    label(k, `q₂ = ${s.q2 > 0 ? '+' : ''}${s.q2}`, x2, cy - R * 1.35, 'center', 'bottom', 0.62);

    if (k.o.labels !== false) {
        const px = r.x + r.w * 0.65;
        const pw = r.w - (px - r.x) - fs * 0.4;
        const py = r.y + fs * 2.2;
        const ph = fs * 8;
        panel(k, px, py, pw, ph);
        label(k, 'F = k · q₁ · q₂ / d²', px + fs * 0.6, py + fs * 1, 'left', 'middle', 0.64);
        const rows: ReadonlyArray<[string, string]> = [
            ['Yükler', `${s.q1 > 0 ? '+' : ''}${s.q1} ve ${s.q2 > 0 ? '+' : ''}${s.q2}`],
            ['Uzaklık', `${fmtNum(s.d, 1)} birim`],
            ['Kuvvet', s.zero ? 'yok (yük sıfır)' : `${fmtNum(s.f, 2)} birim`],
        ];
        rows.forEach(([a, b], i) => {
            const y = py + fs * (2.5 + i * 1.5);
            label(k, a, px + fs * 0.6, y, 'left', 'middle', 0.52);
            label(k, fitText(k, [b], pw - fs * 1.1, 0.6), px + fs * 0.6, y + fs * 0.72, 'left', 'middle', 0.6);
        });
        label(
            k,
            s.zero ? 'Kuvvet oluşmaz' : s.attract ? 'ZIT yükler → ÇEKME' : 'AYNI yükler → İTME',
            px + fs * 0.6,
            py + fs * 7.2,
            'left',
            'middle',
            0.66
        );

        // Kural şeridi
        const ny = py + ph + fs * 0.8;
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.5);
        roundRect(k, px + fs * 0.4, ny, pw - fs * 0.8, fs * 2.5, 5);
        k.c.lineWidth = 1;
        k.c.stroke();
        k.c.restore();
        label(k, 'Uzaklık 2 katına çıkarsa', px + fs * 0.8, ny + fs * 0.8, 'left', 'middle', 0.52);
        label(k, 'kuvvet 1/4’e iner', px + fs * 0.8, ny + fs * 1.7, 'left', 'middle', 0.6);
    }

    label(
        k,
        fitText(
            k,
            [
                'Yükler arası kuvvet: çarpımla doğru, uzaklığın karesiyle ters orantılı',
                'Yükler arası kuvvet: F = k · q₁ · q₂ / d²',
                'Yükler arası kuvvet',
            ],
            r.w - fs * 3,
            0.8
        ),
        r.x + 4,
        r.y + 1,
        'left',
        'top',
        0.8
    );
    k.c.restore();
};

const coulombGeom = (r: Rect) => {
    const fs = clamp(Math.min(r.w, r.h) / 14, 9, 20);
    const stage: Rect = { x: r.x + fs * 0.5, y: r.y + fs * 2.2, w: r.w * 0.63, h: r.h - fs * 3.4 };
    const R = Math.min(stage.h * 0.17, stage.w * 0.1);
    return { fs, stage, R, cy: stage.y + stage.h * 0.42, unit: (stage.w - R * 2.6) / 6, x1: stage.x + R * 1.3 };
};

const nextCharge = (q: number) => COULOMB_STEPS[(COULOMB_STEPS.indexOf(q as -2) + 1) % COULOMB_STEPS.length];

export const coulombSpec: SimSpec = {
    controls: (r, o): SimControl[] => {
        const s = coulombState(o);
        const g = coulombGeom(r);
        return [
            {
                id: 'q1',
                x: g.x1,
                y: g.cy - g.R * 2.1,
                type: 'toggle',
                label: 'Sol kürenin yükünü değiştir',
                on: s.q1 !== 0,
            },
            {
                id: 'q2',
                x: g.x1 + s.d * g.unit,
                y: g.cy - g.R * 2.1,
                type: 'toggle',
                label: 'Sağ kürenin yükünü değiştir',
                on: s.q2 !== 0,
            },
            {
                id: 'd',
                x: g.x1 + s.d * g.unit,
                y: g.cy + g.R * 2.9,
                type: 'drag',
                label: 'Küreleri yaklaştır ya da uzaklaştır',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const s = coulombState(o);
        if (id === 'q1') return { q1: nextCharge(s.q1) };
        if (id === 'q2') return { q2: nextCharge(s.q2) };
        if (id === 'd' && p) {
            const g = coulombGeom(r);
            return { d: clamp((p.x - g.x1) / g.unit, 1, 6) };
        }
        return {};
    },
    params: [
        { key: 'q1', label: 'Sol yük q₁', min: -2, max: 2, step: 1 },
        { key: 'q2', label: 'Sağ yük q₂', min: -2, max: 2, step: 1 },
        { key: 'd', label: 'Uzaklık d (birim)', min: 1, max: 6, step: 0.5 },
    ],
};

export const ELECTRIC_SIM_RENDERERS: Record<string, Renderer> = {
    electroscope_sim: electroscopeRender,
    coulomb_sim: coulombRender,
};

export const ELECTRIC_SIM_SPECS: Record<string, SimSpec> = {
    electroscope_sim: electroscopeSpec,
    coulomb_sim: coulombSpec,
};

export const ELECTRIC_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'electroscope_sim',
        label: 'Elektroskop',
        hint: 'Yüklü çubuğu yaklaştır ya da dokundur; yaprakları oku',
        size: { w: 540, h: 380 },
        defaults: { labels: true, sim: { q: 0, rod: -1, near: 0 } },
    },
    {
        kind: 'coulomb_sim',
        label: 'Yükler Arası Kuvvet',
        hint: 'Yükleri ve uzaklığı değiştir: çekme mi itme mi, ne kadar?',
        size: { w: 600, h: 360 },
        defaults: { labels: true, sim: { q1: 2, q2: -1, d: 3 } },
    },
];
