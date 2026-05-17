import Link from "next/link";
import { Card, Section, Pill, Stat, HudFrame } from "@/components/ui";
import { LEGENDS } from "@/lib/legends";
import { WEAPONS_WITH_TTK } from "@/lib/weapons";
import { computeMetaPredictions } from "@/lib/pulse";

const QUICK_LINKS = [
  { href: "/legends", label: "Legends", sub: "Pick + counter chart", tone: "blood" },
  { href: "/weapons", label: "Weapons", sub: "Tier list + DPS", tone: "gold" },
  { href: "/loadouts", label: "Loadouts", sub: "Pro-built combos", tone: "plasma" },
  { href: "/maps", label: "Maps", sub: "Drop spots + rotations", tone: "nessie" },
  { href: "/ranked", label: "Ranked", sub: "RP tracker", tone: "violet" },
  { href: "/training", label: "Training", sub: "Daily drills", tone: "blood" },
  { href: "/tips", label: "Tips", sub: "Movement + secrets", tone: "gold" },
  { href: "/pulse", label: "Pulse", sub: "Live patch meta", tone: "plasma" },
] as const;

export default function Home() {
  const sTier = LEGENDS.filter((l) => l.tier === "S");
  const sWeapons = WEAPONS_WITH_TTK.filter((w) => w.tier === "S");
  const preds = computeMetaPredictions().slice(0, 5);

  return (
    <>
      {/* HERO */}
      <HudFrame className="mb-8 overflow-hidden">
        <div className="relative p-5 md:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-plasma">
            <span className="inline-block h-2 w-2 rounded-full bg-blood" />
            Season 29 · Overclocked
          </div>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-[0.04em] text-ink md:text-7xl">
            APEX <span className="text-blood">LAB</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted md:text-base">
            Apex Legends reference. {LEGENDS.length} legends, {WEAPONS_WITH_TTK.length} weapons,
            5 maps, ranked tracker, training drills, movement tech.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Legends" value={LEGENDS.length} hint="S29 roster" />
            <Stat label="Weapons" value={WEAPONS_WITH_TTK.length} hint="All ammo types" tone="gold" />
            <Stat label="S-tier" value={sTier.length + sWeapons.length} hint="Legends + weapons" tone="blood" />
            <Stat label="Meta deltas" value={preds.length} hint="Tracked subjects" tone="plasma" />
          </div>
        </div>
      </HudFrame>

      {/* QUICK LINKS */}
      <Section title="PAGES" subtitle="State (favorites, RP, learned tips) is stored in your browser.">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group relative block overflow-hidden rounded-xl border border-line bg-surface p-4 shadow-card transition active:scale-[0.98] hover:border-blood/40 hover:shadow-glow"
            >
              <span className="absolute right-3 top-3 text-xs text-muted group-hover:text-blood">→</span>
              <div className="font-display text-3xl tracking-wider text-ink">{q.label}</div>
              <div className="mt-1 text-[11px] text-muted">{q.sub}</div>
            </Link>
          ))}
        </div>
      </Section>

      {/* S-TIER LEGENDS */}
      <Section
        title="S-TIER LEGENDS"
        subtitle={`${sTier.length} legends at S-tier this split.`}
        right={
          <Link href="/legends" className="text-xs font-bold uppercase tracking-wider text-blood hover:underline">
            See all →
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sTier.map((l) => (
            <Link
              key={l.id}
              href={`/legends#${l.id}`}
              className="block rounded-xl border border-line bg-surface p-4 shadow-card transition active:scale-[0.99] hover:border-blood/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-2xl tracking-wider text-ink">{l.name}</div>
                  <div className="text-[11px] uppercase text-muted">{l.class}</div>
                </div>
                <Pill tone="blood">{l.tier}-Tier</Pill>
              </div>
              <p className="mt-2 text-sm text-muted line-clamp-2">{l.pro}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {l.strengths.slice(0, 2).map((s) => (
                  <Pill key={s} tone="plasma">{s}</Pill>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* PULSE CALLOUT */}
      <Section
        title="META PULSE"
        subtitle="Predicted tier deltas from patch notes + community sentiment."
        right={
          <Link href="/pulse" className="text-xs font-bold uppercase tracking-wider text-plasma hover:underline">
            Full pulse →
          </Link>
        }
      >
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wider text-muted">
                <th className="pb-2 text-left">Subject</th>
                <th className="pb-2 text-left">Tier</th>
                <th className="pb-2 text-right">Delta</th>
                <th className="pb-2 text-right">Confidence</th>
                <th className="pb-2 text-left">Driver</th>
              </tr>
            </thead>
            <tbody>
              {preds.map((p) => (
                <tr key={p.type + p.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2 font-display text-base tracking-wider">{p.name}</td>
                  <td className="py-2"><Pill tone="muted">{p.type}</Pill></td>
                  <td className={`py-2 text-right font-mono num ${p.predictedDelta > 0 ? "text-nessie" : "text-blood"}`}>
                    {p.predictedDelta > 0 ? "+" : ""}{p.predictedDelta}
                  </td>
                  <td className="py-2 text-right text-muted">{Math.round(p.confidence * 100)}%</td>
                  <td className="py-2 text-xs text-muted">{p.primaryDriver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      {/* WEAPONS QUICK */}
      <Section
        title="S-TIER WEAPONS"
        subtitle={`${sWeapons.length} weapons at S-tier this split.`}
        right={
          <Link href="/weapons" className="text-xs font-bold uppercase tracking-wider text-gold hover:underline">
            All weapons →
          </Link>
        }
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {sWeapons.map((w) => (
            <Card key={w.id} className="hover:border-gold/40">
              <div className="flex items-start justify-between gap-2">
                <div className="font-display text-lg tracking-wider text-ink">{w.name}</div>
                <Pill tone="gold">S</Pill>
              </div>
              <div className="mt-2 text-[11px] uppercase text-muted">{w.class}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-muted">DPS</div>
                  <div className="font-mono text-base num">{w.dps}</div>
                </div>
                <div>
                  <div className="text-muted">TTK</div>
                  <div className="font-mono text-base num">{w.ttkMs}ms</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
