import type {
  AttendanceLeaveType,
  AttendanceRecordStatus,
} from "../types/attendance";

export const attendanceRecordStatusLabels: Record<
  AttendanceRecordStatus,
  string
> = {
  in_progress: "In Progress",
  late: "Late",
  late_and_undertime: "Late & Undertime",
  undertime: "Undertime",
  on_time: "On Time",
};

export const attendanceLeaveTypeLabels: Record<AttendanceLeaveType, string> = {
  vacation: "Vacation",
  sick: "Sick",
  emergency: "Emergency",
  maternity: "Maternity",
  paternity: "Paternity",
  unpaid: "Unpaid",
};

const timeFormatter = new Intl.DateTimeFormat("en-PH", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "Asia/Manila",
});

export const formatAttendanceTime = (value: string) =>
  timeFormatter.format(new Date(value));

export const formatAttendanceDate = (value: string) =>
  dateFormatter.format(new Date(value));

export const formatAttendanceMinutes = (minutes: number) =>
  minutes > 0 ? `${minutes} min` : "—";
