// src/components/pdf/PDFOutlineManager.ts
// PDF İçindekiler (Table of Contents / Outline) Yöneticisi.
// PDF dokümanındaki yerleşik başlıkları ve bölümleri okur,
// ilgili sayfa numaralarına dönüştürür.

export interface PDFOutlineItem {
    title: string;
    pageNumber: number;
    items?: PDFOutlineItem[];
}

export class PDFOutlineManager {
    static async getOutline(doc: any): Promise<PDFOutlineItem[]> {
        if (!doc || typeof doc.getOutline !== 'function') return [];
        try {
            const rawOutline = await doc.getOutline();
            if (!rawOutline || !Array.isArray(rawOutline)) return [];

            const parseItems = async (items: any[]): Promise<PDFOutlineItem[]> => {
                const result: PDFOutlineItem[] = [];
                for (const item of items) {
                    let pageNumber = 1;
                    if (item.dest) {
                        try {
                            let dest = item.dest;
                            if (typeof dest === 'string') {
                                dest = await doc.getDestination(dest);
                            }
                            if (Array.isArray(dest) && dest[0]) {
                                const pageIndex = await doc.getPageIndex(dest[0]);
                                pageNumber = pageIndex + 1;
                            }
                        } catch {
                            pageNumber = 1;
                        }
                    }

                    const subItems = item.items && item.items.length ? await parseItems(item.items) : [];
                    result.push({
                        title: item.title || 'Başlıksız Bölüm',
                        pageNumber,
                        items: subItems,
                    });
                }
                return result;
            };

            return await parseItems(rawOutline);
        } catch {
            return [];
        }
    }
}
