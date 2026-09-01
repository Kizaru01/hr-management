import { AttendanceDateFilter } from "@/features/attendance/components/attendance-date-filter";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { getMyTeamDailyAttendance } from "@/features/attendance/server/get-my-team-daily-attendance";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";
import { PageHeader } from "@/components/ui/page-header";

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
    <section className="page-stack mx-auto w-full max-w-6xl">
      <PageHeader
        title="Team Attendance"
        description="Review daily attendance for your direct reports."
        actions={<AttendanceDateFilter selectedDate={date} />}
      />

      <AttendanceTable
        records={response.data}
        emptyMessage="No team attendance records found for this date."
      />
    </section>
  );
}
