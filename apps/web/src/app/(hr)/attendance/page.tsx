import { AttendanceDateFilter } from "@/features/attendance/components/attendance-date-filter";
import { AttendanceSummary } from "@/features/attendance/components/attendance-summary";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { getAttendanceSummary } from "@/features/attendance/server/get-attendance-summary";
import { getDailyAttendance } from "@/features/attendance/server/get-daily-attendance";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";

export default async function AttendancePage({
  searchParams,
}: PageProps<"/attendance">) {
  const date = normalizeAttendanceDate((await searchParams).date);
  const [summaryResponse, dailyResponse] = await Promise.all([
    getAttendanceSummary(date),
    getDailyAttendance(date),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review company attendance by work date.
          </p>
        </div>

        <AttendanceDateFilter selectedDate={date} />
      </div>

      <AttendanceSummary attendance={summaryResponse.data} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Daily Attendance</h2>
        <AttendanceTable records={dailyResponse.data} />
      </div>
    </section>
  );
}
