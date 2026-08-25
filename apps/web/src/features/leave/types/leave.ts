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

export interface ManagedLeaveRequest extends EmployeeLeaveRequest {
  employee: {
    id: string;
    employeeNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
}

export interface LeaveDecision<
  TStatus extends "approved" | "rejected",
> {
  id: string;
  status: TStatus;
  remarks: string | null;
}

export type CreateEmployeeLeaveInput = CreateLeaveInput;
