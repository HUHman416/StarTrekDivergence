"""Full UI path through the v0.3 frontier. Runs in CI alongside the original walkthrough."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
URL=os.environ.get('DIVERGENCE_TEST_URL','http://127.0.0.1:5173')
ART=Path(os.environ.get('DIVERGENCE_TEST_ARTIFACTS','/tmp/divergence-browser'))
ART.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':1000})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL,wait_until='networkidle')
    def nav(view):page.locator(f'nav [data-view="{view}"]').click()
    def action(name,**attrs):page.locator(f'[data-action="{name}"]'+''.join(f'[data-{k}="{v}"]' for k,v in attrs.items())).click()
    def saved():return page.evaluate("JSON.parse(localStorage.getItem('divergence.campaign.v1'))")
    def month():
        nav('overview')
        if page.locator('[data-action="monthly"]').count():action('monthly',index='1')
        if page.locator('[data-action="decision"]').count():action('decision',index='0')
        action('advance')
    nav('diplomacy'); assert page.locator('.contact-card').count()==1
    assert 'Romulan' not in page.locator('main').inner_text()
    nav('research'); assert page.locator('[data-kind="armor"]').is_disabled()
    nav('overview');action('decision',index='0')
    page.get_by_label('Advance time',exact=True).select_option('12')
    page.get_by_role('button',name='Advance 12 months').click()
    assert saved()['turn']==2
    page.get_by_label('Advance time',exact=True).select_option('1')
    nav('galaxy'); page.get_by_role('button',name='Select Haven Outpost',exact=True).click()
    page.get_by_label('Fleet assignment',exact=True).select_option('scout');action('dispatch',id='haven')
    month(); assert saved()['taskForces'][0]['location']=='haven'
    assert saved()['monthlyEvent'] is not None
    action('monthly',index='1')
    nav('galaxy');action('deployAway',id='haven')
    def move(kind):action('away',kind=kind)
    for k in ['forward','left','forward']:move(k)
    action('away',kind='scan',index='0')
    action('away',kind='study',index='0')
    page.reload(wait_until='networkidle')
    assert saved()['away']['resolved']==[0]
    assert page.locator('.away-scene').count()==1
    for k in ['right','right','forward','forward','forward','left','forward']:move(k)
    action('away',kind='scan',index='1');action('away',kind='study',index='1')
    for k in ['forward','left','forward','forward','right','forward','forward']:move(k)
    action('away',kind='scan',index='2');action('away',kind='study',index='2')
    assert saved()['away']['resolved']==[0,1,2]
    assert 'medicine' in saved()['discoveries']
    page.screenshot(path=str(ART/'away-desktop.png'),full_page=True)
    move('recall');nav('research');action('develop',kind='medicine')
    assert 'medicine' in saved()['tech']
    nav('fleet'); assert page.locator('.design-row').count()==4
    assert page.locator('.comparison-panel tbody tr').count()==6
    for width in [390,768,1440]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['overview','galaxy','fleet','diplomacy','research','tactical','missions','away','log','help']:
            nav(route)
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(route,width)
    assert not errors,errors
    print('Frontier UI passed: contact visibility, research gates, twelve-month interruption, scouting, monthly choice, away movement/scanning/completion/reload, research unlock, ship comparison, all routes at three sizes.')
    browser.close()
