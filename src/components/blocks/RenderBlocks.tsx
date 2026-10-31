import { RichText } from "@payloadcms/richtext-lexical/react";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { Rail } from "@/components/Rail";
import { Button } from "@/components/Button";
import { ChevronDownIcon, ArrowRightIcon } from "@/components/icons";
import { MediaFrame, UploadedImage, hueFromSlug } from "@/components/media";
import { getPayloadClient } from "@/lib/payload";
import type { AppLocale } from "@/i18n/routing";
import type { Where } from "payload";
import type { Page, Product } from "@/payload-types";

// Renders the admin-built blocks (src/blocks). Each block type maps to one component below.
export type ContentBlock = NonNullable<Page["layout"]>[number];

type Of<T extends ContentBlock["blockType"]> = Extract<ContentBlock, { blockType: T }>;

const wrap = "mx-auto max-w-[1400px] px-6 lg:px-10";

function Heading({ eyebrow, title, center }: { eyebrow?: string | null; title?: string | null; center?: boolean }) {
  if (!title && !eyebrow) return null;
  return (
    <SectionHeading
      eyebrow={eyebrow ?? undefined}
      title={title ?? ""}
      align={center ? "center" : "left"}
      className={center ? "mx-auto" : ""}
    />
  );
}

function RichTextSection({ block }: { block: Of<"richText"> }) {
  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <Heading eyebrow={block.eyebrow} title={block.title} />
        {block.body && (
          <div className={`prose-fk ${block.title ? "mt-8" : ""}`}>
            <RichText data={block.body} />
          </div>
        )}
      </div>
    </section>
  );
}

function ImageTextSection({ block }: { block: Of<"imageText"> }) {
  const right = block.imagePosition === "right";
  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className={`${wrap} grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}>
        <MediaFrame
          hue={hueFromSlug(block.title ?? "image")}
          className={`aspect-[4/3] rounded-3xl border border-line ${right ? "lg:order-2" : ""}`}
        >
          {typeof block.image === "object" && <UploadedImage media={block.image} />}
        </MediaFrame>
        <div>
          <Heading eyebrow={block.eyebrow} title={block.title} />
          {block.text && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">{block.text}</p>}
          {block.buttonLabel && block.buttonHref && (
            <div className="mt-8">
              <Button href={block.buttonHref}>
                {block.buttonLabel}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const CTA_THEMES = {
  dark: { section: "bg-ink text-paper", text: "text-paper/70", eyebrow: "text-accent-light" },
  accent: { section: "bg-accent-deep text-paper", text: "text-paper/80", eyebrow: "text-accent-light" },
  light: { section: "bg-mist text-ink", text: "text-ink-soft", eyebrow: "text-accent-deep" },
} as const;

function CtaSection({ block }: { block: Of<"cta"> }) {
  const theme = CTA_THEMES[block.theme ?? "dark"];
  const onDark = block.theme !== "light";
  return (
    <section className="py-10 sm:py-14 bg-paper">
      <div className={wrap}>
        <div className={`rounded-3xl px-8 py-14 sm:px-16 text-center ${theme.section}`}>
          {block.eyebrow && (
            <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${theme.eyebrow}`}>{block.eyebrow}</p>
          )}
          {block.title && <h2 className="mt-3 font-display text-2xl sm:text-4xl tracking-tight text-balance">{block.title}</h2>}
          {block.text && <p className={`mt-4 mx-auto max-w-2xl text-[15px] leading-relaxed ${theme.text}`}>{block.text}</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {block.buttonLabel && block.buttonHref && (
              <Button href={block.buttonHref} className={onDark ? "!bg-paper !text-ink hover:!bg-accent-light" : ""}>
                {block.buttonLabel}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            )}
            {block.secondaryLabel && block.secondaryHref && (
              <Button
                href={block.secondaryHref}
                variant="secondary"
                className={onDark ? "!text-paper !border-paper/30 hover:!border-accent-light hover:!text-accent-light" : ""}
              >
                {block.secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const VISIBLE = { visible: { not_equals: false } } as const;

async function productsFor(block: Of<"productRow">, locale: AppLocale): Promise<Product[]> {
  const limit = block.limit ?? 8;
  const payload = await getPayloadClient();
  if (block.source === "manual") {
    return (block.products ?? []).filter((p): p is Product => typeof p === "object" && p.visible !== false).slice(0, limit);
  }
  const id = (rel: unknown) => (rel && typeof rel === "object" ? (rel as { id: number }).id : rel);
  const where: Where =
    block.source === "brand" && block.brand
      ? { brand: { equals: id(block.brand) } }
      : block.source === "category" && block.category
        ? { category: { equals: id(block.category) } }
        : block.source === "newArrivals"
          ? { newArrival: { equals: true } }
          : block.source === "onSale"
            ? { compareAtPrice: { greater_than: 0 } }
            : { bestSeller: { equals: true } };
  const res = await payload.find({ collection: "products", locale, depth: 2, limit, where: { and: [where, VISIBLE] } });
  return res.docs;
}

async function ProductRowSection({ block, locale }: { block: Of<"productRow">; locale: AppLocale }) {
  const products = await productsFor(block, locale);
  if (products.length === 0) return null;
  return (
    <section className="bg-mist py-16 sm:py-24">
      <div className={wrap}>
        <Heading eyebrow={block.eyebrow} title={block.title} />
        <div className={block.title || block.eyebrow ? "mt-12" : ""}>
          <Rail>
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </Rail>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ block }: { block: Of<"faq"> }) {
  if (!block.items?.length) return null;
  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <Heading eyebrow={block.eyebrow} title={block.title} />
        <div className={`divide-y divide-line rounded-2xl border border-line ${block.title ? "mt-8" : ""}`}>
          {block.items.map((item) => (
            <details key={item.id} className="group px-5 py-4 open:bg-mist/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-ink">
                {item.question}
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-soft">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** YouTube / Vimeo page link → embeddable player URL (null for anything else). */
function embedUrl(url: string): string | null {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

function VideoSection({ block }: { block: Of<"video"> }) {
  const src = embedUrl(block.url);
  if (!src) return null;
  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <Heading eyebrow={block.eyebrow} title={block.title} center />
        <div className={`aspect-video overflow-hidden rounded-3xl border border-line ${block.title ? "mt-8" : ""}`}>
          <iframe
            src={src}
            title={block.title ?? "Video"}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

export function RenderBlock({ block, locale }: { block: ContentBlock; locale: AppLocale }) {
  switch (block.blockType) {
    case "richText":
      return <RichTextSection block={block} />;
    case "imageText":
      return <ImageTextSection block={block} />;
    case "cta":
      return <CtaSection block={block} />;
    case "productRow":
      return <ProductRowSection block={block} locale={locale} />;
    case "faq":
      return <FaqSection block={block} />;
    case "video":
      return <VideoSection block={block} />;
    default:
      return null;
  }
}

export function RenderBlocks({ blocks, locale }: { blocks: ContentBlock[] | null | undefined; locale: AppLocale }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((block) => (
        <RenderBlock key={block.id ?? `${block.blockType}`} block={block} locale={locale} />
      ))}
    </>
  );
}
