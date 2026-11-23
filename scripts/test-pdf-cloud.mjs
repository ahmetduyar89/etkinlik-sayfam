import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'pdf-cloud-test-'));
const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const warn = console.warn;
const error = console.error;
try {
    const outfile = join(dir, 'pdf-storage.mjs');
    await build({
        entryPoints: ['src/lib/pdfStorage.ts'], bundle: true, platform: 'node', format: 'esm', outfile,
        plugins: [{ name: 'cloud-stub', setup(builder) {
            builder.onResolve({ filter: /^(firebase\/storage|\.\/firebase)$/ }, args => ({ path: args.path, namespace: 'stub' }));
            builder.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: `
                export const storage = {};
                export const ref = (_, path) => ({path});
                export const deleteObject = async () => {};
                export const getDownloadURL = async r => {
                    if (globalThis.pdfTest.urlError) throw new Error('Download URL unavailable');
                    return 'https://files.example/' + r.path;
                };
                export const uploadBytesResumable = (r, blob, metadata) => {
                    globalThis.pdfTest.uploads.push({r, blob, metadata});
                    return { on: (_, progress, reject, resolve) => {
                        globalThis.pdfTest.complete = () => {
                            if (globalThis.pdfTest.uploadError) reject({code:'storage/unauthorized'});
                            else { progress({totalBytes:blob.size, bytesTransferred:blob.size}); resolve(); }
                        };
                    }};
                };
            ` }));
        }}],
    });
    const { uploadPdfToCloud, getPdfDocument, clearPdfDocCache } = await import(pathToFileURL(outfile));
    globalThis.pdfTest = { uploads: [] };
    const data = new TextEncoder().encode('%PDF-1.7\nPDF test bytes');
    let finished = false;
    const upload = uploadPdfToCloud('first-pc', 'ders.pdf', new Blob([data])).then(value => {
        finished = true;
        return value;
    });
    await Promise.resolve();
    assert.equal(finished, false, 'Upload must wait for cloud completion');
    globalThis.pdfTest.complete();
    const cloud = await upload;
    assert.equal(cloud.size, data.length);
    assert.equal(cloud.path, 'notebooks/pdfs/first-pc/ders.pdf');
    assert.equal(globalThis.pdfTest.uploads[0].metadata.contentType, 'application/pdf');
    assert.deepEqual(new Uint8Array(await globalThis.pdfTest.uploads[0].blob.arrayBuffer()), data);

    // Second PC has no IndexedDB entry and must fetch the persisted cloud URL.
    let fetches = 0;
    globalThis.window = { pdfjsLib: { getDocument: ({ data: bytes }) => {
        assert.deepEqual(bytes, data);
        return { promise: Promise.resolve({ numPages: 3 }) };
    } } };
    globalThis.fetch = async url => {
        assert.equal(url, cloud.url);
        fetches++;
        return new Response(data);
    };
    console.warn = () => {};
    console.error = () => {};
    assert.equal((await getPdfDocument('second-pc', undefined, cloud.url)).numPages, 3);
    assert.equal(fetches, 1);
    await getPdfDocument('second-pc', undefined, cloud.url);
    assert.equal(fetches, 1, 'Loaded documents are reused');

    globalThis.pdfTest.uploadError = true;
    const denied = uploadPdfToCloud('denied', 'ders.pdf', data);
    globalThis.pdfTest.complete();
    await assert.rejects(denied, /Yükleme izni alınamadı/);
    globalThis.pdfTest.uploadError = false;
    globalThis.pdfTest.urlError = true;
    const missingUrl = uploadPdfToCloud('missing-url', 'ders.pdf', data);
    globalThis.pdfTest.complete();
    await assert.rejects(missingUrl, /buluta kaydedilemedi/);
    await assert.rejects(uploadPdfToCloud('empty', 'empty.pdf', new ArrayBuffer(0)), /boş/);

    clearPdfDocCache();
    globalThis.fetch = async () => new Response('', { status: 403 });
    await assert.rejects(getPdfDocument('retry', undefined, cloud.url), /403/);
    globalThis.fetch = async () => new Response(data);
    assert.equal((await getPdfDocument('retry', undefined, cloud.url)).numPages, 3,
        'A failed download must allow retry');
    console.log('PDF cloud: upload completion, second-PC download, cache, permission failure, URL failure, empty file and download retry passed.');
} finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    delete globalThis.pdfTest;
    console.warn = warn;
    console.error = error;
    await rm(dir, { recursive: true, force: true });
}
