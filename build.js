#!/usr/bin/env node
/*
 * build.js — parses course_source.html (the single source of truth) and
 * generates the static site: index.html, ipa.html, unit01–12.html, exam.html,
 * mock.html, glossary.html and data.js.
 *
 * It never rewrites course content: theory blocks, tables, dialogues and
 * resource boxes are carried over verbatim (links get target="_blank").
 * Exercise blocks are converted to interactive markup; the answer key powers
 * the checking data emitted to data.js.
 *
 * Hard assertions: 12 units, 83 exercises, 275 glossary rows.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = fs.readFileSync(path.join(ROOT, 'course_source.html'), 'utf8');

// ---------------------------------------------------------------- utilities

function fail(msg) { console.error('BUILD FAILED: ' + msg); process.exit(1); }
function assert(cond, msg) { if (!cond) fail(msg); }

// Find the matching </tag> for the tag opened at `openStart` (index of '<').
function matchTag(html, openStart) {
  const m = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(html.slice(openStart));
  assert(m, 'matchTag: no tag at ' + openStart);
  const tag = m[1];
  const re = new RegExp('<' + tag + '(?=[\\s>])|</' + tag + '>', 'gi');
  re.lastIndex = openStart;
  let depth = 0, mm;
  while ((mm = re.exec(html))) {
    if (mm[0][1] === '/') { depth--; if (depth === 0) return { tag, start: openStart, end: mm.index + mm[0].length }; }
    else depth++;
  }
  fail('matchTag: unbalanced <' + tag + '> at ' + openStart);
}

// Split an HTML fragment into its top-level elements.
function topLevel(html) {
  const blocks = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) break;
    if (html.startsWith('<!--', lt)) { i = html.indexOf('-->', lt) + 3; continue; }
    if (!/^<[a-zA-Z]/.test(html.slice(lt, lt + 2))) { i = lt + 1; continue; }
    const { tag, end } = matchTag(html, lt);
    const outer = html.slice(lt, end);
    const openEnd = html.indexOf('>', lt) + 1;
    const inner = html.slice(openEnd, end - (tag.length + 3));
    const attrM = html.slice(lt, openEnd).match(/class="([^"]*)"/);
    blocks.push({ tag: tag.toLowerCase(), cls: attrM ? attrM[1] : '', outer, inner });
    i = end;
  }
  return blocks;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function extBlank(html) { return html.replace(/<a href="http/g, '<a target="_blank" rel="noopener" href="http'); }

// ------------------------------------------------------------- source parse

// Units: the <div class="unit"> blocks. The last three "unit" divs are the
// exam-prep, mock-exam and glossary appendix; real units have unit-num "Unit N".
const bodyHtml = SRC.slice(SRC.indexOf('<body>') + 6, SRC.indexOf('</body>'));
const allBlocks = topLevel(bodyHtml);
const unitDivs = allBlocks.filter(b => b.tag === 'div' && b.cls === 'unit');
const answerDivs = allBlocks.filter(b => b.tag === 'div' && b.cls === 'answers');

const units = [];          // real units 1..12
let ipaGuideDiv = null, examPrepDiv = null, mockDiv = null, glossaryDiv = null;
for (const d of unitDivs) {
  const numM = d.inner.match(/<div class="unit-num">([^<]*)<\/div>/);
  if (!numM) { ipaGuideDiv = d; continue; }              // the IPA guide unit has no unit-num
  const label = numM[1].trim();
  const um = label.match(/^Unit (\d+)$/);
  if (um) units.push({ num: +um[1], div: d });
  else if (/Exam preparation/.test(label)) examPrepDiv = d;
  else if (/Mock exam/.test(label)) mockDiv = d;
  else if (/Appendix/.test(label)) glossaryDiv = d;
}
assert(units.length === 12, 'expected 12 units, got ' + units.length);
assert(ipaGuideDiv && examPrepDiv && mockDiv && glossaryDiv, 'missing special sections');

// Intro ("How to use this course") = blocks between the cover div and the IPA guide.
const introStart = bodyHtml.indexOf('<h1 class="page-title">How to use this course</h1>');
const introEnd = bodyHtml.indexOf('<!-- IPA GUIDE -->');
const introHtml = bodyHtml.slice(introStart, introEnd);

// Glossary rows
const glosTableM = glossaryDiv.inner.match(/<table class="glos">([\s\S]*?)<\/table>/);
assert(glosTableM, 'glossary table not found');
const glosRows = [...glosTableM[1].matchAll(/<tr><td class="ca">([\s\S]*?)<\/td><td class="pron">([\s\S]*?)<\/td><td class="en">([\s\S]*?)<\/td><td>(\d+)<\/td><\/tr>/g)]
  .map(m => ({ ca: stripTags(m[1]), ipa: stripTags(m[2]), en: stripTags(m[3]), unit: +m[4] }));
assert(glosRows.length === 275, 'expected 275 glossary rows, got ' + glosRows.length);

// Answer key: map "1.1" → answer html. Mock keys: "Paper 1" etc.
const answerKey = {};
{
  const keyDiv = answerDivs[0];
  const re = /<span class="ak">([^<]+)<\/span>([\s\S]*?)(?=<span class="ak">|<\/div>|<h3>)/g;
  let m;
  while ((m = re.exec(keyDiv.inner))) {
    let id = stripTags(m[1]).trim();
    let html = m[2].replace(/^[\s.·]+/, '').replace(/[\s]+$/, '').replace(/\.\s*$/, '.');
    answerKey[id] = html.trim();
  }
}
assert(answerKey['1.1'] && answerKey['12.4'] && answerKey['Paper 1'], 'answer key parse failed');

// Checklist + closing notes
const checklistDiv = answerDivs[1];
const checklist = [...checklistDiv.inner.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1].trim());
assert(checklist.length === 15, 'expected 15 checklist items, got ' + checklist.length);
const checklistFootM = checklistDiv.inner.match(/<p class="note"[^>]*>[\s\S]*?<\/p>/);
const citeM = checklistDiv.inner.match(/<p><small class="cite">[\s\S]*?<\/small><\/p>/);

// -------------------------------------------------------- exercise extraction

// type table — every one of the 83 exercises is listed explicitly so that a
// source change that adds/removes/renames an exercise fails the build loudly.
const EX_TYPES = {
  '1.1': 'write', '1.2': 'write', '1.3': 'write', '1.4': 'tf', '1.5': 'match', '1.6': 'model',
  '2.1': 'gap', '2.2': 'match', '2.3': 'model', '2.4': 'reorder', '2.5': 'model', '2.6': 'write', '2.7': 'write', '2.8': 'free',
  '3.1': 'gap', '3.2': 'write', '3.3': 'gap', '3.4': 'write', '3.5': 'model', '3.6': 'gap', '3.7': 'gap',
  '4.1': 'write', '4.2': 'gap', '4.3': 'gap', '4.4': 'model', '4.5': 'gap', '4.6': 'model', '4.7': 'free',
  '5.1': 'gap', '5.2': 'gap', '5.3': 'model', '5.4': 'paradigm', '5.5': 'model', '5.6': 'model', '5.7': 'model',
  '6.1': 'gap', '6.2': 'gap', '6.3': 'gap', '6.4': 'write', '6.5': 'model', '6.6': 'model', '6.7': 'free',
  '7.1': 'write', '7.2': 'gap', '7.3': 'write', '7.4': 'reorder', '7.5': 'model', '7.6': 'model', '7.7': 'free',
  '8.1': 'gap', '8.2': 'model', '8.3': 'write', '8.4': 'choice', '8.5': 'gap', '8.6': 'model', '8.7': 'free',
  '9.1': 'gap', '9.2': 'gap', '9.3': 'gap', '9.4': 'model', '9.5': 'model', '9.6': 'model', '9.7': 'write',
  '10.1': 'gap', '10.2': 'gap', '10.3': 'model', '10.4': 'model', '10.5': 'model', '10.6': 'write', '10.7': 'free',
  '11.1': 'gap', '11.2': 'write', '11.3': 'gap', '11.4': 'model', '11.5': 'model', '11.6': 'write', '11.7': 'free',
  '12.1': 'model', '12.2': 'gap', '12.3': 'free', '12.4': 'free', '12.5': 'personal', '12.6': 'free',
};
const ORAL_EX = new Set(['6.7', '8.7', '12.6']);          // free exercises that also ask to speak aloud
// IPA-flavoured write exercises: answers/inputs compared ignoring slashes & stress marks
const IPA_INPUT_EX = new Set(['1.1']);
// write exercises where the expected answer keeps capitals meaningful (stressed syllable)
const CAPS_EX = new Set(['1.3']);

// explicit answer overrides where mechanical parsing of the key is ambiguous
const ANSWER_OVERRIDES = {
  '6.2': [['el meu'], ['la meva'], ['els meus'], ['les meves']],
  '6.3': [['el teu'], ['la nostra'], ['els seus'], ['les seves']],
};

function splitNumbered(txt) {
  // "1) foo 2) bar" → ["foo", "bar"]
  const parts = txt.split(/\s*\d+\)\s*/).filter(s => s.trim() !== '');
  return parts.map(s => s.replace(/[.\s]+$/, '').trim());
}
function splitDots(txt) { return txt.split('·').map(s => s.replace(/[.\s]+$/, '').trim()).filter(Boolean); }

function parseExercise(id, type, headHtml, bodyHtml_) {
  const keyHtml = answerKey[id] || '';
  const keyTxt = stripTags(keyHtml);
  const liMatches = [...bodyHtml_.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1]);
  const noteM = bodyHtml_.match(/<p class="note">[\s\S]*?<\/p>/);
  const ex = { id, type, title: headHtml, items: [], noteHtml: noteM ? noteM[0] : '', keyHtml };

  if (type === 'gap') {
    const answers = ANSWER_OVERRIDES[id] || null;
    const keyItems = answers ? null : splitNumbered(keyTxt);
    liMatches.forEach((li, i) => {
      const gaps = (li.match(/<span class="fill">/g) || []).length;
      assert(gaps >= 1, id + ' gap item without fill: ' + li);
      let ans;
      if (answers) ans = answers[i];
      else {
        const raw = keyItems[i];
        assert(raw !== undefined, id + ' missing key item ' + (i + 1));
        ans = gaps > 1 ? raw.split(' / ').map(s => s.trim()) : [raw];
        assert(ans.length === gaps, id + ' item ' + (i + 1) + ': ' + gaps + ' gaps but ' + ans.length + ' answers (' + raw + ')');
      }
      ex.items.push({ html: li, gaps, answers: ans });
    });
  } else if (type === 'write') {
    let keyItems;
    if (id === '3.2' || id === '4.1') keyItems = splitDots(keyTxt);
    else keyItems = splitNumbered(keyTxt);
    assert(keyItems.length === liMatches.length, id + ': ' + liMatches.length + ' items vs ' + keyItems.length + ' answers');
    liMatches.forEach((li, i) => ex.items.push({ html: li, answers: [keyItems[i]] }));
    ex.ipa = IPA_INPUT_EX.has(id); ex.caps = CAPS_EX.has(id);
  } else if (type === 'tf') {
    const keyItems = splitNumbered(keyTxt);
    assert(keyItems.length === liMatches.length, id + ' tf count mismatch');
    liMatches.forEach((li, i) => {
      const raw = keyItems[i];
      const val = /^true/i.test(raw) ? true : /^false/i.test(raw) ? false : null;
      assert(val !== null, id + ' tf unparsable: ' + raw);
      const note = raw.replace(/^(true|false)\s*(—\s*)?/i, '').trim();
      ex.items.push({ html: li, answer: val, note });
    });
  } else if (type === 'match') {
    const pairs = [...keyTxt.matchAll(/(\d+)-([a-e])/g)].map(m => [+m[1], m[2]]);
    assert(pairs.length === liMatches.length, id + ' match count mismatch');
    liMatches.forEach((li, i) => {
      const m = stripTags(li).match(/^(.*?)\s*\(([a-e])\)\s*(.*)$/);
      assert(m, id + ' match item unparsable: ' + li);
      ex.items.push({ left: m[1].trim(), letter: m[2], right: m[3].trim() });
    });
    ex.pairs = Object.fromEntries(pairs);
  } else if (type === 'reorder') {
    const keyItems = splitNumbered(keyTxt);
    assert(keyItems.length === liMatches.length, id + ' reorder count mismatch');
    liMatches.forEach((li, i) => {
      const tokens = stripTags(li).split(' / ').map(s => s.trim()).filter(Boolean);
      ex.items.push({ tokens, answer: keyItems[i] });
    });
  } else if (type === 'choice') {
    // 8.4: categorise food/drink. Options from the key "beguda: … · menjar: …"
    const cats = {};
    keyTxt.split('·').forEach(part => {
      const m = part.split(':');
      const cat = m[0].trim(), words = m[1].split(',').map(s => s.replace(/\.$/, '').trim());
      words.forEach(w => { cats[w] = cat; });
    });
    ex.options = [...new Set(Object.values(cats))].sort();
    liMatches.forEach(li => {
      const word = stripTags(li);
      assert(cats[word], id + ' uncategorised item: ' + word);
      ex.items.push({ html: li, answer: cats[word] });
    });
  } else if (type === 'paradigm') {
    // 5.4: six present forms of comprar; key is comma-separated, first form carries IPA
    const forms = keyTxt.replace(/\.$/, '').split(',').map(s => s.trim());
    assert(forms.length === 6, id + ' expected 6 forms, got ' + forms.length);
    const persons = ['jo', 'tu', 'ell/ella', 'nosaltres', 'vosaltres', 'ells/elles'];
    forms.forEach((f, i) => {
      const fm = f.match(/^(\S+)\s*(\/[^/]+\/)?$/);
      ex.items.push({ html: persons[i], answers: [fm ? fm[1] : f], ipaNote: fm && fm[2] ? fm[2] : '' });
    });
  } else if (type === 'model') {
    liMatches.forEach(li => ex.items.push({ html: li }));
    if (!liMatches.length && noteM) ex.items.push({ html: '' }); // single-prompt model task
  } else if (type === 'free' || type === 'personal') {
    liMatches.forEach(li => ex.items.push({ html: li }));
    ex.oral = ORAL_EX.has(id);
  } else fail('unknown type for ' + id);
  return ex;
}

function extractExercises(unitInner) {
  const out = [];
  for (const b of topLevel(unitInner)) {
    if (b.tag === 'div' && b.cls === 'ex') {
      const labM = b.inner.match(/<span class="label">EX ([\d.]+)<\/span>/);
      assert(labM, 'exercise without label');
      const id = labM[1];
      const headM = b.inner.match(/<h4>([\s\S]*?)<\/h4>/);
      assert(headM, 'exercise without title: ' + id);
      const type = EX_TYPES[id];
      assert(type, 'exercise ' + id + ' missing from EX_TYPES — source changed?');
      out.push(parseExercise(id, type, headM[1], b.inner));
    }
  }
  return out;
}

let totalEx = 0;
for (const u of units) {
  const headM = u.div.inner.match(/<div class="unit-head">[\s\S]*?<h2>([\s\S]*?)<\/h2>/);
  u.title = headM[1];
  u.exercises = extractExercises(u.div.inner);
  totalEx += u.exercises.length;
}
assert(totalEx === 83, 'expected 83 exercises, got ' + totalEx);
assert(Object.keys(EX_TYPES).length === 83, 'EX_TYPES must list exactly 83 exercises');

// ------------------------------------------------------------ page rendering

const NAV_PAGES = [
  { file: 'index.html', label: 'Home & progress', short: 'Home' },
  { file: 'ipa.html', label: 'IPA guide', short: 'IPA' },
];
const UNIT_PAGES = units.map(u => ({
  file: 'unit' + String(u.num).padStart(2, '0') + '.html',
  label: 'Unit ' + u.num, title: u.title, num: u.num,
}));
const TAIL_PAGES = [
  { file: 'exam.html', label: 'The official exam', short: 'Exam info' },
  { file: 'mock.html', label: 'Mock exam', short: 'Mock' },
  { file: 'glossary.html', label: 'Glossary', short: 'Glossary' },
];

function navHtml(current) {
  const link = (file, html, cls) =>
    `<a href="${file}" class="${cls || ''}${file === current ? ' current' : ''}">${html}</a>`;
  return `
<nav class="sidebar" id="sidebar" aria-label="Course navigation">
  <div class="nav-brand"><a href="index.html">Català<br><span>from Scratch · A1</span></a></div>
  <div class="nav-group">${NAV_PAGES.map(p => link(p.file, p.label)).join('')}</div>
  <div class="nav-group nav-units">
    ${UNIT_PAGES.map(p => link(p.file, `<span class="nav-unit-label">${p.label}</span><span class="nav-badge" data-unit="${p.num}"></span>`, 'nav-unit')).join('')}
  </div>
  <div class="nav-group">${TAIL_PAGES.map(p => link(p.file, p.label)).join('')}</div>
</nav>`;
}

function pageShell({ file, title, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Catalan from Scratch (A1)</title>
<link rel="stylesheet" href="style.css">
</head>
<body data-page="${file.replace('.html', '')}">
<header class="topbar">
  <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">☰</button>
  <span class="topbar-title">${title}</span>
</header>
${navHtml(file)}
<div class="backdrop" id="backdrop"></div>
<main class="content">
${body}
</main>
<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>`;
}

// ---- exercise rendering -----------------------------------------------------

function liStaticWithInputs(li) {
  let g = 0;
  return li.replace(/<span class="fill">___<\/span>/g, () =>
    `<input type="text" class="gap-input" data-gap="${g++}" autocapitalize="off" autocomplete="off" spellcheck="false">`);
}

function renderExercise(ex) {
  const head = `<div class="ex-head"><span class="label">EX ${ex.id}</span><h4>${ex.title}</h4><span class="ex-state" data-exstate="${ex.id}"></span></div>`;
  let body = '';
  const note = ex.noteHtml ? extBlank(ex.noteHtml) : '';

  if (ex.type === 'gap') {
    body = `<ol class="q">${ex.items.map(it => `<li>${liStaticWithInputs(it.html)} <span class="item-fb"></span></li>`).join('')}</ol>`;
  } else if (ex.type === 'write') {
    body = `<ol class="q">${ex.items.map(it =>
      `<li><span class="w-prompt">${it.html}</span> <input type="text" class="gap-input" data-gap="0" autocapitalize="off" autocomplete="off" spellcheck="false"> <span class="item-fb"></span></li>`).join('')}</ol>`;
  } else if (ex.type === 'paradigm') {
    body = `<ol class="q paradigm">${ex.items.map(it =>
      `<li><span class="w-prompt">${it.html}</span> <input type="text" class="gap-input" data-gap="0" autocapitalize="off" autocomplete="off" spellcheck="false"> <span class="pron paradigm-ipa"></span> <span class="item-fb"></span></li>`).join('')}</ol>`;
  } else if (ex.type === 'tf') {
    body = `<ol class="q">${ex.items.map((it, i) =>
      `<li><span class="w-prompt">${it.html}</span><span class="tf-btns" data-item="${i}"><button class="tf-btn" data-val="true">True</button><button class="tf-btn" data-val="false">False</button></span> <span class="item-fb"></span></li>`).join('')}</ol>`;
  } else if (ex.type === 'choice') {
    body = `<ol class="q">${ex.items.map((it, i) =>
      `<li><span class="w-prompt">${it.html}</span><span class="tf-btns" data-item="${i}">${ex.options.map(o =>
        `<button class="tf-btn" data-val="${esc(o)}">${esc(o)}</button>`).join('')}</span> <span class="item-fb"></span></li>`).join('')}</ol>`;
  } else if (ex.type === 'match') {
    body = `<div class="match" data-ex="${ex.id}">
      <div class="match-col match-left">${ex.items.map((it, i) => `<button class="match-item" data-side="l" data-key="${i}">${esc(it.left)}</button>`).join('')}</div>
      <div class="match-col match-right">${ex.items.map(it => `<button class="match-item" data-side="r" data-key="${it.letter}">(${it.letter}) ${esc(it.right)}</button>`).join('')}</div>
    </div><div class="match-pairs"></div>`;
  } else if (ex.type === 'reorder') {
    body = ex.items.map((it, i) => `<div class="reorder" data-item="${i}">
      <div class="reorder-pool">${it.tokens.map((t, j) => `<button class="chip" data-tok="${j}">${esc(t)}</button>`).join('')}</div>
      <div class="reorder-built"><span class="reorder-out"></span><button class="chip chip-undo" title="Remove last word">⌫</button></div>
      <span class="item-fb"></span></div>`).join('');
  } else if (ex.type === 'model') {
    if (ex.items.length && ex.items[0].html !== '') {
      body = `<ol class="q">${ex.items.map(it =>
        `<li><span class="w-prompt">${it.html}</span> <input type="text" class="gap-input model-input" autocapitalize="off" autocomplete="off" spellcheck="false"><span class="self-mark" hidden><button class="sm-btn sm-yes">✓ I got it</button><button class="sm-btn sm-no">✗ Not yet</button></span></li>`).join('')}</ol>`;
    } else {
      body = `${note}<textarea class="free-text" rows="3" spellcheck="false"></textarea><span class="self-mark" hidden><button class="sm-btn sm-yes">✓ I got it</button><button class="sm-btn sm-no">✗ Not yet</button></span>`;
    }
    body += `<div class="model-answer" hidden><div class="model-label">Model answer</div><div class="model-body">${ex.keyHtml}</div></div>`;
  } else if (ex.type === 'free') {
    const items = ex.items.length ? `<ol class="q">${ex.items.map(it => `<li>${it.html}</li>`).join('')}</ol>` : '';
    body = `${items}${note}<textarea class="free-text" rows="4" spellcheck="false" placeholder="Write here…"></textarea>
      ${ex.oral ? '<label class="said-aloud"><input type="checkbox" class="aloud-check"> I said it aloud</label>' : ''}
      <span class="self-mark" hidden><button class="sm-btn sm-yes">✓ I got it</button><button class="sm-btn sm-no">✗ Not yet</button></span>
      <div class="model-answer" hidden><div class="model-label">Model answer</div><div class="model-body">${ex.keyHtml}</div></div>`;
  } else if (ex.type === 'personal') {
    body = `<ol class="q">${ex.items.map(it => `<li>${liStaticWithInputs(it.html.replace(/___/g, '<span class="fill">___</span>'))}</li>`).join('')}</ol>
      <p class="note">Personal answers — fill it in as exam practice.</p>
      <span class="self-mark"><button class="sm-btn sm-yes">✓ Done</button></span>
      ${ex.keyHtml ? `<div class="model-answer" hidden><div class="model-label">Note</div><div class="model-body">${ex.keyHtml}</div></div>` : ''}`;
  }

  const noteOut = (ex.type !== 'model' && ex.type !== 'free' && ex.type !== 'personal') ? note : '';
  return `<div class="ex card" data-ex="${ex.id}" data-type="${ex.type}">${head}${noteOut}${body}<div class="ex-controls"></div></div>`;
}

// ---- unit pages -------------------------------------------------------------

function renderUnitBody(u) {
  const blocks = topLevel(u.div.inner);
  let html = '';
  let exHeaderDone = false;
  for (const b of blocks) {
    if (b.tag === 'div' && b.cls === 'unit-head') {
      html += `<div class="unit-head"><div class="unit-num">Unit ${u.num}</div><h2>${u.title}</h2></div>`;
    } else if (b.tag === 'div' && b.cls === 'ex') {
      if (!exHeaderDone) { html += '<h2 class="ex-section-head">Exercises</h2>'; exHeaderDone = true; }
      const labM = b.inner.match(/<span class="label">EX ([\d.]+)<\/span>/);
      const ex = u.exercises.find(e => e.id === labM[1]);
      html += renderExercise(ex);
    } else {
      html += extBlank(b.outer);
    }
  }
  const prev = u.num === 1 ? { file: 'ipa.html', label: 'IPA guide' } : { file: UNIT_PAGES[u.num - 2].file, label: 'Unit ' + (u.num - 1) };
  const next = u.num === 12 ? { file: 'exam.html', label: 'The official exam' } : { file: UNIT_PAGES[u.num].file, label: 'Unit ' + (u.num + 1) };
  html += `<div class="pager"><a href="${prev.file}">← ${prev.label}</a><a href="${next.file}">${next.label} →</a></div>`;
  return html;
}

// ---- index ------------------------------------------------------------------

function renderIndex() {
  const unitCards = units.map(u => `
    <a class="unit-card" href="${UNIT_PAGES[u.num - 1].file}">
      <div class="unit-card-num">Unit ${u.num}</div>
      <div class="unit-card-title">${u.title}</div>
      <div class="progress-bar"><div class="progress-fill" data-unitbar="${u.num}"></div></div>
      <div class="unit-card-stats" data-unitstats="${u.num}"></div>
    </a>`).join('');

  const body = `
<div class="hero">
  <div class="badge">CEFR · LEVEL A1 · EXAM PREPARATION</div>
  <h1>Catalan from Scratch</h1>
  <p class="hero-sub">A complete beginner's course in Central Catalan for English-speaking adults — built to pass the official A1 exam.</p>
  <p class="hero-meta">12 progressive units · 300+ words with full IPA · 83 interactive exercises · full mock A1 exam · complete glossary</p>
</div>

<div class="card dash">
  <h2>Your progress</h2>
  <div class="dash-overall">
    <div class="progress-bar big"><div class="progress-fill" id="overallBar"></div></div>
    <div id="overallStats" class="dash-stats"></div>
  </div>
  <div class="unit-grid">${unitCards}</div>
  <div class="dash-extra">
    <span id="mockStats"></span>
    <button id="resetProgress" class="btn btn-danger">Reset all progress</button>
  </div>
</div>

<div class="card">
${extBlank(introHtml)}
</div>

<div class="card" id="checklistCard">
  <h2>A1 self-assessment checklist</h2>
  <p>Tick what you can do confidently. All boxes ticked = you are ready to register for the exam.</p>
  <ul class="checklist interactive">
    ${checklist.map((c, i) => `<li><label><input type="checkbox" class="check-item" data-check="${i}"> <span>${c}</span></label></li>`).join('')}
  </ul>
  ${checklistFootM ? checklistFootM[0] : ''}
  ${citeM ? extBlank(citeM[0]) : ''}
</div>`;
  return pageShell({ file: 'index.html', title: 'Catalan A1 — Home', body });
}

// ---- ipa / exam pages ---------------------------------------------------------

function renderIpa() {
  return pageShell({ file: 'ipa.html', title: 'Reading the IPA', body: `<div class="card">${extBlank(ipaGuideDiv.inner)}</div>` });
}
function renderExamInfo() {
  return pageShell({ file: 'exam.html', title: 'The Official A1 Exam', body: `<div class="card">${extBlank(examPrepDiv.inner)}</div>` });
}

// ---- glossary -----------------------------------------------------------------

function renderGlossary() {
  const rows = glosRows.map(r =>
    `<tr><td class="ca">${esc(r.ca)}</td><td class="pron">${esc(r.ipa)}</td><td class="en">${esc(r.en)}</td><td class="g-unit">${r.unit}</td></tr>`).join('\n');
  const body = `
<div class="card">
  <h2>Glossary — every word in this course</h2>
  <p class="note">Alphabetical (articles ignored). U = the unit where the word is first taught. Pronunciations are Central Catalan, IPA. Click a column header to sort; click 🔊 to hear the word.</p>
  <div class="glos-tools">
    <input type="search" id="glosSearch" placeholder="Search Catalan, IPA or English… (${glosRows.length} entries)">
    <span id="glosCount"></span>
  </div>
  <table class="glos" id="glosTable">
    <thead><tr><th data-sort="0" class="sortable">Catalan</th><th data-sort="1" class="sortable">IPA</th><th data-sort="2" class="sortable">English</th><th data-sort="3" class="sortable">U.</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
</div>`;
  return pageShell({ file: 'glossary.html', title: 'Glossary', body });
}

// ---- mock exam ------------------------------------------------------------------

function parseMock() {
  const papers = [];
  for (const b of topLevel(mockDiv.inner)) {
    if (b.tag === 'div' && b.cls === 'exam') papers.push(b);
  }
  assert(papers.length === 4, 'expected 4 mock papers, got ' + papers.length);
  const introNote = mockDiv.inner.match(/<p class="note">[\s\S]*?<\/p>/)[0];

  // Paper 1
  const p1 = papers[0];
  const scriptM = p1.inner.match(/<p class="note">«([\s\S]*?)»<\/p>/);
  const p1items = [...p1.inner.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => stripTags(m[1]));
  const p1keyTxt = stripTags(answerKey['Paper 1']);
  const p1answers = splitNumbered(p1keyTxt).map(raw => ({
    val: /^V/.test(raw), note: raw.replace(/^[VF]\s*(—\s*)?/, '').trim(),
  }));
  assert(p1items.length === 6 && p1answers.length === 6, 'paper 1 parse');

  // Paper 2
  const p2 = papers[1];
  const p2noticeM = p2.inner.match(/<p class="note">«([\s\S]*?)»<\/p>/);
  const p2ols = [...p2.inner.matchAll(/<ol class="q">([\s\S]*?)<\/ol>/g)];
  const p2aItems = [...p2ols[0][1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => stripTags(m[1]));
  const p2bItems = [...p2ols[1][1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => {
    const t = stripTags(m[1]); const mm = t.match(/^(.*?)\s*\(([a-e])\)\s*(.*)$/);
    return { left: mm[1].trim(), letter: mm[2], right: mm[3].trim() };
  });
  const p2aKey = splitNumbered(stripTags(answerKey['Paper 2A']));
  const p2bPairs = Object.fromEntries([...stripTags(answerKey['Paper 2B']).matchAll(/(\d+)-([a-e])/g)].map(m => [+m[1], m[2]]));
  assert(p2aItems.length === 4 && p2bItems.length === 5, 'paper 2 parse');

  // Paper 3
  const p3 = papers[2];
  const p3form = [...p3.inner.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1]);
  const p3bTaskM = p3.inner.match(/<p><b>Task B[\s\S]*?<\/p>/);
  assert(p3form.length === 5 && p3bTaskM, 'paper 3 parse');

  // Paper 4
  const p4 = papers[3];
  const p4qs = [...p4.inner.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => stripTags(m[1]));
  const p4roleM = p4.inner.match(/<p><b>Part 2[\s\S]*?<\/p>/);
  const p4markM = p4.inner.match(/<p><b>Self-marking guide[\s\S]*?<\/p>/);
  assert(p4qs.length === 8 && p4roleM && p4markM, 'paper 4 parse');

  return {
    introNote, script: scriptM[1], p1items, p1answers,
    p2notice: p2noticeM[1], p2aItems, p2aKey, p2bItems, p2bPairs,
    p2aKeyHtml: answerKey['Paper 2A'],
    p3form, p3bTask: p3bTaskM[0], p3bModel: answerKey['Paper 3B model (38 words)'],
    p4qs, p4role: p4roleM[0], p4mark: p4markM[0],
    p4model: answerKey['Paper 4 model answers (Part 1)'], p4roleModel: answerKey['Paper 4 role-play skeleton'],
  };
}

function renderMock(mk) {
  const timer = (paper, mins) =>
    `<div class="paper-timer" data-paper="${paper}" data-mins="${mins}"><button class="btn timer-start">Start ${mins}-min timer</button><span class="timer-display"></span></div>`;

  const body = `
<div class="unit-head"><div class="unit-num">Mock exam · A1</div><h2>Full Practice Exam</h2></div>
${mk.introNote}
<div class="card exam-conditions">
  <label><input type="checkbox" id="examConditions"> <b>Exam conditions</b> — show per-paper timers (15 / 30 / 30 / 10 min). When time runs out the paper is marked "over time", but you can finish.</label>
</div>

<div class="card exam" id="paper1">
  <h4>Paper 1 · Comprensió oral (listening) — 15 min</h4>
  ${timer(1, 15)}
  <p>The script is read aloud <b>twice</b> with a pause, using your browser's Catalan voice. Don't read it — just listen, then answer.</p>
  <p><button class="btn btn-primary" id="playScript">▶ Play listening script (twice)</button> <button class="btn" id="stopScript" hidden>■ Stop</button> <span id="playState" class="note"></span></p>
  <ol class="q">
    ${mk.p1items.map((q, i) => `<li><span class="w-prompt">${esc(q)}</span><span class="tf-btns" data-item="${i}"><button class="tf-btn" data-val="true">V (vertader)</button><button class="tf-btn" data-val="false">F (fals)</button></span> <span class="item-fb"></span></li>`).join('')}
  </ol>
  <div class="ex-controls" id="p1controls"></div>
  <div id="scriptReveal" hidden><button class="btn" id="showScript">Show script</button>
    <p class="note script-text" hidden>«${esc(mk.script)}»</p></div>
</div>

<div class="card exam" id="paper2">
  <h4>Paper 2 · Comprensió lectora (reading) — 30 min</h4>
  ${timer(2, 30)}
  <p><b>Task A — Read this notice and answer.</b></p>
  <p class="note">«${esc(mk.p2notice)}»</p>
  <ol class="q" id="p2a">
    ${mk.p2aItems.map(q => `<li><span class="w-prompt">${esc(q)}</span> <input type="text" class="gap-input model-input" autocapitalize="off" spellcheck="false"><span class="self-mark" hidden><button class="sm-btn sm-yes">✓</button><button class="sm-btn sm-no">✗</button></span></li>`).join('')}
  </ol>
  <div class="model-answer" id="p2aModel" hidden><div class="model-label">Answers</div><div class="model-body">${mk.p2aKeyHtml}</div></div>
  <div class="ex-controls" id="p2aControls"></div>
  <p><b>Task B — Match each sign (1–5) to its meaning (a–e).</b></p>
  <div class="match" id="p2b">
    <div class="match-col match-left">${mk.p2bItems.map((it, i) => `<button class="match-item" data-side="l" data-key="${i}">${esc(it.left)}</button>`).join('')}</div>
    <div class="match-col match-right">${mk.p2bItems.map(it => `<button class="match-item" data-side="r" data-key="${it.letter}">(${it.letter}) ${esc(it.right)}</button>`).join('')}</div>
  </div><div class="match-pairs"></div>
  <div class="ex-controls" id="p2bControls"></div>
</div>

<div class="card exam" id="paper3">
  <h4>Paper 3 · Expressió escrita (writing) — 30 min</h4>
  ${timer(3, 30)}
  <p><b>Task A — Fill in this library-card application about yourself.</b></p>
  <ol class="q">${mk.p3form.map(li => `<li>${li.replace(/___/g, '<input type="text" class="gap-input personal-input" autocapitalize="off" spellcheck="false">')}</li>`).join('')}</ol>
  ${mk.p3bTask}
  <textarea class="free-text" id="p3text" rows="5" spellcheck="false" placeholder="Write your postcard here (35–45 words)…"></textarea>
  <div class="note">Words: <span id="p3words">0</span></div>
  <button class="btn" id="p3reveal">Show model answer</button>
  <div class="model-answer" id="p3model" hidden><div class="model-label">Model (38 words)</div><div class="model-body">${mk.p3bModel}</div></div>
  <span class="self-mark" id="p3mark" hidden><button class="sm-btn sm-yes">✓ I got it</button><button class="sm-btn sm-no">✗ Not yet</button></span>
</div>

<div class="card exam" id="paper4">
  <h4>Paper 4 · Expressió oral (speaking) — 10 min</h4>
  ${timer(4, 10)}
  <p><b>Part 1 — Answer these aloud in full sentences (the examiner's classic set):</b></p>
  <ol class="q" id="p4qs">
    ${mk.p4qs.map(q => `<li><span class="w-prompt">${esc(q)}</span> <label class="said-aloud"><input type="checkbox" class="aloud-check"> I said it aloud</label></li>`).join('')}
  </ol>
  ${mk.p4role}
  ${mk.p4mark}
  <button class="btn" id="p4reveal">Show model answers</button>
  <div class="model-answer" id="p4model" hidden>
    <div class="model-label">Model answers (Part 1)</div><div class="model-body">${mk.p4model}</div>
    <div class="model-label">Role-play skeleton</div><div class="model-body">${mk.p4roleModel}</div>
  </div>
  <span class="self-mark" id="p4mark2" hidden><button class="sm-btn sm-yes">✓ I got it</button><button class="sm-btn sm-no">✗ Not yet</button></span>
</div>

<div class="card">
  <h2>Save this attempt</h2>
  <p class="note">Finishes the sitting and stores the per-paper results (with today's date) in your browser.</p>
  <button class="btn btn-primary" id="saveAttempt">Finish &amp; save attempt</button>
  <h3>Attempt history</h3>
  <div id="attemptHistory" class="note">No attempts saved yet.</div>
</div>`;
  return pageShell({ file: 'mock.html', title: 'Mock A1 Exam', body });
}

// ------------------------------------------------------------------- data.js

function exerciseData(ex) {
  const d = { type: ex.type };
  if (ex.type === 'gap' || ex.type === 'write' || ex.type === 'paradigm') {
    d.answers = ex.items.map(it => it.answers);
    if (ex.ipa) d.ipa = true; if (ex.caps) d.caps = true;
    if (ex.type === 'paradigm') d.ipaNotes = ex.items.map(it => it.ipaNote);
  } else if (ex.type === 'tf') {
    d.answers = ex.items.map(it => ({ val: it.answer, note: it.note }));
  } else if (ex.type === 'choice') {
    d.answers = ex.items.map(it => it.answer);
  } else if (ex.type === 'match') {
    d.pairs = ex.pairs;
  } else if (ex.type === 'reorder') {
    d.answers = ex.items.map(it => ({ tokens: it.tokens, answer: it.answer }));
  }
  return d;
}

function buildData(mk) {
  const ex = {};
  for (const u of units) for (const e of u.exercises) ex[e.id] = exerciseData(e);
  const unitsMeta = units.map(u => ({ num: u.num, title: stripTags(u.title), exercises: u.exercises.map(e => e.id) }));
  const data = {
    counts: { units: 12, exercises: 83, glossary: glosRows.length },
    units: unitsMeta, ex,
    checklistCount: checklist.length,
    mock: {
      script: mk.script,
      p1: mk.p1answers, p2b: mk.p2bPairs,
    },
  };
  return 'window.CAT = ' + JSON.stringify(data) + ';\n';
}

// ----------------------------------------------------------------------- main

const mk = parseMock();
const pages = {
  'index.html': renderIndex(),
  'ipa.html': renderIpa(),
  'exam.html': renderExamInfo(),
  'glossary.html': renderGlossary(),
  'mock.html': renderMock(mk),
};
for (const u of units) {
  pages[UNIT_PAGES[u.num - 1].file] = pageShell({
    file: UNIT_PAGES[u.num - 1].file,
    title: 'Unit ' + u.num + ' · ' + stripTags(u.title),
    body: renderUnitBody(u),
  });
}

for (const [file, html] of Object.entries(pages)) fs.writeFileSync(path.join(ROOT, file), html);
fs.writeFileSync(path.join(ROOT, 'data.js'), buildData(mk));
fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');

// ------------------------------------------------------------------ report

const typeCounts = {};
for (const u of units) for (const e of u.exercises) typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
console.log('OK: 12 units, 83 exercises, ' + glosRows.length + ' glossary rows, ' + checklist.length + ' checklist items');
console.log('exercise types:', JSON.stringify(typeCounts));
console.log('pages written:', Object.keys(pages).length + 2, '(+ data.js, .nojekyll)');
