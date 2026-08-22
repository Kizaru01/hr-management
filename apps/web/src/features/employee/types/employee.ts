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
  employmentType: string;

  manager: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  hireDate?: string;
  departmentId?: string;
  positionId?: string;
  branchId?: string;
  employmentType?: string;
}
export interface LookupOption {
  label: string;
  value: string;
}
