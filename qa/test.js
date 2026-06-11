/* QA: drives the generated site from file:// with headless Chromium.
   Usage: node test.js [baseURL]  (default: file:// against the repo root) */
'use strict';
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'file://' + path.resolve(__dirname, '..') + '/';
let failures = 0;
function ok(cond, label) {
  console.log((cond ? '  ✓ ' : '  ✗ FAIL ') + label);
  if (!cond) failures++;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', e => { console.log('  ✗ PAGE ERROR: ' + e.message); failures++; });

  console.log('BASE = ' + BASE);

  // ---------- counts baked into the site ----------
  console.log('counts');
  await page.goto(BASE + 'index.html');
  const counts = await page.evaluate(() => window.CAT.counts);
  ok(counts.units === 12, '12 units in data');
  ok(counts.exercises === 83, '83 exercises in data');
  ok(counts.glossary === 275, '275 glossary rows in data');
  const exIds = await page.evaluate(() => Object.keys(window.CAT.ex).length);
  ok(exIds === 83, '83 exercise entries in data.js');
  const navUnits = await page.locator('.nav-unit').count();
  ok(navUnits === 12, '12 unit links in nav');

  // exercise DOM count across all unit pages
  let domEx = 0;
  for (let u = 1; u <= 12; u++) {
    await page.goto(BASE + 'unit' + String(u).padStart(2, '0') + '.html');
    domEx += await page.locator('.ex[data-ex]').count();
  }
  ok(domEx === 83, '83 exercise blocks rendered across unit pages (got ' + domEx + ')');

  await page.goto(BASE + 'glossary.html');
  ok(await page.locator('#glosTable tbody tr').count() === 275, '275 glossary rows rendered');

  // ---------- glossary search + sort ----------
  console.log('glossary');
  await page.fill('#glosSearch', 'formatge');
  const visible = await page.locator('#glosTable tbody tr:visible').count();
  ok(visible >= 1 && visible < 10, 'search filters rows (formatge → ' + visible + ')');
  await page.fill('#glosSearch', '');
  await page.click('th[data-sort="3"]');
  const firstUnit = await page.locator('#glosTable tbody tr:first-child td:last-child').textContent();
  ok(firstUnit.trim() === '1', 'sort by unit puts unit 1 first');
  ok(await page.locator('#glosTable .say').count() === 275, 'speaker button on every glossary entry');

  // ---------- gap-fill (EX 2.1) with accent-tolerance ----------
  console.log('unit 2 — gap, match, reorder, model, free');
  await page.goto(BASE + 'unit02.html');
  const gap = page.locator('.ex[data-ex="2.1"]');
  const inputs = gap.locator('.gap-input');
  const vals = ['soc', 'ets', 'es', 'som', 'són', 'sou']; // item 3 'es' missing accent → almost
  for (let i = 0; i < 6; i++) await inputs.nth(i).fill(vals[i]);
  await gap.locator('.btn-primary').click();
  ok(await gap.locator('.gap-input.ok').count() === 5, 'gap: 5 exact answers green');
  ok(await gap.locator('.gap-input.almost').count() === 1, 'gap: missing accent flagged as almost');
  ok((await gap.locator('.ex-score').textContent()).includes('6 / 6'), 'gap: score 6/6 (accent leniency counts)');
  let state = await page.evaluate(() => JSON.parse(localStorage.getItem('catalanA1.ex.2.1')).state);
  ok(state === 'passed', 'gap: state saved as passed');

  // wrong answer marks red
  await gap.locator('.ex-controls .btn:not(.btn-primary)').click(); // Retry
  await inputs.nth(0).fill('xxx');
  await gap.locator('.btn-primary').click();
  ok(await gap.locator('.gap-input.bad').count() >= 1, 'gap: wrong answer red');

  // ---------- matching (EX 2.2) ----------
  const match = page.locator('.ex[data-ex="2.2"]');
  // correct pairs: 1-b, 2-d, 3-a, 4-c
  const pairs = [['0', 'b'], ['1', 'd'], ['2', 'a'], ['3', 'c']];
  for (const [l, r] of pairs) {
    await match.locator('.match-item[data-side="l"][data-key="' + l + '"]').click();
    await match.locator('.match-item[data-side="r"][data-key="' + r + '"]').click();
  }
  await match.locator('.btn-primary').click();
  ok(await match.locator('.match-item.ok').count() === 4, 'match: all four pairs green');
  ok((await match.locator('.ex-score').textContent()).includes('4 / 4'), 'match: score 4/4');

  // ---------- reorder (EX 2.4, first item: "Em dic Marc.") ----------
  const re = page.locator('.ex[data-ex="2.4"] .reorder[data-item="0"]');
  for (const tok of ['Em', 'dic', 'Marc', '.']) {
    await re.locator('.reorder-pool .chip', { hasText: new RegExp('^' + tok.replace('.', '\\.') + '$') }).click();
  }
  ok((await re.locator('.reorder-out').textContent()).trim() === 'Em dic Marc.', 'reorder: sentence built');
  await page.locator('.ex[data-ex="2.4"] .btn-primary').click();
  ok(await re.locator('.reorder-out.ok').count() === 1, 'reorder: correct order green');

  // ---------- model (EX 2.3 translate) ----------
  const model = page.locator('.ex[data-ex="2.3"]');
  await model.locator('.model-input').first().fill('Bon dia! Com estàs?');
  await model.locator('.ex-controls .btn:not(.btn-primary)').first().click(); // Show model answer
  ok(await model.locator('.model-answer').isVisible(), 'model: answer revealed');
  const yesBtns = model.locator('.sm-yes');
  for (let i = 0; i < await yesBtns.count(); i++) await yesBtns.nth(i).click();
  ok((await model.locator('.ex-score').textContent()).includes('4 / 4'), 'model: self-marked 4/4');

  // ---------- free writing (EX 2.8) ----------
  const free = page.locator('.ex[data-ex="2.8"]');
  await free.locator('.free-text').fill('Hola! Em dic QA. Soc de Testlàndia. Soc robot.');
  await free.locator('.ex-controls .btn:not(.btn-primary)').first().click();
  await free.locator('.sm-yes').click();
  state = await page.evaluate(() => JSON.parse(localStorage.getItem('catalanA1.ex.2.8')).state);
  ok(state === 'passed', 'free: self-marked passed');

  // ---------- char strip ----------
  await inputs.nth(0).click();
  ok(await page.locator('.char-strip.visible').count() === 1, 'char strip appears on focus');
  await page.locator('.char-strip button', { hasText: 'ç' }).click();
  ok((await inputs.nth(0).inputValue()).includes('ç'), 'char strip inserts ç');

  // ---------- true/false (EX 1.4) + write (EX 1.2) ----------
  console.log('unit 1 — true/false, write');
  await page.goto(BASE + 'unit01.html');
  const tf = page.locator('.ex[data-ex="1.4"]');
  await tf.locator('[data-item="0"] .tf-btn[data-val="true"]').click();   // correct
  await tf.locator('[data-item="1"] .tf-btn[data-val="true"]').click();   // wrong (answer: false)
  ok(await tf.locator('[data-item="0"] .tf-btn.ok').count() === 1, 'tf: instant green on correct');
  ok(await tf.locator('[data-item="1"] .tf-btn.bad').count() === 1, 'tf: instant red on wrong');
  ok((await tf.locator('li').nth(1).locator('.item-fb').textContent()).includes("it's /b/"), 'tf: explanation shown');
  const wr = page.locator('.ex[data-ex="1.2"]');
  await wr.locator('li:nth-child(1) .gap-input').fill('llibre');
  await wr.locator('li:nth-child(2) .gap-input').fill('hola');
  await wr.locator('li:nth-child(3) .gap-input').fill('cafe');   // missing accent
  await wr.locator('li:nth-child(4) .gap-input').fill('maig');
  await wr.locator('.btn-primary').click();
  ok((await wr.locator('.ex-score').textContent()).includes('4 / 4'), 'write: 4/4 with accent flagged');
  ok(await wr.locator('.gap-input.almost').count() === 1, 'write: cafè without accent → almost');

  // ---------- choice (EX 8.4) ----------
  console.log('unit 8 — choice');
  await page.goto(BASE + 'unit08.html');
  const ch = page.locator('.ex[data-ex="8.4"]');
  await ch.locator('[data-item="0"] .tf-btn[data-val="beguda"]').click();
  ok(await ch.locator('[data-item="0"] .tf-btn.ok').count() === 1, 'choice: aigua → beguda green');
  await ch.locator('[data-item="1"] .tf-btn[data-val="beguda"]').click(); // formatge is menjar
  ok(await ch.locator('[data-item="1"] .tf-btn.bad').count() === 1, 'choice: formatge → beguda red');

  // ---------- paradigm (EX 5.4) ----------
  console.log('unit 5 — paradigm');
  await page.goto(BASE + 'unit05.html');
  const pa = page.locator('.ex[data-ex="5.4"]');
  const forms = ['compro', 'compres', 'compra', 'comprem', 'compreu', 'compren'];
  for (let i = 0; i < 6; i++) await pa.locator('.gap-input').nth(i).fill(forms[i]);
  await pa.locator('.btn-primary').click();
  ok((await pa.locator('.ex-score').textContent()).includes('6 / 6'), 'paradigm: 6/6');
  ok((await pa.locator('.paradigm-ipa').first().textContent()).includes('ˈkompɾu'), 'paradigm: IPA note shown');

  // ---------- personal (EX 12.5) ----------
  console.log('unit 12 — personal');
  await page.goto(BASE + 'unit12.html');
  const pe = page.locator('.ex[data-ex="12.5"]');
  await pe.locator('.sm-yes').click();
  state = await page.evaluate(() => JSON.parse(localStorage.getItem('catalanA1.ex.12.5')).state);
  ok(state === 'passed', 'personal: done button saves passed');

  // ---------- persistence across reload + dashboard ----------
  console.log('persistence');
  await page.goto(BASE + 'index.html');
  const stats = await page.locator('#overallStats').textContent();
  ok(/[1-9]\d* of 83 exercises passed/.test(stats), 'dashboard counts passed exercises (' + stats.trim() + ')');
  await page.locator('.check-item').first().check();
  await page.reload();
  ok(await page.locator('.check-item').first().isChecked(), 'checklist survives reload');
  const navBadge = await page.locator('.nav-badge[data-unit="2"]').textContent();
  ok(/\d+\/8/.test(navBadge), 'unit 2 nav badge shows progress (' + navBadge + ')');

  // ---------- mock exam ----------
  console.log('mock exam');
  await page.goto(BASE + 'mock.html');
  ok(await page.locator('.script-text').isHidden(), 'listening script hidden initially');
  // answer all six V/F: key = F V F V F F
  const key = [false, true, false, true, false, false];
  for (let i = 0; i < 6; i++) {
    await page.locator('#paper1 [data-item="' + i + '"] .tf-btn[data-val="' + key[i] + '"]').click();
  }
  ok((await page.locator('#p1controls .ex-score').textContent()).includes('6 / 6'), 'paper 1 auto-marked 6/6');
  ok(await page.locator('#scriptReveal').isVisible(), 'script reveal unlocked after answering');
  await page.click('#showScript');
  ok(await page.locator('.script-text').isVisible(), 'script shown on demand');
  // paper 2B matching
  const p2bPairs = [['0', 'b'], ['1', 'd'], ['2', 'a'], ['3', 'e'], ['4', 'c']];
  for (const [l, r] of p2bPairs) {
    await page.locator('#p2b .match-item[data-side="l"][data-key="' + l + '"]').click();
    await page.locator('#p2b .match-item[data-side="r"][data-key="' + r + '"]').click();
  }
  await page.locator('#p2bControls .btn-primary').click();
  ok((await page.locator('#p2bControls .ex-score').textContent()).includes('5 / 5'), 'paper 2B 5/5');
  // timers
  await page.check('#examConditions');
  ok(await page.locator('.paper-timer').first().isVisible(), 'exam conditions shows timers');
  await page.locator('.paper-timer[data-paper="1"] .timer-start').click();
  await page.waitForTimeout(1500);
  ok(/14:5\d/.test(await page.locator('.paper-timer[data-paper="1"] .timer-display').textContent()), 'paper 1 timer counts down from 15:00');
  // save attempt + history survives reload
  page.once('dialog', d => d.accept());
  await page.click('#saveAttempt');
  await page.reload();
  ok((await page.locator('#attemptHistory').textContent()).includes('6/6'), 'attempt history shows P1 6/6 after reload');

  // ---------- 380px viewport ----------
  console.log('mobile 380px');
  const mob = await browser.newPage({ viewport: { width: 380, height: 740 } });
  mob.on('pageerror', e => { console.log('  ✗ MOBILE PAGE ERROR: ' + e.message); failures++; });
  await mob.goto(BASE + 'unit03.html');
  ok(await mob.locator('.topbar').isVisible(), 'mobile: topbar visible');
  ok(await mob.locator('#sidebar').evaluate(el => el.getBoundingClientRect().right <= 0), 'mobile: sidebar off-canvas');
  await mob.click('#navToggle');
  await mob.waitForTimeout(350);   // slide-in transition
  ok(await mob.locator('#sidebar').evaluate(el => el.getBoundingClientRect().left === 0), 'mobile: hamburger opens sidebar');
  await mob.locator('#backdrop').click({ position: { x: 370, y: 500 } }); // visible strip right of sidebar
  await mob.waitForTimeout(350);
  const hscroll = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(hscroll <= 1, 'mobile: no horizontal scroll on unit page (overflow ' + hscroll + 'px)');
  const gap31 = mob.locator('.ex[data-ex="3.1"] .gap-input').first();
  await gap31.scrollIntoViewIfNeeded();
  await gap31.fill('tinc');
  await mob.locator('.ex[data-ex="3.1"] .btn-primary').click();
  ok(await mob.locator('.ex[data-ex="3.1"] .gap-input.ok').count() === 1, 'mobile: exercise interaction works');

  // ---------- resource links open in new tabs ----------
  await page.goto(BASE + 'unit02.html');
  const extLinks = await page.locator('.res a[href^="http"]').count();
  const blankLinks = await page.locator('.res a[target="_blank"]').count();
  ok(extLinks > 0 && extLinks === blankLinks, 'all .res external links target=_blank (' + extLinks + ')');

  // ---------- reset ----------
  console.log('reset');
  await page.goto(BASE + 'index.html');
  page.once('dialog', d => d.accept());
  await page.click('#resetProgress');
  await page.waitForLoadState();
  const cleared = await page.evaluate(() =>
    Object.keys(localStorage).filter(k => k.startsWith('catalanA1.')).length);
  ok(cleared === 0, 'reset clears all catalanA1.* keys');

  await browser.close();
  console.log(failures === 0 ? '\nALL TESTS PASSED' : '\n' + failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error(e); process.exit(1); });
