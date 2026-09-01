import type { AttendanceSummaryData } from "../types/attendance";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  attendance: AttendanceSummaryData;
}

const items = [
  ["Total Employees", "totalEmployees"],
  ["Present", "present"],
  ["On Time", "onTime"],
  ["Late", "late"],
  ["Undertime", "undertime"],
  ["Absent", "absent"],
  ["On Leave", "onLeave"],
  ["Rest Days", "restDays"],
  ["Scheduled", "scheduled"],
] as const;

export const AttendanceSummary = ({ attendance }: Props) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {items.map(([label, key]) => (
      <Card key={key}>
        <CardContent>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{attendance[key]}</p>
        </CardContent>
      </Card>
    ))}
  </div>
);
