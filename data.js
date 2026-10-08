(function(global){
"use strict";
const goods=[
{id:"candy",name:"Candy Bar",price:4,cost:2,color:"#e79b9c",stock:8,shape:"bar"},
{id:"chips",name:"Crunch Chips",price:6,cost:3,color:"#f2c56f",stock:7,shape:"bag"},
{id:"energy",name:"VOLT Energy",price:9,cost:5,color:"#96bedd",stock:6,shape:"can"},
{id:"soda",name:"Fizz Soda",price:5,cost:3,color:"#de8e79",stock:6,shape:"can"},
{id:"jerky",name:"Road Jerky",price:11,cost:6,color:"#bb8f6a",stock:4,shape:"bag"},
{id:"gum",name:"Mint Gum",price:3,cost:1,color:"#9bd7b1",stock:10,shape:"bar"}
];
const parcels=[
{id:"moon",name:"Moon Dust",color:"#c7add8",cost:15,price:39,stock:3,rarity:1},
{id:"night",name:"Night Bloom",color:"#7ac4b7",cost:23,price:56,stock:2,rarity:2},
{id:"glitch",name:"Glitch Candy",color:"#e6a0be",cost:32,price:78,stock:1,rarity:3}
];
const factions=[
{id:"neon",name:"Neon Serpents",tag:"YOUR CREW",color:"#66d6b0",symbol:"◆",rivals:["iron"]},
{id:"iron",name:"Iron Vultures",tag:"RIVAL",color:"#dd7c7c",symbol:"✖",rivals:["neon"]},
{id:"canal",name:"Canal Kings",tag:"NEUTRAL",color:"#96afe3",symbol:"♠",rivals:[]}
];
const officers=[
{id:"vale",name:"OFFICER MARA VALE",badge:"R6-014",alias:"Mara Vale",hair:1,skin:2,shirt:2,style:"uniform",bio:"Route 6 patrol officer. Regular at the store.",saying:"Evening. How's business?"},
{id:"ortiz",name:"SERGEANT ELI ORTIZ",badge:"R6-021",alias:"Eli Ortiz",hair:4,skin:3,shirt:2,style:"uniform",bio:"Station sergeant. Known for random inspection events.",saying:"Keep the counter tidy."},
{id:"quinn",name:"DETECTIVE RAE QUINN",badge:"R6-038",alias:"Rae Quinn",hair:2,skin:1,shirt:5,style:"plain",bio:"Plainclothes detective. Portrait appears in your office dossier.",saying:"Just looking around."}
];
const customers=[
{id:"racer",name:"TESS RYDER",hair:0,skin:1,shirt:3,style:"beanie"},
{id:"hiker",name:"DAVE PARKER",hair:2,skin:2,shirt:1,style:"normal"},
{id:"teen",name:"JUNE RIVERS",hair:4,skin:0,shirt:4,style:"normal"},
{id:"trucker",name:"BIG MO",hair:1,skin:3,shirt:0,style:"cap"},
{id:"student",name:"MILO EAST",hair:3,skin:1,shirt:5,style:"normal"},
{id:"tourist",name:"KIRA NORTH",hair:2,skin:0,shirt:0,style:"beanie"},
{id:"nightowl",name:"ACE VIOLET",hair:5,skin:3,shirt:3,style:"cap"},
{id:"scout",name:"RIN FINCH",hair:4,skin:2,shirt:4,style:"normal"}
];
const upgrades=[
{id:"desk",name:"NEW CHECKOUT DESK",price:95,icon:"▰",desc:"Brighter counter and +12% on store sales.",group:"store"},
{id:"cooler",name:"SECOND COOLER",price:130,icon:"▥",desc:"Doubles legal-item restock size.",group:"store"},
{id:"pump",name:"FAST PUMP",price:155,icon:"⛽",desc:"Fuel fills 45% faster.",group:"gas"},
{id:"tank",name:"EXPANDED TANK",price:195,icon:"▨",desc:"Raises maximum fuel storage to 200 units.",group:"gas"},
{id:"sign",name:"NEON ROAD SIGN",price:80,icon:"✦",desc:"More customers per shift.",group:"decor"},
{id:"arcade",name:"BACKROOM ARCADE",price:180,icon:"★",desc:"Boosts reputation when legal customers leave happy.",group:"decor"},
{id:"shelves",name:"NEW STOCK SHELVES",price:110,icon:"▤",desc:"Adds capacity for fictional underground inventory.",group:"inventory"},
{id:"cashbox",name:"SECURE CASHBOX",price:145,icon:"▣",desc:"Reduces monetary penalties from in-game raids.",group:"security"},
{id:"coffee",name:"COFFEE CORNER",price:75,icon:"☕",desc:"Coffee service earns a small bonus on ordinary sales.",group:"store"},
{id:"office",name:"DOSSIER WALL",price:90,icon:"☰",desc:"Unlocks upgraded faction intel and extra portraits.",group:"intel"},
{id:"garage",name:"CANOPY LIGHTS",price:120,icon:"☀",desc:"Makes the gas station shine through rainy nights.",group:"decor"},
{id:"jukebox",name:"PIXEL JUKEBOX",price:100,icon:"♫",desc:"Customer mood bonuses on clean shifts.",group:"decor"}
];
const districts=["Old Overpass","East Docks","Broken Mile","Mill Road","Rail Crossing"];
const news=[
"The overpass lights are flickering again.",
"Local band plays a late-night show down Route 6.",
"Rain expected until sunrise. Drive slow.",
"A neighborhood block party boosted convenience store traffic.",
"Roadwork detours are sending more cars to the station.",
"Rumors of a rare delivery have everyone talking.",
"Patrols increased around the highway after a noisy weekend."
];
const weather=["LIGHT RAIN","NEON FOG","COLD NIGHT","CLEAR SKY","THUNDERSTORM","LATE SHIFT"];
const faces={skin:["#edc4a5","#d8a080","#b4765c","#8c5a42"],hair:["#302e37","#554034","#ca8d60","#211c2a","#71413f","#d6bc84"],shirt:["#568b98","#9b7d6d","#3b6489","#9e5268","#6b8f63","#866e98"]};
function sample(list){return list[Math.floor(Math.random()*list.length)]}
function shuf(list){const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function makeCustomer(day=1,index=0){
 const typeRoll=Math.random();
 const type=typeRoll<.42?"store":typeRoll<.70?"gas":typeRoll<.88?"deal":"cop";
 const isOfficer=type==="cop" || (type==="store" && Math.random()<.07);
 const c=isOfficer?sample(officers):sample(customers);
 const faction=isOfficer?"law":Math.random()<.55?"civilian":sample(factions).id;
 let requested=[];
 let amount=0,grade=0;
 if(type==="store"||type==="cop"){requested=shuf(goods.map(g=>g.id)).slice(0,Math.random()<.55?2:1)}
 if(type==="gas")amount=10+Math.floor(Math.random()*15);
 if(type==="deal"){requested=[sample(parcels).id]}
 return {id:Date.now()+index+Math.floor(Math.random()*1e6),name:c.name,portrait:{skin:c.skin,hair:c.hair,shirt:c.shirt,style:c.style},officerId:isOfficer?c.id:null,faction,type: isOfficer && type==="deal"?"cop":type,request:requested,amount,price:0,patience:100,createdAt:Date.now(),completed:[],paid:0};
}
function newState(){
 const legal={};goods.forEach(g=>legal[g.id]=g.stock);
 const underground={};parcels.forEach(g=>underground[g.id]=g.stock);
 return {version:1,day:1,cash:145,heat:8,rep:22,served:0,arrests:0,net:0,owned:[],legal,underground,fuel:80,capacity:100,customer:null,customerIndex:0,customerDone:0,quota:7,room:"store",scanned:[],fuelProgress:0,fuelHolding:false,completed:false,factions:{neon:35,iron:-25,canal:0},knownOfficers:["vale","ortiz","quinn"],log:[],dayStats:{sales:0,fuel:0,underground:0,penalties:0,served:0,scores:[],inspections:0},weather:sample(weather),news:sample(news),stockLevel:0,mute:false,firstRun:true,locked:false};
}
global.DezData={goods,parcels,factions,officers,customers,upgrades,districts,news,weather,faces,sample,shuf,makeCustomer,newState};
})(window);