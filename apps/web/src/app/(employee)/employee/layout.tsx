import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/features/auth/server/get-current-user';

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default async function EmployeeLayout({
  children,
}: EmployeeLayoutProps) {
  const user = await getCurrentUser();

if (!user) {
  redirect('/login');
}

if (user.role !== 'employee') {
  redirect('/dashboard');
}

  return (
    <>
      <nav
        aria-label="Employee navigation"
        className="flex justify-end gap-2 border-b bg-background px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link
          href="/employee/performance-reviews"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Performance Reviews
        </Link>
        <Link
          href="/employee/notifications"
          className="rounded-md border px-3 py-2 text-sm"
        >
          Notifications
        </Link>
      </nav>

      {children}
    </>
  );
}
