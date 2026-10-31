"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ambientSound } from "./media-controller";

export type MuseumMode =
  | "intro"
  | "entrance"
  | "exploration"
  | "guided-journey"
  | "artwork-film"
  | "interpretation";

export interface MuseumState {
  mode: MuseumMode;
  currentGallery: string | null;
  currentArtwork: string | null;
  currentExhibition: string | null;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

interface MuseumContext extends MuseumState {
  enter: (patch: Partial<Omit<MuseumState, "soundEnabled" | "reducedMotion">>) => void;
  setSound: (on: boolean) => void;
  setReducedMotion: (on: boolean) => void;
  /** False until stored preferences have been read on the client. */
  ready: boolean;
  introSeen: boolean;
  markIntroSeen: () => void;
  replayIntro: () => void;
}

const Ctx = createContext<MuseumContext | null>(null);

export const read = (key: string) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};
export const write = (key: string, value: string | null) => {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the museum still works, it just forgets */
  }
};

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MuseumState>({
    mode: "intro",
    currentGallery: null,
    currentArtwork: null,
    currentExhibition: null,
    soundEnabled: false,
    reducedMotion: false,
  });
  const [introSeen, setIntroSeen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stored = read("vestige:reduced-motion");
    setState((s) => ({ ...s, reducedMotion: stored === null ? mq.matches : stored === "1" }));
    setIntroSeen(read("vestige:intro-seen") === "1");
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = state.reducedMotion ? "reduced" : "full";
  }, [state.reducedMotion]);

  const enter = useCallback<MuseumContext["enter"]>((patch) => setState((s) => ({ ...s, ...patch })), []);

  const setSound = useCallback((on: boolean) => {
    if (on) ambientSound.start();
    else ambientSound.stop();
    setState((s) => ({ ...s, soundEnabled: on }));
  }, []);

  const setReducedMotion = useCallback((on: boolean) => {
    write("vestige:reduced-motion", on ? "1" : "0");
    setState((s) => ({ ...s, reducedMotion: on }));
  }, []);

  const markIntroSeen = useCallback(() => {
    write("vestige:intro-seen", "1");
    setIntroSeen(true);
  }, []);

  const replayIntro = useCallback(() => {
    write("vestige:intro-seen", null);
    setIntroSeen(false);
  }, []);

  const value = useMemo(
    () => ({ ...state, enter, setSound, setReducedMotion, ready, introSeen, markIntroSeen, replayIntro }),
    [state, enter, setSound, setReducedMotion, ready, introSeen, markIntroSeen, replayIntro],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMuseum(): MuseumContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMuseum must be used inside <ExperienceProvider>");
  return ctx;
}
