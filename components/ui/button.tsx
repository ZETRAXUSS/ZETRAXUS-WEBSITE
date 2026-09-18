import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface BaseProps {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-[var(--accent-strong)] border border-transparent transition-all duration-300 hover:shadow-[0_0_16px_rgba(176,141,87,0.25),inset_0_0_1px_rgba(255,255,255,0.2)]",
  secondary:
    "bg-transparent text-foreground border border-border-strong hover:border-accent/50 hover:text-foreground transition-all duration-300 hover:shadow-[0_0_16px_rgba(255,255,255,0.08),inset_0_0_1px_rgba(255,255,255,0.15)]",
  ghost:
    "bg-transparent text-muted border border-transparent hover:text-foreground hover:bg-surface-hover/60 transition-all duration-300 hover:shadow-[0_0_12px_rgba(255,255,255,0.06)]",
};

const sharedClasses =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none";

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {
  href?: undefined;
}

interface ButtonAsLink extends BaseProps {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Foundation button. Renders a <Link> when given an href, otherwise a
 * native <button>. Extend variantClasses rather than adding one-off
 * button styles at call sites.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", className, children } = props;
  const classes = cn(sharedClasses, variantClasses[variant], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _omitVariant, className: _omitClassName, children: buttonChildren, ...rest } =
    props as ButtonAsButton;
  void _omitVariant;
  void _omitClassName;

  return (
    <button className={classes} {...rest}>
      {buttonChildren}
    </button>
  );
}
