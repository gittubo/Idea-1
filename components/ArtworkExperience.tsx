"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Artwork } from "@/data/types";
import { useMuseum, write } from "@/engine/experience-controller";
import { safeReturnPath } from "@/engine/navigation";
import { ScrollFilm } from "./ScrollFilm";
import { Interpretation } from "./Interpretation";

/**
 * Screens 05 and 06: the immersive film and, on request, its interpretation.
 * Escape closes the panel if it is open; otherwise it returns the visitor to the
 * exact place they came from (`?from=`), falling back to the gallery.
 */
export function ArtworkExperience({ artwork }: { artwork: Artwork }) {
  const router = useRouter();
  const museum = useMuseum();
  const { enter } = museum;
  const [panelOpen, setPanelOpen] = useState(false);
  const [returnTo, setReturnTo] = useState("/explore");
  const [leaving, setLeaving] = useState(false);
  const infoButton = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnTo(safeReturnPath(params.get("from")));
    if (window.location.hash === "#record") setPanelOpen(true);
    enter({ mode: "artwork-film", currentArtwork: artwork.id, currentExhibition: artwork.exhibitionId });
    window.scrollTo(0, 0);
  }, [artwork, enter]);

  useEffect(() => {
    enter({ mode: panelOpen ? "interpretation" : "artwork-film" });
    if (panelOpen) panelRef.current?.focus();
  }, [panelOpen, enter]);

  const exit = useCallback(() => {
    write("vestige:returning-from", artwork.id);
    if (museum.reducedMotion) return router.push(returnTo);
    setLeaving(true); // the camera retreats, then the gallery returns
    window.setTimeout(() => router.push(returnTo), 1500);
  }, [museum.reducedMotion, returnTo, router, artwork.id]);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    infoButton.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (panelOpen) closePanel();
      else exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen, closePanel, exit]);

  const returnLabel = returnTo.startsWith("/journey") ? "Continue the journey" : returnTo.startsWith("/collection") ? "Back to the collection" : "Return to the gallery";

  return (
    <div className="artwork-experience" data-leaving={leaving}>
      <div className="artwork-experience__controls">
        <button className="quiet" onClick={exit}>
          <span aria-hidden="true">←</span> Exit
        </button>
        <button ref={infoButton} className="quiet" onClick={() => setPanelOpen(true)} aria-expanded={panelOpen} aria-controls="interpretation-panel">
          About this work
        </button>
      </div>

      <h1 className="sr-only">{artwork.title}</h1>

      <ScrollFilm
        artwork={artwork}
        ending={
          <div className="film-ending">
            <p className="eyebrow">{artwork.isPlaceholderMaster ? "Original work · placeholder study" : "Original work"}</p>
            <p className="film-ending__title serif">{artwork.title}</p>
            <p className="film-ending__label">{artwork.label}</p>
            <div className="film-ending__actions">
              <button className="threshold-link" onClick={() => setPanelOpen(true)}>
                <span className="mark" aria-hidden="true" /> About this work
              </button>
              <button className="threshold-link" onClick={exit}>{returnLabel}</button>
              <Link className="quiet" href="/collection">Explore the collection</Link>
            </div>
          </div>
        }
      />

      <div className="interpretation-panel" data-open={panelOpen} inert={!panelOpen}>
        <div className="interpretation-panel__scrim" onClick={closePanel} aria-hidden="true" />
        <div
          id="interpretation-panel"
          ref={panelRef}
          className="interpretation-panel__sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="interpretation-title"
          tabIndex={-1}
        >
          <button className="quiet interpretation-panel__close" onClick={closePanel}>Close</button>
          <Interpretation artwork={artwork} headingId="interpretation-title" />
        </div>
      </div>
    </div>
  );
}
