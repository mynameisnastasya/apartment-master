import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {spawn} from 'node:child_process';

const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});
async function waitForServer(){
  const started=Date.now();
  while(Date.now()-started<15000){
    try{const r=await fetch('http://127.0.0.1:4173/polina.html');if(r.ok)return;}catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  throw new Error('Local preview server did not start on port 4173');
}

let browser;
try{
  await waitForServer();
  browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--use-angle=swiftshader','--single-process','--no-zygote']});
  const page=await browser.newPage({viewport:{width:1400,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  fs.mkdirSync('test-results/polina',{recursive:true});

  await page.goto('http://127.0.0.1:4173/polina.html');
  await page.waitForFunction(()=>window.polinaDebug?.getState());
  await page.waitForFunction(()=>window.polina3DDebug?.getState().ready,{timeout:20000});
  assert.equal((await page.evaluate(()=>polinaDebug.getState())).current,'v3');
  assert.equal((await page.evaluate(()=>polinaDebug.getState())).view,'3d');
  assert.equal((await page.evaluate(()=>polina3DDebug.getState())).current,'v3');
  assert.equal(await page.locator('#polina-3d canvas').isVisible(),true);
  assert.equal(await page.locator('#switcher button').count(),4);
  assert.match(await page.locator('#side-title').textContent(),/Семь постоянных мест сна/);
  assert.match(await page.locator('#sleepmap').textContent(),/7 мест/);
  assert.match(await page.locator('svg').textContent(),/160 × 200/);
  assert.equal(await page.locator('a[href*="LIZA"],a[href*="kseniya"]').count(),0);

  for(const v of ['original','v1','v2','v3']){
    await page.locator('#switcher button[data-v="'+v+'"]').click();
    assert.equal((await page.evaluate(()=>polinaDebug.getState())).current,v);
    assert.equal((await page.evaluate(()=>polina3DDebug.getState())).current,v);
  }
  await page.locator('#p3d-furniture').uncheck();
  assert.equal((await page.evaluate(()=>polina3DDebug.getState())).showFurniture,false);
  await page.locator('#p3d-furniture').check();
  await page.locator('#p3d-cutaway').uncheck();
  assert.equal((await page.evaluate(()=>polina3DDebug.getState())).cutaway,false);
  await page.locator('#p3d-cutaway').check();
  await page.locator('#p3d-rotate').click();
  await page.locator('#p3d-zoom-in').click();
  await page.locator('#p3d-reset').click();
  await page.screenshot({path:'test-results/polina/3d.png',fullPage:true});
  await page.locator('#p-view2d').click();
  assert.equal((await page.evaluate(()=>polinaDebug.getState())).view,'2d');
  assert.equal(await page.locator('#polina-2d svg').isVisible(),true);
  await page.locator('#p-view3d').click();
  assert.equal((await page.evaluate(()=>polinaDebug.getState())).view,'3d');

  await page.goto('http://127.0.0.1:4173/polina.html#v1');
  await page.waitForFunction(()=>window.polinaDebug?.getState().current==='v1');
  assert.match(await page.locator('#plan-title').textContent(),/Спальня из холла/);
  await page.locator('#switcher button[data-v="v3"]').click();

  const downloadPromise=page.waitForEvent('download');
  await page.locator('#download-plan').click();
  const download=await downloadPromise;
  assert.equal(download.suggestedFilename(),'polina-v3.svg');

  await page.screenshot({path:'test-results/polina/desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'test-results/polina/mobile.png',fullPage:true});

  assert.deepEqual(errors,[]);
  console.log('PASS: Polina interactive 3D/2D, variant-synced geometry, furniture, cutaway/camera controls, v3 sleep plan, deep links, SVG download, mobile overflow, isolated navigation.');
} finally {
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
