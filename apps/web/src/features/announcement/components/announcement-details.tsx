import type { ManagedAnnouncement } from "../types/announcement";
import {
  formatAnnouncementAudience,
  formatAnnouncementTimestamp,
} from "../utils/announcement-formatters";

interface AnnouncementDetailsProps {
  announcement: ManagedAnnouncement;
}

export function AnnouncementDetails({
  announcement,
}: AnnouncementDetailsProps) {
  return (
    <div className="space-y-7">
      <section aria-labelledby="announcement-summary-heading">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="announcement-summary-heading" className="text-lg font-semibold">
            {announcement.title}
          </h3>
          <span className="rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium">
            {announcement.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/75">
          {announcement.content}
        </p>
      </section>

      <section
        aria-labelledby="announcement-publication-heading"
        className="border-t border-foreground/15 pt-5"
      >
        <h3
          id="announcement-publication-heading"
          className="text-xs font-semibold uppercase tracking-wide text-foreground/50"
        >
          Publication
        </h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Detail
            label="Audience"
            value={formatAnnouncementAudience(announcement)}
          />
          {announcement.department ? (
            <Detail label="Department" value={announcement.department.name} />
          ) : null}
          {announcement.branch ? (
            <Detail label="Branch" value={announcement.branch.name} />
          ) : null}
          <Detail
            label="Published"
            value={formatAnnouncementTimestamp(announcement.publishedAt)}
            dateTime={announcement.publishedAt}
          />
          <Detail
            label="Expires"
            value={
              announcement.expiresAt
                ? formatAnnouncementTimestamp(announcement.expiresAt)
                : "No expiration"
            }
            dateTime={announcement.expiresAt ?? undefined}
          />
          <Detail label="Author" value={announcement.createdBy.name} />
        </dl>
      </section>
    </div>
  );
}

function Detail({
  label,
  value,
  dateTime,
}: {
  label: string;
  value: string;
  dateTime?: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-foreground/55">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-5 [overflow-wrap:anywhere]">
        {dateTime ? <time dateTime={dateTime}>{value}</time> : value}
      </dd>
    </div>
  );
}
