"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMuseum } from "@/engine/experience-controller";
import { VestigeSymbol } from "./Symbol";

const destinations = [
  { href: "/explore", label: "Explore", note: "Move through the museum at your own pace" },
  { href: "/journey/what-remains", label: "Journey", note: "Exhibition 001 — What Remains" },
  { href: "/collection", label: "Collection", note: "Search and revisit every work" },
  { href: "/about", label: "About", note: "Philosophy, approach, and credits" },
];

/**
 * A discreet museum-style navigation: a small corner label that expands into a panel.
 * Hidden during the cinematic intro, where the intro's own Skip control is the way out.
 */
export function MuseumNav() {
  const museum = useMuseum();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        setOpen(false);
        openerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open]);

  if (pathname === "/" && museum.mode === "intro") return null;

  return (
    <nav className="museum-nav" aria-label="Museum">
      <div className="museum-nav__bar">
        <Link href="/" className="museum-nav__home wordmark" aria-label="VESTIGE — return to the entrance hall">
          VESTIGE
        </Link>
        <button ref={openerRef} className="quiet" aria-expanded={open} aria-controls="museum-panel" onClick={() => setOpen(true)}>
          <VestigeSymbol size={18} /> Museum
        </button>
      </div>

      <div id="museum-panel" ref={panelRef} className="museum-nav__panel" data-open={open} aria-hidden={!open}>
        <button className="quiet museum-nav__close" onClick={() => { setOpen(false); openerRef.current?.focus(); }}>
          Close
        </button>
        <ul>
          {destinations.map((d) => (
            <li key={d.href}>
              <Link href={d.href} aria-current={pathname.startsWith(d.href) ? "page" : undefined} tabIndex={open ? 0 : -1}>
                {d.label}
              </Link>
              <small>{d.note}</small>
            </li>
          ))}
        </ul>
        <div className="museum-nav__settings">
          <button className="quiet toggle" tabIndex={open ? 0 : -1} onClick={() => museum.setSound(!museum.soundEnabled)} aria-pressed={museum.soundEnabled}>
            Sound <span className="toggle__state">{museum.soundEnabled ? "On" : "Off"}</span>
          </button>
          <button className="quiet toggle" tabIndex={open ? 0 : -1} onClick={() => museum.setReducedMotion(!museum.reducedMotion)} aria-pressed={museum.reducedMotion}>
            Reduced motion <span className="toggle__state">{museum.reducedMotion ? "On" : "Off"}</span>
          </button>
          <button
            className="quiet toggle"
            tabIndex={open ? 0 : -1}
            onClick={() => {
              museum.replayIntro();
              museum.enter({ mode: "intro" });
              router.push("/");
            }}
          >
            Replay intro <span aria-hidden="true">↺</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
