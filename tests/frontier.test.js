import test from "node:test";
import assert from "node:assert/strict";
import { createGame, activeFleet, assignFleet, advance, advanceMonths, currentEvent, decision,
  meetPower, sectorLabel, diplomacy, proposeTreaty, survey, develop, commission, income,
  techAvailable, designStats, completeProject, startAway, awayAction, AWAY_LAYOUT,
  AWAY_OBJECT_POSITIONS, MONTHLY_EVENTS, resolveMonthlyEvent, restoreSave, exportSave,
  startBattle, transferShip, createFleet } from "../src/game.js";
const rich = () => { const s=createGame(); for(const k in s.resources) s.resources[k]=10000; return s; };
function month(s) {
  if (s.monthlyEvent) resolveMonthlyEvent(s,1);
  if (currentEvent(s) && !s.eventResolved) decision(s,0);
  advance(s);
}
function visit(s,id) {
  assignFleet(s,s.activeFleetId,id,"scout");
  while(activeFleet(s).assignment) month(s);
}
function walkTo(s,target) {
  const a=s.away, queue=[[a.x,a.y,[]]], seen=new Set(); let route;
  while(queue.length) {
    const [x,y,path]=queue.shift(), key=`${x},${y}`;
    if(seen.has(key)) continue; seen.add(key);
    if(x===target.x && y===target.y) {route=path;break;}
    for(const [d,[dx,dy]] of [[0,-1],[1,0],[0,1],[-1,0]].entries())
      if(AWAY_LAYOUT[y+dy]?.[x+dx]===".") queue.push([x+dx,y+dy,[...path,d]]);
  }
  assert.ok(route);
  for(const d of route) { while(a.direction!==d) awayAction(s,"right"); awayAction(s,"forward"); }
}
test("fresh campaigns hide unknown civilizations and forbid premature diplomacy",()=>{
  const s=createGame(); assert.equal(s.sectors.length,18); assert.deepEqual(s.contacts,["vulcan"]);
  const q=s.sectors.find(x=>x.id==="qonos"); assert.match(sectorLabel(s,q),/Unknown/);
  const before=JSON.stringify(s); assert.throws(()=>diplomacy(s,"klingon","envoy"),/First contact/);
  assert.throws(()=>proposeTreaty(s,"romulan","borders"),/First contact/); assert.equal(JSON.stringify(s),before);
  visit(s,"qonos"); assert.ok(s.contacts.includes("klingon")); assert.equal(sectorLabel(s,q),"Qo’noS");
  assert.equal(s.relations.klingon.status,"neutral");
});
test("physical home-system visitors open channels once without dictating alliances",()=>{
  const s=createGame(); decision(s,0); advance(s);
  assert.ok(s.contacts.includes("andorian")); const n=s.log.length;
  assert.equal(meetPower(s,"andorian","Visitor"),false); assert.equal(s.log.length,n);
  assert.equal(s.relations.andorian.status,"neutral");
});
test("exploration research unlocks at its site, applies bonuses, and cannot be purchased early",()=>{
  const s=rich(); const before=JSON.stringify(s);
  assert.equal(techAvailable(s,"sensors"),false); assert.throws(()=>develop(s,"sensors"),/Explore/);
  assert.equal(JSON.stringify(s),before); visit(s,"nebula"); develop(s,"sensors");
  if(s.monthlyEvent) resolveMonthlyEvent(s,1);
  const r=s.resources.research; activeFleet(s).location="pulsar"; s.location="pulsar"; survey(s,"pulsar");
  assert.equal(s.resources.research-r,33);
  for(const [sector,tech] of [["cygnus","warp"],["rigel","mining"],["eden","ecology"]]) {visit(s,sector); develop(s,tech);}
  assert.equal(income(s).alloys,22); assert.equal(income(s).energy,34); assert.equal(income(s).research,12);
  assert.ok(restoreSave(exportSave(s)));
});
test("field projects require presence, have a cost, and pay once",()=>{
  const s=rich(); assert.throws(()=>completeProject(s,"pulsar")); visit(s,"pulsar");
  const r=s.resources.research,e=s.resources.energy; completeProject(s,"pulsar");
  assert.equal(s.resources.research,r+40); assert.equal(s.resources.energy,e-15);
  const before=JSON.stringify(s); assert.throws(()=>completeProject(s,"pulsar"),/already/); assert.equal(JSON.stringify(s),before);
});
test("all six away sites support walking, scanning, meaningful choices, saving, and one-time rewards",()=>{
  const s=rich();
  for(const id of ["nebula","cygnus","rigel","eden","relic","haven"]) {
    visit(s,id); startAway(s,id);
    assert.throws(()=>advance(s),/Recall/); assert.throws(()=>assignFleet(s,s.activeFleetId,"sol","move"),/Recall/);
    assert.throws(()=>startBattle(s,"eridani",null,true),/Recall/);
    assert.throws(()=>awayAction(s,"study",2),/Move next/);
    for(let i=0;i<3;i++) {
      walkTo(s,AWAY_OBJECT_POSITIONS[i]); assert.throws(()=>awayAction(s,"study",i),/Scan/);
      awayAction(s,"scan",i); assert.deepEqual(restoreSave(exportSave(s)),s);
      const before={...s.resources}; awayAction(s,i===1?"salvage":"study",i);
      assert.equal(s.resources[i===1?"alloys":"research"]-before[i===1?"alloys":"research"],i===1?15:18);
      assert.throws(()=>awayAction(s,"study",i),/already/);
    }
    awayAction(s,"recall"); assert.equal(s.away,null); assert.equal(s.awayHistory[id].length,3);
    assert.throws(()=>startAway(s,id),/complete/); assert.ok(restoreSave(exportSave(s)));
  }
  assert.ok(techAvailable(s,"armor")); assert.ok(techAvailable(s,"medicine"));
  develop(s,"armor"); develop(s,"medicine"); const stats=designStats(s,"science"); commission(s,"science");
  assert.equal(s.fleet.at(-1).maxHull,stats.hull); assert.equal(s.fleet.at(-1).maxShields,stats.shields);
});
test("recall preserves completed objectives, boundaries block walking, redeployment cannot farm rewards",()=>{
  const s=rich(); visit(s,"haven"); startAway(s,"haven");
  const before=JSON.stringify(s); assert.throws(()=>awayAction(s,"back"),/bulkhead/); assert.equal(JSON.stringify(s),before);
  walkTo(s,AWAY_OBJECT_POSITIONS[0]); awayAction(s,"scan",0); awayAction(s,"study",0); awayAction(s,"recall");
  startAway(s,"haven"); assert.deepEqual(s.away.resolved,[0]);
  walkTo(s,AWAY_OBJECT_POSITIONS[0]); assert.throws(()=>awayAction(s,"study",0),/already/);
});
test("monthly events are deterministic across save/reload, occur on monthly ticks, and have free exits",()=>{
  const a=rich(); a.eventIndex=6; const b=restoreSave(exportSave(a)); let events=0;
  for(let i=0;i<60;i++) {
    advance(a); advance(b); assert.deepEqual(a.monthlyEvent,b.monthlyEvent);
    if(a.monthlyEvent) {events++; resolveMonthlyEvent(a,1); resolveMonthlyEvent(b,1);}
    assert.deepEqual(restoreSave(exportSave(a)),a);
  }
  assert.ok(events>5 && events<50); assert.deepEqual(a,b);
  for(const id of Object.keys(MONTHLY_EVENTS)) {
    a.monthlyEvent={id,turn:a.turn}; Object.keys(a.resources).forEach(k=>a.resources[k]=0);
    assert.throws(()=>advance(a),/monthly event/); resolveMonthlyEvent(a,1); assert.equal(a.monthlyEvent,null);
  }
});
test("monthly paid decisions validate costs atomically and do not pay twice",()=>{
  const s=createGame(); s.monthlyEvent={id:"flare",turn:1}; s.resources.alloys=0;
  const before=JSON.stringify(s); assert.throws(()=>resolveMonthlyEvent(s,0),/alloys/); assert.equal(JSON.stringify(s),before);
  resolveMonthlyEvent(s,1); assert.throws(()=>resolveMonthlyEvent(s,1),/No monthly/);
});
test("multi-month advancement stops for decisions, arrivals, and active away teams",()=>{
  const s=rich(); assert.match(advanceMonths(s,12),/^0 of 12/); decision(s,0);
  assert.match(advanceMonths(s,12),/^1 of 12/); assert.equal(s.turn,2);
  while(s.eventIndex<6) month(s); if(s.monthlyEvent) resolveMonthlyEvent(s,1);
  assignFleet(s,s.activeFleetId,"haven","scout"); const t=s.turn;
  assert.match(advanceMonths(s,12),/^1 of 12/); assert.equal(s.turn,t+1); assert.equal(activeFleet(s).location,"haven");
  startAway(s,"haven"); assert.match(advanceMonths(s,6),/^0 of 6/); assert.throws(()=>advanceMonths(s,100));
});
test("old saves expand the chart without losing known contacts, ship identities, or prior progress",()=>{
  const s=createGame(); s.version=2; s.sectors=s.sectors.slice(0,6); s.resources.energy=73;
  s.fleet[0].name="UES Legacy"; s.relations.romulan.status="war";
  for(const key of ["contacts","discoveries","projects","away","awayHistory","monthlyEvent","eventHistory","eventSeed"]) delete s[key];
  const restored=restoreSave(JSON.stringify(s)); assert.ok(restored); assert.equal(restored.version,3);
  assert.equal(restored.fleet[0].name,"UES Legacy"); assert.equal(restored.relations.romulan.status,"war");
  assert.equal(restored.contacts.length,5); assert.equal(restored.sectors.length,18); assert.equal(restored.resources.energy,73);
});
test("frontier saves reject invalid events, coordinates, unknown IDs and malformed objective progress",()=>{
  const base=rich(); visit(base,"relic"); startAway(base,"relic");
  for(const corrupt of [s=>s.away.x=0,s=>s.away.direction=4,s=>s.contacts.push("missing"),s=>s.projects.push("sol"),
    s=>s.away.scanned=[3],s=>s.away.resolved=[0],s=>s.awayHistory.relic=[0,0],s=>s.monthlyEvent={id:"missing",turn:1},
    s=>s.eventSeed=-1,s=>s.discoveries.push("missing"),s=>s.away.message={}]) {
    const s=structuredClone(base);corrupt(s);assert.equal(restoreSave(exportSave(s)),null);
  }
});
test("multi-month advancement can complete all twelve months and pays each month once",()=>{
  const s=rich(); s.eventIndex=6; s.contacts=Object.keys(s.relations);
  for(const r of Object.values(s.relations)) {r.score=0;r.trust=0;}
  // Find a deterministic interval with no event draws, rather than stubbing the rules.
  for(let seed=1;seed<100000;seed++) {
    let x=seed, quiet=true;
    for(let i=0;i<12;i++) {x=(x*1664525+1013904223)>>>0; if(x/4294967296<.35) {quiet=false;break;}}
    if(quiet) {s.eventSeed=seed;break;}
  }
  const before={...s.resources}, rates=income(s), turn=s.turn;
  assert.match(advanceMonths(s,12),/^12 of 12/); assert.equal(s.turn,turn+12);
  for(const key in rates) assert.equal(s.resources[key],before[key]+rates[key]*12);
});
test("away deployment locks its ships against transfer until recall",()=>{
  const s=rich(); visit(s,"haven"); const other=createFleet(s,"Relief","TF-02"); startAway(s,"haven");
  const before=JSON.stringify(s); assert.throws(()=>transferShip(s,"flagship",other),/Recall/); assert.equal(JSON.stringify(s),before);
  awayAction(s,"recall"); transferShip(s,"flagship",other); assert.ok(restoreSave(exportSave(s)));
});
