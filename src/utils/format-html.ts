import type { Activity } from '../types';

type FormatSource = Partial<
    Pick<Activity, 'html_code' | 'css_code' | 'js_code' | 'external_libs'>
>;

export const getFormattedHtml = (act?: FormatSource | null): string => {
    if (!act) return '';
    const { html_code, css_code, js_code, external_libs } = act;

    let cleanHtml = html_code || '';
    let extractedStyles = '';
    let extractedScripts = '';
    let extractedLibs = '';

    // Kullanıcı tam HTML dokümanı yapıştırmışsa içindeki head elemanlarını ve body içeriğini ayıklayıp birleştir
    if (cleanHtml.includes('<body') || cleanHtml.includes('<html')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHtml, 'text/html');
        
        // Body içeriğini al
        cleanHtml = doc.body.innerHTML;

        // Head içindeki stil, script ve linkleri ayıkla
        doc.head.childNodes.forEach((node) => {
            if (node.nodeName === 'STYLE') {
                extractedStyles += (node as HTMLElement).innerHTML + '\n';
            } else if (node.nodeName === 'SCRIPT') {
                const scriptNode = node as HTMLScriptElement;
                if (scriptNode.src) {
                    extractedLibs += `<script src="${scriptNode.src}" ${scriptNode.crossOrigin ? `crossorigin="${scriptNode.crossOrigin}"` : ''}></script>\n`;
                } else {
                    extractedScripts += scriptNode.innerHTML + '\n';
                }
            } else if (node.nodeName === 'LINK') {
                const linkNode = node as HTMLLinkElement;
                if (linkNode.rel === 'stylesheet') {
                    extractedLibs += `<link rel="stylesheet" href="${linkNode.href}" ${linkNode.crossOrigin ? `crossorigin="${linkNode.crossOrigin}"` : ''}>\n`;
                } else {
                    extractedLibs += linkNode.outerHTML + '\n';
                }
            }
        });
        
        // Body içindeki scriptleri de ayıkla (bazı kütüphaneler body sonunda olabilir)
        doc.body.querySelectorAll('script').forEach((script) => {
            if (script.src) {
                extractedLibs += `<script src="${script.src}" ${script.crossOrigin ? `crossorigin="${script.crossOrigin}"` : ''}></script>\n`;
            } else {
                extractedScripts += script.innerHTML + '\n';
            }
            // Body içeriğinden scripti temizle (çünkü sona ekleyeceğiz)
            script.remove();
        });
        // Script temizlendikten sonra body içeriğini güncelle
        cleanHtml = doc.body.innerHTML;
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
                ? `<link rel="stylesheet" href="${href}" crossorigin="anonymous">`
                : `<script src="${lib}" crossorigin="anonymous"></script>`;
        })
        .join('\n');

    const allLibs = extractedLibs + libs;
    const allStyles = extractedStyles + (css_code || '');
    const allScripts = extractedScripts + (js_code || '');

    return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
    ${allLibs}
    <style>
        body, html {
            margin: 0; padding: 0; width: 100%; min-height: 100vh;
            background-color: transparent;
            overflow-x: hidden;
        }
        #content-wrapper {
            width: 100%;
            overflow: visible;
            position: relative;
        }
        ${allStyles}
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
<body>
    <div id="content-wrapper">
        ${cleanHtml}
    </div>
    <script>
        try {
            ${allScripts}
        } catch (e) {
            console.error('Simülasyon Hatası:', e);
            window.parent.postMessage({ type: 'JS_ERROR', error: String(e) }, '*');
        }

        (function() {
            let lastHeight = 0;
            const sendHeight = () => {
                const wrapper = document.getElementById('content-wrapper');
                const height = Math.max(
                    wrapper.scrollHeight,
                    wrapper.offsetHeight,
                    document.documentElement.scrollHeight,
                    document.body.scrollHeight
                );
                if (Math.abs(lastHeight - height) > 2) {
                    lastHeight = height;
                    window.parent.postMessage({ type: 'IFRAME_HEIGHT_SYNC', height }, '*');
                }
            };
            
            const observer = new ResizeObserver(() => sendHeight());
            const wrapper = document.getElementById('content-wrapper');
            if (wrapper) observer.observe(wrapper);
            
            window.addEventListener('load', sendHeight);
            window.addEventListener('DOMContentLoaded', sendHeight);
            setInterval(sendHeight, 1000);
        })();
    </script>
</body>
</html>`;
};
