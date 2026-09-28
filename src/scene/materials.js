import * as THREE from 'three';
import {interiorStyles} from '../data/interior-styles.js';
const hash=(x,y,s=1)=>{let n=Math.imul(x+s*37,374761393)+Math.imul(y+s*101,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
let timber=null;
export async function prepareTextures(){timber=await new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src='assets/textures/timber.jpg';});}
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lerp=(a,b,t)=>a+(b-a)*t;
function noise(x,y,s){const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,fx=u*u*(3-2*u),fy=v*v*(3-2*v);return lerp(lerp(hash(i,j,s),hash(i+1,j,s),fx),lerp(hash(i,j+1,s),hash(i+1,j+1,s),fx),fy);}
function canvas(w,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function map(c,repeat=[1,1],color=true){const t=new THREE.CanvasTexture(c);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=8;return t;}
function surface(kind,color,seed=1,size=512){
 const c=canvas(size),ctx=c.getContext('2d'),d=ctx.createImageData(size,size),p=d.data,base=rgb(color);
 if(kind==='wood'&&timber){ctx.save();ctx.translate(size/2,size/2);ctx.rotate(Math.PI/2);ctx.drawImage(timber,seed>=30?30+(seed%3)*600:1030,seed>=30?18+(seed%7)*128:18,seed>=30?520:780,95,-size/2,-size/2,size,size);ctx.restore();const img=ctx.getImageData(0,0,size,size);let total=0;for(let i=0;i<img.data.length;i+=4)total+=(img.data[i]+img.data[i+1]+img.data[i+2])/3;const mean=total/(size*size);for(let i=0;i<img.data.length;i+=4){const grain=((img.data[i]+img.data[i+1]+img.data[i+2])/3-mean)*(seed>=30?.65:.38);for(let k=0;k<3;k++)img.data[i+k]=Math.max(0,Math.min(255,base[k]+grain));}ctx.putImageData(img,0,0);return c;}
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=x/size,v=y/size,i=(y*size+x)*4,n=noise(u*7,v*7,seed),fine=(hash(x,y,seed)-.5);let delta=0;
  if(kind==='wood'){
   const drift=noise(u*5,v*2,seed)*.55;
   delta=(noise(u*230+drift*5,v*3,seed)-.5)*32+(noise(u*30,v*1.2,seed+3)-.5)*17+fine*5;
  }else if(kind==='marble'){
   const warp=noise(u*6,v*6,seed)*.9+noise(u*19,v*19,seed+1)*.3+noise(u*55,v*55,seed+2)*.12+noise(u*135,v*135,seed+3)*.035;
   const a=Math.abs(Math.sin((u*1.7+v*.75+warp)*Math.PI*2));
   const vein=Math.pow(Math.max(0,1-a/.13),2);
   const wisps=Math.pow(Math.max(0,1-a/.35),3);
   delta=(n-.5)*8+fine*3-vein*(100+80*noise(u*12,v*12,seed+7))-wisps*38;
  }else if(kind==='linen')delta=(x%4===0?-5:1)+(y%5===0?-4:1)+fine*10+(n-.5)*3;
  else delta=(n-.5)*(kind==='stone'?12:3)+fine*(kind==='stone'?5:2);
  for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,base[k]+delta));p[i+3]=255;
 }ctx.putImageData(d,0,0);return c;
}
function parquet(color,herringbone){
 const c=canvas(1024),ctx=c.getContext('2d');ctx.fillStyle='#51473d';ctx.fillRect(0,0,1024,1024);
 const planks=Array.from({length:12},(_,i)=>surface('wood',color,30+i,256));
 const plank=(x,y,w,h,vertical,id)=>{
  ctx.save();ctx.translate(x,y);if(vertical){ctx.translate(w,0);ctx.rotate(Math.PI/2);[w,h]=[h,w];}
  // Grain follows the long axis of each individual board.
  ctx.save();ctx.translate(w/2,h/2);ctx.rotate(Math.PI/2);ctx.drawImage(planks[id%12],-h/2,-w/2,h,w);ctx.restore();
  ctx.fillStyle='rgba(30,23,17,.24)';ctx.fillRect(0,0,w,1);ctx.fillRect(0,0,1,h);
  ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(1,1,w-2,1);ctx.restore();
 };
 if(herringbone){const a=64,L=4;for(let i=-6;i<8;i++)for(let j=-25;j<25;j++){
  const x=(L*i-j)*a,y=(L*i+j)*a,id=Math.abs(i*13+j*7);
  if(x>-400&&x<1424&&y>-400&&y<1424){plank(x,y,L*a,a,false,id);plank(x+L*a,y,a,L*a,true,id+3);}
 }}else for(let row=-1;row<9;row++)for(let col=-1;col<5;col++)plank(col*512+(row%2)*256,row*128,512,128,false,Math.abs(row*5+col));
 return map(c,[.48,.48]);
}
export function materials(style=interiorStyles[0]){
 const wood=map(surface('wood',style.wood,4),[1,1]),floor=parquet(style.floor,style.floorPattern==='herringbone');
 const fabric=map(surface('linen',style.sofa,5),[2,2]),rug=map(surface('linen',style.rug,7),[4,4]);
 const marble=map(surface('marble',style.id==='graphite'?'#d0cec5':'#ebe7de',6,1024));
 const stone=map(surface('stone',style.tile,8));
 const m={
  wall:new THREE.MeshStandardMaterial({color:style.wall,roughness:.96}),
  floor:new THREE.MeshStandardMaterial({map:floor,roughness:.68}),
  bathFloor:new THREE.MeshStandardMaterial({map:stone,roughness:.64}),
  rug:new THREE.MeshStandardMaterial({map:rug,roughness:1}),
  joinery:new THREE.MeshStandardMaterial({map:wood,roughness:.62}),
  upholstery:new THREE.MeshStandardMaterial({map:fabric,roughness:.96}),
  worktop:new THREE.MeshStandardMaterial({map:marble,roughness:.28}),
  marble:new THREE.MeshStandardMaterial({map:marble,roughness:.3}),
  curtain:new THREE.MeshStandardMaterial({color:0xeee8df,roughness:1,transparent:true,opacity:.83,side:THREE.DoubleSide}),
  bedding:new THREE.MeshStandardMaterial({map:map(surface('linen','#e9e3d9',10)),roughness:1}),
  accent:new THREE.MeshStandardMaterial({color:style.id==='nordic'?0x718a8c:style.id==='japandi'?0x68715c:style.id==='atelier'?0x744b45:0x8c7965,roughness:.92}),
  lacquer:new THREE.MeshStandardMaterial({color:style.wall,roughness:.46}),
  shadow:new THREE.MeshStandardMaterial({color:0x302923,roughness:.85}),
  metal:new THREE.MeshStandardMaterial({color:style.metal,metalness:.68,roughness:.28}),
  glass:new THREE.MeshPhysicalMaterial({color:0xc9dad8,transparent:true,opacity:.17,roughness:.05,metalness:.05,side:THREE.DoubleSide,depthWrite:false}),
  fixture:new THREE.MeshPhysicalMaterial({color:0xf2f0e9,roughness:.17,clearcoat:.45,clearcoatRoughness:.18}),
  screen:new THREE.MeshStandardMaterial({color:0x171d1d,roughness:.21,metalness:.15}),
  lamp:new THREE.MeshStandardMaterial({color:0xffe8bc,emissive:0xffdb91,emissiveIntensity:.55,roughness:.4}),
  line:new THREE.LineBasicMaterial({color:0x504a42,transparent:true,opacity:.15})
 };
 for(const [name,mat] of Object.entries(m))mat.name=name;
 return m;
}
export function disposeMaterials(m){const maps=new Set();for(const mat of Object.values(m)){for(const key of ['map','normalMap','bumpMap','roughnessMap'])if(mat[key])maps.add(mat[key]);mat.dispose();}maps.forEach(t=>t.dispose());}
