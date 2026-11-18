import type { HTMLAttributes } from "react";

type Tone = "primary" | "neutral";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-soft-foreground",
  neutral: "text-muted-foreground border border-border",
};

export function Badge({
  tone = "primary",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
