import { AttendanceDateFilter } from "@/features/attendance/components/attendance-date-filter";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { getMyTeamDailyAttendance } from "@/features/attendance/server/get-my-team-daily-attendance";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";

interface TeamAttendancePageProps {
  searchParams: Promise<{
    date?: string | string[];
  }>;
}

export default async function TeamAttendancePage({
  searchParams,
}: TeamAttendancePageProps) {
  const date = normalizeAttendanceDate((await searchParams).date);
  const response = await getMyTeamDailyAttendance(date);

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team Attendance</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review daily attendance for your direct reports.
          </p>
        </div>

        <AttendanceDateFilter selectedDate={date} />
      </div>

      <AttendanceTable
        records={response.data}
        emptyMessage="No team attendance records found for this date."
      />
    </section>
  );
}
