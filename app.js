/* ============================================================
   こころノート v3 — Application logic
   ============================================================ */

const STORAGE_KEY = 'kokoro-note:v2'; // keep v2 key for backward compat
const APP_VERSION = '4.0';

// ---------- Methods ----------
const METHODS = [
  { id:'three', cat:'beginner', name:'3行ジャーナル', icon:'3', iconBg:'#f1e2c8', iconFg:'#8a6d3a',
    duration:180, defaultDuration:180, allowDurations:[60,180,300], when:'1分でいい。続かない夜に',
    guide:'ノートに3行だけ書きます。①今日あったこと ②感じたこと ③明日の自分への一言。1行ずつで十分です。',
    hasPrompt:false },
  { id:'gratitude', cat:'beginner', name:'感謝日記', icon:'♥', iconBg:'#f7e8e0', iconFg:'#a86452',
    duration:180, defaultDuration:180, allowDurations:[180,300,600], when:'気分を少し持ち上げたい夜に',
    guide:'今日ありがたかったことを3つ。「なぜ良かったか」を一言だけ添えるのがコツ。',
    hasPrompt:false },
  { id:'prompt', cat:'beginner', name:'プロンプトに答える', icon:'?', iconBg:'#ebe4f1', iconFg:'#7a6a8a',
    duration:300, defaultDuration:300, allowDurations:[180,300,600], when:'白紙が怖い時に',
    guide:'画面の問いをノートに書き写し、答えていきます。書き写す行為が思考のスイッチになります。',
    hasPrompt:true },
  { id:'free', cat:'core', name:'フリーライティング', icon:'✎', iconBg:'#e9efe2', iconFg:'#5a6952',
    duration:300, defaultDuration:300, allowDurations:[180,300,600,900], when:'頭の中が散らかった時に',
    guide:'手を止めず、頭に浮かんだことを流します。文法・誤字は気にしません。書くことがなければ「書くことがない」と書いてOK。',
    hasPrompt:false },
  { id:'morning', cat:'core', name:'モーニングページ', icon:'☀', iconBg:'#fdf2e0', iconFg:'#a67a3a',
    duration:900, defaultDuration:900, allowDurations:[600,900,1200], when:'朝、社会モードになる前に',
    guide:'起きてすぐノートに3ページ書き流します。推敲なし、再読なし。最初は半ページでもOK。',
    hasPrompt:false },
  { id:'emotion', cat:'depth', name:'感情の棚卸し', icon:'◐', iconBg:'#e8e0f0', iconFg:'#7a5a85',
    duration:300, defaultDuration:300, allowDurations:[180,300,600], when:'モヤモヤの正体がわからない時',
    guide:'①今の感情を1つ ②どこから来たか ③体のどこで感じるか ④本当は何を求めているか。順に書いていきます。',
    hasPrompt:false },
  { id:'compassion', cat:'depth', name:'セルフコンパッション', icon:'♡', iconBg:'#f5e0e0', iconFg:'#a85555',
    duration:300, defaultDuration:300, allowDurations:[180,300,600], when:'自分責めが強い日に',
    guide:'きっかけ→自己批判の声→感情→「友人なら何と言うか」→思いやりある結論→今のケア。視点を切り替えます。',
    hasPrompt:false },
  { id:'cbt', cat:'depth', name:'CBT思考記録', icon:'⊞', iconBg:'#dde5ed', iconFg:'#5a7da3',
    duration:600, defaultDuration:600, allowDurations:[300,600,900], when:'不安や悲観で頭がいっぱいの時',
    guide:'状況→気分(%)→自動思考→根拠→反証→適応思考→再評価(%)。表のように書いていきます。',
    hasPrompt:false },
  { id:'weekend', cat:'review', name:'週末レビュー', icon:'◇', iconBg:'#e0e8e0', iconFg:'#5a7a5a',
    duration:600, defaultDuration:600, allowDurations:[300,600,900], when:'週末・月末の30分に',
    guide:'今週いちばん消耗したこと/助けになったこと/やめたいこと/続けたいこと/来週の焦点/最初の一歩。',
    hasPrompt:false },
  { id:'goal', cat:'review', name:'目標ジャーナリング', icon:'◎', iconBg:'#dceee0', iconFg:'#4d7a5e',
    duration:600, defaultDuration:600, allowDurations:[300,600,900], when:'方向性を整えたい時',
    guide:'三か月後どうありたいか→理由→今週の一歩→障害→if-then計画→進捗確認。',
    hasPrompt:false }
];

const PROMPTS = [
  '今、いちばん心に引っかかっていることは何?',
  '今日、小さくても良かったことは?',
  'もし不安が話せるなら、何と言っているだろう?',
  '1年後の自分は、今の私に何と声をかける?',
  '最近、自分を少しでも誇れた瞬間は?',
  '今の感情を1つ挙げるとしたら? それはどこから来た?',
  '今日、誰の言葉が残った?',
  '自分にしてあげたいことは何?',
  '最近、心がほどけた瞬間は?',
  '今、手放したいものは1つだけ何?',
  '今週、ありがとうを伝えたい人は?',
  '今日、自分の身体はどんな声を出している?',
  '5年前の自分が、今の私を見たら何と言う?',
  '本当は、誰に何と言ってほしい?',
  '何もしなくていい時間があったら、何をする?',
  '今日、避けようとしている感情はある?',
  '最近、繰り返している同じ悩みは?',
  '今、自分にとっての「ちょうどよさ」はどんな状態?',
  '怒りがあるとしたら、それは何を守ろうとしている?',
  '今日、自分を許してあげられることは?',
  '今、ちゃんと休めているのは身体のどこ?',
  '最近、無理して笑っていたことはある?',
  '本当はやめたい習慣は何?',
  '誰のために、何をやりすぎている?',
  '理想の朝は、どんなふうに始まる?',
  '今、自分の中で1番強い感情は? その下に何がある?',
  '今日、いちばん時間を奪われたものは?',
  '最近、勇気を出せた瞬間はあった?',
  '誰かに頼ってもよさそうな場面は?',
  '今夜、自分に贈れる小さな優しさは?'
];

// 今日のひと言: quotes.js (window.KOKORO_QUOTES) から読み込む。
// 各エントリは { t: 訳文/本文, a: 著者・出典, o?: 原文 (外国語の場合) }。
// フォールバック: quotes.js が読まれていない場合の最低限の備え。
const HINTS = (typeof window !== 'undefined' && Array.isArray(window.KOKORO_QUOTES) && window.KOKORO_QUOTES.length)
  ? window.KOKORO_QUOTES
  : [
      { t: '初心忘るべからず。', a: '世阿弥' },
      { t: '上善若水。', a: '老子' },
      { t: '七転び八起き。', a: 'ことわざ' }
    ];

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName('Kokoro Note');
    if (!sh) sh = ss.insertSheet('Kokoro Note');
    sh.clearContents();
    sh.appendRow(['日付','曜日','手法','所要時間(分)','気分','見出しメモ','記録時刻']);
    (body.sessions || []).forEach(s => {
      sh.appendRow([
        s.date,
        ['日','月','火','水','木','金','土'][new Date(s.date).getDay()],
        s.methodName,
        Math.round((s.duration || 0) / 60),
        s.mood || '',
        s.note || '',
        s.createdAt
      ]);
    });
    return ContentService.createTextOutput(
      JSON.stringify({ok:true, count: (body.sessions||[]).length})
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ok:false, error: String(err)})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}`;

const ENCOURAGE_BACK = '<strong style="color:var(--accent);">おかえりなさい。</strong> 空いた日があっても、習慣は復活します。今日はたった1行でOKです。';

// ---------- State ----------
const defaultState = () => ({
  settings: {
    nickname:'', reminderTime:'', onboarded:false,
    createdAt: new Date().toISOString(),
    sheetsUrl:'', sheetsLastSync:''
  },
  sessions: [],
  streak: { current:0, longest:0, totalDays:0, lastDate:'' },
  promptSeed: 0
});
let state = defaultState();

function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) { showToast('保存できませんでした'); } }
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw);
    if (p && typeof p === 'object') {
      state = Object.assign(defaultState(), p);
      state.settings = Object.assign(defaultState().settings, p.settings || {});
      state.streak = Object.assign(defaultState().streak, p.streak || {});
      state.sessions = Array.isArray(p.sessions) ? p.sessions : [];
      return true;
    }
  } catch(e) {}
  return false;
}

// ---------- Utilities ----------
function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function parseKey(k) { const [y,m,d] = k.split('-').map(Number); return new Date(y, m-1, d); }
function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
function formatDateLong(d) {
  const wd = ['日','月','火','水','木','金','土'][d.getDay()];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${wd}曜日`;
}
function formatDateShort(d) {
  const wd = ['日','月','火','水','木','金','土'][d.getDay()];
  return `${d.getMonth()+1}月${d.getDate()}日(${wd})`;
}
function timeGreet() {
  const h = new Date().getHours();
  if (h < 5) return '夜更かしお疲れさま';
  if (h < 10) return 'おはようございます';
  if (h < 17) return 'こんにちは';
  if (h < 22) return 'こんばんは';
  return 'お疲れさま';
}
function methodById(id) { return METHODS.find(m => m.id === id); }
function escapeHtml(s) { return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function fmtMin(sec) { if (!sec) return '—'; return Math.round(sec/60) + '分'; }
const MOOD_EMOJI = ['','😢','😕','😐','🙂','😊'];
const MOOD_LABEL = ['','つらい','もやもや','ふつう','すこし軽い','穏やか'];

// ---------- Prompt ----------
function todayPrompt() {
  const d = new Date();
  const seed = d.getFullYear()*1000 + (d.getMonth()+1)*31 + d.getDate() + (state.promptSeed||0);
  return PROMPTS[seed % PROMPTS.length];
}
function shufflePrompt() {
  state.promptSeed = (state.promptSeed||0) + 1;
  save();
  const p = todayPrompt();
  const el = document.getElementById('today-prompt'); if (el) el.textContent = p;       // Today
  const pp = document.getElementById('prep-prompt-text'); if (pp) pp.textContent = p;    // Prep
  const sp = document.getElementById('session-prompt-text'); if (sp) sp.textContent = p; // Session
}

// ---------- Hint (今日のひと言) ----------
// 日数ベースのseedで、365日連続して同じヒントが出ないことを保証する。
// HINTS.length が 366 以上であれば、1年間被らない。
function hintForDate(d) {
  const len = (HINTS && HINTS.length) ? HINTS.length : 1;
  const dayNum = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  // promptSeed をシフト量として加算 (シャッフルボタンで日跨ぎを擬似的に変える)
  const seed = dayNum + (state.promptSeed || 0);
  return HINTS[((seed % len) + len) % len];
}
function todayHint() { return hintForDate(new Date()); }
function shuffleHint() {
  state.promptSeed = (state.promptSeed || 0) + 1;
  save();
  renderPrepHint();
  renderTodayHint();
}

// ---------- Session CRUD & streak ----------
function addSession({method, duration=0, mood=null, note=''}) {
  const id = 's' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  const dateKey = todayKey();
  const sess = {
    id, date:dateKey, method,
    duration: Math.max(0, Math.round(duration||0)),
    mood: mood || null,
    note: (note||'').trim().slice(0,60),
    createdAt: new Date().toISOString()
  };
  state.sessions.push(sess);
  updateStreakOnEntry(dateKey);
  save();
  return sess;
}
function deleteSession(id) {
  state.sessions = state.sessions.filter(s => s.id !== id);
  recomputeStreak();
  save();
}
function updateStreakOnEntry(dateKey) {
  const s = state.streak;
  if (!s.lastDate) { s.current=1; s.longest=1; s.totalDays=1; s.lastDate=dateKey; return; }
  if (s.lastDate === dateKey) return;
  const gap = daysBetween(s.lastDate, dateKey);
  if (gap === 1) s.current += 1;
  else if (gap > 1) s.current = 1;
  else if (gap < 0) { s.totalDays += 1; return; }
  if (s.current > s.longest) s.longest = s.current;
  s.totalDays += 1;
  s.lastDate = dateKey;
}
function recomputeStreak() {
  const dateKeys = [...new Set(state.sessions.map(e => e.date))].sort();
  if (!dateKeys.length) { state.streak = { current:0, longest:0, totalDays:0, lastDate:'' }; return; }
  let cur = 1, longest = 1;
  for (let i = 1; i < dateKeys.length; i++) {
    if (daysBetween(dateKeys[i-1], dateKeys[i]) === 1) { cur++; if (cur > longest) longest = cur; }
    else cur = 1;
  }
  const last = dateKeys[dateKeys.length - 1];
  const gap = daysBetween(last, todayKey());
  state.streak = { current: (gap === 0 || gap === 1) ? cur : 0, longest, totalDays: dateKeys.length, lastDate: last };
}

// ---------- Render: Today ----------
// 状況に応じた「今やること」を一文で返す。脳を働かせず読むだけで分かるように。
function buildTodayCopy() {
  const today = todayKey();
  const hasToday = state.sessions.some(s => s.date === today && s.method !== 'skip');
  const skippedToday = state.sessions.some(s => s.date === today && s.method === 'skip');
  const total = state.streak.totalDays;
  const current = state.streak.current;
  const longest = state.streak.longest;
  const gap = state.streak.lastDate ? daysBetween(state.streak.lastDate, today) : -1;

  // 推奨手法を曜日でローテーション(入門カテゴリのみ)
  const beginners = METHODS.filter(m => m.cat === 'beginner');
  const sug = beginners[new Date().getDay() % beginners.length];
  const sugSub = `おすすめ: ${sug.name} · ${Math.round(sug.defaultDuration/60)}分`;

  // 既に今日書いた
  if (hasToday) {
    return {
      headline: '今日は、もう書けましたね。',
      ctaLabel: 'もう一度、書く',
      ctaSub: sugSub,
      streak: current > 1 ? `🌿 ${current}日続いています` : `🌱 今日も書けました`
    };
  }
  // 今日「休む」だけ記録した
  if (skippedToday) {
    return {
      headline: '今日はゆっくり休みましょう。',
      ctaLabel: 'やっぱり書いてみる',
      ctaSub: sugSub,
      streak: '🍵 おやすみの記録'
    };
  }
  // まったくの新規(初回)
  if (total === 0) {
    return {
      headline: '今夜、最初の1行を書いてみませんか。',
      ctaLabel: 'はじめる',
      ctaSub: sugSub,
      streak: '🌱 はじめての夜'
    };
  }
  // 2日以上空いた = 復帰
  if (current === 0 && gap >= 2) {
    return {
      headline: 'おかえりなさい。\n今夜、3行だけ書きませんか。',
      ctaLabel: '1行から再開する',
      ctaSub: sugSub,
      streak: `🍂 これまで ${total}日`
    };
  }
  // 昨日まで書いていた = 連続中
  if (current >= 1) {
    return {
      headline: `今日も、3分だけ書きましょうか。`,
      ctaLabel: 'はじめる',
      ctaSub: sugSub,
      streak: current >= 7 ? `🌳 ${current}日続いています` : `🌿 ${current}日続いています`
    };
  }
  // フォールバック
  return {
    headline: '今日は、3分だけ書いてみませんか。',
    ctaLabel: 'はじめる',
    ctaSub: sugSub,
    streak: total > 0 ? `🍂 これまで ${total}日` : '🌱 はじめての夜'
  };
}

function renderToday() {
  const nick = state.settings.nickname;
  document.getElementById('greet-text').textContent = timeGreet() + (nick ? `、${nick}さん` : '');
  document.getElementById('today-date').textContent = formatDateLong(new Date());

  const copy = buildTodayCopy();
  // 改行を尊重(headlineに\nを含めることがある)
  const hl = document.getElementById('today-headline');
  hl.innerHTML = escapeHtml(copy.headline).replace(/\n/g, '<br>');
  document.getElementById('cta-label').textContent = copy.ctaLabel;
  document.getElementById('cta-sub').textContent = copy.ctaSub;
  document.getElementById('today-streak').textContent = copy.streak;
  // 今日のひと言と今日の問いは Today にもジャーナリングの種として表示し、Prepと同じ内容を同期
  renderTodayHint();
  const tp = document.getElementById('today-prompt');
  if (tp) tp.textContent = todayPrompt();
}

// Prep シート内の「今日のひと言」を描画(出典付き、外国語は原文も表示)
function renderPrepHint() {
  const h = todayHint();
  if (!h) return;
  const textEl = document.getElementById('prep-hint-text');
  const origEl = document.getElementById('prep-hint-original');
  const attrEl = document.getElementById('prep-hint-attr');
  if (textEl) textEl.textContent = h.t || '';
  if (origEl) {
    if (h.o) { origEl.textContent = h.o; origEl.hidden = false; }
    else { origEl.textContent = ''; origEl.hidden = true; }
  }
  if (attrEl) attrEl.textContent = h.a ? ('— ' + h.a) : '—';
}

// Prep シート内の「今日の問い」を描画
function renderPrepPrompt() {
  const el = document.getElementById('prep-prompt-text');
  if (el) el.textContent = todayPrompt();
}

// Today画面の「今日のひと言」描画 — Prepと同じソース。
function renderTodayHint() {
  const h = todayHint();
  if (!h) return;
  const t = document.getElementById('today-hint-text');
  const a = document.getElementById('today-hint-attr');
  if (t) t.textContent = h.t || '';
  if (a) a.textContent = h.a ? ('— ' + h.a) : '—';
}

function renderEntry(s) {
  const w = document.createElement('button');
  w.className = 'entry';
  w.dataset.entryId = s.id;
  const m = methodById(s.method);
  const methodName = s.method === 'skip' ? '休み' : (m ? m.name : s.method);
  const moodIcon = s.mood ? MOOD_EMOJI[s.mood] : '';
  const isSkip = s.method === 'skip';

  w.innerHTML = `
    <span class="e-dot ${isSkip ? 'skip' : ''}"></span>
    <div class="e-main">
      <div class="e-row1">
        <span class="e-method">${escapeHtml(methodName)}</span>
        <span class="e-date">· ${formatDateShort(parseKey(s.date))}</span>
      </div>
      <div class="e-meta">
        ${s.duration ? `<span>${fmtMin(s.duration)}</span>` : ''}
        ${moodIcon ? `<span>${moodIcon}</span>` : ''}
        ${s.note ? `<span class="e-note">${escapeHtml(s.note)}</span>` : ''}
      </div>
    </div>
  `;
  w.addEventListener('click', () => openDetailSheet(s.id));
  return w;
}

// ---------- Render: Methods ----------
function renderMethods() {
  const cats = { beginner:'methods-beginner', core:'methods-core', depth:'methods-depth', review:'methods-review' };
  Object.values(cats).forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
  METHODS.forEach(m => {
    const list = document.getElementById(cats[m.cat]);
    if (!list) return;
    const b = document.createElement('button');
    b.className = 'method-row';
    b.innerHTML = `
      <span class="icon-tile" style="background:${m.iconBg};color:${m.iconFg};">${m.icon}</span>
      <div class="m-main">
        <div class="m-name">${escapeHtml(m.name)}</div>
        <div class="m-meta">${fmtMin(m.defaultDuration)} · ${escapeHtml(m.when)}</div>
      </div>`;
    b.addEventListener('click', () => openMethodDetailSheet(m.id));
    list.appendChild(b);
  });
}

// ---------- Method detail sheet ----------
function openMethodDetailSheet(id) {
  const m = methodById(id);
  if (!m) return;
  document.getElementById('method-sheet-title').textContent = m.name;
  const body = document.getElementById('method-sheet-body');
  body.innerHTML = `
    <div class="method-detail">
      <div class="hero-ico" style="background:${m.iconBg};color:${m.iconFg};">${m.icon}</div>
      <div class="name">${escapeHtml(m.name)}</div>
      <div class="when">${escapeHtml(m.when)}</div>
      <div class="info-tiles">
        <div class="t"><div class="l">時間</div><div class="v">${fmtMin(m.defaultDuration)}</div></div>
        <div class="t"><div class="l">カテゴリ</div><div class="v" style="font-size:var(--t-callout);">${({beginner:'入門',core:'コア',depth:'深める',review:'振り返り'})[m.cat]}</div></div>
      </div>
      <div class="body"><strong>進め方:</strong> ${escapeHtml(m.guide)}</div>
      <div class="actions-stack" style="padding:0;">
        <button class="btn btn-filled block" id="method-start" data-method="${m.id}">セッションを始める</button>
      </div>
    </div>`;
  body.querySelector('#method-start').addEventListener('click', () => {
    closeSheet('sheet-method');
    setTimeout(() => startSession(m.id), 260);
  });
  openSheet('sheet-method');
}

// ---------- Session sheet ----------
let session = null;
let timerInterval = null;

function startSession(methodId) {
  const m = methodById(methodId);
  if (!m) return;
  session = {
    method:methodId, durationSet:m.defaultDuration, remaining:m.defaultDuration,
    elapsed:0, running:false
  };
  document.getElementById('session-method-tag').textContent = ({beginner:'入門',core:'コア',depth:'深める',review:'振り返り'})[m.cat] || '';
  document.getElementById('session-method-title').textContent = m.name;
  document.getElementById('session-guide').innerHTML = `<strong>進め方</strong>: ${escapeHtml(m.guide)}`;

  const pb = document.getElementById('session-prompt');
  if (m.hasPrompt) {
    pb.style.display = '';
    document.getElementById('session-prompt-text').textContent = todayPrompt();
  } else pb.style.display = 'none';

  // duration chips
  const row = document.getElementById('dur-chips');
  row.innerHTML = '';
  m.allowDurations.forEach(sec => {
    const c = document.createElement('button');
    c.className = 'dur-chip' + (sec === m.defaultDuration ? ' active' : '');
    c.textContent = (sec >= 60) ? (sec/60) + '分' : sec + '秒';
    c.dataset.sec = sec;
    c.addEventListener('click', () => {
      if (session.running) return;
      session.durationSet = sec; session.remaining = sec;
      row.querySelectorAll('.dur-chip').forEach(x => x.classList.toggle('active', Number(x.dataset.sec) === sec));
      renderTimer();
    });
    row.appendChild(c);
  });
  renderTimer();
  document.getElementById('timer-toggle').textContent = '開始';
  document.getElementById('timer-label').textContent = '準備OK';
  document.getElementById('timer-fg-ring').classList.remove('running');
  openSheet('sheet-session');
}

function renderTimer() {
  if (!session) return;
  const m = Math.floor(session.remaining / 60);
  const s = session.remaining % 60;
  document.getElementById('timer-clock').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const fg = document.getElementById('timer-fg-ring');
  const total = session.durationSet;
  const done = total - session.remaining;
  const C = 2 * Math.PI * 124;
  fg.setAttribute('stroke-dasharray', C.toFixed(2));
  fg.setAttribute('stroke-dashoffset', (C * (1 - done/total)).toFixed(2));
}
function startTimer() {
  if (!session || session.running) return;
  session.running = true;
  document.getElementById('timer-toggle').textContent = '一時停止';
  document.getElementById('timer-label').textContent = '書いています';
  document.getElementById('timer-fg-ring').classList.add('running');
  timerInterval = setInterval(() => {
    session.remaining -= 1; session.elapsed += 1;
    if (session.remaining <= 0) {
      session.remaining = 0; stopTimer();
      document.getElementById('timer-label').textContent = '時間です';
      try { navigator.vibrate && navigator.vibrate([80,60,80,60,200]); } catch(e) {}
      showToast('時間です。続けても、ここで止めても。');
    }
    renderTimer();
  }, 1000);
}
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (session) session.running = false;
  const btn = document.getElementById('timer-toggle');
  if (btn) btn.textContent = (session && session.elapsed > 0) ? '再開' : '開始';
  const fg = document.getElementById('timer-fg-ring');
  if (fg) fg.classList.remove('running');
}
function toggleTimer() { if (!session) return; if (session.running) stopTimer(); else startTimer(); }

function finishSession() {
  stopTimer();
  if (!session) { closeSheet('sheet-session'); return; }
  const elapsed = session.elapsed || (session.durationSet - session.remaining);
  pendingLog = { method:session.method, duration:elapsed, mood:null, note:'' };
  const m = methodById(session.method);
  document.getElementById('log-sub').textContent = `${m.name} · ${fmtMin(elapsed) || '短時間'}`;
  document.querySelectorAll('#mood-row .mood-btn').forEach(b => b.classList.remove('active'));
  closeSheet('sheet-session');
  setTimeout(() => openSheet('sheet-log'), 260);
}

function cancelSession() {
  if (session && session.elapsed > 30) {
    openModal({
      title:'中止しますか?',
      body:'これまでの時間は完了で記録できます。中止すると今のセッションは捨てます。',
      okText:'中止する',
      onOk:() => { stopTimer(); session = null; closeSheet('sheet-session'); }
    });
  } else {
    stopTimer(); session = null; closeSheet('sheet-session');
  }
}

// ---------- Log sheet ----------
let pendingLog = null;
function saveLog() {
  if (!pendingLog) return;
  addSession({ method:pendingLog.method, duration:pendingLog.duration, mood:pendingLog.mood, note:pendingLog.note });
  pendingLog = null; session = null;
  closeSheet('sheet-log');
  showToast('お疲れさま。記録しました。');
  renderToday();
}
function skipLogMeta() {
  if (!pendingLog) return;
  addSession({ method:pendingLog.method, duration:pendingLog.duration });
  pendingLog = null; session = null;
  closeSheet('sheet-log');
  showToast('お疲れさま。記録しました。');
  renderToday();
}

// ---------- Prep sheet (心を整える: 書く前の頭をまとめる) ----------
// シンプル設計: 呼吸アニメ + 任意タグ + 書きはじめるボタンのみ。
// タグは記録に残さない(プライバシーと「補助ツール」の原則)。
let breathTimer = null;
function startBreathCycle() {
  const el = document.getElementById('breath-text');
  if (!el) return;
  el.textContent = '吸う';
  let phase = 0;
  breathTimer = setInterval(() => {
    phase = (phase + 1) % 2;
    el.textContent = phase === 0 ? '吸う' : '吐く';
  }, 4000);
}
function stopBreathCycle() {
  if (breathTimer) { clearInterval(breathTimer); breathTimer = null; }
}
function openPrep() {
  // タグ選択を毎回リセット(記録しない)
  document.querySelectorAll('#sheet-prep .prep-tag').forEach(t => t.classList.remove('active'));
  // 今日のひと言・問いを描画
  renderPrepHint();
  renderPrepPrompt();
  // 推奨手法を「書きはじめる」ボタン下のサブテキストへ
  const subEl = document.getElementById('prep-cta-sub');
  if (subEl) {
    const beginners = METHODS.filter(m => m.cat === 'beginner');
    const m = beginners[new Date().getDay() % beginners.length];
    subEl.textContent = `おすすめ: ${m.name} · ${Math.round(m.defaultDuration/60)}分`;
  }
  openSheet('sheet-prep');
  startBreathCycle();
}
function startSessionFromPrep() {
  stopBreathCycle();
  closeSheet('sheet-prep');
  setTimeout(() => {
    const beginners = METHODS.filter(m => m.cat === 'beginner');
    const m = beginners[new Date().getDay() % beginners.length];
    startSession(m.id);
  }, 220);
}

// ---------- Skip-day ----------
function handleSkipDay() {
  openModal({
    title:'今日は書けないと記録しますか?',
    body:'空白のままより、たった一つの「書けない」のほうが、習慣を切らさずに済みます。',
    okText:'記録する',
    onOk:() => {
      const today = todayKey();
      const ex = state.sessions.find(e => e.date === today && e.method === 'skip');
      if (ex) { showToast('今日はすでに記録されています'); return; }
      addSession({ method:'skip', duration:0 });
      showToast('お疲れさま。また明日。');
      renderToday();
    }
  });
}

// ---------- Insights ----------
let calMonth = (() => { const d = new Date(); return {y:d.getFullYear(), m:d.getMonth()}; })();
let reviewFilter = 'all';
let reviewSearch = '';

function renderInsights() {
  document.getElementById('stat-total').textContent = state.streak.totalDays;
  document.getElementById('stat-longest').textContent = state.streak.longest;
  const ym = todayKey().slice(0,7);
  const monthDays = [...new Set(state.sessions.filter(e => e.date.slice(0,7) === ym).map(e => e.date))].length;
  document.getElementById('stat-month').textContent = monthDays;
  const moods = state.sessions.map(s => s.mood).filter(m => m != null && m >= 1);
  if (moods.length) {
    const avg = moods.reduce((a,b)=>a+b,0)/moods.length;
    const i = Math.max(1, Math.min(5, Math.round(avg)));
    document.getElementById('stat-mood').textContent = MOOD_EMOJI[i];
    document.getElementById('stat-mood-sub').textContent = `${moods.length}件の平均`;
  } else {
    document.getElementById('stat-mood').textContent = '—';
    document.getElementById('stat-mood-sub').textContent = '記録なし';
  }
  renderCalendar(); render30Bars(); renderDonut(); renderFilters(); renderEntries();
}

function renderCalendar() {
  const body = document.getElementById('cal-body');
  const { y, m } = calMonth;
  document.getElementById('cal-title').textContent = `${y}年${m+1}月`;
  const startDow = new Date(y, m, 1).getDay();
  const days = new Date(y, m+1, 0).getDate();
  const prev = new Date(y, m, 0).getDate();
  const today = todayKey();
  const map = {};
  state.sessions.forEach(s => {
    if (!map[s.date]) map[s.date] = s.method === 'skip' ? 'skipped' : 'written';
    else if (map[s.date] === 'skipped' && s.method !== 'skip') map[s.date] = 'written';
  });
  let html = `<div class="cal-grid">
    <div class="cal-dow sun">日</div><div class="cal-dow">月</div><div class="cal-dow">火</div>
    <div class="cal-dow">水</div><div class="cal-dow">木</div><div class="cal-dow">金</div>
    <div class="cal-dow sat">土</div>`;
  for (let i = 0; i < startDow; i++) {
    const d = prev - startDow + 1 + i;
    html += `<div class="cal-cell other"><span>${d}</span><span class="dot"></span></div>`;
  }
  for (let d = 1; d <= days; d++) {
    const k = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const kind = map[k] || '';
    const t = k === today ? ' today' : '';
    html += `<div class="cal-cell${t}${kind?' '+kind:''}" data-date="${k}"><span>${d}</span><span class="dot"></span></div>`;
  }
  const tail = (7 - ((startDow + days) % 7)) % 7;
  for (let i = 1; i <= tail; i++) html += `<div class="cal-cell other"><span>${i}</span><span class="dot"></span></div>`;
  html += `</div>`;
  body.innerHTML = html;
  body.querySelectorAll('.cal-cell[data-date]').forEach(c => c.addEventListener('click', () => {
    const k = c.dataset.date;
    const es = state.sessions.filter(e => e.date === k);
    if (es.length) openDetailSheet(es[0].id);
  }));
}

function render30Bars() {
  const wrap = document.getElementById('bars-30');
  wrap.innerHTML = '';
  const dateMap = {};
  state.sessions.forEach(s => {
    if (!dateMap[s.date]) dateMap[s.date] = {count:0, skip:false};
    dateMap[s.date].count += 1;
    if (s.method === 'skip') dateMap[s.date].skip = true;
  });
  const today = todayKey();
  let maxC = 1;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const k = todayKey(d);
    if (dateMap[k]) maxC = Math.max(maxC, dateMap[k].count);
  }
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const k = todayKey(d);
    const entry = dateMap[k];
    const bar = document.createElement('div');
    bar.className = 'bar';
    if (entry && entry.skip && entry.count === 1) bar.classList.add('skip');
    if (k === today) bar.classList.add('today');
    bar.style.height = (entry ? Math.max(10, (entry.count/maxC)*100) : 3) + '%';
    wrap.appendChild(bar);
  }
  const start = new Date(); start.setDate(start.getDate() - 29);
  document.getElementById('bars-x-start').textContent = `${start.getMonth()+1}/${start.getDate()}`;
}

function renderDonut() {
  const card = document.getElementById('donut-card');
  const counts = {};
  state.sessions.forEach(s => { if (s.method !== 'skip') counts[s.method] = (counts[s.method]||0) + 1; });
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  if (total === 0) { card.style.display = 'none'; return; }
  card.style.display = '';
  const sorted = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const colors = ['#6b8163','#c69247','#c47866','#9a7a8e','#82909d','#8a9a7f','#c4a578','#a87b6b','#7a6a8a','#6c8b9a'];
  const svg = document.getElementById('donut-svg');
  let offset = 25;
  let inner = `<circle cx="21" cy="21" r="15.915" fill="var(--bg-elevated)"/>`;
  sorted.forEach(([id, c], i) => {
    const pct = (c/total) * 100;
    inner += `<circle cx="21" cy="21" r="15.915" fill="none" stroke="${colors[i % colors.length]}" stroke-width="7" stroke-dasharray="${pct.toFixed(2)} ${(100-pct).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"/>`;
    offset += pct;
  });
  svg.innerHTML = inner;
  document.getElementById('donut-legend').innerHTML = sorted.map(([id, c], i) => {
    const m = methodById(id);
    const pct = Math.round((c/total)*100);
    return `<div class="li"><div class="name"><span class="swatch" style="background:${colors[i % colors.length]};"></span>${escapeHtml(m ? m.name : id)}</div><div class="v">${c} (${pct}%)</div></div>`;
  }).join('');
}

function renderFilters() {
  const wrap = document.getElementById('filter-chips');
  const opts = [['all','すべて'], ['three','3行'], ['gratitude','感謝'], ['prompt','プロンプト'], ['free','フリー'], ['morning','モーニング'], ['emotion','感情'], ['compassion','コンパッション'], ['cbt','CBT'], ['weekend','週末'], ['goal','目標'], ['skip','休み']];
  wrap.innerHTML = '';
  opts.forEach(([id, label]) => {
    const b = document.createElement('button');
    b.className = 'chip' + (reviewFilter === id ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => { reviewFilter = id; renderFilters(); renderEntries(); });
    wrap.appendChild(b);
  });
}

function renderEntries() {
  const list = document.getElementById('entry-list');
  let arr = [...state.sessions].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  if (reviewFilter !== 'all') arr = arr.filter(s => s.method === reviewFilter);
  if (reviewSearch) arr = arr.filter(s => (s.note||'').toLowerCase().includes(reviewSearch.toLowerCase()));
  list.innerHTML = '';
  if (!arr.length) { list.innerHTML = '<div class="empty"><div class="icon">📂</div>該当する記録はありません</div>'; return; }
  arr.slice(0, 50).forEach(s => list.appendChild(renderEntry(s)));
}

// ---------- Entry detail sheet ----------
let detailEntryId = null;
function openDetailSheet(id) {
  const s = state.sessions.find(x => x.id === id);
  if (!s) return;
  detailEntryId = id;
  const m = methodById(s.method);
  const methodName = s.method === 'skip' ? '休み' : (m ? m.name : s.method);
  const moodIcon = s.mood ? MOOD_EMOJI[s.mood] : '';
  const moodLabel = s.mood ? MOOD_LABEL[s.mood] : '';
  document.getElementById('sheet-detail-body').innerHTML = `
    <div style="padding: 0 var(--s-4);">
      <div style="text-align:center; margin: var(--s-3) 0;">
        <div style="font-size: var(--t-caption-1); color: var(--label-secondary); letter-spacing: 0.06em; text-transform: uppercase;">${formatDateLong(parseKey(s.date))}</div>
        <h2 style="margin: var(--s-2) 0 0; font-size: var(--t-title-1); font-weight: 700; letter-spacing: -0.015em;">${escapeHtml(methodName)}</h2>
      </div>
      <div class="info-tiles" style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2); margin-bottom: var(--s-3);">
        ${s.duration ? `<div class="t" style="background:var(--bg-elevated);padding:var(--s-3);border-radius:var(--r-3);text-align:center;"><div style="font-size:var(--t-caption-1);color:var(--label-secondary);letter-spacing:0.04em;">所要時間</div><div style="font-family:var(--font-serif);font-size:var(--t-title-3);font-weight:600;margin-top:2px;">${fmtMin(s.duration)}</div></div>` : ''}
        ${s.mood ? `<div class="t" style="background:var(--bg-elevated);padding:var(--s-3);border-radius:var(--r-3);text-align:center;"><div style="font-size:var(--t-caption-1);color:var(--label-secondary);letter-spacing:0.04em;">気分</div><div style="font-size:var(--t-title-3);font-weight:600;margin-top:2px;">${moodIcon} ${moodLabel}</div></div>` : ''}
      </div>
      ${s.note ? `<div class="card" style="margin:0 0 var(--s-3);"><div class="prompt-label">見出し</div><div style="font-size: var(--t-body); margin-top: var(--s-1);">${escapeHtml(s.note)}</div></div>` : ''}
      <div class="card" style="background:var(--accent-tint);margin:0 0 var(--s-3);box-shadow:none;">
        <p style="margin:0;font-size:var(--t-footnote);line-height:1.7;color:var(--label);">
          本文はあなたのノートにあります。<br>読み返したくなったら、紙のページを開いてみてください。
        </p>
      </div>
      <button class="btn btn-danger block" id="detail-delete">この記録を削除</button>
      <div class="spacer-lg"></div>
    </div>`;
  document.getElementById('detail-delete').addEventListener('click', () => {
    openModal({
      title:'この記録を削除しますか?', body:'取り消せません。', okText:'削除',
      onOk:() => { deleteSession(detailEntryId); detailEntryId = null; closeSheet('sheet-detail'); showToast('削除しました'); renderInsights(); renderToday(); }
    });
  });
  openSheet('sheet-detail');
}

// ---------- Settings ----------
function renderSettings() {
  document.getElementById('set-name-val').textContent = state.settings.nickname || '—';
  document.getElementById('set-reminder-val').textContent = state.settings.reminderTime || '未設定';
  const sUrl = state.settings.sheetsUrl;
  document.getElementById('sheets-label').textContent = sUrl ? '連携済み' : '設定する';
  document.getElementById('sheets-sub').textContent = sUrl ? '別のURLに変更するにはここをタップ' : 'あなた自身のGoogleアカウントだけに同期';
  const syncBtn = document.getElementById('set-sync');
  if (sUrl) { syncBtn.disabled = false; syncBtn.style.opacity = '1'; }
  else { syncBtn.disabled = true; syncBtn.style.opacity = '0.4'; }
  document.getElementById('sync-sub').textContent = state.settings.sheetsLastSync
    ? '最終同期: ' + new Date(state.settings.sheetsLastSync).toLocaleString('ja-JP')
    : (sUrl ? '未同期' : 'まず連携を設定');
}

// ---------- Sheets sync ----------
function buildSyncPayload() {
  return {
    sessions: state.sessions.map(s => {
      const m = methodById(s.method);
      return {
        id:s.id, date:s.date, method:s.method,
        methodName: s.method === 'skip' ? '休み' : (m ? m.name : s.method),
        duration:s.duration, mood:s.mood, note:s.note, createdAt:s.createdAt
      };
    })
  };
}
async function syncToSheets() {
  const url = state.settings.sheetsUrl;
  if (!url) { showToast('まず連携設定を行ってください'); return; }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec\b/.test(url)) {
    showToast('URLの形式が正しくありません'); return;
  }
  showToast('同期中…');
  try {
    await fetch(url, { method:'POST', mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify(buildSyncPayload()) });
    state.settings.sheetsLastSync = new Date().toISOString();
    save(); renderSettings();
    showToast(`${state.sessions.length}件を送信しました`);
  } catch(e) { showToast('同期に失敗しました'); }
}

function openSheetsSetup() {
  const cur = state.settings.sheetsUrl || '';
  const extra = `
    <div class="steps">
      <ol>
        <li>Googleで新しいスプレッドシートを作る</li>
        <li>メニュー <strong>拡張機能 → Apps Script</strong> を開く</li>
        <li>下のコードを<strong>すべてコピー</strong>して貼り付け、保存</li>
        <li>右上<strong>「デプロイ → 新しいデプロイ」</strong>→ 種類は<strong>ウェブアプリ</strong></li>
        <li>「実行: 自分」「アクセス: 全員」に設定</li>
        <li>表示されたウェブアプリURLを下にペースト</li>
      </ol>
      <div class="code-block" id="code-block">${escapeHtml(APPS_SCRIPT_CODE)}</div>
      <button class="btn btn-tinted small" id="copy-code" type="button">コードをコピー</button>
      <div class="field" style="margin: var(--s-3) 0 0;">
        <div class="field-label" style="padding-left:0;">ウェブアプリURL</div>
        <input class="field-input" type="url" id="sheets-url-input" placeholder="https://script.google.com/macros/s/.../exec" value="${escapeHtml(cur)}" />
        <div class="field-hint">あなたのGoogleアカウントだけに送信されます。</div>
      </div>
    </div>`;
  openModal({
    title:'Google Sheets 連携',
    body:'メタ情報のみ同期します(本文は元から保存されていません)。',
    okText:'保存', extra,
    onOk:() => {
      const v = (document.getElementById('sheets-url-input').value||'').trim();
      if (v && !/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec/.test(v)) {
        showToast('Apps Script ウェブアプリURLが必要です'); return;
      }
      state.settings.sheetsUrl = v;
      save(); renderSettings();
      showToast(v ? '連携を保存しました' : '連携を解除しました');
    }
  });
  setTimeout(() => {
    const cb = document.getElementById('copy-code');
    if (cb) cb.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
        cb.textContent = 'コピーしました'; setTimeout(() => { cb.textContent = 'コードをコピー'; }, 1500);
      } catch(e) { showToast('コピーに失敗しました'); }
    });
  }, 50);
}

// ---------- Onboarding ----------
function startOnboarding() {
  document.getElementById('onb').classList.add('show');
  document.getElementById('app').style.display = 'none';
  showOnbStep(0);
}
function showOnbStep(i) {
  document.querySelectorAll('.onb-step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.onb-step[data-step="${i}"]`).classList.add('active');
}
function finishOnboarding() {
  const name = (document.getElementById('onb-name').value||'').trim().slice(0,20);
  state.settings.nickname = name; state.settings.onboarded = true;
  save();
  document.getElementById('onb').classList.remove('show');
  document.getElementById('app').style.display = 'block';
  goScreen('today');
}

// ---------- Export / delete ----------
function exportJSON() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `kokoro-note-${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('書き出しました');
}
function deleteAll() {
  openModal({
    title:'すべてのデータを削除しますか?',
    body:'記録・設定・連続日数すべてが消えます。取り消せません。',
    okText:'削除する',
    onOk:() => {
      localStorage.removeItem(STORAGE_KEY);
      state = defaultState(); save();
      showToast('削除しました');
      startOnboarding();
    }
  });
}

// ---------- Reminder ----------
async function setupReminder(timeStr) {
  state.settings.reminderTime = timeStr; save();
  if (timeStr && 'Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch(e) {}
  }
  scheduleReminder();
}
function scheduleReminder() {
  if (window._rt) clearTimeout(window._rt);
  const t = state.settings.reminderTime;
  if (!t || !/^\d{2}:\d{2}$/.test(t)) return;
  const [hh, mm] = t.split(':').map(Number);
  const target = new Date(); target.setHours(hh, mm, 0, 0);
  if (target <= new Date()) target.setDate(target.getDate() + 1);
  window._rt = setTimeout(() => {
    try { if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('こころノート', {body:'紙とペン、用意できますか?'});
    } } catch(e) {}
    scheduleReminder();
  }, target - new Date());
}

// ---------- Navigation ----------
function goScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
  const el = document.getElementById('screen-' + name);
  if (el) {
    el.style.display = 'block';
    const t = el.dataset.title || '';
    document.getElementById('compact-title').textContent = t;
  }
  document.querySelectorAll('.tabbar .tab').forEach(t => {
    const a = t.dataset.tab === name;
    t.classList.toggle('active', a);
    t.setAttribute('aria-selected', a ? 'true' : 'false');
  });
  if (name === 'today') renderToday();
  if (name === 'methods') renderMethods();
  if (name === 'insights') renderInsights();
  if (name === 'settings') renderSettings();
  window.scrollTo({top: 0});
  // hide compact nav initially
  document.getElementById('compact-nav').classList.remove('show');
}

// ---------- Sheets infra ----------
let openSheets = [];
function openSheet(id) {
  const sh = document.getElementById(id); if (!sh) return;
  document.getElementById('scrim').classList.add('show');
  sh.classList.add('open');
  openSheets.push(id);
  document.body.style.overflow = 'hidden';
}
function closeSheet(id) {
  const sh = document.getElementById(id); if (!sh) return;
  sh.classList.remove('open');
  openSheets = openSheets.filter(x => x !== id);
  if (id === 'sheet-prep') stopBreathCycle();
  if (openSheets.length === 0) {
    document.getElementById('scrim').classList.remove('show');
    document.body.style.overflow = '';
  }
}
function closeAllSheets() {
  openSheets.forEach(id => {
    const sh = document.getElementById(id); if (sh) sh.classList.remove('open');
  });
  openSheets = [];
  stopBreathCycle();
  document.getElementById('scrim').classList.remove('show');
  document.body.style.overflow = '';
}

// ---------- Modal ----------
let modalOnOk = null;
function openModal({title, body, okText='OK', cancelText='キャンセル', extra='', onOk=null}) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  document.getElementById('modal-extra').innerHTML = extra;
  document.getElementById('modal-ok').textContent = okText;
  document.getElementById('modal-cancel').textContent = cancelText;
  modalOnOk = onOk;
  document.getElementById('modal-scrim').classList.add('show');
}
function closeModal() { document.getElementById('modal-scrim').classList.remove('show'); modalOnOk = null; }

// ---------- Toast ----------
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// ---------- Wiring ----------
function wire() {
  // Tabs
  document.querySelectorAll('.tabbar .tab').forEach(t =>
    t.addEventListener('click', () => goScreen(t.dataset.tab)));

  // Today CTAs — 書く前にまず「整える」を必ず通す
  document.getElementById('cta-write').addEventListener('click', openPrep);
  document.getElementById('cta-pick').addEventListener('click', () => goScreen('methods'));
  document.getElementById('skip-btn').addEventListener('click', handleSkipDay);
  const ps = document.getElementById('prompt-shuffle');
  if (ps) ps.addEventListener('click', shufflePrompt);

  // 心を整える(prep)
  const prepBtn = document.getElementById('prep-btn');
  if (prepBtn) prepBtn.addEventListener('click', openPrep);
  const prepStart = document.getElementById('prep-start');
  if (prepStart) prepStart.addEventListener('click', startSessionFromPrep);
  const hintShuffle = document.getElementById('hint-shuffle');
  if (hintShuffle) hintShuffle.addEventListener('click', shuffleHint);
  document.querySelectorAll('#prep-tags .prep-tag').forEach(t => {
    t.addEventListener('click', () => t.classList.toggle('active'));
  });

  // Session controls
  document.getElementById('timer-toggle').addEventListener('click', toggleTimer);
  document.getElementById('session-done').addEventListener('click', finishSession);
  document.getElementById('session-cancel').addEventListener('click', cancelSession);

  // Log
  // 気分タップ = その場で保存。入力欄やボタンを介さない最短動作。
  document.querySelectorAll('#mood-row .mood-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#mood-row .mood-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    if (pendingLog) {
      pendingLog.mood = Number(b.dataset.mood);
      // 視覚フィードバックを少しだけ見せてから閉じる
      setTimeout(saveLog, 220);
    }
  }));
  document.getElementById('log-skip-meta').addEventListener('click', skipLogMeta);

  // Insights
  document.getElementById('cal-prev').addEventListener('click', () => {
    calMonth.m -= 1; if (calMonth.m < 0) { calMonth.m = 11; calMonth.y -= 1; } renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calMonth.m += 1; if (calMonth.m > 11) { calMonth.m = 0; calMonth.y += 1; } renderCalendar();
  });
  document.getElementById('search-input').addEventListener('input', e => {
    reviewSearch = e.target.value; renderEntries();
  });

  // Onboarding
  let oi = 0;
  document.querySelectorAll('[data-onb-next]').forEach(b => b.addEventListener('click', () => { oi = Math.min(2, oi+1); showOnbStep(oi); }));
  document.querySelectorAll('[data-onb-prev]').forEach(b => b.addEventListener('click', () => { oi = Math.max(0, oi-1); showOnbStep(oi); }));
  document.getElementById('onb-start').addEventListener('click', finishOnboarding);

  // Settings
  document.getElementById('set-name').addEventListener('click', () => {
    openModal({
      title:'ニックネーム', body:'空欄も可。',
      okText:'保存',
      extra:`<div class="field" style="margin:0;"><input class="field-input" type="text" id="modal-input" maxlength="20" value="${escapeHtml(state.settings.nickname||'')}" placeholder="ニックネーム"/></div>`,
      onOk:() => {
        state.settings.nickname = (document.getElementById('modal-input').value||'').trim().slice(0,20);
        save(); renderSettings(); renderToday(); showToast('保存しました');
      }
    });
  });
  document.getElementById('set-reminder').addEventListener('click', () => {
    openModal({
      title:'リマインダー時刻', body:'通知を出す時刻(ブラウザの通知許可が必要)。空欄で解除。',
      okText:'保存',
      extra:`<div class="field" style="margin:0;"><input class="field-input" type="time" id="modal-time" value="${state.settings.reminderTime||''}"/></div>`,
      onOk: async () => {
        const v = document.getElementById('modal-time').value;
        await setupReminder(v); renderSettings();
        showToast(v ? `${v} に通知します` : '解除しました');
      }
    });
  });
  document.getElementById('set-sheets').addEventListener('click', openSheetsSetup);
  document.getElementById('set-sync').addEventListener('click', () => { if (!document.getElementById('set-sync').disabled) syncToSheets(); });
  document.getElementById('set-export').addEventListener('click', exportJSON);
  document.getElementById('set-delete').addEventListener('click', deleteAll);

  // Modal
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-ok').addEventListener('click', () => { const cb = modalOnOk; closeModal(); if (cb) cb(); });
  document.getElementById('modal-scrim').addEventListener('click', e => { if (e.target.id === 'modal-scrim') closeModal(); });

  // Close sheet buttons
  document.querySelectorAll('[data-close-sheet]').forEach(b =>
    b.addEventListener('click', () => closeSheet(b.dataset.closeSheet)));
  document.getElementById('scrim').addEventListener('click', closeAllSheets);

  // Compact nav appearance on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const nav = document.getElementById('compact-nav');
    nav.classList.toggle('show', y > 56);
    lastScroll = y;
  }, { passive: true });
}

function boot() {
  const loaded = load();
  wire();
  if (!loaded || !state.settings.onboarded) {
    startOnboarding();
  } else {
    document.getElementById('app').style.display = 'block';
    goScreen('today');
    scheduleReminder();
  }
}

document.addEventListener('DOMContentLoaded', boot);

// PWA: Service Worker registration (only on https or localhost)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', {scope: './'})
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing; if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              try { showToast('新しいバージョンを準備しました'); } catch(e) {}
            }
          });
        });
      }).catch(() => {});
  });
}

// Hash navigation (manifest shortcuts)
window.addEventListener('hashchange', () => {
  const h = (location.hash||'').replace('#', '');
  if (['today','methods','insights','settings'].includes(h)) goScreen(h);
});
if (location.hash) {
  const h = location.hash.replace('#','');
  if (['methods','insights','settings'].includes(h)) {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => goScreen(h), 80));
  }
}

// ---------- Expose for testing ----------
window.__kokoro = {
  get state() { return state; },
  setState(s) { state = s; save(); },
  reset() { localStorage.removeItem(STORAGE_KEY); state = defaultState(); },
  addSession, deleteSession, recomputeStreak,
  todayKey, daysBetween, todayPrompt, shufflePrompt, todayHint, hintForDate, shuffleHint,
  startSession, finishSession, cancelSession, startTimer, stopTimer, toggleTimer,
  saveLog, skipLogMeta, handleSkipDay,
  openPrep, startSessionFromPrep, startBreathCycle, stopBreathCycle,
  renderPrepHint, renderPrepPrompt, renderTodayHint,
  buildSyncPayload, exportJSON, buildTodayCopy, renderToday,
  goScreen, openDetailSheet, openMethodDetailSheet,
  openSheet, closeSheet, closeAllSheets,
  METHODS, PROMPTS, HINTS, APPS_SCRIPT_CODE, methodById,
  APP_VERSION,
  get session() { return session; },
  get pendingLog() { return pendingLog; },
  setReviewFilter(f) { reviewFilter = f; }
};
