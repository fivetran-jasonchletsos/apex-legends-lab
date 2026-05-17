"use client";

import { useMemo, useState } from "react";
import { Card, Section, Pill, TierBadge, Bar } from "@/components/ui";
import {
  LEGENDS,
  LEGEND_CLASSES,
  CLASS_PASSIVES,
  type LegendClass,
} from "@/lib/legends";

const TIERS = ["S", "A", "B", "C", "D"] as const;

export default function LegendsPage() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<LegendClass | "All">("All");
  const [tier, setTier] = useState<(typeof TIERS)[number] | "All">("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return LEGENDS.filter((l) => {
      const matchQ =
        !q ||
        l.name.toLowerCase().includes(q.toLowerCase()) ||
        l.realName.toLowerCase().includes(q.toLowerCase());
      const matchC = cls === "All" || l.class === cls;
      const matchT = tier === "All" || l.tier === tier;
      return matchQ && matchC && matchT;
    });
  }, [q, cls, tier]);

  return (
    <>
      <Section
        title="LEGENDS"
        subtitle="The full Season 29 roster, with tier, kit, counters, and pro tips."
      >
        {/* Filters */}
        <Card className="mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search legend…"
              className="w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-blood md:max-w-xs"
            />
            <div className="-mx-1 flex flex-wrap gap-1">
              <FilterChip active={cls === "All"} onClick={() => setCls("All")}>All</FilterChip>
              {LEGEND_CLASSES.map((c) => (
                <FilterChip key={c} active={cls === c} onClick={() => setCls(c)}>{c}</FilterChip>
              ))}
            </div>
            <div className="-mx-1 flex flex-wrap gap-1">
              <FilterChip active={tier === "All"} onClick={() => setTier("All")}>Any tier</FilterChip>
              {TIERS.map((t) => (
                <FilterChip key={t} active={tier === t} onClick={() => setTier(t)}>{t}</FilterChip>
              ))}
            </div>
          </div>
        </Card>

        {/* Class passive ribbon */}
        {cls !== "All" && (
          <Card className="mb-4 border-plasma/40 bg-plasma/5">
            <div className="text-[11px] uppercase tracking-wider text-plasma">{cls} class perk</div>
            <div className="mt-1 font-display text-xl tracking-wider text-ink">
              {CLASS_PASSIVES[cls].perk}
            </div>
            <div className="mt-1 text-sm text-muted">{CLASS_PASSIVES[cls].bonus}</div>
          </Card>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => {
            const open = openId === l.id;
            return (
              <div
                key={l.id}
                id={l.id}
                className={`scroll-mt-24 rounded-xl border ${
                  open ? "border-blood/50 shadow-glow" : "border-line"
                } bg-surface shadow-card transition`}
              >
                <button
                  onClick={() => setOpenId(open ? null : l.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-2xl tracking-wider text-ink">{l.name}</div>
                      <div className="text-[11px] uppercase text-muted">
                        {l.class} · {l.realName}
                      </div>
                    </div>
                    <TierBadge tier={l.tier} />
                  </div>
                  <p className="mt-2 text-sm text-muted line-clamp-2">{l.pro}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted">Pick rate (Plat+)</div>
                      <div className="mt-1"><Bar value={l.pickRate} max={15} tone="plasma" /></div>
                    </div>
                    <div>
                      <div className="text-muted">Win rate (Plat+)</div>
                      <div className="mt-1"><Bar value={l.winRate} max={10} tone="nessie" /></div>
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="border-t border-line p-4 animate-fade-in">
                    <KitBlock title={`Passive · ${l.passive.name}`} body={l.passive.text} />
                    <KitBlock
                      title={`Tactical · ${l.tactical.name}`}
                      body={l.tactical.text}
                      meta={`Cooldown ${l.tactical.cooldown}s`}
                    />
                    <KitBlock
                      title={`Ultimate · ${l.ultimate.name}`}
                      body={l.ultimate.text}
                      meta={`Cooldown ${l.ultimate.cooldown}s`}
                    />

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-nessie">Strengths</div>
                        <ul className="mt-1 space-y-1 text-sm">
                          {l.strengths.map((s) => <li key={s}>· {s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-blood">Weaknesses</div>
                        <ul className="mt-1 space-y-1 text-sm">
                          {l.weaknesses.map((s) => <li key={s}>· {s}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted">Pairs with</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {l.pairsWith.map((p) => (
                            <Pill key={p} tone="plasma">{p}</Pill>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted">Countered by</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {l.counters.map((p) => (
                            <Pill key={p} tone="blood">{p}</Pill>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm">
                      <div className="text-[11px] uppercase tracking-wider text-gold">Pro tip</div>
                      <div className="mt-1 text-ink">{l.pro}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`m-1 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition active:scale-95 ${
        active
          ? "border-blood bg-blood text-black"
          : "border-line bg-surface2 text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function KitBlock({ title, body, meta }: { title: string; body: string; meta?: string }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-plasma">{title}</div>
        {meta && <div className="text-[11px] text-muted">{meta}</div>}
      </div>
      <div className="mt-1 text-sm text-ink">{body}</div>
    </div>
  );
}
