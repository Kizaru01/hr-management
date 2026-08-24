import type {
  LeaveStatus,
  LeaveType,
  ManagedLeaveRequest,
} from "../types/leave";

export const leaveTypeLabels: Record<LeaveType, string> = {
  vacation: "Vacation",
  sick: "Sick",
  emergency: "Emergency",
  maternity: "Maternity",
  paternity: "Paternity",
  unpaid: "Unpaid",
};

export const leaveStatusLabels: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const dateOnlyFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const requestedAtFormatter = new Intl.DateTimeFormat("en-PH", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Manila",
});

export const formatLeaveDate = (value: string) =>
  dateOnlyFormatter.format(new Date(value));

export const formatLeaveDateRange = (startDate: string, endDate: string) =>
  `${formatLeaveDate(startDate)} – ${formatLeaveDate(endDate)}`;

export const formatLeaveRequestedAt = (value: string) =>
  requestedAtFormatter.format(new Date(value));

export const formatLeaveEmployeeName = (
  employee: ManagedLeaveRequest["employee"],
) =>
  [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
