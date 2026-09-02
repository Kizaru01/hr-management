jest.mock('@hr-management/domain', () => ({
  normalizeName: (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase()),
}));

import { BadRequestException, ConflictException } from '@nestjs/common';
import { PositionService } from './position.service.js';

describe('PositionService management safeguards', () => {
  const transactionClient = {};
  const positionRepository = {
    findAllForDepartment: jest.fn(),
    findActiveLookup: jest.fn(),
    findById: jest.fn(),
    findByDepartmentAndName: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    ),
  };
  const departmentRepository = {
    findById: jest.fn(),
  };
  const auditLogService = {
    create: jest.fn(),
  };

  let service: PositionService;

  beforeEach(() => {
    jest.clearAllMocks();
    positionRepository.transaction.mockImplementation(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    );
    service = new PositionService(
      positionRepository as never,
      departmentRepository as never,
      auditLogService as never,
    );
  });

  it('returns only the transformed department-scoped management contract', async () => {
    departmentRepository.findById.mockResolvedValue(department());
    positionRepository.findAllForDepartment.mockResolvedValue([
      position({ salary: 90000, allowance: 5000 }),
    ]);

    const response = await service.findAllForDepartment('department-1');

    expect(positionRepository.findAllForDepartment).toHaveBeenCalledWith(
      'department-1',
    );
    expect(response.data[0]).toEqual({
      id: 'position-1',
      name: 'Software Engineer',
      description: 'Builds product software.',
      isActive: true,
      department: {
        id: 'department-1',
        code: 'ENG',
        name: 'Engineering',
        isActive: true,
      },
      activeEmployeeCount: 0,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    });
    expect(response.data[0]).not.toHaveProperty('salary');
    expect(response.data[0]).not.toHaveProperty('allowance');
    expect(response.data[0]).not.toHaveProperty('employees');
  });

  it('rejects creation under an inactive department', async () => {
    departmentRepository.findById.mockResolvedValue(
      department({ isActive: false }),
    );

    await expect(
      service.create('admin-1', createInput()),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(positionRepository.create).not.toHaveBeenCalled();
    expect(auditLogService.create).not.toHaveBeenCalled();
  });

  it('normalizes a name, scopes uniqueness, and writes a safe create audit', async () => {
    departmentRepository.findById.mockResolvedValue(
      department({ id: 'department-2', code: 'OPS', name: 'Operations' }),
    );
    positionRepository.findByDepartmentAndName.mockResolvedValue(null);
    positionRepository.create.mockResolvedValue(
      position({
        departmentId: 'department-2',
        department: {
          id: 'department-2',
          code: 'OPS',
          name: 'Operations',
          isActive: true,
        },
      }),
    );

    await service.create(
      'admin-1',
      createInput({
        departmentId: 'department-2',
        name: ' software ENGINEER ',
      }),
    );

    expect(positionRepository.findByDepartmentAndName).toHaveBeenCalledWith(
      'department-2',
      'Software Engineer',
      transactionClient,
    );
    expect(positionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        departmentId: 'department-2',
        name: 'Software Engineer',
        salary: 90000,
      }),
      transactionClient,
    );
    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'position.create',
        metadata: {
          name: 'Software Engineer',
          departmentId: 'department-2',
          departmentName: 'Operations',
        },
      }),
      transactionClient,
    );
  });

  it('rejects a normalized duplicate within the same department', async () => {
    departmentRepository.findById.mockResolvedValue(department());
    positionRepository.findByDepartmentAndName.mockResolvedValue({
      id: 'existing-position',
    });

    await expect(
      service.create('admin-1', createInput({ name: 'software ENGINEER' })),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(positionRepository.create).not.toHaveBeenCalled();
  });

  it('does not pass a malicious department reassignment to persistence', async () => {
    positionRepository.findById.mockResolvedValue(position());
    positionRepository.findByDepartmentAndName.mockResolvedValue(null);
    positionRepository.update.mockResolvedValue(
      position({ name: 'Staff Engineer' }),
    );

    await service.update('position-1', 'admin-1', {
      name: 'Staff Engineer',
      departmentId: 'department-2',
    } as never);

    expect(positionRepository.update).toHaveBeenCalledWith(
      'position-1',
      { name: 'Staff Engineer' },
      transactionClient,
    );
  });

  it('updates only name and description in the existing department', async () => {
    positionRepository.findById.mockResolvedValue(position());
    positionRepository.findByDepartmentAndName.mockResolvedValue(null);
    positionRepository.update.mockResolvedValue(
      position({ name: 'Senior Engineer', description: null }),
    );

    await service.update('position-1', 'admin-1', {
      name: ' senior ENGINEER ',
      description: '',
    });

    expect(positionRepository.findByDepartmentAndName).toHaveBeenCalledWith(
      'department-1',
      'Senior Engineer',
      transactionClient,
    );
    expect(positionRepository.update).toHaveBeenCalledWith(
      'position-1',
      { name: 'Senior Engineer', description: null },
      transactionClient,
    );
  });

  it('blocks deactivation while active employees are assigned', async () => {
    positionRepository.findById.mockResolvedValue(
      position({ _count: { employees: 2 } }),
    );

    await expect(service.deactivate('position-1', 'admin-1')).rejects.toThrow(
      'Reassign them first.',
    );
    expect(positionRepository.update).not.toHaveBeenCalled();
  });

  it('deactivates an unassigned position and audits the lifecycle change', async () => {
    positionRepository.findById.mockResolvedValue(position());
    positionRepository.update.mockResolvedValue(position({ isActive: false }));

    await service.deactivate('position-1', 'admin-1');

    expect(positionRepository.update).toHaveBeenCalledWith(
      'position-1',
      { isActive: false },
      transactionClient,
    );
    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'position.deactivate' }),
      transactionClient,
    );
  });

  it('rejects reactivation while the parent department is inactive', async () => {
    positionRepository.findById.mockResolvedValue(
      position({
        isActive: false,
        department: {
          id: 'department-1',
          code: 'ENG',
          name: 'Engineering',
          isActive: false,
        },
      }),
    );

    await expect(
      service.reactivate('position-1', 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(positionRepository.update).not.toHaveBeenCalled();
  });
});

function department(
  overrides: Partial<{
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  }> = {},
) {
  return {
    id: 'department-1',
    code: 'ENG',
    name: 'Engineering',
    isActive: true,
    ...overrides,
  };
}

function position(overrides: Record<string, unknown> = {}) {
  return {
    id: 'position-1',
    name: 'Software Engineer',
    description: 'Builds product software.',
    isActive: true,
    departmentId: 'department-1',
    department: {
      id: 'department-1',
      code: 'ENG',
      name: 'Engineering',
      isActive: true,
    },
    _count: { employees: 0 },
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createInput(
  overrides: Partial<{
    name: string;
    description: string;
    salary: number;
    allowance: number;
    departmentId: string;
  }> = {},
) {
  return {
    name: 'Software Engineer',
    description: 'Builds product software.',
    salary: 90000,
    allowance: 0,
    departmentId: 'department-1',
    ...overrides,
  };
}
