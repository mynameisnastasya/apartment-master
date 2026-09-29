import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const output='test-results/quiet-geology';fs.mkdirSync(output,{recursive:true});
const server=spawn(process.execPath,['scripts/serve.mjs'],{stdio:'ignore'});let browser;
try{
 for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:4173/model.html')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 let config={headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']};
 if(process.env.APARTMENT_CHROMIUM==='bundled'){const {default:binary}=await import('@sparticuz/chromium');config={headless:true,executablePath:process.env.APARTMENT_BROWSER_PATH||await binary.executablePath(),args:binary.args};}
 browser=await chromium.launch(config);const page=await browser.newPage({viewport:{width:1440,height:1050}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/model.html');await page.waitForFunction(()=>window.apartment?.ready,{},{timeout:60000});
 assert.equal(await page.evaluate(()=>window.apartment.state.style),'linen');
 const save=async name=>{const data=await page.evaluate(()=>{const a=window.apartment;a.render();return a.renderer.domElement.toDataURL('image/png');});fs.writeFileSync(`${output}/${name}.png`,Buffer.from(data.split(',')[1],'base64'));};
 const stats=await page.evaluate(()=>{let vertices=0,invalid=0;window.apartment.root.traverse(o=>{const p=o.geometry?.attributes.position;if(p){vertices+=p.count;for(const n of p.array)if(!Number.isFinite(n))invalid++;}});return{vertices,invalid,moon:!!window.apartment.root.getObjectByName('sculpted-lunar-relief'),stone:!!window.apartment.root.getObjectByName('living-stone-wall')};});
 assert.equal(stats.invalid,0);assert.ok(stats.moon&&stats.stone);await save('overview');
 for(const room of ['kitchen','living','adult','alice','bath']){await page.locator(`[data-room="${room}"]`).click();assert.equal(await page.evaluate(()=>window.apartment.state.focus),room);await save(room);}
 await page.locator('[data-room="adult"]').click();await page.locator('#lighting-toggle').click();assert.equal(await page.evaluate(()=>window.apartment.state.evening),true);await save('adult-evening');await page.locator('#lighting-toggle').click();
 for(const variant of ['D','E','F','G','H']){await page.locator(`[data-variant="${variant}"]`).click();assert.ok(await page.evaluate(()=>window.apartment.routeResult('entry','bathBasin').ok));}
 await page.locator('[data-variant="D"]').click();for(const id of ['japandi','nordic','atelier','graphite','linen']){await page.locator(`[data-style="${id}"]`).click();assert.equal(await page.evaluate(()=>window.apartment.state.style),id);}
 const exportBytes=await page.evaluate(async()=>(await window.apartment.exportModel()).byteLength);assert.ok(exportBytes>10000);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${output}/mobile.png`});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.goto('http://127.0.0.1:4173/design.html');assert.equal(await page.locator('table').count(),2);assert.ok((await page.locator('h1').innerText()).includes('Тихая геология'));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);fs.writeFileSync(`${output}/results.json`,JSON.stringify({ok:true,stats,exportBytes,errors},null,2));console.log(JSON.stringify({ok:true,stats,exportBytes,errors}));
}finally{await browser?.close();server.kill();}
