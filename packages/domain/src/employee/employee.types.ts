import type {
  EmploymentStatus,
  EmploymentType,
} from "@hr-management/constants";
import type { DepartmentId } from "../department/department.types.js";
import type { PositionId } from "../position/position.types.js";
import { BranchId } from "../branch/branch.types.js";

export type EmployeeId = string;


export interface Employee {
  id: EmployeeId;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  hireDate: Date;
  departmentId: DepartmentId;
  positionId: PositionId;
  branchId?: BranchId;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
}