/* Dez's Gas: Neon-Noir pixel-art visual pass. The original renderer still
   owns the interactive hitboxes; these drawings replace only its pixels. */
(function(global){
"use strict";
const original=global.DezPixel,D=global.DezData;if(!original||!D)return;
const K={ink:"#101826",night:"#162337",navy:"#203249",wall:"#34475b",edge:"#192738",steel:"#778a9d",pale:"#f7e5c6",gold:"#efcb86",pink:"#f091ab",teal:"#83d7be",red:"#d87888"};
function r(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function text(c,s,x,y,n=16,color=K.pale,align="left"){c.fillStyle=color;c.font=n+"px VT323,monospace";c.textAlign=align;c.textBaseline="top";c.fillText(String(s),x,y);c.textAlign="left"}
function frame(c,x,y,w,h,color="#304455",highlight="#9aa1a3"){r(c,x+5,y+6,w,h,K.ink);r(c,x,y,w,h,color);r(c,x,y,w,4,highlight);r(c,x,y,4,h,highlight);r(c,x+w-5,y+5,5,h-5,"#162030");r(c,x+4,y+h-5,w-4,5,"#162030")}
function glow(c,x,y,radius,color,alpha=.24){c.save();let g=c.createRadialGradient(x,y,1,x,y,radius);g.addColorStop(0,color);g.addColorStop(1,"#00000000");c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(x-radius,y-radius,radius*2,radius*2);c.restore()}
function label(c,s,x,y,w,color=K.gold){r(c,x,y,w,23,"#172638");r(c,x,y,w,3,color);text(c,s,x+7,y+4,15,color)}
function wall(c,y=234){
 r(c,0,0,640,y,"#35475d");
 for(let b=12;b<y;b+=25){r(c,0,b,640,2,"#24364c");for(let x=(Math.floor(b/25)%2)*27;x<640;x+=54){r(c,x,b+2,2,23,"#47586b");r(c,x+7,b+4,14,2,"#ffffff08")}}
 r(c,0,0,640,12,"#283a4c");r(c,0,y-10,640,10,"#bc8891");
}
function floor(c,y=234){
 r(c,0,y,640,380-y,"#65545f");
 for(let b=y+17;b<380;b+=28){r(c,0,b,640,2,"#806c76");for(let x=(b%4)*15;x<640;x+=62)r(c,x,b+2,2,24,"#715e6c")}
 r(c,0,y,640,10,"#d19b9b");r(c,0,y+10,640,5,"#f1c0a7");
}
function stars(c,t){
 r(c,0,0,640,255,"#16243d");
 for(let i=0;i<60;i++){let x=(i*111+47)%638,y=(i*43+17)%223;r(c,x,y,i%5===0?3:2,2,i%2?"#e8e0da72":"#8faac75a")}
 let houses=[[0,156,97],[89,130,92],[182,167,70],[247,115,115],[367,148,92],[451,124,100],[550,153,92]];
 houses.forEach(([x,y,w],i)=>{r(c,x,y,w,251-y,i%2?"#243751":"#25344a");for(let a=x+9;a<x+w-8;a+=18)for(let b=y+17;b<244;b+=20)r(c,a,b,6,8,(a+b)%3?"#8c9fb360":"#efc49b76")});
 r(c,0,252,640,128,"#3e4155");
 for(let y=279;y<380;y+=26){r(c,0,y,640,2,"#56576a");for(let x=16+(y%3)*12;x<640;x+=110)r(c,x,y+9,48,2,"#d5b3a84d")}
 for(let i=0;i<20;i++){const x=(i*93)%640,y=306+(i*31)%60;r(c,x,y,19+(i%5)*9,2,i%2?"#edacb13c":"#89bdd450")}
}
function person(c,o,x,y,s=3.4){
 const skin=D.faces.skin[o?.skin??1]||"#dca48a",hair=D.faces.hair[o?.hair??0]||"#463840",shirt=D.faces.shirt[o?.shirt??0]||"#7f9dba";
 const q=(a,b,w,h,k)=>r(c,x+a*s,y+b*s,w*s,h*s,k);
 q(1,24,25,5,"#192430");q(3,20,22,9,shirt);q(7,17,14,5,skin);
 q(4,5,20,13,"#9f6958");q(5,6,18,12,skin);
 q(3,2,21,6,hair);q(6,0,17,4,hair);q(3,7,5,7,hair);q(22,6,4,5,hair);
 q(8,11,3,2,"#252b33");q(19,11,3,2,"#252b33");q(13,15,7,1,"#71454a");
 q(7,8,4,2,"#f5cea6");q(17,19,4,4,"#b99d89");
 if(o?.style==="uniform"){q(3,2,23,5,"#304a62");q(7,0,13,3,"#7a9ab0");q(9,22,4,3,"#f0ca79")}
 if(o?.style==="cap"){q(3,2,22,4,"#826674");q(14,6,14,3,"#826674")}
 if(o?.style==="beanie"){q(3,0,23,8,"#bc859b")}
 if(o?.style==="plain"){q(9,21,13,3,"#294050")}
 q(3,23,3,5,"#1b3548");q(24,23,3,5,"#1b3548");
}
function product(c,id,x,y,s=1){
 c.save();c.translate(x,y);c.scale(s,s);const q=(a,b,w,h,k)=>r(c,a,b,w,h,k);
 q(6,35,34,4,"#151b2699");
 const colors={
  candy:["#e994a7","#ffe4ba","#a84e7c"],chips:["#eac37c","#fff2ae","#b87854"],
  energy:["#9cb8dc","#c4dcde","#3f6986"],soda:["#ce7a83","#f1b8b0","#8d546d"],
  jerky:["#a98574","#e0b992","#7b5849"],gum:["#9bcfae","#e2f2d4","#5a9b82"],
  moon:["#9673ae","#d3b5ea","#59436d"],night:["#65b19d","#b9e5c9","#39776e"],
  glitch:["#d379a7","#f3c0d9","#9e4f84"]};
 const z=colors[id]||colors.candy;
 const bag=["chips","jerky","moon","night","glitch"].includes(id);
 q(bag?5:7,5,bag?33:28,31,z[0]);q(11,10,22,21,z[1]);q(14,15,16,10,z[2]);
 q(16,17,9,3,z[1]);q(11,4,19,4,z[2]);
 if(id==="energy"||id==="soda"){q(10,2,22,4,"#dfebea");q(17,17,9,11,z[2]);q(19,18,3,9,z[1])}
 if(id==="candy"||id==="gum"){q(1,15,7,16,z[0]);q(36,15,6,16,z[0]);q(14,17,14,5,z[2])}
 c.restore();
}
function shelf(c,x,y,w,h,title){
 frame(c,x,y,w,h,"#253a4e","#7e92a5");
 r(c,x+7,y+8,w-14,h-17,"#162b3d");
 r(c,x+5,y+66,w-10,9,"#7c8998");
 r(c,x+6,y+h-16,w-12,9,"#7c8998");
 label(c,title,x+8,y+2,Math.min(w-16,title.length*9+15),K.gold);
}
function store(c,S,ui,t){
 wall(c);floor(c);
 glow(c,150,48,175,"#ffc393",.22);glow(c,554,113,144,"#9ec4e6",.19);
 r(c,18,10,254,14,"#b97987");r(c,22,12,246,4,"#f0bbab");
 text(c,"ROUTE 6  •  24-HOUR MARKET",29,27,21,K.gold);
 shelf(c,18,55,271,143,"FRESH PICKS");
 shelf(c,299,55,155,143,"ICE COLD");
 for(let i=0;i<6;i++){
  let x=50+(i%3)*83,y=67+Math.floor(i/3)*64;
  product(c,D.goods[i].id,x,y,1.10);
  text(c,"$"+D.goods[i].price,x+18,y+43,13,"#e7ce9a","center");
 }
 for(let i=0;i<6;i++)product(c,i%2?"energy":"soda",313+(i%3)*40,70+Math.floor(i/3)*65,1);
 // refrigerator door reflections
 r(c,311,62,13,127,"#b3d8e520");r(c,376,62,7,125,"#c1e4e32c");r(c,440,62,6,125,"#b3d8e520");
 // window behind customer
 frame(c,466,35,168,184,"#23364e","#8295a4");
 r(c,476,45,148,164,"#1b2d44");
 for(let i=0;i<5;i++){let x=476+i*30,h=38+(i*17)%67;r(c,x,197-h,31,h,"#33435b");for(let y=204-h;y<196;y+=14)r(c,x+9,y,6,6,"#e3ae895f")}
 r(c,547,42,6,168,"#7895a3");r(c,478,142,146,5,"#627c8e");
 if(S.customer&&(S.customer.type==="store"||S.customer.type==="cop")){person(c,S.customer.portrait,505,99,3.5);text(c,S.customer.name,554,211,18,K.gold,"center")}
 else text(c,"NO CUSTOMER",550,170,20,K.steel,"center");
 r(c,0,231,640,19,"#9d6979");r(c,0,244,640,9,"#e7ad9f");r(c,0,252,640,128,"#826873");
 for(let x=0;x<640;x+=67)r(c,x,266,2,111,"#916e79");
 r(c,0,363,640,17,"#574558");
 // register
 frame(c,94,270,123,74,"#495e6d","#9badb7");
 frame(c,102,280,106,39,"#243c4d","#6b8c9e");
 r(c,110,287,90,24,"#a9d9bd");text(c,"$"+(ui.total||0),155,285,24,"#3e675f","center");
 for(let i=0;i<10;i++)r(c,104+(i%5)*19,326+Math.floor(i/5)*8,13,3,"#b6c3c0");
 // scanner
 frame(c,252,261,142,83,"#293948","#8192a4");
 r(c,263,273,119,48,"#121f31");
 for(let i=0;i<10;i++)r(c,277+i*10,280,4+i%3*2,29,i%2?"#e88aa2":"#b8a6a0");
 r(c,299,327,52,6,"#75859a");text(c,"SCAN",324,343,17,K.gold,"center");
 // bag
 frame(c,410,267,76,82,"#ad8977","#e7c0a2");r(c,417,262,61,12,"#ccb095");
 r(c,424,266,47,4,"#82625b");text(c,"DEZ'S",448,296,21,"#694e52","center");
 text(c,"BAG",448,319,16,"#795858","center");
 if(ui.drag?.kind==="item"){c.strokeStyle=K.gold;c.lineWidth=3;c.setLineDash([8,5]);c.strokeRect(251,259,144,81);c.setLineDash([]);glow(c,323,301,105,K.gold,.26)}
}
function car(c,x,y,color){
 // shadow and vehicle silhouette
 r(c,x+5,y+119,324,31,"#141c2a");
 r(c,x+9,y+59,322,59,"#141c2a");
 r(c,x+72,y+6,176,65,"#141c2a");
 r(c,x+15,y+63,317,52,color);
 r(c,x+80,y+13,158,58,color);
 r(c,x+91,y+20,141,38,"#8aabb7");
 r(c,x+95,y+22,75,34,"#c3dad5");r(c,x+179,y+22,46,34,"#5b788b");
 r(c,x+17,y+77,24,17,"#fff1b7");r(c,x+294,y+79,23,18,"#f3a0a2");
 glow(c,x+28,y+86,57,"#ffe5ae",.22);
 r(c,x+23,y+99,296,11,"#273447");
 r(c,x+39,y+113,69,37,"#111723");r(c,x+251,y+113,70,37,"#111723");
 r(c,x+49,y+124,49,23,"#637383");r(c,x+262,y+124,49,23,"#637383");
 r(c,x+242,y+64,36,25,"#1e2c3b");r(c,x+248,y+69,23,15,"#665967");
 frame(c,473,204,55,44,"#344d5c","#9bb7b7");r(c,489,218,21,13,"#8fcead");
}
function pumps(c,S,ui,t){
 stars(c,t);
 // canopy, pavement and reflections
 r(c,0,15,640,40,"#303d59");r(c,0,18,640,11,"#b9758e");r(c,0,29,640,5,"#f6c49c");
 r(c,0,43,640,13,"#314658");r(c,0,53,640,4,"#efba9d");
 r(c,6,53,17,217,"#536176");r(c,617,53,17,217,"#536176");
 for(const x of [34,317,553]){r(c,x,54,34,8,"#e3d5b6");glow(c,x+16,63,93,"#fff0bb",.20)}
 if(S.weather?.includes("RAIN"))for(let i=0;i<38;i++)r(c,(i*37+t/25)%640,(i*53+t/21)%285,2,10,"#a8cbdb65");
 frame(c,396,113,182,94,"#2a3c50","#74899c");r(c,406,133,163,62,"#162d43");
 frame(c,423,98,136,39,"#63314f","#ee86aa");text(c,"OPEN 24H",492,105,27,"#ffe2ba","center");
 glow(c,484,120,110,K.pink,.19);
 // pump
 frame(c,27,89,133,205,"#a67e83","#f0c5aa");
 frame(c,43,111,95,64,"#29465b","#7995a6");
 r(c,54,123,75,39,"#a9d9b9");text(c,"PUMP",89,128,21,"#41645b","center");text(c,"01",92,150,19,"#41645b","center");
 text(c,"GAS",92,74,26,K.gold,"center");
 frame(c,63,190,53,61,"#c58686","#f0c9a0");text(c,"DEZ",89,203,20,"#624454","center");
 text(c,"GAS",89,224,18,"#624454","center");
 r(c,122,198,17,31,"#33394a");r(c,130,188,31,10,"#a8b8c2");r(c,153,181,12,7,"#c0d3d6");r(c,118,240,5,47,"#273d4c");
 label(c,"$3.49 / GAL",29,309,167,K.gold);
 if(S.customer?.type==="gas"){
  car(c,250,140,ui.carColor||"#a77b8a");
  const pct=Math.min(100,Math.round(ui.fuelProgress||0));
  frame(c,332,304,251,46,"#203246","#71899c");
  r(c,344,316,227,19,"#142638");r(c,344,316,227*pct/100,19,pct===100?K.teal:K.gold);
  for(let i=0;i<13;i++)r(c,346+i*18,317,2,17,"#17293f88");
  text(c,pct+"% FILLED",456,312,21,K.pale,"center");
  if(ui.gasConnected)text(c,"HOLD TO FUEL",454,351,18,K.teal,"center");
 }else{frame(c,292,185,278,73,"#29384b","#607a8e");text(c,"NO CAR AT PUMP",430,206,27,K.steel,"center")}
 if(ui.drag?.id==="nozzle"){c.strokeStyle=K.gold;c.lineWidth=3;c.setLineDash([6,4]);c.strokeRect(470,203,66,48);c.setLineDash([])}
}
function backroom(c,S,ui,t){
 r(c,0,0,640,380,"#222a3d");for(let y=0;y<280;y+=23){r(c,0,y,640,3,"#353a4e");for(let x=(y%2)*19;x<640;x+=47)r(c,x,y+3,2,21,"#43455a")}
 r(c,0,280,640,100,"#494354");for(let y=292;y<380;y+=27)r(c,0,y,640,3,"#5e5667");
 glow(c,220,93,183,"#f4c99a",.22);
 r(c,211,0,4,46,"#7a7881");r(c,172,38,86,14,"#676c76");r(c,182,52,67,6,"#f1d1a1");
 frame(c,19,51,285,242,"#333d51","#8b8d93");
 r(c,28,60,266,211,"#18283a");for(let y of [123,190,260])r(c,25,y,269,11,"#9d8282");
 for(let i=0;i<3;i++){
  let x=49+i*79;frame(c,x,71,65,60,"#5b4c65","#aa8698");
  if((S.underground[D.parcels[i].id]||0)>0)product(c,D.parcels[i].id,x+12,79,1.05);
  text(c,(S.underground[D.parcels[i].id]||0)+" LEFT",x+32,130,15,K.gold,"center");
 }
 for(let i=0;i<7;i++){let x=35+(i%5)*51,y=204+(i%2)*15;frame(c,x,y,42,39,"#9b7b72","#cbae9a");r(c,x+17,y+8,5,25,"#ac8f7d")}
 // door and customer
 frame(c,489,25,141,182,"#323949","#636a7a");r(c,501,35,117,164,"#1a293c");
 for(let y=40;y<194;y+=12)r(c,504,y,111,2,"#35475d");
 if(S.customer?.type==="deal"){person(c,S.customer.portrait,509,66,3.35);text(c,S.customer.name,562,181,18,K.gold,"center")}
 else text(c,"STAFF ONLY",559,109,21,K.steel,"center");
 // handoff
 r(c,313,218,327,162,"#5a4758");r(c,313,213,327,14,"#dfae99");
 frame(c,334,248,132,96,"#353549","#8c8692");r(c,346,267,110,45,"#182939");
 text(c,"PICKUP",399,279,26,K.gold,"center");
 text(c,"DROP HERE",398,314,16,K.steel,"center");
 label(c,"RESTRICTED / STAFF",28,18,187,K.gold);
 if(ui.drag?.kind==="parcel"){c.strokeStyle=K.gold;c.lineWidth=3;c.setLineDash([7,5]);c.strokeRect(330,244,144,106);c.setLineDash([])}
}
function office(c,S,ui,t){
 wall(c,274);floor(c,275);
 glow(c,328,88,240,"#f6c8a9",.19);
 frame(c,18,19,603,246,"#66525c","#b69c91");r(c,26,28,587,226,"#886b67");
 for(let y=35;y<251;y+=13)r(c,29,y,576,1,"#b68c782c");
 label(c,"ROUTE 6  //  WHO'S WHO",44,33,234,K.gold);
 for(let i=0;i<3;i++){
  let x=49+i*181,off=D.officers[i];
  frame(c,x,72,145,172,"#e4ceb0","#f7e6c6");
  r(c,x+12,84,121,107,i%2?"#536b83":"#647c91");
  person(c,off,x+27,91,3.35);
  r(c,x+7,196,130,40,"#e8d7b9");
  text(c,off.alias.toUpperCase(),x+71,202,19,"#6d5352","center");
  text(c,off.badge,x+71,222,14,"#9c7471","center");
  r(c,x+63,66,18,8,"#bfaa92");r(c,x+71,63,5,13,"#e4d3b1");
 }
 r(c,0,270,640,15,"#c2978d");r(c,0,284,640,96,"#61505e");
 for(let i=0;i<3;i++){let f=D.factions[i],x=52+i*190;
  frame(c,x,292,150,58,"#223044","#697d8c");
  r(c,x+7,299,16,45,f.color);text(c,f.symbol,x+42,303,29,f.color);
  text(c,f.name.toUpperCase().split(" ")[0],x+93,300,19,K.pale,"center");
  text(c,f.tag,x+94,324,15,f.color,"center");
 }
}
const scenes={store,pumps,backroom,office};
function draw(c,S,ui,t=0){
 original.draw(c,S,ui,t); // retains exact tested hotspots
 c.save();c.imageSmoothingEnabled=false;
 (scenes[S.room]||store)(c,S,ui,t);
 if(ui.drag){const d=ui.drag,m=ui.pointer||{x:0,y:0};glow(c,m.x,m.y,54,K.gold,.13);
  if(d.kind==="item"||d.kind==="parcel")product(c,d.id,m.x-20,m.y-17,1.15);
  if(d.id==="nozzle"){r(c,m.x-10,m.y-20,18,37,"#374250");r(c,m.x+3,m.y-20,28,9,"#c1ccce")}
 }
 c.restore();
}
global.DezPixel={...original,draw,portrait:person,sprite:product};
})(window);