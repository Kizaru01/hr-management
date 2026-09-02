"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarClock,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  FileText,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  UserCog,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { CurrentUser } from "@/features/auth/server/get-current-user";
import { cn } from "@/lib/cn";

interface HrSidebarProps {
  user: CurrentUser;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/employees", icon: UsersRound },
  { label: "Departments", href: "/departments", icon: Building2 },
  { label: "Users", href: "/users", icon: UserCog, adminOnly: true },
  { label: "Attendance", href: "/attendance", icon: Clock3 },
  { label: "Shifts", href: "/shifts", icon: CalendarClock },
  { label: "Leave", href: "/leave", icon: CalendarDays },
  { label: "Announcements", href: "/announcements", icon: Megaphone },
  { label: "Documents", href: "/documents", icon: FileText },
  {
    label: "Performance",
    href: "/performance-reviews",
    icon: ChartNoAxesColumnIncreasing,
  },
  { label: "Audit Logs", href: "/audit-logs", icon: ScrollText },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function HrNavigation({
  user,
  compact = false,
}: HrSidebarProps & { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="HR navigation"
      className={cn("space-y-1", compact ? "p-2" : "p-3")}
    >
      {navigation
        .filter((item) => !item.adminOnly || user.role === "admin")
        .map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-3 rounded-control px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-selected text-info"
                  : "text-secondary-foreground hover:bg-hover hover:text-foreground",
              )}
            >
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}

export function HrSidebar({ user }: HrSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
        <span className="flex size-8 items-center justify-center rounded-control border border-border bg-surface text-info">
          <UsersRound aria-hidden="true" size={17} strokeWidth={2} />
        </span>
        <div>
          <p className="font-semibold leading-5">HRMS</p>
          <p className="text-xs text-muted-foreground">People operations</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <HrNavigation user={user} />
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <div className="mb-2 min-w-0 px-2">
          <p className="truncate text-sm font-medium">{user.email}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {user.role}
          </p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
