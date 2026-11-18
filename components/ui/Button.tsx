import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary:
    "bg-surface text-foreground border border-border-strong hover:bg-surface-muted",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-muted",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-sm",
  md: "h-10 px-5 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-md",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClass(variant, size)} ${className}`}
      {...props}
    />
  );
}
