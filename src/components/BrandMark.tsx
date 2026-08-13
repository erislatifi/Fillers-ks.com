/**
 * Placeholder recreation of the Fillers Kosovo crescent/profile mark, built from
 * the client-supplied logo colors. This is an approximation for layout purposes —
 * swap for the client's original vector file (SVG/AI) once provided.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden>
      <defs>
        <linearGradient id="fk-mark-grad" x1="10%" y1="0%" x2="70%" y2="100%">
          <stop offset="0%" stopColor="var(--brand-gold)" />
          <stop offset="38%" stopColor="var(--brand-pink)" />
          <stop offset="66%" stopColor="var(--brand-purple)" />
          <stop offset="100%" stopColor="var(--brand-teal)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#fk-mark-grad)"
        d="M72 6
           C40 6 14 34 14 70
           C14 106 40 134 72 134
           C86 134 97 129 100 124
           C82 128 62 118 56 100
           C52 88 56 78 66 74
           C56 70 51 60 55 50
           C58 42 66 38 74 40
           C68 30 68 20 74 12
           Z"
      />
    </svg>
  );
}
