# Star Trek: Divergence

Read `docs/PROJECT_MEMORY.md` before making design, architecture, or scope decisions. It records the user's vision, priorities, and deferred features. Update it when the user adds or changes project ideas; distinguish user requirements from implementation proposals and completed work. Do not claim future features already exist.

Use the existing isolated checkout; do not create a worktree unless requested. Preserve unrelated user changes.

The current prototype is a dependency-free browser application with a pure JavaScript rules module (`src/game.js`) and a separate UI (`src/app.js`, `src/styles.css`). Run `npm test` and `npm run check` for relevant gameplay changes. `npm run build` creates release artifacts in ignored `dist/`; optional Playwright checks are `tests/browser_smoke.py` and `tests/bundle_smoke.py`. Preserve v0.1 save migration and stable ship/fleet IDs. Run with `npm run dev` on port 5173. Do not introduce backend requirements without a concrete gameplay need.

Prioritize player agency: no species is permanently assigned as an ally or enemy. Preserve viable diplomacy, independence, and confrontation paths. New systems should remain portable to later Linux and Windows desktop builds and eventual mod support. Desktop packaging and the mod manager are deferred milestones, not requirements for every prototype change.

Keep the root README attribution at the top: "Made entirely with ChatGPT, with concepts and ideas by HUHman." Follow the versioned `Alpha-v<version>` release convention and preserve the original `Alpha` tag. Only publish releases when authorized by the user. Deferred native packaging and mod support are not implied by a gameplay release.
