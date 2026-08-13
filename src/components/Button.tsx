import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
  onClick?: never;
};

type ButtonAsButton = CommonProps & {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

type Props = ButtonAsLink | ButtonAsButton;

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-out whitespace-nowrap";

const variants: Record<string, string> = {
  primary:
    "bg-ink text-paper hover:bg-accent-deep shadow-[0_1px_0_rgba(0,0,0,0.05)]",
  secondary:
    "bg-transparent text-ink border border-ink/15 hover:border-accent hover:text-accent-deep",
  ghost: "bg-transparent text-ink hover:text-accent-deep",
};

const sizes: Record<string, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-[15px]",
};

export function Button(props: Props) {
  const { children, variant = "primary", size = "md", className = "" } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={(props as ButtonAsButton).type ?? "button"}
      onClick={(props as ButtonAsButton).onClick}
      disabled={(props as ButtonAsButton).disabled}
      className={`${classes} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}
