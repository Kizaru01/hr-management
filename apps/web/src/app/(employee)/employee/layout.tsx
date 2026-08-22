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

  return <>{children}</>;
}