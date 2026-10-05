import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function DashboardPanel({
  title,
  description,
  href,
  linkLabel,
  children,
}: {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-control text-xs font-medium text-info hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {linkLabel}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

export function DashboardUnavailable({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <div
      role="status"
      className="rounded-control border border-border bg-muted p-4 text-sm"
    >
      <p className="font-medium">{label} is unavailable</p>
      <p className="mt-1 text-muted-foreground">
        We couldn’t load this section.{" "}
        <Link className="text-info underline underline-offset-4" href={href}>
          Open page to try again
        </Link>
        .
      </p>
    </div>
  );
}
