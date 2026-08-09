import type { DepartmentId } from "../department/department.types.js";

export type PositionId = string;

export interface Position {
  id: PositionId;
  name: string;
  description?: string | null;
  salary: number;
  allowance: number;
  isActive: boolean;
  departmentId: DepartmentId;
  createdAt: Date;
  updatedAt: Date;
}