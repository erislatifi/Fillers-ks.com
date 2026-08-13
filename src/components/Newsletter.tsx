import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "@/components/icons";

export async function Newsletter() {
  const t = await getTranslations("newsletter");

  return (
    <section className="bg-mist py-20 sm:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="rounded-3xl border border-line bg-paper px-8 py-14 sm:px-16 sm:py-16 text-center relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 80% at 50% 0%, #fdeaf4 0%, transparent 60%)",
            }}
          />
          <div className="relative max-w-xl mx-auto">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep">
              {t("eyebrow")}
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl tracking-tight text-ink text-balance">
              {t("title")}
            </h2>
            <p className="mt-3 text-[14px] text-ink-soft">
              {t("description")}
            </p>

            <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder={t("placeholder")}
                className="w-full rounded-full border border-line bg-paper px-5 py-3.5 text-sm outline-none focus:border-accent transition-colors placeholder:text-ink-faint"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-paper px-6 py-3.5 text-sm font-medium hover:bg-accent-deep transition-colors shrink-0"
              >
                {t("subscribe")}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
