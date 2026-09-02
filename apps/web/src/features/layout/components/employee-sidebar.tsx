"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Clock3,
  FileText,
  LayoutDashboard,
  Megaphone,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { CurrentUser } from "@/features/auth/server/get-current-user";
import { cn } from "@/lib/cn";

interface EmployeeSidebarProps {
  user: CurrentUser;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Attendance", href: "/employee/attendance", icon: Clock3 },
  { label: "Leave", href: "/employee/leave", icon: CalendarDays },
  { label: "Announcements", href: "/employee/announcements", icon: Megaphone },
  { label: "Documents", href: "/employee/documents", icon: FileText },
  {
    label: "Performance",
    href: "/employee/performance-reviews",
    icon: ChartNoAxesColumnIncreasing,
  },
  { label: "Notifications", href: "/employee/notifications", icon: Bell },
  {
    label: "Team attendance",
    href: "/employee/team/attendance",
    icon: UsersRound,
  },
  { label: "Team leave", href: "/employee/team/leave", icon: CalendarDays },
];

export function EmployeeNavigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Employee navigation"
      className={cn("space-y-1", compact ? "p-2" : "p-3")}
    >
      {navigation.map((item) => {
        const isActive =
          item.href === "/employee/dashboard"
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

export function EmployeeSidebar({ user }: EmployeeSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
        <span className="flex size-8 items-center justify-center rounded-control border border-border bg-surface text-info">
          <UsersRound aria-hidden="true" size={17} strokeWidth={2} />
        </span>
        <div>
          <p className="font-semibold leading-5">HRMS</p>
          <p className="text-xs text-muted-foreground">Employee portal</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-2">
        <EmployeeNavigation />
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
