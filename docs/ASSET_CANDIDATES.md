# Sketchfab candidates for away teams and future fleet visuals

Checked 2026-10-06 against public Sketchfab model metadata and the phaser download UI. These are **candidates, not included assets**. The phaser download button opened a login form; this session has no signed-in Sketchfab account. No files were downloaded, no license accepted on the user's behalf, and no viewer files were extracted. The local `game-dev` command is also unavailable, so canonical package validation/admission has not been performed.

| Candidate | Creator | Geometry | Observed license | Status |
|---|---|---:|---|---|
| [Star trek phaser gun](https://sketchfab.com/3d-models/star-trek-phaser-gun-0f99c842305b4b7f8e6b95ddcd0cf51b) | piiscesse | 1,106 triangles | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Downloadable; requires Sketchfab sign-in. Good lightweight candidate; exact era and appearance require art review. |
| [USS Enterprise NCC-1701-A](https://sketchfab.com/3d-models/uss-enterprise-ncc-1701-a-star-trek-space-ship-623e26fe7be84bf8bb22c522000a2ef4) | MALINGA | 33,698 triangles | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Downloadable; future fleet/briefing candidate, not an away-combat requirement. |
| [Compression Phaser Rifle](https://sketchfab.com/3d-models/compression-phaser-rifle-e75ce325f57c4c9b8fb3825da8724ed6) | Ryan Powell / Outphased | Page lists 5.9k triangles | CC BY-NC | Reference candidate only; restricted license makes it a less flexible default. |

For a later import, retain the source URL, creator, license copy, original archive digest, transformation notes, and packaged checksums. Use the Game Asset Vendoring workflow to verify the closed package and admit it with a project receipt before integrating rendering. CC licensing of a contributed model is not a grant from the Star Trek rights owner. Do not represent this fan project as official.

Potential attribution for the phaser, **only after actual inclusion**: “Star trek phaser gun” by piiscesse, Sketchfab model 0f99c842305b4b7f8e6b95ddcd0cf51b, CC BY 4.0. Add the actual changes made, if any.

The v0.4 game uses original code-drawn phasers, drones, raiders, consoles, and corridor materials, and makes no runtime Sketchfab requests. Converting an admitted mesh into game-ready 3D rendering or documented derived sprites remains future integration work.
