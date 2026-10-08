import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mm} from '../data/model.js';

export function box(parent,m,x,y,w,d,h,e=0,name='',rotation=0){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(mm(w),mm(h),mm(d)),m);
 mesh.position.set(mm(x+w/2),mm(e+h/2),mm(y+d/2));mesh.rotation.y=-THREE.MathUtils.degToRad(rotation||0);
 mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function softBox(parent,m,x,y,w,d,h,e,r=25){
 const mesh=new THREE.Mesh(new RoundedBoxGeometry(mm(w),mm(h),mm(d),3,mm(Math.min(r,h/3,w/5,d/5))),m);
 mesh.position.set(mm(x+w/2),mm(e+h/2),mm(y+d/2));mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function lineBox(mesh,m){const l=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,35),m);mesh.add(l);}
export {createFurniture} from './furniture.js';
import {createSignatureDecor} from './signature-decor.js';

export function createArchitecture(geometry,layout,m,{cut=true,plan=false,walls=true,doorsOpen=true}={}){
 const root=new THREE.Group();root.name='APARTMENT_GEOMETRY';
 const shape=new THREE.Shape();geometry.floor.forEach(([x,y],i)=>i?shape.lineTo(mm(x),mm(y)):shape.moveTo(mm(x),mm(y)));shape.closePath();
 const floorGeo=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false});floorGeo.rotateX(Math.PI/2);
 const floor=new THREE.Mesh(floorGeo,m.floor);floor.name='floor';floor.receiveShadow=true;root.add(floor);

 if(!plan){
  const bathEast=layout.partitions.find(o=>o.id==='d-bath-east').x;
  const bathSouth=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
  const bathFloor=box(root,m.bathFloor,2440,0,bathEast-2440,bathSouth,10,1,'bath-floor');bathFloor.castShadow=false;
  const sofa=layout.furniture.find(o=>o.id==='sofa');
  if(sofa){const livingRug=['L','M','N'].includes(layout.id)?softBox(root,m.rug,120,2680,2420,1010,8,3,120):layout.familyDesign?softBox(root,m.rug,sofa.x+30,sofa.y-600,sofa.width-60,1400,8,3,120):layout.id==='W4'?softBox(root,m.rug,100,2600,1960,1060,8,3,120):softBox(root,m.rug,360,sofa.y+70,1910,1130,8,3,120);livingRug.name='living-rug';livingRug.castShadow=false;}
 }

 const wallGroup=new THREE.Group();wallGroup.name='WALLS';root.add(wallGroup);wallGroup.visible=walls;
 for(const o of [...geometry.walls,...layout.partitions]){
  const max=plan?100:cut?1050:geometry.ceilingHeight;const elev=o.elevation||0;if(elev>=max)continue;
  const mesh=box(wallGroup,m.wall,o.x,o.y,o.width,o.depth,Math.min(o.height,max-elev),elev,o.id,o.rotation||0);lineBox(mesh,m.line);
 }

 if(walls&&!plan){
  const bathEast=layout.partitions.find(o=>o.id==='d-bath-east').x;
  const bathSouth=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
  const height=cut?1040:2350;
  box(wallGroup,m.wall.userData.organic?m.slate:m.marble,2440,7,bathEast-2440,8,height,0,'bath-slab-north');
  box(wallGroup,m.wall.userData.organic?m.slate:m.marble,bathEast-8,10,8,bathSouth-30,height,0,'bath-slab-east');
  box(wallGroup,m.bathFloor,2440,15,8,bathSouth-35,height,0,'bath-mineral-west');

  box(wallGroup,m.marble,0,5,1665,10,cut?150:650,860,'kitchen-stone-field');
  box(wallGroup,m.marble,8,0,10,1800,cut?150:650,860,'kitchen-side-stone');

  if(!cut){
   // One calm upper volume with a recessed hood: architecture, not a row of floating boxes.
   box(wallGroup,m.lacquer,0,0,1665,318,770,1730,'kitchen-upper-wall');
   box(wallGroup,m.joinery,0,302,1665,24,42,1698,'kitchen-upper-walnut-datum');
   box(wallGroup,m.shadow,1115,304,3,10,700,1762,'kitchen-upper-reveal');
   box(wallGroup,m.darkStone,620,300,455,20,360,1805,'kitchen-hood-recess');
   box(wallGroup,m.bronze,644,322,407,5,6,1785,'kitchen-hood-bronze-line');
   box(wallGroup,m.lamp,22,329,1620,6,6,1678,'kitchen-task-light');
  }
 }

 if(walls&&!plan){
  for(const win of geometry.windows){
   const gh=cut?Math.min(win.height,1050-win.sill):win.height;
   if(gh>0){
    box(wallGroup,m.glass,win.x,win.y,win.width,20,gh,win.sill,win.id);
    for(let i=0;i<=3;i++)box(wallGroup,m.worktop,win.x+i*win.width/3,win.y-10,25,40,gh,win.sill);
    box(wallGroup,m.worktop,win.x,win.y-10,win.width,40,25,win.sill);
   }
  }
 }

 if(walls&&!plan&&!cut)for(const win of geometry.windows){
  if(layout.familyDesign&&win.id==='window-alice'){
   box(wallGroup,m.curtain,win.x,win.y-70,win.width,30,340,2160,'alice-roman-blind');
   for(let i=0;i<4;i++)box(wallGroup,m.bedding,win.x,win.y-75,win.width,8,8,2175+i*75,'roman-blind-fold');
   continue;
  }
  const curtainY=win.y-92;
  box(wallGroup,m.bronze,win.x-100,curtainY-14,win.width+200,10,10,2510,'curtain-rail');
  const geo=new THREE.PlaneGeometry(mm(win.width+120),2.23,104,12),p=geo.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*43)*.025+Math.sin(p.getY(i)*2.3)*.010);
  geo.computeVertexNormals();
  const sheer=new THREE.Mesh(geo,m.curtain);sheer.position.set(mm(win.x+win.width/2),1.36,mm(curtainY));sheer.castShadow=false;wallGroup.add(sheer);
 }

 const doorGroup=new THREE.Group();doorGroup.name='DOORS';root.add(doorGroup);
 for(const d of[geometry.entry,...layout.doors]){
  const op=doorsOpen?{x:d.openX,y:d.openY,w:d.openWidth,dep:d.openDepth}:{x:d.x,y:d.y,w:d.axis==='x'?d.width:40,dep:d.axis==='y'?d.width:40};
  const dh=plan?30:cut?900:2100;
  const mat=d.id==='entry'?m.joinery:(d.id==='door-bath'?m.lacquer:m.joinery);
  box(doorGroup,mat,op.x,op.y,op.w,op.dep,dh,0,d.id,(doorsOpen?d.openRotation:d.rotation)||0);
 }
 return root;
}

const paper=new THREE.MeshStandardMaterial({color:0xe9e1d6,roughness:1});
export function createDecor(layout,m){
 const group=new THREE.Group();group.name='DECOR';
 const furniture=id=>layout.furniture.find(o=>o.id===id);
 const cylinder=(material,x,y,e,r,height,segments=24)=>{
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,height,segments),material);
  mesh.position.set(mm(x),mm(e)+height/2,mm(y));mesh.castShadow=true;group.add(mesh);return mesh;
 };

 const wc=furniture('wc'),tub=furniture('bath-tub');
 if(wc){
  box(group,m.bronze,wc.x+145,wc.y+wc.depth-80,95,18,10,675,'paper-holder');
  const roll=cylinder(paper,wc.x+190,wc.y+wc.depth-70,650,.052,.105);roll.rotation.z=Math.PI/2;
 }
 if(tub){
  box(group,m.bronze,tub.x+tub.width-85,520,14,430,18,930,'towel-rail');
  box(group,m.upholstery,tub.x+tub.width-104,565,30,330,320,610,'bath-towel');
 }

 const dining=furniture('dining');
 if(dining){
  cylinder(m.smokedGlass,dining.x+dining.width*.72,dining.y+dining.depth*.42,dining.height+18,.042,.17,28);
  cylinder(m.fixture,dining.x+dining.width*.82,dining.y+dining.depth*.42,dining.height+18,.032,.09,28);
 }

 for(const detail of [...createSignatureDecor(layout,m).children])group.add(detail);
 return group;
}

export function dimensionLine(group,from,to,color=0x657d73){
 const mat=new THREE.LineBasicMaterial({color,depthTest:false});
 const pts=[new THREE.Vector3(mm(from[0]),.035,mm(from[1])),new THREE.Vector3(mm(to[0]),.035,mm(to[1]))];
 const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat);l.renderOrder=20;group.add(l);return l;
}
