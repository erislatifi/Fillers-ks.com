import type { ReactNode } from "react";

type Props = {
  variant?: "dark" | "accent";
  className?: string;
  children: ReactNode;
};

const variants: Record<string, string> = {
  dark: "bg-ink text-paper",
  accent: "bg-accent text-paper",
};

export function Badge({ variant = "dark", className = "", children }: Props) {
  return (
    <span
      className={`rounded-full text-[10px] font-semibold tracking-wide px-2.5 py-1 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
