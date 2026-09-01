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

    { id: 'wide_lined', label: 'Geniş Çizgili', group: 'Yazı & Not', hint: 'İlkokul için geniş satır' },
    { id: 'handwriting', label: 'Güzel Yazı', group: 'Yazı & Not', hint: 'Dört çizgi üç aralık' },
    { id: 'cornell', label: 'Cornell', group: 'Yazı & Not', hint: 'Anahtar kelime / not / özet bölmeli' },
    { id: 'music', label: 'Nota', group: 'Yazı & Not', hint: 'Beş çizgili porte' },
    { id: 'todo', label: 'Kontrol Listesi', group: 'Yazı & Not', hint: 'Kutucuklu yapılacaklar satırı' },
];

const LINE = 'rgba(15, 23, 42, 0.10)';
const STRONG = 'rgba(15, 23, 42, 0.22)';
const AXIS = 'rgba(15, 23, 42, 0.42)';
const GRID_MID = 'rgba(15, 23, 42, 0.2)';

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
    // Tekrar eden katmanların ortak başlangıç noktası.
    const origin = `${view.tx}px ${view.ty}px`;
    const px = (n: number) => `${n * k}px`;

    switch (paper) {
        case 'grid':
            return {
                ...base,
                backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
                backgroundSize: `${px(26)} ${px(26)}, ${px(26)} ${px(26)}`,
                backgroundPosition: origin,
            };

        case 'lined':
            return {
                ...base,
                backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px)`,
                backgroundSize: `100% ${px(30)}`,
                backgroundPosition: origin,
            };

        case 'wide_lined':
            return {
                ...base,
                backgroundImage: `linear-gradient(${LINE} 1.5px, transparent 1.5px)`,
                backgroundSize: `100% ${px(48)}`,
                backgroundPosition: origin,
            };

        case 'dotted':
            return {
                ...base,
                backgroundImage: `radial-gradient(${STRONG} ${Math.max(1, 1.2 * k)}px, transparent ${Math.max(1, 1.2 * k)}px)`,
                backgroundSize: `${px(24)} ${px(24)}`,
                backgroundPosition: origin,
            };

        // Milimetrik: 1 mm ince, 5 mm orta, 10 mm kalın çizgiler.
        case 'graph_mm':
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(rgba(15,23,42,0.055) 1px, transparent 1px)`,
                    `linear-gradient(90deg, rgba(15,23,42,0.055) 1px, transparent 1px)`,
                    `linear-gradient(rgba(15,23,42,0.11) 1px, transparent 1px)`,
                    `linear-gradient(90deg, rgba(15,23,42,0.11) 1px, transparent 1px)`,
                    `linear-gradient(rgba(15,23,42,0.2) 1px, transparent 1px)`,
                    `linear-gradient(90deg, rgba(15,23,42,0.2) 1px, transparent 1px)`,
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
            const minor = 28 * k;
            const major = 140 * k;
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(to right, ${AXIS} 0, ${AXIS} 2px, transparent 2px)`,
                    `linear-gradient(to bottom, ${AXIS} 0, ${AXIS} 2px, transparent 2px)`,
                    `linear-gradient(90deg, ${GRID_MID} 1px, transparent 1px)`,
                    `linear-gradient(${GRID_MID} 1px, transparent 1px)`,
                    `linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
                    `linear-gradient(${LINE} 1px, transparent 1px)`,
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
                    `<g stroke="rgba(15,23,42,0.13)" stroke-width="1" fill="none">
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
                        <line x1="0" y1="6" x2="40" y2="6" stroke="rgba(15,23,42,0.10)" />
                        <line x1="0" y1="24" x2="40" y2="24" stroke="rgba(37,99,235,0.30)" stroke-dasharray="5 5" />
                        <line x1="0" y1="42" x2="40" y2="42" stroke="rgba(37,99,235,0.30)" stroke-dasharray="5 5" />
                        <line x1="0" y1="60" x2="40" y2="60" stroke="rgba(15,23,42,0.20)" stroke-width="1.4" />
                     </g>`
                ),
                backgroundSize: `${px(40)} ${px(72)}`,
                backgroundPosition: origin,
            };

        // Cornell: solda anahtar kelime sütunu, altta özet bandı.
        case 'cornell': {
            const rule = 'rgba(220,38,38,0.45)';
            return {
                ...base,
                backgroundImage: [
                    `linear-gradient(to right, transparent calc(26% - 1px), ${rule} calc(26% - 1px),` +
                        ` ${rule} calc(26% + 1px), transparent calc(26% + 1px))`,
                    `linear-gradient(to bottom, transparent calc(82% - 1px), ${rule} calc(82% - 1px),` +
                        ` ${rule} calc(82% + 1px), transparent calc(82% + 1px))`,
                    `linear-gradient(${LINE} 1px, transparent 1px)`,
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
                    `<g stroke="rgba(15,23,42,0.28)" stroke-width="1" fill="none">
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
                        `<rect x="8" y="11" width="17" height="17" rx="4" fill="none" stroke="rgba(15,23,42,0.32)" stroke-width="1.4" />`
                    ),
                    `linear-gradient(${LINE} 1px, transparent 1px)`,
                ].join(', '),
                backgroundSize: `${px(40)} ${px(40)}, 100% ${px(40)}`,
                backgroundRepeat: 'repeat-y, repeat',
                backgroundPosition: `${view.tx + 14 * k}px ${view.ty + 6 * k}px, ${view.tx}px ${view.ty + 6 * k}px`,
            };

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
            cols(26 * k, LINE, 1);
            rows(26 * k, LINE, 1);
            break;

        case 'lined':
            rows(30 * k, LINE, 1);
            break;

        case 'wide_lined':
            rows(48 * k, LINE, 1.5);
            break;

        case 'dotted': {
            const step = 24 * k;
            const r = Math.max(1, 1.2 * k);
            if (step > 0.5) {
                ctx.fillStyle = STRONG;
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
            cols(80 * k, 'rgba(15,23,42,0.2)', 1);
            rows(80 * k, 'rgba(15,23,42,0.2)', 1);
            cols(40 * k, 'rgba(15,23,42,0.11)', 1);
            rows(40 * k, 'rgba(15,23,42,0.11)', 1);
            cols(8 * k, 'rgba(15,23,42,0.055)', 1);
            rows(8 * k, 'rgba(15,23,42,0.055)', 1);
            break;

        case 'coordinate': {
            // Eksenler sayfanın dünya orta noktasına oturur; ızgara eksenlere
            // hizalanır. CSS'te eksenler en üst katman, bu yüzden en son çizilir.
            const axisX = (w / 2) * k + view.tx;
            const axisY = (h / 2) * k + view.ty;
            const minor = 28 * k;
            const major = 140 * k;
            cols(minor, LINE, 1, axisX);
            rows(minor, LINE, 1, axisY);
            cols(major, GRID_MID, 1, axisX);
            rows(major, GRID_MID, 1, axisY);
            ctx.fillStyle = AXIS;
            ctx.fillRect(axisX - 1, 0, 2, h);
            ctx.fillRect(0, axisY - 1, w, 2);
            break;
        }

        case 'isometric':
            tiles(60 * k, 104 * k, (ox, oy) => {
                const s = (n: number) => n * k;
                stroke('rgba(15,23,42,0.13)', 1, () => {
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
                line(6, 'rgba(15,23,42,0.10)', 1);
                line(24, 'rgba(37,99,235,0.30)', 1, [5, 5]);
                line(42, 'rgba(37,99,235,0.30)', 1, [5, 5]);
                line(60, 'rgba(15,23,42,0.20)', 1.4);
            });
            break;

        case 'music':
            tiles(40 * k, 96 * k, (ox, oy) => {
                stroke('rgba(15,23,42,0.28)', 1, () => {
                    for (const y of [16, 26, 36, 46, 56]) {
                        ctx.moveTo(ox, oy + y * k);
                        ctx.lineTo(ox + 40 * k, oy + y * k);
                    }
                });
            });
            break;

        case 'todo': {
            rows(40 * k, LINE, 1, view.ty + 6 * k);
            tiles(
                40 * k,
                40 * k,
                (ox, oy) => {
                    ctx.save();
                    ctx.strokeStyle = 'rgba(15,23,42,0.32)';
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
            rows(32 * k, LINE, 1);
            const rule = 'rgba(220,38,38,0.45)';
            ctx.fillStyle = rule;
            ctx.fillRect(w * 0.26 - 1, 0, 2, h * 0.82);
            ctx.fillRect(0, h * 0.82 - 1, w, 2);
            break;
        }

        case 'blank':
        default:
            break;
    }
    ctx.restore();
}
