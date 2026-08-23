import type { EmployeeAttendanceHistoryRecord } from "../types/attendance";
import {
  attendanceRecordStatusLabels,
  formatAttendanceDate,
  formatAttendanceMinutes,
  formatAttendanceTime,
} from "../utils/attendance-formatters";

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
      <div className="rounded-xl border px-6 py-8 text-center text-sm text-muted-foreground">
        No attendance records found for this date range.
      </div>
    ) : (
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
              <tr
                key={`${record.workDate}-${record.checkInAt}`}
                className="border-b last:border-0"
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
        </table>
      </div>
    )}
  </section>
);
