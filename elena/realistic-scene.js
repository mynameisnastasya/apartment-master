import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {outline,rooms,openingsFor,slidingPanels,wallsFor} from './data.js';
import {ergonomicStudy} from './ergonomics.js';

// All surfaces are generated locally, in physical metres. No external model/texture CDN.
// Geometry and object origins still come exclusively from the dimensioned plan.
const TAU=Math.PI*2;
function rng(seed=431){return()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)}
function surface(kind){
 const size=512,c=document.createElement('canvas');c.width=c.height=size;
 const ctx=c.getContext('2d'),im=ctx.createImageData(size,size),rand=rng();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let v=235;
  if(kind==='oak'){
   const wave=x+5*Math.sin(y*.013)+2*Math.sin(y*.047+x*.016);
   v=207+13*Math.sin(wave*.17)+6*Math.sin(wave*.83)+3*Math.sin(wave*2.7)+(rand()-.5)*14;
  }else if(kind==='linen')v=230+((x%4<2)===(y%4<2)?11:-11)+(rand()-.5)*18;
  else if(kind==='stone')v=235+1.5*Math.sin(x*.031+Math.sin(y*.024)*2)+(rand()-.5)*10;
  else v=237+(rand()-.5)*17;
  const i=(y*size+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255;
 }
 ctx.putImageData(im,0,0);
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;
 const bump=map.clone();bump.colorSpace=THREE.NoColorSpace;bump.needsUpdate=true;
 return {map,bump};
}
function createMaterials(onLoad){
 const cache=new Map(),textures=new Map(),loader=new THREE.TextureLoader();
 let pending=0;
 function scanned(file,srgb=false){if(textures.has(file))return textures.get(file);pending++;const t=loader.load('elena/textures/'+file,()=>{pending--;onLoad()},undefined,()=>{pending--;onLoad()});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;textures.set(file,t);return t;}
 const lookup=(kind,color='#ffffff')=>{
  const key=kind+color;if(cache.has(key))return cache.get(key);
  const p={color,roughness:.7};
  if(['oak','linen','stone','plaster'].includes(kind)){
   if(!textures.has(kind))textures.set(kind,surface(kind));
   const tex=textures.get(kind),map=tex.map.clone(),bumpMap=tex.bump.clone();
   const rep=kind==='linen'?5:kind==='plaster'?3:1;map.repeat.set(rep,rep);bumpMap.repeat.copy(map.repeat);
   Object.assign(p,{map,bumpMap,bumpScale:kind==='linen'?.0006:kind==='oak'?.0008:.0004,roughness:kind==='stone'?.48:.84});
  }
  if(kind==='oak'||kind==='floor'){
   const asset=kind==='floor'?'wood_floor':'wood_table_001';
   p.map=scanned(asset+'_diff_1k.jpg',true);p.normalMap=scanned(asset+'_nor_gl_1k.jpg');p.normalScale=new THREE.Vector2(.16,.16);p.bumpMap=null;p.roughness=.68;p.color=kind==='floor'?'#faf3e5':'#f0e4d2';
  }
  if(kind==='linen'){p.normalMap=scanned('rough_linen_nor_gl_1k.jpg');p.normalScale=new THREE.Vector2(.18,.18);p.bumpMap=null;}
  if(kind==='metal')Object.assign(p,{metalness:.85,roughness:.28});
  if(kind==='ceramic')Object.assign(p,{roughness:.16,clearcoat:.7,clearcoatRoughness:.15});
  if(kind==='glass')Object.assign(p,{roughness:.06,metalness:.18,transparent:true,opacity:.08,depthWrite:false,side:THREE.DoubleSide});
  if(kind==='screen')Object.assign(p,{roughness:.17,metalness:.25});
  if(kind==='glow')Object.assign(p,{emissive:color,emissiveIntensity:2.5,roughness:.45});
  if(kind==='linen')Object.assign(p,{sheen:.65,sheenColor:new THREE.Color(color),sheenRoughness:.9});
  const m=new THREE.MeshPhysicalMaterial(p);m.name=key;cache.set(key,m);return m;
 };
 lookup.pending=()=>pending;return lookup;
}
export function createApartmentViewer(host,{onSelect,onError}){
 const scene=new THREE.Scene(),mat=createMaterials(()=>render());
 scene.background=new THREE.Color('#e6e2da');
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 renderer.shadowMap.autoUpdate=false;host.append(renderer.domElement);
 let camera=new THREE.PerspectiveCamera(38,1,.025,100);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;
 const composer=new EffectComposer(renderer),ao=new SSAOPass(scene,camera,512,512,16);
 ao.kernelRadius=.18;ao.minDistance=.00015;ao.maxDistance=.035;
 composer.renderTarget1.samples=4;composer.renderTarget2.samples=4;composer.addPass(new RenderPass(scene,camera));composer.addPass(ao);composer.addPass(new OutputPass());
 const pmrem=new THREE.PMREMGenerator(renderer),roomEnvironment=new RoomEnvironment();
 const environment=pmrem.fromScene(roomEnvironment,.025);scene.environment=environment.texture;scene.environmentIntensity=.38;
 roomEnvironment.dispose();pmrem.dispose();RectAreaLightUniformsLib.init();
 const sky=new THREE.HemisphereLight('#e5efff','#a4937f',.8);scene.add(sky);
 const sun=new THREE.DirectionalLight('#fff1d7',2.2);sun.position.set(-3,8,13);sun.target.position.set(2.5,0,3.5);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:30});sun.shadow.normalBias=.025;sun.shadow.bias=-.0003;sun.shadow.radius=3;scene.add(sun,sun.target);
 const bounce=new THREE.DirectionalLight('#e6edff',.5);bounce.position.set(8,7,-2);scene.add(bounce);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),mat('plaster','#e6e2da'));ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);
 let root,options,preset='overview',evening=false,items=[],ceilings=[],roomLights=[],renderPending=false;
 let active=true,renderFrame=0,renderCount=0,buildCount=0;
 // One coalesced frame per interaction. No sample accumulation or idle render loop.
 const render=()=>{
  if(!active||document.hidden||renderPending||!root||!host.clientWidth)return;
  renderPending=true;renderFrame=requestAnimationFrame(()=>{
   renderPending=false;if(!active||document.hidden||!host.clientWidth)return;
   ao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
   ao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
   composer.render();renderCount++;
  });
 };
 function setActive(value){active=value;if(!value){cancelAnimationFrame(renderFrame);renderPending=false}else render()}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(renderFrame);renderPending=false}else render()});
 controls.addEventListener('change',render);
 function mesh(parent,geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function box(parent,x,y,z,w,h,d,m,r=.012){return mesh(parent,new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/2.2,h/2.2,d/2.2)),m,x,y+h/2,z)}
 function cyl(parent,x,y,z,r,h,m,r2=r){return mesh(parent,new THREE.CylinderGeometry(r2,r,h,32),m,x,y+h/2,z)}
 function ball(parent,x,y,z,w,h,d,m){const a=mesh(parent,new THREE.SphereGeometry(1,32,20),m,x,y,z);a.scale.set(w/2,h/2,d/2);return a}
 function tube(parent,points,r,m){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),m)}
 function rod(parent,a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av);const aMesh=cyl(parent,0,0,0,r,v.length(),m);aMesh.position.copy(av.add(bv).multiplyScalar(.5));aMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return aMesh}
 function floor(poly,m,height=0){const s=new THREE.Shape();poly.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:false});geo.rotateX(-Math.PI/2);return mesh(root,geo,m,0,height-.06,0)}
 function rug(x,z,w,d){const r=box(root,x,.024,z,w,.015,d,mat('linen','#c5bba7'),.02);r.castShadow=false;}
 function woodFloor(room){
  const m=mat('floor',options.variant.id==='3'?'#ac9274':'#dfc29b');const f=floor(room.poly,m,.015);
  // World-space floor UVs preserve grain scale across differently shaped rooms.
  const uv=f.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/1.7,uv.getY(i)/1.7);uv.needsUpdate=true;

 }
 function wall(w){
  const length=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),h=options.cutaway?.7:2.6;
  const g=new THREE.Group();g.position.set((w.a[0]+w.b[0])/2,0,(w.a[1]+w.b[1])/2);g.rotation.y=-Math.atan2(w.b[1]-w.a[1],w.b[0]-w.a[0]);root.add(g);
  if(w.kind==='glass'){
   const gh=options.cutaway?1.25:2.5,frame=mat('metal','#504c41');box(g,0,.04,0,length,gh,.018,mat('glass','#c6dad8'),.001);
   for(let x=-length/2;x<=length/2+.01;x+=length/Math.ceil(length/.8))box(g,x,.04,0,.018,gh,.035,frame,.002);
   for(const y of[.04,gh])box(g,0,y,0,length,.025,.04,frame,.002);
   return;
  }
  box(g,0,0,0,length,h,w.t,mat('plaster','#ece5da'),.006);
  for(const side of[-1,1])box(g,0,.025,side*(w.t/2+.009),length,.075,.016,mat('plain','#e4dcd0'),.003);
  box(g,0,h-.006,0,length,.008,w.t,mat('plain','#d0c8bb'),.001);
 }
 function pillow(parent,x,y,z,w,d,color,tilt=0){
  const group=new THREE.Group();group.position.set(x,y+.08,z);group.rotation.x=tilt;group.rotation.z=.025*Math.sin(x*17);parent.add(group);
  const g=new THREE.SphereGeometry(1,48,32),p=g.attributes.position,pow=v=>Math.sign(v)*Math.pow(Math.abs(v),.48);
  for(let i=0;i<p.count;i++){const a=pow(p.getX(i)),b=pow(p.getY(i)),c=pow(p.getZ(i));p.setXYZ(i,a*w/2,b*.09+.003*Math.sin(a*29+c*17),c*d/2)}g.computeVertexNormals();mesh(group,g,mat('linen',color));
  const seam=[];for(let i=0;i<=64;i++){const a=i/64*TAU;seam.push([pow(Math.cos(a))*(w/2+.001),0,pow(Math.sin(a))*(d/2+.001)])}tube(group,seam,.0015,mat('linen',color));
  return group;
 }
 function duvet(parent,W,D,accent){
  function height(x,z){const edge=Math.max(0,(Math.abs(x)-(W/2-.12))/.16);return .625+.009*Math.sin(x*12+z*5)+.005*Math.sin(z*23+x*8)+.035*Math.exp(-Math.pow((x+.24*Math.sin(z*2)-.2)/.065,2))*Math.exp(-z*z/2)-edge*edge*.17;}
  const g=new THREE.PlaneGeometry(W+.08,D*.75,64,72),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=-p.getY(i)+D*.13;p.setXYZ(i,x,height(x,z),z)}g.computeVertexNormals();const cloth=mat('linen','#e9e4d9');cloth.side=THREE.DoubleSide;mesh(parent,g,cloth);
  box(parent,0,.63,-D*.21,W-.045,.045,.17,mat('linen','#f4f0e5'),.02);
  const throwGeo=new THREE.PlaneGeometry(W+.07,.49,64,28),tp=throwGeo.attributes.position;
  for(let i=0;i<tp.count;i++){const x=tp.getX(i),z=-tp.getY(i)+D*.32;tp.setXYZ(i,x,height(x,z)+.018+.003*Math.sin(x*21+z*12),z)}throwGeo.computeVertexNormals();
  const throwMat=mat('linen',accent);throwMat.side=THREE.DoubleSide;mesh(parent,throwGeo,throwMat);
 }
 function vase(parent,x,y,z){const ceramic=mat('ceramic','#b5997d');const points=[[.06,0],[.09,.03],[.1,.13],[.065,.2],[.04,.23]].map(p=>new THREE.Vector2(...p));mesh(parent,new THREE.LatheGeometry(points,32),ceramic,x,y,z);for(let i=0;i<5;i++){const dx=Math.sin(i*2)*.12,dz=Math.cos(i*2)*.09;tube(parent,[[x,y+.16,z],[x+dx*.4,y+.37,z+dz*.4],[x+dx,y+.48+(i%2)*.07,z+dz]],.002,mat('plain','#746d4d'));const leaf=ball(parent,x+dx,y+.43,z+dz,.07,.13,.016,mat('plain','#849076'));leaf.rotation.z=i*.7}}
 function furniture(f){
  const group=new THREE.Group();group.position.set(f.x+f.w/2,0,f.y+f.d/2);root.add(group);let W=f.w,D=f.d;
  if((['sofa','desk','chair'].includes(f.type)&&W<D)||(f.type==='bed'&&W>D)){[W,D]=[D,W];group.rotation.y=Math.PI/2;}
  if(f.yaw!==undefined)group.rotation.y=f.yaw;
  if(f.target){const t=options.variant.furniture.find(a=>a.id===f.target);group.rotation.y=Math.atan2(t.x+t.w/2-f.x-f.w/2,t.y+t.d/2-f.y-f.d/2)}
  const oak=mat('oak',options.variant.id==='3'?'#987655':'#c6a982'),linen=mat('linen','#d5cdbc'),metal=mat('metal','#71624f'),stone=mat('stone','#e5dfd0'),white=mat('ceramic','#eeeae1'),dark=mat('screen','#222724');
  const b=(x,y,z,w,h,d,m=oak,r)=>box(group,x,y,z,w,h,d,m,r);
  const leg=(x,z,h=.7)=>{rod(group,[x*1.05,.035,z*1.05],[x,h,z],.019,oak)};
  if(f.type==='bed'){
   const mw=f.mattress.w,md=f.mattress.d;
   for(const x of[-W*.39,W*.39])for(const z of[-D*.38,D*.38])cyl(group,x,.025,z,.027,.16,metal);
   b(0,.14,0,W,.19,D,mat('linen','#a99e8c'),.05);
   b(0,.33,0,mw,.235,md,mat('linen','#f5f0e7'),.065);
   for(const y of[.36,.535]){const pts=[];for(let i=0;i<=72;i++){const a=i/72*TAU;pts.push([Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.2)*(mw/2-.018),y,Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.2)*(md/2-.018)])}tube(group,pts,.002,mat('linen','#dbd4c9'))}
   b(0,.16,-D/2+.035,W,.92,.075,mat('linen','#b8ab96'),.035);
   for(let x=-W/2+.14;x<W/2;x+=.22)b(x,.19,-D/2+.079,.003,.84,.003,mat('linen','#aa9b84'),.001);
   duvet(group,mw,md,options.variant.color);
   for(const x of[-mw*.245,mw*.245]){pillow(group,x,.59,-D/2+.33,mw*.43,.5,'#eee9df',-.18)}
  }else if(f.type==='sofa'){
   for(const x of[-W*.4,W*.4])for(const z of[-D*.34,D*.34])cyl(group,x,.025,z,.024,.13,metal);
   b(0,.13,0,W-.06,.22,D-.04,linen,.07);
   const n=2,cw=(W-.25)/n;
   for(let i=0;i<n;i++){const x=-W/2+.125+cw*(i+.5);b(x,.345,.055,cw-.014,.18,D-.23,linen,.065);const back=b(x,.46,-D/2+.135,cw-.014,.35,.21,linen,.07);back.rotation.x=-.12;}
   for(const x of[-W/2+.06,W/2-.06])b(x,.27,0,.12,.34,D-.035,linen,.05);
   pillow(group,-W*.27,.51,-D*.13,.35,.33,options.variant.color,-.8);pillow(group,W*.27,.51,-D*.14,.32,.3,'#b18c6e',-.65);
  }else if(f.type==='chair'){
   for(const x of[-W*.31,W*.31])for(const z of[-D*.3,D*.3])leg(x,z,.43);
   b(0,.425,0,W-.03,.065,D-.035,mat('linen','#b7b49e'),.032);
   // Curved upholstered back rather than a cuboid backrest.
   const curve=[];for(let i=0;i<=16;i++){const x=-W/2+.035+(W-.07)*i/16;curve.push(new THREE.Vector2(x,-D*.37+.1*Math.pow(x/(W/2),2)))}
   for(let i=0;i<curve.length-1;i++){const a=curve[i],c=curve[i+1];const slat=b((a.x+c.x)/2,.53,(a.y+c.y)/2,(c.x-a.x)+.004,.27,.055,mat('linen','#b7b49e'),.017);slat.rotation.y=-Math.atan2(c.y-a.y,c.x-a.x)}
   for(const x of[-W*.36,W*.36])rod(group,[x,.42,-D*.31],[x,.76,-D*.34],.014,oak);
  }else if(f.type==='shelf'){
   b(0,f.h-.035,0,W,.035,D,oak,.012);
  }else if(f.type==='table'||f.type==='desk'){
   const topMat=f.h<.5?stone:oak;b(0,f.h-.035,0,W,.035,D,topMat,.017);
   for(const x of[-W*.39,W*.39])for(const z of[-D*.34,D*.34])leg(x,z,f.h-.035);
   if(f.type==='desk'){
    b(0,f.h,-.13,.25,.015,.16,metal);b(0,f.h+.015,-.19,.028,.16,.028,metal);
    b(0,f.h+.14,-.19,.57,.34,.02,dark,.006);b(0,f.h+.16,-.178,.53,.298,.002,mat('screen','#74817d'),.001);
    b(-.035,f.h,.12,.31,.012,.105,mat('plain','#e5e0d4'),.006);for(let i=0;i<10;i++)b(-.17+i*.029,f.h+.012,.12,.022,.002,.085,mat('plain','#c7c7bd'),.001);
    ball(group,.22,f.h+.015,.13,.045,.025,.07,white);cyl(group,W*.36,f.h,.15,.04,.08,white);
    b(-W*.34,f.h,-.12,.16,.025,.22,mat('plain','#b29b7c'),.003);
   }else if(f.h>.5){vase(group,0,f.h,0);for(const side of[-1,1]){const across=f.id==='table'&&options.variant.id==='5',x=across?side*W*.29:0,z=across?0:side*D*.29;cyl(group,x,f.h,z,.105,.007,white);cyl(group,x,f.h+.008,z,.075,.004,white)}}
   else{b(.03,f.h,-.015,W*.6,.025,D*.6,mat('plain','#aa9274'),.002);vase(group,-W*.2,f.h,0)}
  }else if(['wardrobe','cabinet','fridge','foldbed'].includes(f.type)){
   b(0,.055,0,W,f.h-.055,D,oak,.007);const horizontal=['north','south'].includes(f.front),front=['south','east'].includes(f.front)?1:-1,length=horizontal?W:D,n=Math.max(1,Math.round(length/.55));
   for(let i=0;i<n;i++){
    const a=-length/2+(i+.5)*length/n;
    const face=f.curtain?mat('linen','#d5cdbc'):f.type==='fridge'?mat('plain','#d8d3c6'):mat('plaster',options.variant.id==='3'?'#c5bcac':'#dcd4c5');
    if(horizontal){b(a,.075,front*(D/2+.002),length/n-.004,f.h-.085,.018,face,.002);if(!f.curtain)b(a+length/n*.28,.82,front*(D/2+.016),.009,.22,.018,metal,.003)}
    else{b(front*(W/2+.002),.075,a,.018,f.h-.085,length/n-.004,face,.002);b(front*(W/2+.016),.82,a+length/n*.28,.018,.22,.009,metal,.003)}
   }
   if(f.curtain){for(let x=-W/2+.025;x<W/2;x+=.045)b(x,.08,-D/2-.008,.028,f.h-.12,.024,linen,.01)}
   if(f.type==='fridge')b(-W/2-.015,.68,0,.005,.006,D-.02,metal,.001);
   if(f.id==='tv'){
    // TV follows the slim console and faces the sofa along the room's X axis.
    b(-W/2-.015,.75,0,.025,.52,D*.96,dark,.009);b(-W/2-.03,.765,0,.002,.48,D*.92,mat('screen','#333c3a'),.001);
    b(0,f.h,-D*.28,W*.8,.04,.18,mat('plain','#b69773'),.003);
   }
  }else if(f.type==='kitchen'){
   b(0,.055,0,W,.65,D,oak,.005);
   for(const module of f.modules){const z=-D/2+module.offset+module.width/2;b(-W/2-.004,.075,z,.018,.765,module.width-.004,mat('plaster','#c9beaa'),.002);b(-W/2-.018,.793,z,.02,.013,module.width-.05,metal,.002)}
   const moduleCenter=id=>{const m=f.modules.find(m=>m.id===id);return -D/2+m.offset+m.width/2};
   // Split countertop around the recessed steel sink; no painted-on basin.
   const sz=moduleCenter('sink'),sw=.42,sd=.46,stoneTop=(x,z,w,d)=>b(x,.855,z,w,.038,d,stone,.006);
   stoneTop(0,(-D/2+sz-sd/2)/2,W+.02,sz-sd/2+D/2);stoneTop(0,(sz+sd/2+D/2)/2,W+.02,D/2-sz-sd/2);
   for(const side of[-1,1])stoneTop(side*(sw/2+(W-sw)/4),sz,(W-sw)/2+.01,sd);
   b(0,.72,sz,sw,.018,sd,mat('metal','#939b96'),.02);for(const x of[-sw/2,sw/2])b(x,.73,sz,.012,.15,sd,mat('metal','#a1a6a0'));
   for(const z of[sz-sd/2,sz+sd/2])b(0,.73,z,sw,.15,.012,mat('metal','#a1a6a0'));cyl(group,0,.74,sz,.024,.003,metal);
   tube(group,[[.23,.9,sz],[.23,1.14,sz],[.18,1.2,sz],[.04,1.2,sz],[.015,1.13,sz]],.012,mat('metal','#b9bab2'));
   const hob=moduleCenter('hob');b(0,.895,hob,.49,.012,.55,dark,.008);for(const x of[-.13,.13])for(const z of[hob-.15,hob+.15]){const r=mesh(group,new THREE.TorusGeometry(.076,.002,5,36),mat('metal','#727a74'),x,.909,z);r.rotation.x=Math.PI/2;}
   b(-W/2-.02,.18,hob,.026,.46,.49,dark,.008);b(-W/2-.04,.6,hob,.025,.018,.4,metal,.004);for(const z of[hob-.17,hob+.17]){const knob=cyl(group,-W/2-.043,.7,z,.018,.016,metal);knob.rotation.z=Math.PI/2;}
   if(!options.cutaway){b(.17,.895,0,.018,.62,D,stone,.002);b(.07,1.56,0,.44,.91,D,mat('plaster','#ded7c8'),.006);for(let i=1;i<5;i++)b(-.155,1.57,-D/2+i*D/5,.003,.89,.004,metal,.001);b(-.13,1.545,0,.035,.009,D-.08,mat('glow','#ffdb9d'),.001)}
  }else if(f.type==='bath'){
   b(0,.04,0,W,.49,D,white,.07);
   // Continuous bowl with a rolled rim and visible depth.
   const basin=ball(group,0,.515,0,W-.15,.13,D-.14,mat('ceramic','#c5cdc7'));basin.scale.y=-Math.abs(basin.scale.y);basin.material.side=THREE.DoubleSide;
   b(0,.49,0,W-.3,.01,D-.25,white,.07);tube(group,[[W*.33,.54,-D*.38],[W*.33,.72,-D*.38],[W*.33,.76,-D*.2],[W*.33,.69,-D*.13]],.012,metal);
  }else if(f.type==='sink'){
   b(0,.1,0,W,.58,D,oak,.012);b(0,.69,0,W,.035,D,stone,.01);
   const basin=cyl(group,0,.725,0,1,.105,white);basin.scale.set(W*.47,1,D*.46);
   ball(group,0,.823,0,W*.7,.025,D*.65,mat('ceramic','#c4cac2'));
   tube(group,[[0,.73,-D*.4],[0,.99,-D*.4],[0,.99,-D*.2],[0,.94,-D*.16]],.009,metal);
  }else if(f.type==='toilet'){
   ball(group,0,.24,.06,W*.75,.42,D*.72,white);const seat=mesh(group,new THREE.TorusGeometry(1,.13,12,48),white,0,.43,.05);seat.rotation.x=Math.PI/2;seat.scale.set(W*.4,D*.37,.14);
   b(0,.42,.05,W*.87,.025,D*.66,white,.012);b(0,.1,-D*.36,W*.85,.56,.15,white,.03);
  }else if(f.type==='washer'){
   b(0,.04,0,W,.8,D,white,.018);b(0,.71,D/2+.001,W-.04,.09,.01,mat('plain','#dedfd7'),.002);
   const ring=mesh(group,new THREE.TorusGeometry(.185,.026,16,48),mat('metal','#a8aca7'),0,.405,D/2+.016);
   const disc=mesh(group,new THREE.CircleGeometry(.159,48),dark,0,.405,D/2+.02);disc.castShadow=false;
   const knob=cyl(group,W*.26,.75,D/2+.014,.025,.012,metal);knob.rotation.x=Math.PI/2;
   for(let i=0;i<2;i++)b(-.04,.85+i*.045,0,.4,.04,.32,mat('linen',i?'#c0b6a1':'#ece7dc'),.015);
  }
  // Merge only within a selectable object and material. This keeps ray picking intact
  // while avoiding hundreds of draw calls for chair backs, cabinet faces and textiles.
  consolidate(group);group.traverse(o=>{if(o.isMesh){o.userData.item=f;items.push(o)}});
 }
 function consolidate(group){
  group.updateMatrixWorld(true);const batches=new Map(),inverse=group.matrixWorld.clone().invert();
  for(const child of [...group.children])if(child.isMesh&&!child.material.transparent&&!child.userData.ceiling&&!child.userData.temporaryMaterial){const key=child.material.uuid;let list=batches.get(key);if(!list)batches.set(key,list=[]);list.push(child)}
  for(const list of batches.values()){if(list.length<2)continue;const geos=list.map(o=>(()=>{const g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));return g.index?g.toNonIndexed():g})());const joined=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());if(!joined)continue;
   const m=mesh(group,joined,list[0].material);m.castShadow=list.some(o=>o.castShadow);for(const o of list){group.remove(o);o.geometry.dispose()}
  }
 }
 function curtain(x,z,width,height=2.48){
  const g=new THREE.PlaneGeometry(width,height,44,20),p=g.attributes.position;for(let i=0;i<p.count;i++){const a=p.getX(i),b=p.getY(i);p.setXYZ(i,a,b,.035*Math.sin((a/width)*TAU*7)+.008*Math.sin(b*4+a*32))}g.computeVertexNormals();
  const m=mat('linen','#e6dfcf');m.side=THREE.DoubleSide;mesh(root,g,m,x,height/2+.06,z);
 }
 function architecture(){
  floor(outline,mat('stone','#b7ae9f'),-.04);
  for(const room of rooms){if(room.id==='main'||room.id==='balcony')woodFloor(room);else floor(room.poly,mat('stone',room.id==='bath'?'#c4c2b7':'#ded6c5'),.01);}
  for(const room of rooms){const s=new THREE.Shape();room.poly.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const geo=new THREE.ShapeGeometry(s);geo.rotateX(Math.PI/2);const ceil=mesh(root,geo,mat('plaster','#eee8dc'),0,2.6,0);ceil.scale.z=-1;ceil.material.side=THREE.DoubleSide;ceil.castShadow=true;ceil.visible=preset!=='overview';ceil.userData.ceiling=true;ceilings.push(ceil)}
  wallsFor(options.variant).forEach(wall);
  for(const o of openingsFor(options.variant)){
   const len=Math.hypot(o.b[0]-o.a[0],o.b[1]-o.a[1]),g=new THREE.Group();g.position.set((o.a[0]+o.b[0])/2,0,(o.a[1]+o.b[1])/2);g.rotation.y=-Math.atan2(o.b[1]-o.a[1],o.b[0]-o.a[0]);root.add(g);
   if(o.type==='window'){
    const frame=mat('plain','#d8d8cd');box(g,0,0,0,len,.66,.15,mat('plaster','#e7e2d6'));box(g,0,.66,0,len+.06,.035,.25,mat('stone','#e8e0d1'));
    box(g,0,.72,0,len,1.7,.018,mat('glass','#d6e2df'),.001);
    for(let i=0;i<=3;i++)box(g,-len/2+i*len/3,.69,0,.045,1.77,.07,frame,.003);
    for(const y of[.69,2.42])box(g,0,y,0,len,.045,.07,frame,.003);
    if(!options.cutaway){box(g,0,2.46,0,len,.14,.18,mat('plaster','#e8e0d3'));for(const side of[-1,1])curtain(g.position.x+side*(len/2-.14),g.position.z-.17,.34);}
   }else if(!options.cutaway){const frame=mat('oak','#d3c1a5');for(const x of[-len/2+.015,len/2-.015])box(g,x,0,0,.035,2.18,.15,frame,.003);box(g,0,2.17,0,len,.04,.15,frame,.003);box(g,0,2.22,0,len,.38,.12,mat('plaster','#e8e1d5'));}
  }
  if(!options.cutaway){for(const p of slidingPanels(options.variant)){box(root,p.x+p.w/2,.03,p.y+p.d/2,p.w,2.1,p.d,mat('oak','#c6a982'),.003);box(root,p.x+p.w,2.18,p.y+p.d/2,p.w*2,.025,.04,mat('metal','#71624f'),.002)}}
  if(!options.cutaway){
   // Window-facing wall art and a ceiling track anchor the eye-level scale.
   box(root,.014,1.08,3.58,.018,.7,.62,mat('oak','#a08d72'),.002);
   box(root,.026,1.11,3.58,.005,.64,.56,mat('linen','#e1d4bd'),.001);
   ball(root,.034,1.43,3.61,.005,.38,.32,mat('plain','#9b927c'));
   box(root,1.7,2.54,5.2,.035,.025,3.8,mat('metal','#4d4b43'),.003);
   box(root,1.7,2.532,5.2,.027,.008,3.74,mat('glow','#ffe0a5'),.002);
  }
  // Real area emitters produce broad, soft illumination; shadows come from the sun.
  for(const [x,z,w,d] of [[1.6,3.3,1.8,1.2],[1.7,5.3,2.5,3],[4.8,6.3,1.4,2],[3.4,1.4,1.5,1.5],[1.35,8.5,1.9,1]]){
   const light=new THREE.RectAreaLight('#ffe4b9',evening?3.8:1.1,w,d);light.position.set(x,2.53,z);light.rotation.x=-Math.PI/2;root.add(light);roomLights.push(light);
  }
  for(const [x,z,w] of [[1.38,9.42,2.2],[4.85,8.38,1.3]]){const light=new THREE.RectAreaLight('#e8f1ff',evening?.15:2,w,1.5);light.position.set(x,1.65,z);light.lookAt(x,1.3,z-3);light.userData.window=true;root.add(light);roomLights.push(light)}
 }
 function activity(){for(const z of ergonomicStudy(options.variant)?.zones||[]){const m=new THREE.MeshBasicMaterial({color:z.type==='open'?'#be8252':'#659c9a',transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide});const p=mesh(root,new THREE.PlaneGeometry(z.w,z.d),m,z.x+z.w/2,.075,z.y+z.d/2);p.rotation.x=-Math.PI/2;p.castShadow=false;p.userData.temporaryMaterial=true}}
 function build(next){
  options=next;buildCount++;if(root){scene.remove(root);root.traverse(o=>{o.geometry?.dispose();if(o.userData.temporaryMaterial)o.material.dispose()})}
  items=[];ceilings=[];roomLights=[];root=new THREE.Group();scene.add(root);architecture();
  if(options.furniture){
   const bed=options.variant.furniture.find(f=>f.type==='bed');if(bed)rug(bed.x+bed.w/2,bed.y+bed.d/2,bed.w+.12,bed.d+.28);
   for(const f of options.variant.furniture)furniture(f);
  }
  consolidate(root);if(options.ergonomics)activity();renderer.shadowMap.needsUpdate=true;render();
 }
 function setLighting(value){evening=value;sun.intensity=evening?.16:2.2;sky.intensity=evening?.32:.8;bounce.intensity=evening?.12:.5;scene.environmentIntensity=evening?.2:.38;scene.background.set(evening?'#777b80':'#e6e2da');renderer.toneMappingExposure=evening?1.15:.95;roomLights.forEach(l=>l.intensity=l.userData.window?(evening?.15:2):(evening?3.8:1.1));renderer.shadowMap.needsUpdate=true;render()}
 function setPreset(value){
  preset=value;camera.zoom=1;camera.fov=value==='overview'?38:62;camera.updateProjectionMatrix();
  controls.minDistance=value==='overview'?5:.1;controls.maxDistance=value==='overview'?32:9;controls.minPolarAngle=.08;controls.maxPolarAngle=value==='overview'?Math.PI/2.08:Math.PI*.78;
  if(value==='overview'){camera.position.set(10.8,13.5,16.7);controls.target.set(2.7,.2,4.8)}
  else if(value==='living'){
   if(options?.variant.id==='5'){camera.position.set(2.95,1.55,5.17);controls.target.set(1.15,1.05,3.45)}
   else{camera.position.set(2.72,1.55,7.17);controls.target.set(.82,.98,5.3)}
  }else if(value==='kitchen'){camera.position.set(4.25,1.55,8.1);controls.target.set(5.53,1.2,5.72)}
  else{camera.position.set(2.35,1.5,7.95);controls.target.set(.9,1.05,9.3)}
  ceilings.forEach(c=>c.visible=value!=='overview');controls.update();camera.updateMatrixWorld(true);render();
 }
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);composer.setSize(w,h);render()}
 function zoom(factor){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.65,3);camera.updateProjectionMatrix();render()}
 function rotate(){camera.position.sub(controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4).add(controls.target);controls.update();render()}
 let down;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});renderer.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const r=renderer.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(items)[0];if(hit)onSelect(hit.object.userData.item)});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();onError()});new ResizeObserver(resize).observe(host);setPreset('overview');resize();
 return {build,render,resize,zoom,rotate,setPreset,setLighting,setActive,getState:()=>({preset,evening,renderCount,buildCount,meshCount:items.length,renderedItems:[...new Set(items.map(m=>m.userData.item.id))],geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,texturesReady:mat.pending()===0})};
}
