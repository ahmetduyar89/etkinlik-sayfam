import type { Activity } from '../types';

type FormatSource = Partial<
    Pick<Activity, 'html_code' | 'css_code' | 'js_code' | 'external_libs' | 'content_mode'>
>;

const htmlCache = new Map<string, string>();

const isFullHtmlDocument = (html: string): boolean =>
    /<html[\s>]|<head[\s>]|<body[\s>]|<!DOCTYPE/i.test(html);

const getCached = (key: string, makeValue: () => string) => {
    const cached = htmlCache.get(key);
    if (cached !== undefined) return cached;

    const value = makeValue();
    htmlCache.set(key, value);
    if (htmlCache.size > 50) {
        const firstKey = htmlCache.keys().next().value;
        if (firstKey !== undefined) htmlCache.delete(firstKey);
    }
    return value;
};

const buildLegacyHtml = ({
    html_code = '',
    css_code = '',
    js_code = '',
    external_libs = '',
}: FormatSource) => {
    const libs = external_libs
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
            const href = item.startsWith('css:') ? item.slice(4) : item;
            const cleanUrl = href.split('?')[0].split('#')[0];
            const isCss =
                item.startsWith('css:') ||
                cleanUrl.endsWith('.css') ||
                /fonts\.(googleapis|bunny|gstatic)\.com/.test(href);

            return isCss
                ? `<link rel="stylesheet" href="${href}">`
                : `<script src="${href}"></script>`;
        })
        .join('\n');

    return `<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${libs}
    <style>${css_code}</style>
</head>
<body>
    ${html_code}
    <script>${js_code}</script>
</body>
</html>`;
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
    const cacheKey = `${content_mode || ''}|${html_code}|${css_code}|${js_code}|${external_libs}`;

    return getCached(cacheKey, () => {
        if (content_mode === 'raw_html' || (isFullHtmlDocument(html_code) && !css_code && !js_code && !external_libs)) {
            return html_code;
        }

        return buildLegacyHtml(act);
    });
};
