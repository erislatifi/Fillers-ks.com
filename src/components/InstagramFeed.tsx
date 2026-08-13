import { getTranslations } from "next-intl/server";
import { MediaFrame } from "@/components/media";
import { InstagramIcon } from "@/components/icons";

const hues = [40, 30, 48, 36, 44, 28];

export async function InstagramFeed() {
  const t = await getTranslations("instagram");

  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep">
              <span className="h-px w-6 bg-accent-deep/60" />
              {t("eyebrow")}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-ink">
              @fillers.kosovo
            </h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-accent-deep"
          >
            <InstagramIcon className="h-4 w-4" />
            {t("viewOnInstagram")}
          </a>
        </div>

        <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {hues.map((hue, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block"
            >
              <MediaFrame hue={hue} className="aspect-square rounded-xl">
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 group-hover:bg-ink/30 transition-colors">
                  <InstagramIcon className="h-5 w-5 text-paper opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </MediaFrame>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
