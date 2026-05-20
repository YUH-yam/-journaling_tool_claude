// ============================================================
//  Test harness for kokoro-note v3 (Apple HIG / split files)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const here = __dirname;
const htmlPath = path.join(here, 'kokoro-note.html');
const cssPath = path.join(here, 'styles.css');
const jsPath = path.join(here, 'app.js');

let passed = 0, failed = 0;
const fails = [];
const assert = (c, l) => { if (c) { passed++; console.log('  ✓', l); } else { failed++; fails.push(l); console.log('  ✗', l); } };
const section = n => console.log(`\n[${n}]`);

// ============================================================
// 0. PWA assets and file split structure
// ============================================================
section('0. ファイル構成 (split HTML/CSS/JS)');

assert(fs.existsSync(htmlPath), 'kokoro-note.html exists');
assert(fs.existsSync(cssPath), 'styles.css exists (separated)');
assert(fs.existsSync(jsPath), 'app.js exists (separated)');

const manifestPath = path.join(here, 'manifest.json');
const swPath = path.join(here, 'sw.js');
const icons = ['icon-192.svg','icon-512.svg','icon-maskable.svg','apple-touch-icon.svg'];
const readmePath = path.join(here, 'README.md');

assert(fs.existsSync(manifestPath), 'manifest.json exists');
assert(fs.existsSync(swPath), 'sw.js exists');
icons.forEach(f => assert(fs.existsSync(path.join(here, f)), `${f} exists`));
assert(fs.existsSync(readmePath), 'README.md exists');

// Manifest
const manifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifestJson.name && manifestJson.short_name, 'manifest has name/short_name');
assert(manifestJson.start_url, 'manifest has start_url');
assert(manifestJson.display === 'standalone', 'manifest display=standalone');
assert(/^#[0-9a-fA-F]{6}$/.test(manifestJson.theme_color), 'manifest has valid theme_color');
assert(/^#[0-9a-fA-F]{6}$/.test(manifestJson.background_color), 'manifest has valid background_color');
assert(Array.isArray(manifestJson.icons) && manifestJson.icons.length >= 2, 'manifest has ≥2 icons');
assert(manifestJson.icons.some(i => i.purpose && i.purpose.includes('maskable')), 'manifest has maskable icon');

// SW
const swSrc = fs.readFileSync(swPath, 'utf8');
assert(swSrc.includes("addEventListener('install'"), 'sw has install handler');
assert(swSrc.includes("addEventListener('activate'"), 'sw has activate handler');
assert(swSrc.includes("addEventListener('fetch'"), 'sw has fetch handler');
assert(swSrc.includes('caches.open'), 'sw uses Cache API');
assert(swSrc.includes('CACHE_NAME'), 'sw has versioned cache name');
assert(swSrc.includes('./styles.css'), 'sw precaches styles.css');
assert(swSrc.includes('./app.js'), 'sw precaches app.js');
assert(swSrc.includes('script.google.com'), 'sw excludes Apps Script from cache');

// Icons
icons.forEach(f => {
  const s = fs.readFileSync(path.join(here, f), 'utf8');
  assert(s.includes('<svg') && s.includes('xmlns="http://www.w3.org/2000/svg"'), `${f} valid SVG`);
});

// ============================================================
// 1. HTML structure (after split)
// ============================================================
section('1. HTML 構造 (Apple HIG準拠)');
const html = fs.readFileSync(htmlPath, 'utf8');

assert(html.startsWith('<!doctype html>'), 'doctype declared');
assert(/<html lang="ja">/.test(html), 'lang=ja set');
assert(/<meta name="viewport"[^>]+device-width/.test(html), 'mobile viewport meta');
assert(/<meta name="viewport"[^>]+viewport-fit=cover/.test(html), 'viewport-fit=cover for safe-area');
assert(/<link rel="stylesheet" href="\.\/styles\.css"/.test(html), 'styles.css linked externally');
assert(/<script src="\.\/app\.js"/.test(html), 'app.js linked externally');
assert(!/<style>/.test(html), 'no inline <style> block');
const inlineScript = html.match(/<script>([\s\S]+?)<\/script>/);
assert(!inlineScript || inlineScript[1].trim().length < 80, 'no large inline <script>');
assert(/<link rel="manifest" href="\.\/manifest\.json"/.test(html), 'external manifest linked');
assert(/<link rel="apple-touch-icon"/.test(html), 'apple-touch-icon linked');
assert(/apple-mobile-web-app-capable/.test(html), 'iOS standalone meta');
assert(/<meta name="theme-color"[^>]+prefers-color-scheme: light/.test(html), 'light theme-color meta');
assert(/<meta name="theme-color"[^>]+prefers-color-scheme: dark/.test(html), 'dark theme-color meta');

// New v3 screens
['screen-today','screen-methods','screen-insights','screen-settings'].forEach(id =>
  assert(html.includes(`id="${id}"`), `${id} present`));

// Tabs renamed: today/methods/insights/settings
['today','methods','insights','settings'].forEach(t =>
  assert(html.includes(`data-tab="${t}"`), `tab "${t}" present`));

// Sheets (bottom sheet pattern)
['sheet-method','sheet-session','sheet-log','sheet-detail'].forEach(id =>
  assert(html.includes(`id="${id}"`), `${id} bottom sheet present`));

assert(html.includes('id="scrim"'), 'scrim/backdrop present');
assert(html.includes('id="compact-nav"'), 'sticky compact nav present');
assert(html.includes('role="tablist"'), 'tab bar has ARIA role');
assert(html.includes('role="dialog"'), 'sheets/modal have ARIA role');
assert(html.includes('aria-modal="true"'), 'modal-style dialogs aria-modal');

// Other critical UI
assert(html.includes('id="skip-btn"'), 'skip-day button present');
assert(html.includes('id="prompt-shuffle"'), 'prompt shuffle present');
['set-name','set-reminder','set-sheets','set-sync','set-export','set-delete'].forEach(id =>
  assert(html.includes(`id="${id}"`), `settings row ${id} present`));
assert((html.match(/data-step="\d"/g) || []).length === 3, '3-step onboarding');
assert(html.includes('mood-btn'), 'mood selector present');
assert(html.includes('0570-064-556'), 'crisis hotline included');

// ============================================================
// 2. CSS / design tokens
// ============================================================
section('2. CSS デザイントークン');
const css = fs.readFileSync(cssPath, 'utf8');

assert(/--bg-base:/.test(css), 'bg-base token defined');
assert(/--label:/.test(css), 'label color token defined');
assert(/--accent:/.test(css), 'accent token defined');
assert(/--separator:/.test(css), 'separator token');
assert(/--t-large-title:/.test(css), 'iOS type scale (large title)');
assert(/--t-body:/.test(css), 'iOS type scale (body)');
assert(/--t-footnote:/.test(css), 'iOS type scale (footnote)');
assert(/--s-1:|--s-2:|--s-4:/.test(css), '4pt spacing tokens');
assert(/--r-3:|--r-4:|--r-5:/.test(css), 'radius tokens');
assert(/--ease:|--spring:/.test(css), 'motion tokens');
assert(/prefers-color-scheme:\s*dark/.test(css), 'dark mode media query');
assert(/prefers-reduced-motion:\s*reduce/.test(css), 'reduced-motion accessibility');
assert(/backdrop-filter/.test(css), 'blur material used (HIG)');
assert(/safe-area-inset/.test(css) || /env\(safe-area-inset/.test(css), 'safe-area handling');
assert(/min-height:\s*4[4-9]px|min-height:\s*5\dpx|min-height:\s*44px/.test(css), 'touch target ≥44px');
assert(/-apple-system/.test(css), 'SF Pro / system font stack');
assert(/Hiragino/.test(css), 'Japanese font in stack');
assert(/font-feature-settings/.test(css), 'font features (kerning/tabular)');
assert(/font-variation-settings|font-optical-sizing/.test(css), 'optical sizing for variable fonts');

// ============================================================
// 3. Load app.js under stub env (logic tests)
// ============================================================
section('3. app.js のロード');
const appJs = fs.readFileSync(jsPath, 'utf8');

const storage = new Map();
const localStorageStub = {
  getItem: k => storage.has(k) ? storage.get(k) : null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: k => storage.delete(k)
};

const elements = new Map();
function makeEl() {
  const el = {
    tagName: 'DIV', id: '', children: [], style: {}, dataset: {},
    classList: { _s: new Set(),
      add(...c){c.forEach(x=>this._s.add(x));},
      remove(...c){c.forEach(x=>this._s.delete(x));},
      toggle(c,v){ if (v===undefined) v=!this._s.has(c); v?this._s.add(c):this._s.delete(c); },
      contains(c){ return this._s.has(c); } },
    _attrs: {}, _listeners: {}, _text:'', _html:'', _value:'',
    get textContent(){return this._text;}, set textContent(v){this._text=String(v);},
    get innerHTML(){return this._html;}, set innerHTML(v){this._html=String(v);},
    get value(){return this._value;}, set value(v){this._value=String(v);},
    setAttribute(k,v){this._attrs[k]=v;}, getAttribute(k){return this._attrs[k];},
    appendChild(c){this.children.push(c); return c;}, remove(){},
    querySelectorAll(){return [];}, querySelector(){return null;},
    addEventListener(e,fn){(this._listeners[e]=this._listeners[e]||[]).push(fn);},
    dispatchEvent(e){(this._listeners[e.type]||[]).forEach(fn=>fn(e));},
    click(){this.dispatchEvent({type:'click'});}, focus(){}, blur(){}
  };
  return el;
}
function getOrMake(id){ if(!elements.has(id)) { const el=makeEl(); el.id=id; elements.set(id,el); } return elements.get(id); }
[...html.matchAll(/id="([^"]+)"/g)].forEach(m => getOrMake(m[1]));

const documentStub = {
  _ready: [],
  addEventListener(ev, fn) { if (ev === 'DOMContentLoaded') this._ready.push(fn); },
  getElementById(id) { return elements.get(id) || null; },
  querySelectorAll(sel) {
    const out = [];
    const dm = sel.match(/^\[data-([^\]]+)\]$/);
    if (dm) { elements.forEach(el => { if (dm[1] in el.dataset) out.push(el); }); return out; }
    if (sel === '.screen') { elements.forEach(el => { if (el.id && el.id.startsWith('screen-')) out.push(el); }); return out; }
    return out;
  },
  querySelector() { return null; },
  createElement: makeEl,
  body: { appendChild(){}, addEventListener(){}, style:{} }
};

const locationStub = { protocol: 'file:', hostname: '', hash: '', href: 'file:///kokoro-note.html' };
const navigatorStub = { vibrate: () => {}, clipboard: { writeText: async () => {} }, serviceWorker: undefined };

const windowStub = {
  addEventListener(){}, scrollTo(){},
  setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout,
  setInterval: globalThis.setInterval, clearInterval: globalThis.clearInterval,
  Notification: undefined,
  navigator: navigatorStub,
  location: locationStub,
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
  __kokoro: null
};

let scriptError = null;
try {
  const fn = new Function('window','document','localStorage','navigator','URL','Blob','fetch','location',
    appJs + '\nreturn window.__kokoro;');
  windowStub.__kokoro = fn(
    windowStub, documentStub, localStorageStub,
    navigatorStub, windowStub.URL,
    class { constructor() {} },
    async () => ({ ok: true }),
    locationStub
  );
} catch (e) { scriptError = e; }
assert(!scriptError, 'app.js parses & runs without throwing: ' + (scriptError && scriptError.message));
const k = windowStub.__kokoro;
assert(!!k, '__kokoro handle exported');
if (!k) { console.log('Summary:', passed, 'passed,', failed, 'failed'); process.exit(1); }

// ============================================================
// 4. Logic unit tests
// ============================================================
section('4. ロジック単体テスト');

assert(k.daysBetween('2025-01-10','2025-01-11') === 1, 'daysBetween: consecutive');
assert(k.daysBetween('2025-01-10','2025-01-10') === 0, 'daysBetween: same');
assert(k.daysBetween('2025-01-10','2025-02-01') === 22, 'daysBetween: cross month');
assert(/^\d{4}-\d{2}-\d{2}$/.test(k.todayKey()), 'todayKey YYYY-MM-DD');
assert(k.APP_VERSION === '3.0', `APP_VERSION = '3.0' (got ${k.APP_VERSION})`);

// Methods
assert(Array.isArray(k.METHODS) && k.METHODS.length === 10, `METHODS count = 10 (got ${k.METHODS.length})`);
const expectedMethods = ['three','gratitude','prompt','free','morning','emotion','compassion','cbt','weekend','goal'];
expectedMethods.forEach(id => assert(!!k.methodById(id), `method ${id} defined`));
// Categories
const cats = [...new Set(k.METHODS.map(m => m.cat))].sort();
assert(JSON.stringify(cats) === JSON.stringify(['beginner','core','depth','review']),
  'methods grouped into beginner/core/depth/review');
k.METHODS.forEach(m => {
  assert(typeof m.name === 'string' && m.name.length > 0, `method ${m.id} has name`);
  assert(Number.isInteger(m.defaultDuration) && m.defaultDuration > 0, `method ${m.id} has duration`);
  assert(Array.isArray(m.allowDurations) && m.allowDurations.includes(m.defaultDuration), `method ${m.id} allowDurations valid`);
  assert(typeof m.guide === 'string' && m.guide.length > 10, `method ${m.id} has guide`);
  assert(typeof m.iconBg === 'string' && /^#[0-9a-fA-F]{6}$/.test(m.iconBg), `method ${m.id} valid iconBg color`);
  assert(typeof m.iconFg === 'string' && /^#[0-9a-fA-F]{6}$/.test(m.iconFg), `method ${m.id} valid iconFg color`);
});

// Prompts
assert(k.PROMPTS.length >= 30, `prompts ≥ 30 (got ${k.PROMPTS.length})`);
assert(k.PROMPTS.includes(k.todayPrompt()), 'todayPrompt is from pool');

// Sessions / streak
k.reset();
const s1 = k.addSession({ method:'three', duration:180, mood:4, note:'落ち着いた' });
assert(s1.duration === 180, 'duration stored');
assert(s1.mood === 4, 'mood stored');
assert(s1.note === '落ち着いた', 'note stored');
assert(k.state.streak.current === 1, 'streak=1 after first');
assert(k.state.streak.totalDays === 1, 'totalDays=1');

k.addSession({ method:'gratitude', duration:180 });
assert(k.state.streak.current === 1, 'same-day extra: streak unchanged');
assert(k.state.streak.totalDays === 1, 'same-day extra: totalDays unchanged');

// Consecutive day
k.reset();
const yest = (() => { const d = new Date(); d.setDate(d.getDate()-1); return k.todayKey(d); })();
k.setState({
  settings: { onboarded:true, nickname:'', reminderTime:'', createdAt:new Date().toISOString(), sheetsUrl:'', sheetsLastSync:'' },
  sessions: [{ id:'y', date:yest, method:'three', duration:180, mood:null, note:'', createdAt:new Date().toISOString() }],
  streak: { current:1, longest:1, totalDays:1, lastDate:yest },
  promptSeed: 0
});
k.addSession({ method:'three', duration:180 });
assert(k.state.streak.current === 2, 'consecutive: streak=2');
assert(k.state.streak.longest === 2, 'longest updated');

// Gap reset
k.reset();
const threeAgo = (() => { const d = new Date(); d.setDate(d.getDate()-3); return k.todayKey(d); })();
k.setState({
  settings: { onboarded:true, nickname:'', reminderTime:'', createdAt:new Date().toISOString(), sheetsUrl:'', sheetsLastSync:'' },
  sessions: [{ id:'o', date:threeAgo, method:'three', duration:180, mood:null, note:'', createdAt:new Date().toISOString() }],
  streak: { current:1, longest:5, totalDays:1, lastDate:threeAgo },
  promptSeed: 0
});
k.addSession({ method:'three', duration:180 });
assert(k.state.streak.current === 1, 'gap reset to 1');
assert(k.state.streak.longest === 5, 'longest preserved on gap');

// Recompute after delete
k.reset();
const dN = n => { const d = new Date(); d.setDate(d.getDate()-n); return k.todayKey(d); };
k.setState({
  settings: { onboarded:true, nickname:'', reminderTime:'', createdAt:new Date().toISOString(), sheetsUrl:'', sheetsLastSync:'' },
  sessions: [
    { id:'a', date:dN(2), method:'three', duration:180, mood:null, note:'', createdAt:new Date().toISOString() },
    { id:'b', date:dN(1), method:'three', duration:180, mood:null, note:'', createdAt:new Date().toISOString() },
    { id:'c', date:dN(0), method:'three', duration:180, mood:null, note:'', createdAt:new Date().toISOString() }
  ],
  streak: { current:3, longest:3, totalDays:3, lastDate:dN(0) },
  promptSeed: 0
});
k.recomputeStreak();
assert(k.state.streak.current === 3 && k.state.streak.longest === 3, 'recompute 3 days');
k.deleteSession('b');
assert(k.state.sessions.length === 2, 'middle deleted');
assert(k.state.streak.longest === 1, 'longest recomputed to 1');
assert(k.state.streak.current === 1, 'current recomputed to 1');

// Skip
k.reset();
k.addSession({ method:'skip', duration:0 });
assert(k.state.streak.current === 1, 'skip counts toward streak');

// Normalization
k.reset();
const sLong = k.addSession({ method:'three', duration:60, note:'あ'.repeat(200) });
assert(sLong.note.length <= 60, `note truncated to 60`);
const sNeg = k.addSession({ method:'free', duration:-30 });
assert(sNeg.duration === 0, 'negative duration clamped');
const sFrac = k.addSession({ method:'free', duration:305.7 });
assert(sFrac.duration === 306, 'fractional rounded');

// ============================================================
// 5. Persistence
// ============================================================
section('5. localStorage 永続化');
k.reset();
k.addSession({ method:'gratitude', duration:180, mood:5, note:'コーヒー' });
const raw = localStorageStub.getItem('kokoro-note:v2');
assert(!!raw && raw.includes('コーヒー'), 'persisted to v2 key');
const parsed = JSON.parse(raw);
assert(parsed.sessions[0].note === 'コーヒー', 'note round-trip');
assert(parsed.sessions[0].mood === 5, 'mood round-trip');
assert(parsed.sessions[0].duration === 180, 'duration round-trip');

// ============================================================
// 6. Sheets sync payload
// ============================================================
section('6. Sheets 同期ペイロード');
k.reset();
k.addSession({ method:'three', duration:180, mood:4, note:'テスト' });
const payload = k.buildSyncPayload();
assert(Array.isArray(payload.sessions), 'payload.sessions array');
assert(payload.sessions.length === 1, '1 session');
assert(payload.sessions[0].methodName === '3行ジャーナル', 'methodName resolved');
assert(!('content' in payload.sessions[0]), 'no content field (privacy)');
assert(payload.sessions[0].note === 'テスト', 'note included');
assert(k.APPS_SCRIPT_CODE.includes('doPost'), 'Apps Script has doPost');
assert(k.APPS_SCRIPT_CODE.includes('SpreadsheetApp'), 'Apps Script uses SpreadsheetApp');

// ============================================================
// 7. Sheet (modal) infrastructure
// ============================================================
section('7. シート(モーダル)制御');
let openOk = true;
try {
  k.openSheet('sheet-method');
  k.openSheet('sheet-session');
  k.closeAllSheets();
} catch (e) { openOk = false; }
assert(openOk, 'openSheet / closeAllSheets no throw');

// ============================================================
// 8. Edge cases
// ============================================================
section('8. エッジケース');
k.reset();
k.deleteSession('nonexistent');
assert(k.state.sessions.length === 0, 'delete nonexistent no-op');

k.reset();
k.addSession({ method:'three' });
const s = k.state.sessions[0];
assert(s.duration === 0, 'missing duration defaults to 0');
assert(s.mood === null, 'missing mood defaults to null');
assert(s.note === '', 'missing note defaults to empty');

k.reset();
k.addSession({ method:'three', duration:60 });
k.reset();
assert(k.state.sessions.length === 0, 'reset clears sessions');
assert(k.state.streak.current === 0, 'reset clears streak');

// ============================================================
// Summary
// ============================================================
console.log('\n=================');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
if (failed > 0) { console.log('Failures:'); fails.forEach(f => console.log('  - ' + f)); process.exit(1); }
else { console.log('All tests passed.'); process.exit(0); }
