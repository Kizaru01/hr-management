import { EmployeeAttendanceHistory } from "@/features/attendance/components/employee-attendance-history";
import { EmployeeAttendanceSummary } from "@/features/attendance/components/employee-attendance-summary";
import { TodayAttendanceCard } from "@/features/attendance/components/today-attendance-card";
import { getMyAttendanceHistory } from "@/features/attendance/server/get-my-attendance-history";
import { getMyAttendanceSummary } from "@/features/attendance/server/get-my-attendance-summary";
import { getMyAttendanceStatus } from "@/features/attendance/server/get-my-attendance-status";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";

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
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View today&apos;s attendance and record your check-in or check-out.
        </p>
      </div>

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
