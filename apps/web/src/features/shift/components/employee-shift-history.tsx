import type { EmployeeShiftAssignment } from "../types/shift";
import {
  formatShiftDateRange,
  formatShiftSchedule,
  formatShiftWorkDays,
} from "../utils/shift-formatters";

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
        <h3 className="font-semibold">Assignment history</h3>
        <p className="mt-1 text-sm text-foreground/60">
          Newest effective period first.
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-foreground/20 bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground/65">
        {assignments.length} {assignments.length === 1 ? "record" : "records"}
      </span>
    </div>

    {assignments.length === 0 ? (
      <div className="rounded-xl border border-foreground/25 px-6 py-10 text-center">
        <p className="font-medium">No shift assignments yet.</p>
        <p className="mt-1 text-sm text-foreground/60">
          Assign a shift to begin this employee&apos;s schedule history.
        </p>
      </div>
    ) : (
      <div className="overflow-hidden rounded-xl border border-foreground/25">
        <div
          className={`hidden gap-4 border-b border-foreground/20 bg-foreground/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-foreground/55 md:grid ${desktopColumns}`}
        >
          <span>Shift</span>
          <span>Schedule</span>
          <span>Work days</span>
          <span>Effective period</span>
        </div>

        <ol className="divide-y divide-foreground/15">
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
                    <span className="rounded-full border border-foreground/15 px-2 py-0.5 text-xs text-foreground/50">
                      Shift inactive
                    </span>
                  ) : null}
                </div>
              </div>

              <p className="text-foreground/70">
                {formatShiftSchedule(
                  assignment.shift.startTime,
                  assignment.shift.endTime,
                )}
              </p>

              <p className="text-foreground/70">
                {formatShiftWorkDays(assignment.workDays)}
              </p>

              <div>
                <p className="text-foreground/70">
                  {formatShiftDateRange(
                    assignment.effectiveFrom,
                    assignment.effectiveTo,
                  )}
                </p>
                <p className="mt-0.5 text-xs text-foreground/50">
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
