import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../game.js',import.meta.url),'utf8');
const config=JSON.parse(fs.readFileSync(new URL('../game.json',import.meta.url),'utf8'));

// This runs our own reviewed engine without rendering. It is not a sandbox for uploads.
export function createWorld({rules={},random=Math.random}={}){
  const context2d=()=>new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
  const canvas=()=>({style:{},addEventListener(){},getContext:context2d,toDataURL:()=>'',focus(){},getBoundingClientRect:()=>({left:0,top:0})});
  const main=canvas(),storage={getItem:()=>null,setItem(){}};
  const window={THUNDER_SERVER:true,GAME:{...config,rules:{...config.rules,...rules},assets:{}},parent:{postMessage(){}},addEventListener(){}};
  const math=Object.create(Math);math.random=random;
  const context=vm.createContext({window,document:{body:{style:{},appendChild(){}},getElementById:()=>main,createElement:canvas,addEventListener(){}},localStorage:storage,innerWidth:480,innerHeight:900,devicePixelRatio:1,Math:math,requestAnimationFrame(){},Image:class{},console});
  new vm.Script(source,{filename:'thunder-game.js'}).runInContext(context,{timeout:5000});
  return window.__thunderEngine;
}
