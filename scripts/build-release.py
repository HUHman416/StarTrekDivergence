"""Build a versioned single-file game, quick-start ZIP, and SHA-256 checksums."""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
version = json.loads((root / 'package.json').read_text())['version']
assert re.fullmatch(r'\d+\.\d+\.\d+', version), 'Expected a semantic package version.'
assert f'GAME_VERSION = "{version}"' in (root / 'src/game.js').read_text(), 'Game/package version mismatch.'
label = version.removesuffix('.0')
out = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'dist'
out.mkdir(parents=True, exist_ok=True)
name = f'StarTrekDivergence-v{label}'
html = out / f'{name}.html'
subprocess.run([sys.executable, str(root / 'scripts/package-playtest.py'), str(html)], check=True)
help_text = f'''STAR TREK: DIVERGENCE v{label} — ALPHA
Made entirely with ChatGPT, with concepts and ideas by HUHman.

Open {name}.html in a modern browser. No server or installation is needed.
Select Start tutorial or visit Academy & saves for the guide.

Export your campaign from Academy & saves before updating or moving the game.
Keep your exported JSON and import it into later versions. Browser-local saves
may depend on the filename, browser, and file location.

This is a browser alpha. Native Linux/Windows builds and mod support are planned.
Repository: https://github.com/HUHman416/StarTrekDivergence
'''
archive = out / f'{name}.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for filename, content in [(html.name, html.read_bytes()), ('HOW-TO-PLAY.txt', help_text.encode())]:
        info = zipfile.ZipInfo(filename, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, content)
checksums = out / 'SHA256SUMS.txt'
checksums.write_text(''.join(f'{hashlib.sha256(p.read_bytes()).hexdigest()}  {p.name}\n' for p in [html,archive]))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert z.read(html.name) == html.read_bytes()
print(f'Release artifacts: {html.name}, {archive.name}, {checksums.name}')
