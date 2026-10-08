(function(){
"use strict";
const Data=window.DezData,Pixel=window.DezPixel,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const canvas=$("#scene"),ctx=canvas.getContext("2d",{alpha:false}),KEY="dezsgas-save-v1";
const TOTAL_STOCK_COST=7;
let state=load(),ui={drag:null,pointer:{x:0,y:0},fingerDown:false,gasConnected:false,gasFilling:false,fuelProgress:0,modal:null,seenTutorial:false,toastTimer:null,audio:null,carColor:"#936d89",lastTick:performance.now()};
function load(){
 try{
  const x=JSON.parse(localStorage.getItem(KEY)||"null");
  if(x?.version===1){const s=Object.assign(Data.newState(),x);s.legal=Object.assign(Data.newState().legal,x.legal||{});s.underground=Object.assign(Data.newState().underground,x.underground||{});s.factions=Object.assign(Data.newState().factions,x.factions||{});s.dayStats=Object.assign(Data.newState().dayStats,x.dayStats||{});s.owned=Array.isArray(x.owned)?x.owned:[];s.log=Array.isArray(x.log)?x.log:[];s.scanned=Array.isArray(x.scanned)?x.scanned:[];s.locked=false;return s;}
 }catch(e){}
 return Data.newState();
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
function price(n){return "$"+Number(n||0).toFixed(2)}
function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
function cap(s){return s?.replace(/^\w/,c=>c.toUpperCase())||""}
function chime(kind="tap"){
 if(state.mute)return;
 try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 if(!ui.audio)ui.audio=new AC();
 if(ui.audio.state==="suspended")ui.audio.resume();
 const o=ui.audio.createOscillator(),g=ui.audio.createGain();
 const f={tap:490,scan:875,sale:1120,bad:170,gas:240,click:650}[kind]||530;
 o.type=kind==="gas"?"square":"triangle";o.frequency.setValueAtTime(f,ui.audio.currentTime);
 g.gain.setValueAtTime(.028,ui.audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ui.audio.currentTime+.12);
 o.connect(g).connect(ui.audio.destination);o.start();o.stop(ui.audio.currentTime+.12);
 }catch(e){}
}
function notice(msg){
 const el=$("#toast");el.textContent=msg;el.classList.add("show");
 if(ui.toastTimer)clearTimeout(ui.toastTimer);
 ui.toastTimer=setTimeout(()=>el.classList.remove("show"),2300);
}
function log(msg){
 state.log.unshift({msg,day:state.day,at:Date.now()});state.log=state.log.slice(0,30);
}
function quota(){return state.quota+Math.min(3,Math.floor((state.day-1)/2))+(state.owned.includes("sign")?2:0)}
function active(){return state.customer}
function isOfficer(c){return !!c?.officerId}
function catalog(type,id){return (type==="parcel"?Data.parcels:Data.goods).find(x=>x.id===id)}
function ensureCustomer(){
 if(state.customer||state.customerDone>=quota()||state.completed)return;
 state.customerIndex++;
 state.customer=Data.makeCustomer(state.day,state.customerIndex);
 // Officers and rival factions can enter the fictional backroom economy.
 if(state.customer.type==="deal"){
  if(Math.random()<.17){
   const officer=Data.sample(Data.officers);
   state.customer.name=officer.alias.toUpperCase();
   state.customer.officerId=officer.id;
   state.customer.portrait={skin:officer.skin,hair:officer.hair,shirt:officer.shirt,style:"plain"};
  }
  if(Math.random()<.18)state.customer.faction="iron";
  if(Math.random()<.28)state.customer.faction="neon";
 }
 state.customer.patience=100;state.customer.createdAt=Date.now();
 state.scanned=[];ui.fuelProgress=0;ui.gasFilling=false;ui.gasConnected=false;
 ui.carColor=["#8a7db1","#9b6275","#5d9295","#9b8d61"][state.customerIndex%4];
 log("New arrival: "+state.customer.name+".");
 save();
}
function routeFor(c){if(!c)return"store";return c.type==="gas"?"pumps":c.type==="deal"?"backroom":"store"}
function tab(room){if(!["store","pumps","backroom","office"].includes(room))return;ui.gasFilling=false;ui.drag=null;state.room=room;refresh();save()}
function avatarCanvas(model){
 const cv=document.createElement("canvas");cv.width=100;cv.height=100;const cx=cv.getContext("2d");cx.imageSmoothingEnabled=false;
 cx.fillStyle="#365267";cx.fillRect(0,0,100,100);Pixel.portrait(cx,model,9,4,3.15,false);
 return cv.toDataURL();
}
function customerBox(){
 const el=$("#customerCard"),c=active();
 if(!c){el.innerHTML='<p class="muted">The station is quiet. Next customer is on the way.</p>';return}
 const img=avatarCanvas(c.portrait);
 const known=c.officerId&&state.knownOfficers.includes(c.officerId);
 const faction=Data.factions.find(x=>x.id===c.faction);
 const need=c.type==="gas"?c.amount+" fuel units":c.type==="deal"?"A discreet pickup":c.request.map(id=>catalog("legal",id)?.name||id).join(" + ");
 el.innerHTML='<img class="card-face" src="'+img+'" alt="Pixel portrait of '+c.name+'"><div><div class="customer-name">'+c.name+'</div><div class="customer-role '+(known?"alert":"")+'">'+(c.type==="gas"?"⛽ VEHICLE":c.type==="deal"?"▣ BACKROOM PICKUP":known?"⚠ RECOGNIZED OFFICER":"▤ IN-STORE CUSTOMER")+'</div><div class="customer-detail">'+need+(faction?"<br>CREW: "+faction.name.toUpperCase():"")+'</div><div class="customer-wait"><i style="width:'+c.patience+'%"></i></div></div>';
}
function hud(){
 $("#day").textContent="DAY "+String(state.day).padStart(2,"0");$("#dayphase").textContent=state.completed?"CLOSING TIME":"NIGHT SHIFT";
 $("#cash").textContent=price(state.cash);$("#heat").textContent=Math.round(state.heat)+"%";
 $("#heat").style.color=state.heat>=65?"#ff8282":"#f0c78a";$("#rep").textContent="★ "+Math.round(state.rep);$("#shift").textContent=state.customerDone+"/"+quota();
 $("#weatherText").textContent="☂ "+state.weather;$("#roomTitle").textContent={store:"DEZ'S · CONVENIENCE STORE",pumps:"ROUTE 6 · FUEL FORECOURT",backroom:"STAFF ONLY · BACKROOM",office:"MANAGER'S OFFICE · DOSSIERS"}[state.room];
 $$(".tab").forEach(btn=>btn.classList.toggle("active",btn.dataset.room===state.room));
 $("#stockPanel").innerHTML=[
 ["FUEL",state.fuel+"/"+state.capacity],["STORE STOCK",Data.goods.reduce((n,g)=>n+(state.legal[g.id]||0),0)+" ITEMS"],
 ["BACKROOM",Data.parcels.reduce((n,g)=>n+(state.underground[g.id]||0),0)+" PACKAGES"],["CUSTOMERS",state.served+" TOTAL"],
 ["PENALTIES",price(state.dayStats.penalties)]
 ].map(x=>'<div class="ledger-row"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join("");
 $("#factions").innerHTML=Data.factions.map(f=>{
  const val=state.factions[f.id]??0;
  return '<div class="gang-row '+(val>15?"good":val<0?"bad":"")+'">'+f.symbol+" "+f.name+' <b style="float:right">'+(val>=0?"+":"")+val+'</b><span>'+f.tag+'</span></div>';
 }).join("");
 $("#progressFill").style.width=clamp(state.customerDone/quota()*100,0,100)+"%";
 $("#progressLabel").textContent=state.customerDone+" / "+quota()+" customers served or resolved";
 $("#journal").innerHTML=state.log.slice(0,9).map(x=>'<p>[DAY '+x.day+'] '+x.msg+'</p>').join("")||'<p>Your Route 6 story starts here.</p>';
 $("#tasks").innerHTML=[
 {done:state.dayStats.served>0,title:"Make your first sale",sub:"Scan items or fuel a car."},
 {done:state.customerDone>=Math.ceil(quota()/2),title:"Get halfway through shift",sub:"Keep the line moving."},
 {done:state.cash>=250,title:"Save up $250",sub:"Buy an upgrade in the office."}
 ].map(x=>'<div class="task">'+(x.done?"☑ ":"☐ ")+x.title+'<small><br>'+x.sub+'</small></div>').join("");
 $("#bulletin").innerHTML='<b>ROUTE 6 AFTER DARK</b><p>'+state.news+'</p>';
 $("#mute").textContent=state.mute?"♪̸":"♫";
 customerBox();
}
function work(){
 const c=active(),el=$("#workActions"),info=$("#workInfo"),title=$("#workTitle");
 let actions=[];
 if(state.completed){
  title.textContent="CLOSING TIME";info.textContent="Your shift is finished. Review the day to continue.";
  actions=[{id:"report",label:"VIEW DAILY REPORT",style:"primary"}];
 }else if(state.room==="store"){
  title.textContent="▤ CHECKOUT COUNTER";
  if(c&&(c.type==="store"||c.type==="cop")){
   const total=state.scanned.reduce((n,id)=>n+(catalog("legal",id)?.price||0),0);
   const wish=c.request.map(id=>catalog("legal",id)?.name||id).join(" + ");
   info.innerHTML='ORDER: <b>'+wish+'</b> · SCANNED: '+state.scanned.length+'/'+c.request.length+' · TOTAL: <b>'+price(total)+'</b>';
   actions=[
    {id:"checkout",label:"✓ BAG & CHARGE",style:"good",disabled:!correctCart()},
    {id:"clear",label:"↶ CLEAR SCANNER"},
    {id:"dossier",label:"☰ OFFICER LOOKUP"}
   ];
  }else{info.textContent=c?"This guest needs the "+(c.type==="gas"?"gas pumps":"backroom")+".":"Waiting for the next customer.";
   actions=[{id:"route",label:"GO TO CUSTOMER",style:"primary"}]}
 }else if(state.room==="pumps"){
  title.textContent="⛽ FUEL ISLAND";
  if(c?.type==="gas"){
   info.innerHTML=c.name+" wants <b>"+c.amount+" units</b>. Pump: "+Math.round(ui.fuelProgress)+"% · Fuel stock: "+state.fuel+" units. "+(ui.gasConnected?"<b>NOZZLE CONNECTED</b>":"Drag the nozzle to the car's fuel port.");
   actions=[
    {id:"fill",label:ui.gasConnected?"HOLD TO PUMP FUEL":"CONNECT NOZZLE FIRST",style:"primary",disabled:!ui.gasConnected},
    {id:"fuelpay",label:"✓ CHARGE "+price(c.amount*3.49),style:"good",disabled:ui.fuelProgress<99},
    {id:"cancelpump",label:"↶ RESET NOZZLE"}
   ];
  }else{info.textContent="Pump idle. Grab a gas customer from the front counter first.";actions=[{id:"route",label:"FIND CUSTOMER",style:"primary"}]}
 }else if(state.room==="backroom"){
  title.textContent="▣ PRIVATE COUNTER";
  if(c?.type==="deal"){
   const item=catalog("parcel",c.request[0]);
   const f=Data.factions.find(g=>g.id===c.faction);
   info.innerHTML='REQUEST: <b>'+(item?.name||"Unknown")+'</b> · '+price(item?.price||0)+' · FACTION: <b>'+(f?.name||"Unaffiliated")+'</b> · HEAT: '+Math.round(state.heat)+"%. Drag a parcel to the handoff hatch.";
   actions=[
    {id:"refuse",label:"✕ REFUSE REQUEST",style:"warn"},
    {id:"dossier",label:"☰ CHECK DOSSIERS"},
    {id:"gangintel",label:"♠ FACTION FILES"}
   ];
  }else{info.textContent="No backroom pickup is waiting. Work the pumps or store.";actions=[{id:"route",label:"GO TO CUSTOMER",style:"primary"}]}
 }else if(state.room==="office"){
  title.textContent="☰ MANAGER'S OFFICE";
  info.textContent="Watch your margins, read your fictional officer and gang dossiers, order supplies, and build your business.";
  actions=[
   {id:"shop",label:"★ UPGRADES",style:"primary"},
   {id:"supplies",label:"▤ RESTOCK",style:"good"},
   {id:"dossier",label:"☰ OFFICER FILES"},
   {id:"gangintel",label:"♠ GANG FILES"},
   {id:"report",label:"◫ SHIFT REPORT"}
  ];
 }
 el.innerHTML=actions.map(a=>'<button class="action '+(a.style||"")+'" data-action="'+a.id+'" '+(a.disabled?"disabled":"")+'>'+a.label+'</button>').join("");
 $("#sceneHint").textContent={
 store:"DRAG SNACKS ACROSS THE SCANNER · CHARGE TO COMPLETE",
 pumps:"DRAG NOZZLE TO FUEL PORT · HOLD TO PUMP",
 backroom:"COMPARE CLIENT TO DOSSIERS · CHOOSE WHO TO TRUST",
 office:"CLICK PORTRAITS OR OPEN FILES · PURCHASE UPGRADES"
 }[state.room];
}
function refresh(){hud();work();save()}
function correctCart(){
 const c=active();if(!c||!(c.type==="store"||c.type==="cop"))return false;
 const want=[...c.request].sort(),got=[...state.scanned].sort();
 return want.length===got.length&&want.every((x,i)=>x===got[i]);
}
function scanItem(id){
 const c=active(),good=catalog("legal",id);if(!good||!c||(c.type!=="store"&&c.type!=="cop")){notice("No store customer needs checkout right now.");return}
 if((state.legal[id]||0)<=0){notice(good.name+" is sold out! Restock in the office.");return}
 if(state.scanned.filter(x=>x===id).length>=(state.legal[id]||0)){notice("Not enough stock to scan more.");return}
 state.scanned.push(id);chime("scan");
 notice("BEEP · "+good.name+" · "+price(good.price));
 refresh();
}
function completeCustomer(message,earned=0,rep=0,heat=0,category="sales"){
 const c=active();if(!c)return;
 if(earned){state.cash+=earned;state.net+=earned;state.dayStats[category]=(state.dayStats[category]||0)+earned}
 state.rep=clamp(state.rep+rep,0,100);state.heat=clamp(state.heat+heat,0,100);
 state.served++;state.customerDone++;state.dayStats.served++;
 log(message);chime(earned>0?"sale":"bad");
 state.customer=null;state.scanned=[];ui.gasConnected=false;ui.gasFilling=false;ui.fuelProgress=0;
 if(state.customerDone>=quota()){state.completed=true;refresh();showReport()}
 else {ensureCustomer();refresh();notice(message)}
}
function checkout(){
 if(!correctCart()){notice("Scan everything on the customer's list first.");return}
 const c=active();
 let total=0;
 state.scanned.forEach(id=>{const g=catalog("legal",id);total+=g.price;state.legal[id]=Math.max(0,state.legal[id]-1)});
 if(state.owned.includes("desk"))total*=1.12;
 if(state.owned.includes("coffee"))total+=1.5;
 if(state.owned.includes("arcade"))state.rep=clamp(state.rep+1,0,100);
 total=Math.round(total*100)/100;
 completeCustomer(c.name+" checked out for "+price(total)+".",total,3,-3,"sales");
}
function connectNozzle(){
 if(active()?.type!=="gas"){notice("No car waiting for fuel.");return}
 if(state.fuel<active().amount){notice("Tank is too low. Order fuel in the office.");return}
 ui.gasConnected=true;ui.fuelProgress=0;ui.gasFilling=false;notice("Nozzle connected. Hold the pump to fill the tank.");chime("gas");work();
}
function pump(dt){
 if(!ui.gasFilling||!ui.gasConnected||active()?.type!=="gas")return;
 if(state.fuel<active().amount){ui.gasFilling=false;notice("Not enough fuel! Order a delivery.");return}
 const speed=state.owned.includes("pump")?29:19;
 ui.fuelProgress=clamp(ui.fuelProgress+speed*(dt/1000),0,100);
 if(ui.fuelProgress>=100){ui.gasFilling=false;notice("FULL TANK! Collect payment at the register.");chime("scan");work()}
}
function collectFuel(){
 const c=active();if(!c||c.type!=="gas"||ui.fuelProgress<99)return;
 state.fuel=Math.max(0,state.fuel-c.amount);
 const amount=Math.round(c.amount*3.49*100)/100;
 completeCustomer(c.name+" filled up for "+price(amount)+".",amount,2,-2,"fuel");
}
function refuse(){
 const c=active();if(c?.type!=="deal")return;
 const gang=c.faction;
 const knowsCop=!!c.officerId;
 if(gang==="iron"){state.factions.neon=clamp((state.factions.neon||0)+4,-100,100)}
 if(gang==="neon"){state.factions.neon=clamp((state.factions.neon||0)-6,-100,100)}
 completeCustomer(knowsCop?"You declined a suspicious pickup.":"You declined the private request.",0,knowsCop?4:0,-5,"underground");
}
function handoff(id){
 const c=active(),p=catalog("parcel",id);
 if(!c||c.type!=="deal"){notice("No private pickup is waiting.");return}
 if(!p){notice("That package isn't available.");return}
 if(id!==c.request[0]){notice("That isn't the requested sealed package.");return}
 if((state.underground[id]||0)<=0){notice("Out of stock. Check supplies.");return}
 const fac=Data.factions.find(f=>f.id===c.faction);
 // Fictional risk system: identity, rival faction, and heat matter.
 state.underground[id]--;
 const rival=c.faction==="iron",cop=!!c.officerId;
 if(cop){
  // A caught private transaction ends the shift. Officer dossiers and the
  // choice to refuse a request are real gameplay, not decorative flavor.
  const fine=state.owned.includes("cashbox")?55:95;
  state.cash=Math.max(0,state.cash-fine);
  state.heat=clamp(state.heat+28,0,100);
  state.rep=clamp(state.rep-13,0,100);
  state.arrests++;state.dayStats.penalties+=fine;state.dayStats.inspections++;
  state.busted=true;state.completed=true;
  state.customer=null;state.scanned=[];
  ui.fuelProgress=0;ui.gasFilling=false;ui.gasConnected=false;
  log("BUSTED! An undercover officer ended the shift. Penalty: "+price(fine)+".");
  chime("bad");refresh();report();
  return;
 }
 if(rival){
  state.factions.neon=clamp(state.factions.neon-14,-100,100);
  state.factions.iron=clamp(state.factions.iron+8,-100,100);
  state.heat=clamp(state.heat+11,0,100);
  completeCustomer("Rival faction transaction caused trouble at the diner.",p.price, -6,11,"underground");
  return;
 }
 if(c.faction==="neon")state.factions.neon=clamp(state.factions.neon+7,-100,100);
 if(c.faction==="canal")state.factions.canal=clamp(state.factions.canal+4,-100,100);
 completeCustomer("Private pickup completed: "+p.name+".",p.price,1,8+(p.rarity*3),"underground");
 maybeInspection();
}
function maybeInspection(){
 if(state.heat<46||state.completed)return;
 const chance=(state.heat-36)/125;
 if(Math.random()>=chance)return;
 const fine=state.owned.includes("cashbox")?18:35;
 state.cash=Math.max(0,state.cash-fine);
 state.heat=clamp(state.heat-18,0,100);
 state.dayStats.penalties+=fine;state.dayStats.inspections++;
 log("Routine fictional inspection. "+price(fine)+" paperwork penalty.");
 notice("INSPECTION! Administrative penalty "+price(fine)+".");
}
function openModal(content){
 ui.modal=true;$("#modal").hidden=false;
 $("#modal").innerHTML='<div class="modal-window">'+content+'</div>';
}
function closeModal(){ui.modal=null;$("#modal").hidden=true;$("#modal").innerHTML=""}
function modalHeader(over,title,desc){
 return '<div class="modal-header"><div><small class="modal-overline">'+over+'</small><h2>'+title+'</h2><p class="modal-desc">'+desc+'</p></div><button data-do="close" aria-label="Close">✕</button></div>';
}
function upgrades(){
 const shop=Data.upgrades.map(g=>{
  const owned=state.owned.includes(g.id);
  return '<div class="upgrade-card"><div class="sprite-icon">'+g.icon+'</div><strong>'+g.name+'</strong><p>'+g.desc+'</p><button data-buy="'+g.id+'" '+(owned||state.cash<g.price?"disabled":"")+'>'+(owned?"PURCHASED":price(g.price))+'</button></div>';
 }).join("");
 openModal(modalHeader("THE MANAGER'S OFFICE","STATION UPGRADES","Improve your desk, build out the station and invest your earnings. Wallet: "+price(state.cash))+'<div class="upgrade-grid">'+shop+'</div><div class="button-row"><button class="action" data-do="close">BACK TO WORK</button></div>');
}
function supplies(){
 const legal=Data.goods.map(g=>'<div class="ledger-row"><span>'+g.name+' ('+(state.legal[g.id]||0)+')</span><button class="action tiny" data-restock="legal:'+g.id+'">+6 · '+price(g.cost*6)+'</button></div>').join("");
 const underground=Data.parcels.map(g=>'<div class="ledger-row"><span>'+g.name+' ('+(state.underground[g.id]||0)+')</span><button class="action tiny" data-restock="parcel:'+g.id+'">+2 · '+price(g.cost*2)+'</button></div>').join("");
 openModal(modalHeader("SUPPLY ORDERS","RESTOCK THE STATION","Pay from cash to restock items and fuel. Fictional backroom goods are abstract inventory tokens.")+
 '<h3>STORE SHELVES</h3><div style="display:grid;gap:6px">'+legal+'</div><h3>GAS TANK</h3><div class="ledger-row"><span>'+state.fuel+'/'+state.capacity+' UNITS</span><button class="action tiny" data-restock="fuel">+25 UNITS · $55</button></div>'+
 '<h3>BACKROOM</h3><div style="display:grid;gap:6px">'+underground+'</div><div class="button-row"><button class="action" data-do="close">DONE</button></div>');
}
function restock(which){
 let total=0,units=0,obj=null,key="";
 if(which==="fuel"){if(state.fuel>=state.capacity){notice("Fuel tank is already full.");return}total=55;units=25}
 else{
  const [kind,id]=which.split(":");
  obj=catalog(kind,id);if(!obj)return;
  key=kind==="parcel"?"underground":"legal";
  units=key==="legal"?(state.owned.includes("cooler")?12:6):2;
  total=units*obj.cost;
  if(key==="underground"&&!state.owned.includes("shelves")&&(state.underground[id]||0)>=6){notice("Backroom shelves are full. Upgrade storage.");return}
 }
 if(state.cash<total){notice("Not enough cash for "+price(total)+" supplies.");return}
 state.cash-=total;
 if(which==="fuel")state.fuel=Math.min(state.capacity,state.fuel+units);
 else state[key][obj.id]=(state[key][obj.id]||0)+units;
 chime("sale");log("Ordered supplies for "+price(total)+".");refresh();supplies();
}
function buy(id){
 const up=Data.upgrades.find(g=>g.id===id);if(!up||state.owned.includes(id)||state.cash<up.price)return;
 state.cash-=up.price;state.owned.push(id);
 if(id==="tank")state.capacity=200;
 if(id==="garage"||id==="sign")state.rep=clamp(state.rep+2,0,100);
 log("Bought upgrade: "+up.name+".");chime("sale");refresh();upgrades();
}
function dossier(type){
 const officers=type!=="gangintel";
 const list=officers?Data.officers:Data.factions;
 const cards=list.map((p,i)=>{
  const cv=document.createElement("canvas");cv.width=88;cv.height=94;
  const ct=cv.getContext("2d");ct.imageSmoothingEnabled=false;Pixel.portrait(ct,{skin:p.skin??i,hair:p.hair??i,shirt:p.shirt??i,style:p.style},8,5,2.5,false);
  const label=officers?p.badge:p.tag;
  const blurb=officers?p.bio:(p.id==="iron"?"Rival to the Neon Serpents. Private deals can affect standing.":p.id==="neon"?"Your affiliated crew. Loyalty matters in fictional events.":"Independent local crew. Relations can shift.");
  return '<div class="dossier-card"><canvas data-face="'+p.id+'" width="88" height="94"></canvas><strong>'+p.name+'</strong><div class="dossier-type">'+label+'</div><p>'+blurb+'</p></div>';
 }).join("");
 openModal(modalHeader(officers?"ROUTE 6 CONSTABULARY":"LOCAL FACTION RECORDS",officers?"KNOWN OFFICERS":"FACTION DOSSIERS",officers?"Match the pixel portraits to visitors before making choices. These are fictional characters.":"Three fictional crews and their current standings.")+'<div class="dossier-grid">'+cards+'</div><div class="button-row"><button class="action" data-do="close">CLOSE FILE</button></div>');
 $$("#modal canvas[data-face]").forEach(cv=>{const id=cv.dataset.face,p=list.find(o=>o.id===id),c=cv.getContext("2d");c.imageSmoothingEnabled=false;c.fillStyle="#354c5c";c.fillRect(0,0,88,94);Pixel.portrait(c,{skin:p.skin??0,hair:p.hair??0,shirt:p.shirt??0,style:p.style},6,5,2.5,false)});
}
function report(){
 const stats=state.dayStats,avg=stats.scores.length?Math.round(stats.scores.reduce((a,b)=>a+b,0)/stats.scores.length):100;
 openModal(modalHeader("DEZ'S GAS · ACCOUNTING",state.busted?"BUSTED · SHIFT OVER":"DAY "+state.day+" REPORT",state.busted?"An undercover sting ended your night early. Next time, check the portrait files and choose carefully.":state.completed?"Time to roll the doors down and count the cash.":"Live shift numbers so far.")+
 '<div class="report-grid">'+[
 ["STORE",price(stats.sales)],["GAS",price(stats.fuel)],["PRIVATE",price(stats.underground)],["PENALTIES",price(stats.penalties)],["CUSTOMERS",stats.served],["HEAT",Math.round(state.heat)+"%"],["WALLET",price(state.cash)],["REP",Math.round(state.rep)]
 ].map(x=>'<div class="report-cell"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join("")+'</div>'+
 '<p class="modal-desc">The store runs on customer service, inventory and choices. Risk is fictional and abstract.</p>'+
 '<div class="button-row">'+(state.completed?'<button class="action good" data-do="nextday">▶ START DAY '+(state.day+1)+'</button>':'')+'<button class="action" data-do="close">'+(state.completed?"STAY HERE":"BACK TO SHIFT")+'</button></div>');
}
function nextDay(){
 if(!state.completed)return;
 state.day++;state.completed=false;state.busted=false;
 state.heat=clamp(state.heat-13,0,100);
 state.rep=clamp(state.rep+1,0,100);
 state.customer=null;state.customerDone=0;state.scanned=[];state.news=Data.sample(Data.news);state.weather=Data.sample(Data.weather);
 state.dayStats={sales:0,fuel:0,underground:0,penalties:0,served:0,scores:[],inspections:0};
 ui.fuelProgress=0;ui.gasConnected=false;ui.gasFilling=false;
 state.room="store";ensureCustomer();closeModal();refresh();notice("DAY "+state.day+" · Route 6 is open!");
}
function buttons(id){
 switch(id){
  case"checkout":checkout();break;case"clear":state.scanned=[];refresh();notice("Scanner cleared.");break;
  case"route":tab(routeFor(active()));break;
  case"refuse":refuse();break;case"fuelpay":collectFuel();break;
  case"cancelpump":ui.gasConnected=false;ui.gasFilling=false;ui.fuelProgress=0;work();break;
  case"shop":upgrades();break;case"supplies":supplies();break;
  case"dossier":dossier("officers");break;case"gangintel":dossier("gangintel");break;case"report":report();break;
 }
}
function screenPos(ev){
 const rect=canvas.getBoundingClientRect();
 return {x:clamp((ev.clientX-rect.left)*canvas.width/Math.max(1,rect.width),0,canvas.width),y:clamp((ev.clientY-rect.top)*canvas.height/Math.max(1,rect.height),0,canvas.height)};
}
function within(p,h){return p.x>=h.x&&p.x<=h.x+h.w&&p.y>=h.y&&p.y<=h.y+h.h}
function hit(p,kind){
 const h=Pixel.hotspots();
 return h.filter(x=>!kind||x.kind===kind).findLast(x=>within(p,x))||null;
}
function beginPointer(ev){
 if(ui.modal)return;
 ev.preventDefault();const p=screenPos(ev);ui.pointer=p;ui.fingerDown=true;
 const h=hit(p);if(!h)return;
 if(h.kind==="item"||h.kind==="parcel"){ui.drag={id:h.id,kind:h.kind,start:p};chime("tap");}
 else if(h.id==="nozzle"){ui.drag={id:"nozzle",kind:"nozzle",start:p};chime("tap");}
 else if(h.id==="fill"&&ui.gasConnected){ui.gasFilling=true;}
 else if(h.kind==="officer"){dossier("officers")}
 else if(h.kind==="gang"){dossier("gangintel")}
 else if(h.kind==="drop"){ // drop targets allow tap-selected items
   if(ui.selected){doDrop(ui.selected,h);ui.selected=null}
 }
}
function movePointer(ev){
 ui.pointer=screenPos(ev);
 ui.hover=Pixel.hotspots().filter(h=>within(ui.pointer,h)).slice(-1)[0]||null;
}
function endPointer(ev){
 const p=screenPos(ev),drag=ui.drag;ui.pointer=p;ui.drag=null;ui.fingerDown=false;ui.gasFilling=false;
 if(!drag)return;
 const receiver=hit(p,"drop");
 const moved=Math.hypot(p.x-drag.start.x,p.y-drag.start.y);
 if(receiver){doDrop(drag,receiver);return}
 if(moved<12){
  // Tap an item then tap the scanner, port, or hatch on touch devices.
  ui.selected=drag;notice("Selected! Tap its destination or drag it there.");
 }else {notice("Move it to the marked target to complete the action.")}
}
function doDrop(drag,target){
 if(drag.kind==="item"&&(target.id==="scanner"||target.id==="bag")){scanItem(drag.id);return}
 if(drag.id==="nozzle"&&target.id==="port"){connectNozzle();return}
 if(drag.kind==="parcel"&&target.id==="handoff"){handoff(drag.id);return}
 notice("That doesn't belong there.");
}
function pointerCancel(){ui.drag=null;ui.fingerDown=false;ui.gasFilling=false}
function frame(t){
 const delta=clamp(t-ui.lastTick,0,100);ui.lastTick=t;
 pump(delta);
 Pixel.draw(ctx,state,ui,t);
 requestAnimationFrame(frame);
}
document.addEventListener("click",ev=>{
 const btn=ev.target.closest("[data-room]");if(btn){tab(btn.dataset.room);return}
 const action=ev.target.closest("[data-action]");if(action){if(action.dataset.action!=="fill")buttons(action.dataset.action);return}
 const buyBtn=ev.target.closest("[data-buy]");if(buyBtn){buy(buyBtn.dataset.buy);return}
 const stock=ev.target.closest("[data-restock]");if(stock){restock(stock.dataset.restock);return}
 const modalAction=ev.target.closest("[data-do]");if(modalAction){const d=modalAction.dataset.do;if(d==="close")closeModal();if(d==="nextday")nextDay();return}
});
function holdButton(){
 const b=()=>$("#workActions [data-action='fill']");
 document.addEventListener("pointerdown",e=>{
  const btn=e.target.closest("[data-action='fill']");
  if(btn&&!btn.disabled){e.preventDefault();ui.gasFilling=true}
 });
 document.addEventListener("pointerup",()=>{ui.gasFilling=false});
 document.addEventListener("pointercancel",()=>{ui.gasFilling=false});
 document.addEventListener("keydown",e=>{
  if((e.key===" "||e.key==="Enter")&&e.target.closest("[data-action='fill']")){e.preventDefault();ui.gasFilling=true}
  if(e.key==="Escape"){if(ui.modal)closeModal();else ui.selected=null}
 });
 document.addEventListener("keyup",e=>{if(e.key===" "||e.key==="Enter")ui.gasFilling=false});
}
canvas.addEventListener("pointerdown",beginPointer);
canvas.addEventListener("pointermove",movePointer);
canvas.addEventListener("pointerup",endPointer);
canvas.addEventListener("pointercancel",pointerCancel);
canvas.addEventListener("pointerleave",()=>{ui.hover=null;if(!ui.fingerDown)ui.pointer={x:-100,y:-100}});
window.addEventListener("blur",pointerCancel);
$("#mute").addEventListener("click",()=>{state.mute=!state.mute;refresh()});
holdButton();
ensureCustomer();refresh();
if(state.firstRun){
 state.firstRun=false;save();
 openModal(modalHeader("WELCOME TO ROUTE 6","YOU'RE ON THE NIGHT SHIFT","Run Dez's Gas: scan snacks, fill cars, manage inventory and navigate fictional high-stakes customers. Choose what kind of business you want to run.")+
 '<p class="modal-desc">STORE: drag food from shelves over the scanner and charge. PUMPS: drag the nozzle to the car, hold to fuel. BACKROOM: compare customer portraits with the dossiers, choose to accept or refuse a fictional request. OFFICE: restock supplies, check intel and upgrade your station.</p>'+
 '<div class="button-row"><button class="action good" data-do="close">▶ OPEN THE STORE</button></div>');
}
requestAnimationFrame(frame);
window.DezDebug={state,ui,refresh,ensureCustomer,scanItem,checkout,connectNozzle,pump,collectFuel,handoff,refuse,tab,restock,buy,openReport:report,nextDay,correctCart};
})();