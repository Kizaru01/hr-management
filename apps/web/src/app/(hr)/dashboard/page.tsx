import { unstable_rethrow } from "next/navigation";
import {
  Activity,
  CalendarCheck,
  ClipboardList,
  FileClock,
  UsersRound,
} from "lucide-react";
import { getHrDashboard } from "@/features/dashboard/server/get-hr-dashboard";
import { AttendanceOverview } from "@/features/dashboard/components/attendance-overview-card";
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card";
import {
  DashboardPanel,
  DashboardUnavailable,
} from "@/features/dashboard/components/dashboard-panel";
import { DashboardAddEmployee } from "@/features/dashboard/components/dashboard-add-employee";
import { NeedsAttention } from "@/features/dashboard/components/needs-attention";
import { PageHeader } from "@/components/ui/page-header";
import { getAuditLogs } from "@/features/audit-log/server/get-audit-logs";
import {
  formatAuditLogAction,
  formatAuditLogTimestamp,
} from "@/features/audit-log/utils/audit-log-formatters";
import { getDepartments } from "@/features/departments/server/get-departments";
import { getBranches } from "@/features/branch/server/get-branches";

const dateFormat = new Intl.DateTimeFormat("en-PH", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Manila",
});

export default async function DashboardPage() {
  const results = await Promise.allSettled([
    getHrDashboard(),
    getAuditLogs(),
    getDepartments(),
    getBranches(),
  ]);
  // Preserve Next.js redirects and other framework control-flow errors.
  for (const result of results)
    if (result.status === "rejected") unstable_rethrow(result.reason);
  const [dashboardResult, auditResult, departmentsResult, branchesResult] =
    results;
  const dashboard =
    dashboardResult.status === "fulfilled" ? dashboardResult.value.data : null;
  const logs =
    auditResult.status === "fulfilled"
      ? auditResult.value.data.slice(0, 5)
      : null;
  const options = (items: { id: string; name: string; isActive: boolean }[]) =>
    items
      .filter((item) => item.isActive)
      .map((item) => ({ value: item.id, label: item.name }));
  const today = dashboard
    ? new Date(`${dashboard.date}T00:00:00Z`)
    : new Date();
  const employees = dashboard?.employees;
  const announcements = dashboard?.announcements;

  return (
    <section className="page-stack">
      <PageHeader
        title="Dashboard"
        description="Your daily overview of people, attendance and HR priorities."
        eyebrow={`${dateFormat.format(today)} · Asia/Manila`}
        actions={
          <DashboardAddEmployee
            departments={
              departmentsResult.status === "fulfilled"
                ? options(departmentsResult.value.data)
                : null
            }
            branches={
              branchesResult.status === "fulfilled"
                ? options(branchesResult.value.data)
                : null
            }
          />
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Active employees"
          value={employees?.active}
          icon={UsersRound}
          href="/employees?employmentStatus=active"
          description={
            employees
              ? `${employees.total} total · ${employees.inactive} inactive · ${employees.other} other statuses`
              : "Current employment status"
          }
        />
        <DashboardStatCard
          label="Present today"
          value={dashboard?.attendanceToday?.present}
          icon={CalendarCheck}
          href="/attendance"
          description={
            dashboard?.attendanceToday?.holiday
              ? "Company holiday · attendance not classified"
              : "Checked in for a scheduled workday"
          }
        />
        <DashboardStatCard
          label="Pending leave requests"
          value={dashboard?.leaveRequests.pending}
          icon={ClipboardList}
          href="/leave"
          description="Requests awaiting a decision"
        />
        <DashboardStatCard
          label="Documents expiring soon"
          value={dashboard?.documents.expiring}
          icon={FileClock}
          href="/documents"
          description={
            dashboard
              ? `Active · ${dateFormat.format(new Date(`${dashboard.documents.from}T00:00:00Z`))} – ${dateFormat.format(new Date(`${dashboard.documents.through}T00:00:00Z`))} (30 days)`
              : "Active documents · next 30 days"
          }
        />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AttendanceOverview attendance={dashboard?.attendanceToday ?? null} />
        </div>
        <NeedsAttention dashboard={dashboard} />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <DashboardPanel
          title="Recent activity"
          description="The five latest audit events · Manila time"
          href="/audit-logs"
          linkLabel="View audit logs"
        >
          {logs === null ? (
            <DashboardUnavailable label="Recent activity" href="/audit-logs" />
          ) : logs.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No audit activity has been recorded yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Activity
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {formatAuditLogAction(log.action)}
                    </p>
                    <p className="mt-1 break-words text-xs text-muted-foreground">
                      {log.actorUser?.email ?? "System / deleted account"}
                    </p>
                    <time
                      dateTime={log.createdAt}
                      className="mt-1 block text-xs text-muted-foreground"
                    >
                      {formatAuditLogTimestamp(log.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
        <DashboardPanel
          title="Latest announcements"
          description="The latest updates visible to your employee profile"
          href="/announcements"
          linkLabel="View all"
        >
          {announcements == null ? (
            <DashboardUnavailable label="Announcements" href="/announcements" />
          ) : announcements.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No current announcements for your audience.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="min-w-0 break-words text-sm font-medium">
                      {announcement.title}
                    </h3>
                    <time
                      dateTime={announcement.publishedAt}
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {dateFormat.format(new Date(announcement.publishedAt))}
                    </time>
                  </div>
                  <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
                    {announcement.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DashboardPanel>
      </div>
    </section>
  );
}
