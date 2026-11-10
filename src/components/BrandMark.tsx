/**
 * The Fillers Kosovo crescent/profile mark — the client's own artwork (from the old
 * fillers-ks.com site, trimmed), served from public/brand/mark.png. Shown next to the
 * "Fillers" wordmark when no logo is uploaded in Cilësimet → Tekstet e faqes → Logoja.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/mark.png" alt="" aria-hidden width={329} height={438} className={`object-contain ${className}`} />;
}
