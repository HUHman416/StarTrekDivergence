"""Bundle this dependency-free prototype into one locally playable HTML file."""
import base64
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
output = Path(sys.argv[1]) if len(sys.argv) > 1 else root.parent / 'StarTrekDivergence-playtest.html'

def data_url(mime, content):
    return f'data:{mime};base64,' + base64.b64encode(content).decode('ascii')

html = (root / 'index.html').read_text()
app = (root / 'src/app.js').read_text()
game_url = data_url('text/javascript', (root / 'src/game.js').read_bytes())
assert app.count('"./game.js"') == 1, 'Review module imports before packaging.'
app = app.replace('"./game.js"', '"' + game_url + '"')
css = (root / 'src/styles.css').read_text()
assert '</script' not in app.lower() and '</style' not in css.lower()
html = html.replace('<link rel="stylesheet" href="/src/styles.css" />', '<style>\n' + css + '\n</style>')
html = html.replace('<script type="module" src="/src/app.js"></script>', '<script type="module">\n' + app + '\n</script>')
html = html.replace('/favicon.svg', data_url('image/svg+xml', (root / 'favicon.svg').read_bytes()))
assert '/src/' not in html, 'Unbundled application asset remains.'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(html)
print(f'Playtest created: {output} ({output.stat().st_size:,} bytes)')
