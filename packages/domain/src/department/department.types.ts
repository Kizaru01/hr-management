export type DepartmentId = string;

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}