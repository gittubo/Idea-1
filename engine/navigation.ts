/**
 * Where an artwork's Exit should return the visitor. Only same-site paths are
 * accepted, so a crafted `?from=` link cannot send visitors to another site.
 */
export function safeReturnPath(from: string | null | undefined, fallback = "/explore"): string {
  if (!from) return fallback;
  if (!from.startsWith("/") || from.startsWith("//") || from.includes("\\")) return fallback;
  return from;
}
