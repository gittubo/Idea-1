import type { CameraKeyframe, Shot } from "@/data/types";

export interface CameraPose {
  x: number;
  y: number;
  zoom: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface ImageSize {
  width: number;
  height: number;
}

/** CSS transform for the master image: translate(tx, ty) scale(scale), origin top-left. */
export interface ImageTransform {
  tx: number;
  ty: number;
  scale: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Ease in and out, so the camera settles on each framing before it moves on. */
export const easeInOut = (t: number) => t * t * (3 - 2 * t);

/**
 * Camera pose at a given progress. Keyframes must be sorted by `at`.
 * Position eases linearly between framings; zoom interpolates geometrically so a
 * move from 1× to 4× feels as even as one from 2× to 8×.
 */
export function poseAt(keyframes: CameraKeyframe[], progress: number): CameraPose {
  if (keyframes.length === 0) return { x: 0.5, y: 0.5, zoom: 1 };
  const p = clamp(progress, 0, 1);
  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];
  if (p <= first.at) return { x: first.x, y: first.y, zoom: first.zoom };
  if (p >= last.at) return { x: last.x, y: last.y, zoom: last.zoom };

  let i = 0;
  while (i < keyframes.length - 2 && p > keyframes[i + 1].at) i++;
  const a = keyframes[i];
  const b = keyframes[i + 1];
  const span = b.at - a.at;
  const t = easeInOut(span > 0 ? (p - a.at) / span : 1);
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t),
  };
}

/**
 * Where to draw the master image so the pose's centre sits mid-viewport.
 * At zoom 1 the image just covers the viewport. The image is kept covering the
 * viewport at all times, so the visitor never sees past the edge of the artwork.
 */
export function imageTransform(pose: CameraPose, viewport: Viewport, image: ImageSize): ImageTransform {
  const cover = Math.max(viewport.width / image.width, viewport.height / image.height);
  const scale = cover * Math.max(1, pose.zoom);
  const drawnW = image.width * scale;
  const drawnH = image.height * scale;
  const tx = clamp(viewport.width / 2 - pose.x * drawnW, viewport.width - drawnW, 0);
  const ty = clamp(viewport.height / 2 - pose.y * drawnH, viewport.height - drawnH, 0);
  return { tx, ty, scale };
}

/** The shot that contains the given progress. */
export function shotAt(shots: Shot[], progress: number): Shot | undefined {
  const p = clamp(progress, 0, 1);
  return shots.find((s) => p >= s.start && p < s.end) ?? shots[shots.length - 1];
}

/** A pose that frames a shot as a single still, for the reduced-motion view. */
export function representativePose(keyframes: CameraKeyframe[], shot: Shot): CameraPose {
  return poseAt(keyframes, shot.end >= 1 ? 1 : (shot.start + shot.end) / 2);
}
