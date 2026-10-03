// src/components/notebooks/paper.ts
// Sayfa şablonları. Canvas şeffaf olduğu için desen çizim alanının altında kalır.
//
// Basit desenler CSS gradyanıyla, tekrar etmeyen ya da karmaşık olanlar
// (koordinat düzlemi, Cornell, nota, izometrik) satır içi SVG ile üretilir.

import type { PaperStyle, Viewport } from '../../types';

export interface PaperOption {
    id: PaperStyle;
    label: string;
    /** Şablon grubu — seçim menüsünde başlık olarak kullanılır. */
    group: 'Temel' | 'Matematik & Fen' | 'Yazı & Not';
    hint: string;
}

export const PAPER_STYLES: ReadonlyArray<PaperOption> = [
    { id: 'grid', label: 'Kareli', group: 'Temel', hint: 'Klasik 26 px kareli defter' },
    { id: 'lined', label: 'Çizgili', group: 'Temel', hint: 'Standart satır aralığı' },
    { id: 'dotted', label: 'Noktalı', group: 'Temel', hint: 'Bullet journal tarzı nokta ızgara' },
    { id: 'blank', label: 'Düz', group: 'Temel', hint: 'Boş sayfa' },

    { id: 'graph_mm', label: 'Milimetrik', group: 'Matematik & Fen', hint: 'Grafik çizimi için mm kağıdı' },
    { id: 'coordinate', label: 'Koordinat', group: 'Matematik & Fen', hint: 'Ortası eksenli kareli düzlem' },
    { id: 'isometric', label: 'İzometrik', group: 'Matematik & Fen', hint: 'Üç boyutlu cisim çizimi için' },
    { id: 'number_line', label: 'Sayı Doğrusu', group: 'Matematik & Fen', hint: 'Bölmeli sayı doğrusu şeritleri' },
    { id: 'lab_report', label: 'Deney Raporu', group: 'Matematik & Fen', hint: 'Amaç / Malzeme / Yöntem / Sonuç bölmeli' },

    { id: 'wide_lined', label: 'Geniş Çizgili', group: 'Yazı & Not', hint: 'İlkokul için geniş satır' },
    { id: 'handwriting', label: 'Güzel Yazı', group: 'Yazı & Not', hint: 'Dört çizgi üç aralık' },
    { id: 'cornell', label: 'Cornell', group: 'Yazı & Not', hint: 'Anahtar kelime / not / özet bölmeli' },
    { id: 'music', label: 'Nota', group: 'Yazı & Not', hint: 'Beş çizgili porte' },
    { id: 'todo', label: 'Kontrol Listesi', group: 'Yazı & Not', hint: 'Kutucuklu yapılacaklar satırı' },
    { id: 'exam', label: 'Soru / Cevap', group: 'Yazı & Not', hint: 'Solda soru numarası, sağda cevap alanı' },
];

/** Arka planın koyu (gece, siyah tahta, koyu yeşil) olup olmadığını belirler. */
export function isDarkBackground(bgColor?: string): boolean {
    if (!bgColor) return false;
    const clean = bgColor.trim().toLowerCase();
    if (
        clean === '#111827' ||
        clean === '#1a1a2e' ||
        clean === '#13382c' ||
        clean === '#000000' ||
        clean === '#0f172a'
    ) {
        return true;
    }
    if (clean.startsWith('#') && clean.length === 7) {
        const r = parseInt(clean.slice(1, 3), 16) || 0;
        const g = parseInt(clean.slice(3, 5), 16) || 0;
        const b = parseInt(clean.slice(5, 7), 16) || 0;
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return lum < 0.42;
    }
    return false;
}

/**
 * Kağıt desenleri için zemin rengine göre dinamik kontrast renk paleti üretir.
 * Açık zeminlerde zarif arduvaz/grafit çizgiler, koyu zeminlerde tebeşir beyazı çizgiler verir.
 */
export function getPaperPalette(bgColor?: string) {
    const isDark = isDarkBackground(bgColor);
    if (isDark) {
        return {
            line: 'rgba(255, 255, 255, 0.14)',
            strong: 'rgba(255, 255, 255, 0.35)',
            axis: 'rgba(255, 255, 255, 0.70)',
            gridMid: 'rgba(255, 255, 255, 0.26)',
            svgStroke: 'rgba(255, 255, 255, 0.38)',
            svgStrokeLight: 'rgba(255, 255, 255, 0.18)',
            svgAccent: 'rgba(96, 165, 250, 0.50)',
            cornellRule: 'rgba(248, 113, 113, 0.60)',
            labRule: 'rgba(45, 212, 191, 0.60)',
            examRule: 'rgba(129, 140, 248, 0.60)',
            mmLight: 'rgba(255, 255, 255, 0.08)',
            mmMid: 'rgba(255, 255, 255, 0.18)',
            mmHeavy: 'rgba(255, 255, 255, 0.34)',
        };
    }
    return {
        line: 'rgba(15, 23, 42, 0.10)',
        strong: 'rgba(15, 23, 42, 0.22)',
        axis: 'rgba(15, 23, 42, 0.45)',
        gridMid: 'rgba(15, 23, 42, 0.20)',
        svgStroke: 'rgba(15, 23, 42, 0.28)',
        svgStrokeLight: 'rgba(15, 23, 42, 0.13)',
        svgAccent: 'rgba(37, 99, 235, 0.30)',
        cornellRule: 'rgba(220, 38, 38, 0.45)',
        labRule: 'rgba(13, 148, 136, 0.45)',
        examRule: 'rgba(79, 70, 229, 0.40)',
        mmLight: 'rgba(15, 23, 42, 0.055)',
        mmMid: 'rgba(15, 23, 42, 0.11)',
        mmHeavy: 'rgba(15, 23, 42, 0.20)',
    };
}

const IDENTITY: Viewport = { scale: 1, tx: 0, ty: 0 };

/** SVG dizesini CSS `url(...)` değerine çevirir. */
const svgUrl = (svg: string): string =>
    `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;

/** Tekrar eden bir SVG desen katmanı. */
function tile(width: number, height: number, body: string): string {
    return svgUrl(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`
    );
}

/** Negatif değerler için de doğru çalışan modülo. */
const wrap = (value: number, size: number): number =>
    size > 0 ? ((value % size) + size) % size : 0;

/**
 * Seçilen kağıt desenini CSS arka planına çevirir.
 *
 * Desen, çizim katmanıyla aynı dünya koordinatlarında durur: `view` verilince
 * yakınlaştırma desen sıklığını, kaydırma ise desen başlangıcını değiştirir.
 * `size` yalnızca koordinat düzleminde gerekir — eksenler sayfanın ortasına
 * (dünya koordinatında `size / 2`) oturtulur.
 */
export function paperBackground(
    paper: PaperStyle,
    bgColor: string,
    view: Viewport = IDENTITY,
    size?: { w: number; h: number }
): React.CSSProperties {
    const base: React.CSSProperties = { backgroundColor: bgColor };
    const k = view.scale;
    const pal = getPaperPalette(bgColor);
    // Tekrar eden katmanların ortak başlangıç noktası.
    const origin = `${view.tx}px ${view.ty}px`;
    const px = (n: number) => `${n * k}px`;

    switch (paper) {
        case 'grid':
            return {
                ...base,
                backgroundImage: `linear-gradient(${pal.line} 1px, transparent 1px), linear-gradient(90deg, ${pal.line} 1px, transparent 1px)`,
                backgroundSize: `${px(26)} ${px(26)}, ${px(26)} ${px(26)}`,
                backgroundPosition: origin,
            };

        case 'lined':
            return {
                ...base,
                backgroundImage: `linear-gradient(${pal.line} 1px, transparent 1px)`,
                backgroundSize: `100% ${px(30)}`,
                backgroundPosition: origin,
            };

        case 'wide_lined':
            return {
                ...base,
                backgroundImage: `linear-gradient(${pal.line} 1.5px, transparent 1.5px)`,
                backgroundSize: `100% ${px(48)}`,
                backgroundPosition: origin,
            };

        case 'dotted':
            return {
                ...base,
                backgroundImage: `radial-gradient(${pal.strong} ${Math.max(1, 1.2 * k)}px, transparent ${Math.max(1, 1.2 * k)}px)`,
                backgroundSize: `${px(24)} ${px(24)}`,
                backgroundPosition: origin,
            };

        // Milimetrik: 1 mm ince, 5 mm orta, 10 mm kalın çizgiler.
        case 'graph_mm':
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(${pal.mmLight} 1px, transparent 1px)`,
                    `linear-gradient(90deg, ${pal.mmLight} 1px, transparent 1px)`,
                    `linear-gradient(${pal.mmMid} 1px, transparent 1px)`,
                    `linear-gradient(90deg, ${pal.mmMid} 1px, transparent 1px)`,
                    `linear-gradient(${pal.mmHeavy} 1px, transparent 1px)`,
                    `linear-gradient(90deg, ${pal.mmHeavy} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: [
                    `${px(8)} ${px(8)}`,
                    `${px(8)} ${px(8)}`,
                    `${px(40)} ${px(40)}`,
                    `${px(40)} ${px(40)}`,
                    `${px(80)} ${px(80)}`,
                    `${px(80)} ${px(80)}`,
                ].join(', '),
                backgroundPosition: Array(6).fill(origin).join(', '),
            };

        // Koordinat: eksenler sayfanın ortasında, ızgara eksenlere hizalı.
        case 'coordinate': {
            const w = size?.w ?? 0;
            const h = size?.h ?? 0;
            // Eksenlerin ekran üzerindeki konumu (dünya orta noktası).
            const axisX = (w / 2) * k + view.tx;
            const axisY = (h / 2) * k + view.ty;
            const minor = 26 * k;
            const major = 130 * k;
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(to right, ${pal.axis} 0, ${pal.axis} 2px, transparent 2px)`,
                    `linear-gradient(to bottom, ${pal.axis} 0, ${pal.axis} 2px, transparent 2px)`,
                    `linear-gradient(90deg, ${pal.gridMid} 1px, transparent 1px)`,
                    `linear-gradient(${pal.gridMid} 1px, transparent 1px)`,
                    `linear-gradient(90deg, ${pal.line} 1px, transparent 1px)`,
                    `linear-gradient(${pal.line} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: [
                    '100% 100%',
                    '100% 100%',
                    `${major}px 100%`,
                    `100% ${major}px`,
                    `${minor}px 100%`,
                    `100% ${minor}px`,
                ].join(', '),
                backgroundPosition: [
                    `${axisX - 1}px 0`,
                    `0 ${axisY - 1}px`,
                    `${wrap(axisX, major)}px 0`,
                    `0 ${wrap(axisY, major)}px`,
                    `${wrap(axisX, minor)}px 0`,
                    `0 ${wrap(axisY, minor)}px`,
                ].join(', '),
                backgroundRepeat: 'no-repeat, no-repeat, repeat-x, repeat-y, repeat-x, repeat-y',
            };
        }

        // İzometrik: 60°/120° eğik çizgiler + dikeyler.
        case 'isometric':
            return {
                ...base,
                backgroundImage: tile(
                    60,
                    104,
                    `<g stroke="${pal.svgStrokeLight}" stroke-width="1" fill="none">
                        <path d="M0 26 L30 43 L60 26 M0 78 L30 95 L60 78" />
                        <path d="M0 78 L30 61 L60 78 M0 26 L30 9 L60 26" />
                        <path d="M0 26 L0 78 M30 43 L30 95 M60 26 L60 78 M30 -9 L30 9" />
                     </g>`
                ),
                backgroundSize: `${px(60)} ${px(104)}`,
                backgroundPosition: origin,
            };

        // Güzel yazı: dört çizgi, üç aralık (ortadaki kesikli).
        case 'handwriting':
            return {
                ...base,
                backgroundImage: tile(
                    40,
                    72,
                    `<g stroke-width="1" fill="none">
                        <line x1="0" y1="6" x2="40" y2="6" stroke="${pal.line}" />
                        <line x1="0" y1="24" x2="40" y2="24" stroke="${pal.svgAccent}" stroke-dasharray="5 5" />
                        <line x1="0" y1="42" x2="40" y2="42" stroke="${pal.svgAccent}" stroke-dasharray="5 5" />
                        <line x1="0" y1="60" x2="40" y2="60" stroke="${pal.strong}" stroke-width="1.4" />
                     </g>`
                ),
                backgroundSize: `${px(40)} ${px(72)}`,
                backgroundPosition: origin,
            };

        // Cornell: solda anahtar kelime sütunu, altta özet bandı.
        case 'cornell': {
            const rule = pal.cornellRule;
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(to right, transparent calc(26% - 1px), ${rule} calc(26% - 1px),` +
                        ` ${rule} calc(26% + 1px), transparent calc(26% + 1px))`,
                    `linear-gradient(to bottom, transparent calc(82% - 1px), ${rule} calc(82% - 1px),` +
                        ` ${rule} calc(82% + 1px), transparent calc(82% + 1px))`,
                    `linear-gradient(${pal.line} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: `100% 82%, 100% 100%, 100% ${px(32)}`,
                backgroundRepeat: 'no-repeat, no-repeat, repeat',
                backgroundPosition: `left top, left top, ${origin}`,
            };
        }

        // Nota: beşer çizgilik porteler.
        case 'music':
            return {
                ...base,
                backgroundImage: tile(
                    40,
                    96,
                    `<g stroke="${pal.svgStroke}" stroke-width="1" fill="none">
                        <line x1="0" y1="16" x2="40" y2="16" />
                        <line x1="0" y1="26" x2="40" y2="26" />
                        <line x1="0" y1="36" x2="40" y2="36" />
                        <line x1="0" y1="46" x2="40" y2="46" />
                        <line x1="0" y1="56" x2="40" y2="56" />
                     </g>`
                ),
                backgroundSize: `${px(40)} ${px(96)}`,
                backgroundPosition: origin,
            };

        // Kontrol listesi: her satırın başında kutucuk.
        case 'todo':
            return {
                ...base,
                backgroundImage: [
                    tile(
                        40,
                        40,
                        `<rect x="8" y="11" width="17" height="17" rx="4" fill="none" stroke="${pal.strong}" stroke-width="1.4" />`
                    ),
                    `linear-gradient(${pal.line} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: `${px(40)} ${px(40)}, 100% ${px(40)}`,
                backgroundRepeat: 'repeat-y, repeat',
                backgroundPosition: `${view.tx + 14 * k}px ${view.ty + 6 * k}px, ${view.tx}px ${view.ty + 6 * k}px`,
            };

        // Sayı doğrusu: her şeritte bölmeli bir doğru.
        case 'number_line':
            return {
                ...base,
                backgroundImage: tile(
                    130,
                    120,
                    `<g stroke="${pal.axis}" stroke-width="1.2" fill="none">
                        <line x1="0" y1="60" x2="130" y2="60" />
                        <g stroke-width="1">
                            <line x1="0" y1="52" x2="0" y2="68" />
                            <line x1="26" y1="55" x2="26" y2="65" />
                            <line x1="52" y1="55" x2="52" y2="65" />
                            <line x1="78" y1="55" x2="78" y2="65" />
                            <line x1="104" y1="55" x2="104" y2="65" />
                        </g>
                     </g>`
                ),
                backgroundSize: `${px(130)} ${px(120)}`,
                backgroundPosition: origin,
            };

        // Deney raporu: dört başlıklı bölme.
        case 'lab_report': {
            const rule = pal.labRule;
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(to bottom, transparent calc(25% - 1px), ${rule} calc(25% - 1px),` +
                        ` ${rule} calc(25% + 1px), transparent calc(25% + 1px))`,
                    `linear-gradient(to bottom, transparent calc(50% - 1px), ${rule} calc(50% - 1px),` +
                        ` ${rule} calc(50% + 1px), transparent calc(50% + 1px))`,
                    `linear-gradient(to bottom, transparent calc(75% - 1px), ${rule} calc(75% - 1px),` +
                        ` ${rule} calc(75% + 1px), transparent calc(75% + 1px))`,
                    `linear-gradient(${pal.line} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: `100% 100%, 100% 100%, 100% 100%, 100% ${px(34)}`,
                backgroundRepeat: 'no-repeat, no-repeat, no-repeat, repeat',
                backgroundPosition: `left top, left top, left top, ${origin}`,
            };
        }

        // Soru / cevap: solda dar numara sütunu.
        case 'exam': {
            const rule = pal.examRule;
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(to right, transparent calc(12% - 1px), ${rule} calc(12% - 1px),` +
                        ` ${rule} calc(12% + 1px), transparent calc(12% + 1px))`,
                    `linear-gradient(${pal.line} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: `100% 100%, 100% ${px(36)}`,
                backgroundRepeat: 'no-repeat, repeat',
                backgroundPosition: `left top, ${origin}`,
            };
        }

        case 'blank':
        default:
            return base;
    }
}

/**
 * Kağıt desenini Canvas 2D üzerine çizer — `paperBackground` ile aynı görüntü.
 *
 * Desen sayfada CSS arka planı olarak durduğu için PNG dışa aktarımında
 * kayboluyordu; ekran görüntüsü yalnızca çizim tuvalini alıyordu. Bu işlev
 * aynı deseni tuvale çizerek çıktının ekranla aynı görünmesini sağlar.
 *
 * `ctx` çağrılmadan önce dpr ölçeğine ayarlanmış olmalıdır; `w` ve `h` CSS
 * pikselidir. Katman sırası CSS ile aynıdır: CSS'te ÖNCE yazılan katman ÜSTTE
 * kalır, bu yüzden burada ters sırada çizilir.
 */
export function drawPaper(
    ctx: CanvasRenderingContext2D,
    paper: PaperStyle,
    bgColor: string,
    w: number,
    h: number,
    view: Viewport = IDENTITY
): void {
    ctx.save();
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const k = view.scale;
    const pal = getPaperPalette(bgColor);
    /** Yatay bant dizisi: CSS `linear-gradient(c Npx, transparent Npx)` eşi. */
    const rows = (step: number, color: string, thick: number, phase = view.ty) => {
        if (step <= 0.5) return;
        ctx.fillStyle = color;
        for (let y = wrap(phase, step) - step; y < h; y += step) {
            if (y + thick >= 0) ctx.fillRect(0, y, w, thick);
        }
    };
    /** Dikey bant dizisi. */
    const cols = (step: number, color: string, thick: number, phase = view.tx) => {
        if (step <= 0.5) return;
        ctx.fillStyle = color;
        for (let x = wrap(phase, step) - step; x < w; x += step) {
            if (x + thick >= 0) ctx.fillRect(x, 0, thick, h);
        }
    };
    /** Deseni döşeyip her karo için `body` çizer. */
    const tiles = (
        tw: number,
        th: number,
        body: (ox: number, oy: number) => void,
        phaseX = view.tx,
        phaseY = view.ty,
        onlyOneColumn = false
    ) => {
        if (tw <= 0.5 || th <= 0.5) return;
        const x0 = wrap(phaseX, tw) - tw;
        for (let y = wrap(phaseY, th) - th; y < h; y += th) {
            if (onlyOneColumn) {
                body(phaseX, y);
                continue;
            }
            for (let x = x0; x < w; x += tw) body(x, y);
        }
    };
    const stroke = (color: string, lw: number, build: () => void) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.beginPath();
        build();
        ctx.stroke();
        ctx.restore();
    };

    switch (paper) {
        case 'grid':
            cols(26 * k, pal.line, 1);
            rows(26 * k, pal.line, 1);
            break;

        case 'lined':
            rows(30 * k, pal.line, 1);
            break;

        case 'wide_lined':
            rows(48 * k, pal.line, 1.5);
            break;

        case 'dotted': {
            const step = 24 * k;
            const r = Math.max(1, 1.2 * k);
            if (step > 0.5) {
                ctx.fillStyle = pal.strong;
                for (let y = wrap(view.ty + step / 2, step) - step; y < h; y += step) {
                    for (let x = wrap(view.tx + step / 2, step) - step; x < w; x += step) {
                        ctx.beginPath();
                        ctx.arc(x, y, r, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            break;
        }

        case 'graph_mm':
            // Kabadan inceye: CSS'te ince katman üstte olduğu için en son çizilir.
            cols(80 * k, pal.mmHeavy, 1);
            rows(80 * k, pal.mmHeavy, 1);
            cols(40 * k, pal.mmMid, 1);
            rows(40 * k, pal.mmMid, 1);
            cols(8 * k, pal.mmLight, 1);
            rows(8 * k, pal.mmLight, 1);
            break;

        case 'coordinate': {
            // Eksenler sayfanın dünya orta noktasına oturur; ızgara eksenlere
            // hizalanır. CSS'te eksenler en üst katman, bu yüzden en son çizilir.
            const axisX = (w / 2) * k + view.tx;
            const axisY = (h / 2) * k + view.ty;
            const minor = 26 * k;
            const major = 130 * k;
            cols(minor, pal.line, 1, axisX);
            rows(minor, pal.line, 1, axisY);
            cols(major, pal.gridMid, 1, axisX);
            rows(major, pal.gridMid, 1, axisY);
            ctx.fillStyle = pal.axis;
            ctx.fillRect(axisX - 1, 0, 2, h);
            ctx.fillRect(0, axisY - 1, w, 2);
            break;
        }

        case 'isometric':
            tiles(60 * k, 104 * k, (ox, oy) => {
                const s = (n: number) => n * k;
                stroke(pal.svgStrokeLight, 1, () => {
                    ctx.moveTo(ox, oy + s(26));
                    ctx.lineTo(ox + s(30), oy + s(43));
                    ctx.lineTo(ox + s(60), oy + s(26));
                    ctx.moveTo(ox, oy + s(78));
                    ctx.lineTo(ox + s(30), oy + s(95));
                    ctx.lineTo(ox + s(60), oy + s(78));
                    ctx.moveTo(ox, oy + s(78));
                    ctx.lineTo(ox + s(30), oy + s(61));
                    ctx.lineTo(ox + s(60), oy + s(78));
                    ctx.moveTo(ox, oy + s(26));
                    ctx.lineTo(ox + s(30), oy + s(9));
                    ctx.lineTo(ox + s(60), oy + s(26));
                    ctx.moveTo(ox, oy + s(26));
                    ctx.lineTo(ox, oy + s(78));
                    ctx.moveTo(ox + s(30), oy + s(43));
                    ctx.lineTo(ox + s(30), oy + s(95));
                    ctx.moveTo(ox + s(60), oy + s(26));
                    ctx.lineTo(ox + s(60), oy + s(78));
                    ctx.moveTo(ox + s(30), oy - s(9));
                    ctx.lineTo(ox + s(30), oy + s(9));
                });
            });
            break;

        case 'handwriting':
            tiles(40 * k, 72 * k, (ox, oy) => {
                const line = (y: number, color: string, lw: number, dash: number[] = []) => {
                    ctx.save();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = lw;
                    ctx.setLineDash(dash.map((d) => d * k));
                    ctx.beginPath();
                    ctx.moveTo(ox, oy + y * k);
                    ctx.lineTo(ox + 40 * k, oy + y * k);
                    ctx.stroke();
                    ctx.restore();
                };
                line(6, pal.line, 1);
                line(24, pal.svgAccent, 1, [5, 5]);
                line(42, pal.svgAccent, 1, [5, 5]);
                line(60, pal.strong, 1.4);
            });
            break;

        case 'music':
            tiles(40 * k, 96 * k, (ox, oy) => {
                stroke(pal.svgStroke, 1, () => {
                    for (const y of [16, 26, 36, 46, 56]) {
                        ctx.moveTo(ox, oy + y * k);
                        ctx.lineTo(ox + 40 * k, oy + y * k);
                    }
                });
            });
            break;

        case 'todo': {
            rows(40 * k, pal.line, 1, view.ty + 6 * k);
            tiles(
                40 * k,
                40 * k,
                (ox, oy) => {
                    ctx.save();
                    ctx.strokeStyle = pal.strong;
                    ctx.lineWidth = 1.4;
                    const x = ox + 8 * k;
                    const y = oy + 11 * k;
                    const s = 17 * k;
                    const r = Math.min(4 * k, s / 2);
                    ctx.beginPath();
                    ctx.roundRect?.(x, y, s, s, r);
                    if (!ctx.roundRect) ctx.rect(x, y, s, s);
                    ctx.stroke();
                    ctx.restore();
                },
                view.tx + 14 * k,
                view.ty + 6 * k,
                true
            );
            break;
        }

        case 'cornell': {
            rows(32 * k, pal.line, 1);
            const rule = pal.cornellRule;
            ctx.fillStyle = rule;
            ctx.fillRect(w * 0.26 - 1, 0, 2, h * 0.82);
            ctx.fillRect(0, h * 0.82 - 1, w, 2);
            break;
        }

        case 'number_line':
            tiles(130 * k, 120 * k, (ox, oy) => {
                stroke(pal.axis, 1.2, () => {
                    ctx.moveTo(ox, oy + 60 * k);
                    ctx.lineTo(ox + 130 * k, oy + 60 * k);
                });
                stroke(pal.axis, 1, () => {
                    ctx.moveTo(ox, oy + 52 * k);
                    ctx.lineTo(ox, oy + 68 * k);
                    for (const x of [26, 52, 78, 104]) {
                        ctx.moveTo(ox + x * k, oy + 55 * k);
                        ctx.lineTo(ox + x * k, oy + 65 * k);
                    }
                });
            });
            break;

        case 'lab_report': {
            rows(34 * k, pal.line, 1);
            ctx.fillStyle = pal.labRule;
            for (const part of [0.25, 0.5, 0.75]) {
                ctx.fillRect(0, h * part - 1, w, 2);
            }
            break;
        }

        case 'exam': {
            rows(36 * k, pal.line, 1);
            ctx.fillStyle = pal.examRule;
            ctx.fillRect(w * 0.12 - 1, 0, 2, h);
            break;
        }

        case 'blank':
        default:
            break;
    }
    ctx.restore();
}
