import { getUnreadNotificationCount } from "@/features/notification/server/get-unread-count";
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

  const notificationResponse = await getUnreadNotificationCount();

  return (
    <div className="min-h-screen bg-background">
      <HrSidebar user={user} />

      <div className="lg:pl-60">
        <HrHeader user={user} unreadCount={notificationResponse.data.count} />

        <main className="mx-auto w-full max-w-[1920px] px-4 py-6 sm:px-6 sm:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
