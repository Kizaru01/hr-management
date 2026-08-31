import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserService } from './user.service.js';

describe('UserService account-management safeguards', () => {
  const userRepository = {
    findAllForManagement: jest.fn(),
    findForManagementById: jest.fn(),
    countActiveAdministrators: jest.fn(),
    updateRole: jest.fn(),
    updateAccess: jest.fn(),
  };
  const activationTokenService = {};
  const employeeRepository = {};
  const transactionClient = {};
  const prisma = {
    $transaction: jest.fn(
      async (operation: (tx: typeof transactionClient) => Promise<unknown>) =>
        operation(transactionClient),
    ),
  };
  const auditLogService = {
    create: jest.fn(),
  };

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(
      userRepository as never,
      activationTokenService as never,
      employeeRepository as never,
      prisma as never,
      auditLogService as never,
    );
  });

  it('returns a transformed management contract', async () => {
    userRepository.findAllForManagement.mockResolvedValue([
      managedUser({
        employee: {
          id: 'employee-1',
          employeeNumber: 'EMP-0001',
          firstName: 'Ada',
          middleName: null,
          lastName: 'Lovelace',
          email: 'ada@example.com',
          employmentStatus: 'active',
        },
      }),
    ]);

    const response = await service.findAll();

    expect(response.data[0]).toEqual(
      expect.objectContaining({
        email: 'ada@example.com',
        linkedEmployee: {
          id: 'employee-1',
          name: 'Ada Lovelace',
          employeeNumber: 'EMP-0001',
          employmentStatus: 'active',
        },
      }),
    );
    expect(response.data[0]).not.toHaveProperty('passwordHash');
    expect(response.data[0]?.linkedEmployee).not.toHaveProperty('email');
  });

  it('rejects self-deactivation before starting a transaction', async () => {
    await expect(
      service.deactivateAccess('admin-1', 'admin-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects demoting the last active administrator', async () => {
    userRepository.findForManagementById.mockResolvedValue(
      managedUser({ id: 'admin-1', role: 'admin' }),
    );
    userRepository.countActiveAdministrators.mockResolvedValue(1);

    await expect(
      service.updateRole('admin-1', { role: 'hr' }, 'admin-1'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it('requires a linked employee before assigning the employee role', async () => {
    userRepository.findForManagementById.mockResolvedValue(
      managedUser({ role: 'hr', employee: null }),
    );

    await expect(
      service.updateRole('user-1', { role: 'employee' }, 'admin-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(userRepository.updateRole).not.toHaveBeenCalled();
  });

  it('does not reactivate a terminated employee account', async () => {
    userRepository.findForManagementById.mockResolvedValue(
      managedUser({
        isActive: false,
        employee: {
          id: 'employee-1',
          employeeNumber: 'EMP-0001',
          firstName: 'Ada',
          middleName: null,
          lastName: 'Lovelace',
          email: 'ada@example.com',
          employmentStatus: 'terminated',
        },
      }),
    );

    await expect(
      service.activateAccess('user-1', 'admin-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(userRepository.updateAccess).not.toHaveBeenCalled();
  });
});

function managedUser(
  overrides: Partial<{
    id: string;
    email: string;
    role: 'admin' | 'hr' | 'employee';
    status: 'pending' | 'active' | 'suspended' | 'disabled';
    isActive: boolean;
    employee: {
      id: string;
      employeeNumber: string;
      firstName: string;
      middleName: string | null;
      lastName: string;
      email: string;
      employmentStatus: string;
    } | null;
  }> = {},
) {
  return {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'employee' as const,
    status: 'active' as const,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
    employee: null,
    ...overrides,
  };
}
