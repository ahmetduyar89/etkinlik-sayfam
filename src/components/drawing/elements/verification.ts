import type { DrawingCanvasHandle } from '../../../types';
import { ELEMENTS } from './catalog';

/** Dev-only acceptance through the actual canvas insertion and animation pipeline. */
export async function verifyElements(canvas:HTMLCanvasElement,handle:DrawingCanvasHandle):Promise<string> {
    const before=handle.getPages()[0]?.length ?? 0;
    const wait=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
    try {
        for(const id of ['rocket','goal','motion-atom']) {
            const item=ELEMENTS.find(e=>e.id===id)!;
            handle.insertImage(item.src,150,150*item.height/item.width);
        }
        await wait(350);
        if((handle.getPages()[0]?.length ?? 0)!==before+3)throw new Error('Öğe ekleme sayısı hatalı');
        const gif=handle.getPages()[0]?.at(-1);
        if(gif?.src!=='/elements/motion-atom.gif')throw new Error('GIF kaynağı hatalı');
        const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Tuval yok');
        const view=handle.getView(),dpr=window.devicePixelRatio || 1;
        const a=gif.points[0],b=gif.points[1];
        const x=Math.max(0,Math.round((a.x*view.scale+view.tx)*dpr));
        const y=Math.max(0,Math.round((a.y*view.scale+view.ty)*dpr));
        const w=Math.min(canvas.width-x,Math.round((b.x-a.x)*view.scale*dpr));
        const h=Math.min(canvas.height-y,Math.round((b.y-a.y)*view.scale*dpr));
        if(w<=0 || h<=0)throw new Error('GIF görünür alan dışında');
        const first=ctx.getImageData(x,y,w,h).data;await wait(170);
        const second=ctx.getImageData(x,y,w,h).data;
        const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(!reduceMotion && !first.some((v,i)=>v!==second[i]))throw new Error('GIF tuvalde hareket etmiyor');
        handle.undo();await wait(40);handle.redo();await wait(40);
        if(handle.getPages()[0]?.at(-1)?.src!==gif.src)throw new Error('GIF geri al/ileri al hatalı');
        return `PNG sticker, kart, GIF ${reduceMotion?'(hareket azaltma etkin)':'animasyonu'} ve geri al/ileri al: geçti`;
    } finally {
        while((handle.getPages()[0]?.length ?? 0)>before){handle.undo();await wait(30);}
    }
}
