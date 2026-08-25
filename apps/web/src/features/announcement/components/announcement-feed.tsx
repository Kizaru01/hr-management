import type { Announcement } from "../types/announcement";
import {
  formatAnnouncementAudience,
  formatAnnouncementTimestamp,
} from "../utils/announcement-formatters";

interface AnnouncementFeedProps {
  announcements: Announcement[];
}

export const AnnouncementFeed = ({
  announcements,
}: AnnouncementFeedProps) => {
  if (announcements.length === 0) {
    return (
      <section className="rounded-lg border p-8 text-center shadow-sm">
        <p className="text-sm text-gray-600">No announcements available.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {announcements.map((announcement) => (
        <article
          key={announcement.id}
          className="rounded-lg border p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-lg font-semibold">{announcement.title}</h2>
            <span className="w-fit shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {formatAnnouncementAudience(announcement)}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {announcement.content}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t pt-4 text-xs text-gray-600">
            <span>
              Published {formatAnnouncementTimestamp(announcement.publishedAt)}
            </span>
            {announcement.expiresAt ? (
              <span>
                Expires {formatAnnouncementTimestamp(announcement.expiresAt)}
              </span>
            ) : null}
            <span>Created by {announcement.createdBy.name}</span>
          </div>
        </article>
      ))}
    </section>
  );
};
