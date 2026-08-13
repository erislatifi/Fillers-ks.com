import { Button } from "@/components/Button";
import { ArrowRightIcon } from "@/components/icons";

type Props = {
  title: string;
  description: string;
};

export function ComingSoon({ title, description }: Props) {
  return (
    <section className="bg-paper py-24 sm:py-32">
      <div className="mx-auto max-w-lg px-6 text-center">
        <span className="mb-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-deep">
          Coming Soon
        </span>
        <h1 className="font-display text-2xl sm:text-3xl text-ink text-balance">{title}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{description}</p>
        <div className="mt-8">
          <Button href="/contact">
            Contact Us Instead
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
