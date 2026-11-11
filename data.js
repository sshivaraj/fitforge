// FitForge content: exercise library, programs, quick workouts, challenges.
// Programming principles used (common across ACSM/WHO guidance, coaching channels and r/bodyweightfitness):
//  - Always warm up (raise pulse + dynamic mobility) and cool down (static stretches).
//  - Progressive overload: work time goes up and rest goes down week by week, rounds increase.
//  - 1 active-recovery (mobility) day + 1 full rest day per week for beginners.
//  - Alternate movement patterns (push / squat / hinge / core / conditioning) inside every circuit.
//  - WHO target: 150-300 min moderate or 75-150 min vigorous activity per week.

const CATEGORIES = {
  warmup:   { label: "Warm-up",   emoji: "🔥" },
  cardio:   { label: "Cardio",    emoji: "❤️" },
  upper:    { label: "Upper body", emoji: "💪" },
  lower:    { label: "Lower body", emoji: "🦵" },
  core:     { label: "Core",      emoji: "🎯" },
  mobility: { label: "Mobility",  emoji: "🧘" },
  stretch:  { label: "Stretch",   emoji: "🌿" },
  taichi:   { label: "Tai Chi",   emoji: "☯️" },
};

// e(id, name, category, muscles, level 1-3, MET, perSide, tip, steps[], easier?)
function e(id, name, cat, muscles, level, met, perSide, tip, steps, easier) {
  return { id, name, cat, muscles, level, met, perSide, tip, steps, easier };
}

const EXERCISES = [
  // ---------- Warm-up ----------
  e("march", "March in Place", "warmup", "Full body, heart rate", 1, 3.5, false, "Pump your arms to raise the heart rate faster.",
    ["Stand tall, core lightly braced.", "Lift knees to hip height one at a time.", "Swing opposite arm with each step."]),
  e("jumping_jacks", "Jumping Jacks", "warmup", "Full body, calves, shoulders", 1, 8.0, false, "Land softly on the balls of your feet.",
    ["Start with feet together, arms by your sides.", "Jump feet wide while raising arms overhead.", "Jump back to start and repeat at a steady rhythm."], "Step jacks: step one foot out at a time."),
  e("arm_circles", "Arm Circles", "warmup", "Shoulders", 1, 2.5, false, "Go forward for half the time, then backward.",
    ["Stand with arms straight out to the sides.", "Draw small circles, gradually making them bigger.", "Reverse direction halfway."]),
  e("hip_circles", "Hip Circles", "warmup", "Hips, lower back", 1, 2.5, false, "Keep the shoulders still; only the hips move.",
    ["Hands on hips, feet shoulder-width apart.", "Draw big slow circles with your hips.", "Switch direction halfway."]),
  e("leg_swings", "Leg Swings", "warmup", "Hips, hamstrings, hip flexors", 1, 2.8, true, "Hold a wall for balance; let the swing grow gradually.",
    ["Stand side-on to a wall, hand on it for balance.", "Swing the outside leg forward and back like a pendulum.", "Switch legs halfway."]),
  e("torso_twist", "Standing Torso Twists", "warmup", "Spine, obliques", 1, 2.5, false, "Let the arms stay loose and pivot the back foot.",
    ["Feet hip-width, arms relaxed.", "Rotate your upper body side to side.", "Let arms swing naturally with the twist."]),
  e("inchworm", "Inchworm", "warmup", "Hamstrings, shoulders, core", 2, 4.0, false, "Bend the knees as much as you need to reach the floor.",
    ["Stand tall, hinge forward and place hands on the floor.", "Walk hands out to a high plank.", "Walk hands back to feet and stand up."]),

  // ---------- Cardio ----------
  e("high_knees", "High Knees", "cardio", "Hip flexors, quads, heart rate", 2, 8.0, false, "Stay on the balls of your feet and drive the arms.",
    ["Run in place.", "Drive each knee up to hip height.", "Keep a fast rhythm and tall chest."], "March with high knees instead of running."),
  e("butt_kicks", "Butt Kicks", "cardio", "Hamstrings, heart rate", 1, 7.0, false, "Keep knees pointing down; heels come up to the glutes.",
    ["Jog in place.", "Kick heels up toward your glutes.", "Keep arms pumping."]),
  e("mountain_climbers", "Mountain Climbers", "cardio", "Core, shoulders, hip flexors", 2, 8.0, false, "Hips level with shoulders, don't let them pike up.",
    ["Start in a high plank, hands under shoulders.", "Drive one knee toward the chest.", "Switch legs quickly, like running."], "Slow climbers: step each foot in."),
  e("burpees", "Burpees", "cardio", "Full body", 3, 8.0, false, "Breathe out on the jump. Quality over speed.",
    ["From standing, squat and place hands on the floor.", "Jump feet back to a plank (add a push-up if you can).", "Jump feet in and explode up with arms overhead."], "Step back instead of jumping and skip the jump at the top."),
  e("skaters", "Skater Hops", "cardio", "Glutes, legs, balance", 2, 7.0, false, "Land softly and pause briefly on each side.",
    ["Leap sideways onto your right foot.", "Sweep the left leg behind you.", "Leap to the left and repeat."]),
  e("fast_feet", "Fast Feet", "cardio", "Calves, heart rate", 1, 7.0, false, "Stay low in a quarter squat.",
    ["Slight squat, chest up.", "Patter your feet as fast as you can.", "Keep arms ready like an athlete."]),
  e("star_jumps", "Star Jumps", "cardio", "Full body power", 3, 8.0, false, "Land with soft knees every time.",
    ["Squat down slightly.", "Explode up, spreading arms and legs into a star.", "Land softly with feet together."]),
  e("plank_jacks", "Plank Jacks", "cardio", "Core, shoulders", 2, 7.0, false, "Keep hips still while the feet jump.",
    ["High plank position.", "Jump feet wide, then back together.", "Keep the core tight throughout."]),
  e("shadow_boxing", "Shadow Boxing", "cardio", "Shoulders, core, heart rate", 1, 6.0, false, "Rotate through the hips on every punch.",
    ["Boxing stance, hands up by your chin.", "Throw jabs, crosses and hooks.", "Stay light on your feet."]),
  e("jump_rope", "Imaginary Jump Rope", "cardio", "Calves, heart rate", 1, 8.0, false, "Small, quick hops just off the ground.",
    ["Mimic holding rope handles.", "Rotate wrists and hop on the balls of your feet.", "Mix in alternate-foot steps."]),

  // ---------- Upper body ----------
  e("pushups", "Push-ups", "upper", "Chest, triceps, shoulders, core", 2, 3.8, false, "Body in one straight line; elbows at about 45°.",
    ["Hands slightly wider than shoulders, body straight.", "Lower your chest to just above the floor.", "Press back up to straight arms."], "Knee push-ups or incline push-ups."),
  e("knee_pushups", "Knee Push-ups", "upper", "Chest, triceps", 1, 3.5, false, "Keep hips in line with knees and shoulders.",
    ["Kneel and place hands under shoulders.", "Lower your chest toward the floor.", "Push back up."]),
  e("incline_pushups", "Incline Push-ups", "upper", "Chest, triceps", 1, 3.5, false, "The higher the surface, the easier it gets.",
    ["Hands on a bench, sofa arm or wall.", "Walk feet back so the body is straight.", "Lower chest to the edge and press away."]),
  e("wide_pushups", "Wide Push-ups", "upper", "Chest, front shoulders", 2, 3.8, false, "Don't flare elbows straight out to the sides.",
    ["Hands wider than a regular push-up.", "Lower slowly with control.", "Press up through the chest."]),
  e("diamond_pushups", "Diamond Push-ups", "upper", "Triceps, inner chest", 3, 3.8, false, "Elbows stay close to the ribs.",
    ["Make a diamond with thumbs and index fingers under the chest.", "Lower with elbows tucked.", "Press up to full extension."], "Do them on your knees."),
  e("pike_pushups", "Pike Push-ups", "upper", "Shoulders, triceps", 3, 3.8, false, "Head goes slightly in front of your hands.",
    ["From a plank, lift hips high into an inverted V.", "Bend elbows to lower your head toward the floor.", "Press back up."]),
  e("tricep_dips", "Chair Triceps Dips", "upper", "Triceps, shoulders", 2, 3.8, false, "Use a sturdy chair against a wall. Keep shoulders down.",
    ["Hands on the chair edge behind you, legs out front.", "Bend elbows to about 90°.", "Push back up."], "Bend your knees and keep feet closer."),
  e("shoulder_taps", "Plank Shoulder Taps", "upper", "Shoulders, core anti-rotation", 2, 3.8, false, "Widen your feet to stop the hips rocking.",
    ["High plank, feet hip-width.", "Lift one hand and tap the opposite shoulder.", "Alternate sides with minimal hip movement."]),
  e("superman", "Superman Hold", "upper", "Lower back, glutes, upper back", 1, 3.0, false, "Look at the floor to keep the neck neutral.",
    ["Lie face-down, arms overhead.", "Lift arms, chest and legs off the floor.", "Hold and squeeze the glutes, or pulse up and down."]),
  e("snow_angels", "Reverse Snow Angels", "upper", "Upper back, rear shoulders", 1, 3.0, false, "Keep arms off the floor the whole time.",
    ["Lie face-down, arms by your sides, chest slightly lifted.", "Sweep arms out and overhead in an arc.", "Sweep them back down to your hips."]),
  e("decline_pushups", "Decline Push-ups", "upper", "Upper chest, shoulders", 3, 3.8, false, "Feet on a step or sofa; keep the core tight.",
    ["Feet on a raised surface, hands on the floor.", "Lower chest toward the floor.", "Press back up."]),

  // ---------- Lower body ----------
  e("squats", "Bodyweight Squats", "lower", "Quads, glutes, hamstrings", 1, 5.0, false, "Knees track over toes; push the floor away.",
    ["Feet shoulder-width, toes slightly out.", "Sit hips back and down until thighs are about parallel.", "Drive up through the whole foot."], "Squat to a chair."),
  e("reverse_lunge", "Reverse Lunges", "lower", "Quads, glutes", 1, 4.0, false, "Front shin stays vertical; step far enough back.",
    ["Stand tall.", "Step one foot back and lower the back knee toward the floor.", "Push through the front heel to return. Alternate legs."]),
  e("sumo_squat", "Sumo Squats", "lower", "Inner thighs, glutes", 1, 5.0, false, "Push knees out in line with toes.",
    ["Wide stance, toes turned out.", "Lower hips straight down.", "Squeeze glutes to stand."]),
  e("glute_bridge", "Glute Bridge", "lower", "Glutes, hamstrings", 1, 3.0, false, "Squeeze glutes at the top; don't arch the lower back.",
    ["Lie on your back, knees bent, feet flat.", "Drive hips up until body is straight from knees to shoulders.", "Lower with control."]),
  e("single_leg_bridge", "Single-leg Glute Bridge", "lower", "Glutes, hamstrings", 2, 3.5, true, "Keep hips level as you lift.",
    ["Bridge position with one leg extended.", "Drive up through the planted heel.", "Lower slowly. Switch legs halfway."]),
  e("wall_sit", "Wall Sit", "lower", "Quads, endurance", 1, 3.5, false, "Thighs parallel, knees above ankles.",
    ["Back flat against a wall.", "Slide down until knees are at 90°.", "Hold and breathe steadily."]),
  e("calf_raises", "Calf Raises", "lower", "Calves", 1, 2.8, false, "Pause at the top for a full squeeze.",
    ["Stand tall, a hand on a wall for balance.", "Rise onto the balls of your feet.", "Lower slowly."]),
  e("step_ups", "Step-ups", "lower", "Quads, glutes", 1, 5.0, false, "Use a sturdy step or stair; drive through the top heel.",
    ["Place one foot fully on the step.", "Step up to stand tall on top.", "Step down and alternate the leading leg."]),
  e("split_squat", "Bulgarian Split Squat", "lower", "Quads, glutes, balance", 3, 5.0, true, "Most of the weight stays in the front leg.",
    ["Back foot on a chair behind you.", "Lower until the front thigh is near parallel.", "Drive up. Switch legs halfway."], "Regular split squat with both feet on the floor."),
  e("jump_squats", "Jump Squats", "lower", "Quads, glutes, power", 3, 8.0, false, "Land softly and sink straight into the next squat.",
    ["Squat down.", "Explode upward into a jump.", "Land softly with bent knees."], "Fast squats with a calf raise."),
  e("curtsy_lunge", "Curtsy Lunges", "lower", "Glutes, outer hips", 2, 4.0, false, "Keep the chest tall and hips square.",
    ["Step one leg diagonally behind the other.", "Lower into a lunge.", "Return and alternate sides."]),
  e("side_lunge", "Side Lunges", "lower", "Inner thighs, glutes", 2, 4.0, false, "Sit back into the bent leg; the other stays straight.",
    ["Take a wide step to one side.", "Bend that knee, pushing hips back.", "Push back to centre and alternate."]),

  // ---------- Core ----------
  e("plank", "Forearm Plank", "core", "Core, shoulders", 1, 3.8, false, "Squeeze glutes and pull belly button toward the spine.",
    ["Forearms on the floor, elbows under shoulders.", "Legs straight, body in a line.", "Hold without letting hips sag."], "Plank from your knees."),
  e("side_plank", "Side Plank", "core", "Obliques, hips", 2, 3.8, true, "Stack hips; push the floor away with your forearm.",
    ["Lie on one side, elbow under shoulder.", "Lift hips so the body is straight.", "Hold. Switch sides halfway."], "Bottom knee on the floor."),
  e("crunches", "Crunches", "core", "Upper abs", 1, 3.0, false, "Lift with the abs, not by pulling the neck.",
    ["Lie on your back, knees bent.", "Curl shoulders off the floor.", "Lower slowly."]),
  e("bicycle", "Bicycle Crunches", "core", "Obliques, abs", 2, 3.8, false, "Slow and controlled beats fast and sloppy.",
    ["Lie on your back, hands lightly behind your head.", "Bring one elbow toward the opposite knee as the other leg extends.", "Alternate sides."]),
  e("leg_raises", "Leg Raises", "core", "Lower abs, hip flexors", 2, 3.0, false, "Press the lower back into the floor.",
    ["Lie on your back, legs straight, hands under hips.", "Raise legs to vertical.", "Lower slowly without touching the floor."], "Bent-knee raises."),
  e("dead_bug", "Dead Bug", "core", "Deep core, coordination", 1, 3.0, false, "Lower back stays glued to the floor.",
    ["Lie on your back, arms up, knees at 90°.", "Extend opposite arm and leg toward the floor.", "Return and switch sides."]),
  e("bird_dog", "Bird Dog", "core", "Core, lower back, glutes", 1, 3.0, false, "Imagine balancing a glass of water on your back.",
    ["On hands and knees.", "Extend opposite arm and leg until straight.", "Return and alternate sides."]),
  e("russian_twist", "Russian Twists", "core", "Obliques", 2, 3.8, false, "Rotate through the ribs, not just the arms.",
    ["Sit and lean back slightly, feet on or off the floor.", "Clasp hands and rotate to one side.", "Rotate to the other side."]),
  e("flutter_kicks", "Flutter Kicks", "core", "Lower abs", 2, 3.8, false, "Small, fast kicks, lower back down.",
    ["Lie on your back, legs straight and slightly lifted.", "Kick legs up and down in small movements.", "Keep breathing."]),
  e("hollow_hold", "Hollow Body Hold", "core", "Entire core", 3, 3.8, false, "If your back lifts, bend your knees.",
    ["Lie on your back, arms overhead.", "Lift shoulders and legs, pressing lower back down.", "Hold the banana shape."], "Tuck the knees in."),
  e("v_ups", "V-ups", "core", "Abs, hip flexors", 3, 4.0, false, "Reach for the toes and control the descent.",
    ["Lie flat, arms overhead.", "Lift arms and legs together to meet in the middle.", "Lower with control."]),
  e("reverse_crunch", "Reverse Crunches", "core", "Lower abs", 2, 3.0, false, "Curl the pelvis up; don't swing.",
    ["Lie on your back, knees bent at 90°.", "Curl knees toward the chest, lifting hips.", "Lower slowly."]),
  e("heel_touches", "Heel Touches", "core", "Obliques", 1, 3.0, false, "Keep shoulders slightly lifted the whole time.",
    ["Lie on your back, knees bent, shoulders lifted.", "Reach side to side to touch each heel.", "Keep a steady rhythm."]),

  // ---------- Mobility ----------
  e("cat_cow", "Cat-Cow", "mobility", "Spine", 1, 2.5, false, "Move with your breath.",
    ["On hands and knees.", "Inhale: drop belly and lift the chest (cow).", "Exhale: round the back toward the ceiling (cat)."]),
  e("worlds_greatest", "World's Greatest Stretch", "mobility", "Hips, thoracic spine, hamstrings", 2, 2.8, true, "Rotate the chest toward the ceiling, eyes follow the hand.",
    ["Step into a deep lunge, hands on the floor.", "Drop the inside elbow toward the foot, then rotate and reach up.", "Switch sides halfway."]),
  e("down_dog", "Downward Dog", "mobility", "Hamstrings, calves, shoulders", 1, 2.5, false, "Bend knees if needed to keep the spine long.",
    ["From hands and knees, lift hips up and back.", "Press chest toward thighs.", "Pedal the feet gently."]),
  e("cobra", "Cobra Stretch", "mobility", "Abs, hip flexors, spine", 1, 2.5, false, "Keep hips on the floor and shoulders down.",
    ["Lie face-down, hands under shoulders.", "Press up gently, lifting the chest.", "Hold and breathe."]),
  e("thread_needle", "Thread the Needle", "mobility", "Upper back, shoulders", 1, 2.5, true, "Let the shoulder melt toward the floor.",
    ["On hands and knees.", "Slide one arm under the body, resting the shoulder down.", "Hold, then switch sides."]),
  e("deep_squat_hold", "Deep Squat Hold", "mobility", "Hips, ankles", 1, 2.5, false, "Use elbows to gently push knees out.",
    ["Squat as low as comfortable, heels down.", "Hands together at the chest.", "Hold and breathe into the hips."]),
  e("thoracic_rotation", "Open Book Rotation", "mobility", "Thoracic spine, chest", 1, 2.5, true, "Keep knees stacked on the floor.",
    ["Lie on your side, knees bent, arms out front.", "Open the top arm across to the other side.", "Return. Switch sides halfway."]),
  e("neck_rolls", "Neck Release", "mobility", "Neck, upper traps", 1, 2.0, false, "Slow and gentle, never force the range.",
    ["Sit or stand tall.", "Tilt ear toward shoulder and hold.", "Slowly roll chin to chest and to the other side."]),
  e("chin_tucks", "Chin Tucks", "mobility", "Deep neck flexors, posture", 1, 2.0, false, "Make a double chin; head stays level.",
    ["Sit tall, looking forward.", "Glide your head straight back.", "Hold 2 seconds and release."]),
  e("wall_angels", "Wall Angels", "mobility", "Upper back, shoulders, posture", 1, 2.5, false, "Keep wrists and elbows touching the wall if you can.",
    ["Back against a wall, arms in a goalpost shape.", "Slide arms up overhead.", "Slide back down slowly."]),

  // ---------- Stretch ----------
  e("childs_pose", "Child's Pose", "stretch", "Lower back, hips, shoulders", 1, 2.0, false, "Breathe deeply into the back of the ribs.",
    ["Kneel and sit back on your heels.", "Fold forward, arms extended.", "Rest your forehead and relax."]),
  e("hip_flexor", "Kneeling Hip Flexor Stretch", "stretch", "Hip flexors, quads", 1, 2.0, true, "Tuck the pelvis under to feel it more.",
    ["Kneel on one knee, other foot forward.", "Shift hips forward gently.", "Hold. Switch sides halfway."]),
  e("hamstring", "Seated Hamstring Stretch", "stretch", "Hamstrings, lower back", 1, 2.0, false, "Hinge from the hips with a long spine.",
    ["Sit with legs straight out.", "Reach toward your toes.", "Hold without bouncing."]),
  e("quad_stretch", "Standing Quad Stretch", "stretch", "Quads", 1, 2.0, true, "Knees together, hips pushed slightly forward.",
    ["Stand on one leg, holding a wall if needed.", "Pull the other heel toward your glute.", "Hold. Switch sides halfway."]),
  e("figure_four", "Figure-4 Stretch", "stretch", "Glutes, piriformis", 1, 2.0, true, "Keep your head and shoulders relaxed on the floor.",
    ["Lie on your back and cross one ankle over the other knee.", "Pull the bottom thigh toward you.", "Hold. Switch sides halfway."]),
  e("chest_stretch", "Doorway Chest Stretch", "stretch", "Chest, front shoulders", 1, 2.0, false, "Gentle lean; no pain in the shoulder.",
    ["Forearms on a door frame at shoulder height.", "Step through gently.", "Hold and breathe."]),
  e("calf_stretch", "Wall Calf Stretch", "stretch", "Calves, Achilles", 1, 2.0, true, "Back heel stays on the floor.",
    ["Hands on a wall, one foot back.", "Press the back heel down, front knee bent.", "Hold. Switch sides halfway."]),
];
// ---------- Tai Chi (Yang-style simplified movements + qigong warm-ups) ----------
// Tai chi is ~3 METs: low impact, weight-bearing, and among the best-studied exercise forms for balance
// and fall prevention in mid-life and older adults. Move slowly, breathe through the belly, keep knees soft.
EXERCISES.push(
  e("tc_breathing", "Tai Chi Breathing", "taichi", "Diaphragm, posture, nervous system", 1, 1.8, false, "Breathe in through the nose as the hands rise, out as they sink. Slow is the point.",
    ["Stand with feet hip-width, knees soft, tailbone gently tucked.", "Hands in front of the belly, palms facing up.", "Inhale and float the hands up to chest height; exhale and let them sink."]),
  e("tc_lift_sky", "Lifting the Sky", "taichi", "Shoulders, spine, breath", 1, 2.5, false, "Stretch tall at the top without lifting the shoulders to the ears.",
    ["Interlace fingers in front of the hips, palms up.", "Inhale and raise the hands overhead, turning palms to the sky.", "Exhale and float the arms down the sides."]),
  e("tc_weight_shift", "Weight Shifting", "taichi", "Legs, hips, balance", 1, 2.8, false, "Feel the weight move through the soles of the feet. Keep the head level.",
    ["Wide, soft-knee stance with hands as if holding a ball.", "Slowly shift your weight into the right leg.", "Pass through the centre and shift into the left leg."]),
  e("tc_commence", "Commencing Form", "taichi", "Shoulders, legs, focus", 1, 2.5, false, "Imagine your wrists floating on water. The hands follow the breath.",
    ["Stand tall, arms relaxed by your sides.", "Inhale and float both arms forward to shoulder height.", "Exhale, bend the knees slightly and press the palms down to hip height."]),
  e("tc_hold_ball", "Holding the Ball", "taichi", "Arms, legs, posture", 1, 2.8, false, "Keep elbows heavy and armpits open, as if a small egg sits under each one.",
    ["Soft-knee stance, weight centred.", "One hand at chest height palm down, the other at belly height palm up.", "Slowly switch which hand is on top, turning the waist."]),
  e("tc_wild_horse", "Part the Wild Horse's Mane", "taichi", "Legs, hips, shoulders", 1, 3.0, false, "Step out with the heel first, then roll the weight forward into a bow stance.",
    ["Hold the ball on one side, then step forward with the opposite foot.", "Shift weight forward as the front hand rises to eye level and the back hand presses down.", "Bring the hands back to hold the ball and repeat on the other side."]),
  e("tc_cloud_hands", "Wave Hands Like Clouds", "taichi", "Waist, shoulders, balance", 1, 3.0, false, "Turn from the waist; the arms just go along for the ride.",
    ["Wide stance, one hand at face height, the other at belly height.", "Turn the waist slowly, letting the hands drift across like clouds.", "Swap hand heights at each side and step sideways to travel."]),
  e("tc_brush_knee", "Brush Knee and Push", "taichi", "Legs, core, shoulders", 1, 3.0, false, "Push with the whole body from the back foot, not just the arm.",
    ["Step forward into a bow stance.", "The lower hand brushes past the front knee.", "The other hand pushes forward from beside the ear. Alternate sides."]),
  e("tc_repulse_monkey", "Repulse Monkey", "taichi", "Legs, balance, coordination", 2, 3.0, false, "Step back onto the ball of the foot first, then lower the heel.",
    ["Front arm extended, back arm circling up beside the ear.", "Step backward, transferring weight onto the back leg.", "Push the rear hand forward as the front hand draws back to the hip. Alternate."]),
  e("tc_golden_rooster", "Golden Rooster on One Leg", "taichi", "Hip stabilisers, ankles, balance", 2, 2.8, true, "Hold a chair or wall at first. Fix your gaze on one point.",
    ["Sink weight into one leg with a soft knee.", "Slowly lift the other knee to hip height as the same-side hand rises.", "Hold, then lower slowly. Switch sides halfway."], "Keep the toes of the lifted foot touching the floor."),
  e("tc_single_whip", "Single Whip", "taichi", "Legs, shoulders, upper back", 1, 3.0, false, "Back hand forms a soft hook; front palm pushes out slowly as the weight moves forward.",
    ["Back hand forms a hook with fingertips together.", "Step into a bow stance with the front foot.", "Turn the waist and push the front palm out at shoulder height."]),
  e("tc_bird_tail", "Grasp the Bird's Tail", "taichi", "Full body, coordination", 2, 3.0, false, "Four parts: ward off, roll back, press, push. One smooth breath for each.",
    ["Ward off: front arm rounds at chest height in a bow stance.", "Roll back: shift the weight back and draw the hands down and back.", "Press and push: shift forward, pressing the hands out at chest height."]),
  e("tc_heel_toe", "Tai Chi Walking", "taichi", "Ankles, legs, balance", 1, 2.8, false, "Place the heel down like stepping onto thin ice, then transfer weight slowly.",
    ["Sink into a soft-knee stance, hands on hips or held out.", "Step forward heel first, keeping weight on the back leg.", "Slowly roll the weight forward and step with the other foot."]),
  e("tc_closing", "Closing Form", "taichi", "Breath, shoulders, calm", 1, 1.8, false, "Let the hands sink with a long exhale and pause in stillness.",
    ["Bring the wrists to cross in front of the chest.", "Open the hands shoulder-width, palms down.", "Exhale and slowly lower the hands to the sides, straightening the knees."]),
);

const EX = Object.fromEntries(EXERCISES.map(x => [x.id, x]));

// ---------- Workout building ----------
const WARMUP_LIGHT = ["march", "arm_circles", "hip_circles", "torso_twist", "leg_swings"];
const WARMUP_FULL  = ["jumping_jacks", "arm_circles", "hip_circles", "leg_swings", "inchworm"];
const COOLDOWN     = ["quad_stretch", "hamstring", "figure_four", "chest_stretch", "childs_pose"];

const MOBILITY_FLOWS = [
  { name: "Mobility Flow A", ex: ["cat_cow", "worlds_greatest", "down_dog", "cobra", "thread_needle", "deep_squat_hold", "hip_flexor", "childs_pose"] },
  { name: "Mobility Flow B", ex: ["neck_rolls", "cat_cow", "thoracic_rotation", "wall_angels", "worlds_greatest", "figure_four", "hamstring", "childs_pose"] },
  { name: "Mobility Flow C", ex: ["hip_circles", "deep_squat_hold", "down_dog", "calf_stretch", "cobra", "quad_stretch", "thread_needle", "childs_pose"] },
];

function section(name, ids, secs, rest = 10, rounds = 1, roundRest = 0) {
  return { name, items: ids.map(id => ({ id, secs })), rest, rounds, roundRest };
}

function workoutSeconds(w) {
  return w.sections.reduce((t, s) =>
    t + s.rounds * s.items.reduce((a, i) => a + i.secs + s.rest, 0) + (s.rounds - 1) * s.roundRest, 0);
}

function mobilityWorkout(variant, title) {
  const f = MOBILITY_FLOWS[variant % MOBILITY_FLOWS.length];
  return { title: title || f.name, subtitle: "Active recovery · low intensity", kind: "mobility",
    sections: [section("Flow", f.ex, 45, 5)] };
}

// ---------- Programs (multi-week courses) ----------
// schedule: 7 entries, template key | "mob" (active recovery) | null (rest day)
const TAICHI_WARM = ["tc_breathing", "tc_lift_sky", "neck_rolls", "hip_circles", "tc_weight_shift"];
const TAICHI_COOL = ["tc_lift_sky", "tc_closing", "tc_breathing"];

const PROGRAMS = [
  {
    id: "foundations", title: "Foundations 28", emoji: "🌱", level: 1, goal: "Build the habit",
    color: "#22c55e", weeks: 4, warmup: "light",
    tagline: "Your first 4 weeks of consistent training",
    description: "A gentle full-body programme for complete beginners or anyone returning after a break. Five short sessions a week teach the basic movement patterns: squat, hinge, push, lunge and brace. Each week work time goes up and rest goes down.",
    schedule: ["A", "B", "mob", "C", "A", "B", null],
    templates: {
      A: { name: "Full Body A", ex: ["squats", "incline_pushups", "glute_bridge", "bird_dog", "march"] },
      B: { name: "Full Body B", ex: ["reverse_lunge", "knee_pushups", "superman", "plank", "butt_kicks"] },
      C: { name: "Full Body C", ex: ["sumo_squat", "tricep_dips", "calf_raises", "dead_bug", "shadow_boxing"] },
    },
    work: [30, 35, 40, 40], rest: [30, 25, 20, 20], rounds: [2, 2, 3, 3],
  },
  {
    id: "taichi28", title: "Tai Chi Balance 28", emoji: "☯️", level: 1, goal: "Balance & calm",
    color: "#8b5cf6", weeks: 4, warmup: "none",
    tagline: "Gentle tai chi designed for women 40+",
    description: "A 4-week course built around the needs of women in their 40s, 50s and beyond: balance, steady legs, mobile joints, posture and a calmer nervous system. It uses classic Yang-style tai chi movements, done slowly with deep breathing. Tai chi is low impact and weight-bearing, and research links it to better balance, fewer falls and lower stress. You learn a few movements at a time, then join them into a flowing sequence by week 4. Hold a chair for the one-leg moves until you feel steady. For bone health, pair this course with 2 strength sessions a week (Foundations 28 works well).",
    schedule: ["T1", "T2", "T3", "T1", "T2", "T3", null],
    templates: {
      T1: { name: "Rooting & Foundations", ex: ["tc_commence", "tc_hold_ball", "tc_wild_horse", "tc_cloud_hands", "tc_heel_toe"] },
      T2: { name: "Balance & Stability", ex: ["tc_commence", "tc_golden_rooster", "tc_repulse_monkey", "tc_brush_knee", "tc_heel_toe"] },
      T3: { name: "Flowing Form", ex: ["tc_commence", "tc_wild_horse", "tc_brush_knee", "tc_single_whip", "tc_bird_tail", "tc_cloud_hands", "tc_golden_rooster"] },
    },
    warmupEx: TAICHI_WARM, cooldownEx: TAICHI_COOL, mainName: "Tai chi practice", roundRest: 20,
    work: [45, 60, 60, 75], rest: [15, 15, 10, 10], rounds: [1, 2, 2, 2],
  },
  {
    id: "hiit21", title: "HIIT Fat Burn 21", emoji: "🔥", level: 2, goal: "Lose fat",
    color: "#f97316", weeks: 3, warmup: "full",
    tagline: "21 days of sweaty interval circuits",
    description: "High-intensity interval circuits that mix explosive cardio with strength moves to keep your heart rate up. Based on work-to-rest interval training (40/20 progressing to 45/15). Includes a mobility day and a rest day every week. Pair it with a modest calorie deficit for fat loss.",
    schedule: ["H1", "H2", "CORE", "H3", "H1", "mob", null],
    templates: {
      H1: { name: "Total Body Burn", ex: ["burpees", "squats", "mountain_climbers", "pushups", "skaters", "plank_jacks"] },
      H2: { name: "Cardio Power", ex: ["star_jumps", "reverse_lunge", "high_knees", "wide_pushups", "fast_feet", "bicycle"] },
      H3: { name: "Lower Body Inferno", ex: ["jump_squats", "curtsy_lunge", "butt_kicks", "wall_sit", "skaters", "glute_bridge"] },
      CORE: { name: "Core Blast", ex: ["plank", "russian_twist", "flutter_kicks", "mountain_climbers", "side_plank", "reverse_crunch"] },
    },
    work: [40, 40, 45], rest: [20, 20, 15], rounds: [3, 3, 4],
  },
  {
    id: "strength28", title: "Bodyweight Strength 28", emoji: "💪", level: 3, goal: "Build muscle",
    color: "#6366f1", weeks: 4, warmup: "full",
    tagline: "Push · Legs · Pull/Core split, no equipment",
    description: "A split built around harder bodyweight variations: diamond and pike push-ups, Bulgarian split squats and hollow holds. Longer sets build muscle endurance and strength. If a move gets easy, slow the lowering phase to 3 seconds.",
    schedule: ["PUSH", "LEGS", "PULL", "mob", "PUSH", "LEGS", null],
    templates: {
      PUSH: { name: "Push Day", ex: ["pushups", "pike_pushups", "diamond_pushups", "tricep_dips", "shoulder_taps", "decline_pushups"] },
      LEGS: { name: "Leg Day", ex: ["split_squat", "squats", "single_leg_bridge", "side_lunge", "wall_sit", "calf_raises"] },
      PULL: { name: "Back & Core", ex: ["superman", "snow_angels", "hollow_hold", "side_plank", "leg_raises", "bird_dog"] },
    },
    work: [40, 45, 45, 50], rest: [30, 30, 25, 25], rounds: [3, 3, 4, 4],
  },
  {
    id: "core14", title: "Core Crusher 14", emoji: "🎯", level: 2, goal: "Stronger core",
    color: "#eab308", weeks: 2, warmup: "light",
    tagline: "Two weeks to a rock-solid midsection",
    description: "Trains the core in every direction: anti-extension (planks, dead bugs), rotation (twists, bicycles), lateral (side planks) and flexion (crunches, V-ups). Short, focused sessions you can add to any routine.",
    schedule: ["C1", "C2", "mob", "C3", "C1", "C2", null],
    templates: {
      C1: { name: "Core Stability", ex: ["plank", "dead_bug", "side_plank", "bird_dog", "hollow_hold"] },
      C2: { name: "Abs & Obliques", ex: ["bicycle", "russian_twist", "reverse_crunch", "heel_touches", "flutter_kicks"] },
      C3: { name: "Core Power", ex: ["v_ups", "mountain_climbers", "leg_raises", "shoulder_taps", "plank_jacks"] },
    },
    work: [30, 40], rest: [20, 15], rounds: [3, 3],
  },
  {
    id: "mobility14", title: "Flexibility Flow 14", emoji: "🧘", level: 1, goal: "Move better",
    color: "#14b8a6", weeks: 2, warmup: "none",
    tagline: "Daily 6-minute flows for hips, spine and shoulders",
    description: "Daily mobility sessions to undo stiffness from sitting, improve your squat depth and relieve back tension. Hold each position and breathe slowly. Safe to do every day, including alongside other programmes.",
    schedule: ["mob", "mob", "mob", "mob", "mob", "mob", "mob"],
    templates: {}, work: [45], rest: [5], rounds: [1],
  },
  {
    id: "desk7", title: "Desk Reset 7", emoji: "🪑", level: 1, goal: "Fix posture",
    color: "#0ea5e9", weeks: 1, warmup: "none",
    tagline: "A week of anti-slouch routines for desk workers",
    description: "Short routines that target the usual problems from desk work: forward head, rounded shoulders, tight hips and weak glutes. Do one in the morning or during a break.",
    schedule: ["D1", "D2", "D1", "D2", "D1", "D2", "mob"],
    templates: {
      D1: { name: "Neck & Shoulders", mobility: true, ex: ["neck_rolls", "chin_tucks", "wall_angels", "snow_angels", "thread_needle", "chest_stretch"] },
      D2: { name: "Hips & Back", mobility: true, ex: ["cat_cow", "hip_flexor", "glute_bridge", "bird_dog", "figure_four", "childs_pose"] },
    },
    work: [40], rest: [10], rounds: [2],
  },
];
const PROGRAM = Object.fromEntries(PROGRAMS.map(p => [p.id, p]));

function programDays(p) { return p.weeks * 7; }

function programWorkout(p, day /* 0-based */) {
  const key = p.schedule[day % 7];
  const week = Math.floor(day / 7);
  if (key === null) return null; // rest day
  if (key === "mob") return mobilityWorkout(day, `Day ${day + 1} · Active Recovery`);
  const t = p.templates[key];
  const pick = arr => arr[Math.min(week, arr.length - 1)];
  const work = pick(p.work), rest = pick(p.rest), rounds = pick(p.rounds);
  const sections = [];
  if (t.mobility) {
    sections.push(section("Routine", t.ex, work, rest, rounds, 15));
  } else {
    if (p.warmupEx) sections.push(section("Warm-up", p.warmupEx, 40, 5));
    else if (p.warmup !== "none") sections.push(section("Warm-up", p.warmup === "full" ? WARMUP_FULL : WARMUP_LIGHT, 30, 5));
    sections.push(section(p.mainName || "Main circuit", t.ex, work, rest, rounds, p.roundRest ?? 60));
    sections.push(section("Cool-down", p.cooldownEx || COOLDOWN, p.cooldownEx ? 45 : 30, 5));
  }
  return { title: `Day ${day + 1} · ${t.name}`, subtitle: `Week ${week + 1} · ${rounds} round${rounds > 1 ? "s" : ""} · ${work}s on / ${rest}s off`,
    kind: t.mobility ? "mobility" : "training", sections };
}

// ---------- Quick workouts ----------
const QUICK = [
  { id: "taichi10", title: "Morning Tai Chi", emoji: "☯️", note: "A calm 12-minute flow to wake up the joints and settle the mind.",
    w: { title: "Morning Tai Chi", subtitle: "Slow flow · 60s per movement", kind: "mobility",
      sections: [section("Warm-up", ["tc_breathing", "tc_lift_sky"], 45, 5),
        section("Flow", ["tc_commence", "tc_hold_ball", "tc_wild_horse", "tc_cloud_hands", "tc_brush_knee", "tc_golden_rooster", "tc_single_whip"], 60, 10),
        section("Close", ["tc_closing", "tc_breathing"], 45, 5)] } },
  { id: "seven", title: "7-Minute Classic", emoji: "⏱️",
    note: "Circuit from the 2013 ACSM Health & Fitness Journal high-intensity circuit training paper: 12 moves, 30s each, 10s transitions.",
    w: { title: "7-Minute Classic", subtitle: "12 moves · 30s on / 10s off", kind: "training",
      sections: [section("Circuit", ["jumping_jacks", "wall_sit", "pushups", "crunches", "step_ups", "squats", "tricep_dips", "plank", "high_knees", "reverse_lunge", "shoulder_taps", "side_plank"], 30, 10)] } },
  { id: "tabata", title: "Tabata Blast", emoji: "⚡",
    note: "The classic Tabata protocol: 8 rounds of 20s all-out effort with 10s rest.",
    w: { title: "Tabata Blast", subtitle: "Warm-up + 4-min Tabata · 20s / 10s", kind: "training",
      sections: [section("Warm-up", WARMUP_FULL, 30, 5), section("Tabata", ["burpees", "jump_squats"], 20, 10, 4, 10)] } },
  { id: "abs10", title: "10-Min Abs", emoji: "🎯", note: "Two rounds of five core moves.",
    w: { title: "10-Min Abs", subtitle: "2 rounds · 40s / 20s", kind: "training",
      sections: [section("Core", ["plank", "bicycle", "leg_raises", "russian_twist", "dead_bug"], 40, 20, 2, 30)] } },
  { id: "stretch10", title: "Stretch & Unwind", emoji: "🌿", note: "Wind down after a long day or a hard session.",
    w: mobilityWorkout(0, "Stretch & Unwind") },
  { id: "upper12", title: "Upper Body Pump", emoji: "💪", note: "Chest, shoulders, triceps and back.",
    w: { title: "Upper Body Pump", subtitle: "3 rounds · 40s / 20s", kind: "training",
      sections: [section("Warm-up", WARMUP_FULL, 30, 5), section("Circuit", ["pushups", "snow_angels", "tricep_dips", "pike_pushups", "superman"], 40, 20, 3, 45)] } },
  { id: "legs12", title: "Leg Day Express", emoji: "🦵", note: "Squat, lunge and bridge burner.",
    w: { title: "Leg Day Express", subtitle: "3 rounds · 40s / 20s", kind: "training",
      sections: [section("Warm-up", WARMUP_LIGHT, 30, 5), section("Circuit", ["squats", "reverse_lunge", "glute_bridge", "sumo_squat", "calf_raises"], 40, 20, 3, 45)] } },
];

// ---------- Daily challenges ----------
const DAILY = [
  { title: "100 Squats", desc: "Do 100 bodyweight squats today, in as many sets as you need.", emoji: "🦵", xp: 40 },
  { title: "Push-up Ladder", desc: "1 push-up, rest, 2, rest, 3… up to 10 (55 total). Knee push-ups count.", emoji: "🪜", xp: 40 },
  { title: "3-Minute Plank", desc: "Collect 3 minutes of plank in total, in any number of holds.", emoji: "🧱", xp: 35 },
  { title: "10,000 Steps", desc: "Hit 10k steps. Take the stairs and walk during calls.", emoji: "👟", xp: 30 },
  { title: "Burpee Pyramid", desc: "Do 1-2-3-4-5-4-3-2-1 burpees (25 total) with 20s rest between sets.", emoji: "🔺", xp: 45 },
  { title: "Hydration Hero", desc: "Drink at least 8 glasses (about 2 L) of water today.", emoji: "💧", xp: 20 },
  { title: "Wall Sit Stack", desc: "Collect 4 minutes of wall sit in total.", emoji: "🧱", xp: 35 },
  { title: "Lunge Walk", desc: "Do 60 walking or reverse lunges (30 per leg).", emoji: "🚶", xp: 35 },
  { title: "No Added Sugar", desc: "Skip sweets, sugary drinks and desserts for the whole day.", emoji: "🍬", xp: 25 },
  { title: "Mobility Minute ×5", desc: "Do 5 one-minute stretch breaks spread across your day.", emoji: "🧘", xp: 25 },
  { title: "Stair Climber", desc: "Climb 20 flights of stairs today.", emoji: "🏢", xp: 35 },
  { title: "Core 200", desc: "Do 200 core reps of your choice: crunches, bicycles, leg raises.", emoji: "🎯", xp: 40 },
  { title: "Sleep 7+", desc: "Lights out early. Get at least 7 hours of sleep tonight.", emoji: "😴", xp: 20 },
  { title: "Glute Bridge 100", desc: "Do 100 glute bridges with a 1-second squeeze at the top.", emoji: "🍑", xp: 30 },
  { title: "20-Min Walk Outdoors", desc: "Take a brisk 20-minute walk outside, no phone scrolling.", emoji: "🌳", xp: 25 },
  { title: "Jumping Jack 300", desc: "Do 300 jumping jacks spread across the day.", emoji: "⭐", xp: 35 },
  { title: "Protein Every Meal", desc: "Include a protein source (dal, eggs, paneer, chicken, tofu…) in every meal.", emoji: "🥚", xp: 20 },
  { title: "Dead Hang / Wall Angel", desc: "Do 3 sets of 15 wall angels for better posture.", emoji: "🪽", xp: 20 },
  { title: "Squat Hold", desc: "Collect 5 minutes in a deep squat hold, in any number of holds.", emoji: "🧎", xp: 25 },
  { title: "Screen-Free Hour", desc: "Spend one hour before bed with no screens.", emoji: "📵", xp: 20 },
  { title: "Push-up Max ×3", desc: "Do 3 sets of max push-ups with 90s rest. Note your best.", emoji: "💪", xp: 35 },
  { title: "Mountain Climber 200", desc: "Do 200 mountain climbers (count each leg).", emoji: "⛰️", xp: 35 },
  { title: "Veggie Five", desc: "Eat 5 servings of vegetables or fruit today.", emoji: "🥦", xp: 20 },
  { title: "Calf Raise 150", desc: "Do 150 calf raises, pausing at the top of each.", emoji: "🦶", xp: 25 },
  { title: "Deep Breathing", desc: "Do 3 rounds of 4-7-8 breathing: in for 4, hold for 7, out for 8.", emoji: "🌬️", xp: 15 },
  { title: "Side Plank Stack", desc: "Hold 90 seconds of side plank per side, total.", emoji: "📐", xp: 30 },
  { title: "Double Workout", desc: "Do your programme workout plus any quick workout.", emoji: "✌️", xp: 50 },
  { title: "Dance Break", desc: "Dance non-stop to 3 songs.", emoji: "💃", xp: 25 },
  { title: "Tricep Dip 75", desc: "Do 75 chair dips in sets.", emoji: "🪑", xp: 30 },
  { title: "Stand on One Leg", desc: "Balance on each leg for 30 seconds, 3 times, near a wall. Try it while brushing your teeth.", emoji: "🦩", xp: 20 },
  { title: "Tai Chi Sunrise", desc: "Spend 5 minutes on Tai Chi Breathing and Wave Hands Like Clouds, outside if you can.", emoji: "🌅", xp: 25 },
  { title: "Slow Walk", desc: "Do 2 minutes of Tai Chi Walking: heel first, slow weight transfer, eyes forward.", emoji: "🐢", xp: 15 },
  { title: "Posture Check", desc: "Set 6 reminders to sit tall and do 10 chin tucks.", emoji: "🧍", xp: 15 },
];

// ---------- 30-day challenges ----------
// 0 = rest day. Plank targets in seconds.
const THIRTY = [
  { id: "balance30", title: "30-Day Balance", emoji: "🦩", unit: "sec", ex: "tc_golden_rooster", timed: true, color: "#8b5cf6",
    targets: [20,20,30,30,40,0, 40,45,45,50,50,0, 60,60,60,70,70,0, 80,80,90,90,100,0, 100,110,110,0,120,120] },
  { id: "plank30", title: "30-Day Plank", emoji: "🧱", unit: "sec", ex: "plank", timed: true, color: "#f97316",
    targets: [20,20,30,30,40,0, 45,45,60,60,60,90, 0,90,90,120,120,150, 0,150,150,180,180,210, 210,240,0,240,270,300] },
  { id: "squat30", title: "30-Day Squat", emoji: "🦵", unit: "reps", ex: "squats", timed: false, color: "#22c55e",
    targets: [50,55,60,0,70,75, 80,0,100,105,110,0, 130,135,140,0,150,155, 160,0,180,185,190,0, 220,225,230,0,240,250] },
  { id: "pushup30", title: "30-Day Push-up", emoji: "💪", unit: "reps", ex: "pushups", timed: false, color: "#6366f1",
    targets: [5,6,7,0,8,10, 12,0,13,15,17,0, 18,20,22,0,24,26, 28,0,30,32,34,0, 36,38,40,0,45,50] },
  { id: "burpee30", title: "30-Day Burpee", emoji: "🔺", unit: "reps", ex: "burpees", timed: false, color: "#ef4444",
    targets: [5,6,7,8,0,10, 11,12,13,0,15,16, 17,18,0,20,21,22, 23,0,25,26,27,28, 0,30,31,32,33,35] },
];

const BADGES = [
  { id: "first", emoji: "🎉", name: "First Step", desc: "Complete your first workout", test: s => s.workouts >= 1 },
  { id: "streak3", emoji: "🔥", name: "On Fire", desc: "3-day streak", test: s => s.bestStreak >= 3 },
  { id: "streak7", emoji: "🏅", name: "Week Warrior", desc: "7-day streak", test: s => s.bestStreak >= 7 },
  { id: "streak30", emoji: "👑", name: "Unstoppable", desc: "30-day streak", test: s => s.bestStreak >= 30 },
  { id: "w10", emoji: "💯", name: "Ten Down", desc: "10 workouts", test: s => s.workouts >= 10 },
  { id: "w50", emoji: "🦾", name: "Iron Habit", desc: "50 workouts", test: s => s.workouts >= 50 },
  { id: "min300", emoji: "⏳", name: "300 Club", desc: "300 active minutes", test: s => s.minutes >= 300 },
  { id: "daily10", emoji: "🎯", name: "Challenger", desc: "10 daily challenges", test: s => s.dailies >= 10 },
  { id: "prog", emoji: "🎓", name: "Graduate", desc: "Finish a programme", test: s => s.programsDone >= 1 },
  { id: "thirty", emoji: "🏆", name: "30-Day Legend", desc: "Finish a 30-day challenge", test: s => s.thirtyDone >= 1 },
];

const LEVELS = ["Rookie", "Mover", "Grinder", "Athlete", "Warrior", "Beast", "Legend", "Titan"];
