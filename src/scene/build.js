import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mm} from '../data/model.js';
export function box(parent,m,x,y,w,d,h,e=0,name='',rotation=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(mm(w),mm(h),mm(d)),m);mesh.position.set(mm(x+w/2),mm(e+h/2),mm(y+d/2));mesh.rotation.y=-THREE.MathUtils.degToRad(rotation||0);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function softBox(parent,m,x,y,w,d,h,e,r=25){const mesh=new THREE.Mesh(new RoundedBoxGeometry(mm(w),mm(h),mm(d),3,mm(Math.min(r,h/3,w/5,d/5))),m);mesh.position.set(mm(x+w/2),mm(e+h/2),mm(y+d/2));mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function lineBox(mesh,m){const l=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,35),m);mesh.add(l);}
export function createFurniture(o,m){const g=new THREE.Group();g.name=o.id;g.userData={...o,category:'furniture'};const x=o.x,y=o.y,w=o.width,d=o.depth,h=o.height,e=o.elevation||0;
 const b=(mat,xx=x,yy=y,ww=w,dd=d,hh=h,ee=e)=>box(g,mat,xx,yy,ww,dd,hh,ee,o.id);
 const counter=()=>{b(m.joinery,x+15,y+15,w-30,d-30,h-70,e+50);b(m.worktop,x,y,w,d,30,e+h-30);};
 const front=(thickness=20,hh=h-100,ee=e+60)=>{const f=o.front||'south';if(f==='east')return b(m.worktop,x+w-thickness,y,thickness,d,hh,ee);if(f==='west')return b(m.worktop,x,y,thickness,d,hh,ee);return b(m.worktop,x,f==='north'?y:y+d-thickness,w,thickness,hh,ee);};
 if(o.type==='bed'){
  b(m.joinery,x,y,w,d,180,85);softBox(g,m.upholstery,x+28,y+30,w-56,d-60,105,270,25);
  softBox(g,m.upholstery,x+8,y+20,w-16,85,850,0,22);
  for(let i=1;i<5;i++)b(m.shadow,x+i*w/5,y+10,2,94,340,300);
  const mw=o.mattress[0],md=o.mattress[1],mx=x+(w-mw)/2,my=y+(d-md)/2;
  softBox(g,m.bedding,mx,my,mw,md,125,395,27);
  const count=mw>1000?2:1;
  for(let i=0;i<count;i++)softBox(g,m.bedding,mx+55+i*(mw-110)/count,my+75,(mw-155)/count,355,110,530,35);
  softBox(g,m.upholstery,mx+28,my+600,mw-56,md-640,30,522,15);
  b(m.joinery,x+35,y+d-40,w-70,35,160,90);
 }
 else if(o.type==='sofa'){
  b(m.joinery,x+60,y+60,w-120,d-120,100,95);
  softBox(g,m.upholstery,x,y,w,d,255,195,35);
  softBox(g,m.upholstery,x+15,y+d-205,w-30,200,440,250,36);
  softBox(g,m.upholstery,x,y+22,145,d-40,390,225,30);
  softBox(g,m.upholstery,x+w-145,y+22,145,d-40,390,225,30);
  for(let i=0;i<2;i++)softBox(g,m.bedding,x+150+i*(w-300)/2,y+35,(w-310)/2,d-260,115,410,35);
  softBox(g,m.upholstery,x+w*.52,y+d-270,Math.min(240,w*.3),120,60,495,22);
 }
 else if(['desk','bar'].includes(o.type)){b(m.worktop,x,y,w,d,40,h-40);const thick=45;if(o.type==='desk'){b(m.joinery,x+30,y+30,thick,d-60,h-40,0);b(m.joinery,x+w-75,y+30,thick,d-60,h-40,0);}else{if(o.front==='east'){b(m.joinery,x+30,y+80,180,d-160,h-40,0);}else{b(m.joinery,x+100,y+30,w-200,260,h-40,0);}}}
 else if(['chair','stool'].includes(o.type)){const seat=o.type==='stool'?650:430;b(m.upholstery,x,y,w,d,55,seat);const backH=o.type==='stool'?160:h-seat-55;const f=o.front||'north';if(f==='north')b(m.joinery,x,y+d-50,w,50,backH,seat+55);else if(f==='south')b(m.joinery,x,y,w,50,backH,seat+55);else if(f==='west')b(m.joinery,x+w-50,y,50,d,backH,seat+55);else b(m.joinery,x,y,50,d,backH,seat+55);for(const xx of[x+35,x+w-65])for(const yy of[y+35,y+d-65])b(m.metal,xx,yy,30,30,seat,0);}
 else if(o.type==='shower'){b(m.fixture,x,y,w,d,70,0);b(m.glass,x+w-12,y,12,d,2000,70);b(m.glass,x,y+d-12,w,12,2000,70);b(m.metal,x+w-30,y+100,20,100,900,1000);}
 else if(o.type==='tub'){
  softBox(g,m.fixture,x,y,w,d,h-20,e,35);
  softBox(g,m.shadow,x+72,y+65,w-144,d-130,9,e+h-10,24);
  softBox(g,m.marble,x+80,y+73,w-160,d-146,7,e+h-9,22);
  b(m.metal,x+40,y+30,w-80,9,10,e+h-8);
  b(m.metal,x+w-120,y+35,22,22,210,e+h);
  b(m.metal,x+w-180,y+40,145,28,14,e+h+155);
 }
 else if(o.type==='wc'){
  // The cistern casing hugs the wall behind the bowl; it is not a room divider.
  if(o.front==='east'){
   b(m.joinery,x,y+35,165,d-70,1000,0);
   const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.205,.18,.38,40),m.fixture);
   bowl.scale.set(1.15,1,.85);bowl.position.set(mm(x+355),.245,mm(y+d/2));g.add(bowl);
   const seat=new THREE.Mesh(new THREE.TorusGeometry(.185,.025,12,40),m.fixture);
   seat.rotation.x=Math.PI/2;seat.scale.set(1.25,.88,1);seat.position.set(mm(x+355),.45,mm(y+d/2));g.add(seat);
   b(m.metal,x+165,y+d/2-55,8,110,35,825);
  }else{b(m.joinery,x,y,w,180,1000,0);b(m.fixture,x+140,y+100,w-280,d-120,400,0);}
 }
 else if(['sink','basin'].includes(o.type)){
  counter();
  softBox(g,m.metal,x+w*.17,y+d*.18,w*.66,d*.6,9,h+1,12);
  softBox(g,m.shadow,x+w*.2,y+d*.21,w*.6,d*.53,8,h+6,12);
  softBox(g,m.fixture,x+w*.25,y+d*.26,w*.5,d*.43,4,h+10,10);
  b(m.metal,x+w*.5,y+55,25,25,215,h+12);
  b(m.metal,x+w*.5,y+45,145,18,16,h+205);
  b(m.metal,x+20,y+d-22,w-40,3,10,185);
 }
 else if(o.type==='hob'){counter();b(m.screen,x+40,y+60,w-80,d-120,14,h);for(const xx of[x+w*.28,x+w*.7])for(const yy of[y+d*.3,y+d*.68]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.068,.004,6,24),m.metal);ring.rotation.x=Math.PI/2;ring.position.set(mm(xx),mm(h+17),mm(yy));g.add(ring);}if(o.oven!==false)b(m.screen,x+50,y+d-5,w-100,15,420,150);}
 else if(o.type==='washer'){b(m.fixture);const disc=new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.025,32),m.metal);const face=o.front||'west';if(face==='east'||face==='west'){disc.rotation.z=Math.PI/2;disc.position.set(mm(face==='west'?x-2:x+w+2),.46,mm(y+d/2));}else{disc.rotation.x=Math.PI/2;disc.position.set(mm(x+w/2),.46,mm(face==='north'?y-2:y+d+2));}g.add(disc);}
 else if(o.type==='fridge'){b(m.joinery,x+2,y+2,w-4,d-4,h,e);front(25,h-90,35);b(m.metal,x+w-60,y+d-32,16,24,450,950);b(m.metal,x+15,y+d-28,w-30,4,8,750);}
 else if(['wardrobe','storage','upper','shelf'].includes(o.type)){
  b(m.joinery,x+2,y+2,w-4,d-4,h,e);
  if(o.type==='shelf'){for(let z=200;z<h;z+=330)b(m.worktop,x-3,y+20,w+6,d-20,25,z);}
  else{
   front(18,h-80,e+40);const count=Math.max(2,Math.round(Math.max(w,d)/550));
   if(w>=d)for(let i=0;i<count;i++){const px=x+i*w/count;b(m.shadow,px+5,y+d-22,2,3,h-110,e+54);b(m.metal,px+w/count-75,y+d-27,8,8,160,e+h*.49);}
   else for(let i=0;i<count;i++){const py=y+i*d/count;b(m.shadow,o.front==='east'?x+w-22:x+18,py+5,3,2,h-110,e+54);b(m.metal,o.front==='east'?x+w-28:x+15,py+d/count-75,8,8,160,e+h*.49);}
   b(m.shadow,x+15,y+d-20,w-30,2,10,e+80);
  }
 }
 else if(o.type==='tv'||o.type==='mirror'){b(o.type==='tv'?m.screen:m.glass);}
 else {counter();if(o.type==='dishwasher')front(20,h-100,30);}
 if(o.rotation){const cx=mm(x+w/2),cz=mm(y+d/2);for(const child of g.children){child.position.x-=cx;child.position.z-=cz;}g.position.set(cx,0,cz);g.rotation.y=-THREE.MathUtils.degToRad(o.rotation);}
 g.traverse(c=>{if(c.isMesh){c.userData={id:o.id};if(!['glass','screen'].includes(c.material.name))lineBox(c,m.line);}});return g;
}
export function createArchitecture(geometry,layout,m,{cut=true,plan=false,walls=true,doorsOpen=true}={}){
 const root=new THREE.Group();root.name='APARTMENT_GEOMETRY';
 const shape=new THREE.Shape();geometry.floor.forEach(([x,y],i)=>i?shape.lineTo(mm(x),mm(y)):shape.moveTo(mm(x),mm(y)));shape.closePath();const floorGeo=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false});floorGeo.rotateX(Math.PI/2);const floor=new THREE.Mesh(floorGeo,m.floor);floor.name='floor';floor.receiveShadow=true;root.add(floor);
 if(!plan){
  const bathEast=layout.partitions.find(o=>o.id==='d-bath-east').x;
  const bathSouth=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
  const bathTile=box(root,m.bathFloor,2440,0,bathEast-2440,bathSouth,10,1,'bath-tile');bathTile.castShadow=false;
  const livingRug=box(root,m.rug,390,2990,2020,1600,12,2,'living-rug');livingRug.castShadow=false;
 }
 const wallGroup=new THREE.Group();wallGroup.name='WALLS';root.add(wallGroup);wallGroup.visible=walls;
 for(const o of [...geometry.walls,...layout.partitions]){const max=plan?100:cut?1050:geometry.ceilingHeight;const elev=o.elevation||0;if(elev>=max)continue;const mesh=box(wallGroup,m.wall,o.x,o.y,o.width,o.depth,Math.min(o.height,max-elev),elev,o.id,o.rotation||0);lineBox(mesh,m.line);}
 if(walls&&!plan){
  const bathEast=layout.partitions.find(o=>o.id==='d-bath-east').x;
  const bathSouth=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
  const height=cut?1040:2350;
  // Thin surface finishes sit on the existing partition faces without changing any clearance.
  box(wallGroup,m.marble,2440,7,bathEast-2440,8,height,0,'bath-marble-north');
  box(wallGroup,m.bathFloor,bathEast-8,10,8,bathSouth-30,height,0,'bath-tile-east');
  box(wallGroup,m.bathFloor,2440,15,8,bathSouth-35,height,0,'bath-tile-west');
  box(wallGroup,m.marble,0,5,2310,8,cut?1040:610,cut?0:890,'kitchen-backsplash');
  if(!cut)box(wallGroup,m.marble,8,0,8,1660,610,890,'kitchen-side-backsplash');
 }
 if(walls&&!plan){for(const win of geometry.windows){const gh=cut?Math.min(win.height,1050-win.sill):win.height;if(gh>0){box(wallGroup,m.glass,win.x,win.y,win.width,20,gh,win.sill,win.id);for(let i=0;i<=3;i++)box(wallGroup,m.worktop,win.x+i*win.width/3,win.y-10,25,40,gh,win.sill);box(wallGroup,m.worktop,win.x,win.y-10,win.width,40,25,win.sill);}}}
 if(walls&&!plan&&!cut)for(const win of geometry.windows){
  const curtainY=win.y-78;
  box(wallGroup,m.metal,win.x-80,curtainY-15,win.width+160,12,12,2480,'curtain-rail');
  for(let i=0;i<12;i++){
   const cw=win.width/12+8;
   const panel=box(wallGroup,m.curtain,win.x+i*win.width/12,curtainY+(i%2?12:0),cw,6,2140,280,'linen-curtain');
   panel.castShadow=false;
  }
 }
 const doorGroup=new THREE.Group();doorGroup.name='DOORS';root.add(doorGroup);for(const d of[geometry.entry,...layout.doors]){const op=doorsOpen?{x:d.openX,y:d.openY,w:d.openWidth,dep:d.openDepth}:{x:d.x,y:d.y,w:d.axis==='x'?d.width:40,dep:d.axis==='y'?d.width:40};const dh=plan?30:cut?900:2100;box(doorGroup,m.joinery,op.x,op.y,op.w,op.dep,dh,0,d.id,(doorsOpen?d.openRotation:d.rotation)||0);}
 return root;
}
const decorFinish={leaf:new THREE.MeshStandardMaterial({color:0x647a5c,roughness:.9,side:THREE.DoubleSide}),soil:new THREE.MeshStandardMaterial({color:0x594b39,roughness:1}),petal:new THREE.MeshStandardMaterial({color:0xe6c9b9,roughness:.85}),paper:new THREE.MeshStandardMaterial({color:0xf7f3e9,roughness:1}),mirror:new THREE.MeshStandardMaterial({color:0x9faeb0,metalness:.38,roughness:.12}),amber:new THREE.MeshStandardMaterial({color:0x775943,roughness:.25,transparent:true,opacity:.82})};
export function createDecor(layout,m){
 const group=new THREE.Group();group.name='DECOR';
 const furniture=id=>layout.furniture.find(o=>o.id===id);
 const cylinder=(material,x,y,e,r,height,segments=20)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,height,segments),material);mesh.position.set(mm(x),mm(e)+height/2,mm(y));mesh.castShadow=true;group.add(mesh);return mesh;};
 const sphere=(material,x,y,e,r,scale=[1,1,1])=>{const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),material);mesh.position.set(mm(x),mm(e),mm(y));mesh.scale.set(...scale);mesh.castShadow=true;group.add(mesh);return mesh;};
 const bouquet=(x,y,e,flowers=false)=>{
  cylinder(m.fixture,x,y,e,.062,.095);cylinder(decorFinish.soil,x,y,e+.092,.052,.008);
  for(let i=0;i<7;i++){const a=i*2.399,dx=Math.cos(a)*(35+i%3*8),dy=Math.sin(a)*(30+i%2*9),height=155+i%3*55;
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.002,.003,mm(height),6),decorFinish.leaf);stem.position.set(mm(x+dx/2),mm(e+95+height/2),mm(y+dy/2));stem.rotation.z=dx*.0007;group.add(stem);
   sphere(decorFinish.leaf,x+dx,y+dy,e+95+height,.032,[1.5,.38,.65]);
   if(flowers&&i%2===0)sphere(decorFinish.petal,x+dx+12,y+dy,e+115+height,.026,[1,.65,1]);
  }
 };
 const bottle=(x,y,e)=>{cylinder(decorFinish.amber,x,y,e,.025,.125);cylinder(m.metal,x,y,e+125,.012,.03);box(group,m.metal,x-27,y-2,54,4,5,e+153);};
 const book=(x,y,e,w=170)=>{for(let i=0;i<3;i++)box(group,i===1?m.worktop:m.paper||decorFinish.paper,x,y+i*3,w,110,20,e+i*21);};

 // Bathroom: mirror, towel, soap, paper roll and flush plate stay above walking space.
 box(group,decorFinish.mirror,2500,8,520,12,820,1030,'basin-mirror');
 box(group,m.metal,2490,7,540,18,18,1030);box(group,m.metal,2490,7,540,18,18,1832);
 box(group,m.upholstery,2480,780,35,260,340,760,'hand-towel');
 box(group,m.metal,2455,1070,85,18,12,725,'paper-holder');
 const roll=cylinder(decorFinish.paper,2510,1079,700,.052,.105);roll.rotation.z=Math.PI/2;
 box(group,m.metal,2625,1375,9,90,45,855,'flush-plate');
 bottle(3000,330,860);bottle(3740,220,900);
 box(group,m.upholstery,2500,317,175,58,22,850,'folded-towel');
 // Recessed shelves, bottles and a narrow towel rail keep the washbasin clear.
 box(group,m.metal,3900,12,510,100,18,1000,'bath-shelf');
 for(let i=0;i<3;i++)bottle(4000+i*110,68,1020);
 box(group,m.metal,4610,530,18,460,22,900,'towel-rail');
 box(group,m.upholstery,4590,570,50,340,400,510,'bath-towel');
 cylinder(m.fixture,2725,465,865,.052,.068);
 box(group,m.metal,2710,460,30,10,22,925,'soap-dispenser');

 // Everyday details occupy furniture tops, never the verified floor route.
 const dining=furniture('dining'),desk=furniture('alice-desk');
 bouquet(dining.x+dining.width/2,dining.y+dining.depth/2,760,true);book(90,3380,430,120);bouquet(125,3920,430);
 book(1330,180,900,155);bottle(1540,180,900);
 const bedside=furniture('adult-nightstand');
 bouquet(bedside.x+bedside.width/2,bedside.y+bedside.depth/2,450);
 bouquet(desk.x+desk.width/2-120,desk.y+desk.depth/2+90,740);
 const lamp=(x,y,e)=>{cylinder(m.metal,x,y,e,.045,.025);cylinder(m.metal,x,y,e+25,.006,.22);sphere(m.fixture,x,y,e+280,.075,[1,.68,1]);};
 lamp(2890,7950,450);lamp(desk.x+desk.width/2+100,desk.y+desk.depth/2-80,740);
 // A pendant at the kitchen counter and a warm shade over the dining area.
 const pendant=(x,y)=>{cylinder(m.metal,x,y,2080,.006,.49);cylinder(m.metal,x,y,2000,.16,.12);sphere(m.fixture,x,y,1990,.105,[1,.45,1]);};
 pendant(1170,950);pendant(dining.x+dining.width/2,dining.y+dining.depth/2);
 const plate=(x,y,e)=>{cylinder(m.fixture,x,y,e,.11,.016,32);cylinder(m.worktop,x,y,e+.014,.075,.006,32);};
 plate(dining.x+155,dining.y+dining.depth/2,760);plate(dining.x+dining.width-155,dining.y+dining.depth/2,760);
 box(group,m.upholstery,490,3390,200,135,18,460,'throw-cushion');
 return group;
}
export function dimensionLine(group,from,to,color=0x657d73){const mat=new THREE.LineBasicMaterial({color,depthTest:false});const pts=[new THREE.Vector3(mm(from[0]),.035,mm(from[1])),new THREE.Vector3(mm(to[0]),.035,mm(to[1]))];const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat);l.renderOrder=20;group.add(l);return l;}
