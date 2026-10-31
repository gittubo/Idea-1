import type { Exhibition } from "./types";

export const whatRemains: Exhibition = {
  id: "what-remains",
  slug: "what-remains",
  number: "001",
  title: "What Remains",
  question: "What remains when the moment is gone?",
  description:
    "The inaugural exhibition explores the traces people leave behind: in objects, in " +
    "relationships, in civilizations, and in the memories of others.",
  chapters: [
    {
      id: "the-mark",
      numeral: "I",
      title: "The Mark",
      subtitle: "Objects, origins, and the evidence of existence.",
      description:
        "Surfaces that carry evidence of age, use, damage, or preservation. The camera reveals " +
        "texture, wear, and craftsmanship before it reveals the whole object.",
      artworkIds: ["the-last-witness"],
      status: "open",
    },
    {
      id: "the-feeling",
      numeral: "II",
      title: "The Feeling",
      subtitle: "Love, grief, longing, and human connection.",
      description:
        "Gestures, expressions, and the distances between figures — the details that change how " +
        "we read a scene.",
      artworkIds: [],
      status: "in-preparation",
    },
    {
      id: "the-fall",
      numeral: "III",
      title: "The Fall",
      subtitle: "Power, collapse, and the impermanence of achievement.",
      description:
        "Monumental architecture begins to feel less stable, as the exhibition asks what survives " +
        "the end of an era.",
      artworkIds: [],
      status: "in-preparation",
    },
    {
      id: "the-echo",
      numeral: "IV",
      title: "The Echo",
      subtitle: "Memory, inheritance, and what we pass on.",
      description:
        "A brighter, quieter room. An original work offers a contemporary answer to the " +
        "exhibition's central question.",
      artworkIds: [],
      status: "in-preparation",
    },
  ],
};

export const exhibitions: Exhibition[] = [whatRemains];

export function getExhibition(slug: string): Exhibition | undefined {
  return exhibitions.find((e) => e.slug === slug);
}
