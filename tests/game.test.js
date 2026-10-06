import test from "node:test";
import assert from "node:assert/strict";
import {
  activeFleet,
  createGame,
  currentEvent,
  decision,
  advance,
  income,
  diplomacy,
  survey,
  develop,
  commission,
  repairFleet,
  startBattle,
  combatAction,
  restoreSave,
} from "../src/game.js";

test("each faction starts with a viable fleet, its own home, and no predetermined wars", () => {
  for (const faction of ["earth", "klingon", "romulan"]) {
    const s = createGame(faction);
    assert.equal(s.faction, faction);
    assert.equal(s.fleet.length, 2);
    assert.ok(!s.relations[faction]);
    assert.ok(Object.values(s.relations).every((r) => r.status === "neutral"));
    assert.ok(restoreSave(JSON.stringify(s)));
  }
});
test("council choices are consequential and cannot be farmed", () => {
  const cooperative = createGame(),
    independent = createGame();
  decision(cooperative, 0);
  decision(independent, 2);
  assert.equal(cooperative.relations.vulcan.score, 50);
  assert.equal(independent.relations.vulcan.score, 25);
  assert.equal(cooperative.resources.research, 50);
  const snapshot = JSON.stringify(cooperative);
  assert.throws(() => decision(cooperative, 0), /already/);
  assert.equal(JSON.stringify(cooperative), snapshot);
});
test("month progression requires a resolved decision and pays actual production", () => {
  const s = createGame();
  assert.throws(() => advance(s), /council/);
  decision(s, 0);
  const before = structuredClone(s.resources),
    rates = income(s);
  advance(s);
  for (const key of Object.keys(before))
    assert.equal(s.resources[key], before[key] + rates[key]);
  assert.equal(s.turn, 2);
  assert.match(currentEvent(s).title, /truth/);
  assert.equal(s.eventResolved, false);
});
test("Klingons and Romulans can become founding allies of a Federation", () => {
  const s = createGame();
  s.resources.influence = 1000;
  for (let i = 0; i < 6; i++) {
    if (i < 3)
      for (const id of ["klingon", "romulan"]) diplomacy(s, id, "envoy");
    if (i === 2)
      for (const id of ["klingon", "romulan"]) diplomacy(s, id, "alliance");
    decision(s, 0);
    if (i < 5) advance(s);
  }
  assert.equal(s.completed, true);
  assert.equal(s.charter, "Federation of Allied Worlds");
  assert.deepEqual(s.founders, ["Klingon Houses", "Romulan Star Empire"]);
  advance(s);
  advance(s);
  assert.equal(s.turn, 8);
});
test("alternate founding charters remain possible without mandatory allies", () => {
  for (const [choice, title] of [
    [1, "League of Sovereign Worlds"],
    [2, "United Frontier Authority"],
  ]) {
    const s = createGame();
    for (let i = 0; i < 6; i++) {
      decision(s, choice);
      if (i < 5) advance(s);
    }
    assert.equal(s.charter, title);
    assert.deepEqual(s.founders, []);
  }
});
test("trade adds income, war cancels trade and alliances, and peace is possible", () => {
  const s = createGame();
  diplomacy(s, "vulcan", "alliance");
  diplomacy(s, "vulcan", "trade");
  assert.equal(income(s).energy, 27);
  assert.equal(income(s).influence, 9);
  diplomacy(s, "vulcan", "war");
  assert.equal(s.relations.vulcan.trade, false);
  assert.equal(income(s).energy, 22);
  assert.throws(() => diplomacy(s, "vulcan", "envoy"), /ceasefire/);
  diplomacy(s, "vulcan", "peace");
  assert.equal(s.relations.vulcan.status, "neutral");
});
test("unaffordable purchases and invalid diplomatic actions leave state unchanged", () => {
  const s = createGame();
  s.resources.energy = 0;
  const before = JSON.stringify(s);
  assert.throws(() => commission(s), /energy/);
  assert.equal(JSON.stringify(s), before);
  assert.throws(() => diplomacy(s, "klingon", "alliance"), /requires/);
  assert.equal(JSON.stringify(s), before);
});
test("surveys cost energy once and grant research and material rewards", () => {
  const s = createGame("romulan");
  activeFleet(s).location = "andoria";
  s.location = "andoria";
  survey(s, "andoria");
  assert.equal(s.resources.energy, 100);
  assert.equal(s.resources.research, 61);
  assert.equal(s.resources.alloys, 100);
  assert.equal(s.location, "andoria");
  assert.throws(() => survey(s, "andoria"), /already/);
});
test("research upgrades apply to existing and newly commissioned vessels", () => {
  const s = createGame();
  s.resources.research = 200;
  develop(s, "shields");
  develop(s, "weapons");
  commission(s);
  assert.ok(
    s.fleet.every(
      (v, i) => v.maxShields === 90 && v.damage === (i < 2 ? 32 : 38),
    ),
  );
  assert.throws(() => develop(s, "shields"), /already/);
});
test("industry and logistics add recurring production", () => {
  const s = createGame();
  s.resources.research = 100;
  develop(s, "reactor");
  develop(s, "foundry");
  develop(s, "logistics");
  assert.equal(income(s).energy, 42);
  assert.equal(income(s).alloys, 24);
});
test("fleet capacity and repair costs are enforced", () => {
  const s = createGame();
  s.resources.energy = 1000;
  s.resources.alloys = 1000;
  for (let i = 0; i < 3; i++) commission(s);
  assert.throws(() => commission(s), /capacity/);
  assert.throws(() => repairFleet(s), /operational/);
  s.fleet[0].hull = 12;
  repairFleet(s);
  assert.equal(s.fleet[0].hull, 100);
  assert.equal(s.resources.alloys, 755);
});
test("tactical training allows vessel control and preserves campaign fleet and economy", () => {
  const s = createGame(),
    before = structuredClone(s.fleet),
    resources = structuredClone(s.resources);
  startBattle(s, "eridani", null, true);
  s.battle.selected = "escort";
  s.battle.order = "focus";
  combatAction(s, "fire");
  assert.equal(s.battle.round, 2);
  assert.ok(s.battle.messages.some((m) => m.includes("Intrepid fires")));
  for (let i = 0; i < 20 && !s.battle.result; i++) combatAction(s, "fire");
  assert.equal(s.battle.result, "victory");
  assert.deepEqual(s.fleet, before);
  assert.deepEqual(s.resources, resources);
  assert.equal(s.sectors.find((v) => v.id === "eridani").threat, true);
});
test("live victory pays rewards exactly once, keeps damage, and clears a distress encounter", () => {
  const s = createGame();
  activeFleet(s).location = "eridani";
  s.location = "eridani";
  startBattle(s);
  s.battle.order = "focus";
  for (let i = 0; i < 20 && !s.battle.result; i++) combatAction(s, "fire");
  assert.equal(s.battle.result, "victory");
  assert.equal(s.resources.alloys, 115);
  assert.equal(s.resources.influence, 75);
  assert.equal(s.sectors.find((v) => v.id === "eridani").threat, false);
  assert.ok(
    s.fleet.some((v) => v.shields < v.maxShields || v.hull < v.maxHull),
  );
  assert.throws(() => combatAction(s, "fire"), /No active/);
  s.battle = null;
  assert.throws(() => startBattle(s), /secure/);
});
test("combat can end with a hail instead of destroying the opponent", () => {
  const s = createGame();
  activeFleet(s).location = "eridani";
  s.location = "eridani";
  startBattle(s);
  for (let i = 0; i < 3; i++) combatAction(s, "hail");
  assert.equal(s.battle.result, null);
  assert.equal(s.battle.round, 4);
  combatAction(s, "hail");
  assert.equal(s.battle.result, "peace");
  assert.equal(s.resources.alloys, 100);
});
test("live combat against a diplomatic power requires war and a hail creates a ceasefire", () => {
  const s = createGame();
  assert.throws(() => startBattle(s, "rim", "vulcan"), /not at war/);
  diplomacy(s, "vulcan", "war");
  activeFleet(s).location = "rim";
  s.location = "rim";
  startBattle(s, "rim", "vulcan");
  s.battle.round = 4;
  combatAction(s, "hail");
  assert.equal(s.relations.vulcan.status, "neutral");
});
test("defeat recovers vessels and retreat commits current damage without rewards", () => {
  const s = createGame();
  activeFleet(s).location = "eridani";
  s.location = "eridani";
  startBattle(s);
  s.battle.friends.forEach((v) => {
    v.hull = 1;
    v.shields = 0;
  });
  combatAction(s, "hail");
  if (!s.battle.result) combatAction(s, "hail");
  assert.equal(s.battle.result, "defeat");
  assert.ok(s.fleet.every((v) => v.hull === 12));
  assert.equal(s.resources.alloys, 90);
  const r = createGame();
  activeFleet(r).location = "eridani";
  r.location = "eridani";
  startBattle(r);
  r.battle.friends[0].hull = 45;
  combatAction(r, "retreat");
  assert.equal(r.battle.result, "retreat");
  assert.equal(r.fleet[0].hull, 45);
  assert.equal(r.resources.alloys, 90);
});
test("campaign operations are blocked while a battle is active", () => {
  const s = createGame();
  activeFleet(s).location = "eridani";
  s.location = "eridani";
  startBattle(s);
  for (const operation of [
    () => decision(s, 0),
    () => advance(s),
    () => survey(s, "rim"),
    () => develop(s, "reactor"),
    () => commission(s),
    () => repairFleet(s),
    () => diplomacy(s, "vulcan", "envoy"),
  ])
    assert.throws(operation);
});
test("saves round-trip mid-battle; malformed and unsupported saves are rejected", () => {
  const s = createGame();
  decision(s, 0);
  advance(s);
  activeFleet(s).location = "eridani";
  s.location = "eridani";
  startBattle(s);
  combatAction(s, "fire");
  assert.deepEqual(restoreSave(JSON.stringify(s)), s);
  for (const raw of [
    "null",
    "{}",
    "not-json",
    JSON.stringify({ ...s, version: 9 }),
    JSON.stringify({ ...s, resources: { energy: -1 } }),
    JSON.stringify({ ...s, fleet: [] }),
    JSON.stringify({ ...s, battle: {} }),
  ])
    assert.equal(restoreSave(raw), null);
});
