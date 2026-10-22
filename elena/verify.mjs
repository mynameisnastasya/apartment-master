import {chromium} from 'playwright';
import {variants} from './data.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});
let browser;
const out='test-results/elena';fs.mkdirSync(out,{recursive:true});
try{
 for(let i=0;i<60;i++){try{if((await fetch('http://127.0.0.1:4173/elena.html')).ok)break}catch{}await new Promise(r=>setTimeout(r,200))}
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/elena.html');await page.waitForFunction(()=>window.elenaDebug?.getState().ready);
 assert.equal(await page.locator('.variant').count(),8);
 for(const id of ['1','2','3','4','5','6','7','8']){
  await page.locator(`.variant[data-id="${id}"]`).click();assert.equal((await page.evaluate(()=>elenaDebug.getState())).variant,id);assert.match(page.url(),new RegExp('variant='+id));
  assert.deepEqual((await page.evaluate(()=>elenaDebug.getState())).renderedItems.sort(),variants.find(v=>v.id===id).furniture.map(f=>f.id).sort(),`All furniture must render in variant ${id}`);
  await page.waitForTimeout(220);await page.locator('.viewer-panel').screenshot({path:`${out}/variant-${id}-3d.png`});
  await page.locator('#view2d').click();assert(await page.locator('#plan svg').isVisible());assert((await page.locator('#plan [data-item]').count())>=16);
  if(['2','6','7','8'].includes(id)){await page.locator('#ergonomics').check();assert((await page.evaluate(()=>elenaDebug.getState())).ergonomics);assert((await page.locator('#plan .ergo-zone').count())>=10);assert.equal(await page.locator('.comfort-metric').count(),3);await page.locator('.viewer-panel').screenshot({path:`${out}/variant-${id}-ergonomics.png`});await page.locator('#view3d').click();await page.locator('.viewer-panel').screenshot({path:`${out}/variant-${id}-ergonomics-3d.png`});await page.locator('#view2d').click();await page.locator('#ergonomics').uncheck()}else{assert(await page.locator('#ergonomics').isDisabled())}
  await page.locator('#plan [data-item]').first().click();assert.match(await page.locator('#selection').innerText(),/габариты модели/);
  if(id==='1'||id==='5'){await page.locator('#sleep').check();assert((await page.evaluate(()=>elenaDebug.getState())).sleep);await page.locator('#sleep').uncheck()}
  await page.locator('#view3d').click();
 }
 await page.locator('.variant[data-id="2"]').click();await page.locator('#cutaway').uncheck();assert.equal((await page.evaluate(()=>elenaDebug.getState())).cutaway,false);await page.locator('#cutaway').check();
 await page.locator('#furniture').uncheck();assert.equal((await page.evaluate(()=>elenaDebug.getState())).meshCount,0);await page.locator('#furniture').check();
 await page.locator('#rotate').click();await page.locator('#zoom-in').click();await page.locator('#zoom-out').click();await page.locator('#reset').click();
 const downloadPromise=page.waitForEvent('download');await page.locator('#save-plan').click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),'elena-variant-2.svg');await download.saveAs(`${out}/variant-2.svg`);
 await page.screenshot({path:`${out}/desktop.png`,fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.locator('.workspace').scrollIntoViewIfNeeded();await page.waitForTimeout(200);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`${out}/mobile-3d.png`,fullPage:true});
 await page.locator('#view2d').click();await page.screenshot({path:`${out}/mobile-plan.png`,fullPage:true});
 await page.locator('.variant[data-id="8"]').click();await page.locator('#ergonomics').check();await page.locator('.viewer-panel').screenshot({path:`${out}/mobile-new-8.png`});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto('http://127.0.0.1:4173/elena.html?variant=4');await page.waitForFunction(()=>window.elenaDebug?.getState().ready);assert.equal((await page.evaluate(()=>elenaDebug.getState())).variant,'4');
 await page.goto('http://127.0.0.1:4173/elena.html?variant=invalid');await page.waitForFunction(()=>window.elenaDebug?.getState().ready);assert.equal((await page.evaluate(()=>elenaDebug.getState())).variant,'6');
 assert.deepEqual(errors,[]);console.log('PASS: all 8 3D/2D variants, furniture, cutaway, sleep state, picking, camera controls, SVG download, deep links, mobile overflow, no runtime errors.');
}finally{await browser?.close();server.kill('SIGTERM')}
