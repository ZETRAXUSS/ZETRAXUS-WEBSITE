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
    "bg-foreground text-background font-semibold hover:bg-foreground/90 border border-foreground/20 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] active:scale-95",
  secondary:
    "bg-transparent text-foreground border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.15),inset_0_0_1px_rgba(255,255,255,0.2)] active:scale-95",
  ghost:
    "bg-transparent text-muted border border-transparent hover:text-foreground hover:border-white/20 hover:bg-white/3 transition-all duration-300 active:scale-95",
};

const sharedClasses =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-3 text-sm font-medium transition-all disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed";

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
