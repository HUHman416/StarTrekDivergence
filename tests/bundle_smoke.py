"""Verify the downloadable game is self-contained and playable without asset requests."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
version=json.loads((root/'package.json').read_text())['version'].removesuffix('.0')
base=os.environ.get('DIVERGENCE_TEST_URL','http://127.0.0.1:5173').rstrip('/')
url=f'{base}/dist/StarTrekDivergence-v{version}.html'
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    page=browser.new_page(accept_downloads=True)
    errors=[]; requests=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('request',lambda request:requests.append(request.url) if request.url.startswith(('http:','https:')) else None)
    page.goto(url,wait_until='networkidle')
    page.get_by_role('heading',name='The Federation begins with you.').wait_for()
    # Once the HTML is loaded, the entire game continues with networking disabled.
    page.context.set_offline(True)
    page.locator('[data-action="decision"][data-index="0"]').click()
    page.get_by_role('button',name='Next month').click()
    page.locator('nav [data-view="tactical"]').click()
    page.get_by_role('button',name='Begin tactical simulation').click()
    page.get_by_role('button',name='Command UES Intrepid',exact=True).click()
    page.locator('#ship-power').select_option('weapons')
    page.get_by_role('button',name='Fire weapons',exact=True).click()
    assert page.locator('.round-badge').inner_text().endswith('02')
    page.get_by_role('button',name='Order fleet withdrawal').click()
    page.get_by_role('button',name='Return to command').click()
    page.locator('nav [data-view="help"]').click()
    with page.expect_download() as download:
        page.get_by_role('button',name='Export campaign (.json)').click()
    data=json.loads(Path(download.value.path()).read_text())
    assert data['gameVersion']==json.loads((root/'package.json').read_text())['version']
    assert data['campaign']['turn']==2
    assert requests==[url],requests
    assert not errors,errors
    print('Release bundle passed: embedded styles/modules/icon, campaign progression, ship power and combat, JSON export, no external asset requests, gameplay works offline after document load.')
    browser.close()
