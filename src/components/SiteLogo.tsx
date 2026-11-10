import { BrandMark } from "@/components/BrandMark";

export type LogoSettings = {
  logoUrl: string | null;
  logoSize?: "small" | "medium" | "large" | null;
  logoText?: boolean | null;
  brandName?: string | null;
  tagline?: string | null;
};

// Cilësimet → Tekstet e faqes: Logoja, Madhësia e logos, Shfaq emrin, Emri, Slogani.
const SIZES = {
  header: {
    small: { mark: "h-7", logo: "h-9 max-w-[160px]", name: "text-[18px]", tag: "text-[9.5px]" },
    medium: { mark: "h-9", logo: "h-11 max-w-[200px]", name: "text-[22px]", tag: "text-[10.5px]" },
    large: { mark: "h-12", logo: "h-14 max-w-[240px]", name: "text-[27px]", tag: "text-[12px]" },
  },
  footer: {
    small: { mark: "h-7", logo: "h-8 max-w-[150px]", name: "text-base", tag: "text-[9.5px]" },
    medium: { mark: "h-8", logo: "h-10 max-w-[180px]", name: "text-lg", tag: "text-[10px]" },
    large: { mark: "h-11", logo: "h-12 max-w-[220px]", name: "text-[22px]", tag: "text-[11px]" },
  },
} as const;

/** The site logo for the header (light) or footer (dark), driven by Cilësimet. */
export function SiteLogo({ settings, variant }: { settings: LogoSettings; variant: "header" | "footer" }) {
  const s = SIZES[variant][settings.logoSize ?? "medium"] ?? SIZES[variant].medium;
  const name = settings.brandName?.trim() || "Fillers";

  if (settings.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={settings.logoUrl} alt={name} className={`${s.logo} w-auto object-contain`} />;
  }

  return (
    <>
      <BrandMark className={`${s.mark} w-auto`} />
      {settings.logoText !== false && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display ${s.name} tracking-[0.01em] font-semibold ${
              variant === "header" ? "brand-gradient-text" : "text-paper"
            }`}
          >
            {name}
          </span>
          <span className={`${s.tag} tracking-wide -mt-0.5 ${variant === "header" ? "text-ink-faint" : "text-paper/45"}`}>
            {settings.tagline || "Ndriço me ne!"}
          </span>
        </span>
      )}
      {settings.logoText === false && <span className="sr-only">{name}</span>}
    </>
  );
}
