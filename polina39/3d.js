import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const $=s=>document.querySelector(s),root=$('#view3d'),err=$('#err');
let scene,camera,renderer,controls,group,ready=false,cutaway=true,showFurniture=true;
const mats=new Map(),M=(c,o=1)=>{const k=c+o;if(!mats.has(k))mats.set(k,new THREE.MeshStandardMaterial({color:c,roughness:.84,transparent:o<1,opacity:o}));return mats.get(k)};
function box(x,z,w,d,h,c,y=0,o=1,p=group){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x+w/2,y+h/2,z+d/2);m.castShadow=true;m.receiveShadow=true;p.add(m);return m}
function floor(x,z,w,d,c){box(x,z,w,d,.09,c,-.09)}
function wall(x,z,X,Z,type='wall'){const L=Math.hypot(X-x,Z-z),h=cutaway?.58:2.7,c=type==='glass'?'#9fc4c2':'#efe9df',o=type==='glass'?.35:1,m=box((x+X)/2-L/2,(z+Z)/2-.055,L,.11,h,c,0,o);m.rotation.y=-Math.atan2(Z-z,X-x)}
function bed(x,z){box(x,z,1.6,2,.2,'#a98f75',.08);box(x+.03,z+.04,1.54,1.92,.18,'#f4eee5',.28);box(x+.1,z+.1,.62,.34,.08,'#fffaf2',.47);box(x+.88,z+.1,.62,.34,.08,'#fffaf2',.47)}
function wardrobe(x,z,w,d=.55,h=2.28){box(x,z,w,d,h,'#b79b7e')}
function sofa(x,z){box(x,z,1.55,.78,.27,'#788875',.16);box(x,z,.16,.78,.62,'#6d7d6d',.1);box(x,z,1.55,.13,.55,'#6d7d6d',.1)}
function table(x,z){const t=new THREE.Mesh(new THREE.CylinderGeometry(.41,.41,.055,32),M('#b99570'));t.position.set(x+.41,.74,z+.41);group.add(t);const l=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.69,18),M('#786b5a'));l.position.set(x+.41,.345,z+.41);group.add(l)}
function kitchen(){box(.1,1.25,.6,2.85,.9,'#c7c6b1');box(.1,1.25,.6,2.85,.05,'#f0eadf',.9);box(.1,3.45,.6,.7,1.9,'#dedbd3')}
function furniture(){kitchen();sofa(1.05,3.05);table(2.35,2.05);bed(4.65,.68);wardrobe(6.55,.25,.55,2.8);box(4.3,3.43,.85,.38,.72,'#b99570');wardrobe(2.15,4.92,.36,.9,1.15);box(5.12,4.25,1.52,.66,.48,'#f2f3ed');box(6.34,4.72,.52,.72,.55,'#f2f3ed')}
function build(){if(!ready)return;if(group){scene.remove(group);group.traverse(o=>o.geometry?.dispose())}group=new THREE.Group();scene.add(group);
floor(0,0,3.84,1.01,'#e9dfe8');floor(0,1.01,3.84,3.55,'#eee4d1');floor(3.84,0,3.43,4.08,'#dfe7dc');floor(4.84,4.08,2.43,1.62,'#dce6e7');floor(3.84,4.08,1,1.62,'#ebe8df');floor(2,4.74,1.84,.96,'#ebe8df');
[[0,0,7.27,0],[7.27,0,7.27,5.7],[7.27,5.7,4.84,5.7],[4.84,5.7,2,5.7],[2,5.7,0,4.56],[0,4.56,0,0],[3.84,0,3.84,3.1],[3.84,3.9,3.84,4.08],[4.84,4.08,7.27,4.08],[4.84,4.08,4.84,4.75],[4.84,5.48,4.84,5.7],[3.84,4.08,3.84,4.85],[3.84,5.45,3.84,5.7]].forEach(a=>wall(...a));wall(0,1.01,3.1,1.01,'glass');if(showFurniture)furniture()}
function reset(){controls.target.set(3.6,0,2.8);camera.position.set(12,13,14);camera.zoom=1;camera.updateProjectionMatrix();controls.update()}
function zoom(f){camera.zoom=THREE.MathUtils.clamp(camera.zoom*f,.65,5);camera.updateProjectionMatrix()}
function init(){scene=new THREE.Scene();scene.background=new THREE.Color('#ece9e2');camera=new THREE.OrthographicCamera(-6,6,6,-6,.1,100);renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;root.appendChild(renderer.domElement);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.05;scene.add(new THREE.HemisphereLight('#fff9ef','#8d9887',2.25));const s=new THREE.DirectionalLight('#fff2d8',2.8);s.position.set(-3,14,-4);s.castShadow=true;scene.add(s);const g=new THREE.Mesh(new THREE.PlaneGeometry(80,80),M('#ece9e2'));g.rotation.x=-Math.PI/2;g.position.y=-.13;scene.add(g);ready=true;build();reset();new ResizeObserver(()=>{const w=root.clientWidth||700,h=root.clientHeight||650;renderer.setSize(w,h);const r=Math.max(5.2,5.1*h/w);camera.left=-r*w/h;camera.right=r*w/h;camera.top=r;camera.bottom=-r;camera.updateProjectionMatrix()}).observe(root);renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)})}
$('#tab3d').onclick=()=>{root.classList.remove('hidden');$('#view2d').classList.add('hidden');$('#tab3d').setAttribute('aria-pressed','true');$('#tab2d').setAttribute('aria-pressed','false')};
$('#tab2d').onclick=()=>{root.classList.add('hidden');$('#view2d').classList.remove('hidden');$('#tab3d').setAttribute('aria-pressed','false');$('#tab2d').setAttribute('aria-pressed','true')};
$('#cutaway').onchange=e=>{cutaway=e.target.checked;build()};$('#furniture').onchange=e=>{showFurniture=e.target.checked;build()};$('#rotate').onclick=()=>{const o=camera.position.clone().sub(controls.target);o.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4);camera.position.copy(controls.target).add(o);controls.update()};$('#zin').onclick=()=>zoom(1.18);$('#zout').onclick=()=>zoom(1/1.18);$('#reset').onclick=reset;
try{init()}catch(e){console.error(e);err.hidden=false;$('#tab2d').click()}
window.polina39Debug={getState:()=>({ready,cutaway,showFurniture,view:root.classList.contains('hidden')?'2d':'3d'})};