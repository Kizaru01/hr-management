import type { LeaveStatus, LeaveType } from '../generated/prisma/client.js';

export type EmployeeLeave = {
  id: string;
  leaveType: LeaveType;
  reason: string;
  startDate: Date;
  endDate: Date;
  status: LeaveStatus;
  remarks: string | null;
  createdAt: Date;
};

export type ManagedLeave = EmployeeLeave & {
  employee: {
    id: string;
    employeeNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
};

export function mapEmployeeLeave(leave: EmployeeLeave): EmployeeLeave {
  return {
    id: leave.id,
    leaveType: leave.leaveType,
    reason: leave.reason,
    startDate: leave.startDate,
    endDate: leave.endDate,
    status: leave.status,
    remarks: leave.remarks,
    createdAt: leave.createdAt,
  };
}

export function mapManagedLeave(leave: ManagedLeave): ManagedLeave {
  return {
    id: leave.id,
    employee: {
      id: leave.employee.id,
      employeeNumber: leave.employee.employeeNumber,
      firstName: leave.employee.firstName,
      middleName: leave.employee.middleName,
      lastName: leave.employee.lastName,
    },
    leaveType: leave.leaveType,
    reason: leave.reason,
    startDate: leave.startDate,
    endDate: leave.endDate,
    status: leave.status,
    remarks: leave.remarks,
    createdAt: leave.createdAt,
  };
}
