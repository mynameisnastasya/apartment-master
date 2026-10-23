import {chromium} from 'playwright';
import {variants} from './data.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});
let browser;const out='test-results/elena';fs.mkdirSync(out,{recursive:true});
try{
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4173/elena.html')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 browser=await chromium.launch({headless:true,executablePath:process.env.ELENA_BROWSER_PATH||undefined,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/elena.html');await page.waitForFunction(()=>window.elenaDebug);
 assert.equal(await page.locator('.variant').count(),5);assert.equal((await page.evaluate(()=>elenaDebug.getState())).mode,'photo');
 await page.screenshot({path:`${out}/desktop.png`,fullPage:true});
 for(const v of variants){
  await page.locator(`.variant[data-id="${v.id}"]`).click();assert.equal((await page.evaluate(()=>elenaDebug.getState())).variant,v.id);
  await page.locator('#viewphoto').click();await page.waitForFunction(()=>document.getElementById('interior-image').complete&&document.getElementById('interior-image').naturalWidth>1000);
  assert((await page.locator('#interior-image').getAttribute('src')).endsWith(v.image));
  await page.locator('#fullscreen-photo').click();assert(await page.locator('#image-dialog').isVisible());await page.keyboard.press('Escape');assert(!(await page.locator('#image-dialog').isVisible()));
  await page.locator('#view2d').click();assert(await page.locator('#plan svg').isVisible());assert.equal(await page.locator('#plan [data-item]').count(),v.furniture.length);
  await page.locator('#ergonomics').check();assert(await page.locator('#plan .ergo-zone').count()>=10);assert.equal(await page.locator('.comfort-metric').count(),3);
  await page.locator('#plan [data-item="bed"]').click();assert.match(await page.locator('#selection').innerText(),/габариты модели/);
  await page.locator('.viewer-panel').screenshot({path:`${out}/variant-${v.id}-plan.png`});
  await page.locator('#view3d').click();await page.waitForFunction(()=>elenaDebug.getState().ready);
  assert.deepEqual((await page.evaluate(()=>elenaDebug.getState())).renderedItems.sort(),v.furniture.map(f=>f.id).sort());
  await page.locator('#ergonomics').uncheck();await page.locator('.viewer-panel').screenshot({path:`${out}/variant-${v.id}-3d.png`});
 }
 await page.locator('#cutaway').uncheck();assert.equal((await page.evaluate(()=>elenaDebug.getState())).cutaway,false);await page.locator('#cutaway').check();
 await page.locator('#furniture').uncheck();assert.equal((await page.evaluate(()=>elenaDebug.getState())).meshCount,0);await page.locator('#furniture').check();
 for(const id of ['rotate','zoom-in','zoom-out','reset'])await page.locator('#'+id).click();
 const dp=page.waitForEvent('download');await page.locator('#save-plan').click();const dl=await dp;assert.equal(dl.suggestedFilename(),'elena-variant-5.svg');await dl.saveAs(`${out}/variant-5.svg`);
 await page.setViewportSize({width:390,height:844});await page.locator('.variant[data-id="1"]').click();await page.locator('#viewphoto').click();await page.evaluate(()=>scrollTo(0,0));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`${out}/mobile.png`,fullPage:true});
 for(const v of variants){await page.locator(`.variant[data-id="${v.id}"]`).click();assert.equal((await page.evaluate(()=>elenaDebug.getState())).variant,v.id);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}
 await page.locator('#view2d').click();await page.locator('.viewer-panel').screenshot({path:`${out}/mobile-plan.png`});await page.locator('#view3d').click();await page.locator('.viewer-panel').screenshot({path:`${out}/mobile-3d.png`});
 await page.goto('http://127.0.0.1:4173/elena.html?variant=4');await page.waitForFunction(()=>window.elenaDebug);assert.equal((await page.evaluate(()=>elenaDebug.getState())).variant,'4');
 await page.goto('http://127.0.0.1:4173/elena.html?variant=8');await page.waitForFunction(()=>window.elenaDebug);assert.equal((await page.evaluate(()=>elenaDebug.getState())).variant,'1');
 const fallback=await browser.newPage();await fallback.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:original.call(this,type,...args)}});await fallback.goto('http://127.0.0.1:4173/elena.html');await fallback.locator('#view3d').click();await fallback.waitForFunction(()=>elenaDebug.getState().mode==='2d');assert(await fallback.locator('#plan svg').isVisible());await fallback.locator('.variant[data-id="5"]').click();assert.equal((await fallback.evaluate(()=>elenaDebug.getState())).variant,'5');await fallback.close();
 assert.deepEqual(errors,[]);console.log('PASS: 5 images, all 3D/2D scenes, furniture picking, use zones, camera controls, SVG download, image modal, direct and obsolete links, 390px mobile, WebGL fallback, zero runtime errors.');
}finally{await browser?.close();server.kill('SIGTERM')}
