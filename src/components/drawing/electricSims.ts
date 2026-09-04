// src/components/drawing/electricSims.ts
// Elektrik konularının simülasyonları. Şimdilik elektroskop.

import type { MathObject } from '../../types';
import {
    clamp,
    clampInt,
    fitText,
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

export const ELECTRIC_SIM_RENDERERS: Record<string, Renderer> = {
    electroscope_sim: electroscopeRender,
};

export const ELECTRIC_SIM_SPECS: Record<string, SimSpec> = {
    electroscope_sim: electroscopeSpec,
};

export const ELECTRIC_SIM_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'electroscope_sim',
        label: 'Elektroskop',
        hint: 'Yüklü çubuğu yaklaştır ya da dokundur; yaprakları oku',
        size: { w: 540, h: 380 },
        defaults: { labels: true, sim: { q: 0, rod: -1, near: 0 } },
    },
];
