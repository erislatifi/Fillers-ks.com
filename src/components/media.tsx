/** Deterministic decorative hue derived from a slug — stable across server/client renders. */
export function hueFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1000;
  }
  return 28 + (hash % 25);
}

import type { Media } from "@/payload-types";

/** Picks a reasonably-sized rendition URL from an uploaded Media doc. */
export function mediaUrl(media: number | Media | null | undefined): string | null {
  if (!media || typeof media === "number") return null;
  return media.sizes?.card?.url || media.url || null;
}

/** Fills its parent with an uploaded image — use inside a relatively-positioned MediaFrame. */
export function UploadedImage({
  media,
  className = "",
}: {
  media: number | Media | null | undefined;
  className?: string;
}) {
  const url = mediaUrl(media);
  if (!url) return null;
  const alt = typeof media === "object" && media ? media.alt : "";
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className}`} />;
}

type MediaFrameProps = {
  hue?: number;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Placeholder product/brand visual: a soft gradient field + glass highlight,
 * standing in for real photography until brand-supplied imagery is available.
 */
export function MediaFrame({ hue = 38, className = "", children }: MediaFrameProps) {
  return (
    <div
      className={`relative overflow-hidden bg-mist ${className}`}
      style={{
        backgroundImage: `radial-gradient(120% 120% at 20% 15%, hsla(${hue},45%,92%,1) 0%, hsla(${hue},30%,88%,1) 38%, #f2f0eb 75%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-40" />
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl opacity-50"
        style={{ background: `hsla(${hue},60%,75%,0.6)` }}
      />
      {children}
    </div>
  );
}

export function VialGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" className={className} fill="none">
      <rect x="42" y="12" width="36" height="18" rx="4" className="fill-paper/70 stroke-ink/25" strokeWidth="1.5" />
      <path
        d="M48 30h24v14a4 4 0 004 4c6 0 10 8 10 20v58a10 10 0 01-10 10H44a10 10 0 01-10-10V68c0-12 4-20 10-20a4 4 0 004-4V30z"
        className="fill-paper/60 stroke-ink/30"
        strokeWidth="1.5"
      />
      <path d="M34 92h52" className="stroke-ink/20" strokeWidth="1.2" />
      <path d="M38 78h44" className="stroke-ink/15" strokeWidth="1" />
    </svg>
  );
}

export function DeviceGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" className={className} fill="none">
      <rect x="24" y="34" width="72" height="92" rx="14" className="fill-paper/60 stroke-ink/30" strokeWidth="1.5" />
      <circle cx="60" cy="72" r="20" className="fill-paper/70 stroke-ink/30" strokeWidth="1.5" />
      <circle cx="60" cy="72" r="9" className="stroke-ink/25" strokeWidth="1.2" />
      <path d="M40 108h40" className="stroke-ink/20" strokeWidth="1.2" />
      <path d="M46 118h28" className="stroke-ink/15" strokeWidth="1" />
      <path d="M52 20l16 0M60 20v14" className="stroke-ink/25" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Circular brand mark: shows the uploaded logo if present, else initials. */
export function BrandBadge({
  name,
  logo,
  className = "flex h-12 w-12 items-center justify-center rounded-full bg-mist text-[13px] font-display font-semibold text-accent-deep overflow-hidden",
}: {
  name: string;
  logo?: number | Media | null;
  className?: string;
}) {
  const url = mediaUrl(logo);
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className={`${className} object-contain p-1.5`} />;
  }
  return <span className={className}>{name.slice(0, 2).toUpperCase()}</span>;
}

export function BrandMonogram({ name, className = "" }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={`font-display tracking-wide ${className}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}
