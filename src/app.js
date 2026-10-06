import { paintAway } from "./fps.js";
import {
  GAME_VERSION, ERAS, currentEra, campaignYear, awayEquipment, deployedEquipment, awayTick, awayLook, awayCombat,
  MONTHLY_EVENTS, AWAY_SITES, AWAY_LAYOUT, AWAY_OBJECT_POSITIONS,
  sectorLabel, techAvailable, designStats, completeProject,
  startAway, awayAction, awayNear, advanceMonths, resolveMonthlyEvent,
  ROLES,
  ASSIGNMENTS,
  MISSION_DEFS,
  TUTORIAL_STEPS,
  activeFleet,
  fleetShips,
  selectFleet,
  customizeShip,
  customizeFleet,
  createFleet,
  transferShip,
  assignFleet,
  travelTime,
  chooseMission,
  proposeTreaty,
  answerProposal,
  requestFavor,
  answerRequest,
  tutorialStep,
  setTutorial,
  setPower,
  exportSave,
  SAVE_KEY, SAVE_VERSION,
  FACTIONS,
  POWERS,
  TECH,
  createGame,
  income,
  currentEvent,
  decision,
  advance,
  survey,
  diplomacy,
  develop,
  commission,
  repairFleet,
  startBattle,
  combatAction,
  restoreSave,
} from "./game.js";

const app = document.querySelector("#app");
let saved = null;
try {
  saved = restoreSave(localStorage.getItem(SAVE_KEY));
} catch {
  /* Storage may be unavailable in private contexts. */
}
let state = saved || createGame("earth");
let view = state.battle ? "tactical" : state.away ? "away" : "overview";
let sectorId = "eridani";
let modal = null;
let toastTimer;
let saveAvailable = true;
let commissionRole = "cruiser";
let monthsToAdvance = 1;
let awayLive = false;
const awayKeys = new Set();
const touchKeys = new Set();
let awayUIStamp = "", frameTime = 0, saveTime = 0, drawTime = 0;
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const icons = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  galaxy:
    '<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/><path d="M4 4h.1M20 20h.1"/>',
  fleet: '<path d="m12 3 8 17-8-4-8 4 8-17Z"/><path d="M12 9v7"/>',
  diplomacy:
    '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M2 20v-3a6 6 0 0 1 12 0v3M15 14a5 5 0 0 1 7 5"/>',
  science: '<path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 15h10"/>',
  energy: '<path d="m13 2-8 12h6l-1 8 9-12h-6l1-8Z"/>',
  alloys: '<path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9"/>',
  influence: '<circle cx="12" cy="8" r="4"/><path d="m9 12-3 9 6-3 6 3-3-9"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/>',
  target:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
  book: '<path d="M4 3h13a3 3 0 0 1 3 3v15H6a3 3 0 0 1-3-3V6a3 3 0 0 1 1-3ZM3 17h17M7 7h9m-9 4h6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  save: '<path d="M4 3h13l4 4v14H3V3h1ZM7 3v6h10V3M7 21v-8h10v8"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
};
function icon(name, cls = "") {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.compass}</svg>`;
}
function delta(cls = "") {
  return `<svg class="delta ${cls}" viewBox="0 0 70 100" aria-hidden="true"><path d="M35 3 65 94 35 72 5 94 35 3Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="m35 20 4 26 14 6-15 5-3 21-4-21-14-5 14-6z" fill="currentColor"/></svg>`;
}
function button(text, action, cls = "", attrs = "") {
  return `<button class="button ${cls}" data-action="${action}" ${attrs}>${text}</button>`;
}
function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    saveAvailable = true;
  } catch {
    saveAvailable = false;
  }
}
function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4500);
}
function date() {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${months[(state.turn - 1) % 12]} ${campaignYear(state)}`;
}
function heading(kicker, title, text = "", extra = "") {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1>${text ? `<p>${text}</p>` : ""}</div>${extra}</div>`;
}
const navigation = [
  ["overview", "grid", "Command overview"],
  ["galaxy", "galaxy", "Star chart"],
  ["fleet", "fleet", "Fleet command"],
  ["diplomacy", "diplomacy", "Diplomacy"],
  ["research", "science", "Research & industry"],
  ["tactical", "target", "Tactical simulator"],
  ["missions", "compass", "Mission journal"],
  ["away", "compass", "Away team"],
  ["log", "book", "Captain’s log"],
  ["help", "book", "Academy & saves"],
];
function render() {
  pauseAway();
  document.documentElement.dataset.era = currentEra(state).id;
  const rates = income(state);
  app.innerHTML = `<div class="shell">
    <aside class="sidebar">
      <a href="#overview" class="brand" data-action="nav" data-view="overview" aria-label="Star Trek Divergence overview">${delta()}<span><span class="brand-small">STAR TREK</span><strong>DIVERGENCE</strong><span class="brand-caption">WRITE YOUR OWN FUTURE</span></span></a>
      <div class="nav-label">COMMAND INTERFACE <span>01</span></div>
      <nav aria-label="Main navigation">${navigation.map(([id, i, label]) => `<button data-action="nav" data-view="${id}" aria-label="${label}" title="${label}" class="nav-item ${view === id ? "active" : ""}" ${view === id ? 'aria-current="page"' : ""}>${icon(i)}<span>${label}</span>${id === "tactical" && state.battle ? '<i class="red-dot"></i>' : ""}${id === "overview" && !state.eventResolved && currentEvent(state) ? '<span class="nav-count">1</span>' : ""}</button>`).join("")}</nav>
      <div class="sidebar-bottom"><div class="quote">“Somewhere, something<br>incredible is waiting<br>to be known.”</div><div class="faction-id">${delta()}<div><strong>${FACTIONS[state.faction].name}</strong><span>${currentEra(state).name.toUpperCase()} · ${campaignYear(state)}</span></div><span class="online-dot"></span></div><button class="new-campaign" data-action="new">New campaign ${icon("arrow")}</button><div class="build-label">FAN PROJECT <span>ALPHA v0.4</span></div></div>
    </aside>
    <div class="workspace"><header class="topbar"><div class="breadcrumb">FLEET OPERATIONS <span>/</span> <strong>${navigation.find((n) => n[0] === view)?.[2].toUpperCase()}</strong></div><div class="topbar-right"><span class="save-state">${icon("check")} ${saveAvailable ? "AUTOSAVE ACTIVE" : "STORAGE UNAVAILABLE"}</span><button class="icon-button" data-action="save" aria-label="Save campaign">${icon("save")}</button><button class="icon-button" data-action="new" aria-label="Choose a new faction" title="New campaign">${icon("plus")}</button><button class="icon-button" data-action="nav" data-view="help" aria-label="Help and saves" title="Tutorial and save files">?</button><span class="commander-avatar">C</span></div></header>
    <div class="resourcebar">${Object.entries(state.resources)
      .map(
        ([key, value]) =>
          `<div class="resource ${key}">${icon(key === "research" ? "science" : key)}<div><span class="resource-label">${key}</span><strong>${value}<small>+${rates[key]}<span> / mo</span></small></strong></div></div>`,
      )
      .join(
        "",
      )}<div class="stardate"><span class="resource-label">MISSION DATE</span><strong>${date()} <small>MONTH ${String(state.turn).padStart(2, "0")}</small></strong></div></div>
    <main id="main">${tutorialBanner()}${priorityTransmission()}${{ overview, galaxy, fleet, diplomacy: diplomacyView, research, tactical, missions: missionsView, help: helpView, log: logView, away: awayView }[view]()}</main>
    <footer class="footer"><span><i class="online-dot"></i> ${state.battle ? "TACTICAL LINK ESTABLISHED" : "SUBSPACE LINK ESTABLISHED"}</span><span>THE FUTURE IS UNWRITTEN.</span><span>LOCAL CAMPAIGN · ${saveAvailable ? "AUTO-SAVED" : "UNSAVED"}</span></footer></div>
  </div>${modal ? renderModal() : ""}`;
  paintAway(document.querySelector("#away-canvas"), state, awayLive);
  if (modal) {
    const el = document.querySelector(".modal");
    el?.querySelector("input, button")?.focus();
  }
}
function shipArt(kind = "friendly", size = "") {
  return `<svg class="ship-art ${size} ${kind}" viewBox="0 0 200 180" aria-hidden="true"><g fill="currentColor" fill-opacity=".09" stroke="currentColor" stroke-width="1.3">${kind === "enemy" ? '<path d="m100 20 24 52 57 42-7 22-48-14-26 39-26-39-48 14-7-22 57-42z"/><path d="m100 43 12 39 43 34-40-12-15 30-15-30-40 12 43-34z"/><path d="M100 43v91M27 115l45-11m56 0 45 11"/>' : '<path d="M87 75h26l7 55-20 28-20-28z"/><path d="M63 58 49 133h13l25-42m50-33 14 75h-13l-25-42"/><rect x="42" y="80" width="15" height="78" rx="7"/><rect x="143" y="80" width="15" height="78" rx="7"/><ellipse cx="100" cy="55" rx="54" ry="38"/><ellipse cx="100" cy="55" rx="43" ry="29"/><ellipse cx="100" cy="55" rx="18" ry="13"/><path d="M100 18v22M47 55h35m36 0h35M100 68v25"/><path d="M46 93v45m107-45v45" stroke="#98daf2" stroke-width="3"/>'}</g></svg>`;
}
function starMap(expanded = false) {
  let stars = "";
  for (let i = 0; i < 85; i++) {
    const x = (i * 137.51 + 13) % 100;
    const y = (i * 73.73 + 7) % 100;
    stars += `<circle cx="${x}%" cy="${y}%" r="${i % 6 === 0 ? 1.2 : 0.65}" fill="#b1c7d5" opacity="${0.15 + (i % 5) * 0.12}"/>`;
  }
  return `<div class="star-map ${expanded ? "expanded" : ""}"><div class="map-grid"></div><div class="map-nebula"></div><svg class="starfield" width="100%" height="100%" aria-hidden="true">${stars}<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%"><path d="M43 64 28 38 63 26M43 64 19 74M43 64 65 63 82 40" fill="none" stroke="#89aab6" stroke-opacity=".2" stroke-width=".2" stroke-dasharray="1 1.3"/><ellipse cx="43" cy="64" rx="27" ry="33" fill="none" stroke="#8cb7c4" stroke-opacity=".15" stroke-width=".2"/></svg></svg><span class="map-coordinate">SECTOR 001 // LOCAL SPACE</span><span class="map-region">ALPHA QUADRANT</span>${state.sectors.map((s) => `<button class="system ${s.id === sectorId ? "selected" : ""} ${s.threat ? "hostile" : ""} ${s.id === state.location ? "home" : ""}" style="left:${s.x}%;top:${s.y}%" data-action="sector" data-id="${s.id}" aria-label="Select ${escape(sectorLabel(state, s))}${s.threat ? ", distress signal" : ""}" aria-pressed="${s.id === sectorId}"><span class="system-dot">${s.id === state.location ? "✦" : ""}</span><span class="system-name">${escape(sectorLabel(state, s))}</span>${s.threat ? '<span class="signal-label">DISTRESS SIGNAL</span>' : s.id === state.location ? '<span class="home-label">YOUR FLEET</span>' : ""}</button>`).join("")}<div class="map-legend"><span><i class="legend-dot blue"></i> CHARTED</span><span><i class="legend-dot orange"></i> ACTIVE SIGNAL</span><span>1 SECTOR ≈ 10 LY</span></div></div>`;
}
function overview() {
  const event = currentEvent(state);
  const allies = Object.values(state.relations).filter(
    (r) => r.status === "allied",
  ).length;
  return `${heading("YOUR VOYAGE BEGINS HERE", "A future of your own making.", "Explore the unknown. Choose your allies. Give your people a tomorrow.", `<div class="heading-tag">${icon("compass")} ${state.charter ? "A NEW CHAPTER" : "THE FIRST FRONTIER"}</div>`)}
  <section class="hero panel"><div class="hero-orbits"></div><div class="hero-content"><div class="eyebrow"><span class="live-dot"></span> ${campaignYear(state)} · ${currentEra(state).name.toUpperCase()}</div><h2>${state.charter ? escape(state.charter) : FACTIONS[state.faction].title}</h2><p>${state.charter ? `Your founding charter is signed. ${state.founders?.length || 0} allied powers stand with you. The next chapter remains yours to write.` : "Before the alliances. Before the legends. A single ship, an open sky, and the courage to choose a different path."}</p><button class="text-button" data-action="nav" data-view="galaxy">Chart your course ${icon("arrow")}</button></div><div class="hero-emblem">${delta()}<span>AD ASTRA PER ASPERA</span></div><div class="hero-index">ORIGINS <span>/ 01</span></div></section>
  <div class="overview-grid"><section class="panel sector-panel"><div class="panel-heading"><h2>${icon("galaxy")} The local frontier</h2><button class="text-button small" data-action="nav" data-view="galaxy">Open star chart ${icon("arrow")}</button></div>${starMap()}<div class="map-caption"><span>${icon("compass")} ${state.sectors.filter((s) => s.surveyed).length} of ${state.sectors.length} systems surveyed</span><span>${state.sectors.some((s) => s.threat) ? '<i class="orange-dot"></i> 1 active distress signal' : `${icon("check")} Local shipping lanes secure`}</span></div></section>
  <section class="panel council-panel"><div class="panel-heading"><h2>${icon("diplomacy")} The council awaits</h2><span class="tag ${state.eventResolved ? "" : "amber"}">${state.eventResolved ? "RESOLVED" : event ? "DECISION" : "CHARTER SIGNED"}</span></div><div class="council-content"><div class="eyebrow">${event?.kicker || "YOUR NEXT CHAPTER"}</div><h2>${event?.title || "History is still being written."}</h2><p>${event?.body || "Your founding convention is complete. Continue exploring, building your fleet, conducting research, and shaping your relationships with the galaxy."}</p>${state.eventResolved ? `<div class="decision-made">${icon("check")} ${escape(state.eventChoices.at(-1).choice)}<small>Your decision has become part of your history.</small></div>` : event ? `<div class="choices">${event.choices.map((c, i) => `<button class="choice" data-action="decision" data-index="${i}"><span class="choice-number">0${i + 1}</span><span><strong>${c.label}</strong><small>${c.effect}</small></span>${icon("chevron")}</button>`).join("")}</div>` : button("Read your captain’s log " + icon("arrow"), "nav", "secondary", 'data-view="log"')}</div></section></div>
  <div class="bottom-grid"><section class="panel fleet-summary"><div class="panel-heading"><h2>${icon("fleet")} ${escape(activeFleet(state).name)}</h2><button class="text-button small" data-action="nav" data-view="fleet">Manage fleet ${icon("arrow")}</button></div><div class="fleet-mini">${shipArt()}<div><div class="eyebrow">FLAGSHIP · ${escape(state.fleet[0].cls)}</div><h3>${escape(state.fleet[0].name)}</h3><small class="registry">${escape(state.fleet[0].registry)}</small><p>${state.fleet.length} vessels across ${state.taskForces.length} fleets <span>•</span> ${state.fleet.every((v) => v.hull === v.maxHull) ? "All systems operational" : "Repairs recommended"}</p></div><div class="mini-status"><span class="online-dot"></span> ${state.battle ? "ENGAGED" : "STANDING BY"}</div></div></section><section class="panel next-turn"><div><div class="eyebrow">EVERY CHOICE LEAVES A MARK</div><h3>${allies} ${allies === 1 ? "alliance" : "alliances"}. Countless possibilities.</h3><p>Advance time for production and fleet travel. Stops automatically when you are needed.</p></div>${timeControls()}</section></div>`;
}
function fleetSelector() {
  return `<div class="fleet-selector" aria-label="Select active fleet">${state.taskForces.map((f) => `<button class="fleet-tab ${f.id === state.activeFleetId ? "active" : ""}" data-action="selectFleet" data-id="${f.id}" aria-pressed="${f.id === state.activeFleetId}"><strong>${escape(f.name)}</strong><span>${escape(f.designation)} · ${fleetShips(state, f.id).length} ships · ${f.assignment ? `Arriving in ${f.assignment.remaining} mo` : escape(state.sectors.find((x) => x.id === f.location).name)}</span></button>`).join("")}</div>`;
}
function galaxy() {
  const s = state.sectors.find((x) => x.id === sectorId),
    f = activeFleet(state);
  const here = f.location === s.id && !f.assignment;
  return `${heading("ASTROMETRICS", "The galaxy is an invitation.", "Assign independent fleets to explore, escort convoys, patrol, or move between systems.")}${fleetSelector()}<div class="system-index" aria-label="All systems">${state.sectors.map(x => `<button class="button secondary" data-action="sector" data-id="${x.id}" aria-pressed="${x.id === sectorId}">${escape(sectorLabel(state,x))}${x.surveyed ? " · ✓" : ""}</button>`).join("")}</div>
 <div class="galaxy-layout"><section class="panel">${starMap(true)}</section><section class="panel system-detail"><div class="eyebrow">SYSTEM INTELLIGENCE</div><span class="tag ${s.threat ? "amber" : ""}">${s.type}</span><h2>${escape(sectorLabel(state, s))}</h2><p>${s.power && !state.contacts.includes(s.power) ? "An unidentified civilization may be here. Visit the system to establish first contact." : s.detail}</p><dl><div><dt>Survey</dt><dd>${s.surveyed ? "Complete" : "Uncharted"}</dd></div><div><dt>Active fleet</dt><dd>${escape(f.designation)}</dd></div><div><dt>Travel time</dt><dd>${travelTime(state, f.id, s.id)} month(s)</dd></div><div><dt>Defensive patrol</dt><dd>${s.prepared ? "Prepared: +15 shields" : "Not prepared"}</dd></div></dl>
 ${
   f.assignment
     ? `<div class="notice">${escape(f.name)} is on assignment to ${escape(sectorLabel(state, state.sectors.find((x) => x.id === f.assignment.destination)))}. ${f.assignment.remaining} month(s) remain. Advance time from Command overview.</div>`
     : `<label class="form-label" for="assignment-kind">Fleet assignment</label><select id="assignment-kind">${Object.entries(
         ASSIGNMENTS,
       )
         .map(
           ([id, a]) =>
             `<option value="${id}" ${id === "scout" && !s.surveyed ? "selected" : ""} ${id === "scout" && s.surveyed ? "disabled" : ""}>${a.name} · ${a.cost} energy</option>`,
         )
         .join(
           "",
         )}</select><p class="cost" id="assignment-description">${ASSIGNMENTS[s.surveyed ? "move" : "scout"].description}</p>${button("Dispatch fleet", "dispatch", "primary", `data-id="${s.id}"`)}${here && !s.surveyed ? button("Survey here · 20 energy", "survey", "secondary", `data-id="${s.id}"`) : ""}`
 }
 ${s.threat ? button("Respond to distress signal", "battle", "danger", `data-id="${s.id}" ${!here ? 'disabled title="Move or scout here first; wait for arrival"' : ""}`) : ""}<p class="cost">Live combat requires your active fleet to be present. ${s.surveyed ? "Survey data archived." : "Scouting earns 18 research + 10 alloys; science ships add 12 research."}</p></section></div>
 ${siteActions(s, here)}
 <section class="panel assignment-guide"><h2>What should this fleet do?</h2>${Object.values(
   ASSIGNMENTS,
 )
   .map((a) => `<p><strong>${a.name}:</strong> ${a.description}</p>`)
   .join("")}</section>`;
}
function meter(value, max, cls = "") {
  return `<div class="meter ${cls}"><span style="width:${Math.max(0, Math.min(100, (value / max) * 100))}%"></span></div>`;
}
function fleet() {
  const f = activeFleet(state),
    vessels = fleetShips(state),
    role = ROLES[commissionRole];
  return `${heading("STARSHIP OPERATIONS", "Your people. Your fleet.", "Name your vessels, choose their roles, and organize up to three independent fleets.", button("Create fleet", "newFleet", "secondary", state.taskForces.length >= 3 ? "disabled" : ""))}${fleetSelector()}
 <section class="panel fleet-management"><div><div class="eyebrow">${escape(f.designation)}</div><h2>${escape(f.name)}</h2><p>${vessels.length} / 5 vessels · ${f.assignment ? "On assignment" : "Standing by"} · ${escape(state.sectors.find((x) => x.id === f.location).name)}</p></div><div class="action-row">${button("Edit fleet identity", "editFleet", "secondary", `data-id="${f.id}"`)}${button("Repair this fleet · 20 alloys", "repairFleet", "secondary", f.assignment ? "disabled" : "")}</div></section>
 ${shipComparison()}<div class="ship-grid">${vessels.map((v) => `<section class="panel vessel-card"><div class="panel-heading"><span class="eyebrow">${escape(v.registry)}</span><span class="tag">${escape(v.cls)}</span></div><div class="vessel-illustration">${shipArt()}</div><h2>${escape(v.name)}</h2><p>${ROLES[v.role].description}</p><div class="ship-stat"><span>Hull integrity</span><strong>${v.hull} / ${v.maxHull}</strong></div>${meter(v.hull, v.maxHull)}<div class="ship-stat"><span>Shields</span><strong>${v.shields} / ${v.maxShields}</strong></div>${meter(v.shields, v.maxShields, "blue-meter")}<div class="vessel-footer">${icon("target")} Weapon output <strong>${v.damage + (state.faction === "klingon" ? 4 : 0)}</strong></div><div class="ship-customization">${button("Edit name & registry", "editShip", "secondary", `data-id="${v.id}"`)}<label class="form-label" for="transfer-${v.id}">Fleet assignment</label><select id="transfer-${v.id}" data-transfer="${v.id}">${state.taskForces.map((g) => `<option value="${g.id}" ${g.id === v.fleetId ? "selected" : ""}>${escape(g.name)}</option>`).join("")}</select></div></section>`).join("")}
 <section class="panel commission-card">${icon("plus")}<h2>A role for every vessel.</h2><label class="form-label" for="commission-role">Vessel design</label><select id="commission-role">${Object.entries(
   ROLES,
 )
   .map(
     ([id, r]) =>
       `<option value="${id}" ${id === commissionRole ? "selected" : ""}>${r.name}</option>`,
   )
   .join(
     "",
   )}</select><p>${role.description}</p><span>${state.fleet.length} / 12 TOTAL COMMAND CAPACITY</span>${button("Commission vessel", "commission", "primary", vessels.length >= 5 || state.fleet.length >= 12 || f.assignment ? "disabled" : "")}<p class="cost">${role.cost.alloys} alloys + ${role.cost.energy} energy</p></section></div><p class="cost">Transfers require both fleets to be idle in the same system. Ship identities and registries remain attached to the vessel through transfers, combat, and saves.</p>`;
}
function diplomacyView() {
  return `${heading("INTERSTELLAR RELATIONS", "No enemies are inevitable.", "Build trust, trade, form alliances—or choose confrontation. Every contacted power is a possible partner. Discover others by visiting unidentified systems or receiving visitors.")}<div class="diplomacy-grid">${Object.entries(
    state.relations,
  )
    .filter(([id]) => state.contacts.includes(id))
    .map(([id, r]) => {
      const p = POWERS[id];
      return `<section class="panel contact-card"><div class="contact-heading"><div class="contact-mark" style="--contact-color:${p.color}">${p.mark}</div><div><h2>${p.name}</h2><p>${p.style}</p></div><span class="tag ${r.status === "war" ? "red" : r.status === "allied" ? "green" : ""}">${r.status === "allied" ? "ALLIED" : r.status === "war" ? "AT WAR" : "NEUTRAL"}</span></div><div class="relationship-label"><span>Diplomatic relations</span><strong>${r.score > 0 ? "+" : ""}${r.score} <small>/ 100</small></strong></div><div class="relation-track"><span style="left:${(r.score + 100) / 2}%"></span></div><div class="relation-scale"><span>HOSTILE</span><span>CORDIAL</span><span>TRUSTED</span></div><div class="contact-actions">${r.status === "war" ? `${button("Negotiate peace · 30 influence", "diplomacy", "secondary", `data-id="${id}" data-kind="peace"`)}${button("Engage patrol", "battle", "danger", `data-opponent="${id}" data-id="rim" ${activeFleet(state).location !== "rim" || activeFleet(state).assignment ? 'disabled title="Move your active fleet to the Azure Reach first"' : ""}`)}` : `${button(`Send envoy · ${state.faction === "earth" ? 10 : 15} influence`, "diplomacy", "secondary", `data-id="${id}" data-kind="envoy" ${r.lastEnvoy === state.turn ? 'disabled title="One envoy per power per month"' : ""}`)}${button(r.trade ? "Trade active · +5 energy/mo" : "Trade pact · 25 energy", "diplomacy", "secondary", `data-id="${id}" data-kind="trade" ${r.trade || r.score < 10 ? 'disabled title="Requires +10 relations"' : ""}`)}${button(r.status === "allied" ? "Leave alliance" : "Form alliance · 25 influence", "diplomacy", r.status === "allied" ? "secondary" : "primary", `data-id="${id}" data-kind="${r.status === "allied" ? "leave" : "alliance"}" ${r.status !== "allied" && r.score < 35 ? 'disabled title="Requires +35 relations"' : ""}`)}${button("Declare war", "declare", "quiet-danger", `data-id="${id}"`)}`}</div>${diplomaticDetails(id, r)}<div class="contact-note">${r.status === "allied" ? "Your ally contributes +2 influence each month." : r.status === "war" ? "Trade is suspended. A ceasefire remains possible." : "Trade requires +10 relations. Alliance requires +35."}</div></section>`;
    })
    .join("")}</div>`;
}
function research() {
  return `${heading("SCIENCE & DEVELOPMENT", "Build the means to go further.", "Invest in the discoveries and infrastructure that will shape your future.")}<section class="panel era-briefing"><div class="eyebrow">${currentEra(state).interface} · ${campaignYear(state)}</div><h2>${currentEra(state).name}</h2><p>Current issue: <strong>${awayEquipment(state).weapon}</strong>. New eras update the command interface automatically. Research their sidearms to equip the next away team; phase-cannon research adds +5 damage, hull lattice reduces incoming damage by 30%, and field medicine grants an extra medical kit.</p></section><div class="section-label">RESEARCH PROGRAMS <span>Immediate upgrades · applied to current and future vessels</span></div><div class="research-grid">${Object.entries(
    TECH,
  )
    .map(
      ([id, t]) =>
        `<section class="panel research-card"><div class="research-icon">${icon(id === "shields" ? "shield" : id === "weapons" ? "target" : "compass")}</div><span class="eyebrow">${id === "logistics" ? "OPERATIONS" : "STARSHIP SYSTEMS"}</span><h2>${t.name}</h2><p>${t.description}</p>${button(state.tech.includes(id) ? icon("check") + " Research complete" : !techAvailable(state,id) ? t.year ? `Available in ${t.year}` : "Discovery required" : `Research · ${t.cost} data`, "develop", state.tech.includes(id) ? "secondary" : "primary", `data-kind="${id}" ${state.tech.includes(id) || !techAvailable(state,id) ? "disabled" : ""}`)}</section>`,
    )
    .join(
      "",
    )}</div><div class="section-label">PLANETARY INFRASTRUCTURE <span>Production is collected each month</span></div><div class="industry-grid">${[
    ["reactor", "energy", "Energy complex", "+12 energy per month"],
    ["foundry", "alloys", "Orbital foundry", "+8 alloys per month"],
  ]
    .map(
      ([id, i, n, d]) =>
        `<section class="panel industry-card"><div class="research-icon">${icon(i)}</div><div><div class="eyebrow">${state.buildings[id]} OPERATIONAL</div><h2>${n}</h2><p>${d}</p></div><div>${button("Construct", "develop", "secondary", `data-kind="${id}"`)}<p class="cost">40 alloys + 30 energy</p></div></section>`,
    )
    .join("")}</div>`;
}
function tactical() {
  const b = state.battle;
  if (!b)
    return `${heading("TACTICAL COMMAND", "The bridge is yours.", "Take the conn of any vessel. Coordinate your fleet. Decide when to fight—and when to talk.")}<section class="panel tactical-intro"><div class="tactical-intro-art">${shipArt()}</div><div><div class="eyebrow">COMMAND TRAINING / SIMULATED ENGAGEMENT</div><h2>Captain, you have the bridge.</h2><p>A turn-based tactical exercise against two raiders. Switch vessels, focus fire, reinforce shields, and issue fleet-wide orders. Your ships and resources are safe in the simulator.</p><div class="tutorial-steps"><span><b>01</b> Select a vessel</span><span><b>02</b> Designate a target</span><span><b>03</b> Issue a command</span></div>${button("Begin tactical simulation " + icon("arrow"), "training", "primary")}<p class="cost">For a live encounter, investigate the distress signal on the star chart.</p></div></section>`;
  const controlled = b.friends.find((v) => v.id === b.selected);
  const resultText = {
    victory: "The field is yours.",
    peace: "A different kind of victory.",
    retreat: "Live to explore another day.",
    defeat: "Bring our people home.",
  };
  return `${heading(b.training ? "SIMULATION · NO CAMPAIGN DAMAGE" : "LIVE ENGAGEMENT · RED ALERT", b.result ? resultText[b.result] : "All hands, battle stations.", `${state.sectors.find((s) => s.id === b.sectorId).name} · ${b.enemy}`, `<span class="round-badge">ROUND <b>${String(b.round).padStart(2, "0")}</b></span>`)}
    ${b.result ? `<div class="battle-result">${icon("shield")}<div><strong>${b.result.toUpperCase()}</strong><span>${b.training ? "Exercise complete. Your campaign fleet is unchanged." : b.result === "victory" ? "Recovered 25 alloys and 15 influence. Damage is retained; repair in Fleet command." : b.result === "peace" ? "Gained 10 alloys and 15 influence. Hostilities have ended." : b.result === "defeat" ? "Disabled vessels recovered with 12 hull. Repair in Fleet command." : "Fleet damage is retained. Repair before your next engagement."}</span></div>${button("Return to command", "closeBattle", "primary")}</div>` : ""}
    <div class="battle-layout"><section class="panel tactical-field"><div class="panel-heading"><h2>${icon("target")} Tactical plot</h2><span class="tag red">${b.result ? "ENGAGEMENT ENDED" : "WEAPONS READY"}</span></div><div class="combat-space"><div class="map-grid"></div><div class="combat-orbit"></div><span class="battle-side friendly-side">FRIENDLY VESSELS</span><span class="battle-side enemy-side">HOSTILE CONTACTS</span><div class="combat-fleet">${b.friends.map((v) => combatShip(v, false, b)).join("")}</div><div class="engagement-divider"><span>↔</span><small>TACTICAL RANGE</small></div><div class="combat-fleet enemies">${b.enemies.map((v) => combatShip(v, true, b)).join("")}</div></div><div class="combat-instructions">${icon("compass")} Select a friendly vessel to take command. Select a hostile vessel to target.</div></section>
    <section class="panel command-panel"><div class="panel-heading"><h2>Bridge controls</h2>${icon("fleet")}</div><div class="bridge-controls"><div class="eyebrow">YOU HAVE THE CONN</div><h2>${escape(controlled?.name || "Fleet command")}</h2><p class="registry">${escape(controlled?.registry || "")} · ${ROLES[controlled?.role]?.name || ""}</p><p>One bridge action advances combat by one round. Operational escorts provide covering fire after weapons, shield, and repair commands.</p><label class="eyebrow" for="fleet-order">FLEET-WIDE ORDERS</label><select id="fleet-order" ${b.result ? "disabled" : ""}><option value="balanced" ${b.order === "balanced" ? "selected" : ""}>Balanced formation</option><option value="focus" ${b.order === "focus" ? "selected" : ""}>Focus fire · more damage, more exposure</option><option value="evasive" ${b.order === "evasive" ? "selected" : ""}>Evasive pattern · less damage taken & dealt</option></select><label class="form-label" for="ship-power">Selected vessel power</label><select id="ship-power" ${b.result ? "disabled" : ""}>${[
      ["balanced", "Balanced"],
      ["weapons", "Weapons: +10 output, +4 incoming damage"],
      ["shields", "Shields: +50 reinforcement, −6 output"],
      ["engines", "Engines: −8 incoming damage, −4 output"],
    ]
      .map(
        ([id, name]) =>
          `<option value="${id}" ${controlled?.power === id ? "selected" : ""}>${name}</option>`,
      )
      .join(
        "",
      )}</select><label class="form-label" for="subsystem-target">Target subsystem</label><select id="subsystem-target" ${b.result ? "disabled" : ""}>${["hull", "weapons", "shields", "engines"].map((id) => `<option value="${id}" ${b.subsystem === id ? "selected" : ""}>${id[0].toUpperCase() + id.slice(1)}</option>`).join("")}</select><p class="cost">Subsystem shots deal 60% hull damage. Strip shields or use a science scan to damage weapons or engines. Disabling engines takes a ship out of combat without destroying its hull.</p><div class="bridge-actions">${[
      ["fire", "target", "Fire weapons"],
      ["scan", "science", "Scan subsystems"],
      ["shields", "shield", "Reinforce shields"],
      ["repair", "plus", "Damage control"],
      ["hail", "diplomacy", "Open hailing frequencies"],
      ["retreat", "arrow", "Order fleet withdrawal"],
    ]
      .map(([id, i, label]) =>
        button(
          icon(i) + label,
          "combat",
          id === "fire" ? "primary" : "secondary",
          `data-kind="${id}" ${b.result || (id === "scan" && controlled?.role !== "science") ? "disabled" : ""}`,
        ),
      )
      .join(
        "",
      )}</div><p class="cost">Hails succeed from round 4, or when combined enemy hull is 100 or lower. Withdrawal is guaranteed.</p></div></section></div><section class="panel combat-log"><div class="panel-heading"><h2>${icon("book")} Tactical readout</h2><span class="eyebrow">MOST RECENT FIRST</span></div>${b.messages
      .slice(0, 6)
      .map(
        (m, i) =>
          `<div class="readout ${i === 0 ? "latest" : ""}"><span>${String(b.messages.length - i).padStart(2, "0")}</span>${escape(m)}</div>`,
      )
      .join("")}</section>`;
}
function combatShip(v, enemy, b) {
  const active = enemy ? b.target === v.id : b.selected === v.id;
  return `<button class="combat-ship ${enemy ? "hostile-ship" : ""} ${active ? "selected" : ""} ${v.hull <= 0 || v.systems.engines <= 0 ? "disabled-ship" : ""}" data-action="${enemy ? "target" : "control"}" data-id="${v.id}" ${v.hull <= 0 || v.systems.engines <= 0 || b.result ? "disabled" : ""} aria-label="${enemy ? "Target" : "Command"} ${escape(v.name)}" aria-pressed="${active}"><span class="ship-designation">${v.hull <= 0 || v.systems.engines <= 0 ? "DISABLED" : active ? (enemy ? "TARGET LOCK" : "UNDER YOUR COMMAND") : enemy ? "HOSTILE" : "ESCORT"}</span>${shipArt(enemy ? "enemy" : "friendly")}<strong>${escape(v.name)}</strong><span class="registry">${escape(v.registry)}</span><span class="combat-meter-label">HULL ${v.hull} / ${v.maxHull}</span>${meter(v.hull, v.maxHull, enemy ? "red-meter" : "")}<span class="combat-meter-label">SHIELDS ${v.shields} / ${v.maxShields}</span>${meter(v.shields, v.maxShields, "blue-meter")}<span class="subsystem-readout">W ${v.systems.weapons}% · S ${v.systems.shields}% · E ${v.systems.engines}%${v.scanned ? " · SCANNED" : ""}</span></button>`;
}
function logView() {
  return `${heading("THE HISTORY YOU ARE WRITING", "Captain’s log.", "A record of your decisions, discoveries, and the consequences that follow.")}<div class="log-layout"><section class="panel timeline">${state.log.map((l) => `<article class="log-entry"><span class="log-turn">MONTH ${String(l.turn).padStart(2, "0")}</span><span class="timeline-dot"></span><div><span class="eyebrow">${escape(l.type || "REPORT")}</span><p>${escape(l.text)}</p></div></article>`).join("")}</section><section class="panel ethos"><div class="eyebrow">YOUR EMERGING IDENTITY</div><h2>A civilization in the making.</h2><p>Your decisions suggest a direction. They never lock you out of another path.</p>${[
    ["cooperation", "Cooperation"],
    ["independence", "Independence"],
    ["force", "Assertiveness"],
  ]
    .map(
      ([k, n]) =>
        `<div class="ship-stat"><span>${n}</span><strong>${state.ethics[k]}</strong></div>${meter(state.ethics[k], Math.max(6, ...Object.values(state.ethics)))}`,
    )
    .join(
      "",
    )}<div class="notice">${state.charter ? escape(state.charter) : "Your founding charter awaits. Six council decisions will define your first chapter."}</div></section></div>`;
}
function renderModal() {
  const extra = extendedModal();
  if (extra !== null)
    return `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close icon-button" data-action="dismiss" aria-label="Close dialog">${icon("close")}</button>${extra}</section></div>`;
  return `<div class="modal-backdrop"><section class="modal ${modal.type === "new" ? "wide" : ""}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close icon-button" data-action="dismiss" aria-label="Close dialog">${icon("close")}</button>${
    modal.type === "new"
      ? `<div class="eyebrow">EVERY CIVILIZATION HAS A BEGINNING</div><h2 id="modal-title">Whose future will you write?</h2><p>Starting a new campaign replaces your current local save. Federation is the developed origin chapter; Klingon and Romulan starts currently share its prototype event structure.</p><label class="form-label" for="campaign-era">Starting era</label><select id="campaign-era">${ERAS.map(e=>`<option value="${e.year}">${e.year} · ${e.name} · ${e.weapon}</option>`).join("")}</select><p class="cost">Later starts use the same alternate-history origin chapter, with era equipment already issued. Themes change automatically as the calendar advances; future sidearms require research.</p><div class="faction-grid">${Object.entries(
          FACTIONS,
        )
          .map(
            ([id, f]) =>
              `<button class="faction-option" data-action="start" data-id="${id}">${delta()}<h3>${f.name}</h3><p>${f.description}</p><small>${f.bonus}</small><strong>Begin journey ${icon("arrow")}</strong></button>`,
          )
          .join("")}</div>`
      : `<div class="eyebrow">DIPLOMATIC CONSEQUENCES</div><h2 id="modal-title">Declare war on ${POWERS[modal.id].name}?</h2><p>This ends your alliance and trade agreement with this power, sets relations to −65, and opens live fleet engagements. Peace can be negotiated later for 30 influence.</p><div class="modal-actions">${button("Keep diplomatic channels open", "dismiss", "secondary")}${button("Declare war", "confirmWar", "danger", `data-id="${modal.id}"`)}</div>`
  }</section></div>`;
}
function navigate(next) {
  view = next;
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  e.preventDefault();
  const { action, id, kind, index, opponent } = el.dataset;
  let message = "";
  try {
    if (action === "fps") { handleFPS(kind); return; }
    if (handleExtendedAction(action, el.dataset)) return;
    if (action === "nav") {
      navigate(el.dataset.view);
      return;
    }
    if (action === "new") {
      modal = { type: "new" };
      render();
      return;
    }
    if (action === "dismiss") {
      modal = null;
      render();
      return;
    }
    if (action === "declare") {
      modal = { type: "war", id };
      render();
      return;
    }
    if (action === "sector") {
      sectorId = id;
      view = "galaxy";
    } else if (action === "start") {
      state = createGame(id, Number(document.querySelector("#campaign-era")?.value || 2151));
      modal = null;
      view = "overview";
      message = "A new voyage begins.";
    } else if (action === "save") {
      persist();
      toast(
        saveAvailable
          ? "Campaign saved on this device."
          : "Saving unavailable. Allow local storage to preserve your campaign.",
      );
      render();
      return;
    } else if (action === "decision") message = decision(state, Number(index));
    else if (action === "advance") message = advanceMonths(state, Number(document.querySelector("#month-count")?.value || 1));
    else if (action === "monthly") message = resolveMonthlyEvent(state, Number(index));
    else if (action === "project") message = completeProject(state, id);
    else if (action === "deployAway") { message = startAway(state, id); view = "away"; }
    else if (action === "away") message = awayAction(state, kind, Number(index));
    else if (action === "survey") message = survey(state, id);
    else if (action === "diplomacy") message = diplomacy(state, id, kind);
    else if (action === "confirmWar") {
      message = diplomacy(state, id, "war");
      modal = null;
    } else if (action === "develop") message = develop(state, kind);
    else if (action === "commission")
      message = commission(state, commissionRole);
    else if (action === "repairFleet") message = repairFleet(state);
    else if (action === "battle" || action === "training") {
      message = startBattle(
        state,
        id || "eridani",
        opponent || null,
        action === "training",
      );
      view = "tactical";
    } else if (action === "combat") message = combatAction(state, kind);
    else if (action === "control" && state.battle) state.battle.selected = id;
    else if (action === "target" && state.battle) state.battle.target = id;
    else if (action === "closeBattle" && state.battle?.result) {
      state.battle = null;
      view = "overview";
    }
    persist();
    render();
    if (message) toast(message);
  } catch (err) {
    toast(err.message);
  }
});
app.addEventListener("change", async (e) => {
  try {
    if (e.target.id === "import-file") {
      await previewImport(e.target.files[0]);
      return;
    }
    if (e.target.id === "month-count") {
      monthsToAdvance = Number(e.target.value); render(); return;
    }
    if (e.target.id === "commission-role") {
      commissionRole = e.target.value;
      render();
      return;
    }
    if (e.target.id === "assignment-kind") {
      document.querySelector("#assignment-description").textContent =
        ASSIGNMENTS[e.target.value].description;
      return;
    }
    if (e.target.dataset.transfer) {
      toast(transferShip(state, e.target.dataset.transfer, e.target.value));
      persist();
      render();
      return;
    }
    if (e.target.id === "ship-power") {
      setPower(state, state.battle.selected, e.target.value);
      persist();
      render();
      return;
    }
    if (
      e.target.id === "subsystem-target" &&
      state.battle &&
      !state.battle.result
    ) {
      state.battle.subsystem = e.target.value;
      persist();
      return;
    }
    if (e.target.id === "fleet-order" && state.battle && !state.battle.result) {
      state.battle.order = e.target.value;
      persist();
      toast("Fleet order acknowledged.");
    }
  } catch (err) {
    toast(err.message);
    render();
  }
});
app.addEventListener("submit", (e) => {
  if (!e.target.matches("[data-identity-form]")) return;
  e.preventDefault();
  try {
    const data = new FormData(e.target),
      name = data.get("name"),
      registry = data.get("registry");
    let message;
    if (modal.type === "ship")
      message = customizeShip(state, modal.id, name, registry);
    if (modal.type === "fleet")
      message = customizeFleet(state, modal.id, name, registry);
    if (modal.type === "createFleet") {
      const id = createFleet(state, name, registry);
      selectFleet(state, id);
      message = "Fleet established. Transfer or commission ships to begin.";
    }
    modal = null;
    persist();
    render();
    toast(message);
  } catch (err) {
    toast(err.message);
  }
});
document.addEventListener("keydown", (e) => {
  if (view === "away" && state.away && !modal && !/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) {
    if(e.key === "Escape") { pauseAway(); return; }
    if(awayLive) {
      const key=e.key.toLowerCase();
      if(["w","a","s","d","q","e","arrowup","arrowdown","arrowleft","arrowright"," "].includes(key)) {e.preventDefault();awayKeys.add(key);}
      if(!e.repeat && ["r","f"].includes(key)) {e.preventDefault();handleFPS(key==="r"?"reload":"scan");}
    } else if(!e.repeat) {
      const action = { w:"forward",s:"back",a:"left",d:"right",ArrowUp:"forward",ArrowDown:"back",ArrowLeft:"left",ArrowRight:"right" }[e.key];
      if(action) {e.preventDefault();try{awayAction(state,action);persist();render();}catch(err){toast(err.message);}}
    }
  }
  if (e.key === "Escape" && modal) {
    modal = null;
    render();
  }
  if (e.key === "Tab" && modal) {
    const buttons = [
      ...document.querySelectorAll(
        ".modal button:not([disabled]), .modal input:not([disabled]), .modal select:not([disabled])",
      ),
    ];
    const first = buttons[0],
      last = buttons.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
persist();
render();

function tutorialBanner() {
  if (!state.tutorial.active)
    return view === "overview" && !state.tutorial.completed.includes("battle")
      ? `<div class="welcome-strip"><span>New to command? Learn the essentials in five short steps.</span>${button("Start tutorial", "tutorial", "secondary", 'data-kind="start"')}</div>`
      : "";
  const step = tutorialStep(state);
  return `<section class="tutorial-banner" aria-label="Guided tutorial"><div><div class="eyebrow">ACADEMY · ${state.tutorial.completed.length} / ${TUTORIAL_STEPS.length} COMPLETE</div><h2>${step ? step.title : "Ready for the frontier."}</h2><p>${step ? step.text : "You have practiced decisions, production, exploration, diplomacy, and fleet command. You can replay this guide from Academy & saves."}</p></div><div class="action-row">${step ? button("Show me where", "tutorialGo", "primary", `data-view="${step.view}"`) : ""}${button(step ? "Skip tutorial" : "Finish tutorial", "tutorial", "secondary", 'data-kind="skip"')}</div></section>`;
}
function diplomaticDetails(id, r) {
  return `<div class="diplomatic-detail"><div class="trust-stats"><span>Trust <b>${r.trust > 0 ? "+" : ""}${r.trust}</b></span><span>Favors owed <b>${r.favors}</b></span><span>Borders <b>${r.borders ? "Agreed" : "Unsettled"}</b></span></div>${r.grievances.length ? `<p class="grievance">Recent grievance: ${escape(r.grievances[0])}</p>` : ""}
 ${r.status !== "war" ? `<div class="contact-actions">${button(r.borders ? "Border treaty · +2 research/mo" : "Propose border agreement", "treaty", "secondary", `data-id="${id}" data-kind="borders" ${r.borders ? "disabled" : ""}`)}${button("Propose joint research", "treaty", "secondary", `data-id="${id}" data-kind="research"`)}${button("Call in favor · +20 alloys", "favor", "secondary", `data-id="${id}" ${r.favors < 1 ? "disabled" : ""}`)}</div><p class="cost">Trusted terms (relations + trust ≥35): borders cost 20 influence; research costs 30 influence for 35 research. Otherwise expect an additional 25-energy counteroffer. Breaking a treaty damages trust across the galaxy.</p>` : ""}
 ${r.proposal ? `<div class="diplomatic-offer"><strong>Counteroffer: ${r.proposal.kind === "borders" ? "border agreement" : "joint research"}</strong><p>${r.proposal.influence} influence + ${r.proposal.energy} energy · expires month ${r.proposal.expires}</p><div class="action-row">${button("Accept terms", "answerProposal", "primary", `data-id="${id}" data-kind="accept"`)}${button("Decline", "answerProposal", "secondary", `data-id="${id}" data-kind="decline"`)}</div></div>` : ""}
 ${r.request ? `<div class="diplomatic-offer"><strong>Your neighbors need relief supplies</strong><p>15 alloys → +8 relations, +10 trust, 1 favor. Answer by month ${r.request.expires}. Declining or ignoring costs 3 relations.</p><div class="action-row">${button("Send relief supplies", "answerRequest", "primary", `data-id="${id}" data-kind="accept"`)}${button("Decline request", "answerRequest", "secondary", `data-id="${id}" data-kind="decline"`)}</div></div>` : ""}</div>`;
}
function missionsView() {
  return `${heading("EXPLORATION & CONSEQUENCES", "Every discovery asks something of you.", "Survey Andoria, Tellar Prime, Epsilon Eridani, and the Azure Reach to uncover missions. Decisions echo two months later.")}${
    state.missions.length
      ? `<div class="mission-grid">${state.missions
          .map((m) => {
            const def = MISSION_DEFS[m.sectorId];
            return `<section class="panel mission-card"><div class="eyebrow">${escape(state.sectors.find((x) => x.id === m.sectorId).name)} · ${m.status.toUpperCase()}</div><h2>${def.title}</h2><p>${def.body}</p>${m.status === "available" ? `<div class="choices">${def.choices.map((c) => `<button class="choice" data-action="mission" data-id="${m.id}" data-kind="${c.id}"><span><strong>${c.label}</strong><small>${c.detail}</small></span>${icon("arrow")}</button>`).join("")}</div>` : m.status === "pending" ? `<div class="notice">You chose: ${def.choices.find((c) => c.id === m.choice).label}. Follow-up arrives in month ${m.due} (${Math.max(0, m.due - state.turn)} months remaining).</div>` : `<div class="mission-outcome">${icon("check")} ${escape(m.outcome)}</div>`}</section>`;
          })
          .join("")}</div>`
      : `<section class="panel empty-state">${icon("compass")}<h2>The unknown is waiting.</h2><p>Dispatch a fleet to scout an uncharted system. New missions appear here when it arrives.</p>${button("Open star chart", "nav", "primary", 'data-view="galaxy"')}</section>`
  }`;
}
function helpView() {
  return `${heading("ACADEMY & CAMPAIGN FILES", "A little guidance. A galaxy of possibilities.", "Learn at your own pace, and keep your campaign between releases.")}<section class="panel assignment-guide"><h2>Your expanded frontier</h2><p><strong>Explore:</strong> the star chart lists 18 destinations. Scout new systems for research leads, away sites, and one-time field projects. Unidentified civilization signals reveal names and diplomacy when a fleet arrives. Origin delegations also visit your home.</p><p><strong>Away team:</strong> survey one of the six marked sites, stay in orbit, and deploy for 10 energy. Select Begin mission for continuous WASD movement, mouse/arrow aiming and Space/click phaser fire. R cycles cells, F scans nearby objectives, Esc pauses. Stun is the default; high power consumes two charges. Seek cover, use field medicine, or broadcast a ceasefire. Paused step controls remain available. Recall preserves objectives; incapacitated teams can always evacuate.</p><p><strong>Time:</strong> choose 1, 3, 6, or 12 months on Command overview. Time stops for council and monthly decisions, first contact, fleet arrivals, mission results, and new diplomatic requests. Resolve the priority transmission before continuing.</p><p><strong>Compare ships:</strong> Fleet command lists every design alongside your actual vessels, including current research bonuses and commission costs.</p></section><div class="help-grid"><section class="panel help-card"><div class="eyebrow">START HERE</div><h2>Your first five orders</h2><ol>${TUTORIAL_STEPS.map((t) => `<li><strong>${t.title.replace(/^\d\. /, "")}</strong><p>${t.text}</p></li>`).join("")}</ol><div class="action-row">${button("Replay guided tutorial", "tutorial", "primary", 'data-kind="replay"')}${button("Skip tutorial", "tutorial", "secondary", 'data-kind="skip"')}</div><p class="cost">This guide uses your current campaign. Completed milestones are remembered. Replay resets the checklist without resetting your progress.</p></section>
 <section class="panel help-card"><div class="eyebrow">YOUR CAMPAIGN, YOUR FILE</div><h2>Save, export, and continue.</h2><p>Autosave belongs to this browser and file location. Export a campaign before moving the game, switching computers, or installing a new release.</p>${button("Export campaign (.json)", "export", "primary")}<label class="form-label" for="import-file">Import a saved campaign</label><input id="import-file" type="file" accept=".json,application/json"><p class="cost">Import previews the faction and month before replacing your campaign. Original v0.1–v0.3 saves are upgraded automatically. Invalid files leave your current campaign intact.</p><div class="notice">Browser saves do not automatically transfer between downloaded HTML files. Export here, open the new game, and import the JSON file.</div><h2 class="help-subheading">How each resource works</h2><dl class="resource-guide"><dt>Energy</dt><dd>Travel, surveys, construction, and trade.</dd><dt>Alloys</dt><dd>New vessels, repairs, and relief supplies.</dd><dt>Research</dt><dd>Technology that improves your economy and fleet.</dd><dt>Influence</dt><dd>Envoys, treaties, alliances, and peace negotiations.</dd></dl><p class="cost">Version ${GAME_VERSION} · Save format ${SAVE_VERSION} · Native desktop builds and a mod manager remain future milestones.</p></section></div>`;
}
function extendedModal() {
  if (["ship", "fleet", "createFleet"].includes(modal.type)) {
    const item =
      modal.type === "ship"
        ? state.fleet.find((v) => v.id === modal.id)
        : modal.type === "fleet"
          ? state.taskForces.find((f) => f.id === modal.id)
          : null;
    const isShip = modal.type === "ship";
    return `<div class="eyebrow">FLEET IDENTITY</div><h2 id="modal-title">${isShip ? "Make this ship your own." : modal.type === "createFleet" ? "Establish a new fleet." : "A name for your mission."}</h2><form data-identity-form><label class="form-label" for="identity-name">${isShip ? "Ship" : "Fleet"} name</label><input id="identity-name" name="name" maxlength="40" required value="${escape(item?.name || "")}" placeholder="${isShip ? "UES Enterprise" : "Second Expedition"}"><label class="form-label" for="identity-registry">${isShip ? "Registry number" : "Fleet designation"}</label><input id="identity-registry" name="registry" maxlength="20" required value="${escape(isShip ? item.registry : item?.designation || `TF-${String(state.nextFleet).padStart(2, "0")}`)}" placeholder="${isShip ? "NX-01" : "TF-02"}"><p class="cost">Names: 1–40 characters. Registries and designations: 1–20 characters, unique within their category. Internal ship and fleet identities stay unchanged.</p><div class="modal-actions">${button("Cancel", "dismiss", "secondary")}<button class="button primary" type="submit">${modal.type === "createFleet" ? "Create fleet" : "Save identity"}</button></div></form>`;
  }
  if (modal.type === "import") {
    const incoming = modal.candidate;
    return `<div class="eyebrow">CAMPAIGN IMPORT</div><h2 id="modal-title">Continue this voyage?</h2><p><strong>${FACTIONS[incoming.faction].name}</strong> · Month ${incoming.turn} · ${incoming.fleet.length} vessels in ${incoming.taskForces.length} fleet(s).</p><p>This replaces your current campaign. Export your current campaign first if you want to keep both.</p><div class="modal-actions">${button("Export current campaign", "export", "secondary")}${button("Cancel", "dismiss", "secondary")}${button("Import this campaign", "confirmImport", "primary")}</div>`;
  }
  return null;
}
async function previewImport(file) {
  if (!file) return;
  if (file.size > 2_000_000) {
    toast("Save file is too large (maximum 2 MB).");
    return;
  }
  const candidate = restoreSave(await file.text());
  if (!candidate) {
    toast(
      "This save is invalid or from an unsupported version. Your current campaign is unchanged.",
    );
    return;
  }
  modal = { type: "import", candidate };
  render();
}
function downloadCampaign() {
  const blob = new Blob([exportSave(state)], { type: "application/json" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = `Divergence-${state.faction}-month-${state.turn}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast(
    "Campaign export prepared. Keep the JSON file to import into future versions.",
  );
}
function handleExtendedAction(action, data) {
  let message = "";
  if (
    action === "editShip" ||
    action === "editFleet" ||
    action === "newFleet"
  ) {
    modal = {
      type:
        action === "editShip"
          ? "ship"
          : action === "editFleet"
            ? "fleet"
            : "createFleet",
      id: data.id,
    };
    render();
    return true;
  }
  if (action === "export") {
    downloadCampaign();
    return true;
  }
  if (action === "confirmImport") {
    if (modal?.type !== "import") return true;
    state = modal.candidate;
    modal = null;
    view = state.battle ? "tactical" : state.away ? "away" : "overview";
    sectorId = state.location;
    message = "Campaign imported successfully.";
  } else if (action === "selectFleet") {
    selectFleet(state, data.id);
    message = `Command transferred to ${activeFleet(state).name}.`;
  } else if (action === "dispatch")
    message = assignFleet(
      state,
      state.activeFleetId,
      data.id,
      document.querySelector("#assignment-kind").value,
    );
  else if (action === "mission")
    message = chooseMission(state, data.id, data.kind);
  else if (action === "treaty")
    message = proposeTreaty(state, data.id, data.kind);
  else if (action === "answerProposal")
    message = answerProposal(state, data.id, data.kind === "accept");
  else if (action === "answerRequest")
    message = answerRequest(state, data.id, data.kind === "accept");
  else if (action === "favor") message = requestFavor(state, data.id);
  else if (action === "tutorial") {
    setTutorial(state, data.kind);
    if (data.kind !== "skip") {
      view = tutorialStep(state)?.view || "help";
      if (view === "galaxy") sectorId = "tellar";
    }
    message =
      data.kind === "skip"
        ? "Tutorial hidden. Replay it from Academy & saves."
        : "Your guide is ready.";
  } else if (action === "tutorialGo") {
    view = data.view;
    if (view === "galaxy") sectorId = "tellar";
  } else return false;
  persist();
  render();
  if (message) toast(message);
  return true;
}

function timeControls() {
  const blocked = state.battle || state.away || state.monthlyEvent || (currentEvent(state) && !state.eventResolved);
  return `<div class="time-controls"><label for="month-count">Advance time</label><select id="month-count">${[1,3,6,12].map(n=>`<option value="${n}" ${n===monthsToAdvance?"selected":""}>${n} month${n===1?"":"s"}</option>`).join("")}</select>${button((monthsToAdvance===1 ? "Next month " : `Advance ${monthsToAdvance} months `) + icon("arrow"), "advance", "primary", blocked ? 'disabled title="Resolve pending decisions or recall your away team first"' : "")}<small>${date()} · month ${state.turn}</small></div>`;
}
function priorityTransmission() {
  const e = state.monthlyEvent && MONTHLY_EVENTS[state.monthlyEvent.id];
  if (!e) return "";
  return `<section class="panel priority-transmission" aria-label="Monthly event"><div class="eyebrow">PRIORITY TRANSMISSION · MONTH ${state.monthlyEvent.turn}</div><h2>${e.title}</h2><p>${e.body}</p><div class="action-row">${e.choices.map((c,i) => button(`${c.label}<small>${c.effect}</small>`, "monthly", "secondary", `data-index="${i}" ${state.battle ? "disabled" : ""}`)).join("")}</div></section>`;
}
function siteActions(s, here) {
  if (!s.site && !s.project && !s.tech) return "";
  const completed = state.awayHistory[s.id]?.length === 3;
  return `<section class="panel assignment-guide site-briefing"><div class="eyebrow">EXPLORATION OPPORTUNITIES</div><h2>${s.site ? AWAY_SITES[s.site].title : "A reason to stay"}</h2><p>${!s.surveyed ? "Scout this system to identify its discoveries and activities." : s.site ? AWAY_SITES[s.site].intro : "Complete a field project while your fleet is in this system."}</p>${s.tech ? `<p><strong>Research lead:</strong> ${TECH[s.tech].name} · ${TECH[s.tech].away ? "Complete all away objectives" : "Survey the system"} to unlock.</p>` : ""}${s.site ? button(completed ? "Away mission complete" : state.away?.sectorId === s.id ? "Return to away team" : "Deploy away team · 10 energy", state.away?.sectorId === s.id ? "nav" : "deployAway", "primary", `data-id="${s.id}" data-view="away" ${!here || !s.surveyed || completed ? "disabled" : ""}`) : ""}${s.project ? button(state.projects.includes(s.id) ? "Field project complete" : `Field project · 15 energy → 40 ${s.project}`, "project", "primary", `data-id="${s.id}" ${!here || !s.surveyed || state.projects.includes(s.id) ? "disabled" : ""}`) : ""}</section>`;
}
function shipComparison() {
  return `<section class="panel comparison-panel"><div class="panel-heading"><h2>Ship comparison</h2><span class="tag">CURRENT RESEARCH INCLUDED</span></div><div class="table-scroll" tabindex="0" role="region" aria-label="Ship designs and fleet statistics"><table><caption>Available designs and every vessel under your command. Hull and shields show capacity; owned ships also show current condition.</caption><thead><tr><th scope="col">Vessel / design</th><th scope="col">Hull</th><th scope="col">Shields</th><th scope="col">Weapons</th><th scope="col">Commission cost</th><th scope="col">Role advantage</th></tr></thead><tbody>${Object.entries(ROLES).map(([id,r]) => { const stats=designStats(state,id); return `<tr class="design-row"><th scope="row">${r.name}<small>AVAILABLE DESIGN · ${state.fleet.filter(v=>v.role===id).length} owned</small></th><td>${stats.hull}</td><td>${stats.shields}</td><td>${stats.damage}</td><td>${r.cost.alloys} alloys<br>${r.cost.energy} energy</td><td>${r.description}</td></tr>`; }).join("")}${state.fleet.map(v=>`<tr><th scope="row">${escape(v.name)}<small>${escape(v.registry)} · ${escape(state.taskForces.find(f=>f.id===v.fleetId).name)}</small></th><td>${v.hull} / ${v.maxHull}</td><td>${v.shields} / ${v.maxShields}</td><td>${v.damage+(state.faction==="klingon"?4:0)}</td><td>In service</td><td>${escape(v.cls)}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function awayScene() {
  return `<canvas id="away-canvas" class="away-scene" width="960" height="540" tabindex="0" aria-label="First-person away mission. Begin mission, then use WASD to move, arrows to aim, Space to fire and Escape to pause.">Your browser needs Canvas support for the first-person view. Step controls and scanner remain available.</canvas>`;
}
function awayView() {
  if (!state.away) return `${heading("SURFACE OPERATIONS", "Step into the unknown.", "Explore from the perspective of your away team.")}<section class="panel empty-state"><h2>Your team is standing by.</h2><p>Survey a site, leave your fleet in orbit, then deploy from its star-chart briefing. Each site has three objects to scan and resolve. Completed objectives survive recall.</p><div class="away-site-list">${state.sectors.filter(s=>s.site).map(s=>`<button class="button secondary" data-action="sector" data-id="${s.id}">${s.name}<small>${state.awayHistory[s.id]?.length || 0}/3 objectives · ${s.surveyed ? "surveyed" : "survey required"}</small></button>`).join("")}</div></section>`;
  const a=state.away, sector=state.sectors.find(s=>s.id===a.sectorId), site=AWAY_SITES[sector.site], near=awayNear(state);
  return `${heading("AWAY TEAM · " + sector.name.toUpperCase(), site.title, "Live: WASD move · Mouse / arrows aim · Space / click fire · R cycle cell · F scan · Esc pause", button("Recall away team", "away", "secondary", 'data-kind="recall"'))}<div class="away-layout"><section class="panel away-viewport">${awayScene()}${combatControls()}<div class="away-controls step-controls"><span class="cost">Paused step controls</span>${button("Turn left", "away", "secondary", 'data-kind="left"')}${button("Move forward", "away", "primary", 'data-kind="forward"')}${button("Turn right", "away", "secondary", 'data-kind="right"')}${button("Move back", "away", "secondary", 'data-kind="back"')}</div><p class="away-message" role="status">${escape(a.message)}</p></section><section class="panel scanner-panel"><div class="eyebrow">TRICORDER · LOCAL SCAN</div><div class="scanner-map" aria-label="Local floor plan; numbered objectives">${AWAY_LAYOUT.map((row,y)=>[...row].map((cell,x)=>{ const obj=AWAY_OBJECT_POSITIONS.findIndex(p=>p.x===x&&p.y===y); return `<span class="${cell==="#"?"wall":"floor"} ${a.x===x&&a.y===y?"player":""}">${a.x===x&&a.y===y ? ["↑","→","↓","←"][a.direction] : obj>=0 ? a.resolved.includes(obj) ? "✓" : obj+1 : ""}</span>`; }).join("")).join("")}</div><p>Move next to a numbered object to scan it. Your arrow shows your position and heading.</p><ol>${site.objects.map((name,i)=>`<li>${name} ${a.resolved.includes(i)?"✓":""}</li>`).join("")}</ol><div class="nearby-objects">${near.filter(p=>!a.resolved.includes(p.i)).map(p=>`<div class="nearby-object"><h3>${site.objects[p.i]}</h3>${button("Scan object", "away", "secondary", `data-kind="scan" data-index="${p.i}"`)}${a.scanned.includes(p.i) ? `<p>${site.scans[p.i]}</p>${button("Preserve & study · +18 research, +5 influence", "away", "primary", `data-kind="study" data-index="${p.i}"`)}${button("Recover materials · +15 alloys", "away", "secondary", `data-kind="salvage" data-index="${p.i}"`)}` : ""}</div>`).join("") || `<p>${a.resolved.length===3 ? "All objectives complete. Recall your team to resume the campaign." : "No unresolved object within reach. Follow your scanner."}</p>`}</div></section></div>`;
}

function combatControls() {
  const a=state.away,gear=deployedEquipment(state);
  return `<div class="combat-hud"><span id="away-vitals">Health ${Math.ceil(a.health)} / 100 · Cell ${a.charge} / ${gear.capacity}</span><span id="away-loadout">${gear.weapon} · ${a.mode}</span></div>
    <div class="combat-buttons">${button("Begin mission", "fps", "primary", 'data-kind="toggle"')}${button("Fire phaser", "fps", "primary", 'data-kind="fire"')}${button("Cycle cell · R", "fps", "secondary", 'data-kind="reload"')}${button("Stun / high power", "fps", "secondary", 'data-kind="mode"')}${button("Field medicine", "fps", "secondary", 'data-kind="medkit"')}${button("Broadcast ceasefire", "fps", "secondary", 'data-kind="hail"')}</div>
    <div class="live-movement" aria-label="Live movement controls">${[["q","↶ Turn"],["w","↑ Forward"],["e","Turn ↷"],["a","← Strafe"],["s","↓ Back"],["d","Strafe →"]].map(([k,label])=>`<button class="button secondary" data-move="${k}">${label}</button>`).join("")}</div><p class="combat-hint">${a.enemies.length ? "Threats: autonomous security" + (a.enemies.some(e=>e.kind==="raider") ? " and unaffiliated raiders" : "") + ". No faction is automatically your enemy." : "No hostile signatures. A relief and exploration mission."} Click the live viewport to capture the mouse; drag to aim if unavailable. Escape or leaving this screen pauses combat.</p>`;
}
function pauseAway() {
  awayLive=false;awayKeys.clear();touchKeys.clear();
  if(document.pointerLockElement) document.exitPointerLock?.();
  const el=document.querySelector('[data-action="fps"][data-kind="toggle"]');if(el)el.textContent="Begin mission";
  document.querySelectorAll(".step-controls button").forEach(b=>b.disabled=false);
  const loadout=document.querySelector("#away-loadout");if(loadout&&state.away)loadout.textContent=`${deployedEquipment(state).weapon} · ${state.away.mode.toUpperCase()} · PAUSED`;
  paintAway(document.querySelector("#away-canvas"),state,false);
}
function handleFPS(kind) {
  try {
    if(kind==="toggle") {
      if(awayLive) pauseAway();
      else if(state.away?.health>0){awayLive=true;frameTime=performance.now();awayKeys.clear();document.querySelector('[data-kind="toggle"]').textContent="Pause mission";document.querySelector("#away-canvas")?.focus({preventScroll:true});}
    } else if(kind==="scan") {
      const obj=awayNear(state).find(p=>!state.away.resolved.includes(p.i));
      if(obj) {awayAction(state,"scan",obj.i);render();}
      else toast("Move next to an objective to scan it.");
    } else {
      if(["fire","reload"].includes(kind)&&!awayLive){toast("Begin the mission to operate the phaser.");return;}
      awayCombat(state,kind);
    }
    persist();updateAwayHUD();
  }catch(err){toast(err.message);}
}
function updateAwayHUD() {
  const a=state.away;if(!a)return;
  const gear=deployedEquipment(state),v=document.querySelector("#away-vitals"),l=document.querySelector("#away-loadout");
  if(v)v.textContent=`Health ${Math.ceil(a.health)} / 100 · Cell ${a.charge} / ${gear.capacity}${a.reload>0?" · CYCLING":""} · Medical kits ${a.medkits}`;
  if(l)l.textContent=`${gear.weapon} · ${a.mode.toUpperCase()} · ${awayLive?"LIVE":"PAUSED"}`;
  const m=document.querySelector(".away-message");if(m)m.textContent=a.message;
  document.querySelectorAll(".step-controls button").forEach(b=>b.disabled=awayLive);
  const stamp=JSON.stringify([a.x,a.y,a.direction,a.resolved,a.scanned]);
  if(stamp!==awayUIStamp) {
    awayUIStamp=stamp;
    const preview=document.createElement("div");preview.innerHTML=awayView();
    for(const selector of [".scanner-map",".nearby-objects"]) {
      const target=document.querySelector(selector),fresh=preview.querySelector(selector);if(target&&fresh)target.replaceWith(fresh);
    }
  }
  paintAway(document.querySelector("#away-canvas"),state,awayLive);
}
document.addEventListener("keyup",e=>awayKeys.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>{pauseAway();persist();});
document.addEventListener("visibilitychange",()=>{if(document.hidden){pauseAway();persist();}});
document.addEventListener("pointerlockchange",()=>{if(!document.pointerLockElement){pauseAway();persist();}});
document.addEventListener("mousemove",e=>{
  if(awayLive && (document.pointerLockElement?.id==="away-canvas" || (e.buttons===1 && e.target.id==="away-canvas"))) awayLook(state,e.movementX*.003);
});
app.addEventListener("pointerdown",e=>{
  const movement=e.target.closest("[data-move]");
  if(movement&&awayLive){e.preventDefault();touchKeys.add(movement.dataset.move);movement.setPointerCapture?.(e.pointerId);return;}
  if(e.target.id!=="away-canvas" || !awayLive)return;
  if(document.pointerLockElement===e.target) {handleFPS("fire");awayKeys.add("mousefire");}
  else {try {const promise=e.target.requestPointerLock?.();promise?.catch(()=>toast("Mouse capture unavailable. Drag the viewport or use arrow keys to aim."));}catch{toast("Drag the viewport or use arrow keys to aim.");}}
});
document.addEventListener("pointerup",()=>{touchKeys.clear();awayKeys.delete("mousefire");});
document.addEventListener("pointercancel",()=>{touchKeys.clear();awayKeys.delete("mousefire");});
function awayFrame(now) {
  if(awayLive && state.away && view==="away" && !modal && !document.hidden) {
    const dt=Math.min(.05,(now-frameTime)/1000);frameTime=now;
    const held=k=>awayKeys.has(k)||touchKeys.has(k);
    awayTick(state,{forward:Number(held("w")||held("arrowup"))-Number(held("s")||held("arrowdown")),strafe:Number(held("d"))-Number(held("a")),turn:Number(held("e")||held("arrowright"))-Number(held("q")||held("arrowleft")),fire:held(" ")||held("mousefire")},dt);
    if(state.away.health<=0)pauseAway();
    if(now-drawTime>32){updateAwayHUD();drawTime=now;}
    if(now-saveTime>750){persist();saveTime=now;}
  }
  requestAnimationFrame(awayFrame);
}
requestAnimationFrame(awayFrame);
