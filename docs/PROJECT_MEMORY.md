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
