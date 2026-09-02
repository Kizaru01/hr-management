import type { PositionRecord } from './position.repository.js';

export function mapPosition(position: PositionRecord) {
  return {
    id: position.id,
    name: position.name,
    description: position.description,
    isActive: position.isActive,
    department: position.department,
    activeEmployeeCount: position._count.employees,
    createdAt: position.createdAt,
    updatedAt: position.updatedAt,
  };
}
