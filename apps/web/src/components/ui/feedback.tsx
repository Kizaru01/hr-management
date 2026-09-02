import type { HTMLAttributes } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type FeedbackTone = "success" | "warning" | "error" | "info";

const tones: Record<FeedbackTone, string> = {
  success: "border-success-border bg-success-surface text-success",
  warning: "border-warning-border bg-warning-surface text-warning",
  error: "border-destructive-border bg-destructive-surface text-destructive",
  info: "border-info-border bg-info-surface text-info",
};

const icons = {
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  info: Info,
};

interface FeedbackProps extends HTMLAttributes<HTMLDivElement> {
  tone?: FeedbackTone;
}

export function Feedback({
  className,
  tone = "info",
  children,
  role,
  ...props
}: FeedbackProps) {
  const Icon = icons[tone];

  return (
    <div
      role={role ?? (tone === "error" ? "alert" : "status")}
      className={cn(
        "flex items-start gap-2 rounded-control border px-3 py-2.5 text-sm",
        tones[tone],
        className,
      )}
      {...props}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 text-secondary-foreground">{children}</div>
    </div>
  );
}
