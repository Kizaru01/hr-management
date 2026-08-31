export interface PositionDepartmentSummary {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface Position {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  department: PositionDepartmentSummary;
  activeEmployeeCount: number;
  createdAt: string;
  updatedAt: string;
}
