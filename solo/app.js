import {createApartmentViewer} from './scene.js';
import {outline,rooms,walls,removedWalls,openings,slidingPanels,furniture,zones,variant,cameras} from './data.js';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mode='plan',viewer=null,preset='overview',cutaway=true,ergo=false,changes=true,planZoom=1,selected=null,sceneDirty=true;
const line=(a,b,color,width,extra='')=>`<line x1="${a[0]*100}" y1="${a[1]*100}" x2="${b[0]*100}" y2="${b[1]*100}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const text=(s,x,y,size=12,color='#4a5546')=>`<text x="${x*100}" y="${y*100}" text-anchor="middle" font-size="${size}" fill="${color}">${esc(s)}</text>`;
const rect=(x,y,w,d,fill,stroke='#a09d8d',r=2)=>`<rect x="${x*100}" y="${y*100}" width="${w*100}" height="${d*100}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
function svgPlan(){
 let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-65 -65 945 820" role="img" aria-label="План квартиры: спальня справа, гостиная в центре, кухня слева"><style>text{font-family:Arial,sans-serif}.furn{cursor:pointer}.furn:focus{outline:none}.furn:focus>rect:first-of-type{stroke:#986c47;stroke-width:3}</style><defs><pattern id="wood" width="30" height="100" patternUnits="userSpaceOnUse"><rect width="30" height="100" fill="#ddcdb4"/><path d="M0 0V100M0 50H30M5 0V45M20 55V100" stroke="#baa98f" stroke-opacity=".23" stroke-width=".7"/></pattern><pattern id="tile" width="55" height="55" patternUnits="userSpaceOnUse"><rect width="55" height="55" fill="#e5dfd2"/><path d="M0 0H55V55" fill="none" stroke="#bfb9ac" stroke-opacity=".4" stroke-width=".6"/></pattern></defs>`;
 s+=`<polygon points="${outline.map(p=>p.map(n=>n*100).join(',')).join(' ')}" fill="#e4ded1"/>`;
 for(const r of rooms)s+=`<polygon points="${r.poly.map(p=>p.map(n=>n*100).join(',')).join(' ')}" fill="${['living','bedroom','wardrobe'].includes(r.id)?'url(#wood)':['bath','wc'].includes(r.id)?r.color:'url(#tile)'}"/>`;
 for(const f of furniture){s+=`<g class="furn" tabindex="0" role="button" aria-label="${esc(f.name)}" data-item="${f.id}"><title>${esc(f.name)}</title>`+rect(f.x,f.y,f.w,f.d,f.id===selected?'#e7d1ac':f.type==='bed'?'#f3efe6':f.type==='sofa'?'#bdc5ad':['wardrobe','utility'].includes(f.type)?'#d8cdb9':'#f6f2e9');
  if(f.type==='bed'){s+=rect(f.x+.08,f.y+.08,f.w-.16,f.d-.16,'#f6f3eb');s+=rect(f.x+.12,f.y+.1,.6,f.d-.2,'#aeb89d');for(const yy of[f.y+.15,f.y+.91])s+=rect(f.x+f.w-.53,yy,.39,.60,'#fffdf7','#d5d0c5',7);s+=text('160 × 200',f.x+.95,f.y+.87,12);}
  else if(f.type==='sofa'){s+=rect(f.x+.04,f.y+.08,.15,f.d-.16,'#a6b194');for(const yy of[f.y+.15,f.y+.93])s+=rect(f.x+.22,yy,.52,.68,'#c5ccb9','#a6ae9b',6);}
  else if(f.type==='kitchen'){for(const m of f.modules){const y=f.y+f.d-m.offset-m.width;s+=line([f.x,y],[f.x+f.w,y],'#ad9f86',.8);if(m.id==='sink')s+=rect(f.x+.09,y+.08,.42,.44,'#b5c5bf','#85958b',6);if(m.id==='hob'){s+=rect(f.x+.06,y+.04,.48,.52,'#50594e','#50594e',2);for(const xx of[.18,.43])for(const yy of[.17,.42])s+=`<circle cx="${(f.x+xx)*100}" cy="${(y+yy)*100}" r="7" fill="none" stroke="#adb6a8"/>`;}}}
  else if(f.type==='desk'){s+=rect(f.x+.35,f.y+.08,.5,.08,'#566356','#566356');s+=rect(f.x+.38,f.y+.28,.35,.1,'#d6d8ca');}
  else if(f.type==='chair'){const t=furniture.find(t=>t.id===f.target),cx=f.x+f.w/2,cy=f.y+f.d/2,a=Math.atan2(t.x+t.w/2-cx,t.y+t.d/2-cy),dx=Math.sin(a),dy=Math.cos(a),r=.17;s+=line([cx-dx*r-dy*r,cy-dy*r+dx*r],[cx-dx*r+dy*r,cy-dy*r-dx*r],'#7d8b74',4);}
  else if(f.type==='wardrobe'){for(let x=f.x+.45;x<f.x+f.w;x+=.45)s+=line([x,f.y],[x,f.y+f.d],'#a69983',1);s+=text('270 × 60',f.x+f.w/2,f.y+.36,11);}
  else if(f.type==='shower'){s+=line([f.x,f.y+f.d],[f.x+f.w,f.y+f.d],'#8aaba5',3)+line([f.x+f.w,f.y],[f.x+f.w,f.y+f.d],'#8aaba5',3);s+=text('80 × 80',f.x+f.w/2,f.y+.46,10);}
  else if(f.type==='laundryvanity'){s+=rect(f.x+.07,f.y+.1,.46,.33,'#d9e3dc','#acb9ad',7)+text('СМ + раковина',f.x+.3,f.y+.53,7);}
  else if(f.type==='toilet'){s+=rect(f.x+.03,f.y+.03,.13,.36,'#d5caba')+rect(f.x+.19,f.y+.04,.4,.34,'#fffdf4','#aaa99a',14);}
  else if(f.type==='table'){s+=`<circle cx="${(f.x+f.w/2)*100}" cy="${(f.y+f.d/2)*100}" r="11" fill="#fffef8" stroke="#d8d0bd"/>`;}
  else if(f.type==='tvconsole')s+=line([f.x+.07,f.y+.1],[f.x+.07,f.y+f.d-.1],'#354336',5);
  else if(f.type==='fridge')s+=text('Х',f.x+f.w/2,f.y+f.d/2+.05,15);
  else if(f.type==='coatniche')s+=text('Куртки',f.x+f.w/2,f.y+f.d/2+.05,8);
  else if(f.id==='existing3')s+=text('№ 3',f.x+f.w/2,f.y+f.d/2+.04,9);
  s+='</g>';
 }
 if(ergo)for(const z of zones)s+=`<g pointer-events="none"><title>${esc(z.label)}</title>`+rect(z.x,z.y,z.w,z.d,z.type==='open'?'#b4774930':'#5b908c30',z.type==='open'?'#b47749':'#5b908c',0)+'</g>';
 for(const w of walls)s+=line(w.a,w.b,w.kind==='new'?'#89956e':'#505c4f',w.t*100);
 if(changes)for(const w of removedWalls)s+=line(w.a,w.b,'#b2785b',4,'stroke-dasharray="7 5"');
 for(const o of openings){s+=line(o.a,o.b,o.type==='window'?'#8ab0ad':'#a99d84',o.type==='window'?4:1);if(o.hinge){const a=o.end,end=[o.hinge[0]+Math.cos(a)*o.radius,o.hinge[1]+Math.sin(a)*o.radius];s+=line(o.hinge,end,'#9f9b8a',1.6);if(ergo){const pts=[];for(let i=0;i<=25;i++){const t=o.start+(o.end-o.start)*i/25;pts.push([o.hinge[0]+Math.cos(t)*o.radius,o.hinge[1]+Math.sin(t)*o.radius]);}s+=`<path d="M${pts.map(p=>p.map(n=>n*100).join(',')).join(' L')}" fill="none" stroke="#b2785b" stroke-dasharray="4 3"/>`;}}}
 for(const p of slidingPanels())s+=rect(p.x,p.y,p.w,p.d,'#c9beaa','#b8ad97',0);
 for(const [t,x,y] of [['Кухня · 6,1 м²',.9,2.73],['Гостиная · 9,8 м²',3.75,3.70],['Спальня',6.55,4.99],['Гардеробная',6.5,5.73],['Балкон',6.4,.65],['Прихожая',3.55,5.35]])s+=text(t,x,y,11);
 if(changes)s+=text('Открываем вход в гостиную',3.53,4.55,9,'#a36e50');s+=text('Вход ↑',2.95,6.05,11);
 for(const [a,b,t] of [[[0,-.43],[2.17,-.43],'2,17 м'],[[2.29,-.43],[4.73,-.43],'2,44 м'],[[4.85,-.43],[7.95,-.43],'3,10 м']])s+=line(a,b,'#a4ab9c',.9)+text(t,(a[0]+b[0])/2,a[1]-.08,11);
 s+=line([8.4,1.25],[8.4,6.85],'#a4ab9c',.9)+`<text x="855" y="405" transform="rotate(90 855 405)" text-anchor="middle" font-family="Arial" font-size="11" fill="#7d8978">5,60 м · размер с фото</text>`;
 s+=line([.15,6.65],[1.15,6.65],'#505c4f',3)+text('0',.15,6.87,9)+text('1 м',1.15,6.87,9)+text('Эскиз по фото · размеры уточнить обмером',2.0,7.25,10);
 return s+'</svg>';
}
function drawPlan(){$('plan').innerHTML=svgPlan();const svg=$('plan').firstElementChild;svg.style.width=planZoom*100+'%';svg.style.height=planZoom*100+'%';$('plan').querySelectorAll('[data-item]').forEach(el=>{const action=()=>select(furniture.find(f=>f.id===el.dataset.item));el.addEventListener('click',action);el.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();action();}})});}
function select(f){selected=f.id;$('selection').innerHTML=`<strong>${esc(f.name)}</strong><p class="dimensions">${[f.w,f.d,f.h].map(x=>Math.round(x*100)).join(' × ')} см · ширина × глубина × высота</p><p>${esc(f.purpose)}</p>`;if(mode==='plan')drawPlan();}
function build(){if(viewer){viewer.build({variant,cutaway,furniture:true,ergonomics:ergo});sceneDirty=false;}}
function url(){const u=new URL(location.href);u.searchParams.set('view',mode);if(mode==='3d')u.searchParams.set('camera',preset);else u.searchParams.delete('camera');history.replaceState(null,'',u);}
function fallback(){viewer?.setActive(false);mode='plan';$('canvas-host').hidden=true;$('plan').hidden=false;$('source').hidden=true;$('cutaway-label').hidden=true;$('evening-label').hidden=true;$('view-hint').textContent='3D недоступна в этом браузере. Размерный план остаётся доступен.';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===mode));drawPlan();url();}
function setView(next){mode=next;viewer?.setActive(mode==='3d');$('plan').hidden=mode!=='plan';$('canvas-host').hidden=mode!=='3d';$('source').hidden=mode!=='source';$('zoom').hidden=mode==='source';$('cutaway-label').hidden=mode!=='3d';$('evening-label').hidden=mode!=='3d';$('changes').disabled=mode!=='plan';$('ergonomics').disabled=mode==='source';document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===mode));
 if(mode==='3d'){try{if(!viewer){viewer=createApartmentViewer($('canvas-host'),{onSelect:select,onError:fallback});}if(sceneDirty)build();viewer.setActive(true);viewer.setPreset(preset);viewer.resize();}catch(e){console.error(e);fallback();return;}}
 $('view-hint').textContent=mode==='3d'?'Вращайте модель мышью или пальцем. Нажмите на мебель, чтобы увидеть размеры.':mode==='source'?'Оригинальная фотография. Для расстановки выберите «План».':'Нажмите на мебель, чтобы увидеть её размеры и назначение.';url();}
function setCamera(name){if(!cameras[name])name='overview';preset=name;const nextCutaway=name==='overview';if(cutaway!==nextCutaway)sceneDirty=true;cutaway=nextCutaway;$('cutaway').checked=cutaway;if(mode!=='3d'){setView('3d');if(mode!=='3d')return;}if(sceneDirty)build();viewer.setPreset(name);document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.camera===name));url();}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>setCamera(b.dataset.camera)));
$('show3d').onclick=()=>{setCamera('bedroom');$('stage').scrollIntoView({block:'center',behavior:'instant'});};
$('ergonomics').onchange=e=>{ergo=e.target.checked;sceneDirty=true;drawPlan();if(mode==='3d'){build();viewer.setPreset(preset);}};
$('changes').onchange=e=>{changes=e.target.checked;drawPlan();};$('cutaway').onchange=e=>{cutaway=e.target.checked;build();viewer.setPreset(preset);};$('evening').onchange=e=>viewer?.setLighting(e.target.checked);
function zoom(n){if(mode==='3d')viewer?.zoom(n);else{planZoom=Math.max(.8,Math.min(2.5,planZoom*n));drawPlan();}}$('zoom-in').onclick=()=>zoom(1.15);$('zoom-out').onclick=()=>zoom(1/1.15);$('reset').onclick=()=>{if(mode==='3d')setCamera('overview');else{planZoom=1;drawPlan();}};
$('save-plan').onclick=()=>{const u=URL.createObjectURL(new Blob([svgPlan()],{type:'image/svg+xml'})),a=document.createElement('a');a.href=u;a.download='svoya-kvartira-plan.svg';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);};
$('inventory').innerHTML=furniture.map(f=>`<div><dt>${esc(f.name)} · ${[f.w,f.d,f.h].map(x=>Math.round(x*100)).join(' × ')} см</dt><dd>${esc(f.purpose)}</dd></div>`).join('');
drawPlan();const initial=new URL(location.href);preset=cameras[initial.searchParams.get('camera')]?initial.searchParams.get('camera'):'overview';cutaway=preset==='overview';$('cutaway').checked=cutaway;setView(['3d','source'].includes(initial.searchParams.get('view'))?initial.searchParams.get('view'):'plan');document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.camera===preset));
window.soloDebug={getState:()=>({mode,preset,cutaway,selected,ergo,ready:!!viewer,...viewer?.getState()}),svgPlan};
