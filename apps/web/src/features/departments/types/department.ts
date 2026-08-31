export interface DepartmentHead {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  departmentHead: DepartmentHead | null;
  activeEmployeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentHeadOption extends DepartmentHead {
  label: string;
}
