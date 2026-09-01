import type { Announcement } from "../types/announcement";
import {
  formatAnnouncementAudience,
  formatAnnouncementTimestamp,
} from "../utils/announcement-formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface AnnouncementFeedProps {
  announcements: Announcement[];
}

export const AnnouncementFeed = ({ announcements }: AnnouncementFeedProps) => {
  if (announcements.length === 0) {
    return (
      <EmptyState
        title="No announcements available"
        description="Published organization updates will appear here."
      />
    );
  }

  return (
    <section className="grid gap-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id}>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="text-lg font-semibold">{announcement.title}</h2>
              <Badge className="shrink-0">
                {formatAnnouncementAudience(announcement)}
              </Badge>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-secondary-foreground">
              {announcement.content}
            </p>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t pt-4 text-xs text-muted-foreground">
              <span>
                Published{" "}
                {formatAnnouncementTimestamp(announcement.publishedAt)}
              </span>
              {announcement.expiresAt ? (
                <span>
                  Expires {formatAnnouncementTimestamp(announcement.expiresAt)}
                </span>
              ) : null}
              <span>Created by {announcement.createdBy.name}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};
