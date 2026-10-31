import { describe, expect, it } from "vitest";
import { imageTransform, poseAt, shotAt } from "@/engine/camera-controller";
import { safeReturnPath } from "@/engine/navigation";
import { artworks } from "@/data/artworks";
import { exhibitions } from "@/data/exhibitions";
import { galleries } from "@/data/galleries";

const kf = [
  { at: 0, x: 0.2, y: 0.2, zoom: 4 },
  { at: 0.5, x: 0.6, y: 0.4, zoom: 1 },
  { at: 1, x: 0.5, y: 0.5, zoom: 1 },
];

describe("poseAt", () => {
  it("holds the first and last framings outside the keyframe range", () => {
    expect(poseAt(kf, -1)).toEqual({ x: 0.2, y: 0.2, zoom: 4 });
    expect(poseAt(kf, 2)).toEqual({ x: 0.5, y: 0.5, zoom: 1 });
  });

  it("lands exactly on each keyframe", () => {
    const p = poseAt(kf, 0.5);
    expect(p.x).toBeCloseTo(0.6);
    expect(p.zoom).toBeCloseTo(1);
  });

  it("is deterministic: the same scroll position always gives the same frame", () => {
    expect(poseAt(kf, 0.3137)).toEqual(poseAt(kf, 0.3137));
  });

  it("retraces: progress moving backward passes through the same poses", () => {
    const forward = [0.1, 0.2, 0.3].map((p) => poseAt(kf, p));
    const backward = [0.3, 0.2, 0.1].map((p) => poseAt(kf, p)).reverse();
    expect(backward).toEqual(forward);
  });

  it("interpolates zoom geometrically (midpoint of 4× → 1× is 2×)", () => {
    expect(poseAt(kf, 0.25).zoom).toBeCloseTo(2);
  });
});

describe("imageTransform", () => {
  const image = { width: 4096, height: 2304 };

  it("covers the viewport at zoom 1 with no gap at any edge", () => {
    for (const viewport of [{ width: 1920, height: 1080 }, { width: 390, height: 844 }]) {
      const t = imageTransform({ x: 0.5, y: 0.5, zoom: 1 }, viewport, image);
      expect(t.tx).toBeLessThanOrEqual(0);
      expect(t.ty).toBeLessThanOrEqual(0);
      expect(t.tx + image.width * t.scale).toBeGreaterThanOrEqual(viewport.width - 1e-6);
      expect(t.ty + image.height * t.scale).toBeGreaterThanOrEqual(viewport.height - 1e-6);
    }
  });

  it("puts the pose centre in the middle of the viewport when not clamped", () => {
    const viewport = { width: 1600, height: 900 };
    const t = imageTransform({ x: 0.5, y: 0.4, zoom: 3 }, viewport, image);
    expect(t.tx + 0.5 * image.width * t.scale).toBeCloseTo(800);
    expect(t.ty + 0.4 * image.height * t.scale).toBeCloseTo(450);
  });

  it("clamps rather than showing past the artwork's edge", () => {
    const viewport = { width: 1600, height: 900 };
    const t = imageTransform({ x: 0, y: 0, zoom: 2 }, viewport, image);
    expect(t.tx).toBe(0);
    expect(t.ty).toBe(0);
  });
});

describe("content records", () => {
  it("every artwork sequence is well formed", () => {
    for (const a of artworks) {
      const { keyframes, shots } = a.sequence;
      expect(keyframes[0].at).toBe(0);
      expect(keyframes[keyframes.length - 1].at).toBe(1);
      for (let i = 1; i < keyframes.length; i++) expect(keyframes[i].at).toBeGreaterThan(keyframes[i - 1].at);
      for (const k of keyframes) {
        expect(k.zoom).toBeGreaterThanOrEqual(1);
        expect(k.x).toBeGreaterThanOrEqual(0);
        expect(k.x).toBeLessThanOrEqual(1);
      }
      expect(shots[0].start).toBe(0);
      expect(shots[shots.length - 1].end).toBe(1);
      for (let i = 1; i < shots.length; i++) expect(shots[i].start).toBe(shots[i - 1].end);
      expect(shotAt(shots, 1)?.id).toBe(shots[shots.length - 1].id);
    }
  });

  it("every reference between records resolves", () => {
    const artworkIds = new Set(artworks.map((a) => a.id));
    const chapterIds = new Set(exhibitions.flatMap((e) => e.chapters.map((c) => c.id)));
    for (const e of exhibitions) for (const c of e.chapters) for (const id of c.artworkIds) expect(artworkIds).toContain(id);
    for (const g of galleries) {
      expect(artworkIds).toContain(g.focalArtworkId);
      for (const d of g.doorways) expect(chapterIds).toContain(d.chapterId);
    }
    for (const a of artworks) {
      expect(chapterIds).toContain(a.chapterId);
      for (const id of a.relatedIds) expect(artworkIds).toContain(id);
    }
  });
});

describe("safeReturnPath", () => {
  it("accepts same-site paths and rejects anything else", () => {
    expect(safeReturnPath("/explore")).toBe("/explore");
    expect(safeReturnPath("/journey/what-remains#the-mark")).toBe("/journey/what-remains#the-mark");
    expect(safeReturnPath("//evil.example")).toBe("/explore");
    expect(safeReturnPath("https://evil.example")).toBe("/explore");
    expect(safeReturnPath("/\\evil.example")).toBe("/explore");
    expect(safeReturnPath(null)).toBe("/explore");
  });
});
