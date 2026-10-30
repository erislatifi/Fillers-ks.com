import { Link } from "@/i18n/navigation";
import type { SiteSetting } from "@/payload-types";

// Thin bar above the header, switched on in Cilësimet → Tekstet e faqes.
export function AnnouncementBar({ announcement }: { announcement: SiteSetting["announcement"] }) {
  if (!announcement?.enabled || !announcement.text) return null;
  const { text, linkLabel, linkHref } = announcement;
  const external = linkHref?.startsWith("http");

  return (
    <div className="bg-accent-deep text-paper">
      <p className="mx-auto max-w-[1400px] px-6 lg:px-10 py-2 text-center text-[12.5px] font-medium tracking-wide">
        {text}
        {linkHref && linkLabel && (
          <>
            {" "}
            {external ? (
              <a href={linkHref} className="underline underline-offset-2 hover:text-accent-light">
                {linkLabel}
              </a>
            ) : (
              <Link href={linkHref} className="underline underline-offset-2 hover:text-accent-light">
                {linkLabel}
              </Link>
            )}
          </>
        )}
      </p>
    </div>
  );
}
