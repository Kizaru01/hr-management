'use client';

import { CurrentUser } from "@/features/auth/server/get-current-user";

interface HrHeaderProps {
  user: CurrentUser;
  unreadCount: number;
}

export const HrHeader = ({
  user,
  unreadCount,
}: HrHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div>
        <p className="text-xs text-muted-foreground">
          Welcome back
        </p>

        <p className="text-sm font-medium">
          {user.email}
        </p>
      </div>

      <button
        type="button"
        className="relative rounded-md border px-3 py-2 text-sm"
      >
        Notifications

        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 text-xs text-background">
            {unreadCount}
          </span>
        )}
      </button>
    </header>
  );
};