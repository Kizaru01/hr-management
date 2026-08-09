import type {
  EmploymentStatus,
  EmploymentType,
} from "@hr-management/constants";
import type { DepartmentId } from "../department/department.types.js";
import type { PositionId } from "../position/position.types.js";
import { BranchId } from "../branch/index.js";

export type EmployeeId = string;

export interface Employee {
  id: EmployeeId;
  employeeId: string;

  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;

  phoneNumber?: string | null;
  avatar?: string | null;

  hireDate: Date;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;

  departmentId: DepartmentId;
  positionId: PositionId;

  branchId: BranchId;

  createdAt: Date;
  updatedAt: Date;
}
