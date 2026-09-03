import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "@hr-management/validation";

export interface EmployeeListItem {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  employmentStatus: string;

  department: {
    id: string;
    name: string;
  };

  position: {
    id: string;
    name: string;
  };

  branch: {
    id: string;
    name: string;
  } | null;
}

export interface EmployeeDetails extends EmployeeListItem {
  phoneNumber: string | null;
  hireDate: string;
  employmentType: NonNullable<UpdateEmployeeInput["employmentType"]>;
  manager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  user: {
    id: string;
    status: "pending" | "active" | "suspended" | "disabled";
  } | null;
}

export interface CreatedEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  hireDate: string;
  employmentType: CreateEmployeeInput["employmentType"];
  employmentStatus: string;
  departmentId: string;
  positionId: string;
  branchId: string;
  userId: string;
  invitationSent: boolean;
}

export interface LookupOption {
  label: string;
  value: string;
}
export interface ManagerOption {
  id: string;
  name: string;
}
