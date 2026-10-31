"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Artwork, Gallery } from "@/data/types";
import { whatRemains } from "@/data/exhibitions";
import { read, useMuseum, write } from "@/engine/experience-controller";
import { Room } from "./Room";

const REST = 900;
const AT_ARTWORK = 3050;

/**
 * Screen 03: free exploration. Guided point-to-point movement: the visitor chooses a
 * destination and the camera travels there, keeping framing deliberate and controls simple.
 */
export function GalleryRoom({ gallery, artwork }: { gallery: Gallery; artwork: Artwork }) {
  const router = useRouter();
  const museum = useMuseum();
  const { enter } = museum;
  const [advance, setAdvance] = useState(0);
  const [approaching, setApproaching] = useState(false);
  const artworkHref = `/artwork/${artwork.slug}?from=${encodeURIComponent("/explore")}`;

  useEffect(() => {
    enter({ mode: "exploration", currentGallery: gallery.id, currentArtwork: null });
    // Returning from the artwork, the camera retreats from it; arriving fresh, it walks in.
    const returning = read("vestige:returning-from") === artwork.id;
    write("vestige:returning-from", null);
    setAdvance(returning ? AT_ARTWORK : 0);
    const t = window.setTimeout(() => setAdvance(REST), 60);
    return () => window.clearTimeout(t);
  }, [enter, gallery.id, artwork.id]);

  const approach = (e: React.MouseEvent) => {
    if (museum.reducedMotion || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    setApproaching(true);
    setAdvance(AT_ARTWORK);
    window.setTimeout(() => router.push(artworkHref), 1900);
  };

  const chapterOf = (id: string) => whatRemains.chapters.find((c) => c.id === id);

  return (
    <section className="gallery" data-approaching={approaching} aria-labelledby="gallery-title">
      <div className="gallery__world">
        <Room
          variant="gallery"
          advance={advance}
          durationMs={approaching ? 1900 : 2000}
          depth={3600}
          backWall={
            <Link href={artworkHref} onClick={approach} className="gallery__frame" aria-label={`Approach ${artwork.title}`} tabIndex={-1}>
              <img src={artwork.media.mobile.src} alt="" />
            </Link>
          }
          leftWall={gallery.doorways.filter((d) => d.wall === "left").map((d) => <div key={d.id} className="gallery__doorway" aria-hidden="true"><span>{d.label}</span></div>)}
          rightWall={gallery.doorways.filter((d) => d.wall === "right").map((d) => <div key={d.id} className="gallery__doorway" aria-hidden="true"><span>{d.label}</span></div>)}
        />
      </div>

      <div className="gallery__overlay">
        <header className="gallery__header">
          <p className="eyebrow">{whatRemains.title} · Chapter I</p>
          <h1 id="gallery-title" className="serif">{gallery.name}</h1>
          <p className="gallery__theme">{gallery.theme}</p>
        </header>

        <nav className="gallery__destinations" aria-label="Destinations in this gallery">
          <Link href={artworkHref} onClick={approach} className="threshold-link">
            <span className="mark" aria-hidden="true" /> {artwork.title}
          </Link>
          {gallery.doorways.map((d) => (
            <span key={d.id} className="quiet" aria-disabled="true" title="This chapter is in preparation">
              {d.label} — {chapterOf(d.chapterId)?.status === "open" ? "open" : "in preparation"}
            </span>
          ))}
          <Link href="/" className="quiet">Entrance hall</Link>
          <Link href={`/journey/${whatRemains.slug}`} className="quiet">Follow the guided journey</Link>
        </nav>

        <p className="gallery__label" aria-hidden={approaching}>
          <span className="serif">{artwork.title}</span> — {artwork.label}
        </p>
      </div>
    </section>
  );
}
