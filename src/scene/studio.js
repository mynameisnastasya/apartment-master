import * as THREE from 'three';
import {createFurniture} from './furniture.js';
import {createDecor,box} from './build.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

export function roomSpec(layout,name,interior=false){
 const east=layout.partitions.find(o=>o.id==='d-bath-east').x,south=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
 const room=layout.rooms.find(r=>r.id===name);
 let polygon=name==='bath'?[[2440,0],[east,0],[east,south],[2440,south]]:name==='kitchen'?[[0,0],[2320,0],[2320,2750],[0,2750]]:name==='living'?[[0,0],[2320,0],[2320,south+120],[3000,south+120],[3000,4200],[0,4200]]:room?.polygon;
 if(layout.id==='W4'&&['kitchen','living'].includes(name))polygon=[[0,0],[2320,0],[2320,2040],[3175,2040],[3175,3680],[0,3680]];
 if(layout.studioPolygons?.[name])polygon=layout.studioPolygons[name];
 if(!polygon)return null;
 const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]),bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
 const [x,y,x2,y2]=bounds,cx=(x+x2)/2000,cy=(y+y2)/2000;
 const pos=name==='bath'?[cx-3.0,3.3,cy+3.6]:name==='adult'?[cx-4.1,3.8,cy+4.1]:name==='alice'?[cx-5,4.5,cy+5]:[cx+3.3,3.5,cy+3.8];
 const eye={kitchen:[[2.2,1.6,2.65],[.75,1.23,.65]],living:[[2.90,1.6,4.08],[.50,1.22,2.0]],adult:[[.10,1.55,8.13],[3.05,1.28,6.8]],alice:[[3.62,1.55,7.15],[6.1,1.18,5.5]],bath:[[3.56,1.60,1.86],[3.48,1.18,.15]]}[name];
 if(layout.id==='W4'&&name==='dressing')return{polygon,bounds,pos:interior?[1.65,1.60,5.02]:[4.8,4.4,7.0],target:interior?[1.12,1.26,4.00]:[.95,1.25,4.10],name};
 if(layout.id==='W4'&&name==='living')return{polygon,bounds,pos:interior?[2.90,1.60,2.45]:[5.4,4.4,5.8],target:[.85,1.0,3.05],name};
 if(layout.id==='W4'&&name==='kitchen')return{polygon,bounds,pos:interior?[2.90,1.60,3.30]:[5.4,4.4,5.8],target:[1.15,1.1,1.7],name};
 if(interior&&layout.studioViews?.[name])return{polygon,bounds,...layout.studioViews[name],name};
 if(name==='dressing')return{polygon,bounds,pos:interior?[4.99,1.60,3.23]:[2.3,4.2,6.4],target:[5.83,1.25,4.02],name};
 return{polygon,bounds,pos:interior&&eye?eye[0]:pos,target:interior&&eye?eye[1]:[cx,.85,cy],name};
}

export function createStudio(geometry,layout,m,name,{interior=false}={}){
 const spec=roomSpec(layout,name),root=new THREE.Group();root.name='STUDIO_'+name;
 const {polygon,bounds:[x,y,x2,y2]}=spec;
 const shape=new THREE.Shape(polygon.map(([px,py])=>new THREE.Vector2(px/1000,py/1000)));shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false});geo.rotateX(Math.PI/2);
 const floor=new THREE.Mesh(geo,name==='bath'?m.bathFloor:m.floor);floor.receiveShadow=true;root.add(floor);

 if(interior){
  const ceilingGeo=new THREE.ShapeGeometry(shape);ceilingGeo.rotateX(Math.PI/2);
  const ceiling=new THREE.Mesh(ceilingGeo,m.lacquer);ceiling.position.y=geometry.ceilingHeight/1000;
  ceiling.name='interior-ceiling';ceiling.receiveShadow=true;root.add(ceiling);
 }

 const furniture=new THREE.Group();furniture.name='FURNITURE_'+layout.id;root.add(furniture);
 for(const o of layout.furniture){
  if(((layout.id==='W4'||layout.familyDesign)&&['kitchen','living'].includes(name)&&o.room==='living')||o.room===name||(['kitchen','living'].includes(name)&&o.room==='kitchen')||(name==='living'&&o.room==='living'))furniture.add(createFurniture(o,m));
 }

 const walls=new THREE.Group();walls.name='WALLS';root.add(walls);
 if(name==='dressing'&&layout.id==='W4'){
  box(walls,m.wall,-80,3800,80,1500,2700,0,'studio-west');
  box(walls,m.wall,0,3680,2325,120,2700,0,'studio-north');
  box(walls,m.wall,2325,3680,850,120,600,2100,'studio-north-lintel');
  if(interior){
   box(walls,m.wall,3175,3800,120,1500,2700,0,'studio-east');
   box(walls,m.wall,0,5300,2325,120,2700,0,'studio-south');
   box(walls,m.wall,2325,5300,850,120,600,2100,'studio-south-lintel');
   box(walls,m.joinery,2325,3800,40,850,2100,0,'gallery-open-door');
  }
  const light=new THREE.PointLight(0xffe1b1,8,4,2);light.position.set(1.65,2.35,4.70);root.add(light);
 }else if(name==='dressing'){
  if(['L','M','N'].includes(layout.id)){
   // Stay congruent with L's real partitions when the walkable hall neck
   // and the dressing room size change. Do not render old hard-coded W4 walls.
   const left=layout.partitions.find(o=>o.id==='l-dressing-west');
   const north=layout.partitions.find(o=>o.id==='l-dressing-north-right');
   const south=layout.partitions.find(o=>o.id==='l-dressing-south');
   const lintel=layout.partitions.find(o=>o.id==='l-dressing-door-lintel');
   const floorY=layout.rooms.find(r=>r.id==='dressing').polygon[0][1];
   box(walls,m.wall,left.x,left.y,left.width,left.depth,2700,0,'studio-dressing-west');
   box(walls,m.wall,6400,floorY,120,south.y-floorY,2700,0,'studio-dressing-east');
   box(walls,m.joinery,south.x,south.y,south.width,south.depth,2700,0,'studio-dressing-south');
   box(walls,m.wall,north.x,north.y,north.width,north.depth,2700,0,'studio-dressing-north');
   box(walls,m.wall,lintel.x,lintel.y,lintel.width,lintel.depth,lintel.height,lintel.elevation,'studio-dressing-door-lintel');
  }else{
   box(walls,m.wall,6400,3120,120,1500,2700,0,'studio-east');
   box(walls,m.joinery,4660,4620,1740,120,2700,0,'studio-south');
   box(walls,m.wall,4540,3120,120,1500,2700,0,'studio-west');
  }
  const light=new THREE.PointLight(0xffe1b1,8,4,2);light.position.set(5.4,2.35,3.8);root.add(light);
 }else if(name==='bath'){
  box(walls,m.wall.userData.organic?m.slate:m.marble,x-80,y-80,x2-x+160,80,2450,0,'studio-north');
  box(walls,m.wall.userData.organic?m.slate:m.marble,x2,y,80,y2-y,2450,0,'studio-east');
  box(walls,m.bathFloor,x-80,y,80,y2-y,2450,0,'studio-west');
  box(walls,m.bronze,x-25,y+12,x2-x+50,6,7,950,'bath-bronze-datum');
 }else if(['kitchen','living'].includes(name)){
  if(layout.familyDesign&&interior){
   box(walls,m.wall,0,4640,2325,120,2700,0,'studio-lounge-back');
   box(walls,m.wall,2325,4640,850,120,600,2100,'studio-adult-lintel');
  }
  if(layout.id==='W4'&&interior){
   box(walls,m.wall,0,3680,2325,120,2700,0,'studio-lounge-back');
   box(walls,m.wall,2325,3680,850,120,600,2100,'studio-gallery-lintel');
  }
  box(walls,m.wall,-90,-90,2500,90,2650,0,'studio-north');
  box(walls,m.wall,-90,0,90,y2,2650,0,'studio-west');
  box(walls,m.marble,0,0,1668,10,650,860,'studio-backsplash-n');
  box(walls,m.marble,0,8,10,1790,650,860,'studio-backsplash-w');

  box(walls,m.lacquer,0,0,1665,318,770,1730,'kitchen-upper-wall');
  box(walls,m.joinery,0,302,1665,24,42,1698,'kitchen-upper-walnut-datum');
  box(walls,m.shadow,1115,304,3,10,700,1762,'kitchen-upper-reveal');
  box(walls,m.darkStone,620,300,455,20,360,1805,'kitchen-hood-recess');
  box(walls,m.bronze,644,322,407,5,6,1785,'kitchen-hood-bronze-line');
  box(walls,m.lamp,22,329,1620,6,6,1678,'kitchen-task-light');
 }else{
  for(let i=0;i<polygon.length;i++){
   const a=polygon[i],b=polygon[(i+1)%polygon.length];const dx=b[0]-a[0],dy=b[1]-a[1];
   if(Math.abs(dx)<1&&a[0]>=x2-20)box(walls,m.wall,a[0],Math.min(a[1],b[1]),80,Math.abs(dy),2600,0,'studio-east');
   if(Math.abs(dy)<1&&a[1]<=y+150){
    const lo=Math.min(a[0],b[0]),hi=Math.max(a[0],b[0]),door=layout.doors.find(d=>d.axis==='x'&&Math.abs(d.y-a[1])<150&&d.x<hi&&d.x+d.width>lo);
    if(door){
     if(door.x>lo)box(walls,m.wall,lo,a[1]-80,door.x-lo,80,2600);
     if(door.x+door.width<hi)box(walls,m.wall,door.x+door.width,a[1]-80,hi-door.x-door.width,80,2600);
     if(layout.optimizationStudy&&['adult','alice'].includes(name)){
      box(walls,m.glass,door.x,a[1]-45,door.width,26,560,2120,'studio-borrowed-light-transom');
      box(walls,m.joinery,door.x,a[1]-50,door.width,29,18,2112,'studio-transom-frame');
     }
    }else box(walls,m.wall,lo,a[1]-80,hi-lo,80,2600);
   }
  }
  const bed=layout.furniture.find(o=>o.room===name&&o.type==='bed');
  if(bed){const bx=bed.x+bed.width/2,bz=bed.y+bed.depth/2;
   const margin=['L','M','N'].includes(layout.id)?140:0;
   const rugX=['L','M','N'].includes(layout.id)?Math.max(x+margin,Math.min(bx-1200,x2-2400-margin)):bx-1300;
   const rugY=['L','M','N'].includes(layout.id)?Math.max(y+margin,Math.min(bz-900,y2-1780-margin)):bz-900;
   const rug=box(root,m.rug,rugX,rugY,['L','M','N'].includes(layout.id)?Math.min(2400,x2-x-2*margin):2400,['L','M','N'].includes(layout.id)?1780:1850,12,1,'room-rug');rug.castShadow=false;
  }
 }

 // The room camera must show the actual façade openings, including L's
 // adult bedroom. Previously L interiors ended in blank walls without windows.
 // Keep the opening position and sill tied to the shared measured/assumed shell.
 if((layout.familyDesign&&name==='alice')||(['L','M','N'].includes(layout.id)&&['alice','adult'].includes(name))){
  const win=geometry.windows.find(w=>w.id==='window-'+name);
  const wy=name==='adult'?8300:7440;
  const left=name==='adult'?0:3425,right=name==='adult'?3175:6400;
  const head=geometry.ceilingHeight-win.sill-win.height;
  box(walls,m.wall,left,wy,right-left,100,win.sill,0,'studio-window-apron');
  if(win.x>left)box(walls,m.wall,left,wy,win.x-left,100,win.height,win.sill,'studio-window-left');
  const after=win.x+win.width;
  if(after<right)box(walls,m.wall,after,wy,right-after,100,win.height,win.sill,'studio-window-right');
  if(head>0)box(walls,m.wall,win.x,wy,win.width,100,head,win.sill+win.height,'studio-window-head');
  box(walls,m.glass,win.x,wy+20,win.width,14,win.height,win.sill,layout.familyDesign&&name==='alice'?'alice-window-glass':'studio-window-glass');
  for(let i=0;i<=3;i++)box(walls,m.worktop,win.x+i*win.width/3-10,wy-12,20,35,win.height,win.sill,'studio-window-frame');
  for(const z of [win.sill,win.sill+win.height-25])box(walls,m.worktop,win.x,wy-12,win.width,35,25,z,'studio-window-frame');
  box(walls,m.joinery,win.x-12,wy-20,win.width+24,132,24,win.sill-24,'studio-window-sill');
  if(['L','M','N'].includes(layout.id)&&m.wall.userData.warmModern){
   // Soft sky bounce from the REAL window into the interior. The area emitter
   // stays just inside the glazing, not in a phantom ceiling light panel.
   const daylight=new THREE.RectAreaLight(0xfff5e6,3.4,Math.min(2.25,win.width/1000*.86),1.28);
   daylight.name='studio-window-daylight';
   daylight.position.set((win.x+win.width/2)/1000,1.56,(wy-55)/1000);
   daylight.lookAt((win.x+win.width/2)/1000,1.20,(wy-1350)/1000);
   root.add(daylight);
  }
  if(layout.familyDesign&&name==='alice')box(walls,m.curtain,win.x-15,wy-28,win.width+30,25,300,win.sill+win.height-260,'alice-roman-blind');
 }
 const decor=createDecor(layout,m);
 if((['I','J','K'].includes(layout.id)||layout.familyDesign)&&name==='alice'){
  box(walls,m.wall,4540,3640,120,1100,2700,0,'studio-dressing-return');
  box(walls,m.wall,4660,4620,1740,120,2700,0,'studio-dressing-front');
 }
 const inside=(px,py)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])hit=!hit;
 }return hit;};
 for(const c of [...decor.children]){
  // Lights have no mesh bounds: Box3.setFromObject(light) is empty.
  // Use their world position so the pendant contributes illumination to
  // the studio scene, instead of just showing a glowing geometry.
  if(c.isLight){
   if(inside(c.position.x*1000,c.position.z*1000))root.add(c);
   continue;
  }
  const bounds=new THREE.Box3().setFromObject(c);
  if(bounds.isEmpty())continue;
  const cx=(bounds.min.x+bounds.max.x)*500,cy=(bounds.min.z+bounds.max.z)*500;
  if(inside(cx,cy))root.add(c);
 }
 // Room views get actual planar reflections; the full apartment/export retains PBR mirrors.
 const mirrors=[];root.traverse(o=>{if(o.name==='mirror-face')mirrors.push(o);});
 for(const face of mirrors){
  const {width,height}=face.geometry.parameters;
  if(!width||!height)continue;
  const reflection=new Reflector(new THREE.PlaneGeometry(width-.045,height-.045),{color:0xc7cbc8,textureWidth:512,textureHeight:512,clipBias:.003});
  reflection.name='optical-mirror';reflection.position.z=.014;
  const update=reflection.onBeforeRender;
  reflection.onBeforeRender=function(renderer,scene,...args){if(!scene.overrideMaterial)update.call(this,renderer,scene,...args);};
  face.add(reflection);
 }
 if(interior){
  // Complete the visible room shell above existing walls, preserving all plan openings.
  for(const wall of [...walls.children]){
   if(!wall.name.startsWith('studio-')||wall.name.startsWith('studio-window-'))continue;
   const p=wall.geometry.parameters;if(!p?.height)continue;
   const top=wall.position.y+p.height/2,remaining=geometry.ceilingHeight/1000-top;
   if(remaining<=0)continue;
   const infill=new THREE.Mesh(new THREE.BoxGeometry(p.width,remaining,p.depth),wall.material);
   infill.position.set(wall.position.x,top+remaining/2,wall.position.z);infill.name='ceiling-wall-junction';walls.add(infill);
  }
 }
 return root;
}
