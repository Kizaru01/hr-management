export type DepartmentId = string;

export interface Department {
  id: DepartmentId;
  code: string;
  name: string;
  nameKey: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
