import type { DepartmentRecord } from './department.repository.js';

export function mapDepartment(department: DepartmentRecord) {
  return {
    id: department.id,
    code: department.code,
    name: department.name,
    description: department.description,
    isActive: department.isActive,
    departmentHead: department.departmentHead,
    activeEmployeeCount: department._count.employees,
    createdAt: department.createdAt,
    updatedAt: department.updatedAt,
  };
}
