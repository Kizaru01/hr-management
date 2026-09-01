import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { getUnreadNotificationCount } from "@/features/notification/server/get-unread-count";
import { EmployeeHeader } from "@/features/layout/components/employee-header";
import { EmployeeSidebar } from "@/features/layout/components/employee-sidebar";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default async function EmployeeLayout({
  children,
}: EmployeeLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "employee") {
    redirect("/dashboard");
  }

  const notificationResponse = await getUnreadNotificationCount();

  return (
    <div className="min-h-screen bg-background">
      <EmployeeSidebar user={user} />
      <div className="lg:pl-60">
        <EmployeeHeader
          user={user}
          unreadCount={notificationResponse.data.count}
        />
        <main className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 sm:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
