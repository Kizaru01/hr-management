"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { markAllNotificationsAsRead } from "../api/mark-all-notifications-as-read";
import { markNotificationAsRead } from "../api/mark-notification-as-read";
import type { Notification } from "../types/notification";
import {
  formatNotificationTimestamp,
  notificationTypeLabels,
} from "../utils/notification-formatters";
import { isRecentlyPublished } from "../utils/isRecently-published";

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">
            {unreadCount === 0
              ? "No unread notifications"
              : `${unreadCount} unread`}
          </p>
        </div>

        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={hasPendingMutation}
            className="w-fit rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isMarkingAll ? "Marking all..." : "Mark all as read"}
          </button>
        ) : null}
      </div>

      {feedback ? (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-lg border shadow-sm">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-600">
            No notifications yet.
          </p>
        ) : (
          <ul className="divide-y">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`border-l-4 p-5 ${
                  notification.isRead
                    ? "border-l-transparent bg-white"
                    : "border-l-black bg-gray-50"
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
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          New
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {notification.isRead ? "Read" : "Unread"}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {formatNotificationTimestamp(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.isRead ? (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={hasPendingMutation}
                      className="shrink-0 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingNotificationId === notification.id
                        ? "Marking..."
                        : "Mark as read"}
                    </button>
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
