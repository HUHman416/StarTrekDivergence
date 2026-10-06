import test from "node:test";
import assert from "node:assert/strict";
import {createGame, ERAS, currentEra, campaignYear, awayEquipment, techAvailable, develop, startAway, awayAction, awayCombat, awayTick, awayLook, awayLineOfSight, restoreSave, exportSave, advance, decision} from "../src/game.js";
function deployed(year=2151,site="rigel") {
  const s=createGame("earth",year);s.taskForces[0].location=site;s.location=site;s.sectors.find(x=>x.id===site).surveyed=true;startAway(s,site);return s;
}
function tick(s,seconds,input={}){for(let t=0;t<seconds;t+=.05)awayTick(s,input,.05);}
function aim(s,x,y){awayLook(s,Math.atan2(y-s.away.py,x-s.away.px)-s.away.angle);}
function position(s,x,y){Object.assign(s.away,{px:x,py:y,x:Math.floor(x),y:Math.floor(y)});}
test("four era starts issue era equipment and round-trip without altering diplomacy",()=>{
  for(const e of ERAS){const s=deployed(e.year);assert.equal(currentEra(s).id,e.id);assert.equal(s.away.weapon,e.id);assert.equal(s.away.charge,e.capacity);assert.deepEqual(restoreSave(exportSave(s)),s);assert.equal(s.relations.klingon.status,"neutral");}
});
test("calendar rollover changes theme availability but research controls sidearms",()=>{
  const s=createGame();s.turn=(2245-2151)*12;assert.equal(campaignYear(s),2244);assert.equal(currentEra(s).id,"frontier");s.resources.research=1000;
  const before=JSON.stringify(s);assert.throws(()=>develop(s,"sidearm_constitution"));assert.equal(JSON.stringify(s),before);
  decision(s,0);advance(s);assert.equal(campaignYear(s),2245);assert.equal(currentEra(s).id,"constitution");assert.ok(techAvailable(s,"sidearm_constitution"));assert.equal(awayEquipment(s).id,"frontier");develop(s,"sidearm_constitution");assert.equal(awayEquipment(s).id,"constitution");
  assert.ok(s.log.some(e=>e.text.includes("Duotronic")));
});
test("peaceful sites do not manufacture hostiles and existing tech benefits the team",()=>{
  for(const id of ["haven","eden"]){const s=deployed(2151,id);assert.equal(s.away.enemies.length,0);}
  const s=createGame();s.tech.push("armor","medicine","weapons");assert.equal(awayEquipment(s).damage,27);assert.equal(awayEquipment(s).medkits,2);assert.equal(awayEquipment(s).protection,.7);
});
test("continuous movement collides with walls, strafes, and normalizes diagonal speed",()=>{
  const a=deployed(),b=deployed();a.away.enemies=[];b.away.enemies=[];
  tick(a,.5,{forward:1});tick(b,.5,{forward:1,strafe:1});
  assert.ok(Math.abs(Math.hypot(a.away.px-4.5,a.away.py-7.5)-Math.hypot(b.away.px-4.5,b.away.py-7.5))<.01);
  tick(a,10,{forward:1});assert.ok(a.away.py>=1.18);assert.ok(a.away.py<1.3);assert.ok(restoreSave(exportSave(a)));
  const x=a.away.px;awayTick(a,{strafe:1},1e6);assert.ok(a.away.px-x<=.2);
});
test("mouse look wraps and updates compass heading",()=>{const s=deployed();awayLook(s,100*Math.PI+.2);assert.ok(s.away.angle>=-Math.PI&&s.away.angle<=Math.PI);assert.ok(restoreSave(exportSave(s)));});
test("walls block both phaser hits and hostile return fire",()=>{
  const s=deployed();position(s,4.5,3.5);s.away.enemies=[{id:"guard-0",kind:"drone",x:2.5,y:3.5,hp:66,cooldown:0,alert:true}];
  assert.equal(awayLineOfSight(4.5,3.5,2.5,3.5),false);aim(s,2.5,3.5);awayCombat(s,"fire");assert.equal(s.away.enemies[0].hp,66);tick(s,5);assert.equal(s.away.health,100);
});
test("aim matters; only nearest aligned visible enemy is hit, stun is nonlethal",()=>{
  const s=deployed();position(s,4.5,7.5);s.away.enemies=[{id:"guard-0",kind:"drone",x:4.5,y:5.5,hp:66,cooldown:2.5,alert:false},{id:"guard-1",kind:"drone",x:4.5,y:3.5,hp:66,cooldown:2.5,alert:false}];
  aim(s,7.5,7.5);awayCombat(s,"fire");assert.equal(s.away.enemies[0].hp,66);s.away.cooldown=0;aim(s,4.5,5.5);awayCombat(s,"fire");assert.equal(s.away.enemies[0].hp,44);assert.equal(s.away.enemies[1].hp,66);
  for(let i=0;i<2;i++){s.away.cooldown=0;awayCombat(s,"fire");}assert.equal(s.away.enemies[0].hp,0);assert.equal(s.ethics.force,0);
});
test("fire rate, depleted cells, cycling and high power enforce costs",()=>{
  const s=deployed();s.away.enemies=[];awayCombat(s,"fire");const c=s.away.charge;awayCombat(s,"fire");assert.equal(s.away.charge,c);
  s.away.cooldown=0;s.away.charge=1;awayCombat(s,"mode");awayCombat(s,"fire");assert.equal(s.away.charge,1);awayCombat(s,"reload");awayCombat(s,"fire");assert.equal(s.away.charge,1);tick(s,1.6);assert.equal(s.away.charge,8);
  awayCombat(s,"fire");assert.equal(s.away.charge,6);
});
test("damage, field medicine, incapacitation, and evacuation preserve campaign progress",()=>{
  const s=deployed();position(s,2.5,6.5);s.away.enemies=s.away.enemies.slice(0,1);s.away.enemies[0].cooldown=0;
  tick(s,.1);assert.ok(s.away.health<100);awayCombat(s,"medkit");assert.equal(s.away.health,100);assert.equal(s.away.medkits,0);
  assert.throws(()=>awayCombat(s,"medkit"),/No field/);tick(s,30);assert.equal(s.away.health,0);const before=JSON.stringify(s);assert.throws(()=>awayAction(s,"forward"),/incapacitated/);assert.equal(JSON.stringify(s),before);
  assert.ok(restoreSave(exportSave(s)));awayAction(s,"recall");assert.equal(s.away,null);
});
test("ceasefire ends encounters without changing faction relations or farming rewards",()=>{
  const s=deployed(),relations=structuredClone(s.relations),resources=structuredClone(s.resources);
  awayCombat(s,"hail");tick(s,20);assert.equal(s.away.health,100);assert.ok(s.away.enemies.every(e=>e.hp===0));assert.deepEqual(s.relations,relations);assert.deepEqual(s.resources,resources);assert.throws(()=>awayCombat(s,"hail"));
});
test("mid-combat saves retain exact positions, health, ammunition, reload and enemy state",()=>{
  const s=deployed(2285);tick(s,.25,{forward:1,strafe:-1});awayCombat(s,"fire");awayCombat(s,"reload");tick(s,.2);assert.deepEqual(restoreSave(exportSave(s)),s);
});
test("v0.3 saves migrate active missions peacefully without losing objectives",()=>{
  const s=deployed();s.version=3;delete s.startYear;s.away={sectorId:"rigel",fleetId:"expedition",x:2,y:6,direction:1,scanned:[0],resolved:[0],message:"Preserved progress"};s.awayHistory.rigel=[0];
  const restored=restoreSave(exportSave(s));assert.ok(restored);assert.equal(restored.version,4);assert.deepEqual(restored.away.resolved,[0]);assert.equal(restored.away.enemies.length,0);assert.equal(restored.away.health,100);
});
test("malformed combat imports reject nonfinite, impossible, and future equipment data",()=>{
  const base=deployed();for(const mutate of [s=>s.startYear=9999,s=>s.away.px=8.5,s=>s.away.angle=10,s=>s.away.health=-1,s=>s.away.charge=999,s=>s.away.reload=5,s=>s.away.medkits=3,s=>s.away.enemies[0].hp=999,s=>s.away.enemies[0].x=0,s=>s.away.weapon="nextgen",s=>s.tech.push("sidearm_nextgen")]){const s=structuredClone(base);mutate(s);assert.equal(restoreSave(exportSave(s)),null);}
});
