#!/usr/bin/env python3
"""public/icons altındaki PWA ikonlarını üretir (harici kütüphane gerektirmez).

Kullanım:  python3 scripts/generate-icons.py
İkon tasarımı: indigo degrade zemin üzerinde beyaz "A" monogramı.
"""
import os
import struct
import zlib

OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "icons")

TOP_COLOR = (99, 102, 241)     # #6366f1
BOTTOM_COLOR = (67, 56, 202)   # #4338ca
SS = 3                         # kenar yumuşatma için süper örnekleme

# "A" harfi: birleşimi alınan üç dörtgen (0..1 aralığında birim koordinatlar)
GLYPH = [
    [(0.42, 0.04), (0.58, 0.04), (0.26, 0.96), (0.04, 0.96)],   # sol bacak
    [(0.42, 0.04), (0.58, 0.04), (0.96, 0.96), (0.74, 0.96)],   # sağ bacak
    [(0.30, 0.66), (0.70, 0.66), (0.70, 0.80), (0.30, 0.80)],   # orta çizgi
]


def in_polygon(x, y, poly):
    inside = False
    n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xint = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < xint:
                inside = not inside
    return inside


def in_glyph(x, y):
    return any(in_polygon(x, y, p) for p in GLYPH)


def in_rounded_square(x, y, radius):
    """x, y ve radius 0..1 aralığında."""
    if radius <= 0:
        return 0.0 <= x <= 1.0 and 0.0 <= y <= 1.0
    cx = min(max(x, radius), 1.0 - radius)
    cy = min(max(y, radius), 1.0 - radius)
    dx, dy = x - cx, y - cy
    return dx * dx + dy * dy <= radius * radius


def render(size, radius=0.22, glyph_scale=0.56, opaque=False):
    """RGBA piksel listesi üretir."""
    px = bytearray(size * size * 4)
    g0 = (1.0 - glyph_scale) / 2.0  # glyph kutusunun sol/üst kenarı
    for py in range(size):
        for pxi in range(size):
            cover = 0
            glyph_cover = 0
            for sy in range(SS):
                for sx in range(SS):
                    u = (pxi + (sx + 0.5) / SS) / size
                    v = (py + (sy + 0.5) / SS) / size
                    if in_rounded_square(u, v, radius):
                        cover += 1
                        gx = (u - g0) / glyph_scale
                        gy = (v - g0) / glyph_scale
                        if 0.0 <= gx <= 1.0 and 0.0 <= gy <= 1.0 and in_glyph(gx, gy):
                            glyph_cover += 1
            total = SS * SS
            idx = (py * size + pxi) * 4
            if cover == 0:
                continue
            t = (pxi / size * 0.35 + py / size * 0.65)
            r = round(TOP_COLOR[0] + (BOTTOM_COLOR[0] - TOP_COLOR[0]) * t)
            g = round(TOP_COLOR[1] + (BOTTOM_COLOR[1] - TOP_COLOR[1]) * t)
            b = round(TOP_COLOR[2] + (BOTTOM_COLOR[2] - TOP_COLOR[2]) * t)
            gt = glyph_cover / total
            r = round(r + (255 - r) * gt)
            g = round(g + (255 - g) * gt)
            b = round(b + (255 - b) * gt)
            px[idx] = r
            px[idx + 1] = g
            px[idx + 2] = b
            px[idx + 3] = 255 if opaque else round(255 * cover / total)
    return px


def write_png(path, size, px):
    raw = bytearray()
    stride = size * 4
    for y in range(size):
        raw.append(0)
        raw.extend(px[y * stride:(y + 1) * stride])

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
           + chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)


TARGETS = [
    # dosya adı, boyut, köşe yarıçapı, glyph oranı, opak mı
    ("favicon-32.png", 32, 0.20, 0.68, False),
    ("icon-192.png", 192, 0.22, 0.58, False),
    ("icon-512.png", 512, 0.22, 0.58, False),
    ("icon-maskable-512.png", 512, 0.0, 0.46, True),   # maskable: güvenli alan içinde
    ("apple-touch-icon-180.png", 180, 0.0, 0.60, True),  # iOS köşeleri kendi yuvarlar
]

if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    for name, size, radius, scale, opaque in TARGETS:
        write_png(os.path.join(OUT_DIR, name), size, render(size, radius, scale, opaque))
        print("yazıldı:", os.path.join("public", "icons", name))
