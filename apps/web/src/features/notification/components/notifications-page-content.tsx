import { getNotifications } from "../server/get-notifications";
import { getUnreadNotificationCount } from "../server/get-unread-count";
import { NotificationInbox } from "./notification-inbox";

export const NotificationsPageContent = async () => {
  const [notificationResponse, unreadCountResponse] = await Promise.all([
    getNotifications(),
    getUnreadNotificationCount(),
  ]);

  return (
    <div className="mx-auto max-w-4xl py-4">
      <NotificationInbox
        notifications={notificationResponse.data}
        unreadCount={unreadCountResponse.data.count}
      />
    </div>
  );
};
