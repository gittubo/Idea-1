"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Exhibition } from "@/data/types";
import { getArtwork } from "@/data/artworks";
import { useMuseum } from "@/engine/experience-controller";
import { ScrollFilm } from "./ScrollFilm";

/** Screen 04: the guided exhibition — one directed route through the chapters. */
export function JourneyView({ exhibition }: { exhibition: Exhibition }) {
  const { enter } = useMuseum();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    enter({ mode: "guided-journey", currentExhibition: exhibition.id, currentArtwork: null });
  }, [enter, exhibition.id]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    exhibition.chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [exhibition]);

  const here = `/journey/${exhibition.slug}`;

  return (
    <div className="journey">
      <nav className="journey__progress" aria-label="Exhibition chapters">
        <ol>
          {exhibition.chapters.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} aria-current={active === c.id ? "step" : undefined} title={`${c.numeral} · ${c.title}`}>
                <span className="sr-only">Chapter </span>{c.numeral}
                <span className="journey__progress-title">{c.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <header className="journey__opening">
        <p className="eyebrow">Exhibition {exhibition.number}</p>
        <h1 className="journey__title serif">{exhibition.title}</h1>
        <p className="journey__question serif">{exhibition.question}</p>
        <p className="journey__description">{exhibition.description}</p>
        <span className="journey__cue" aria-hidden="true" />
      </header>

      {exhibition.chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className="chapter" data-status={chapter.status} aria-labelledby={`${chapter.id}-title`}>
          <header className="chapter__header">
            <p className="eyebrow">Chapter {chapter.numeral}</p>
            <h2 id={`${chapter.id}-title`} className="chapter__title">{chapter.title}</h2>
            <p className="chapter__subtitle serif">{chapter.subtitle}</p>
            <p className="chapter__description">{chapter.description}</p>
            {chapter.status === "in-preparation" && <p className="placeholder-note">This chapter is in preparation.</p>}
          </header>

          {chapter.artworkIds.map((id) => {
            const artwork = getArtwork(id);
            if (!artwork) return null;
            const from = encodeURIComponent(`${here}#${chapter.id}`);
            return (
              <ScrollFilm
                key={id}
                artwork={artwork}
                ending={
                  <div className="film-ending">
                    <p className="film-ending__title serif">{artwork.title}</p>
                    <p className="film-ending__label">{artwork.label}</p>
                    <div className="film-ending__actions">
                      <Link className="threshold-link" href={`/artwork/${artwork.slug}?from=${from}#record`}>
                        <span className="mark" aria-hidden="true" /> About this work
                      </Link>
                      <a className="quiet" href={`#${exhibition.chapters[exhibition.chapters.indexOf(chapter) + 1]?.id ?? "closing"}`}>
                        Continue the journey ↓
                      </a>
                    </div>
                  </div>
                }
              />
            );
          })}
        </section>
      ))}

      <footer id="closing" className="journey__closing">
        <p className="serif journey__question">{exhibition.question}</p>
        <p>The exhibition grows chapter by chapter. Until the next room opens, the museum is yours to wander.</p>
        <div className="film-ending__actions">
          <Link className="threshold-link" href="/explore"><span className="mark" aria-hidden="true" /> Explore the museum</Link>
          <Link className="quiet" href="/collection">Browse the collection</Link>
        </div>
      </footer>
    </div>
  );
}
