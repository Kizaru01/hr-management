import type { DailyAttendanceRecord } from "../types/attendance";
import {
  attendanceLeaveTypeLabels,
  attendanceRecordStatusLabels,
  formatAttendanceTime,
} from "../utils/attendance-formatters";
import { Badge, type BadgeVariant } from "@/components/ui/badge";

interface AttendanceRowProps {
  record: DailyAttendanceRecord;
}

const statusLabels: Record<DailyAttendanceRecord["status"], string> = {
  holiday: "Holiday",
  rest_day: "Rest Day",
  on_leave: "On Leave",
  absent: "Absent",
  scheduled: "Scheduled",
  ...attendanceRecordStatusLabels,
};

const getStatusDetail = (record: DailyAttendanceRecord) => {
  switch (record.status) {
    case "holiday":
      return record.holiday.name;
    case "on_leave":
      return `${attendanceLeaveTypeLabels[record.leave.leaveType]} Leave`;
    default:
      return null;
  }
};

const getAttendanceDetails = (record: DailyAttendanceRecord) => {
  switch (record.status) {
    case "in_progress":
    case "late":
    case "late_and_undertime":
    case "undertime":
    case "on_time":
      return {
        checkIn: formatAttendanceTime(record.checkInAt),
        checkOut: record.checkOutAt
          ? formatAttendanceTime(record.checkOutAt)
          : "—",
        late: `${record.lateMinutes} min`,
        undertime: `${record.undertimeMinutes} min`,
      };
    default:
      return {
        checkIn: "—",
        checkOut: "—",
        late: "—",
        undertime: "—",
      };
  }
};

export const AttendanceRow = ({ record }: AttendanceRowProps) => {
  const employeeName = [
    record.employee.firstName,
    record.employee.middleName,
    record.employee.lastName,
  ]
    .filter(Boolean)
    .join(" ");
  const statusDetail = getStatusDetail(record);
  const attendanceDetails = getAttendanceDetails(record);
  const statusVariant: BadgeVariant =
    record.status === "on_time" || record.status === "in_progress"
      ? "success"
      : record.status === "late" ||
          record.status === "undertime" ||
          record.status === "late_and_undertime" ||
          record.status === "scheduled"
        ? "warning"
        : record.status === "absent"
          ? "destructive"
          : record.status === "on_leave" || record.status === "holiday"
            ? "info"
            : "neutral";

  return (
    <tr>
      <td>
        <p className="font-medium">{employeeName}</p>
        <p className="text-xs text-muted-foreground">
          {record.employee.employeeNumber}
        </p>
      </td>

      <td>
        <Badge variant={statusVariant}>{statusLabels[record.status]}</Badge>
        {statusDetail ? (
          <p className="text-xs text-muted-foreground">{statusDetail}</p>
        ) : null}
      </td>

      <td className="whitespace-nowrap">{attendanceDetails.checkIn}</td>
      <td className="whitespace-nowrap">{attendanceDetails.checkOut}</td>
      <td className="whitespace-nowrap">{attendanceDetails.late}</td>
      <td className="whitespace-nowrap">{attendanceDetails.undertime}</td>
    </tr>
  );
};
