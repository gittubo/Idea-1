import type { Metadata } from "next";
import { GalleryRoom } from "@/components/GalleryRoom";
import { galleries } from "@/data/galleries";
import { getArtwork } from "@/data/artworks";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  const gallery = galleries[0];
  const artwork = getArtwork(gallery.focalArtworkId)!;
  return <GalleryRoom gallery={gallery} artwork={artwork} />;
}
