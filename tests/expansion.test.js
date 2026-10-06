import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createGame,
  meetPower, resolveMonthlyEvent, SAVE_VERSION,
  currentEvent,
  decision,
  advance,
  activeFleet,
  fleetShips,
  createFleet,
  selectFleet,
  customizeShip,
  customizeFleet,
  transferShip,
  assignFleet,
  travelTime,
  commission,
  startBattle,
  combatAction,
  setPower,
  chooseMission,
  proposeTreaty,
  answerProposal,
  answerRequest,
  requestFavor,
  diplomacy,
  restoreSave,
  exportSave,
  income,
  setTutorial,
  tutorialStep,
  repairFleet,
} from "../src/game.js";
const month = (s) => {
  if (s.monthlyEvent) resolveMonthlyEvent(s, 1);
  if (currentEvent(s) && !s.eventResolved) decision(s, 0);
  advance(s);
};
function rich() {
  const s = createGame();
  Object.keys(s.relations).forEach(id => meetPower(s, id, "Test visitor"));
  Object.keys(s.resources).forEach((k) => (s.resources[k] = 1000));
  return s;
}
function scout(s, sector) {
  assignFleet(s, s.activeFleetId, sector, "scout");
  while (activeFleet(s).assignment) month(s);
  return s.missions.find((m) => m.sectorId === sector);
}

test("identity edits preserve IDs and enforce unique registries and valid names atomically", () => {
  const s = createGame();
  customizeShip(s, "flagship", "UES Horizon", "nx-99");
  customizeFleet(s, "expedition", "First Contact Group", "tf-42");
  assert.equal(s.fleet[0].id, "flagship");
  assert.equal(s.fleet[0].registry, "NX-99");
  assert.equal(activeFleet(s).designation, "TF-42");
  const before = JSON.stringify(s);
  assert.throws(() => customizeShip(s, "escort", "Other", "NX-99"), /already/);
  assert.equal(JSON.stringify(s), before);
  assert.throws(() => customizeShip(s, "escort", "<script>", "NV-05"));
  assert.deepEqual(restoreSave(exportSave(s)), s);
});
test("commissioned registries avoid a player-chosen automatic registry", () => {
  const s = rich();
  customizeShip(s, "flagship", "Reserved registry", "NV-002");
  commission(s, "science");
  assert.equal(new Set(s.fleet.map((v) => v.registry)).size, 3);
  assert.ok(restoreSave(exportSave(s)));
});
test("separate fleets travel independently and cannot teleport ships between locations", () => {
  const s = rich(),
    second = createFleet(s, "Pathfinders", "TF-02");
  transferShip(s, "escort", second);
  assignFleet(s, "expedition", "tellar", "scout");
  assignFleet(s, second, "rim", "move");
  assert.equal(travelTime(s, "expedition", "tellar"), 1);
  assert.equal(travelTime(s, second, "rim"), 2);
  assert.throws(() => transferShip(s, "escort", "expedition"), /idle/);
  month(s);
  assert.equal(activeFleet(s).location, "tellar");
  assert.equal(s.taskForces[1].assignment.remaining, 1);
  month(s);
  assert.equal(s.taskForces[1].location, "rim");
  assert.equal(s.taskForces[1].assignment, null);
  assert.throws(() => transferShip(s, "escort", "expedition"), /same system/);
  assert.ok(restoreSave(exportSave(s)));
});
test("three fleets and five vessels per fleet are bounded and empty fleets cannot depart", () => {
  const s = rich();
  const a = createFleet(s, "Second", "TF-02");
  createFleet(s, "Third", "TF-03");
  assert.throws(() => createFleet(s, "Fourth", "TF-04"), /three/);
  assert.throws(() => assignFleet(s, a, "rim", "move"), /vessel/);
  for (let i = 0; i < 3; i++) commission(s);
  assert.throws(() => commission(s), /capacity/);
  transferShip(s, "escort", a);
  selectFleet(s, a);
  commission(s, "support");
  assert.equal(fleetShips(s).length, 2);
});
test("scouting unlocks a mission once and a science vessel improves survey returns", () => {
  const s = rich();
  commission(s, "science");
  decision(s, 0);
  const before = s.resources.research;
  const m = scout(s, "tellar");
  assert.equal(s.resources.research - before, 38); // 8 monthly + 18 survey + 12 science
  assert.equal(m.status, "available");
  assert.throws(
    () => assignFleet(s, s.activeFleetId, "tellar", "scout"),
    /already/,
  );
  assert.equal(s.missions.length, 1);
});
test("a support tender adds escort income and earned favors can be spent once", () => {
  const s = rich();
  commission(s, "support");
  const before = s.resources.energy;
  assignFleet(s, s.activeFleetId, "tellar", "escort");
  month(s);
  assert.equal(s.resources.energy - before, -15 + 22 + 45);
  assert.equal(s.relations.tellarite.favors, 1);
  const alloys = s.resources.alloys;
  requestFavor(s, "tellarite");
  assert.equal(s.resources.alloys, alloys + 20);
  assert.throws(() => requestFavor(s, "tellarite"), /favor/);
});
test("patrol preparation helps only the assigned live fleet and does not become a permanent upgrade", () => {
  const s = rich();
  assignFleet(s, s.activeFleetId, "eridani", "patrol");
  month(s);
  const max = s.fleet[0].maxShields;
  startBattle(s);
  assert.equal(s.battle.friends[0].maxShields, max + 15);
  combatAction(s, "retreat");
  assert.equal(s.fleet[0].maxShields, max);
  assert.equal(s.sectors.find((x) => x.id === "eridani").prepared, false);
});
test("live battles include only the active fleet and preserve unengaged ships", () => {
  const s = rich(),
    other = createFleet(s, "Home Guard", "TF-02");
  transferShip(s, "escort", other);
  const untouched = structuredClone(s.fleet[1]);
  assignFleet(s, "expedition", "eridani", "move");
  month(s);
  startBattle(s);
  assert.equal(s.battle.friends.length, 1);
  s.battle.friends[0].hull = 45;
  combatAction(s, "retreat");
  assert.deepEqual(s.fleet[1], untouched);
  assert.equal(s.fleet[0].hull, 45);
  assert.ok(restoreSave(exportSave(s)));
});
test("mission decisions create delayed consequences rather than paying repeatedly", () => {
  const s = rich();
  const m = scout(s, "andoria");
  decision(s, 0);
  const before = s.relations.andorian.score;
  chooseMission(s, m.id, "rescue");
  assert.equal(m.status, "pending");
  assert.throws(() => chooseMission(s, m.id, "archive"), /already/);
  month(s);
  assert.equal(m.status, "pending");
  month(s);
  assert.equal(m.status, "resolved");
  assert.equal(s.relations.andorian.score, before + 18);
  const favors = s.relations.andorian.favors;
  month(s);
  assert.equal(s.relations.andorian.favors, favors);
  assert.match(m.outcome, /rescued/);
  assert.ok(restoreSave(exportSave(s)));
});
test("earlier cooperation changes a later first-contact mission outcome", () => {
  const outcomes = [];
  for (const choice of [0, 1]) {
    const s = rich();
    decision(s, choice);
    const m = scout(s, "rim");
    chooseMission(s, m.id, "contact");
    month(s);
    month(s);
    outcomes.push(m.outcome);
  }
  assert.match(outcomes[0], /Vulcan partners.*45 research/);
  assert.match(outcomes[1], /independently.*25 research/);
});
test("unaffordable mission choices leave mission, queue, and resources intact", () => {
  const s = createGame(),
    m = scout(s, "tellar");
  s.resources.influence = 0;
  const before = JSON.stringify(s);
  assert.throws(() => chooseMission(s, m.id, "mediate"), /influence/);
  assert.equal(JSON.stringify(s), before);
});
test("counteroffers require explicit acceptance and enforce their full cost", () => {
  const s = createGame();
  meetPower(s, "romulan", "Test visitor");
  proposeTreaty(s, "romulan", "borders");
  assert.equal(s.relations.romulan.borders, false);
  assert.equal(s.resources.influence, 60);
  s.resources.energy = 0;
  const before = JSON.stringify(s);
  assert.throws(() => answerProposal(s, "romulan", true), /energy/);
  assert.equal(JSON.stringify(s), before);
  s.resources.energy = 100;
  answerProposal(s, "romulan", true);
  assert.equal(s.resources.energy, 75);
  assert.equal(s.resources.influence, 40);
  assert.equal(s.relations.romulan.borders, true);
  assert.equal(income(s).research, 10);
  assert.throws(() => answerProposal(s, "romulan", true), /No outstanding/);
});
test("treaty betrayal affects other neighbors and low trust can end an alliance", () => {
  const s = rich();
  proposeTreaty(s, "vulcan", "borders");
  diplomacy(s, "vulcan", "alliance");
  const score = s.relations.andorian.score;
  diplomacy(s, "vulcan", "war");
  assert.equal(s.relations.vulcan.borders, false);
  assert.equal(s.relations.andorian.score, score - 12);
  assert.ok(s.relations.vulcan.grievances.length);
  s.relations.andorian.status = "allied";
  s.relations.andorian.trust = -30;
  month(s);
  assert.equal(s.relations.andorian.status, "neutral");
});
test("neighbors request aid, honor favors, and withdraw unanswered counteroffers", () => {
  const s = rich();
  proposeTreaty(s, "romulan", "research");
  month(s);
  month(s);
  assert.ok(s.relations.vulcan.request);
  answerRequest(s, "vulcan", true);
  assert.equal(s.relations.vulcan.favors, 1);
  assert.equal(s.relations.vulcan.trust, 10);
  month(s);
  assert.equal(s.relations.romulan.proposal, null);
  assert.ok(restoreSave(exportSave(s)));
});
test("envoys are limited per power per month", () => {
  const s = rich();
  diplomacy(s, "romulan", "envoy");
  assert.throws(() => diplomacy(s, "romulan", "envoy"), /already visited/);
  month(s);
  diplomacy(s, "romulan", "envoy");
  assert.ok(s.relations.romulan.score >= 25);
});
test("science scans expose weapons through shields and disabled weapons reduce return fire", () => {
  const s = rich();
  commission(s, "science");
  startBattle(s, "eridani", null, true);
  s.battle.selected = s.fleet.at(-1).id;
  combatAction(s, "scan");
  assert.equal(s.battle.enemies[0].scanned, true);
  s.battle.subsystem = "weapons";
  combatAction(s, "fire");
  assert.equal(s.battle.enemies[0].systems.weapons, 65);
  assert.ok(restoreSave(exportSave(s)));
});
test("subsystem targets respect shields and engine disabling leaves the hull intact", () => {
  const s = rich();
  startBattle(s, "eridani", null, true);
  s.battle.friends = s.battle.friends.slice(0, 1);
  s.battle.subsystem = "weapons";
  combatAction(s, "fire");
  assert.equal(s.battle.enemies[0].systems.weapons, 100);
  const e = s.battle.enemies[0];
  e.scanned = true;
  e.systems.engines = 35;
  e.hull = 85;
  e.shields = 45;
  s.battle.subsystem = "engines";
  combatAction(s, "fire");
  assert.equal(e.systems.engines, 0);
  assert.ok(e.hull > 0);
  assert.equal(s.battle.target, "enemy-2");
});
test("power allocation changes outgoing and incoming combat damage", () => {
  const a = rich(),
    b = rich();
  for (const s of [a, b]) {
    startBattle(s, "eridani", null, true);
    s.battle.friends = s.battle.friends.slice(0, 1);
  }
  setPower(a, "flagship", "weapons");
  setPower(b, "flagship", "engines");
  combatAction(a, "fire");
  combatAction(b, "fire");
  assert.ok(a.battle.enemies[0].shields < b.battle.enemies[0].shields);
  assert.ok(a.battle.friends[0].shields < b.battle.friends[0].shields);
});
test("support vessels repair allies during combat and larger hulls repair fully", () => {
  const s = rich();
  commission(s, "support");
  startBattle(s, "eridani", null, true);
  s.battle.friends[0].hull = 50;
  combatAction(s, "shields");
  assert.equal(s.battle.friends[0].hull, 58);
  combatAction(s, "retreat");
  s.battle = null;
  s.fleet.at(-1).hull = 20;
  repairFleet(s);
  assert.equal(s.fleet.at(-1).hull, 110);
});
test("v0.1 imports retain progress and identifiers and gain defaults for new features", () => {
  const legacy = JSON.parse(
    readFileSync(new URL("./fixtures/v1-save.json", import.meta.url), "utf8"),
  );
  legacy.resources.energy = 42;
  const migrated = restoreSave(JSON.stringify(legacy));
  assert.ok(migrated);
  assert.equal(migrated.version, SAVE_VERSION);
  assert.equal(migrated.resources.energy, 42);
  assert.equal(migrated.fleet[0].id, "flagship");
  assert.equal(migrated.fleet[0].registry, "NX-01");
  assert.equal(migrated.taskForces.length, 1);
  assert.equal(migrated.relations.vulcan.trust, 0);
  assert.deepEqual(restoreSave(exportSave(migrated)), migrated);
});
test("import rejects malformed fleet references, identities, consequences, and oversized files", () => {
  const base = createGame();
  const bad = [];
  let s = structuredClone(base);
  s.fleet[0].fleetId = "missing";
  bad.push(s);
  s = structuredClone(base);
  s.fleet[0].id = '" onclick="alert(1)';
  bad.push(s);
  s = structuredClone(base);
  s.fleet[1].registry = s.fleet[0].registry;
  bad.push(s);
  s = structuredClone(base);
  s.consequences = [{ missionId: "missing", due: 2 }];
  bad.push(s);
  s = structuredClone(base);
  s.taskForces[0].assignment = {
    kind: "scout",
    destination: "missing",
    remaining: -1,
  };
  bad.push(s);
  for (const invalid of bad)
    assert.equal(restoreSave(JSON.stringify(invalid)), null);
  assert.equal(restoreSave(" ".repeat(2_000_001)), null);
});
test("import normalizes presentation content so a save cannot inject map markup", () => {
  const s = createGame();
  s.sectors[0].detail = "<img src=x onerror=alert(1)>";
  const restored = restoreSave(exportSave(s));
  assert.ok(restored);
  assert.ok(!restored.sectors[0].detail.includes("<img"));
});
test("tutorial advances on real actions, can be skipped, and can be replayed without resetting the game", () => {
  const s = createGame();
  setTutorial(s, "start");
  assert.equal(tutorialStep(s).id, "decision");
  decision(s, 0);
  assert.equal(tutorialStep(s).id, "month");
  advance(s);
  assert.equal(tutorialStep(s).id, "survey");
  setTutorial(s, "skip");
  assert.equal(s.tutorial.active, false);
  const turn = s.turn;
  setTutorial(s, "replay");
  assert.equal(s.turn, turn);
  assert.equal(s.tutorial.active, true);
  assert.ok(restoreSave(exportSave(s)));
});

test("save migration and export preserve the full unsigned 32-bit random state", () => {
  const s = createGame();
  for (const seed of [0, 1_000_000_001, 2_147_483_648, 4_294_967_295]) {
    s.seed = seed;
    assert.equal(restoreSave(exportSave(s)).seed, seed);
  }
  startBattle(s, "eridani", null, true);
  while (!s.battle.result) {
    combatAction(s, "fire");
    assert.ok(restoreSave(exportSave(s)));
  }
});
