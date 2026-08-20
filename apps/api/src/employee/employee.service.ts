import type {
  AssignManagerInput,
  CreateEmployeeInput,
  TerminateEmployeeInput,
  UpdateEmployeeInput,
  UpdateMyProfileInput,
} from '@hr-management/validation';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { successResponse } from '../common/responses/success-response.js';
import { DepartmentRepository } from '../department/department.repository.js';
import { Prisma } from '../generated/prisma/client.js';
import { PositionRepository } from '../position/position.repository.js';
import { EmployeeRepository } from './employee.repository.js';
import { BranchRepository } from '../branch/branch.respository.js';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { UserRepository } from '../user/user.repository.js';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly positionRepository: PositionRepository,
    private readonly branchRepository: BranchRepository,
    private readonly auditLogService: AuditLogService,
    private readonly userRepository: UserRepository,
  ) {}

  async create(input: CreateEmployeeInput) {
    const { departmentId, positionId, branchId } = input;

    await this.validateDepartmentBranchAndPosition(
      departmentId,
      positionId,
      branchId,
    );

    const normalizedEmail = input.email.trim().toLowerCase();

    const existingEmployee =
      await this.employeeRepository.findByEmail(normalizedEmail);

    if (existingEmployee) {
      throw new ConflictException(
        'An employee with this email already exists.',
      );
    }

    const employeeNumber =
      await this.employeeRepository.generateEmployeeNumber();

    try {
      const employee = await this.employeeRepository.create({
        ...input,
        email: normalizedEmail,
        employeeNumber,
      });

      return successResponse(employee, 'Employee created successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An employee with this email or employee number already exists.',
        );
      }

      throw error;
    }
  }
  async findMe(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    return successResponse(employee, 'Employee retrieved successfully.');
  }
  async findAll() {
    const employees = await this.employeeRepository.findAll();

    return successResponse(employees, 'Employees retrieved successfully.');
  }
  async findOne(id: string) {
    const employee = await this.employeeRepository.findById(id);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    return successResponse(employee, 'Employee retrieved successfully.');
  }
  async findMyTeam(userId: string) {
    const manager = await this.employeeRepository.findByUserId(userId);

    if (!manager) {
      throw new NotFoundException('Employee profile not found.');
    }

    const employees = await this.employeeRepository.findByManagerId(manager.id);

    return successResponse(employees, 'Team retrieved successfully.');
  }
  async update(id: string, input: UpdateEmployeeInput) {
    const existingEmployee = await this.employeeRepository.findById(id);

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found.');
    }

    const updateData: UpdateEmployeeInput = {
      ...input,
      ...(input.email !== undefined && {
        email: input.email.trim().toLowerCase(),
      }),
    };

    const nextDepartmentId =
      updateData.departmentId ?? existingEmployee.departmentId;

    const nextPositionId = updateData.positionId ?? existingEmployee.positionId;
    const nextBranchId = updateData.branchId ?? existingEmployee.branchId;

    if (nextBranchId === null) {
      throw new BadRequestException('Branch ID is required.');
    }

    if (
      updateData.departmentId !== undefined ||
      updateData.positionId !== undefined
    ) {
      await this.validateDepartmentBranchAndPosition(
        nextDepartmentId,
        nextPositionId,
        nextBranchId,
      );
    }

    const branch = await this.branchRepository.findById(nextBranchId);

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    if (updateData.email !== undefined) {
      const duplicate = await this.employeeRepository.findByEmail(
        updateData.email,
      );

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(
          'An employee with this email already exists.',
        );
      }
    }

    try {
      const employee = await this.employeeRepository.update(id, updateData);

      return successResponse(employee, 'Employee updated successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An employee with this email already exists.',
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Employee not found.');
      }

      throw error;
    }
  }
  async updateMe(userId: string, input: UpdateMyProfileInput) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const updatedEmployee = await this.employeeRepository.updateByUserId(
      employee.id,
      {
        ...(input.phoneNumber !== undefined && {
          phoneNumber: input.phoneNumber,
        }),

        ...(input.birthDate !== undefined && {
          birthDate: input.birthDate,
        }),

        ...(input.gender !== undefined && {
          gender: input.gender,
        }),

        ...(input.address !== undefined && {
          address: input.address,
        }),

        ...(input.emergencyContactName !== undefined && {
          emergencyContactName: input.emergencyContactName,
        }),

        ...(input.emergencyContactPhone !== undefined && {
          emergencyContactPhone: input.emergencyContactPhone,
        }),
      },
    );

    return successResponse(updatedEmployee, 'Profile updated successfully.');
  }
  async updateMyAvatar(userId: string, file: Express.Multer.File) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const previousAvatar = employee.avatar;

    const avatar = `uploads/avatars/${file.filename}`;

    const updatedEmployee =
      await this.employeeRepository.updateByEmployeeIdAvatar(
        employee.id,
        avatar,
      );

    if (previousAvatar) {
      const previousAvatarPath = join(process.cwd(), previousAvatar);

      try {
        await unlink(previousAvatarPath);
      } catch {
        // We don't fail the request because
        // the database update already succeeded.
      }
    }

    return successResponse(updatedEmployee, 'Avatar updated successfully.');
  }
  async remove(id: string) {
    const existingEmployee = await this.employeeRepository.findById(id);

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found.');
    }

    try {
      const employee = await this.employeeRepository.remove(id);

      return successResponse(employee, 'Employee deleted successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Employee not found.');
      }

      throw error;
    }
  }
  async removeMyAvatar(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    if (!employee.avatar) {
      throw new BadRequestException('Employee does not have an avatar.');
    }

    const previousAvatar = employee.avatar;

    const updatedEmployee =
      await this.employeeRepository.updateByEmployeeIdAvatar(employee.id, null);

    try {
      await unlink(join(process.cwd(), previousAvatar));
    } catch {
      // Database is already correct.
      // Storage cleanup can be handled separately.
    }

    return successResponse(updatedEmployee, 'Avatar removed successfully.');
  }
  async assignManager(
    employeeId: string,
    input: AssignManagerInput,
    currentUserId: string,
  ) {
    const existingEmployee = await this.employeeRepository.findById(employeeId);

    if (!existingEmployee) {
      throw new NotFoundException('Employee not found.');
    }

    const manager = await this.employeeRepository.findById(input.managerId);

    if (!manager) {
      throw new NotFoundException('Manager not found.');
    }

    if (existingEmployee.id === manager.id) {
      throw new BadRequestException('An employee cannot be their own manager.');
    }

    if (manager.employmentStatus !== 'active') {
      throw new BadRequestException('Manager must be an active employee.');
    }

    const updatedEmployee = await this.employeeRepository.assignManager(
      existingEmployee.id,
      manager.id,
    );

    const changes: Record<
      string,
      {
        from: string | null;
        to: string | null;
      }
    > = {};

    if (existingEmployee.departmentId !== updatedEmployee.departmentId) {
      changes.departmentId = {
        from: existingEmployee.departmentId,
        to: updatedEmployee.departmentId,
      };
    }

    if (existingEmployee.positionId !== updatedEmployee.positionId) {
      changes.positionId = {
        from: existingEmployee.positionId,
        to: updatedEmployee.positionId,
      };
    }

    if (existingEmployee.branchId !== updatedEmployee.branchId) {
      changes.branchId = {
        from: existingEmployee.branchId,
        to: updatedEmployee.branchId,
      };
    }

    if (
      existingEmployee.employmentStatus !== updatedEmployee.employmentStatus
    ) {
      changes.employmentStatus = {
        from: existingEmployee.employmentStatus,
        to: updatedEmployee.employmentStatus,
      };
    }
    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'manager.assign',
      entityType: 'Employee',
      entityId: existingEmployee.id,
      metadata: {
        changes,
      },
    });
    return successResponse(updatedEmployee, 'Manager assigned successfully.');
  }
  async terminate(
    employeeId: string,
    currentUserId: string,
    input: TerminateEmployeeInput,
  ) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    if (employee.employmentStatus === 'terminated') {
      throw new BadRequestException('Employee is already terminated.');
    }

    if (input.terminationDate < employee.hireDate) {
      throw new BadRequestException(
        'Termination date cannot be before the hire date.',
      );
    }

    const terminationReason = input.reason.trim();

    const terminatedEmployee =
      await this.employeeRepository.terminateWithUserDeactivation(
        employee.id,
        employee.userId,
        input.terminationDate,
        terminationReason,
      );

    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'employee.terminate',
      entityType: 'Employee',
      entityId: employee.id,

      metadata: {
        previousStatus: employee.employmentStatus,

        newStatus: 'terminated',

        terminationDate: input.terminationDate.toISOString(),

        reason: terminationReason,

        userDeactivated: Boolean(employee.userId),
      },
    });

    return successResponse(
      terminatedEmployee,
      'Employee terminated successfully.',
    );
  }
  private async validateDepartmentBranchAndPosition(
    departmentId: string,
    positionId: string,
    branchId: string,
  ) {
    const [department, position, branch] = await Promise.all([
      this.departmentRepository.findById(departmentId),
      this.positionRepository.findById(positionId),
      this.branchRepository.findById(branchId),
    ]);

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    if (!position) {
      throw new NotFoundException('Position not found.');
    }

    if (position.departmentId !== departmentId) {
      throw new BadRequestException(
        'Position does not belong to the selected department.',
      );
    }

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }
  }
}
