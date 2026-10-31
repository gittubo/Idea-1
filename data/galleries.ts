import type { Gallery } from "./types";

export const galleries: Gallery[] = [
  {
    id: "gallery-01",
    slug: "the-mark",
    name: "Gallery I — The Mark",
    theme: "Objects, origins, and the evidence of existence",
    focalArtworkId: "the-last-witness",
    doorways: [
      { id: "to-feeling", wall: "left", label: "II · The Feeling", chapterId: "the-feeling" },
      { id: "to-fall", wall: "right", label: "III · The Fall", chapterId: "the-fall" },
    ],
  },
];

export function getGallery(id: string): Gallery | undefined {
  return galleries.find((g) => g.id === id);
}
