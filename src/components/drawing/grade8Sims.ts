// src/components/drawing/grade8Sims.ts
// 8. sınıf Fen Bilimleri ünitelerine göre canlı simülasyonlar.
//
// Ortak altyapı objectDrawing.ts'te, kayıt (renderer/spec/katalog) ise
// simObjects.ts'in sonundadır; burada yalnızca simülasyonların kendisi durur.
// Kalıcı olarak yalnızca kullanıcının ayarladığı değerler saklanır
// (MathObject.sim); animasyonun anlık evresi her karede Ctx.t'den türetilir.

import type { MathObject } from '../../types';
import {
    arrow,
    clamp,
    clampInt,
    ellipse,
    fillShape,
    label,
    line,
    path,
    simValue,
    textWidth,
    withAlpha,
    type Ctx,
    type MathCatalogItem,
    type Rect,
    type Renderer,
    type SimControl,
    type SimSpec,
} from './objectDrawing';

/** Yerçekimi ivmesi; 8. sınıf hesaplarında 10 N/kg alınır. */
export // ── Mevsimlerin oluşumu (Mevsimler ve İklim) ─────────────────────────
//
// Kilit fikir: Dünya'nın ekseni UZAYDA hep aynı yöne bakar. Bu yüzden
// yörüngenin bir yanında kuzey yarım küre Güneş'e dönük, karşı yanında
// dönük değildir. Mevsimin sebebi uzaklık değil, ışınların geliş açısıdır.

const SEASON_TILT = (23.5 * Math.PI) / 180;

interface SeasonInfo {
    north: string;
    south: string;
}

/** Yörüngenin dört özel noktası. Yalnızca o noktalara yakınken yazılır. */
const SEASON_DATES: Record<number, string> = {
    0: '21 Aralık',
    90: '21 Mart',
    180: '21 Haziran',
    270: '23 Eylül',
};

/**
 * Kuzey kutbunun Güneş'e dönüklüğü. Eksen 3 boyutta sabittir; yörünge
 * düzlemi ekranda elips olarak göründüğü için bu değer EKRAN koordinatından
 * değil, yörünge açısından hesaplanmalıdır: −sin(eğiklik)·cos(açı).
 * Açı 0'da Dünya Güneş'in sağındadır ve kuzey kutbu Güneş'ten uzaktır.
 */
const northTowardSun = (angleDeg: number): number =>
    -Math.sin(SEASON_TILT) * Math.cos((angleDeg * Math.PI) / 180);

/**
 * Dört özel tarih mevsimlerin ORTASI değil BAŞLANGICIDIR: 21 Aralık kış
 * gündönümü kışı başlatır, 21 Mart ilkbaharı. Bu yüzden çeyrekler açının
 * kendisiyle başlar, açının ±45° çevresiyle değil.
 */
function seasonAt(angleDeg: number): SeasonInfo {
    const a = ((angleDeg % 360) + 360) % 360;
    // 0° → kuzey kutbu Güneş'ten uzak → kuzeyde kış başlar.
    if (a < 90) return { north: 'Kış', south: 'Yaz' };
    if (a < 180) return { north: 'İlkbahar', south: 'Sonbahar' };
    if (a < 270) return { north: 'Yaz', south: 'Kış' };
    return { north: 'Sonbahar', south: 'İlkbahar' };
}

const seasonsAngle = (o: MathObject, t: number): number => {
    const pos = simValue(o, 'pos', 0);
    const playing = simValue(o, 'play', 0) > 0.5;
    return playing ? pos + t * 24 : pos;
};

function seasonsGeom(r: Rect, o: MathObject, t: number) {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h * 0.52;
    const rx = r.w * 0.34;
    const ry = Math.min(r.h * 0.3, rx * 0.62);
    const angle = seasonsAngle(o, t);
    const rad = (angle * Math.PI) / 180;
    return {
        cx,
        cy,
        rx,
        ry,
        angle,
        earth: { x: cx + rx * Math.cos(rad), y: cy + ry * Math.sin(rad) },
        earthR: Math.min(r.w, r.h) * 0.075,
        sunR: Math.min(r.w, r.h) * 0.062,
    };
}

export const seasonsRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = seasonsGeom(r, k.o, k.t);
    const info = seasonAt(g.angle);

    // Yörünge
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.35);
    k.c.setLineDash([7, 5]);
    k.c.beginPath();
    k.c.lineWidth = 1;
    k.c.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, Math.PI * 2);
    k.c.stroke();
    k.c.restore();

    // Güneş
    k.c.lineWidth = k.lw;
    k.c.beginPath();
    k.c.arc(g.cx, g.cy, g.sunR, 0, Math.PI * 2);
    k.c.stroke();
    for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6;
        line(
            k,
            g.cx + g.sunR * 1.25 * Math.cos(a),
            g.cy + g.sunR * 1.25 * Math.sin(a),
            g.cx + g.sunR * 1.6 * Math.cos(a),
            g.cy + g.sunR * 1.6 * Math.sin(a),
            1,
        );
    }

    // Güneş'ten Dünya'ya paralel ışınlar
    const dx = g.earth.x - g.cx;
    const dy = g.earth.y - g.cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const px = -uy;
    const py = ux;
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    for (let i = -2; i <= 2; i++) {
        const off = i * g.earthR * 0.55;
        arrow(
            k,
            g.cx + ux * g.sunR * 1.8 + px * off,
            g.cy + uy * g.sunR * 1.8 + py * off,
            g.earth.x - ux * g.earthR * 1.15 + px * off,
            g.earth.y - uy * g.earthR * 1.15 + py * off,
            6,
            1,
        );
    }
    k.c.restore();

    // Dünya: gece yarısı gölgeli, ekseni HEP aynı yöne eğik
    k.c.beginPath();
    k.c.lineWidth = k.lw;
    k.c.arc(g.earth.x, g.earth.y, g.earthR, 0, Math.PI * 2);
    k.c.stroke();
    const nightStart = Math.atan2(uy, ux) - Math.PI / 2;
    k.c.save();
    k.c.globalAlpha = 0.18;
    k.c.beginPath();
    k.c.moveTo(g.earth.x, g.earth.y);
    k.c.arc(g.earth.x, g.earth.y, g.earthR, nightStart, nightStart + Math.PI);
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    // Eksen ve ekvator
    // Eksen birim vektörü ekranda yukarı-sağa bakar; kuzey ucu ARTI yöndedir.
    const ax = Math.sin(SEASON_TILT);
    const ay = -Math.cos(SEASON_TILT);
    const axisLen = g.earthR * 1.42;
    line(
        k,
        g.earth.x - ax * axisLen,
        g.earth.y - ay * axisLen,
        g.earth.x + ax * axisLen,
        g.earth.y + ay * axisLen,
        Math.max(1.5, k.lw),
    );
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.55);
    line(
        k,
        g.earth.x + ay * g.earthR,
        g.earth.y - ax * g.earthR,
        g.earth.x - ay * g.earthR,
        g.earth.y + ax * g.earthR,
        1,
    );
    k.c.restore();
    // Kuzey kutbu işareti
    k.c.beginPath();
    k.c.arc(
        g.earth.x + ax * axisLen,
        g.earth.y + ay * axisLen,
        Math.max(2, g.earthR * 0.16),
        0,
        Math.PI * 2,
    );
    k.c.fill();

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    label(
        k,
        'K',
        g.earth.x + ax * axisLen * 1.3,
        g.earth.y + ay * axisLen * 1.3,
        'center',
        'middle',
        0.75,
    );

    // Tarih yalnızca dört özel noktanın yakınında yazılır; aksi halde
    // "21 Mart" etiketi bütün bir çeyreğe yayılıp eksen notuyla çelişiyordu.
    const deg = ((g.angle % 360) + 360) % 360;
    const nearest = (Math.round(deg / 90) * 90) % 360;
    const atCardinal = Math.abs(deg - Math.round(deg / 90) * 90) <= 12;
    const towardSun = northTowardSun(deg);
    const pole = atCardinal ? 'Kuzey kutbu' : 'Kuzey yarım küre';
    const tiltNote =
        towardSun > 0.12
            ? `${pole} Güneş’e dönük`
            : towardSun < -0.12
              ? `${pole} Güneş’ten uzak`
              : 'Işınlar ekvatora dik';
    label(
        k,
        atCardinal ? `${SEASON_DATES[nearest]} · ${tiltNote}` : tiltNote,
        r.x + r.w / 2,
        r.y,
        'center',
        'top',
        0.78,
    );
    label(k, `Kuzey: ${info.north}`, r.x, r.y + r.h, 'left', 'bottom', 0.9);
    label(k, `Güney: ${info.south}`, r.x + r.w, r.y + r.h, 'right', 'bottom', 0.9);
    k.c.restore();
};

export const seasonsSpec: SimSpec = {
    animated: (o) => simValue(o, 'play', 0) > 0.5,
    controls: (r, o) => {
        const playing = simValue(o, 'play', 0) > 0.5;
        const play: SimControl = {
            id: 'play',
            x: r.x + r.w - 14,
            y: r.y + 14,
            type: 'toggle',
            label: playing ? 'Döndürmeyi duraklat' : 'Yörüngede döndür',
            on: playing,
        };
        // Dönerken Dünya'nın yeri her karede değişir; tutamak ise kayıtlı
        // konuma göre hesaplandığından ikisi ayrışır. Bu yüzden sürükleme
        // tutamağı yalnızca duraklatılmışken gösterilir.
        if (playing) return [play];
        const g = seasonsGeom(r, o, 0);
        return [
            {
                id: 'earth',
                x: g.earth.x,
                y: g.earth.y,
                type: 'drag',
                label: 'Dünya’yı yörüngede sürükle',
            },
            play,
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'play') return { play: simValue(o, 'play', 0) > 0.5 ? 0 : 1 };
        const g = seasonsGeom(r, o, 0);
        // Elips üzerinde açıyı bul: eksenlere bölerek daireye indirge.
        const deg = (Math.atan2((p.y - g.cy) / g.ry, (p.x - g.cx) / g.rx) * 180) / Math.PI;
        return { pos: ((deg % 360) + 360) % 360 };
    },
    params: [
        {
            key: 'pos',
            label: 'Yörünge konumu',
            min: 0,
            max: 359,
            step: 1,
            unit: '°',
        },
    ],
};

// ── Işığın Geliş Açısı ve Birim Alan (Mevsimlerin Oluşumu) ──────────

function lightAngleGeom(r: Rect, o: MathObject) {
    const cx = r.x + r.w * 0.42;
    const groundY = r.y + r.h * 0.76;
    const angleDeg = clamp(simValue(o, 'angle', 60), 20, 90);
    const angleRad = (angleDeg * Math.PI) / 180;
    const dist = Math.min(r.w, r.h) * 0.52;

    const srcX = cx - dist * Math.cos(angleRad);
    const srcY = groundY - dist * Math.sin(angleRad);
    const beamW = 40;
    const spotW = beamW / Math.sin(angleRad);
    const intensity = Math.sin(angleRad); // 0..1
    const temp = Math.round(10 + intensity * 28); // 10°C .. 38°C

    return {
        cx,
        groundY,
        angleDeg,
        angleRad,
        srcX,
        srcY,
        beamW,
        spotW,
        intensity,
        temp,
    };
}

export const lightAngleRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = lightAngleGeom(r, k.o);

    // Zemin çizgisi
    line(k, r.x + 10, g.groundY, r.x + r.w - 10, g.groundY, Math.max(2, k.lw * 1.4));

    // Aydınlanan zemin alanı (parlak sarı/turuncu şerit)
    k.c.save();
    const spotLeft = g.cx - g.spotW / 2;
    const spotRight = g.cx + g.spotW / 2;
    k.c.fillStyle = withAlpha('#f59e0b', 0.45);
    k.c.fillRect(spotLeft, g.groundY - 4, g.spotW, 8);
    k.c.strokeStyle = '#d97706';
    k.c.lineWidth = 2;
    k.c.strokeRect(spotLeft, g.groundY - 4, g.spotW, 8);
    k.c.restore();

    // Işık konisi (fenerden zemine)
    k.c.save();
    const perpX = Math.sin(g.angleRad) * (g.beamW / 2);
    const perpY = -Math.cos(g.angleRad) * (g.beamW / 2);
    const grad = k.c.createLinearGradient(g.srcX, g.srcY, g.cx, g.groundY);
    grad.addColorStop(0, withAlpha('#fef08a', 0.85));
    grad.addColorStop(1, withAlpha('#f59e0b', 0.25));
    k.c.fillStyle = grad;
    k.c.beginPath();
    k.c.moveTo(g.srcX - perpX, g.srcY - perpY);
    k.c.lineTo(g.srcX + perpX, g.srcY + perpY);
    k.c.lineTo(spotRight, g.groundY);
    k.c.lineTo(spotLeft, g.groundY);
    k.c.closePath();
    k.c.fill();
    k.c.restore();

    // Fener / Güneş başlığı
    k.c.save();
    k.c.fillStyle = '#eab308';
    k.c.beginPath();
    k.c.arc(g.srcX, g.srcY, 14, 0, Math.PI * 2);
    k.c.fill();
    k.c.strokeStyle = '#ca8a04';
    k.c.lineWidth = 2;
    k.c.stroke();
    k.c.restore();

    // Geliş açısı yayı
    k.c.save();
    k.c.beginPath();
    k.c.strokeStyle = '#ef4444';
    k.c.lineWidth = 1.6;
    k.c.arc(g.cx, g.groundY, 36, Math.PI, Math.PI + g.angleRad);
    k.c.stroke();
    label(k, `${Math.round(g.angleDeg)}°`, g.cx - 44, g.groundY - 14, 'right', 'bottom', 0.72);
    k.c.restore();

    // Aydınlanan alan etiket oku
    label(
        k,
        `Aydınlanan Alan: ${Math.round(g.spotW * 1.5)} br²`,
        g.cx,
        g.groundY + 16,
        'center',
        'top',
        0.75
    );

    // Sağ tarafta Termometre ve Enerji göstergesi
    const thermoX = r.x + r.w - 38;
    const thermoY = r.y + r.h * 0.25;
    const thermoH = r.h * 0.42;
    k.c.save();
    // Termometre tüpü
    k.c.strokeStyle = withAlpha(k.color, 0.5);
    k.c.lineWidth = 2;
    k.c.strokeRect(thermoX - 5, thermoY, 10, thermoH);
    // Hazne
    k.c.beginPath();
    k.c.arc(thermoX, thermoY + thermoH + 6, 9, 0, Math.PI * 2);
    k.c.fillStyle = '#ef4444';
    k.c.fill();
    k.c.stroke();
    // Cıva sütunu
    const fillH = (thermoH * (g.temp - 5)) / 40;
    k.c.fillRect(thermoX - 3, thermoY + thermoH - fillH, 6, fillH);
    k.c.restore();

    label(k, `${g.temp} °C`, thermoX, thermoY - 12, 'center', 'bottom', 0.82);
    label(k, `Enerji: %${Math.round(g.intensity * 100)}`, thermoX, thermoY + thermoH + 20, 'center', 'top', 0.68);

    // Açıklama yazısı
    const seasonState =
        g.angleDeg >= 70
            ? 'DİK AÇI → Dar Alan → Yüksek Enerji Yoğunluğu → Sıcaklık Fazla (YAZ)'
            : g.angleDeg <= 40
              ? 'EĞİK AÇI → Geniş Alan → Düşük Enerji Yoğunluğu → Sıcaklık Az (KIŞ)'
              : 'ORTA AÇI → Ilıman Sıcaklık (İLKBAHAR / SONBAHAR)';
    label(k, seasonState, r.x + r.w / 2, r.y + 10, 'center', 'top', 0.78);

    k.c.restore();
};

export const lightAngleSpec: SimSpec = {
    controls: (r, o) => {
        const g = lightAngleGeom(r, o);
        return [
            {
                id: 'src',
                x: g.srcX,
                y: g.srcY,
                type: 'drag',
                label: 'Güneş / Fener açısını ayarla',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'src') {
            const cx = r.x + r.w * 0.42;
            const groundY = r.y + r.h * 0.76;
            const dx = cx - p.x;
            const dy = groundY - p.y;
            if (dy <= 0) return { angle: 20 };
            const deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
            return { angle: clamp(deg, 20, 90) };
        }
        return {};
    },
    params: [
        { key: 'angle', label: 'Geliş açısı', min: 20, max: 90, step: 1, unit: '°' },
    ],
};

// ── Rüzgar ve Basınç Alanları (İklim ve Hava Hareketleri) ────────────

function windPressureGeom(r: Rect, o: MathObject) {
    const tempA = clampInt(simValue(o, 'tempA', 14), 5, 40, 14);
    const tempB = clampInt(simValue(o, 'tempB', 32), 5, 40, 32);
    const deltaT = Math.abs(tempA - tempB);
    const pA = tempA <= tempB ? 'YAB' : 'AAB';
    const pB = tempB < tempA ? 'YAB' : 'AAB';
    const windSpeed = deltaT * 2.6; // km/h
    const fromAtoB = tempA < tempB;
    const balanced = deltaT < 2;

    const midX = r.x + r.w / 2;
    const groundY = r.y + r.h * 0.78;

    return {
        tempA,
        tempB,
        deltaT,
        pA,
        pB,
        windSpeed,
        fromAtoB,
        balanced,
        midX,
        groundY,
    };
}

export const windPressureRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = windPressureGeom(r, k.o);
    const midX = g.midX;
    const groundY = g.groundY;

    // Bölge arka planları (Soğuk mavi, Sıcak turuncu)
    k.c.save();
    // Bölge A
    k.c.fillStyle = withAlpha(g.tempA < 22 ? '#0284c7' : '#ea580c', 0.12);
    k.c.fillRect(r.x, r.y, r.w / 2, groundY - r.y);
    // Bölge B
    k.c.fillStyle = withAlpha(g.tempB < 22 ? '#0284c7' : '#ea580c', 0.12);
    k.c.fillRect(midX, r.y, r.w / 2, groundY - r.y);
    k.c.restore();

    // Sınır kesikli çizgi
    k.c.save();
    k.c.setLineDash([4, 4]);
    k.c.strokeStyle = withAlpha(k.color, 0.3);
    line(k, midX, r.y + 24, midX, groundY, 1);
    k.c.restore();

    // Zemin
    line(k, r.x, groundY, r.x + r.w, groundY, Math.max(2, k.lw * 1.4));

    // Bölge A ve B dikey hava hareketleri (Oklar)
    const drawAirMotion = (cx: number, isRising: boolean) => {
        k.c.save();
        k.c.strokeStyle = withAlpha(isRising ? '#ef4444' : '#0284c7', 0.75);
        k.c.lineWidth = 2.2;
        const arrowY = groundY - r.h * 0.35;
        if (isRising) {
            // Yükselici hava
            arrow(k, cx - 20, groundY - 15, cx - 20, arrowY, 7);
            arrow(k, cx + 20, groundY - 15, cx + 20, arrowY, 7);
        } else {
            // Alçalıcı hava
            arrow(k, cx - 20, arrowY, cx - 20, groundY - 15, 7);
            arrow(k, cx + 20, arrowY, cx + 20, groundY - 15, 7);
        }
        k.c.restore();
    };

    const centerA = r.x + r.w * 0.25;
    const centerB = r.x + r.w * 0.75;
    drawAirMotion(centerA, g.tempA > g.tempB);
    drawAirMotion(centerB, g.tempB > g.tempA);

    // Bulut (Alçak Basınç alanında)
    const drawCloud = (cx: number, cy: number) => {
        k.c.save();
        k.c.fillStyle = withAlpha('#94a3b8', 0.5);
        k.c.beginPath();
        k.c.arc(cx - 16, cy, 14, 0, Math.PI * 2);
        k.c.arc(cx + 16, cy, 14, 0, Math.PI * 2);
        k.c.arc(cx, cy - 10, 18, 0, Math.PI * 2);
        k.c.fill();
        // Yağmur damlaları
        k.c.strokeStyle = withAlpha('#0284c7', 0.7);
        line(k, cx - 12, cy + 18, cx - 16, cy + 26);
        line(k, cx + 4, cy + 18, cx, cy + 26);
        line(k, cx + 18, cy + 18, cx + 14, cy + 26);
        k.c.restore();
    };

    if (g.tempA > g.tempB && !g.balanced) drawCloud(centerA, r.y + r.h * 0.2);
    if (g.tempB > g.tempA && !g.balanced) drawCloud(centerB, r.y + r.h * 0.2);

    // Güneş simgesi (Yüksek Basınç alanında açık hava)
    const drawSun = (cx: number, cy: number) => {
        k.c.save();
        k.c.fillStyle = '#f59e0b';
        k.c.beginPath();
        k.c.arc(cx, cy, 13, 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();
    };
    if (g.tempA < g.tempB && !g.balanced) drawSun(centerA, r.y + r.h * 0.2);
    if (g.tempB < g.tempA && !g.balanced) drawSun(centerB, r.y + r.h * 0.2);

    // Yatay Rüzgar Akımı (Zemin üzerinde YAB -> AAB yönünde)
    if (!g.balanced) {
        k.c.save();
        k.c.strokeStyle = '#0284c7';
        k.c.lineWidth = Math.min(4.5, 1.8 + g.windSpeed * 0.05);
        const windY = groundY - 24;
        const startX = g.fromAtoB ? r.x + r.w * 0.22 : r.x + r.w * 0.78;
        const endX = g.fromAtoB ? r.x + r.w * 0.78 : r.x + r.w * 0.22;
        arrow(k, startX, windY, endX, windY, 10);

        // Akan rüzgar parçacıkları
        const phase = (k.t * (30 + g.windSpeed * 2.5)) % 60;
        const dir = g.fromAtoB ? 1 : -1;
        k.c.fillStyle = '#38bdf8';
        for (let i = 0; i < 6; i++) {
            const px = startX + dir * ((phase + i * 45) % Math.abs(endX - startX));
            k.c.beginPath();
            k.c.arc(px, windY, 2.5, 0, Math.PI * 2);
            k.c.fill();
        }
        k.c.restore();
    }

    // Başlıklar ve Etiketler
    label(k, `A BÖLGESİ (${g.tempA} °C)`, centerA, r.y + 12, 'center', 'top', 0.85);
    label(k, `B BÖLGESİ (${g.tempB} °C)`, centerB, r.y + 12, 'center', 'top', 0.85);

    label(
        k,
        g.pA === 'YAB' ? 'YÜKSEK BASINÇ (YAB) · Alçalıcı Hava' : 'ALÇAK BASINÇ (AAB) · Yükselici Hava',
        centerA,
        groundY + 12,
        'center',
        'top',
        0.75
    );
    label(
        k,
        g.pB === 'YAB' ? 'YÜKSEK BASINÇ (YAB) · Alçalıcı Hava' : 'ALÇAK BASINÇ (AAB) · Yükselici Hava',
        centerB,
        groundY + 12,
        'center',
        'top',
        0.75
    );

    // Durum açıklaması
    const verdict = g.balanced
        ? 'Sıcaklıklar eşit → Basınç farkı yok → RÜZGAR ESMEZ'
        : `Rüzgar Yönü: ${g.fromAtoB ? 'A (Soğuk/YAB) → B (Sıcak/AAB)' : 'B (Soğuk/YAB) → A (Sıcak/AAB)'} · Hız: ${Math.round(g.windSpeed)} km/h`;
    label(k, verdict, r.x + r.w / 2, r.y + r.h - 8, 'center', 'bottom', 0.82);

    k.c.restore();
};

export const windPressureSpec: SimSpec = {
    animated: true,
    controls: (r, o) => {
        return [
            {
                id: 'swap',
                x: r.x + r.w / 2,
                y: r.y + 20,
                type: 'toggle',
                label: 'Sıcaklıkları ters çevir',
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> => {
        if (id === 'swap') {
            const ta = simValue(o, 'tempA', 14);
            const tb = simValue(o, 'tempB', 32);
            return { tempA: tb, tempB: ta };
        }
        return {};
    },
    params: [
        { key: 'tempA', label: 'A Bölgesi Sıcaklığı', min: 5, max: 40, step: 1, unit: '°C' },
        { key: 'tempB', label: 'B Bölgesi Sıcaklığı', min: 5, max: 40, step: 1, unit: '°C' },
    ],
};

// ── Güneş Yüksekliği ve Gölge Boyu ──────────────────────────────────

function shadowGeom(r: Rect, o: MathObject) {
    const cx = r.x + r.w * 0.38;
    const groundY = r.y + r.h * 0.78;
    const poleH = Math.min(r.h * 0.32, 90);
    const angleDeg = clamp(simValue(o, 'angle', 45), 15, 90);
    const angleRad = (angleDeg * Math.PI) / 180;
    const sunDist = Math.min(r.w, r.h) * 0.55;

    const sunX = cx - sunDist * Math.cos(angleRad);
    const sunY = groundY - sunDist * Math.sin(angleRad);

    const shadowLen = angleDeg >= 89 ? 0 : poleH / Math.tan(angleRad);
    const shadowCm = angleDeg >= 89 ? 0 : Math.round((100 / Math.tan(angleRad)));

    return {
        cx,
        groundY,
        poleH,
        angleDeg,
        angleRad,
        sunX,
        sunY,
        shadowLen,
        shadowCm,
    };
}

export const shadowRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = shadowGeom(r, k.o);

    // Zemin çizgisi
    line(k, r.x, g.groundY, r.x + r.w, g.groundY, Math.max(2, k.lw * 1.4));

    // Gölge (çubuğun dibinden sağa uzanan koyu şerit)
    if (g.shadowLen > 0) {
        k.c.save();
        k.c.fillStyle = withAlpha('#1e293b', 0.65);
        k.c.fillRect(g.cx, g.groundY - 2, g.shadowLen, 5);
        k.c.restore();

        // Cetvel ve ölçü etiketi
        label(
            k,
            `Gölge Boyu: ${g.shadowCm} cm`,
            g.cx + g.shadowLen / 2,
            g.groundY + 16,
            'center',
            'top',
            0.75
        );
    } else {
        label(k, 'Gölge Boyu: 0 cm (Gölge Oluşmaz)', g.cx, g.groundY + 16, 'center', 'top', 0.75);
    }

    // Güneşten çubuğun tepesine uzanan ışın hattı
    k.c.save();
    k.c.setLineDash([4, 4]);
    k.c.strokeStyle = withAlpha('#eab308', 0.6);
    const poleTopY = g.groundY - g.poleH;
    line(k, g.sunX, g.sunY, g.cx + g.shadowLen, g.groundY, 1.5);
    k.c.restore();

    // Referans Çubuk
    k.c.save();
    k.c.fillStyle = '#ef4444';
    k.c.fillRect(g.cx - 3, poleTopY, 6, g.poleH);
    k.c.strokeStyle = '#991b1b';
    k.c.lineWidth = 1.5;
    k.c.strokeRect(g.cx - 3, poleTopY, 6, g.poleH);
    label(k, 'Çubuk (1 m)', g.cx - 8, g.groundY - g.poleH / 2, 'right', 'middle', 0.7);
    k.c.restore();

    // Güneş
    k.c.save();
    k.c.fillStyle = '#facc15';
    k.c.beginPath();
    k.c.arc(g.sunX, g.sunY, 16, 0, Math.PI * 2);
    k.c.fill();
    k.c.strokeStyle = '#ca8a04';
    k.c.lineWidth = 2;
    k.c.stroke();
    // Güneş ışınları
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        line(
            k,
            g.sunX + Math.cos(a) * 19,
            g.sunY + Math.sin(a) * 19,
            g.sunX + Math.cos(a) * 26,
            g.sunY + Math.sin(a) * 26,
            1.6
        );
    }
    k.c.restore();

    // Yükseklik açısı yayı
    k.c.save();
    k.c.beginPath();
    k.c.strokeStyle = '#f59e0b';
    k.c.lineWidth = 1.5;
    k.c.arc(g.cx, g.groundY, 32, Math.PI, Math.PI + g.angleRad);
    k.c.stroke();
    label(k, `${Math.round(g.angleDeg)}°`, g.cx - 38, g.groundY - 14, 'right', 'bottom', 0.72);
    k.c.restore();

    // Üst açıklama
    const note =
        g.angleDeg >= 80
            ? 'ÖĞLE VAKTİ / YAZ MEVSİMİ → Güneş tepeye yakın (dik) → Gölge boyu en KISA'
            : g.angleDeg <= 35
              ? 'SABAH-AKŞAM / KIŞ MEVSİMİ → Güneş ufka yakın (eğik) → Gölge boyu en UZUN'
              : 'Güneş yükseldikçe geliş açısı artar, gölge boyu kısalır';
    label(k, note, r.x + r.w / 2, r.y + 10, 'center', 'top', 0.8);

    k.c.restore();
};

export const shadowSpec: SimSpec = {
    controls: (r, o) => {
        const g = shadowGeom(r, o);
        return [
            {
                id: 'sun',
                x: g.sunX,
                y: g.sunY,
                type: 'drag',
                label: 'Güneş yüksekliğini ayarla',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'sun') {
            const cx = r.x + r.w * 0.38;
            const groundY = r.y + r.h * 0.78;
            const dx = cx - p.x;
            const dy = groundY - p.y;
            if (dy <= 0) return { angle: 15 };
            const deg = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
            return { angle: clamp(deg, 15, 90) };
        }
        return {};
    },
    params: [
        { key: 'angle', label: 'Güneş açısı', min: 15, max: 90, step: 1, unit: '°' },
    ],
};

// ── Punnett karesi (DNA ve Genetik Kod) ──────────────────────────────

/** 0 = baskın (A), 1 = çekinik (a). Cinsiyet kipinde 0 = X, 1 = Y. */
function punnettAlleles(o: MathObject) {
    const sex = simValue(o, 'mode', 0) > 0.5;
    const letter = (o.text?.trim() || 'A').charAt(0);
    const sym = (v: number, isMother: boolean) => {
        if (!sex) return v > 0.5 ? letter.toLowerCase() : letter.toUpperCase();
        // Anne yalnızca X taşır; baba X veya Y.
        if (isMother) return 'X';
        return v > 0.5 ? 'Y' : 'X';
    };
    return {
        sex,
        letter,
        p1: [sym(simValue(o, 'p1a', 0), false), sym(simValue(o, 'p1b', 1), false)],
        p2: [sym(simValue(o, 'p2a', 0), true), sym(simValue(o, 'p2b', 1), true)],
    };
}

function punnettGeom(r: Rect) {
    const pad = Math.min(r.w, r.h) * 0.02;
    const size = Math.min(r.w - pad * 2, (r.h - pad * 2) * 0.78);
    const cell = size / 3;
    const x0 = r.x + (r.w - size) / 2;
    const y0 = r.y + pad;
    return { x0, y0, cell, size };
}

export const punnettRender: Renderer = (k) => {
    const r = k.r;
    const { sex, p1, p2 } = punnettAlleles(k.o);
    const g = punnettGeom(r);
    const { x0, y0, cell } = g;

    k.c.lineWidth = k.lw;
    // 2×2 tablo (ilk satır/sütun ebeveyn gametleri)
    for (let i = 1; i <= 3; i++) {
        line(
            k,
            x0 + cell,
            y0 + i * cell - cell + cell,
            x0 + 3 * cell,
            y0 + i * cell - cell + cell,
            i === 1 ? k.lw : 1,
        );
    }
    k.c.strokeRect(x0 + cell, y0 + cell, cell * 2, cell * 2);
    line(k, x0 + cell * 2, y0 + cell, x0 + cell * 2, y0 + cell * 3);
    line(k, x0 + cell, y0 + cell * 2, x0 + cell * 3, y0 + cell * 2);

    const fs = cell * 0.42;
    const put = (text: string, cxp: number, cyp: number, weight = 700) => {
        k.c.save();
        k.c.font = `${weight} ${Math.round(fs)}px ui-sans-serif, system-ui, Arial`;
        k.c.textAlign = 'center';
        k.c.textBaseline = 'middle';
        k.c.fillText(text, cxp, cyp);
        k.c.restore();
    };

    // Ebeveyn gametleri
    p1.forEach((a, i) => put(a, x0 + cell * (1.5 + i), y0 + cell * 0.5));
    p2.forEach((a, i) => put(a, x0 + cell * 0.5, y0 + cell * (1.5 + i)));

    // Yavru genotipleri
    const kids: string[] = [];
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
            // Büyük harf önce yazılır (Aa, aa gibi)
            const pair = [p1[col], p2[row]].sort((a, b) => {
                const rank = (c: string) => (c === c.toUpperCase() ? 0 : 1);
                return rank(a) - rank(b) || a.localeCompare(b);
            });
            const geno = pair.join('');
            kids.push(geno);
            put(geno, x0 + cell * (1.5 + col), y0 + cell * (1.5 + row), 600);
        }
    }

    if (k.o.labels === false) return;
    let summary: string;
    if (sex) {
        const girls = kids.filter((g2) => g2 === 'XX').length;
        summary = `%${(girls / 4) * 100} kız (XX) · %${((4 - girls) / 4) * 100} erkek (XY)`;
    } else {
        const dominant = kids.filter((g2) => /[A-ZĞÜŞİÖÇ]/.test(g2)).length;
        summary = `${dominant}:${4 - dominant} · %${(dominant / 4) * 100} baskın · %${
            ((4 - dominant) / 4) * 100
        } çekinik`;
    }
    label(
        k,
        sex ? 'Cinsiyetin belirlenmesi' : 'Çaprazlama',
        r.x + r.w / 2,
        r.y + r.h - k.fs * 1.5,
        'center',
        'middle',
        0.8,
    );
    label(k, summary, r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.92);
};

export const punnettSpec: SimSpec = {
    controls: (r, o) => {
        const g = punnettGeom(r);
        const sex = simValue(o, 'mode', 0) > 0.5;
        const list = [
            { id: 'p1a', x: g.x0 + g.cell * 1.5, y: g.y0 + g.cell * 0.12 },
            { id: 'p1b', x: g.x0 + g.cell * 2.5, y: g.y0 + g.cell * 0.12 },
            { id: 'p2a', x: g.x0 + g.cell * 0.12, y: g.y0 + g.cell * 1.5 },
            { id: 'p2b', x: g.x0 + g.cell * 0.12, y: g.y0 + g.cell * 2.5 },
        ];
        return (
            list
                // Cinsiyet kipinde anne hep XX olduğundan onun alelleri kilitli.
                .filter((c) => !sex || c.id.startsWith('p1'))
                .map((c) => ({
                    ...c,
                    type: 'toggle' as const,
                    label: 'Aleli değiştir',
                    on: simValue(o, c.id, c.id.endsWith('b') ? 1 : 0) > 0.5,
                }))
        );
    },
    onControl: (r, o, id): Record<string, number> => {
        const current = simValue(o, id, id.endsWith('b') ? 1 : 0);
        return { [id]: current > 0.5 ? 0 : 1 };
    },
    params: [
        {
            key: 'mode',
            label: 'Kip (0 kalıtım / 1 cinsiyet)',
            min: 0,
            max: 1,
            step: 1,
        },
    ],
};

// ── DNA Eşlenmesi ve Hata Onarımı ────────────────────────────────────

const DNA_PAIRS = [
    { a: 'A', b: 'T' },
    { a: 'G', b: 'C' },
    { a: 'T', b: 'A' },
    { a: 'C', b: 'G' },
    { a: 'A', b: 'T' },
];

function dnaReplicationGeom(r: Rect, o: MathObject) {
    const stage = clampInt(simValue(o, 'stage', 0), 0, 3, 0);
    const errMode = clampInt(simValue(o, 'err', 0), 0, 3, 0);
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h * 0.52;
    const split = stage === 0 ? 0 : stage === 1 ? 42 : stage === 2 ? 75 : 95;

    return {
        stage,
        errMode,
        cx,
        cy,
        split,
    };
}

export const dnaReplicationRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = dnaReplicationGeom(r, k.o);
    const { stage, errMode, cx, cy, split } = g;

    // Renk tablosu
    const baseColors: Record<string, string> = {
        A: '#16a34a', // Yeşil
        T: '#dc2626', // Kırmızı
        G: '#2563eb', // Mavi
        C: '#ca8a04', // Sarı
    };

    const rungCount = DNA_PAIRS.length;
    const rungH = Math.min(28, (r.h * 0.55) / rungCount);
    const startY = cy - (rungCount * rungH) / 2;

    // Aşamalara göre çizim
    for (let i = 0; i < rungCount; i++) {
        const y = startY + i * rungH;
        let baseA = DNA_PAIRS[i].a;
        let baseB = DNA_PAIRS[i].b;

        // Hata onarım senaryoları (3. basamakta uygula)
        let isErrorRung = i === 2 && errMode > 0;
        let showRepairStatus = false;

        if (isErrorRung) {
            if (errMode === 1) {
                // Tek zincirde baz eksik
                baseB = stage >= 2 ? '?' : baseB;
            } else if (errMode === 2) {
                // Yanlış eşleşme (A-C)
                baseB = stage >= 2 ? 'C' : baseB;
            } else if (errMode === 3) {
                // Karşılıklı çift eksik
                baseA = stage >= 2 ? '?' : baseA;
                baseB = stage >= 2 ? '?' : baseB;
            }
            showRepairStatus = stage >= 2;
        }

        // Sol Zincir
        const leftX = cx - split - 24;
        k.c.save();
        k.c.fillStyle = baseA === '?' ? withAlpha('#ef4444', 0.25) : withAlpha(baseColors[baseA] || '#64748b', 0.85);
        k.c.fillRect(leftX - 16, y - rungH * 0.38, 32, rungH * 0.76);
        k.c.strokeStyle = baseA === '?' ? '#ef4444' : '#334155';
        k.c.strokeRect(leftX - 16, y - rungH * 0.38, 32, rungH * 0.76);
        label(k, baseA, leftX, y, 'center', 'middle', 0.82);
        k.c.restore();

        // Sağ Zincir
        const rightX = cx + split + 24;
        k.c.save();
        k.c.fillStyle = baseB === '?' ? withAlpha('#ef4444', 0.25) : withAlpha(baseColors[baseB] || '#64748b', 0.85);
        k.c.fillRect(rightX - 16, y - rungH * 0.38, 32, rungH * 0.76);
        k.c.strokeStyle = baseB === '?' ? '#ef4444' : '#334155';
        k.c.strokeRect(rightX - 16, y - rungH * 0.38, 32, rungH * 0.76);
        label(k, baseB, rightX, y, 'center', 'middle', 0.82);
        k.c.restore();

        // Bağlantı çizgileri (Hidrojen bağı / Replikasyon durumu)
        if (stage === 0) {
            // Bağlı
            k.c.save();
            k.c.setLineDash([3, 3]);
            k.c.strokeStyle = withAlpha(k.color, 0.45);
            line(k, leftX + 16, y, rightX - 16, y, 1.5);
            k.c.restore();
        } else if (stage >= 2) {
            // Yeni nükleotidler karşılarına geldi
            // Solun karşısına yeni gelen
            const newLeftPairX = leftX + 38;
            const pairOfA = DNA_PAIRS[i].b;
            k.c.save();
            k.c.fillStyle = withAlpha(baseColors[pairOfA], 0.75);
            k.c.fillRect(newLeftPairX - 14, y - rungH * 0.35, 28, rungH * 0.7);
            k.c.strokeRect(newLeftPairX - 14, y - rungH * 0.35, 28, rungH * 0.7);
            label(k, pairOfA, newLeftPairX, y, 'center', 'middle', 0.78);
            line(k, leftX + 16, y, newLeftPairX - 14, y, 1);
            k.c.restore();

            // Sağın karşısına yeni gelen
            const newRightPairX = rightX - 38;
            const pairOfB = baseB === '?' ? '?' : DNA_PAIRS[i].a;
            k.c.save();
            k.c.fillStyle = pairOfB === '?' ? withAlpha('#ef4444', 0.25) : withAlpha(baseColors[pairOfB] || '#64748b', 0.75);
            k.c.fillRect(newRightPairX - 14, y - rungH * 0.35, 28, rungH * 0.7);
            k.c.strokeRect(newRightPairX - 14, y - rungH * 0.35, 28, rungH * 0.7);
            label(k, pairOfB, newRightPairX, y, 'center', 'middle', 0.78);
            line(k, newRightPairX + 14, y, rightX - 16, y, 1);
            k.c.restore();
        }

        // Hata durum uyarısı oku
        if (showRepairStatus) {
            k.c.save();
            const statusText =
                errMode === 1
                    ? 'Tek zincirde baz eksik → ONARILABİLİR ✅'
                    : errMode === 2
                      ? 'Yanlış eşleşme (A-C) → ONARILABİLİR ✅'
                      : 'Karşılıklı çift eksik → ONARILAMAZ (MUTASYON!) ❌';
            const statusColor = errMode === 3 ? '#dc2626' : '#16a34a';
            label(k, statusText, cx, y + rungH * 0.45, 'center', 'top', 0.68, statusColor);
            k.c.restore();
        }
    }

    // Aşama Başlığı ve Açıklama
    const stageTitles = [
        '1. AŞAMA: Orijinal DNA Çift Sarmalı (A=T, G≡C)',
        '2. AŞAMA: DNA Fermuar Gibi Açılıyor (Hidrojen bağları kopar)',
        '3. AŞAMA: Serbest Nükleotidler Çekirdeğe Girip Eşleşiyor',
        '4. AŞAMA: Birebir Aynı 2 Yeni DNA Molekülü Oluştu (Yarı Korunumlu)',
    ];
    label(k, stageTitles[stage], cx, r.y + 10, 'center', 'top', 0.82);

    // Alt durum çubuğu
    const errTitles = [
        'Mod: Hatasız Normal Eşlenme',
        'Senaryo: Tek Zincirde Eksik Baz',
        'Senaryo: Yanlış Baz Eşleşmesi',
        'Senaryo: Karşılıklı Çift Eksiklik (Mutasyon)',
    ];
    label(k, errTitles[errMode], cx, r.y + r.h - 10, 'center', 'bottom', 0.75);

    k.c.restore();
};

export const dnaReplicationSpec: SimSpec = {
    controls: (r, o) => {
        const stage = clampInt(simValue(o, 'stage', 0), 0, 3, 0);
        return [
            {
                id: 'next',
                x: r.x + r.w - 18,
                y: r.y + r.h - 18,
                type: 'toggle',
                label: 'Sonraki aşama ▶',
                on: stage > 0,
            },
            {
                id: 'prev',
                x: r.x + r.w - 44,
                y: r.y + r.h - 18,
                type: 'toggle',
                label: '◀ Önceki aşama',
                on: stage > 0,
            },
            {
                id: 'err',
                x: r.x + 20,
                y: r.y + r.h - 18,
                type: 'toggle',
                label: 'Hata senaryosunu değiştir',
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> => {
        const stage = clampInt(simValue(o, 'stage', 0), 0, 3, 0);
        const err = clampInt(simValue(o, 'err', 0), 0, 3, 0);
        if (id === 'next') return { stage: (stage + 1) % 4 };
        if (id === 'prev') return { stage: (stage - 1 + 4) % 4 };
        if (id === 'err') return { err: (err + 1) % 4 };
        return {};
    },
    params: [
        { key: 'stage', label: 'Eşlenme Aşaması (0-3)', min: 0, max: 3, step: 1 },
        { key: 'err', label: 'Hata Modu (0-3)', min: 0, max: 3, step: 1 },
    ],
};

// ── Mutasyon ve Modifikasyon Laboratuvarı ─────────────────────────────

function modificationGeom(r: Rect, o: MathObject) {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0); // 0: Tavşan, 1: Çuha Çiçeği
    const ice = simValue(o, 'ice', 0) > 0.5;
    const temp = clampInt(simValue(o, 'temp', 18), 15, 35, 18);
    const bred = simValue(o, 'bred', 0) > 0.5; // Yavru / tohum testi yapıldı mı
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h * 0.5;

    return {
        mode,
        ice,
        temp,
        bred,
        cx,
        cy,
    };
}

export const modificationRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = modificationGeom(r, k.o);
    const { mode, ice, temp, bred, cx, cy } = g;

    if (mode === 0) {
        // ── HİMALAYA TAVŞANI DENEYİ ──
        label(k, 'DENEY 1: Himalaya Tavşanı (Modifikasyon)', cx, r.y + 10, 'center', 'top', 0.85);

        const rabbitX = cx - 40;
        const rabbitY = cy - 10;

        // Tavşan gövdesi (oval)
        k.c.save();
        k.c.fillStyle = '#f8fafc';
        k.c.strokeStyle = '#64748b';
        k.c.lineWidth = 2;
        k.c.beginPath();
        k.c.ellipse(rabbitX, rabbitY + 15, 65, 42, 0, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();

        // Tavşan kafası
        k.c.beginPath();
        k.c.arc(rabbitX + 55, rabbitY - 5, 26, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();

        // Kulaklar (Himalaya tavşanın uçları doğaldan siyahtır)
        k.c.fillStyle = '#1e293b';
        k.c.beginPath();
        k.c.ellipse(rabbitX + 60, rabbitY - 38, 8, 22, 0.2, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();

        // Burun ucu siyah
        k.c.beginPath();
        k.c.arc(rabbitX + 78, rabbitY - 5, 5, 0, Math.PI * 2);
        k.c.fill();

        // Göz
        k.c.fillStyle = '#ef4444';
        k.c.beginPath();
        k.c.arc(rabbitX + 66, rabbitY - 12, 3, 0, Math.PI * 2);
        k.c.fill();

        // Sırt Bölgesi (Tıraş edilen ve buz konulan alan)
        const patchColor = ice ? '#0f172a' : '#f8fafc'; // Buz varsa siyah kıl çıkar!
        k.c.fillStyle = patchColor;
        k.c.beginPath();
        k.c.ellipse(rabbitX - 10, rabbitY - 12, 28, 16, 0, 0, Math.PI * 2);
        k.c.fill();
        k.c.strokeStyle = '#94a3b8';
        k.c.setLineDash([3, 3]);
        k.c.stroke();
        k.c.restore();

        // Buz Torbası
        if (ice) {
            k.c.save();
            k.c.fillStyle = withAlpha('#38bdf8', 0.8);
            k.c.strokeStyle = '#0284c7';
            k.c.lineWidth = 1.8;
            k.c.fillRect(rabbitX - 25, rabbitY - 44, 34, 24);
            k.c.strokeRect(rabbitX - 25, rabbitY - 44, 34, 24);
            label(k, 'BUZ', rabbitX - 8, rabbitY - 32, 'center', 'middle', 0.65, '#ffffff');
            k.c.restore();
        }

        // Açıklama Kutusu
        const furText = ice
            ? 'Buz konuldu → Çıkan tüyler: SİYAH (Soğukta melanin geni aktifleşti)'
            : 'Normal sıcaklıkta çıkan tüyler: BEYAZ';
        label(k, furText, cx, cy + 65, 'center', 'top', 0.78);

        const verdict = bred
            ? 'Yavru Testi: Yavrular daima BEYAZ doğar → Kalıtsal DEĞİLDİR (MODİFİKASYON) ✅'
            : 'Genin yapısı DEĞİL, çevre etkisiyle İŞLEYİŞİ değişti.';
        label(k, verdict, cx, r.y + r.h - 12, 'center', 'bottom', 0.8, bred ? '#16a34a' : '#0284c7');
    } else {
        // ── ÇUHA ÇİÇEĞİ DENEYİ ──
        label(k, 'DENEY 2: Çuha Çiçeği (Sıcaklık Modifikasyonu)', cx, r.y + 10, 'center', 'top', 0.85);

        const isRed = temp <= 22;
        const flowerColor = isRed ? '#dc2626' : '#f8fafc'; // Kırmızı / Beyaz

        // Saksı
        const potX = cx;
        const potY = cy + 25;
        k.c.save();
        k.c.fillStyle = '#b45309';
        k.c.beginPath();
        k.c.moveTo(potX - 30, potY);
        k.c.lineTo(potX + 30, potY);
        k.c.lineTo(potX + 22, potY + 45);
        k.c.lineTo(potX - 22, potY + 45);
        k.c.closePath();
        k.c.fill();
        k.c.stroke();

        // Sap ve yapraklar
        k.c.strokeStyle = '#15803d';
        k.c.lineWidth = 4;
        line(k, potX, potY, potX, potY - 50);

        // Çiçek Taç Yaprakları
        k.c.fillStyle = flowerColor;
        k.c.strokeStyle = '#475569';
        k.c.lineWidth = 1.6;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2.5) {
            const petX = potX + Math.cos(a) * 22;
            const petY = potY - 50 + Math.sin(a) * 22;
            k.c.beginPath();
            k.c.arc(petX, petY, 14, 0, Math.PI * 2);
            k.c.fill();
            k.c.stroke();
        }
        // Çiçek göbeği
        k.c.fillStyle = '#eab308';
        k.c.beginPath();
        k.c.arc(potX, potY - 50, 10, 0, Math.PI * 2);
        k.c.fill();
        k.c.stroke();
        k.c.restore();

        // Sıcaklık ve Renk etiketi
        label(k, `Sıcaklık: ${temp} °C → Çiçek Rengi: ${isRed ? 'KIRMIZI' : 'BEYAZ'}`, cx, cy + 85, 'center', 'top', 0.82);
        label(
            k,
            '15-25°C: Kırmızı Çiçek   |   30-35°C: Beyaz Çiçek (Genin işleyişi değişir)',
            cx,
            r.y + r.h - 12,
            'center',
            'bottom',
            0.75
        );
    }

    k.c.restore();
};

export const modificationSpec: SimSpec = {
    controls: (r, o) => {
        const mode = clampInt(simValue(o, 'mode', 0), 0, 1, 0);
        const ice = simValue(o, 'ice', 0) > 0.5;
        const bred = simValue(o, 'bred', 0) > 0.5;
        return [
            {
                id: 'toggleMode',
                x: r.x + 24,
                y: r.y + 20,
                type: 'toggle',
                label: mode === 0 ? 'Çuha Çiçeğine Geç' : 'Himalaya Tavşanına Geç',
            },
            ...(mode === 0
                ? [
                      {
                          id: 'toggleIce',
                          x: r.x + r.w - 24,
                          y: r.y + 20,
                          type: 'toggle' as const,
                          label: ice ? 'Buz Torbasını Kaldır' : 'Sırta Buz Torbası Koy',
                          on: ice,
                      },
                      {
                          id: 'breed',
                          x: r.x + r.w / 2,
                          y: r.y + r.h - 32,
                          type: 'toggle' as const,
                          label: bred ? 'Yavru Testini Sıfırla' : 'Yavruyu Doğurt (Kalıtsal mı?)',
                          on: bred,
                      },
                  ]
                : []),
        ];
    },
    onControl: (r, o, id): Record<string, number> => {
        if (id === 'toggleMode') return { mode: simValue(o, 'mode', 0) > 0.5 ? 0 : 1 };
        if (id === 'toggleIce') return { ice: simValue(o, 'ice', 0) > 0.5 ? 0 : 1 };
        if (id === 'breed') return { bred: simValue(o, 'bred', 0) > 0.5 ? 0 : 1 };
        return {};
    },
    params: [
        { key: 'mode', label: 'Deney (0 Tavşan / 1 Çuha)', min: 0, max: 1, step: 1 },
        { key: 'temp', label: 'Çiçek Sıcaklığı', min: 15, max: 35, step: 1, unit: '°C' },
    ],
};

// ── Nükleotid Yapısı ve KeDiGeNi Hiyerarşisi ──────────────────────────

function nucleotideGeom(r: Rect, o: MathObject) {
    const baseIdx = clampInt(simValue(o, 'base', 0), 0, 3, 0);
    const bases = ['A', 'T', 'G', 'C'];
    const baseNames = ['Adenin', 'Timin', 'Guanin', 'Sitozin'];
    const baseColors = ['#16a34a', '#dc2626', '#2563eb', '#ca8a04'];
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h * 0.58;

    return {
        baseIdx,
        baseSym: bases[baseIdx],
        baseName: baseNames[baseIdx],
        baseColor: baseColors[baseIdx],
        cx,
        cy,
    };
}

export const nucleotideRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = nucleotideGeom(r, k.o);
    const cx = g.cx;
    const cy = g.cy;

    // ── Üst Kısım: KeDiGeNi Hiyerarşisi (Kromozom > DNA > Gen > Nükleotid) ──
    const hieY = r.y + 22;
    const boxW = Math.min(68, r.w * 0.18);
    const boxH = 26;
    const gap = 16;
    const startX = cx - (4 * boxW + 3 * gap) / 2;

    const items = [
        { code: 'K', label: 'Kromozom' },
        { code: 'D', label: 'DNA' },
        { code: 'G', label: 'Gen' },
        { code: 'N', label: 'Nükleotid' },
    ];

    items.forEach((it, i) => {
        const bx = startX + i * (boxW + gap);
        k.c.save();
        k.c.fillStyle = i === 3 ? withAlpha('#6366f1', 0.25) : withAlpha('#0284c7', 0.15);
        k.c.strokeStyle = i === 3 ? '#6366f1' : '#0284c7';
        k.c.lineWidth = 1.5;
        k.c.strokeRect(bx, hieY, boxW, boxH);
        k.c.fillRect(bx, hieY, boxW, boxH);
        label(k, `${it.code} · ${it.label}`, bx + boxW / 2, hieY + boxH / 2, 'center', 'middle', 0.68);
        k.c.restore();

        if (i < 3) {
            label(k, '>', bx + boxW + gap / 2, hieY + boxH / 2, 'center', 'middle', 0.85);
        }
    });

    label(k, 'Karmaşıktan Basite Sıralama (KeDiGeNi)', cx, r.y + 4, 'center', 'top', 0.72);

    // ── Alt Kısım: 1 Nükleotidin 3 Temel Parçası ──
    const nucY = cy + 5;

    // 1. Fosfat (Daire P)
    const phosX = cx - 95;
    k.c.save();
    k.c.fillStyle = '#f59e0b';
    k.c.strokeStyle = '#b45309';
    k.c.lineWidth = 2;
    k.c.beginPath();
    k.c.arc(phosX, nucY, 22, 0, Math.PI * 2);
    k.c.fill();
    k.c.stroke();
    label(k, 'P', phosX, nucY - 2, 'center', 'middle', 0.9, '#ffffff');
    label(k, 'Fosfat', phosX, nucY + 30, 'center', 'top', 0.7);
    k.c.restore();

    // Fosfat ile Şeker Arası Bağ
    line(k, phosX + 22, nucY, cx - 40, nucY, 2.5);

    // 2. Deoksiriboz Şekeri (5-gen D)
    const sugarX = cx - 10;
    k.c.save();
    k.c.fillStyle = '#38bdf8';
    k.c.strokeStyle = '#0284c7';
    k.c.lineWidth = 2;
    k.c.beginPath();
    for (let a = 0; a < 5; a++) {
        const ang = (a * 2 * Math.PI) / 5 - Math.PI / 2;
        const px = sugarX + Math.cos(ang) * 26;
        const py = nucY + Math.sin(ang) * 26;
        if (a === 0) k.c.moveTo(px, py);
        else k.c.lineTo(px, py);
    }
    k.c.closePath();
    k.c.fill();
    k.c.stroke();
    label(k, 'D', sugarX, nucY - 2, 'center', 'middle', 0.9, '#ffffff');
    label(k, 'Deoksiriboz', sugarX, nucY + 30, 'center', 'top', 0.7);
    k.c.restore();

    // Şeker ile Baz Arası Bağ
    line(k, sugarX + 26, nucY, cx + 50, nucY, 2.5);

    // 3. Organik Baz (Dikdörtgen A/T/G/C)
    const baseX = cx + 85;
    k.c.save();
    k.c.fillStyle = g.baseColor;
    k.c.strokeStyle = '#334155';
    k.c.lineWidth = 2;
    k.c.fillRect(baseX - 30, nucY - 22, 60, 44);
    k.c.strokeRect(baseX - 30, nucY - 22, 60, 44);
    label(k, g.baseSym, baseX, nucY - 3, 'center', 'middle', 1.0, '#ffffff');
    label(k, g.baseName, baseX, nucY + 30, 'center', 'top', 0.75);
    k.c.restore();

    // Alt Kural & İsimlendirme
    label(
        k,
        `Bu nükleotid: "${g.baseName} Nükleotidi" (İçerdiği baza göre isimlendirilir)`,
        cx,
        r.y + r.h - 26,
        'center',
        'bottom',
        0.82
    );
    label(
        k,
        'Kural: Toplam Nükleotid = Toplam Şeker = Toplam Fosfat = Toplam Baz (A+T+G+C)',
        cx,
        r.y + r.h - 8,
        'center',
        'bottom',
        0.72
    );

    k.c.restore();
};

export const nucleotideSpec: SimSpec = {
    controls: (r, o) => {
        const cx = r.x + r.w / 2;
        return [
            {
                id: 'nextBase',
                x: cx + 85,
                y: r.y + r.h * 0.58,
                type: 'toggle',
                label: 'Organik bazı değiştir (A, T, G, C)',
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> => {
        if (id === 'nextBase') {
            const b = clampInt(simValue(o, 'base', 0), 0, 3, 0);
            return { base: (b + 1) % 4 };
        }
        return {};
    },
    params: [
        { key: 'base', label: 'Baz (0:A / 1:T / 2:G / 3:C)', min: 0, max: 3, step: 1 },
    ],
};

// ── Sıvı basıncı (Basınç) ────────────────────────────────────────────
//
// P = h · d · g  →  basınç yalnızca derinliğe ve sıvının yoğunluğuna bağlı.
// Fışkırma menzili çıkış hızıyla orantılıdır (v = √(2gh)), yani derindeki
// delikten çıkan su daha uzağa gider.

const G = 10;

function liquidGeom(r: Rect, o: MathObject) {
    const pad = Math.min(r.w, r.h) * 0.08;
    const tankW = r.w * 0.34;
    const tankX = r.x + pad;
    const tankTop = r.y + pad;
    const tankBottom = r.y + r.h - pad * 1.4;
    const fillPct = clamp(simValue(o, 'h', 80), 10, 100) / 100;
    const surface = tankBottom - (tankBottom - tankTop) * fillPct;
    // Delikler tankın altından yukarı doğru üç seviyede.
    const holes = [0.18, 0.45, 0.72].map((f) => tankBottom - (tankBottom - tankTop) * f);
    return { tankX, tankW, tankTop, tankBottom, surface, holes, fillPct };
}

export const liquidRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();

    const g = liquidGeom(r, k.o);
    const density = clamp(simValue(k.o, 'd', 1), 0.5, 2.5);
    // 1 birim yükseklik = kaç cm sayılsın (etiketler anlamlı çıksın diye)
    const unit = 40 / (g.tankBottom - g.tankTop);

    k.c.lineWidth = k.lw;
    // Kap (üstü açık)
    line(k, g.tankX, g.tankTop, g.tankX, g.tankBottom);
    line(k, g.tankX + g.tankW, g.tankTop, g.tankX + g.tankW, g.tankBottom);
    line(k, g.tankX, g.tankBottom, g.tankX + g.tankW, g.tankBottom);

    // Sıvı
    fillShape(k, () => k.c.rect(g.tankX, g.surface, g.tankW, g.tankBottom - g.surface), 0.2);
    line(k, g.tankX, g.surface, g.tankX + g.tankW, g.surface, Math.max(1, k.lw));

    const ground = g.tankBottom;
    g.holes.forEach((hy, i) => {
        if (hy < g.surface) {
            // Sıvı seviyesinin üstündeki delikten su akmaz.
            line(k, g.tankX + g.tankW - 3, hy, g.tankX + g.tankW + 3, hy, 1);
            return;
        }
        const depth = (hy - g.surface) * unit; // cm
        // Etikette h tam sayı gösterildiği için basınç DA yuvarlanmış h'den
        // hesaplanır; aksi halde "h=11 · P=112" gibi formülü tutmayan
        // (11·1·10 = 110) bir çift yazılıyordu.
        const shownDepth = Math.round(depth);
        const pressure = shownDepth * density * G; // ~Pa ölçeğinde göreli değer
        const speed = Math.sqrt(Math.max(0, 2 * G * depth));
        // Menzil: yatay hız × düşme süresi
        const fallH = (ground - hy) * unit;
        const range = speed * Math.sqrt((2 * Math.max(fallH, 0.1)) / G);
        const rangePx = (range / unit) * 0.9;

        // Çıkış hızı oku: uzunluğu v = √(2gh) ile orantılı. Menzil düşme
        // yüksekliğine de bağlı olduğundan (en uzağa ORTA delik gider),
        // "derinlik arttıkça hız artar" mesajını taşıyan şey bu oktur.
        const vMax = Math.sqrt(2 * G * 40);
        arrow(
            k,
            g.tankX + g.tankW,
            hy,
            g.tankX + g.tankW + (speed / vMax) * g.tankW * 0.55,
            hy,
            6,
            Math.max(1.6, k.lw),
        );

        // Fışkıran su: eğik atış eğrisi
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.75);
        k.c.beginPath();
        k.c.lineWidth = Math.max(1.4, k.lw);
        const x0 = g.tankX + g.tankW;
        for (let s = 0; s <= 24; s++) {
            const tt = s / 24;
            const x = x0 + rangePx * tt;
            const y = hy + (ground - hy) * tt * tt;
            if (s === 0) k.c.moveTo(x, y);
            else k.c.lineTo(x, y);
        }
        k.c.stroke();
        // Akan damlalar
        const phase = (k.t * 0.7 + i * 0.33) % 1;
        const dx2 = x0 + rangePx * phase;
        const dy2 = hy + (ground - hy) * phase * phase;
        k.c.beginPath();
        k.c.arc(dx2, dy2, Math.max(2, k.lw * 1.3), 0, Math.PI * 2);
        k.c.fill();
        k.c.restore();

        if (k.o.labels !== false) {
            // Etiket kutunun sağ kenarını aşarsa sağa yaslanıp içeride kalır.
            // Genişlik tahmin edilmez, gerçek metin ölçülür — yoksa uzun
            // değerlerde (P=140 gibi) son karakter kırpılıyordu.
            const text = `h=${shownDepth} · P=${Math.round(pressure)}`;
            const wanted = x0 + rangePx + 6;
            const maxX = r.x + r.w - 4;
            const inside = wanted + textWidth(k, text, 0.68) < maxX;
            label(
                k,
                text,
                inside ? wanted : maxX,
                hy - k.fs * 0.35,
                inside ? 'left' : 'right',
                'middle',
                0.68,
            );
        }
    });

    line(k, r.x, ground, r.x + r.w, ground, 1);

    if (k.o.labels !== false) {
        label(k, `P = h · d · g   (d = ${density.toFixed(1)} g/cm³)`, r.x, r.y, 'left', 'top', 0.8);
        label(
            k,
            'Derinlik arttıkça basınç ve çıkış hızı artar',
            r.x + r.w / 2,
            r.y + r.h,
            'center',
            'bottom',
            0.8,
        );
    }
    k.c.restore();
};

export const liquidSpec: SimSpec = {
    animated: true,
    controls: (r, o) => {
        const g = liquidGeom(r, o);
        return [
            {
                id: 'level',
                x: g.tankX + g.tankW / 2,
                y: g.surface,
                type: 'drag',
                label: 'Sıvı seviyesini sürükle',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const g = liquidGeom(r, o);
        const pct = ((g.tankBottom - p.y) / (g.tankBottom - g.tankTop)) * 100;
        return { h: clamp(pct, 10, 100) };
    },
    params: [
        {
            key: 'h',
            label: 'Sıvı yüksekliği',
            min: 10,
            max: 100,
            step: 1,
            unit: '%',
        },
        {
            key: 'd',
            label: 'Yoğunluk',
            min: 0.5,
            max: 2.5,
            step: 0.1,
            unit: 'g/cm³',
        },
    ],
};

// ── Katı basıncı (Basınç) ────────────────────────────────────────────
//
// P = F / A → aynı cisim, temas yüzeyi küçüldükçe zemine daha çok batar.

/** Blok ayrıtları (birim). Yüz seçimi hangi ikisinin zemine değdiğini belirler. */
const BLOCK = { a: 2, b: 3, c: 4 };
const BLOCK_FACES: Array<{ w: number; d: number; label: string }> = [
    { w: BLOCK.b, d: BLOCK.c, label: '3 × 4' },
    { w: BLOCK.a, d: BLOCK.c, label: '2 × 4' },
    { w: BLOCK.a, d: BLOCK.b, label: '2 × 3' },
];

/** Kutu, zemin ve batma geometrisi. Hem çizim hem tutamak buradan okur. */
function solidGeom(r: Rect, o: MathObject) {
    const faceIdx = clampInt(simValue(o, 'face', 0), 0, 2, 0);
    const force = clamp(simValue(o, 'f', 60), 10, 200);
    const face = BLOCK_FACES[faceIdx];
    const area = face.w * face.d;
    const pressure = force / area;

    const ground = r.y + r.h * 0.68;
    const cx = r.x + r.w * 0.42;
    // Yüksekliği hacim sabit kalacak biçimde türet.
    const volume = BLOCK.a * BLOCK.b * BLOCK.c;
    const height = volume / area;
    // Ölçek EN UZUN duruma göre seçilir: en dar yüz seçilince blok uzuyor ve
    // ağırlık oku başlık satırlarını kesiyordu. Ölçek yüze göre değişmediği
    // için hacmin sabit kaldığı da görünür kalır.
    const tallest = volume / Math.min(...BLOCK_FACES.map((f) => f.w * f.d));
    const headerBottom = r.y + r.h * 0.2;
    const room = ground - headerBottom - r.h * 0.14 - 6; // ok + pay
    const unit = Math.max(6, Math.min(r.w * 0.1, r.h * 0.12, room / (tallest + 0.5)));
    const boxW = face.w * unit;
    const boxH = height * unit;
    // Batma: basınçla orantılı. Ölçüyü kutu birimine değil kutunun kendi
    // yüksekliğine bağlarız; yoksa ölçek küçülünce fark göze çarpmıyordu.
    const sink = clamp(pressure / 25, 0, 1) * r.h * 0.13;
    return {
        face,
        area,
        force,
        pressure,
        unit,
        ground,
        cx,
        boxW,
        boxH,
        sink,
        top: ground + sink - boxH,
        dep: unit * 0.5,
    };
}

export const solidRender: Renderer = (k) => {
    const r = k.r;
    const { face, area, force, pressure, ground, cx, boxW, sink, top, dep } = solidGeom(r, k.o);

    k.c.lineWidth = k.lw;
    // Zemin ve batma çukuru
    line(k, r.x, ground, cx - boxW / 2, ground);
    line(k, cx + boxW / 2, ground, r.x + r.w, ground);
    line(k, cx - boxW / 2, ground, cx - boxW / 2, ground + sink);
    line(k, cx - boxW / 2, ground + sink, cx + boxW / 2, ground + sink);
    line(k, cx + boxW / 2, ground + sink, cx + boxW / 2, ground);
    for (let x = r.x; x < r.x + r.w; x += Math.max(9, r.w / 26)) {
        if (x > cx - boxW / 2 - 4 && x < cx + boxW / 2 + 4) continue;
        line(k, x, ground, x - r.w * 0.022, ground + r.h * 0.05, 1);
    }

    // Blok. Derinlik (2.5B) kenarları zemine girince kesilir; aksi halde
    // arka dikey kenar boşlukta asılı bir çizgi gibi duruyordu.
    k.c.strokeRect(cx - boxW / 2, top, boxW, ground + sink - top);
    line(k, cx - boxW / 2, top, cx - boxW / 2 + dep, top - dep);
    line(k, cx + boxW / 2, top, cx + boxW / 2 + dep, top - dep);
    line(k, cx - boxW / 2 + dep, top - dep, cx + boxW / 2 + dep, top - dep);
    line(k, cx + boxW / 2 + dep, top - dep, cx + boxW / 2 + dep, ground - dep);
    line(k, cx + boxW / 2, ground, cx + boxW / 2 + dep, ground - dep);

    // Ağırlık oku
    arrow(k, cx, top - dep - r.h * 0.14, cx, top - 4, 9, Math.max(2, k.lw * 1.2));

    if (k.o.labels === false) return;
    // İnce yüz seçilince blok uzar ve ok başlık satırlarının hizasına çıkar;
    // etiket formülün üstüne binmesin diye aşağıya sıkıştırılır.
    const forceLabelY = Math.max(r.y + k.fs * 2.6, top - dep - r.h * 0.08);
    label(k, `F = ${Math.round(force)} N`, cx + k.fs * 0.5, forceLabelY, 'left', 'middle', 0.85);
    label(k, `Temas yüzeyi: ${face.label} = ${area} br²`, r.x, r.y, 'left', 'top', 0.8);
    label(
        k,
        `P = F / A = ${Math.round(force)} / ${area} = ${pressure.toFixed(1)}`,
        r.x,
        r.y + k.fs * 1.15,
        'left',
        'top',
        0.85,
    );
    label(
        k,
        'Yüzey küçüldükçe basınç artar, cisim daha çok batar',
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.75,
    );
};

export const solidSpec: SimSpec = {
    controls: (r, o) => {
        // Tutamak bloğun üzerinde, zeminin hemen üstünde durur: boşlukta
        // asılı kalınca neyi değiştirdiği anlaşılmıyordu. Ölçek yüze göre
        // değişmediği için bu nokta sabittir — art arda tıklayınca tutamak
        // kaçmaz, yüzler sırayla dolaşılır.
        const g = solidGeom(r, o);
        return [
            {
                id: 'face',
                x: g.cx,
                y: g.ground - g.unit * 0.6,
                type: 'toggle',
                label: 'Yere basan yüzü değiştir',
                on: simValue(o, 'face', 0) > 0,
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> =>
        id === 'face' ? { face: (clampInt(simValue(o, 'face', 0), 0, 2, 0) + 1) % 3 } : {},
    params: [
        { key: 'face', label: 'Hangi yüz yerde', min: 0, max: 2, step: 1 },
        { key: 'f', label: 'Ağırlık', min: 10, max: 200, step: 5, unit: 'N' },
    ],
};

// ── Kaldıraç dengesi (Basit Makineler) ───────────────────────────────
//
// Denge şartı: F1 · d1 = F2 · d2

function leverGeom(r: Rect, o: MathObject) {
    const barY = r.y + r.h * 0.44;
    const left = r.x + r.w * 0.06;
    const right = r.x + r.w * 0.94;
    const span = right - left;
    const pos = (key: string, fallback: number) =>
        left + (clamp(simValue(o, key, fallback), 0, 100) / 100) * span;
    const fulcrumX = pos('fulcrum', 50);
    const loadX = pos('loadPos', 15);
    const effortX = pos('effortPos', 85);
    const load = clamp(simValue(o, 'load', 40), 5, 200);
    const effort = clamp(simValue(o, 'effort', 40), 5, 200);
    // Birim: yüzdelik konum farkını "birim kol" say.
    const d1 = Math.abs(loadX - fulcrumX) / (span / 10);
    const d2 = Math.abs(effortX - fulcrumX) / (span / 10);
    const torqueLoad = load * d1;
    const torqueEffort = effort * d2;
    const diff = torqueEffort - torqueLoad;
    const total = Math.max(torqueLoad, torqueEffort, 1);
    const tilt = clamp(diff / total, -1, 1) * 0.2; // radyan
    return {
        barY,
        left,
        right,
        span,
        fulcrumX,
        loadX,
        effortX,
        load,
        effort,
        d1,
        d2,
        torqueLoad,
        torqueEffort,
        tilt,
        balanced: Math.abs(diff) < Math.max(1, total * 0.02),
    };
}

/** Kolun eğimi hesaba katılarak bir noktanın ekrandaki yeri. */
const onBar = (g: ReturnType<typeof leverGeom>, x: number) => ({
    x,
    y: g.barY + (x - g.fulcrumX) * Math.tan(g.tilt),
});

export const leverRender: Renderer = (k) => {
    const r = k.r;
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    const g = leverGeom(r, k.o);
    k.c.lineWidth = k.lw;

    // Kol
    const a = onBar(g, g.left);
    const b = onBar(g, g.right);
    line(k, a.x, a.y, b.x, b.y, Math.max(2.5, k.lw * 1.6));

    // Destek
    const fh = r.h * 0.2;
    k.c.beginPath();
    k.c.moveTo(g.fulcrumX, g.barY + 2);
    k.c.lineTo(g.fulcrumX - fh * 0.5, g.barY + fh);
    k.c.lineTo(g.fulcrumX + fh * 0.5, g.barY + fh);
    k.c.closePath();
    k.c.stroke();
    line(k, g.fulcrumX - fh * 0.8, g.barY + fh, g.fulcrumX + fh * 0.8, g.barY + fh);

    // Yük (kutu) ve kuvvet (ok)
    const loadPt = onBar(g, g.loadX);
    const boxSize = Math.min(r.w, r.h) * 0.11 * Math.min(1.6, 0.6 + g.load / 100);
    k.c.strokeRect(loadPt.x - boxSize / 2, loadPt.y - boxSize, boxSize, boxSize);
    const effortPt = onBar(g, g.effortX);
    const arrowLen = r.h * 0.16 * Math.min(1.8, 0.6 + g.effort / 100);
    arrow(
        k,
        effortPt.x,
        effortPt.y - arrowLen,
        effortPt.x,
        effortPt.y - 3,
        9,
        Math.max(2, k.lw * 1.2),
    );

    const d1Text = `d₁ = ${g.d1.toFixed(1)}`;
    const d2Text = `d₂ = ${g.d2.toFixed(1)}`;
    const d1Y = g.barY + fh * 1.25;
    const d2Y = g.barY + fh * 1.6;
    const showLabels = k.o.labels !== false;

    // Kol uzunluğu çizgileri. Etiket tam çizginin üstünde durduğu için
    // çizgi metnin bulunduğu yerde kesilir — aksi halde yazının içinden geçer.
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.4);
    k.c.setLineDash([5, 4]);
    const gapped = (x1: number, x2: number, y: number, text: string) => {
        const mid = (x1 + x2) / 2;
        const half = textWidth(k, text, 0.7) / 2 + 4;
        const lo = Math.min(x1, x2);
        const hi = Math.max(x1, x2);
        if (mid - half > lo) line(k, lo, y, mid - half, y, 1);
        if (mid + half < hi) line(k, mid + half, y, hi, y, 1);
    };
    if (showLabels) {
        gapped(g.fulcrumX, loadPt.x, d1Y, d1Text);
        gapped(g.fulcrumX, effortPt.x, d2Y, d2Text);
    } else {
        line(k, g.fulcrumX, d1Y, loadPt.x, d1Y, 1);
        line(k, g.fulcrumX, d2Y, effortPt.x, d2Y, 1);
    }
    k.c.restore();

    if (!showLabels) {
        k.c.restore();
        return;
    }
    label(
        k,
        `${Math.round(g.load)} N`,
        loadPt.x,
        loadPt.y - boxSize - k.fs * 0.5,
        'center',
        'middle',
        0.8,
    );
    label(
        k,
        `${Math.round(g.effort)} N`,
        effortPt.x,
        effortPt.y - arrowLen - k.fs * 0.5,
        'center',
        'middle',
        0.8,
    );
    label(k, d1Text, (g.fulcrumX + loadPt.x) / 2, d1Y, 'center', 'middle', 0.7);
    label(k, d2Text, (g.fulcrumX + effortPt.x) / 2, d2Y, 'center', 'middle', 0.7);
    label(
        k,
        `F₁·d₁ = ${g.torqueLoad.toFixed(0)}   |   F₂·d₂ = ${g.torqueEffort.toFixed(0)}`,
        r.x + r.w / 2,
        r.y,
        'center',
        'top',
        0.8,
    );
    label(
        k,
        g.balanced
            ? 'DENGEDE'
            : g.torqueEffort > g.torqueLoad
              ? 'Kuvvet tarafı ağır basıyor'
              : 'Yük tarafı ağır basıyor',
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.9,
    );
    k.c.restore();
};

export const leverSpec: SimSpec = {
    controls: (r, o) => {
        const g = leverGeom(r, o);
        return [
            {
                id: 'fulcrum',
                x: g.fulcrumX,
                y: g.barY + r.h * 0.2,
                type: 'drag',
                label: 'Destek noktası',
            },
            {
                id: 'loadPos',
                x: onBar(g, g.loadX).x,
                y: onBar(g, g.loadX).y,
                type: 'drag',
                label: 'Yükü kaydır',
            },
            {
                id: 'effortPos',
                x: onBar(g, g.effortX).x,
                y: onBar(g, g.effortX).y,
                type: 'drag',
                label: 'Kuvveti kaydır',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        const g = leverGeom(r, o);
        const pct = clamp(((p.x - g.left) / g.span) * 100, 0, 100);
        return { [id]: pct };
    },
    params: [
        { key: 'load', label: 'Yük (F₁)', min: 5, max: 200, step: 5, unit: 'N' },
        {
            key: 'effort',
            label: 'Kuvvet (F₂)',
            min: 5,
            max: 200,
            step: 5,
            unit: 'N',
        },
    ],
};

/** Asılı yük kutusu; ipin ucundan aşağı doğru çizilir. */
const loadBoxAt = (k: Ctx, x: number, y: number, size: number, text: string) => {
    k.c.strokeRect(x - size / 2, y, size, size * 0.72);
    if (k.o.labels !== false) label(k, text, x, y + size * 0.36, 'center', 'middle', 0.7);
};

// ── Makara sistemi (Basit Makineler) ─────────────────────────────────
//
// Kural: yükü taşıyan ip sayısı k ise uygulanan kuvvet F = G / k olur ve
// çekilmesi gereken ip uzunluğu aynı oranda artar (x = k · h). Yapılan iş
// her durumda aynıdır — basit makine iş kazancı sağlamaz.

/** Kaç HAREKETLİ makara var: 0 = sabit, 1 = hareketli, 2 = palanga. */
const PULLEY_MODES = [
    {
        label: 'Sabit makara',
        movable: 0,
        k: 1,
        note: 'Yalnızca kuvvetin yönünü değiştirir',
    },
    {
        label: 'Hareketli makara',
        movable: 1,
        k: 2,
        note: 'Kuvvetten kazanç 2 kat',
    },
    {
        label: 'Palanga (2 hareketli)',
        movable: 2,
        k: 4,
        note: 'Kuvvetten kazanç 4 kat',
    },
];

function pulleyGeom(r: Rect, o: MathObject) {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 2, 0);
    const load = clamp(simValue(o, 'load', 200), 20, 500);
    const m = PULLEY_MODES[mode];
    const effort = load / m.k;
    const rad = Math.min(r.w * 0.062, r.h * 0.07);
    const ceiling = r.y + r.h * 0.24;
    const topY = ceiling + rad * 1.4;
    const cx = r.x + r.w * 0.4;
    // Alt blok (hareketli makaralar) yükle birlikte asılıdır.
    const lowerY = r.y + r.h * 0.63;
    // Makara eksenlerinin yatay konumu: alt ve üst blok aynı hizada.
    const step = rad * 2.5;
    const axes = Array.from(
        { length: Math.max(1, m.movable) },
        (_, i) => cx + (i - (Math.max(1, m.movable) - 1) / 2) * step,
    );
    return {
        mode,
        m,
        load,
        effort,
        rad,
        ceiling,
        topY,
        cx,
        lowerY,
        axes,
        loadY: r.y + r.h * 0.78,
    };
}

/** Makara çemberi ve ekseni. */
const wheel = (k: Ctx, x: number, y: number, rad: number) => {
    k.c.beginPath();
    k.c.arc(x, y, rad, 0, Math.PI * 2);
    k.c.stroke();
    k.c.beginPath();
    k.c.arc(x, y, Math.max(1.5, rad * 0.14), 0, Math.PI * 2);
    k.c.fill();
};

const pulleyRender: Renderer = (k) => {
    const r = k.r;
    const g = pulleyGeom(r, k.o);
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Tavan
    line(k, r.x + r.w * 0.1, g.ceiling, r.x + r.w * 0.9, g.ceiling, Math.max(2, k.lw * 1.4));
    for (let x = r.x + r.w * 0.1; x < r.x + r.w * 0.9; x += Math.max(9, r.w / 26)) {
        line(k, x, g.ceiling, x - r.w * 0.018, g.ceiling - r.h * 0.04, 1);
    }

    const box = Math.min(r.w, r.h) * 0.15;
    let effortX: number;
    let effortTop: number;

    if (g.m.movable === 0) {
        // Sabit makara: ip yükten yukarı, makaranın üstünden geçip aşağı iner.
        const x = g.axes[0];
        line(k, x, g.ceiling, x, g.topY - g.rad);
        wheel(k, x, g.topY, g.rad);
        line(k, x - g.rad, g.topY, x - g.rad, g.loadY);
        loadBoxAt(k, x - g.rad, g.loadY, box, `${Math.round(g.load)} N`);
        effortX = x + g.rad;
        effortTop = g.topY;
    } else {
        // Üst blok: her hareketli makara için bir sabit makara.
        for (const x of g.axes) {
            line(k, x, g.ceiling, x, g.topY - g.rad);
            wheel(k, x, g.topY, g.rad);
        }
        // Alt blok: hareketli makaralar, aralarında kanca çubuğu.
        for (const x of g.axes) wheel(k, x, g.lowerY, g.rad);
        if (g.axes.length > 1) {
            line(k, g.axes[0], g.lowerY + g.rad, g.axes[g.axes.length - 1], g.lowerY + g.rad);
        }

        // Bloklar arasındaki ip kolları. Ders kitabı şemasındaki gibi paralel
        // çizilir: en soldaki kol tavana bağlı sabit uç, en sağdaki serbest
        // uçtur, aradakiler yükü taşır. Kol sayısı = 2 × hareketli makara.
        const strands = 2 * g.m.movable;
        for (let i = 0; i < strands; i++) {
            const sx = g.axes[Math.floor(i / 2)] + (i % 2 === 0 ? -g.rad : g.rad);
            // Sabit uç tavandan, diğerleri üst makaralardan iner.
            line(k, sx, i === 0 ? g.ceiling : g.topY, sx, g.lowerY);
        }
        // Yük alt bloğun ortasından sarkar.
        const hookX = (g.axes[0] + g.axes[g.axes.length - 1]) / 2;
        line(k, hookX, g.lowerY + g.rad, hookX, g.loadY);
        loadBoxAt(k, hookX, g.loadY, box, `${Math.round(g.load)} N`);
        // Serbest uç bloğun sağından, yükün yanından geçmeden aşağı iner.
        effortX = g.axes[g.axes.length - 1] + g.rad * 2.6;
        line(k, g.axes[g.axes.length - 1] + g.rad, g.topY, effortX, g.topY, 1);
        effortTop = g.topY;
    }

    // Serbest uç ve uygulanan kuvvet
    const effortTip = g.loadY - r.h * 0.02;
    line(k, effortX, effortTop, effortX, effortTip - r.h * 0.08);
    arrow(k, effortX, effortTip - r.h * 0.08, effortX, effortTip, 9, Math.max(2, k.lw * 1.2));

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    label(
        k,
        `F = ${Math.round(g.effort)} N`,
        effortX + 10,
        effortTip - r.h * 0.05,
        'left',
        'middle',
        0.75,
    );
    label(k, `${g.m.label} · ${g.m.note}`, r.x + r.w / 2, r.y, 'center', 'top', 0.74);
    label(
        k,
        `Taşıyan ip sayısı = ${g.m.k}  →  F = G / ${g.m.k} = ${Math.round(g.effort)} N`,
        r.x + r.w / 2,
        r.y + k.fs * 1.1,
        'center',
        'top',
        0.78,
    );
    label(
        k,
        `Yük ${g.m.k} kat daha uzun ip çekilerek kaldırılır`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.72,
    );
    k.c.restore();
};

const pulleySpec: SimSpec = {
    controls: (r, o) => {
        const g = pulleyGeom(r, o);
        return [
            {
                id: 'mode',
                x: g.cx,
                y: g.ceiling - r.h * 0.07,
                type: 'toggle',
                label: 'Makara türünü değiştir',
                on: g.mode > 0,
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> =>
        id === 'mode' ? { mode: (clampInt(simValue(o, 'mode', 0), 0, 2, 0) + 1) % 3 } : {},
    params: [
        { key: 'mode', label: 'Makara türü', min: 0, max: 2, step: 1 },
        { key: 'load', label: 'Yük', min: 20, max: 500, step: 10, unit: 'N' },
    ],
};

// ── Eğik düzlem (Basit Makineler) ────────────────────────────────────
//
// F · ℓ = G · h  →  F = G · h / ℓ. Kuvvetten kazanç ℓ / h; yol aynı oranda
// uzar, iş değişmez. Sürtünme ihmal edilir.

function inclineGeom(r: Rect, o: MathObject) {
    const load = clamp(simValue(o, 'load', 100), 20, 400);
    const hPct = clamp(simValue(o, 'h', 45), 10, 90) / 100;
    const lPct = clamp(simValue(o, 'len', 75), 25, 100) / 100;
    const baseY = r.y + r.h * 0.78;
    const x0 = r.x + r.w * 0.1;
    const maxRun = r.w * 0.72;
    const maxRise = r.h * 0.46;
    const run = maxRun * lPct;
    const rise = maxRise * hPct;
    // Ölçekleri metreye çevir: taban 6 m, yükseklik 4 m sayılır.
    // Etikette bir ondalık gösterildiği için kuvvet de GÖSTERİLEN değerlerden
    // hesaplanır; yoksa "100 · 3.6 / 4.0 = 89" gibi formülü tutmayan bir satır
    // çıkıyordu (doğrusu 90).
    const height = Math.round((rise / maxRise) * 4 * 10) / 10;
    const length = Math.round(Math.hypot((run / maxRun) * 6, height) * 10) / 10;
    const effort = (load * height) / Math.max(0.1, length);
    return {
        load,
        baseY,
        x0,
        run,
        rise,
        height,
        length,
        effort,
        gain: length / height,
        apex: { x: x0 + run, y: baseY - rise },
    };
}

const inclineRender: Renderer = (k) => {
    const r = k.r;
    const g = inclineGeom(r, k.o);
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Üçgen: taban, dik kenar, eğik yüzey
    path(
        k,
        [
            [g.x0, g.baseY],
            [g.apex.x, g.baseY],
            [g.apex.x, g.apex.y],
        ],
        true,
    );
    k.c.stroke();
    fillShape(
        k,
        () => {
            k.c.moveTo(g.x0, g.baseY);
            k.c.lineTo(g.apex.x, g.baseY);
            k.c.lineTo(g.apex.x, g.apex.y);
            k.c.closePath();
        },
        0.1,
    );

    // Zemin
    line(k, r.x, g.baseY, r.x + r.w, g.baseY, 1);

    // Eğik yüzeyde duran kutu
    const ang = Math.atan2(-g.rise, g.run);
    const t = 0.55;
    const bx = g.x0 + (g.apex.x - g.x0) * t;
    const by = g.baseY + (g.apex.y - g.baseY) * t;
    const box = Math.min(r.w, r.h) * 0.11;
    // Kutu eğik yüzeyin ÜSTÜNE oturur: yüzey normali boyunca yarım kutu
    // kaydırılır, yoksa yüzeye gömülmüş görünüyordu.
    const nrmX = Math.sin(ang);
    const nrmY = -Math.cos(ang);
    const cxBox = bx + nrmX * (box / 2);
    const cyBox = by + nrmY * (box / 2);
    k.c.save();
    k.c.translate(cxBox, cyBox);
    k.c.rotate(ang);
    k.c.strokeRect(-box / 2, -box / 2, box, box);
    k.c.restore();

    // Kuvvet oku: eğim boyunca yukarı. Ağırlık oku: aşağı.
    const nx = Math.cos(ang);
    const ny = Math.sin(ang);
    const fLen = Math.min(r.w * 0.2, (g.effort / 400) * r.w * 0.5 + r.w * 0.06);
    const fTip = { x: cxBox + nx * fLen, y: cyBox + ny * fLen };
    arrow(k, cxBox, cyBox, fTip.x, fTip.y, 8, Math.max(2, k.lw * 1.2));
    // Ağırlık oku yukarıdan aşağı; kutunun üstünden başlar ki üçgenin
    // içinde kaybolmasın.
    const wLen = Math.min(r.h * 0.22, (g.load / 400) * r.h * 0.4 + r.h * 0.06);
    const wTop = { x: cxBox, y: cyBox - box * 0.9 - wLen };
    arrow(k, wTop.x, wTop.y, cxBox, cyBox - box * 0.9, 8, Math.max(1.6, k.lw));

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    // Ölçü çizgileri
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.45);
    k.c.setLineDash([5, 4]);
    // ℓ eğik yüzeyin uzunluğudur — ölçü çizgisi TABANA değil, eğime paralel
    // çizilir. Önce tabana çizilip ℓ diye etiketleniyordu, bu yanlıştı.
    // Kayma yüzeyin DIŞINA (yukarı-sola) olmalı; ters yönde üçgenin içine
    // düşüyordu.
    const offX = Math.sin(ang) * r.h * 0.08;
    const offY = -Math.cos(ang) * r.h * 0.08;
    line(k, g.x0 + offX, g.baseY + offY, g.apex.x + offX, g.apex.y + offY, 1);
    line(k, g.apex.x + r.w * 0.04, g.baseY, g.apex.x + r.w * 0.04, g.apex.y, 1);
    k.c.restore();
    label(
        k,
        `ℓ = ${g.length.toFixed(1)} m`,
        (g.x0 + g.apex.x) / 2 + offX * 2.2,
        (g.baseY + g.apex.y) / 2 + offY * 2.2,
        'center',
        'middle',
        0.72,
    );
    label(
        k,
        `h = ${g.height.toFixed(1)} m`,
        g.apex.x + r.w * 0.055,
        (g.baseY + g.apex.y) / 2,
        'left',
        'middle',
        0.72,
    );
    // Etiketler başlık iki satırının altında kalsın.
    const headerBottom = r.y + k.fs * 2.4;
    label(
        k,
        `F = ${Math.round(g.effort)} N`,
        fTip.x + k.fs * 0.4,
        Math.max(headerBottom, fTip.y - k.fs * 0.5),
        'left',
        'middle',
        0.72,
    );
    label(
        k,
        `G = ${Math.round(g.load)} N`,
        wTop.x - k.fs * 0.4,
        Math.max(headerBottom, wTop.y),
        'right',
        'middle',
        0.72,
    );

    label(k, 'F · ℓ = G · h', r.x, r.y, 'left', 'top', 0.8);
    label(
        k,
        `F = G · h / ℓ = ${Math.round(g.load)} · ${g.height.toFixed(1)} / ${g.length.toFixed(1)} = ${Math.round(g.effort)} N`,
        r.x,
        r.y + k.fs * 1.15,
        'left',
        'top',
        0.8,
    );
    label(
        k,
        `Kuvvetten kazanç = ℓ / h = ${g.gain.toFixed(1)} kat`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.76,
    );
    k.c.restore();
};

const inclineSpec: SimSpec = {
    controls: (r, o) => {
        const g = inclineGeom(r, o);
        return [
            {
                id: 'apex',
                x: g.apex.x,
                y: g.apex.y,
                type: 'drag',
                label: 'Yüksekliği ve uzunluğu değiştir',
            },
        ];
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id !== 'apex') return {};
        const baseY = r.y + r.h * 0.78;
        const x0 = r.x + r.w * 0.1;
        return {
            len: clamp(((p.x - x0) / (r.w * 0.72)) * 100, 25, 100),
            h: clamp(((baseY - p.y) / (r.h * 0.46)) * 100, 10, 90),
        };
    },
    params: [
        { key: 'h', label: 'Yükseklik', min: 10, max: 90, step: 1, unit: '%' },
        {
            key: 'len',
            label: 'Taban uzunluğu',
            min: 25,
            max: 100,
            step: 1,
            unit: '%',
        },
        { key: 'load', label: 'Yük', min: 20, max: 400, step: 10, unit: 'N' },
    ],
};

// ── Mitoz ve mayoz bölünme (DNA ve Genetik Kod) ──────────────────────
//
// Başlangıç hücresi 2n = 4 (iki homolog kromozom çifti).
// Mitoz: bir bölünme → 2 hücre, her biri 2n = 4, ana hücrenin aynısı.
// Mayoz: iki bölünme → 4 hücre, her biri n = 2, kromozom sayısı yarılanır.

interface DivisionStage {
    name: string;
    note: string;
    /** Bu aşamanın sonunda kaç hücre var. */
    cells: number;
    /** Hücre başına kromozom sayısı. */
    perCell: number;
    /**
     * Kromozomların hücre içindeki yerleşimi. Hücre merkezine göre
     * normalize edilmiş (−1..1) koordinatlar; kutuplar sol ve sağdadır.
     * `paired` = kardeş kromatitler hâlâ birbirine bağlı (X şeklinde).
     */
    layout: Array<{ x: number; y: number }>;
    paired: boolean;
    /** Kromatin hâlinde mi (interfazda kromozomlar belirgin değildir). */
    chromatin?: boolean;
}

/** Dört kromozom, hücreye dağınık. */
const SCATTERED = [
    { x: -0.34, y: -0.3 },
    { x: 0.32, y: -0.34 },
    { x: -0.3, y: 0.34 },
    { x: 0.36, y: 0.28 },
];
/** Ekvatorda TEK SIRA: kutuplar sol-sağ olduğu için dizilim düşeydir. */
const EQUATOR_SINGLE = [
    { x: 0, y: -0.6 },
    { x: 0, y: -0.2 },
    { x: 0, y: 0.2 },
    { x: 0, y: 0.6 },
];
/** Ekvatorda KARŞILIKLI çiftler (mayoz I). */
const EQUATOR_PAIRS = [
    { x: -0.16, y: -0.3 },
    { x: 0.16, y: -0.3 },
    { x: -0.16, y: 0.3 },
    { x: 0.16, y: 0.3 },
];
/** Kutuplara çekilmiş: ikisi solda, ikisi sağda. */
const POLES = [
    { x: -0.52, y: -0.3 },
    { x: -0.52, y: 0.3 },
    { x: 0.52, y: -0.3 },
    { x: 0.52, y: 0.3 },
];
/** İki kromozom, hücre ortasında. */
const TWO = [
    { x: -0.26, y: -0.16 },
    { x: 0.26, y: 0.16 },
];

const MITOSIS_STAGES: DivisionStage[] = [
    {
        name: 'İnterfaz',
        note: 'DNA kendini eşler, kromozomlar henüz belirgin değil',
        cells: 1,
        perCell: 4,
        layout: SCATTERED,
        paired: true,
        chromatin: true,
    },
    {
        name: 'Profaz',
        note: 'Kromozomlar kısalıp kalınlaşır, çekirdek zarı erir',
        cells: 1,
        perCell: 4,
        layout: SCATTERED,
        paired: true,
    },
    {
        name: 'Metafaz',
        note: 'Kromozomlar ekvatorda tek sıra dizilir',
        cells: 1,
        perCell: 4,
        layout: EQUATOR_SINGLE,
        paired: true,
    },
    {
        name: 'Anafaz',
        note: 'Kardeş kromatitler AYRILIP kutuplara çekilir',
        cells: 1,
        perCell: 4,
        layout: POLES,
        paired: false,
    },
    {
        name: 'Telofaz',
        note: 'Çekirdek zarı oluşur, sitoplazma bölünür',
        cells: 2,
        perCell: 4,
        layout: SCATTERED,
        paired: false,
    },
];

const MEIOSIS_STAGES: DivisionStage[] = [
    {
        name: 'İnterfaz',
        note: 'DNA kendini eşler',
        cells: 1,
        perCell: 4,
        layout: SCATTERED,
        paired: true,
        chromatin: true,
    },
    {
        name: 'Profaz I',
        note: 'Homolog kromozomlar eşleşir, PARÇA DEĞİŞİMİ olur',
        cells: 1,
        perCell: 4,
        layout: EQUATOR_PAIRS,
        paired: true,
    },
    {
        name: 'Metafaz I',
        note: 'Homolog çiftler ekvatorda KARŞILIKLI dizilir',
        cells: 1,
        perCell: 4,
        layout: EQUATOR_PAIRS,
        paired: true,
    },
    {
        name: 'Anafaz I',
        note: 'Homolog kromozomlar ayrılır (kromatitler ayrılmaz)',
        cells: 1,
        perCell: 4,
        layout: POLES,
        paired: true,
    },
    {
        name: 'Telofaz I',
        note: '2 hücre oluşur; kromozom sayısı yarıya indi',
        cells: 2,
        perCell: 2,
        layout: TWO,
        paired: true,
    },
    {
        name: 'Mayoz II sonu',
        note: 'Kardeş kromatitler ayrılır, 4 hücre oluşur',
        cells: 4,
        perCell: 2,
        layout: TWO,
        paired: false,
    },
];

/**
 * Kromozom çizimi. `paired` ise X (iki kardeş kromatit sentromerle bağlı),
 * değilse tek kollu. `swapped` parça değişimini gösteren bant ekler.
 */
function chromosome(k: Ctx, x: number, y: number, h: number, paired: boolean, swapped: boolean) {
    const w = h * 0.4;
    const lw = Math.max(2, k.lw * 1.7);
    if (paired) {
        line(k, x - w / 2, y - h / 2, x + w / 2, y + h / 2, lw);
        line(k, x + w / 2, y - h / 2, x - w / 2, y + h / 2, lw);
        k.c.beginPath();
        k.c.arc(x, y, Math.max(1.5, h * 0.08), 0, Math.PI * 2);
        k.c.fill();
    } else {
        line(k, x, y - h / 2, x, y + h / 2, lw);
    }
    if (swapped) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.4);
        line(k, x - w / 2, y - h / 2, x - w / 4, y - h / 4, Math.max(3, k.lw * 2.6));
        k.c.restore();
    }
}

/** Kromatin: kromozom yerine gevşek iplikçik. */
function chromatin(k: Ctx, x: number, y: number, h: number) {
    k.c.save();
    k.c.strokeStyle = withAlpha(k.color, 0.6);
    k.c.beginPath();
    k.c.lineWidth = Math.max(1.4, k.lw);
    for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const px = x + (t - 0.5) * h * 0.7;
        const py = y + Math.sin(t * Math.PI * 3) * h * 0.16;
        if (i === 0) k.c.moveTo(px, py);
        else k.c.lineTo(px, py);
    }
    k.c.stroke();
    k.c.restore();
}

function divisionGeom(r: Rect, o: MathObject) {
    const meiosis = simValue(o, 'mode', 0) > 0.5;
    const stages = meiosis ? MEIOSIS_STAGES : MITOSIS_STAGES;
    const idx = clampInt(simValue(o, 'stage', 0), 0, stages.length - 1, 0);
    return { meiosis, stages, idx, stage: stages[idx], cy: r.y + r.h * 0.52 };
}

const divisionRender: Renderer = (k) => {
    const r = k.r;
    const g = divisionGeom(r, k.o);
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    const st = g.stage;
    const cellRx = Math.min((r.w * 0.88) / (st.cells * 2.15), r.h * 0.2);
    const cellRy = cellRx * 0.82;
    // Kromozom boyu sayıya göre küçülür; yoksa dört kromozom üst üste binip
    // iki taneymiş gibi görünüyordu.
    const chrH = cellRy * (st.perCell > 2 ? 0.34 : 0.5);
    // Parça değişimi yalnızca profaz I'den itibaren görünür.
    const swapped = g.meiosis && g.idx >= 1;

    for (let c = 0; c < st.cells; c++) {
        const cx = r.x + (r.w * (c + 0.5)) / st.cells;
        ellipse(k, cx, g.cy, cellRx, cellRy);

        // Çekirdek zarı yalnızca interfaz ve son aşamada durur.
        if (st.chromatin || g.idx === g.stages.length - 1) {
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.4);
            ellipse(k, cx, g.cy, cellRx * 0.66, cellRy * 0.66);
            k.c.restore();
        }

        for (let i = 0; i < st.perCell; i++) {
            const pos = st.layout[i % st.layout.length];
            const px = cx + pos.x * cellRx;
            const py = g.cy + pos.y * cellRy;
            if (st.chromatin) chromatin(k, px, py, chrH);
            else chromosome(k, px, py, chrH, st.paired, swapped);
        }

        // Anafazda iğ iplikleri kutuplardan kromozomlara uzanır.
        if (st.name.startsWith('Anafaz')) {
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.28);
            for (const sgn of [-1, 1]) {
                for (const dy of [-0.22, 0.22]) {
                    line(
                        k,
                        cx + sgn * cellRx * 0.95,
                        g.cy,
                        cx + sgn * cellRx * 0.62,
                        g.cy + dy * cellRy,
                        1,
                    );
                }
            }
            k.c.restore();
        }
    }

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    label(
        k,
        `${g.meiosis ? 'MAYOZ' : 'MİTOZ'} · ${g.idx + 1}/${g.stages.length} · ${st.name}`,
        r.x + r.w / 2,
        r.y,
        'center',
        'top',
        0.82,
    );
    label(k, st.note, r.x + r.w / 2, r.y + k.fs * 1.2, 'center', 'top', 0.7);
    label(
        k,
        `${st.cells} hücre · her birinde ${st.perCell === 4 ? '2n = 4' : 'n = 2'} kromozom`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.8,
    );
    k.c.restore();
};

const divisionSpec: SimSpec = {
    controls: (r, o) => {
        const g = divisionGeom(r, o);
        return [
            {
                id: 'next',
                x: r.x + r.w - 16,
                y: r.y + r.h - 16,
                type: 'toggle',
                label: 'Sonraki aşama ▶',
                on: g.idx > 0,
            },
            {
                id: 'prev',
                x: r.x + r.w - 40,
                y: r.y + r.h - 16,
                type: 'toggle',
                label: '◀ Önceki aşama',
                on: g.idx > 0,
            },
            {
                id: 'mode',
                x: r.x + 16,
                y: r.y + r.h - 16,
                type: 'toggle',
                label: g.meiosis ? 'Mitoza geç' : 'Mayoza geç',
                on: g.meiosis,
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> => {
        const g = divisionGeom(r, o);
        // Kip değişince aşama sayısı değiştiğinden başa sarılır.
        if (id === 'mode') return { mode: g.meiosis ? 0 : 1, stage: 0 };
        if (id === 'next') return { stage: (g.idx + 1) % g.stages.length };
        if (id === 'prev') return { stage: (g.idx - 1 + g.stages.length) % g.stages.length };
        return {};
    },
    params: [
        {
            key: 'mode',
            label: 'Bölünme (0 mitoz / 1 mayoz)',
            min: 0,
            max: 1,
            step: 1,
        },
        { key: 'stage', label: 'Aşama', min: 0, max: 5, step: 1 },
    ],
};

// ── Asit–baz ve nötrleşme (Madde ve Endüstri) ────────────────────────
//
// pH ölçeği 0–14. Asit ile bazın eşit miktarı tepkimeye girer; kalan fazla
// karışımın pH'ını belirler. Tam nötrleşmede pH = 7 (tuz + su).

/** pH'a göre evrensel indikatör rengi (kırmızı → yeşil → mor). */
function phColor(ph: number): string {
    const stops: Array<[number, [number, number, number]]> = [
        [0, [214, 40, 40]],
        [3, [244, 140, 6]],
        [6, [250, 214, 80]],
        [7, [64, 176, 96]],
        [8, [70, 170, 190]],
        [11, [58, 90, 200]],
        [14, [120, 50, 170]],
    ];
    const p = clamp(ph, 0, 14);
    for (let i = 1; i < stops.length; i++) {
        if (p <= stops[i][0]) {
            const [a, ca] = stops[i - 1];
            const [b, cb] = stops[i];
            const t = (p - a) / (b - a);
            const c = ca.map((v, j) => Math.round(v + (cb[j] - v) * t));
            return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        }
    }
    return 'rgb(120, 50, 170)';
}

function phGeom(r: Rect, o: MathObject) {
    const acid = clamp(simValue(o, 'acid', 40), 0, 100);
    const base = clamp(simValue(o, 'base', 40), 0, 100);
    const strength = clamp(simValue(o, 'k', 3), 1, 6); // asidin/bazın kuvveti
    const net = acid - base;
    const total = Math.max(1, acid + base);
    // Fazla asit pH'ı 7'den aşağı, fazla baz yukarı çeker; oran ne kadar
    // büyükse sapma o kadar fazla.
    const ph = clamp(7 - (net / total) * strength * 1.6, 0, 14);
    const beakerW = r.w * 0.3;
    return {
        acid,
        base,
        ph,
        net,
        beaker: {
            x: r.x + r.w * 0.09,
            y: r.y + r.h * 0.3,
            w: beakerW,
            h: r.h * 0.44,
        },
        scale: {
            x: r.x + r.w * 0.48,
            y: r.y + r.h * 0.42,
            w: r.w * 0.44,
            h: r.h * 0.1,
        },
    };
}

const phRender: Renderer = (k) => {
    const r = k.r;
    const g = phGeom(r, k.o);
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    // Beher ve içindeki çözelti
    const b = g.beaker;
    const fill = b.h * 0.62;
    k.c.save();
    k.c.fillStyle = phColor(g.ph);
    k.c.globalAlpha = 0.55;
    k.c.fillRect(b.x, b.y + b.h - fill, b.w, fill);
    k.c.restore();
    line(k, b.x, b.y, b.x, b.y + b.h);
    line(k, b.x + b.w, b.y, b.x + b.w, b.y + b.h);
    line(k, b.x, b.y + b.h, b.x + b.w, b.y + b.h);
    line(k, b.x, b.y + b.h - fill, b.x + b.w, b.y + b.h - fill, 1);

    // pH ölçeği: 0–14 renk şeridi
    const s = g.scale;
    const steps = 56;
    k.c.save();
    for (let i = 0; i < steps; i++) {
        k.c.fillStyle = phColor((i / (steps - 1)) * 14);
        k.c.fillRect(s.x + (s.w * i) / steps, s.y, s.w / steps + 1, s.h);
    }
    k.c.restore();
    k.c.strokeRect(s.x, s.y, s.w, s.h);
    // Göstergeç
    const px = s.x + (g.ph / 14) * s.w;
    line(k, px, s.y - 6, px, s.y + s.h + 6, Math.max(2, k.lw * 1.5));

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    for (const v of [0, 7, 14]) {
        label(k, String(v), s.x + (v / 14) * s.w, s.y + s.h + 8, 'center', 'top', 0.65);
    }
    label(k, 'ASİT', s.x, s.y - 8, 'left', 'bottom', 0.68);
    label(k, 'NÖTR', s.x + s.w / 2, s.y - 8, 'center', 'bottom', 0.68);
    label(k, 'BAZ', s.x + s.w, s.y - 8, 'right', 'bottom', 0.68);
    // Göstergeç uçlara dayandığında yazı nesnenin dışına taşmasın.
    const phText = `pH = ${g.ph.toFixed(1)}`;
    const phHalf = textWidth(k, phText, 0.86) / 2;
    label(
        k,
        phText,
        clamp(px, r.x + phHalf + 4, r.x + r.w - phHalf - 4),
        s.y + s.h + k.fs * 1.6,
        'center',
        'top',
        0.86,
    );

    label(k, `Asit: ${Math.round(g.acid)} mL`, b.x, b.y - k.fs * 2.1, 'left', 'top', 0.72);
    label(k, `Baz:  ${Math.round(g.base)} mL`, b.x, b.y - k.fs * 1.1, 'left', 'top', 0.72);

    const verdict =
        Math.abs(g.net) < 3
            ? 'Nötrleşme: asit + baz → tuz + su'
            : g.net > 0
              ? 'Asit fazla — çözelti asidik'
              : 'Baz fazla — çözelti bazik';
    label(k, verdict, r.x + r.w / 2, r.y + r.h, 'center', 'bottom', 0.78);
    label(
        k,
        'Eşit miktarda asit ve baz birbirini nötrler',
        r.x + r.w / 2,
        r.y,
        'center',
        'top',
        0.76,
    );
    k.c.restore();
};

const phSpec: SimSpec = {
    animated: false,
    controls: (r, o) => {
        // Titrasyon gibi: dokundukça 10 mL ekler, 100'ü geçince başa döner.
        const g = phGeom(r, o);
        return [
            {
                id: 'addAcid',
                x: g.beaker.x + g.beaker.w * 0.28,
                y: g.beaker.y - r.h * 0.06,
                type: 'toggle' as const,
                label: 'Asit ekle (+10 mL)',
                on: g.acid > g.base,
            },
            {
                id: 'addBase',
                x: g.beaker.x + g.beaker.w * 0.72,
                y: g.beaker.y - r.h * 0.06,
                type: 'toggle' as const,
                label: 'Baz ekle (+10 mL)',
                on: g.base > g.acid,
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> => {
        const step = (v: number) => (v >= 100 ? 0 : Math.min(100, v + 10));
        if (id === 'addAcid') return { acid: step(clamp(simValue(o, 'acid', 40), 0, 100)) };
        if (id === 'addBase') return { base: step(clamp(simValue(o, 'base', 40), 0, 100)) };
        return {};
    },
    params: [
        {
            key: 'acid',
            label: 'Asit miktarı',
            min: 0,
            max: 100,
            step: 1,
            unit: 'mL',
        },
        {
            key: 'base',
            label: 'Baz miktarı',
            min: 0,
            max: 100,
            step: 1,
            unit: 'mL',
        },
        { key: 'k', label: 'Kuvvet (zayıf→kuvvetli)', min: 1, max: 6, step: 1 },
    ],
};

// ── Besin zinciri ve enerji piramidi (Enerji Dönüşümleri) ────────────
//
// Bir basamaktan diğerine enerjinin yalnızca ~%10'u aktarılır; kalanı
// solunum ve ısı olarak kaybolur. Bu yüzden basamak sayısı artamaz.

const TROPHIC = [
    { name: 'Üretici', example: 'Ot' },
    { name: '1. Tüketici', example: 'Çekirge' },
    { name: '2. Tüketici', example: 'Kurbağa' },
    { name: '3. Tüketici', example: 'Yılan' },
    { name: '4. Tüketici', example: 'Kartal' },
];

function pyramidGeom(r: Rect, o: MathObject) {
    const levels = clampInt(simValue(o, 'levels', 4), 2, 5, 4);
    const start = clamp(simValue(o, 'energy', 10000), 100, 100000);
    const rate = clamp(simValue(o, 'rate', 10), 5, 25) / 100;
    const top = r.y + r.h * 0.18;
    const bottom = r.y + r.h * 0.84;
    const rowH = (bottom - top) / levels;
    // Piramit dar tutulur; basamak adları soluna, enerjiler sağına yazılır.
    // Adlar basamağın içine sığmadığı için kenarları kesiyordu.
    const halfW = r.w * 0.12;
    // Piramit hafifçe sağa kaydırılır: en uzun basamak adı ("2. Tüketici
    // (Kurbağa)") sol sütuna sığmayıp kırpılıyordu.
    return {
        levels,
        start,
        rate,
        top,
        bottom,
        rowH,
        halfW,
        cx: r.x + r.w * 0.54,
    };
}

const pyramidRender: Renderer = (k) => {
    const r = k.r;
    const g = pyramidGeom(r, k.o);
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    for (let i = 0; i < g.levels; i++) {
        // Taban altta (üretici), tepe üstte.
        const rowTop = g.bottom - (i + 1) * g.rowH;
        const rowBot = g.bottom - i * g.rowH;
        const wTop = g.halfW * (1 - (i + 1) / g.levels);
        const wBot = g.halfW * (1 - i / g.levels);
        path(
            k,
            [
                [g.cx - wBot, rowBot],
                [g.cx + wBot, rowBot],
                [g.cx + wTop, rowTop],
                [g.cx - wTop, rowTop],
            ],
            true,
        );
        k.c.stroke();
        fillShape(
            k,
            () => {
                k.c.moveTo(g.cx - wBot, rowBot);
                k.c.lineTo(g.cx + wBot, rowBot);
                k.c.lineTo(g.cx + wTop, rowTop);
                k.c.lineTo(g.cx - wTop, rowTop);
                k.c.closePath();
            },
            0.08 + i * 0.05,
        );

        if (k.o.labels === false) continue;
        const energy = g.start * Math.pow(g.rate, i);
        const mid = (rowTop + rowBot) / 2;
        const t = TROPHIC[i];
        label(k, `${t.name} (${t.example})`, g.cx - g.halfW - 12, mid, 'right', 'middle', 0.64);
        label(
            k,
            `${energy >= 1 ? Math.round(energy).toLocaleString('tr-TR') : energy.toFixed(1)} birim`,
            g.cx + g.halfW + 12,
            mid,
            'left',
            'middle',
            0.7,
        );
        // Kaybolan enerji oku: piramidin sağında, enerji yazısının dışında.
        if (i < g.levels - 1) {
            k.c.save();
            k.c.strokeStyle = withAlpha(k.color, 0.45);
            const ax = r.x + r.w - 10;
            arrow(k, ax, mid, ax, mid - g.rowH * 0.55, 6, 1);
            k.c.restore();
        }
    }

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    label(
        k,
        `Her basamağa enerjinin yalnızca %${Math.round(g.rate * 100)}'u geçer`,
        r.x + r.w / 2,
        r.y,
        'center',
        'top',
        0.8,
    );
    label(
        k,
        `Kalan %${100 - Math.round(g.rate * 100)} solunum ve ısı olarak kaybolur`,
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.74,
    );
    k.c.restore();
};

const pyramidSpec: SimSpec = {
    controls: (r, o) => {
        const g = pyramidGeom(r, o);
        return [
            {
                id: 'levels',
                x: g.cx,
                y: g.top - r.h * 0.05,
                type: 'toggle',
                label: 'Basamak sayısını değiştir',
                on: g.levels > 3,
            },
        ];
    },
    onControl: (r, o, id): Record<string, number> => {
        if (id !== 'levels') return {};
        const cur = clampInt(simValue(o, 'levels', 4), 2, 5, 4);
        return { levels: cur >= 5 ? 2 : cur + 1 };
    },
    params: [
        { key: 'levels', label: 'Basamak sayısı', min: 2, max: 5, step: 1 },
        {
            key: 'energy',
            label: 'Üretici enerjisi',
            min: 100,
            max: 100000,
            step: 100,
            unit: 'br',
        },
        {
            key: 'rate',
            label: 'Aktarılan oran',
            min: 5,
            max: 25,
            step: 1,
            unit: '%',
        },
    ],
};

// ── Elektriklenme (Elektrik Yükleri) ─────────────────────────────────
//
// Üç yol:
//  • Sürtünme  — iki nötr cisim sürtülür, biri elektron alır (−), diğeri
//    verir (+). Yükler eşit büyüklükte ve zıt işaretlidir.
//  • Dokunma   — yüklü cisim nötr cisme dokunur, toplam yük ikiye paylaşılır;
//    ikisi de AYNI işaretli olur ve birbirini iter.
//  • Etki      — yüklü cisim yaklaştırılır, dokunmaz. Nötr cisimde yükler
//    ayrışır (yakın yüz zıt işaret); NET yük sıfır kalır, cisimler çekilir.

const ELECTRO_MODES = ['Sürtünme ile', 'Dokunma ile', 'Etki ile'];

function electroGeom(r: Rect, o: MathObject) {
    const mode = clampInt(simValue(o, 'mode', 0), 0, 2, 0);
    const q = clamp(simValue(o, 'q', 6), 2, 12);
    const gap = clamp(simValue(o, 'gap', 40), 5, 100) / 100;
    const rad = Math.min(r.w * 0.13, r.h * 0.2);
    const cy = r.y + r.h * 0.5;
    // Sürtünme ve dokunmada cisimler temas hâlindedir; yalnızca etki kipinde
    // aradaki uzaklık anlamlıdır.
    const span = mode === 2 ? r.w * 0.42 * gap : 0;
    const left = { x: r.x + r.w / 2 - rad - span / 2, y: cy };
    const right = { x: r.x + r.w / 2 + rad + span / 2, y: cy };

    // Her cismin (artı, eksi) yük sayısı ve net yükü.
    let a: [number, number];
    let b: [number, number];
    let force: 'çekme' | 'itme' | 'yok';
    if (mode === 0) {
        a = [q, 0];
        b = [0, q];
        force = 'çekme';
    } else if (mode === 1) {
        // Yüklü (+q) cisim nötr cisme dokundu: yük eşit paylaşıldı.
        const half = q / 2;
        a = [half, 0];
        b = [half, 0];
        force = 'itme';
    } else {
        // Etki: sağdaki nötr cisimde yükler ayrıştı, net yük 0.
        a = [q, 0];
        b = [q, q];
        force = 'çekme';
    }
    return {
        mode,
        q,
        rad,
        cy,
        left,
        right,
        a,
        b,
        force,
        netB: mode === 2 ? 0 : b[0] - b[1],
    };
}

/** Cismin içine + ve − işaretlerini dağıtır. Etki kipinde kutuplaşır. */
function drawCharges(
    k: Ctx,
    cx: number,
    cy: number,
    rad: number,
    plus: number,
    minus: number,
    polarised: boolean,
    towardLeft: boolean,
) {
    const s = rad * 0.26;
    const place = (n: number, sign: '+' | '−', side: number) => {
        for (let i = 0; i < n; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const spanX = polarised ? rad * 0.42 : rad * 0.95;
            const baseX = polarised ? cx + side * rad * 0.46 : cx;
            const x = baseX + (col - 1) * (spanX / 2.4);
            const y = cy + (row - (Math.ceil(n / 3) - 1) / 2) * s * 1.5;
            label(k, sign, x, y, 'center', 'middle', 0.72);
        }
    };
    // Kutuplaşmada zıt yük, yüklü cisme BAKAN yüzde toplanır. `towardLeft`
    // yüklü cismin bu cismin SOLUNDA olduğunu söyler.
    const near = towardLeft ? -1 : 1;
    place(minus, '−', polarised ? near : 0);
    place(plus, '+', polarised ? -near : 0);
}

const electroRender: Renderer = (k) => {
    const r = k.r;
    const g = electroGeom(r, k.o);
    k.c.save();
    k.c.beginPath();
    k.c.rect(r.x, r.y, r.w, r.h);
    k.c.clip();
    k.c.lineWidth = k.lw;

    for (const [pt, charges, isRight] of [
        [g.left, g.a, false],
        [g.right, g.b, true],
    ] as Array<[{ x: number; y: number }, [number, number], boolean]>) {
        k.c.beginPath();
        k.c.arc(pt.x, pt.y, g.rad, 0, Math.PI * 2);
        k.c.stroke();
        if (k.o.labels !== false) {
            // Sağdaki cisim için yüklü cisim SOLDA kalır.
            drawCharges(
                k,
                pt.x,
                pt.y,
                g.rad,
                charges[0],
                charges[1],
                g.mode === 2 && isRight,
                isRight,
            );
        }
    }

    // Sürtünme kipinde iki cisim temas hâlinde; dokunmada da temas gösterilir.
    if (g.mode === 0) {
        k.c.save();
        k.c.strokeStyle = withAlpha(k.color, 0.4);
        const mx = (g.left.x + g.right.x) / 2;
        for (let i = -1; i <= 1; i++) {
            const y = g.cy + i * g.rad * 0.45;
            line(k, mx - g.rad * 0.16, y - g.rad * 0.1, mx + g.rad * 0.16, y + g.rad * 0.1, 1);
        }
        k.c.restore();
    }

    // Kuvvet okları cisimlerin ÜSTÜNE, gövde genişliği içinde çizilir.
    // Önceden gövdenin dışına taşıyor ve nesne sınırında kırpıldığı için
    // itme durumunda ok uçları hiç görünmüyordu.
    const inward = g.force === 'çekme';
    const len = Math.min(r.w * 0.09, g.rad * 0.85);
    const ay = g.cy - g.rad * 1.3;
    const drawForce = (cx: number, dir: number) => {
        arrow(k, cx - (dir * len) / 2, ay, cx + (dir * len) / 2, ay, 8, Math.max(1.8, k.lw * 1.1));
    };
    // Çekmede oklar birbirine, itmede dışa bakar.
    drawForce(g.left.x, inward ? 1 : -1);
    drawForce(g.right.x, inward ? -1 : 1);

    if (k.o.labels === false) {
        k.c.restore();
        return;
    }
    const netA = g.a[0] - g.a[1];
    const sign = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `${v}` : '0 (nötr)');
    label(
        k,
        `Net yük: ${sign(netA)}`,
        g.left.x,
        g.cy + g.rad + k.fs * 0.8,
        'center',
        'middle',
        0.7,
    );
    label(
        k,
        `Net yük: ${sign(g.netB)}`,
        g.right.x,
        g.cy + g.rad + k.fs * 0.8,
        'center',
        'middle',
        0.7,
    );

    label(k, `ELEKTRİKLENME · ${ELECTRO_MODES[g.mode]}`, r.x + r.w / 2, r.y, 'center', 'top', 0.82);
    const notes = [
        'Elektron alan (−), veren (+) yüklenir; yükler eşittir',
        'Yük ikiye paylaşılır, ikisi de aynı işaretli olur',
        'Yükler ayrışır ama net yük sıfır kalır',
    ];
    label(k, notes[g.mode], r.x + r.w / 2, r.y + k.fs * 1.2, 'center', 'top', 0.72);
    label(
        k,
        g.force === 'çekme' ? 'Cisimler birbirini ÇEKER' : 'Cisimler birbirini İTER',
        r.x + r.w / 2,
        r.y + r.h,
        'center',
        'bottom',
        0.82,
    );
    k.c.restore();
};

const electroSpec: SimSpec = {
    controls: (r, o) => {
        const g = electroGeom(r, o);
        const list: SimControl[] = [
            {
                id: 'mode',
                x: r.x + r.w / 2,
                y: r.y + r.h - 18,
                type: 'toggle',
                label: 'Elektriklenme yolunu değiştir',
                on: g.mode > 0,
            },
        ];
        // Etki kipinde uzaklık anlamlı: cisim yaklaştıkça ayrışma artar.
        if (g.mode === 2) {
            list.push({
                id: 'gap',
                x: g.right.x,
                y: g.cy,
                type: 'drag',
                label: 'Cismi yaklaştır / uzaklaştır',
            });
        }
        return list;
    },
    onControl: (r, o, id, p): Record<string, number> => {
        if (id === 'mode') return { mode: (clampInt(simValue(o, 'mode', 0), 0, 2, 0) + 1) % 3 };
        if (id === 'gap') {
            const half = r.x + r.w / 2;
            const rad = Math.min(r.w * 0.13, r.h * 0.2);
            return {
                gap: clamp(((p.x - half - rad * 1.2) / (r.w * 0.25)) * 100, 5, 100),
            };
        }
        return {};
    },
    params: [
        {
            key: 'mode',
            label: 'Yol (0 sürtünme / 1 dokunma / 2 etki)',
            min: 0,
            max: 2,
            step: 1,
        },
        { key: 'q', label: 'Yük miktarı', min: 2, max: 12, step: 2 },
        { key: 'gap', label: 'Uzaklık', min: 5, max: 100, step: 1, unit: '%' },
    ],
};

// ── Bu dosyadaki simülasyonların kaydı ───────────────────────────────

export const GRADE8_RENDERERS: Record<string, Renderer> = {
    seasons_sim: seasonsRender,
    light_angle_sim: lightAngleRender,
    wind_pressure_sim: windPressureRender,
    shadow_sim: shadowRender,
    dna_replication_sim: dnaReplicationRender,
    modification_sim: modificationRender,
    nucleotide_sim: nucleotideRender,
    punnett_sim: punnettRender,
    liquid_pressure_sim: liquidRender,
    solid_pressure_sim: solidRender,
    lever_sim: leverRender,
    pulley_sim: pulleyRender,
    incline_sim: inclineRender,
    division_sim: divisionRender,
    ph_sim: phRender,
    pyramid_sim: pyramidRender,
    electro_sim: electroRender,
};

export const GRADE8_SPECS: Record<string, SimSpec> = {
    seasons_sim: seasonsSpec,
    light_angle_sim: lightAngleSpec,
    wind_pressure_sim: windPressureSpec,
    shadow_sim: shadowSpec,
    dna_replication_sim: dnaReplicationSpec,
    modification_sim: modificationSpec,
    nucleotide_sim: nucleotideSpec,
    punnett_sim: punnettSpec,
    liquid_pressure_sim: liquidSpec,
    solid_pressure_sim: solidSpec,
    lever_sim: leverSpec,
    pulley_sim: pulleySpec,
    incline_sim: inclineSpec,
    division_sim: divisionSpec,
    ph_sim: phSpec,
    pyramid_sim: pyramidSpec,
    electro_sim: electroSpec,
};

/** Kütüphane panelindeki "8. Sınıf" kategorisinin içeriği. */
export const GRADE8_ITEMS: ReadonlyArray<MathCatalogItem> = [
    {
        kind: 'seasons_sim',
        label: 'Mevsimlerin Oluşumu',
        hint: 'Dünya\u2019yı yörüngede sürükle; eksen eğikliği ve mevsim',
        size: { w: 480, h: 320 },
        defaults: { labels: true, sim: { pos: 0, play: 1 } },
    },
    {
        kind: 'light_angle_sim',
        label: 'Işığın Geliş Açısı & Birim Alan',
        hint: 'Geliş açısını ayarla; dik ve eğik açının sıcaklığa ve alana etkisi',
        size: { w: 480, h: 320 },
        defaults: { labels: true, sim: { angle: 60 } },
    },
    {
        kind: 'wind_pressure_sim',
        label: 'Rüzgar ve Basınç Alanları',
        hint: 'Sıcaklık farkı, YAB ve AAB; rüzgarın yönü ve hızı',
        size: { w: 480, h: 320 },
        defaults: { labels: true, sim: { tempA: 14, tempB: 32 } },
    },
    {
        kind: 'shadow_sim',
        label: 'Gölge Boyu & Güneş Açısı',
        hint: 'Güneş yüksekliğini ayarla; öğle ve kış gölge boyu değişimi',
        size: { w: 480, h: 320 },
        defaults: { labels: true, sim: { angle: 45 } },
    },
    {
        kind: 'nucleotide_sim',
        label: 'Nükleotid & KeDiGeNi',
        hint: 'Kromozom > DNA > Gen > Nükleotid ve P-D-Baz yapısı',
        size: { w: 480, h: 320 },
        defaults: { labels: true, sim: { base: 0 } },
    },
    {
        kind: 'dna_replication_sim',
        label: 'DNA Eşlenmesi & Hata Onarımı',
        hint: 'Fermuar açılma, serbest nükleotidler ve mutasyon senaryoları',
        size: { w: 480, h: 340 },
        defaults: { labels: true, sim: { stage: 0, err: 0 } },
    },
    {
        kind: 'punnett_sim',
        label: 'Punnett Karesi',
        hint: 'Ebeveyn alellerini seç, oranları gör',
        size: { w: 320, h: 340 },
        defaults: {
            labels: true,
            text: 'A',
            sim: { p1a: 0, p1b: 1, p2a: 0, p2b: 1, mode: 0 },
        },
        fields: [{ key: 'text', label: 'Karakter harfi', type: 'text' }],
    },
    {
        kind: 'modification_sim',
        label: 'Modifikasyon Laboratuvarı',
        hint: 'Himalaya tavşanı buz deneyi ve çuha çiçeği sıcaklık deneyi',
        size: { w: 480, h: 320 },
        defaults: { labels: true, sim: { mode: 0, ice: 0, temp: 18 } },
    },
    {
        kind: 'liquid_pressure_sim',
        label: 'Sıvı Basıncı',
        hint: 'Derinlik arttıkça basınç ve çıkış hızı artar',
        size: { w: 460, h: 300 },
        defaults: { labels: true, sim: { h: 80, d: 1 } },
    },
    {
        kind: 'solid_pressure_sim',
        label: 'Katı Basıncı',
        hint: 'Yüzü değiştir, batma derinliği değişsin',
        size: { w: 420, h: 300 },
        defaults: { labels: true, sim: { face: 0, f: 60 } },
    },
    {
        kind: 'lever_sim',
        label: 'Kaldıraç Dengesi',
        hint: 'Destek, yük ve kuvveti kaydır; F\u2081\u00b7d\u2081 = F\u2082\u00b7d\u2082',
        size: { w: 480, h: 300 },
        defaults: {
            labels: true,
            sim: { fulcrum: 50, loadPos: 15, effortPos: 85, load: 40, effort: 40 },
        },
    },
    {
        kind: 'pulley_sim',
        label: 'Makara Sistemi',
        hint: 'Sabit, hareketli ve palanga; F = G / taşıyan ip sayısı',
        size: { w: 440, h: 340 },
        defaults: { labels: true, sim: { mode: 1, load: 200 } },
    },
    {
        kind: 'incline_sim',
        label: 'Eğik Düzlem',
        hint: 'Tepe noktasını sürükle; F = G \u00b7 h / \u2113',
        size: { w: 480, h: 300 },
        defaults: { labels: true, sim: { h: 45, len: 75, load: 100 } },
    },
    {
        kind: 'division_sim',
        label: 'Mitoz ve Mayoz',
        hint: 'Aşamaları tek tek ilerlet, kromozom sayısını izle',
        size: { w: 500, h: 300 },
        defaults: { labels: true, sim: { mode: 0, stage: 0 } },
    },
    {
        kind: 'ph_sim',
        label: 'Asit \u2013 Baz ve pH',
        hint: 'Asit ve baz ekle, nötrleşmeyi ve rengi gör',
        size: { w: 500, h: 300 },
        defaults: { labels: true, sim: { acid: 40, base: 40, k: 3 } },
    },
    {
        kind: 'pyramid_sim',
        label: 'Enerji Piramidi',
        hint: 'Her basamağa enerjinin %10\u2019u geçer',
        size: { w: 480, h: 320 },
        defaults: { labels: true, sim: { levels: 4, energy: 10000, rate: 10 } },
    },
    {
        kind: 'electro_sim',
        label: 'Elektriklenme',
        hint: 'Sürtünme, dokunma ve etki ile yükleme',
        size: { w: 480, h: 300 },
        defaults: { labels: true, sim: { mode: 0, q: 6, gap: 40 } },
    },
];
