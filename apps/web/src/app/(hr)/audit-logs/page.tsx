import { AuditLogFeed } from "@/features/audit-log/components/audit-log-feed";
import { getAuditLogs } from "@/features/audit-log/server/get-audit-logs";

export default async function AuditLogsPage() {
  const response = await getAuditLogs();
  const eventCount = response.data.length;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review recent administrative and employee-management activity.
          </p>
        </div>

        <p className="w-fit shrink-0 rounded-full border border-foreground/20 bg-foreground/5 px-3 py-1.5 text-sm font-medium text-foreground/70">
          Showing {eventCount} recent {eventCount === 1 ? "event" : "events"}
        </p>
      </header>

      <AuditLogFeed auditLogs={response.data} />
    </section>
  );
}
