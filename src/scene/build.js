import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mm} from '../data/model.js';
export function box(parent,m,x,y,w,d,h,e=0,name='',rotation=0){const mesh=new THREE.Mesh(new THREE.BoxGeometry(mm(w),mm(h),mm(d)),m);mesh.position.set(mm(x+w/2),mm(e+h/2),mm(y+d/2));mesh.rotation.y=-THREE.MathUtils.degToRad(rotation||0);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function softBox(parent,m,x,y,w,d,h,e,r=25){const mesh=new THREE.Mesh(new RoundedBoxGeometry(mm(w),mm(h),mm(d),3,mm(Math.min(r,h/3,w/5,d/5))),m);mesh.position.set(mm(x+w/2),mm(e+h/2),mm(y+d/2));mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function lineBox(mesh,m){const l=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,35),m);mesh.add(l);}
export {createFurniture} from './furniture.js';
import {createSignatureDecor} from './signature-decor.js';
export function createArchitecture(geometry,layout,m,{cut=true,plan=false,walls=true,doorsOpen=true}={}){
 const root=new THREE.Group();root.name='APARTMENT_GEOMETRY';
 const shape=new THREE.Shape();geometry.floor.forEach(([x,y],i)=>i?shape.lineTo(mm(x),mm(y)):shape.moveTo(mm(x),mm(y)));shape.closePath();const floorGeo=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false});floorGeo.rotateX(Math.PI/2);const floor=new THREE.Mesh(floorGeo,m.floor);floor.name='floor';floor.receiveShadow=true;root.add(floor);
 if(!plan){
  const bathEast=layout.partitions.find(o=>o.id==='d-bath-east').x;
  const bathSouth=layout.partitions.find(o=>o.id==='d-bath-south-left').y;
  const bathTile=box(root,m.bathFloor,2440,0,bathEast-2440,bathSouth,10,1,'bath-tile');bathTile.castShadow=false;
  const sofa=layout.furniture.find(o=>o.id==='sofa');const livingRug=box(root,m.rug,390,sofa.y+120,1850,1050,9,2,'living-rug');livingRug.castShadow=false;
  for(let xx=2440;xx<bathEast;xx+=600)box(root,m.lacquer,xx,0,2,bathSouth,1,12);for(let yy=0;yy<bathSouth;yy+=600)box(root,m.lacquer,2440,yy,bathEast-2440,2,1,12);
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
  box(wallGroup,m.marble,0,5,1665,8,cut?150:610,890,'kitchen-backsplash');
  box(wallGroup,m.marble,8,0,8,1800,cut?150:610,890,'kitchen-side-backsplash');
  for(const [xx,ww] of [[0,590],[1210,450]]){box(wallGroup,m.lacquer,xx,0,ww,315,825,1720,'upper-cabinet');box(wallGroup,m.joinery,xx+18,300,ww-36,16,785,1740,'upper-front');box(wallGroup,m.metal,xx+ww-45,317,6,8,170,1780,'upper-handle');}
  box(wallGroup,m.metal,725,10,350,300,100,1700,'hood');box(wallGroup,m.lacquer,820,5,170,150,810,1800,'hood-flue');box(wallGroup,m.lamp,22,307,530,8,8,1720,'under-cabinet-light');
 }
 if(walls&&!plan){for(const win of geometry.windows){const gh=cut?Math.min(win.height,1050-win.sill):win.height;if(gh>0){box(wallGroup,m.glass,win.x,win.y,win.width,20,gh,win.sill,win.id);for(let i=0;i<=3;i++)box(wallGroup,m.worktop,win.x+i*win.width/3,win.y-10,25,40,gh,win.sill);box(wallGroup,m.worktop,win.x,win.y-10,win.width,40,25,win.sill);}}}
 if(walls&&!plan&&!cut)for(const win of geometry.windows){
  const curtainY=win.y-78;
  box(wallGroup,m.metal,win.x-80,curtainY-15,win.width+160,12,12,2480,'curtain-rail');
  const geo=new THREE.PlaneGeometry(mm(win.width),2.15,96,12),p=geo.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*48)*.022+Math.sin(p.getY(i)*2)*.012);
  geo.computeVertexNormals();const sheer=new THREE.Mesh(geo,m.curtain);sheer.position.set(mm(win.x+win.width/2),1.35,mm(curtainY));sheer.castShadow=false;wallGroup.add(sheer);
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
 box(group,m.metal,2480,401,200,14,10,815,'hand-towel-rail');box(group,m.upholstery,2500,404,160,10,220,585,'hand-towel');
 const wc=furniture('wc');box(group,m.metal,wc.x+145,wc.y+wc.depth-80,95,18,12,675,'paper-holder');
 const roll=cylinder(decorFinish.paper,wc.x+190,wc.y+wc.depth-70,650,.052,.105);roll.rotation.z=Math.PI/2;
 bottle(3000,330,860);bottle(3740,220,900);
 box(group,m.upholstery,2500,317,175,58,22,850,'folded-towel');
 // Recessed shelves, bottles and a narrow towel rail keep the washbasin clear.
 box(group,m.metal,3900,12,510,100,18,1000,'bath-shelf');
 for(let i=0;i<3;i++)bottle(4000+i*110,68,1020);
 const tub=furniture('bath-tub');box(group,m.metal,tub.x+tub.width-90,530,18,460,22,900,'towel-rail');
 box(group,m.upholstery,tub.x+tub.width-110,570,35,340,350,550,'bath-towel');
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

 for(const detail of [...createSignatureDecor(layout,m).children])group.add(detail);

 return group;
}
export function dimensionLine(group,from,to,color=0x657d73){const mat=new THREE.LineBasicMaterial({color,depthTest:false});const pts=[new THREE.Vector3(mm(from[0]),.035,mm(from[1])),new THREE.Vector3(mm(to[0]),.035,mm(to[1]))];const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat);l.renderOrder=20;group.add(l);return l;}
