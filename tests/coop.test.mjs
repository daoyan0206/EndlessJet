import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld} from '../coop/engine.mjs';
const step=(w,seconds)=>{for(let i=0;i<Math.ceil(seconds*30);i++)w.step(1/30);return w.snapshot();};

test('two independent pilots share one authoritative battle and keep it when the creator leaves',()=>{
  const w=createWorld({random:()=>.5});assert.ok(w.addPlayer('a','甲'));assert.ok(w.addPlayer('b','乙'));assert.equal(w.addPlayer('c','丙'),false);
  assert.ok(w.action('a','start'));const before=w.snapshot();assert.equal(before.roundId,1);
  w.input('a',{dx:1,dy:0});const moved=step(w,.3);assert.ok(moved.pilots[0].hero.x>before.pilots[0].hero.x);assert.equal(moved.pilots[1].hero.x,before.pilots[1].hero.x);
  step(w,10);const battle=w.snapshot();assert.ok(battle.elapsed>10);assert.ok(battle.shots.some(s=>s.owner==='a'));assert.ok(battle.shots.some(s=>s.owner==='b'));
  w.removePlayer('a');assert.equal(w.snapshot().roundId,1);const time=w.snapshot().elapsed;step(w,1);assert.ok(w.snapshot().elapsed>time);
  assert.ok(w.addPlayer('c','丙'));assert.equal(w.snapshot().roundId,1);assert.equal(w.snapshot().pilots.find(p=>p.id==='c').slot,0);
});
test('untrusted movement, skill and restart cannot change authority or reset an active round',()=>{
  const w=createWorld();w.addPlayer('a','甲');w.action('a','start');
  assert.equal(w.input('unknown',{dx:1}),false);assert.equal(w.input('a',{dx:Infinity}),false);assert.equal(w.input('a',{dx:999}),false);assert.equal(w.input('a',{target:{x:NaN,y:4}}),false);
  assert.equal(w.action('unknown','thunder'),false);assert.ok(w.action('a','thunder'));assert.equal(w.action('a','thunder'),false);assert.equal(w.action('a','start'),false);
  const charge=w.snapshot().pilots[0].charge;assert.equal(charge,0);
  w.input('a',{target:{x:999999,y:-99999},hearts:999,score:1e9});step(w,1/30);const s=w.snapshot();assert.ok(s.pilots[0].hero.x<180);assert.equal(s.pilots[0].hearts,6);assert.equal(s.score,0);
});
test('stale held movement expires and disconnected pilots cannot send intents',()=>{
  const w=createWorld();w.addPlayer('a','甲');w.action('a','start');w.input('a',{dx:.01,dy:0});step(w,1);const x=w.snapshot().pilots[0].hero.x;step(w,.5);assert.equal(w.snapshot().pilots[0].hero.x,x);
  w.removePlayer('a');const time=w.snapshot().elapsed;step(w,1);assert.equal(w.snapshot().elapsed,time);assert.equal(w.input('a',{dx:-1}),false);
});

test('real team death ends one round and a guarded restart resets both pilots in the same room',()=>{
  const w=createWorld({random:()=>.5,rules:{hearts:1,enemyDamage:30,hitInvulnerability:.1,enemyHealth:400,enemySpawnEvery:.12,bossEvery:1000}});
  w.addPlayer('a','甲');w.addPlayer('b','乙');w.action('a','start');
  for(let i=0;i<3000&&w.snapshot().phase!=='lost';i++){for(const id of ['a','b'])w.input(id,{target:{x:240,y:620}});w.step(1/30);}
  const lost=w.snapshot();assert.equal(lost.phase,'lost');assert.ok(lost.pilots.every(p=>p.hearts===0));assert.equal(w.action('a','start'),false);
  step(w,1.1);assert.equal(w.action('b','start'),true);const next=w.snapshot();assert.equal(next.roundId,2);assert.equal(next.phase,'playing');assert.equal(next.elapsed,0);assert.equal(next.score,0);assert.ok(next.pilots.every(p=>p.hearts===1));assert.equal(next.pilots.length,2);
});
