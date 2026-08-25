import type { EmployeeAttendanceSummary as EmployeeAttendanceSummaryData } from "../types/attendance";
import { EmployeeAttendanceRangeFilter } from "./employee-attendance-range-filter";

interface EmployeeAttendanceSummaryProps {
  summary: EmployeeAttendanceSummaryData | null;
  from?: string;
  to?: string;
}

const metrics = [
  ["Total Work Days", "totalWorkDays"],
  ["Present", "present"],
  ["On Time", "onTime"],
  ["Late", "late"],
  ["Undertime", "undertime"],
  ["Absent", "absent"],
  ["On Leave", "onLeave"],
  ["Holidays", "holidays"],
  ["Rest Days", "restDays"],
  ["Total Late Minutes", "totalLateMinutes"],
  ["Total Undertime Minutes", "totalUndertimeMinutes"],
] as const;

export const EmployeeAttendanceSummary = ({
  summary,
  from,
  to,
}: EmployeeAttendanceSummaryProps) => {
  const hasInvalidOrder = Boolean(from && to && from > to);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attendance Summary</h2>
          <p className="text-sm text-muted-foreground">
            Review attendance totals for a selected date range.
          </p>
        </div>

        <EmployeeAttendanceRangeFilter
          key={`${from ?? ""}-${to ?? ""}`}
          from={from}
          to={to}
        />
      </div>

      {summary ? (
        <div className="grid gap-4 rounded-xl border p-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([label, key]) => (
            <div key={key}>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold">{summary[key]}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border px-6 py-8 text-center text-sm text-muted-foreground">
          {hasInvalidOrder
            ? "The start date must be on or before the end date."
            : "Select a date range to view attendance summary."}
        </div>
      )}
    </section>
  );
};
