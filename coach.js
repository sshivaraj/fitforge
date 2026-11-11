// FitForge voice instructors. Uses the browser's built-in speech synthesis (Web Speech API),
// so it works offline and costs nothing. Each coach has a personality, a preferred voice, and scripts.
"use strict";

const COACHES = {
  maya: {
    id: "maya", name: "Coach Maya", initials: "M", color: "#8b5cf6", style: "Calm and breath-led",
    bio: "Tai chi, yoga and mobility teacher. Slow, precise and soothing.",
    rate: 0.82, pitch: 1,
    voiceHints: ["Ava", "Samantha", "Microsoft Aria", "Microsoft Jenny", "Google UK English Female", "Serena", "Moira", "Karen", "Flo", "Shelley", "Tessa", "Veena", "Zira", "English UK · Female", "English US · Female", "Female"],
    intro: c => `Welcome${c.name}. I'm Maya. Today's practice is ${c.title}, about ${c.dur}. Find a quiet space, soften your knees, and let your shoulders drop. We begin with ${c.first}.`,
    go: ["Begin, slowly.", "And begin.", "Move with your breath."],
    round: r => `Round ${r}. Again, even slower this time.`,
    cue: t => `Remember. ${t}`,
    easier: t => `If you need it, ${t.charAt(0).toLowerCase() + t.slice(1)}`,
    half: ["Good. Stay soft and steady.", "Lovely. Keep the breath long.", "Relax your shoulders. Let the movement flow.", "Beautiful. Feel your feet rooted into the floor."],
    last10: ["Ten more seconds. Stay smooth.", "Almost there. Keep breathing."],
    sides: "Gently switch sides.",
    rest: ["Rest. Let your arms hang and breathe.", "Pause here. Notice how your body feels.", "Rest, and breathe slowly."],
    outro: c => `Bring your hands down and rest. That was ${c.dur} of practice. Thank you${c.name}. Carry this calm into your day.`,
    pause: "Paused. Take all the time you need.", resume: "Let's continue.",
    breath: ["Breathe in.", "And breathe out."],
  },
  arjun: {
    id: "arjun", name: "Coach Arjun", initials: "A", color: "#f97316", style: "High energy",
    bio: "Strength and HIIT coach. Pushes you hard, keeps your form honest.",
    rate: 0.95, pitch: 1,
    voiceHints: ["Microsoft Guy", "Daniel", "Google UK English Male", "Reed (English (United Kingdom))", "Evan", "Aaron", "Arthur", "Alex", "Rishi", "English UK · Male", "English US · Male", "English India · Male", "Male"],
    intro: c => `Let's go${c.name}! I'm Arjun, and I'm coaching you today. ${c.title}. ${c.dur}, ${c.count} moves. Give me your best effort. First up, ${c.first}.`,
    go: ["Go!", "Let's go!", "Go, go, go!", "Hit it!"],
    round: r => `Round ${r}! Same energy, let's go!`,
    cue: t => `Form check! ${t}`,
    easier: t => `Need to scale it? ${t}`,
    half: ["Halfway! Keep pushing!", "Strong! Don't slow down!", "Breathe! Keep that pace!", "You're doing great, keep it up!", "Stay tight, stay strong!"],
    last10: ["Ten seconds! Push!", "Ten more! Empty the tank!", "Last ten, finish strong!"],
    sides: "Switch sides!",
    rest: ["Rest! Shake it out.", "Good work. Breathe.", "Nice! Grab some air."],
    outro: c => `That's a wrap! ${c.dur}${c.kcal >= 5 ? `, around ${c.kcal} calories burned` : ""}. Great work${c.name}. Drink some water and I'll see you next session.`,
    pause: "Paused. Catch your breath.", resume: "Back to work!",
  },
  sam: {
    id: "sam", name: "Coach Sam", initials: "S", color: "#22c55e", style: "Friendly and encouraging",
    bio: "Beginner specialist. Patient, positive and big on good habits.",
    rate: 0.88, pitch: 1,
    voiceHints: ["Karen", "Microsoft Jenny", "Allison", "Nicky", "Google US English", "Moira", "Shelley (English (United States))", "Flo (English (United States))", "Tessa", "Samantha", "English US · Female 2", "English Australia · Female", "English US · Female"],
    intro: c => `Hi${c.name}, I'm Sam. Today we're doing ${c.title}, about ${c.dur}. Go at your own pace, and remember you can make any move easier. First, ${c.first}.`,
    go: ["Let's go.", "Off you go.", "Begin when you're ready."],
    round: r => `Round ${r}. You've got this.`,
    cue: t => `Quick tip. ${t}`,
    easier: t => `Too hard? ${t}`,
    half: ["Halfway there, nice work.", "Looking good. Keep breathing.", "You're doing great.", "Steady pace. Quality over speed."],
    last10: ["Ten seconds left. You've got this.", "Almost done, ten more seconds."],
    sides: "Now switch sides.",
    rest: ["Take a rest.", "Nice job. Rest up.", "Great. Breathe and recover."],
    outro: c => `And you're done! ${c.dur}${c.kcal >= 5 ? `, about ${c.kcal} calories` : ""}. I'm proud of you${c.name}. Same time tomorrow?`,
    pause: "Paused. Take a breather.", resume: "Okay, let's keep going.",
  },
};

const COACH_BY_SOURCE = {
  taichi28: "maya", mobility14: "maya", desk7: "maya", hiit21: "arjun", strength28: "arjun", foundations: "sam", core14: "sam",
  taichi10: "maya", stretch10: "maya", seven: "arjun", tabata: "arjun", upper12: "arjun", legs12: "arjun", abs10: "sam",
  balance30: "maya", plank30: "arjun", squat30: "arjun", pushup30: "arjun", burpee30: "arjun",
};

const Coach = (() => {
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let onCaption = () => {}, onSpeaking = () => {};

  function voices() {
    // English voices only, minus the novelty/robot voices some systems ship
    const NOVELTY = /^(Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Fred|Good News|Grandma|Grandpa|Jester|Junior|Organ|Ralph|Superstar|Trinoids|Whisper|Wobble|Zarvox|Kathy)\b/;
    try { return speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang) && !NOVELTY.test(v.name)); } catch { return []; }
  }
  // Higher-quality voices sound much smoother and clearer than compact ones.
  const QUALITY = /(Premium|Enhanced|Natural|Neural|Online)/i;
  function voiceFor(coach) {
    const vs = voices(); if (!vs.length) return null;
    const saved = S.coachVoice && S.coachVoice[coach.id];
    if (saved) { const v = vs.find(x => x.voiceURI === saved); if (v) return v; }
    for (const h of coach.voiceHints) {
      const m = vs.filter(x => x.name.includes(h));
      if (m.length) return m.find(x => QUALITY.test(x.name)) || m[0];
    }
    return vs.find(x => QUALITY.test(x.name)) || vs[0];
  }

  // Speech engines read symbols badly; tidy the text and split it into sentences.
  function clean(t) {
    return t.replace(/\s*\(([^)]*)\)/g, ", $1,").replace(/,\s*([.!?])/g, "$1").replace(/[;:]/g, ".").replace(/&/g, " and ").replace(/\s*[–—]\s*/g, ", ").replace(/\//g, " or ")
      .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, "").replace(/\s+/g, " ").trim();
  }
  const sentences = t => clean(t).split(/(?<=[.!?])\s+/).filter(Boolean);

  let busy = false, gen = 0;

  // prio: "high" interrupts; "normal" interrupts; "low" only speaks when idle (encouragement, breath cues)
  function say(coach, text, prio = "normal") {
    if (!text) return false;
    const synth = "speechSynthesis" in window ? speechSynthesis : null;
    if (prio === "low" && (busy || (synth && synth.speaking))) return false;
    onCaption(coach, text);
    if (!S.voice || !synth) return true;
    const my = ++gen;
    try { if (synth.speaking || synth.pending) synth.cancel(); } catch {}
    busy = true; onSpeaking(true);
    // A short gap after cancel() stops the first words being clipped.
    setTimeout(() => {
      if (my !== gen) return;
      const parts = sentences(text), v = voiceFor(coach);
      parts.forEach((part, i) => {
        const u = new SpeechSynthesisUtterance(part);
        if (v) { u.voice = v; u.lang = v.lang; }
        u.rate = coach.rate * (S.voiceRate || 1); u.pitch = coach.pitch; u.volume = 1;
        if (i === parts.length - 1) u.onend = u.onerror = () => { if (my === gen) { busy = false; onSpeaking(false); } };
        try { synth.speak(u); } catch {}
      });
    }, 150);
    return true;
  }
  function stop() { gen++; busy = false; try { speechSynthesis.cancel(); } catch {} onSpeaking(false); }
  function isBusy() { return busy; }

  function forWorkout(source, w) {
    if (S.coach && S.coach !== "auto" && COACHES[S.coach]) return COACHES[S.coach];
    const key = source && (source.id || source.quick);
    if (key && COACH_BY_SOURCE[key]) return COACHES[COACH_BY_SOURCE[key]];
    const sig = w && w.sections.flatMap(s => s.items).some(i => EX[i.id].cat === "taichi");
    if (sig || (w && w.kind === "mobility")) return COACHES.maya;
    return COACHES.sam;
  }

  function avatar(coach, size = 44) {
    return `<div class="avatar" style="--av:${coach.color};width:${size}px;height:${size}px;font-size:${Math.round(size * .42)}px">${coach.initials}</div>`;
  }

  try { speechSynthesis.onvoiceschanged = () => document.dispatchEvent(new Event("voiceschanged")); } catch {}

  return { say, stop, isBusy, pick, voices, voiceFor, forWorkout, avatar,
    set onCaption(f) { onCaption = f; }, set onSpeaking(f) { onSpeaking = f; } };
})();
