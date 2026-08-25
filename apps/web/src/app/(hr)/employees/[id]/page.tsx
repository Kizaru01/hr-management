import { EmployeeAttendanceHistory } from "@/features/attendance/components/employee-attendance-history";
import { EmployeeAttendanceSummary } from "@/features/attendance/components/employee-attendance-summary";
import { getEmployeeAttendanceHistory } from "@/features/attendance/server/get-employee-attendance-history";
import { getEmployeeAttendanceSummary } from "@/features/attendance/server/get-employee-attendance-summary";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";
import { EmployeeProfile } from "@/features/employee/components/employee-profile";
import { getEmployee } from "@/features/employee/server/get-employee";
import { getEmployees } from "@/features/employee/server/get-employees";

export default async function EmployeePage({
  params,
  searchParams,
}: PageProps<"/employees/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const from = normalizeAttendanceDate(query.from);
  const to = normalizeAttendanceDate(query.to);
  const hasValidRange = from !== undefined && to !== undefined && from <= to;
  const attendanceSummaryRequest = hasValidRange
    ? getEmployeeAttendanceSummary(id, from, to)
    : Promise.resolve(null);
  const attendanceHistoryRequest = hasValidRange
    ? getEmployeeAttendanceHistory(id, from, to)
    : Promise.resolve(null);

  const [employee, employees, attendanceSummary, attendanceHistory] =
    await Promise.all([
      getEmployee(id),
      getEmployees(),
      attendanceSummaryRequest,
      attendanceHistoryRequest,
    ]);

  const managerOptions = employees.data
    .filter((item) => item.id !== id && item.employmentStatus === "active")
    .map((item) => ({
      id: item.id,
      name: `${item.firstName} ${item.lastName}`,
    }));

  return (
    <div className="space-y-6">
      <EmployeeProfile
        employee={employee.data}
        managerOptions={managerOptions}
      />
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
