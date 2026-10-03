// src/utils/clipboard.ts — Panoya kopyalama, yedekli.
//
// Tarayıcılar kopyalamaya yalnızca "kullanıcı hareketi" (tıklama) sırasında
// izin verir. `navigator.clipboard.writeText` bir Promise döndürdüğü için
// ÖNCE onu bekleyip başarısız olunca yedeğe düşmek işe yaramaz: `await`
// sonrasında hareket izni düşmüş olur ve `execCommand` de reddedilir. Bu
// yüzden sıra terstir — önce senkron yol denenir:
//
//   1. Gizli textarea + document.execCommand('copy')  (senkron, izin kesin)
//   2. navigator.clipboard.writeText                   (1 başarısızsa)
//   3. ikisi de olmazsa false → arayüz bağlantıyı seçip kullanıcıya bırakır
//
// execCommand kullanımdan kaldırılmış sayılıyor ama hâlâ her yerde çalışıyor
// ve tek senkron seçenek o.

/** Gizli bir textarea oluşturup metni seçer ve kopyalar. */
function legacyCopy(text: string): boolean {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    // iOS Salt-okunur alanlarda `select()` çalışmaz; düzenlenebilir sayılması
    // gerekir. Görünürde bir değişiklik yaratmaz.
    area.contentEditable = 'true';
    // Görünmez ama seçilebilir olmalı — `display: none` ile seçim çalışmaz.
    // Üst köşeye sabitlemek iOS'ta sayfanın zıplamasını da önler.
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.width = '1px';
    area.style.height = '1px';
    area.style.padding = '0';
    area.style.border = 'none';
    area.style.outline = 'none';
    area.style.boxShadow = 'none';
    area.style.background = 'transparent';
    area.style.opacity = '0';
    document.body.appendChild(area);

    // Kullanıcının o anki seçimi bozulmasın.
    const selection = document.getSelection();
    const previous = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    try {
        area.focus({ preventScroll: true });
        // iOS için Range ile seçim; diğerlerinde setSelectionRange yeterli.
        const range = document.createRange();
        range.selectNodeContents(area);
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
        }
        area.setSelectionRange(0, text.length);
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        area.remove();
        if (selection) {
            selection.removeAllRanges();
            if (previous) selection.addRange(previous);
        }
    }
}

/**
 * Metni panoya kopyalar. Başarılıysa `true` döner.
 *
 * Çağıran, `false` durumunda kullanıcıya bir çıkış yolu göstermelidir
 * (bağlantıyı seçip elle kopyalaması gibi) — sessizce başarısız olmamalıdır.
 */
export async function copyText(text: string): Promise<boolean> {
    if (!text) return false;
    // 1) Senkron yol: tıklamanın hareket izni hâlâ geçerliyken.
    if (legacyCopy(text)) return true;
    // 2) Modern API — senkron yol engellendiyse (bazı katı ortamlar).
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // İzin verilmedi ya da bağlam uygun değil.
    }
    return false;
}
