import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {seatPose} from './data.js';
const materials=new Map(),textures=new Map();
function tex(kind){
 if(textures.has(kind))return textures.get(kind);
 const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
 let seed=719;const rnd=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
 g.fillStyle=kind==='oak'?'#d0b18b':'#ddd9cf';g.fillRect(0,0,512,512);
 if(kind==='oak'){
  for(let n=0;n<1400;n++){const x=rnd()*512;g.strokeStyle='rgba(73,45,20,'+(.02+rnd()*.12)+')';g.lineWidth=.25+rnd();g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+Math.sin(x)*7,170,x-Math.cos(x)*8,350,x+Math.sin(x)*4,512);g.stroke()}
 }else if(kind==='linen'){
  for(let n=0;n<512;n+=2){g.strokeStyle=n%4?'rgba(90,75,55,.13)':'rgba(255,255,255,.35)';g.beginPath();g.moveTo(n,0);g.lineTo(n,512);g.stroke();g.beginPath();g.moveTo(0,n);g.lineTo(512,n);g.stroke()}
 }else for(let i=0;i<16000;i++){const b=Math.floor(150+rnd()*100);g.fillStyle='rgba('+b+','+b+','+b+',.16)';g.fillRect(rnd()*512,rnd()*512,rnd()*3+1,1)}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;textures.set(kind,t);return t;
}
export function surface(kind,color='#ffffff'){
 const key=kind+color;if(materials.has(key))return materials.get(key);
 const opts={color,roughness:.6};
 if(['linen','oak','stone','plaster'].includes(kind)){opts.map=tex(kind);opts.bumpMap=opts.map;opts.bumpScale=kind==='linen'?.007:.002;opts.roughness=kind==='oak'?.46:.85}
 if(kind==='linen')Object.assign(opts,{sheen:.5,sheenRoughness:.8,sheenColor:new THREE.Color('#eee5d2')});
 if(kind==='metal')Object.assign(opts,{metalness:.82,roughness:.25});
 if(kind==='ceramic')Object.assign(opts,{roughness:.22,clearcoat:.45});
 const m=new THREE.MeshPhysicalMaterial(opts);m.userData.persistent=true;materials.set(key,m);return m;
}
export function colorMaterial(color){
 if(['#bda68a','#aa937a','#8a7965','#72604b','#b9aa91'].includes(color))return surface('oak',color==='#bda68a'?'#ffffff':'#e3d3b7');
 if(['#ded9c8','#c9c4b0','#b9b09a','#a7ad97','#eee8d9','#bbc4af','#f9f4e8','#8b9a7e','#b38c73'].includes(color))return surface('linen',color);
 if(['#e8e3d8','#d3dedc'].includes(color))return surface('stone',color);
 if(['#eceee7','#f4f2e8','#f5f6ef','#e8e9e1'].includes(color))return surface('ceramic',color);
 if(['#918067','#827461','#75674f','#928064'].includes(color))return surface('metal',color);
 return surface('paint',color);
}
export function roundedGeometry(w,h,d){return new RoundedBoxGeometry(w,h,d,2,Math.min(.055,w*.15,h*.24,d*.15))}
function box(p,x,y,z,w,h,d,m,r=.035){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)),m);o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
function rod(p,a,b,r,m){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),16),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());o.castShadow=true;p.add(o)}
function cyl(p,x,y,z,r,h,m){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,36),m);o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
function ball(p,x,y,z,rx,ry,rz,m){const o=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),m);o.position.set(x,y,z);o.scale.set(rx,ry,rz);o.castShadow=true;p.add(o)}
export function chair(f,items,accent){
 const p=new THREE.Group(),pose=seatPose(f,items);p.position.set(f.x+f.w/2,.03,f.y+f.d/2);p.rotation.y=pose.yaw;
 let W=f.w,D=f.d;const oak=surface('oak'),dark=surface('metal','#49443b'),cloth=surface('linen',accent),cream=surface('linen','#e3ddcd');
 const b=(x,y,z,w,h,d,m=cloth,r=.035)=>box(p,x,y,z,w,h,d,m,r);
 if(pose.kind==='lounge'){
  const span=Math.abs(Math.sin(pose.yaw))+Math.abs(Math.cos(pose.yaw));W=D=Math.min(W,D)/span*.98;
  for(const x of[-W*.34,W*.34])for(const z of[-D*.32,D*.32])rod(p,[x,0,z],[x*.9,.18,z*.9],.02,oak);
  b(0,.15,0,W,.19,D,cloth,.07);b(0,.34,.035,W*.82,.13,D*.8,cream,.06);b(0,.35,-D*.38,W,.4,D*.22,cloth,.065);
  for(const x of[-W*.43,W*.43])b(x,.27,.015,W*.14,.3,D*.88,cloth,.04);
 }else if(pose.kind==='task'){
  cyl(p,0,.07,0,.026,.34,dark);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.sin(a)*W*.43,z=Math.cos(a)*D*.43;rod(p,[0,.12,0],[x,.055,z],.014,dark);ball(p,x,.03,z,.025,.03,.025,dark)}
  b(0,.42,.015,W*.86,.07,D*.8,cloth,.04);rod(p,[0,.3,-D*.3],[0,.65,-D*.35],.015,dark);
  const back=b(0,.52,-D*.34,W*.81,.32,.065,cloth,.03);back.rotation.x=-.12;
  for(const x of[-W*.44,W*.44]){rod(p,[x,.44,0],[x,.61,0],.011,dark);b(x,.61,0,.032,.024,D*.45,dark,.01)}
 }else{
  for(const x of[-W*.35,W*.35])for(const z of[-D*.34,D*.34])rod(p,[x,0,z],[x*.9,.44,z*.9],.017,oak);
  b(0,.43,.015,W*.96,.065,D*.9,cream,.035);
  for(const x of[-W*.35,W*.35])rod(p,[x,.44,-D*.34],[x,.78,-D*.4],.014,oak);
  const back=b(0,.61,-D*.4,W*.97,.19,.06,cloth,.03);back.rotation.x=-.06;
 }
 p.traverse(o=>{if(o.isMesh)o.userData.item=f});return p;
}
function mug(p,x,y,z){const m=surface('ceramic','#e8dfcd');cyl(p,x,y,z,.036,.075,m);cyl(p,x,y+.076,z,.028,.002,surface('paint','#533b25'));const h=new THREE.Mesh(new THREE.TorusGeometry(.023,.006,8,24),m);h.position.set(x+.04,y+.04,z);p.add(h)}
export function details(p,f,W,D,items){
 const oak=surface('oak'),metal=surface('metal','#a69b82'),dark=surface('paint','#35423c');
 const b=(x,y,z,w,h,d,m=oak,r=.01)=>box(p,x,y,z,w,h,d,m,r);
 if(f.type==='desk'){
  b(-.03,f.h+.025,.13,.32,.016,.11,surface('paint','#ddd9cd'),.006);
  for(let i=0;i<9;i++)b(-.16+i*.03,f.h+.043,.13,.022,.002,.08,surface('ceramic','#eeece2'),.001);
  b(.22,f.h+.025,.13,.055,.023,.08,dark,.02);
  cyl(p,-W*.36,f.h,-.12,.075,.012,metal);rod(p,[-W*.36,f.h,-.12],[-W*.36,f.h+.35,-.12],.009,metal);
  const shade=new THREE.Mesh(new THREE.ConeGeometry(.105,.14,32,1,true),surface('linen','#f1dcb6'));shade.position.set(-W*.36,f.h+.33,-.12);p.add(shade);
 }else if(f.id==='table'){
  for(const seat of items.filter(x=>x.seating?.target===f.id)){const z=seat.y<f.y?-D/2+.17:D/2-.17;cyl(p,0,f.h,z,.112,.006,surface('linen','#af9a7c'));cyl(p,0,f.h+.008,z,.09,.009,surface('ceramic','#e9e6dc'));rod(p,[-.14,f.h+.01,z-.06],[-.14,f.h+.01,z+.06],.003,metal)}
 }else if(f.id==='readingtable'||f.id==='coffee'||f.id==='balcoffee'){
  b(0,f.h,0,Math.min(.18,W*.5),.025,Math.min(.23,D*.5),surface('paint','#73806b'));mug(p,W*.25,f.h,-D*.23);
 }else if(f.id==='tv'){
  const side=f.x>2?-1:1;b(0,f.h+.01,0,.15,.018,D*.55,dark);b(0,f.h+.03,0,.022,.39,D*.85,dark);b(side*.013,f.h+.045,0,.003,.36,D*.81,surface('paint','#5b706a'));
 }else if(f.id==='bedside'){
  cyl(p,0,f.h,0,.07,.015,metal);rod(p,[0,f.h,0],[0,f.h+.3,0],.009,metal);const shade=new THREE.Mesh(new THREE.CylinderGeometry(.075,.1,.15,32),surface('linen','#ebddc0'));shade.position.set(0,f.h+.3,0);p.add(shade);
 }
}
export function floorSeams(parent,rooms){
 const coords=[];for(const r of rooms.filter(r=>['main','balcony'].includes(r.id))){
  const inside=(x,y)=>{let c=false;for(let i=0,j=r.poly.length-1;i<r.poly.length;j=i++){const a=r.poly[i],b=r.poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
  const zs=r.poly.map(v=>v[1]),lo=Math.min(...zs),hi=Math.max(...zs);
  for(let x=.18,col=0;x<3.72;x+=.18,col++){for(let z=lo;z<hi;z+=.1)if(inside(x,z+.01))coords.push(x,.032,z,x,.032,Math.min(z+.1,hi));for(let z=lo+(col%3)*.38;z<hi;z+=1.2)if(inside(x-.17,z)&&inside(x-.01,z))coords.push(x-.18,.032,z,x,.032,z)}
 }
 parent.add(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(coords,3)),new THREE.LineBasicMaterial({color:'#8a704f',transparent:true,opacity:.25})));
}
