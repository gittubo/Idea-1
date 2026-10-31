import type { Metadata } from "next";
import { CollectionArchive } from "@/components/CollectionArchive";
import { artworks } from "@/data/artworks";
import { exhibitions } from "@/data/exhibitions";

export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage() {
  return <CollectionArchive artworks={artworks} exhibitions={exhibitions} />;
}
