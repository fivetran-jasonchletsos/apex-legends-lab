"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Section, Pill, Bar } from "@/components/ui";
import {
  TIERS,
  PLACEMENT_RP,
  ENTRY_COST,
  KILL_RP,
  CLIMB_TIPS,
  PREDATOR_HISTORY,
  netRP,
  tierForRP,
  rpToNextTier,
  type Tier,
} from "@/lib/ranked";

const RP_KEY = "apex-ranked-rp";

export default function RankedPage() {
  const [rp, setRp] = useState(2000);
  const [placement, setPlacement] = useState(8);
  const [kills, setKills] = useState(3);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(RP_KEY) : null;
    if (raw) setRp(parseInt(raw, 10) || 2000);
  }, []);
  useEffect(() => {
    localStorage.setItem(RP_KEY, String(rp));
  }, [rp]);

  const tier = tierForRP(rp);
  const next = rpToNextTier(rp);
  const sim = useMemo(() => netRP({ placement, kills, tier }), [placement, kills, tier]);

  const tierInfo = TIERS.find((t) => t.name === tier);
  const currentFloor = tierInfo?.rpFloor ?? 0;
  const nextFloor = next.next ? TIERS.find((t) => t.name === next.next)!.rpFloor : currentFloor + 1;
  const progress = Math.max(0, Math.min(100, ((rp - currentFloor) / (nextFloor - currentFloor)) * 100));

  return (
    <>
      <Section title="RANKED" subtitle="Track your RP, simulate matches, see climb tips for your tier.">
        <Card className="mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted">Current RP</div>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl tracking-wider text-ink num">{rp}</span>
                <Pill tone="blood">{tier}</Pill>
              </div>
              {next.next && (
                <div className="mt-2 text-xs text-muted">
                  {next.gap} RP to <span className="text-plasma">{next.next}</span>
                </div>
              )}
            </div>
            <div className="md:max-w-sm md:flex-1">
              <input
                type="range"
                min={0}
                max={6000}
                step={25}
                value={rp}
                onChange={(e) => setRp(parseInt(e.target.value, 10))}
                className="w-full accent-blood"
              />
              <Bar value={progress} max={100} tone="blood" />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card>
            <div className="font-display text-2xl tracking-wider text-ink">Match Simulator</div>
            <div className="mt-1 text-xs text-muted">Tap to model a match before you queue.</div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Range label={`Placement (${placement})`} value={placement} min={1} max={20} onChange={setPlacement} />
              <Range label={`Kills (${kills})`} value={kills} min={0} max={15} onChange={setKills} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <Stat label="Place RP" value={sim.placeRp} accent={sim.placeRp >= 0 ? "nessie" : "blood"} />
              <Stat label="Kill RP" value={`+${sim.killRp}`} accent="gold" />
              <Stat label="Entry" value={`-${sim.entry}`} accent="muted" />
              <Stat label="NET" value={sim.net} accent={sim.net >= 0 ? "nessie" : "blood"} big />
            </div>
            <div className="mt-2 text-[11px] text-muted">
              Kill RP capped at {KILL_RP.capPerMatch}/match.
            </div>
          </Card>

          <Card>
            <div className="font-display text-2xl tracking-wider text-ink">Tier Ladder</div>
            <div className="mt-3 space-y-2">
              {TIERS.map((t) => {
                const current = t.name === tier;
                return (
                  <div
                    key={t.name}
                    className={`flex items-center justify-between rounded-md border px-3 py-1.5 text-xs ${
                      current ? "border-blood bg-blood/10" : "border-line bg-surface2"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-3 w-3 rounded-sm bg-${t.color}`} />
                      <span className="font-display text-base tracking-wider text-ink">{t.name}</span>
                      {t.demote && <Pill tone="muted">Demotion zone</Pill>}
                    </div>
                    <div className="text-muted">{t.rpFloor} RP</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </Section>

      <Section title="ENTRY COST + REWARDS" subtitle="Math behind the climb.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Card>
            <div className="font-display text-xl tracking-wider text-ink">Placement RP</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {PLACEMENT_RP.map((p) => (
                <div key={p.place} className="flex items-center justify-between rounded-md border border-line bg-surface2 px-2 py-1">
                  <span>#{p.place}</span>
                  <span className={`font-mono num ${p.rp >= 0 ? "text-nessie" : "text-blood"}`}>
                    {p.rp >= 0 ? "+" : ""}{p.rp}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="font-display text-xl tracking-wider text-ink">Entry Cost</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(ENTRY_COST).map(([t, cost]) => (
                <div key={t} className="flex items-center justify-between rounded-md border border-line bg-surface2 px-2 py-1">
                  <span>{t}</span>
                  <span className="font-mono num text-muted">-{cost}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section title="CLIMB TIPS" subtitle="Targeted advice for your current tier.">
        {CLIMB_TIPS.filter((c) => c.tier === tier).map((c) => (
          <Card key={c.tier}>
            <div className="font-display text-xl tracking-wider text-ink">{c.tier} climb</div>
            <ul className="mt-2 space-y-2 text-sm">
              {c.tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-blood">▸</span> {tip}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </Section>

      <Section title="PREDATOR THRESHOLD" subtitle="Top 750 LP — historical floor.">
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="pb-2">Season</th>
                <th className="pb-2 text-right">RP Floor</th>
              </tr>
            </thead>
            <tbody>
              {PREDATOR_HISTORY.map((h) => (
                <tr key={h.season} className="border-t border-line/60">
                  <td className="py-2">{h.season}</td>
                  <td className="py-2 text-right font-mono num">{h.thresholdRP.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
    </>
  );
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="mt-1 w-full accent-plasma"
      />
    </label>
  );
}

function Stat({
  label,
  value,
  accent = "ink",
  big = false,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "ink" | "nessie" | "blood" | "gold" | "muted";
  big?: boolean;
}) {
  const c =
    accent === "nessie"
      ? "text-nessie"
      : accent === "blood"
      ? "text-blood"
      : accent === "gold"
      ? "text-gold"
      : accent === "muted"
      ? "text-muted"
      : "text-ink";
  return (
    <div className="rounded-md border border-line bg-surface2 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`mt-0.5 font-display tracking-wider num ${c} ${big ? "text-3xl" : "text-xl"}`}>{value}</div>
    </div>
  );
}
