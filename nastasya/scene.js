import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {dimensions,rooms,pieces,walls,glazing,roomById} from './model.js';

export function createViewer(host,{room='all',furniture=true,cutaway=true,proposal=true,onRoom=()=>{}}={}){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#efede7');
 const camera=new THREE.PerspectiveCamera(42,1,.1,100);const target=new THREE.Vector3(3.85,0,3.31);
 camera.position.set(12.9,14,13.7);camera.lookAt(target);
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.65;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 host.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=false;
 controls.minDistance=4.5;controls.maxDistance=30;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI/2.12;
 controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
 const matCache=new Map();
 const mat=(color,roughness=.85,metalness=0,opacity=1)=>{
   const key=[color,roughness,metalness,opacity].join(':');if(!matCache.has(key))matCache.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1}));
   return matCache.get(key);
 };
 const wallMat=mat('#e9e8df'),edgeMat=mat('#405147'),wood=mat('#c9ac89'),tile=mat('#dddcd4'),white=mat('#fafaf5'),pillow=mat('#f7f6ef'),sage=mat('#91a88d'),sageLight=mat('#b2c0ac'),bronze=mat('#b39c79',.55,.40),glass=mat('#b6d5d0',.28,.15,.30);
 const body=new THREE.Group();scene.add(body);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(24,24),mat('#ebe9e2'));
 ground.rotation.x=-Math.PI/2;ground.position.set(3.85,-.21,3.3);ground.receiveShadow=true;scene.add(ground);
 scene.add(new THREE.HemisphereLight('#fffefa','#829287',3.15));
 const sun=new THREE.DirectionalLight('#fff8e9',3.25);sun.position.set(-4,13,-7);
 sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.00025;sun.shadow.normalBias=.018;scene.add(sun);
 const fill=new THREE.DirectionalLight('#d6e2e2',1.0);fill.position.set(10,6,10);scene.add(fill);
 const box=(group,x,z,w,d,h,m,y=0,roomId=null)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof m==='string'?mat(m):m);
  mesh.position.set(x+w/2,y+h/2,z+d/2);mesh.castShadow=h>.14;mesh.receiveShadow=true;
  if(roomId)mesh.userData.roomId=roomId;group.add(mesh);return mesh;
 };
 const cyl=(group,x,z,r,h,m,y=0)=>{const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,28),typeof m==='string'?mat(m):m);mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh};
 const floorColors={kitchen:'#e4dfd5',wc:'#d7e0de',bath:'#d6e0dd',living:'#c7aa88',hall:'#e9e4da',bedroom:'#cbae8c',dressing:'#d4b595',balcony:'#e6e4db'};
 let settings={room,furniture,cutaway,proposal};const pickables=[];
 function drawFloors(g){
  for(const r of rooms){
   const m=box(g,r.x,r.y,r.w,r.d,.10,mat(floorColors[r.id]),-.12,r.id);m.castShadow=false;pickables.push(m);
   if(['living','bedroom','dressing'].includes(r.id)){
    for(let q=.23;q<r.w-.1;q+=.27)box(g,r.x+q,r.y,.009,r.d,.004,mat('#ac9279'),-.015);
   }else if(['kitchen','wc','bath','hall','balcony'].includes(r.id)){
    for(let q=.5;q<r.w;q+=.53)box(g,r.x+q,r.y,.009,r.d,.003,mat('#bec7bf'),-.011);
   }
  }
  // A rug softens the public area without changing walking clearance.
  box(g,2.36,1.21,1.88,2.17,.018,mat('#eae4d7'),.005,'living');
  box(g,5.20,2.40,2.26,2.03,.018,mat('#e5dfd1'),.005,'bedroom');
 }
 function drawWalls(g){
  for(const [x,z,X,Z,kind] of walls){
   const long=Math.hypot(X-x,Z-z),thick=kind==='outer'?.15:.105;
   const h=settings.cutaway?(kind==='outer'?.45:.60):2.57;
   const object=new THREE.Mesh(new THREE.BoxGeometry(long||.1,h,thick),kind==='glass'?glass:wallMat);
   object.position.set((x+X)/2,h/2-.02,(z+Z)/2);
   object.rotation.y=-Math.atan2(Z-z,X-x);
   if(kind!=='glass'){object.castShadow=true;object.receiveShadow=true}
   g.add(object);
   if(settings.cutaway&&kind!=='glass'){
    const cap=new THREE.Mesh(new THREE.BoxGeometry(long||.1,.035,thick+.015),edgeMat);
    cap.position.set((x+X)/2,h-.01,(z+Z)/2);cap.rotation.y=object.rotation.y;g.add(cap);
   }
  }
  for(const [x,z,X,Z]of glazing){
   const len=Math.hypot(X-x,Z-z),glassPane=box(g,Math.min(x,X),Math.min(z,Z),Math.max(.025,Math.abs(X-x)),Math.max(.025,Math.abs(Z-z)),settings.cutaway?.60:2.20,glass,0);
   glassPane.castShadow=false;
   // Thin mullion / sill; window dimensions are conceptual.
   box(g,Math.min(x,X),Math.min(z,Z),Math.max(.02,Math.abs(X-x)),Math.max(.02,Math.abs(Z-z)),.055,bronze,.36);
   if(len>1.4&&Math.abs(Z-z)<.01)box(g,(x+X)/2-.015,z-.035,.03,.07,settings.cutaway?.6:2.2,white);
  }
  if(settings.proposal){
   const marker=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(2.17,.06,4.03),new THREE.Vector3(4.61,.06,4.03)]),new THREE.LineDashedMaterial({color:'#b57a55',dashSize:.15,gapSize:.09}));
   marker.computeLineDistances();g.add(marker);
  }
 }
 function furnitureMesh(g,p){
  const x=p.x,z=p.y,w=p.w,d=p.d,id=p.room,co=(color)=>mat(color);
  const cabinet=()=>{box(g,x,z,w,d,p.h,white,0,id);box(g,x+.015,z+.015,w-.03,d-.03,.035,wood,p.h,id)};
  switch(p.type){
   case 'cabinet':cabinet();break;
   case 'fridge':box(g,x,z,w,d,p.h,mat('#e5e7e3'),0,id);box(g,x+w-.06,z+.12,.018,d-.24,.018,bronze,1.18,id);break;
   case 'washer':
    cabinet();
    {const front=new THREE.Mesh(new THREE.CylinderGeometry(.185,.185,.017,32),mat('#9aaea8',.27,.05));front.rotation.z=Math.PI/2;front.position.set(x+w+.007,.46,z+d/2);g.add(front);}
    break;
   case 'hob':
    box(g,x,z,w,d,.87,white,0,id);box(g,x+.015,z+.02,w-.03,d-.04,.035,mat('#38463e',.25),.87,id);
    for(const dx of [.15,.38])for(const dz of [.18,.44]){
      const ring=cyl(g,x+dx,z+dz,.08,.003,mat('#899b92',.35),.91);ring.castShadow=false;
    }break;
   case 'sink':
    box(g,x,z,w,d,p.h,white,0,id);
    box(g,x+.07,z+.07,w-.14,d-.14,.024,mat('#9fb6b1',.34,.1),p.h,id);
    box(g,x+.12,z+.11,w-.24,d-.22,.025,mat('#d5e0db'),p.h+.02,id);
    break;
   case 'sofa':
    box(g,x,z,w,d,.27,sage,.09,id);
    box(g,x+.05,z+.10,w-.11,d-.20,.28,sageLight,.27,id);
    box(g,x-.025,z,.17,d,.69,sage,0,id);
    box(g,x+.06,z-.015,w-.10,.14,.47,sage,0,id);
    box(g,x+.06,z+d-.12,w-.10,.14,.47,sage,0,id);
    for(const k of [0,1])box(g,x+.11,z+.16+k*.75,w-.22,.63,.05,mat(k?'#acbba6':'#d9ded1'),.55,id);
    break;
   case 'coffee':cyl(g,x+w/2,z+d/2,w/2,.075,wood,.40);cyl(g,x+w/2,z+d/2,.115,.40,mat('#8a7b67'),0);break;
   case 'tv':
    box(g,x,z,w,d,.7,mat('#323f39',.18),.85,id);box(g,x+.018,z+.07,w+.015,d-.14,.56,mat('#5c6763',.18),.92,id);break;
   case 'bed':
    box(g,x,z,w,d,.28,wood,.02,id);box(g,x+.06,z+.07,w-.12,d-.14,.23,mat('#f1eee7'),.30,id);
    box(g,x+.08,z+.10,w-.16,d-.20,.055,sageLight,.53,id);
    for(const side of [0,1])box(g,x+w-.56,z+.14+side*.78,.46,.56,.10,pillow,.58,id);
    box(g,x+w-.05,z-.06,.10,d+.12,1.02,mat('#c0ad98'),0,id);
    break;
   case 'wardrobe':
    box(g,x,z,w,d,p.h,mat('#e7ddce'),0,id);
    for(let i=1;i<5;i++)box(g,x+i*w/5-.012,z+.014,.012,d-.03,p.h-.06,mat('#bdaf99'),.02,id);
    for(let i=0;i<5;i++)box(g,x+i*w/5+.07,z-.011,.018,.014,.12,bronze,1.06,id);
    break;
   case 'shower':
    box(g,x,z,w,d,.10,mat('#b9ceca'),0,id);
    box(g,x+.04,z+.04,w-.08,d-.08,.02,mat('#dce9e5'),.10,id);
    box(g,x+w-.04,z+.03,.022,d-.06,settings.cutaway?.45:1.75,glass,.1,id);break;
   case 'toilet':
    box(g,x+.06,z+.08,w-.12,d-.12,.25,white,.02,id);
    {const bowl=cyl(g,x+w/2,z+d/2,.22,.10,white,.32);bowl.userData.roomId=id;}break;
   default:cabinet();
  }
 }
 function drawFurniture(g){
  if(!settings.furniture)return;
  for(const p of pieces){const fGroup=new THREE.Group();fGroup.userData.roomId=p.room;g.add(fGroup);furnitureMesh(fGroup,p)}
  // Underlit side tables, plants and a small office console bring scale to the rooms.
  cyl(g,7.42,3.73,.16,.40,mat('#c8b7a0'),.0);
  const plant=(x,z)=>{
    cyl(g,x,z,.11,.18,mat('#b7a78c'),0);
    for(let i=0;i<7;i++){
     const leaf=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),mat('#708d6a'));
     const angle=i*Math.PI*2/7;leaf.scale.set(.68,1.3,.43);
     leaf.position.set(x+Math.cos(angle)*.12,.29+(i%3)*.035,z+Math.sin(angle)*.12);g.add(leaf);
    }
  };
  plant(7.35,.43);plant(7.35,4.75);
  // Ceiling-free wall lighting accents and understated plinths.
  box(g,3.37,.30,.86,.33,.04,mat('#d7c9b6'),.49);
 }
 function rebuild(){
  while(body.children.length){
   const c=body.children[0];body.remove(c);
   c.traverse?.(o=>{if(o.isMesh)o.geometry.dispose();else if(o.isLine)o.geometry.dispose()});
  }
  pickables.length=0;
  drawFloors(body);drawWalls(body);drawFurniture(body);render();
 }
 function render(){if(host.clientWidth>0&&host.clientHeight>0)renderer.render(scene,camera)}
 function resize(){
  const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);render();
 }
 function focus(id){
  const r=roomById(id);
  if(!r){controls.target.set(3.85,0,3.31);camera.position.set(12.9,14,13.7)}
  else{
   const cx=r.x+r.w/2,cz=r.y+r.d/2;
   controls.target.set(cx,.12,cz);
   const f=['balcony','wc','bath'].includes(id)?5.1:6.5;
   camera.position.set(cx+f*.85,f*1.05,cz+f*.83);
  }
  controls.update();render();
 }
 const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster();let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
 renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
  const b=renderer.domElement.getBoundingClientRect();
  pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);
  raycaster.setFromCamera(pointer,camera);
  const hits=raycaster.intersectObjects(body.children,true);
  for(const h of hits){
   let o=h.object;while(o&&!o.userData.roomId)o=o.parent;
   if(o?.userData.roomId){onRoom(o.userData.roomId);break}
  }
 });
 controls.addEventListener('change',render);
 const observer=new ResizeObserver(resize);observer.observe(host);
 rebuild();focus(settings.room);resize();
 return {
  setRoom(id){settings.room=id;focus(id)},
  setFurniture(v){settings.furniture=v;rebuild()},
  setCutaway(v){settings.cutaway=v;rebuild()},
  setProposal(v){settings.proposal=v;rebuild()},
  zoom(v){camera.position.sub(controls.target).multiplyScalar(1/v).add(controls.target);controls.update();render()},
  reset(){focus('all')},resize,
  dispose(){observer.disconnect();controls.dispose();body.traverse(o=>{if(o.geometry)o.geometry.dispose()});ground.geometry.dispose();for(const m of matCache.values())m.dispose();renderer.dispose();renderer.domElement.remove()}
 };
}
