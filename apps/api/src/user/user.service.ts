import type {
  CreateUserInput,
  UpdateUserRoleInput,
} from '@hr-management/validation';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { ActivationTokenService } from '../common/security/activation-token.service.js';
import { successResponse } from '../common/responses/success-response.js';
import { EmployeeRepository } from '../employee/employee.repository.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { type ManagedUserRecord, UserRepository } from './user.repository.js';
import { EmailService } from '../email/email.service.js';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly activationTokenService: ActivationTokenService,
    private readonly employeeRepository: EmployeeRepository,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly emailService: EmailService,
  ) {}

  async findAll() {
    const users = await this.userRepository.findAllForManagement();

    return successResponse(
      users.map((user) => this.toManagedUser(user)),
      'Users retrieved successfully.',
    );
  }

  async create(input: CreateUserInput, currentUserId: string) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    if (input.role === 'employee' && !input.employeeNumber) {
      throw new BadRequestException('Employee number is required.');
    }

    let employeeId: string | undefined;
    let employeeName: string | undefined;

    if (input.employeeNumber) {
      const employee = await this.employeeRepository.findByEmployeeNumber(
        input.employeeNumber,
      );

      if (!employee) {
        throw new NotFoundException('Employee not found.');
      }

      if (employee.userId) {
        throw new ConflictException('Employee already has an account.');
      }

      if (employee.email.trim().toLowerCase() !== normalizedEmail) {
        throw new BadRequestException(
          'Email does not match the employee record.',
        );
      }

      if (employee.employmentStatus === 'terminated') {
        throw new BadRequestException(
          'A terminated employee cannot be linked to a new account.',
        );
      }

      employeeId = employee.id;
      employeeName = [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ');
    }

    const activation = this.activationTokenService.generate();

    const user = await this.prisma
      .$transaction(async (tx) => {
        const createdUser = await this.userRepository.create(
          {
            email: normalizedEmail,
            role: input.role,
            activationTokenHash: activation.tokenHash,
            activationExpiresAt: activation.expiresAt,
          },
          tx,
        );

        if (employeeId) {
          const result = await this.employeeRepository.linkUserIfUnlinked(
            employeeId,
            createdUser.id,
            tx,
          );

          if (result.count !== 1) {
            throw new ConflictException('Employee already has an account.');
          }
        }

        return createdUser;
      })
      .catch((error: unknown) => {
        if (error instanceof ConflictException) {
          throw error;
        }

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('A user with this email already exists.');
        }

        throw error;
      });

    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'user.create',
      entityType: 'User',
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        linkedEmployee: Boolean(employeeId),
      },
    });

    const invitationSent = await this.trySendInvitation({
      email: user.email,
      employeeName,
      rawToken: activation.token,
      expiresAt: activation.expiresAt,
    });

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        invitationSent,
      },
      invitationSent
        ? 'User created successfully. Invitation email sent.'
        : 'User created successfully, but the invitation email could not be sent.',
    );
  }

  async resendInvitation(userId: string, currentUserId: string) {
    const user = await this.userRepository.findForManagementById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.status !== 'pending') {
      throw new BadRequestException(
        'Only pending accounts can receive another invitation.',
      );
    }

    if (user.employee?.employmentStatus === 'terminated') {
      throw new BadRequestException(
        'A terminated employee cannot receive an account invitation.',
      );
    }

    const activation = this.activationTokenService.generate();

    await this.prisma.$transaction(
      async (transaction) => {
        const rotation =
          await this.userRepository.rotateActivationTokenForPending(
            user.id,
            activation.tokenHash,
            activation.expiresAt,
            transaction,
          );

        if (rotation.count !== 1) {
          throw new ConflictException(
            'The account is no longer pending activation.',
          );
        }
        await this.auditLogService.create(
          {
            actorUserId: currentUserId,
            action: 'user.invitation.resend',
            entityType: 'User',
            entityId: user.id,
          },
          transaction,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    await this.emailService.sendAccountInvitation({
      to: user.email,
      employeeName: user.employee
        ? [
            user.employee.firstName,
            user.employee.middleName,
            user.employee.lastName,
          ]
            .filter(Boolean)
            .join(' ')
        : undefined,
      rawToken: activation.token,
      expiresAt: activation.expiresAt,
    });

    return successResponse(undefined, 'Invitation email sent successfully.');
  }

  async updateRole(
    userId: string,
    input: UpdateUserRoleInput,
    currentUserId: string,
  ) {
    const updatedUser = await this.withSerializableSafety(async (tx) => {
      const user = await this.userRepository.findForManagementById(userId, tx);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (user.role === input.role) {
        throw new BadRequestException(
          `User is already assigned the ${input.role} role.`,
        );
      }

      if (input.role === 'employee') {
        if (!user.employee) {
          throw new BadRequestException(
            'An employee profile must be linked before assigning the employee role.',
          );
        }

        if (
          user.employee.email.trim().toLowerCase() !==
          user.email.trim().toLowerCase()
        ) {
          throw new BadRequestException(
            'The account email does not match the linked employee record.',
          );
        }

        if (user.employee.employmentStatus === 'terminated') {
          throw new BadRequestException(
            'A terminated employee cannot be assigned the employee role.',
          );
        }
      }

      if (
        user.role === 'admin' &&
        input.role !== 'admin' &&
        user.status === 'active' &&
        user.isActive
      ) {
        await this.assertAnotherActiveAdministrator(tx);
      }

      return this.userRepository.updateRole(user.id, input.role, tx);
    });

    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'user.role.update',
      entityType: 'User',
      entityId: updatedUser.id,
      metadata: {
        role: updatedUser.role,
      },
    });

    return successResponse(
      this.toManagedUser(updatedUser),
      'User role updated successfully.',
    );
  }

  async activateAccess(userId: string, currentUserId: string) {
    const updatedUser = await this.withSerializableSafety(async (tx) => {
      const user = await this.userRepository.findForManagementById(userId, tx);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (user.status !== 'active') {
        throw new BadRequestException(
          'Only an activated account can have access re-enabled.',
        );
      }

      if (user.isActive) {
        throw new BadRequestException('Account access is already active.');
      }

      if (user.employee?.employmentStatus === 'terminated') {
        throw new BadRequestException(
          'A terminated employee account cannot be reactivated here.',
        );
      }

      return this.userRepository.updateAccess(user.id, true, tx);
    });

    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'user.access.activate',
      entityType: 'User',
      entityId: updatedUser.id,
    });

    return successResponse(
      this.toManagedUser(updatedUser),
      'Account access activated successfully.',
    );
  }

  async deactivateAccess(userId: string, currentUserId: string) {
    if (userId === currentUserId) {
      throw new BadRequestException('You cannot deactivate your own account.');
    }

    const updatedUser = await this.withSerializableSafety(async (tx) => {
      const user = await this.userRepository.findForManagementById(userId, tx);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (!user.isActive) {
        throw new BadRequestException('Account access is already inactive.');
      }

      if (user.role === 'admin' && user.status === 'active') {
        await this.assertAnotherActiveAdministrator(tx);
      }

      return this.userRepository.updateAccess(user.id, false, tx);
    });

    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'user.access.deactivate',
      entityType: 'User',
      entityId: updatedUser.id,
    });

    return successResponse(
      this.toManagedUser(updatedUser),
      'Account access deactivated successfully.',
    );
  }

  private async assertAnotherActiveAdministrator(tx: Prisma.TransactionClient) {
    const activeAdministratorCount =
      await this.userRepository.countActiveAdministrators(tx);

    if (activeAdministratorCount <= 1) {
      throw new ConflictException(
        'The last active administrator cannot be removed or deactivated.',
      );
    }
  }

  private async withSerializableSafety<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2034'
      ) {
        throw new ConflictException(
          'The account changed concurrently. Refresh and try again.',
        );
      }

      throw error;
    }
  }

  private toManagedUser(user: ManagedUserRecord) {
    const employeeName = user.employee
      ? [
          user.employee.firstName,
          user.employee.middleName,
          user.employee.lastName,
        ]
          .filter(Boolean)
          .join(' ')
      : null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      linkedEmployee: user.employee
        ? {
            id: user.employee.id,
            name: employeeName,
            employeeNumber: user.employee.employeeNumber,
            employmentStatus: user.employee.employmentStatus,
          }
        : null,
    };
  }

  private async trySendInvitation(input: {
    email: string;
    employeeName?: string;
    rawToken: string;
    expiresAt: Date;
  }) {
    try {
      await this.emailService.sendAccountInvitation({
        to: input.email,
        employeeName: input.employeeName,
        rawToken: input.rawToken,
        expiresAt: input.expiresAt,
      });

      return true;
    } catch {
      return false;
    }
  }
}
