import * as THREE from 'three';
import {interiorStyles} from '../data/interior-styles.js';

const hash=(x,y,seed=1)=>{let n=Math.imul(x+seed*37,374761393)+Math.imul(y+seed*101,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
function texture(kind,color,seed=1,pattern='oak'){
 const size=512,canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,size,size);
 const rgb=new THREE.Color(color),base=[rgb.r,rgb.g,rgb.b].map(v=>Math.round(THREE.MathUtils.linearToSRGB(v)*255));
 const pixels=ctx.getImageData(0,0,size,size),p=pixels.data;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,grain=kind==='wood'?Math.sin(x*.13+Math.sin(y*.035+seed)*3)*4+Math.sin(x*.55+y*.008)*2:0;
  const weave=kind==='fabric'||kind==='rug'?(x%5===0?5:0)+(y%7===0?4:0):0;
  const cloud=kind==='stone'||kind==='tile'?Math.sin(x*.019+y*.011+seed)*3+Math.sin(x*.041-y*.024)*2:0;
  const noise=(hash(x,y,seed)-.5)*(kind==='wall'?13:kind==='wood'?11:kind==='fabric'?17:kind==='rug'?21:kind==='stone'?15:9);
  for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,base[k]+noise+grain+weave+cloud));
 }
 ctx.putImageData(pixels,0,0);
 if(kind==='wood'){
  ctx.strokeStyle='rgba(43,31,20,.22)';ctx.lineWidth=2;
  if(pattern==='herringbone')for(let y=-150;y<650;y+=128)for(let x=-150;x<650;x+=128){ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.strokeRect(0,0,180,63);ctx.strokeRect(0,64,180,63);ctx.restore();}
  else for(let x=0;x<=size;x+=128){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,size);ctx.stroke();for(let y=(x/128%2)*128;y<size;y+=256){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+128,y);ctx.stroke();}}
 }
 if(kind==='tile'){ctx.strokeStyle='rgba(90,83,75,.32)';ctx.lineWidth=5;for(let x=0;x<=size;x+=256){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,size);ctx.stroke();}for(let y=0;y<=size;y+=256){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y);ctx.stroke();}}
 if(kind==='stone'){ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=2;for(let n=0;n<11;n++){const y=hash(n,7,seed)*size;ctx.beginPath();ctx.moveTo(-20,y);ctx.bezierCurveTo(140,y+26,340,y-18,530,y+38);ctx.stroke();}}
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;return map;
}

export function materials(style=interiorStyles[0]){
 const wall=texture('wall',style.wall,2),floor=texture('wood',style.floor,3,style.floorPattern),wood=texture('wood',style.wood,4),fabric=texture('fabric',style.sofa,5),stone=texture('stone',style.stone,6),rug=texture('rug',style.rug,7),tile=texture('tile',style.tile,8);
 floor.repeat.set(1.1,1.1);wall.repeat.set(2,1);rug.repeat.set(2,2);
 return{
 wall:new THREE.MeshStandardMaterial({map:wall,roughness:.93}),floor:new THREE.MeshStandardMaterial({map:floor,roughness:.78}),
 bathFloor:new THREE.MeshStandardMaterial({map:tile,roughness:.58}),rug:new THREE.MeshStandardMaterial({map:rug,roughness:1}),
 joinery:new THREE.MeshStandardMaterial({map:wood,roughness:.66}),upholstery:new THREE.MeshStandardMaterial({map:fabric,roughness:1}),
 worktop:new THREE.MeshStandardMaterial({map:stone,roughness:.38,metalness:.02}),metal:new THREE.MeshStandardMaterial({color:style.metal,metalness:.58,roughness:.34}),
 glass:new THREE.MeshPhysicalMaterial({color:0xe2eeed,transparent:true,opacity:.24,roughness:.08,metalness:.04,side:THREE.DoubleSide}),
 fixture:new THREE.MeshStandardMaterial({color:0xf6f4ee,roughness:.22}),screen:new THREE.MeshStandardMaterial({color:0x202625,roughness:.24}),
 line:new THREE.LineBasicMaterial({color:style.metal,transparent:true,opacity:.13})
 };
}
export function disposeMaterials(m){for(const material of Object.values(m)){material.map?.dispose();material.dispose();}}
