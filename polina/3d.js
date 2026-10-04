import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const root=document.getElementById('polina-3d');
const error=document.getElementById('polina-3d-error');
const SCALE=75, OX=54, OZ=44;
const X=v=>(v-OX)/SCALE, Z=v=>(v-OZ)/SCALE, L=v=>v/SCALE;
const C={girls:'#eadfe6',boys:'#dfe8ef',parents:'#dfe7dc',common:'#eee4d1',wet:'#dde6e7',hall:'#ece9e1',neutral:'#e7e7e3'};
const materials=new Map();
let scene,camera,renderer,controls,group,ready=false,current='v3',cutaway=true,showFurniture=true;

function mat(color,opacity=1){
  const key=color+opacity;
  if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.82,transparent:opacity<1,opacity}));
  return materials.get(key);
}
function addBox(parent,x,z,w,d,h,color,y=0,opacity=1){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,opacity));
  m.position.set(x+w/2,y+h/2,z+d/2);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function floorRect(x,z,w,d,color){
  addBox(group,X(x),Z(z),L(w),L(d),.08,color,-.08);
}
function wall(x1,z1,x2,z2,type='existing'){
  const ax=X(x1),az=Z(z1),bx=X(x2),bz=Z(z2),len=Math.hypot(bx-ax,bz-az);
  const h=cutaway?.58:2.7;
  const color=type==='proposed'?'#b57862':type==='glass'?'#90aaa5':'#efe9df';
  const m=addBox(group,(ax+bx)/2-len/2,(az+bz)/2-.055,len,.11,h,color,0,type==='glass'?.42:1);
  m.rotation.y=-Math.atan2(bz-az,bx-ax);
}
function outerShell(){
  wall(54,44,564,44);wall(564,44,564,734);wall(564,734,54,734);wall(54,734,54,44);
}
const fixedWalls=[
  [54,189,245,189],[245,189,245,276],[245,276,326,276],[326,44,326,264],[326,264,564,264],
  [54,475,202,475],[202,475,202,629],[54,629,202,629],[202,629,324,629],[324,536,324,734],[324,536,564,536],
  [54,285,245,285]
];
const proposed={
  original:[],
  v1:[[105,658,205,658],[245,658,324,658],[105,658,105,734]],
  v2:[[350,343,548,343],[548,343,548,486]],
  v3:[[410,276,410,354],[410,395,410,521]]
};
function floors(v){
  if(v==='original'){
    floorRect(54,44,235,145,C.neutral);floorRect(326,44,238,220,'#e7e1db');
    floorRect(54,285,191,190,C.common);floorRect(255,276,309,245,'#e5e9df');
    floorRect(54,487,148,142,C.wet);floorRect(54,635,270,99,C.hall);floorRect(329,536,235,198,'#e7e1db');return;
  }
  if(v==='v1'){
    floorRect(326,44,238,220,C.parents);floorRect(329,536,235,198,C.girls);floorRect(54,285,191,190,C.common);
    floorRect(255,276,309,245,C.common);floorRect(54,635,51,99,C.hall);floorRect(105,658,219,76,C.boys);floorRect(54,487,148,142,C.wet);return;
  }
  if(v==='v2'){
    floorRect(326,44,238,220,C.girls);floorRect(329,536,235,198,C.boys);floorRect(54,285,191,190,C.common);
    floorRect(255,276,309,245,C.common);floorRect(54,635,270,99,C.hall);floorRect(362,356,175,119,C.parents);floorRect(54,487,148,142,C.wet);return;
  }
  floorRect(326,44,238,220,C.girls);floorRect(329,536,235,198,C.parents);floorRect(54,285,191,190,C.common);
  floorRect(255,276,159,245,C.common);floorRect(414,276,150,245,C.boys);floorRect(54,635,270,99,C.hall);floorRect(54,487,148,142,C.wet);
}
function bed(x,z,w,d,color='#f4eee5'){
  addBox(group,X(x),Z(z),L(w),L(d),.22,'#aa9177',.08);
  addBox(group,X(x+3),Z(z+4),L(w-6),L(d-8),.18,color,.30);
  addBox(group,X(x+7),Z(z+7),L(w-14),L(Math.min(34,d-12)),.09,'#fffaf3',.49);
}
function bunk(x,z,w,d,color='#f4eee5'){
  bed(x,z,w,d,color);
  const px=X(x),pz=Z(z),pw=L(w),pd=L(d);
  for(const ox of [px+.04,px+pw-.07])for(const oz of [pz+.04,pz+pd-.07])addBox(group,ox,oz,.035,.035,1.58,'#8e795f',0);
  addBox(group,px+.04,pz+.04,pw-.08,pd-.08,.12,color,1.26);
  addBox(group,px+.07,pz+.07,pw-.14,L(Math.min(34,d-14)),.07,'#fffaf3',1.39);
}
function wardrobe(x,z,w,d,h=2.28){addBox(group,X(x),Z(z),L(w),L(d),h,'#b59a7e');}
function desk(x,z,w,d){addBox(group,X(x),Z(z),L(w),L(d),.055,'#b99671',.72);for(const ox of [X(x)+.05,X(x+w)-.08])for(const oz of [Z(z)+.05,Z(z+d)-.08])addBox(group,ox,oz,.035,.035,.70,'#7d6e5b');}
function chair(x,z,rot=0,color='#71806a'){
  const g=new THREE.Group(),w=.42,d=.42;g.position.set(X(x)+w/2,Z(0)*0,Z(z)+d/2);g.rotation.y=THREE.MathUtils.degToRad(rot);group.add(g);
  const p=(ox,oz,pw,pd,ph,y,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(pw,ph,pd),mat(c));m.position.set(ox,y+ph/2,oz);m.castShadow=true;g.add(m);};
  p(0,0,w,d,.08,.42,color);p(0,d/2-.03,w,.06,.42,.50,color);
  for(const ox of [-w/2+.05,w/2-.05])for(const oz of [-d/2+.05,d/2-.05])p(ox,oz,.035,.035,.42,0,'#806f5d');
}
function sofa(x,z,w,d){addBox(group,X(x),Z(z),L(w),L(d),.28,'#7d8d76',.16);addBox(group,X(x),Z(z),.16,L(d),.62,'#71806a',.1);addBox(group,X(x),Z(z),L(w),.13,.55,'#71806a',.1);}
function roundTable(x,z,diam){
  const r=L(diam)/2,m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.06,36),mat('#b99671'));m.position.set(X(x)+r,.74,Z(z)+r);m.castShadow=true;group.add(m);
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.69,20),mat('#796b59'));leg.position.set(X(x)+r,.345,Z(z)+r);group.add(leg);
}
function kitchen(){
  wardrobe(62,305,38,150,.92);wardrobe(104,305,38,150,.92);wardrobe(146,305,38,150,.92);
  addBox(group,X(62),Z(305),L(122),L(150),.05,'#eee9dc',.92);
}
function v3Furniture(){
  bunk(350,66,72,145,'#e8dce5');bed(462,73,74,145,'#e8dce5');desk(436,237,105,15);chair(470,252,180);chair(510,252,180);
  bed(374,575,145,103,'#dde6db');wardrobe(532,568,19,128);
  bunk(426,294,55,118,'#dae6ee');desk(501,430,45,16);desk(501,455,45,16);chair(506,411,180);chair(506,478,0);
  sofa(270,310,94,42);roundTable(300,397,66);wardrobe(268,457,80,18,.95);
  kitchen();wardrobe(70,650,42,70,2.25);wardrobe(118,650,42,70,2.25);wardrobe(166,650,42,70,2.25);
}
function v1Furniture(){
  bed(365,75,145,105,'#dce6da');bunk(374,570,65,120,'#eadfe6');bed(455,570,65,120,'#eadfe6');
  bunk(123,674,70,42,'#dce7ee');bunk(225,674,70,42,'#dce7ee');sofa(320,330,105,48);roundTable(435,410,62);kitchen();
}
function v2Furniture(){
  bunk(360,70,70,130,'#eadfe6');bed(455,75,70,130,'#eadfe6');bunk(376,570,70,120,'#dfe8ef');bed(465,570,70,120,'#dfe8ef');
  bed(385,390,128,72,'#dce6da');wardrobe(360,470,155,20,1.9);kitchen();
}
function originalFurniture(){bed(374,92,140,97);bed(376,585,139,105);kitchen();sofa(280,330,110,50);}
function furniture(v){if(!showFurniture)return;if(v==='v3')v3Furniture();else if(v==='v2')v2Furniture();else if(v==='v1')v1Furniture();else originalFurniture();}
function renderVariant(v){
  current=v;
  if(!ready)return;
  if(group){scene.remove(group);group.traverse(o=>o.geometry?.dispose());}
  group=new THREE.Group();scene.add(group);floors(v);outerShell();fixedWalls.forEach(a=>wall(...a));proposed[v].forEach(a=>wall(...a,'proposed'));furniture(v);
}
function reset(){
  if(!ready)return;controls.target.set(3.4,0,4.6);camera.position.set(12,14,15);camera.zoom=1;camera.updateProjectionMatrix();controls.update();
}
function zoom(f){if(!ready)return;camera.zoom=THREE.MathUtils.clamp(camera.zoom*f,.65,5);camera.updateProjectionMatrix();}
function init(){
  scene=new THREE.Scene();scene.background=new THREE.Color('#eeeae2');
  camera=new THREE.OrthographicCamera(-6,6,6,-6,.1,100);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;root.appendChild(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.05;controls.minZoom=.65;controls.maxZoom=5;
  scene.add(new THREE.HemisphereLight('#fff9ef','#8d9887',2.3));const sun=new THREE.DirectionalLight('#fff4dc',2.8);sun.position.set(-3,14,-4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(80,80),mat('#eeeae2'));ground.rotation.x=-Math.PI/2;ground.position.y=-.13;ground.receiveShadow=true;scene.add(ground);
  ready=true;renderVariant(window.polinaDebug?.getState().current||'v3');reset();
  new ResizeObserver(()=>{const w=root.clientWidth||700,h=root.clientHeight||650;renderer.setSize(w,h);const range=Math.max(5.6,5.3*h/w);camera.left=-range*w/h;camera.right=range*w/h;camera.top=range;camera.bottom=-range;camera.updateProjectionMatrix();}).observe(root);
  renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
  window.dispatchEvent(new CustomEvent('polina:3d-ready'));
}
try{init();}catch(e){console.error(e);error.hidden=false;}
addEventListener('polina:variant',e=>renderVariant(e.detail.variant));
document.getElementById('p3d-rotate')?.addEventListener('click',()=>{if(!ready)return;const off=camera.position.clone().sub(controls.target);off.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4);camera.position.copy(controls.target).add(off);controls.update();});
document.getElementById('p3d-zoom-in')?.addEventListener('click',()=>zoom(1.18));
document.getElementById('p3d-zoom-out')?.addEventListener('click',()=>zoom(1/1.18));
document.getElementById('p3d-reset')?.addEventListener('click',reset);
document.getElementById('p3d-cutaway')?.addEventListener('change',e=>{cutaway=e.target.checked;renderVariant(current);});
document.getElementById('p3d-furniture')?.addEventListener('change',e=>{showFurniture=e.target.checked;renderVariant(current);});
window.polina3DDebug={getState:()=>({ready,current,cutaway,showFurniture}),setVariant:renderVariant,reset};
