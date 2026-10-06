"""End-to-end gameplay checks against a running server. Optional Python Playwright dependency."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = Path(os.environ.get('DIVERGENCE_TEST_ARTIFACTS', '/tmp/divergence-browser'))
ARTIFACTS.mkdir(parents=True, exist_ok=True)
URL = os.environ.get('DIVERGENCE_TEST_URL', 'http://127.0.0.1:5173')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1100}, device_scale_factor=1, accept_downloads=True)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto(URL, wait_until='networkidle')
    def nav(route):
        page.locator(f'nav [data-view="{route}"]').click()
    def action(name, **attrs):
        selector = f'[data-action="{name}"]' + ''.join(f'[data-{k}="{v}"]' for k, v in attrs.items())
        page.locator(selector).click()
    def next_month():
        nav('overview')
        if page.locator('[data-action="monthly"]').count(): action('monthly', index='1')
        choice = page.locator('[data-action="decision"][data-index="0"]')
        if choice.count(): choice.click()
        page.get_by_role('button', name='Next month').click()
    def saved():
        return page.evaluate("JSON.parse(localStorage.getItem('divergence.campaign.v1'))")

    page.get_by_role('heading', name='A future of your own making.').wait_for()
    page.screenshot(path=str(ARTIFACTS / 'overview-desktop.png'), full_page=True)
    action('tutorial', kind='start')
    assert '1. Choose your direction' in page.locator('.tutorial-banner').inner_text()
    assert page.get_by_role('button', name='Next month').is_disabled()
    action('decision', index='0')
    assert '2. Advance one month' in page.locator('.tutorial-banner').inner_text()
    page.get_by_role('button', name='Next month').click()
    action('tutorialGo')
    page.locator('#assignment-kind').select_option('scout')
    action('dispatch', id='tellar')
    next_month()
    assert saved()['taskForces'][0]['location'] == 'tellar'
    assert '4. Make a friend' in page.locator('.tutorial-banner').inner_text()
    action('tutorialGo')
    action('diplomacy', id='tellarite', kind='envoy')
    assert '5. Take the bridge' in page.locator('.tutorial-banner').inner_text()
    action('treaty', id='tellarite', kind='borders')
    assert saved()['relations']['tellarite']['proposal'] is not None
    action('answerProposal', id='tellarite', kind='accept')
    assert saved()['relations']['tellarite']['borders'] is True
    action('answerRequest', id='vulcan', kind='accept')
    action('favor', id='vulcan')
    action('declare', id='vulcan')
    page.get_by_role('button', name='Keep diplomatic channels open').click()
    assert saved()['relations']['vulcan']['status'] != 'war'

    nav('fleet')
    action('editShip', id='flagship')
    page.get_by_label('Ship name', exact=True).fill('UES Horizon')
    page.get_by_label('Registry number', exact=True).fill('NX-99')
    page.get_by_role('button', name='Save identity').click()
    assert saved()['fleet'][0]['registry'] == 'NX-99'
    action('editFleet', id='expedition')
    page.get_by_label('Fleet name', exact=True).fill('First Contact Group')
    page.get_by_label('Fleet designation', exact=True).fill('TF-42')
    page.get_by_role('button', name='Save identity').click()
    action('newFleet')
    page.get_by_label('Fleet name', exact=True).fill('Pathfinder Group')
    page.get_by_label('Fleet designation', exact=True).fill('TF-02')
    page.get_by_role('button', name='Create fleet', exact=True).last.click()
    action('selectFleet', id='expedition')
    page.locator('#transfer-escort').select_option('fleet-2')
    assert saved()['fleet'][1]['fleetId'] == 'fleet-2'
    page.locator('#commission-role').select_option('science')
    action('commission')
    assert saved()['fleet'][-1]['role'] == 'science'
    page.screenshot(path=str(ARTIFACTS / 'fleet-desktop.png'), full_page=True)

    nav('missions')
    assert page.get_by_role('heading', name='A border is a promise').count() == 1
    action('mission', id='mission-1', kind='mediate')
    assert saved()['missions'][0]['status'] == 'pending'
    nav('galaxy')
    action('selectFleet', id='fleet-2')
    page.get_by_role('button', name='Select Andoria', exact=True).click()
    page.locator('#assignment-kind').select_option('scout')
    action('dispatch', id='andoria')
    action('selectFleet', id='expedition')
    next_month(); next_month()
    nav('missions')
    assert saved()['missions'][0]['status'] == 'resolved'
    assert 'corridor opens peacefully' in page.locator('.mission-outcome').inner_text()
    assert saved()['taskForces'][1]['location'] == 'andoria'

    nav('research')
    action('develop', kind='shields')
    assert page.get_by_role('button', name='Research complete').count() == 1
    nav('tactical')
    before = saved()['fleet']
    action('training')
    page.get_by_role('button', name='Command UES Columbia', exact=True).click()
    page.locator('#fleet-order').select_option('evasive')
    page.locator('#ship-power').select_option('shields')
    action('combat', kind='scan')
    page.locator('#subsystem-target').select_option('weapons')
    action('combat', kind='fire')
    assert saved()['battle']['enemies'][0]['systems']['weapons'] == 65
    page.reload(wait_until='networkidle')
    assert page.locator('#ship-power').input_value() == 'shields'
    assert page.locator('#subsystem-target').input_value() == 'weapons'
    page.screenshot(path=str(ARTIFACTS / 'battle-desktop.png'), full_page=True)
    page.locator('#subsystem-target').select_option('hull')
    page.locator('#fleet-order').select_option('focus')
    for _ in range(20):
        if page.locator('.battle-result').count(): break
        action('combat', kind='fire')
    assert 'VICTORY' in page.locator('.battle-result').inner_text()
    assert saved()['fleet'] == before
    action('closeBattle')
    assert 'Ready for the frontier.' in page.locator('.tutorial-banner').inner_text()
    action('tutorial', kind='skip')

    nav('help')
    with page.expect_download() as download_info:
        action('export')
    exported = ARTIFACTS / 'campaign.json'
    download_info.value.save_as(str(exported))
    original = saved()
    payload = json.loads(exported.read_text())
    assert payload['campaign']['fleet'][0]['name'] == 'UES Horizon'
    # Restart, then restore through the user-facing import confirmation.
    page.get_by_role('button', name='Choose a new faction').click()
    action('start', id='romulan')
    nav('help')
    page.locator('#import-file').set_input_files(str(exported))
    page.get_by_role('dialog').wait_for()
    assert saved()['faction'] == 'romulan'  # No replacement before confirmation.
    action('confirmImport')
    assert saved() == original
    nav('help')
    page.locator('#import-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{broken'})
    page.wait_for_function("document.querySelector('#toast').textContent.includes('invalid')")
    assert saved() == original
    # Legacy migration through the same import flow.
    page.locator('#import-file').set_input_files(str(ROOT / 'tests/fixtures/v1-save.json'))
    action('confirmImport')
    assert saved()['version'] == 3
    assert saved()['fleet'][0]['registry'] == 'NX-01'
    # Restore expanded campaign for responsive pages.
    nav('help'); page.locator('#import-file').set_input_files(str(exported)); action('confirmImport')

    for width in [390, 768, 1440]:
        page.set_viewport_size({'width': width, 'height': 900})
        for route in ['overview','galaxy','fleet','diplomacy','research','tactical','missions','log','help']:
            nav(route)
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Horizontal overflow: {route} at {width}px'
        nav('overview')
        if width == 390:
            page.screenshot(path=str(ARTIFACTS / 'overview-mobile.png'), full_page=True)
    page.set_viewport_size({'width':1440,'height':1100})
    while saved()['eventIndex'] < 6:
        next_month()
    assert page.get_by_role('heading', name='Federation of Allied Worlds').count() == 1
    # A completed campaign can still replay and skip the guide.
    nav('help');action('tutorial', kind='replay');action('tutorial', kind='skip')
    assert not errors, errors
    print('Browser checks passed: complete guided tutorial, identities, fleet creation/transfers/travel, science role, delayed mission, counteroffer, aid/favor, research, power/scan/subsystems, combat victory, mid-battle reload, export/import/cancel-safe validation, v0.1 migration, all routes at 390/768/1440px, founding charter; no console errors.')
    browser.close()
