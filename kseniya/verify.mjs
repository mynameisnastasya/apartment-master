import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';

const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});
async function waitForServer(){
  const started=Date.now();
  while(Date.now()-started<15000){
    try{const r=await fetch('http://127.0.0.1:4173/kseniya.html');if(r.ok)return;}catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error('Local preview server did not start on port 4173');
}

let browser;
try{
  await waitForServer();
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--enable-webgl','--single-process','--no-zygote']});
  const page=await browser.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/kseniya.html');
  await page.waitForFunction(()=>window.kseniyaDebug?.getState().ready,{timeout:20000});
  await page.waitForTimeout(700);
  assert.equal(await page.locator('a[href*="LIZA"],a[href*="index.html"],a[href*="model.html"]').count(),0);
  assert.equal((await page.evaluate(()=>kseniyaDebug.getState())).layout,'balanced');
  fs.mkdirSync('test-results/kseniya',{recursive:true});
  await page.screenshot({path:'test-results/kseniya/desktop.png',fullPage:true});
  await page.locator('#view2d').click();
  assert.equal(await page.locator('#plan svg').isVisible(),true);
  assert.match(await page.locator('#plan').textContent(),/Кухня-гостиная/);
  assert.match(await page.locator('#plan').textContent(),/≈11,2/);
  await page.locator('[data-layout="bedroomplus"]').click();
  assert.match(await page.locator('#plan').textContent(),/≈8,4/);
  assert.match(await page.locator('#plan').textContent(),/120 × 200/);
  await page.locator('[data-layout="gentle"]').click();
  assert.match(await page.locator('#plan').textContent(),/5,14/);
  await page.locator('[data-layout="balanced"]').click();
  await page.locator('[data-layout="split"]').click();
  assert.match(await page.locator('#plan').textContent(),/Гостиная/);
  await page.locator('[data-layout="original"]').click();
  assert.match(await page.locator('#plan').textContent(),/Зал/);
  await page.locator('[data-layout="full"]').click();
  assert.match(await page.locator('#plan').textContent(),/≈7,7/);
  await page.locator('[data-layout="balanced"]').click();
  assert.match(await page.locator('#plan').textContent(),/≈16,4/);
  await page.locator('#furniture').uncheck();
  assert.equal((await page.evaluate(()=>kseniyaDebug.getState())).showFurniture,false);
  await page.locator('#furniture').check();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#download').click();
  const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),'kseniya-balanced.svg');
  await page.screenshot({path:'test-results/kseniya/plan.png',fullPage:true});
  await page.locator('#view3d').click();
  await page.locator('#cutaway').uncheck();
  await page.locator('#rotate').click();
  await page.locator('#zoom-in').click();
  await page.locator('[data-room="bed1"]').click();
  assert.match(await page.locator('#room-detail').textContent(),/160/);
  await page.locator('#reset').click();
  await page.locator('#cutaway').check();
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'test-results/kseniya/mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: variants 03-05, isolated triroom default, split/original comparisons, WebGL, 2D/3D, furniture, cutaway, camera, SVG download, mobile overflow, isolated navigation.');
} finally {
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
