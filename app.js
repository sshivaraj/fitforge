// FitForge web app: vanilla JS, no build step. State is kept in localStorage.
"use strict";

/* ---------------- Persistence ---------------- */
const KEY = "fitforge.v1";
const DEFAULT = { onboarded: false, name: "", goal: "", level: 1, weight: 70, voice: true, coach: "auto", voiceRate: 1, coachVoice: {},
  active: null, progress: {}, sessions: [], daily: {}, thirty: {}, activity: {}, xp: 0, programsDone: 0 };
let S = load();
if (S.voiceV !== 2) { S.coachVoice = {}; S.voiceRate = 1; S.voiceV = 2; save(); }
function load() {
  try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || "{}")); }
  catch { return { ...DEFAULT }; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }

/* ---------------- Helpers ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const dkey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dkey(new Date());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dayNum = d => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
const fmtTime = s => `${Math.floor(s / 60)}:${pad(s % 60)}`;
const levelDots = l => "●".repeat(l) + "○".repeat(3 - l);
const LEVEL_NAMES = ["", "Beginner", "Intermediate", "Advanced"];

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

function logActivity(xp) {
  const k = today(); S.activity[k] = (S.activity[k] || 0) + 1; S.xp += xp; save();
}

function streaks() {
  const days = new Set(Object.keys(S.activity));
  let cur = 0, d = new Date();
  if (!days.has(dkey(d))) d = addDays(d, -1);
  while (days.has(dkey(d))) { cur++; d = addDays(d, -1); }
  const sorted = [...days].sort(); let best = 0, run = 0, prev = null;
  for (const k of sorted) {
    const n = dayNum(new Date(k + "T00:00"));
    run = prev !== null && n === prev + 1 ? run + 1 : 1; prev = n; best = Math.max(best, run);
  }
  return { cur, best: Math.max(best, cur) };
}

function summary() {
  const st = streaks();
  return {
    workouts: S.sessions.length,
    minutes: S.sessions.reduce((a, s) => a + s.mins, 0),
    kcal: S.sessions.reduce((a, s) => a + s.kcal, 0),
    dailies: Object.keys(S.daily).length,
    streak: st.cur, bestStreak: st.best,
    programsDone: S.programsDone,
    thirtyDone: Object.values(S.thirty).filter(t => t.done >= 30).length,
  };
}
function levelInfo() {
  const per = 500, lvl = Math.floor(S.xp / per);
  return { n: lvl + 1, name: LEVELS[Math.min(lvl, LEVELS.length - 1)], into: S.xp % per, per };
}

function dailyFor(date) {
  const n = dayNum(date);
  return DAILY[((n * 2654435761) >>> 0) % DAILY.length];
}

const TIPS = [
  "Warm up for at least 5 minutes. Warm muscles and joints perform better and get hurt less.",
  "Progressive overload drives results: add a rep, a few seconds or a round each week.",
  "Form first. A slow, controlled rep beats three sloppy ones.",
  "Aim for 150 minutes of moderate activity a week (WHO guideline). That's about 22 minutes a day.",
  "Protein helps recovery. Aim for roughly 1.6 g per kg of body weight if you're building muscle.",
  "Sleep is when you adapt. 7 to 9 hours makes every workout count more.",
  "Exhale on the hard part of the movement (pushing or standing up).",
  "Sore for 1 or 2 days is normal. Sharp pain is not: stop and rest.",
  "Rest days are part of training. Light walking and mobility speed up recovery.",
  "Consistency beats intensity. A 10-minute workout done beats a 60-minute one skipped.",
];

/* ---------------- Illustrations ---------------- */
// Signature exercise of a workout = first move of its main section.
function signature(w) {
  const main = w.sections.find(s => !/warm|cool/i.test(s.name)) || w.sections[0];
  return main.items[0].id;
}
const thumb = id => `<div class="thumb">${FIG.svg(id)}</div>`;
const heroFig = id => `<div class="hero-fig">${FIG.svg(id, { light: true, anim: true })}</div>`;
// Daily challenges that map to a specific move get its figure.
const DAILY_EX = { "100 Squats": "squats", "Push-up Ladder": "pushups", "3-Minute Plank": "plank", "Burpee Pyramid": "burpees",
  "Wall Sit Stack": "wall_sit", "Lunge Walk": "reverse_lunge", "Mobility Minute ×5": "worlds_greatest", "Stair Climber": "step_ups",
  "Core 200": "bicycle", "Glute Bridge 100": "glute_bridge", "Jumping Jack 300": "jumping_jacks", "Dead Hang / Wall Angel": "wall_angels",
  "Squat Hold": "deep_squat_hold", "Push-up Max ×3": "pushups", "Mountain Climber 200": "mountain_climbers", "Calf Raise 150": "calf_raises",
  "Side Plank Stack": "side_plank", "Tricep Dip 75": "tricep_dips", "Posture Check": "chin_tucks", "Double Workout": "high_knees",
  "Dance Break": "star_jumps", "Stand on One Leg": "tc_golden_rooster", "Tai Chi Sunrise": "tc_cloud_hands", "Slow Walk": "tc_heel_toe", "20-Min Walk Outdoors": "march", "10,000 Steps": "march" };

/* ---------------- Recommendation ---------------- */
function recommend(goal, level) {
  if (goal === "fat") return level === 1 ? "foundations" : "hiit21";
  if (goal === "muscle") return level === 1 ? "foundations" : "strength28";
  if (goal === "core") return "core14";
  if (goal === "mobility") return "mobility14";
  if (goal === "posture") return "desk7";
  if (goal === "taichi") return "taichi28";
  return "foundations";
}

/* ---------------- Router ---------------- */
let ui = { tab: "today", stack: [], ob: { step: 0, goal: "", level: 1 }, libCat: "all", libQ: "" };
function push(route) { stopPlayer(); ui.stack.push(route); history.pushState({ d: ui.stack.length }, ""); render(); window.scrollTo(0, 0); }
function back() { if (ui.stack.length) history.back(); }
window.addEventListener("popstate", () => {
  if (ui.pendingTab) { // finishing a resetTo(): unwind the whole stack at once
    ui.stack = []; ui.tab = ui.pendingTab; ui.pendingTab = null; render(); window.scrollTo(0, 0); return;
  }
  if (ui.stack.length) {
    const top = ui.stack[ui.stack.length - 1];
    if (top.name === "player" && P && !P.done) { // confirm before leaving a running workout
      history.pushState({ d: ui.stack.length }, ""); confirmQuit(); return;
    }
    ui.stack.pop(); stopPlayer(); render(); window.scrollTo(0, 0);
  }
});
function resetTo(tab) {
  stopPlayer();
  const n = ui.stack.length;
  if (n) { ui.pendingTab = tab; P = null; history.go(-n); return; } // popstate finishes the switch
  ui.tab = tab; render(); window.scrollTo(0, 0);
}

/* ---------------- Render root ---------------- */
function render() {
  const app = $("#app"), tabs = $("#tabs");
  if (!S.onboarded) { app.className = "full"; tabs.className = "hidden"; app.innerHTML = onboarding(); return; }
  const top = ui.stack[ui.stack.length - 1];
  const full = top && ["player", "complete"].includes(top.name);
  app.className = full ? "full" : ""; tabs.className = full ? "hidden" : "";
  if (top) app.innerHTML = SCREENS[top.name](top);
  else app.innerHTML = TABS.find(t => t.id === ui.tab).render();
  tabs.innerHTML = `<div class="inner">${TABS.map(t =>
    `<button class="${!top && ui.tab === t.id ? "on" : ""}" data-act="tab" data-arg="${t.id}"><span class="i">${t.icon}</span>${t.label}</button>`).join("")}</div>`;
  if (top && top.name === "player") mountPlayer(top);
}

/* ---------------- Onboarding ---------------- */
const GOALS = [
  { id: "fat", e: "🔥", t: "Lose fat", d: "Burn calories with HIIT circuits" },
  { id: "muscle", e: "💪", t: "Build muscle & strength", d: "Progressive bodyweight training" },
  { id: "habit", e: "🌱", t: "Get fit & consistent", d: "Build a daily exercise habit" },
  { id: "core", e: "🎯", t: "Stronger core", d: "Abs, back and stability" },
  { id: "mobility", e: "🧘", t: "Move better", d: "Flexibility and mobility" },
  { id: "posture", e: "🪑", t: "Fix desk posture", d: "Neck, shoulders and hips" },
  { id: "taichi", e: "☯️", t: "Balance & calm (Tai Chi)", d: "Gentle and joint-friendly, designed for women 40+" },
];
function onboarding() {
  const o = ui.ob;
  if (o.step === 0) return `
    <div style="text-align:center;padding-top:12vh">
      <div style="font-size:84px">🏋️</div>
      <h1 style="font-size:34px">FitForge</h1>
      <p class="muted" style="max-width:320px;margin:8px auto 28px">Structured home workout programmes, daily challenges and streaks. No equipment needed.</p>
      <label class="field" style="text-align:left"><span>What should we call you?</span>
        <input id="ob-name" placeholder="Your name" value="${esc(S.name)}" maxlength="24"></label>
      <div style="height:20px"></div>
      <button class="btn" data-act="ob-next">Let's go →</button>
    </div>`;
  if (o.step === 1) return `
    <p class="muted small">Step 1 of 2</p><h1>What's your main goal?</h1><p class="muted">We'll recommend a programme. You can switch any time.</p>
    <div style="margin-top:18px">${GOALS.map(g => `
      <button class="option ${o.goal === g.id ? "on" : ""}" data-act="ob-goal" data-arg="${g.id}">
        <span class="e">${g.e}</span><span class="grow"><h3>${g.t}</h3><span class="muted small">${g.d}</span></span></button>`).join("")}</div>
    <div style="height:18px"></div><button class="btn" data-act="ob-next" ${o.goal ? "" : "disabled"}>Continue</button>`;
  const lv = [
    { n: 1, e: "🌱", t: "Beginner", d: "Can't do 10 push-ups yet, or returning after a break" },
    { n: 2, e: "⚡", t: "Intermediate", d: "Train now and then, can do 10 to 20 push-ups" },
    { n: 3, e: "🔥", t: "Advanced", d: "Train regularly, 25+ push-ups, comfortable with burpees" },
  ];
  return `
    <p class="muted small">Step 2 of 2</p><h1>Your fitness level</h1><p class="muted">Be honest. Starting too hard is the #1 reason people quit.</p>
    <div style="margin-top:18px">${lv.map(l => `
      <button class="option ${o.level === l.n ? "on" : ""}" data-act="ob-level" data-arg="${l.n}">
        <span class="e">${l.e}</span><span class="grow"><h3>${l.t}</h3><span class="muted small">${l.d}</span></span></button>`).join("")}</div>
    <label class="field"><span>Body weight (kg), used for calorie estimates</span>
      <input id="ob-weight" type="number" min="25" max="250" value="${S.weight}"></label>
    <div style="height:18px"></div><button class="btn" data-act="ob-finish">See my plan</button>`;
}

/* ---------------- Today ---------------- */
function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }

function todayTab() {
  const sm = summary(), lv = levelInfo();
  const p = S.active && PROGRAM[S.active];
  let heroHtml;
  if (!p) {
    heroHtml = `<div class="card hero tap" data-act="tab" data-arg="programs"><span class="big-emoji">🎯</span>
      <span class="pill">No active programme</span><h2 style="margin:12px 0 4px;color:#fff">Pick a programme</h2>
      <p class="muted" style="margin:0 0 14px">Structured multi-week courses with built-in progression.</p>
      <button class="btn white">Browse programmes</button></div>`;
  } else {
    const done = S.progress[p.id] || 0, total = programDays(p);
    if (done >= total) {
      heroHtml = `<div class="card hero" style="--c1:${p.color};--c2:#111"><span class="big-emoji">🎓</span>
        <span class="pill">${p.emoji} ${p.title}</span><h2 style="margin:12px 0 4px;color:#fff">Programme complete!</h2>
        <p class="muted" style="margin:0 0 14px">Nice work. Take the next challenge.</p>
        <button class="btn white" data-act="tab" data-arg="programs">Choose next programme</button></div>`;
    } else {
      const w = programWorkout(p, done);
      heroHtml = `<div class="card hero with-fig" style="--c1:${p.color};--c2:#1d1b3a">${w ? heroFig(signature(w)) : heroFig("childs_pose")}
        <div class="row between"><span class="pill">${p.emoji} ${p.title}</span><span class="pill">Day ${done + 1}/${total}</span></div>
        <h2 style="margin:14px 0 2px;color:#fff">${w ? w.title.replace(/^Day \d+ · /, "") : "Rest Day 😌"}</h2>
        <p class="muted" style="margin:0 0 12px">${w ? `${Math.round(workoutSeconds(w) / 60)} min · ${w.subtitle}` : "Recovery is when your muscles rebuild. Light walk recommended."}</p>
        <div class="bar" style="margin-bottom:14px"><i style="width:${done / total * 100}%"></i></div>
        ${w ? `<button class="btn white" data-act="preview-program" data-arg="${p.id}|${done}">▶ Start workout</button>`
            : `<div class="row"><button class="btn white" data-act="rest-done" data-arg="${p.id}">✓ Mark rest day done</button></div>`}
      </div>`;
    }
  }
  const d = new Date(), dc = dailyFor(d), dcDone = !!S.daily[today()];
  const monday = addDays(d, -((d.getDay() + 6) % 7));
  const week = [...Array(7)].map((_, i) => {
    const day = addDays(monday, i), k = dkey(day);
    return `<div><div class="d">${"MTWTFSS"[i]}</div><div class="dot ${S.activity[k] ? "on" : ""} ${k === today() ? "today" : ""}">${S.activity[k] ? "✓" : day.getDate()}</div></div>`;
  }).join("");
  const tip = TIPS[dayNum(d) % TIPS.length];

  return `
    <div class="row between"><div><p class="muted small" style="margin:0">${greeting()}${S.name ? ", " + esc(S.name) : ""} 👋</p>
      <h1>Let's train</h1></div>
      <span class="pill" data-act="tab" data-arg="progress" style="cursor:pointer">Lv ${lv.n} · ${lv.name}</span></div>
    <div style="margin-top:12px">${heroHtml}</div>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><b>🔥 ${sm.streak}</b><span>day streak</span></div>
      <div class="stat"><b>${sm.workouts}</b><span>workouts</span></div>
      <div class="stat"><b>${S.xp}</b><span>XP</span></div>
    </div>
    <div class="card" style="margin-top:12px"><div class="week">${week}</div></div>

    <h2>Daily challenge</h2>
    <div class="card"><div class="row">${DAILY_EX[dc.title] ? thumb(DAILY_EX[dc.title]) : `<div class="emoji-box" style="font-size:26px">${dc.emoji}</div>`}
      <div class="grow"><h3>${dc.title}</h3><div class="muted small">${dc.desc}</div></div></div>
      <div class="row between" style="margin-top:14px"><span class="pill">+${dc.xp} XP</span>
      ${dcDone ? `<span class="pill" style="background:var(--good);color:#fff">✓ Completed</span>`
               : `<button class="btn small" data-act="daily-done">Mark complete</button>`}</div></div>

    <h2>Quick workouts</h2>
    <div class="hscroll">${QUICK.map(q => `
      <div class="card tap quick" data-act="preview-quick" data-arg="${q.id}"><div class="qfig">${FIG.svg(signature(q.w), { cls: "accent" })}</div>
        <h3 style="margin-top:8px;font-size:15px">${q.title}</h3><div class="muted small">${Math.round(workoutSeconds(q.w) / 60)} min</div></div>`).join("")}</div>

    <h2>Coach tip</h2>
    <div class="card row"><div class="emoji-box">💡</div><div class="grow small" style="line-height:1.5">${tip}</div></div>`;
}

/* ---------------- Programs ---------------- */
function programSig(p) {
  const k = p.schedule.find(x => x && x !== "mob");
  return k ? p.templates[k].ex[0] : "worlds_greatest";
}
function programsTab() {
  return `<h1>Programmes</h1><p class="muted">Multi-week courses with built-in progression. Work time goes up and rest goes down each week.</p>
    <div class="stack" style="margin-top:16px">${PROGRAMS.map(p => {
      const done = S.progress[p.id] || 0, total = programDays(p);
      const perWeek = p.schedule.filter(x => x !== null).length;
      return `<div class="card tap" data-act="program" data-arg="${p.id}" style="border-left:5px solid ${p.color}">
        <div class="row"><div class="thumb" style="background:${p.color}22">${FIG.svg(programSig(p))}</div>
        <div class="grow"><div class="row between"><h3>${p.title}</h3>${S.active === p.id ? `<span class="pill" style="background:${p.color};color:#fff">Active</span>` : ""}</div>
        <div class="muted small">${p.tagline}</div></div></div>
        <div class="row small muted" style="margin-top:10px;gap:14px;flex-wrap:wrap"><span>${levelDots(p.level)} ${LEVEL_NAMES[p.level]}</span><span>📅 ${p.weeks} wk</span><span>🏃 ${perWeek}×/wk</span><span>🎯 ${p.goal}</span></div>
        ${done ? `<div class="bar" style="margin-top:10px"><i style="width:${Math.min(100, done / total * 100)}%;background:${p.color}"></i></div><div class="muted small" style="margin-top:4px">${done}/${total} days</div>` : ""}
      </div>`; }).join("")}</div>`;
}

function programScreen({ id }) {
  const p = PROGRAM[id], done = S.progress[id] || 0, total = programDays(p), isActive = S.active === id;
  const firstW = programWorkout(p, p.schedule.findIndex(x => x !== null && x !== "mob") >= 0 ? p.schedule.findIndex(x => x !== null && x !== "mob") : 0);
  const avgMin = firstW ? Math.round(workoutSeconds(firstW) / 60) : 6;
  let weeks = "";
  for (let w = 0; w < p.weeks; w++) {
    let cells = "";
    for (let i = 0; i < 7; i++) {
      const d = w * 7 + i, key = p.schedule[i];
      const cls = d < done ? "done" : d === done && isActive ? "next" : d > done ? "locked" : "";
      const label = key === null ? "Rest" : key === "mob" ? "Flow" : key;
      cells += `<button class="day ${cls} ${key === null ? "rest" : ""}" data-act="day" data-arg="${id}|${d}">${d < done ? "✓" : d + 1}<small>${label}</small></button>`;
    }
    weeks += `<p class="muted small" style="margin:14px 0 8px;font-weight:700">WEEK ${w + 1}</p><div class="days">${cells}</div>`;
  }
  const tpl = Object.values(p.templates);
  return `
    <div class="topbar"><button class="icon-btn" data-act="back">←</button></div>
    <div class="card hero with-fig" style="--c1:${p.color};--c2:#1d1b3a">${heroFig(programSig(p))}
      <span class="pill">${levelDots(p.level)} ${LEVEL_NAMES[p.level]}</span>
      <h1 style="color:#fff;margin-top:10px">${p.title}</h1><p class="muted" style="margin:0">${p.tagline}</p></div>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><b>${p.weeks}</b><span>weeks</span></div>
      <div class="stat"><b>~${avgMin}</b><span>min / session</span></div>
      <div class="stat"><b>${done}/${total}</b><span>days done</span></div></div>
    <p style="line-height:1.55;margin-top:16px">${p.description}</p>
    ${tpl.length ? `<h2>Workouts in this programme</h2>${tpl.map(t => `<div class="list-item">${thumb(t.ex[0])}<div class="grow"><h3 style="font-size:15px">${t.name}</h3><div class="muted small">${t.ex.map(x => EX[x].name).join(" · ")}</div></div></div>`).join("")}` : ""}
    <div style="margin-top:18px">${isActive
      ? `<button class="btn" data-act="day" data-arg="${id}|${Math.min(done, total - 1)}">${done >= total ? "Programme complete 🎓" : "Continue: Day " + (done + 1)}</button>`
      : `<button class="btn" data-act="activate" data-arg="${id}">${done ? "Resume programme" : "Start this programme"}</button>`}</div>
    <h2>Schedule</h2>${weeks}
    ${done ? `<div style="margin-top:20px"><button class="btn secondary" data-act="restart-program" data-arg="${id}">↺ Restart from Day 1</button></div>` : ""}`;
}

function routeCoach(route) { return COACHES[route.coach] || Coach.forWorkout(route.source, route.w); }
function coachCard(route) {
  const c = routeCoach(route);
  return `<h2>Your instructor</h2><div class="card">
    <div class="row">${Coach.avatar(c, 52)}<div class="grow"><h3>${c.name}</h3><div class="muted small">${c.style}. ${c.bio}</div></div></div>
    <div class="small" id="pv-caption" style="margin-top:12px;line-height:1.5;color:var(--muted)">Talks you through every move, with form cues, breathing and countdowns.</div>
    <div class="row between" style="margin-top:12px;flex-wrap:wrap;gap:10px">
      <button class="btn small" data-act="pv-hear">▶ Hear intro</button>
      <div class="row" style="gap:6px">${Object.values(COACHES).map(o => `<button class="coach-pick ${o.id === c.id ? "on" : ""}" data-act="pv-coach" data-arg="${o.id}" title="${o.name}">${Coach.avatar(o, 34)}</button>`).join("")}</div>
    </div></div>`;
}
function introCtx(w, coachSteps) {
  const ids = w.sections.flatMap(s => s.items.map(i => i.id));
  return { name: S.name ? ", " + S.name : "", title: w.title.replace(/^Day \d+ · /, ""), mins: Math.max(1, Math.round(workoutSeconds(w) / 60)),
    count: new Set(ids).size, first: EX[ids[0]].name, kcal: 0,
    get dur() { return this.mins === 1 ? "1 minute" : this.mins + " minutes"; } };
}
function previewScreen(route) {
  const { w, source } = route;
  const secs = workoutSeconds(w);
  const kcal = estimateKcal(w);
  return `
    <div class="topbar"><button class="icon-btn" data-act="back">←</button></div>
    <div class="card fig-card">${FIG.svg(signature(w), { anim: true, cls: "accent" })}</div>
    <h1>${w.title}</h1><p class="muted" style="margin:0">${w.subtitle}</p>
    <div class="stats" style="margin-top:14px">
      <div class="stat"><b>${Math.round(secs / 60)}</b><span>minutes</span></div>
      <div class="stat"><b>~${kcal}</b><span>kcal est.</span></div>
      <div class="stat"><b>${w.sections.reduce((a, s) => a + s.items.length, 0)}</b><span>exercises</span></div></div>
    ${coachCard(route)}
    ${w.sections.map(s => `<h2>${s.name} <span class="muted small" style="font-weight:600">${s.rounds > 1 ? `× ${s.rounds} rounds` : ""}</span></h2>
      ${s.items.map(it => { const x = EX[it.id]; return `<div class="list-item tap" data-act="exercise" data-arg="${x.id}" style="cursor:pointer">
        ${thumb(x.id)}<div class="grow"><h3 style="font-size:15px">${x.name}</h3>
        <div class="muted small">${it.secs}s${x.perSide ? " · switch sides halfway" : ""}${s.rest ? ` · ${s.rest}s rest` : ""}</div></div><span class="muted">›</span></div>`; }).join("")}`).join("")}
    <div style="position:sticky;bottom:12px;margin-top:20px"><button class="btn" data-act="start" style="box-shadow:var(--shadow)">▶ Start workout</button></div>`;
}

/* ---------------- Challenges ---------------- */
function challengesTab() {
  const d = new Date(), dc = dailyFor(d), done = !!S.daily[today()];
  const upcoming = [1, 2].map(i => ({ d: addDays(d, i), c: dailyFor(addDays(d, i)) }));
  return `<h1>Challenges</h1><p class="muted">A new challenge every day, plus 30-day challenges that build up gradually.</p>
    <h2>Today · ${d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" })}</h2>
    <div class="card hero ${DAILY_EX[dc.title] ? "with-fig" : ""}" style="--c1:#ff6b35;--c2:#c026d3">${DAILY_EX[dc.title] ? heroFig(DAILY_EX[dc.title]) : `<span class="big-emoji">${dc.emoji}</span>`}
      <span class="pill">Daily challenge · +${dc.xp} XP</span>
      <h2 style="color:#fff;margin:12px 0 4px">${dc.title}</h2><p class="muted" style="margin:0 0 14px">${dc.desc}</p>
      ${done ? `<button class="btn white" disabled>✓ Completed today</button>` : `<button class="btn white" data-act="daily-done">I did it!</button>`}</div>
    <div class="stack" style="margin-top:10px">${upcoming.map(u => `<div class="list-item" style="opacity:.6">${DAILY_EX[u.c.title] ? thumb(DAILY_EX[u.c.title]) : `<div class="emoji-box">${u.c.emoji}</div>`}
      <div class="grow"><h3 style="font-size:15px">${u.c.title}</h3><div class="muted small">${u.d.toLocaleDateString(undefined, { weekday: "long" })}</div></div></div>`).join("")}</div>

    <h2>30-day challenges</h2>
    <div class="stack">${THIRTY.map(t => {
      const st = S.thirty[t.id] || { done: 0 }; const tgt = t.targets[Math.min(st.done, 29)];
      return `<div class="card tap" data-act="thirty" data-arg="${t.id}"><div class="row"><div class="thumb" style="background:${t.color}22">${FIG.svg(t.ex)}</div>
        <div class="grow"><h3>${t.title}</h3><div class="muted small">${st.done >= 30 ? "Completed 🏆" : st.done ? `Day ${st.done + 1}: ${tgt ? tgt + " " + t.unit : "Rest day"}` : `Starts at ${t.targets[0]} ${t.unit}, ends at ${t.targets[29]}`}</div></div></div>
        <div class="bar" style="margin-top:12px"><i style="width:${st.done / 30 * 100}%;background:${t.color}"></i></div></div>`; }).join("")}</div>`;
}

function thirtyScreen({ id }) {
  const t = THIRTY.find(x => x.id === id), st = S.thirty[id] || { done: 0, last: "" };
  const finished = st.done >= 30, tgt = t.targets[Math.min(st.done, 29)], doneToday = st.last === today();
  const cells = t.targets.map((v, i) => `<div class="day ${i < st.done ? "done" : i === st.done ? "next" : "locked"} ${v ? "" : "rest"}">
    ${i < st.done ? "✓" : i + 1}<small>${v ? v + (t.timed ? "s" : "") : "Rest"}</small></div>`).join("");
  let action;
  if (finished) action = `<button class="btn" disabled>🏆 Challenge complete</button>`;
  else if (doneToday) action = `<button class="btn secondary" disabled>✓ Done for today. Come back tomorrow</button>`;
  else if (!tgt) action = `<button class="btn" data-act="thirty-done" data-arg="${id}">😌 Take today's rest day</button>`;
  else if (t.timed) action = `<button class="btn" data-act="thirty-timer" data-arg="${id}">▶ Start ${tgt}s timer</button>
    <div style="height:8px"></div><button class="btn secondary" data-act="thirty-done" data-arg="${id}">I did it without the timer</button>`;
  else action = `<button class="btn" data-act="thirty-done" data-arg="${id}">✓ I did ${tgt} ${t.unit}</button>`;
  return `<div class="topbar"><button class="icon-btn" data-act="back">←</button></div>
    <div class="card hero with-fig" style="--c1:${t.color};--c2:#1d1b3a">${heroFig(t.ex)}
      <span class="pill">Day ${Math.min(st.done + 1, 30)} of 30</span><h1 style="color:#fff;margin-top:10px">${t.title}</h1>
      <p class="muted" style="margin:0">${finished ? "You finished all 30 days!" : tgt ? `Today: <b>${tgt} ${t.unit}</b> of ${EX[t.ex].name}` : "Today is a rest day"}</p></div>
    <div style="margin-top:14px">${action}</div>
    <p class="muted small" style="line-height:1.5;margin-top:14px">${t.timed ? "Split it into several holds if you need to; total time counts." : "Split the reps into as many sets as you need across the day."} Tap the exercise below for form cues.</p>
    <div class="list-item" data-act="exercise" data-arg="${t.ex}" style="cursor:pointer">${thumb(t.ex)}<div class="grow"><h3 style="font-size:15px">${EX[t.ex].name}</h3><div class="muted small">${EX[t.ex].tip}</div></div><span class="muted">›</span></div>
    <h2>Your 30 days</h2><div class="days">${cells}</div>
    ${st.done ? `<div style="margin-top:20px"><button class="btn secondary" data-act="thirty-reset" data-arg="${id}">↺ Restart challenge</button></div>` : ""}`;
}

/* ---------------- Library ---------------- */
function libraryTab() {
  const q = ui.libQ.toLowerCase();
  const list = EXERCISES.filter(x => (ui.libCat === "all" || x.cat === ui.libCat) &&
    (!q || x.name.toLowerCase().includes(q) || x.muscles.toLowerCase().includes(q)));
  return `<h1>Exercises</h1><p class="muted">${EXERCISES.length} bodyweight moves with form cues.</p>
    <input class="search" id="lib-q" placeholder="Search by name or muscle…" value="${esc(ui.libQ)}" style="margin-top:12px">
    <div class="chips"><button class="chip ${ui.libCat === "all" ? "on" : ""}" data-act="libcat" data-arg="all">All</button>
      ${Object.entries(CATEGORIES).map(([k, c]) => `<button class="chip ${ui.libCat === k ? "on" : ""}" data-act="libcat" data-arg="${k}">${c.emoji} ${c.label}</button>`).join("")}</div>
    <div id="lib-list" style="margin-top:14px">${libList(list)}</div>`;
}
function libList(list) {
  return list.length ? list.map(x => `<div class="list-item" data-act="exercise" data-arg="${x.id}" style="cursor:pointer">
    ${thumb(x.id)}<div class="grow"><h3 style="font-size:15px">${x.name}</h3>
    <div class="muted small">${x.muscles}</div></div><span class="muted small">${levelDots(x.level)}</span></div>`).join("")
    : `<p class="muted">No exercises match.</p>`;
}

function exerciseScreen({ id }) {
  const x = EX[id], c = CATEGORIES[x.cat];
  const yt = "https://www.youtube.com/results?search_query=" + encodeURIComponent(x.name + " exercise proper form");
  return `<div class="topbar"><button class="icon-btn" data-act="back">←</button></div>
    <div class="card" style="text-align:center;padding:16px 16px 22px"><div class="fig-big">${FIG.svg(x.id, { anim: true, cls: "accent" })}</div>
      <h1>${x.name}</h1><div class="row" style="justify-content:center;flex-wrap:wrap;gap:8px;margin-top:8px">
      <span class="pill">${c.label}</span><span class="pill">${levelDots(x.level)} ${LEVEL_NAMES[x.level]}</span>${x.perSide ? `<span class="pill">Per side</span>` : ""}</div></div>
    <h2>Muscles worked</h2><p class="muted" style="margin:0">${x.muscles}</p>
    <h2>How to do it</h2><ol class="steps">${x.steps.map(s => `<li>${s}</li>`).join("")}</ol>
    <div class="card row" style="margin-top:12px"><div class="emoji-box">💡</div><div class="grow small" style="line-height:1.5"><b>Coach cue:</b> ${x.tip}</div></div>
    ${x.easier ? `<div class="card row" style="margin-top:10px"><div class="emoji-box">🪶</div><div class="grow small" style="line-height:1.5"><b>Make it easier:</b> ${x.easier}</div></div>` : ""}
    <div class="stack" style="margin-top:18px">
      <a class="btn secondary" href="${yt}" target="_blank" rel="noopener" style="text-decoration:none">▶️ Watch form demos on YouTube</a>
      <button class="btn secondary" data-act="hear-ex" data-arg="${x.id}">🔈 Hear the instructions</button>
      <button class="btn" data-act="try" data-arg="${x.id}">Try it: 40-second set</button></div>`;
}

/* ---------------- Progress ---------------- */
function progressTab() {
  const sm = summary(), lv = levelInfo();
  const d = new Date(), start = addDays(d, -((d.getDay() + 6) % 7) - 28);
  let heat = "";
  for (let i = 0; i < 35; i++) {
    const k = dkey(addDays(start, i)), n = S.activity[k] || 0, future = addDays(start, i) > d;
    heat += `<i class="${n >= 2 ? "l2" : n ? "l1" : ""} ${k === today() ? "today" : ""}" style="${future ? "opacity:.3" : ""}" title="${k}"></i>`;
  }
  const hist = S.sessions.slice(-8).reverse();
  return `<h1>Progress</h1>
    <div class="card hero" style="margin-top:12px;--c1:#6366f1;--c2:#c026d3"><span class="big-emoji">⭐</span>
      <span class="pill">Level ${lv.n}</span><h2 style="color:#fff;margin:10px 0 2px">${lv.name}</h2>
      <p class="muted" style="margin:0 0 10px">${lv.into} / ${lv.per} XP to level ${lv.n + 1}</p>
      <div class="bar"><i style="width:${lv.into / lv.per * 100}%"></i></div></div>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><b>${sm.workouts}</b><span>workouts</span></div>
      <div class="stat"><b>${sm.minutes}</b><span>active min</span></div>
      <div class="stat"><b>${sm.kcal}</b><span>kcal burned</span></div>
      <div class="stat"><b>🔥 ${sm.streak}</b><span>current streak</span></div>
      <div class="stat"><b>${sm.bestStreak}</b><span>best streak</span></div>
      <div class="stat"><b>${sm.dailies}</b><span>daily challenges</span></div></div>
    <h2>Last 5 weeks</h2>
    <div class="card"><div class="heat">${heat}</div>
      <div class="row small muted" style="margin-top:10px;gap:8px"><span>Less</span><i style="width:12px;height:12px;border-radius:3px;background:var(--surface2)"></i><i style="width:12px;height:12px;border-radius:3px;background:color-mix(in srgb,var(--accent) 45%,var(--surface2))"></i><i style="width:12px;height:12px;border-radius:3px;background:var(--accent)"></i><span>More</span></div></div>
    <h2>Badges</h2>
    <div class="badges">${BADGES.map(b => `<div class="badge ${b.test(sm) ? "" : "off"}"><div class="e">${b.emoji}</div><b>${b.name}</b><span>${b.desc}</span></div>`).join("")}</div>
    <h2>Recent workouts</h2>
    ${hist.length ? hist.map(s => `<div class="list-item"><div class="emoji-box">✅</div><div class="grow"><h3 style="font-size:15px">${esc(s.title)}</h3>
      <div class="muted small">${new Date(s.date + "T00:00").toLocaleDateString(undefined, { day: "numeric", month: "short" })} · ${s.mins} min · ${s.kcal} kcal</div></div></div>`).join("")
      : `<p class="muted">No workouts yet. Your first one is waiting on the Today tab.</p>`}
    <h2>Voice instructors</h2>
    <div class="card">
      <label class="field" style="margin-top:0"><span>Instructor</span><select data-change="coach">
        <option value="auto" ${S.coach === "auto" ? "selected" : ""}>Auto: best match for each workout</option>
        ${Object.values(COACHES).map(c => `<option value="${c.id}" ${S.coach === c.id ? "selected" : ""}>${c.name}: ${c.style}</option>`).join("")}</select></label>
      <label class="field"><span>Speaking speed</span><select data-change="rate">
        ${[[0.85, "Slow"], [1, "Normal"], [1.15, "Fast"]].map(([v, l]) => `<option value="${v}" ${(S.voiceRate || 1) === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      ${Object.values(COACHES).map(c => `<div class="row" style="margin-top:16px;align-items:flex-start">${Coach.avatar(c, 44)}
        <div class="grow"><b>${c.name}</b><div class="muted small" style="margin-bottom:6px">${c.bio}</div>
        <select class="voice-sel" data-change="voice" data-coach="${c.id}">${voiceOptions(c)}</select></div>
        <button class="icon-btn" data-act="test-coach" data-arg="${c.id}" title="Test voice">▶</button></div>`).join("")}
      <p class="muted small" style="margin:14px 0 0;line-height:1.5">Voices come from your device. Install extra voices in your phone's text-to-speech settings for more choice.</p>
    </div>
    <h2>Settings</h2>
    <div class="card">
      <label class="field" style="margin-top:0"><span>Name</span><input id="set-name" value="${esc(S.name)}" maxlength="24"></label>
      <label class="field"><span>Weight (kg)</span><input id="set-weight" type="number" min="25" max="250" value="${S.weight}"></label>
      <div class="row between" style="margin-top:14px"><span>Voice coach &amp; beeps</span>
        <button class="btn small ${S.voice ? "" : "secondary"}" data-act="toggle-voice">${S.voice ? "On" : "Off"}</button></div>
      <div class="row" style="margin-top:14px"><button class="btn secondary small" data-act="save-settings">Save</button>
        <button class="btn secondary small" data-act="reset" style="color:var(--danger)">Reset all data</button></div>
    </div>
    <p class="muted small" style="margin-top:18px;line-height:1.5">Calories are estimates using MET values (Compendium of Physical Activities). Check with a doctor before starting a new exercise programme if you have health conditions.</p>`;
}

function voiceOptions(c) {
  const vs = Coach.voices();
  if (!vs.length) return `<option>Device default voice</option>`;
  const cur = Coach.voiceFor(c);
  return vs.map(v => `<option value="${esc(v.voiceURI)}" ${cur && v.voiceURI === cur.voiceURI ? "selected" : ""}>${esc(v.name)} (${v.lang})</option>`).join("");
}

/* ---------------- Workout player ---------------- */
function estimateKcal(w) {
  let k = 0;
  w.sections.forEach(s => {
    s.items.forEach(it => k += s.rounds * EX[it.id].met * 3.5 * S.weight / 200 * it.secs / 60);
    k += s.rounds * s.items.length * s.rest * 2 * 3.5 * S.weight / 200 / 60;
  });
  return Math.round(k);
}

function flatten(w) {
  const works = [];
  w.sections.forEach(s => {
    for (let r = 0; r < s.rounds; r++) s.items.forEach((it, i) => {
      const lastInRound = i === s.items.length - 1;
      const rest = lastInRound ? (r < s.rounds - 1 ? (s.roundRest || s.rest) : 10) : s.rest;
      works.push({ ex: EX[it.id], secs: it.secs, section: s.name, round: r + 1, rounds: s.rounds, rest, roundStart: r > 0 && i === 0 });
    });
  });
  const steps = [{ type: "prep", secs: 15 }];
  works.forEach((wk, i) => {
    steps.push({ type: "work", ...wk });
    if (i < works.length - 1 && wk.rest > 0) steps.push({ type: "rest", secs: wk.rest, section: works[i + 1].section !== wk.section ? works[i + 1].section : null });
  });
  steps.forEach((s, i) => { if (s.type !== "work") s.next = steps.slice(i + 1).find(x => x.type === "work"); });
  const nWork = works.length; let c = 0;
  steps.forEach(s => { if (s.type === "work") s.num = ++c; s.total = nWork; });
  return steps;
}

let P = null; // live player state
let audioCtx = null, wakeLock = null;

function beep(freq = 660, dur = 0.12, soft = false) {
  if (!S.voice) return;
  if (soft && Coach.isBusy()) return; // don't talk over the coach
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.07, audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch {}
}
Coach.onCaption = (c, text) => {
  const el = $("#pl-caption") || $("#pv-caption") || $("#cm-caption"); if (el) el.textContent = text;
};
Coach.onSpeaking = on => document.querySelectorAll(".avatar").forEach(a => a.classList.toggle("speaking", on));

function startWorkout(w, source, replaceTop = false, coachId = null) {
  try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); audioCtx.resume(); } catch {}
  P = { w, source, steps: flatten(w), idx: 0, left: 15, paused: false, elapsed: 0, kcal: 0, done: false, timer: null,
    coach: COACHES[coachId] || Coach.forWorkout(source, w), explained: new Set() };
  // Preview → player replaces the preview entry so Back leaves the workout in one step.
  if (replaceTop) ui.stack[ui.stack.length - 1] = { name: "player" };
  else { ui.stack.push({ name: "player" }); history.pushState({ d: ui.stack.length }, ""); }
  try { navigator.wakeLock && navigator.wakeLock.request("screen").then(l => wakeLock = l).catch(() => {}); } catch {}
  render(); window.scrollTo(0, 0);
}

function playerScreen() {
  return `<div class="player">
    <div class="top"><button class="icon-btn" data-act="quit">✕</button>
      <div class="muted small" id="pl-count"></div>
      <button class="icon-btn" data-act="toggle-voice-pl" id="pl-voice">${S.voice ? "🔊" : "🔇"}</button></div>
    <div class="overall"><i id="pl-overall"></i></div>
    <div class="phase" id="pl-phase"></div>
    <div class="name" id="pl-name"></div>
    <div class="meta" id="pl-meta"></div>
    <div class="pl-fig" id="pl-fig"></div>
    <div class="ring" id="pl-ring"><svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="52"/>
      <circle class="prog" id="pl-prog" cx="60" cy="60" r="52" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg>
      <div class="center"><div class="secs" id="pl-secs"></div></div></div>
    <div class="controls"><button class="c" data-act="pl-prev">⏮</button>
      <button class="c main" data-act="pl-pause" id="pl-pause">❚❚</button>
      <button class="c" data-act="pl-next">⏭</button></div>
    <div class="next card coach-bubble"><div class="row" style="align-items:flex-start">${Coach.avatar(P.coach, 42)}
      <div class="grow"><b class="small">${P.coach.name}</b><div id="pl-caption" class="small" style="line-height:1.45;margin-top:2px"></div></div></div></div></div>`;
}

function mountPlayer() {
  if (!P) return;
  clearInterval(P.timer);
  P.timer = setInterval(tick, 1000);
  enterStep(false);
}
function stopPlayer() {
  if (P && P.timer) clearInterval(P.timer);
  if (P) P.timer = null;
  Coach.stop();
  if (wakeLock) { try { wakeLock.release(); } catch {} wakeLock = null; }
}

function enterStep(announce = true) {
  const s = P.steps[P.idx]; P.left = s.secs;
  P.cue = { half: false, tip: false, easy: false, enc: false, ten: false, breath: 0 };
  if (announce || P.idx === 0) speakStep(s);
  paint();
}

// What the instructor says at the start of each step.
function speakStep(s) {
  const c = P.coach;
  if (s.type === "prep") return Coach.say(c, c.intro(introCtx(P.w)), "high");
  if (s.type === "work") {
    const first = !P.explained.has(s.ex.id); P.explained.add(s.ex.id);
    let t = (s.roundStart ? c.round(s.round) + " " : "") + s.ex.name + ". ";
    t += first ? s.ex.steps.join(" ") + " " : (s.ex.perSide ? "Start on your first side. " : "");
    return Coach.say(c, t + Coach.pick(c.go), "high");
  }
  const nx = s.next.ex;
  let t = Coach.pick(c.rest) + (s.section ? ` Next section: ${s.section}.` : "") + ` Next up, ${nx.name}.`;
  if (!P.explained.has(nx.id) && s.secs >= 15) t += " " + nx.steps[0];
  Coach.say(c, t, "normal");
}

// Cues during a set: form tip, easier option, halfway push, 10-second call, breathing for tai chi.
function coachDuringSet(s) {
  const c = P.coach, k = P.cue, done = s.secs - P.left;
  if (s.ex.perSide && !k.half && P.left === Math.floor(s.secs / 2)) { k.half = true; Coach.say(c, c.sides, "high"); return; }
  if (!k.ten && s.secs >= 30 && P.left <= 10 && P.left >= 7) { if (Coach.say(c, Coach.pick(c.last10), "low")) k.ten = true; return; }
  if (P.left <= 12) return;
  if (!k.tip && s.secs >= 25 && done >= Math.round(s.secs * 0.35)) { if (Coach.say(c, c.cue(s.ex.tip), "low")) k.tip = true; return; }
  if (!k.easy && s.ex.easier && c.id !== "arjun" && done >= Math.round(s.secs * 0.5) && P.explained.has(s.ex.id) && s.round === 1) { if (Coach.say(c, c.easier(s.ex.easier), "low")) k.easy = true; return; }
  if (!k.enc && !s.ex.perSide && s.secs >= 40 && done >= Math.round(s.secs * 0.55)) { if (Coach.say(c, Coach.pick(c.half), "low")) k.enc = true; return; }
  if (c.breath && s.ex.cat === "taichi" && done > 9 && done % 10 === 0) Coach.say(c, c.breath[k.breath++ % 2], "low");
}

function tick() {
  if (!P || P.paused) return;
  const s = P.steps[P.idx];
  P.left--; P.elapsed++;
  P.kcal += (s.type === "work" ? s.ex.met : 2) * 3.5 * S.weight / 200 / 60;
  if (s.type === "work") coachDuringSet(s);
  if (P.left > 0 && P.left <= 3) beep(660, .1, true);
  if (P.left <= 0) { beep(880, .25); advance(1); return; }
  paint();
}

function advance(dir) {
  const n = P.idx + dir;
  if (n < 0) return;
  if (n >= P.steps.length) return finish();
  P.idx = n; enterStep(true);
}

function paint() {
  const s = P.steps[P.idx]; if (!$("#pl-secs")) return;
  const ex = s.type === "work" ? s.ex : s.next.ex;
  $("#pl-phase").className = "phase " + s.type;
  $("#pl-phase").textContent = s.type === "work" ? `${s.section}${s.rounds > 1 ? ` · Round ${s.round}/${s.rounds}` : ""}` : s.type === "rest" ? (s.section ? `Up next: ${s.section}` : "Rest") : "Get ready";
  $("#pl-name").textContent = s.type === "work" ? ex.name : s.type === "rest" ? "Breathe & recover" : "Get in position";
  $("#pl-meta").textContent = s.type === "work" ? ex.muscles + (ex.perSide ? " · switch sides halfway" : "") : `Next: ${ex.name}`;
  const fig = $("#pl-fig");
  if (fig.dataset.ex !== ex.id) { fig.dataset.ex = ex.id; fig.innerHTML = FIG.svg(ex.id, { anim: true, cls: s.type === "work" ? "accent" : "" }); }
  const svgEl = fig.querySelector("svg");
  svgEl.classList.toggle("accent", s.type === "work");
  svgEl.dataset.anim = P.paused ? "0" : "1";
  fig.classList.toggle("dim", s.type !== "work");
  $("#pl-secs").textContent = P.left;
  $("#pl-ring").className = "ring " + s.type;
  $("#pl-prog").style.strokeDashoffset = (326.7 * (1 - P.left / s.secs)).toFixed(1);
  $("#pl-count").textContent = `${s.type === "work" ? s.num : (s.next ? s.next.num : s.total)} / ${s.total} · ${fmtTime(P.elapsed)}`;
  $("#pl-overall").style.width = (P.idx / P.steps.length * 100) + "%";
  $("#pl-pause").textContent = P.paused ? "▶" : "❚❚";
}

function finish() {
  stopPlayer(); P.done = true;
  const mins = Math.max(1, Math.round(P.elapsed / 60)), kcal = Math.round(P.kcal);
  let xp = 50 + mins, extra = "";
  const src = P.source;
  if (src.type === "program") {
    const p = PROGRAM[src.id], cur = S.progress[src.id] || 0;
    if (src.day === cur) {
      S.progress[src.id] = cur + 1;
      if (cur + 1 >= programDays(p)) { S.programsDone++; xp += 300; extra = `🎓 You finished ${p.title}! +300 XP bonus`; }
    }
  }
  if (src.type === "thirty") { markThirty(src.id, false); xp += 0; }
  S.sessions.push({ date: today(), title: P.w.title, mins, kcal });
  logActivity(xp);
  const coach = P.coach;
  const outro = coach.outro({ name: S.name ? ", " + S.name : "", mins, kcal, dur: mins === 1 ? "1 minute" : mins + " minutes" });
  const res = { name: "complete", mins, kcal, xp, extra, title: P.w.title, coach: coach.id, outro };
  ui.stack[ui.stack.length - 1] = res; // replace player with summary
  P = null; render(); window.scrollTo(0, 0);
  Coach.say(coach, outro, "high");
}

function completeScreen(r) {
  const sm = summary();
  return `<div style="text-align:center"><div class="confetti">🎉</div>
    <h1>Workout complete!</h1><p class="muted">${esc(r.title)}</p></div>
    <div class="stats" style="margin-top:18px">
      <div class="stat"><b>${r.mins}</b><span>minutes</span></div>
      <div class="stat"><b>${r.kcal}</b><span>kcal</span></div>
      <div class="stat"><b>+${r.xp}</b><span>XP</span></div></div>
    <div class="card row" style="margin-top:12px"><div class="emoji-box">🔥</div><div class="grow"><h3>${sm.streak}-day streak</h3>
      <div class="muted small">Come back tomorrow to keep it going.</div></div></div>
    ${r.extra ? `<div class="card" style="margin-top:12px;text-align:center;font-weight:700">${r.extra}</div>` : ""}
    ${r.coach ? `<div class="card coach-bubble" style="margin-top:12px"><div class="row" style="align-items:flex-start">${Coach.avatar(COACHES[r.coach], 42)}
      <div class="grow"><b class="small">${COACHES[r.coach].name}</b><div id="cm-caption" class="small" style="line-height:1.45;margin-top:2px">${esc(r.outro)}</div></div></div></div>` : ""}
    <div style="margin-top:22px"><button class="btn" data-act="home">Done</button></div>`;
}

function confirmQuit() {
  if (!P) return;
  P.paused = true; paint();
  const m = document.createElement("div"); m.className = "modal-bg";
  m.innerHTML = `<div class="modal"><h2 style="margin-top:0">End workout?</h2><p class="muted">You're ${Math.round(P.idx / P.steps.length * 100)}% through. Ending early won't count toward your programme.</p>
    <div class="stack"><button class="btn" data-act="modal-resume">Keep going 💪</button>
    <button class="btn secondary" data-act="modal-finish">Finish now &amp; save</button>
    <button class="btn secondary" data-act="modal-quit" style="color:var(--danger)">Quit without saving</button></div></div>`;
  document.body.appendChild(m);
}
function closeModal() { const m = document.querySelector(".modal-bg"); if (m) m.remove(); }

/* ---------------- 30-day + daily actions ---------------- */
function markThirty(id, giveXp = true) {
  const st = S.thirty[id] || { done: 0, last: "" };
  if (st.last === today() || st.done >= 30) return false;
  st.done++; st.last = today(); S.thirty[id] = st;
  if (giveXp) logActivity(st.done >= 30 ? 220 : 20); else save();
  return true;
}

/* ---------------- Tabs & screens registry ---------------- */
const TABS = [
  { id: "today", label: "Today", icon: "🏠", render: todayTab },
  { id: "programs", label: "Programmes", icon: "📚", render: programsTab },
  { id: "challenges", label: "Challenges", icon: "🏆", render: challengesTab },
  { id: "library", label: "Exercises", icon: "🏋️", render: libraryTab },
  { id: "progress", label: "Progress", icon: "📈", render: progressTab },
];
const SCREENS = { program: programScreen, preview: previewScreen, thirty: thirtyScreen, exercise: exerciseScreen,
  player: playerScreen, complete: completeScreen };

/* ---------------- Actions ---------------- */
const ACTIONS = {
  tab: a => { if (ui.stack.length) resetTo(a); else { ui.tab = a; render(); window.scrollTo(0, 0); } },
  back: () => back(),
  home: () => resetTo("today"),
  "ob-next": () => {
    if (ui.ob.step === 0) { const n = $("#ob-name"); S.name = n ? n.value.trim() : ""; }
    ui.ob.step++; render();
  },
  "ob-goal": a => { ui.ob.goal = a; render(); },
  "ob-level": a => { ui.ob.level = +a; const w = $("#ob-weight"); if (w) S.weight = +w.value || 70; render(); },
  "ob-finish": () => {
    const w = +$("#ob-weight").value; S.weight = w >= 25 && w <= 250 ? w : 70;
    S.goal = ui.ob.goal; S.level = ui.ob.level; S.onboarded = true;
    const rec = recommend(S.goal, S.level); S.active = rec; save();
    ui.tab = "today"; render();
    toast(`Recommended: ${PROGRAM[rec].title}`);
  },
  program: a => push({ name: "program", id: a }),
  activate: a => { S.active = a; save(); toast(`${PROGRAM[a].title} is now active`); render(); },
  "restart-program": a => { if (confirm("Restart this programme from Day 1?")) { S.progress[a] = 0; S.active = a; save(); render(); } },
  day: a => {
    const [id, d] = a.split("|"), p = PROGRAM[id], day = +d, done = S.progress[id] || 0;
    if (day > done) return toast("Finish the earlier days first 🔒");
    const w = programWorkout(p, day);
    if (!w) {
      if (day === done && S.active === id) { ACTIONS["rest-done"](id); }
      else toast("Rest day. Recovery counts too 😌");
      return;
    }
    if (S.active !== id) { S.active = id; save(); }
    push({ name: "preview", w, source: { type: "program", id, day } });
  },
  "preview-program": a => ACTIONS.day(a),
  "rest-done": id => {
    const p = PROGRAM[id], cur = S.progress[id] || 0;
    S.progress[id] = cur + 1;
    if (cur + 1 >= programDays(p)) S.programsDone++;
    logActivity(10); toast("Rest day logged. +10 XP"); render();
  },
  "preview-quick": a => { const q = QUICK.find(x => x.id === a); push({ name: "preview", w: q.w, source: { type: "quick", quick: a } }); },
  start: () => { const top = ui.stack[ui.stack.length - 1]; startWorkout(top.w, top.source, true, top.coach); },
  "pv-coach": a => { Coach.stop(); ui.stack[ui.stack.length - 1].coach = a; render(); },
  "pv-hear": () => { const top = ui.stack[ui.stack.length - 1], c = routeCoach(top); Coach.say(c, c.intro(introCtx(top.w)), "high"); },
  "hear-ex": a => {
    const x = EX[a], c = COACHES[S.coach] || (x.cat === "taichi" || x.cat === "mobility" || x.cat === "stretch" ? COACHES.maya : COACHES.sam);
    Coach.say(c, `${x.name}. ${x.steps.join(" ")} ${c.cue(x.tip)}`, "high");
  },
  "test-coach": a => { const c = COACHES[a]; Coach.say(c, `Hi${S.name ? " " + S.name : ""}, I'm ${c.name.replace("Coach ", "")}. ${c.bio}`, "high"); },
  exercise: a => push({ name: "exercise", id: a }),
  try: a => {
    const x = EX[a];
    startWorkout({ title: x.name, subtitle: "Single set", sections: [section("Try it", [a], 40, 0)] }, { type: "quick" });
  },
  "daily-done": () => {
    if (S.daily[today()]) return;
    const dc = dailyFor(new Date()); S.daily[today()] = dc.title; logActivity(dc.xp);
    toast(`Challenge complete! +${dc.xp} XP 🎉`); render();
  },
  thirty: a => push({ name: "thirty", id: a }),
  "thirty-done": a => {
    const t = THIRTY.find(x => x.id === a);
    if (markThirty(a)) toast((S.thirty[a].done >= 30 ? "🏆 Challenge complete! +220 XP" : "Logged. +20 XP 💪"));
    render();
  },
  "thirty-timer": a => {
    const t = THIRTY.find(x => x.id === a), st = S.thirty[a] || { done: 0 }, secs = t.targets[st.done];
    startWorkout({ title: `${t.title} · Day ${st.done + 1}`, subtitle: `${secs}s hold`, sections: [section(t.title, [t.ex], secs, 0)] }, { type: "thirty", id: a });
  },
  "thirty-reset": a => { if (confirm("Restart this challenge from Day 1?")) { S.thirty[a] = { done: 0, last: "" }; save(); render(); } },
  libcat: a => { ui.libCat = a; render(); },
  "toggle-voice": () => { S.voice = !S.voice; save(); render(); },
  "toggle-voice-pl": () => { S.voice = !S.voice; save(); if (!S.voice) Coach.stop(); $("#pl-voice").textContent = S.voice ? "🔊" : "🔇"; },
  "save-settings": () => {
    S.name = $("#set-name").value.trim(); const w = +$("#set-weight").value; if (w >= 25 && w <= 250) S.weight = w;
    save(); toast("Saved ✓"); render();
  },
  reset: () => { if (confirm("Delete all progress and start over?")) { S = { ...DEFAULT, progress: {}, sessions: [], daily: {}, thirty: {}, activity: {} }; save(); ui.ob = { step: 0, goal: "", level: 1 }; ui.stack = []; render(); } },
  "pl-pause": () => { P.paused = !P.paused; Coach.say(P.coach, P.paused ? P.coach.pause : P.coach.resume, "high"); paint(); },
  "pl-next": () => advance(1),
  "pl-prev": () => advance(-1),
  quit: () => confirmQuit(),
  "modal-resume": () => { closeModal(); P.paused = false; paint(); },
  "modal-finish": () => { closeModal(); P.source = { type: "quick" }; finish(); },
  "modal-quit": () => { closeModal(); stopPlayer(); P = null; history.back(); },
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el.dataset.arg); }
});
document.addEventListener("change", e => {
  const k = e.target.dataset.change; if (!k) return;
  if (k === "coach") S.coach = e.target.value;
  if (k === "rate") S.voiceRate = +e.target.value;
  if (k === "voice") S.coachVoice = { ...(S.coachVoice || {}), [e.target.dataset.coach]: e.target.value };
  save(); toast("Saved ✓");
  if (k === "voice") ACTIONS["test-coach"](e.target.dataset.coach);
});
document.addEventListener("voiceschanged", () => { if (!ui.stack.length && ui.tab === "progress" && S.onboarded) render(); });
document.addEventListener("input", e => {
  if (e.target.id === "lib-q") {
    ui.libQ = e.target.value;
    const q = ui.libQ.toLowerCase();
    $("#lib-list").innerHTML = libList(EXERCISES.filter(x => (ui.libCat === "all" || x.cat === ui.libCat) &&
      (!q || x.name.toLowerCase().includes(q) || x.muscles.toLowerCase().includes(q))));
  }
});
document.addEventListener("keydown", e => {
  if (P && !P.done && e.code === "Space" && e.target === document.body) { e.preventDefault(); ACTIONS["pl-pause"](); }
});

history.replaceState({ d: 0 }, "");
render();
