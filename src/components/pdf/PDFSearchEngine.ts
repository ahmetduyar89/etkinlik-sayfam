// src/components/pdf/PDFSearchEngine.ts
// Yüksek performanslı PDF Metin Arama Motoru.
// PDF sayfalarındaki metin katmanını arka planda asenkron olarak tarar,
// kelime ve cümle araması yapar; eşleşen sayfa numaralarını ve konumları sunar.

export interface PDFSearchMatch {
    pageNumber: number;
    matchIndex: number;
    totalMatchesInPage: number;
    snippet: string;
}

export class PDFSearchEngine {
    private doc: any = null;
    private pageTextCache = new Map<number, string>();
    private isIndexing = false;

    constructor(doc?: any) {
        if (doc) {
            this.setDocument(doc);
        }
    }

    setDocument(doc: any) {
        this.doc = doc;
        this.pageTextCache.clear();
        this.isIndexing = false;
    }

    /**
     * Belirtilen sayfanın metin içeriğini alır ve önbelleğe yazar.
     */
    async getPageText(pageNum: number): Promise<string> {
        if (this.pageTextCache.has(pageNum)) {
            return this.pageTextCache.get(pageNum)!;
        }
        if (!this.doc) return '';

        try {
            const page = await this.doc.getPage(pageNum);
            const textContent = await page.getTextContent();
            const text = textContent.items
                .map((item: any) => item.str || '')
                .join(' ')
                .replace(/\s+/g, ' ');

            this.pageTextCache.set(pageNum, text);
            return text;
        } catch {
            return '';
        }
    }

    /**
     * Tüm dokümanda arama yapar ve eşleşen sayfaları sıralar.
     */
    async search(query: string, onProgress?: (scanned: number, total: number) => void): Promise<PDFSearchMatch[]> {
        const cleanQuery = query.trim().toLowerCase();
        if (!cleanQuery || !this.doc) return [];

        const totalPages = this.doc.numPages || 1;
        const matches: PDFSearchMatch[] = [];

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const text = await this.getPageText(pageNum);
            const lowerText = text.toLowerCase();

            if (lowerText.includes(cleanQuery)) {
                // Eşleşme bağlamını (snippet) çıkar
                const idx = lowerText.indexOf(cleanQuery);
                const start = Math.max(0, idx - 30);
                const end = Math.min(text.length, idx + cleanQuery.length + 30);
                const snippet = (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');

                // Kaç kez geçtiğini say
                let count = 0;
                let pos = lowerText.indexOf(cleanQuery);
                while (pos !== -1) {
                    count++;
                    pos = lowerText.indexOf(cleanQuery, pos + cleanQuery.length);
                }

                matches.push({
                    pageNumber: pageNum,
                    matchIndex: idx,
                    totalMatchesInPage: count,
                    snippet,
                });
            }

            if (onProgress && pageNum % 5 === 0) {
                onProgress(pageNum, totalPages);
            }
        }

        return matches;
    }

    clear() {
        this.pageTextCache.clear();
        this.doc = null;
    }
}
