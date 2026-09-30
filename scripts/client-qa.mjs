import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});let browser;
const base='http://127.0.0.1:4173';fs.mkdirSync('browser-client-artifacts',{recursive:true});
try {
 for(let i=0;i<50;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const [label,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.goto(base);
  await page.locator('h1').waitFor();
  for(const img of await page.locator('main img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('[data-image="kitchen"]').click();await page.locator('dialog[open] img').evaluate(i=>i.decode());await page.keyboard.press('Escape');assert.equal(await page.locator('dialog[open]').count(),0);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`browser-client-artifacts/case-${label}.png`,fullPage:true});
  await page.goto(base+'/engineering.html#E03');assert.equal(await page.locator('#sheet-caption').innerText(),'E03 / Функциональная схема групп и баланс нагрузок');
  const tabs=page.locator('[data-sheet]');assert.equal(await tabs.count(),22);
  for(const tab of await tabs.all()){await tab.click();await page.locator('#sheet-image').evaluate(i=>i.decode());}
  await page.locator('[data-sheet="A01"]').click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:`browser-client-artifacts/engineering-${label}.png`,fullPage:true});
 }
 const pdf=await fetch(base+'/output/pdf/Liza-D01-client-album.pdf');assert.ok(pdf.ok);assert.equal(Buffer.from(await pdf.arrayBuffer()).subarray(0,4).toString(),'%PDF');
 assert.deepEqual(errors,[]);console.log('Client case: desktop/mobile, 22 drawings, image viewer, PDF and overflow verified');
}finally{await browser?.close();server.kill();}
