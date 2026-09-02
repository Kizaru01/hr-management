jest.mock('./dto/create-position.dto.js', () => ({
  CreatePositionDto: class CreatePositionDto {},
}));
jest.mock('./dto/update-position.dto.js', () => ({
  UpdatePositionDto: class UpdatePositionDto {},
}));
jest.mock('@hr-management/domain', () => ({
  normalizeName: (value: string) => value.trim(),
}));

import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ROLES_KEY } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import {
  DepartmentPositionController,
  PositionController,
} from './position.controller.js';

describe('PositionController authorization and actor forwarding', () => {
  const positionService = {
    findActiveLookup: jest.fn(),
    findAllForDepartment: jest.fn(),
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

  it.each([PositionController, DepartmentPositionController])(
    'restricts %p to admin and hr behind both guards',
    (ControllerType) => {
      expect(Reflect.getMetadata(ROLES_KEY, ControllerType)).toEqual([
        'admin',
        'hr',
      ]);
      expect(Reflect.getMetadata(GUARDS_METADATA, ControllerType)).toEqual([
        JwtAuthGuard,
        RolesGuard,
      ]);
    },
  );

  it('forwards the authenticated actor for every mutation', async () => {
    const controller = new PositionController(positionService as never);
    const createInput = {
      name: 'Engineer',
      salary: 90000,
      allowance: 0,
      departmentId: 'department-1',
    };

    await controller.create(user, createInput);
    await controller.update('position-1', user, { name: 'Senior Engineer' });
    await controller.deactivate('position-1', user);
    await controller.reactivate('position-1', user);

    expect(positionService.create).toHaveBeenCalledWith('admin-1', createInput);
    expect(positionService.update).toHaveBeenCalledWith(
      'position-1',
      'admin-1',
      { name: 'Senior Engineer' },
    );
    expect(positionService.deactivate).toHaveBeenCalledWith(
      'position-1',
      'admin-1',
    );
    expect(positionService.reactivate).toHaveBeenCalledWith(
      'position-1',
      'admin-1',
    );
  });

  it('uses the department-scoped reader', async () => {
    const controller = new DepartmentPositionController(
      positionService as never,
    );

    await controller.findAll('department-1');

    expect(positionService.findAllForDepartment).toHaveBeenCalledWith(
      'department-1',
    );
  });
});
