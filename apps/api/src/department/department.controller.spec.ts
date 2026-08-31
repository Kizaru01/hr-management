jest.mock('./dto/create-department.dto', () => ({
  CreateDepartmentDto: class CreateDepartmentDto {},
}));
jest.mock('./dto/update-department.dto', () => ({
  UpdateDepartmentDto: class UpdateDepartmentDto {},
}));

import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { DepartmentController } from './department.controller.js';

describe('DepartmentController authorization and actor forwarding', () => {
  const departmentService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    reactivate: jest.fn(),
  };
  const user = {
    id: 'admin-1',
    email: 'admin@example.com',
    role: 'admin' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('restricts management to admin and hr behind both guards', () => {
    expect(Reflect.getMetadata(ROLES_KEY, DepartmentController)).toEqual([
      'admin',
      'hr',
    ]);
    expect(Reflect.getMetadata(GUARDS_METADATA, DepartmentController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });

  it('forwards the authenticated actor for every mutation', async () => {
    const controller = new DepartmentController(departmentService as never);
    const createInput = { code: 'ENG', name: 'Engineering' };

    await controller.create(user, createInput);
    await controller.update('department-1', user, { name: 'Product' });
    await controller.deactivate('department-1', user);
    await controller.reactivate('department-1', user);

    expect(departmentService.create).toHaveBeenCalledWith(
      'admin-1',
      createInput,
    );
    expect(departmentService.update).toHaveBeenCalledWith(
      'department-1',
      'admin-1',
      { name: 'Product' },
    );
    expect(departmentService.deactivate).toHaveBeenCalledWith(
      'department-1',
      'admin-1',
    );
    expect(departmentService.reactivate).toHaveBeenCalledWith(
      'department-1',
      'admin-1',
    );
  });
});
