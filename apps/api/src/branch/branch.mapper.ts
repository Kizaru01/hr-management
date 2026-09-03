import type { BranchRecord } from './branch.respository.js';

export function mapBranch(branch: BranchRecord) {
  return {
    id: branch.id,
    code: branch.code,
    name: branch.name,
    address: branch.address,
    city: branch.city,
    province: branch.province,
    latitude: branch.latitude === null ? null : Number(branch.latitude),
    longitude: branch.longitude === null ? null : Number(branch.longitude),
    allowedRadius: branch.allowedRadius,
    isActive: branch.isActive,
    activeEmployeeCount: branch._count.employees,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };
}
