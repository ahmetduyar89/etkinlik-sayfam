import React from 'react';
import { Search, X, Heart, Clock, Sparkles } from 'lucide-react';
import { ELEMENTS, type ElementAsset } from './catalog';
import './elements.css';
const tabs: [ElementAsset['kind'],string][] = [['sticker','Stickerlar'],['gif','GIF’ler'],['card','Kartlar'],['symbol','Semboller']];
function saved(key:string):string[] {
    try { const value=JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value.filter((id:unknown):id is string => typeof id==='string' && ELEMENTS.some(e=>e.id===id)).slice(0,42) : []; } catch { return []; }
}
export function ElementsPanel({onClose,onInsert}:{onClose:()=>void;onInsert:(asset:ElementAsset)=>void}) {
    const [kind,setKind]=React.useState<ElementAsset['kind']>('sticker');
    const [query,setQuery]=React.useState('');
    const [category,setCategory]=React.useState('Tümü');
    const [recent,setRecent]=React.useState(()=>saved('notebook-elements-recent'));
    const [favorites,setFavorites]=React.useState(()=>saved('notebook-elements-favorites'));
    const [motion,setMotion]=React.useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [status,setStatus]=React.useState('');
    React.useEffect(()=>{try {localStorage.setItem('notebook-elements-recent',JSON.stringify(recent));} catch {/* optional */}},[recent]);
    React.useEffect(()=>{try {localStorage.setItem('notebook-elements-favorites',JSON.stringify(favorites));} catch {/* optional */}},[favorites]);
    const categories=['Tümü',...new Set(ELEMENTS.filter(e=>e.kind===kind).map(e=>e.category))];
    const normalize=(s:string)=>s.toLocaleLowerCase('tr-TR');
    const matches=ELEMENTS.filter(e=>e.kind===kind && (category==='Tümü' || (category==='Favoriler' ? favorites.includes(e.id) : category==='Son' ? recent.includes(e.id) : category===e.category)) && normalize(`${e.label} ${e.category} ${e.description}`).includes(normalize(query.trim())));
    if(category==='Son') matches.sort((a,b)=>recent.indexOf(a.id)-recent.indexOf(b.id));
    const insert=(asset:ElementAsset)=>{onInsert(asset);setRecent([asset.id,...recent.filter(id=>id!==asset.id)].slice(0,24));setStatus(`${asset.label} sayfaya eklendi.`);};
    return <section className="gn-elements" role="dialog" aria-label="Öğeler" onKeyDown={e=>{if(e.key==='Escape')onClose();}}>
        <header><div><span className="el-eyebrow"><Sparkles size={12}/> ATÖLYE KOLEKSİYONU</span><h2>Öğeler<span>{ELEMENTS.length} özgün tasarım</span></h2></div><button type="button" className="el-close" aria-label="Öğeleri kapat" onClick={onClose}><X size={17}/></button></header>
        <div className="el-tabs" role="tablist" aria-label="Öğe türleri">{tabs.map(([id,label])=><button type="button" key={id} role="tab" aria-selected={kind===id} onClick={()=>{setKind(id);setCategory('Tümü');setStatus('');}}>{label}</button>)}</div>
        <label className="el-search"><Search size={15}/><input aria-label="Öğelerde ara" placeholder="Bir fikir, bir sembol…" value={query} onChange={e=>setQuery(e.target.value)}/>{query && <button type="button" aria-label="Aramayı temizle" onClick={()=>setQuery('')}><X size={14}/></button>}</label>
        <div className="el-filters" aria-label="Öğe kategorileri"><button type="button" aria-pressed={category==='Son'} onClick={()=>setCategory('Son')}><Clock size={13}/>Son</button><button type="button" aria-pressed={category==='Favoriler'} onClick={()=>setCategory('Favoriler')}><Heart size={13}/>Favoriler</button>{categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="el-body"><div className={`el-grid ${kind==='card' ? 'el-cards' : ''}`}>
            {matches.map(asset=><div className="el-item" key={asset.id}><button type="button" className="el-insert" aria-label={`${asset.label} ekle`} title={asset.description} onClick={()=>insert(asset)}><img src={asset.kind==='gif' && !motion ? asset.poster : asset.src} alt="" loading="lazy" width={asset.width} height={asset.height}/><span>{asset.label}</span></button><button type="button" className="el-favorite" aria-label={`${asset.label} favori`} aria-pressed={favorites.includes(asset.id)} onClick={()=>setFavorites(favorites.includes(asset.id)?favorites.filter(id=>id!==asset.id):[...favorites,asset.id])}><Heart size={12} fill={favorites.includes(asset.id)?'currentColor':'none'}/></button></div>)}
        </div>{!matches.length && <div className="el-empty"><Sparkles size={24}/><b>{category==='Son'?'Henüz bir öğe eklemedin.':category==='Favoriler'?'Sevdiğin öğeleri kalple işaretle.':'Bir sonuç bulamadık.'}</b><span>Başka bir kategori veya sözcük dene.</span></div>}</div>
        <footer>{kind==='gif' && <label><input type="checkbox" checked={motion} onChange={e=>setMotion(e.target.checked)}/>Hareketli önizleme</label>}<span role="status">{status || 'Dokun, sayfana renk kat.'}</span></footer>
    </section>;
}
