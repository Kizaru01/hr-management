import { AttendanceDateFilter } from "@/features/attendance/components/attendance-date-filter";
import { AttendanceSummary } from "@/features/attendance/components/attendance-summary";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { getAttendanceSummary } from "@/features/attendance/server/get-attendance-summary";
import { getDailyAttendance } from "@/features/attendance/server/get-daily-attendance";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";
import { PageHeader } from "@/components/ui/page-header";

export default async function AttendancePage({
  searchParams,
}: PageProps<"/attendance">) {
  const date = normalizeAttendanceDate((await searchParams).date);
  const [summaryResponse, dailyResponse] = await Promise.all([
    getAttendanceSummary(date),
    getDailyAttendance(date),
  ]);

  return (
    <section className="page-stack">
      <PageHeader
        title="Attendance"
        description="Review company attendance by work date."
        actions={<AttendanceDateFilter selectedDate={date} />}
      />

      <AttendanceSummary attendance={summaryResponse.data} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Daily Attendance</h2>
        <AttendanceTable records={dailyResponse.data} />
      </div>
    </section>
  );
}
