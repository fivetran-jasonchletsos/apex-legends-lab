import { Card, Section, Pill, HudFrame } from "@/components/ui";
import { computeMetaPredictions, PATCH_EVENTS } from "@/lib/pulse";

export default function PulsePage() {
  const preds = computeMetaPredictions();
  return (
    <>
      <Section
        title="META PULSE"
        subtitle="Live patch + community sentiment + streamer pick → predicted tier delta per subject."
      >
        <HudFrame className="mb-5">
          <div className="hud-scan absolute inset-0 opacity-20" />
          <div className="relative grid grid-cols-1 gap-3 p-4 md:grid-cols-3 md:p-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-plasma">Active patch</div>
              <div className="mt-1 font-display text-2xl tracking-wider text-ink">S29 · Overclocked</div>
              <div className="mt-1 text-xs text-muted">Released 2026-05-06</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-blood">Subjects moving</div>
              <div className="mt-1 font-display text-2xl tracking-wider text-ink num">{preds.length}</div>
              <div className="mt-1 text-xs text-muted">Legends + weapons with deltas</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-gold">Patch events</div>
              <div className="mt-1 font-display text-2xl tracking-wider text-ink num">{PATCH_EVENTS.length}</div>
              <div className="mt-1 text-xs text-muted">Across patch notes, reddit, twitter</div>
            </div>
          </div>
        </HudFrame>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="pb-2">Subject</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Current</th>
                <th className="pb-2 text-right">Delta</th>
                <th className="pb-2 text-right">Confidence</th>
                <th className="pb-2">Top event</th>
              </tr>
            </thead>
            <tbody>
              {preds.map((p) => (
                <tr key={p.type + p.id} className="border-b border-line/60 last:border-0">
                  <td className="py-2 font-display text-lg tracking-wider">{p.name}</td>
                  <td className="py-2"><Pill tone={p.type === "legend" ? "plasma" : "gold"}>{p.type}</Pill></td>
                  <td className="py-2"><Pill tone="muted">{p.currentTier}</Pill></td>
                  <td className={`py-2 text-right font-mono num ${p.predictedDelta > 0 ? "text-nessie" : "text-blood"}`}>
                    {p.predictedDelta > 0 ? "+" : ""}{p.predictedDelta}
                  </td>
                  <td className="py-2 text-right text-muted">{Math.round(p.confidence * 100)}%</td>
                  <td className="py-2 text-xs text-muted">{p.topEvent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Section title="EVENT STREAM" subtitle="Source feed that drives the predictions above.">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {PATCH_EVENTS.map((e) => (
            <Card key={e.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg tracking-wider text-ink">{e.title}</div>
                  <div className="mt-1 text-[11px] uppercase text-muted">
                    {e.source} · {e.date}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{e.summary}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {e.targets.map((t) => (
                  <Pill
                    key={t.type + t.id}
                    tone={t.sentiment === "buff" ? "nessie" : t.sentiment === "nerf" ? "blood" : "muted"}
                  >
                    {t.id} · {t.sentiment} · {t.weight > 0 ? "+" : ""}{t.weight}
                  </Pill>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
