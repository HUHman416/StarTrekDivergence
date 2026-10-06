export const GAME_VERSION = "0.4.0";
export const SAVE_VERSION = 4;
export const SAVE_KEY = "divergence.campaign.v1";
// Era boundaries are campaign design presets, not a forced canon timeline.
export const ERAS = [
  { id: "frontier", year: 2151, name: "Early warp", interface: "NX instrumentation", weapon: "Phase pistol", color: "#79c9ec", damage: 22, capacity: 8, interval: .48 },
  { id: "constitution", year: 2245, name: "Constitution age", interface: "Duotronic command", weapon: "Type-II phaser", color: "#edba54", damage: 27, capacity: 10, interval: .4 },
  { id: "refit", year: 2285, name: "Refit age", interface: "Refit tactical", weapon: "Assault phaser", color: "#9ee5c7", damage: 32, capacity: 12, interval: .34 },
  { id: "nextgen", year: 2364, name: "Next generation", interface: "LCARS", weapon: "Type-II compression phaser", color: "#c5a8f0", damage: 38, capacity: 16, interval: .28 },
];
export function campaignYear(s) { return (s.startYear ?? 2151) + Math.floor((s.turn - 1) / 12); }
export function currentEra(s) { return ERAS.findLast(e => campaignYear(s) >= e.year) || ERAS[0]; }
export function awayEquipment(s) {
  const era = currentEra(s);
  const level = ERAS.filter(e => e.year <= era.year && (e.id === "frontier" || s.tech.includes("sidearm_" + e.id))).at(-1);
  return { ...level, damage: level.damage + (s.tech.includes("weapons") ? 5 : 0),
    protection: s.tech.includes("armor") ? .7 : 1, medkits: s.tech.includes("medicine") ? 2 : 1 };
}
export const FACTIONS = {
  earth: {
    name: "United Earth",
    title: "The Federation begins with you.",
    era: "2151 · THE FIRST FRONTIER",
    home: "Sol",
    adjective: "Earth",
    ship: "Enterprise",
    prefix: "UES",
    description:
      "Leave the familiar behind. Unite unlikely allies, or chart a more independent course.",
    bonus: "Diplomatic outreach costs 5 less influence.",
  },
  klingon: {
    name: "Klingon Houses",
    title: "An empire worth fighting for.",
    era: "2151 · THE DIVIDED HOUSES",
    home: "Qo’noS",
    adjective: "Klingon",
    ship: "Bortas",
    prefix: "IKS",
    description:
      "Bring rival houses together. Decide whether honor means conquest, loyalty, or restraint.",
    bonus: "Your ships deal 4 additional weapon damage.",
  },
  romulan: {
    name: "Romulan Star Empire",
    title: "A future beyond the shadows.",
    era: "2151 · THE HIDDEN FRONTIER",
    home: "Romulus",
    adjective: "Romulan",
    ship: "Talon",
    prefix: "IRW",
    description:
      "Guide an emerging power into the open, or build a network that no rival can see.",
    bonus: "Survey missions produce 8 additional research.",
  },
};
export const POWERS = {
  earth: {
    name: "United Earth",
    initial: 15,
    mark: "UE",
    color: "#8dc8e2",
    style: "Explorers",
  },
  vulcan: {
    name: "Vulcan High Command",
    initial: 35,
    mark: "VH",
    color: "#dda98b",
    style: "Logic & science",
  },
  andorian: {
    name: "Andorian Empire",
    initial: 5,
    mark: "AE",
    color: "#87bbec",
    style: "Vigilance & honor",
  },
  tellarite: {
    name: "Tellarite Concordium",
    initial: 10,
    mark: "TC",
    color: "#d6c383",
    style: "Industry & commerce",
  },
  klingon: {
    name: "Klingon Houses",
    initial: -10,
    mark: "KH",
    color: "#c98888",
    style: "Honor & ambition",
  },
  romulan: {
    name: "Romulan Star Empire",
    initial: -5,
    mark: "RS",
    color: "#9bbbad",
    style: "Secrecy & independence",
  },
};
export const TECH = {
  shields: {
    name: "Polarized defense grid",
    cost: 45,
    description: "+20 maximum shields for every vessel.",
  },
  weapons: {
    name: "Phase cannon arrays",
    cost: 55,
    description: "+8 weapon damage for every vessel.",
  },
  logistics: {
    name: "Deep-space logistics",
    cost: 40,
    description: "+8 energy and +4 alloys each month.",
  },
};
Object.assign(TECH, {
  sensors: { name: "Subspace tomography", cost: 65, source: "nebula", description: "+15 research on every future survey. Survey the Mutara Nebula to unlock." },
  warp: { name: "Variable warp geometry", cost: 90, source: "cygnus", description: "Reduce journeys by one month (minimum one). Survey the Cygnus Rift to unlock." },
  mining: { name: "Resonant extraction", cost: 70, source: "rigel", description: "+10 alloys each month. Survey the Rigel Belt to unlock." },
  ecology: { name: "Closed-cycle biospheres", cost: 65, source: "eden", description: "+12 energy and +4 research each month. Survey New Eden to unlock." },
  armor: { name: "Crystalline hull lattice", cost: 100, source: "relic", away: true, description: "+25 maximum hull on existing and future ships. Complete the relic away mission to unlock." },
  medicine: { name: "Adaptive field medicine", cost: 80, source: "haven", away: true, description: "+10 research for every later away-site interaction. Complete the Haven away mission to unlock." },
});
for (const era of ERAS.slice(1)) TECH["sidearm_" + era.id] = {
  name: era.weapon, year: era.year, cost: 60 + ERAS.indexOf(era) * 25,
  description: `Away-team sidearm: ${era.damage} base damage, ${era.capacity} shots per cell. Available from ${era.year}; issued on your next deployment.`,
};
const SECTORS = [
  {
    id: "sol",
    name: "Sol",
    x: 43,
    y: 64,
    type: "Home system",
    detail:
      "The place where your journey began. Shipyards and a population looking to the stars.",
    surveyed: true,
    threat: false,
  },
  {
    id: "vulcan",
    name: "Vulcan",
    x: 28,
    y: 38,
    type: "Diplomatic contact",
    detail:
      "An old civilization weighs the ambitions of its younger neighbors.",
    surveyed: true,
    threat: false,
  },
  {
    id: "andoria",
    name: "Andoria",
    x: 63,
    y: 26,
    type: "Diplomatic contact",
    detail:
      "Beyond an icy moon, watchful patrols guard a fiercely independent people.",
    surveyed: false,
    threat: false,
  },
  {
    id: "tellar",
    name: "Tellar Prime",
    x: 19,
    y: 74,
    type: "Trade opportunity",
    detail:
      "Bustling shipyards and formidable negotiators. A new trade route could begin here.",
    surveyed: false,
    threat: false,
  },
  {
    id: "eridani",
    name: "Epsilon Eridani",
    x: 65,
    y: 63,
    type: "Distress signal",
    detail:
      "An independent convoy is trapped by unidentified marauders. Your captains await orders.",
    surveyed: false,
    threat: true,
  },
  {
    id: "rim",
    name: "The Azure Reach",
    x: 82,
    y: 40,
    type: "Uncharted system",
    detail:
      "An unexplored stellar nursery rich in dilithium. Sensors detect no inhabited worlds.",
    surveyed: false,
    threat: false,
  },
];
// Coordinates are schematic, not a canon astronomical map.
SECTORS.push(
  { id: "qonos", name: "Qo’noS", x: 88, y: 78, type: "Warp signature", detail: "A busy warp corridor leads to an inhabited system.", power: "klingon" },
  { id: "romulus", name: "Romulus", x: 83, y: 13, type: "Warp signature", detail: "Coded transmissions emanate from this distant star.", power: "romulan" },
  { id: "nebula", name: "Mutara Nebula", x: 44, y: 16, type: "Ionized nebula", detail: "A research station lies inside a cloud that bends sensor beams.", tech: "sensors", site: "station" },
  { id: "cygnus", name: "Cygnus Rift", x: 12, y: 14, type: "Subspace anomaly", detail: "A derelict observatory records shifting subspace currents.", tech: "warp", site: "observatory" },
  { id: "rigel", name: "Rigel Belt", x: 13, y: 48, type: "Mineral frontier", detail: "Crystalline deposits surround an abandoned mining complex.", tech: "mining", site: "mine" },
  { id: "eden", name: "New Eden", x: 47, y: 86, type: "Living world", detail: "A field habitat studies a remarkable self-sustaining biosphere.", tech: "ecology", site: "garden" },
  { id: "relic", name: "Silent Archive", x: 66, y: 87, type: "Ancient ruins", detail: "An unclaimed installation preserves the work of a vanished culture.", tech: "armor", site: "archive" },
  { id: "haven", name: "Haven Outpost", x: 67, y: 45, type: "Medical beacon", detail: "An isolated clinic needs help restoring its treatment network.", tech: "medicine", site: "clinic" },
  { id: "pulsar", name: "Borealis Pulsar", x: 31, y: 9, type: "Stellar laboratory", detail: "A naturally repeating beacon offers a benchmark for navigation.", project: "research" },
  { id: "vega", name: "Vega Anchorage", x: 31, y: 85, type: "Independent port", detail: "A neutral dock offers contracts to visiting explorers.", project: "energy" },
  { id: "asterion", name: "Asterion Field", x: 91, y: 57, type: "Salvage field", detail: "Uncrewed industrial wrecks drift among metal-rich asteroids.", project: "alloys" },
  { id: "deneb", name: "Deneb Relay", x: 9, y: 88, type: "Listening station", detail: "Repairing a civilian relay could connect isolated communities.", project: "influence" },
);
for (const sector of SECTORS) {
  sector.surveyed = sector.id === "sol";
  sector.threat = sector.threat || false;
}
Object.assign(SECTORS.find(x => x.id === "vulcan"), { power: "vulcan" });
Object.assign(SECTORS.find(x => x.id === "andoria"), { power: "andorian" });
Object.assign(SECTORS.find(x => x.id === "tellar"), { power: "tellarite" });
const ship = (id, name, cls = "NX-class explorer") => ({
  id,
  name,
  cls,
  registry: id === "flagship" ? "NX-01" : id === "escort" ? "NV-01" : id,
  role: id === "flagship" ? "explorer" : "cruiser",
  fleetId: "expedition",
  power: "balanced",
  systems: { weapons: 100, shields: 100, engines: 100 },
  hull: 100,
  maxHull: 100,
  shields: 70,
  maxShields: 70,
  damage: 24,
});
export function createGame(faction = "earth", startYear = 2151) {
  if (!FACTIONS[faction]) faction = "earth";
  if (!ERAS.some(e => e.year === startYear)) startYear = 2151;
  const f = FACTIONS[faction];
  const sectors = structuredClone(SECTORS);
  sectors[0].name = f.home;
  const duplicate = sectors.find(x => x.power === faction);
  if (duplicate) Object.assign(duplicate, { name: "Sol", power: "earth" });
  return {
    version: SAVE_VERSION,
    startYear,
    contacts: ["vulcan"],
    discoveries: [],
    projects: [],
    away: null,
    awayHistory: {},
    monthlyEvent: null,
    eventHistory: [],
    taskForces: [
      {
        id: "expedition",
        name: "First Expedition",
        designation: "TF-01",
        location: "sol",
        assignment: null,
      },
    ],
    activeFleetId: "expedition",
    nextFleet: 2,
    tutorial: { active: false, completed: [] },
    missions: [],
    consequences: [],
    missionCounter: 0,

    faction,
    turn: 1,
    resources: { energy: 120, alloys: 90, research: 35, influence: 60 },
    relations: Object.fromEntries(
      Object.entries(POWERS)
        .filter(([id]) => id !== faction)
        .map(([id, p]) => [
          id,
          {
            score: p.initial,
            status: "neutral",
            trade: false,
            trust: 0,
            favors: 0,
            borders: false,
            proposal: null,
            lastEnvoy: 0,
            lastRequest: 0,
            grievances: [],
          },
        ]),
    ),
    fleet: [
      ship(
        "flagship",
        `${f.prefix} ${f.ship}`,
        faction === "earth" ? "NX-class explorer" : "Command cruiser",
      ),
      ship(
        "escort",
        `${f.prefix} ${faction === "earth" ? "Intrepid" : faction === "klingon" ? "Martok" : "Vigilant"}`,
        "Light cruiser",
      ),
    ],
    sectors,
    location: "sol",
    tech: ERAS.filter(e => e.id !== "frontier" && e.year <= startYear).map(e => "sidearm_" + e.id),
    buildings: { reactor: 0, foundry: 0 },
    ethics: { cooperation: 0, independence: 0, force: 0 },
    eventIndex: 0,
    eventResolved: false,
    eventChoices: [],
    battle: null,
    battleCount: 0,
    completed: false,
    charter: null,
    log: [
      {
        turn: 1,
        text: `${f.ship} is ready. A Vulcan delegation has arrived in your home system: first contact established. The future of ${f.name} is yours to write.`,
        type: "discovery",
      },
    ],
    seed: 416,
    eventSeed: 416,
    nextShip: 1,
  };
}
export function income(s) {
  const trades = Object.values(s.relations).filter(
    (r) => r.trade && r.status !== "war",
  ).length;
  return {
    energy:
      22 +
      s.buildings.reactor * 12 +
      trades * 5 +
      (s.tech.includes("logistics") ? 8 : 0) + (s.tech.includes("ecology") ? 12 : 0),
    alloys:
      12 + s.buildings.foundry * 8 + (s.tech.includes("logistics") ? 4 : 0) + (s.tech.includes("mining") ? 10 : 0),
    research:
      8 + (s.tech.includes("ecology") ? 4 : 0) +
      Object.values(s.relations).filter((r) => r.borders && r.status !== "war")
        .length *
        2,
    influence:
      7 +
      Object.values(s.relations).filter((r) => r.status === "allied").length *
        2,
  };
}
export function addLog(s, text, type = "report") {
  s.log.unshift({ turn: s.turn, text, type });
  s.log = s.log.slice(0, 60);
}
function pay(s, costs) {
  for (const [key, amount] of Object.entries(costs))
    if (s.resources[key] < amount)
      throw new Error(`You need ${amount} ${key}.`);
  for (const [key, amount] of Object.entries(costs)) s.resources[key] -= amount;
}
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function relationship(s, id, delta) {
  if (s.contacts.includes(id) && s.relations[id])
    s.relations[id].score = clamp(s.relations[id].score + delta, -100, 100);
}
function ethic(s, key) {
  s.ethics[key] += 1;
}
export function currentEvent(s) {
  const origin = FACTIONS[s.faction].name;
  const events = [
    {
      kicker: "FIRST CONTACT · A QUESTION OF TRUST",
      title: "The stars are not ours alone.",
      body: `A Vulcan delegation offers ${origin} access to its star charts, on one condition: every discovery must be shared. Some of your captains see friendship. Others see a leash. How will you answer?`,
      choices: [
        {
          label: "Build a shared future",
          description: "Share discoveries and welcome Vulcan scientists.",
          effect: "+15 Vulcan relations · +15 research",
          type: "cooperation",
          run(s) {
            relationship(s, "vulcan", 15);
            s.resources.research += 15;
          },
        },
        {
          label: "Partners, on our terms",
          description:
            "Exchange navigational data. Keep your mission independent.",
          effect: "+5 Vulcan relations · +15 influence",
          type: "independence",
          run(s) {
            relationship(s, "vulcan", 5);
            s.resources.influence += 15;
          },
        },
        {
          label: "We will find our own way",
          description:
            "Decline oversight and invest in your own survey program.",
          effect: "−10 Vulcan relations · +25 research",
          type: "force",
          run(s) {
            relationship(s, "vulcan", -10);
            s.resources.research += 25;
          },
        },
      ],
    },
    {
      kicker: "BORDER POLITICS · THE LISTENING POST",
      title: "A truth beneath the surface.",
      body: "Andorian scouts arrive in your home system and accuse a Vulcan monastery of concealing a surveillance array. Both sides want your support. Your science officer proposes an independent investigation.",
      choices: [
        {
          label: "Invite both sides to investigate",
          description: "Make the evidence public and offer to mediate.",
          effect: "+12 Andorian relations · +8 Vulcan relations",
          type: "cooperation",
          run(s) {
            relationship(s, "andorian", 12);
            relationship(s, "vulcan", 8);
          },
        },
        {
          label: "Stand with Andoria",
          description: "Share your sensor records directly with the scouts.",
          effect: "+25 Andorian relations · −15 Vulcan relations",
          type: "independence",
          run(s) {
            relationship(s, "andorian", 25);
            relationship(s, "vulcan", -15);
          },
        },
        {
          label: "Secure the site yourself",
          description: "Assert control until the dispute is settled.",
          effect: "+20 influence · −10 relations with both",
          type: "force",
          run(s) {
            s.resources.influence += 20;
            relationship(s, "andorian", -10);
            relationship(s, "vulcan", -10);
          },
        },
      ],
    },
    {
      kicker: "ECONOMIC POLICY · AN OPEN FRONTIER",
      title: "What is prosperity worth?",
      body: "Tellarite merchants visit your home system to propose a common shipping standard. It would open your markets, but local manufacturers want protection from off-world competition.",
      choices: [
        {
          label: "Open the trade lanes",
          description: "Accept common standards and negotiate access.",
          effect: "+15 Tellarite relations · +35 energy",
          type: "cooperation",
          run(s) {
            relationship(s, "tellarite", 15);
            s.resources.energy += 35;
          },
        },
        {
          label: "Invest in local industry",
          description: "Make self-sufficiency a national priority.",
          effect: "+35 alloys",
          type: "independence",
          run(s) {
            s.resources.alloys += 35;
          },
        },
        {
          label: "Impose a strategic tariff",
          description: "Use market access as a tool of state power.",
          effect: "+25 influence · −15 Tellarite relations",
          type: "force",
          run(s) {
            s.resources.influence += 25;
            relationship(s, "tellarite", -15);
          },
        },
      ],
    },
    {
      kicker: "FIRST CONTACT · BEYOND REPUTATION",
      title: "An unfamiliar hand extended.",
      body: "A Klingon captain and a Romulan observer arrive in your territory to meet your envoys. Your advisers disagree about their intentions. Neither power has to become your enemy.",
      choices: [
        {
          label: "Invite both delegations",
          description: "Give every civilization a seat at the table.",
          effect: "+18 Klingon and Romulan relations",
          type: "cooperation",
          run(s) {
            relationship(s, "klingon", 18);
            relationship(s, "romulan", 18);
          },
        },
        {
          label: "Arrange private meetings",
          description: "Learn from each without making commitments.",
          effect: "+10 Klingon and Romulan relations · +15 research",
          type: "independence",
          run(s) {
            relationship(s, "klingon", 10);
            relationship(s, "romulan", 10);
            s.resources.research += 15;
          },
        },
        {
          label: "Meet them with a fleet escort",
          description: "Make your strength part of the conversation.",
          effect: "+30 influence · −8 relations with both",
          type: "force",
          run(s) {
            s.resources.influence += 30;
            relationship(s, "klingon", -8);
            relationship(s, "romulan", -8);
          },
        },
      ],
    },
    {
      kicker: "SCIENCE COUNCIL · A SHARED DISCOVERY",
      title: "Knowledge changes everything.",
      body: "Your researchers have discovered a stable subspace relay. It could connect distant societies—or give your own captains a decisive operational advantage.",
      choices: [
        {
          label: "Publish the research",
          description: "Let every neighbor build on the discovery.",
          effect: "+8 relations with all powers · +20 influence",
          type: "cooperation",
          run(s) {
            Object.keys(s.relations).forEach((id) => relationship(s, id, 8));
            s.resources.influence += 20;
          },
        },
        {
          label: "Build a civilian network",
          description: "Connect colonies, merchants, and explorers.",
          effect: "+45 energy · +15 research",
          type: "independence",
          run(s) {
            s.resources.energy += 45;
            s.resources.research += 15;
          },
        },
        {
          label: "Reserve it for fleet command",
          description: "Keep the strategic advantage close.",
          effect: "+25 alloys · +25 research",
          type: "force",
          run(s) {
            s.resources.alloys += 25;
            s.resources.research += 25;
          },
        },
      ],
    },
    {
      kicker: "FOUNDING CONVENTION · YOUR DIVERGENCE",
      title: "What will we become?",
      body: "Your choices have brought you here. Draft a charter that reflects your ideals. Your current allies will be its founding partners; no particular species is required.",
      choices: [
        {
          label: "A union of equal worlds",
          description: "Build a voluntary federation with your allies.",
          effect: "Found a Federation · continue your campaign",
          type: "cooperation",
          run(s) {
            s.charter = "Federation of Allied Worlds";
          },
        },
        {
          label: "A league of sovereign powers",
          description: "Cooperate while preserving full independence.",
          effect: "Found a Sovereign League · continue your campaign",
          type: "independence",
          run(s) {
            s.charter = "League of Sovereign Worlds";
          },
        },
        {
          label: "A unified frontier authority",
          description: "Centralize command under your government.",
          effect: "Found a Frontier Authority · continue your campaign",
          type: "force",
          run(s) {
            s.charter = "United Frontier Authority";
          },
        },
      ],
    },
  ];
  return events[s.eventIndex] || null;
}
export function decision(s, index) {
  if (s.battle) throw new Error("Resolve the fleet engagement first.");
  if (s.eventResolved)
    throw new Error(
      "This decision has already been made. Advance the month to continue.",
    );
  const event = currentEvent(s),
    choice = event?.choices[index];
  if (!choice) throw new Error("No decision is available.");
  choice.run(s);
  tutorialMark(s, "decision");
  ethic(s, choice.type);
  s.eventResolved = true;
  s.eventChoices.push({
    title: event.title,
    choice: choice.label,
    type: choice.type,
  });
  addLog(s, `${event.title} ${choice.label}.`, "decision");
  if (s.charter) {
    s.completed = true;
    s.founders = Object.entries(s.relations)
      .filter(([, r]) => r.status === "allied")
      .map(([id]) => POWERS[id].name);
    addLog(
      s,
      `${s.charter} founded with ${s.founders.length} allied ${s.founders.length === 1 ? "power" : "powers"}. Your campaign continues.`,
      "milestone",
    );
  }
  return choice.effect;
}
export function advance(s) {
  if (s.away) throw new Error("Recall the away team before advancing time.");
  if (s.monthlyEvent) throw new Error("Resolve the monthly event before advancing time.");
  if (s.battle)
    throw new Error("Resolve the fleet engagement before advancing time.");
  if (currentEvent(s) && !s.eventResolved)
    throw new Error("Resolve the council decision before advancing the month.");
  const gain = income(s);
  Object.entries(gain).forEach(([k, v]) => (s.resources[k] += v));
  const previousEra = currentEra(s).id;
  s.turn++;
  if (currentEra(s).id !== previousEra) addLog(s, `${currentEra(s).name}: ${currentEra(s).interface} is online. New sidearm research is available.`, "discovery");
  processAssignments(s);
  processConsequences(s);
  processDiplomacy(s);
  tutorialMark(s, "month");
  if (s.eventResolved) {
    s.eventIndex++;
    s.eventResolved = false;
  }
  // These origin delegations make physical visits to the player's home system.
  for (const id of ({1: ["andorian"], 2: ["tellarite"], 3: ["klingon", "romulan"]}[s.eventIndex] || []))
    meetPower(s, id, "A delegation has arrived in your home system");
  rollMonthlyEvent(s);
  s.fleet.forEach((v) => (v.shields = v.maxShields));
  addLog(
    s,
    `Monthly production received. Long-range sensors await your next order.`,
  );
  return "A new month begins. Production received; fleet shields recharged.";
}
export function survey(s, id) {
  ensurePeacefulAction(s);
  const fleet = activeFleet(s);
  if (!fleetShips(s, fleet.id).length)
    throw new Error("Assign a vessel to this fleet first.");
  if (fleet.assignment || fleet.location !== id)
    throw new Error(
      "Dispatch this fleet to scout the system from the star chart first.",
    );
  const sector = s.sectors.find((x) => x.id === id);
  if (!sector || sector.surveyed)
    throw new Error("This system is unknown or already surveyed.");
  pay(s, { energy: 20 });
  return completeSurvey(s, sector, fleet);
}
export function diplomacy(s, id, action) {
  if (s.battle) throw new Error("Resolve the fleet engagement first.");
  const r = s.relations[id];
  if (!r || !s.contacts.includes(id)) throw new Error("First contact is required before diplomacy.");
  const name = POWERS[id].name;
  if (action === "envoy") {
    if (r.status === "war") throw new Error("Negotiate a ceasefire first.");
    if (r.lastEnvoy === s.turn)
      throw new Error("Your envoy has already visited this power this month.");
    pay(s, { influence: s.faction === "earth" ? 10 : 15 });
    r.lastEnvoy = s.turn;
    relationship(s, id, 15);
    r.trust = clamp(r.trust + 5, -100, 100);
    tutorialMark(s, "diplomacy");
  } else if (action === "trade") {
    if (r.status === "war" || r.score < 10 || r.trade)
      throw new Error(
        "Trade requires relations of +10, peace, and no existing trade agreement.",
      );
    pay(s, { energy: 25 });
    r.trade = true;
    relationship(s, id, 5);
  } else if (action === "alliance") {
    if (r.score < 35 || r.status !== "neutral")
      throw new Error("An alliance requires relations of +35 and peace.");
    pay(s, { influence: 25 });
    r.status = "allied";
    relationship(s, id, 10);
    ethic(s, "cooperation");
  } else if (action === "war") {
    if (r.status === "war") throw new Error("You are already at war.");
    const betrayed = r.status === "allied" || r.borders;
    r.borders = false;
    r.proposal = null;
    r.favors = 0;
    r.trust = clamp(r.trust - (betrayed ? 35 : 15), -100, 100);
    r.grievances.unshift(
      betrayed ? "Broke a treaty and declared war" : "Declared war",
    );
    for (const [other, contact] of Object.entries(s.relations))
      if (s.contacts.includes(other) && other !== id && contact.status !== "war") {
        relationship(s, other, betrayed ? -12 : -4);
        contact.trust = clamp(contact.trust - (betrayed ? 10 : 3), -100, 100);
      }
    r.status = "war";
    r.trade = false;
    r.score = -65;
    ethic(s, "force");
  } else if (action === "peace") {
    if (r.status !== "war") throw new Error("You are already at peace.");
    pay(s, { influence: 30 });
    r.status = "neutral";
    r.score = -15;
  } else if (action === "leave") {
    if (r.status !== "allied") throw new Error("No alliance to withdraw from.");
    r.status = "neutral";
    relationship(s, id, -15);
    ethic(s, "independence");
  } else throw new Error("Unknown diplomatic action.");
  const words = {
    envoy: "Diplomatic mission completed",
    trade: "Trade agreement signed",
    alliance: "Alliance formed",
    war: "War declared",
    peace: "Ceasefire negotiated",
    leave: "Alliance ended",
  };
  addLog(s, `${name}: ${words[action]}.`, "diplomacy");
  return `${words[action]} with ${name}.`;
}
export function develop(s, kind) {
  if (s.battle) throw new Error("Resolve the fleet engagement first.");
  if (kind === "reactor" || kind === "foundry") {
    pay(s, { alloys: 40, energy: 30 });
    s.buildings[kind]++;
    addLog(
      s,
      `${kind === "reactor" ? "Energy complex" : "Orbital foundry"} commissioned.`,
    );
    return "Construction complete. Production increases next month.";
  }
  const tech = TECH[kind];
  if (!tech || s.tech.includes(kind))
    throw new Error("This research is unavailable or already completed.");
  if (!techAvailable(s, kind)) throw new Error("Explore the discovery site to unlock this research.");
  pay(s, { research: tech.cost });
  s.tech.push(kind);
  if (kind === "shields")
    s.fleet.forEach((v) => {
      v.maxShields += 20;
      v.shields += 20;
    });
  if (kind === "armor") s.fleet.forEach(v => { v.maxHull += 25; v.hull += 25; });
  if (kind === "weapons") s.fleet.forEach((v) => (v.damage += 8));
  addLog(s, `${tech.name} research completed.`, "discovery");
  return `${tech.name} is now operational.`;
}
export function commission(s, role = "cruiser") {
  if (s.battle) throw new Error("Your fleet is in combat.");
  const group = activeFleet(s);
  if (group.assignment)
    throw new Error("A travelling fleet cannot commission vessels.");
  if (!Object.hasOwn(ROLES, role)) throw new Error("Unknown ship role.");
  if (s.fleet.length >= 12 || fleetShips(s, group.id).length >= 5)
    throw new Error("Fleet capacity reached: five vessels.");
  pay(s, ROLES[role].cost);
  const names = [
    "Columbia",
    "Challenger",
    "Discovery",
    "Endeavour",
    "Pathfinder",
  ];
  while (s.fleet.some((v) => v.id === `ship-${s.nextShip}`)) s.nextShip++;
  const v = ship(
    `ship-${s.nextShip}`,
    `${FACTIONS[s.faction].prefix} ${names[(s.nextShip++ - 1) % names.length]}`,
    "Light cruiser",
  );
  Object.assign(v, {
    role,
    fleetId: group.id,
    registry: `NV-${String(s.nextShip).padStart(3, "0")}`,
    cls: ROLES[role].name,
    hull: ROLES[role].hull,
    maxHull: ROLES[role].hull,
    shields: ROLES[role].shields,
    maxShields: ROLES[role].shields,
    damage: ROLES[role].damage,
  });
  while (
    s.fleet.some(
      (other) => other.registry.toUpperCase() === v.registry.toUpperCase(),
    )
  )
    v.registry += "A";
  if (s.tech.includes("shields")) {
    v.shields += 20;
    v.maxShields += 20;
  }
  if (s.tech.includes("weapons")) v.damage += 8;
  if (s.tech.includes("armor")) { v.hull += 25; v.maxHull += 25; }
  s.fleet.push(v);
  addLog(s, `${v.name} joins the fleet.`);
  return `${v.name} commissioned.`;
}
export function repairFleet(s) {
  if (s.battle) throw new Error("Use damage control during combat.");
  const group = activeFleet(s);
  if (group.assignment)
    throw new Error("Wait until this fleet completes its assignment.");
  const vessels = fleetShips(s, group.id);
  if (!vessels.length) throw new Error("Assign a ship to this fleet first.");
  if (vessels.every((v) => v.hull === v.maxHull && v.shields === v.maxShields))
    throw new Error("All vessels are already fully operational.");
  pay(s, { alloys: 20 });
  vessels.forEach((v) => {
    v.hull = v.maxHull;
    v.shields = v.maxShields;
  });
  return "All vessels repaired and shields recharged.";
}
export function startBattle(
  s,
  sectorId = "eridani",
  opponent = null,
  training = false,
) {
  if (s.away) throw new Error("Recall the away team before engaging.");
  if (s.battle) throw new Error("An engagement is already underway.");
  const sector = s.sectors.find((x) => x.id === sectorId);
  if (!sector) throw new Error("Unknown system.");
  if (!training && opponent && s.relations[opponent]?.status !== "war")
    throw new Error("This power is not at war with you.");
  if (!training && !opponent && !sector.threat)
    throw new Error("This system is secure.");
  const group = activeFleet(s);
  const vessels = fleetShips(s, group.id);
  if (!vessels.length)
    throw new Error("Assign a vessel to the active fleet first.");
  if (!training && (group.assignment || group.location !== sectorId))
    throw new Error(
      "Move your active fleet to this system and wait for arrival before engaging.",
    );
  const enemy = opponent ? POWERS[opponent].name : "Unidentified marauders";
  s.battleCount++;
  s.battle = {
    sectorId,
    opponent,
    training,
    enemy,
    round: 1,
    fleetId: group.id,
    subsystem: "hull",
    selected: vessels[0].id,
    target: "enemy-1",
    order: "balanced",
    result: null,
    friends: structuredClone(vessels),
    enemies: [
      {
        ...ship(
          "enemy-1",
          opponent ? `${POWERS[opponent].mark} Cruiser` : "Marauder One",
          "Raider cruiser",
        ),
        hull: 85,
        maxHull: 85,
        shields: 45,
        maxShields: 45,
        damage: 21,
      },
      {
        ...ship("enemy-2", "Escort Two", "Light raider"),
        hull: 65,
        maxHull: 65,
        shields: 30,
        maxShields: 30,
        damage: 16,
      },
    ],
    messages: [
      training
        ? "Tactical simulation initialized. Live fleet and resources are unaffected."
        : `Red alert. Hostile vessels detected near ${sector.name}.`,
    ],
  };
  if (!training && sector.prepared) {
    s.battle.friends.forEach((v) => {
      v.maxShields += 15;
      v.shields += 15;
    });
    sector.prepared = false;
  }
  return training
    ? "Tactical simulation ready."
    : "All hands, battle stations.";
}
function random(s) {
  s.seed = (s.seed * 1664525 + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function hit(v, amount) {
  const absorbed = Math.min(v.shields, amount);
  v.shields -= absorbed;
  v.hull = Math.max(0, v.hull - (amount - absorbed));
}
function conclude(s, result) {
  const b = s.battle;
  b.result = result;
  if (!b.training) {
    s.fleet = s.fleet.map((v) => {
      const survivor = b.friends.find((f) => f.id === v.id);
      return survivor
        ? {
            ...survivor,
            hull: Math.max(12, survivor.hull),
            maxShields: v.maxShields,
            shields: Math.min(v.maxShields, survivor.shields),
            systems: { weapons: 100, shields: 100, engines: 100 },
          }
        : v;
    });
    if (result === "victory" || result === "peace") {
      if (!b.opponent)
        s.sectors.find((x) => x.id === b.sectorId).threat = false;
      if (b.opponent && result === "peace") {
        s.relations[b.opponent].status = "neutral";
        s.relations[b.opponent].score = -15;
      }
      s.resources.alloys += result === "victory" ? 25 : 10;
      s.resources.influence += 15;
      if (!b.opponent) unlockMission(s, b.sectorId);
    }
    addLog(
      s,
      `${s.sectors.find((x) => x.id === b.sectorId).name}: ${result === "victory" ? "fleet victory" : result === "peace" ? "a ceasefire secured" : result === "retreat" ? "fleet withdrew" : "fleet disabled; emergency recovery completed"}.`,
      "combat",
    );
  }
  if (b.training) tutorialMark(s, "battle");
  b.messages.unshift(
    result === "victory"
      ? "Hostile vessels disabled. The field is yours."
      : result === "peace"
        ? "Ceasefire accepted. Weapons powered down."
        : result === "retreat"
          ? "Warp field established. Fleet has disengaged."
          : "All vessels disabled. Emergency recovery teams dispatched.",
  );
}

export const ROLES = {
  explorer: {
    name: "NX-class explorer",
    hull: 100,
    shields: 70,
    damage: 24,
    cost: { alloys: 65, energy: 40 },
    description:
      "Versatile flagship. Balanced weapons, defenses, and exploration.",
  },
  cruiser: {
    name: "Tactical cruiser",
    hull: 120,
    shields: 70,
    damage: 30,
    cost: { alloys: 75, energy: 45 },
    description: "Heavy hull and phase cannons. Holds the line in battle.",
  },
  science: {
    name: "Science vessel",
    hull: 85,
    shields: 80,
    damage: 16,
    cost: { alloys: 55, energy: 45 },
    description:
      "+12 survey research. Sensor scans expose enemy subsystems through shields.",
  },
  support: {
    name: "Support tender",
    hull: 110,
    shields: 80,
    damage: 14,
    cost: { alloys: 60, energy: 35 },
    description:
      "Repairs the most damaged allied hull by 8 each combat round. +10 energy on escort assignments.",
  },
};
export const ASSIGNMENTS = {
  move: {
    name: "Move fleet",
    cost: 10,
    description: "Travel to a system; remain available there.",
  },
  scout: {
    name: "Scout system",
    cost: 20,
    description:
      "Survey on arrival; earn research and alloys, uncover a mission.",
  },
  escort: {
    name: "Escort convoy",
    cost: 15,
    description:
      "Earn 35 energy on arrival (+10 with a support tender); a contacted Tellarite partner also grants one favor.",
  },
  patrol: {
    name: "Patrol system",
    cost: 15,
    description:
      "Earn 12 influence; lower threat and prepare defenses for an engagement.",
  },
};
export function activeFleet(s) {
  return s.taskForces.find((f) => f.id === s.activeFleetId);
}
export function fleetShips(s, id = s.activeFleetId) {
  return s.fleet.filter((v) => v.fleetId === id);
}
function ensurePeacefulAction(s) {
  if (s.battle) throw new Error("Resolve the fleet engagement first.");
}
function requireFleet(s, id) {
  const f = s.taskForces.find((f) => f.id === id);
  if (!f) throw new Error("Unknown fleet.");
  return f;
}
export function selectFleet(s, id) {
  requireFleet(s, id);
  s.activeFleetId = id;
  s.location = activeFleet(s).location;
}
function identity(value, label, max = 40) {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > max || /[\x00-\x1f<>]/.test(cleaned))
    throw new Error(
      `${label} must be 1–${max} characters without angle brackets or control characters.`,
    );
  return cleaned;
}
export function customizeShip(s, id, name, registry) {
  ensurePeacefulAction(s);
  const v = s.fleet.find((v) => v.id === id);
  if (!v) throw new Error("Unknown vessel.");
  name = identity(name, "Ship name");
  registry = identity(registry, "Registry", 20).toUpperCase();
  if (
    s.fleet.some(
      (other) => other.id !== id && other.registry.toUpperCase() === registry,
    )
  )
    throw new Error("Another vessel already uses that registry.");
  const old = v.name;
  Object.assign(v, { name, registry });
  addLog(s, `${old} now sails as ${name}, registry ${registry}.`);
  return "Ship identity updated.";
}
export function customizeFleet(s, id, name, designation) {
  ensurePeacefulAction(s);
  const f = requireFleet(s, id);
  name = identity(name, "Fleet name");
  designation = identity(designation, "Fleet designation", 20).toUpperCase();
  if (
    s.taskForces.some(
      (other) =>
        other.id !== id && other.designation.toUpperCase() === designation,
    )
  )
    throw new Error("Another fleet uses that designation.");
  Object.assign(f, { name, designation });
  addLog(s, `${name} registered as ${designation}.`);
  return "Fleet identity updated.";
}
export function createFleet(s, name, designation) {
  ensurePeacefulAction(s);
  if (s.taskForces.length >= 3)
    throw new Error("Command capacity reached: three independent fleets.");
  name = identity(name, "Fleet name");
  designation = identity(designation, "Fleet designation", 20).toUpperCase();
  if (s.taskForces.some((f) => f.designation.toUpperCase() === designation))
    throw new Error("Another fleet uses that designation.");
  while (s.taskForces.some((f) => f.id === `fleet-${s.nextFleet}`))
    s.nextFleet++;
  const id = `fleet-${s.nextFleet++}`;
  s.taskForces.push({
    id,
    name,
    designation,
    location: activeFleet(s).location,
    assignment: null,
  });
  addLog(
    s,
    `${name} established. Transfer vessels at the same system to begin operations.`,
  );
  return id;
}
export function transferShip(s, id, to) {
  ensurePeacefulAction(s);
  const v = s.fleet.find((v) => v.id === id),
    target = requireFleet(s, to);
  if (!v) throw new Error("Unknown vessel.");
  const source = requireFleet(s, v.fleetId);
  if (s.away?.fleetId === source.id) throw new Error("Recall this fleet’s away team before transferring vessels.");
  if (source.id === target.id)
    throw new Error("This vessel already belongs to that fleet.");
  if (
    source.assignment ||
    target.assignment ||
    source.location !== target.location
  )
    throw new Error("Both fleets must be idle at the same system.");
  if (fleetShips(s, to).length >= 5)
    throw new Error("Destination fleet capacity is five vessels.");
  v.fleetId = to;
  addLog(s, `${v.name} transferred to ${target.name}.`);
  return "Vessel transferred.";
}
export function travelTime(s, id, destination) {
  const f = requireFleet(s, id),
    a = s.sectors.find((x) => x.id === f.location),
    b = s.sectors.find((x) => x.id === destination);
  if (!b) throw new Error("Unknown system.");
  return Math.max(1, Math.ceil(Math.hypot(a.x - b.x, a.y - b.y) / 45) - (s.tech.includes("warp") ? 1 : 0));
}
export function assignFleet(s, id, destination, kind) {
  ensurePeacefulAction(s);
  const f = requireFleet(s, id),
    sector = s.sectors.find((x) => x.id === destination);
  if (!sector || !Object.hasOwn(ASSIGNMENTS, kind))
    throw new Error("Unknown assignment.");
  if (!fleetShips(s, id).length)
    throw new Error("Assign a vessel to this fleet first.");
  if (s.away?.fleetId === id) throw new Error("Recall this fleet’s away team before departure.");
  if (f.assignment) throw new Error("This fleet is already on assignment.");
  if (kind === "scout" && sector.surveyed)
    throw new Error("This system is already surveyed.");
  pay(s, { energy: ASSIGNMENTS[kind].cost });
  f.assignment = {
    kind,
    destination,
    remaining: travelTime(s, id, destination),
  };
  addLog(
    s,
    `${f.name}: ${ASSIGNMENTS[kind].name} at ${sectorLabel(s, sector)}; arrival in ${f.assignment.remaining} month(s).`,
    "mission",
  );
  return "Orders acknowledged. Advance the month to progress travel.";
}
function completeSurvey(s, sector, f) {
  if (sector.surveyed) return "Survey already completed by another fleet.";
  sector.surveyed = true;
  meetPower(s, sector.power, `Your fleet has reached ${sector.name}`);
  if (sector.tech && !TECH[sector.tech].away && !s.discoveries.includes(sector.tech)) {
    s.discoveries.push(sector.tech);
    addLog(s, `Discovery: ${TECH[sector.tech].name} can now be researched.`, "discovery");
  }
  const research =
    18 + (s.tech.includes("sensors") ? 15 : 0) +
    (s.faction === "romulan" ? 8 : 0) +
    (fleetShips(s, f.id).some((v) => v.role === "science") ? 12 : 0);
  s.resources.research += research;
  s.resources.alloys += 10;
  unlockMission(s, sector.id);
  tutorialMark(s, "survey");
  addLog(
    s,
    `${f.name} surveyed ${sector.name}: +${research} research, +10 alloys.`,
    "discovery",
  );
  return `Survey complete: +${research} research, +10 alloys.`;
}
function processAssignments(s) {
  for (const f of s.taskForces) {
    const a = f.assignment;
    if (!a || --a.remaining > 0) continue;
    f.location = a.destination;
    const sector = s.sectors.find((x) => x.id === a.destination);
    meetPower(s, sector.power, `Your fleet has reached ${sector.name}`);
    if (a.kind === "scout") completeSurvey(s, sector, f);
    if (a.kind === "escort") {
      const energy =
        35 + (fleetShips(s, f.id).some((v) => v.role === "support") ? 10 : 0);
      s.resources.energy += energy;
      if (s.contacts.includes("tellarite") && s.relations.tellarite?.status !== "war" && s.relations.tellarite) {
        s.relations.tellarite.favors++;
        relationship(s, "tellarite", 4);
      }
      addLog(
        s,
        `${f.name} escorted a convoy safely: +${energy} energy.`,
        "mission",
      );
    }
    if (a.kind === "patrol") {
      s.resources.influence += 12;
      sector.prepared = true;
      addLog(
        s,
        `${f.name} completed its patrol: +12 influence. Defensive intelligence gives +15 shields in the next live engagement here.`,
        "mission",
      );
    }
    addLog(s, `${f.name} arrived at ${sector.name}.`, "mission");
    f.assignment = null;
  }
  s.location = activeFleet(s).location;
}
export const MISSION_DEFS = {
  andoria: {
    title: "A distress call under the ice",
    body: "A stranded Andorian research crew is broadcasting beneath a collapsing ice shelf. Your captain can attempt a rescue or claim their abandoned survey archive.",
    choices: [
      {
        id: "rescue",
        label: "Bring everyone home",
        detail:
          "Spend 10 energy. In two months: +18 Andorian relations and a favor.",
        cost: { energy: 10 },
      },
      {
        id: "archive",
        label: "Recover the research archive",
        detail:
          "Gain 25 research now. In two months: Andoria learns the crew was abandoned.",
        cost: {},
      },
    ],
  },
  rim: {
    title: "The voice in the stellar nursery",
    body: "A repeating pattern in the nebula may be a new intelligence. Sharing your findings could begin a relationship; harvesting the region offers immediate profit.",
    choices: [
      {
        id: "contact",
        label: "Listen before we act",
        detail:
          "Spend 10 research. In two months: first-contact outcome reflects whether you shared discoveries with Vulcan.",
        cost: { research: 10 },
      },
      {
        id: "harvest",
        label: "Secure the dilithium",
        detail:
          "Gain 40 alloys now. In two months: neighbors respond to your extraction policy.",
        cost: {},
      },
    ],
  },
  tellar: {
    title: "A border is a promise",
    body: "Two trading delegations dispute passage through a newly mapped corridor. Their captains will remember who stood behind their agreements.",
    choices: [
      {
        id: "mediate",
        label: "Negotiate shared passage",
        detail:
          "Spend 10 influence. In two months: Tellarite trust improves; a border agreement yields an extra reward.",
        cost: { influence: 10 },
      },
      {
        id: "toll",
        label: "Establish a customs checkpoint",
        detail:
          "Gain 35 energy now. In two months: merchants demand restitution.",
        cost: {},
      },
    ],
  },
  eridani: {
    title: "After the convoy",
    body: "Refugees from the attacked convoy ask for help rebuilding a neutral waystation. You can invest in a haven or take the remaining salvage.",
    choices: [
      {
        id: "haven",
        label: "Build a place of refuge",
        detail:
          "Spend 15 alloys. In two months: +25 influence and improved trust among peaceful neighbors.",
        cost: { alloys: 15 },
      },
      {
        id: "salvage",
        label: "Reclaim the wreckage",
        detail:
          "Gain 25 alloys now. In two months: receive 10 energy, but lose diplomatic trust.",
        cost: {},
      },
    ],
  },
};
function unlockMission(s, sectorId) {
  if (
    !Object.hasOwn(MISSION_DEFS, sectorId) ||
    s.missions.some((m) => m.sectorId === sectorId)
  )
    return;
  s.missions.push({
    id: `mission-${++s.missionCounter}`,
    sectorId,
    status: "available",
    choice: null,
    due: null,
    outcome: null,
  });
  addLog(
    s,
    `${MISSION_DEFS[sectorId].title}: a new mission awaits in the mission journal.`,
    "mission",
  );
}
export function chooseMission(s, id, choiceId) {
  ensurePeacefulAction(s);
  const m = s.missions.find((x) => x.id === id);
  if (!m || m.status !== "available")
    throw new Error("This mission has already been decided or is unavailable.");
  const c = MISSION_DEFS[m.sectorId].choices.find((x) => x.id === choiceId);
  if (!c) throw new Error("Unknown mission choice.");
  pay(s, c.cost);
  if (choiceId === "archive") s.resources.research += 25;
  if (choiceId === "harvest") s.resources.alloys += 40;
  if (choiceId === "toll") s.resources.energy += 35;
  if (choiceId === "salvage") s.resources.alloys += 25;
  m.choice = choiceId;
  m.status = "pending";
  m.due = s.turn + 2;
  s.consequences.push({ missionId: id, due: m.due });
  addLog(
    s,
    `${MISSION_DEFS[m.sectorId].title}: ${c.label}. Follow-up expected in month ${m.due}.`,
    "decision",
  );
  return "Decision recorded. Its consequences will arrive in two months.";
}
function trustAll(s, delta) {
  for (const [id, r] of Object.entries(s.relations))
    if (s.contacts.includes(id) && r.status !== "war") r.trust = clamp(r.trust + delta, -100, 100);
}
function processConsequences(s) {
  for (const item of s.consequences.filter((c) => c.due <= s.turn)) {
    const m = s.missions.find((x) => x.id === item.missionId);
    if (!m || m.status !== "pending") continue;
    let outcome = "";
    if (m.choice === "rescue") {
      relationship(s, "andorian", 18);
      if (s.relations.andorian) s.relations.andorian.favors++;
      outcome =
        "The rescued crew advocates for you: +18 Andorian relations and one favor.";
    }
    if (m.choice === "archive") {
      relationship(s, "andorian", -20);
      if (s.relations.andorian) {
        s.relations.andorian.trust -= 10;
        s.relations.andorian.grievances.unshift("Abandoned the ice-shelf crew");
      }
      outcome =
        "Andoria learns why its crew never returned: −20 relations and −10 trust.";
    }
    if (m.choice === "contact") {
      const shared = s.eventChoices[0]?.type === "cooperation";
      s.resources.research += shared ? 45 : 25;
      s.resources.influence += 15;
      trustAll(s, shared ? 8 : 3);
      outcome = shared
        ? "Vulcan partners decode the signal with you: +45 research, +15 influence, +8 peaceful-neighbor trust."
        : "Your researchers establish contact independently: +25 research, +15 influence, +3 peaceful-neighbor trust.";
    }
    if (m.choice === "harvest") {
      trustAll(s, -8);
      outcome =
        "Extraction disrupted a living signal. Peaceful neighbors lose 8 trust in your judgment.";
    }
    if (m.choice === "mediate") {
      const r = s.relations.tellarite;
      relationship(s, "tellarite", 15);
      if (r) {
        r.trust = clamp(r.trust + 12, -100, 100);
        r.favors++;
      }
      const bonus = r?.borders ? 30 : 15;
      s.resources.energy += bonus;
      outcome = `The corridor opens peacefully: +15 Tellarite relations, +12 trust, a favor, and ${bonus} energy${r?.borders ? " thanks to your border agreement" : ""}.`;
    }
    if (m.choice === "toll") {
      relationship(s, "tellarite", -15);
      if (s.relations.tellarite) {
        s.relations.tellarite.trust -= 8;
        s.relations.tellarite.grievances.unshift(
          "Imposed unilateral corridor tolls",
        );
      }
      outcome =
        "Tellarite merchants protest your checkpoint: −15 relations and −8 trust.";
    }
    if (m.choice === "haven") {
      s.resources.influence += 25;
      trustAll(s, 8);
      outcome =
        "The waystation becomes a refuge: +25 influence and +8 peaceful-neighbor trust.";
    }
    if (m.choice === "salvage") {
      s.resources.energy += 10;
      trustAll(s, -4);
      outcome =
        "Salvage sells for 10 energy, but peaceful neighbors lose 4 trust.";
    }
    for (const r of Object.values(s.relations))
      r.trust = clamp(r.trust, -100, 100);
    m.status = "resolved";
    m.outcome = outcome;
    addLog(s, `${MISSION_DEFS[m.sectorId].title}: ${outcome}`, "consequence");
  }
  s.consequences = s.consequences.filter((c) => c.due > s.turn);
}
export function proposeTreaty(s, id, kind) {
  ensurePeacefulAction(s);
  const r = s.relations[id];
  if (!s.contacts.includes(id)) throw new Error("First contact is required before diplomacy.");
  if (!r || !["borders", "research"].includes(kind))
    throw new Error("Unknown diplomatic proposal.");
  if (r.status === "war") throw new Error("Negotiate peace first.");
  if (r.proposal) throw new Error("Answer the outstanding counteroffer first.");
  if (kind === "borders" && r.borders)
    throw new Error("A border agreement already exists.");
  const cost = kind === "borders" ? 20 : 30;
  if (r.score + r.trust >= 35) {
    pay(s, { influence: cost });
    applyTreaty(s, id, kind);
    return "Your proposal was accepted.";
  }
  r.proposal = { kind, influence: cost, energy: 25, expires: s.turn + 3 };
  addLog(
    s,
    `${POWERS[id].name} counteroffers: ${cost} influence and 25 energy for ${kind === "borders" ? "a border agreement" : "joint research"}.`,
    "diplomacy",
  );
  return "A counteroffer is available. Review its cost before accepting.";
}
function applyTreaty(s, id, kind) {
  const r = s.relations[id];
  if (kind === "borders") r.borders = true;
  else s.resources.research += 35;
  r.trust = clamp(r.trust + 10, -100, 100);
  relationship(s, id, 5);
  r.proposal = null;
  addLog(
    s,
    `${POWERS[id].name}: ${kind === "borders" ? "mutual border agreement signed" : "joint research completed (+35 research)"}.`,
    "diplomacy",
  );
}
export function answerProposal(s, id, accept) {
  ensurePeacefulAction(s);
  if (!s.contacts.includes(id)) throw new Error("First contact is required before diplomacy.");
  const r = s.relations[id],
    p = r?.proposal;
  if (!p) throw new Error("No outstanding proposal.");
  if (p.expires <= s.turn) throw new Error("This counteroffer has expired.");
  if (accept) {
    pay(s, { influence: p.influence, energy: p.energy });
    applyTreaty(s, id, p.kind);
    return "Counteroffer accepted.";
  }
  r.proposal = null;
  return "Counteroffer declined without penalty.";
}
export function requestFavor(s, id) {
  ensurePeacefulAction(s);
  if (!s.contacts.includes(id)) throw new Error("First contact is required before diplomacy.");
  const r = s.relations[id];
  if (!r || r.status === "war" || r.favors < 1)
    throw new Error("You need a favor with a power at peace.");
  r.favors--;
  s.resources.alloys += 20;
  addLog(s, `${POWERS[id].name} honors a favor: +20 alloys.`, "diplomacy");
  return "Your partner delivered 20 alloys.";
}
export function answerRequest(s, id, accept) {
  ensurePeacefulAction(s);
  if (!s.contacts.includes(id)) throw new Error("First contact is required before diplomacy.");
  const r = s.relations[id];
  if (!r?.request) throw new Error("No active request.");
  if (accept) {
    pay(s, { alloys: 15 });
    r.favors++;
    r.trust = clamp(r.trust + 10, -100, 100);
    relationship(s, id, 8);
    addLog(
      s,
      `${POWERS[id].name}: aid delivered; +8 relations, +10 trust, one favor.`,
      "diplomacy",
    );
  } else {
    relationship(s, id, -3);
    addLog(
      s,
      `${POWERS[id].name}: aid request declined (−3 relations).`,
      "diplomacy",
    );
  }
  r.request = null;
  return accept
    ? "Aid delivered. Your partner owes you a favor."
    : "Request declined.";
}
function processDiplomacy(s) {
  for (const [id, r] of Object.entries(s.relations)) {
    if (!s.contacts.includes(id)) continue;
    if (r.proposal && r.proposal.expires <= s.turn) {
      r.proposal = null;
      addLog(
        s,
        `${POWERS[id].name} withdrew an unanswered counteroffer.`,
        "diplomacy",
      );
    }
    if (r.request && r.request.expires <= s.turn) {
      r.request = null;
      relationship(s, id, -3);
      addLog(
        s,
        `${POWERS[id].name}: unanswered aid request expired (−3 relations).`,
        "diplomacy",
      );
    }
    if (r.status !== "war" && r.trust < -20 && r.status === "allied") {
      r.status = "neutral";
      addLog(
        s,
        `${POWERS[id].name} leaves your alliance after repeated breaches of trust.`,
        "diplomacy",
      );
    }
    if (r.status !== "war" && r.trade && r.trust < -30) {
      r.trade = false;
      addLog(
        s,
        `${POWERS[id].name} suspends trade after losing confidence in your government.`,
        "diplomacy",
      );
    }
    if (
      r.status !== "war" &&
      s.turn % 3 === 0 &&
      r.score >= 10 &&
      !r.request &&
      s.turn - r.lastRequest >= 3
    ) {
      r.request = { expires: s.turn + 2 };
      r.lastRequest = s.turn;
      addLog(
        s,
        `${POWERS[id].name} requests 15 alloys for relief supplies. A favor and improved trust are offered in return.`,
        "diplomacy",
      );
    }
    if (r.status === "war") {
      r.request = null;
      r.proposal = null;
    } else if (r.borders) r.trust = clamp(r.trust + 1, -100, 100);
    r.grievances = r.grievances.slice(0, 5);
  }
}
export const TUTORIAL_STEPS = [
  {
    id: "decision",
    view: "overview",
    title: "1. Choose your direction",
    text: "In “The council awaits”, read the situation and choose a response. The consequences are shown under each button. There is no required ideology.",
  },
  {
    id: "month",
    view: "overview",
    title: "2. Advance one month",
    text: "Click Next month after resolving the council decision. The top bar shows stored resources and what you earn each month. Energy funds travel; alloys build ships; research unlocks technology; influence supports diplomacy.",
  },
  {
    id: "survey",
    view: "galaxy",
    title: "3. Explore a nearby system",
    text: "Select the highlighted system (signal 04 until contacted), choose Scout system, and dispatch your fleet for 20 energy. Return to Command overview, resolve the council decision, then advance the month to arrive. A completed survey gives research, alloys, and a mission.",
  },
  {
    id: "diplomacy",
    view: "diplomacy",
    title: "4. Make a friend",
    text: "Send an envoy to any contacted power at peace. Envoys improve relations once per power each month. Read their trust, requests, and treaty terms before committing.",
  },
  {
    id: "battle",
    view: "tactical",
    title: "5. Take the bridge",
    text: "Begin a tactical simulation, select a friendly vessel and enemy target, then fire weapons. Try power settings and subsystem targeting. Finish by winning, hailing, or withdrawing; simulations never damage your campaign fleet.",
  },
];
export function tutorialMark(s, id) {
  if (!s.tutorial.completed.includes(id)) s.tutorial.completed.push(id);
}
export function tutorialStep(s) {
  return (
    TUTORIAL_STEPS.find((t) => !s.tutorial.completed.includes(t.id)) || null
  );
}
export function setTutorial(s, mode) {
  if (mode === "replay") {
    s.tutorial = { active: true, completed: [] };
    if (s.eventResolved || s.eventIndex > 0)
      s.tutorial.completed.push("decision");
    if (!s.sectors.some((x) => !x.surveyed))
      s.tutorial.completed.push("survey");
  } else {
    s.tutorial.active = mode === "start";
    if (mode === "start") {
      if (s.eventResolved || s.eventIndex >= 6) tutorialMark(s, "decision");
      if (s.sectors.every((x) => x.surveyed)) tutorialMark(s, "survey");
    }
  }
}
function operational(v) {
  return v.hull > 0 && v.systems.engines > 0;
}
export function setPower(s, id, power) {
  if (!s.battle || s.battle.result) throw new Error("No active battle.");
  if (!["balanced", "weapons", "shields", "engines"].includes(power))
    throw new Error("Unknown power allocation.");
  const v = s.battle.friends.find((x) => x.id === id);
  if (!v || !operational(v)) throw new Error("Select an operational vessel.");
  v.power = power;
}
export function combatAction(s, action) {
  const b = s.battle;
  if (!b || b.result) throw new Error("No active engagement.");
  const v = b.friends.find((v) => v.id === b.selected && operational(v));
  if (!v) throw new Error("Select an operational vessel.");
  let target =
    b.enemies.find((v) => v.id === b.target && operational(v)) ||
    b.enemies.find(operational);
  if (action === "retreat") {
    conclude(s, "retreat");
    return "Fleet withdrawn.";
  }
  if (action === "hail") {
    if (b.enemies.reduce((sum, v) => sum + v.hull, 0) <= 100 || b.round >= 4) {
      conclude(s, "peace");
      return "Ceasefire accepted.";
    }
    b.messages.unshift(
      "Hail rejected. Try from round 4, or when combined enemy hull is at most 100.",
    );
  } else if (action === "fire") {
    const damage = Math.max(
      1,
      Math.round(
        (v.damage +
          (s.faction === "klingon" ? 4 : 0) +
          (b.order === "focus" ? 9 : b.order === "evasive" ? -5 : 0) +
          (v.power === "weapons"
            ? 10
            : v.power === "shields"
              ? -6
              : v.power === "engines"
                ? -4
                : 0)) *
          (v.systems.weapons / 100),
      ),
    );
    const subsystem = b.subsystem;
    if (subsystem === "hull") hit(target, damage);
    else {
      const exposed = target.shields === 0 || target.scanned;
      hit(target, Math.round(damage * 0.6));
      if (exposed || subsystem === "shields") {
        target.systems[subsystem] = Math.max(0, target.systems[subsystem] - 35);
        if (subsystem === "shields")
          target.shields = Math.max(0, target.shields - 20);
        b.messages.unshift(
          `${target.name}: ${subsystem} integrity reduced to ${target.systems[subsystem]}%.`,
        );
      } else
        b.messages.unshift(
          "Shields protect the targeted subsystem. Scan with a science vessel or strip the shields first.",
        );
    }
    b.messages.unshift(
      `${v.name} fires on ${target.name} (${damage} weapon output; target: ${subsystem}).`,
    );
  } else if (action === "scan") {
    if (v.role !== "science")
      throw new Error(
        "Only a science vessel can expose subsystems through shields.",
      );
    target.scanned = true;
    b.messages.unshift(
      `${v.name} exposes ${target.name} subsystem signatures for the rest of the engagement.`,
    );
  } else if (action === "shields") {
    const amount = v.power === "shields" ? 50 : 35;
    v.shields = Math.min(v.maxShields, v.shields + amount);
    b.messages.unshift(`${v.name} reinforces shields by up to ${amount}.`);
  } else if (action === "repair") {
    const amount = v.role === "support" ? 40 : 25;
    v.hull = Math.min(v.maxHull, v.hull + amount);
    b.messages.unshift(`${v.name} restores up to ${amount} hull.`);
  } else throw new Error("Unknown command.");
  if (action !== "hail")
    for (const ally of b.friends.filter(
      (f) => operational(f) && f.id !== v.id,
    )) {
      target =
        b.enemies.find((e) => e.id === b.target && operational(e)) ||
        b.enemies.find(operational);
      if (!target) break;
      const damage = Math.max(
        1,
        Math.round(
          (ally.damage +
            (s.faction === "klingon" ? 4 : 0) +
            (ally.power === "weapons"
              ? 10
              : ally.power === "shields"
                ? -6
                : ally.power === "engines"
                  ? -4
                  : 0)) *
            (b.order === "focus" ? 0.75 : 0.5) *
            (ally.systems.weapons / 100),
        ),
      );
      hit(target, damage);
      b.messages.unshift(`${ally.name} provides covering fire (${damage}).`);
    }
  for (const tender of b.friends.filter(
    (f) => operational(f) && f.role === "support",
  )) {
    const wounded = b.friends
      .filter(operational)
      .sort((a, b) => a.hull / a.maxHull - b.hull / b.maxHull)[0];
    if (wounded && wounded.hull < wounded.maxHull) {
      wounded.hull = Math.min(wounded.maxHull, wounded.hull + 8);
      b.messages.unshift(
        `${tender.name} repairs ${wounded.name} (+8 hull, up to maximum).`,
      );
    }
  }
  if (b.enemies.every((v) => !operational(v))) {
    conclude(s, "victory");
    return "Engagement won.";
  }
  for (const enemy of b.enemies.filter(operational)) {
    const alive = b.friends.filter(operational);
    if (!alive.length) break;
    const victim = alive[Math.floor(random(s) * alive.length)];
    const damage = Math.max(
      1,
      Math.round(
        (enemy.damage +
          (b.order === "focus" ? 5 : b.order === "evasive" ? -8 : 0) -
          (victim.power === "engines" ? 8 : 0) +
          (victim.power === "weapons" ? 4 : 0)) *
          (enemy.systems.weapons / 100),
      ),
    );
    hit(victim, damage);
    b.messages.unshift(`${enemy.name} hits ${victim.name} for ${damage}.`);
    if (b.round % 3 === 0 && enemy.systems.shields > 0)
      enemy.shields = Math.min(
        enemy.maxShields,
        enemy.shields + Math.round((8 * enemy.systems.shields) / 100),
      );
  }
  b.round++;
  if (b.friends.every((v) => !operational(v))) conclude(s, "defeat");
  else if (!operational(v)) b.selected = b.friends.find(operational).id;
  const aliveTarget =
    b.enemies.find((v) => v.id === b.target && operational(v)) ||
    b.enemies.find(operational);
  if (aliveTarget) b.target = aliveTarget.id;
  b.messages = b.messages.slice(0, 30);
  return "Orders executed.";
}

function migrateV1(s) {
  const base = createGame(s.faction);
  for (const k of [
    "taskForces",
    "activeFleetId",
    "nextFleet",
    "tutorial",
    "missions",
    "consequences",
    "missionCounter",
  ])
    s[k] = structuredClone(base[k]);
  s.taskForces[0].location = s.location;
  const extend = (v, i) =>
    Object.assign(v, {
      registry:
        v.id === "flagship"
          ? "NX-01"
          : v.id === "escort"
            ? "NV-01"
            : `LEGACY-${i + 1}`,
      role: v.id === "flagship" ? "explorer" : "cruiser",
      fleetId: "expedition",
      power: "balanced",
      systems: { weapons: 100, shields: 100, engines: 100 },
    });
  s.fleet.forEach(extend);
  for (const r of Object.values(s.relations))
    Object.assign(r, {
      trust: 0,
      favors: 0,
      borders: false,
      proposal: null,
      lastEnvoy: 0,
      lastRequest: 0,
      grievances: [],
    });
  if (s.battle) {
    s.battle.fleetId = "expedition";
    s.battle.subsystem = "hull";
    s.battle.friends.forEach(extend);
    s.battle.enemies.forEach(extend);
  }
  s.version = 2;
  for (const sector of s.sectors)
    if (sector.surveyed) unlockMission(s, sector.id);
  return s;
}
export function exportSave(s) {
  return JSON.stringify(
    {
      format: "star-trek-divergence",
      gameVersion: GAME_VERSION,
      exportedAt: new Date().toISOString(),
      campaign: s,
    },
    null,
    2,
  );
}
export function restoreSave(raw) {
  try {
    if (typeof raw !== "string" || raw.length > 2_000_000) return null;
    let s = JSON.parse(raw);
    if (s?.format === "star-trek-divergence") s = s.campaign;
    const obj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
    const num = (v, min = 0, max = 1e9) =>
      Number.isFinite(v) && v >= min && v <= max;
    const int = (v, min = 0, max = 1e9) =>
      Number.isInteger(v) && num(v, min, max);
    const str = (v, max = 200) =>
      typeof v === "string" &&
      v.length > 0 &&
      v.length <= max &&
      !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v);
    const safeId = (v) =>
      typeof v === "string" && /^[a-zA-Z0-9_-]{1,40}$/.test(v);
    const arr = (v, max = 1000) => Array.isArray(v) && v.length <= max;
    const unique = (values) => new Set(values).size === values.length;
    if (
      !obj(s) ||
      ![1, 2, 3, SAVE_VERSION].includes(s.version) ||
      !Object.hasOwn(FACTIONS, s.faction) ||
      !int(s.turn, 1) ||
      !arr(s.fleet, 12) ||
      !s.fleet.length ||
      !obj(s.relations) ||
      !arr(s.sectors, SECTORS.length)
    )
      return null;
    if (s.version === 1) s = migrateV1(s);
    if (s.version === 2) s = migrateV2(s);
    if (s.version === 3) s = migrateV3(s);
    if (!validFrontierSave(s) || !validAwayCombat(s)) return null;
    const sectorIds = SECTORS.map((x) => x.id);
    if (
      s.sectors.length !== SECTORS.length ||
      !unique(s.sectors.map((x) => x.id)) ||
      !s.sectors.every(
        (x) =>
          obj(x) &&
          sectorIds.includes(x.id) &&
          str(x.name, 60) &&
          str(x.type) &&
          str(x.detail, 2000) &&
          num(x.x, 0, 100) &&
          num(x.y, 0, 100) &&
          typeof x.surveyed === "boolean" &&
          typeof x.threat === "boolean",
      )
    )
      return null;
    if (
      !obj(s.resources) ||
      !["energy", "alloys", "research", "influence"].every((k) =>
        int(s.resources[k]),
      )
    )
      return null;
    if (
      !arr(s.taskForces, 3) ||
      !s.taskForces.length ||
      !unique(s.taskForces.map((f) => f.id)) ||
      !unique(s.taskForces.map((f) => f.designation.toUpperCase()))
    )
      return null;
    for (const f of s.taskForces) {
      if (
        !obj(f) ||
        !safeId(f.id) ||
        !str(f.name, 40) ||
        !str(f.designation, 20) ||
        !sectorIds.includes(f.location)
      )
        return null;
      if (
        f.assignment !== null &&
        (!obj(f.assignment) ||
          !Object.hasOwn(ASSIGNMENTS, f.assignment.kind) ||
          !sectorIds.includes(f.assignment.destination) ||
          !int(f.assignment.remaining, 1, 10))
      )
        return null;
    }
    if (
      !s.taskForces.some((f) => f.id === s.activeFleetId) ||
      !sectorIds.includes(s.location) ||
      !int(s.nextFleet, 2)
    )
      return null;
    const validShip = (v) =>
      obj(v) &&
      safeId(v.id) &&
      str(v.name, 40) &&
      str(v.registry, 20) &&
      str(v.cls, 80) &&
      Object.hasOwn(ROLES, v.role) &&
      s.taskForces.some((f) => f.id === v.fleetId) &&
      ["balanced", "weapons", "shields", "engines"].includes(v.power) &&
      int(v.maxHull, 1, 1000) &&
      int(v.maxShields, 1, 1000) &&
      int(v.hull, 0, v.maxHull) &&
      int(v.shields, 0, v.maxShields) &&
      int(v.damage, 1, 1000) &&
      obj(v.systems) &&
      ["weapons", "shields", "engines"].every((k) => int(v.systems[k], 0, 100));
    if (
      !s.fleet.every(validShip) ||
      !unique(s.fleet.map((v) => v.id)) ||
      !unique(s.fleet.map((v) => v.registry.toUpperCase())) ||
      s.taskForces.some(
        (f) =>
          fleetShips(s, f.id).length > 5 ||
          (f.assignment && !fleetShips(s, f.id).length),
      )
    )
      return null;
    if (
      !int(s.nextShip, 1) ||
      !int(s.seed, 0, 0xffffffff) ||
      !int(s.battleCount)
    )
      return null;
    const contacts = Object.keys(POWERS).filter((k) => k !== s.faction);
    if (Object.keys(s.relations).length !== contacts.length) return null;
    for (const id of contacts) {
      const r = s.relations[id];
      if (
        !obj(r) ||
        !int(r.score, -100, 100) ||
        !["neutral", "allied", "war"].includes(r.status) ||
        typeof r.trade !== "boolean" ||
        !int(r.trust, -100, 100) ||
        !int(r.favors) ||
        typeof r.borders !== "boolean" ||
        !int(r.lastEnvoy, 0, s.turn) ||
        !int(r.lastRequest, 0, s.turn) ||
        !arr(r.grievances, 5) ||
        !r.grievances.every((g) => str(g, 200))
      )
        return null;
      if (
        r.proposal !== null &&
        (!obj(r.proposal) ||
          !["borders", "research"].includes(r.proposal.kind) ||
          !int(r.proposal.influence, 0, 1000) ||
          !int(r.proposal.energy, 0, 1000) ||
          !int(r.proposal.expires, 1))
      )
        return null;
      if (r.request != null && (!obj(r.request) || !int(r.request.expires, 1)))
        return null;
    }
    if (
      !arr(s.tech, Object.keys(TECH).length) ||
      !unique(s.tech) ||
      !s.tech.every((t) => Object.hasOwn(TECH, t)) ||
      !obj(s.buildings) ||
      !["reactor", "foundry"].every((k) => int(s.buildings[k]))
    )
      return null;
    if (
      !obj(s.ethics) ||
      !["cooperation", "independence", "force"].every((k) => int(s.ethics[k]))
    )
      return null;
    if (
      !int(s.eventIndex) ||
      typeof s.eventResolved !== "boolean" ||
      !arr(s.eventChoices, 6) ||
      !s.eventChoices.every(
        (c) =>
          obj(c) &&
          str(c.title, 200) &&
          str(c.choice, 200) &&
          ["cooperation", "independence", "force"].includes(c.type),
      ) ||
      (s.eventResolved && !s.eventChoices.length) ||
      typeof s.completed !== "boolean"
    )
      return null;
    if (s.charter !== null && !str(s.charter, 100)) return null;
    if (
      s.founders !== undefined &&
      (!arr(s.founders, 6) || !s.founders.every((f) => str(f, 80)))
    )
      return null;
    if (
      !arr(s.log, 60) ||
      !s.log.every(
        (l) => obj(l) && int(l.turn, 1) && str(l.text, 2000) && str(l.type, 30),
      )
    )
      return null;
    if (
      !obj(s.tutorial) ||
      typeof s.tutorial.active !== "boolean" ||
      !arr(s.tutorial.completed, 5) ||
      !unique(s.tutorial.completed) ||
      !s.tutorial.completed.every((id) =>
        TUTORIAL_STEPS.some((t) => t.id === id),
      )
    )
      return null;
    if (
      !int(s.missionCounter) ||
      !arr(s.missions, 4) ||
      !unique(s.missions.map((m) => m.id)) ||
      !unique(s.missions.map((m) => m.sectorId)) ||
      !arr(s.consequences, 4) ||
      !unique(s.consequences.map((c) => c.missionId))
    )
      return null;
    for (const m of s.missions) {
      if (
        !obj(m) ||
        !safeId(m.id) ||
        !Object.hasOwn(MISSION_DEFS, m.sectorId) ||
        !["available", "pending", "resolved"].includes(m.status)
      )
        return null;
      if (m.status === "available") {
        if (m.choice !== null || m.due !== null || m.outcome !== null)
          return null;
      } else if (
        !MISSION_DEFS[m.sectorId].choices.some((c) => c.id === m.choice) ||
        !int(m.due, 1)
      )
        return null;
      if (m.status === "resolved" && !str(m.outcome, 2000)) return null;
      if (
        m.status === "pending" &&
        !s.consequences.some((c) => c.missionId === m.id && c.due === m.due)
      )
        return null;
    }
    if (
      !s.consequences.every(
        (c) =>
          obj(c) &&
          int(c.due, 1) &&
          s.missions.some(
            (m) =>
              m.id === c.missionId && m.status === "pending" && m.due === c.due,
          ),
      )
    )
      return null;
    if (s.battle !== null) {
      const b = s.battle;
      if (
        !obj(b) ||
        !sectorIds.includes(b.sectorId) ||
        !s.taskForces.some((f) => f.id === b.fleetId) ||
        !int(b.round, 1) ||
        typeof b.training !== "boolean" ||
        !str(b.enemy, 100) ||
        !(b.opponent === null || contacts.includes(b.opponent)) ||
        !["balanced", "focus", "evasive"].includes(b.order) ||
        !["hull", "weapons", "shields", "engines"].includes(b.subsystem) ||
        ![null, "victory", "peace", "retreat", "defeat"].includes(b.result)
      )
        return null;
      if (
        !arr(b.friends, 5) ||
        !b.friends.length ||
        !b.friends.every(validShip) ||
        !unique(b.friends.map((v) => v.id)) ||
        !b.friends.every((v) =>
          s.fleet.some((f) => f.id === v.id && f.fleetId === b.fleetId),
        ) ||
        !arr(b.enemies, 5) ||
        !b.enemies.length ||
        !b.enemies.every(validShip) ||
        !unique(b.enemies.map((v) => v.id)) ||
        !b.friends.some((v) => v.id === b.selected) ||
        !b.enemies.some((v) => v.id === b.target) ||
        !arr(b.messages, 100) ||
        !b.messages.every((m) => str(m, 1000))
      )
        return null;
    }
    // Display-only map and opponent text come from trusted content, not imported markup.
    const canonical = createGame(s.faction).sectors;
    s.sectors = s.sectors.map((x) => ({
      ...canonical.find((c) => c.id === x.id),
      surveyed: x.surveyed,
      threat: x.threat,
      ...(typeof x.prepared === "boolean" ? { prepared: x.prepared } : {}),
    }));
    if (s.battle)
      s.battle.enemy = s.battle.opponent
        ? POWERS[s.battle.opponent].name
        : "Unidentified marauders";
    return s;
  } catch {
    return null;
  }
}

// Frontier content stays data-driven so it can become a future content pack.
export function meetPower(s, id, reason) {
  if (!id || id === s.faction || !Object.hasOwn(POWERS, id) || s.contacts.includes(id)) return false;
  s.contacts.push(id);
  addLog(s, `${reason}. First contact: ${POWERS[id].name}. Diplomatic channels are open.`, "discovery");
  return true;
}
export function sectorLabel(s, sector) {
  return sector.power && sector.power !== s.faction && !s.contacts.includes(sector.power)
    ? `Unknown signal ${String(s.sectors.indexOf(sector) + 1).padStart(2, "0")}` : sector.name;
}
export function techAvailable(s, id) {
  return Object.hasOwn(TECH, id) && (!TECH[id].source || s.discoveries.includes(id)) && (!TECH[id].year || campaignYear(s) >= TECH[id].year);
}
export function designStats(s, role) {
  const r = ROLES[role];
  return { hull: r.hull + (s.tech.includes("armor") ? 25 : 0),
    shields: r.shields + (s.tech.includes("shields") ? 20 : 0),
    damage: r.damage + (s.tech.includes("weapons") ? 8 : 0) + (s.faction === "klingon" ? 4 : 0) };
}
export function completeProject(s, id) {
  ensurePeacefulAction(s);
  const sector = s.sectors.find(x => x.id === id), f = activeFleet(s);
  if (!sector?.project || !sector.surveyed || f.location !== id || f.assignment || !fleetShips(s).length)
    throw new Error("Bring a fleet to this surveyed system first.");
  if (s.projects.includes(id)) throw new Error("This field project is already complete.");
  pay(s, { energy: 15 });
  s.resources[sector.project] += 40;
  s.projects.push(id);
  addLog(s, `${sector.name} field project completed: +40 ${sector.project}.`, "discovery");
  return `Field project completed: +40 ${sector.project}.`;
}
export const MONTHLY_EVENTS = {
  flare: { title: "A storm over the homeworld", body: "A solar flare threatens orbital power relays. Engineering requests a decision.", choices: [
    { label: "Reinforce the relays", effect: "15 alloys → 25 energy", cost: { alloys: 15 }, reward: { energy: 25 } },
    { label: "Conduct a controlled shutdown", effect: "Lose up to 10 energy; gain 8 research", loss: { energy: 10 }, reward: { research: 8 } },
  ] },
  breakthrough: { title: "An unexpected discovery", body: "A civilian laboratory offers a promising prototype. Sponsor trials or release its findings for public use.", choices: [
    { label: "Fund the trials", effect: "20 energy → 30 research", cost: { energy: 20 }, reward: { research: 30 } },
    { label: "Publish openly", effect: "+12 influence", reward: { influence: 12 } },
  ] },
  convoy: { title: "A convoy at the border", body: "Independent settlers request material assistance. The decision will become part of your government's record.", choices: [
    { label: "Supply the settlers", effect: "15 alloys → 20 influence", cost: { alloys: 15 }, reward: { influence: 20 } },
    { label: "Share navigational charts", effect: "+8 research", reward: { research: 8 } },
  ] },
  salvage: { title: "Debris in a shipping lane", body: "An uncrewed freighter has broken apart near home. Its cargo is recoverable, but mapping the hazard also has value.", choices: [
    { label: "Dispatch recovery drones", effect: "10 energy → 25 alloys", cost: { energy: 10 }, reward: { alloys: 25 } },
    { label: "Map a safe passage", effect: "+10 influence", reward: { influence: 10 } },
  ] },
  debate: { title: "The price of the frontier", body: "Your citizens debate the next exploration budget. Both a scientific and an industrial path have supporters.", choices: [
    { label: "Back the scientific program", effect: "+15 research", reward: { research: 15 } },
    { label: "Back orbital manufacturing", effect: "+15 alloys", reward: { alloys: 15 } },
  ] },
};
function eventRandom(s) {
  s.eventSeed = (s.eventSeed * 1664525 + 1013904223) >>> 0;
  return s.eventSeed / 4294967296;
}
function rollMonthlyEvent(s) {
  // Origin delegations visit during the opening chapter; later visitors are random.
  const unknown = Object.keys(s.relations).filter(id => !s.contacts.includes(id));
  if (s.eventIndex >= 6 && unknown.length && eventRandom(s) < 0.18)
    meetPower(s, unknown[Math.floor(eventRandom(s) * unknown.length)], "An exploratory vessel has entered your home system");
  if (eventRandom(s) < 0.35) {
    const ids = Object.keys(MONTHLY_EVENTS).filter(id => id !== s.eventHistory.at(-1)?.id);
    s.monthlyEvent = { id: ids[Math.floor(eventRandom(s) * ids.length)], turn: s.turn };
    addLog(s, `Priority transmission: ${MONTHLY_EVENTS[s.monthlyEvent.id].title}. Your decision is needed.`, "event");
  }
}
export function resolveMonthlyEvent(s, index) {
  ensurePeacefulAction(s);
  const event = s.monthlyEvent, choice = MONTHLY_EVENTS[event?.id]?.choices[index];
  if (!choice) throw new Error("No monthly event choice is available.");
  pay(s, choice.cost || {});
  for (const [key, amount] of Object.entries(choice.loss || {})) s.resources[key] = Math.max(0, s.resources[key] - amount);
  for (const [key, amount] of Object.entries(choice.reward || {})) s.resources[key] += amount;
  s.eventHistory.push({ id: event.id, turn: event.turn, choice: index });
  s.eventHistory = s.eventHistory.slice(-30);
  s.monthlyEvent = null;
  addLog(s, `${MONTHLY_EVENTS[event.id].title}: ${choice.label}. ${choice.effect}.`, "decision");
  return choice.effect;
}
export function advanceMonths(s, count) {
  if (![1, 3, 6, 12].includes(count)) throw new Error("Choose 1, 3, 6, or 12 months.");
  let elapsed = 0, reason = "Requested interval complete.";
  for (; elapsed < count;) {
    if (s.battle || s.away || s.monthlyEvent || (currentEvent(s) && !s.eventResolved)) {
      reason = s.away ? "Away team requires recall." : s.battle ? "Fleet engagement requires attention." : "A decision needs your attention.";
      break;
    }
    const contacts = s.contacts.length, travelling = s.taskForces.filter(f => f.assignment).map(f => f.id),
      pending = s.consequences.length, requests = Object.values(s.relations).filter(r => r.request).length;
    advance(s); elapsed++;
    if (s.monthlyEvent || (currentEvent(s) && !s.eventResolved)) reason = "A decision needs your attention.";
    else if (s.contacts.length > contacts) reason = "First contact established.";
    else if (travelling.some(id => !s.taskForces.find(f => f.id === id).assignment)) reason = "A fleet has arrived.";
    else if (s.consequences.length < pending) reason = "Mission results are ready.";
    else if (Object.values(s.relations).filter(r => r.request).length > requests) reason = "A diplomatic request needs your attention.";
    else continue;
    break;
  }
  return `${elapsed} of ${count} month(s) advanced. ${reason}`;
}

export const AWAY_LAYOUT = ["#########", "#.......#", "#..#.#..#", "#..#.#..#", "#.......#", "#..#.#..#", "#.......#", "#.......#", "#########"];
export const AWAY_SITES = {
  station: { title: "The stormbound station", color: "#829af1", intro: "You materialize inside a silent sensor station. Ion storms flash beyond its sealed windows.", objects: ["Sensor console", "A trapped researcher", "Subspace telescope"], scans: ["A power surge erased the calibration. The backup is intact.", "A researcher is alive inside a locked lab. A local override still responds.", "The telescope has recorded a new way of reading subspace echoes."] },
  observatory: { title: "At the edge of the rift", color: "#b8a2e8", intro: "The observatory hums around you. Light outside the viewports bends into impossible arcs.", objects: ["Navigation recorder", "Warp-field generator", "Chronometric archive"], scans: ["The recorder tracks stable paths between subspace currents.", "The generator can be safely deactivated for a detailed study.", "Two clocks disagree. The difference encodes a route through the rift."] },
  mine: { title: "Beneath the Rigel Belt", color: "#ffb77f", intro: "Your boots settle on a mining platform. Deep beneath it, luminous crystals pulse in the rock.", objects: ["Crystal seam", "Mining controller", "Geological core"], scans: ["The deposit responds to sound. Extraction could avoid explosive drilling.", "Autonomous cutters have stalled. Resetting them will recover samples.", "The core reveals a safer way to reinforce industrial tools."] },
  garden: { title: "The breathing habitat", color: "#9ad6b6", intro: "You enter a field habitat surrounded by living vines. The air is warm and unexpectedly clean.", objects: ["Bioluminescent grove", "Environmental console", "Seed repository"], scans: ["The grove filters toxins without consuming its host soil.", "Water and energy circulate in a closed ecological loop.", "The seed bank can provide a small sample without harming the habitat."] },
  archive: { title: "Voices of the silent archive", color: "#f39ac1", intro: "You step into a hall of angular stone. A lattice of crystalline light responds to your presence.", objects: ["Memory pillar", "Lattice forge", "Archive heart"], scans: ["The pillar describes a civilization that chose to leave its knowledge behind.", "The forge arranges crystals into a lightweight protective structure.", "The archive permits a non-destructive copy, or a physical extraction."] },
  clinic: { title: "A light at Haven", color: "#8dc8e2", intro: "You arrive in a damaged frontier clinic. Emergency lights guide you toward its treatment bays.", objects: ["Triage terminal", "Medical synthesizer", "Patient archive"], scans: ["The terminal identifies which treatment supplies are missing.", "A damaged regulator prevents the synthesis of essential medicine.", "Anonymized treatment records could improve future field medicine."] },
};
export const AWAY_OBJECT_POSITIONS = [{x:2,y:6}, {x:6,y:4}, {x:4,y:1}];
export function startAway(s, id) {
  ensurePeacefulAction(s);
  if (s.away) throw new Error("An away team is already deployed.");
  const sector = s.sectors.find(x => x.id === id), f = activeFleet(s);
  if (!sector?.site || !sector.surveyed || f.assignment || f.location !== id || !fleetShips(s).length)
    throw new Error("Survey the site and bring a fleet into orbit first.");
  if (s.awayHistory[id]?.length === 3) throw new Error("All objectives at this site are complete.");
  pay(s, { energy: 10 });
  s.away = { sectorId: id, fleetId: f.id, x: 4, y: 7, direction: 0, scanned: [], resolved: [...(s.awayHistory[id] || [])], message: AWAY_SITES[sector.site].intro };
  equipAway(s);
  return "Away team deployed. Review your briefing, then begin the live mission or use the step controls.";
}
export function awayNear(s) {
  if (!s.away) return [];
  return AWAY_OBJECT_POSITIONS.map((p, i) => ({ ...p, i })).filter(p => Math.abs(p.x-s.away.x)+Math.abs(p.y-s.away.y) <= 1);
}
export function awayAction(s, action, index) {
  const a = s.away;
  if (!a) throw new Error("No away team is deployed.");
  if (action === "recall") {
    s.awayHistory[a.sectorId] = [...a.resolved]; s.away = null;
    return "Away team safely recalled. Completed objectives are preserved.";
  }
  if (a.health <= 0) throw new Error("Team incapacitated. Recall for medical evacuation.");
  if (["scan", "study", "salvage"].includes(action) && a.enemies.some(e => e.hp > 0 && Math.hypot(e.x-a.px,e.y-a.py)<2 && awayLineOfSight(a.px,a.py,e.x,e.y))) throw new Error("Hostile nearby. Secure the area or negotiate first.");
  if (action === "left" || action === "right") a.direction = (a.direction + (action === "left" ? 3 : 1)) % 4;
  else if (action === "forward" || action === "back") {
    const [dx,dy] = [[0,-1],[1,0],[0,1],[-1,0]][a.direction], sign = action === "forward" ? 1 : -1,
      x = a.x+dx*sign, y = a.y+dy*sign;
    if (AWAY_LAYOUT[y]?.[x] !== ".") throw new Error("A bulkhead blocks the path. Turn to find another route.");
    a.x=x; a.y=y;
  } else if (action === "scan" || action === "study" || action === "salvage") {
    if (!Number.isInteger(index) || !awayNear(s).some(p => p.i === index)) throw new Error("Move next to the object to interact.");
    if (a.resolved.includes(index)) throw new Error("This objective is already complete.");
    const sector = s.sectors.find(x => x.id === a.sectorId), site = AWAY_SITES[sector.site];
    if (action === "scan") {
      if (!a.scanned.includes(index)) a.scanned.push(index);
      a.message = site.scans[index];
    } else {
      if (!a.scanned.includes(index)) throw new Error("Scan the object before deciding how to proceed.");
      const study = action === "study", bonus = s.tech.includes("medicine") ? 10 : 0;
      s.resources[study ? "research" : "alloys"] += study ? 18 : 15;
      s.resources.research += bonus;
      if (study) s.resources.influence += 5;
      a.resolved.push(index);
      s.awayHistory[a.sectorId] = [...a.resolved];
      a.message = study ? "You preserve the site and complete the work: +18 research, +5 influence." : "You recover usable material: +15 alloys. The site’s scientific value is lost.";
      if (bonus) a.message += " Field medicine adds +10 research.";
      addLog(s, `${sector.name} — ${site.objects[index]}: ${a.message}`, "mission");
      if (a.resolved.length === 3) {
        if (sector.tech && !s.discoveries.includes(sector.tech)) s.discoveries.push(sector.tech);
        a.message += " All objectives complete. Recall the team when ready.";
        addLog(s, `${sector.name} away mission completed. ${sector.tech ? TECH[sector.tech].name + " research unlocked." : ""}`, "discovery");
      }
    }
  } else throw new Error("Unknown away-team command.");
  if (["forward", "back", "left", "right"].includes(action)) {
    a.px=a.x+.5; a.py=a.y+.5; a.angle=a.direction*Math.PI/2-Math.PI/2;
  }
  return ["forward", "back", "left", "right"].includes(action) ? "" : a.message;
}
function migrateV2(s) {
  // Previously known powers remain known, including existing wars and treaties.
  s.contacts = Object.keys(s.relations);
  s.discoveries = []; s.projects = []; s.away = null; s.awayHistory = {};
  s.monthlyEvent = null; s.eventHistory = []; s.eventSeed = 416;
  const base = createGame(s.faction);
  const legacyIds = ["sol", "vulcan", "andoria", "tellar", "eridani", "rim"];
  if (s.sectors.length !== 6 || !s.sectors.every(x => legacyIds.includes(x.id)) || new Set(s.sectors.map(x=>x.id)).size !== 6)
    throw new Error("Invalid legacy star chart.");
  s.sectors.push(...base.sectors.filter(x => !legacyIds.includes(x.id)));
  s.version = 3;
  return s;
}
function validFrontierSave(s) {
  const unique = xs => Array.isArray(xs) && new Set(xs).size === xs.length;
  const ids = (xs, allowed) => unique(xs) && xs.every(x => allowed.includes(x));
  const uint = n => Number.isInteger(n) && n >= 0 && n <= 0xffffffff;
  if (!ids(s.contacts, Object.keys(s.relations)) || !ids(s.discoveries, Object.keys(TECH).filter(k => TECH[k].source)) ||
      !ids(s.projects, SECTORS.filter(x => x.project).map(x => x.id)) || !uint(s.eventSeed) ||
      !s.awayHistory || typeof s.awayHistory !== "object" || Array.isArray(s.awayHistory) ||
      !Array.isArray(s.eventHistory) || s.eventHistory.length > 30) return false;
  const eventValid = e => e && Object.hasOwn(MONTHLY_EVENTS,e.id) && Number.isInteger(e.turn) && e.turn >= 1 && e.turn <= s.turn;
  if (s.monthlyEvent !== null && !eventValid(s.monthlyEvent)) return false;
  if (!s.eventHistory.every(e => eventValid(e) && [0,1].includes(e.choice))) return false;
  for (const [id, objectives] of Object.entries(s.awayHistory))
    if (!SECTORS.some(x => x.id === id && x.site) || !ids(objectives, [0,1,2])) return false;
  if (s.away !== null) {
    const a = s.away, sector = s.sectors.find(x => x.id === a?.sectorId), f = s.taskForces?.find(x => x.id === a?.fleetId);
    if (!a || !SECTORS.some(x => x.id === a.sectorId && x.site) || !sector?.surveyed || !f || f.location !== a.sectorId || f.assignment || s.battle ||
        !s.fleet.some(v => v.fleetId === f.id) || !Number.isInteger(a.x) || !Number.isInteger(a.y) || AWAY_LAYOUT[a.y]?.[a.x] !== "." ||
        ![0,1,2,3].includes(a.direction) || !ids(a.scanned,[0,1,2]) || !ids(a.resolved,[0,1,2]) ||
        JSON.stringify(a.resolved) !== JSON.stringify(s.awayHistory[a.sectorId] || []) || typeof a.message !== "string" || a.message.length > 1500) return false;
  }
  return true;
}

export function awayLineOfSight(x, y, tx, ty) {
  const distance = Math.hypot(tx-x,ty-y), steps = Math.ceil(distance/.04);
  for (let i=0; i<=steps; i++) {
    const t=steps ? i/steps : 0;
    if (AWAY_LAYOUT[Math.floor(y+(ty-y)*t)]?.[Math.floor(x+(tx-x)*t)] !== ".") return false;
  }
  return true;
}
function equipAway(s, legacy = false) {
  const a=s.away, site=s.sectors.find(x=>x.id===a.sectorId).site, gear=awayEquipment(s);
  // Existing deployments migrate peacefully; new deployments carry a threat briefing.
  const types=legacy || ["clinic","garden"].includes(site) ? [] : site==="mine" ? ["raider","drone"] : ["drone","drone"];
  Object.assign(a, { px:a.x+.5, py:a.y+.5, angle:a.direction*Math.PI/2-Math.PI/2,
    health:100, charge:gear.capacity, weapon:gear.id, mode:"stun", cooldown:0, reload:0,
    medkits:gear.medkits, flash:0, hurt:0, elapsed:0, diplomacy:false,
    enemies:types.map((kind,i)=>({id:`guard-${i}`,kind,x:i?6.5:2.5,y:i?2.5:4.5,hp:kind==="drone"?66:55,cooldown:2.5,alert:false})),
  });
}
function migrateV3(s) {
  s.startYear=2151;
  if(s.away) equipAway(s,true);
  s.version=SAVE_VERSION;
  return s;
}
export function deployedEquipment(s) {
  const base=ERAS.find(e=>e.id===s.away?.weapon) || awayEquipment(s);
  return {...base, damage:base.damage+(s.tech.includes("weapons")?5:0)};
}
function awayWalkable(x,y) {
  return [-.18,.18].every(dx=>[-.18,.18].every(dy=>AWAY_LAYOUT[Math.floor(y+dy)]?.[Math.floor(x+dx)]==="."));
}
export function awayLook(s, delta) {
  if(!s.away || !Number.isFinite(delta)) return;
  s.away.angle = Math.atan2(Math.sin(s.away.angle+delta),Math.cos(s.away.angle+delta));
  s.away.direction=((Math.round((s.away.angle+Math.PI/2)/(Math.PI/2))%4)+4)%4;
}
export function awayTick(s, input={}, seconds=.05) {
  const a=s.away;
  if (!a || a.health<=0 || !Number.isFinite(seconds) || seconds<=0) return;
  const dt=Math.min(.1,seconds), gear=deployedEquipment(s);
  a.elapsed+=dt;
  for(const key of ["cooldown","flash","hurt"]) a[key]=Math.max(0,a[key]-dt);
  if(a.reload>0) {a.reload=Math.max(0,a.reload-dt); if(a.reload===0) a.charge=gear.capacity;}
  awayLook(s, Math.max(-1,Math.min(1,Number(input.turn)||0))*dt*1.9);
  let forward=Math.max(-1,Math.min(1,Number(input.forward)||0)), strafe=Math.max(-1,Math.min(1,Number(input.strafe)||0));
  const norm=Math.max(1,Math.hypot(forward,strafe)); forward/=norm;strafe/=norm;
  const dx=(Math.cos(a.angle)*forward-Math.sin(a.angle)*strafe)*dt*1.9,
    dy=(Math.sin(a.angle)*forward+Math.cos(a.angle)*strafe)*dt*1.9;
  if(awayWalkable(a.px+dx,a.py)) a.px+=dx;
  if(awayWalkable(a.px,a.py+dy)) a.py+=dy;
  a.x=Math.floor(a.px);a.y=Math.floor(a.py);
  for(const e of a.enemies) {
    if(e.hp<=0) continue;
    e.cooldown=Math.max(0,e.cooldown-dt);
    const d=Math.hypot(e.x-a.px,e.y-a.py), visible=awayLineOfSight(e.x,e.y,a.px,a.py);
    if(d<5 && visible) e.alert=true;
    if(!e.alert || !visible) continue;
    if(d>2) {
      const step=dt*(e.kind==="drone"?.38:.52), ex=(a.px-e.x)/d*step,ey=(a.py-e.y)/d*step;
      if(awayWalkable(e.x+ex,e.y)) e.x+=ex;
      if(awayWalkable(e.x,e.y+ey)) e.y+=ey;
    }
    if(d<5 && e.cooldown===0) {
      a.health=Math.max(0,a.health-(e.kind==="drone"?9:12)*(s.tech.includes("armor")?.7:1));
      a.hurt=.25;e.cooldown=2;
      a.message=a.health>0?"Incoming fire. Break line of sight, return fire, or broadcast a ceasefire.":"Team incapacitated. Emergency transporter lock ready: recall to evacuate. Completed objectives are safe.";
    }
  }
  if(input.fire && a.health>0) awayCombat(s,"fire");
}
export function awayCombat(s, action) {
  const a=s.away;
  if(!a) throw new Error("No away team is deployed.");
  if(a.health<=0) throw new Error("Team incapacitated. Recall for medical evacuation.");
  const gear=deployedEquipment(s);
  if(action==="mode") {a.mode=a.mode==="stun"?"overload":"stun"; a.message=a.mode==="stun"?"Stun selected. Nonlethal restraint.":"High power selected. More damage; twice the cell consumption. Forceful takedowns affect your campaign ethics.";}
  else if(action==="reload") {
    if(a.reload || a.charge===gear.capacity) return "";
    a.reload=1.5; a.message="Cycling a fresh energy cell…";
  } else if(action==="medkit") {
    if(!a.medkits) throw new Error("No field medical kits remain. Recall for treatment.");
    if(a.health>=100) throw new Error("The team is already at full health.");
    a.medkits--; a.health=Math.min(100,a.health+45);a.message="Field treatment restores 45 health.";
  } else if(action==="hail") {
    if(a.diplomacy) throw new Error("The ceasefire broadcast has already been accepted.");
    a.diplomacy=true; a.enemies.forEach(e=>{e.hp=0;});
    a.message="Your team transmits a stand-down protocol and offers safe passage. Raiders withdraw; autonomous security accepts the override. The site is secure.";
    addLog(s,`${s.sectors.find(x=>x.id===a.sectorId).name}: away team secured the site without further fighting.`,"mission");
  } else if(action==="fire") {
    if(a.cooldown || a.reload) return "";
    const cost=a.mode==="stun"?1:2;
    if(a.charge<cost) {a.message="Energy cell depleted. Press R or cycle the cell.";return a.message;}
    a.charge-=cost;a.cooldown=gear.interval;a.flash=.13;
    const targets=a.enemies.filter(e=>e.hp>0).map(e=>({e,d:Math.hypot(e.x-a.px,e.y-a.py),
      angle:Math.atan2(Math.sin(Math.atan2(e.y-a.py,e.x-a.px)-a.angle),Math.cos(Math.atan2(e.y-a.py,e.x-a.px)-a.angle))}))
      .filter(t=>Math.abs(t.angle)<Math.atan2(.27,t.d) && t.d<8 && awayLineOfSight(a.px,a.py,t.e.x,t.e.y)).sort((l,r)=>l.d-r.d);
    const target=targets[0]?.e;
    if(target) {
      target.hp=Math.max(0,target.hp-gear.damage*(a.mode==="overload"?1.7:1));target.alert=true;
      a.message=target.hp>0?"Phaser hit. Target still active.":a.mode==="stun"?"Target stunned. Area scan updated.":"Target neutralized by high-power fire.";
      if(target.hp===0 && a.mode==="overload") s.ethics.force++;
    } else a.message="Phaser discharge. No target hit.";
  } else throw new Error("Unknown away combat command.");
  return a.message;
}
function validAwayCombat(s) {
  const n=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
  if(!ERAS.some(e=>e.year===s.startYear)) return false;
  if(s.tech.some(id=>TECH[id]?.year>campaignYear(s))) return false;
  const a=s.away;if(!a) return true;
  const gear=ERAS.find(e=>e.id===a.weapon);
  if(!gear || gear.year>campaignYear(s) || (gear.id!=="frontier"&&!s.tech.includes("sidearm_"+gear.id)) ||
    !n(a.px,1,8)||!n(a.py,1,8)||Math.floor(a.px)!==a.x||Math.floor(a.py)!==a.y||
    !n(a.angle,-Math.PI,Math.PI)||!n(a.health,0,100)||!Number.isInteger(a.charge)||!n(a.charge,0,gear.capacity)||
    !["stun","overload"].includes(a.mode)||!n(a.cooldown,0,1)||!n(a.reload,0,1.5)||!n(a.flash,0,.2)||!n(a.hurt,0,.3)||
    !Number.isInteger(a.medkits)||!n(a.medkits,0,2)||!n(a.elapsed,0,1e9)||typeof a.diplomacy!=="boolean"||
    !Array.isArray(a.enemies)||a.enemies.length>2||new Set(a.enemies.map(e=>e.id)).size!==a.enemies.length) return false;
  return a.enemies.every(e=>e&&/^guard-[01]$/.test(e.id)&&["drone","raider"].includes(e.kind)&&n(e.x,1,8)&&n(e.y,1,8)&&
    AWAY_LAYOUT[Math.floor(e.y)]?.[Math.floor(e.x)]==="."&&n(e.hp,0,e.kind==="drone"?66:55)&&n(e.cooldown,0,2.5)&&typeof e.alert==="boolean");
}
