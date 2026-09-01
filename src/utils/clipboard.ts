// src/utils/clipboard.ts — Panoya kopyalama, yedekli.
//
// `navigator.clipboard` her yerde çalışmaz: güvenli bağlam (HTTPS/localhost)
// ister, sayfa odakta değilse ya da tarayıcı izni yoksa sessizce reddeder,
// bazı gömülü tarayıcılarda (uygulama içi web görünümleri) hiç tanımlı
// değildir. Bu yüzden başarısız olduğunda gizli bir textarea + execCommand
// yedeğine düşülür; o da olmazsa `false` döner ve arayüz kullanıcıya
// bağlantıyı elle kopyalatır.

/** Eski yöntem: gizli textarea seçilip kopyalanır. */
function legacyCopy(text: string): boolean {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    // Görünmez ama seçilebilir olmalı — `display: none` ile seçim çalışmaz.
    // `position: fixed` + üst köşe, iOS'ta sayfanın kaymasını da önler.
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
        area.select();
        area.setSelectionRange(0, text.length);
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        document.body.removeChild(area);
        if (selection && previous) {
            selection.removeAllRanges();
            selection.addRange(previous);
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
    try {
        if (navigator.clipboard?.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // İzin verilmedi ya da bağlam uygun değil — yedeğe düşülür.
    }
    return legacyCopy(text);
}
