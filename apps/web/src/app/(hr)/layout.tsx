import { getUnreadCount } from "@/features/notification/server/get-unread-count";
import { HrSidebar } from "@/features/layout/components/hr-sidebar";
import { HrHeader } from "@/features/layout/components/hr-header";
import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { redirect } from "next/navigation";

interface HrLayoutProps {
  children: React.ReactNode;
}

export default async function HrLayout({ children }: HrLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && user.role !== "hr") {
    redirect("/employee/dashboard");
  }

  const notificationResponse = await getUnreadCount();

  return (
    <div className="min-h-screen bg-background">
      <HrSidebar user={user} />

      <div className="lg:pl-64">
        <HrHeader user={user} unreadCount={notificationResponse.data.count} />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
