import type { CreateLeaveInput } from "@hr-management/validation";

export type LeaveType = CreateLeaveInput["leaveType"];

export type LeaveStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface EmployeeLeaveRequest {
  id: string;
  leaveType: LeaveType;
  reason: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  remarks: string | null;
  createdAt: string;
}

export type CreateEmployeeLeaveInput = CreateLeaveInput;
