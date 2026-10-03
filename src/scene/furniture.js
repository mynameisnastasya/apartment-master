import * as THREE from 'three';
import {liveEdgeSlab} from './organic.js';
import {cushion,drape} from './textiles.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
const M=v=>v/1000;
function mesh(parent,geometry,material,x,y,z){const o=new THREE.Mesh(geometry,material);o.position.set(M(x),M(z),M(y));o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function box(g,m,x,y,w,d,h,e=0,r=0){return mesh(g,r?new RoundedBoxGeometry(M(w),M(h),M(d),3,M(Math.min(r,w/3,d/3,h/3))):new THREE.BoxGeometry(M(w),M(h),M(d)),m,x+w/2,y+d/2,e+h/2);}
function cylinder(g,m,x,y,e,r,h,rt=r){return mesh(g,new THREE.CylinderGeometry(M(rt),M(r),M(h),32),m,x,y,e+h/2);}
function tube(g,m,points,r=8){const curve=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>new THREE.Vector3(M(x),M(z),M(y))));const o=new THREE.Mesh(new THREE.TubeGeometry(curve,24,M(r),8,false),m);o.castShadow=true;g.add(o);return o;}
function outline(w,d,r){const pts=[];for(const [cx,cy,start] of [[w/2-r,d/2-r,0],[-w/2+r,d/2-r,90],[-w/2+r,-d/2+r,180],[w/2-r,-d/2+r,270]])for(let i=0;i<24;i++){const a=(start+i/23*90)*Math.PI/180;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return pts;}
function vessel(g,m,x,y,w,d,e,h,inset=50,radius=100){
 const rings=[{w:w*.80,d:d*.86,r:radius*.7,z:e},{w,d,r:radius,z:e+h-14},{w,d,r:radius,z:e+h},{w:w-inset*2,d:d-inset*2,r:radius*.8,z:e+h},{w:w-inset*2-70,d:d-inset*2-100,r:radius*.7,z:e+65}];
 const vs=[],uv=[],idx=[],N=96;for(const ring of rings)for(const [px,py] of outline(ring.w,ring.d,Math.min(ring.r,ring.w/2-1,ring.d/2-1))){vs.push(M(x+w/2+px),M(ring.z),M(y+d/2+py));uv.push(px/w+.5,py/d+.5);}
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<N;i++){const a=k*N+i,b=k*N+(i+1)%N,c=(k+1)*N+(i+1)%N,d=(k+1)*N+i;idx.push(a,c,b,a,d,c);}
 const center=vs.length/3;vs.push(M(x+w/2),M(e+65),M(y+d/2));uv.push(.5,.5);for(let i=0;i<N;i++)idx.push(center,4*N+(i+1)%N,4*N+i);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const o=new THREE.Mesh(geo,m);o.castShadow=o.receiveShadow=true;g.add(o);return o;
}
function tap(g,m,x,y,e,front='south',height=230){const dx=front==='east'?120:0,dy=front==='south'?120:0;tube(g,m,[[x,y,e],[x,y,e+height-40],[x+dx*.25,y+dy*.25,e+height],[x+dx,y+dy,e+height],[x+dx,y+dy,e+height-35]],9);cylinder(g,m,x+40,y,e+20,11,55);}
export function createFurniture(o,m){
 const g=new THREE.Group();g.name=o.id;g.userData={...o,category:'furniture'};
 const {x,y,width:w,depth:d,height:h}=o,e=o.elevation||0;
 const organic=m.wall.userData.organic;
 const slab=(mat,xx,yy,ww,dd,hh,ee,name)=>liveEdgeSlab(g,mat,M(xx),M(yy),M(ww),M(dd),M(hh),M(ee),name);
 const b=(mat,xx,yy,ww,dd,hh,ee=0,r=0)=>box(g,mat,xx,yy,ww,dd,hh,ee,r);
 const front=o.front||'south';
 const face=(mat,inset,z,fw,fh,thickness=18,offset=0)=>{
  const finish=mesh=>{mesh.castShadow=false;mesh.receiveShadow=false;return mesh;};
  if(front==='east'||front==='west')return finish(b(mat,front==='east'?x+w-thickness-offset:x+offset,y+inset,thickness,fw,fh,z));
  return finish(b(mat,x+inset,front==='south'?y+d-thickness-offset:y+offset,fw,thickness,fh,z));
 };
 const facade=(height=h-95,start=e+80,paint=false)=>{
  const span=front==='east'||front==='west'?d:w,count=Math.max(1,Math.ceil(span/850)),step=span/count;
  for(let i=0;i<count;i++){
   face(paint?m.lacquer:m.joinery,i*step+3,start,step-6,height,18,0);
   face(m.shadow,i*step+7,start+8,2,height-16,2,-1);
  }
 };
 const cabinet=()=>{b(m.shadow,x+24,y+24,w-48,d-48,58,e);b(m.joinery,x+4,y+4,w-8,d-8,h-86,e+58,10);facade(h-110,e+66);};
 if(o.type==='dressing-rack'){
  // Open, east-backed millwork: two 750 mm bays, clothes stay inside the footprint.
  b(m.joinery,x+w-20,y,20,d,h,0);b(m.joinery,x,y,w,20,h,0);b(m.joinery,x,y+d-20,w,20,h,0);
  b(m.joinery,x,y+d/2-10,w,20,h,0);b(m.joinery,x,y,w,d,28,70);b(m.joinery,x,y,w,d,28,h-28);
  b(m.joinery,x,y,w,d,24,2120);
  for(const [start,end,z] of [[30,720,1920],[780,1470,1920],[780,1470,960]]){
   tube(g,m.bronze,[[x+300,y+start,z],[x+300,y+end,z]],12);
   for(let k=0;k<5;k++){
    const yy=y+start+65+k*(end-start-130)/4;
    tube(g,m.bronze,[[x+90,yy,z-100],[x+300,yy,z-15],[x+510,yy,z-100],[x+90,yy,z-100]],5);
    const length=start<100?1230:660;
    const cloth=b(k%3===0?m.olive:k%3===1?m.bedding:m.wine,x+95,yy-14,410,28,length,z-100-length,12);cloth.name='dressing-hanging-clothes';
   }
  }
  for(const yy of [y+24,y+d-30])b(m.lamp,x+20,yy,8,6,1990,110,2);
  for(let k=0;k<2;k++)b(m.upholstery,x+55,y+80+k*750,470,560,160,2180,12);
 }
 else if(o.type==='dressing-shelves'){
  b(m.joinery,x,y+d-18,w,18,h,0);
  for(const xx of [x,x+w/2-9,x+w-18])b(m.joinery,xx,y,18,d,h,0);
  for(const z of [60,330,600,870,h-24])b(m.joinery,x,y,w,d,24,z);
  for(let k=0;k<4;k++){
   b(m.olive,x+80+(k%2)*550,y+35,360,250,160,90+Math.floor(k/2)*540,18);
   b(m.bronze,x+240+(k%2)*550,y+25,40,12,8,155+Math.floor(k/2)*540,3);
  }
 }
 else if(o.type==='bed'){
  b(m.shadow,x+50,y+70,w-100,d-120,68,48,22);
  b(m.upholstery,x+18,y+26,w-36,d-52,165,102,32);
  const mw=o.mattress[0],md=o.mattress[1],mx=x+(w-mw)/2,my=y+(d-md)/2;
  b(m.bedding,mx,my,mw,md,170,290,42);
  const duvet=drape(g,m.bedding,{x:M(mx+mw/2),z:M(my+md/2+220),width:M(mw+24),depth:M(md-400),height:.535,drop:.105,name:'duvet-sculpted-folds'});
  const n=mw>1100?2:1;for(let i=0;i<n;i++){const pw=(mw-150)/n;const pillow=cushion(g,m.bedding,M(mx+60+i*(mw-120)/n+pw/2),M(my+250),M(pw),.40,.15,.525,{seed:i+2});pillow.rotation.y=(i?-.045:.045);}
  if(mw>1100){const cushion=b(m.wine,mx+610,my+330,330,150,255,566,55);cushion.rotation.y=-.06;}
  else{const cushion=b(m.olive,mx+300,my+345,300,140,220,560,48);cushion.rotation.y=.08;}
  drape(g,mw>1100?m.olive:m.wine,{x:M(mx+mw/2),z:M(my+md-390),width:M(mw+30),depth:.47,height:.558,drop:.10,seed:3,name:'woven-bed-runner',support:duvet.userData.surfaceHeight});
 }
 else if(o.id.startsWith('adult-nightstand')){
  // Bedside function is absorbed into the headboard composition: a thin floating ledge, not a box.
  b(m.shadow,x+22,y+22,w-44,d-44,18,500,10);
  b(organic?m.joinery:m.marble,x+6,y+6,w-12,d-12,36,522,10);
  b(m.bronze,x+w-18,y+24,7,d-48,6,510,2);
 }
 else if(o.type==='sofa'){
  b(m.shadow,x+40,y+35,w-80,d-70,62,72,28);
  b(m.upholstery,x+10,y+12,w-20,d-24,215,120,58);
  const n=w>1350?3:2,seatW=(w-92)/n;
  for(let i=0;i<n;i++){
   cushion(g,m.upholstery,M(x+38+i*seatW+(seatW-12)/2),M(y+34+(d-205)/2),M(seatW-12),M(d-205),.125,.370,{seed:i});
   cushion(g,m.upholstery,M(x+38+i*seatW+(seatW-12)/2),M(y+d-105),M(seatW-16),.38,.17,.575,{upright:true,seed:i+5});
  }
  b(m.upholstery,x+8,y+50,120,d-95,330,248,52);b(m.upholstery,x+w-128,y+50,120,d-95,330,248,52);
  const p=cushion(g,m.wine,M(x+270),M(y+d-275),.28,.28,.12,.575,{upright:true,seed:4});p.rotation.z=-.14;
  const q=cushion(g,m.bedding,M(x+w-295),M(y+d-270),.26,.25,.11,.56,{upright:true,seed:7});q.rotation.z=.13;
 }
 else if(['chair','stool'].includes(o.type)){
  const seat=o.type==='stool'?650:435;
  for(const xx of[x+55,x+w-55])for(const yy of[y+55,y+d-55])cylinder(g,m.bronze,xx,yy,0,11,seat,15);
  if(o.type==='stool')tube(g,m.bronze,[[x+55,y+55,240],[x+55,y+d-55,240],[x+w-55,y+d-55,240],[x+w-55,y+55,240]],7);
  b(o.type==='stool'?m.wine:m.upholstery,x+12,y+12,w-24,d-24,68,seat,28);
  const f=front;const back=b(m.joinery,f==='west'?x+w-42:x+10,f==='north'?y+d-42:y+10,['east','west'].includes(f)?30:w-20,['north','south'].includes(f)?30:d-20,h-seat-80,seat+68,14);
  if(['east','west'].includes(f))b(o.type==='stool'?m.wine:m.upholstery,f==='west'?x+w-55:x+41,y+34,18,d-68,170,seat+116,9);
  else b(o.type==='stool'?m.wine:m.upholstery,x+34,f==='north'?y+d-55:y+41,w-68,18,170,seat+116,9);
 }
 else if(o.type==='vanity'){
  b(m.joinery,x,y,w,d,32,h-32,14);
  b(m.lacquer,x+10,y+12,w-20,d-24,105,h-137,12);
  b(m.bronze,x+w-9,y+54,5,d-108,5,h-88,2);
 }
 else if(o.type==='toy-storage'){
  b(m.joinery,x,y,w,d,30,0,10);b(m.joinery,x,y,w,d,34,h-34,10);
  b(m.joinery,x,y,24,d,h,0);b(m.joinery,x+w-24,y,24,d,h,0);
  b(m.joinery,x,y+d/2-12,w,24,h-56,32);b(m.joinery,x,y,w,d,18,h/2-9);
 }
 else if(o.type==='desk'){
  b(m.joinery,x,y,w,d,34,h-34,10);
  b(m.bronze,x+28,y+35,16,d-70,h-44,0,5);b(m.bronze,x+w-44,y+35,16,d-70,h-44,0,5);
 }
 else if(o.type==='bar'&&organic){
  b(m.marble,x+4,y+4,w-8,d-8,62,h-62,120);
  b(m.darkStone,x+70,y+65,240,d-130,h-120,58,95);
  b(m.joinery,x+335,y+100,w-420,d-200,95,h-164,24);
  b(m.shadow,x+94,y+89,194,d-178,24,34,40);
  b(m.bronze,x+344,y+d-106,w-440,5,5,h-169,1);
 }
 else if(o.type==='bar'){
  b(m.shadow,x+38,y+38,w-76,d-76,44,32,20);
  b(m.marble,x,y,w,d,64,h-64,34);
  b(m.marble,x+10,y+12,190,d-24,h-116,52,30);
  b(m.joinery,x+210,y+92,w-265,d-184,110,h-174,28);
  b(m.bronze,x+218,y+100,w-281,12,8,h-192,2);
  b(m.darkStone,x+210,y+d-86,w-258,42,26,h-122,10);
 }
 else if(o.type==='tub'){
  vessel(g,m.fixture,x,y,w,d,70,h-70,62,160);
  cylinder(g,m.darkStone,x+w/2,y+300,139,23,3);tap(g,m.bronze,x+w-60,y+150,h,'south',160);
  tube(g,m.bronze,[[x+w-28,y+400,1050],[x+w-28,y+400,1990],[x+w-140,y+400,2080],[x+w-300,y+400,2080]],9);
  cylinder(g,m.bronze,x+w-300,y+400,2055,95,10);
  b(m.smokedGlass,x+4,y+12,8,570,1450,h);b(m.bronze,x+4,y+12,10,9,1450,h);
 }
 else if(o.type==='wc'){
  b(m.lacquer,x+3,y+12,145,d-24,1000,0);
  b(m.bronze,x+149,y+d/2-90,5,180,95,830,3);
  vessel(g,m.fixture,x+155,y+55,w-180,d-110,165,240,30,150);
  const seat=new THREE.Mesh(new THREE.TorusGeometry(.158,.022,10,64),m.fixture);seat.rotation.x=Math.PI/2;seat.scale.set(1.18,.88,1);seat.position.set(M(x+370),.421,M(y+d/2));g.add(seat);
 }
 else if(o.type==='basin'&&organic){
  b(m.joinery,x+18,y+8,w-36,d-16,395,350,26);
  b(m.shadow,x+24,y+d-20,w-48,6,8,541,1);
  slab(m.joinery,x,y,w,d,48,750,'bath-live-edge-counter');
  vessel(g,m.darkStone,x+70,y+45,w-140,d-85,794,112,22,95);
  tap(g,m.bronze,x+w*.52,y+26,805,'south',210);
 }
 else if(['sink','basin'].includes(o.type)){
  b(m.shadow,x+26,y+26,w-52,d-52,42,e+92,16);b(o.type==='basin'?m.joinery:m.lacquer,x+5,y+5,w-10,d-10,h-130,e+120,14);
  const bx=x+w*.16,by=y+d*.19,bw=w*.68,bd=d*.63;
  b(m.marble,x,y,w,by-y,28,h-28);b(m.marble,x,by+bd,w,y+d-by-bd,28,h-28);b(m.marble,x,by,bx-x,bd,28,h-28);b(m.marble,bx+bw,by,x+w-bx-bw,bd,28,h-28);
  vessel(g,o.type==='basin'?m.fixture:m.darkStone,bx,by,bw,bd,h-150,155,18,42);
  cylinder(g,m.metal,bx+bw/2,by+bd/2,h-82,18,3);tap(g,m.bronze,x+w*.53,y+45,h,'south',190);
 }
 else if(o.type==='washer'){
  b(m.shadow,x+12,y+12,w-24,d-24,h-22,10,10);
  b(m.lacquer,x+3,y+3,w-6,d-6,h,0,12);
  face(m.shadow,18,70,w-36,h-138,3,-2);
  face(m.bronze,w-34,h*.47,6,135,5,-8);
  if(organic)slab(m.joinery,x,y,w,d,35,h,'laundry-oak-counter');else b(m.marble,x-3,y-2,w+6,d+4,24,h,5);
 }
 else if(['wardrobe','storage','upper','fridge'].includes(o.type)){
  const mat=o.id==='hall-wardrobe'?m.joinery:m.lacquer;
  b(m.shadow,x+20,y+20,w-40,d-40,48,e+8,12);
  b(mat,x+3,y+3,w-6,d-6,h-54,e+54,10);
  if(organic&&o.type==='wardrobe'){b(m.joinery,x+3,y+3,w-6,d-6,120,e+h,6);face(m.joinery,0,e+54,24,h-54,21,-2);}
  const span=front==='east'||front==='west'?d:w,count=Math.max(1,Math.ceil(span/900)),step=span/count;
  for(let i=1;i<count;i++)face(m.shadow,i*step-1,e+85,2,h-130,2,-2);
  if(o.type==='wardrobe'&&o.id!=='hall-wardrobe')face(m.joinery,Math.max(14,span-34),e+110,14,h-180,7,-5);
  if(o.type==='fridge')face(m.shadow,12,e+730,(front==='east'||front==='west'?d:w)-24,3,3,-2);
 }
 else if(o.type==='shelf'){
  b(m.joinery,x,y,w,18,h,0);for(let z=0;z<h;z+=315)b(m.joinery,x,y,w,d,18,z);
  b(m.joinery,x,y,18,d,h,0);b(m.joinery,x+w-18,y,18,d,h,0);
 }
 else if(o.type==='media'&&organic){
  b(m.shadow,x+30,y+25,w-60,d-50,220,150,14);
  b(m.smokedGlass,x+w-10,y+32,8,d-64,200,161,4);
  slab(m.joinery,x+3,y+3,w-6,d-6,38,370,'floating-media-slab');
 }
 else if(o.type==='media'){
  b(m.shadow,x+26,y+34,w-18,d-68,56,214,18);
  b(m.darkStone,x+5,y+8,w-10,d-16,92,258,16);
  b(m.marble,x+2,y+3,w-4,d-6,22,350,7);
  b(m.bronze,x+w-14,y+60,8,d-120,7,292,2);
 }
 else if(o.type==='tv'){const mount=organic?80:0;b(m.shadow,x+mount,y,w,d,h,e,9);b(m.screen,x+mount+w-2,y+12,4,d-24,h-24,e+12,2);}
 else if(o.type==='mirror'){
  b(m.bronze,x,y,w,d,h,e,5);
  if(o.id==='dressing-mirror'){
   const face=new THREE.Mesh(new THREE.PlaneGeometry(M(d-24),M(h-24)),m.mirror);
   face.rotation.y=Math.PI/2;face.position.set(M(x+w+2),M(e+h/2),M(y+d/2));face.name='mirror-face';g.add(face);
   for(const yy of [y-4,y+d])b(m.lamp,x+w,yy,5,5,h,e,1);
  }else b(m.glass,x+w,y+12,2,d-24,h-24,e+12);
 }
 else {
  cabinet();b(m.marble,x,y,w,d,28,h-28,5);
  const span=['east','west'].includes(front)?d:w;
  face(m.shadow,8,h-48,span-16,12,4,-2);
  if(o.type==='base')for(const level of [340,610]){
   face(m.shadow,6,level,span-12,3,3,-2);
   face(m.bronze,span*.18,level+10,span*.64,4,5,-4);
  }
  if(o.type==='hob'){
   b(m.screen,x+35,y+50,w-70,d-95,7,h,5);
   for(const xx of[x+w*.28,x+w*.7])for(const yy of[y+d*.3,y+d*.68]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.073,.0018,6,48),m.bronze);ring.rotation.x=Math.PI/2;ring.position.set(M(xx),M(h+9),M(yy));g.add(ring);}
   if(o.oven!==false){face(m.screen,35,180,w-70,415,22,-3);face(m.bronze,65,515,w-130,12,10,-16);}
  }
 }
 if(o.rotation){const cx=M(x+w/2),cz=M(y+d/2);for(const c of g.children){c.position.x-=cx;c.position.z-=cz;}g.position.set(cx,0,cz);g.rotation.y=-THREE.MathUtils.degToRad(o.rotation);}
 g.traverse(c=>{if(c.isMesh)c.userData={id:o.id};});return g;
}
