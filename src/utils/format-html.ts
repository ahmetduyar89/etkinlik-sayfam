import type { Activity } from '../types';

type FormatSource = Partial<
    Pick<Activity, 'html_code' | 'css_code' | 'js_code' | 'external_libs'>
>;

export const getFormattedHtml = (act?: FormatSource | null): string => {
    if (!act) return '';
    const { html_code, css_code, js_code, external_libs } = act;

    const libs = external_libs
        ? external_libs
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
              .map((lib) =>
                  lib.endsWith('.css')
                      ? `<link rel="stylesheet" href="${lib}">`
                      : `<script src="${lib}"></script>`
              )
              .join('\n')
        : '';

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    ${libs}
    <style>
        body, html {
            margin: 0; padding: 0; width: 100vw; min-height: 100vh;
            background-color: transparent;
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
        window.sendAnswer = (data) => window.parent.postMessage({ type: 'SIM_ANSWER', data }, '*');

        (function() {
            window.addEventListener('message', (e) => {
                if (e.data.type === 'CLEANUP' && window._cleanup) window._cleanup();
            });
            window.parent.postMessage({ type: 'DRAWING_READY' }, '*');
        })();
    </script>
</head>
<body>
    ${html_code || ''}
    <script>
        try {
            ${js_code || ''}
        } catch (e) {
            console.error('Simülasyon Hatası:', e);
        }

        (function() {
            const sendHeight = () => {
                const height = document.documentElement.scrollHeight;
                window.parent.postMessage({ type: 'IFRAME_HEIGHT_SYNC', height }, '*');
            };
            const observer = new ResizeObserver(() => sendHeight());
            observer.observe(document.body);
            window.addEventListener('load', sendHeight);
        })();
    </script>
</body>
</html>`;
};
