"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Artwork, Exhibition } from "@/data/types";

/**
 * Screen 07: the conventional, accessible layer. Every work can be found and opened
 * here without entering the virtual museum.
 */
export function CollectionArchive({ artworks, exhibitions }: { artworks: Artwork[]; exhibitions: Exhibition[] }) {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("all");
  const [kind, setKind] = useState("all");
  const chapters = exhibitions.flatMap((e) => e.chapters.map((c) => ({ ...c, exhibition: e.title })));

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return artworks.filter((a) => {
      if (chapter !== "all" && a.chapterId !== chapter) return false;
      if (kind === "original" && a.classification !== "original-conceptual-artwork") return false;
      if (kind === "historical" && a.classification === "original-conceptual-artwork") return false;
      if (!q) return true;
      return [a.title, a.creator, a.label, a.storyTheme, a.emotionalTone].some((f) => f.toLowerCase().includes(q));
    });
  }, [artworks, query, chapter, kind]);

  return (
    <div className="collection">
      <header className="collection__header">
        <p className="eyebrow">The collection</p>
        <h1 className="serif">Every work, in one place</h1>
        <p>Search, browse, and return to any piece without entering the virtual museum.</p>
      </header>

      <form className="collection__filters" role="search" onSubmit={(e) => e.preventDefault()}>
        <label>
          <span className="eyebrow">Search</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, theme, feeling…" />
        </label>
        <label>
          <span className="eyebrow">Chapter</span>
          <select value={chapter} onChange={(e) => setChapter(e.target.value)}>
            <option value="all">All chapters</option>
            {chapters.map((c) => <option key={c.id} value={c.id}>{c.numeral} · {c.title}</option>)}
          </select>
        </label>
        <label>
          <span className="eyebrow">Kind</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="all">All works</option>
            <option value="original">Original creations</option>
            <option value="historical">Historical works</option>
          </select>
        </label>
      </form>

      <p className="collection__count" aria-live="polite">
        {results.length} {results.length === 1 ? "work" : "works"}
      </p>

      <ul className="collection__grid">
        {results.map((a) => {
          const c = chapters.find((ch) => ch.id === a.chapterId);
          return (
            <li key={a.id} className="collection__card">
              <Link href={`/artwork/${a.slug}?from=/collection`}>
                <div className="collection__thumb"><img src={a.media.mobile.src} alt={a.alt} loading="lazy" /></div>
                <p className="eyebrow">{c ? `${c.exhibition} · ${c.numeral} ${c.title}` : ""}</p>
                <h2 className="serif">{a.title}</h2>
                <p>{a.creator} · {a.date}</p>
              </Link>
              <Link className="quiet" href={`/artwork/${a.slug}?from=/collection#record`}>Read the record</Link>
            </li>
          );
        })}
      </ul>
      {results.length === 0 && <p>No works match. Try another word, or clear the filters.</p>}
    </div>
  );
}
