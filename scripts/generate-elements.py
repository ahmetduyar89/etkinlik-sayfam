"""Generate the original notebook element pack. Requires Pillow; no remote assets."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math,json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/elements'; OUT.mkdir(exist_ok=True)
INK='#24344c'; BLUE='#5386ef'; TEAL='#37bca3'; PINK='#ef84ac'; GOLD='#ffc76a'; PURPLE='#a18ae5'
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
assets=[]
def font(n,bold=False):return ImageFont.truetype(BOLD if bold else FONT,n)
def canvas(w=256,h=256):
    im=Image.new('RGBA',(w*2,h*2));return im,ImageDraw.Draw(im)
def text(d,xy,s,n=26,c=INK,b=False,anchor='mm'):d.text((xy[0]*2,xy[1]*2),s,font=font(n*2,b),fill=c,anchor=anchor)
def line(d,pts,c=INK,w=4):d.line([(x*2,y*2)for x,y in pts],fill=c,width=w*2,joint='curve')
def ellipse(d,box,c,outline=None,w=3):d.ellipse(tuple(v*2 for v in box),fill=c,outline=outline,width=w*2)
def rect(d,box,c,r=16,outline=None,w=3):d.rounded_rectangle(tuple(v*2 for v in box),radius=r*2,fill=c,outline=outline,width=w*2)
def poly(d,pts,c,outline=INK):
    p=[(x*2,y*2)for x,y in pts];d.polygon(p,fill=c);d.line(p+[p[0]],fill=outline,width=6,joint='curve')
def spark(d,x,y,c=GOLD):line(d,[(x-7,y),(x+7,y)],c,3);line(d,[(x,y-7),(x,y+7)],c,3)
def face(d,x,y):ellipse(d,(x-12,y-2,x-7,y+3),INK);ellipse(d,(x+7,y-2,x+12,y+3),INK);line(d,[(x-5,y+10),(x,y+13),(x+5,y+10)],INK,2)
def art(kind,phase=0):
    im,d=canvas(); t=phase*math.tau
    ellipse(d,(27,30,230,233),'#f0f6ff');spark(d,38,68);spark(d,220,183,PINK)
    if kind=='rocket':
        poly(d,[(95,169),(77,204),(115,187)],GOLD);poly(d,[(139,165),(145,201),(163,172)],PINK)
        poly(d,[(74,163),(67,132),(96,122)],TEAL);poly(d,[(151,159),(190,157),(164,128)],TEAL)
        poly(d,[(89,164),(102,94),(161,50),(174,108),(144,177)],'#fff');ellipse(d,(118,92,150,124),BLUE,INK);line(d,[(108,160),(137,170)],INK)
        face(d,131,139)
    elif kind=='atom':
        for a in (0,60,120):
            pts=[]
            for i in range(73):
                v=i*math.tau/72;x=85*math.cos(v);y=31*math.sin(v);r=math.radians(a);pts.append((128+x*math.cos(r)-y*math.sin(r),128+x*math.sin(r)+y*math.cos(r)))
            line(d,pts,[BLUE,TEAL,PINK][a//60],4)
        ellipse(d,(109,109,147,147),GOLD,INK);face(d,128,122)
        ellipse(d,(119+80*math.cos(t),119+30*math.sin(t),137+80*math.cos(t),137+30*math.sin(t)),BLUE,INK,2)
    elif kind=='bulb':
        ellipse(d,(72,53,184,164),GOLD,INK);rect(d,(104,150,152,195),PURPLE,9,INK);line(d,[(104,168),(152,168)],INK);line(d,[(117,151),(113,116),(128,125),(142,116),(139,151)],INK,3);face(d,128,91)
        for a in range(0,360,45):
            r=math.radians(a);line(d,[(128+76*math.cos(r),108+76*math.sin(r)),(128+89*math.cos(r),108+89*math.sin(r))],GOLD,3)
    elif kind=='book':
        poly(d,[(41,77),(109,61),(128,78),(147,61),(214,77),(214,187),(145,176),(128,193),(110,176),(41,187)],'#fff');line(d,[(128,80),(128,189)],BLUE,4)
        for y in (100,121,142):line(d,[(57,y),(106,y-8)],TEAL,3);line(d,[(150,y-8),(198,y)],PINK,3)
        spark(d,128,42,PURPLE)
    elif kind=='planet':
        ellipse(d,(66,67,192,193),PURPLE,INK);line(d,[(91,93),(143,78),(162,93)],'#d8cafa',6);line(d,[(94,168),(159,158)],'#d8cafa',6)
        pts=[(128+102*math.cos(i*math.tau/80),128+24*math.sin(i*math.tau/80)+40*math.cos(i*math.tau/80))for i in range(81)];line(d,pts,GOLD,8);face(d,135,123)
    elif kind=='flask':
        poly(d,[(103,51),(154,51),(154,100),(198,180),(185,201),(71,201),(58,180),(103,100)],'#fff');poly(d,[(82,152),(174,152),(193,181),(182,195),(74,195),(64,181)],TEAL,TEAL);line(d,[(103,70),(154,70)],BLUE,4)
        for x,y,r in [(112,173,8),(150,162,6),(126,126,8),(152,100,5)]:ellipse(d,(x-r,y-r,x+r,y+r),GOLD)
    elif kind=='seed':
        rect(d,(82,161,174,218),GOLD,9,INK);line(d,[(128,162),(128,84)],TEAL,6)
        ellipse(d,(62,103,130,143),TEAL,INK);ellipse(d,(128,74,196,116),TEAL,INK);line(d,[(89,123),(125,139),(128,161)],'#ecfff6',2);face(d,128,185)
    elif kind=='trophy':
        rect(d,(83,59,174,151),GOLD,25,INK);line(d,[(84,75),(54,75),(55,117),(86,133)],GOLD,13);line(d,[(174,75),(204,75),(201,117),(173,133)],GOLD,13);line(d,[(128,151),(128,193)],INK,8);rect(d,(89,188,167,212),PURPLE,9,INK);poly(d,[(128+(18 if j%2==0 else 8)*math.sin(j*math.pi/5),104-(18 if j%2==0 else 8)*math.cos(j*math.pi/5)) for j in range(10)],INK,INK)
    elif kind=='pencil':
        poly(d,[(74,192),(90,130),(173,50),(205,82),(122,163)],GOLD);poly(d,[(74,192),(89,148),(119,167)],'#ffe4c1');poly(d,[(74,192),(80,175),(90,185)],INK);poly(d,[(173,50),(191,32),(223,64),(205,82)],PINK);line(d,[(104,141),(187,61)],'#fff5d6',4)
    elif kind=='balloons':
        for x,y,c in [(81,110,TEAL),(166,84,PINK),(139,140,GOLD)]:
            ellipse(d,(x-32,y-43,x+32,y+32),c,INK);line(d,[(x,y+33),(x-8,y+54),(x+6,y+75),(x,y+95)],BLUE,2);line(d,[(x-16,y-17),(x-18,y-6)],'#ffffff',3)
    elif kind=='rainbow':
        for r,c in [(87,PINK),(70,GOLD),(53,TEAL),(36,BLUE)]:
            pts=[(128+r*math.cos(math.pi+i*math.pi/60),157+r*math.sin(math.pi+i*math.pi/60))for i in range(61)];line(d,pts,c,16)
        for x in (47,208):ellipse(d,(x-31,141,x+29,183),'#fff',INK);face(d,128,200)
    elif kind=='clock':
        ellipse(d,(49,49,207,207),'#fff',INK);ellipse(d,(61,61,195,195),'#eaf7f2');line(d,[(128,82),(128,128),(169,147)],BLUE,6);ellipse(d,(122,122,134,134),PINK)
        for i in range(12):a=i*math.tau/12;ellipse(d,(126+63*math.sin(a),126-63*math.cos(a),130+63*math.sin(a),130-63*math.cos(a)),INK)
    elif kind=='magnet':
        rect(d,(60,49,196,202),PINK,56,INK);rect(d,(99,46,157,159),'#f0f6ff',25,INK);rect(d,(58,42,100,96),BLUE,8,INK);rect(d,(156,42,198,96),TEAL,8,INK);text(d,(80,68),'N',18,'#fff',True);text(d,(177,68),'S',18,'#fff',True)
    elif kind=='star':
        pts=[(128+(87 if i%2==0 else 40)*math.sin(i*math.pi/5),132-(87 if i%2==0 else 40)*math.cos(i*math.pi/5))for i in range(10)];poly(d,pts,GOLD);face(d,128,123)
    elif kind=='brain':
        for x,y in [(99,97),(151,96),(80,130),(168,129),(102,162),(150,161)]:ellipse(d,(x-31,y-30,x+31,y+30),PINK,INK)
        line(d,[(128,72),(125,108),(136,129),(127,181)],INK,3);line(d,[(78,119),(109,120),(105,145)],INK,3);line(d,[(171,108),(150,115),(155,137)],INK,3)
    else:
        ellipse(d,(63,63,193,193),TEAL,INK);line(d,[(95,115),(118,141),(163,91)],'#fff',9);text(d,(128,173),'HARİKA',18,'#fff',True)
    return im.resize((256,256),Image.Resampling.LANCZOS)
def add(id,label,kind,category,desc,im):
    path=f'{id}.png';im.save(OUT/path)
    assets.append(dict(id=id,label=label,kind=kind,category=category,description=desc,src='/elements/'+path,poster='/elements/'+path,width=im.width,height=im.height,frames=1,frameMs=100,sprite=None))
for id,label,cat in [('rocket','Merak Roketi','Bilim'),('atom','Atom Arkadaşım','Bilim'),('bulb','Fikir Işığı','Motivasyon'),('book','Kitap Kurdu','Çalışma'),('planet','Uzay Kaşifi','Bilim'),('flask','Deney Zamanı','Bilim'),('seed','Minik Filiz','Doğa'),('trophy','Başardım','Motivasyon'),('pencil','Renkli Kalem','Çalışma'),('balloons','Kutlama Balonları','Motivasyon'),('rainbow','Renkli Bir Gün','Doğa'),('clock','Odak Saati','Çalışma'),('magnet','Manyetik Güç','Bilim'),('star','Parlayan Yıldız','Motivasyon'),('brain','Düşünen Beyin','Bilim'),('check','Harika İş','Motivasyon')]:add(id,label,'sticker',cat,label,art(id))
for i,(id,title,sub,lines) in enumerate([
    ('goal','Bugünün Hedefi','KÜÇÜK ADIM, BÜYÜK GELİŞİM',['Bugün öğrenmek istediğim:','İlk adımım:','Tamamlayınca kendime notum:']),
    ('experiment','Deney Planım','MERAK ET · DENE · GÖZLEMLE',['Sorum / hipotezim:','Değiştirdiğim değişken:','Gözlemim ve sonucum:']),
    ('summary','Mini Özet','KENDİ CÜMLELERİNLE ANLAT',['Ana fikir:','Üç önemli kavram:','Bir örnek:']),
    ('wonder','Merak Ettim','İYİ BİR SORUYLA BAŞLA',['Neden böyle oluyor?','Başka nasıl açıklanabilir?','Nasıl test edebilirim?']),
    ('evidence','Kanıt Defterim','İDDİA · KANIT · GEREKÇE',['İddiam:','Bunu destekleyen kanıt:','Kanıtın anlamı:']),
    ('remember','Hatırla','BİLGİYİ BİR İPUCUYLA BAĞLA',['Anahtar sözcük:','Benim hatırlama ipucum:','Örnek / çizim:']),
    ('reflect','Kendimi Değerlendiriyorum','ÖĞRENMEYE BİR MOLA',['Artık yapabiliyorum:','Biraz daha çalışacağım:','Sonraki adımım:']),
    ('formula','Kuvvetin Formülü','F = m · a',['F: net kuvvet (N)','m: kütle (kg)','a: ivme (m/s²)'])]):
    im,d=canvas(480,320);accent=[BLUE,TEAL,PINK,PURPLE][i%4];bg=['#edf3ff','#ecfaf5','#fff0f5','#f4f0ff'][i%4]
    rect(d,(3,3,477,317),bg,24,accent,2);rect(d,(24,23,84,47),accent,8);text(d,(54,35),'NOT',11,'#fff',True)
    text(d,(26,82),title,24,INK,True,'lm');text(d,(26,113),sub,11,accent,True,'lm')
    for j,l in enumerate(lines):text(d,(27,153+j*49),l,16,INK,False,'lm');line(d,[(27,178+j*49),(452,178+j*49)],'#ccd6e4',1)
    add(id,title,'card','Çalışma' if id!='formula' else 'Bilim',sub,im.resize((480,320),Image.Resampling.LANCZOS))
for i,(id,s,label) in enumerate([('pi','π','Pi'),('sigma','Σ','Toplam'),('root','√','Karekök'),('infinity','∞','Sonsuzluk'),('delta','Δ','Değişim'),('theta','θ','Açı'),('plusminus','±','Artı eksi'),('multiply','×','Çarpma'),('divide','÷','Bölme'),('arrow','→','Yön oku'),('degree','°','Derece'),('percent','%','Yüzde')]):
    im,d=canvas();c=[BLUE,TEAL,PURPLE,PINK][i%4];ellipse(d,(29,29,227,227),['#edf3ff','#ecfaf5','#f4f0ff','#fff0f5'][i%4],c,3);text(d,(128,123),s,90,c,True);add('symbol-'+id,label,'symbol','Matematik',label,im.resize((256,256),Image.Resampling.LANCZOS))
for id,label,cat in [('atom','Elektron Dansı','Bilim'),('rocket','Yola Çık','Motivasyon'),('seed','Dans Eden Filiz','Doğa'),('star','Yıldızını Parlat','Motivasyon'),('bulb','Fikir Geldi','Çalışma'),('planet','Neşeli Gezegen','Bilim')]:
    frames=[]
    for i in range(16):
        img=art(id,i/16)
        if id!='atom':
            s=math.sin(i*math.tau/16);layer=img.rotate(s*7,Image.Resampling.BICUBIC);img=Image.new('RGBA',(256,256));img.alpha_composite(layer,(0,round(s*5)))
        frames.append(img)
    gif='motion-'+id+'.gif';frames[0].save(OUT/gif,save_all=True,append_images=frames[1:],duration=80,loop=0,disposal=2)
    sheet=Image.new('RGBA',(256*16,256))
    for i,f in enumerate(frames):sheet.alpha_composite(f,(i*256,0))
    sheet.save(OUT/('motion-'+id+'-sheet.png'));frames[0].save(OUT/('motion-'+id+'.png'))
    assets.append(dict(id='motion-'+id,label=label,kind='gif',category=cat,description=label,src='/elements/'+gif,poster='/elements/motion-'+id+'.png',width=256,height=256,frames=16,frameMs=80,sprite='/elements/motion-'+id+'-sheet.png'))
header="""// Original assets generated by scripts/generate-elements.py; no external media.
export interface ElementAsset {
 id:string; label:string; kind:'sticker'|'gif'|'card'|'symbol'; category:string; description:string;
 src:string; poster:string; width:number; height:number; frames:number; frameMs:number; sprite:string|null;
}
export const ELEMENTS: ElementAsset[] = """
(ROOT/'src/components/drawing/elements/catalog.ts').write_text(header+json.dumps(assets,ensure_ascii=False,indent=2)+';\n')
print(f'Generated {len(assets)} original elements')
