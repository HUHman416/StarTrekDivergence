# Project memory: Star Trek: Divergence

Last updated: 2026-10-06

This file is the durable project memory for future sessions working in this repository. Read it before deciding project scope or architecture. Record new user ideas here as they arrive, preserving their intent and distinguishing requirements, tentative ideas, and implemented behavior. This is repository memory, not a promise of account-wide memory outside this project.

## User's vision and requirements

- Title: **Star Trek: Divergence**.
- A text-based strategy game with buttons and visual feedback.
- Players choose a Star Trek faction, manage resources, and play through that faction's origins.
- Players determine **how, why, and in what direction** their civilization develops. History is a starting point, not a prescribed outcome.
- Relationships are player-driven: choose allies, enemies, and independent paths. No fixed canon enemies or mandatory alliances.
- Include a fleet battle simulator where players can take control of any of their vessels and issue fleet commands.
- Use the bridge-command feel of the classic **Star Trek: 25th Anniversary** as a possible reference; make the experience modern and fun. Exact combat pacing and presentation remain open to iteration.
- **Federation first**: the user selected exploration and founding alliances as the first origin campaign to develop.
- Produce **native Linux and Windows builds** once the desired look and gameplay are established. Native platform deliverables are intended; the packaging technology has not been decided or approved.
- Keep **mod support** in mind during architecture work. Add an **intuitive built-in mod manager later, after the base game is good enough to release**.
- Keep this project scope and future user ideas in durable memory.
- Publish versioned releases on GitHub, following the existing release wording and retaining historical tags.
- Make the repository's existing `README.md` visually polished and say prominently at its very top: **Made entirely with ChatGPT, with concepts and ideas by HUHman.** The user explicitly requested the GitHub README, not a separate README file.
- Add **ship and fleet customization**, including editable names and registry numbers. Exact fleet identifier terminology and additional customization remain to be designed.
- Add a **simple, easy-to-understand tutorial**.

## Current implementation direction (assistant proposals)

- Build a browser-playable prototype to iterate quickly before choosing desktop packaging technology.
- Start the Federation origin with United Earth in 2151, before the Federation's founding. Dates advance by month; this compressed early chapter is an alternate-history prototype, not a full canon chronology.
- Separate the simulation rules from presentation so the same rules can serve browser, desktop, tests, and eventually modded content.
- Begin with turn-based fleet combat: select a vessel and target, choose fleet posture, then use weapons, reinforce shields, repair, hail, or withdraw. Real-time combat is not ruled out.
- Offer Klingon and Romulan faction starts as early mechanical variants. Their dedicated origin stories remain future work; shared events must not be represented as finished faction campaigns.
- Use local browser saves for the prototype. JSON export/import and v0.1 migrations are implemented in v0.2. Native storage and mod-aware save compatibility remain future design work.

## Scope sequence

1. **Playable foundation:** Federation-focused decisions; resources and monthly production; exploration; open diplomacy; fleet construction; research; tactical combat; clear interface; local saves.
2. **Find the game:** playtest resource balance, choices and consequences, combat pacing, readability, accessibility, and the origin campaign's depth. Expand the simulation based on feedback.
3. **Release-quality base game:** deeper faction-specific campaigns and AI, meaningful strategic consequences, broader event content, robust saves and testing, polished interactions, accessibility and platform validation. Exact release content is not yet fixed.
4. **Linux and Windows:** select and validate a desktop runtime, native storage, offline operation, packaging, and installers once gameplay and presentation are established. No desktop build currently exists.
5. **Mod support and manager:** deliver after the base game is release-ready. Architecture should avoid making this prohibitively difficult earlier.

## Next iteration discussion (2026-10-06)

The user reported a successful initial playtest and then explicitly approved **all** proposed next-iteration features, including customization, the tutorial, portable saves, branching missions, multiple fleets, expanded diplomacy, bridge controls, and ship roles. They also authorized publishing a GitHub release following the existing tag/title convention.

Approved immediate milestone:

1. **Fleet identity:** editable ship names and registries, an editable fleet name/designation, and identity shown consistently in fleet cards, tactical controls, and saves. Preserve stable internal IDs when displayed names change. Additional cosmetic options can follow feedback.
2. **Learn by playing:** a short optional tutorial using a survey, one diplomatic interaction, one monthly resource cycle, and a safe tactical exercise. Explain each action where it appears; support skipping, replaying, and contextual help.
3. **Save export/import:** let the player retain and transfer a campaign between downloaded prototype versions. Preserve existing saves through schema migrations as customization and tutorial state are added.

Approved following features (included in v0.2):

- Branching exploration missions with delayed, visible consequences: rescue, first contact, anomalies, and diplomatic disputes. Use earlier choices to change later events.
- Multiple independent fleets with assignments, travel time, scouting, escorts, and patrols to make the map strategically meaningful.
- Deeper diplomacy: proposals and counteroffers, favors, border agreements, and partners responding to the player's behavior instead of only a relation score.
- More expressive bridge combat: weapon/shield/engine power allocation, subsystem targeting, and distinct vessel roles, preserving surrender and negotiated outcomes.

Native Linux/Windows builds and the later mod manager remain deferred according to the earlier scope sequence. The all-features approval covered the proposed gameplay iteration, not those deferred platform milestones.

## Modding considerations (proposals, not final requirements)

- Prefer stable IDs for factions, vessels, technologies, resources, events, and localization keys.
- Extract campaign content into versioned, validated data packs as the content model stabilizes; current event effects are still implemented in JavaScript.
- Design a clear boundary between trusted game rules and mod content. Decide separately whether executable scripting is needed.
- Plan manifests with mod identity, version, compatible game versions, dependencies, and conflicts.
- Potential manager features: discover/import locally, inspect details, enable/disable, control load order, explain conflicts, and show compatibility before loading a save.
- Consider mod profiles, rollback, missing-mod handling, and saves that record their active mod set.
- Workshop/store integration, distribution channels, scripting APIs, and multiplayer are **not decided**.

## v0.2 implementation and published release

- Editable ship names/unique registries and fleet names/unique designations, with stable internal identities.
- Optional five-step tutorial with contextual instructions, skip/replay controls, and recorded progress.
- JSON save export/import, import preview, strict validation, and v0.1 migration. Browser storage stays under the existing key; new saves use schema version 2.
- Up to three independent fleets and twelve ships (five per fleet), colocated transfers, one/two-month travel, scouting, convoy escorts, and defensive patrols.
- Four branching missions with two-month follow-ups; earlier cooperation and border agreements affect outcomes.
- Trust, treaty counteroffers, border agreements, joint research, recurring aid requests, favors, and diplomatic consequences for betrayal.
- Per-vessel power settings, subsystem targeting, science scans, and disabling engines without destroying hulls.
- Explorer, cruiser, science, and support roles; science survey bonuses and support escort/repair bonuses.
- Root README redesigned with the exact requested attribution, screenshots, play instructions, save continuity, scope, roadmap, and development guide.
- Release artifacts: standalone HTML, optional quick-start ZIP, and SHA-256 checksums. Native installers and mods are not part of this release.
- Validation: 42 simulation tests and a full Chromium walkthrough passed. The save importer was corrected to preserve the full 32-bit RNG state. The packaged HTML also passed offline gameplay and no-external-asset checks. Published release assets were downloaded again: their SHA-256 checksums matched, the HTML matched the locally tested build, and ZIP integrity/content checks passed.
- Existing GitHub release inspected: tag `Alpha`, title `Star Trek Divergence v0.1`, one HTML asset, and the opening instruction “Simply download the HTML file, and double click it, or drag and drop it into any browser to play it!”
- Published release: [`Alpha-v0.2` — Star Trek Divergence v0.2](https://github.com/HUHman416/StarTrekDivergence/releases/tag/Alpha-v0.2), source commit `cd0c332c28ce656db093a68274a34bc63871ea46`. The original `Alpha` release is preserved.
- GitHub [release workflow 37401966367](https://github.com/HUHman416/StarTrekDivergence/actions/runs/37401966367) passed validation and publication. A Node 22 test-runner flag incompatibility was fixed before publication; the test command now passes on Node 22 and Node 24.
- Downloadable assets: `StarTrekDivergence-v0.2.html`, `StarTrekDivergence-v0.2.zip`, and `SHA256SUMS.txt`. No native executable is included.

## Implemented baseline

The first browser prototype is implemented and validated in this checkout:

- Federation-first six-decision origin chapter with three founding charter outcomes.
- Energy, alloys, research, influence, monthly income, infrastructure, shipbuilding, and fleet repairs.
- Six-system star chart, surveys, and a live distress encounter.
- Envoys, trade, alliances, war, and ceasefires with any neighboring power.
- Turn-based tactical simulation and live combat, command of individual ships, target selection, fleet orders, repairs, shields, hails, and withdrawal.
- Responsive interface, captain's log, faction restart, and local autosave including mid-battle restoration.
- Single-file playtest packaging via `python3 scripts/package-playtest.py`; the resulting HTML opens directly in a browser without a server or developer tools. The managed cloud browser blocks file URLs; direct file opening remains unverified here. Browser-local file save behavior may vary. The bundle can also be served over HTTP.
- Three faction starts; dedicated Klingon and Romulan origin content is not implemented.
- User playtest feedback on 2026-10-06: “Everything seems to work!” The user did not specify their browser or operating system.
- Validation on 2026-10-06: 18 simulation tests passed; syntax checks passed; Chromium end-to-end checks passed for the full founding chapter, diplomacy, surveys, construction, research, combat, saves, faction restart, and layouts at 390, 768, and 1440 pixels. No browser console errors in the tested flows.

Run `npm run dev` from the repository; the server listens on port 5173. See README.md for controls and limitations. Desktop packaging and the mod manager are not implemented.

## Open design questions

- Depth of planetary governance, population, economy, exploration, and diplomacy.
- Tactical pacing: turn-based, real-time with pause, or another approach after playtesting.
- How much direct helm/weapon control each vessel exposes.
- Number of release factions and the length/historical span of their origin campaigns.
- Relationship between alternate history and canon milestones.
- Desktop technology and the mod API/data format.

## Idea history

- 2026-10-06: Initial game vision: faction origins, resource management, player-directed development and relationships, buttons and visual feedback, fleet battles and control of individual vessels, possible 25th Anniversary inspiration.
- 2026-10-06: User prioritized the Federation, exploration, and founding alliances.
- 2026-10-06: User requested eventual native Linux and Windows builds after visual/gameplay direction is established.
- 2026-10-06: User requested future mod support and an intuitive built-in mod manager once the base game is release-ready; asked that scope and future ideas be kept in memory.

- 2026-10-06: User reported a successful playtest, requested ship/fleet customization (names and registry numbers) and a simple tutorial, and asked for next-step ideas before continuing.

- 2026-10-06: User approved all proposed gameplay additions and explicitly requested a new GitHub release matching their existing naming style.
- 2026-10-06: User requested that the existing GitHub README be polished and credit ChatGPT for the complete implementation, with concepts and ideas attributed to HUHman at the very top; explicitly clarified not to create a separate README.

- 2026-10-06: Published v0.2 on GitHub after passing 42 tests, browser and packaged-game checks, and CI. Verified the published downloads and recorded the release link above.

## v0.3 continuation and approved scope

- Continued locally from the shared “Set up StarTrekDivergence” chat: https://chatgpt.com/s/cx_6ac45e8e79788191992aa0328be3ebf8 . The cloud run ended with partial, untested changes; these were not present on GitHub. Implementation resumed from main at `4f89203` in the local `game/` checkout.
- The user approved all six requests in one pass if feasible: LCARS visuals using HUHman's LCARS Command Interface as the reference; greatly expanded exploration with discovery research and first contact before knowledge/diplomacy; comparisons of owned/unbuilt ships; first-person away missions; random monthly events; and advancing several months at once.
- Prior requirements to maintain the root GitHub README, its exact ChatGPT/HUHman attribution, project memory, and versioned releases remain in force. Native Linux/Windows builds and the mod manager remain deferred.

Implemented for v0.3:
- An original LCARS-inspired CSS skin informed by the reference's orange elbows, pastel segments, dark background, and rounded navigation; no reference code/assets are vendored.
- 18 schematic systems (up from six), six new technologies, six away sites, four one-time resource projects, and existing fleet assignments/branching missions.
- Unknown civilization names and diplomacy are hidden until a visit/contact. A Vulcan delegation is present at campaign start; later origin delegations physically visit player territory as council chapters open. Further unknown-power visitors can occur after the opening chapter. No automatic wars or alliances.
- Comparison table for all four designs and every actual vessel. Current tech bonuses, actual hull/shield condition, weapon output, costs, and special roles are visible. Starting light cruisers retain the original lighter stats and class label.
- First-person grid-based away exploration with W/A/S/D, arrow keys, buttons, scanner map, three scan/resolve objects, two resolution approaches, recall, one-time rewards, and saved progress. Six themed scenarios currently share one corridor layout; free-roaming 3D exploration is not implemented.
- Five seeded monthly event types at 35% probability per month, no immediate repetition, explicit choices, and always an option with no resource prerequisite. Event RNG is separate from combat RNG and persists in saves.
- 1/3/6/12-month controls that stop for pending/new decisions, fleet arrivals, first contact, delayed results, and new aid requests. An active battle or away team blocks time advancement.
- Save schema 3 with migrations from v0.1 and v0.2, preserving existing known contacts and campaign state. New frontier IDs, events, away coordinates/objectives, and references are validated on import.

- Local validation: 55 simulation tests and syntax/build checks passed. The local browser walkthrough verified first contact visibility, decision-interrupted time advance, monthly events, away deployment/movement/scanning/recall and reload restoration, ship comparisons, tactical commands, no console errors in tested flows, and all ten routes without horizontal overflow at 390/768/1440px. Full source/frontier/bundle browser scripts are wired into GitHub CI.
- Release workflow accepts an explicit `[release]` marker on a main-branch commit as well as version tags; it creates the tag and assets only after validation and never overwrites an existing release. This supports publication through the connected GitHub app when local push credentials are unavailable.

### v0.3 published and verified

- Published [Star Trek Divergence v0.3 / Alpha-v0.3](https://github.com/HUHman416/StarTrekDivergence/releases/tag/Alpha-v0.3) from `cd8c17aa9452978b610abad6394ecbe4f3740ecb` after [PR #1](https://github.com/HUHman416/StarTrekDivergence/pull/1) passed. [Release workflow 37407281396](https://github.com/HUHman416/StarTrekDivergence/actions/runs/37407281396) passed all 55 simulation tests, original browser walkthrough, new frontier walkthrough, and offline bundle checks before publication.
- Downloaded the public HTML, ZIP, and SHA256SUMS. The HTML exactly matches the locally tested game; both downloads match the published checksums, and the ZIP passes integrity checks with all extracted entries identical to the local build. Compressed ZIP bytes differ between the local and CI Python/zlib runtimes; payload contents are identical.
- Updated repository screenshots using verified viewport captures after the full-page capture method produced an incorrectly framed image. This documentation correction does not change release gameplay.
- The local continuation uses a `game/` checkout under the task workspace; playable files are in its ignored `dist/` folder. Local Git push credentials failed; source changes were published through the connected GitHub app, then fetched locally.

## v0.4: away combat and era progression (2026-10-06)

User requirements: expand away teams with possible enemies and FPS mechanics; look for Star Trek/phaser models on Sketchfab; change the game theme and technology, including the carried phaser, with the era/year. The user also requested further improvement ideas.

Implemented locally:
- Dependency-free 2.5D raycast FPS with continuous WASD movement, strafing, mouse/keyboard look, collision, occluded actors, phaser hits, fire rate, cells and recharging, hostile pursuit/attacks requiring line of sight, and cover.
- Four hostile sites; clinic and habitat remain peaceful. Unaffiliated raiders and autonomous drones avoid prescribing faction enemies. Stun is default; high power costs two charges and forceful takedowns affect ethics. Guaranteed prototype ceasefire, medical kits and always-available emergency recall preserve agency.
- Explicit live/pause, auto-pause on navigation/blur/hidden page and restored saves, assisted paused step navigation, and on-screen movement controls. Completed objectives persist; enemies currently reset on redeployment, without kill rewards.
- Four designer-selected era boundaries: 2151 early warp/NX instrumentation; 2245 Constitution/duotronic; 2285 refit; 2364 next generation/LCARS. Colors, panel/navigation shapes and away renderer accents follow the actual campaign year. These are game presets rather than claims of exact canon transitions.
- Year-gated sidearm research and different weapon silhouettes, damage, capacity and fire rate. New campaigns may begin in any era with period equipment; later starts intentionally reuse the existing alternate-history origin story. No new era-specific story or ship roster is claimed.
- Save schema 4 preserves exact position, angle, health, ammunition, reload, enemy and objective state. v0.1–v0.3 migration remains supported. Existing v0.3 away missions migrate peacefully.
- Original code-drawn art; actual Sketchfab downloads are blocked by sign-in. Verified phaser (piiscesse, 1,106 triangles, CC BY 4.0) and Enterprise-A (MALINGA, 33,698 triangles, CC BY 4.0) in `docs/ASSET_CANDIDATES.md`. No assets downloaded/admitted. The local game-dev CLI is unavailable; canonical vendoring remains incomplete. This limitation affects external model integration, not the implemented FPS.

Further ideas to discuss, not approved or implemented: named officers with science/engineering/security specialties; distinct outdoor/interior floor plans and environmental hazards; persistent crew injuries and mission consequences feeding diplomacy; varied negotiated encounters instead of the current guaranteed broadcast success; authentic era-specific ships and story chapters.

Validation so far: 68 simulation tests pass; browser checks verified era selection, correct sidearm issuance, firing/cell use, pause, scanner proximity. Full regression and offline checks are pending below. Native Linux/Windows builds and mod support remain deferred.
