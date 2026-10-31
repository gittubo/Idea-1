import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JourneyView } from "@/components/JourneyView";
import { exhibitions, getExhibition } from "@/data/exhibitions";

export function generateStaticParams() {
  return exhibitions.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getExhibition((await params).slug);
  return e ? { title: e.title, description: e.question } : {};
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const exhibition = getExhibition((await params).slug);
  if (!exhibition) notFound();
  return <JourneyView exhibition={exhibition} />;
}
