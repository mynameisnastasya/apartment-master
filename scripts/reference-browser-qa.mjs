import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});let browser;
const errors=[];fs.mkdirSync('browser-reference-artifacts',{recursive:true});
try{
 for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:4173');if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 const saveRender=async path=>{const data=await page.evaluate(()=>{window.apartment.render();return window.apartment.renderer.domElement.toDataURL('image/png');});fs.writeFileSync(path,Buffer.from(data.split(',')[1],'base64'));};page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/variants.html');
 await page.getByRole('heading',{name:'Лиза. 12 вариантов планировки.'}).waitFor();
 assert.ok((await page.locator('body').innerText()).includes('50,199 м²'));
 assert.ok((await page.locator('body').innerText()).includes('ТРЕБУЕТ ОБМЕРА'));
 assert.equal(await page.locator('[data-inspect^="E"]').count()>0,true);
 assert.equal(await page.locator('.design-card').count(),5);
 assert.equal(await page.locator('a[href^="model.html?variant="]').count(),12);
 for(const image of await page.locator('.design-card img').all()){
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(img=>img.decode());
 }
 for(const image of await page.locator('.variant-thumb').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());}
 await page.screenshot({path:'browser-reference-artifacts/album-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 await page.locator('#mobile-nav').click();assert.ok(await page.locator('.side.open').isVisible());
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:'browser-reference-artifacts/album-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1050});
 await page.goto('http://127.0.0.1:4173/wardrobe-five.html');
 await page.getByRole('heading',{name:/Своя комната/}).waitFor();
 assert.equal(await page.locator('.card').count(),5);
 for(const img of await page.locator('.plan img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
 assert.ok(await page.evaluate(()=>[...document.querySelectorAll('.plan img')].every(i=>i.naturalWidth>0)));
 await page.screenshot({path:'browser-reference-artifacts/five-wardrobes-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Wardrobe study has horizontal overflow on mobile');
 await page.screenshot({path:'browser-reference-artifacts/five-wardrobes-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1050});await page.goto('http://127.0.0.1:4173/model.html');await page.waitForFunction(()=>window.apartment?.ready);
 assert.equal(await page.evaluate(()=>window.apartment.layout.id),'D');
 for(const id of ['linen','japandi','nordic','atelier','graphite']){
  await page.locator(`[data-style="${id}"]`).click();
  assert.equal(await page.evaluate(()=>window.apartment.state.style),id);
  assert.ok(await page.evaluate(()=>!!document.querySelector('canvas')),'Textured WebGL model mounted');
  await saveRender(`browser-reference-artifacts/material-${id}.png`);
 }
 await page.locator('[data-style="atelier"]').click();
 for(const room of ['bath','kitchen','adult','alice']){
  await page.locator('[data-room="'+room+'"]').click();
  await saveRender('browser-reference-artifacts/studio-'+room+'.png');
 }
 await page.locator('[data-room="all"]').click();
 await page.screenshot({path:'browser-reference-artifacts/desktop.png'});
 await page.getByRole('button',{name:'План',exact:true}).click();await page.waitForTimeout(400);await page.screenshot({path:'browser-reference-artifacts/plan.png'});
 await page.getByRole('button',{name:'Решения и проходы →'}).click();await page.locator('#details').waitFor({state:'visible'});assert.equal(await page.locator('[data-route]').count(),16);assert.ok((await page.locator('#dialog-content').innerText()).includes('960 мм'));await page.locator('#close-dialog').click();
 await page.getByRole('button',{name:'О проекте',exact:true}).click();assert.ok((await page.locator('#dialog-content').innerText()).includes('Лиза'));await page.locator('#close-dialog').click();
 assert.equal(await page.locator('.variant').count(),12);
 assert.equal(await page.evaluate(()=>new Set(window.apartment.layouts.map(l=>JSON.stringify(l.partitions))).size),9);
 assert.equal(await page.locator('[data-variant="A"], [data-variant="B"], [data-variant="C"]').count(),0);
 for(const id of ['D','E','F','G','H','I','J','K','L','M','W4','W6']){
  await page.locator(`[data-variant="${id}"]`).click();
  assert.equal(await page.evaluate(()=>window.apartment.state.variant),id);
  assert.equal(await page.evaluate(()=>window.apartment.routeResult('entry',['W4','W6'].includes(window.apartment.layout.id)?'bathroom':'bathBasin').ok),true);
  assert.equal(await page.evaluate(()=>window.apartment.routeResult('entry','aliceDesk').ok),true);
 }
 await page.locator('[data-variant="H"]').click();
 assert.ok(await page.evaluate(()=>window.apartment.layout.rooms.find(r=>r.id==='bath').area>4.5),'Expanded H bathroom is present');
 await page.screenshot({path:'browser-reference-artifacts/plan-H.png'});
 await page.goto('http://127.0.0.1:4173/model.html?variant=F');await page.waitForFunction(()=>window.apartment?.ready);
 assert.equal(await page.evaluate(()=>window.apartment.layout.id),'F');
 await page.getByRole('button',{name:'План',exact:true}).click();await page.screenshot({path:'browser-reference-artifacts/plan-F.png'});
 await page.goto('http://127.0.0.1:4173/model.html?variant=L');await page.waitForFunction(()=>window.apartment?.ready);
 assert.ok(await page.evaluate(()=>{const a=window.apartment,l=a.layout;return l.id==='L'&&a.state.style==='warm'&&l.furniture.find(f=>f.id==='adult-bed').rotation===90&&l.rooms.find(r=>r.id==='alice').area===9.21;}));
 assert.ok(await page.evaluate(()=>{const a=window.apartment,shoe=a.layout.furniture.find(f=>f.id==='hall-wardrobe');return shoe.type==='storage'&&shoe.y>=1400&&a.canStand(6150,600)&&a.routeResult('entry','storage').ok&&a.routeResult('alice','aliceDesk').ok;}),'L: front-door landing and desk access reachable in actual browser scene');
 assert.ok(await page.evaluate(()=>{const a=window.apartment,face=a.root.getObjectByName('mirror-face');return !!face&&face.isMesh&&face.geometry.type==='PlaneGeometry'&&face.material.name==='mirror';}),'L: entry mirror must be a reflective plane');
 assert.ok(await page.evaluate(()=>!!window.apartment.root.getObjectByName('trend-entry-ceramic-relief')),'L: artisan wall relief should render without occupying entrance floor space');
 await page.locator('[data-room="living"]').click();
 assert.ok(await page.evaluate(()=>!!window.apartment.root.getObjectByName('warm-oak-fluting')&&!!window.apartment.root.getObjectByName('trend-sculptural-pendant')&&!!window.apartment.root.getObjectByName('trend-pendant-warm-pool')),'L: layered sculptural light must appear in living studio');
 await saveRender('browser-reference-artifacts/soft-modern-L-living.png');
 await page.locator('[data-room="kitchen"]').click();
 assert.ok(await page.evaluate(()=>!!window.apartment.root.getObjectByName('trend-integrated-fridge-front')&&!!window.apartment.root.getObjectByName('trend-concealed-kitchen-front')),'L: concealed kitchen must appear in kitchen studio');
 await saveRender('browser-reference-artifacts/soft-modern-L-invisible-kitchen.png');
 for(const room of ['adult','alice']){
  await page.locator('[data-room="'+room+'"]').click();
  assert.ok(await page.evaluate(()=>!!window.apartment.root.getObjectByName('studio-window-glass')),'L: '+room+' room must include its real exterior window');
  assert.ok(await page.evaluate(()=>!!window.apartment.root.getObjectByName('studio-window-daylight')),'L: '+room+' room must include real-window soft daylight');
  await saveRender('browser-reference-artifacts/soft-modern-L-'+room+'.png');
 }
 await page.locator('[data-room="dressing"]').click();
 assert.ok(await page.evaluate(()=>{
  const a=window.apartment,l=a.layout;
  const actual=l.partitions.find(w=>w.id==='l-dressing-north-right');
  const wall=a.root.getObjectByName('studio-dressing-north');
  const east=a.root.getObjectByName('studio-dressing-east');
  return !!wall&&!!east&&Math.abs(wall.position.z-(actual.y+actual.depth/2)/1000)<.001
    &&Math.abs(east.geometry.parameters.depth-(4330-2980)/1000)<.001;
 }),'L: dressing studio walls must match revised model dimensions');
 await saveRender('browser-reference-artifacts/soft-modern-L-dressing.png');
 await page.getByRole('button',{name:'План',exact:true}).click();await page.screenshot({path:'browser-reference-artifacts/plan-L.png'});
 await page.goto('http://127.0.0.1:4173/model.html?variant=M&style=warm&room=adult');
 await page.waitForFunction(()=>window.apartment?.ready&&window.apartment.state.variant==='M'&&window.apartment.state.focus==='adult');
 assert.ok(await page.evaluate(()=>{
   const l=window.apartment.layout;
   return l.rooms.find(r=>r.id==='adult').area===13.97
     &&l.rooms.find(r=>r.id==='dressing').area===2.78
     &&l.furniture.find(f=>f.id==='adult-bed').rotation===90
     &&window.apartment.routeResult('entry','alice').ok
     &&window.apartment.routeResult('entry','dressing').ok;
 }),'M: second sketch should preserve clear doors, proper bedroom and independent wardrobe');
 await saveRender('browser-reference-artifacts/soft-modern-M-adult.png');
 await page.locator('[data-room="dressing"]').click();
 assert.ok(await page.evaluate(()=>!!window.apartment.root.getObjectByName('studio-dressing-north')),'M: studio dressing should follow revised wall coordinates');
 await saveRender('browser-reference-artifacts/soft-modern-M-dressing.png');
 await page.getByRole('button',{name:'План',exact:true}).click();
 await page.screenshot({path:'browser-reference-artifacts/plan-M.png'});
 await page.locator('[data-variant="D"]').click();
 await page.getByRole('button',{name:'Прогулка',exact:true}).click();
 const visits=await page.evaluate(()=>{const app=window.apartment;return ['adult','alice','kitchen','living','bath'].map(room=>{app.viewRoom(room);const p=app.camera.position;return {room,ok:app.canStand(p.x*1000,p.z*1000)};});});assert.ok(visits.every(v=>v.ok));
 const bytes=await page.evaluate(async()=>{const buf=await window.apartment.exportModel();return buf.byteLength;});assert.ok(bytes>10000);
 await page.evaluate(()=>{window.apartment.setMode('iso');window.apartment.setLayer('cut',true);window.apartment.selectObject('sofa');});
 await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>{const a=window.apartment,c=a.renderer.domElement,b=document.querySelector('#canvas-container').getBoundingClientRect();return Math.abs(c.clientWidth-b.width)<1&&Math.abs(a.cameras.aspect-b.width/b.height)<.001&&a.geometry.floor.every(([x,y])=>{const p=a.camera.position.clone().set(x/1000,0,y/1000).project(a.camera);return Math.abs(p.x)<=1&&Math.abs(p.y)<=1;});},{},{timeout:30000});assert.ok(await page.locator('#selection').isVisible());assert.ok(await page.evaluate(()=>{const a=window.apartment;return a.geometry.floor.every(([x,y])=>{const p=a.camera.position.clone().set(x/1000,0,y/1000).project(a.camera);return Math.abs(p.x)<=1&&Math.abs(p.y)<=1;});}),'Entire floor should fit the mobile camera');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await saveRender('browser-reference-artifacts/mobile.png');
 await page.goto('http://127.0.0.1:4173/LIZA.html');await page.locator('.plan img').waitFor();assert.ok(await page.evaluate(()=>document.querySelector('.plan img').naturalWidth>0));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'browser-reference-artifacts/report-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:'browser-reference-artifacts/report.png',fullPage:true});
 await page.goto('http://127.0.0.1:4173/studio.html');
 await page.getByRole('heading',{name:'Дом, который чувствуется.'}).waitFor();
 for(const img of await page.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
 await page.getByRole('button',{name:'05 · Графичный contemporary'}).click();
 await page.getByRole('button',{name:'Увеличить общий вид'}).click();
 assert.ok(await page.locator('#zoom').isVisible());await page.getByRole('button',{name:'Закрыть увеличенный вид'}).click();
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'browser-reference-artifacts/studio-gallery-mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);fs.writeFileSync('browser-reference-artifacts/results.json',JSON.stringify({ok:true,errors,visits,exportBytes:bytes},null,2));console.log('Design album desktop/mobile and preserved 3D reference checks passed.');
}finally{await browser?.close();server.kill();}
