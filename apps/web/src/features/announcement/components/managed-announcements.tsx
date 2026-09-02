"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
      <EmptyState
        title="No announcements found"
        description="Create an announcement to publish it across the organization."
      />
    );
  }

  return (
    <section aria-label="Managed announcements" className="table-shell">
      <div
        className={`hidden gap-4 border-b border-border bg-hover px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid ${desktopColumns}`}
      >
        <span>Announcement</span>
        <span>Audience</span>
        <span>Status</span>
        <span>Published</span>
        <span>Author</span>
      </div>

      <ul className="divide-y divide-border">
        {announcements.map((announcement) => {
          const isSelected = selectedAnnouncementId === announcement.id;

          return (
            <li key={announcement.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-controls="announcement-sheet"
                aria-expanded={isSelected}
                onClick={(event) => onSelect(announcement, event.currentTarget)}
                className={`group grid w-full min-w-0 gap-4 px-4 py-4 text-left transition sm:px-5 md:items-center ${desktopColumns} ${
                  isSelected ? "bg-selected" : "hover:bg-hover"
                } focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {announcement.title}
                  </span>
                  <span className="mt-1 line-clamp-2 block whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                    {announcement.content}
                  </span>
                </span>

                <span className="text-sm text-secondary-foreground">
                  {formatAnnouncementAudience(announcement)}
                </span>

                <span>
                  <Badge
                    variant={announcement.isActive ? "success" : "neutral"}
                  >
                    {announcement.isActive ? "Active" : "Inactive"}
                  </Badge>
                </span>

                <time
                  dateTime={announcement.publishedAt}
                  className="text-sm text-secondary-foreground"
                >
                  {formatAnnouncementTimestamp(announcement.publishedAt)}
                </time>

                <span className="flex min-w-0 items-center justify-between gap-3">
                  <span className="truncate text-sm text-secondary-foreground">
                    {announcement.createdBy.name}
                  </span>
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
      </ul>
    </section>
  );
};
