type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  theme?: "light" | "dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  theme = "light",
  className = "",
}: Props) {
  const isCenter = align === "center";
  const isDark = theme === "dark";
  return (
    <div className={`${isCenter ? "text-center mx-auto" : "text-left"} max-w-2xl ${className}`}>
      {eyebrow && (
        <span
          className={`mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] ${
            isDark ? "text-accent-light" : "text-accent-deep"
          }`}
        >
          <span className={`h-px w-6 ${isDark ? "bg-accent-light/60" : "bg-accent-deep/60"}`} />
          {eyebrow}
        </span>
      )}
      <h2
        className={`font-display text-3xl sm:text-4xl md:text-[2.6rem] leading-[1.1] tracking-tight text-balance ${
          isDark ? "text-paper" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-[15px] sm:text-base leading-relaxed ${
            isDark ? "text-paper/65" : "text-ink-soft"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
