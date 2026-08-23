import { getCompanyAttendance } from "@/features/attendance/server/get-company-attendance";
import { AttendanceSummary } from "@/features/attendance/components/attendance-summary";

export default async function AttendancePage() {
  const { data } = await getCompanyAttendance();

  return <AttendanceSummary attendance={data} />;
}
