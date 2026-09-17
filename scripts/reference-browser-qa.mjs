import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});let browser;
const errors=[];fs.mkdirSync('browser-reference-artifacts',{recursive:true});
try{
 for(let i=0;i<50;i++){try{const r=await fetch('http://127.0.0.1:4173');if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1050}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173');await page.waitForFunction(()=>window.apartment?.ready);
 assert.equal(await page.evaluate(()=>window.apartment.layout.id),'D');
 await page.screenshot({path:'browser-reference-artifacts/desktop.png'});
 await page.getByRole('button',{name:'План',exact:true}).click();await page.waitForTimeout(400);await page.screenshot({path:'browser-reference-artifacts/plan.png'});
 await page.getByRole('button',{name:'Решения и проходы →'}).click();await page.locator('#details').waitFor({state:'visible'});assert.equal(await page.locator('[data-route]').count(),12);assert.ok((await page.locator('#dialog-content').innerText()).includes('960 мм'));await page.locator('#close-dialog').click();
 await page.getByRole('button',{name:'О проекте',exact:true}).click();assert.ok((await page.locator('#dialog-content').innerText()).includes('Лиза'));await page.locator('#close-dialog').click();
 for(const id of ['A','B','C','D']){await page.locator(`[data-variant="${id}"]`).click();assert.equal(await page.evaluate(()=>window.apartment.state.variant),id);}
 await page.getByRole('button',{name:'Прогулка',exact:true}).click();
 const visits=await page.evaluate(()=>{const app=window.apartment;return ['adult','alice','kitchen','living','bath'].map(room=>{app.viewRoom(room);const p=app.camera.position;return {room,ok:app.canStand(p.x*1000,p.z*1000)};});});assert.ok(visits.every(v=>v.ok));
 const bytes=await page.evaluate(async()=>{const buf=await window.apartment.exportModel();return buf.byteLength;});assert.ok(bytes>10000);
 await page.evaluate(()=>{window.apartment.setMode('iso');window.apartment.setLayer('cut',true);window.apartment.selectObject('sofa');});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);assert.ok(await page.locator('#selection').isVisible());assert.ok(await page.evaluate(()=>{const a=window.apartment;return a.geometry.floor.every(([x,y])=>{const p=a.camera.position.clone().set(x/1000,0,y/1000).project(a.camera);return Math.abs(p.x)<=1&&Math.abs(p.y)<=1;});}),'Entire floor should fit the mobile camera');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'browser-reference-artifacts/mobile.png',fullPage:true});
 await page.goto('http://127.0.0.1:4173/LIZA.html');await page.locator('.plan img').waitFor();assert.ok(await page.evaluate(()=>document.querySelector('.plan img').naturalWidth>0));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'browser-reference-artifacts/report-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1050});await page.screenshot({path:'browser-reference-artifacts/report.png',fullPage:true});
 assert.deepEqual(errors,[]);fs.writeFileSync('browser-reference-artifacts/results.json',JSON.stringify({ok:true,errors,visits,exportBytes:bytes},null,2));console.log('Desktop, mobile, four variants, room visits, dialogs, plan and GLB export passed.');
}finally{await browser?.close();server.kill();}
