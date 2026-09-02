import { EmployeeAttendanceHistory } from "@/features/attendance/components/employee-attendance-history";
import { EmployeeAttendanceSummary } from "@/features/attendance/components/employee-attendance-summary";
import { TodayAttendanceCard } from "@/features/attendance/components/today-attendance-card";
import { getMyAttendanceHistory } from "@/features/attendance/server/get-my-attendance-history";
import { getMyAttendanceSummary } from "@/features/attendance/server/get-my-attendance-summary";
import { getMyAttendanceStatus } from "@/features/attendance/server/get-my-attendance-status";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";
import { PageHeader } from "@/components/ui/page-header";

export default async function EmployeeAttendancePage({
  searchParams,
}: PageProps<"/employee/attendance">) {
  const query = await searchParams;
  const from = normalizeAttendanceDate(query.from);
  const to = normalizeAttendanceDate(query.to);
  const hasValidRange = from !== undefined && to !== undefined && from <= to;
  const attendanceSummaryRequest = hasValidRange
    ? getMyAttendanceSummary(from, to)
    : Promise.resolve(null);
  const attendanceHistoryRequest = hasValidRange
    ? getMyAttendanceHistory(from, to)
    : Promise.resolve(null);

  const [status, attendanceSummary, attendanceHistory] = await Promise.all([
    getMyAttendanceStatus(),
    attendanceSummaryRequest,
    attendanceHistoryRequest,
  ]);

  return (
    <div className="page-stack mx-auto w-full max-w-5xl">
      <PageHeader
        title="Attendance"
        description="View today's attendance and record your check-in or check-out."
      />

      <TodayAttendanceCard initialStatus={status.data} />

      <EmployeeAttendanceSummary
        summary={attendanceSummary?.data ?? null}
        from={from}
        to={to}
      />

      {attendanceHistory ? (
        <EmployeeAttendanceHistory records={attendanceHistory.data} />
      ) : null}
    </div>
  );
}
