import type { MouseEvent, RefObject } from "react";
import { Clock3, Cog, UserRound, X } from "lucide-react";
import type { AuditLogListItem } from "../types/audit-log";
import {
  formatAuditLogAction,
  formatAuditLogMetadata,
  formatAuditLogRole,
  formatAuditLogStatus,
  formatAuditLogTarget,
  formatAuditLogTimestamp,
} from "../utils/audit-log-formatters";
import { getAuditLogPresentation } from "../utils/audit-log-presentations";

interface AuditLogDetailsPanelProps {
  auditLog: AuditLogListItem | null;
  dialogRef: RefObject<HTMLDialogElement | null>;
  onRequestClose: () => void;
  onAfterClose: () => void;
}

export const AuditLogDetailsPanel = ({
  auditLog,
  dialogRef,
  onRequestClose,
  onAfterClose,
}: AuditLogDetailsPanelProps) => {
  const handleDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const clickedInsidePanel =
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom;

    if (!clickedInsidePanel) {
      onRequestClose();
    }
  };

  const presentation = auditLog
    ? getAuditLogPresentation(auditLog.action)
    : null;
  const Icon = presentation?.icon;
  const status = auditLog ? formatAuditLogStatus(auditLog.action) : null;
  const target = auditLog
    ? formatAuditLogTarget(auditLog.entityType, auditLog.metadata)
    : null;
  const metadataDetails = auditLog
    ? formatAuditLogMetadata(auditLog.metadata)
    : [];

  return (
    <dialog
      ref={dialogRef}
      id="audit-log-details-dialog"
      aria-labelledby="audit-log-details-title"
      aria-describedby="audit-log-details-description"
      onClick={handleDialogClick}
      onClose={onAfterClose}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-[30rem] border-0 border-l border-foreground/30 bg-background p-0 text-foreground backdrop:bg-black/70 open:flex open:flex-col"
    >
      <header className="flex items-start justify-between gap-4 border-b border-foreground/20 px-5 py-4 sm:px-6">
        <div>
          <h2 id="audit-log-details-title" className="text-lg font-semibold">
            Activity details
          </h2>
          <p
            id="audit-log-details-description"
            className="mt-1 text-sm text-foreground/60"
          >
            Review the selected audit event.
          </p>
        </div>

        <button
          type="button"
          autoFocus
          aria-label="Close activity details"
          onClick={onRequestClose}
          className="-mr-2 flex size-10 shrink-0 items-center justify-center rounded-md text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X aria-hidden="true" size={20} />
        </button>
      </header>

      {auditLog && presentation && Icon && target ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <section aria-labelledby="activity-summary-heading">
            <div className="flex min-w-0 items-start gap-3">
              <span
                aria-hidden="true"
                className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${presentation.iconClassName}`}
              >
                <Icon size={20} strokeWidth={1.8} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    id="activity-summary-heading"
                    className="font-semibold leading-6"
                  >
                    {formatAuditLogAction(auditLog.action)}
                  </h3>
                  {status ? (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${presentation.badgeClassName}`}
                    >
                      {status}
                    </span>
                  ) : null}
                </div>

                <time
                  dateTime={auditLog.createdAt}
                  className="mt-1 flex items-center gap-1.5 text-sm text-foreground/60"
                >
                  <Clock3 aria-hidden="true" size={15} />
                  {formatAuditLogTimestamp(auditLog.createdAt)}
                </time>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="actor-heading"
            className="mt-7 border-t border-foreground/15 pt-5"
          >
            <h3
              id="actor-heading"
              className="text-xs font-semibold uppercase tracking-wide text-foreground/50"
            >
              Actor
            </h3>
            <div className="mt-3 flex min-w-0 items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-foreground/20 bg-foreground/5 text-foreground/70">
                {auditLog.actorUser ? (
                  <UserRound aria-hidden="true" size={17} />
                ) : (
                  <Cog aria-hidden="true" size={17} />
                )}
              </span>
              <div className="min-w-0">
                <p className="break-words font-medium [overflow-wrap:anywhere]">
                  {auditLog.actorUser?.email ?? "System"}
                </p>
                <p className="mt-0.5 text-sm text-foreground/60">
                  {auditLog.actorUser
                    ? formatAuditLogRole(auditLog.actorUser.role)
                    : "No user actor"}
                </p>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="target-heading"
            className="mt-7 border-t border-foreground/15 pt-5"
          >
            <h3
              id="target-heading"
              className="text-xs font-semibold uppercase tracking-wide text-foreground/50"
            >
              Target
            </h3>
            <p className="mt-3 break-words font-medium [overflow-wrap:anywhere]">
              {target.label}
            </p>
            {target.context ? (
              <p className="mt-0.5 text-sm text-foreground/60">
                {target.context}
              </p>
            ) : null}
          </section>

          {metadataDetails.length > 0 ? (
            <section
              aria-labelledby="metadata-heading"
              className="mt-7 border-t border-foreground/15 pt-5"
            >
              <h3
                id="metadata-heading"
                className="text-xs font-semibold uppercase tracking-wide text-foreground/50"
              >
                Activity details
              </h3>
              <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                {metadataDetails.map((detail) => (
                  <div
                    key={`${detail.label}-${detail.value}`}
                    className="min-w-0"
                  >
                    <dt className="text-xs text-foreground/55">
                      {detail.label}
                    </dt>
                    <dd className="mt-1 break-words text-sm leading-5 [overflow-wrap:anywhere]">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <details className="mt-7 border-t border-foreground/15 pt-5 text-sm">
            <summary className="w-fit cursor-pointer rounded-sm font-medium text-foreground/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              Technical details
            </summary>
            <dl className="mt-4 grid gap-4">
              <TechnicalDetail label="Audit log ID" value={auditLog.id} />
              <TechnicalDetail
                label="Entity ID"
                value={auditLog.entityId ?? "Not recorded"}
              />
              <TechnicalDetail label="Action key" value={auditLog.action} />
              <TechnicalDetail
                label="Entity type"
                value={auditLog.entityType}
              />
            </dl>
          </details>
        </div>
      ) : null}
    </dialog>
  );
};

const TechnicalDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="text-xs text-foreground/50">{label}</dt>
    <dd className="mt-1 break-all font-mono text-xs leading-5 text-foreground/75">
      {value}
    </dd>
  </div>
);
