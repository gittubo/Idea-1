"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMuseum } from "@/engine/experience-controller";
import { artworks } from "@/data/artworks";
import { whatRemains } from "@/data/exhibitions";
import { Room } from "./Room";
import { VestigeSymbol } from "./Symbol";

const INTRO_MS = 7600;

/** Screens 01 and 02: the cinematic entrance, then the grand entrance hall. */
export function Entrance() {
  const museum = useMuseum();
  const { ready, introSeen, enter } = museum;
  const phase = !ready ? null : introSeen ? "hall" : "intro";

  useEffect(() => {
    if (phase) enter({ mode: phase === "intro" ? "intro" : "entrance", currentArtwork: null });
  }, [phase, enter]);

  if (!phase) return <div className="intro" aria-hidden="true" />;
  return phase === "intro" ? <Intro /> : <Hall />;
}

function Intro() {
  const museum = useMuseum();
  const [complete, setComplete] = useState(museum.reducedMotion);
  const [crossing, setCrossing] = useState(false);
  const enterButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (complete) return;
    const t = window.setTimeout(() => setComplete(true), INTRO_MS);
    return () => window.clearTimeout(t);
  }, [complete]);

  useEffect(() => {
    if (complete) enterButton.current?.focus({ preventScroll: true });
  }, [complete]);

  const cross = () => {
    if (crossing) return;
    if (museum.reducedMotion) return museum.markIntroSeen();
    setCrossing(true);
    window.setTimeout(() => museum.markIntroSeen(), 1300);
  };

  // Once the threshold is revealed, scrolling forward also carries the visitor in.
  useEffect(() => {
    if (!complete) return;
    const onWheel = (e: WheelEvent) => e.deltaY > 0 && cross();
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => touchY - e.touches[0].clientY > 30 && cross();
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  });

  return (
    <section className="intro" data-complete={complete} data-crossing={crossing} aria-labelledby="intro-title">
      <div className="intro__world" aria-hidden="true">
        <Room variant="entrance" advance={crossing ? 2400 : 0} durationMs={1300} depth={2400}
          backWall={
            <div className="doorway">
              <div className="doorway__light" />
              <div className="doorway__leaf doorway__leaf--left" />
              <div className="doorway__leaf doorway__leaf--right" />
            </div>
          }
        />
        <div className="intro__line" />
      </div>

      <div className="intro__controls">
        <button className="quiet" onClick={() => museum.setSound(!museum.soundEnabled)} aria-pressed={museum.soundEnabled}>
          Sound {museum.soundEnabled ? "on" : "off"}
        </button>
        <button className="quiet" onClick={() => museum.markIntroSeen()}>Skip intro</button>
      </div>

      <div className="intro__title">
        <VestigeSymbol size={36} className="intro__symbol" />
        <h1 id="intro-title" className="wordmark">Vestige</h1>
        <p className="eyebrow">A museum of human experience</p>
        <p className="intro__tagline serif">Everything leaves something behind.</p>
        <button ref={enterButton} className="threshold-link intro__enter" onClick={cross} tabIndex={complete ? 0 : -1}>
          <span className="mark" aria-hidden="true" /> Enter the museum
        </button>
      </div>
    </section>
  );
}

function Hall() {
  const museum = useMuseum();
  const [arrived, setArrived] = useState(museum.reducedMotion);
  const focal = artworks[0];

  useEffect(() => {
    const t = window.setTimeout(() => setArrived(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="hall" aria-labelledby="hall-title">
      <div className="hall__world" aria-hidden="true">
        <Room variant="hall" advance={arrived ? 700 : 0} durationMs={2400} depth={3600}
          backWall={
            <div className="hall__arch">
              <img src={focal.media.mobile.src} alt="" />
            </div>
          }
        />
      </div>

      <div className="hall__content">
        <p className="eyebrow">Exhibition {whatRemains.number} · Now open</p>
        <h1 id="hall-title" className="hall__title serif">{whatRemains.title}</h1>
        <p className="hall__question serif">{whatRemains.question}</p>
        <ul className="hall__destinations">
          <li>
            <Link className="threshold-link" href={`/journey/${whatRemains.slug}`}>
              <span className="mark" aria-hidden="true" /> Begin the exhibition
            </Link>
          </li>
          <li><Link className="quiet" href="/explore">Explore the museum</Link></li>
          <li><Link className="quiet" href="/collection">Browse the collection</Link></li>
        </ul>
      </div>
    </section>
  );
}
