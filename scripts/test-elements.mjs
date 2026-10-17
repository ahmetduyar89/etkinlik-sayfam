import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp,rm,readFile,stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'elements-'));
try {
 const outfile=join(dir,'test.mjs');
 await build({stdin:{contents:"export * from './src/components/drawing/elements/catalog';export * from './src/components/drawing/elements/animation';export {isAnimated} from './src/components/drawing/libraryObjects';export {encodePages,decodePages} from './src/components/notebooks/pageCodec';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
 const {ELEMENTS,animatedElement,elementFrame,isAnimated,encodePages,decodePages}=await import(pathToFileURL(outfile));
 assert.equal(new Set(ELEMENTS.map(e=>e.id)).size,ELEMENTS.length);
 assert.deepEqual(['sticker','gif','card','symbol'].map(kind=>ELEMENTS.filter(e=>e.kind===kind).length),[16,6,8,12]);
 for(const asset of ELEMENTS){
   const data=await readFile('public'+asset.src);
   assert.ok(data.length>0);
   assert.ok(asset.width>0 && asset.height>0);
   const stroke={tool:'image',color:'#000000',src:asset.src,points:[{x:20,y:30},{x:20+asset.width,y:30+asset.height}]};
   assert.equal(isAnimated(stroke),asset.kind==='gif');
   assert.deepEqual(decodePages(encodePages([{strokes:[stroke],boxes:[]}]))[0].strokes[0],stroke,'element source survives persistence');
   if(asset.kind==='gif'){
    assert.match(data.subarray(0,6).toString(),/^GIF8[79]a$/);
    const sheet=await readFile('public'+asset.sprite);
    assert.equal(sheet.readUInt32BE(16),asset.frames*asset.width);
    assert.equal(sheet.readUInt32BE(20),asset.height);
    assert.ok((await stat('public'+asset.poster)).size>0);
    assert.equal(animatedElement(asset.src)?.id,asset.id);
    assert.equal(elementFrame(0,asset.frames,asset.frameMs),0);
    assert.equal(elementFrame(asset.frameMs/1000,asset.frames,asset.frameMs),1);
    assert.equal(elementFrame(asset.frames*asset.frameMs/1000,asset.frames,asset.frameMs),0);
   } else assert.equal(data.subarray(1,4).toString(),'PNG');
 }
 assert.equal(animatedElement('/external.gif'),undefined);
 assert.equal(elementFrame(-1,16,80),0); assert.equal(elementFrame(NaN,16,80),0);
 console.log('42 elements: media files, animation frame sheets, classification and save/load passed.');
} finally {await rm(dir,{recursive:true,force:true});}
