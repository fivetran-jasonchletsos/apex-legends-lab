"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Section, Pill } from "@/components/ui";
import { TIPS, TIP_CATEGORIES, type Tip } from "@/lib/tips";

const LEARN_KEY = "apex-tips-learned";

export default function TipsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Tip["category"] | "All">("All");
  const [console_, setConsole] = useState<"All" | "PC" | "Console">("All");
  const [learned, setLearned] = useState<string[]>([]);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LEARN_KEY) : null;
    if (raw) setLearned(JSON.parse(raw));
  }, []);
  function toggle(id: string) {
    setLearned((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      localStorage.setItem(LEARN_KEY, JSON.stringify(next));
      return next;
    });
  }

  const filtered = useMemo(
    () =>
      TIPS.filter((t) => {
        const mq =
          !q ||
          t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.text.toLowerCase().includes(q.toLowerCase());
        const mc = cat === "All" || t.category === cat;
        const mp = console_ === "All" || t.console === console_ || t.console === "Both";
        return mq && mc && mp;
      }),
    [q, cat, console_]
  );

  return (
    <>
      <Section
        title="TIPS & SECRETS"
        subtitle="Movement tech, gunplay, audio cues, hidden mechanics."
        right={
          <span className="text-xs text-muted">
            {learned.length}/{TIPS.length} learned
          </span>
        }
      >
        <Card className="mb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search tips…"
              className="w-full rounded-lg border border-line bg-surface2 px-3 py-2 text-sm text-ink outline-none focus:border-blood md:max-w-xs"
            />
            <div className="-mx-1 flex flex-wrap gap-1">
              <Chip active={cat === "All"} onClick={() => setCat("All")}>All</Chip>
              {TIP_CATEGORIES.map((c) => (
                <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>
              ))}
            </div>
            <div className="-mx-1 flex flex-wrap gap-1 md:ml-auto">
              {(["All", "PC", "Console"] as const).map((p) => (
                <Chip key={p} active={console_ === p} onClick={() => setConsole(p)}>{p}</Chip>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((t) => {
            const isL = learned.includes(t.id);
            return (
              <Card key={t.id} className={isL ? "border-nessie/40" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-xl tracking-wider text-ink">{t.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1 text-[11px] uppercase">
                      <Pill tone="plasma">{t.category}</Pill>
                      <Pill tone="muted">{t.console}</Pill>
                      <Pill tone="gold">DIFF {t.difficulty}/5</Pill>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(t.id)}
                    aria-label="Mark learned"
                    className={`grid h-8 w-8 place-items-center rounded-md border ${
                      isL ? "border-nessie bg-nessie/20 text-nessie" : "border-line bg-surface2 text-muted"
                    }`}
                  >
                    ✓
                  </button>
                </div>

                <p className="mt-2 text-sm text-ink">{t.text}</p>
                <div className="mt-2 rounded-md border border-line bg-surface2 p-3 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-plasma">Why it works</div>
                  <div className="mt-1 text-muted">{t.why}</div>
                </div>
                {t.drill && (
                  <div className="mt-2 text-xs text-muted">
                    <span className="text-gold">Drill:</span> {t.drill}
                  </div>
                )}
              </Card>
            );
          })}
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
        active ? "border-blood bg-blood text-black" : "border-line bg-surface2 text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
