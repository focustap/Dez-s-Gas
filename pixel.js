(function(global){
"use strict";
const D=global.DezData;
const C={night:"#182338",wall:"#2e3d51",panel:"#4e6071",neon:"#e8b6a0",gold:"#efcd84",mint:"#7bd3ae",pink:"#df819e",steel:"#75839a",tile:"#3b4d5e",ink:"#121c2b"};
let hotspots=[];
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function box(c,x,y,w,h,a,b,shadow=true){if(shadow)rect(c,x+4,y+5,w,h,"#101923");rect(c,x,y,w,h,b);rect(c,x+4,y+4,w-8,h-8,a)}
function text(c,str,x,y,size=12,col="#fff",font="VT323",align="left"){c.fillStyle=col;c.font=size+"px "+font;c.textAlign=align;c.textBaseline="top";c.fillText(String(str),Math.round(x),Math.round(y));c.textAlign="left"}
function dashed(c,x,y,w,h,col=C.gold){c.strokeStyle=col;c.lineWidth=2;c.setLineDash([5,5]);c.strokeRect(x,y,w,h);c.setLineDash([])}
function sparkle(c,x,y,col="#f9dd83"){rect(c,x+4,y,4,12,col);rect(c,x,y+4,12,4,col)}
function noise(c,n,t){let seed=n*3331+Math.floor(t/1500)*987;for(let i=0;i<19;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%640;seed=(seed*1664525+1013904223)>>>0;const y=seed%360;rect(c,x,y,2,2,["#ffffff10","#a8e6ec16","#f3c0ce18"][i%3])}}
function tint(c,x,y,s,v){rect(c,x,y,s,s,v)}
function bg(c,room,time,S){
 rect(c,0,0,640,380,"#172637");
 const tileCols=room==="pumps"?C.night:C.wall;
 if(room==="pumps"){
  rect(c,0,0,640,265,"#1a2d44");
  rect(c,0,264,640,116,"#393a49");
  for(let i=0;i<10;i++)rect(c,i*87+(i%2)*25,289+(i%3)*22,45,3,"#6d707a");
  for(let i=0;i<44;i++){const x=(i*57+13)%640,y=(i*73+11)%240;rect(c,x,y,2,2,"#5e7992")}
  rect(c,0,28,640,8,"#485567");rect(c,6,36,10,238,"#536477");rect(c,616,36,12,238,"#536477");
  rect(c,0,36,640,15,"#64455c");rect(c,0,40,640,7,S.owned.includes("garage")?"#ffe598":"#d97eaa");
  if(S.owned.includes("garage")){rect(c,25,53,30,8,"#fce3a0");rect(c,340,53,30,8,"#fce3a0");rect(c,565,53,30,8,"#fce3a0")}
  if(S.weather.includes("RAIN"))for(let i=0;i<20;i++){const x=(i*45+time/32)%640,y=(i*27+time/16)%262;rect(c,x,y,2,9,"#718caa75")}
 }else{
  rect(c,0,0,640,234,tileCols);
  for(let y=15;y<245;y+=29){rect(c,0,y,640,2,"#3c5064");for(let x=(y%58?0:24);x<640;x+=58)rect(c,x,y,2,28,"#405266")}
  rect(c,0,234,640,146,"#535163");
  for(let y=249;y<380;y+=38)rect(c,0,y,640,3,"#6c6571");
  for(let x=0;x<640;x+=64)rect(c,x,239,2,141,"#625d6a");
  rect(c,0,227,640,11,"#c28195");
 }
 if(room==="store"||room==="office")noise(c,S.day,time);
}
function portrait(c,model,x,y,size=3,shadow=true){
 const skins=D.faces.skin,hairs=D.faces.hair,shirts=D.faces.shirt;
 const sx=skins[model.skin??1]||skins[0],hx=hairs[model.hair??0]||hairs[0],tx=shirts[model.shirt??1]||shirts[0];
 const p=(dx,dy,w,h,color)=>rect(c,x+dx*size,y+dy*size,w*size,h*size,color);
 if(shadow)p(1,22,24,4,"#121b28");
 p(3,18,20,9,tx);p(5,18,16,2,"#adbec24a");
 p(7,16,12,4,sx);p(4,6,18,13,sx);p(2,3,23,7,hx);p(4,7,4,4,hx);p(19,7,3,4,hx);
 if(model.style==="cap"||model.style==="uniform"){p(1,2,23,5,model.style==="uniform"?"#253d55":hx);p(14,7,12,2,"#2c3245")}
 if(model.style==="beanie")p(3,0,21,8,"#ba8e9d");
 p(8,12,3,2,"#272736");p(17,12,3,2,"#272736");p(11,16,6,1,"#72453e");
 if(model.style==="uniform"){p(8,20,3,4,"#d2c6a0");p(17,20,3,4,"#d2c6a0")}
}
function sprite(c,name,x,y,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);
 const draw=(a,b,w,h,color)=>rect(c,a,b,w,h,color);
 switch(name){
 case "candy":draw(4,7,28,20,"#d97f9a");draw(8,10,20,14,"#ffd4b2");draw(10,12,16,10,"#c65c81");draw(0,10,4,14,"#f0b8b6");draw(32,10,4,14,"#f0b8b6");break;
 case "chips":draw(4,2,31,34,"#d88b54");draw(7,5,25,27,"#e9c874");draw(15,8,9,7,"#fff0a9");draw(12,20,13,6,"#ad764d");break;
 case "energy":draw(8,2,22,34,"#8ab5ce");draw(5,0,28,5,"#cbd8e1");draw(13,10,15,20,"#406b86");draw(18,11,10,15,"#dee9b1");break;
 case "soda":draw(8,3,22,32,"#a9535e");draw(5,0,28,5,"#d9c4b9");draw(13,12,13,13,"#eaaa9c");break;
 case "jerky":draw(5,3,30,33,"#9a7268");draw(8,7,24,25,"#d4a686");draw(12,12,16,13,"#7e503a");break;
 case "gum":draw(3,10,34,18,"#9acdae");draw(8,13,24,12,"#e2f1d7");draw(15,16,9,6,"#689f82");break;
 case "moon":draw(3,6,32,31,"#654b7a");draw(7,10,24,22,"#b18cc7");draw(11,16,15,8,"#f0def7");break;
 case "night":draw(3,6,32,31,"#327c77");draw(7,10,24,22,"#84ceb8");draw(12,17,14,8,"#c9ffdf");break;
 case "glitch":draw(3,6,32,31,"#a24f81");draw(7,10,24,22,"#f3a5d2");draw(13,13,11,18,"#ffe7c6");break;
 case "fuel":draw(5,4,27,28,"#c16476");draw(9,8,20,20,"#e5bc8e");draw(17,0,9,5,"#9ca7ae");break;
 default:draw(6,6,27,27,"#8cb8ba");
 }
 c.restore();
}
function hotspot(x,y,w,h,id,kind,label=""){hotspots.push({x,y,w,h,id,kind,label})}
function shelves(c,x,y,w,h){
 box(c,x,y,w,h,"#5b6c75","#253448");rect(c,x+9,y+8,w-18,h-19,"#293b4c");
 rect(c,x+5,y+h/2,w-10,9,"#75839a");rect(c,x+5,y+h-15,w-10,8,"#75839a");
}
function drawStore(c,S,ui,t){
 bg(c,"store",t,S);
 // Shelves and cooler
 shelves(c,32,42,260,154);
 box(c,308,39,134,154,"#2e495a","#77818e");rect(c,319,48,110,116,"#273a4a");
 rect(c,319,112,110,5,"#7692a1");
 for(let i=0;i<6;i++)sprite(c,D.goods[i].id,50+(i%3)*83,67+Math.floor(i/3)*64,1.25);
 for(let i=0;i<3;i++)sprite(c,["soda","energy","soda"][i],332+i*36,68,1.0);
 for(let i=0;i<3;i++)sprite(c,["energy","soda","energy"][i],332+i*36,127,.9);
 text(c,"SNACKS",45,46,16,"#f4d29d");
 text(c,"COLD DRINKS",315,45,14,"#deedf1");
 // cash counter physical
 rect(c,0,217,640,22,"#aa7181");rect(c,0,239,640,133,"#826a70");rect(c,0,245,640,9,"#c69093");
 // shelves acts as grab
 for(let i=0;i<6;i++)hotspot(45+(i%3)*83,64+Math.floor(i/3)*64,48,50,D.goods[i].id,"item",D.goods[i].name);
 // scanner and register
 box(c,252,260,140,81,"#505b6c","#252e3d");rect(c,264,271,116,48,"#19232e");
 for(let i=0;i<6;i++)rect(c,276+i*15,282,8,24,"#c46d75");
 rect(c,298,328,49,7,"#77838c");
 text(c,"SCAN",321,346,15,"#edca80","VT323","center");
 hotspot(251,259,144,81,"scanner","drop","Drop items across scanner");
 // register
 box(c,99,270,112,61,"#71879a","#293648");rect(c,112,281,77,25,"#abd0b6");
 text(c,moneyText(ui.total||0),150,282,18,"#253a3b","VT323","center");
 for(let i=0;i<5;i++)rect(c,115+i*16,311,10,5,"#374755");
 // bag
 box(c,406,270,68,70,"#aa8b6e","#71594f");rect(c,418,263,47,20,"#b8a18d");
 text(c,"BAG",438,299,18,"#f9e8c3","VT323","center");
 hotspot(405,261,72,79,"bag","drop","Bag groceries");
 // store customer on right
 if(S.customer&&S.customer.type!=="gas"){
  portrait(c,S.customer.portrait,515,74,3.8);
  text(c,S.customer.name,552,207,16,"#f0d393","VT323","center");
 }else{text(c,"NO CUSTOMER",540,157,20,"#90abbc","VT323","center")}
 // signs details
 text(c,S.owned.includes("desk")?"DEZ'S DELUXE CHECKOUT":"DEZ'S CHECKOUT",45,8,19,"#f4d18f");
 if(S.owned.includes("sign"))text(c,"OPEN ★",553,12,19,"#82e9bb");
 if(ui.drag&&ui.drag.kind==="item"){dashed(c,250,261,145,78)}
}
function moneyText(v){return "$"+Number(v).toFixed(0)}
function car(c,x,y,color){
 rect(c,x+27,y+51,286,72,"#1d252c");rect(c,x+5,y+41,322,78,color);
 rect(c,x+68,y,173,48,color);rect(c,x+81,y+6,153,36,"#7591aa");rect(c,x+88,y+11,65,29,"#b0d0d1");rect(c,x+165,y+11,61,29,"#5e7c90");
 rect(c,x+22,y+58,13,21,"#fff1af");rect(c,x+304,y+58,13,21,"#eb8492");
 rect(c,x+31,y+109,60,40,"#161c26");rect(c,x+247,y+109,60,40,"#161c26");rect(c,x+42,y+118,40,25,"#6e7786");rect(c,x+258,y+118,40,25,"#6e7786");
 rect(c,x+30,y+85,264,9,"#eff0dd33");rect(c,x+243,y+71,21,15,"#262b35");
}
function drawPumps(c,S,ui,t){
 bg(c,"pumps",t,S);
 box(c,29,91,110,200,"#d3b6a9","#754e5a");rect(c,48,110,74,59,"#314b55");rect(c,56,119,56,30,"#a9dfbd");
 text(c,S.customer?.type==="gas"?"SALE":"FUEL",83,121,22,"#2c4a44","VT323","center");
 rect(c,65,185,35,55,"#d28b93");rect(c,69,191,27,47,"#e9c8a4");text(c,"GAS",83,205,18,"#794f50","VT323","center");
 rect(c,108,219,13,51,"#242d3c");
 // nozzle pickup physically rendered
 rect(c,120,199,19,31,"#272e37");rect(c,127,188,28,11,"#9facb6");rect(c,153,181,11,8,"#9facb6");
 rect(c,116,241,6,49,"#233b47");
 hotspot(116,176,59,79,"nozzle","item","Drag nozzle to vehicle");
 text(c,"PUMP 01",83,71,21,"#f9de99","VT323","center");
 if(S.customer?.type==="gas"){car(c,250,140,ui.carColor||"#9c647e");hotspot(470,203,65,47,"port","drop","Drop nozzle on gas cap")}
 else {car(c,250,140,"#606b75");text(c,"NO CAR AT PUMP",416,115,22,"#c4d2d7","VT323","center")}
 // floor placard
 box(c,29,304,167,52,"#1e2d39","#556575");
 text(c,"UNLEADED",41,306,18,"#e8d6b1");
 text(c,"$3.49 / GAL",41,326,19,"#7dd5af");
 if(S.customer?.type==="gas"){
  const pct=Math.min(100,Math.round(ui.fuelProgress||0));
  rect(c,340,310,235,30,"#17232c");rect(c,344,314,227*(pct/100),22,"#7ed0ae");text(c,pct+"% FUEL",458,316,21,"#f8f1d9","VT323","center");
  if(ui.fuelConnected){text(c,"HOLD THE PUMP PORT TO FILL",458,350,18,"#f9d98d","VT323","center");hotspot(340,302,235,50,"fill","hold","Hold to fill tank")}
 }
 if(ui.drag?.id==="nozzle")dashed(c,472,206,58,43,C.gold);
}
function drawBackroom(c,S,ui,t){
 bg(c,"backroom",t,S);
 rect(c,0,0,640,380,"#222637");for(let y=0;y<380;y+=32)rect(c,0,y,640,3,"#363447");
 // cargo shelf
 box(c,28,53,270,236,"#45485a","#161e2b");
 for(let y=116;y<280;y+=78)rect(c,33,y,260,10,"#826d78");
 for(let i=0;i<D.parcels.length;i++){
  const g=D.parcels[i],count=S.underground[g.id]||0;
  box(c,49+i*79,72,65,58,"#313b50","#858298");
  if(count>0)sprite(c,g.id,61+i*79,77,1.35);
  text(c,count+" LEFT",81+i*79,130,16,"#eac88c","VT323","center");
  hotspot(48+i*79,69,68,69,g.id,"parcel",g.name);
 }
 rect(c,320,211,320,167,"#5d4f56");rect(c,320,206,320,18,"#a2777f");
 box(c,333,249,130,92,"#444355","#1f2838");
 text(c,"HANDOFF",398,259,17,"#f0d29a","VT323","center");
 hotspot(330,244,145,105,"handoff","drop","Handoff item");
 rect(c,501,47,113,124,"#30384c");rect(c,509,55,96,105,"#1b2635");
 if(S.customer?.type==="deal"){portrait(c,S.customer.portrait,510,65,3.5);text(c,S.customer.name,557,180,19,"#f0cf94","VT323","center")}
 else {text(c,"NO PICKUP",558,120,21,"#98aaba","VT323","center")}
 text(c,"STOCK ROOM · AUTHORIZED PERSONNEL",33,11,18,"#e3b97e");
 text(c,"CHECK THE CREW FIRST",330,343,17,"#b8a9a5");
 if(ui.drag?.kind==="parcel")dashed(c,334,249,127,94);
}
function drawOffice(c,S,ui,t){
 bg(c,"office",t,S);
 box(c,18,19,603,246,"#32445b","#141e2c");
 rect(c,30,27,577,31,"#866a65");text(c,"ROUTE 6 · WHO'S WHO",320,34,23,"#f3daae","VT323","center");
 const portraits=D.officers;
 for(let i=0;i<3;i++){
  const x=49+i*181;
  box(c,x,72,145,172,"#b6a59b","#655b61");
  rect(c,x+11,83,122,116,"#637c91");portrait(c,portraits[i],x+26,91,3.25);
  text(c,portraits[i].alias.toUpperCase(),x+71,207,17,"#faf0d8","VT323","center");
  text(c,portraits[i].badge,x+71,228,14,"#f2d498","VT323","center");
  hotspot(x,69,144,178,portraits[i].id,"officer","Open officer dossier");
 }
 rect(c,0,267,640,113,"#665363");rect(c,0,264,640,14,"#a58280");
 for(let i=0;i<3;i++){
  const f=D.factions[i];const x=52+i*190;
  box(c,x,282,150,63,"#303b4b","#171f2e");
  rect(c,x+5,289,15,48,f.color);text(c,f.symbol, x+39,295,30,f.color);
  text(c,f.name.toUpperCase().split(" ")[0],x+61,288,17,"#ead1ae");
  text(c,f.tag,x+61,313,15,f.color);
  hotspot(x,280,150,67,f.id,"gang","Open gang intel");
 }
}
function draw(c,S,ui,t=0){
 c.imageSmoothingEnabled=false;hotspots=[];
 switch(S.room){case"pumps":drawPumps(c,S,ui,t);break;case"backroom":drawBackroom(c,S,ui,t);break;case"office":drawOffice(c,S,ui,t);break;default:drawStore(c,S,ui,t)}
 if(ui.drag){const d=ui.drag;const pointer=ui.pointer||{x:0,y:0};if(d.kind==="item"||d.kind==="parcel")sprite(c,d.id,pointer.x-20,pointer.y-19,1.25);
 if(d.id==="nozzle"){rect(c,pointer.x-10,pointer.y-20,15,40,"#343d48");rect(c,pointer.x+3,pointer.y-20,26,9,"#a8b2b8")}}
}
global.DezPixel={draw,portrait,hotspots:()=>hotspots,sprite};
})(window);