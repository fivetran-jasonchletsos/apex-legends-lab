"use client";

import { useEffect, useState } from "react";
import { Card, Section, Pill } from "@/components/ui";
import { DRILLS, DAILY_ROUTINE, SENS_GRID } from "@/lib/training";

const DONE_KEY = "apex-training-done";

export default function TrainingPage() {
  const [done, setDone] = useState<string[]>([]);
  const [routineActive, setRoutineActive] = useState(false);
  const [routineStep, setRoutineStep] = useState(0);
  const [sec, setSec] = useState(60);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(DONE_KEY) : null;
    if (raw) setDone(JSON.parse(raw));
  }, []);
  function toggle(id: string) {
    setDone((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      localStorage.setItem(DONE_KEY, JSON.stringify(next));
      return next;
    });
  }

  useEffect(() => {
    if (!routineActive) return;
    if (sec <= 0) {
      if (routineStep + 1 >= DAILY_ROUTINE.length) {
        setRoutineActive(false);
        return;
      }
      setRoutineStep((s) => s + 1);
      setSec(DAILY_ROUTINE[routineStep + 1].sec);
      return;
    }
    const t = setTimeout(() => setSec((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [sec, routineActive, routineStep]);

  function startRoutine() {
    setRoutineStep(0);
    setSec(DAILY_ROUTINE[0].sec);
    setRoutineActive(true);
  }

  return (
    <>
      <Section title="TRAINING" subtitle="Daily routine + targeted drills. Tracks your reps on this device.">
        <Card className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-2xl tracking-wider text-ink">Daily Warm-Up</div>
              <div className="mt-1 text-sm text-muted">5 minutes. Cuts cold-game deaths in half.</div>
            </div>
            <button
              onClick={routineActive ? () => setRoutineActive(false) : startRoutine}
              className={`rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                routineActive ? "bg-blood text-black" : "bg-plasma text-black"
              }`}
            >
              {routineActive ? "Pause" : "Start 5-min routine"}
            </button>
          </div>
          {routineActive && (
            <div className="mt-4 rounded-lg border border-plasma/40 bg-plasma/5 p-4">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl tracking-wider text-plasma num">
                  {String(Math.floor(sec / 60)).padStart(1, "0")}:
                  {String(sec % 60).padStart(2, "0")}
                </span>
                <span className="text-xs uppercase text-muted">
                  Step {routineStep + 1} / {DAILY_ROUTINE.length}
                </span>
              </div>
              <div className="mt-2 text-base text-ink">{DAILY_ROUTINE[routineStep].task}</div>
            </div>
          )}
          <ol className="mt-4 space-y-2 text-sm">
            {DAILY_ROUTINE.map((r, i) => (
              <li
                key={i}
                className={`flex items-center justify-between rounded-md border px-3 py-1.5 ${
                  routineActive && routineStep === i ? "border-plasma bg-plasma/10" : "border-line bg-surface2"
                }`}
              >
                <span>{i + 1}. {r.task}</span>
                <span className="font-mono text-xs text-muted">{r.sec}s</span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {DRILLS.map((d) => {
            const isDone = done.includes(d.id);
            return (
              <Card key={d.id} className={isDone ? "border-nessie/40" : ""}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-xl tracking-wider text-ink">{d.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1 text-[11px] uppercase">
                      <Pill tone="plasma">{d.category}</Pill>
                      <Pill tone="muted">{d.duration}</Pill>
                      <Pill tone="gold">DIFF {d.difficulty}/5</Pill>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(d.id)}
                    className={`grid h-8 w-8 place-items-center rounded-md border ${
                      isDone ? "border-nessie bg-nessie/20 text-nessie" : "border-line bg-surface2 text-muted"
                    }`}
                  >
                    ✓
                  </button>
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider text-muted">Setup</div>
                <div className="text-sm">{d.setup}</div>
                <ol className="mt-2 space-y-1 text-sm">
                  {d.steps.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-plasma">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ol>
                <div className="mt-3 rounded-lg border border-nessie/30 bg-nessie/5 p-3 text-sm">
                  <div className="text-[11px] uppercase tracking-wider text-nessie">Success</div>
                  <div className="mt-1 text-ink">{d.successCriteria}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="SENSITIVITY GRID" subtitle="Find your true cm/360.">
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase text-muted">
                <th className="pb-2">DPI</th>
                <th className="pb-2">In-Game Sens</th>
                <th className="pb-2 text-right">cm/360</th>
                <th className="pb-2">Use Case</th>
              </tr>
            </thead>
            <tbody>
              {SENS_GRID.map((s, i) => (
                <tr key={i} className="border-b border-line/60">
                  <td className="py-2 font-mono">{s.dpi}</td>
                  <td className="py-2 font-mono">{s.sens.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono num">{s.cm360.toFixed(1)} cm</td>
                  <td className="py-2 text-muted text-xs">
                    {s.cm360 < 22 ? "Hipfire / close" : s.cm360 < 35 ? "All-purpose" : "Tracking / mid-long"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
    </>
  );
}
