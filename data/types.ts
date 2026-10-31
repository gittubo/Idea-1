/**
 * VESTIGE content model.
 *
 * Four content types, as set out in the production blueprint: Artwork, Gallery,
 * Exhibition and ArtworkSequence. Records live in `data/` as typed modules for
 * the first release; the shapes are the contract a headless CMS will fill later.
 */

export type Classification =
  | "original-conceptual-artwork"
  | "historical-object"
  | "painting"
  | "sculpture"
  | "photograph";

/**
 * Every statement about a work is one of three kinds, and the museum keeps them apart:
 * what evidence establishes, what the work may suggest, and what was deliberately imagined.
 */
export type ClaimKind = "historical-fact" | "interpretation" | "creative-fiction";

export interface Claim {
  kind: ClaimKind;
  text: string;
}

/** One framing of the camera over the master image. */
export interface CameraKeyframe {
  /** Normalised progress through the film, 0–1. */
  at: number;
  /** Centre of view, as a fraction of the master image's width (0 = left edge). */
  x: number;
  /** Centre of view, as a fraction of the master image's height (0 = top edge). */
  y: number;
  /** 1 = the master image just covers the viewport; 2 = twice as close. */
  zoom: number;
}

export interface Shot {
  id: string;
  title: string;
  /** What the camera does. */
  camera: string;
  /** What the visitor discovers. Shown in the reduced-motion and accessible views. */
  discovery: string;
  /** Progress range this shot occupies, 0–1. */
  start: number;
  end: number;
}

/** The camera journey through one artwork. */
export interface ArtworkSequence {
  artworkId: string;
  /** "deterministic" moves a camera over the master image; "video" scrubs a rendered film. */
  method: "deterministic" | "video";
  shots: Shot[];
  keyframes: CameraKeyframe[];
  /** Scroll distance the film occupies, in viewport heights. */
  scrollLength: number;
}

export interface MediaAsset {
  src: string;
  width: number;
  height: number;
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  creator: string;
  classification: Classification;
  /** Creation date or estimated period. */
  date: string;
  medium: string;
  dimensions: string | null;
  origin: string | null;
  provenance: string;
  exhibitionId: string;
  chapterId: string;
  galleryIds: string[];
  /** One-sentence label shown beside the work in the gallery. */
  label: string;
  /** Description of the image for people who cannot see it. */
  alt: string;
  emotionalTone: string;
  storyTheme: string;
  claims: Claim[];
  sources: string[];
  rights: string;
  /** True while the record shows a stand-in image rather than the approved master. */
  isPlaceholderMaster: boolean;
  media: {
    master: MediaAsset;
    mobile: MediaAsset;
    /**
     * A higher-density render of one region of the master, layered over it so the
     * close-up shots stay sharp. `region` is in master-image pixels.
     */
    detail?: MediaAsset & { region: { x: number; y: number; width: number; height: number } };
  };
  sequence: ArtworkSequence;
  relatedIds: string[];
}

export interface Chapter {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
  description: string;
  artworkIds: string[];
  /** "open" chapters can be visited; "in-preparation" ones are announced but not yet built. */
  status: "open" | "in-preparation";
}

export interface Exhibition {
  id: string;
  slug: string;
  number: string;
  title: string;
  question: string;
  description: string;
  chapters: Chapter[];
}

export interface Doorway {
  id: string;
  wall: "left" | "right";
  label: string;
  chapterId: string;
}

export interface Gallery {
  id: string;
  slug: string;
  name: string;
  theme: string;
  /** The artwork hung on the room's focal wall. */
  focalArtworkId: string;
  doorways: Doorway[];
}
