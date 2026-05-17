// Aim + movement drills. Daily routines.

export type Drill = {
  id: string;
  name: string;
  category: "aim" | "movement" | "gunplay" | "decision";
  duration: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  setup: string;
  steps: string[];
  successCriteria: string;
};

export const DRILLS: Drill[] = [
  {
    id: "warmup-strafe-dummies",
    name: "Strafe Dummies Warm-Up",
    category: "aim",
    duration: "5 min",
    difficulty: 1,
    setup: "Firing Range — strafing dummies on, distance 25m",
    steps: [
      "60s R-301 strafe-shooting, full mag at center mass.",
      "60s switch to R-99 hipfire at 10m.",
      "60s headshots only with G7 Scout at 50m.",
      "60s wingman at 30m — single-tap each round.",
      "60s slide-jump + immediate ADS shot.",
    ],
    successCriteria: "75% headshot rate on the G7 round.",
  },
  {
    id: "tap-strafe-90",
    name: "Tap Strafe 90° Cycle",
    category: "movement",
    duration: "10 min",
    difficulty: 4,
    setup: "Firing Range — Octane pad nearby",
    steps: [
      "Bind scroll wheel down to 'forward'.",
      "Sprint forward, jump, immediately scroll while holding A.",
      "You should snap 90° left without losing speed.",
      "Repeat with D for 90° right.",
      "Combo: pad → 90° → land → repeat.",
    ],
    successCriteria: "10 consecutive 90° tap-strafes with no momentum loss.",
  },
  {
    id: "super-glide-frame",
    name: "Super Glide Frame Timing",
    category: "movement",
    duration: "20 min",
    difficulty: 5,
    setup: "Firing Range — any climbable wall",
    steps: [
      "Climb the wall.",
      "Listen for the 'snap' sound at the top.",
      "On that snap, press jump THEN crouch within 1 frame.",
      "Use apexlegendsstatus.com/superglide to calibrate your monitor's exact frame window.",
    ],
    successCriteria: "5/10 super-glides land cleanly.",
  },
  {
    id: "swap-shot-loop",
    name: "Weapon Swap Shot",
    category: "gunplay",
    duration: "5 min",
    difficulty: 2,
    setup: "Firing Range — R-99 + Wingman",
    steps: [
      "Empty R-99 mag into dummy.",
      "Tap Y / Triangle to swap to Wingman instantly.",
      "Land 1 hit, then swap back to R-99 (now reloaded).",
      "Loop without ever pressing reload.",
    ],
    successCriteria: "30 seconds of continuous fire without a single reload animation visible.",
  },
  {
    id: "recoil-control",
    name: "Recoil Pull-Down",
    category: "aim",
    duration: "8 min",
    difficulty: 2,
    setup: "Firing Range — pick one AR",
    steps: [
      "Stand 30m from wall.",
      "Full-auto a single spot. Watch the pattern walk.",
      "On the next mag, pre-pull your mouse/stick DOWN at the same rate.",
      "Goal: all rounds clustered on a head-sized target.",
    ],
    successCriteria: "Pattern shrinks from 1m spread to <30cm at 30m.",
  },
  {
    id: "ring-rotation",
    name: "Ring Rotation Drill",
    category: "decision",
    duration: "1 match",
    difficulty: 3,
    setup: "Trios pubs",
    steps: [
      "Land far from zone center.",
      "Every ring, force yourself to MOVE 20 seconds before close.",
      "Verbally call the rotation to your team.",
      "Track: did you make it without taking ring damage?",
    ],
    successCriteria: "Reach the final ring at full HP twice in a row.",
  },
  {
    id: "audio-blind",
    name: "Audio Blind Test",
    category: "decision",
    duration: "5 min",
    difficulty: 3,
    setup: "Pubs — wired headphones required",
    steps: [
      "Land somewhere isolated.",
      "Close your eyes for 5 seconds when you hear footsteps.",
      "Call: above/below, distance, direction.",
      "Open eyes, verify.",
    ],
    successCriteria: "8/10 calls correct on all 3 axes.",
  },
  {
    id: "no-loot-fight",
    name: "Starter Pistol Only",
    category: "gunplay",
    duration: "1 match",
    difficulty: 4,
    setup: "Pubs — restrict yourself",
    steps: [
      "Drop hot. Only use the first pistol you pick up.",
      "Forces hyper-aware positioning and movement.",
      "Loot from kills — no supply bins.",
    ],
    successCriteria: "Survive past ring 2 with the same starter weapon.",
  },
];

// 5-minute daily warm-up routine — recommended before every ranked session.
export const DAILY_ROUTINE = [
  { sec: 60, task: "Strafe-shoot dummies (R-301) at 25m" },
  { sec: 60, task: "R-99 hipfire at 8m, headshots only" },
  { sec: 60, task: "G7 Scout single-tap at 50m" },
  { sec: 60, task: "Slide-jump + ADS shot" },
  { sec: 60, task: "Tap-strafe / wall-bounce reps (PC) or super-glide attempts" },
];

// Sensitivity calibration grid — find your true cm/360.
export const SENS_GRID = [
  { dpi: 400, sens: 1.0, cm360: 60.96 },
  { dpi: 400, sens: 1.4, cm360: 43.54 },
  { dpi: 800, sens: 0.8, cm360: 38.10 },
  { dpi: 800, sens: 1.0, cm360: 30.48 },
  { dpi: 800, sens: 1.2, cm360: 25.40 },
  { dpi: 800, sens: 1.5, cm360: 20.32 },
  { dpi: 1600, sens: 0.6, cm360: 25.40 },
  { dpi: 1600, sens: 0.8, cm360: 19.05 },
];
