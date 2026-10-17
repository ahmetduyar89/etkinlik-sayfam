import * as THREE from 'three';

// Stylized molecular geometry. Not an atomically resolved crystallographic model.
const BASE_COLORS={A:0xf5aa83,T:0x75c9f3,G:0xa8df92,C:0xc4a0ed};
const PAIRS={A:'T',T:'A',G:'C',C:'G'};
window.DnaMolecular3D=function mount(host,read){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{return null;}
  host.innerHTML='';host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Üç boyutlu DNA modeli; açı ve yakınlık için yan paneli kullanın');
  renderer.domElement.style.touchAction='pan-y';
  const badge=document.createElement('span');badge.className='stage-badge';badge.textContent='3B MOLEKÜL / ŞEKER–FOSFAT & BAZ ÇİFTLERİ';host.append(badge);
  const caption=document.createElement('span');caption.className='stage-caption';caption.textContent='Temsili moleküler model · A–T: 2, G–C: 3 hidrojen bağı';host.append(caption);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);
  camera.position.set(0,0,14);
  scene.add(new THREE.HemisphereLight(0xd4f4ff,0x172138,2));
  const key=new THREE.DirectionalLight(0xd1f9ef,4);key.position.set(4,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0x79a9ef,3);rim.position.set(-4,-1,-4);scene.add(rim);
  let group=new THREE.Group();scene.add(group);
  const resources=new Set();
  function keep(resource){resources.add(resource);return resource;}
  const ball=keep(new THREE.SphereGeometry(1,16,12)),rod=keep(new THREE.CylinderGeometry(1,1,1,9));
  const materials={};
  function mat(c){return materials[c]||(materials[c]=keep(new THREE.MeshStandardMaterial({color:c,metalness:.18,roughness:.32})));}
  function sphere(position,radius,color){const mesh=new THREE.Mesh(ball,mat(color));mesh.position.copy(position);mesh.scale.setScalar(radius);group.add(mesh);}
  const up=new THREE.Vector3(0,1,0);
  function bond(a,b,color,r=.038){const delta=new THREE.Vector3().subVectors(b,a),mesh=new THREE.Mesh(rod,mat(color));mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(r,delta.length(),r);mesh.quaternion.setFromUnitVectors(up,delta.normalize());group.add(mesh);}
  let sprites=[];
  function label(value,point,color){const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d');ctx.font='bold 42px system-ui';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(value,32,47);const texture=new THREE.CanvasTexture(canvas),material=new THREE.SpriteMaterial({map:texture,depthTest:true,transparent:true}),sprite=new THREE.Sprite(material);sprite.position.copy(point);sprite.scale.set(.32,.32,1);group.add(sprite);sprites.push([texture,material]);}
  function build(seq){sprites.forEach(rs=>rs.forEach(r=>r.dispose()));sprites=[];scene.remove(group);group=new THREE.Group();scene.add(group);const rows=[];
    for(let i=0;i<seq.length;i++){const y=(i-(seq.length-1)/2)*.31,theta=i*2*Math.PI/10.5;const row=[];
      for(let side=0;side<2;side++){const a=theta+side*Math.PI,radial=new THREE.Vector3(Math.cos(a),0,Math.sin(a)),tangent=new THREE.Vector3(-Math.sin(a),0,Math.cos(a)),p=radial.clone().multiplyScalar(1.04);p.y=y;row.push(p);const sugar=[];
        for(let j=0;j<5;j++){const angle=j*2*Math.PI/5,s=p.clone().addScaledVector(tangent,Math.cos(angle)*.13);s.y+=Math.sin(angle)*.13;sugar.push(s);sphere(s,.052,j===0?0xecb5b3:0x89b7b9)}
        sugar.forEach((s,j)=>bond(s,sugar[(j+1)%5],0x9ed7d0,.026));
        if(i){const prev=rows[i-1][side],phosphate=p.clone().add(prev).multiplyScalar(.5);sphere(phosphate,.091,0xe3c48d);bond(prev,phosphate,0x87c5bd,.045);bond(phosphate,p,0x87c5bd,.045);for(let k=0;k<2;k++)sphere(phosphate.clone().addScaledVector(radial,k?.09:-.09),.042,0xe7b5ad)}
        const b=side?PAIRS[seq[i]]:seq[i],outer=p.clone().multiplyScalar(.86);outer.y=y;const inner=radial.clone().multiplyScalar(.15);inner.y=y;bond(outer,inner,BASE_COLORS[b],.063);for(let j=0;j<3;j++){const atom=outer.clone().lerp(inner,(j+1)/4);sphere(atom,.086,BASE_COLORS[b]);}
        label(b,outer.clone().lerp(inner,.44).add(new THREE.Vector3(0,.13,0)),'#ffffff');
      }
      const n=seq[i]==='A'||seq[i]==='T'?2:3;
      for(let j=0;j<n;j++){const a=new THREE.Vector3(Math.cos(theta)*.15,y+(j-(n-1)/2)*.07,Math.sin(theta)*.15),b=new THREE.Vector3(-a.x,a.y,-a.z);bond(a,b,0xcbdadd,.012);}
      rows.push(row);
    }
  }
  let lastSeq='',raf,last=0,width=0,height=0,contextLost=false;
  const onLost=e=>{e.preventDefault();contextLost=true;caption.textContent='3B görünüm durakladı. Bölümü yeniden açarak modeli yenileyebilirsin.'};renderer.domElement.addEventListener('webglcontextlost',onLost);
  function tick(now){raf=requestAnimationFrame(tick);if(document.hidden||contextLost||now-last<30)return;const dt=Math.min((now-last)/1000,.08);last=now;const state=read(dt);if(state.seq!==lastSeq){lastSeq=state.seq;build(lastSeq)}const w=host.clientWidth,h=host.clientHeight;if(w!==width||h!==height){width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}group.rotation.y=state.rotation;group.rotation.z=-.12;const base=Math.max(lastSeq.length*.31/2.7,1);camera.position.z=Math.max(9.5,base*6.2,8/camera.aspect)/state.scale;renderer.render(scene,camera)}
  raf=requestAnimationFrame(tick);
  return ()=>{cancelAnimationFrame(raf);renderer.domElement.removeEventListener('webglcontextlost',onLost);sprites.forEach(rs=>rs.forEach(r=>r.dispose()));resources.forEach(r=>r.dispose());renderer.dispose();renderer.forceContextLoss();};
};
