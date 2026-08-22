
import { getHrDashboard } from '@/features/dashboard/server/get-hr-dashboard';
import { AttendanceOverview } from '@/features/dashboard/components/attendance-overview-card';
import { DashboardStatCard } from '@/features/dashboard/components/dashboard-stat-card';
import { EmployeeOverview } from '@/features/dashboard/components/employee-overview';

export default async function DashboardPage() {
  const response = await getHrDashboard();
  const dashboard = response.data;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of today&apos;s HR activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Total Employees"
          value={dashboard.employees.total}
        />

        <DashboardStatCard
          label="Present Today"
          value={dashboard.attendanceToday.present}
        />

        <DashboardStatCard
          label="Pending Leave"
          value={dashboard.leaveRequests.pending}
        />

        <DashboardStatCard
          label="Unread Notifications"
          value={dashboard.notifications.unread}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AttendanceOverview
          attendance={dashboard.attendanceToday}
        />

        <EmployeeOverview
          employees={dashboard.employees}
          activeAnnouncements={
            dashboard.announcements.active
          }
        />
      </div>
    </section>
  );
}