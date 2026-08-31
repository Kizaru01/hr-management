import { BadRequestException, ConflictException } from '@nestjs/common';
import { DepartmentService } from './department.service.js';

describe('DepartmentService management safeguards', () => {
  const transactionClient = {};
  const departmentRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCode: jest.fn(),
    findByName: jest.fn(),
    findEmployeeForHead: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    ),
  };
  const auditLogService = { create: jest.fn() };

  let service: DepartmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    departmentRepository.transaction.mockImplementation(
      async (
        operation: (transaction: typeof transactionClient) => Promise<unknown>,
      ) => operation(transactionClient),
    );
    departmentRepository.findByCode.mockResolvedValue(null);
    departmentRepository.findByName.mockResolvedValue(null);
    service = new DepartmentService(
      departmentRepository as never,
      auditLogService as never,
    );
  });

  it('returns a transformed contract without internal uniqueness fields', async () => {
    departmentRepository.findAll.mockResolvedValue([department()]);

    const response = await service.findAll();

    expect(response.data[0]).toEqual({
      id: 'department-1',
      code: 'ENG',
      name: 'Engineering',
      description: 'Builds the product.',
      isActive: true,
      departmentHead: null,
      activeEmployeeCount: 0,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    });
    expect(response.data[0]).not.toHaveProperty('nameKey');
    expect(response.data[0]).not.toHaveProperty('departmentHeadId');
  });

  it('normalizes code and name-key and writes a safe create audit', async () => {
    departmentRepository.create.mockResolvedValue(department());

    await service.create('admin-1', {
      code: ' eng ',
      name: ' Engineering ',
      description: ' Builds the product. ',
    });

    expect(departmentRepository.create).toHaveBeenCalledWith(
      {
        code: 'ENG',
        name: 'Engineering',
        nameKey: 'ENGINEERING',
        description: 'Builds the product.',
      },
      transactionClient,
    );
    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'department.create',
        metadata: { code: 'ENG', name: 'Engineering' },
      }),
      transactionClient,
    );
  });

  it('rejects a duplicate normalized department name', async () => {
    departmentRepository.findByName.mockResolvedValue({ id: 'department-2' });

    await expect(
      service.create('admin-1', { code: 'ENG', name: 'Engineering' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(departmentRepository.create).not.toHaveBeenCalled();
  });

  it('requires an active employee as department head', async () => {
    departmentRepository.findEmployeeForHead.mockResolvedValue({
      id: 'employee-1',
      employmentStatus: 'terminated',
      headedDepartment: null,
    });

    await expect(
      service.create('admin-1', {
        code: 'ENG',
        name: 'Engineering',
        departmentHeadId: 'employee-1',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents one employee from heading two departments', async () => {
    departmentRepository.findEmployeeForHead.mockResolvedValue({
      id: 'employee-1',
      employmentStatus: 'active',
      headedDepartment: { id: 'department-2' },
    });

    await expect(
      service.create('admin-1', {
        code: 'ENG',
        name: 'Engineering',
        departmentHeadId: 'employee-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('records a separate head-assignment audit', async () => {
    departmentRepository.findEmployeeForHead.mockResolvedValue({
      id: 'employee-1',
      employmentStatus: 'active',
      headedDepartment: null,
    });
    departmentRepository.create.mockResolvedValue(
      department({
        departmentHeadId: 'employee-1',
        departmentHead: {
          id: 'employee-1',
          employeeNumber: 'EMP-0001',
          firstName: 'Ada',
          middleName: null,
          lastName: 'Lovelace',
        },
      }),
    );

    await service.create('admin-1', {
      code: 'ENG',
      name: 'Engineering',
      departmentHeadId: 'employee-1',
    });

    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'department.head.assign' }),
      transactionClient,
    );
  });

  it('deactivates without deleting related records', async () => {
    departmentRepository.findById.mockResolvedValue(department());
    departmentRepository.update.mockResolvedValue(
      department({ isActive: false }),
    );

    await service.deactivate('department-1', 'admin-1');

    expect(departmentRepository.update).toHaveBeenCalledWith(
      'department-1',
      { isActive: false },
      transactionClient,
    );
    expect(auditLogService.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'department.deactivate' }),
      transactionClient,
    );
  });

  it('rejects a redundant lifecycle change', async () => {
    departmentRepository.findById.mockResolvedValue(
      department({ isActive: false }),
    );

    await expect(
      service.deactivate('department-1', 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(departmentRepository.update).not.toHaveBeenCalled();
  });
});

function department(overrides: Record<string, unknown> = {}) {
  return {
    id: 'department-1',
    code: 'ENG',
    name: 'Engineering',
    nameKey: 'ENGINEERING',
    description: 'Builds the product.',
    isActive: true,
    departmentHeadId: null,
    departmentHead: null,
    _count: { employees: 0 },
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    updatedAt: new Date('2026-08-01T00:00:00.000Z'),
    ...overrides,
  };
}
