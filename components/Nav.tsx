"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const ROUTES: { href: string; label: string; sub: string }[] = [
  { href: "/legends", label: "Legends", sub: "Roster + tier list" },
  { href: "/weapons", label: "Weapons", sub: "DPS · TTK · recoil" },
  { href: "/loadouts", label: "Loadouts", sub: "Builder + saves" },
  { href: "/maps", label: "Maps", sub: "Drop spots + rotations" },
  { href: "/ranked", label: "Ranked", sub: "RP tracker + ladder" },
  { href: "/training", label: "Training", sub: "Movement + aim" },
  { href: "/tips", label: "Tips", sub: "Secrets & tech" },
  { href: "/pulse", label: "Pulse", sub: "Patch → meta" },
  { href: "/stack", label: "Stack", sub: "ODI pipeline" },
];

export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70 pt-safe">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative grid h-9 w-9 place-items-center rounded-md bg-blood font-display text-base text-black shadow-glow">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M12 2 L22 20 L12 16 L2 20 Z" />
            </svg>
          </span>
          <span className="font-display text-2xl tracking-[0.18em] text-ink">
            APEX <span className="text-blood">LAB</span>
          </span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-1">
          {ROUTES.map((r) => {
            const active = path === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                className={`rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  active
                    ? "bg-blood text-black"
                    : "text-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </nav>

        <button
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-md border border-line bg-surface text-ink md:hidden"
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 right-0 h-0.5 bg-ink transition ${
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 right-0 h-0.5 bg-ink transition ${
                open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 top-[57px] z-40 md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-bg/95 backdrop-blur transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-x-0 top-0 max-h-[calc(100vh-57px)] overflow-y-auto px-4 py-4 pb-safe transition-transform duration-200 ${
            open ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <ul className="grid grid-cols-2 gap-2">
            {ROUTES.map((r) => {
              const active = path === r.href;
              return (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className={`block rounded-lg border p-3 transition active:scale-[0.98] ${
                      active
                        ? "border-blood bg-blood/10"
                        : "border-line bg-surface"
                    }`}
                  >
                    <div className="font-display text-2xl tracking-wider text-ink">
                      {r.label}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">{r.sub}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
}
