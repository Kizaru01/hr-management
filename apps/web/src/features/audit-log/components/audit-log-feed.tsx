"use client";

import { ChevronRight } from "lucide-react";
import { useSheetController } from "@/components/sheet";
import { EmptyState } from "@/components/ui/empty-state";
import type { AuditLogListItem } from "../types/audit-log";
import {
  formatAuditLogRole,
  formatAuditLogStatus,
  formatAuditLogTarget,
  formatAuditLogTimestamp,
} from "../utils/audit-log-formatters";
import { getAuditLogPresentation } from "../utils/audit-log-presentations";
import { AuditLogDetailsPanel } from "./audit-log-details-panel";

interface AuditLogFeedProps {
  auditLogs: AuditLogListItem[];
}

const desktopColumns =
  "md:grid-cols-[minmax(0,1.35fr)_minmax(7rem,0.7fr)_minmax(0,1.2fr)_minmax(10rem,0.85fr)]";

export const AuditLogFeed = ({ auditLogs }: AuditLogFeedProps) => {
  const sheet = useSheetController<AuditLogListItem>();
  const selectedAuditLog = sheet.content;

  const handleSelect = (
    auditLog: AuditLogListItem,
    trigger: HTMLButtonElement,
  ) => {
    sheet.openSheet(auditLog, trigger);
  };

  if (auditLogs.length === 0) {
    return (
      <EmptyState
        title="No audit logs found"
        description="There are no recent audit events to display."
      />
    );
  }

  return (
    <>
      <section aria-label="Recent audit activity" className="table-shell">
        <div
          className={`hidden gap-4 border-b border-border bg-hover px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid ${desktopColumns}`}
        >
          <span>Actor</span>
          <span>Action</span>
          <span>Target</span>
          <span>Date and time</span>
        </div>

        <ol className="divide-y divide-border">
          {auditLogs.map((auditLog) => {
            const presentation = getAuditLogPresentation(auditLog.action);
            const ActionIcon = presentation.icon;
            const status = formatAuditLogStatus(auditLog.action) ?? "Activity";
            const target = formatAuditLogTarget(
              auditLog.entityType,
              auditLog.metadata,
            );
            const isSelected = selectedAuditLog?.id === auditLog.id;

            return (
              <li key={auditLog.id}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-controls="audit-log-details-dialog"
                  aria-expanded={isSelected}
                  onClick={(event) =>
                    handleSelect(auditLog, event.currentTarget)
                  }
                  className={`group grid w-full min-w-0 gap-4 px-4 py-4 text-left transition sm:px-5 md:items-center ${desktopColumns} ${
                    isSelected ? "bg-selected" : "hover:bg-hover"
                  } focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full border ${presentation.iconClassName}`}
                    >
                      <ActionIcon size={17} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {auditLog.actorUser?.email ?? "System"}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {auditLog.actorUser
                          ? formatAuditLogRole(auditLog.actorUser.role)
                          : "System event"}
                      </span>
                    </span>
                  </span>

                  <span className="flex min-w-0 items-center md:block">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${presentation.badgeClassName}`}
                    >
                      {status}
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {target.label}
                    </span>
                    {target.context ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {target.context}
                      </span>
                    ) : null}
                  </span>

                  <span className="flex min-w-0 items-center justify-between gap-3">
                    <time
                      dateTime={auditLog.createdAt}
                      className="text-sm text-muted-foreground"
                    >
                      {formatAuditLogTimestamp(auditLog.createdAt)}
                    </time>
                    <ChevronRight
                      aria-hidden="true"
                      size={18}
                      className="shrink-0 text-disabled-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-secondary-foreground"
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <AuditLogDetailsPanel
        auditLog={selectedAuditLog}
        dialogRef={sheet.dialogRef}
        onRequestClose={sheet.requestClose}
        onAfterClose={sheet.afterClose}
      />
    </>
  );
};
