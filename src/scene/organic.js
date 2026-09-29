import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

// Geometry is in metres. All decorative elements stay against a wall or within
// an existing furniture footprint, so the D–H circulation data remains valid.
function mesh(g,geo,mat,pos,name){const o=new THREE.Mesh(geo,mat);o.position.set(...pos);o.name=name;o.castShadow=o.receiveShadow=true;g.add(o);return o;}
function box(g,m,x,z,w,d,h,e=0,r=.012,name='joinery'){return mesh(g,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,d/4,h/4)),m,[x+w/2,e+h/2,z+d/2],name);}
function wall(g,m,w,h,x,z,e,yaw,name){const o=mesh(g,new THREE.PlaneGeometry(w,h),m,[x,e+h/2,z],name);o.rotation.y=yaw;return o;}
export function liveEdgeSlab(g,m,x,z,w,d,h,e,name='live-edge-slab'){
 const s=new THREE.Shape();const n=40;
 for(let i=0;i<=n;i++){const t=i/n,edge=.007*Math.sin(t*13)+.003*Math.sin(t*29);const px=t*w,pz=.022+edge;i?s.lineTo(px,pz):s.moveTo(px,pz);}
 for(let i=n;i>=0;i--){const t=i/n,edge=.008*Math.sin(t*11+2)+.003*Math.sin(t*31);s.lineTo(t*w,d-.023+edge);}s.closePath();
 const geo=new THREE.ExtrudeGeometry(s,{depth:h,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.003,bevelThickness:.003,curveSegments:16});geo.rotateX(Math.PI/2);return mesh(g,geo,m,[x,e+h,z],name);
}
function relief(g,m,w,h,x,z,e,yaw,name){
 const geo=new THREE.PlaneGeometry(w,h,72,84),p=geo.attributes.position;
 for(let i=0;i<p.count;i++){
  const u=p.getX(i),v=p.getY(i),edge=Math.min(1,(w/2-Math.abs(u))*18,(h/2-Math.abs(v))*18);
  const ridge=Math.abs(Math.sin(u*8-v*11+.65*Math.sin(v*3)+.8*Math.sin(u*4)))**.35;
  const fine=Math.sin(u*67+v*21)*Math.sin(v*53-u*17);
  p.setZ(i,.008+Math.max(0,edge)*(.035*ridge+.012*Math.sin(u*19+v*11)+fine*.003));
 }geo.computeVertexNormals();const o=mesh(g,geo,m,[x,e+h/2,z],name);o.rotation.y=yaw;return o;
}
function moon(g,m,x,z,e,r,yaw){
 const geo=new THREE.PlaneGeometry(r*2,r*2,112,112),p=geo.attributes.position,idx=[];
 const craters=[[-.51,.2,.12],[-.28,.53,.08],[-.68,-.12,.06],[-.43,-.45,.13],[-.12,-.64,.075],[-.72,.4,.04],[-.22,.72,.045]];
 const inside=(u,v)=>Math.hypot(u,v)<=r&&Math.hypot(u-r*.55,v-r*.15)>r*.89;
 for(let i=0;i<p.count;i++){
  const u=p.getX(i),v=p.getY(i);let d=.012+.006*Math.sin(u*75)*Math.sin(v*61)+.004*Math.sin(u*149+v*31);
  for(const [cx,cy,rr] of craters){const q=Math.hypot(u/r-cx,v/r-cy)/rr;d+=.018*Math.exp(-(((q-1)*4)**2))-.022*Math.exp(-((q*1.8)**2));}
  p.setZ(i,d);
 }
 const src=geo.index.array;
 for(let k=0;k<src.length;k+=3){const ids=[src[k],src[k+1],src[k+2]];if(ids.every(i=>inside(p.getX(i),p.getY(i))))idx.push(...ids);}
 geo.setIndex(idx);geo.computeVertexNormals();const o=mesh(g,geo,m.rock,[x,e,z],'sculpted-lunar-relief');o.rotation.y=yaw;
 const halo=new THREE.Mesh(geo.clone(),m.lamp);halo.scale.set(1.025,1.025,1);halo.position.set(x+Math.sin(yaw)*-.008,e,z+Math.cos(yaw)*-.008);halo.rotation.y=yaw;halo.name='moon-hidden-light';g.add(halo);
}
function mirror(g,m,x,z,e,w,h,yaw,name){
 const frame=new THREE.Group();frame.position.set(x,e,z);frame.rotation.y=yaw;frame.name=name;g.add(frame);
 const back=mesh(frame,new RoundedBoxGeometry(w+.025,h+.025,.014,4,.012),m.lamp,[0,0,0],'mirror-backlight');
 mesh(frame,new RoundedBoxGeometry(w,h,.025,5,.045),m.mirror,[0,0,.018],'mirror-face');return back;
}
function globe(g,m,x,z,e,r=.065){mesh(g,new THREE.SphereGeometry(r,24,16),m.lamp,[x,e,z],'opal-light');}
function archPanel(g,m,w,h,x,z,e,yaw){
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);
 const o=mesh(g,new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:false,curveSegments:40}),m,[x,e,z],'child-reading-arch');o.rotation.y=yaw;return o;
}
export function createOrganicDecor(layout,m){
 const g=new THREE.Group();g.name='QUIET_GEOLOGY';const get=id=>layout.furniture.find(o=>o.id===id);
 // Public focal point: a quiet mineral media field, separated from oak by shadow.
 relief(g,m.rock,1.42,2.38,.032,3.62,.10,Math.PI/2,'living-stone-wall');
 box(g,m.joinery,.006,2.89,.035,.055,2.45,.06,.006,'media-oak-return');
 box(g,m.lamp,.072,2.94,.005,1.36,.009,2.45,.001,'living-graze');

 const sofa=get('sofa');if(sofa){const z=(sofa.y+sofa.depth/2)/1000;
  box(g,m.darkStone,.78,z-.16,.18,.32,.27,.015,.05,'table-pedestal');
  liveEdgeSlab(g,m.joinery,.60,z-.26,.65,.50,.065,.285,'collectible-table');
 }
 // Entry: full-height joinery reads as a wall; a single mirror is its light slot.
 const hall=get('hall-wardrobe');if(hall){const x=hall.x/1000,z=hall.y/1000,d=hall.depth/1000;
  box(g,m.joinery,x-.015,z,.015,d,.20,2.40,.003,'wardrobe-soffit');
  box(g,m.shadow,x-.018,z-.014,.020,.012,2.48,.04,.001,'wardrobe-shadow-reveal');
 }
 const entryMirror=get('mirror');if(entryMirror){const x=entryMirror.x/1000+.03,z=(entryMirror.y+entryMirror.depth/2)/1000;
  mirror(g,m,x,z,1.22,.58,1.62,Math.PI/2,'entry-mirror');
  liveEdgeSlab(g,m.joinery,x-.025,z-.34,.13,.68,.055,.37,'entry-console');
 }
 // Kitchen: fewer upper masses; one niche, one pendant, exact material junctions.
 const dining=get('dining');if(dining){const x=(dining.x+dining.width*.54)/1000,z=(dining.y+dining.depth*.50)/1000;
  box(g,m.bronze,x-.004,z-.004,.008,.008,.40,2.19,.001,'pendant-wire');
  box(g,m.bronze,x-.22,z-.035,.44,.07,.035,2.16,.015,'pendant-body');
  box(g,m.lamp,x-.20,z-.027,.40,.054,.010,2.15,.003,'pendant-diffuser');
 }
 // Private focal point: a cropped moon grows from one wall-wide headboard.
 const bed=get('adult-bed');if(bed){
  const cx=(bed.x+bed.width/2)/1000,cz=(bed.y+bed.depth/2)/1000;
  const x=cx+bed.depth/2000-.012;
  box(g,m.joinery,x-.022,cz-1.13,.025,2.26,2.46,.08,.008,'adult-oak-wall');
  box(g,m.upholstery,x-.095,cz-.93,.065,1.86,.61,.44,.030,'integrated-headboard');

  moon(g,m,x-.062,cz+.06,1.77,.77,-Math.PI/2);
  for(const side of [-1,1]){liveEdgeSlab(g,m.joinery,x-.27,cz+side*1.02-.12,.24,.25,.040,.50,'integrated-bedside');}
  box(g,m.lamp,x-.105,cz-.90,.007,1.80,.008,1.05,.001,'headboard-hidden-light');
  globe(g,m,x-.18,cz-1.02,.63,.065);
 }
 // Second room: same arc language, softer scale; desk and storage form a system.
 const child=get('alice-bed');if(child){const cz=(child.y+child.depth/2)/1000,x=(child.x+child.width/2+child.depth/2)/1000-.028;
  archPanel(g,m.clay,1.24,1.99,x,cz,.35,-Math.PI/2);
  box(g,m.upholstery,x-.10,cz-.52,.065,1.04,.43,.43,.04,'child-soft-headboard');
  box(g,m.joinery,x-.18,cz+.57,.18,.32,.034,.56,.01,'child-bedside');globe(g,m,x-.10,cz+.71,.69,.055);
 }
 const desk=get('alice-desk');if(desk){const x=desk.x/1000,z=desk.y/1000,w=desk.width/1000,d=desk.depth/1000;
  box(g,m.joinery,x,z+d-.03,w,.035,.43,.755,.009,'desk-wall');
  liveEdgeSlab(g,m.joinery,x,z+d-.19,w,.18,.032,1.18,'desk-shelf');
  box(g,m.lamp,x+.07,z+d-.08,w-.14,.012,.006,1.172,.001,'desk-task-light');
 }
 // Mineral bathing room. Only one textured dry-wall zone; wet planes stay smooth.
 const basin=get('basin'),washer=get('washer'),tub=get('bath-tub');
 if(basin){const x=basin.x/1000,w=basin.width/1000;
  relief(g,m.slate,w+.06,1.57,x+w/2,.030,.93,0,'bath-relief');
  mirror(g,m,x+w/2,.10,1.65,w-.10,.89,0,'bath-lit-mirror');
 }
 if(washer){const x=washer.x/1000,w=washer.width/1000;
  liveEdgeSlab(g,m.joinery,x,.01,w,.18,.035,1.32,'bath-shelf-low');
  liveEdgeSlab(g,m.joinery,x+.06,.01,w-.12,.15,.032,1.67,'bath-shelf-high');
 }
 if(tub){const x=tub.x/1000,w=tub.width/1000;
  box(g,m.shadow,x+.04,.02,w-.08,.025,.36,1.27,.018,'bath-niche');
  liveEdgeSlab(g,m.joinery,x+.04,.02,w-.08,.11,.025,1.27,'bath-niche-sill');
  box(g,m.lamp,x+.065,.047,w-.13,.01,.006,1.60,.001,'bath-niche-light');
 }
 return g;
}
