'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { CurrentUser } from '@/features/dashboard/server/get-current-user';

interface HrSidebarProps {
  user: CurrentUser;
}

const navigation = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Employees',
    href: '/employees',
  },
  {
    label: 'Attendance',
    href: '/attendance',
  },
  {
    label: 'Leave',
    href: '/leave',
  },
  {
    label: 'Announcements',
    href: '/announcements',
  },
  {
    label: 'Documents',
    href: '/documents',
  },
  {
    label: 'Performance',
    href: '/performance-reviews',
  },
  {
    label: 'Audit Logs',
    href: '/audit-logs',
  },
];

export const HrSidebar = ({
  user,
}: HrSidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background lg:flex lg:flex-col">
      <div className="border-b p-6">
        <h1 className="text-xl font-semibold">
          HR Management
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <p className="truncate text-sm font-medium">
          {user.email}
        </p>

        <p className="mb-3 text-xs capitalize text-muted-foreground">
          {user.role}
        </p>

        <LogoutButton />
      </div>
    </aside>
  );
};