import type { NotificationType } from '../generated/prisma/client.js';

interface NotificationSource {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  resourceId: string | null;
  resourceType: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

interface NotificationReadSource {
  id: string;
  readAt: Date;
}

export interface PublicNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  resourceId: string | null;
  resourceType: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface NotificationReadResult {
  id: string;
  isRead: true;
  readAt: Date;
}

export function mapNotification(
  notification: NotificationSource,
): PublicNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    resourceId: notification.resourceId,
    resourceType: notification.resourceType,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}

export function mapNotificationReadResult(
  notification: NotificationReadSource,
): NotificationReadResult {
  return {
    id: notification.id,
    isRead: true,
    readAt: notification.readAt,
  };
}
