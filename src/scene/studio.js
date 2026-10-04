import * as THREE from 'three';
import {createFurniture} from './furniture.js';
import {createDecor,box} from './build.js';
import {Reflector} from 'three/addons/objects/Reflector.js';

export function roomSpec(layout,name,interior=false){
 const east=layout.partitions.find(o=>o.id==='d-bath-east').x,south=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
 const room=layout.rooms.find(r=>r.id===name);
 let polygon=name==='bath'?[[2440,0],[east,0],[east,south],[2440,south]]:name==='kitchen'?[[0,0],[2320,0],[2320,2750],[0,2750]]:name==='living'?[[0,0],[2320,0],[2320,south+120],[3000,south+120],[3000,4200],[0,4200]]:room?.polygon;
 if(layout.id==='W4'&&['kitchen','living'].includes(name))polygon=[[0,0],[2320,0],[2320,2040],[3175,2040],[3175,3680],[0,3680]];
 if(!polygon)return null;
 const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]),bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
 const [x,y,x2,y2]=bounds,cx=(x+x2)/2000,cy=(y+y2)/2000;
 const pos=name==='bath'?[cx-3.0,3.3,cy+3.6]:name==='adult'?[cx-4.1,3.8,cy+4.1]:name==='alice'?[cx-5,4.5,cy+5]:[cx+3.3,3.5,cy+3.8];
 const eye={kitchen:[[2.2,1.6,2.65],[.75,1.23,.65]],living:[[2.90,1.6,4.08],[.50,1.22,2.0]],adult:[[.10,1.55,8.13],[3.05,1.28,6.8]],alice:[[3.62,1.55,7.15],[6.1,1.18,5.5]],bath:[[3.56,1.60,1.86],[3.48,1.18,.15]]}[name];
 if(layout.id==='W4'&&name==='dressing')return{polygon,bounds,pos:interior?[2.79,1.60,4.88]:[4.8,4.4,7.0],target:[.95,1.25,4.10],name};
 if(layout.id==='W4'&&['kitchen','living'].includes(name))return{polygon,bounds,pos:interior?[2.90,1.60,3.30]:[5.4,4.4,5.8],target:[1.15,1.1,1.7],name};
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
  if(o.room===name||(['kitchen','living'].includes(name)&&o.room==='kitchen')||(name==='living'&&o.room==='living'))furniture.add(createFurniture(o,m));
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
  box(walls,m.wall,6400,3120,120,1500,2700,0,'studio-east');
  box(walls,m.joinery,4660,4620,1740,120,2700,0,'studio-south');
  box(walls,m.wall,4540,3120,120,1500,2700,0,'studio-west');
  const light=new THREE.PointLight(0xffe1b1,8,4,2);light.position.set(5.4,2.35,3.8);root.add(light);
 }else if(name==='bath'){
  box(walls,m.wall.userData.organic?m.slate:m.marble,x-80,y-80,x2-x+160,80,2450,0,'studio-north');
  box(walls,m.wall.userData.organic?m.slate:m.marble,x2,y,80,y2-y,2450,0,'studio-east');
  box(walls,m.bathFloor,x-80,y,80,y2-y,2450,0,'studio-west');
  box(walls,m.bronze,x-25,y+12,x2-x+50,6,7,950,'bath-bronze-datum');
 }else if(['kitchen','living'].includes(name)){
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
    }else box(walls,m.wall,lo,a[1]-80,hi-lo,80,2600);
   }
  }
  const bed=layout.furniture.find(o=>o.room===name&&o.type==='bed');
  if(bed){const bx=bed.x+bed.width/2,bz=bed.y+bed.depth/2;
   const rug=box(root,m.rug,bx-1300,bz-900,2400,1850,12,1,'room-rug');rug.castShadow=false;
  }
 }

 const decor=createDecor(layout,m);
 if(layout.id==='I'&&name==='alice'){
  box(walls,m.wall,4540,3640,120,1100,2700,0,'studio-dressing-return');
  box(walls,m.wall,4660,4620,1740,120,2700,0,'studio-dressing-front');
 }
 const inside=(px,py)=>{let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];if((a[1]>py)!==(b[1]>py)&&px<(b[0]-a[0])*(py-a[1])/(b[1]-a[1])+a[0])hit=!hit;
 }return hit;};
 for(const c of [...decor.children]){
  const bounds=new THREE.Box3().setFromObject(c),cx=(bounds.min.x+bounds.max.x)*500,cy=(bounds.min.z+bounds.max.z)*500;
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
   if(!wall.name.startsWith('studio-'))continue;
   const p=wall.geometry.parameters;if(!p?.height)continue;
   const top=wall.position.y+p.height/2,remaining=geometry.ceilingHeight/1000-top;
   if(remaining<=0)continue;
   const infill=new THREE.Mesh(new THREE.BoxGeometry(p.width,remaining,p.depth),wall.material);
   infill.position.set(wall.position.x,top+remaining/2,wall.position.z);infill.name='ceiling-wall-junction';walls.add(infill);
  }
 }
 return root;
}
