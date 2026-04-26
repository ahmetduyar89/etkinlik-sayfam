import type { Activity } from '../types';

type FormatSource = Partial<
    Pick<Activity, 'html_code' | 'css_code' | 'js_code' | 'external_libs'>
>;

export const getFormattedHtml = (act?: FormatSource | null): string => {
    if (!act) return '';
    const { html_code, css_code, js_code, external_libs } = act;

    let cleanHtml = html_code || '';
    let headContent = '';
    let bodyScripts = '';
    let bodyAttrs = '';
    let htmlAttrs = '';

    // Kullanıcı tam HTML dokümanı yapıştırmışsa içeriği ayıkla
    if (cleanHtml.includes('<body') || cleanHtml.includes('<html')) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHtml, 'text/html');
        
        // HTML ve Body özelliklerini al
        const htmlEl = doc.querySelector('html');
        const bodyEl = doc.querySelector('body');
        
        if (htmlEl) {
            Array.from(htmlEl.attributes).forEach(attr => {
                if (attr.name !== 'lang') htmlAttrs += ` ${attr.name}="${attr.value}"`;
            });
        }
        if (bodyEl) {
            Array.from(bodyEl.attributes).forEach(attr => {
                bodyAttrs += ` ${attr.name}="${attr.value}"`;
            });
            
            // Body içindeki scriptleri ayır (sona eklemek için)
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

        // Head içeriğini (stil, script, link) olduğu gibi al
        // Tailwind config gibi scriptlerin head'de kalması kritik
        headContent = doc.head.innerHTML;
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

    return `<!DOCTYPE html>
<html lang="tr"${htmlAttrs}>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
    ${headContent}
    ${libs}
    <style>
        body, html {
            margin: 0; padding: 0; width: 100%;
            background-color: transparent;
        }
        #content-wrapper {
            width: 100%;
            overflow: visible;
            position: relative;
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
    <script>
        try {
            ${js_code || ''}
        } catch (e) {
            console.error('Simülasyon Hatası:', e);
            window.parent.postMessage({ type: 'JS_ERROR', error: String(e) }, '*');
        }

        (function() {
            let lastHeight = 0;
            const sendHeight = () => {
                const wrapper = document.getElementById('content-wrapper');
                if (!wrapper) return;
                
                let childrenHeight = 0;
                Array.from(wrapper.children).forEach(child => {
                    const rect = child.getBoundingClientRect();
                    childrenHeight = Math.max(childrenHeight, child.offsetTop + rect.height);
                });

                const height = Math.max(
                    childrenHeight,
                    wrapper.offsetHeight,
                    document.body.offsetHeight
                );
                
                if (Math.abs(lastHeight - height) > 5) {
                    lastHeight = height;
                    window.parent.postMessage({ type: 'IFRAME_HEIGHT_SYNC', height }, '*');
                }
            };
            
            const observer = new ResizeObserver(() => sendHeight());
            const wrapper = document.getElementById('content-wrapper');
            if (wrapper) observer.observe(wrapper);
            
            window.addEventListener('load', sendHeight);
            window.addEventListener('DOMContentLoaded', sendHeight);
            setInterval(sendHeight, 1500);
        })();
    </script>
</body>
</html>`;
};
