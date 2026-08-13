"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/Button";
import { MinusIcon, PlusIcon, CheckCircleIcon } from "@/components/icons";

type Props = {
  slug: string;
  name: string;
  brandName: string;
  price: number;
  image: string | null;
  size?: string;
  compact?: boolean;
};

export function AddToCartButton({ slug, name, brandName, price, image, size, compact = false }: Props) {
  const t = useTranslations("cart");
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ slug, name, brandName, price, image, size }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const stepperSize = compact ? "h-9 w-9" : "h-12 w-11";
  const iconSize = compact ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${compact ? "" : "gap-4"}`}>
      <div className="flex items-center rounded-full border border-line">
        <button
          type="button"
          aria-label={t("decrease")}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className={`${stepperSize} flex items-center justify-center text-ink-soft hover:text-accent-deep transition-colors`}
        >
          <MinusIcon className={iconSize} />
        </button>
        <span className={`text-center text-[14px] font-medium text-ink ${compact ? "w-6" : "w-8"}`}>
          {quantity}
        </span>
        <button
          type="button"
          aria-label={t("increase")}
          onClick={() => setQuantity((q) => q + 1)}
          className={`${stepperSize} flex items-center justify-center text-ink-soft hover:text-accent-deep transition-colors`}
        >
          <PlusIcon className={iconSize} />
        </button>
      </div>

      <Button size={compact ? "md" : "lg"} onClick={handleAdd}>
        {added ? (
          <>
            <CheckCircleIcon className="h-4 w-4" />
            {t("added")}
          </>
        ) : (
          t("addToCart")
        )}
      </Button>
    </div>
  );
}
