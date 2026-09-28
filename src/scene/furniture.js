import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const M=v=>v/1000;
function mesh(parent,geometry,material,x,y,z){const o=new THREE.Mesh(geometry,material);o.position.set(M(x),M(z),M(y));o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(g,m,x,y,w,d,h,e=0,r=0){return mesh(g,r?new RoundedBoxGeometry(M(w),M(h),M(d),2,M(Math.min(r,w/3,d/3,h/3))):new THREE.BoxGeometry(M(w),M(h),M(d)),m,x+w/2,y+d/2,e+h/2);}
function cylinder(g,m,x,y,e,r,h,rt=r){return mesh(g,new THREE.CylinderGeometry(M(rt),M(r),M(h),32),m,x,y,e+h/2);}
function tube(g,m,points,r=8){const curve=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>new THREE.Vector3(M(x),M(z),M(y))));const o=new THREE.Mesh(new THREE.TubeGeometry(curve,24,M(r),8,false),m);o.castShadow=true;g.add(o);return o;}
function outline(w,d,r){const pts=[];for(const [cx,cy,start] of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,90],[-w/2+r,-d/2+r,180],[w/2-r,-d/2+r,270]])for(let i=0;i<12;i++){const a=(start+i/11*90)*Math.PI/180;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
// A closed shell with a genuine inner basin, including sloped sides and a low bowl floor.
function vessel(g,m,x,y,w,d,e,h,inset=50,radius=100){
 const rings=[{w:w*.80,d:d*.86,r:radius*.7,z:e},{w,d,r:radius,z:e+h-14},{w,d,r:radius,z:e+h},{w:w-inset*2,d:d-inset*2,r:radius*.8,z:e+h},{w:w-inset*2-70,d:d-inset*2-100,r:radius*.7,z:e+65}];
 const vs=[],uv=[],idx=[],N=48;for(const ring of rings)for(const [px,py] of outline(ring.w,ring.d,Math.min(ring.r,ring.w/2-1,ring.d/2-1))){vs.push(M(x+w/2+px),M(ring.z),M(y+d/2+py));uv.push(px/w+.5,py/d+.5);}
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<N;i++){const a=k*N+i,b=k*N+(i+1)%N,c=(k+1)*N+(i+1)%N,d=(k+1)*N+i;idx.push(a,c,b,a,d,c);}
 const center=vs.length/3;vs.push(M(x+w/2),M(e+65),M(y+d/2));uv.push(.5,.5);for(let i=0;i<N;i++)idx.push(center,4*N+(i+1)%N,4*N+i);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const o=new THREE.Mesh(geo,m);o.material=m;o.castShadow=o.receiveShadow=true;g.add(o);return o;
}
function tap(g,m,x,y,e,front='south',height=230){const dx=front==='east'?120:0,dy=front==='south'?120:0;tube(g,m,[[x,y,e],[x,y,e+height-40],[x+dx*.25,y+dy*.25,e+height],[x+dx,y+dy,e+height],[x+dx,y+dy,e+height-35]],9);cylinder(g,m,x+40,y,e+20,11,55);}
export function createFurniture(o,m){
 const g=new THREE.Group();g.name=o.id;g.userData={...o,category:'furniture'};
 const {x,y,width:w,depth:d,height:h}=o,e=o.elevation||0;
 const b=(mat,xx,yy,ww,dd,hh,ee=0,r=0)=>box(g,mat,xx,yy,ww,dd,hh,ee,r);
 const front=o.front||'south';
 const face=(mat,inset,z,fw,fh,thickness=18,offset=0)=>{
  if(front==='east'||front==='west')return b(mat,front==='east'?x+w-thickness-offset:x+offset,y+inset,thickness,fw,fh,z);
  return b(mat,x+inset,front==='south'?y+d-thickness-offset:y+offset,fw,thickness,fh,z);
 };
 const facade=(height=h-95,start=e+80,paint=false)=>{
  const span=front==='east'||front==='west'?d:w,count=Math.max(1,Math.round(span/520)),step=span/count;
  for(let i=0;i<count;i++){
   face(paint?m.lacquer:m.joinery,i*step+3,start,step-6,height,19,0);
   face(m.shadow,i*step+14,start+12,step-28,height-24,2,-1);
   face(paint?m.lacquer:m.joinery,i*step+17,start+15,step-34,height-30,5,-2);
   face(m.metal,i*step+step-44,start+Math.max(80,height*.44),7,Math.min(150,height*.3),7,-9);
  }
 };
 const cabinet=()=>{b(m.shadow,x+28,y+28,w-56,d-56,85,e);b(m.joinery,x+5,y+5,18,d-10,h-115,e+85);b(m.joinery,x+w-23,y+5,18,d-10,h-115,e+85);b(m.joinery,x+23,y+5,w-46,18,h-115,e+85);b(m.joinery,x+23,y+d-23,w-46,18,h-115,e+85);b(m.joinery,x+5,y+5,w-10,d-10,18,e+85);facade(h-118,e+88);};
 if(o.type==='bed'){
  b(m.joinery,x+22,y+22,w-44,d-44,165,100,15);b(m.upholstery,x+12,y+22,w-24,d-44,85,265,22);
  b(m.upholstery,x+8,y+12,w-16,95,840,0,30);
  for(let i=1;i<4;i++)b(m.shadow,x+i*w/4,y+102,2,3,540,220);
  const mw=o.mattress[0],md=o.mattress[1],mx=x+(w-mw)/2,my=y+(d-md)/2;
  b(m.bedding,mx,my,mw,md,175,340,38);
  // The duvet has a soft crown and small uneven folds rather than a flat slab.
  const duvet=b(m.bedding,mx-10,my+480,mw+20,md-505,100,490,35);
  const a=duvet.geometry.attributes.position;for(let i=0;i<a.count;i++){const px=a.getX(i),py=a.getY(i),pz=a.getZ(i);if(py>0)a.setY(i,py+Math.sin(px*31+pz*4)*.005+Math.sin(pz*14)*.004);}a.needsUpdate=true;duvet.geometry.computeVertexNormals();
  const n=mw>1100?2:1;for(let i=0;i<n;i++){const pillow=b(m.bedding,mx+50+i*(mw-100)/n,my+90,(mw-140)/n,350,125,510,42);pillow.rotation.y=(i?-.05:.035);}
  const cloth=new THREE.PlaneGeometry(M(mw+24),.43,36,18);const cp=cloth.attributes.position;for(let i=0;i<cp.count;i++){const xx=cp.getX(i),yy=cp.getY(i),edge=Math.pow(Math.abs(xx)/(M(mw+24)/2),10);cp.setXYZ(i,xx,.605-edge*.1+Math.sin(xx*35+yy*9)*.009+Math.sin(yy*27)*.006,-yy);}cloth.computeVertexNormals();const throwMesh=new THREE.Mesh(cloth,m.accent);throwMesh.position.set(M(mx+mw/2),0,M(my+md-405));throwMesh.castShadow=throwMesh.receiveShadow=true;g.add(throwMesh);
 }
 else if(o.type==='sofa'){
  for(const xx of[x+80,x+w-100])for(const yy of[y+80,y+d-100])cylinder(g,m.metal,xx,yy,0,15,145);
  b(m.upholstery,x+8,y+8,w-16,d-16,230,130,45);
  b(m.upholstery,x+15,y+d-180,w-30,165,550,245,50);
  b(m.upholstery,x+5,y+25,130,d-40,350,230,40);b(m.upholstery,x+w-135,y+25,130,d-40,350,230,40);
  const n=w>1350?3:2;for(let i=0;i<n;i++){
   b(m.upholstery,x+140+i*(w-280)/n,y+25,(w-290)/n,d-215,125,350,35);
   const back=b(m.upholstery,x+140+i*(w-280)/n,y+d-215,(w-295)/n,135,325,470,40);back.rotation.x=-.10;
  }
  const p=b(m.accent,x+160,y+d-320,270,120,265,470,45);p.rotation.z=-.12;
  const q=b(m.bedding,x+w-430,y+d-330,240,100,240,465,42);q.rotation.z=.15;
 }
 else if(['chair','stool'].includes(o.type)){
  const seat=o.type==='stool'?650:435;
  for(const xx of[x+55,x+w-55])for(const yy of[y+55,y+d-55])cylinder(g,m.joinery,xx,yy,0,12,seat,16);
  b(m.upholstery,x+12,y+12,w-24,d-24,68,seat,25);
  const f=front;const back=b(m.joinery,f==='west'?x+w-45:x+12,f==='north'?y+d-45:y+12,['east','west'].includes(f)?32:w-24,['north','south'].includes(f)?32:d-24,h-seat-80,seat+70,10);
  if(['east','west'].includes(f))b(m.upholstery,f==='west'?x+w-58:x+43,y+35,20,d-70,170,seat+120,7);
  else b(m.upholstery,x+35,f==='north'?y+d-58:y+43,w-70,20,170,seat+120,7);
 }
 else if(['desk','bar'].includes(o.type)){
  b(o.type==='bar'?m.marble:m.joinery,x,y,w,d,30,h-30,8);
  if(o.type==='bar'){
   b(m.joinery,x+35,y+40,140,d-80,h-35,0,8);
   for(let i=0;i<8;i++)b(m.joinery,x+174,y+45+i*(d-100)/8,8,12,h-55,5,3);
  }else for(const xx of[x+40,x+w-65])for(const yy of[y+45,y+d-65])cylinder(g,m.metal,xx,yy,0,13,h-35);
 }
 else if(o.type==='tub'){
  vessel(g,m.fixture,x,y,w,d,70,h-70,62,160);
  cylinder(g,m.metal,x+w/2,y+300,139,23,3);tap(g,m.metal,x+w-60,y+150,h,'south',160);
  tube(g,m.metal,[[x+w-28,y+400,1050],[x+w-28,y+400,1990],[x+w-140,y+400,2080],[x+w-300,y+400,2080]],9);
  cylinder(g,m.metal,x+w-300,y+400,2055,95,10);
  b(m.glass,x+4,y+12,8,570,1450,h);
  b(m.metal,x+4,y+12,10,9,1450,h);
 }
 else if(o.type==='wc'){
  b(m.lacquer,x+3,y+12,145,d-24,1000,0);
  b(m.metal,x+149,y+d/2-90,5,180,95,830,3);
  b(m.shadow,x+152,y+d/2-26,2,52,40,858,1);
  vessel(g,m.fixture,x+155,y+55,w-180,d-110,165,240,30,150);
  const seat=new THREE.Mesh(new THREE.TorusGeometry(.158,.022,10,64),m.fixture);seat.rotation.x=Math.PI/2;seat.scale.set(1.18,.88,1);seat.position.set(M(x+370),.421,M(y+d/2));g.add(seat);
 }
 else if(['sink','basin'].includes(o.type)){
  cabinet();
  // Countertop perimeter leaves a real opening into the bowl.
  const bx=x+w*.16,by=y+d*.19,bw=w*.68,bd=d*.63;
  b(m.marble,x,y,w,by-y,25,h-25);b(m.marble,x,by+bd,w,y+d-by-bd,25,h-25);b(m.marble,x,by,bx-x,bd,25,h-25);b(m.marble,bx+bw,by,x+w-bx-bw,bd,25,h-25);
  vessel(g,o.type==='basin'?m.fixture:m.metal,bx,by,bw,bd,h-150,155,18,42);
  cylinder(g,m.metal,bx+bw/2,by+bd/2,h-82,18,3);
  tap(g,m.metal,x+w*.53,y+45,h,'south',190);
 }
 else if(o.type==='washer'){
  b(m.lacquer,x+4,y+4,w-8,d-8,h,0,12);
  b(m.lacquer,x+15,y+d-14,w-30,15,115,h-130,3);
  const drum=(mat,r,z,thick)=>{const c=cylinder(g,mat,x+w/2,y+d+z,0,r,thick);c.rotation.x=Math.PI/2;c.position.y=.46;return c;};
  drum(m.metal,205,0,15);drum(m.shadow,172,12,12);drum(m.glass,143,21,5);
  b(m.screen,x+w-220,y+d-18,145,20,42,h-90,4);
  const knob=cylinder(g,m.metal,x+w*.47,y+d+5,0,23,15);knob.rotation.x=Math.PI/2;knob.position.y=M(h-65);
  b(m.marble,x-3,y-2,w+6,d+4,25,h,4);
 }
 else if(['wardrobe','storage','upper','fridge'].includes(o.type)){
  b(m.joinery,x+3,y+3,w-6,d-6,h-55,e+55);b(m.shadow,x+25,y+25,w-50,d-50,55,e);facade(h-80,e+65,true);
  if(o.type==='fridge')face(m.shadow,10,730,w-20,3,3,-2);
 }
 else if(o.type==='shelf'){
  b(m.joinery,x,y,w,22,h,0);for(let z=0;z<h;z+=300)b(m.joinery,x,y,w,d,22,z);
  b(m.joinery,x,y,20,d,h,0);b(m.joinery,x+w-20,y,20,d,h,0);
 }
 else if(o.type==='tv'){
  b(m.shadow,x,y,w,d,h,e,8);b(m.screen,x+w-2,y+12,4,d-24,h-24,e+12,1);
 }
 else if(o.type==='mirror'){b(m.metal,x,y,w,d,h,e,6);b(m.glass,x+w,y+12,2,d-24,h-24,e+12);}
 else {
  cabinet();b(m.marble,x,y,w,d,30,h-30,4);
  if(o.type==='hob'){
   b(m.screen,x+35,y+50,w-70,d-95,7,h,4);
   for(const xx of[x+w*.28,x+w*.7])for(const yy of[y+d*.3,y+d*.68]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.073,.0018,6,48),m.metal);ring.rotation.x=Math.PI/2;ring.position.set(M(xx),M(h+9),M(yy));g.add(ring);}
   if(o.oven!==false){face(m.screen,35,180,w-70,415,22,-3);face(m.metal,65,515,w-130,16,12,-16);}
  }
 }
 if(o.rotation){const cx=M(x+w/2),cz=M(y+d/2);for(const c of g.children){c.position.x-=cx;c.position.z-=cz;}g.position.set(cx,0,cz);g.rotation.y=-THREE.MathUtils.degToRad(o.rotation);}
 g.traverse(c=>{if(c.isMesh)c.userData={id:o.id};});return g;
}
