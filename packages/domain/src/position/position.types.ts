import type { DepartmentId } from "../department/department.types.js";

export type PositionId = string;

export interface Position {
  id: PositionId;
  departmentId: DepartmentId;
  name: string;
}