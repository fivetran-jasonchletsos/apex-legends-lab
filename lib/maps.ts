// Apex Legends maps + drop spots — Season 29 "Overclocked".
// Risk: how contested. Loot: average tier. Rotation: how easy to leave.

export type DropSpot = {
  name: string;
  zone: string;
  risk: "low" | "med" | "high" | "hot";
  loot: "low" | "med" | "high" | "elite";
  rotationOut: "easy" | "med" | "hard";
  squadCount: string; // typical # squads
  notes: string;
  pro: string;
};

export type ApexMap = {
  id: string;
  name: string;
  size: "small" | "medium" | "large";
  rotation: { active: boolean; lastSeen?: string };
  vibe: string;
  edgeRules: string;
  drops: DropSpot[];
};

export const MAPS: ApexMap[] = [
  {
    id: "kings-canyon",
    name: "Kings Canyon",
    size: "small",
    rotation: { active: true, lastSeen: "current rotation" },
    vibe: "Classic. Fast fights, short rotations. Punishes greed.",
    edgeRules: "Edge plays are exposed — most cover hugs map center.",
    drops: [
      {
        name: "Skull Town",
        zone: "Southwest",
        risk: "hot",
        loot: "high",
        rotationOut: "med",
        squadCount: "3-5 squads",
        notes: "Iconic hot drop. Always contested.",
        pro: "Drop on the BONES roof, not the skull — instant high ground = first kills.",
      },
      {
        name: "Cage",
        zone: "Center-South",
        risk: "high",
        loot: "high",
        rotationOut: "easy",
        squadCount: "2-3 squads",
        notes: "Multi-level building, great loot density.",
        pro: "Drop the rooftop, clear inside-out — the bottom floor has 4 entry points.",
      },
      {
        name: "Bunker",
        zone: "Center",
        risk: "med",
        loot: "high",
        rotationOut: "med",
        squadCount: "1-2 squads",
        notes: "Underground complex. Strong loot, choke points.",
        pro: "Open both doors with arc stars — never push a closed bunker.",
      },
      {
        name: "Artillery",
        zone: "Southeast",
        risk: "high",
        loot: "high",
        rotationOut: "med",
        squadCount: "2-3 squads",
        notes: "Mass cover, multiple levels, great team loot.",
        pro: "Drop the back-right gun emplacement — least contested spawn.",
      },
      {
        name: "Caustic Treatment",
        zone: "North",
        risk: "low",
        loot: "med",
        rotationOut: "easy",
        squadCount: "1 squad",
        notes: "Safer drop, decent loot if uncontested.",
        pro: "Land top floor, sweep down — the cargo room always has a Wingman or scout.",
      },
    ],
  },
  {
    id: "worlds-edge",
    name: "World's Edge",
    size: "medium",
    rotation: { active: true, lastSeen: "current rotation" },
    vibe: "Long sightlines, vertical fights, lava splits.",
    edgeRules: "Edge of zone often forces zipline rotations — Pathfinder/Valk shine.",
    drops: [
      {
        name: "Fragment East",
        zone: "Center",
        risk: "hot",
        loot: "high",
        rotationOut: "hard",
        squadCount: "4-6 squads",
        notes: "City-style block. Hottest drop in Apex.",
        pro: "Drop center-rooftop, not the streets — verticality is everything.",
      },
      {
        name: "Fragment West",
        zone: "Center",
        risk: "hot",
        loot: "high",
        rotationOut: "hard",
        squadCount: "3-5 squads",
        notes: "Mirror of East. Same rules apply.",
        pro: "Don't fight Fragment unless your team has at least 1 movement legend.",
      },
      {
        name: "Skyhook",
        zone: "South",
        risk: "high",
        loot: "high",
        rotationOut: "med",
        squadCount: "2-3 squads",
        notes: "Vertical city. Climb up, hold center building.",
        pro: "Take the elevator INSIDE — outside teams ambush you on the staircases.",
      },
      {
        name: "Lava Siphon",
        zone: "Northwest",
        risk: "med",
        loot: "med",
        rotationOut: "easy",
        squadCount: "1-2 squads",
        notes: "Industrial loot pit. Hot zone events spawn here.",
        pro: "Loot fast — the lava platforms damage you if you stand too long.",
      },
      {
        name: "Climatizer",
        zone: "North",
        risk: "med",
        loot: "high",
        rotationOut: "med",
        squadCount: "1-2 squads",
        notes: "Capital building with stacked supply bins.",
        pro: "Vault doors take 6 seconds — never crack them with a fight nearby.",
      },
    ],
  },
  {
    id: "storm-point",
    name: "Storm Point",
    size: "large",
    rotation: { active: true, lastSeen: "current rotation" },
    vibe: "Biggest map. Long fights, gravity cannons rotate fast.",
    edgeRules: "Trident vehicles required at edges (where they exist).",
    drops: [
      {
        name: "Barometer",
        zone: "Center",
        risk: "high",
        loot: "high",
        rotationOut: "med",
        squadCount: "3-4 squads",
        notes: "Central tower complex.",
        pro: "Drop the dish — the high point above the tower clears multiple POIs.",
      },
      {
        name: "Cascade Falls",
        zone: "West",
        risk: "med",
        loot: "med",
        rotationOut: "med",
        squadCount: "1-2 squads",
        notes: "Waterfall + cave system. Decent isolation.",
        pro: "Use the cave for revives — invisible from outside, all entry points are choke.",
      },
      {
        name: "Antenna",
        zone: "Southeast",
        risk: "med",
        loot: "high",
        rotationOut: "easy",
        squadCount: "1-2 squads",
        notes: "Tall radio masts, gravity cannon access.",
        pro: "Drop top of antenna, ride the rooftop ladder down for loot rotation.",
      },
      {
        name: "Mill",
        zone: "Northwest",
        risk: "low",
        loot: "med",
        rotationOut: "med",
        squadCount: "1 squad",
        notes: "Quiet drop. Decent loot, low contest.",
        pro: "Safe ranked drop — clear in 90s, rotate to next POI with full kit.",
      },
      {
        name: "The Wall",
        zone: "South",
        risk: "high",
        loot: "high",
        rotationOut: "hard",
        squadCount: "2-3 squads",
        notes: "Long defensive structure. Wall-running tech here.",
        pro: "Drop the cliff side — most teams land the wall side. Easy back-attack.",
      },
    ],
  },
  {
    id: "broken-moon",
    name: "Broken Moon",
    size: "medium",
    rotation: { active: true, lastSeen: "current rotation" },
    vibe: "Lunar terrain. Ziprails gutted in S29 — feels bigger now.",
    edgeRules: "S29 nerfed ziprails — plan rotations without them.",
    drops: [
      {
        name: "Promenade",
        zone: "Center",
        risk: "hot",
        loot: "high",
        rotationOut: "med",
        squadCount: "3-5 squads",
        notes: "City center. Always hot.",
        pro: "Drop the back-left rooftop — fewer teams contest it than the central plaza.",
      },
      {
        name: "Foundry",
        zone: "South",
        risk: "high",
        loot: "high",
        rotationOut: "med",
        squadCount: "2-3 squads",
        notes: "Industrial complex, lots of cover.",
        pro: "The smelters are death traps — push around, never through.",
      },
      {
        name: "Cultivation",
        zone: "East",
        risk: "med",
        loot: "med",
        rotationOut: "easy",
        squadCount: "1-2 squads",
        notes: "Plant nursery. Decent loot, lots of vegetation cover.",
        pro: "Bloodhound or Seer hard-counters this drop — bring scan if you can.",
      },
      {
        name: "Stasis Array",
        zone: "Northwest",
        risk: "med",
        loot: "high",
        rotationOut: "med",
        squadCount: "1-2 squads",
        notes: "Tech compound. Best loot for the contest level.",
        pro: "Center room has the most loot — but it's a 1-door deathbox if you greed.",
      },
      {
        name: "The Backlot",
        zone: "Southwest",
        risk: "low",
        loot: "med",
        rotationOut: "med",
        squadCount: "1 squad",
        notes: "Hidden gem. Often skipped by hot droppers.",
        pro: "Best 2nd-circle landing — gear up and walk into the zone with full kit.",
      },
    ],
  },
  {
    id: "olympus",
    name: "Olympus",
    size: "medium",
    rotation: { active: false, lastSeen: "rotated out S28" },
    vibe: "Sky city. Phase runners + gondolas for fast rotations.",
    edgeRules: "Edge can fall off the map — watch your step.",
    drops: [
      {
        name: "Hammond Labs",
        zone: "West",
        risk: "hot",
        loot: "high",
        rotationOut: "med",
        squadCount: "3-4 squads",
        notes: "Open lab complex. Iconic.",
        pro: "Drop the rooftop labs first — the basement floor is a trap.",
      },
      {
        name: "Bonsai Plaza",
        zone: "Center",
        risk: "high",
        loot: "high",
        rotationOut: "easy",
        squadCount: "2-3 squads",
        notes: "City plaza. Phase runner adjacency.",
        pro: "Phase runner lets you escape to Energy Depot in 8s — use it.",
      },
      {
        name: "Estates",
        zone: "Southeast",
        risk: "med",
        loot: "high",
        rotationOut: "med",
        squadCount: "1-2 squads",
        notes: "Multi-mansion complex.",
        pro: "Each mansion is a 1v1 — split and clear individually.",
      },
    ],
  },
];

// Common movement / loot fundamentals shared across maps.
export const MAP_FUNDAMENTALS = [
  {
    title: "Always have a 'plan B' rotation",
    text: "Before landing, identify both your primary loot path AND where you go if 3+ squads contest. Hesitation = death.",
  },
  {
    title: "High ground > loot tier",
    text: "Mid-tier loot with high ground beats elite loot in a basement. Position first, gear up second.",
  },
  {
    title: "Listen for the 3rd-party",
    text: "After every fight, hold for 5 seconds. If you hear footsteps, someone's coming. Heal, then push.",
  },
  {
    title: "Survey beacons are free intel",
    text: "Pathfinder, Valk, Crypto, Vantage scan the next ring location. Use it BEFORE you commit to a rotation.",
  },
];
