"use client";

import { useEffect, useState } from "react";
import { Card, Section, Pill } from "@/components/ui";
import { MAPS, MAP_FUNDAMENTALS } from "@/lib/maps";

const FAV_KEY = "apex-maps-favorites";

export default function MapsPage() {
  const [active, setActive] = useState(MAPS.find((m) => m.rotation.active)?.id ?? MAPS[0].id);
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(FAV_KEY) : null;
    if (raw) setFavs(JSON.parse(raw));
  }, []);
  function toggleFav(key: string) {
    setFavs((cur) => {
      const next = cur.includes(key) ? cur.filter((x) => x !== key) : [...cur, key];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }

  const map = MAPS.find((m) => m.id === active) ?? MAPS[0];

  return (
    <>
      <Section
        title="MAPS"
        subtitle="Pick a map → see drop spots, risk, loot tier, and rotation difficulty."
      >
        {/* Tabs (horizontal scrollable on mobile) */}
        <div className="scroll-x mb-5 flex gap-2 overflow-x-auto pb-2">
          {MAPS.map((m) => {
            const isActive = m.id === active;
            return (
              <button
                key={m.id}
                onClick={() => setActive(m.id)}
                className={`shrink-0 rounded-lg border px-3 py-2 text-left transition active:scale-95 ${
                  isActive ? "border-blood bg-blood/10" : "border-line bg-surface"
                }`}
              >
                <div className="flex items-center gap-2 font-display text-lg tracking-wider text-ink">
                  {m.name}
                  {m.rotation.active && (
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-nessie" />
                  )}
                </div>
                <div className="text-[10px] uppercase text-muted">
                  {m.size} · {m.rotation.active ? "live" : "rotated out"}
                </div>
              </button>
            );
          })}
        </div>

        <Card className="mb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-2xl tracking-wider text-ink">{map.name}</span>
            {map.rotation.active && <Pill tone="nessie">In rotation</Pill>}
            <Pill tone="muted">{map.size}</Pill>
          </div>
          <p className="mt-2 text-sm text-muted">{map.vibe}</p>
          <p className="mt-2 text-sm text-muted">
            <span className="text-plasma">Edge rules:</span> {map.edgeRules}
          </p>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {map.drops.map((d) => {
            const k = `${map.id}::${d.name}`;
            const isFav = favs.includes(k);
            return (
              <Card key={d.name} className={isFav ? "border-gold/40 shadow-glowGold" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-xl tracking-wider text-ink">{d.name}</div>
                    <div className="text-[11px] uppercase text-muted">{d.zone}</div>
                  </div>
                  <button
                    onClick={() => toggleFav(k)}
                    aria-label="Favorite drop"
                    className={`grid h-8 w-8 place-items-center rounded-md border ${
                      isFav ? "border-gold bg-gold/20 text-gold" : "border-line bg-surface2 text-muted"
                    }`}
                  >
                    ★
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <Meter label="Risk" value={d.risk} accent="blood" />
                  <Meter label="Loot" value={d.loot} accent="gold" />
                  <Meter label="Rotation out" value={d.rotationOut} accent="plasma" />
                </div>

                <div className="mt-2 text-xs text-muted">{d.squadCount}</div>
                <p className="mt-2 text-sm text-ink">{d.notes}</p>
                <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm">
                  <div className="text-[11px] uppercase tracking-wider text-gold">Pro tip</div>
                  <div className="mt-1 text-ink">{d.pro}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="MAP FUNDAMENTALS" subtitle="True for every map, every match.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {MAP_FUNDAMENTALS.map((f) => (
            <Card key={f.title}>
              <div className="font-display text-lg tracking-wider text-plasma">{f.title}</div>
              <p className="mt-1 text-sm text-muted">{f.text}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}

function Meter({ label, value, accent }: { label: string; value: string; accent: "blood" | "gold" | "plasma" }) {
  const c =
    accent === "blood" ? "text-blood" : accent === "gold" ? "text-gold" : "text-plasma";
  return (
    <div className="rounded-md border border-line bg-surface2 px-2 py-1">
      <div className="text-[10px] uppercase text-muted">{label}</div>
      <div className={`mt-0.5 font-display text-base tracking-wider uppercase ${c}`}>{value}</div>
    </div>
  );
}
