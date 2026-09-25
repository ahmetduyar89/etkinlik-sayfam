// src/utils/pdfExport.ts
// Yüksek çözünürlüklü, sıfır harici kütüphane bağımlılığı olan saf TypeScript PDF & Çıktı Oluşturucu.
// Defter sayfalarını, çizimleri, kağıt şablonunu ve bağlı PDF arka planını
// standart PDF-1.4 formatında çok sayfalı veya tek sayfalı vektör/görsel PDF dosyasına dönüştürür.

export interface PageImageInput {
    width: number;
    height: number;
    jpegBytes: Uint8Array;
}

/**
 * Base64 JPEG veya PNG dataURL verisini Uint8Array ikili dizisine çevirir.
 */
export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
    const base64 = dataUrl.split(',')[1] || '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/**
 * Bir canvas öğesini JPEG Uint8Array verisine çevirir.
 */
export function canvasToJpegBytes(
    canvas: HTMLCanvasElement,
    quality = 0.92
): Promise<{ width: number; height: number; bytes: Uint8Array }> {
    return new Promise((resolve) => {
        canvas.toBlob(
            async (blob) => {
                if (!blob) {
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const bytes = dataUrlToUint8Array(dataUrl);
                    resolve({ width: canvas.width, height: canvas.height, bytes });
                    return;
                }
                const buffer = await blob.arrayBuffer();
                resolve({
                    width: canvas.width,
                    height: canvas.height,
                    bytes: new Uint8Array(buffer),
                });
            },
            'image/jpeg',
            quality
        );
    });
}

/**
 * Verilen sayfa resimlerinden (JPEG) standart, çok sayfalı PDF-1.4 dosyası üretir.
 */
export function buildMultiPagePdf(pages: PageImageInput[]): Blob {
    const parts: (Uint8Array | string)[] = [];
    let byteOffset = 0;
    const offsets: number[] = [];

    const encoder = new TextEncoder();

    function writeString(str: string) {
        const encoded = encoder.encode(str);
        parts.push(encoded);
        byteOffset += encoded.length;
    }

    function writeBytes(bytes: Uint8Array) {
        parts.push(bytes);
        byteOffset += bytes.length;
    }

    // PDF Başlığı (Binary güvenlik bayrakları ile)
    writeString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

    const pageCount = pages.length;
    const pageObjNums: number[] = [];
    for (let i = 0; i < pageCount; i++) {
        pageObjNums.push(3 + i * 3);
    }

    // 1 0 obj: Katalog
    offsets[1] = byteOffset;
    writeString('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // 2 0 obj: Sayfa Koleksiyonu
    offsets[2] = byteOffset;
    writeString(
        `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageCount} >>\nendobj\n`
    );

    // Her sayfa için Page nesnesi, Content akışı ve Image XObject
    for (let i = 0; i < pageCount; i++) {
        const pg = pages[i];
        const pageNum = 3 + i * 3;
        const contentNum = pageNum + 1;
        const imgNum = pageNum + 2;

        // Standart PDF puntosu (A4 oranı: 595.28 pt genişlik)
        const ptW = 595.28;
        const ptH = Number((595.28 * (pg.height / (pg.width || 1))).toFixed(2));

        // Sayfa Objesi
        offsets[pageNum] = byteOffset;
        writeString(
            `${pageNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] /Contents ${contentNum} 0 R /Resources << /XObject << /Im1 ${imgNum} 0 R >> >> >>\nendobj\n`
        );

        // İçerik Akışı (Resmi sayfaya 100% ölçekle yay)
        const contentStr = `q\n${ptW} 0 0 ${ptH} 0 0 cm\n/Im1 Do\nQ\n`;
        const contentBytes = encoder.encode(contentStr);
        offsets[contentNum] = byteOffset;
        writeString(
            `${contentNum} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n${contentStr}endstream\nendobj\n`
        );

        // Görsel XObject (Doğrudan donanımsal DCTDecode/JPEG)
        offsets[imgNum] = byteOffset;
        writeString(
            `${imgNum} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pg.width} /Height ${pg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpegBytes.length} >>\nstream\n`
        );
        writeBytes(pg.jpegBytes);
        writeString('\nendstream\nendobj\n');
    }

    // XRef Tablosu
    const xrefOffset = byteOffset;
    const totalObjs = 2 + pageCount * 3;
    writeString(`xref\n0 ${totalObjs + 1}\n0000000000 65535 f \n`);
    for (let i = 1; i <= totalObjs; i++) {
        const offStr = String(offsets[i] || 0).padStart(10, '0');
        writeString(`${offStr} 00000 n \n`);
    }

    // Trailer
    writeString(
        `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
    );

    return new Blob(parts as BlobPart[], { type: 'application/pdf' });
}

/**
 * Verilen bir Blob veya Uint8Array'i tarayıcıda dosya olarak indirir.
 */
export function downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 2000);
}

/**
 * Sayfaları tarayıcının yerel yazdırma diyaloğuna (window.print) gönderir.
 */
export function printCanvases(canvases: HTMLCanvasElement[]): void {
    if (canvases.length === 0) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Yazdır</title>
            <style>
                @page { margin: 0; size: auto; }
                body { margin: 0; padding: 0; background: #fff; }
                .page { page-break-after: always; display: flex; justify-content: center; align-items: center; width: 100vw; height: 100vh; }
                .page:last-child { page-break-after: auto; }
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
        </head>
        <body>
            ${canvases.map((c) => `<div class="page"><img src="${c.toDataURL('image/png')}" /></div>`).join('')}
        </body>
        </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 3000);
    }, 600);
}
