import type { SectionText } from "@/lib/homepage";
import type { Homepage } from "@/payload-types";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/SectionHeading";
import {
  BadgeCheckIcon,
  ShieldCheckIcon,
  TruckIcon,
  HeadsetIcon,
  AwardIcon,
} from "@/components/icons";

const ICONS = {
  original: BadgeCheckIcon,
  certified: ShieldCheckIcon,
  delivery: TruckIcon,
  support: HeadsetIcon,
  trusted: AwardIcon,
};

type Props = { heading?: SectionText; items?: Homepage["whyItems"] };

export async function WhyChooseUs({ heading, items }: Props = {}) {
  const t = await getTranslations("why");

  // Cards from Ballina → Pse ne; the built-in five when none are set.
  const fromAdmin = (items ?? []).map((i) => ({
    icon: ICONS[i.icon ?? "original"] ?? BadgeCheckIcon,
    title: i.title,
    description: i.description ?? "",
  }));
  const features = fromAdmin.length ? fromAdmin : [
    { icon: BadgeCheckIcon, title: t("originalTitle"), description: t("originalDesc") },
    { icon: ShieldCheckIcon, title: t("certifiedTitle"), description: t("certifiedDesc") },
    { icon: TruckIcon, title: t("deliveryTitle"), description: t("deliveryDesc") },
    { icon: HeadsetIcon, title: t("supportTitle"), description: t("supportDesc") },
    { icon: AwardIcon, title: t("trustedTitle"), description: t("trustedDesc") },
  ];
  const cols = features.length >= 5 ? "lg:grid-cols-5" : features.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-28">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 85% 0%, rgba(233,30,140,0.22) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading
          eyebrow={(heading?.eyebrow || t("eyebrow"))}
          title={(heading?.title || t("title"))}
          align="center"
          theme="dark"
          className="mx-auto"
        />

        <div className={`mt-14 grid sm:grid-cols-2 ${cols} gap-5`}>
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-6 backdrop-blur-sm transition-colors hover:bg-paper/[0.07] hover:border-accent/30"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/10">
                <f.icon className="h-5 w-5 text-accent-light" />
              </span>
              <h3 className="mt-5 text-[15px] font-medium text-paper">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-paper/60">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
