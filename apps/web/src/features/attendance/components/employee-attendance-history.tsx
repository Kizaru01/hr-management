import type { EmployeeAttendanceHistoryRecord } from "../types/attendance";
import {
  attendanceRecordStatusLabels,
  formatAttendanceDate,
  formatAttendanceMinutes,
  formatAttendanceTime,
} from "../utils/attendance-formatters";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableShell } from "@/components/ui/table";

interface EmployeeAttendanceHistoryProps {
  records: EmployeeAttendanceHistoryRecord[];
}

const headers = [
  "Date",
  "Status",
  "Check In",
  "Check Out",
  "Late",
  "Undertime",
];

export const EmployeeAttendanceHistory = ({
  records,
}: EmployeeAttendanceHistoryProps) => (
  <section className="space-y-3">
    <h2 className="text-lg font-semibold">Attendance History</h2>

    {records.length === 0 ? (
      <EmptyState
        title="No attendance records found"
        description="There are no records for the selected date range."
      />
    ) : (
      <TableShell>
        <Table className="min-w-[680px]">
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
              <tr
                key={`${record.workDate}-${record.checkInAt}`}
                className="last:border-0"
              >
                <td className="whitespace-nowrap px-4 py-4">
                  {formatAttendanceDate(record.workDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-medium">
                  {attendanceRecordStatusLabels[record.status]}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {formatAttendanceTime(record.checkInAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {record.checkOutAt
                    ? formatAttendanceTime(record.checkOutAt)
                    : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {formatAttendanceMinutes(record.lateMinutes)}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  {formatAttendanceMinutes(record.undertimeMinutes)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableShell>
    )}
  </section>
);
