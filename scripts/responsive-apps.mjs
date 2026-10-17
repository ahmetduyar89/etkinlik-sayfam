/** Shared by Vite's static app server and the production export. */
export function responsiveAppHtml(html, appName) {
    const viewport = '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';
    html = /<meta\s+[^>]*name=["']viewport["'][^>]*>/i.test(html)
        ? html.replace(/<meta\s+[^>]*name=["']viewport["'][^>]*>/i, viewport)
        : html.replace(/<head[^>]*>/i, (head) => `${head}\n${viewport}`);
    if (!html.includes('data-atolye-app=')) {
        const safeName = appName.replace(/[^a-z0-9-]/g, '');
        html = html.replace(/<body\b/i, `<body data-atolye-app="${safeName}"`);
    }
    if (!html.includes('/shared/responsive.css') && !html.includes('id="portable-source"')) {
        html = html.replace(/<\/head>/i, '<link rel="stylesheet" href="/shared/responsive.css?v=20261005">\n</head>');
    }
    return html;
}
