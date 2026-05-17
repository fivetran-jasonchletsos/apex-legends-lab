"use client";

import { useMemo, useState } from "react";
import { Card, Section, Pill, TierBadge, Bar } from "@/components/ui";
import { WEAPONS_WITH_TTK, HOP_UPS, type WeaponWithTTK } from "@/lib/weapons";

const CLASSES = [
  "Assault Rifle",
  "SMG",
  "LMG",
  "Sniper",
  "Marksman",
  "Shotgun",
  "Pistol",
] as const;

type SortKey = "tier" | "dps" | "ttk" | "damage" | "mag";

export default function WeaponsPage() {
  const [q, setQ] = useState("");
  const [cls, setCls] = useState<(typeof CLASSES)[number] | "All">("All");
  const [sort, setSort] = useState<SortKey>("tier");

  const filtered = useMemo(() => {
    const list = WEAPONS_WITH_TTK.filter((w) => {
      const matchQ = !q || w.name.toLowerCase().includes(q.toLowerCase());
      const matchC = cls === "All" || w.class === cls;
      return matchQ && matchC;
    });

    const tierRank: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };
    return [...list].sort((a, b) => {
      switch (sort) {
        case "tier":
          return tierRank[a.tier] - tierRank[b.tier];
        case "dps":
          return b.dps - a.dps;
        case "ttk":
          return a.ttkMs - b.ttkMs;
        case "damage":
          return b.damageBody - a.damageBody;
        case "mag":
          return b.magPurple - a.magPurple;
      }
    });
  }, [q, cls, sort]);

  return (
    <>
      <Section
        title="WEAPONS"
        subtitle="Tier, DPS, TTK, mag size — sorted however you need."
      >
        {/* Filters */}
        <Card className="mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search weapon…"
              className="w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-blood md:max-w-xs"
            />
            <div className="-mx-1 flex flex-wrap gap-1">
              <Chip active={cls === "All"} onClick={() => setCls("All")}>All</Chip>
              {CLASSES.map((c) => (
                <Chip key={c} active={cls === c} onClick={() => setCls(c)}>{c}</Chip>
              ))}
            </div>
            <div className="-mx-1 flex flex-wrap gap-1 md:ml-auto">
              {(["tier", "dps", "ttk", "damage", "mag"] as SortKey[]).map((k) => (
                <Chip key={k} active={sort === k} onClick={() => setSort(k)}>
                  Sort: {k}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WeaponCard key={w.id} w={w} />
          ))}
        </div>
      </Section>

      <Section title="HOP-UPS" subtitle="Per-weapon attachment modifiers and what they unlock.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {HOP_UPS.map((h) => (
            <Card key={h.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-xl tracking-wider text-ink">{h.name}</div>
                  <div className="mt-1 text-sm text-muted">{h.text}</div>
                </div>
                <Pill tone={h.tier === "epic" ? "violet" : "plasma"}>
                  {h.tier}
                </Pill>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {h.weapons.map((wId) => {
                  const wp = WEAPONS_WITH_TTK.find((x) => x.id === wId);
                  return wp ? <Pill key={wId} tone="muted">{wp.name}</Pill> : null;
                })}
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}

function Chip({
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

function WeaponCard({ w }: { w: WeaponWithTTK }) {
  return (
    <Card className="relative">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-wider text-ink">{w.name}</span>
            {w.isCarePackage && <Pill tone="gold">Care Package</Pill>}
            {w.isElite && <Pill tone="violet">Elite</Pill>}
          </div>
          <div className="mt-1 text-[11px] uppercase text-muted">
            {w.class} · {w.ammo}
          </div>
        </div>
        <TierBadge tier={w.tier} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Mini label="Body" value={w.damageBody} />
        <Mini label="Head" value={w.damageHead} />
        <Mini label="RPM" value={w.rpm} />
        <Mini label="DPS" value={w.dps} accent="gold" />
        <Mini label="TTK" value={`${w.ttkMs}ms`} accent="blood" />
        <Mini label="Mag (P)" value={`${w.magBase} / ${w.magPurple}`} />
      </div>

      <div className="mt-3 space-y-1">
        <Row label="Recoil" value={w.recoil} />
        <Row label="Range" value={w.rangeOptimal} />
      </div>

      <p className="mt-3 text-sm text-muted">{w.notes}</p>
      {w.isHopUp && (
        <div className="mt-2">
          <Pill tone="plasma">Hop-up: {w.isHopUp}</Pill>
        </div>
      )}
      <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm">
        <div className="text-[11px] uppercase tracking-wider text-gold">Pro tip</div>
        <div className="mt-1 text-ink">{w.pro}</div>
      </div>
    </Card>
  );
}

function Mini({ label, value, accent }: { label: string; value: React.ReactNode; accent?: "blood" | "gold" | "plasma" }) {
  const c = accent === "blood" ? "text-blood" : accent === "gold" ? "text-gold" : accent === "plasma" ? "text-plasma" : "text-ink";
  return (
    <div className="rounded-md border border-line bg-surface2 px-2 py-1">
      <div className="text-[10px] uppercase text-muted">{label}</div>
      <div className={`font-mono num text-base ${c}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="uppercase text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
