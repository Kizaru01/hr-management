import type { HrDashboardData } from '../types/dashboard';

interface AttendanceOverviewProps {
  attendance: HrDashboardData['attendanceToday'];
}

export const AttendanceOverview = ({
  attendance,
}: AttendanceOverviewProps) => {
  const items = [
    {
      label: 'On Time',
      value: attendance.onTime,
    },
    {
      label: 'Late',
      value: attendance.late,
    },
    {
      label: 'Undertime',
      value: attendance.undertime,
    },
    {
      label: 'Absent',
      value: attendance.absent,
    },
    {
      label: 'On Leave',
      value: attendance.onLeave,
    },
    {
      label: 'Rest Day',
      value: attendance.restDays,
    },
  ];

  return (
    <div className="rounded-xl border p-5">
      <h2 className="font-semibold">
        Attendance Today
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-sm text-muted-foreground">
              {item.label}
            </p>

            <p className="text-xl font-semibold">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};