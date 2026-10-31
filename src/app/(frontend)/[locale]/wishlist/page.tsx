import { getTranslations } from "next-intl/server";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const t = await getTranslations("wishlistPage");
  return <ComingSoon title={t("title")} description={t("description")} />;
}
