export type NotificationType =
  | "leave"
  | "document"
  | "announcement"
  | "performance_review"
  | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  resourceId: string | null;
  resourceType: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface UnreadNotificationCount {
  count: number;
}

export interface NotificationReadResult {
  id: string;
  isRead: true;
  readAt: string;
}

export interface MarkAllNotificationsReadResult {
  updatedCount: number;
}
