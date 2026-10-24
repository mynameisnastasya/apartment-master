import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const samples=Number(process.env.ELENA_TRACE_SAMPLES||16),base=process.env.ELENA_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true,executablePath:process.env.ELENA_BROWSER_PATH||undefined,args:['--no-sandbox','--enable-webgl']});
try{
 const page=await browser.newPage({viewport:{width:1100,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().includes('/elena/')&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto(base+'/elena.html?variant=1&view=3d&camera=living&quality=high');
 await page.waitForFunction(()=>window.elenaDebug?.getState().ready);
 await page.waitForFunction(()=>elenaDebug.getState().texturesReady);
 await page.waitForFunction(n=>elenaDebug.getState().samples>=n,samples,{timeout:240000});
 const state=await page.evaluate(()=>elenaDebug.getState());assert.equal(state.quality,true);assert.equal(state.preset,'living');
 fs.mkdirSync('test-results/elena',{recursive:true});await page.locator('#canvas-host').screenshot({path:'test-results/elena/path-traced-bedroom.png'});
 await page.locator('#view2d').click();const paused=await page.evaluate(()=>elenaDebug.getState().samples);await page.waitForTimeout(750);assert.equal(await page.evaluate(()=>elenaDebug.getState().samples),paused);
 await page.locator('#view3d').click();await page.locator('[data-camera="kitchen"]').click();await page.waitForFunction(()=>elenaDebug.getState().samples<4,{},{timeout:60000});await page.waitForFunction(()=>elenaDebug.getState().samples>=4,{},{timeout:120000});
 assert.equal((await page.evaluate(()=>elenaDebug.getState())).preset,'kitchen');
 await page.locator('#evening').check();await page.waitForFunction(()=>elenaDebug.getState().samples<4,{},{timeout:60000});await page.waitForFunction(()=>elenaDebug.getState().samples>=4,{},{timeout:120000});assert((await page.evaluate(()=>elenaDebug.getState())).evening);
 await page.locator('#high-quality').uncheck();assert.equal((await page.evaluate(()=>elenaDebug.getState())).quality,false);
 assert.deepEqual(errors,[]);console.log(`PASS: actual path tracing reached ${state.samples} samples; all textures load; eye-level deep link; rendering pauses outside 3D; camera and lighting changes rebuild correctly; raster fallback works; no page errors.`);
}finally{await browser.close()}
