import * as THREE from 'three';
import {mm} from '../data/model.js';
export function box(parent,m,x,y,w,d,h,e=0,name=''){const mesh=new THREE.Mesh(new THREE.BoxGeometry(mm(w),mm(h),mm(d)),m);mesh.position.set(mm(x+w/2),mm(e+h/2),mm(y+d/2));mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function lineBox(mesh,m){const l=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,35),m);mesh.add(l);}
export function createFurniture(o,m){const g=new THREE.Group();g.name=o.id;g.userData={...o,category:'furniture'};const x=o.x,y=o.y,w=o.width,d=o.depth,h=o.height,e=o.elevation||0;
 const b=(mat,xx=x,yy=y,ww=w,dd=d,hh=h,ee=e)=>box(g,mat,xx,yy,ww,dd,hh,ee,o.id);
 const counter=()=>{b(m.joinery,x+15,y+15,w-30,d-30,h-70,e+50);b(m.worktop,x,y,w,d,30,e+h-30);};
 const front=(thickness=20,hh=h-100,ee=e+60)=>{const f=o.front||'south';if(f==='east')return b(m.worktop,x+w-thickness,y,thickness,d,hh,ee);if(f==='west')return b(m.worktop,x,y,thickness,d,hh,ee);return b(m.worktop,x,f==='north'?y:y+d-thickness,w,thickness,hh,ee);};
 if(o.type==='bed'){b(m.joinery,x,y,w,d,210,80);b(m.upholstery,x+35,y+35,w-70,d-70,110,290);b(m.joinery,x,y,w,70,850,0);const mw=o.mattress[0],md=o.mattress[1];b(m.fixture,x+(w-mw)/2,y+(d-md)/2,mw,md,100,400);b(m.upholstery,x+90,y+160,(w-220)/(mw>1000?2:1),380,110,500);if(mw>1000)b(m.upholstery,x+w/2+20,y+160,(w-220)/2,380,110,500);b(m.upholstery,x+65,y+850,w-130,d-960,25,507);}
 else if(o.type==='sofa'){b(m.joinery,x+35,y+35,w-70,d-70,120,90);b(m.upholstery,x,y,w,d,270,200);b(m.upholstery,x,y+d-180,w,180,620,200);b(m.upholstery,x,y,145,d,440,200);b(m.upholstery,x+w-145,y,145,d,440,200);for(let i=0;i<3;i++)b(m.fixture,x+155+i*(w-310)/3,y+25,(w-325)/3,d-230,150,400);}
 else if(['desk','bar'].includes(o.type)){b(m.worktop,x,y,w,d,40,h-40);const thick=45;if(o.type==='desk'){b(m.joinery,x+30,y+30,thick,d-60,h-40,0);b(m.joinery,x+w-75,y+30,thick,d-60,h-40,0);}else{if(o.front==='east'){b(m.joinery,x+30,y+80,180,d-160,h-40,0);}else{b(m.joinery,x+100,y+30,w-200,260,h-40,0);}}}
 else if(['chair','stool'].includes(o.type)){const seat=o.type==='stool'?650:430;b(m.upholstery,x,y,w,d,55,seat);const backH=o.type==='stool'?160:h-seat-55;const f=o.front||'north';if(f==='north')b(m.joinery,x,y+d-50,w,50,backH,seat+55);else if(f==='south')b(m.joinery,x,y,w,50,backH,seat+55);else if(f==='west')b(m.joinery,x+w-50,y,50,d,backH,seat+55);else b(m.joinery,x,y,50,d,backH,seat+55);for(const xx of[x+35,x+w-65])for(const yy of[y+35,y+d-65])b(m.metal,xx,yy,30,30,seat,0);}
 else if(o.type==='shower'){b(m.fixture,x,y,w,d,70,0);b(m.glass,x+w-12,y,12,d,2000,70);b(m.glass,x,y+d-12,w,12,2000,70);b(m.metal,x+w-30,y+100,20,100,900,1000);}
 else if(o.type==='tub'){b(m.fixture);b(m.metal,x+55,y+70,w-110,d-140,15,h);b(m.fixture,x+90,y+120,w-180,d-240,15,h+2);}
 else if(o.type==='wc'){b(m.joinery,x,y,w,180,1100,0);b(m.fixture,x+140,y+100,w-280,d-120,400,0);b(m.metal,x+170,y+150,w-340,d-220,15,405);b(m.fixture,x+190,y+170,w-380,d-260,15,422);}
 else if(['sink','basin'].includes(o.type)){counter();b(m.metal,x+w*.17,y+d*.18,w*.66,d*.6,12,h);b(m.fixture,x+w*.2,y+d*.22,w*.6,d*.5,14,h+3);b(m.metal,x+w*.5,y+60,25,25,220,h);}
 else if(o.type==='hob'){counter();b(m.screen,x+40,y+60,w-80,d-120,14,h);for(const xx of[x+w*.28,x+w*.7])for(const yy of[y+d*.3,y+d*.68]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.068,.004,6,24),m.metal);ring.rotation.x=Math.PI/2;ring.position.set(mm(xx),mm(h+17),mm(yy));g.add(ring);}if(o.oven!==false)b(m.screen,x+50,y+d-5,w-100,15,420,150);}
 else if(o.type==='washer'){b(m.fixture);const disc=new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.025,32),m.metal);disc.rotation.z=Math.PI/2;disc.position.set(mm(x-2),.46,mm(y+d/2));g.add(disc);}
 else if(o.type==='fridge'){b(m.joinery,x+2,y+2,w-4,d-4,h,e);front(25,h-90,35);b(m.metal,x+w-60,y+d-32,16,24,450,950);b(m.metal,x+15,y+d-28,w-30,4,8,750);}
 else if(['wardrobe','storage','upper','shelf'].includes(o.type)){b(m.joinery,x+2,y+2,w-4,d-4,h,e);if(o.type==='shelf'){for(let z=200;z<h;z+=330)b(m.worktop,x-3,y+20,w+6,d-20,25,z);}else{const frontMesh=front(18,h-80,e+40);const count=Math.max(2,Math.round(Math.max(w,d)/550));if(w>=d){for(let i=1;i<count;i++)b(m.metal,x+i*w/count,y+d-21,3,3,h-100,e+50);}else{for(let i=1;i<count;i++)b(m.metal,o.front==='east'?x+w-21:x+18,y+i*d/count,3,3,h-100,e+50);}}}
 else if(o.type==='tv'||o.type==='mirror'){b(o.type==='tv'?m.screen:m.glass);}
 else {counter();if(o.type==='dishwasher')front(20,h-100,30);}
 g.traverse(c=>{if(c.isMesh){c.userData={id:o.id};if(!['glass','screen'].includes(c.material.name))lineBox(c,m.line);}});return g;
}
export function createArchitecture(geometry,layout,m,{cut=true,plan=false,walls=true,doorsOpen=true}={}){
 const root=new THREE.Group();root.name='APARTMENT_GEOMETRY';
 const shape=new THREE.Shape();geometry.floor.forEach(([x,y],i)=>i?shape.lineTo(mm(x),mm(y)):shape.moveTo(mm(x),mm(y)));shape.closePath();const floorGeo=new THREE.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:false});floorGeo.rotateX(Math.PI/2);const floor=new THREE.Mesh(floorGeo,m.floor);floor.name='floor';floor.receiveShadow=true;root.add(floor);
 const wallGroup=new THREE.Group();wallGroup.name='WALLS';root.add(wallGroup);wallGroup.visible=walls;
 for(const o of [...geometry.walls,...layout.partitions]){const max=plan?100:cut?1050:geometry.ceilingHeight;const elev=o.elevation||0;if(elev>=max)continue;const mesh=box(wallGroup,m.wall,o.x,o.y,o.width,o.depth,Math.min(o.height,max-elev),elev,o.id);lineBox(mesh,m.line);}
 if(walls&&!plan){for(const win of geometry.windows){const gh=cut?Math.min(win.height,1050-win.sill):win.height;if(gh>0){box(wallGroup,m.glass,win.x,win.y,win.width,20,gh,win.sill,win.id);for(let i=0;i<=3;i++)box(wallGroup,m.worktop,win.x+i*win.width/3,win.y-10,25,40,gh,win.sill);box(wallGroup,m.worktop,win.x,win.y-10,win.width,40,25,win.sill);}}}
 const doorGroup=new THREE.Group();doorGroup.name='DOORS';root.add(doorGroup);for(const d of[geometry.entry,...layout.doors]){const op=doorsOpen?{x:d.openX,y:d.openY,w:d.openWidth,dep:d.openDepth}:{x:d.x,y:d.y,w:d.axis==='x'?d.width:40,dep:d.axis==='y'?d.width:40};const dh=plan?30:cut?900:2100;box(doorGroup,m.joinery,op.x,op.y,op.w,op.dep,dh,0,d.id);}
 return root;
}
export function dimensionLine(group,from,to,color=0x657d73){const mat=new THREE.LineBasicMaterial({color,depthTest:false});const pts=[new THREE.Vector3(mm(from[0]),.035,mm(from[1])),new THREE.Vector3(mm(to[0]),.035,mm(to[1]))];const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),mat);l.renderOrder=20;group.add(l);return l;}
