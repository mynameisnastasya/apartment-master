import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {roomsFor,floorZones,wallData,windows,openings,furniture,layoutMeta} from './model.js';

const $=s=>document.querySelector(s);
let layout='balanced',is2d=false,showFurniture=true,cutaway=true,scene,camera,renderer,controls,group,ready=false;
const materials=new Map();
function mat(color,opacity=1){const key=color+opacity;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.83,transparent:opacity<1,opacity}));return materials.get(key);}
function box(x,z,w,d,h,color,y=0,opacity=1,parent=group){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,opacity));mesh.position.set(x+w/2,y+h/2,z+d/2);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function segment(a,h,color,y=0,opacity=1){const [x,z,X,Z]=a;const length=Math.hypot(X-x,Z-z);const m=box((x+X)/2-length/2,(z+Z)/2-.06,length,.12,h,color,y,opacity);m.rotation.y=-Math.atan2(Z-z,X-x);return m;}
function floor(r){box(r.x,r.z,r.w,r.d,.10,r.color,-.10);if(r.finish!=='tile'){for(let z=r.z+.18;z<r.z+r.d;z+=.22)box(r.x,z,r.w,.005,.002,'#b3a48c',.003);}}
function furnish(f){const {x,z,w,d,h,color,type}=f;
 if(type==='bed'){box(x,z,w,d,.22,'#ad9278',.08);box(x+.025,z+.04,w-.05,d-.08,.20,'#f5eee5',.30);box(x+.015,z+.55,w-.03,d-.58,.035,color==='#eee6dc'?'#b9ac97':'#a6b39c',.50);for(let i=0;i<(w>1.1?2:1);i++)box(x+.10+i*.75,z+.14,Math.min(.57,w-.2),.34,.09,'#fbf8f1',.50);box(x,z,w,.09,.90,'#a18c70',0);}
 else if(type==='sofa'){box(x,z,w,d,.28,color,.16);box(x,z,.17,d,.70,color,.10);box(x,z,w,.13,.58,color,.10);box(x,z+d-.13,w,.13,.58,color,.10);for(let i=0;i<2;i++)box(x+.18,z+.17+i*(d-.34)/2,w-.22,(d-.38)/2,.13,'#92a28a',.43);}
 else if(type==='roundtable'){const top=new THREE.Mesh(new THREE.CylinderGeometry(w/2,w/2,.055,40),mat(color));top.position.set(x+w/2,h-.028,z+d/2);top.castShadow=true;group.add(top);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,h-.07,20),mat('#786e59'));leg.position.set(x+w/2,(h-.07)/2,z+d/2);group.add(leg);}
 else if(type==='desk'||type==='table'){box(x,z,w,d,.055,color,h-.055);for(let a of [x+.06,x+w-.09])for(let b of [z+.04,z+d-.07])box(a,b,.035,.035,h-.055,'#786e59');}
 else if(type==='chair'){box(x,z,w,d,.09,color,h-.09);box(x,z+d-.06,w,.06,.40,color,h);for(let a of [x+.03,x+w-.06])for(let b of [z+.03,z+d-.06])box(a,b,.035,.035,h-.09,'#8d765b');}
 else if(type==='shower'){box(x,z,w,d,.09,color);box(x+.05,z+.05,w-.1,d-.1,.015,'#cbd8d5',.09);box(x,z,.025,d,cutaway?.8:2,'#a1c8cb',.10,.30);}
 else if(type==='sink'||type==='basin'){box(x,z,w,d,.07,'#eeeee7',h-.07);box(x+.045,z+.04,w-.09,d-.08,.012,'#9eb2b1',h);box(x+w*.5,z,.025,.025,.20,'#859797',h);}
 else if(type==='toilet'){box(x+w-.15,z,.14,d,.66,'#f4f5ef');const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),mat('#f1f3ed'));mesh.scale.set(w*.44,.20,d*.5);mesh.position.set(x+w*.42,.35,z+d*.5);group.add(mesh);}
 else if(type==='tv'){box(x,z,w,d,.60,color,.75);box(x-.25,z,.25,d,.35,'#b59777');}
 else{box(x,z,w,d,h,color);if(type==='wardrobe'){for(let i=1;i<3;i++)box(x+w*i/3,z+d+.001,.008,.009,h-.03,'#95816b',.02);}if(type==='kitchen'){box(x-.01,z-.01,w+.02,d+.02,.04,'#e9e4d6',h);for(let i=0;i<3;i++)box(x+.05+i*.55,z+d,.46,.014,.72,color,.10);box(x+.64,z+d+.018,.48,.01,.55,'#f5f4ed',.15);}if(type==='hob'){for(let a of [x+.12,x+w-.12])for(let b of [z+.1,z+d-.1]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.01,24),mat('#252e28'));m.position.set(a,h+.01,b);group.add(m);}}}
}
function draw3d(){if(!ready)return;if(group){scene.remove(group);group.traverse(o=>o.geometry?.dispose());}group=new THREE.Group();scene.add(group);
 floorZones(layout).forEach(floor);
 wallData(layout).forEach(a=>{if(a[4]==='glass'){segment(a,cutaway?.58:1.10,'#bd7c4c');if(!cutaway)segment(a,1.60,'#a4c8c5',1.10,.22);}else{const c=a[4]==='proposed'?'#c89670':(a[4]==='outer'?'#e8e3d6':'#f1ede3');segment(a,cutaway?.58:2.70,c);}});
 windows.forEach(a=>{segment(a,.12,'#fbfaf4',cutaway?.58:.85);segment(a,cutaway?.30:1.45,'#a8cbcc',cutaway?.70:.97,.42);});
 if(showFurniture)furniture(layout).forEach(furnish);
}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function svg(){
 let a=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.6 -0.7 7 12.8" role="img" aria-label="Масштабный план квартиры Ксении с мебелью"><rect x="-.6" y="-.7" width="7" height="12.8" fill="#f8f7f2"/>'];
 const rect=(x,y,w,h,fill,stroke='#a49c8c')=>a.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx=".025" fill="'+fill+'" stroke="'+stroke+'" stroke-width=".018"/>');
 const text=(x,y,t,size=.15,anchor='middle')=>a.push('<text x="'+x+'" y="'+y+'" font-family="Arial,sans-serif" font-size="'+size+'" text-anchor="'+anchor+'" fill="#364b3c">'+escapeHtml(t)+'</text>');
 floorZones(layout).forEach(r=>rect(r.x,r.z,r.w,r.d,r.color,'none'));
 if(showFurniture)furniture(layout).forEach(f=>{if(f.type==='roundtable'){a.push('<circle cx="'+(f.x+f.w/2)+'" cy="'+(f.z+f.d/2)+'" r="'+(f.w/2)+'" fill="'+f.color+'" stroke="#a49c8c" stroke-width=".018"/>');}else{rect(f.x,f.z,f.w,f.d,f.color);if(f.type==='bed'){rect(f.x+.05,f.z+.10,f.w-.10,.35,'#fffaf0');rect(f.x+.03,f.z+.60,f.w-.06,f.d-.65,'#c6bca7');}if(f.type==='sofa')rect(f.x,f.z,.16,f.d,'#596f54');}a.push('<title>'+escapeHtml(f.name)+'</title>');});
 wallData(layout).forEach(([x,y,X,Y,type])=>a.push('<path d="M'+x+' '+y+'L'+X+' '+Y+'" stroke="'+(type==='glass'?'#bd7c4c':type==='proposed'?'#c9875d':'#566454')+'" stroke-width=".12" fill="none"/>'));
 windows.forEach(([x,y,X,Y])=>a.push('<path d="M'+x+' '+y+'L'+X+' '+Y+'" stroke="#7db4c0" stroke-width=".065"/>'));
 openings(layout).forEach(([x,y,X,Y])=>a.push('<path d="M'+x+' '+y+'L'+X+' '+Y+'" stroke="#9c8d79" stroke-width=".025" stroke-dasharray=".08 .05"/>'));
 roomsFor(layout).forEach(r=>{text(r.labelX??(r.x+r.w/2),r.labelZ??(r.z+r.d/2),r.name,.15);text(r.labelX??(r.x+r.w/2),(r.labelZ??(r.z+r.d/2))+.22,r.area+' м²',.125);});
 (layoutMeta[layout].annotations||[]).forEach(([,x,y,label])=>text(x,y,label,.11));
 text(1.52,-.30,'3,04 м',.16);text(4.42,-.30,'2,52 м',.16);text(1.17,11.68,'2,34 м',.16);text(-.28,2.80,'5,56',.14);text(-.28,8.50,'5,60',.14);text(6.03,5.10,'Вход',.15);a.push('<path d="M6.1 5.25H5.85m.10-.1-.10.1.10.1" stroke="#405843" stroke-width=".025" fill="none"/>');text(4.50,8,'Вне квартиры',.16);a.push('</svg>');return a.join('');
}
function drawPlan(){$('#plan').innerHTML=svg();}
function roomButtons(){
 const rooms=roomsFor(layout);
 $('#rooms').innerHTML=rooms.map(r=>'<button class="room" data-room="'+r.id+'" aria-pressed="false"><i style="background:'+r.color+'"></i>'+escapeHtml(r.name)+'<span>'+escapeHtml(r.area)+' м² ↗</span></button>').join('');
 $('#rooms').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const r=rooms.find(x=>x.id===b.dataset.room);$('#rooms').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#room-detail').textContent=r.note;if(ready&&!is2d){controls.target.set(r.x+r.w/2,0,r.z+r.d/2);camera.position.set(r.x+r.w/2+3,6,r.z+r.d/2+4);camera.zoom=1.45;camera.updateProjectionMatrix();controls.update();}}));
}
function reset(){if(!ready)return;controls.target.set(2.8,0,5.5);camera.position.set(15,18,21);camera.zoom=1;camera.updateProjectionMatrix();controls.update();$('#rooms').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));}
function setView(two){is2d=two;$('#plan').hidden=!two;$('#canvas').hidden=two;$('#view2d').setAttribute('aria-pressed',String(two));$('#view3d').setAttribute('aria-pressed',String(!two));$('#view-label').textContent=two?'План с расстановкой мебели':'Объёмная модель';$('#hint').textContent=two?'Проёмы — пунктир · окна — голубые · новая перегородка — терракота':'Потяните, чтобы повернуть · колесо или щипок — масштаб';$('#cutaway').disabled=two;['rotate','zoom-in','zoom-out','reset'].forEach(id=>$('#'+id).disabled=two);$('#error').hidden=ready||two;}
function applyMeta(){const m=layoutMeta[layout];$('#scheme-title').textContent=m.title;$('#scheme-copy').textContent=m.copy;$('#notice-title').textContent=m.noticeTitle;$('#notice-copy').textContent=m.notice;const stats=$('.stats');stats.hidden=!m.stats;if(m.stats){stats.querySelectorAll('strong')[0].textContent=m.stats[0];stats.querySelectorAll('small')[0].textContent=m.stats[1];stats.querySelectorAll('strong')[1].textContent=m.stats[2];stats.querySelectorAll('small')[1].textContent=m.stats[3];}}
$('#view2d').onclick=()=>setView(true);$('#view3d').onclick=()=>setView(false);$('#cutaway').onchange=e=>{cutaway=e.target.checked;draw3d();};$('#furniture').onchange=e=>{showFurniture=e.target.checked;draw3d();drawPlan();};$('#reset').onclick=reset;
$('#rotate').onclick=()=>{if(!ready)return;const off=camera.position.clone().sub(controls.target);off.applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI/4);camera.position.copy(controls.target).add(off);controls.update();};
function zoom(f){if(!ready)return;camera.zoom=THREE.MathUtils.clamp(camera.zoom*f,.6,5);camera.updateProjectionMatrix();}
$('#zoom-in').onclick=()=>zoom(1.2);$('#zoom-out').onclick=()=>zoom(1/1.2);
document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>{layout=b.dataset.layout;document.querySelectorAll('[data-layout]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#room-detail').textContent='Выберите комнату, чтобы рассмотреть её в модели.';applyMeta();draw3d();drawPlan();roomButtons();reset();});
$('#download').onclick=()=>{const url=URL.createObjectURL(new Blob([svg()],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download='kseniya-'+layout+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
applyMeta();drawPlan();roomButtons();
try{
 scene=new THREE.Scene();scene.background=new THREE.Color('#e9e8df');camera=new THREE.OrthographicCamera(-6,6,6,-6,.1,150);renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;$('#canvas').appendChild(renderer.domElement);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minZoom=.6;controls.maxZoom=5;controls.maxPolarAngle=Math.PI/2.07;scene.add(new THREE.HemisphereLight('#fff7e8','#8c9981',2.5));const sun=new THREE.DirectionalLight('#fff1d5',3);sun.position.set(-3,18,-5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:.1,far:60});sun.shadow.bias=-.001;scene.add(sun);const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),mat('#e9e8df'));ground.rotation.x=-Math.PI/2;ground.position.y=-.13;ground.receiveShadow=true;scene.add(ground);ready=true;draw3d();reset();new ResizeObserver(()=>{let w=$('#viewport').clientWidth,h=$('#viewport').clientHeight;renderer.setSize(w,h);let range=Math.max(7,5.8*h/w);camera.left=-range*w/h;camera.right=range*w/h;camera.top=range;camera.bottom=-range;camera.updateProjectionMatrix();}).observe($('#viewport'));renderer.setAnimationLoop(()=>{if(!is2d){controls.update();renderer.render(scene,camera);}});
}catch(e){console.error(e);$('#error').hidden=false;setView(true);$('#view-label').textContent='План 2D · 3D недоступно';}
window.kseniyaDebug={getState:()=>({layout,is2d,showFurniture,cutaway,ready}),rooms:()=>roomsFor(layout)};
