/** The VESTIGE mark: a fine circular impression interrupted by a single line — a trace left behind. */
export function VestigeSymbol({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="100 13.1" transform="rotate(-62 32 32)" />
      <line x1="32" y1="8" x2="32" y2="56" stroke="var(--amber)" strokeWidth="1.5" />
    </svg>
  );
}
