type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: Props) {
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
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 sm:pt-20 pb-14 sm:pb-16">
        {eyebrow && (
          <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep">
            <span className="h-px w-6 bg-accent-deep/60" />
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-3xl sm:text-5xl leading-[1.08] tracking-tight text-ink text-balance max-w-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-[15px] sm:text-base leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
