"use client";

import Link from "next/link";
import { Bell, Menu, UsersRound } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonStyles } from "@/components/ui/button";
import type { CurrentUser } from "@/features/auth/server/get-current-user";
import { EmployeeNavigation } from "./employee-sidebar";

interface EmployeeHeaderProps {
  user: CurrentUser;
  unreadCount: number;
}

export function EmployeeHeader({ user, unreadCount }: EmployeeHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <details className="group relative lg:hidden">
          <summary className="flex size-9 list-none items-center justify-center rounded-control border border-border bg-surface text-secondary-foreground hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" size={18} />
            <span className="sr-only">Open navigation</span>
          </summary>
          <div className="absolute left-0 top-12 max-h-[calc(100dvh-5rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-container border border-border bg-elevated p-2 shadow-overlay">
            <div className="flex items-center gap-3 border-b border-border px-3 pb-3 pt-1">
              <span className="flex size-8 items-center justify-center rounded-control border border-border bg-surface text-info">
                <UsersRound aria-hidden="true" size={17} />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">HRMS</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <EmployeeNavigation compact />
          </div>
        </details>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Employee portal</p>
          <p className="truncate text-sm font-medium">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/employee/notifications"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className={buttonStyles({
            variant: "secondary",
            size: "icon",
            className: "relative bg-surface",
          })}
        >
          <Bell aria-hidden="true" size={17} />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-info px-1 text-[10px] font-semibold leading-4 text-info-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
