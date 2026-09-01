import type { EmployeeShiftAssignment } from "../types/shift";
import {
  formatShiftDateRange,
  formatShiftSchedule,
  formatShiftWorkDays,
} from "../utils/shift-formatters";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface EmployeeShiftHistoryProps {
  assignments: EmployeeShiftAssignment[];
}

const desktopColumns =
  "md:grid-cols-[minmax(0,1.1fr)_minmax(10rem,0.85fr)_minmax(9rem,0.8fr)_minmax(12rem,1fr)]";

export const EmployeeShiftHistory = ({
  assignments,
}: EmployeeShiftHistoryProps) => (
  <section className="min-w-0 space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Shift Schedule</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review this employee&apos;s complete assignment history.
        </p>
      </div>
      <Badge className="shrink-0 px-2.5 py-1">
        {assignments.length} {assignments.length === 1 ? "record" : "records"}
      </Badge>
    </div>

    {assignments.length === 0 ? (
      <EmptyState
        title="No shift assignments yet"
        description="Assign a shift to begin this employee's schedule history."
      />
    ) : (
      <div className="table-shell">
        <div
          className={`hidden gap-4 border-b border-border bg-hover px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid ${desktopColumns}`}
        >
          <span>Shift</span>
          <span>Schedule</span>
          <span>Work days</span>
          <span>Effective period</span>
        </div>

        <ol className="divide-y divide-border">
          {assignments.map((assignment) => (
            <li
              key={assignment.id}
              className={`grid min-w-0 gap-3 px-4 py-4 text-sm md:items-center md:gap-4 ${desktopColumns}`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">
                    {assignment.shift.name}
                  </p>
                  {!assignment.shift.isActive ? (
                    <Badge variant="neutral">Shift inactive</Badge>
                  ) : null}
                </div>
              </div>

              <p className="text-secondary-foreground">
                {formatShiftSchedule(
                  assignment.shift.startTime,
                  assignment.shift.endTime,
                )}
              </p>

              <p className="text-secondary-foreground">
                {formatShiftWorkDays(assignment.workDays)}
              </p>

              <div>
                <p className="text-secondary-foreground">
                  {formatShiftDateRange(
                    assignment.effectiveFrom,
                    assignment.effectiveTo,
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {assignment.effectiveTo ? "Fixed period" : "Open-ended"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    )}
  </section>
);
