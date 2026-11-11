// FitForge animated exercise illustrations.
// A stick figure is posed with absolute segment angles (degrees): 0 = down, 90 = forward (right),
// 180 = up, -90 = backward (left). Each exercise has 2+ keyframes; the app loops between them.
"use strict";

const FIG = (() => {
  const L = { torso: 30, neck: 13, ua: 16, fa: 15, th: 20, sh: 20, ft: 7, headR: 7 };
  const W = 120, H = 100, GROUND = 93;
  const dir = a => { const r = a * Math.PI / 180; return [Math.sin(r), Math.cos(r)]; };
  const add = (o, a, l) => { const d = dir(a); return [o[0] + d[0] * l, o[1] + d[1] * l]; };

  const DEF = { t: 180, a1: [8, 4], a2: [-8, -4], l1: [3, 0], l2: [-3, 0], air: 0, dx: 0 };

  // ---- shorthand base poses ----
  const PLANK = { t: 97, a1: [0, 0], a2: [0, 0], l1: [-83, -83, -15], l2: [-83, -83, -15], sup: ["t1", "h1"] };
  const PUSH_DOWN = { t: 92, a1: [-118, 22], a2: [-118, 22], l1: [-87, -87, -15], l2: [-87, -87, -15], sup: ["t1", "h1"] };
  const FPLANK = { t: 93, a1: [0, 90], a2: [0, 90], l1: [-86, -86, -15], l2: [-86, -86, -15], sup: ["t1", "e1"] };
  const SUPINE = { t: -90, a1: [90, 90], a2: [90, 90], l1: [90, 90], l2: [90, 90] };
  const KNEES_UP = { l1: [140, 12], l2: [140, 12] };
  const PRONE = { t: 90, a1: [92, 92], a2: [92, 92], l1: [-90, -90], l2: [-90, -90] };
  const QUAD = { t: 90, a1: [0, 0], a2: [0, 0], l1: [0, -90, -90], l2: [0, -90, -90], sup: ["k1", "h1"] };
  const HANDS_HIPS = { a1: [35, -40], a2: [25, -50] };
  const SQUAT = { t: 145, l1: [76, -14], l2: [76, -14], a1: [88, 90], a2: [86, 90] };
  const LUNGE = { t: 178, l1: [84, 0], l2: [-22, -95, -95], ...HANDS_HIPS };
  const SEATED = { t: 165, l1: [90, 90], l2: [90, 90] };
  const mirror = p => {
    const m = { ...p };
    ["a1", "a2", "l1", "l2"].forEach(k => { if (p[k]) m[k] = p[k].map(v => -v); });
    if (p.t !== undefined) m.t = -p.t; if (p.n !== undefined) m.n = -p.n; if (p.dx) m.dx = -p.dx;
    return m;
  };

  // ---- poses per exercise ----
  const P = {
    // Warm-up
    march: { f: [{ l1: [80, 0], a1: [-35, -10], a2: [40, 75] }, { l2: [80, 0], a1: [40, 75], a2: [-35, -10] }] },
    jumping_jacks: { front: 1, f: [{ a1: [15, 8], a2: [-15, -8], l1: [5, 0], l2: [-5, 0] },
      { a1: [150, 168], a2: [-150, -168], l1: [22, 16], l2: [-22, -16], air: 5 }] },
    arm_circles: { front: 1, f: [{ a1: [70, 70], a2: [-70, -70], l1: [8, 4], l2: [-8, -4] },
      { a1: [110, 110], a2: [-110, -110], l1: [8, 4], l2: [-8, -4] }] },
    hip_circles: { front: 1, f: [{ t: 172, a1: [40, -40], a2: [-40, 40], l1: [10, 4], l2: [-10, -4], dx: -3 },
      { t: 188, a1: [40, -40], a2: [-40, 40], l1: [10, 4], l2: [-10, -4], dx: 3 }] },
    leg_swings: { f: [{ l1: [60, 50], a1: [85, 95], a2: [-15, -5] }, { l1: [-40, -30], a1: [85, 95], a2: [-15, -5] }], anchor: "f2" },
    torso_twist: { front: 1, f: [{ t: 176, a1: [90, 40], a2: [-55, 40], l1: [10, 4], l2: [-10, -4] },
      { t: 184, a1: [55, -40], a2: [-90, -40], l1: [10, 4], l2: [-10, -4] }] },
    inchworm: { f: [{ t: 40, a1: [5, 5], a2: [5, 5], l1: [-8, -8], l2: [-8, -8], sup: ["t1", "h1"] },
      { ...PLANK }], period: 1.8 },

    // Cardio
    high_knees: { f: [{ l1: [100, 5], l2: [-12, -35], a1: [-40, 40], a2: [55, 150], air: 3 },
      { l2: [100, 5], l1: [-12, -35], a2: [-40, 40], a1: [55, 150], air: 3 }], period: .45 },
    butt_kicks: { f: [{ l1: [-8, -155], l2: [0, 0], a1: [-30, 80], a2: [35, 130], air: 2 },
      { l2: [-8, -155], l1: [0, 0], a2: [-30, 80], a1: [35, 130], air: 2 }], period: .45 },
    mountain_climbers: { f: [{ ...PLANK, l1: [45, -45, 0], sup: ["h1", "t2"] }, { ...PLANK, l2: [45, -45, 0], sup: ["h1", "t1"] }], period: .5 },
    burpees: { f: [{ a1: [165, 175], a2: [160, 170], air: 9 },
      { t: 135, l1: [70, -35], l2: [65, -40], a1: [10, 5], a2: [10, 5], sup: ["t1", "h1"] },
      { ...PLANK },
      { t: 135, l1: [70, -35], l2: [65, -40], a1: [10, 5], a2: [10, 5], sup: ["t1", "h1"] }], period: .7 },
    skaters: { front: 1, anchor: "hip", f: [{ t: 168, l1: [20, -12], l2: [42, 45], a1: [-55, -40], a2: [-75, -60], dx: -14 },
      { t: 192, l2: [-20, 12], l1: [-42, -45], a2: [55, 40], a1: [75, 60], dx: 14 }], period: .7 },
    fast_feet: { f: [{ t: 160, l1: [32, -12], l2: [22, -22], a1: [60, 110], a2: [50, 100] },
      { t: 160, l1: [22, -22], l2: [32, -12], a1: [60, 110], a2: [50, 100], air: 2 }], period: .2 },
    star_jumps: { front: 1, f: [{ t: 180, l1: [35, -25], l2: [-35, 25], a1: [25, 15], a2: [-25, -15] },
      { a1: [135, 135], a2: [-135, -135], l1: [32, 32], l2: [-32, -32], air: 13 }], period: .6 },
    plank_jacks: { f: [{ ...PLANK, l1: [-80, -80, -15], l2: [-86, -86, -15] }, { ...PLANK, l1: [-86, -86, -15], l2: [-80, -80, -15], air: 2 }], period: .4 },
    shadow_boxing: { f: [{ t: 175, a1: [92, 90], a2: [35, 165], l1: [15, 0], l2: [-15, 0] },
      { t: 175, a1: [40, 165], a2: [92, 90], l1: [15, 0], l2: [-15, 0] }], period: .4 },
    jump_rope: { f: [{ a1: [12, 70], a2: [12, 70] }, { a1: [12, 70], a2: [12, 70], l1: [6, -6], l2: [0, -10], air: 6 }], period: .3 },

    // Upper body
    pushups: { f: [PLANK, PUSH_DOWN] },
    knee_pushups: { f: [{ t: 115, a1: [0, 0], a2: [0, 0], l1: [-45, -105, -105], l2: [-45, -105, -105], sup: ["k1", "h1"] },
      { t: 102, a1: [-118, 22], a2: [-118, 22], l1: [-55, -105, -105], l2: [-55, -105, -105], sup: ["k1", "h1"] }] },
    incline_pushups: { props: [{ box: "other", w: 26 }], f: [{ t: 125, a1: [28, 28], a2: [28, 28], l1: [-55, -55], l2: [-55, -55], sup: ["t1", "h1", -26] },
      { t: 118, a1: [-110, 40], a2: [-110, 40], l1: [-62, -62], l2: [-62, -62], sup: ["t1", "h1", -26] }] },
    wide_pushups: { f: [PLANK, PUSH_DOWN] },
    diamond_pushups: { f: [PLANK, { ...PUSH_DOWN, a1: [-125, 18], a2: [-125, 18] }] },
    pike_pushups: { f: [{ t: 35, a1: [35, 35], a2: [35, 35], l1: [-35, -35], l2: [-35, -35], sup: ["t1", "h1"] },
      { t: 22, a1: [-40, 50], a2: [-40, 50], l1: [-35, -35], l2: [-35, -35], sup: ["t1", "h1"] }] },
    tricep_dips: { props: [{ box: "other", w: 28 }], f: [{ t: 180, a1: [-12, -12], a2: [-12, -12], l1: [75, 10], l2: [75, 10], sup: ["f1", "h1", -26] },
      { t: 176, a1: [-100, -5], a2: [-100, -5], l1: [62, 20], l2: [62, 20], sup: ["f1", "h1", -26] }] },
    shoulder_taps: { f: [{ ...PLANK, a2: [70, -125], sup: ["t1", "h1"] }, { ...PLANK, a1: [70, -125], sup: ["t1", "h2"] }], period: .6 },
    superman: { f: [PRONE, { t: 100, a1: [106, 106], a2: [106, 106], l1: [-102, -102], l2: [-102, -102] }], period: 1.2 },
    snow_angels: { f: [{ t: 96, a1: [-88, -88], a2: [-88, -88], l1: [-90, -90], l2: [-90, -90] },
      { t: 96, a1: [100, 100], a2: [100, 100], l1: [-90, -90], l2: [-90, -90] }] },
    decline_pushups: { props: [{ box: "other", w: 26 }], f: [{ ...PLANK, t: 80, l1: [-97, -97, -15], l2: [-97, -97, -15], sup: ["h1", "t1", -22] },
      { ...PUSH_DOWN, t: 75, l1: [-100, -100, -15], l2: [-100, -100, -15], sup: ["h1", "t1", -22] }] },

    // Lower body
    squats: { f: [{ a1: [5, 5], a2: [0, 0] }, SQUAT] },
    reverse_lunge: { f: [{ ...HANDS_HIPS }, LUNGE] },
    sumo_squat: { front: 1, f: [{ l1: [20, 0], l2: [-20, 0], a1: [30, 145], a2: [-30, -145] },
      { l1: [70, 0], l2: [-70, 0], a1: [30, 145], a2: [-30, -145] }] },
    glute_bridge: { f: [{ ...SUPINE, ...KNEES_UP, sup: ["t1", "sh"] },
      { t: -73, a1: [92, 92], a2: [92, 92], l1: [118, 8], l2: [118, 8], sup: ["t1", "sh"] }] },
    single_leg_bridge: { f: [{ ...SUPINE, l1: [140, 12], l2: [125, 110], sup: ["t1", "sh"] },
      { t: -73, a1: [92, 92], a2: [92, 92], l1: [118, 8], l2: [105, 105], sup: ["t1", "sh"] }] },
    wall_sit: { props: [{ wall: "hip", dx: -6 }], f: [{ t: 180, l1: [90, 0], l2: [90, 0], a1: [5, 5], a2: [0, 0] },
      { t: 180, l1: [90, 0], l2: [90, 0], a1: [8, 3], a2: [3, -2] }], period: 2 },
    calf_raises: { f: [{ l1: [3, 0], l2: [-3, 0] }, { l1: [3, 0, 25], l2: [-3, 0, 25] }], period: .9 },
    step_ups: { props: [{ box: [58, 30, 17] }], f: [{ l1: [78, -8], l2: [0, 0], a1: [-20, -10], a2: [20, 40], pin: ["t2", 46, 0] },
      { l1: [0, 0], l2: [-10, -50], a1: [20, 40], a2: [-20, -10], pin: ["t1", 70, -17] }] },
    split_squat: { props: [{ box: [14, 28, 20] }], f: [{ t: 178, l1: [20, 0], l2: [-45, -95, -95], ...HANDS_HIPS, pin: ["t1", 74, 0] },
      { t: 175, l1: [72, -8], l2: [-12, -95, -95], ...HANDS_HIPS, pin: ["t1", 74, 0] }] },
    jump_squats: { f: [SQUAT, { a1: [-35, -20], a2: [-30, -15], l1: [-2, 2, 30], l2: [2, -2, 30], air: 13 }], period: .6 },
    curtsy_lunge: { f: [{ ...HANDS_HIPS }, { t: 176, l1: [70, 0], l2: [-30, -95, -95], ...HANDS_HIPS }] },
    side_lunge: { front: 1, anchor: "hip", f: [{ l1: [25, 0], l2: [-25, 0], a1: [30, 140], a2: [-30, -140] },
      { l1: [62, -5], l2: [-58, -58], a1: [30, 140], a2: [-30, -140], dx: 10 }] },

    // Core
    plank: { f: [FPLANK, { ...FPLANK, t: 95 }], period: 2 },
    side_plank: { f: [{ t: 104, a1: [0, 90], a2: [170, 175], l1: [-76, -76, -15], l2: [-76, -76, -15], sup: ["t1", "e1"] },
      { t: 110, a1: [0, 90], a2: [178, 180], l1: [-70, -70, -15], l2: [-70, -70, -15], sup: ["t1", "e1"] }], period: 2 },
    crunches: { f: [{ ...SUPINE, ...KNEES_UP, a1: [80, 95], a2: [80, 95] },
      { ...SUPINE, ...KNEES_UP, t: -122, a1: [100, 100], a2: [100, 100] }] },
    bicycle: { f: [{ t: -115, a1: [-150, 60], a2: [-150, 60], l1: [150, 75], l2: [100, 100] },
      { t: -115, a1: [-150, 60], a2: [-150, 60], l2: [150, 75], l1: [100, 100] }], period: .7 },
    leg_raises: { f: [{ ...SUPINE, l1: [97, 97], l2: [97, 97] }, { ...SUPINE, l1: [175, 175], l2: [175, 175] }] },
    dead_bug: { f: [{ ...SUPINE, a1: [180, 180], a2: [180, 180], l1: [180, 90], l2: [180, 90] },
      { ...SUPINE, a1: [-105, -105], a2: [180, 180], l1: [180, 90], l2: [100, 100] }] },
    bird_dog: { f: [QUAD, { ...QUAD, a2: [90, 90], l2: [-90, -90] }] },
    russian_twist: { f: [{ t: -150, a1: [120, 75], a2: [120, 75], l1: [130, 70], l2: [130, 70] },
      { t: -150, a1: [65, 120], a2: [65, 120], l1: [130, 70], l2: [130, 70] }], period: .7 },
    flutter_kicks: { f: [{ ...SUPINE, t: -95, l1: [96, 96], l2: [110, 110] }, { ...SUPINE, t: -95, l1: [110, 110], l2: [96, 96] }], period: .35 },
    hollow_hold: { f: [{ t: -112, a1: [-100, -100], a2: [-100, -100], l1: [106, 106], l2: [106, 106] },
      { t: -115, a1: [-103, -103], a2: [-103, -103], l1: [109, 109], l2: [109, 109] }], period: 2 },
    v_ups: { f: [{ ...SUPINE, a1: [-92, -92], a2: [-92, -92], l1: [92, 92], l2: [92, 92] },
      { t: -140, a1: [140, 140], a2: [140, 140], l1: [138, 138], l2: [138, 138] }] },
    reverse_crunch: { f: [{ ...SUPINE, l1: [165, 90], l2: [165, 90] },
      { t: -72, a1: [92, 92], a2: [92, 92], l1: [-165, 115], l2: [-165, 115] }] },
    heel_touches: { f: [{ ...SUPINE, ...KNEES_UP, t: -110, a1: [85, 85], a2: [85, 85] },
      { ...SUPINE, ...KNEES_UP, t: -112, a1: [100, 100], a2: [100, 100] }], period: .6 },

    // Mobility
    cat_cow: { f: [{ ...QUAD, t: 92, n: 140 }, { ...QUAD, t: 86, n: 40 }], period: 2 },
    worlds_greatest: { f: [{ t: 110, l1: [80, -10], l2: [-55, -95, -95], a1: [0, 0], a2: [0, 0], sup: ["t1", "h1"] },
      { t: 112, l1: [80, -10], l2: [-55, -95, -95], a1: [0, 0], a2: [180, 180], sup: ["t1", "h1"] }], period: 1.8 },
    down_dog: { f: [{ t: 35, a1: [35, 35], a2: [35, 35], l1: [-35, -35], l2: [-35, -35], sup: ["t1", "h1"] },
      { t: 35, a1: [35, 35], a2: [35, 35], l1: [-15, -55], l2: [-35, -35], sup: ["t2", "h1"] }], period: 1.2 },
    cobra: { f: [{ t: 95, a1: [-150, 25], a2: [-150, 25], l1: [-90, -90], l2: [-90, -90] },
      { t: 122, a1: [-20, 25], a2: [-20, 25], l1: [-92, -92], l2: [-92, -92], sup: ["k1", "h1"] }], period: 1.8 },
    thread_needle: { f: [{ ...QUAD, t: 82, a1: [-60, -88], sup: ["k1", "h2"] }, { ...QUAD, t: 95, a1: [170, 170], sup: ["k1", "h2"] }], period: 1.8 },
    deep_squat_hold: { f: [{ t: 160, l1: [62, -38], l2: [58, -40], a1: [75, 150], a2: [70, 150] },
      { t: 163, l1: [62, -38], l2: [58, -40], a1: [72, 150], a2: [67, 150] }], period: 2 },
    thoracic_rotation: { f: [{ t: -90, a1: [120, 100], a2: [120, 100], l1: [135, 60], l2: [135, 60] },
      { t: -90, a1: [120, 100], a2: [-150, -110], l1: [135, 60], l2: [135, 60] }], period: 1.8 },
    neck_rolls: { front: 1, f: [{ n: 160, l1: [8, 4], l2: [-8, -4] }, { n: 200, l1: [8, 4], l2: [-8, -4] }], period: 1.8 },
    chin_tucks: { f: [{ n: 160 }, { n: 186 }], period: 1.2 },
    wall_angels: { front: 1, f: [{ a1: [92, 180], a2: [-92, -180], l1: [8, 4], l2: [-8, -4] },
      { a1: [150, 165], a2: [-150, -165], l1: [8, 4], l2: [-8, -4] }], period: 1.6 },

    // Stretch
    childs_pose: { f: [{ t: 58, a1: [80, 85], a2: [80, 85], l1: [70, -90, -90], l2: [70, -90, -90] },
      { t: 62, a1: [82, 87], a2: [82, 87], l1: [70, -90, -90], l2: [70, -90, -90] }], period: 2.2 },
    hip_flexor: { f: [{ t: 180, l1: [82, 0], l2: [-22, -92, -92], ...HANDS_HIPS },
      { t: 186, l1: [72, -6], l2: [-38, -92, -92], ...HANDS_HIPS }], anchor: "t1", period: 2 },
    hamstring: { f: [{ ...SEATED, t: 165, a1: [120, 120], a2: [120, 120] }, { ...SEATED, t: 122, a1: [97, 97], a2: [97, 97] }], period: 2 },
    quad_stretch: { f: [{ l1: [-8, -158], l2: [0, 0], a1: [-35, -10], a2: [85, 95] },
      { l1: [-15, -162], l2: [0, 0], a1: [-40, -12], a2: [85, 95] }], anchor: "t2", period: 2 },
    figure_four: { f: [{ ...SUPINE, l2: [140, 12], l1: [112, -128], a1: [92, 92], a2: [92, 92] },
      { ...SUPINE, t: -95, l2: [172, 95], l1: [140, -125], a1: [150, 175], a2: [150, 175] }], period: 2 },
    chest_stretch: { props: [{ wall: "e1", dx: 4 }], f: [{ t: 180, a1: [90, 180], a2: [-5, -5] },
      { t: 172, a1: [80, 180], a2: [-5, -5], l1: [15, 0], l2: [-10, 0] }], anchor: "t2", period: 2 },
    calf_stretch: { props: [{ wall: "h1", dx: 3 }], f: [{ t: 155, a1: [70, 85], a2: [70, 85], l1: [25, -5], l2: [-28, -28] },
      { t: 150, a1: [68, 82], a2: [68, 82], l1: [30, -8], l2: [-32, -32] }], anchor: "t2", period: 2 },

    // Tai Chi: slow, soft knees, rounded arms
    tc_breathing: { f: [{ t: 178, l1: [10, -6], l2: [6, -8], a1: [25, 95], a2: [20, 95] },
      { t: 178, l1: [8, -4], l2: [4, -6], a1: [50, 135], a2: [45, 135] }], period: 3 },
    tc_lift_sky: { front: 1, f: [{ a1: [15, -25], a2: [-15, 25], l1: [8, 4], l2: [-8, -4] },
      { a1: [170, 178], a2: [-170, -178], l1: [8, 4], l2: [-8, -4] }], period: 2.6 },
    tc_weight_shift: { front: 1, anchor: "hip", f: [{ t: 176, l1: [34, -6], l2: [-24, -22], a1: [45, 115], a2: [-45, -115], dx: -6 },
      { t: 184, l2: [-34, 6], l1: [24, 22], a1: [45, 115], a2: [-45, -115], dx: 6 }], period: 2.4 },
    tc_commence: { f: [{ a1: [5, 8], a2: [0, 3] }, { t: 178, l1: [16, -10], l2: [12, -14], a1: [80, 95], a2: [76, 92] },
      { t: 178, l1: [22, -14], l2: [18, -18], a1: [35, 80], a2: [30, 78] }], period: 2.2 },
    tc_hold_ball: { f: [{ t: 178, l1: [14, -8], l2: [10, -12], a1: [65, 100], a2: [22, 90] },
      { t: 178, l1: [14, -8], l2: [10, -12], a1: [22, 90], a2: [65, 100] }], period: 2.2 },
    tc_wild_horse: { anchor: "t2", f: [{ t: 176, l1: [22, -2], l2: [-18, -12], a1: [45, 100], a2: [65, 95] },
      { t: 172, l1: [42, -6], l2: [-32, -32], a1: [105, 112], a2: [-18, 10] }], period: 2.4 },
    tc_cloud_hands: { front: 1, anchor: "hip", f: [{ t: 176, l1: [16, 0], l2: [-16, 0], a1: [55, 165], a2: [-15, 35], dx: -4 },
      { t: 184, l1: [16, 0], l2: [-16, 0], a1: [15, -35], a2: [-55, -165], dx: 4 }], period: 2.4 },
    tc_brush_knee: { anchor: "t2", f: [{ t: 176, l1: [20, 0], l2: [-20, -14], a1: [-30, 160], a2: [45, 80] },
      { t: 170, l1: [42, -6], l2: [-32, -32], a1: [88, 92], a2: [-10, 30] }], period: 2.4 },
    tc_repulse_monkey: { anchor: "t1", f: [{ t: 182, l1: [30, 22], l2: [-6, -28], a1: [86, 90], a2: [-45, 150] },
      { t: 182, l1: [26, 18], l2: [-10, -30], a1: [40, 100], a2: [-15, 160] }], period: 2.4 },
    tc_golden_rooster: { anchor: "t2", f: [{ t: 180, l1: [10, -6], l2: [0, -4], a1: [20, 60], a2: [-5, 10] },
      { t: 180, l1: [92, 5], l2: [0, -4], a1: [120, 172], a2: [-8, 15] }], period: 2.6 },
    tc_single_whip: { anchor: "t2", f: [{ t: 178, l1: [22, 0], l2: [-20, -14], a1: [50, 120], a2: [-88, -100] },
      { t: 172, l1: [42, -6], l2: [-32, -32], a1: [88, 95], a2: [-88, -100] }], period: 2.6 },
    tc_bird_tail: { anchor: "t2", f: [{ t: 174, l1: [40, -6], l2: [-30, -30], a1: [72, 112], a2: [35, 95] },
      { t: 186, l1: [18, 2], l2: [-14, -20], a1: [15, 70], a2: [-5, 50] },
      { t: 172, l1: [42, -6], l2: [-32, -32], a1: [86, 96], a2: [84, 96] }], period: 2.2 },
    tc_heel_toe: { anchor: "hip", f: [{ t: 178, l1: [22, 4], l2: [-12, -22], a1: [35, -40], a2: [25, -50], dx: -3 },
      { t: 178, l1: [-12, -22], l2: [22, 4], a1: [35, -40], a2: [25, -50], dx: 3 }], period: 1.8 },
    tc_closing: { front: 1, f: [{ a1: [125, -150], a2: [-125, 150], l1: [12, -6], l2: [-12, 6] },
      { a1: [10, 5], a2: [-10, -5], l1: [6, 0], l2: [-6, 0] }], period: 2.8 },
  };

  // ---- forward kinematics ----
  function pose(raw, front) {
    const p = { ...DEF, ...raw };
    const pt = {};
    pt.hip = [0, 0];
    pt.sh = add(pt.hip, p.t, L.torso);
    pt.head = add(pt.sh, p.n !== undefined ? p.n : p.t, L.neck);
    pt.e1 = add(pt.sh, p.a1[0], L.ua); pt.h1 = add(pt.e1, p.a1[1], L.fa);
    pt.e2 = add(pt.sh, p.a2[0], L.ua); pt.h2 = add(pt.e2, p.a2[1], L.fa);
    [["1", p.l1, 1], ["2", p.l2, -1]].forEach(([s, l, side]) => {
      pt["k" + s] = add(pt.hip, l[0], L.th);
      pt["f" + s] = add(pt["k" + s], l[1], L.sh);
      let fa = l[2];
      if (fa === undefined) fa = front ? l[1] + 90 * side : (Math.abs(l[1]) < 45 ? l[1] + 90 : l[1]);
      pt["t" + s] = add(pt["f" + s], fa, front ? 5 : L.ft);
    });
    return { pt, p };
  }
  const POINTS = ["hip", "sh", "e1", "h1", "e2", "h2", "k1", "f1", "t1", "k2", "f2", "t2"];

  function rotateAbout(pt, c, ang) {
    const cs = Math.cos(ang), sn = Math.sin(ang);
    for (const k in pt) { const x = pt[k][0] - c[0], y = pt[k][1] - c[1]; pt[k] = [c[0] + x * cs - y * sn, c[1] + x * sn + y * cs]; }
  }
  function shift(pt, dx, dy) { for (const k in pt) pt[k] = [pt[k][0] + dx, pt[k][1] + dy]; }
  function lowest(pt) { let m = -1e9; POINTS.forEach(k => m = Math.max(m, pt[k][1])); return Math.max(m, pt.head[1] + L.headR); }
  function bboxX(pt) { let a = 1e9, b = -1e9; for (const k in pt) { a = Math.min(a, pt[k][0]); b = Math.max(b, pt[k][0]); } return [a - L.headR, b + L.headR]; }

  // Solve one frame into viewBox coordinates. `anchorX` keeps the figure planted across frames.
  function solve(def, raw, anchorX) {
    const { pt, p } = pose(raw, def.front);
    if (p.sup) {
      const [pv, ot, dy = 0] = p.sup, a = pt[pv], b = pt[ot];
      const vx = b[0] - a[0], vy = b[1] - a[1], len = Math.hypot(vx, vy);
      if (len > Math.abs(dy)) {
        const cur = Math.atan2(vy, vx), tgt = Math.atan2(dy, Math.sign(vx || 1) * Math.sqrt(len * len - dy * dy));
        rotateAbout(pt, a, tgt - cur);
      }
      const piv = pt[pv];
      const ax = anchorX === undefined ? null : anchorX;
      shift(pt, ax === null ? 0 : ax - piv[0], GROUND - piv[1] - p.air);
      // keep everything above ground
      const lo = lowest(pt); if (lo > GROUND + .5) shift(pt, 0, GROUND - lo);
      return { pt, p, anchorJoint: pv };
    }
    if (p.pin) { const [j, x, y] = p.pin; shift(pt, x - pt[j][0], GROUND + y - pt[j][1] - p.air); return { pt, p, pinned: true }; }
    shift(pt, 0, GROUND - lowest(pt) - p.air);
    const aj = def.anchor || "t1";
    if (anchorX !== undefined) shift(pt, anchorX - pt[aj][0] + p.dx, 0);
    return { pt, p, anchorJoint: aj };
  }

  const cache = {};
  function prepare(id) {
    if (cache[id]) return cache[id];
    const def = P[id] || P.march;
    // centre frame 0 horizontally, then derive the anchor x shared by all frames
    // centre the union of all keyframes horizontally
    let anchorX;
    if (!def.f[0].pin) {
      let lo = 1e9, hi = -1e9;
      def.f.forEach(fr => { const [a, b] = bboxX(solve(def, { ...DEF, ...fr }, 0).pt); lo = Math.min(lo, a); hi = Math.max(hi, b); });
      anchorX = W / 2 - (lo + hi) / 2;
    }
    const props = (def.props || []).map(pr => {
      if (pr.box && Array.isArray(pr.box)) return { box: pr.box };
      const ref = solve(def, def.f[0], anchorX);
      if (pr.box === "other") { const j = ref.pt[ref.p.sup[1]]; const h = Math.abs(ref.p.sup[2] || 20); return { box: [j[0] - pr.w / 2, pr.w, h] }; }
      if (pr.wall) return { wall: ref.pt[pr.wall][0] + (pr.dx || 0) };
      return null;
    }).filter(Boolean);
    return cache[id] = { def, anchorX, props, period: (def.period || 1.1) * 1000 };
  }

  function lerp(a, b, f) {
    const o = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    keys.forEach(k => {
      const va = a[k], vb = b[k];
      if (Array.isArray(va) && Array.isArray(vb) && typeof va[0] === "number") {
        o[k] = va.map((v, i) => vb[i] === undefined ? v : v + (vb[i] - v) * f);
        if (vb.length > va.length) for (let i = va.length; i < vb.length; i++) o[k][i] = vb[i];
      } else if (typeof va === "number" && typeof vb === "number") o[k] = va + (vb - va) * f;
      else o[k] = f < .5 ? (va !== undefined ? va : vb) : (vb !== undefined ? vb : va);
    });
    return o;
  }

  function framePose(id, time) {
    const c = prepare(id), fr = c.def.f;
    const norm = f => ({ ...DEF, ...f });
    if (time === null) return solve(c.def, norm(fr[Math.min(1, fr.length - 1)]), c.anchorX);
    const span = time / c.period, i = Math.floor(span) % fr.length, j = (i + 1) % fr.length;
    let f = span - Math.floor(span);
    f = f < .2 ? 0 : f > .8 ? 1 : (f - .2) / .6;          // hold briefly at each keyframe
    f = f * f * (3 - 2 * f);                                // smoothstep
    const a = norm(fr[i]), b = norm(fr[j]);
    if (a.l1.length === 2 && b.l1.length === 3) a.l1 = [...a.l1, b.l1[2]];
    return solve(c.def, lerp(a, b, f), c.anchorX);
  }

  function inner(id, time) {
    const c = prepare(id), { pt } = framePose(id, time);
    const f = n => n.toFixed(1);
    const line = (ks, cls) => `<polyline class="${cls}" points="${ks.map(k => f(pt[k][0]) + "," + f(pt[k][1])).join(" ")}"/>`;
    let s = `<line class="fg-ground" x1="4" y1="${GROUND + 1.5}" x2="${W - 4}" y2="${GROUND + 1.5}"/>`;
    c.props.forEach(pr => {
      if (pr.box) s += `<rect class="fg-prop" x="${f(pr.box[0])}" y="${f(GROUND - pr.box[2])}" width="${f(pr.box[1])}" height="${f(pr.box[2] + 1.5)}" rx="2"/>`;
      if (pr.wall) s += `<rect class="fg-prop" x="${f(pr.wall)}" y="8" width="5" height="${GROUND - 6.5}" rx="1.5"/>`;
    });
    const far = c.def.front ? "fg-near" : "fg-far";
    s += line(["sh", "e2", "h2"], far) + line(["hip", "k2", "f2", "t2"], far);
    s += line(["hip", "sh"], "fg-near fg-torso") + line(["hip", "k1", "f1", "t1"], "fg-near") + line(["sh", "e1", "h1"], "fg-near");
    s += `<circle class="fg-head" cx="${f(pt.head[0])}" cy="${f(pt.head[1])}" r="${L.headR}"/>`;
    return s;
  }

  function svg(id, opts = {}) {
    const cls = ["fig", opts.cls || "", opts.light ? "fig-light" : ""].join(" ");
    return `<svg class="${cls}" viewBox="-12 -16 ${W + 24} ${H + 18}" data-fig="${id}" ${opts.anim ? 'data-anim="1"' : ""} aria-hidden="true">${inner(id, null)}</svg>`;
  }

  // One shared animation loop for every animated figure on screen.
  let start = performance.now();
  function loop(now) {
    document.querySelectorAll('svg.fig[data-anim="1"]').forEach(el => {
      el.innerHTML = inner(el.dataset.fig, now - start);
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  return { svg, inner, ids: () => Object.keys(P), has: id => !!P[id] };
})();
