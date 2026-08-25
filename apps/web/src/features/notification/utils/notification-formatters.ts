import type { NotificationType } from "../types/notification";

export const notificationTypeLabels: Record<NotificationType, string> = {
  leave: "Leave",
  document: "Document",
  announcement: "Announcement",
  performance_review: "Performance Review",
  system: "System",
};

const notificationTimestampFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

export const formatNotificationTimestamp = (value: string) =>
  notificationTimestampFormatter.format(new Date(value));
