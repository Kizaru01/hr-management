import type { HrDashboardData } from "../types/dashboard";
import { DashboardPanel, DashboardUnavailable } from "./dashboard-panel";

export function AttendanceOverview({
  attendance,
}: {
  attendance: HrDashboardData["attendanceToday"];
}) {
  const items = attendance
    ? [
        {
          label: "Present",
          value: attendance.present,
          color: "bg-success",
          detail: "Checked in for a scheduled workday",
        },
        {
          label: "Absent",
          value: attendance.absent,
          color: "bg-destructive",
          detail: "No check-in after the shift ended",
        },
        {
          label: "Scheduled",
          value: attendance.scheduled,
          color: "bg-info",
          detail: "No check-in; shift has not ended",
        },
        {
          label: "On leave",
          value: attendance.onLeave,
          color: "bg-warning",
          detail: "Approved leave on a scheduled workday",
        },
        {
          label: "Rest day / no shift",
          value: attendance.restDays,
          color: "bg-muted-foreground",
          detail: "No scheduled shift today",
        },
      ]
    : [];
  return (
    <DashboardPanel
      title="Attendance overview"
      description="Today · Asia/Manila"
      href="/attendance"
      linkLabel="View attendance"
    >
      {!attendance ? (
        <DashboardUnavailable label="Attendance" href="/attendance" />
      ) : attendance.holiday ? (
        <div className="rounded-control border border-info-border bg-info-surface p-5">
          <p className="font-medium text-info">{attendance.holiday.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Today is a company holiday. Regular attendance classifications do
            not apply.
          </p>
        </div>
      ) : attendance.totalEmployees === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">
          No active employees to include in today’s attendance.
        </p>
      ) : (
        <>
          <div className="mb-5 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums">
              {attendance.present}
            </span>
            <span className="text-sm text-muted-foreground">
              present / {attendance.totalEmployees} active employees
            </span>
          </div>
          <dl className="space-y-4" aria-label="Today’s attendance breakdown">
            {items.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-sm"
              >
                <dt className="flex items-center gap-2" title={item.detail}>
                  <span
                    aria-hidden="true"
                    className={`size-2 rounded-full ${item.color}`}
                  />
                  {item.label}
                </dt>
                <dd className="contents">
                  <span className="font-medium tabular-nums">{item.value}</span>
                  <div
                    aria-hidden="true"
                    className="col-span-2 h-2 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{
                        width: `${(item.value / attendance.totalEmployees) * 100}%`,
                      }}
                    />
                  </div>
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <p className="font-semibold tabular-nums">{attendance.late}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Late arrivals
              </p>
            </div>
            <div>
              <p className="font-semibold tabular-nums">
                {attendance.undertime}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Left early</p>
            </div>
            <div>
              <p className="font-semibold tabular-nums">{attendance.onTime}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Completed on time
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Present includes late arrivals. Late and early departures can
            overlap. Completed on time requires check-out with no late or
            undertime minutes. Absence starts only after the scheduled shift
            ends; approved leave and rest days are excluded.
          </p>
        </>
      )}
      <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
        Today-only view: historical employment status is not available for a
        reliable 7-day comparison. Attendance follows the existing
        active-employee, shift, leave and holiday rules.
      </p>
    </DashboardPanel>
  );
}
