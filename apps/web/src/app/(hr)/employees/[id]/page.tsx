import { EmployeeAttendanceHistory } from "@/features/attendance/components/employee-attendance-history";
import { EmployeeAttendanceSummary } from "@/features/attendance/components/employee-attendance-summary";
import { getEmployeeAttendanceHistory } from "@/features/attendance/server/get-employee-attendance-history";
import { getEmployeeAttendanceSummary } from "@/features/attendance/server/get-employee-attendance-summary";
import { normalizeAttendanceDate } from "@/features/attendance/utils/normalize-attendance-date";
import { EmployeeProfile } from "@/features/employee/components/employee-profile";
import { EmployeeRecordActionLinks } from "@/features/employee/components/employee-record-action-links";
import { getEmployee } from "@/features/employee/server/get-employee";
import { getEmployees } from "@/features/employee/server/get-employees";
import { EmployeeDocumentsList } from "@/features/employee-document/components/employee-documents-list";
import { getEmployeeDocuments } from "@/features/employee-document/server/get-employee-documents";
import { getEmployeeDocumentReferenceDate } from "@/features/employee-document/utils/employee-document-formatters";
import { PerformanceReviewsList } from "@/features/performance-review/components/performance-reviews-list";
import { getEmployeePerformanceReviews } from "@/features/performance-review/server/get-employee-performance-reviews";
import { EmployeeShiftHistory } from "@/features/shift/components/employee-shift-history";
import { getEmployeeShiftAssignments } from "@/features/shift/server/get-employee-shift-assignments";

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

  const [
    employee,
    employees,
    documents,
    performanceReviews,
    shiftAssignments,
    attendanceSummary,
    attendanceHistory,
  ] =
    await Promise.all([
      getEmployee(id),
      getEmployees(),
      getEmployeeDocuments(id),
      getEmployeePerformanceReviews(id),
      getEmployeeShiftAssignments(id),
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
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Employee actions</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open a focused task without leaving this employee&apos;s record
            context.
          </p>
        </div>
        <EmployeeRecordActionLinks employeeId={id} />
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Shift Schedule</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review this employee&apos;s complete assignment history.
          </p>
        </div>
        <EmployeeShiftHistory assignments={shiftAssignments.data} />
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Performance Reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View this employee&apos;s complete review history.
          </p>
        </div>
        <PerformanceReviewsList reviews={performanceReviews.data} />
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Employee Documents</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            View, download, and deactivate this employee&apos;s active
            documents.
          </p>
        </div>
        <EmployeeDocumentsList
          documents={documents.data}
          referenceDate={getEmployeeDocumentReferenceDate()}
          canDeactivate
        />
      </section>
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
