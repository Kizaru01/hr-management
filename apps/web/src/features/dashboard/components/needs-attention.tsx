import Link from "next/link";
import {
  ArrowRight,
  CheckCheck,
  ClipboardList,
  FileClock,
  UserRoundKey,
} from "lucide-react";
import type { HrDashboardData } from "../types/dashboard";
import { DashboardPanel, DashboardUnavailable } from "./dashboard-panel";

export function NeedsAttention({
  dashboard,
}: {
  dashboard: HrDashboardData | null;
}) {
  const rows = dashboard
    ? [
        {
          label: "Leave requests",
          detail: "Awaiting review and approval",
          count: dashboard.leaveRequests.pending,
          href: "/leave",
          icon: ClipboardList,
        },
        {
          label: "Expiring documents",
          detail: "Active documents · next 30 days, including today",
          count: dashboard.documents.expiring,
          href: "/documents",
          icon: FileClock,
        },
        ...(dashboard.activations.authorized
          ? [
              {
                label: "Account activations",
                detail: "Active employees with pending accounts",
                count: dashboard.activations.pending,
                href: "/users",
                icon: UserRoundKey,
              },
            ]
          : []),
      ]
    : [];
  const allClear = dashboard && rows.every((row) => row.count === 0);
  return (
    <DashboardPanel
      title="Needs attention"
      description="Your HR follow-up list"
    >
      {!dashboard ? (
        <DashboardUnavailable label="Action items" href="/dashboard" />
      ) : (
        <>
          {allClear ? (
            <div className="mb-4 rounded-control border border-success-border bg-success-surface p-4">
              <CheckCheck
                aria-hidden="true"
                className="mb-2 size-5 text-success"
              />
              <p className="text-sm font-medium">
                Nothing needs your attention
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                All available checks are clear.
              </p>
            </div>
          ) : null}
          <ul className="divide-y divide-border">
            {rows.map(({ icon: Icon, ...row }) => (
              <li key={row.href}>
                <Link
                  href={row.href}
                  className="-mx-2 flex items-start gap-3 rounded-control px-2 py-4 transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{row.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {row.count === null
                        ? "Unable to load · Open page to retry"
                        : row.detail}
                    </p>
                  </div>
                  <span className="text-lg font-semibold tabular-nums">
                    {row.count === null ? (
                      <span className="text-xs font-normal text-muted-foreground">
                        Unavailable
                      </span>
                    ) : (
                      row.count
                    )}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="mt-1 size-3.5 shrink-0 text-muted-foreground"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashboardPanel>
  );
}
