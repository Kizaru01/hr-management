import type { EmployeeAttendanceSummary as EmployeeAttendanceSummaryData } from "../types/attendance";
import { EmployeeAttendanceRangeFilter } from "./employee-attendance-range-filter";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

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
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(([label, key]) => (
              <div key={key}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold">{summary[key]}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title={hasInvalidOrder ? "Invalid date range" : "Select a date range"}
          description={
            hasInvalidOrder
              ? "The start date must be on or before the end date."
              : "Choose a start and end date to view attendance totals."
          }
        />
      )}
    </section>
  );
};
