import type { Activity } from '../types';

type FormatSource = Partial<
    Pick<Activity, 'html_code' | 'css_code' | 'js_code' | 'external_libs' | 'content_mode'>
>;

const htmlCache = new Map<string, string>();

const isFullHtmlDocument = (html: string): boolean =>
    /<html[\s>]|<head[\s>]|<body[\s>]|<!DOCTYPE/i.test(html);

const rawDocumentPrelude = `
<script>
    (function() {
        function makeStorage() {
            var s = {};
            return {
                getItem: function(k) { return Object.prototype.hasOwnProperty.call(s, k) ? s[k] : null; },
                setItem: function(k, v) { s[k] = String(v); },
                removeItem: function(k) { delete s[k]; },
                clear: function() { s = {}; },
                key: function(i) { return Object.keys(s)[i] || null; },
                get length() { return Object.keys(s).length; }
            };
        }
        try { localStorage.getItem('__test__'); } catch(e) {
            try { Object.defineProperty(window, 'localStorage', { value: makeStorage() }); } catch(_) {}
        }
        try { sessionStorage.getItem('__test__'); } catch(e) {
            try { Object.defineProperty(window, 'sessionStorage', { value: makeStorage() }); } catch(_) {}
        }

        window.sendAnswer = (data) => window.parent.postMessage({ type: 'SIM_ANSWER', data }, '*');

        window.addEventListener('error', function(e) {
            window.parent.postMessage({ type: 'JS_ERROR', error: e.message + (e.lineno ? ' (satır: ' + e.lineno + ')' : '') }, '*');
        });
        window.addEventListener('unhandledrejection', function(e) {
            window.parent.postMessage({ type: 'JS_ERROR', error: 'Promise hatası: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)) }, '*');
        });
    })();
</script>`;

const rawDocumentBridge = `
<script>
    (function() {
        function sendHeight() {
            var doc = document.documentElement;
            var body = document.body;
            var height = Math.max(
                doc ? doc.scrollHeight : 0,
                doc ? doc.offsetHeight : 0,
                body ? body.scrollHeight : 0,
                body ? body.offsetHeight : 0,
                window.innerHeight || 0
            );
            if (height > 0) {
                window.parent.postMessage({ type: 'IFRAME_HEIGHT_SYNC', height: height }, '*');
            }
        }

        window.addEventListener('load', sendHeight);
        window.addEventListener('resize', sendHeight);
        window.addEventListener('DOMContentLoaded', sendHeight);
        setTimeout(sendHeight, 0);
        setTimeout(sendHeight, 300);
        setInterval(sendHeight, 2000);
        window.parent.postMessage({ type: 'DRAWING_READY' }, '*');
    })();
</script>`;

const injectRawDocumentHelpers = (html: string): string => {
    let result = html;
    if (/<head\b[^>]*>/i.test(result)) {
        result = result.replace(/<head\b[^>]*>/i, (match) => `${match}\n${rawDocumentPrelude}`);
    } else if (/<script\b/i.test(result)) {
        result = result.replace(/<script\b/i, `${rawDocumentPrelude}\n<script`);
    } else {
        result = `${rawDocumentPrelude}\n${result}`;
    }

    if (/<\/body>/i.test(html)) {
        return result.replace(/<\/body>/i, `${rawDocumentBridge}\n</body>`);
    }
    if (/<\/html>/i.test(result)) {
        return result.replace(/<\/html>/i, `${rawDocumentBridge}\n</html>`);
    }
    return `${result}\n${rawDocumentBridge}`;
};

export const getFormattedHtml = (act?: FormatSource | null): string => {
    if (!act) return '';
    const {
        html_code = '',
        css_code = '',
        js_code = '',
        external_libs = '',
        content_mode,
    } = act;

    // Cache anahtarı oluştur (kod içeriklerinin birleşimi)
    const cacheKey = `${content_mode || ''}|${html_code}|${css_code}|${js_code}|${external_libs}`;
    if (htmlCache.has(cacheKey)) {
        return htmlCache.get(cacheKey)!;
    }

    if ((content_mode === 'raw_html' || isFullHtmlDocument(html_code)) && !css_code && !js_code && !external_libs) {
        const rawResult = injectRawDocumentHelpers(html_code);
        htmlCache.set(cacheKey, rawResult);
        if (htmlCache.size > 50) {
            const firstKey = htmlCache.keys().next().value;
            if (firstKey !== undefined) htmlCache.delete(firstKey);
        }
        return rawResult;
    }

    let cleanHtml = html_code;
    let headContent = '';
    let bodyScripts = '';
    let bodyAttrs = '';
    let htmlAttrs = '';

    // Doküman yapısını analiz et ve ayıkla
    const hasStructure = /<html|<head|<body|<!DOCTYPE/i.test(cleanHtml);
    if (hasStructure) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(cleanHtml, 'text/html');
            
            const htmlEl = doc.querySelector('html');
            const headEl = doc.querySelector('head');
            const bodyEl = doc.querySelector('body');
            
            if (htmlEl) {
                Array.from(htmlEl.attributes).forEach(attr => {
                    if (attr.name !== 'lang') htmlAttrs += ` ${attr.name}="${attr.value}"`;
                });
            }
            
            if (headEl) {
                headContent = headEl.innerHTML;
            }

            if (bodyEl) {
                Array.from(bodyEl.attributes).forEach(attr => {
                    bodyAttrs += ` ${attr.name}="${attr.value}"`;
                });
                
                // Body içindeki scriptleri sona taşımak için ayır
                bodyEl.querySelectorAll('script').forEach((script) => {
                    if (script.src) {
                        bodyScripts += `<script src="${script.src}" ${script.crossOrigin ? `crossorigin="${script.crossOrigin}"` : ''}></script>\n`;
                    } else {
                        bodyScripts += `<script>${script.innerHTML}</script>\n`;
                    }
                    script.remove();
                });
                cleanHtml = bodyEl.innerHTML;
            }
        } catch (e) {
            console.warn('HTML parsing error, using raw content:', e);
        }
    }

    const isCssUrl = (url: string): boolean => {
        if (url.startsWith('css:')) return true;
        const bare = url.split('?')[0].split('#')[0];
        return (
            bare.endsWith('.css') ||
            /fonts\.(googleapis|bunny|gstatic)\.com/.test(url) ||
            /\/(css|styles?)[/?#]?$/i.test(bare)
        );
    };

    const libs = (external_libs || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((lib) => {
            const href = lib.startsWith('css:') ? lib.slice(4) : lib;
            return isCssUrl(lib)
                ? `<link rel="stylesheet" href="${href}">`
                : `<script src="${lib}"></script>`;
        })
        .join('\n');

    const isBabel =
        (external_libs || '').toLowerCase().includes('babel') ||
        (external_libs || '').toLowerCase().includes('react') ||
        /import\s+.*from\s+['"]react['"]/.test(js_code || '') ||
        /React\.createRoot|ReactDOM\.render/.test(js_code || '') ||
        /<\s*\/?[A-Z][a-zA-Z0-9]*\b/.test(js_code || '') ||
        /<\s*\/[a-z][a-zA-Z0-9]*\b[^>]*>/.test(js_code || '') ||
        /(?:return|=)\s*<\s*[a-z][a-zA-Z0-9]*\b[^>]*>/i.test(js_code || '');

    const scriptType = isBabel ? 'text/babel' : 'text/javascript';
    const babelData = isBabel ? 'data-presets="env,react"' : '';

    const extraLibs = isBabel
        ? `${!(external_libs || '').includes('react') ? '<script src="https://unpkg.com/react@18/umd/react.development.js"></script>\n    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n' : ''}${!(external_libs || '').includes('babel') ? '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>\n' : ''}`
        : '';

    const allLibs = extraLibs + libs;
    const babelRuntime = isBabel
        ? `<script>
        window.require = function(moduleName) {
            if (moduleName === 'react') return window.React;
            if (moduleName === 'react-dom') return window.ReactDOM;
            if (moduleName === 'react-dom/client') return {
                createRoot: function(el) { return window.ReactDOM.createRoot(el); }
            };
            return window[moduleName];
        };
        window.exports = {};
        window.module = { exports: window.exports };
    </script>`
        : '';

    const result = `<!DOCTYPE html>
<html lang="tr"${htmlAttrs}>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
    ${headContent}
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18",
        "react-dom": "https://esm.sh/react-dom@18",
        "react-dom/client": "https://esm.sh/react-dom@18/client"
      }
    }
    </script>
    ${babelRuntime}
    ${allLibs}
    <style>
        /* Base Reset */
        body, html {
            margin: 0; padding: 0; width: 100%;
            background-color: transparent;
        }
        #content-wrapper {
            width: 100%;
            overflow: visible;
            position: relative;
            min-height: 1px;
        }
        ${css_code || ''}
        #drawing-canvas {
            touch-action: none !important;
            cursor: crosshair;
            z-index: 2147483647 !important;
        }
        body.whiteboard-active {
            background-color: white !important;
            background-image: linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px) !important;
            background-size: 30px 30px !important;
        }
        body.whiteboard-active > *:not(#drawing-canvas):not(script):not(style) {
            opacity: 0 !important;
            pointer-events: none !important;
            display: none !important;
            overflow: hidden !important;
        }
    </style>
    <script>
        (function() {
            function makeStorage() {
                var s = {};
                return {
                    getItem: function(k) { return Object.prototype.hasOwnProperty.call(s, k) ? s[k] : null; },
                    setItem: function(k, v) { s[k] = String(v); },
                    removeItem: function(k) { delete s[k]; },
                    clear: function() { s = {}; },
                    key: function(i) { return Object.keys(s)[i] || null; },
                    get length() { return Object.keys(s).length; }
                };
            }
            try { localStorage.getItem('__test__'); } catch(e) {
                try { Object.defineProperty(window, 'localStorage', { value: makeStorage() }); } catch(_) {}
            }
            try { sessionStorage.getItem('__test__'); } catch(e) {
                try { Object.defineProperty(window, 'sessionStorage', { value: makeStorage() }); } catch(_) {}
            }
        })();

        window.sendAnswer = (data) => window.parent.postMessage({ type: 'SIM_ANSWER', data }, '*');

        window.addEventListener('error', function(e) {
            window.parent.postMessage({ type: 'JS_ERROR', error: e.message + (e.lineno ? ' (satır: ' + e.lineno + ')' : '') }, '*');
        });
        window.addEventListener('unhandledrejection', function(e) {
            window.parent.postMessage({ type: 'JS_ERROR', error: 'Promise hatası: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)) }, '*');
        });

        (function() {
            window.addEventListener('message', (e) => {
                if (e.data.type === 'CLEANUP' && window._cleanup) window._cleanup();
            });
            window.parent.postMessage({ type: 'DRAWING_READY' }, '*');
        })();
    </script>
</head>
<body${bodyAttrs}>
    <div id="content-wrapper">
        ${cleanHtml}
    </div>
    ${bodyScripts}
    <script type="${scriptType}" ${babelData}>
        ${isBabel ? js_code : `
        try {
            ${js_code || ''}
        } catch (e) {
            console.error('Simülasyon Hatası:', e);
            window.parent.postMessage({ type: 'JS_ERROR', error: String(e) }, '*');
        }`}
    </script>
    <script>
        (function() {
            let lastHeight = 0;
            let resizeTimer = null;

            const sendHeight = () => {
                const wrapper = document.getElementById('content-wrapper');
                if (!wrapper) return;
                
                // Hassas yükseklik hesaplama: Tüm çocukların sınırlarını kontrol et
                let maxBottom = 0;
                const children = wrapper.querySelectorAll('*');
                // Sadece en üst seviye görünür çocukları ve mutlak pozisyonlu olanları kontrol et
                Array.from(wrapper.children).forEach(child => {
                    const rect = child.getBoundingClientRect();
                    const bottom = child.offsetTop + rect.height;
                    if (bottom > maxBottom) maxBottom = bottom;
                });

                const height = Math.max(
                    maxBottom,
                    wrapper.scrollHeight,
                    wrapper.offsetHeight,
                    document.body.offsetHeight
                );
                
                if (Math.abs(lastHeight - height) > 5) {
                    lastHeight = height;
                    window.parent.postMessage({ type: 'IFRAME_HEIGHT_SYNC', height }, '*');
                }
            };
            
            // Debounced height sync
            const debouncedSync = () => {
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(sendHeight, 100);
            };

            // 1. ResizeObserver: Kapsayıcı boyutunu izler
            const ro = new ResizeObserver(debouncedSync);
            const wrapper = document.getElementById('content-wrapper');
            if (wrapper) ro.observe(wrapper);
            
            // 2. MutationObserver: DOM değişikliklerini izler (dinamik içerik)
            const mo = new MutationObserver(debouncedSync);
            mo.observe(document.body, { attributes: true, childList: true, subtree: true });
            
            // 3. Standart Eventler
            window.addEventListener('load', sendHeight);
            window.addEventListener('DOMContentLoaded', sendHeight);
            
            // 4. Periyodik Kontrol (Yedek)
            setInterval(sendHeight, 2000);
            
            // İlk tetikleme
            sendHeight();
        })();
    </script>
</body>
</html>`;

    htmlCache.set(cacheKey, result);

    // Limit cache size to 50 items to prevent memory leaks
    if (htmlCache.size > 50) {
        const firstKey = htmlCache.keys().next().value;
        if (firstKey !== undefined) htmlCache.delete(firstKey);
    }

    return result;
};
