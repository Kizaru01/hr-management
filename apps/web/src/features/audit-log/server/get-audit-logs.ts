import { authenticatedApi } from "@/lib/api/authenticated-api";
import type { ApiResponse } from "@/types/api";
import type { AuditLogListItem } from "../types/audit-log";

export function getAuditLogs() {
  return authenticatedApi<ApiResponse<AuditLogListItem[]>>("/audit-logs");
}
