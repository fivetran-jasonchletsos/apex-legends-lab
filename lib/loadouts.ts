// Curated loadout combinations — proven pairings by playstyle.
// Each loadout is "primary + secondary" with attachments + ammo + grenade picks.

export type Loadout = {
  id: string;
  name: string;
  style: "aggressive" | "balanced" | "defensive" | "long-range" | "movement";
  primary: { weaponId: string; attachments: string[] };
  secondary: { weaponId: string; attachments: string[] };
  ammoSplit: string;
  utility: string[]; // arc star / thermite / frag / heals
  bestWith: string[]; // legend ids
  rangeBand: string;
  pro: string;
  tier: "S" | "A" | "B";
};

export const LOADOUTS: Loadout[] = [
  {
    id: "r301-volt",
    name: "Beam Team",
    style: "aggressive",
    primary: { weaponId: "r301", attachments: ["Purple Extended Mag", "2x HCOG", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "volt", attachments: ["Purple Extended Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    ammoSplit: "All light — share ammo across both weapons.",
    utility: ["2x Arc Star", "1x Frag", "Med kit", "2x Shield Battery"],
    bestWith: ["octane", "wraith", "valkyrie"],
    rangeBand: "close to mid",
    pro: "Same ammo pool, same fall-off — never run dry mid-fight.",
    tier: "S",
  },
  {
    id: "flatline-pk",
    name: "Push or Punish",
    style: "aggressive",
    primary: { weaponId: "flatline", attachments: ["Purple Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "peacekeeper", attachments: ["Bolt", "Stock", "Precision Choke", "Shotgun Bolt L2"] },
    ammoSplit: "Heavy primary, shotgun shells secondary — diversify ammo for late game.",
    utility: ["2x Arc Star", "Med kit", "Phoenix kit"],
    bestWith: ["bangalore", "fuse", "ash"],
    rangeBand: "close to mid",
    pro: "Flatline at mid, PK on the swap-shot — 1-2 punch kills.",
    tier: "S",
  },
  {
    id: "r99-wingman",
    name: "Glass Cannon",
    style: "movement",
    primary: { weaponId: "r99", attachments: ["Purple Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "wingman", attachments: ["Boosted Loader", "2x HCOG", "Skullpiercer Rifling"] },
    ammoSplit: "Light + sniper ammo — small footprint, big damage.",
    utility: ["2x Arc Star", "Med kit", "Phoenix kit"],
    bestWith: ["octane", "wraith", "valkyrie", "axle"],
    rangeBand: "close + mid swap",
    pro: "R99 dump → swap-to-Wingman for the kill shot. Skill-based but devastating.",
    tier: "A",
  },
  {
    id: "longbow-r301",
    name: "All-Range",
    style: "balanced",
    primary: { weaponId: "longbow", attachments: ["Sniper Mag L3", "4x-10x Variable", "Standard Stock"] },
    secondary: { weaponId: "r301", attachments: ["Purple Mag", "2x HCOG", "Barrel Stabilizer", "Standard Stock"] },
    ammoSplit: "Sniper + light. Heavy ammo bank not needed.",
    utility: ["1x Arc Star", "Med kit", "Shield Battery"],
    bestWith: ["vantage", "bloodhound", "valkyrie"],
    rangeBand: "all ranges",
    pro: "Tag with Longbow → close with R-301. Best 'safe' loadout for ranked.",
    tier: "S",
  },
  {
    id: "kraber-r99",
    name: "Headshot Hunter",
    style: "long-range",
    primary: { weaponId: "kraber", attachments: ["Skullpiercer (built-in)"] },
    secondary: { weaponId: "r99", attachments: ["Purple Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    ammoSplit: "Sniper for Kraber, light for R-99.",
    utility: ["1x Arc Star", "Med kit", "Phoenix kit"],
    bestWith: ["vantage", "bloodhound", "ash"],
    rangeBand: "long + close",
    pro: "Kraber requires care package — but a single headshot ends most fights.",
    tier: "S",
  },
  {
    id: "spitfire-mastiff",
    name: "Wall Pressure",
    style: "defensive",
    primary: { weaponId: "spitfire", attachments: ["Purple Mag", "2x HCOG", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "mastiff", attachments: ["Shotgun Bolt L2"] },
    ammoSplit: "Light + shotgun shells.",
    utility: ["2x Frag", "Med kit", "Shield Battery"],
    bestWith: ["caustic", "wattson", "rampart"],
    rangeBand: "mid + close",
    pro: "55-round mag holds chokepoints — Mastiff cleans up doorway pushers.",
    tier: "A",
  },
  {
    id: "havoc-eva8",
    name: "Energy Stack",
    style: "balanced",
    primary: { weaponId: "havoc", attachments: ["Turbocharger", "Purple Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "eva8", attachments: ["Shotgun Bolt L2"] },
    ammoSplit: "Energy + shotgun.",
    utility: ["2x Thermite", "Med kit"],
    bestWith: ["wattson", "horizon", "rampart"],
    rangeBand: "mid + close",
    pro: "Turbocharger HAVOC is laser-accurate at any range. Mandatory hop-up.",
    tier: "A",
  },
  {
    id: "nemesis-car",
    name: "Burst & Brawl",
    style: "balanced",
    primary: { weaponId: "nemesis", attachments: ["Purple Mag", "2x HCOG", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "car", attachments: ["Purple Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    ammoSplit: "Energy primary, light/heavy CAR secondary.",
    utility: ["2x Arc Star", "Med kit", "Phoenix kit"],
    bestWith: ["bangalore", "horizon", "conduit"],
    rangeBand: "mid + close",
    pro: "CAR uses whichever ammo you have most of — true backup gun.",
    tier: "A",
  },
  {
    id: "alternator-pk",
    name: "Shield Cracker",
    style: "aggressive",
    primary: { weaponId: "alternator", attachments: ["Disruptor Rounds", "Purple Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "peacekeeper", attachments: ["Bolt", "Precision Choke", "Shotgun Bolt L2"] },
    ammoSplit: "Light + shotgun shells.",
    utility: ["1x Arc Star", "Med kit", "Phoenix kit"],
    bestWith: ["octane", "ash", "axle"],
    rangeBand: "close + mid",
    pro: "Disruptor Alternator opens shield → Peacekeeper one-taps the body.",
    tier: "S",
  },
  {
    id: "g7-r99",
    name: "Tap Strafe Special",
    style: "movement",
    primary: { weaponId: "g7scout", attachments: ["Double Tap Trigger", "Purple Mag", "3x HCOG", "Barrel Stabilizer", "Standard Stock"] },
    secondary: { weaponId: "r99", attachments: ["Purple Mag", "1x Holo", "Barrel Stabilizer", "Standard Stock"] },
    ammoSplit: "All light. Single ammo pool.",
    utility: ["2x Arc Star", "Med kit"],
    bestWith: ["octane", "wraith", "horizon"],
    rangeBand: "mid + close",
    pro: "Double-tap G7 4 shots = 288 damage at mid range. Best 'tag and chase' kit.",
    tier: "S",
  },
];

// Quick-pick "build templates" for hot drops where you need a fast plan.
export const HOT_DROP_PLAN = [
  { phase: "Land", goal: "Grab any gun + light shield", priority: ["Pistol", "Mozambique", "RE-45"] },
  { phase: "30s", goal: "Upgrade to SMG or shotgun", priority: ["R-99", "Volt", "Peacekeeper", "EVA-8"] },
  { phase: "1min", goal: "Get blue armor + attachments", priority: ["Stock", "Barrel", "Mag"] },
  { phase: "Reset", goal: "Find AR + heal stack", priority: ["R-301", "Flatline", "Med kit", "Battery"] },
];
