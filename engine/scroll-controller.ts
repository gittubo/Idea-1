"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Normalised progress (0–1) of the page's scroll through a tall section.
 *
 *   p = (scrollY − sectionTop) / (sectionHeight − viewportHeight)
 *
 * Scrolling forward advances, stopping holds, scrolling back retraces. The value is
 * smoothed toward the scroll position each frame (like a short scrub), and settles
 * exactly on it, so a held scroll always shows the same frame.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, smoothing = 0.18) {
  const [progress, setProgress] = useState(0);
  const target = useRef(0);
  const current = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      target.current = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
    };

    const tick = () => {
      const diff = target.current - current.current;
      current.current = Math.abs(diff) < 0.0005 ? target.current : current.current + diff * smoothing;
      setProgress(current.current);
      frame = Math.abs(target.current - current.current) > 0 ? requestAnimationFrame(tick) : 0;
    };

    const onScroll = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    measure();
    current.current = target.current;
    setProgress(current.current);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, smoothing]);

  return progress;
}

/** Viewport size, kept current. */
export function useViewport() {
  const [size, setSize] = useState({ width: 1280, height: 720 });
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}
