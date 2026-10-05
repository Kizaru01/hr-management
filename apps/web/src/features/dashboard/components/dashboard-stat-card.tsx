import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardStatCard({
  label,
  value,
  description,
  href,
  icon: Icon,
}: {
  label: string;
  value: number | null | undefined;
  description: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors hover:border-border-strong hover:bg-hover">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              {label}
            </h2>
            <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
            {value == null ? "—" : value.toLocaleString("en-PH")}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {value == null ? "Unavailable · Open page to retry" : description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
