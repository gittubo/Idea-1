import type { Artwork, ClaimKind } from "@/data/types";
import { getExhibition } from "@/data/exhibitions";

const claimLabel: Record<ClaimKind, string> = {
  "historical-fact": "What the evidence establishes",
  interpretation: "Interpretation",
  "creative-fiction": "Creative premise",
};

const classificationLabel: Record<Artwork["classification"], string> = {
  "original-conceptual-artwork": "Original conceptual artwork",
  "historical-object": "Historical object",
  painting: "Painting",
  sculpture: "Sculpture",
  photograph: "Photograph",
};

/** The record of a work: who, when, what, and — kept apart — what is known, read, and imagined. */
export function Interpretation({ artwork, headingId }: { artwork: Artwork; headingId?: string }) {
  const exhibition = getExhibition(artwork.exhibitionId);
  const chapter = exhibition?.chapters.find((c) => c.id === artwork.chapterId);
  const isOriginal = artwork.classification === "original-conceptual-artwork";

  return (
    <article className="interpretation">
      <p className="eyebrow">{isOriginal ? "Original VESTIGE work" : classificationLabel[artwork.classification]}</p>
      <h2 id={headingId} className="interpretation__title">{artwork.title}</h2>
      <p className="interpretation__creator">{artwork.creator}</p>

      {artwork.isPlaceholderMaster && (
        <p className="placeholder-note">
          Shown with a placeholder study. The approved master artwork is still in production.
        </p>
      )}

      <dl className="interpretation__facts">
        <dt>Date</dt><dd>{artwork.date}</dd>
        <dt>Medium</dt><dd>{artwork.medium}</dd>
        {artwork.dimensions && (<><dt>Dimensions</dt><dd>{artwork.dimensions}</dd></>)}
        {artwork.origin && (<><dt>Origin</dt><dd>{artwork.origin}</dd></>)}
        <dt>Classification</dt><dd>{classificationLabel[artwork.classification]}</dd>
        <dt>Provenance</dt><dd>{artwork.provenance}</dd>
        {exhibition && chapter && (
          <><dt>Exhibition</dt><dd>{exhibition.title} · Chapter {chapter.numeral}, {chapter.title}</dd></>
        )}
      </dl>

      <section className="interpretation__claims" aria-label="Context and interpretation">
        {artwork.claims.map((claim, i) => (
          <div key={i} className="interpretation__claim" data-kind={claim.kind}>
            <h3 className="eyebrow">{claimLabel[claim.kind]}</h3>
            <p>{claim.text}</p>
          </div>
        ))}
      </section>

      <section aria-label="The camera journey">
        <h3 className="eyebrow">The camera journey</h3>
        <ol className="interpretation__shots">
          {artwork.sequence.shots.map((s) => (
            <li key={s.id}><strong className="serif">{s.title}.</strong> {s.discovery}</li>
          ))}
        </ol>
      </section>

      <section aria-label="Sources and credits" className="interpretation__credits">
        <h3 className="eyebrow">Sources and credits</h3>
        {artwork.sources.length > 0 ? (
          <ul>{artwork.sources.map((s) => <li key={s}>{s}</li>)}</ul>
        ) : (
          <p>{isOriginal ? "An original creation; it has no historical sources." : "Sources pending verification."}</p>
        )}
        <p>{artwork.rights}</p>
      </section>
    </article>
  );
}
