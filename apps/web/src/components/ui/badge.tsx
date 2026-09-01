import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant =
  "neutral" | "success" | "warning" | "destructive" | "info";

const variants: Record<BadgeVariant, string> = {
  neutral: "border-border-strong bg-hover text-secondary-foreground",
  success: "border-success-border bg-success-surface text-success",
  warning: "border-warning-border bg-warning-surface text-warning",
  destructive:
    "border-destructive-border bg-destructive-surface text-destructive",
  info: "border-info-border bg-info-surface text-info",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium leading-4",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
