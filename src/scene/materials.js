import * as THREE from 'three';
import {interiorStyles} from '../data/interior-styles.js';

const hash=(x,y,s=1)=>{let n=Math.imul(x+s*37,374761393)+Math.imul(y+s*101,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function texture(kind,color,seed=1,pattern='oak'){
 const size=1024,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),base=rgb(color),data=ctx.createImageData(size,size),p=data.data;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,noise=(hash(x,y,seed)-.5),soft=Math.sin(x*.013+y*.018+seed)*2+Math.sin(x*.031-y*.025)*1.8;
  let variation=soft+noise*8;
  if(kind==='wood'){
   const board=Math.floor(x/128),offset=(board%2)*256,along=(y+offset)%512;
   variation=(hash(board,Math.floor((y+offset)/512),seed)-.5)*21
    +5*Math.sin(x*.16+4*Math.sin(y*.012+board)+Math.sin(y*.052)*1.5)
    +2.3*Math.sin(x*.43+y*.003)+noise*8;
   const knot=Math.hypot((x%128-48)*1.7,(along-260)*.45);
   if(knot<17&&hash(board,Math.floor((y+offset)/512),seed+9)>.7)variation-=Math.max(0,17-knot)*.56;
  }else if(kind==='marble'||kind==='stone')variation=soft*2+Math.sin(x*.009+y*.006+Math.sin(y*.017)*2+seed)*3+noise*9;
  else if(['fabric','rug','curtain'].includes(kind))variation=((x%7)<2?6:-1)+((y%8)<2?4:-1)+noise*13+soft;
  else if(kind==='tile')variation=soft*2+noise*12;
  for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,base[k]+variation));p[i+3]=255;
 }
 ctx.putImageData(data,0,0);
 if(kind==='wood'){
  const plank=(x,y,w,h)=>{ctx.fillStyle='rgba(34,21,10,.22)';ctx.fillRect(x,y,w,1.7);ctx.fillRect(x,y,1.5,h);ctx.fillStyle='rgba(255,244,217,.18)';ctx.fillRect(x+3,y+3,1,h-5);};
  if(pattern==='herringbone'){
   ctx.save();ctx.translate(512,512);ctx.rotate(Math.PI/4);
   for(let row=-8;row<9;row++)for(let col=-8;col<9;col++){const px=col*112+(row%2)*56,py=row*112;plank(px,py,112,52);plank(px+56,py+55,112,52);}ctx.restore();
  }else for(let col=0;col<8;col++)for(let row=-1;row<4;row++)plank(col*128,row*512+(col%2)*256,128,512);
 }
 if(kind==='tile'){
  ctx.strokeStyle='rgba(95,89,80,.36)';ctx.lineWidth=5;
  for(let n=0;n<=4;n++){ctx.beginPath();ctx.moveTo(n*256,0);ctx.lineTo(n*256,size);ctx.moveTo(0,n*256);ctx.lineTo(size,n*256);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1;
  for(let n=0;n<4;n++)ctx.strokeRect(n*256+5,5,246,1014);
 }
 if(kind==='marble'||kind==='stone')for(let n=0;n<(kind==='marble'?20:8);n++){
  const y=hash(n,7,seed)*size,x=hash(n,3,seed)*size;
  ctx.beginPath();ctx.moveTo(x-290,y-120);ctx.bezierCurveTo(x-110,y+160,x+35,y-120,x+240,y+95);ctx.bezierCurveTo(x+350,y+190,x+500,y-10,x+750,y+175);
  ctx.lineWidth=kind==='marble'?hash(n,11,seed)*4+.8:1.4;
  ctx.strokeStyle=kind==='marble'?'rgba(58,53,50,.26)':'rgba(107,87,70,.16)';ctx.stroke();
  if(kind==='marble')for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(x-150+j*18,y-80+j*25);ctx.bezierCurveTo(x+30,y+190+j*14,x+230,y-130+j*18,x+460,y+170+j*14);ctx.lineWidth=.6;ctx.strokeStyle='rgba(96,72,62,.19)';ctx.stroke();}
 }
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;return map;
}
export function materials(style=interiorStyles[0]){
 const wall=texture('wall',style.wall,2),floor=texture('wood',style.floor,3,style.floorPattern),wood=texture('wood',style.wood,4);
 const fabric=texture('fabric',style.sofa,5),stone=texture('stone',style.stone,6);
 const marble=texture('marble',style.id==='graphite'?'#bdbbb6':'#e5dfd3',12);
 const rug=texture('rug',style.rug,7),tile=texture('tile',style.tile,8);
 const curtain=texture('curtain',style.id==='graphite'?'#c7beb0':'#ebe5db',17);
 floor.repeat.set(1.6,1.6);wall.repeat.set(2,1);rug.repeat.set(2,2);
 return{
  wall:new THREE.MeshStandardMaterial({map:wall,roughness:.95}),
  floor:new THREE.MeshStandardMaterial({map:floor,roughness:.7,bumpMap:floor,bumpScale:.012}),
  bathFloor:new THREE.MeshStandardMaterial({map:tile,roughness:.54,bumpMap:tile,bumpScale:.006}),
  rug:new THREE.MeshStandardMaterial({map:rug,roughness:1,bumpMap:rug,bumpScale:.018}),
  joinery:new THREE.MeshStandardMaterial({map:wood,roughness:.68,bumpMap:wood,bumpScale:.006}),
  upholstery:new THREE.MeshStandardMaterial({map:fabric,roughness:1,bumpMap:fabric,bumpScale:.009}),
  worktop:new THREE.MeshStandardMaterial({map:stone,roughness:.32,metalness:.015}),
  marble:new THREE.MeshStandardMaterial({map:marble,roughness:.33,metalness:.015}),
  curtain:new THREE.MeshStandardMaterial({map:curtain,roughness:1,transparent:true,opacity:.88,side:THREE.DoubleSide}),
  bedding:new THREE.MeshStandardMaterial({color:0xeee9df,roughness:1}),
  shadow:new THREE.MeshStandardMaterial({color:0x302923,roughness:1}),
  metal:new THREE.MeshStandardMaterial({color:style.metal,metalness:.72,roughness:.26}),
  glass:new THREE.MeshPhysicalMaterial({color:0xe2eeed,transparent:true,opacity:.2,roughness:.08,metalness:.04,side:THREE.DoubleSide,depthWrite:false}),
  fixture:new THREE.MeshStandardMaterial({color:0xf6f4ee,roughness:.22}),
  screen:new THREE.MeshStandardMaterial({color:0x202625,roughness:.24}),
  line:new THREE.LineBasicMaterial({color:style.metal,transparent:true,opacity:.17})
 };
}
export function disposeMaterials(m){const textures=new Set();for(const material of Object.values(m)){for(const key of ['map','bumpMap','normalMap'])if(material[key])textures.add(material[key]);material.dispose();}for(const t of textures)t.dispose();}
