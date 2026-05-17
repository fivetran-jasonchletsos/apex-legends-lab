// Patch/meta pulse — predicted impact on legends and weapons from real telemetry.
// Mirrors the 2K /pulse pattern: live data → predicted delta on a unit.

import { LEGENDS } from "./legends";
import { WEAPONS_WITH_TTK } from "./weapons";

export type PatchEvent = {
  id: string;
  date: string; // ISO
  source: "patch_notes" | "designer_notes" | "twitter" | "reddit";
  title: string;
  url: string;
  summary: string;
  targets: { type: "legend" | "weapon"; id: string; sentiment: "buff" | "nerf" | "neutral"; weight: number }[];
};

export const PATCH_EVENTS: PatchEvent[] = [
  {
    id: "s29-launch",
    date: "2026-05-06",
    source: "designer_notes",
    title: "Overclocked Designer's Notes",
    url: "https://www.ea.com/en/games/apex-legends/apex-legends/news/29-0-designers-notes",
    summary: "Axle introduced. Vantage + Conduit buffs. Alter reigned in. Tridents removed from 2 maps. Ziprails gutted on Broken Moon.",
    targets: [
      { type: "legend", id: "axle", sentiment: "buff", weight: 1.0 },
      { type: "legend", id: "vantage", sentiment: "buff", weight: 0.7 },
      { type: "legend", id: "conduit", sentiment: "buff", weight: 0.6 },
      { type: "legend", id: "alter", sentiment: "nerf", weight: -0.8 },
      { type: "legend", id: "valkyrie", sentiment: "nerf", weight: -0.3 },
    ],
  },
  {
    id: "s29-alternator",
    date: "2026-05-06",
    source: "patch_notes",
    title: "Alternator + Disruptor Hop-Up",
    url: "https://www.ea.com/en/games/apex-legends/apex-legends/news/29-0-designers-notes",
    summary: "Alternator gains mag size, double-tap, and Disruptor Rounds hop-up. Hot SMG of the season.",
    targets: [
      { type: "weapon", id: "alternator", sentiment: "buff", weight: 1.0 },
      { type: "weapon", id: "r99", sentiment: "nerf", weight: -0.3 },
      { type: "weapon", id: "volt", sentiment: "neutral", weight: 0.0 },
    ],
  },
  {
    id: "s29-deathbox-respawn",
    date: "2026-05-06",
    source: "patch_notes",
    title: "Deathbox Respawns",
    url: "https://www.ea.com/en/games/apex-legends/apex-legends/news/29-0-designers-notes",
    summary: "New mechanic: revive teammates directly off death boxes. Aggressive plays heavily rewarded.",
    targets: [
      { type: "legend", id: "lifeline", sentiment: "buff", weight: 0.5 },
      { type: "legend", id: "newcastle", sentiment: "buff", weight: 0.7 },
      { type: "legend", id: "gibraltar", sentiment: "buff", weight: 0.4 },
      { type: "legend", id: "mirage", sentiment: "buff", weight: 0.6 },
      { type: "legend", id: "conduit", sentiment: "buff", weight: 0.4 },
    ],
  },
  {
    id: "s29-chain-heal",
    date: "2026-05-06",
    source: "patch_notes",
    title: "Chain Healing",
    url: "https://www.ea.com/en/games/apex-legends/apex-legends/news/29-0-designers-notes",
    summary: "Heal items chain to nearby teammates at 40% efficiency. Support meta strengthened.",
    targets: [
      { type: "legend", id: "lifeline", sentiment: "buff", weight: 0.8 },
      { type: "legend", id: "newcastle", sentiment: "buff", weight: 0.3 },
      { type: "legend", id: "conduit", sentiment: "buff", weight: 0.5 },
      { type: "legend", id: "loba", sentiment: "buff", weight: 0.4 },
    ],
  },
  {
    id: "s29-broken-moon-rotation",
    date: "2026-05-09",
    source: "reddit",
    title: "Broken Moon ziprails nerf — community fallout",
    url: "https://www.reddit.com/r/apexlegends",
    summary: "r/apexlegends top thread (12k upvotes): movement-focused legends are struggling without ziprails for fast rotates.",
    targets: [
      { type: "legend", id: "valkyrie", sentiment: "buff", weight: 0.4 },
      { type: "legend", id: "pathfinder", sentiment: "buff", weight: 0.3 },
      { type: "legend", id: "ash", sentiment: "buff", weight: 0.2 },
      { type: "legend", id: "axle", sentiment: "buff", weight: 0.3 },
    ],
  },
  {
    id: "s29-r301-reload",
    date: "2026-05-12",
    source: "twitter",
    title: "@PlayApex: R-301 reload speed dev clarification",
    url: "https://twitter.com/playapex",
    summary: "Devs confirm R-301 reload remains best in class. Pros responding by leaning more on R-301 stack.",
    targets: [{ type: "weapon", id: "r301", sentiment: "buff", weight: 0.3 }],
  },
];

// Compute predicted meta delta per legend/weapon from event stream.
// Mirrors the 2K mart_rating_predictions pattern (form + news + injury → delta).
export type MetaPrediction = {
  id: string;
  type: "legend" | "weapon";
  name: string;
  currentTier: string;
  predictedDelta: number; // -5 to +5
  confidence: number; // 0 to 1
  primaryDriver: string;
  topEvent: string;
};

export function computeMetaPredictions(): MetaPrediction[] {
  const aggregated = new Map<
    string,
    { type: "legend" | "weapon"; weights: number[]; topWeight: number; topEvent: string }
  >();
  for (const event of PATCH_EVENTS) {
    for (const t of event.targets) {
      const key = `${t.type}:${t.id}`;
      const existing = aggregated.get(key) ?? { type: t.type, weights: [], topWeight: 0, topEvent: "" };
      existing.weights.push(t.weight);
      if (Math.abs(t.weight) > Math.abs(existing.topWeight)) {
        existing.topWeight = t.weight;
        existing.topEvent = event.title;
      }
      aggregated.set(key, existing);
    }
  }

  const out: MetaPrediction[] = [];
  for (const [key, data] of aggregated) {
    const [type, id] = key.split(":") as ["legend" | "weapon", string];
    const sumWeight = data.weights.reduce((a, b) => a + b, 0);
    // Map sum-weight (~ -2 to +2) to ratings delta (-5 to +5).
    const predictedDelta = Math.max(-5, Math.min(5, +(sumWeight * 2.0).toFixed(1)));
    const confidence = Math.min(1.0, 0.4 + Math.abs(sumWeight) * 0.25 + data.weights.length * 0.05);
    let name = "";
    let currentTier = "";
    if (type === "legend") {
      const L = LEGENDS.find((l) => l.id === id);
      if (!L) continue;
      name = L.name;
      currentTier = L.tier;
    } else {
      const W = WEAPONS_WITH_TTK.find((w) => w.id === id);
      if (!W) continue;
      name = W.name;
      currentTier = W.tier;
    }
    out.push({
      id,
      type,
      name,
      currentTier,
      predictedDelta,
      confidence: +confidence.toFixed(2),
      primaryDriver: data.topWeight > 0 ? "patch_buff" : "patch_nerf",
      topEvent: data.topEvent,
    });
  }

  return out.sort((a, b) => Math.abs(b.predictedDelta) - Math.abs(a.predictedDelta));
}
