import type { DailyAttendanceRecord } from "../types/attendance";
import { AttendanceRow } from "./attendance-row";

interface AttendanceTableProps {
  records: DailyAttendanceRecord[];
  emptyMessage?: string;
}

const headers = [
  "Employee",
  "Status",
  "Check In",
  "Check Out",
  "Late",
  "Undertime",
];

export const AttendanceTable = ({
  records,
  emptyMessage = "No attendance records found.",
}: AttendanceTableProps) => {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border px-6 py-12 text-center">
        <p className="font-medium">{emptyMessage}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no daily attendance records to display.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <AttendanceRow
              key={`${record.employee.id}-${record.workDate}`}
              record={record}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
