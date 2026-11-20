import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [output,sdkFile]=process.argv.slice(2);
if(!output||!sdkFile)throw Error('Usage: node coop/build.mjs <new-output-directory> <pinned-hago-sdk.js>');
const out=path.resolve(output);
if(fs.existsSync(out))throw Error('Output must be a new directory');
const git=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const dirty=Boolean(execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim());
const config=JSON.parse(fs.readFileSync(path.join(root,'game.json'),'utf8'));
const files=new Map();
files.set('public/game.js',fs.readFileSync(path.join(root,'game.js')));
files.set('public/client.js',fs.readFileSync(path.join(root,'coop/client.js')));
files.set('public/cover.jpg',fs.readFileSync(path.join(root,'coop/cover.jpg')));
files.set('public/hago-sdk.js',fs.readFileSync(sdkFile));
files.set('public/config.js',Buffer.from('window.GAME='+JSON.stringify({...config,title:'雷霆战机 · 双人合作',assets:{}})+';'));
files.set('public/index.html',Buffer.from(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>雷霆战机 · 双人合作</title><style>html,body{margin:0;height:100%;overflow:hidden;background:#030916}canvas{width:100%;height:100%;touch-action:none}#connection{position:fixed;z-index:10;inset:0;display:flex;gap:20px;align-items:center;justify-content:center;flex-direction:column;background:#07101eee;color:#e6f6ff;font:16px system-ui;text-align:center;padding:28px}#connection[hidden]{display:none}button{padding:12px 24px;border:0;border-radius:24px;background:#eaf7ff;color:#14202f}</style><canvas id="game"></canvas><div id="connection"><span>正在连接合作房间…</span><button id="reconnect" hidden>重新进入</button></div><script src="hago-sdk.js"></script><script src="config.js"></script><script src="client.js"></script><script src="game.js"></script></html>`));
for(const name of ['game.js','game.json','coop/engine.mjs'])files.set('private/'+name,fs.readFileSync(path.join(root,name)));
const hashes=[...files].map(([name,bytes])=>({path:name,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}));
const buildId=createHash('sha256').update(JSON.stringify(hashes)).digest('hex');
const manifest={schema:1,kind:'magnolia-thunder-coop',title:'雷霆战机 · 双人合作',version:'1.0.0',source:{repository:'https://github.com/daoyan0206/EndlessJet.git',commit:git,dirty},buildId,orientation:'portrait',multiplayer:{enabled:true,minPlayers:1,maxPlayers:2,modes:['casual'],spectate:false,reconnectSeconds:0},files:hashes};
fs.mkdirSync(out,{recursive:true});for(const [name,bytes] of files){const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({output:out,buildId,source:manifest.source}));
