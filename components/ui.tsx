import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  as?: any;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={`rounded-xl border border-line bg-surface p-4 shadow-card ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl leading-tight tracking-[0.05em] text-ink md:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-muted">{subtitle}</p>
          )}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "blood" | "plasma" | "gold" | "nessie";
}) {
  const toneClass = {
    default: "text-ink",
    blood: "text-blood",
    plasma: "text-plasma",
    gold: "text-gold",
    nessie: "text-nessie",
  }[tone];
  return (
    <div className="rounded-lg border border-line bg-surface p-3 md:p-4">
      <div className="font-sans text-[11px] font-bold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className={`mt-1 font-display text-2xl md:text-3xl ${toneClass} num`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
  className = "",
  interactive = false,
}: {
  children: ReactNode;
  tone?:
    | "default"
    | "blood"
    | "plasma"
    | "gold"
    | "nessie"
    | "violet"
    | "muted";
  className?: string;
  interactive?: boolean;
}) {
  const toneClass = {
    default: "border-line bg-surface2 text-ink",
    blood: "border-blood/40 bg-blood/10 text-blood",
    plasma: "border-plasma/40 bg-plasma/10 text-plasma",
    gold: "border-gold/40 bg-gold/10 text-gold",
    nessie: "border-nessie/40 bg-nessie/10 text-nessie",
    violet: "border-violet/40 bg-violet/10 text-violet",
    muted: "border-line bg-surface2 text-muted",
  }[tone];
  const interactiveClass = interactive
    ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-plasma"
    : "";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition active:scale-95 ${toneClass} ${interactiveClass} ${className}`}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: "S" | "A" | "B" | "C" | "D" }) {
  const map = {
    S: "bg-tierS text-black ring-1 ring-gold/50 shadow-[0_0_12px_rgba(230,57,70,0.35)]",
    A: "bg-tierA text-black",
    B: "bg-tierB text-black",
    C: "bg-tierC text-black",
    D: "bg-tierD text-white",
  };
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md font-display text-lg ${map[tier]}`}
    >
      {tier}
    </span>
  );
}

export function Bar({
  value,
  max = 100,
  tone = "blood",
  pulse = false,
}: {
  value: number;
  max?: number;
  tone?: "blood" | "plasma" | "gold" | "nessie" | "violet";
  pulse?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bg = {
    blood: "bg-blood",
    plasma: "bg-plasma",
    gold: "bg-gold",
    nessie: "bg-nessie",
    violet: "bg-violet",
  }[tone];
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface2">
      <div
        className={`h-full ${bg} ${pulse ? "animate-pulse" : ""}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EvoShield({ tier }: { tier: 0 | 1 | 2 | 3 | 4 }) {
  const map = ["bg-evoWhite", "bg-evoBlue", "bg-evoPurple", "bg-evoGold", "bg-evoRed"];
  const label = ["WHT", "BLU", "PUR", "GLD", "RED"];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-sm px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-black ${map[tier]}`}
      title={`EVO tier ${tier}`}
    >
      {label[tier]}
    </span>
  );
}

export function HudFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-line bg-surface bg-hex shadow-card ${className}`}
    >
      <span className="pointer-events-none absolute -left-px top-3 h-6 w-1 bg-blood" />
      <span className="pointer-events-none absolute -right-px bottom-3 h-6 w-1 bg-plasma" />
      {children}
    </div>
  );
}
