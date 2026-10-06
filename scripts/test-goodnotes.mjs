import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const dir = await mkdtemp(join(tmpdir(), 'goodnotes-test-'));
try {
    const outfile = join(dir, 'engine.mjs');
    await build({stdin:{contents:"export * from './src/components/drawing/goodnotes/InkEngine'; export * from './src/components/drawing/goodnotes/GestureRecognizer'; export {actualSamples,InkInput} from './src/components/drawing/InkEngine/input';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
    const {brushWidth,ribbonOutline,recognizeShape,isScribble,actualSamples,InkInput} = await import(pathToFileURL(outfile));
    const config = {pen:'ballpoint',width:4,sharpness:.5,sensitivity:1,complete:true};
    for(const p of [0,.01,.5,1]) for(const velocity of [0,200,2000]) {
        assert.equal(brushWidth({x:0,y:0,p,velocity,tiltX:60},{x:1,y:0},config),4);
    }
    const capsule=ribbonOutline([{x:0,y:0,p:.1},{x:100,y:0,p:1}],config);
    assert.equal(Math.min(...capsule.map(p=>p.x)),-2);
    assert.equal(Math.max(...capsule.map(p=>p.x)),102);
    assert.equal(Math.max(...capsule.map(p=>p.y))-Math.min(...capsule.map(p=>p.y)),4);
    const brush={...config,pen:'brush'};
    assert.ok(brushWidth({x:0,y:0,p:1},{x:1,y:0},brush)>brushWidth({x:0,y:0,p:.1},{x:1,y:0},brush)*8);
    const fountain={...config,pen:'fountain',sharpness:1};
    assert.ok(Math.abs(brushWidth({x:0,y:0,p:.5,twist:30},{x:1,y:0},fountain)-brushWidth({x:0,y:0,p:.5,twist:30},{x:0,y:1},fountain))>.5);
    const line=Array.from({length:51},(_,i)=>({x:i*2,y:0,p:.8}));
    const live=ribbonOutline(line,{...brush,complete:false}),finished=ribbonOutline(line,brush);
    assert.ok(Math.max(...finished.filter(p=>p.x>99).map(p=>Math.abs(p.y)))<Math.max(...live.filter(p=>p.x>99).map(p=>Math.abs(p.y)))*.2);
    for(const raw of [[],[{x:0,y:0}],line,[{x:0,y:0},{x:0,y:0,p:1},{x:1,y:1}]]) for(const pen of ['ballpoint','fountain','brush']) {
        assert.ok(ribbonOutline(raw,{...config,pen}).every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)));
    }
    const circle=Array.from({length:101},(_,i)=>({x:100+60*Math.cos(i*Math.PI/50),y:100+60*Math.sin(i*Math.PI/50)}));
    assert.equal(recognizeShape(circle)?.tool,'circle');
    assert.equal(recognizeShape(circle.map(p=>({...p,x:p.x*2})))?.tool,'ellipse');
    assert.equal(recognizeShape(line)?.tool,'line');
    const polygon=vertices=>vertices.flatMap((a,i)=>{const b=vertices[(i+1)%vertices.length];return Array.from({length:21},(_,j)=>({x:a.x+(b.x-a.x)*j/20,y:a.y+(b.y-a.y)*j/20}));});
    const rect=recognizeShape(polygon([{x:0,y:0},{x:100,y:0},{x:100,y:60},{x:0,y:60}]));
    assert.equal(rect?.tool,'polygon');assert.equal(rect.points.length,4);
    const triangle=recognizeShape(polygon([{x:0,y:70},{x:60,y:0},{x:110,y:70}]));
    assert.equal(triangle?.tool,'polygon');assert.equal(triangle.points.length,3);
    assert.equal(recognizeShape(circle.map(p=>({...p,x:p.x/10,y:p.y/10}))),null);
    const zigzag=Array.from({length:81},(_,i)=>{const t=i/10,phase=t%2;return {x:phase<1?phase*80:(2-phase)*80,y:t*5,timestamp:i*8};});
    assert.equal(isScribble(zigzag),true);
    assert.equal(isScribble(zigzag.map(p=>({...p,timestamp:p.timestamp*10}))),false);
    assert.equal(isScribble(line.map((p,i)=>({...p,timestamp:i*5}))),false);
    assert.equal(isScribble(circle.map((p,i)=>({...p,timestamp:i*5}))),false);
    const sample={pointerId:2,pointerType:'pen',timeStamp:20,clientX:1,clientY:1,pressure:.5,tiltX:0,tiltY:0,twist:0};
    assert.equal(actualSamples({...sample,getCoalescedEvents:()=>[{...sample,timeStamp:10},sample]}).length,2);
    const input=new InkInput();assert.equal(input.sample(sample,{x:0,y:0},'ballpoint').pressure,.5);
    assert.ok(input.sample({...sample,timeStamp:30,pressure:.8},{x:0,y:0},'brush'));
    console.log('Goodnotes: fixed widths, caps, pressure, nib, taper, degenerate geometry, 5 shape cases, scribble rejection and coalesced input passed.');
} finally { await rm(dir,{recursive:true,force:true}); }
