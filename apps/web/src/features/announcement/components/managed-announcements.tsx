"use client";

import { ChevronRight } from "lucide-react";
import type { ManagedAnnouncement } from "../types/announcement";
import {
  formatAnnouncementAudience,
  formatAnnouncementTimestamp,
} from "../utils/announcement-formatters";

interface ManagedAnnouncementsProps {
  announcements: ManagedAnnouncement[];
  selectedAnnouncementId?: string;
  onSelect: (
    announcement: ManagedAnnouncement,
    trigger: HTMLButtonElement,
  ) => void;
}

const desktopColumns =
  "md:grid-cols-[minmax(0,1.5fr)_minmax(9rem,0.85fr)_minmax(7rem,0.55fr)_minmax(10rem,0.8fr)_minmax(9rem,0.7fr)]";

export const ManagedAnnouncements = ({
  announcements,
  selectedAnnouncementId,
  onSelect,
}: ManagedAnnouncementsProps) => {
  if (announcements.length === 0) {
    return (
      <div className="rounded-xl border border-foreground/25 px-6 py-12 text-center">
        <p className="font-medium">No announcements found.</p>
        <p className="mt-1 text-sm text-foreground/60">
          Create an announcement to publish it across the organization.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Managed announcements"
      className="overflow-hidden rounded-xl border border-foreground/25"
    >
      <div
        className={`hidden gap-4 border-b border-foreground/20 bg-foreground/5 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/55 md:grid ${desktopColumns}`}
      >
        <span>Announcement</span>
        <span>Audience</span>
        <span>Status</span>
        <span>Published</span>
        <span>Author</span>
      </div>

      <ul className="divide-y divide-foreground/15">
        {announcements.map((announcement) => {
          const isSelected = selectedAnnouncementId === announcement.id;

          return (
            <li key={announcement.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-controls="announcement-sheet"
                aria-expanded={isSelected}
                onClick={(event) =>
                  onSelect(announcement, event.currentTarget)
                }
                className={`group grid w-full min-w-0 gap-4 px-4 py-4 text-left transition sm:px-5 md:items-center ${desktopColumns} ${
                  isSelected ? "bg-foreground/10" : "hover:bg-foreground/5"
                } focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {announcement.title}
                  </span>
                  <span className="mt-1 line-clamp-2 block whitespace-pre-wrap text-xs leading-5 text-foreground/55">
                    {announcement.content}
                  </span>
                </span>

                <span className="text-sm text-foreground/70">
                  {formatAnnouncementAudience(announcement)}
                </span>

                <span>
                  <span className="inline-flex rounded-full border border-foreground/20 bg-foreground/5 px-2 py-0.5 text-xs font-medium">
                    {announcement.isActive ? "Active" : "Inactive"}
                  </span>
                </span>

                <time
                  dateTime={announcement.publishedAt}
                  className="text-sm text-foreground/65"
                >
                  {formatAnnouncementTimestamp(announcement.publishedAt)}
                </time>

                <span className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate text-sm text-foreground/70">
                    {announcement.createdBy.name}
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    size={18}
                    className="shrink-0 text-foreground/45 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground/75"
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
