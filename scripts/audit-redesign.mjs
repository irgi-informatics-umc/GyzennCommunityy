import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import modpackData from '../src/data/modpacks.json' with { type: 'json' };

const base='http://127.0.0.1:4321';
const viewports=[{width:360,height:800},{width:390,height:844},{width:412,height:915},{width:768,height:1024},{width:1280,height:800}];
const routes=['/','/modpacks/','/modpacks/gyzenn-vanilla-plus-plus/','/modpacks/quick-cpvp-26-3/','/modpacks/derivative-shader/','/modpacks/better-sound-java/','/zalith/','/komunitas/','/casda-network/','/does-not-exist/'];
await mkdir('.audit/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});const issues=[];const pages=[];
for(const viewport of viewports){
  const page=await browser.newPage({viewport});pages.push(page);
  let expected404=false;
  page.on('console',msg=>{if(msg.type()==='error'&&!(expected404&&msg.text().includes('404 (Not Found)')))issues.push(`console ${viewport.width}: ${msg.text()}`)});
  page.on('pageerror',error=>issues.push(`pageerror ${viewport.width}: ${error.message}`));
  page.on('requestfailed',request=>{if(request.failure()?.errorText!=='net::ERR_ABORTED')issues.push(`request failed ${request.url()} ${request.failure()?.errorText}`)});
  page.on('response',response=>{const request=response.request();const intentional404=response.status()===404&&request.resourceType()==='document'&&new URL(response.url()).pathname==='/does-not-exist/';if(intentional404)expected404=true;else if(response.status()>=400)issues.push(`HTTP ${response.status()} ${response.url()}`);if(['image','font','script','stylesheet'].includes(request.resourceType())&&new URL(response.url()).origin!==base)issues.push(`external asset ${response.url()}`)});
  for(const route of routes){
    const response=await page.goto(base+route,{waitUntil:'networkidle'});
    if(route==='/does-not-exist/'&&response?.status()!==404)issues.push(`404 status ${response?.status()}`);
    await page.evaluate(async()=>{const images=[...document.images];images.forEach(image=>image.loading='eager');await Promise.all(images.map(image=>image.decode().catch(()=>undefined)))});
    const result=await page.evaluate(()=>{const small=[...document.querySelectorAll('a,button,input,select,summary,[role="button"]')].filter(el=>{if(el.closest('[hidden]'))return false;let parent=el;while(parent&&parent!==document.documentElement){if(getComputedStyle(parent).display==='none')return false;parent=parent.parentElement}if(el.closest('p')&&el.tagName==='A')return false;const r=el.getBoundingClientRect();return r.width<44||r.height<44}).map(el=>`${el.tagName.toLowerCase()} ${el.textContent?.trim().slice(0,28)} ${Math.round(el.getBoundingClientRect().width)}x${Math.round(el.getBoundingClientRect().height)}`);return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,small,missingImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src),floatOverlap:(()=>{const f=document.querySelector('.float'),b=document.querySelector('.bottom');if(!f||!b)return false;const a=f.getBoundingClientRect(),c=b.getBoundingClientRect();return a.bottom>c.top&&a.right>c.left&&a.left<c.right&&a.top<c.bottom})()}});
    if(result.scrollWidth>result.width)issues.push(`overflow ${route} ${viewport.width}: ${result.scrollWidth}`);
    if(result.small.length)issues.push(`small targets ${route} ${viewport.width}: ${result.small.join('; ')}`);
    if(result.missingImages.length)issues.push(`missing image ${route}: ${result.missingImages.join(', ')}`);
    if(result.floatOverlap)issues.push(`WhatsApp overlap ${route} ${viewport.width}`);
    if(route==='/modpacks/'){const downloads=await page.locator('.panel[data-panel="modpack"] .pack').evaluateAll(cards=>cards.map(card=>({id:card.id,url:card.querySelector('a.download')?.getAttribute('href')})));for(const card of downloads){const source=modpackData.find(item=>item.id===card.id);if(source?.downloads[0]?.url!==card.url)issues.push(`download URL changed ${card.id}`)}}
    if([360,412].includes(viewport.width)&&['/','/modpacks/','/modpacks/quick-cpvp-26-3/'].includes(route))await page.screenshot({path:join('.audit/screenshots',`${route.replaceAll('/','_')||'home'}-${viewport.width}.png`),fullPage:true});
  }
  if(viewport.width===360){
    await page.goto(base+'/modpacks/');
    for(const category of ['FPS BOOST','SURVIVAL','VISUAL']){await page.locator(`.chip[data-category="${category}"]`).click();if(await page.locator('#gyzenn-vanilla-plus-plus').isHidden())issues.push(`category filter ${category} omitted Vanilla++`)}
    await page.locator('.chip[data-category="FPS BOOST"]').click();await page.locator('#search').fill('Gyzenn Vanilla');await page.locator('#version').selectOption('26.3');if(await page.locator('#gyzenn-vanilla-plus-plus').isHidden())issues.push('combined category/search/version filter failed');await page.locator('#search').fill('no matching pack');if(await page.locator('#empty').isHidden())issues.push('empty state not shown');await page.getByRole('button',{name:'Reset filter'}).click();await page.getByRole('button',{name:'Tampilkan versi lama'}).click();if(await page.locator('#archived').isHidden())issues.push('archive toggle failed');await page.goto(base+'/modpacks/?kategori=fps-boost');if(await page.locator('#gyzenn-vanilla-plus-plus').isHidden())issues.push('URL category state failed');await page.goto(base+'/modpacks/#quick-cpvp-26-3');if(!page.url().includes('/modpacks/quick-cpvp-26-3/'))issues.push('legacy detail hash redirect failed');await page.goto(base+'/modpacks/');await page.getByRole('tab',{name:'Shader'}).click();if(await page.locator('[data-panel=shader]').isHidden())issues.push('shader tab failed');await page.getByRole('tab',{name:'Resource Pack'}).click();if(await page.locator('[data-panel=resourcepack]').isHidden())issues.push('resource pack tab failed');await page.goto(base+'/modpacks/quick-cpvp-26-3/');await page.getByRole('button',{name:'Salin tautan'}).click();await page.waitForFunction(()=>document.querySelector('#toast')?.textContent?.includes('Tautan disalin'));if(!(await page.locator('#toast').textContent()).includes('Tautan disalin'))issues.push('copy link toast failed');}
}
await browser.close();await writeFile('.audit/result.json',JSON.stringify({viewports,routes,issues},null,2));console.log(JSON.stringify({viewports,routes,issues},null,2));if(issues.length)process.exitCode=1;
