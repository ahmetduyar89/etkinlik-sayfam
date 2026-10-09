import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'text-tool-'));
try {
    const outfile = join(dir, 'test.mjs');
    await build({stdin:{contents:"export {textLayout} from './src/components/drawing/textLayout';export {getBB} from './src/components/drawing/strokeRenderer';export {InkToolMemory} from './src/components/drawing/InkEngine/toolMemory';export {encodePages,decodePages} from './src/components/notebooks/pageCodec';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
    const { textLayout, getBB, InkToolMemory, encodePages, decodePages } = await import(pathToFileURL(outfile));
    const memory = new InkToolMemory();
    const whitePen = {tool:'pencil',color:'#ffffff',width:2};
    const textConfig = memory.select(whitePen,'text');
    assert.equal(textConfig.color,'#182230', 'text must not inherit invisible white ink');
    assert.equal(textConfig.width,22);
    const styledText = {...textConfig,color:'#2563eb',width:32,bold:true};
    const restored = memory.select(memory.select(styledText,'eraser'),'text');
    assert.equal(restored.width,32);
    assert.equal(restored.color,'#2563eb');
    assert.equal(restored.bold,true);
    assert.equal(memory.select(restored,'pencil').color,'#ffffff', 'text settings do not overwrite pen preferences');

    const stroke = {id:'text-1',tool:'text',text:'Uzun metin satırı\nİkinci satır',width:22,color:'#182230',textBoxWidth:120,fontFamily:'sans',bold:true,points:[{x:100,y:200}]};
    const layout = textLayout(stroke);
    assert(layout.lines.length>2, 'long paragraphs wrap');
    assert.equal(layout.width,120);
    assert.equal(layout.height,layout.lines.length*27.5);
    const left = getBB(stroke);
    const center = getBB({...stroke,textAlign:'center'});
    const right = getBB({...stroke,textAlign:'right'});
    assert.equal(left.x1,94);
    assert.equal(center.x1,34);
    assert.equal(right.x1,-26);
    assert.equal(left.y2-left.y1,layout.height+12);
    const pages = [{strokes:[stroke],boxes:[]}];
    assert.deepEqual(decodePages(encodePages(pages)),pages, 'width, text, style and position survive save/load');
    const legacy = {...stroke,textBoxWidth:undefined};
    assert.equal(textLayout(legacy).lines.length,2, 'old unwrapped text stays compatible');
    assert.equal(textLayout({...stroke,text:'a'.repeat(100),textBoxWidth:80}).lines.some(line=>line.length>6),false,'long unbroken words are split');
    console.log('Text tool: independent defaults, saved preferences, wrapping, aligned hit bounds, legacy text and persistence passed.');
} finally {await rm(dir,{recursive:true,force:true});}
