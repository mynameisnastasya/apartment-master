import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});
async function wait(){const t=Date.now();while(Date.now()-t<15000){try{const r=await fetch('http://127.0.0.1:4173/polina-39.html');if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,250))}throw new Error('preview server failed')}
let browser;
try{
 await wait();browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--single-process','--no-zygote']});
 const page=await browser.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 fs.mkdirSync('test-results/polina39',{recursive:true});
 await page.goto('http://127.0.0.1:4173/polina-39.html');
 await page.waitForFunction(()=>window.polina39Debug?.getState().ready,{timeout:20000});
 assert.equal((await page.evaluate(()=>polina39Debug.getState())).view,'3d');
 assert.equal(await page.locator('#view3d canvas').isVisible(),true);
 assert.match(await page.locator('body').textContent(),/39,06/);
 assert.match(await page.locator('body').textContent(),/14,22/);
 assert.match(await page.locator('body').textContent(),/13,63/);
 assert.match(await page.locator('body').textContent(),/3,88/);
 await page.locator('#furniture').uncheck();assert.equal((await page.evaluate(()=>polina39Debug.getState())).showFurniture,false);await page.locator('#furniture').check();
 await page.locator('#cutaway').uncheck();assert.equal((await page.evaluate(()=>polina39Debug.getState())).cutaway,false);await page.locator('#cutaway').check();
 await page.locator('#rotate').click();await page.locator('#zin').click();await page.locator('#reset').click();
 await page.screenshot({path:'test-results/polina39/3d.png',fullPage:true});
 await page.locator('#tab2d').click();assert.equal((await page.evaluate(()=>polina39Debug.getState())).view,'2d');assert.equal(await page.locator('#view2d svg').isVisible(),true);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'test-results/polina39/mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: Polina 39 sqm standalone 3D/2D page, furniture, cutaway, controls, mobile.');
}finally{if(browser)await browser.close();server.kill('SIGTERM')}