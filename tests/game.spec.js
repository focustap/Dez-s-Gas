const {test,expect}=require('@playwright/test');
async function launch(page){
  await page.goto('/');
  await expect(page.locator('#scene')).toBeVisible();
  const welcome=page.locator('[data-do="close"]').last();
  if(await welcome.isVisible())await welcome.click();
  await expect(page.locator('#modal')).toBeHidden();
}
async function dragPixel(page,from,to){
 const box=await page.locator('#scene').boundingBox();
 const xy=([x,y])=>({x:box.x+x*box.width/640,y:box.y+y*box.height/380});
 const a=xy(from),b=xy(to);
 await page.mouse.move(a.x,a.y);
 await page.mouse.down();
 await page.mouse.move(b.x,b.y,{steps:10});
 await page.mouse.up();
}
test('loads pixel gas station and rescans a legal convenience-store order',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await launch(page);
 await page.evaluate(()=>{
   const D=window.DezDebug,s=D.state;
   s.customer.type='store';s.customer.request=['candy','chips'];s.customer.officerId=null;s.customer.faction='civilian';
   s.room='store';D.refresh();
 });
 await page.screenshot({path:'test-results/store-desktop.png',fullPage:true});
 await dragPixel(page,[67,92],[320,291]);
 await dragPixel(page,[150,93],[319,292]);
 await expect.poll(()=>page.evaluate(()=>window.DezDebug.state.scanned.length)).toBe(2);
 expect(await page.evaluate(()=>window.DezDebug.correctCart())).toBe(true);
 await page.locator('[data-action="checkout"]').click();
 expect(await page.evaluate(()=>window.DezDebug.state.customerDone)).toBe(1);
 expect(await page.evaluate(()=>window.DezDebug.state.cash)).toBeGreaterThan(145);
 await page.reload();
 expect(await page.evaluate(()=>window.DezDebug.state.customerDone)).toBe(1);
 expect(errors).toEqual([]);
});
test('physically connects gas nozzle and pumps fuel',async({page})=>{
 await launch(page);
 await page.evaluate(()=>{
   const D=window.DezDebug,s=D.state;
   s.customer.type='gas';s.customer.amount=8;s.customer.officerId=null;s.fuel=80;D.tab('pumps');
 });
 await expect(page.locator('#scene')).toBeVisible();
 await page.screenshot({path:'test-results/pump-desktop.png',fullPage:true});
 await dragPixel(page,[135,211],[500,219]);
 expect(await page.evaluate(()=>window.DezDebug.ui.gasConnected)).toBe(true);
 const fill=page.locator('[data-action="fill"]');
 await expect(fill).toBeEnabled();
 await fill.hover();await page.mouse.down();await page.waitForTimeout(6200);await page.mouse.up();
 expect(await page.evaluate(()=>window.DezDebug.ui.fuelProgress)).toBeGreaterThan(0);
 await expect(page.locator('[data-action="fuelpay"]')).toBeEnabled();
 await page.locator('[data-action="fuelpay"]').click();
 expect(await page.evaluate(()=>window.DezDebug.state.customerDone)).toBe(1);
 expect(await page.evaluate(()=>window.DezDebug.state.fuel)).toBe(72);
});
test('fictional backroom handoff affects heat and factions; officers have portrait files',async({page})=>{
 await launch(page);
 await page.evaluate(()=>{
  const D=window.DezDebug,s=D.state;
  s.customer.type='deal';s.customer.request=['moon'];s.customer.faction='neon';s.customer.officerId=null;
  s.underground.moon=2;s.room='backroom';D.refresh();
 });
 await page.screenshot({path:'test-results/backroom-desktop.png',fullPage:true});
 const before=await page.evaluate(()=>({cash:DezDebug.state.cash,heat:DezDebug.state.heat}));
 await dragPixel(page,[82,96],[391,289]);
 expect(await page.evaluate(()=>DezDebug.state.customerDone)).toBe(1);
 const after=await page.evaluate(()=>({cash:DezDebug.state.cash,heat:DezDebug.state.heat,crew:DezDebug.state.factions.neon}));
 expect(after.cash).toBeGreaterThan(before.cash);
 expect(after.heat).toBeGreaterThan(before.heat);
 expect(after.crew).toBeGreaterThan(35);
 await page.locator('[data-room="office"]').click();
 await page.screenshot({path:'test-results/office-desktop.png',fullPage:true});
 await page.locator('[data-action="dossier"]').click();
 await expect(page.locator('.dossier-card canvas')).toHaveCount(3);
 await page.locator('[data-do="close"]').last().click();
});
test('upgrades and restocks spend cash and persist after reload',async({page})=>{
 await launch(page);
 await page.locator('[data-room="office"]').click();
 await page.locator('[data-action="shop"]').click();
 await expect(page.locator('.upgrade-card')).toHaveCount(12);
 await page.locator('[data-buy="desk"]').click();
 expect(await page.evaluate(()=>DezDebug.state.owned.includes('desk'))).toBe(true);
 await page.locator('[data-do="close"]').last().click();
 await page.locator('[data-action="supplies"]').click();
 await page.locator('[data-restock="legal:gum"]').click();
 expect(await page.evaluate(()=>DezDebug.state.legal.gum)).toBe(16);
 await page.reload();
 expect(await page.evaluate(()=>DezDebug.state.legal.gum)).toBe(16);
 expect(await page.evaluate(()=>DezDebug.state.owned.includes('desk'))).toBe(true);
});
test('mobile pixel-art game renders, navigation works and no console errors',async({browser})=>{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await launch(page);
 await page.screenshot({path:'test-results/store-mobile.png',fullPage:true});
 for(const room of ['pumps','backroom','office','store']){
  await page.locator('[data-room="'+room+'"]').click();
  await expect(page.locator('[data-room="'+room+'"]')).toHaveClass(/active/);
 }
 expect(errors).toEqual([]);
 await ctx.close();
});
test('an undercover sting ends the shift, while refusing avoids arrest',async({page})=>{
 await launch(page);
 await page.evaluate(()=>{
  const D=window.DezDebug,s=D.state;
  s.customer.type='deal';s.customer.request=['moon'];s.customer.faction='civilian';
  s.customer.officerId='quinn';s.customer.portrait={skin:1,hair:2,shirt:5,style:'plain'};
  s.underground.moon=2;s.room='backroom';D.refresh();
 });
 const initial=await page.evaluate(()=>DezDebug.state.cash);
 await dragPixel(page,[82,96],[389,288]);
 const record=await page.evaluate(()=>({arrests:DezDebug.state.arrests,completed:DezDebug.state.completed,busted:DezDebug.state.busted,penalties:DezDebug.state.dayStats.penalties,cash:DezDebug.state.cash}));
 expect(record.arrests).toBe(1);expect(record.completed).toBe(true);expect(record.busted).toBe(true);
 expect(record.cash).toBeLessThan(initial);
 await expect(page.locator('.modal-header h2')).toContainText('BUSTED');
 await page.locator('[data-do="nextday"]').click();
 expect(await page.evaluate(()=>DezDebug.state.completed)).toBe(false);
 expect(await page.evaluate(()=>DezDebug.state.busted)).toBe(false);
 await page.evaluate(()=>{
  const D=window.DezDebug,s=D.state;
  s.customer.type='deal';s.customer.officerId='quinn';s.customer.faction='civilian';s.customer.request=['moon'];
  s.room='backroom';D.refresh();
 });
 await page.locator('[data-action="refuse"]').click();
 expect(await page.evaluate(()=>DezDebug.state.arrests)).toBe(1);
});

test('visual v2 renders detailed scenes and tooltips while keeping all interactive hotspots',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await launch(page);
 const fs=require('fs');fs.mkdirSync('test-results/visual-v2',{recursive:true});
 const uniqueScenes=[];
 for(const room of ['store','pumps','backroom','office']){
   await page.locator('[data-room="'+room+'"]').click();
   await page.screenshot({path:'test-results/visual-v2/'+room+'.png',fullPage:true});
   const info=await page.evaluate(()=>{
     const c=document.querySelector('#scene'),data=c.getContext('2d').getImageData(0,0,640,380).data;
     const colorAt=(x,y)=>{const i=(y*640+x)*4;return Array.from(data.slice(i,i+3)).join(',')};
     return {corners:[colorAt(10,10),colorAt(320,180),colorAt(555,300)],hotspots:window.DezPixel.hotspots().length};
   });
   expect(info.hotspots).toBeGreaterThanOrEqual(3);
   uniqueScenes.push(info.corners.join('|'));
 }
 expect(new Set(uniqueScenes).size).toBe(4);
 await page.locator('[data-room="store"]').click();
 const canvas=page.locator('#scene'),bounds=await canvas.boundingBox();
 await page.mouse.move(bounds.x+bounds.width*70/640,bounds.y+bounds.height*93/380);
 await expect.poll(()=>page.evaluate(()=>window.DezDebug.ui.hover?.id)).toBe('candy');
 expect(errors).toEqual([]);
});
