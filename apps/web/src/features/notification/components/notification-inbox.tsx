"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { markAllNotificationsAsRead } from "../api/mark-all-notifications-as-read";
import { markNotificationAsRead } from "../api/mark-notification-as-read";
import type { Notification } from "../types/notification";
import { formatNotificationTimestamp } from "../utils/notification-formatters";
import { isRecentlyPublished } from "../utils/isRecently-published";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";

interface NotificationInboxProps {
  notifications: Notification[];
  unreadCount: number;
}

type Feedback = {
  type: "success" | "error";
  message: string;
};

export const NotificationInbox = ({
  notifications,
  unreadCount,
}: NotificationInboxProps) => {
  const router = useRouter();
  const [pendingNotificationId, setPendingNotificationId] = useState<
    string | null
  >(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleMarkAsRead = async (notificationId: string) => {
    if (pendingNotificationId !== null || isMarkingAll) {
      return;
    }

    setPendingNotificationId(notificationId);
    setFeedback(null);

    try {
      const response = await markNotificationAsRead(notificationId);

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to mark notification as read.",
      });
    } finally {
      setPendingNotificationId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (pendingNotificationId !== null || isMarkingAll || unreadCount === 0) {
      return;
    }

    setIsMarkingAll(true);
    setFeedback(null);

    try {
      const response = await markAllNotificationsAsRead();

      setFeedback({ type: "success", message: response.message });
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof ApiError
            ? error.message
            : "Unable to mark all notifications as read.",
      });
    } finally {
      setIsMarkingAll(false);
    }
  };

  const hasPendingMutation = pendingNotificationId !== null || isMarkingAll;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={
          unreadCount === 0
            ? "No unread notifications"
            : `${unreadCount} unread`
        }
        actions={
          unreadCount > 0 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleMarkAllAsRead}
              disabled={hasPendingMutation}
            >
              {isMarkingAll ? "Marking all..." : "Mark all as read"}
            </Button>
          ) : null
        }
      />

      {feedback ? (
        <Feedback tone={feedback.type}>{feedback.message}</Feedback>
      ) : null}

      <section className="table-shell">
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Updates that need your attention will appear here."
          />
        ) : (
          <ul className="divide-y">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`border-l-4 p-5 ${
                  notification.isRead
                    ? "border-l-transparent bg-surface"
                    : "border-l-info bg-selected"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        className={`text-sm ${
                          notification.isRead ? "font-medium" : "font-semibold"
                        }`}
                      >
                        {notification.title}
                      </h2>
                      {isRecentlyPublished(notification.createdAt) && (
                        <Badge variant="info">New</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-secondary-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatNotificationTimestamp(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.isRead ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={hasPendingMutation}
                    >
                      {pendingNotificationId === notification.id
                        ? "Marking..."
                        : "Mark as read"}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
