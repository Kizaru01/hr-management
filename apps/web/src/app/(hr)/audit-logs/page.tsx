import { AuditLogFeed } from "@/features/audit-log/components/audit-log-feed";
import { getAuditLogs } from "@/features/audit-log/server/get-audit-logs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";

export default async function AuditLogsPage() {
  const response = await getAuditLogs();
  const eventCount = response.data.length;

  return (
    <section className="page-stack">
      <PageHeader
        title="Audit Logs"
        description="Review recent administrative and employee-management activity."
        actions={
          <Badge className="px-3 py-1.5 text-sm">
            {eventCount} recent {eventCount === 1 ? "event" : "events"}
          </Badge>
        }
      />

      <AuditLogFeed auditLogs={response.data} />
    </section>
  );
}
