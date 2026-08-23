import type { AttendanceSummaryData } from "../types/attendance";

interface Props {
  attendance: AttendanceSummaryData;
}

const items = [
  ["Present", "present"],
  ["On Time", "onTime"],
  ["Late", "late"],
  ["Absent", "absent"],
  ["On Leave", "onLeave"],
  ["Rest Days", "restDays"],
] as const;

export const AttendanceSummary = ({ attendance }: Props) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {items.map(([label, key]) => (
      <div key={key} className="rounded-xl border p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{attendance[key]}</p>
      </div>
    ))}
  </div>
);
