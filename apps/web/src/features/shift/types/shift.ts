import type { AssignShiftInput } from "@hr-management/validation";

export type ShiftWeekday = AssignShiftInput["workDays"][number];

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShiftSummary = Pick<
  Shift,
  "id" | "name" | "startTime" | "endTime" | "isActive"
>;

export type ShiftOption = Pick<
  Shift,
  "id" | "name" | "startTime" | "endTime"
>;

export interface EmployeeShiftAssignment {
  id: string;
  workDays: ShiftWeekday[];
  employeeId: string;
  shiftId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  shift: Shift;
}
