// Apex Legends Ranked — Season 29 split system + RP economy.

export type Tier =
  | "Rookie"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Predator";

export const TIERS: { name: Tier; rpFloor: number; color: string; demote: boolean }[] = [
  { name: "Rookie", rpFloor: 0, color: "tierRook", demote: false },
  { name: "Bronze", rpFloor: 250, color: "tierBronze", demote: false },
  { name: "Silver", rpFloor: 600, color: "tierSilver", demote: false },
  { name: "Gold", rpFloor: 1200, color: "tierGold", demote: true },
  { name: "Platinum", rpFloor: 2000, color: "tierPlat", demote: true },
  { name: "Diamond", rpFloor: 3000, color: "tierDia", demote: true },
  { name: "Master", rpFloor: 4000, color: "tierMaster", demote: true },
  { name: "Predator", rpFloor: 5000, color: "tierPred", demote: true },
];

// RP earned per placement at base. Multiplied by tier modifier.
export const PLACEMENT_RP: { place: number; rp: number }[] = [
  { place: 1, rp: 175 },
  { place: 2, rp: 130 },
  { place: 3, rp: 95 },
  { place: 4, rp: 70 },
  { place: 5, rp: 60 },
  { place: 6, rp: 50 },
  { place: 7, rp: 40 },
  { place: 8, rp: 30 },
  { place: 9, rp: 25 },
  { place: 10, rp: 20 },
  { place: 13, rp: 0 },
  { place: 17, rp: -25 },
  { place: 20, rp: -50 },
];

// Kill RP — capped per match. Higher tier = each kill worth more in modifier.
export const KILL_RP = { perKill: 10, capPerMatch: 75 };

// Entry cost per tier — what you pay to play a ranked match.
export const ENTRY_COST: Record<Tier, number> = {
  Rookie: 0,
  Bronze: 20,
  Silver: 25,
  Gold: 30,
  Platinum: 35,
  Diamond: 45,
  Master: 55,
  Predator: 65,
};

export function tierForRP(rp: number): Tier {
  let t: Tier = "Rookie";
  for (const tier of TIERS) {
    if (rp >= tier.rpFloor) t = tier.name;
  }
  return t;
}

export function rpToNextTier(rp: number): { next: Tier | null; gap: number } {
  for (const tier of TIERS) {
    if (tier.rpFloor > rp) return { next: tier.name, gap: tier.rpFloor - rp };
  }
  return { next: null, gap: 0 };
}

// Calculate match net RP.
export function netRP({
  placement,
  kills,
  tier,
}: {
  placement: number;
  kills: number;
  tier: Tier;
}): { gross: number; entry: number; net: number; killRp: number; placeRp: number } {
  // Find placement bucket
  let placeRp = -50;
  for (const p of PLACEMENT_RP) {
    if (placement <= p.place) {
      placeRp = p.rp;
      break;
    }
  }
  const killRp = Math.min(kills * KILL_RP.perKill, KILL_RP.capPerMatch);
  const entry = ENTRY_COST[tier];
  const gross = placeRp + killRp;
  return { gross, entry, net: gross - entry, killRp, placeRp };
}

// Predator threshold history (top 750 PC players).
export const PREDATOR_HISTORY = [
  { season: "S26", thresholdRP: 28500 },
  { season: "S27", thresholdRP: 31200 },
  { season: "S28", thresholdRP: 29800 },
  { season: "S29 (current)", thresholdRP: 32100 },
];

// Common climb mistakes — by RP band.
export const CLIMB_TIPS: { tier: Tier; tips: string[] }[] = [
  {
    tier: "Bronze",
    tips: [
      "Don't hot drop. Land safe, gear up, fight late.",
      "Stay with your team. Solo deaths cost more RP than missed kills.",
      "Pick one legend, learn the kit fully before swapping.",
    ],
  },
  {
    tier: "Silver",
    tips: [
      "Top-5 every match. Placement RP > kill RP at this tier.",
      "Crack a shield, retreat, reset. Don't chase low HP into 3rd parties.",
      "Use scan beacons every ring — knowing the next zone saves rotations.",
    ],
  },
  {
    tier: "Gold",
    tips: [
      "Demotion starts here. Negative RP matches now possible.",
      "Take ratting seriously — top 5 with no kills > top 12 with 4 kills.",
      "Edge-of-zone fights are usually winnable. Don't push into center stacks.",
    ],
  },
  {
    tier: "Platinum",
    tips: [
      "Trios meta dominates. Your comp matters — at least 1 movement, 1 support/recon.",
      "Avoid early game fights unless guaranteed kills. Save HP for late.",
      "Learn 2 maps cold. Rotating blind costs you RP every match.",
    ],
  },
  {
    tier: "Diamond",
    tips: [
      "Pre-aim corners every push — sharing aim time is how Diamond players win trades.",
      "Always have a rotate planned 2 zones ahead.",
      "Counter-position before the fight starts. High ground wins 70% of equal fights.",
    ],
  },
  {
    tier: "Master",
    tips: [
      "Master is 80% game-sense. Aim is necessary but not sufficient.",
      "Solo queue is a slog — find a duo who matches your tempo.",
      "Use the death recap religiously — every loss has a learnable mistake.",
    ],
  },
  {
    tier: "Predator",
    tips: [
      "Top 750. Every match counts. -RP days happen — don't tilt-queue.",
      "Stream snipers are real at this level. Mind your VOD when streaming.",
      "Rest matters more than reps at top 1000 — play fresh, not exhausted.",
    ],
  },
];
