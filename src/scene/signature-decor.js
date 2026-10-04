import * as THREE from 'three';
import {createOrganicDecor} from './organic.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const M=v=>v/1000;
function box(g,m,x,y,w,d,h,e=0,r=0){
 const geo=r?new RoundedBoxGeometry(M(w),M(h),M(d),3,M(Math.min(r,w/3,d/3,h/3))):new THREE.BoxGeometry(M(w),M(h),M(d));
 const o=new THREE.Mesh(geo,m);o.position.set(M(x+w/2),M(e+h/2),M(y+d/2));o.castShadow=true;o.receiveShadow=true;g.add(o);return o;
}
function cylinder(g,m,x,y,e,r,h,segments=40){
 const o=new THREE.Mesh(new THREE.CylinderGeometry(M(r),M(r),M(h),segments),m);o.position.set(M(x),M(e+h/2),M(y));o.castShadow=true;o.receiveShadow=true;g.add(o);return o;
}
function pebble(g,m,x,y,e,w,d,h){
 const o=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),m);o.position.set(M(x),M(e+h/2),M(y));o.scale.set(M(w/2),M(h/2),M(d/2));o.castShadow=true;o.receiveShadow=true;g.add(o);return o;
}
function tube(g,m,points,r=7){
 const curve=new THREE.CatmullRomCurve3(points.map(([x,y,z])=>new THREE.Vector3(M(x),M(z),M(y))));
 const o=new THREE.Mesh(new THREE.TubeGeometry(curve,32,M(r),8,false),m);o.castShadow=true;g.add(o);return o;
}
function vase(g,m,x,y,e,flowers=false){
 cylinder(g,m.fixture,x,y,e,48,84,32);
 cylinder(g,m.smokedGlass,x,y,e+76,27,60,28);
 if(flowers){
  const stemMat=m.olive;
  for(let i=0;i<5;i++){
   const a=i*1.9,dx=Math.cos(a)*(30+i*4),dy=Math.sin(a)*(26+i*3),hh=130+i*17;
   tube(g,stemMat,[[x,y,e+120],[x+dx,y+dy,e+120+hh]],3);
   pebble(g,i%2?m.wine:m.olive,x+dx,y+dy,e+120+hh,52,34,30);
  }
 }
}
function bookStack(g,m,x,y,e){
 const mats=[m.lacquer,m.wine,m.joinery];
 for(let i=0;i<3;i++)box(g,mats[i],x+i*4,y+i*3,150-i*8,105-i*6,18,e+i*19,3);
}

export function createSignatureDecor(layout,m){
 if(m.wall.userData.organic||layout.id==='W4')return createOrganicDecor(layout,m);
 const g=new THREE.Group();g.name='EDITORIAL_ARCHITECTURE';
 const byId=id=>layout.furniture.find(o=>o.id===id);
 const divider=layout.partitions.find(o=>o.id==='divider-lower')||layout.partitions.find(o=>o.id==='d-adult-divider');
 const wallX=divider?.x||3175;

 // PUBLIC SPACE — walnut TV portal + stone plinth + a single bronze datum.
 box(g,m.joinery,8,2980,72,1310,2360,160,6);
 box(g,m.darkStone,72,3110,18,1040,1510,570,2);
 box(g,m.bronze,94,3070,8,1120,8,2075,1);
 box(g,m.lamp,96,3090,6,1080,7,2060,1);
 box(g,m.marble,90,3090,235,1080,42,420,8);
 box(g,m.shadow,112,3110,190,1040,20,395,7);

 // Sculptural two-level coffee table, deliberately off-centre.
 pebble(g,m.darkStone,930,3670,220,640,460,120);
 pebble(g,m.marble,1160,3900,300,510,390,78);
 cylinder(g,m.bronze,1160,3900,95,54,205,32);
 bookStack(g,m,1015,3705,350);

 // ENTRY / STORAGE SPINE — same walnut, one burgundy niche, no extra furniture.
 const hall=byId('hall-wardrobe');
 if(hall){
  const fx=hall.x-34;
  box(g,m.joinery,fx,hall.y-70,28,hall.depth+140,2350,65,5);
  box(g,m.shadow,fx-4,hall.y-36,4,hall.depth+72,2190,145,1);
  const nicheY=hall.y+hall.depth*.56;
  box(g,m.wine,fx-10,nicheY-220,10,440,520,1010,3);
  box(g,m.joinery,fx-35,nicheY-238,25,18,556,992,3);
  box(g,m.joinery,fx-35,nicheY+220,25,18,556,992,3);
  box(g,m.lamp,fx-44,nicheY-205,6,410,6,1508,1);
  cylinder(g,m.bronze,fx-72,nicheY,1070,4,365,8);
 }

 // KITCHEN — tall-unit crown and a thin suspended line reinforce the stone peninsula.
 const fridge=byId('fridge');
 const island=byId('dining');
 if(fridge){
  box(g,m.joinery,1645,0,700,72,2350,0,8);
  box(g,m.shadow,1658,76,674,8,2190,82,1);
  box(g,m.bronze,2318,80,7,520,7,1620,1);
 }
 if(island){
  const cx=island.x+island.width/2,cy=island.y+island.depth/2;
  tube(g,m.bronze,[[cx,cy,2660],[cx,cy,2240]],5);
  pebble(g,m.smokedGlass,cx,cy,2140,310,230,170);
  pebble(g,m.wine,cx,cy,2125,210,160,110);
  vase(g,m,cx-270,cy-65,island.height+16,true);
 }

 // ADULT BEDROOM — asymmetric wall, upholstery + walnut + stone shelf.
 box(g,m.lacquer,wallX-58,5480,42,2500,2360,100,5);
 box(g,m.joinery,wallX-76,5480,18,760,2180,165,3);
 for(let i=0;i<5;i++)box(g,i===4?m.bronze:m.joinery,wallX-88,5510+i*92,12,54,2070,220,3);
 box(g,m.upholstery,wallX-128,6210,76,1500,820,520,70);
 box(g,m.wine,wallX-138,6210,10,460,820,520,4);
 box(g,m.marble,wallX-310,5740,245,2050,42,735,10);
 box(g,m.shadow,wallX-280,5760,185,2010,18,712,8);
 box(g,m.lamp,wallX-92,5580,8,2230,9,1430,2);
 tube(g,m.bronze,[[wallX-420,7520,2490],[wallX-420,7520,1280]],5);
 pebble(g,m.smokedGlass,wallX-420,7520,1110,160,160,230);
 pebble(g,m.wine,wallX-420,7520,1085,118,118,150);

 const vanity=byId('adult-dresser');
 if(vanity){
  const vx=vanity.x+vanity.width*.62,vy=vanity.y+vanity.depth*.53;
  const mirror=new THREE.Mesh(new THREE.SphereGeometry(1,48,32),m.smokedGlass);
  mirror.scale.set(.018,.38,.25);mirror.position.set(M(vx+40),1.37,M(vy));g.add(mirror);
  box(g,m.bronze,vx+14,vy-255,5,510,590,1050,2);
  vase(g,m,vx-95,vy-150,vanity.height+8,false);
 }
 vase(g,m,wallX-205,5950,785,false);
 bookStack(g,m,wallX-290,7420,786);

 // SECOND ROOM — timeless built-in reading/work wall, no nursery graphics.
 const desk=byId('alice-desk');
 if(desk){
  const shelfY=desk.y+desk.depth-70;
  box(g,m.joinery,desk.x+40,shelfY,desk.width-80,45,34,1320,8);
  box(g,m.joinery,desk.x+40,shelfY,34,45,780,1320,8);
  box(g,m.joinery,desk.x+desk.width-74,shelfY,34,45,780,1320,8);
  box(g,m.bronze,desk.x+70,shelfY-4,desk.width-140,5,6,2110,1);
  box(g,m.lamp,desk.x+90,shelfY-10,desk.width-180,5,6,1285,1);
  bookStack(g,m,desk.x+160,shelfY-120,1365);
  vase(g,m,desk.x+desk.width-190,shelfY-120,1360,false);
 }
 const child=byId('alice-bed');
 if(child){
  box(g,m.lacquer,6300,4450,28,1880,2240,130,4);
  box(g,m.joinery,6282,4450,18,520,2160,170,3);
  box(g,m.olive,6268,5000,18,1180,900,650,48);
  box(g,m.lamp,6258,5040,6,1100,7,1600,2);
  box(g,m.joinery,6120,6030,210,420,35,650,8);
  box(g,m.bronze,6108,6080,10,320,7,625,2);
 }

 // BATHROOM — boutique-hotel mirror, stone niche and fluted-glass line.
 const basin=byId('basin'),tub=byId('bath-tub'),washer=byId('washer');
 if(basin){
  box(g,m.bronze,basin.x-20,10,basin.width+40,12,1180,980,5);
  box(g,m.smokedGlass,basin.x-6,20,basin.width+12,8,1148,996,4);
  box(g,m.lamp,basin.x+20,30,basin.width-40,5,7,2130,1);
  box(g,m.marble,basin.x-40,18,basin.width+180,255,35,930,7);
  vase(g,m,basin.x+basin.width-70,170,970,false);
 }
 if(washer){
  box(g,m.joinery,washer.x-12,0,washer.width+24,46,2030,620,6);
  box(g,m.bronze,washer.x+washer.width+7,52,6,520,7,1480,1);
 }
 if(tub){
  box(g,m.darkStone,tub.x-35,8,tub.width+20,28,540,1270,8);
  box(g,m.lamp,tub.x+5,38,tub.width-60,5,7,1770,1);
  for(let i=0;i<3;i++)cylinder(g,i===1?m.wine:m.fixture,tub.x+155+i*120,78,1325,24,88,24);
  box(g,m.smokedGlass,tub.x-16,690,18,640,1420,560,4);
  for(let i=0;i<10;i++)box(g,m.glass,tub.x-20,705+i*58,8,8,1380,580,2);
  box(g,m.bronze,tub.x-24,684,6,656,1450,545,1);
 }

 return g;
}
