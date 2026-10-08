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
// Separate linear-data channels: albedo must never be reused as a normal map.
function reliefMaps(source,repeat,strength=.8,roughness=.7){
 const n=source.width,src=source.getContext('2d').getImageData(0,0,n,n).data;
 const nc=canvas(n),rc=canvas(n),ctx=nc.getContext('2d'),rctx=rc.getContext('2d');
 const normal=ctx.createImageData(n,n),rough=rctx.createImageData(n,n);
 const height=(x,y)=>{const i=(((y+n)%n)*n+(x+n)%n)*4;return(src[i]+src[i+1]+src[i+2])/765;};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const i=(y*n+x)*4,dx=(height(x-1,y)-height(x+1,y))*strength,dy=(height(x,y-1)-height(x,y+1))*strength;
  const len=Math.hypot(dx,dy,1);normal.data[i]=(dx/len*.5+.5)*255;normal.data[i+1]=(dy/len*.5+.5)*255;normal.data[i+2]=(1/len*.5+.5)*255;normal.data[i+3]=255;
  const r=Math.min(1,Math.max(.05,roughness+(height(x,y)-.5)*.19))*255;
  rough.data[i]=rough.data[i+1]=rough.data[i+2]=r;rough.data[i+3]=255;
 }
 ctx.putImageData(normal,0,0);rctx.putImageData(rough,0,0);
 return{normalMap:map(nc,repeat,false),roughnessMap:map(rc,repeat,false),roughness:1};
}
function surface(kind,color,seed=1,size=512){
 const c=canvas(size),ctx=c.getContext('2d'),d=ctx.createImageData(size,size),p=d.data,base=rgb(color);
 if(kind==='wood'&&timber&&seed!==104&&seed<30){ctx.save();ctx.translate(size/2,size/2);ctx.rotate(Math.PI/2);ctx.drawImage(timber,seed>=30?30+(seed%3)*600:1030,seed>=30?18+(seed%7)*128:18,seed>=30?520:780,95,-size/2,-size/2,size,size);ctx.restore();const img=ctx.getImageData(0,0,size,size);let total=0;for(let i=0;i<img.data.length;i+=4)total+=(img.data[i]+img.data[i+1]+img.data[i+2])/3;const mean=total/(size*size);for(let i=0;i<img.data.length;i+=4){const grain=((img.data[i]+img.data[i+1]+img.data[i+2])/3-mean)*(seed>=30?.65:.38);for(let k=0;k<3;k++)img.data[i+k]=Math.max(0,Math.min(255,base[k]+grain));}ctx.putImageData(img,0,0);return c;}
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
  }else if(kind==='travertine'){
   // Mineral layers and sparse micro-cavities; seed-stable and seamless at tile scale.
   const strata=Math.sin((v*29+noise(u*4,v*11,seed+4)*2.2)*Math.PI*2);
   const veins=noise(u*5,v*48,seed+9)-.5;
   const pore=hash(x,y,seed+23)>.995?-31:0;
   delta=(n-.5)*14+strata*7+veins*17+fine*4+pore;
  }else if(kind==='boucle'){
   // Tiny contrasting yarn loops rather than flat fabric noise.
   const loop=Math.sin(x*.30+Math.sin(y*.27))*Math.cos(y*.33+Math.sin(x*.15));
   delta=loop*12+(n-.5)*7+fine*5;
  }else if(kind==='linen')delta=(x%4===0?-5:1)+(y%5===0?-4:1)+fine*10+(n-.5)*3;
  else delta=(n-.5)*(kind==='stone'?12:3)+fine*(kind==='stone'?5:2);
  for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,base[k]+delta));p[i+3]=255;
 }ctx.putImageData(d,0,0);return c;
}
function parquet(color,herringbone){
 const c=canvas(1024),ctx=c.getContext('2d');ctx.fillStyle='#403831';ctx.fillRect(0,0,1024,1024);
 const planks=Array.from({length:12},(_,i)=>surface('wood',color,30+i,256));
 const plank=(x,y,w,h,vertical,id)=>{
  ctx.save();ctx.translate(x,y);if(vertical){ctx.translate(w,0);ctx.rotate(Math.PI/2);[w,h]=[h,w];}
  ctx.save();ctx.translate(w/2,h/2);ctx.rotate(Math.PI/2);ctx.drawImage(planks[id%12],-h/2,-w/2,h,w);ctx.restore();
  ctx.fillStyle='rgba(22,17,14,.25)';ctx.fillRect(0,0,w,1);ctx.fillRect(0,0,1,h);
  ctx.fillStyle='rgba(255,255,255,.10)';ctx.fillRect(1,1,w-2,1);ctx.restore();
 };
 if(herringbone){const a=64,L=4;for(let i=-6;i<8;i++)for(let j=-25;j<25;j++){const x=(L*i-j)*a,y=(L*i+j)*a,id=Math.abs(i*13+j*7);if(x>-400&&x<1424&&y>-400&&y<1424){plank(x,y,L*a,a,false,id);plank(x+L*a,y,a,L*a,true,id+3);}}}
 else for(let row=-1;row<9;row++)for(let col=-1;col<5;col++)plank(col*512+(row%2)*256,row*128,512,128,false,Math.abs(row*5+col));
 return map(c,[.48,.48]);
}
export function materials(style=interiorStyles[0]){
 const warm=style.id==='warm';
 const wood=map(surface('wood',style.wood,style.id==='linen'?104:4,warm?1024:512),[1,1]),floor=parquet(style.floor,style.floorPattern==='herringbone');
 const fabric=map(surface(warm?'boucle':'linen',style.sofa,5,warm?1024:512),[2,2]),rug=map(surface(warm?'boucle':'linen',style.rug,7,warm?1024:512),[4,4]);
 const marbleBase=style.id==='graphite'?'#c6c5c1':style.id==='atelier'?'#ded3c9':'#e4e1da';
 const marble=map(surface(warm?'travertine':style.id==='linen'?'stone':'marble',warm?style.stone:style.id==='linen'?style.stone:marbleBase,6,1024));
 const stone=map(surface(warm?'travertine':'stone',style.tile,8,warm?1024:512));
 const darkStone=map(surface('stone',style.id==='graphite'?'#343636':'#4a403b',17,768),[1.15,1.15]);
 const plaster=map(surface('stone',style.wall,21,512),[3,3]);
 const micro=map(surface('stone','#999999',24,512),[3,3],false);
 const weave=map(surface('linen','#999999',5),[5,5],false);
 const rock=map(surface('stone',style.stone,28,768),[1.5,1.5]);
 const timberRelief=reliefMaps(wood.image,[1,1],warm?1.6:1.3,warm?.71:.57);
 const fabricRelief=reliefMaps(surface(warm?'boucle':'linen','#999999',14,warm?1024:512),[8,8],warm?3.1:2.8,warm?.88:.91);
 const stoneRelief=reliefMaps(surface(warm?'travertine':'stone','#999999',18,warm?1024:512),[2,2],warm?2.0:1.8,warm?.75:.65);
 const cloth=parameters=>new THREE.MeshPhysicalMaterial({...parameters,...fabricRelief,sheen:warm?.62:.45,sheenColor:warm?0xf5e7d3:0xe8dfce,sheenRoughness:.85,side:THREE.DoubleSide});
 const m={
  rock:new THREE.MeshStandardMaterial({map:rock,bumpMap:micro,bumpScale:.004,roughness:.95,side:THREE.DoubleSide}),
  slate:new THREE.MeshStandardMaterial({map:darkStone,bumpMap:micro,bumpScale:.003,roughness:.91,side:THREE.DoubleSide}),
  clay:new THREE.MeshStandardMaterial({color:0xc49d85,bumpMap:micro,bumpScale:.002,roughness:.95}),
  mirror:new THREE.MeshStandardMaterial({color:0xc1c8c6,metalness:1,roughness:.055,envMapIntensity:1.6}),
  wall:new THREE.MeshStandardMaterial({map:plaster,bumpMap:micro,bumpScale:warm?.0028:.0015,roughness:warm?.94:.98}),
  floor:new THREE.MeshStandardMaterial({map:floor,...reliefMaps(floor.image,[.48,.48],1.2,.64)}),
  bathFloor:new THREE.MeshStandardMaterial({map:stone,...(warm?stoneRelief:{}),roughness:warm?1:.62}),
  rug:new THREE.MeshStandardMaterial({map:rug,roughness:1,bumpMap:warm?weave:null,bumpScale:warm?.003:0}),
  joinery:new THREE.MeshPhysicalMaterial({map:wood,...timberRelief,clearcoat:warm?.05:.12,clearcoatRoughness:warm?.82:.48}),
  upholstery:cloth({map:fabric}),
  worktop:new THREE.MeshStandardMaterial({map:marble,...(warm?stoneRelief:{}),roughness:warm?1:.48}),
  marble:new THREE.MeshPhysicalMaterial({map:marble,...stoneRelief,clearcoat:warm?.02:.13,clearcoatRoughness:warm?.90:.4}),
  darkStone:new THREE.MeshPhysicalMaterial({map:darkStone,...stoneRelief,clearcoat:.22,clearcoatRoughness:.28}),
  curtain:new THREE.MeshStandardMaterial({color:0xe7e1d8,roughness:1,transparent:true,opacity:.76,side:THREE.DoubleSide}),
  bedding:cloth({map:map(surface('linen',warm?'#f0e7dd':'#e4ded4',10))}),
  accent:new THREE.MeshStandardMaterial({color:warm?0x796254:style.id==='linen'?0x6e2633:style.id==='japandi'?0x68715c:style.id==='atelier'?0x702c37:0x817267,roughness:.9}),
  olive:cloth({color:0x5f6853}),
  wine:cloth({color:warm?0x966a54:style.id==='linen'?0x80583e:0x672b37}),
  lacquer:new THREE.MeshStandardMaterial({color:style.wall,roughness:warm?.78:.5}),
  shadow:new THREE.MeshStandardMaterial({color:0x211d1b,roughness:.88}),
  metal:new THREE.MeshStandardMaterial({color:style.metal,metalness:.72,roughness:.3}),
  bronze:new THREE.MeshPhysicalMaterial({color:warm?0x9a8064:0x76614b,metalness:.85,roughness:warm?.42:.3,anisotropy:.42,anisotropyRotation:Math.PI/2}),
  glass:new THREE.MeshPhysicalMaterial({color:0xcbd0cc,transparent:true,opacity:.18,roughness:.08,metalness:.03,side:THREE.DoubleSide,depthWrite:false}),
  smokedGlass:new THREE.MeshPhysicalMaterial({color:0x59605d,transparent:true,opacity:.26,roughness:.12,metalness:.08,side:THREE.DoubleSide,depthWrite:false}),
  fixture:new THREE.MeshPhysicalMaterial({color:0xeeeae3,roughness:.18,clearcoat:.4,clearcoatRoughness:.2}),
  screen:new THREE.MeshStandardMaterial({color:0x141718,roughness:.2,metalness:.2}),
  lamp:new THREE.MeshStandardMaterial({color:warm?0xffe9d1:0xffe6bf,emissive:0xffcf89,emissiveIntensity:warm?.55:.7,roughness:.35}),
  line:new THREE.LineBasicMaterial({color:0x49423d,transparent:true,opacity:.13})
 };
 m.wall.userData.organic=style.id==='linen';m.wall.userData.warmModern=warm;
 for(const [name,mat] of Object.entries(m))mat.name=name;
 return m;
}
export function disposeMaterials(m){const maps=new Set();for(const mat of Object.values(m)){for(const key of ['map','normalMap','bumpMap','roughnessMap'])if(mat[key])maps.add(mat[key]);mat.dispose();}maps.forEach(t=>t.dispose());}
