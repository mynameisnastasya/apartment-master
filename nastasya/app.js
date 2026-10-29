import {dimensions,outline,rooms,roomById,walls,glazing,openings,pieces} from './model.js';
const $=id=>document.getElementById(id),S=94,OX=62,OY=52;
const X=n=>+(OX+n*S).toFixed(2),Y=n=>+(OY+n*S).toFixed(2),W=n=>+(n*S).toFixed(2);
const pts=a=>a.map(([x,y])=>X(x)+','+Y(y)).join(' ');
const rect=(x,y,w,h,attrs='')=>'<rect x="'+X(x)+'" y="'+Y(y)+'" width="'+W(w)+'" height="'+W(h)+'" '+attrs+'/>';
const line=(x,y,x2,y2,attrs='')=>'<line x1="'+X(x)+'" y1="'+Y(y)+'" x2="'+X(x2)+'" y2="'+Y(y2)+'" '+attrs+'/>';
const text=(x,y,label,cl='text-small',attrs='')=>'<text x="'+X(x)+'" y="'+Y(y)+'" text-anchor="middle" class="'+cl+'" '+attrs+'>'+label+'</text>';
let current='all',view='2d',furniture=true,cutaway=true,proposal=true,scale=1,viewer=null,sceneImport=null,svgSource='';
const escapeXML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function svgPiece(p){
 const x=X(p.x),y=Y(p.y),w=W(p.w),d=W(p.d);
 const base=(color,stroke='#8a9287')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+d+'" rx="3" fill="'+color+'" stroke="'+stroke+'" stroke-width="1.3"/>';
 let shape='';
 switch(p.type){
 case 'bed':
  shape=base('#eee9df')+rect(p.x+.10,p.y+.07,p.w-.2,p.d-.14,'fill="#bac5aa" rx="4"')+
  rect(p.x+p.w-.52,p.y+.16,.39,.50,'fill="#fbf9f2" rx="6"')+rect(p.x+p.w-.52,p.y+.92,.39,.50,'fill="#fbf9f2" rx="6"')+
  text(p.x+.97,p.y+.93,'160 × 200','text-small');break;
 case 'sofa':
  shape=base('#98aa91')+rect(p.x+.07,p.y+.10,p.w-.14,p.d-.20,'rx="7" fill="#b9c7ae"')+line(p.x+.12,p.y+.78,p.x+p.w-.12,p.y+.78,'stroke="#8b9e83" stroke-width="1.4"')+
  rect(p.x+.05,p.y+.07,p.w-.1,.16,'fill="#ced6c5" rx="4"');break;
 case 'hob':
  shape=base('#e9e5db')+rect(p.x+.04,p.y+.07,p.w-.08,p.d-.12,'fill="#394941" rx="3"')+
  [0,1].map(i=>[0,1].map(j=>'<circle cx="'+X(p.x+.17+i*.20)+'" cy="'+Y(p.y+.20+j*.21)+'" r="6" fill="none" stroke="#82948b" stroke-width="1.4"/>').join('')).join('');break;
 case 'sink':
  shape=base('#f1efe8')+rect(p.x+.08,p.y+.08,p.w-.16,p.d-.16,'rx="7" fill="#b8cbc7" stroke="#93a9a4"')+'<circle cx="'+X(p.x+p.w/2)+'" cy="'+Y(p.y+p.d/2)+'" r="3" fill="#8caaa4"/>';break;
 case 'coffee':
  shape='<circle cx="'+X(p.x+p.w/2)+'" cy="'+Y(p.y+p.d/2)+'" r="'+W(p.w/2)+'" fill="#ddc4a9" stroke="#ac957c" stroke-width="1.5"/>';break;
 case 'tv':
  shape=base('#394741')+rect(p.x-.09,p.y+.07,.05,p.d-.14,'fill="#c5c7b8"');break;
 case 'wardrobe':
  shape=base('#e0d8c7')+Array.from({length:5},(_,i)=>line(p.x+(i+1)*p.w/6,p.y+.05,p.x+(i+1)*p.w/6,p.y+p.d-.05,'stroke="#b5ac98" stroke-width="1"')).join('')+text(p.x+p.w/2,p.y+.36,'270 × 60','text-small');break;
 case 'toilet':
  shape=base('#d6e2de')+'<ellipse cx="'+X(p.x+p.w/2)+'" cy="'+Y(p.y+p.d/2)+'" rx="'+W(.17)+'" ry="'+W(.19)+'" fill="#fffdf6" stroke="#b2bdb7"/>';break;
 case 'shower':
  shape=base('#dce7e3')+rect(p.x+.08,p.y+.08,p.w-.16,p.d-.16,'rx="3" fill="none" stroke="#a0b7b0" stroke-dasharray="3 3"')+text(p.x+.4,p.y+.46,'80 × 80');break;
 case 'washer':
  shape=base('#e8e5dc')+'<circle cx="'+X(p.x+p.w/2)+'" cy="'+Y(p.y+p.d/2)+'" r="'+W(.18)+'" fill="#c2d5d0" stroke="#8b9f9b" stroke-width="2"/>';break;
 case 'fridge':shape=base('#eeede7')+text(p.x+p.w/2,p.y+.32,'Х');break;
 default:shape=base('#f1eee5');
 }
 return '<g data-piece="'+p.id+'" data-room="'+p.room+'" aria-label="'+escapeXML(p.name)+'" tabindex="0" role="button"><title>'+escapeXML(p.name)+'</title>'+shape+'</g>';
}
function makeSvg(){
 let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 890 755" role="img" aria-label="План квартиры Настасьи с кухней слева, гостиной посередине, спальней и гардеробной справа">';
 s+='<defs><pattern id="planks" width="17" height="22" patternUnits="userSpaceOnUse"><path d="M0 0V22M0 11H17" fill="none" stroke="#c8bda9" stroke-opacity=".34" stroke-width="1"/></pattern><pattern id="tile" width="21" height="21" patternUnits="userSpaceOnUse"><path d="M21 0H0V21" fill="none" stroke="#a4b5ae" stroke-opacity=".27" stroke-width=".9"/></pattern></defs>';
 s+='<polygon points="'+pts(outline)+'" fill="#eeeae1" stroke="#b3bbac" stroke-width="4"/>';
 for(const r of rooms){
   s+=rect(r.x,r.y,r.w,r.d,'fill="'+r.fill+'" class="'+(current===r.id?'selected':'')+'" data-room="'+r.id+'" tabindex="0" role="button" aria-label="'+escapeXML(r.name)+'"');
   s+=rect(r.x,r.y,r.w,r.d,'fill="url(#'+(['kitchen','wc','bath','hall','balcony'].includes(r.id)?'tile':'planks')+')" pointer-events="none"');
 }
 if(furniture){
   s+=rect(2.32,1.20,1.97,2.12,'fill="#efede4" rx="6" opacity=".88"');
   s+=rect(5.21,2.35,2.22,2.04,'fill="#f0e8dc" rx="3" opacity=".82"');
   for(const p of pieces)s+=svgPiece(p);
 }
 for(const [x,y,x2,y2,k] of walls)s+=line(x,y,x2,y2,'class="outline-wall" stroke-width="'+(k==='outer'?12:k==='glass'?5:8)+'"'+(k==='glass'?' stroke="#84aea9"':''));
 for(const [x,y,x2,y2] of glazing)s+=line(x,y,x2,y2,'class="glass" stroke-width="4"');
 for(const o of openings){
   if(o.orientation==='horizontal'){
     s+=line(o.x,o.y,o.x+o.w,o.y,'stroke="#ede9de" stroke-width="9"');
     s+='<path class="door" d="M'+X(o.x)+' '+Y(o.y)+' A'+W(o.w)+' '+W(o.w)+' 0 0 1 '+X(o.x+o.w)+' '+Y(o.y-o.w)+'"/>';
   } else {
     s+=line(o.x,o.y,o.x,o.y+o.w,'stroke="#ede9de" stroke-width="9"');
     s+='<path class="door" d="M'+X(o.x)+' '+Y(o.y)+' A'+W(o.w)+' '+W(o.w)+' 0 0 1 '+X(o.x+o.w)+' '+Y(o.y+o.w)+'"/>';
   }
 }
 if(proposal){s+=line(2.17,4.03,4.61,4.03,'class="proposal"')+text(3.39,4.25,'Условное раскрытие','text-small');}
 const labels=[
 ['kitchen',1.10,2.68],['living',3.35,3.48],['bedroom',6.10,4.61],['dressing',6.12,5.48],
 ['balcony',6.18,.68],['hall',3.38,4.86],['wc',1.01,3.60],['bath',.86,5.15]
 ];
 for(const [id,x,y] of labels){
   const r=roomById(id);s+=text(x,y,escapeXML(r.name),'text-room');
   if(['kitchen','living'].includes(id))s+=text(x,y+.21,escapeXML(r.area),'text-measure');
 }
 s+='<path d="M'+X(0)+' 28H'+X(7.71)+'" stroke="#b3bcb0" stroke-width="1" opacity=".6"/>';
 for(const [a,b,lab] of [[0,2.17,'2,17 м'],[2.17,4.61,'2,44 м'],[4.61,7.71,'3,10 м']]){
   s+=line(a,0,a,-.16,'stroke="#b3bcb0" stroke-width="1"')+text((a+b)/2,-.23,lab,'text-measure');
 }
 s+=line(0,7.03,1,7.03,'stroke="#4c5e4f" stroke-width="2.5"')+text(0,7.23,'0','text-small')+text(1,7.23,'1 м','text-small');
 s+=text(3.10,5.67,'Вход ↑','text-small')+text(4.10,7.13,'По скриншоту · размеры проверить на объекте','text-measure');
 s+='</svg>';
 return s;
}
function updateSelection(){
 $('room-pills').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.room===current)));
 const r=roomById(current);
 $('room-name').textContent=r?.name||'Вся квартира';$('room-area').textContent=r?.area||'План по скриншоту';
 $('room-detail').textContent=r?.detail||'Общий обзор квартиры. Выберите комнату, чтобы рассмотреть планировку и мебель.';
 $('room-furniture').textContent=r?'Предметов в модели: '+pieces.filter(p=>p.room===r.id).length+'.':'';
 $('plan').querySelectorAll('[data-room]').forEach(el=>el.classList.toggle('selected',el.dataset.room===current&&el.hasAttribute('role')&&el.tagName.toLowerCase()==='rect'));
 if(viewer)viewer.setRoom(current);
 const u=new URL(location.href);if(current==='all')u.searchParams.delete('room');else u.searchParams.set('room',current);history.replaceState(null,'',u);
}
function selectRoom(id){current=roomById(id)?id:'all';updateSelection()}
function redraw(){
 svgSource=makeSvg();$('plan').innerHTML=svgSource; $('plan').style.transform='scale('+scale+')';
 $('plan').querySelectorAll('[data-room]').forEach(el=>{
   el.addEventListener('click',e=>{e.stopPropagation();selectRoom(el.dataset.room)});
   el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRoom(el.dataset.room)}});
 });
}
async function showView(v){
 view=v;
 $('tab-2d').setAttribute('aria-pressed',String(v==='2d'));
 $('tab-3d').setAttribute('aria-pressed',String(v==='3d'));
 $('plan-shell').hidden=v!=='2d';$('scene-shell').hidden=v!=='3d';
 $('view-hint').textContent=v==='3d'?'Потяните для вращения · колесо или щипок — масштаб':'Нажмите на помещение или мебель · размеры предварительные';
 $('toggle-walls').disabled=v!=='3d';
 if(v==='3d'){
   if(!viewer){
     $('scene-shell').innerHTML='<p class="scene-error" id="scene-status">Загружается объёмная модель…</p>';
     try {
       sceneImport??=import('./scene.js');
       const {createViewer}=await sceneImport;
       if(view!=='3d')return;
       viewer=createViewer($('scene-shell'),{room:current,furniture,cutaway,proposal,onRoom:selectRoom});
       $('scene-shell').querySelector('#scene-status')?.remove();
     }catch(error){
       console.error('Apartment 3D unavailable:',error);
       $('scene-shell').innerHTML='<p class="scene-error">3D сейчас недоступно. Полный интерактивный план можно открыть в режиме 2D.</p>';
     }
   }else{viewer.resize();viewer.setRoom(current);}
 }
 const u=new URL(location.href);if(v==='2d')u.searchParams.delete('view');else u.searchParams.set('view','3d');history.replaceState(null,'',u);
}
const roomPills=[{id:'all',name:'Вся квартира'},...rooms.map(r=>({id:r.id,name:r.name}))];
$('room-pills').innerHTML=roomPills.map(r=>'<button data-room="'+r.id+'" aria-pressed="false" type="button">'+r.name+'</button>').join('');
$('room-pills').querySelectorAll('button').forEach(b=>b.onclick=()=>selectRoom(b.dataset.room));
$('tab-2d').onclick=()=>showView('2d');$('tab-3d').onclick=()=>showView('3d');
$('zoom-in').onclick=()=>{if(view==='3d')viewer?.zoom(1.22);else{scale=Math.min(2.5,scale*1.18);$('plan').style.transform='scale('+scale+')'}};
$('zoom-out').onclick=()=>{if(view==='3d')viewer?.zoom(1/1.22);else{scale=Math.max(.75,scale/1.18);$('plan').style.transform='scale('+scale+')'}};
$('reset').onclick=()=>{if(view==='3d')viewer?.reset();else{scale=1;$('plan').style.transform='scale(1)';$('plan-shell').scrollTo({top:0,left:0})}};
$('toggle-furniture').onchange=e=>{furniture=e.target.checked;redraw();viewer?.setFurniture(furniture)};
$('toggle-walls').onchange=e=>{cutaway=e.target.checked;viewer?.setCutaway(cutaway)};
$('toggle-proposal').onchange=e=>{proposal=e.target.checked;redraw();viewer?.setProposal(proposal)};
$('download-plan').onclick=()=>{
 const blob=new Blob([svgSource],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download='nastasya-apartment-plan.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
};
$('copy-link').onclick=async()=>{
 const b=$('copy-link');const original='↗ Скопировать ссылку';
 try{await navigator.clipboard.writeText(location.href);b.textContent='✓ Ссылка скопирована'}
 catch{b.textContent='Скопируйте адрес из браузера'}
 setTimeout(()=>b.textContent=original,2200);
};
const query=new URL(location.href).searchParams;current=roomById(query.get('room'))?.id||'all';
redraw();updateSelection();if(query.get('view')==='3d')showView('3d');
window.nastasyaDebug={getState:()=>({view,room:current,furniture,cutaway,proposal,viewerReady:!!viewer,pieceCount:pieces.length}),getSVG:()=>svgSource,selectRoom};
