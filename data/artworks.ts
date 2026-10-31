import type { Artwork } from "./types";

/**
 * The Last Witness — the museum's proof of concept.
 *
 * The camera journey follows the five shots of the production specification:
 * Texture, Presence, Evidence, Identity, Absence. Keyframe coordinates are fractions
 * of the master image, so they survive re-rendering the master at another size —
 * but they are composed for this master. When the approved master replaces the
 * placeholder, re-frame the keyframes on its actual composition.
 */
const theLastWitness: Artwork = {
  id: "the-last-witness",
  slug: "the-last-witness",
  title: "The Last Witness",
  creator: "VESTIGE original commission",
  classification: "original-conceptual-artwork",
  date: "2026",
  medium: "Digital fine-art composition",
  dimensions: null,
  origin: null,
  provenance: "Created for VESTIGE. Not a historical artifact.",
  exhibitionId: "what-remains",
  chapterId: "the-mark",
  galleryIds: ["gallery-01"],
  label: "An original work exploring memory, identity, and the traces we leave behind.",
  alt:
    "A weathered, anonymous stone bust stands alone on a pedestal in a vast dark chamber. " +
    "One warm light falls from the upper left, lighting one side of the face while the other " +
    "side disappears into shadow. Fine cracks and chisel marks cover the stone, and the " +
    "pedestal is scuffed where it has been handled and moved.",
  emotionalTone: "Solitude, memory, permanence",
  storyTheme: "What survives when the world that knew us disappears",
  claims: [
    {
      kind: "creative-fiction",
      text:
        "The bust represents no real person. It was imagined for VESTIGE to ask a single " +
        "question: what can remain of a person when the world that knew them has disappeared?",
    },
    {
      kind: "interpretation",
      text:
        "The figure is lit from one side only. Half of the face is held by the light, half is " +
        "surrendered to the dark — a likeness that is still present and already partly lost.",
    },
    {
      kind: "interpretation",
      text:
        "The marks on the pedestal suggest that someone has handled, moved, and preserved this " +
        "object. Whoever the figure was, someone after them decided it was worth keeping.",
    },
  ],
  sources: [],
  rights: "© VESTIGE. Original work; all rights reserved.",
  isPlaceholderMaster: true,
  media: {
    master: { src: "/artworks/the-last-witness/master.jpg", width: 4096, height: 2304 },
    mobile: { src: "/artworks/the-last-witness/mobile.jpg", width: 2048, height: 1152 },
    // Must match DETAIL in tools/render-master.mjs.
    detail: {
      src: "/artworks/the-last-witness/detail.jpg",
      width: 3300,
      height: 3300,
      region: { x: 1750, y: 480, width: 1100, height: 1100 },
    },
  },
  sequence: {
    artworkId: "the-last-witness",
    method: "deterministic",
    scrollLength: 7,
    shots: [
      {
        id: "texture",
        title: "The trace",
        camera: "Slow lateral movement, extremely close to the surface",
        discovery: "Stone, close enough to feel geological. No face is visible yet.",
        start: 0,
        end: 0.16,
      },
      {
        id: "presence",
        title: "The presence",
        camera: "Diagonal approach",
        discovery: "The outline of a human face emerges from the darkness.",
        start: 0.16,
        end: 0.36,
      },
      {
        id: "evidence",
        title: "The evidence",
        camera: "Controlled horizontal pan",
        discovery: "The eye, the cheek, the chisel marks. Craft and deterioration, side by side.",
        start: 0.36,
        end: 0.58,
      },
      {
        id: "identity",
        title: "The connection",
        camera: "Gradual pullback",
        discovery: "The whole sculpture, and the scuffed pedestal that has carried it.",
        start: 0.58,
        end: 0.8,
      },
      {
        id: "absence",
        title: "The afterimage",
        camera: "Wide retreat and hold",
        discovery: "The chamber around it. Its isolation is part of what it means.",
        start: 0.8,
        end: 1,
      },
    ],
    keyframes: [
      // Texture: the lit shoulder, close enough to read the grain and the crack.
      { at: 0, x: 0.505, y: 0.585, zoom: 8 },
      { at: 0.14, x: 0.53, y: 0.58, zoom: 7.5 },
      // Presence: from the dark crown, a diagonal approach as the face's outline emerges.
      { at: 0.2, x: 0.6, y: 0.27, zoom: 6 },
      { at: 0.34, x: 0.566, y: 0.36, zoom: 3.8 },
      // Evidence: across the blank eye, the cracked cheek, the broken nose.
      { at: 0.42, x: 0.536, y: 0.36, zoom: 6 },
      { at: 0.56, x: 0.565, y: 0.4, zoom: 6 },
      // Identity: the whole sculpture on its scuffed pedestal.
      { at: 0.78, x: 0.562, y: 0.56, zoom: 1.75 },
      // Absence: the chamber around it, held.
      { at: 0.94, x: 0.5, y: 0.5, zoom: 1 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  relatedIds: [],
};

export const artworks: Artwork[] = [theLastWitness];

export function getArtwork(slug: string): Artwork | undefined {
  return artworks.find((a) => a.slug === slug);
}
