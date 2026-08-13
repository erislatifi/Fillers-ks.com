"use client";

import { useRef } from "react";
import { ChevronRightIcon } from "@/components/icons";

export function Rail({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="rail no-scrollbar flex gap-5 sm:gap-6 overflow-x-auto pb-2 -mx-6 px-6 lg:-mx-10 lg:px-10"
      >
        {children}
      </div>

      <div className="hidden md:flex absolute -top-16 right-0 gap-2">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="h-10 w-10 rounded-full border border-line flex items-center justify-center hover:border-accent hover:text-accent-deep transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4 rotate-180" />
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="h-10 w-10 rounded-full border border-line flex items-center justify-center hover:border-accent hover:text-accent-deep transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
