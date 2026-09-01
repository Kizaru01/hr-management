import type { DailyAttendanceRecord } from "../types/attendance";
import { AttendanceRow } from "./attendance-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableShell } from "@/components/ui/table";

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
      <EmptyState
        title={emptyMessage}
        description="There are no daily attendance records to display."
      />
    );
  }

  return (
    <TableShell>
      <Table className="min-w-[720px]">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="whitespace-nowrap">
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
      </Table>
    </TableShell>
  );
};
