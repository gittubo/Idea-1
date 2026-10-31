import type { Metadata } from "next";
import Link from "next/link";
import { VestigeSymbol } from "@/components/Symbol";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="about">
      <VestigeSymbol size={44} />
      <p className="eyebrow">About the museum</p>
      <h1 className="serif">Everything leaves something behind.</h1>
      <p className="about__lede serif">
        A vestige is a trace of something that existed before: a remnant, an impression, evidence that something once happened.
      </p>

      <section>
        <h2 className="eyebrow">Purpose</h2>
        <p>To make humanity&rsquo;s stories discoverable through immersive encounters with art, objects, and ideas.</p>
      </section>
      <section>
        <h2 className="eyebrow">Philosophy</h2>
        <p>
          Show before explaining. Visitors observe, connect details, and form their own interpretations before context is
          offered. In each work the camera moves and the artwork stays still: nothing in a piece comes alive, but the
          visitor&rsquo;s understanding of it does.
        </p>
      </section>
      <section>
        <h2 className="eyebrow">How we write about works</h2>
        <p>Every statement in a record is one of three kinds, and we keep them apart:</p>
        <dl className="about__claims">
          <dt>What the evidence establishes</dt><dd>Historical truth about a real object.</dd>
          <dt>Interpretation</dt><dd>What a work&rsquo;s composition, symbolism, and context may suggest.</dd>
          <dt>Creative premise</dt><dd>A narrative deliberately imagined for an original piece, labelled as such.</dd>
        </dl>
      </section>
      <section>
        <h2 className="eyebrow">Visiting</h2>
        <p>
          The immersive museum is an enhancement, never a barrier. Every work can be reached directly from the{" "}
          <Link href="/collection">collection</Link>. Sound never starts without your consent, and reduced motion is
          available from the Museum menu.
        </p>
      </section>
      <section>
        <h2 className="eyebrow">Credits</h2>
        <p>Concept, curation, and production: VESTIGE. Website: TuboWebDev.</p>
      </section>
    </article>
  );
}
