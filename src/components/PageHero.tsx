type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Smaller band for pages where the content should start high (e.g. the shop). */
  compact?: boolean;
};

export function PageHero({ eyebrow, title, description, compact = false }: Props) {
  return (
    <section className="relative overflow-hidden bg-mist">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 60% at 15% 0%, #fdeaf4 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 20%, #eef0f6 0%, transparent 60%)",
        }}
      />
      <div className="absolute inset-0 bg-noise opacity-[0.35]" />
      <div
        className={`relative mx-auto max-w-[1400px] px-6 lg:px-10 ${
          compact ? "pt-8 pb-7 sm:pt-10 sm:pb-8" : "pt-14 sm:pt-20 pb-14 sm:pb-16"
        }`}
      >
        {eyebrow && (
          <span
            className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep ${
              compact ? "mb-2" : "mb-3"
            }`}
          >
            <span className="h-px w-6 bg-accent-deep/60" />
            {eyebrow}
          </span>
        )}
        <h1
          className={`font-display leading-[1.08] tracking-tight text-ink text-balance max-w-3xl ${
            compact ? "text-2xl sm:text-[34px]" : "text-3xl sm:text-5xl"
          }`}
        >
          {title}
        </h1>
        {description && (
          <p
            className={`max-w-2xl leading-relaxed text-ink-soft ${
              compact ? "mt-2.5 text-[14px]" : "mt-5 text-[15px] sm:text-base"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
