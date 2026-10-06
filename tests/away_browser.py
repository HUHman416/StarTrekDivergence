"""End-to-end combat, era, save and responsive checks for v0.4."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('DIVERGENCE_TEST_URL','http://127.0.0.1:5173').rstrip('/')
ART=Path(os.environ.get('DIVERGENCE_TEST_ARTIFACTS','/tmp/divergence-browser'));ART.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    for packaged in [False,True]:
        context=browser.new_context(viewport={'width':1440,'height':1000})
        page=context.new_page();errors=[];requests=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http:','https:')) else None)
        url=BASE+('/dist/StarTrekDivergence-v0.4.html' if packaged else '/')
        page.goto(url,wait_until='networkidle')
        if packaged:context.set_offline(True)
        def action(name,**attrs):page.locator(f'[data-action="{name}"]'+''.join(f'[data-{k}="{v}"]' for k,v in attrs.items())).click()
        def nav(route):page.locator(f'nav [data-view="{route}"]').click()
        def saved():return page.evaluate("JSON.parse(localStorage.getItem('divergence.campaign.v1'))")
        for year,era in [(2151,'frontier'),(2245,'constitution'),(2285,'refit'),(2364,'nextgen')]:
            page.get_by_role('button',name='Choose a new faction',exact=True).click()
            page.get_by_label('Starting era',exact=True).select_option(str(year));action('start',id='earth')
            assert page.locator('html').get_attribute('data-era')==era
            assert saved()['startYear']==year
        nav('research');assert page.locator('.era-briefing').inner_text().find('Type-II compression phaser')>=0
        nav('overview');action('decision',index='0');nav('galaxy')
        page.get_by_role('button',name='Select Rigel Belt',exact=True).click();action('dispatch',id='rigel')
        nav('overview');action('advance');nav('galaxy');action('deployAway',id='rigel')
        assert saved()['away']['weapon']=='nextgen';assert len(saved()['away']['enemies'])==2
        action('fps',kind='toggle');action('fps',kind='fire');action('fps',kind='toggle')
        assert saved()['away']['charge']==15
        # All code paths must pause on navigation, reload and blur; no hidden damage.
        charge=saved()['away']['charge'];nav('research');page.wait_for_timeout(200);assert saved()['away']['charge']==charge
        nav('away');assert page.get_by_role('button',name='Begin mission',exact=True).count()==1
        action('fps',kind='toggle');page.locator('#away-canvas').focus()
        page.keyboard.down('w');page.wait_for_timeout(350);page.keyboard.up('w');action('fps',kind='toggle')
        assert saved()['away']['py']<7.4
        action('fps',kind='toggle');action('fps',kind='reload');page.wait_for_timeout(1700);action('fps',kind='toggle')
        assert saved()['away']['charge']==16
        action('fps',kind='mode');assert saved()['away']['mode']=='overload'
        action('fps',kind='hail');assert all(e['hp']==0 for e in saved()['away']['enemies'])
        state=saved()['away']
        if not packaged:
            page.reload(wait_until='networkidle');assert saved()['away']==state
            assert page.get_by_role('button',name='Begin mission',exact=True).count()==1
        for width in [390,768,1440]:
            page.set_viewport_size({'width':width,'height':1000})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
        page.screenshot(path=str(ART/('away-v04-bundle.png' if packaged else 'away-v04.png')),full_page=True)
        action('away',kind='recall');assert saved()['away'] is None
        if packaged:assert requests==[url],requests
        assert not errors,errors
        context.close()
    browser.close()
print('v0.4 source and offline bundle: four eras, equipment, live firing, movement, reload, pause, ceasefire, save restore, evacuation and responsive layout passed.')
