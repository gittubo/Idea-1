"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Artwork } from "@/data/types";
import { poseAt, representativePose, shotAt } from "@/engine/camera-controller";
import { useScrollProgress, useViewport } from "@/engine/scroll-controller";
import { useMuseum } from "@/engine/experience-controller";
import { ambientSound } from "@/engine/media-controller";
import { FramedImage } from "./FramedImage";

/**
 * The artwork film. Scroll position drives the camera through the artwork's shots:
 * forward explores, stopping holds the frame, backward retraces. The artwork stays still.
 *
 * With reduced motion, the same shots are presented as a sequence of still framings.
 */
export function ScrollFilm({ artwork, ending, id }: { artwork: Artwork; ending?: ReactNode; id?: string }) {
  const museum = useMuseum();
  if (museum.reducedMotion) return <StillSequence artwork={artwork} ending={ending} id={id} />;
  return <MovingFilm artwork={artwork} ending={ending} id={id} />;
}

function MovingFilm({ artwork, ending, id }: { artwork: Artwork; ending?: ReactNode; id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);
  const viewport = useViewport();
  const { keyframes, shots, scrollLength } = artwork.sequence;
  const pose = poseAt(keyframes, progress);
  const shot = shotAt(shots, progress);
  const shotIndex = shot ? shots.indexOf(shot) : 0;
  const ended = progress > 0.985;

  // The room quietens while the visitor is inside a work.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => ambientSound.focus(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => {
      io.disconnect();
      ambientSound.focus(false);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="scroll-film"
      style={{ height: `${(scrollLength + 1) * 100}vh` }}
      aria-label={`${artwork.title} — camera journey`}
      data-progress={progress.toFixed(4)}
    >
      <div className="scroll-film__stage">
        <div className="scroll-film__frame" role="img" aria-label={artwork.alt}>
          <FramedImage artwork={artwork} pose={pose} viewport={viewport} priority />
        </div>
        <div className="scroll-film__veil" aria-hidden="true" />

        <div className="scroll-film__hint" data-visible={progress < 0.015} aria-hidden="true">
          <span>Scroll to look closer</span>
          <span className="scroll-film__hint-line" />
        </div>

        {/* A whisper of where the camera is, never an explanation. */}
        <div className="scroll-film__shot" aria-live="polite">
          {shot && (
            <span key={shot.id}>
              <span className="scroll-film__shot-num">{String(shotIndex + 1).padStart(2, "0")}</span> {shot.title}
            </span>
          )}
        </div>

        <div className="scroll-film__progress" aria-hidden="true">
          {shots.map((s) => (
            <span key={s.id} style={{ flexGrow: s.end - s.start }}>
              <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, (progress - s.start) / (s.end - s.start)))})` }} />
            </span>
          ))}
        </div>

        {ending && (
          <div className="scroll-film__ending" data-visible={ended} inert={!ended}>
            {ending}
          </div>
        )}
      </div>
    </section>
  );
}

function StillSequence({ artwork, ending, id }: { artwork: Artwork; ending?: ReactNode; id?: string }) {
  const { keyframes, shots } = artwork.sequence;
  return (
    <section id={id} className="still-sequence" aria-label={`${artwork.title} — the camera journey as still framings`}>
      <ol>
        {shots.map((shot, i) => (
          <li key={shot.id}>
            <Still artwork={artwork} pose={representativePose(keyframes, shot)} />
            <p>
              <span className="scroll-film__shot-num">{String(i + 1).padStart(2, "0")}</span> <strong className="serif">{shot.title}</strong>
              <br />
              {shot.discovery}
            </p>
          </li>
        ))}
      </ol>
      <p className="sr-only">{artwork.alt}</p>
      {ending && <div className="still-sequence__ending">{ending}</div>}
    </section>
  );
}

function Still({ artwork, pose }: { artwork: Artwork; pose: ReturnType<typeof poseAt> }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 960, height: 540 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="still-sequence__frame" aria-hidden="true">
      <FramedImage artwork={artwork} pose={pose} viewport={size} />
    </div>
  );
}
