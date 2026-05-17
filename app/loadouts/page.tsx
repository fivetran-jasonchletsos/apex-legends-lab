"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Section, Pill, TierBadge } from "@/components/ui";
import { LOADOUTS, HOT_DROP_PLAN } from "@/lib/loadouts";
import { WEAPONS_WITH_TTK, findWeapon } from "@/lib/weapons";

const STYLES = ["aggressive", "balanced", "defensive", "long-range", "movement"] as const;

const STAR_KEY = "apex-loadouts-favorites";

export default function LoadoutsPage() {
  const [style, setStyle] = useState<(typeof STYLES)[number] | "All">("All");
  const [favs, setFavs] = useState<string[]>([]);
  const [openCustom, setOpenCustom] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STAR_KEY) : null;
    if (raw) setFavs(JSON.parse(raw));
  }, []);
  function toggleFav(id: string) {
    setFavs((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      localStorage.setItem(STAR_KEY, JSON.stringify(next));
      return next;
    });
  }

  const filtered = useMemo(
    () => (style === "All" ? LOADOUTS : LOADOUTS.filter((l) => l.style === style)),
    [style]
  );

  return (
    <>
      <Section
        title="LOADOUTS"
        subtitle="Proven weapon pairings. Star the ones you're running this session."
        right={
          <button
            onClick={() => setOpenCustom((v) => !v)}
            className="rounded-md border border-line bg-surface px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:border-blood"
          >
            {openCustom ? "Close builder" : "Build custom"}
          </button>
        }
      >
        <Card className="mb-5">
          <div className="-mx-1 flex flex-wrap gap-1">
            <Chip active={style === "All"} onClick={() => setStyle("All")}>All</Chip>
            {STYLES.map((s) => (
              <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((lo) => {
            const p = findWeapon(lo.primary.weaponId);
            const s = findWeapon(lo.secondary.weaponId);
            const isFav = favs.includes(lo.id);
            return (
              <Card key={lo.id} className={isFav ? "border-gold/40 shadow-glowGold" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-2xl tracking-wider text-ink">{lo.name}</div>
                    <div className="mt-1 text-[11px] uppercase text-muted">
                      {lo.style} · {lo.rangeBand}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TierBadge tier={lo.tier} />
                    <button
                      onClick={() => toggleFav(lo.id)}
                      aria-label="Favorite"
                      className={`grid h-8 w-8 place-items-center rounded-md border ${
                        isFav ? "border-gold bg-gold/20 text-gold" : "border-line bg-surface2 text-muted"
                      }`}
                    >
                      ★
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {p && <WeaponLine label="Primary" name={p.name} attach={lo.primary.attachments} />}
                  {s && <WeaponLine label="Secondary" name={s.name} attach={lo.secondary.attachments} />}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                  <Block label="Ammo">{lo.ammoSplit}</Block>
                  <Block label="Utility">{lo.utility.join(" · ")}</Block>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  <span className="text-[11px] uppercase text-muted">Best with:</span>
                  {lo.bestWith.map((b) => (
                    <Pill key={b} tone="plasma">{b}</Pill>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3 text-sm">
                  <div className="text-[11px] uppercase tracking-wider text-gold">Pro tip</div>
                  <div className="mt-1 text-ink">{lo.pro}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      {openCustom && <CustomBuilder />}

      <Section title="HOT-DROP PLAN" subtitle="Phase-by-phase loot priority for when you land contested.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {HOT_DROP_PLAN.map((p) => (
            <Card key={p.phase}>
              <div className="text-[11px] uppercase tracking-wider text-blood">{p.phase}</div>
              <div className="mt-1 font-display text-xl tracking-wider text-ink">{p.goal}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.priority.map((x) => (
                  <Pill key={x} tone="muted">{x}</Pill>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}

function CustomBuilder() {
  const [p, setP] = useState(WEAPONS_WITH_TTK[0]?.id ?? "r301");
  const [s, setS] = useState(WEAPONS_WITH_TTK[5]?.id ?? "r99");
  const W = WEAPONS_WITH_TTK;
  const pw = findWeapon(p);
  const sw = findWeapon(s);
  const combinedDps = (pw?.dps ?? 0) + (sw?.dps ?? 0);
  return (
    <Section title="CUSTOM BUILDER" subtitle="Test your own pairings — saved to this device only.">
      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <PickSelect label="Primary" value={p} onChange={setP} list={W} />
          <PickSelect label="Secondary" value={s} onChange={setS} list={W} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <Stat label="Total DPS" value={combinedDps} />
          <Stat label="Avg TTK" value={`${Math.round((((pw?.ttkMs ?? 0) + (sw?.ttkMs ?? 0)) / 2))}ms`} />
          <Stat
            label="Range coverage"
            value={`${pw?.rangeOptimal ?? "?"} + ${sw?.rangeOptimal ?? "?"}`}
          />
        </div>
      </Card>
    </Section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface2 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl tracking-wider text-ink">{value}</div>
    </div>
  );
}

function PickSelect({
  label,
  value,
  onChange,
  list,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  list: typeof WEAPONS_WITH_TTK;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-blood"
      >
        {list.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name} — {w.class} ({w.tier})
          </option>
        ))}
      </select>
    </label>
  );
}

function WeaponLine({
  label,
  name,
  attach,
}: {
  label: string;
  name: string;
  attach: string[];
}) {
  return (
    <div className="rounded-md border border-line bg-surface2 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="font-display text-lg tracking-wider text-ink">{name}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {attach.map((a) => (
          <Pill key={a} tone="muted">{a}</Pill>
        ))}
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface2 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-sm text-ink">{children}</div>
    </div>
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
