import Link from "next/link";

export default function NotFound() {
  return (
    <article className="about">
      <p className="eyebrow">Not found</p>
      <h1 className="serif">Only a trace remains here.</h1>
      <p>This room does not exist, or has not opened yet.</p>
      <p><Link className="threshold-link" href="/"><span className="mark" aria-hidden="true" /> Return to the entrance hall</Link></p>
    </article>
  );
}
