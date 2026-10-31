import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArtworkExperience } from "@/components/ArtworkExperience";
import { artworks, getArtwork } from "@/data/artworks";

export function generateStaticParams() {
  return artworks.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = getArtwork((await params).slug);
  return a ? { title: a.title, description: a.label } : {};
}

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const artwork = getArtwork((await params).slug);
  if (!artwork) notFound();
  return <ArtworkExperience artwork={artwork} />;
}
