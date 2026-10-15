import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {byId} from './catalog.js';
import {geometry,partitions,placements,pending,rooms} from './layout.js';
const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.72,...extra});
function box(g,m,x,y,z,w,h,d,r=0){const o=new T.Mesh(r?new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
function rod(g,m,a,b,r=.012){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const o=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),12),m);o.position.copy(av.add(bv).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());o.castShadow=true;g.add(o);return o;}
function cyl(g,m,x,y,z,r,h){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,64),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
function pattern(kind){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle=kind==='wood'?'#bda37d':kind==='cloth'?'#d2c1aa':'#d1c2a9';ctx.fillRect(0,0,512,512);let seed=19;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let n=0;n<3200;n++){const x=rand()*512,y=rand()*512;ctx.fillStyle=`rgba(${kind==='wood'?'60,38,15':'90,74,53'},${rand()*.09})`;ctx.fillRect(x,y,kind==='wood'?1:rand()*5,kind==='wood'?rand()*110:rand()*3);}if(kind==='tile'){ctx.strokeStyle='#b1a58f';ctx.lineWidth=3;ctx.strokeRect(0,0,512,512);}const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=4;return tex;}
function uvWorld(mesh,sx,sy,axis='floor'){const uv=mesh.geometry.attributes.uv,p=mesh.geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/sx,(axis==='floor'?p.getZ(i):p.getY(i))/sy);uv.needsUpdate=true;}
export function createProduct(p){
 const g=new T.Group();g.name=p.id;g.userData.product=p.id;const [w,d0,h]=p.dimensions.map(v=>v==null?.01:v/1000),d=d0;
 const body=mat(p.color),white=mat('#f1eee7'),dark=mat('#353631'),oak=mat('#aa8155'),gold=mat('#ac925c',{metalness:.7,roughness:.3});
 const soft=mat(p.color,{roughness:.95,map:pattern('cloth')});soft.map.colorSpace=T.SRGBColorSpace;soft.color.set('#ffffff');
 if(p.model==='sofa'){
  box(g,body,0,.25,0,w,.28,d-.06,.025);box(g,soft,0,.395,-.06,1.9,.13,.76,.035);
  for(const x of[-1.025,1.025])box(g,soft,x,.36,0,.15,.62,d,.025);
  box(g,soft,0,.48,-.42,1.9,.5,.16,.03);
  for(const x of[-.63,0,.63]){const b=box(g,soft,x,.61,-.34,.61,.38,.17,.06);b.rotation.x=-.12;}
  for(const x of[-.78,.78]){const b=box(g,soft,x,.55,.10,.36,.32,.13,.05);b.rotation.z=x>0?-.16:.16;}
  for(const x of[-.95,.95])for(const z of[-.36,.36])box(g,oak,x,.055,z,.055,.11,.055,.005);
 }else if(p.model==='bed'){
  box(g,soft,0,.16,.025,w,.32,d-.05,.02);box(g,soft,0,.50,-d/2+.055,w,1,.11,.025);
  for(let i=0;i<5;i++)box(g,soft,-w/2+(i+.5)*w/5,.67,-d/2+.115,w/5-.006,.60,.035,.012);
  box(g,white,0,.355,.055,1.6,.17,2,.035);
  const blanket=mat('#b5aaa0',{roughness:1});box(g,blanket,0,.448,.36,1.605,.025,1.39,.012);
  for(const x of[-.41,.41]){const pillow=box(g,white,x,.485,-.63,.68,.16,.43,.07);pillow.rotation.x=.12;}
  box(g,mat('#6b7275'),0,.47,.65,1.61,.025,.50,.01);
 }else if(p.model==='table'){
  cyl(g,mat('#e5ddcd'),0,h-.011,0,.4,.022);
  for(const x of[-1,1])for(const z of[-1,1])rod(g,gold,[x*.28,.02,z*.28],[x*.08,.71,z*.08],.018);
  cyl(g,gold,0,.4,0,.1,.08);
 }else if(p.model==='chair'){
  const fabric=mat(p.color,{roughness:.95});box(g,fabric,0,.46,.02,.44,.08,.43,.055);
  const back=box(g,fabric,0,.68,-.21,.48,.38,.075,.045);back.rotation.x=-.13;
  for(const x of[-1,1])for(const z of[-1,1])rod(g,mat('#b09e82'),[x*.235,.015,z*.265],[x*.12,.43,z*.12],.012);
  // Low curved side bolsters visible in the product photograph.
  for(const x of[-1,1]){const side=box(g,fabric,x*.205,.53,-.08,.05,.18,.30,.025);side.rotation.z=x*.16;}
 }else if(p.model==='desk'){
  box(g,oak,0,h-.009,0,w,.018,d,.005);
  for(const x of[-.36,.36]){box(g,dark,x,.025,0,.07,.05,.56,.01);box(g,dark,x,.36,0,.065,.67,.065,.005);}box(g,dark,0,.63,0,.78,.055,.055,.005);
  box(g,dark,.31,.676,.25,.12,.025,.05,.005);
 }else if(p.model==='rack'){
  const wood=mat('#d8dcd6');box(g,wood,0,h/2,-d/2+.008,w,h,.016);
  for(const x of[-w/2+.008,0,w/2-.008])box(g,wood,x,h/2,0,.016,h,d);
  for(const y of[.07,.35,2.06,2.39])box(g,wood,0,y,0,w,.016,d);
  for(const y of[.72,1.07,1.42,1.77])box(g,wood,w/4,y,0,w/2,.016,d);
  rod(g,mat('#979c9d',{metalness:.7}),[-w/2+.025,1.9,0],[-.025,1.9,0]);
  for(const x of[-.41,-.3,-.19]){rod(g,oak,[x-.075,1.75,0],[x,1.84,0],.006);rod(g,oak,[x,1.84,0],[x+.075,1.75,0],.006);}
 }else if(p.model==='shoe'){
  box(g,oak,0,h/2,0,w,h,d,.006);
  for(let j=0;j<2;j++){box(g,body,0,.06+(j+.5)*.43,.151,w-.045,.42,.018,.004);for(let k=0;k<23;k++)box(g,body,-.265+k*.024,.06+(j+.5)*.43,.163,.006,.405,.006);box(g,gold,0,.06+(j+1)*.43-.045,.181,.20,.012,.02,.004);}
 }else if(p.model==='kitchen'){
  let x=-w/2;for(const span of[.5,.4,.6]){const cx=x+span/2;box(g,white,cx,.462,0,span-.003,.724,d);box(g,body,cx,.46,d/2,span-.006,.716,.016,.004);
   box(g,body,cx,1.784,-.105,span-.005,.72,.296,.004);
   // Recessed panel and fine frame reproduce the selected Shaker facade.
   for(const yy of[.46,1.784]){box(g,body,cx,yy,yy>1?.051:.265,span-.075,.60,.012,.002);box(g,gold,cx,yy>1?1.49:.75,yy>1?.075:.288,.128,.01,.016,.003);}
   for(const xx of[cx-span/2+.07,cx+span/2-.07])box(g,dark,xx,.05,.12,.035,.10,.035);x+=span;
  }
 }else if(p.model==='vanity'){
  box(g,body,0,.265,0,w,.53,d,.008);for(const y of[.135,.395]){box(g,body,0,y,.204,w-.012,.25,.018,.006);box(g,dark,0,y+.12,.21,w-.04,.008,.008);}
  // Ceramic rim with recessed bowl instead of a flat solid white block.
  const ceramic=mat('#f5f6f2',{roughness:.2});box(g,ceramic,0,.55,-.16,.6,.052,.08,.01);box(g,ceramic,0,.55,.17,.6,.052,.06,.01);
  for(const x of[-.265,.265])box(g,ceramic,x,.55,0,.07,.052,.28,.01);box(g,ceramic,0,.48,0,.46,.035,.27,.03);
 }else if(p.model==='mirror'){
  box(g,mat('#b8c9c9',{metalness:1,roughness:.055}),0,h/2,0,w,h,.01,.002);
 }
 // Fit the photo-derived details to the catalogue envelope, never to the room.
 const bounds=new T.Box3().setFromObject(g),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
 g.scale.set(w/size.x,h/size.y,d/size.z);g.position.set(-center.x*g.scale.x,-bounds.min.y*g.scale.y,-center.z*g.scale.z);
 const envelope=new T.Group();envelope.name=p.id;envelope.userData.product=p.id;envelope.add(g);
 envelope.traverse(o=>{if(o.isMesh)o.userData.product=p.id;});return envelope;
}
export function startScene(container,onSelect){
 const scene=new T.Scene();scene.background=new T.Color('#e7e4db');
 const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;container.append(renderer.domElement);
 const camera=new T.PerspectiveCamera(42,1,.05,100);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=2;controls.maxDistance=23;
 const env=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);scene.environment=pmrem.fromScene(env,.04).texture;scene.environmentIntensity=.4;env.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight('#fff4df','#858b82',2.3));const sun=new T.DirectionalLight('#fff4e0',3.1);sun.position.set(-3,10,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:.1,far:35});sun.shadow.normalBias=.025;scene.add(sun);
 const root=new T.Group();scene.add(root);const walls=new T.Group();root.add(walls);const pickable=[];const objects=new Map();
 const painted=mat('#ebe6da'),tile=mat('#ffffff',{map:pattern('tile'),roughness:.85}),wood=mat('#ffffff',{map:pattern('wood'),roughness:.8});
 const identify=(o,product,room)=>{o.userData={...o.userData,product,room};pickable.push(o);return o;};
 const shape=new T.Shape();geometry.floor.forEach(([x,y],i)=>i?shape.lineTo(x/1000,-y/1000):shape.moveTo(x/1000,-y/1000));shape.closePath();const fg=new T.ShapeGeometry(shape);fg.rotateX(-Math.PI/2);
 const floor=new T.Mesh(fg,wood);uvWorld(floor,1.2,.19);floor.receiveShadow=true;identify(floor,'floor','all');root.add(floor);
 // Board joints are explicit geometry in real module sizes, independent of texture detail.
 const joint=mat('#9c886a');for(let z=.19;z<8.3;z+=.19){const spans=z<6.85?[[0,6.4]]:z<7.44?[[0,3.175],[3.425,6.4]]:[[0,3.175]];for(const [left,right] of spans){box(root,joint,(left+right)/2,.001,z,right-left,.001,.0015);for(let x=Math.ceil(left/1.2)*1.2+(Math.round(z/.19)%2)*.6;x<right;x+=1.2)if(x>left)box(root,joint,x,.002,z-.095,.0015,.001,.19);}}
 const bathfloor=box(root,tile,3.69,.007,.905,2.5,.01,1.81);uvWorld(bathfloor,.6,.6);identify(bathfloor,'tile','bath');
 const grout=mat('#c4b59c');for(let x=2.64;x<4.94;x+=.6)identify(box(root,grout,x,.014,.905,.002,.002,1.81),'grout','bath');for(let z=.305;z<1.81;z+=.6)identify(box(root,grout,3.69,.014,z,2.5,.002,.002),'grout','bath');
 const wallRecords=[];for(const o of geometry.walls){if(o.elevation)continue;wallRecords.push([o.x/1000,o.y/1000,o.width/1000,o.depth/1000]);}wallRecords.push(...partitions);
 for(const [x,z,w,d] of wallRecords){const o=box(walls,painted,x+w/2,.20,z+d/2,w,.4,d);o.userData.wall=true;identify(o,'paint','all');}
 const slate=mat('#bfab8a');const skirtGroup=new T.Group();root.add(skirtGroup);for(const [x,z,w,d] of wallRecords){if(w>d){for(const sign of[-1,1])identify(box(skirtGroup,slate,x+w/2,.04,z+d/2+sign*(d/2+.005),w,.08,.01),'skirting','all');}else{for(const sign of[-1,1])identify(box(skirtGroup,slate,x+w/2+sign*(w/2+.005),.04,z+d/2,.01,.08,d),'skirting','all');}}
 const bathPanels=[];for(const a of[[3.69,.2,.012,2.5,.4,.012],[4.925,.2,.905,.012,.4,1.81],[2.455,.2,.905,.012,.4,1.81]]){const o=box(walls,tile,...a);uvWorld(o,.6,.6,'wall');identify(o,'tile','bath');bathPanels.push(o);}
 const splash=box(root,tile,.77,1.14,.015,1.5,.56,.012);uvWorld(splash,.6,.6,'wall');identify(splash,'tile','living');
 const top=box(root,mat('#b18a5d',{map:pattern('wood')}),.77,.843,.32,1.5,.038,.6);identify(top,'worktop','living');
 for(const p of placements){const g=createProduct(byId[p.product]);g.name=p.id;g.position.set(p.center[0],p.elevation||0,p.center[1]);g.rotation.y=p.yaw*Math.PI/180;g.userData={...g.userData,placement:p.id,room:p.room};root.add(g);objects.set(p.id,g);g.traverse(o=>{if(o.isMesh){o.userData.placement=p.id;o.userData.room=p.room;pickable.push(o);}});}
 // Unselected appliances are visually quiet and have no invented merchant links.
 for(const p of pending){const g=new T.Group();g.name=p.id;const [w,d,h]=p.size,white=mat('#dddcd5');if(p.type==='tub'){box(g,white,0,.24,0,w,.46,d,.09);box(g,mat('#b2bbb6'),0,.49,0,w-.13,.012,d-.18,.11);}else{box(g,white,0,h/2,0,w,h,d,.025);if(p.type==='washer'){const ring=new T.Mesh(new T.TorusGeometry(.19,.035,12,32),mat('#777e7c'));ring.position.set(0,.42,d/2+.005);g.add(ring);}if(p.type==='fridge')box(g,mat('#858a84'),.24,1.2,d/2+.015,.015,.4,.02);}
  g.position.set(...[p.center[0],0,p.center[1]]);g.traverse(o=>{if(o.isMesh){o.userData.pending=p.id;o.userData.room=p.room;pickable.push(o);}});root.add(g);objects.set(p.id,g);
 }
 // Window glazing follows the repository's actual window openings.
 for(const win of geometry.windows||[]){const x=win.x/1000,z=win.y/1000,w=win.width/1000,d=(win.depth||40)/1000;box(root,mat('#9fbfc2',{transparent:true,opacity:.38,roughness:.12}),x+w/2,.45,z+d/2,w,.35,Math.max(d,.025));}
 const ground=box(scene,mat('#e7e4db'),3.2,-.17,4.1,30,.2,30);ground.castShadow=false;
 let selection=null,dirty=true,drag=null;const ray=new T.Raycaster();
 function focus(id='all',top=false){const r=rooms.find(r=>r.id===id),center=r?r.center:[3.2,4.15];controls.target.set(center[0],.2,center[1]);if(top){camera.position.set(center[0],id==='all'?14:7,center[1]+.001);}else{camera.position.set(center[0]+(id==='all'?8:4),id==='all'?10.5:5.8,center[1]+(id==='all'?10:4.8));}camera.updateProjectionMatrix();controls.update();dirty=true;}
 function highlight(id){if(selection){scene.remove(selection);selection.geometry.dispose();selection.material.dispose();selection=null;}const object=objects.get(id);if(object){selection=new T.Box3Helper(new T.Box3().setFromObject(object),0x79815f);scene.add(selection);}dirty=true;}
 function hitAt(e){const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);return ray.intersectObjects(pickable,false).find(h=>h.object.visible);}
 renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId,button:e.button};});
 renderer.domElement.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId||drag.button!==0)return;const moved=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);drag=null;if(moved>5)return;const hit=hitAt(e);if(hit){highlight(hit.object.userData.placement);onSelect(hit.object.userData,true);}});
 renderer.domElement.addEventListener('pointercancel',()=>drag=null);
 renderer.domElement.addEventListener('pointermove',e=>{if(!drag)renderer.domElement.style.cursor=hitAt(e)?'pointer':'grab';});
 function resize(){const {width,height}=container.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;}new ResizeObserver(resize).observe(container);controls.addEventListener('change',()=>dirty=true);
 function draw(){requestAnimationFrame(draw);controls.update();if(!dirty)return;renderer.render(scene,camera);dirty=false;}focus();resize();draw();
 return{scene,root,camera,renderer,objects,focus,highlight,pickable,render:()=>{dirty=true;renderer.render(scene,camera);},setWalls(full){for(const o of walls.children){const h=full?2.7:.4;o.scale.y=h/.4;o.position.y=h/2;}dirty=true;},setEvening(on){sun.intensity=on?.5:3.1;scene.environmentIntensity=on?.7:.4;scene.background.set(on?'#b8afa0':'#e7e4db');dirty=true;}};
}
