import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@hr-management/validation';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { successResponse } from '../common/responses/success-response.js';
import { Prisma } from '../generated/prisma/client.js';
import { mapDepartment } from './department.mapper.js';
import {
  DepartmentRepository,
  type DepartmentRecord,
} from './department.repository.js';

@Injectable()
export class DepartmentService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll() {
    const departments = await this.departmentRepository.findAll();

    return successResponse(
      departments.map(mapDepartment),
      'Departments retrieved successfully.',
    );
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findById(id);

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    return successResponse(
      mapDepartment(department),
      'Department retrieved successfully.',
    );
  }

  async create(currentUserId: string, input: CreateDepartmentInput) {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();
    const nameKey = name.toUpperCase();
    const description = this.normalizeDescription(input.description);

    try {
      const department = await this.departmentRepository.transaction(
        async (transaction) => {
          const [duplicateCode, duplicateName] = await Promise.all([
            this.departmentRepository.findByCode(code, transaction),
            this.departmentRepository.findByName(nameKey, transaction),
          ]);

          if (duplicateCode) {
            this.throwFieldConflict('code', 'Department code already exists.');
          }

          if (duplicateName) {
            this.throwFieldConflict('name', 'Department name already exists.');
          }

          if (input.departmentHeadId) {
            await this.validateDepartmentHead(
              input.departmentHeadId,
              undefined,
              transaction,
            );
          }

          const createdDepartment = await this.departmentRepository.create(
            {
              code,
              name,
              nameKey,
              description,
              ...(input.departmentHeadId && {
                departmentHead: {
                  connect: { id: input.departmentHeadId },
                },
              }),
            },
            transaction,
          );

          await this.auditLogService.create(
            {
              actorUserId: currentUserId,
              action: 'department.create',
              entityType: 'Department',
              entityId: createdDepartment.id,
              metadata: {
                code: createdDepartment.code,
                name: createdDepartment.name,
              },
            },
            transaction,
          );

          if (createdDepartment.departmentHeadId) {
            await this.auditHeadChange(
              currentUserId,
              createdDepartment,
              null,
              createdDepartment.departmentHeadId,
              transaction,
            );
          }

          return createdDepartment;
        },
      );

      return successResponse(
        mapDepartment(department),
        'Department created successfully.',
      );
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  async update(
    id: string,
    currentUserId: string,
    input: UpdateDepartmentInput,
  ) {
    try {
      const department = await this.departmentRepository.transaction(
        async (transaction) => {
          const existingDepartment = await this.departmentRepository.findById(
            id,
            transaction,
          );

          if (!existingDepartment) {
            throw new NotFoundException('Department not found.');
          }

          const nextCode = input.code?.trim().toUpperCase();
          const nextName = input.name?.trim();
          const nextNameKey = nextName?.toUpperCase();

          const [duplicateCode, duplicateName] = await Promise.all([
            nextCode
              ? this.departmentRepository.findByCode(nextCode, transaction)
              : null,
            nextNameKey
              ? this.departmentRepository.findByName(nextNameKey, transaction)
              : null,
          ]);

          if (duplicateCode && duplicateCode.id !== id) {
            this.throwFieldConflict('code', 'Department code already exists.');
          }

          if (duplicateName && duplicateName.id !== id) {
            this.throwFieldConflict('name', 'Department name already exists.');
          }

          const nextDepartmentHeadId =
            input.departmentHeadId === undefined
              ? existingDepartment.departmentHeadId
              : input.departmentHeadId;

          if (
            nextDepartmentHeadId &&
            nextDepartmentHeadId !== existingDepartment.departmentHeadId
          ) {
            await this.validateDepartmentHead(
              nextDepartmentHeadId,
              id,
              transaction,
            );
          }

          const description =
            input.description === undefined
              ? undefined
              : this.normalizeDescription(input.description);
          const changedFields = this.getChangedFields(existingDepartment, {
            code: nextCode,
            name: nextName,
            description,
          });
          const departmentHeadChanged =
            nextDepartmentHeadId !== existingDepartment.departmentHeadId;

          const updatedDepartment =
            changedFields.length > 0 || departmentHeadChanged
              ? await this.departmentRepository.update(
                  id,
                  {
                    ...(nextCode !== undefined && { code: nextCode }),
                    ...(nextName !== undefined && {
                      name: nextName,
                      nameKey: nextNameKey,
                    }),
                    ...(description !== undefined && { description }),
                    ...(departmentHeadChanged && {
                      departmentHead: nextDepartmentHeadId
                        ? { connect: { id: nextDepartmentHeadId } }
                        : { disconnect: true },
                    }),
                  },
                  transaction,
                )
              : existingDepartment;

          if (changedFields.length > 0) {
            await this.auditLogService.create(
              {
                actorUserId: currentUserId,
                action: 'department.update',
                entityType: 'Department',
                entityId: id,
                metadata: {
                  code: updatedDepartment.code,
                  name: updatedDepartment.name,
                  changedFields,
                },
              },
              transaction,
            );
          }

          if (departmentHeadChanged) {
            await this.auditHeadChange(
              currentUserId,
              updatedDepartment,
              existingDepartment.departmentHeadId,
              nextDepartmentHeadId,
              transaction,
            );
          }

          return updatedDepartment;
        },
      );

      return successResponse(
        mapDepartment(department),
        'Department updated successfully.',
      );
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  async deactivate(id: string, currentUserId: string) {
    const department = await this.changeActiveState(id, currentUserId, false);

    return successResponse(
      mapDepartment(department),
      'Department deactivated successfully.',
    );
  }

  async reactivate(id: string, currentUserId: string) {
    const department = await this.changeActiveState(id, currentUserId, true);

    return successResponse(
      mapDepartment(department),
      'Department reactivated successfully.',
    );
  }

  private async changeActiveState(
    id: string,
    currentUserId: string,
    isActive: boolean,
  ) {
    return this.departmentRepository.transaction(async (transaction) => {
      const existingDepartment = await this.departmentRepository.findById(
        id,
        transaction,
      );

      if (!existingDepartment) {
        throw new NotFoundException('Department not found.');
      }

      if (existingDepartment.isActive === isActive) {
        throw new ConflictException(
          isActive
            ? 'Department is already active.'
            : 'Department is already deactivated.',
        );
      }

      const department = await this.departmentRepository.update(
        id,
        { isActive },
        transaction,
      );

      await this.auditLogService.create(
        {
          actorUserId: currentUserId,
          action: isActive ? 'department.reactivate' : 'department.deactivate',
          entityType: 'Department',
          entityId: department.id,
          metadata: {
            code: department.code,
            name: department.name,
            previousStatus: isActive ? 'inactive' : 'active',
            newStatus: isActive ? 'active' : 'inactive',
          },
        },
        transaction,
      );

      return department;
    });
  }

  private async validateDepartmentHead(
    employeeId: string,
    departmentId: string | undefined,
    transaction: Prisma.TransactionClient,
  ) {
    const employee = await this.departmentRepository.findEmployeeForHead(
      employeeId,
      transaction,
    );

    if (!employee) {
      this.throwHeadFieldError(
        NotFoundException,
        'Selected department head employee was not found.',
      );
    }

    if (employee.employmentStatus !== 'active') {
      this.throwHeadFieldError(
        BadRequestException,
        'Department head must be an active employee.',
      );
    }

    if (
      employee.headedDepartment &&
      employee.headedDepartment.id !== departmentId
    ) {
      this.throwHeadFieldError(
        ConflictException,
        'Employee is already assigned as the head of another department.',
      );
    }
  }

  private async auditHeadChange(
    currentUserId: string,
    department: DepartmentRecord,
    previousHeadId: string | null,
    nextHeadId: string | null,
    transaction: Prisma.TransactionClient,
  ) {
    const action = previousHeadId
      ? nextHeadId
        ? 'department.head.replace'
        : 'department.head.remove'
      : 'department.head.assign';

    await this.auditLogService.create(
      {
        actorUserId: currentUserId,
        action,
        entityType: 'Department',
        entityId: department.id,
        metadata: {
          code: department.code,
          name: department.name,
          previousHeadEmployeeId: previousHeadId,
          departmentHeadEmployeeId: nextHeadId,
        },
      },
      transaction,
    );
  }

  private getChangedFields(
    department: DepartmentRecord,
    input: {
      code?: string;
      name?: string;
      description?: string | null;
    },
  ) {
    return (['code', 'name', 'description'] as const).filter(
      (field) =>
        input[field] !== undefined && input[field] !== department[field],
    );
  }

  private normalizeDescription(value: string | null | undefined) {
    const description = value?.trim();

    return description ? description : null;
  }

  private throwFieldConflict(field: 'code' | 'name', message: string): never {
    throw new ConflictException({
      message,
      errors: [{ path: [field], message }],
    });
  }

  private throwHeadFieldError(
    ExceptionType:
      | typeof BadRequestException
      | typeof ConflictException
      | typeof NotFoundException,
    message: string,
  ): never {
    throw new ExceptionType({
      message,
      errors: [{ path: ['departmentHeadId'], message }],
    });
  }

  private rethrowMutationError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = JSON.stringify(error.meta?.target ?? '');

      if (target.includes('departmentHeadId')) {
        this.throwHeadFieldError(
          ConflictException,
          'Employee is already assigned as the head of another department.',
        );
      }

      if (target.includes('nameKey')) {
        this.throwFieldConflict('name', 'Department name already exists.');
      }

      if (target.includes('code')) {
        this.throwFieldConflict('code', 'Department code already exists.');
      }

      throw new ConflictException(
        'Department code, name, or head conflicts with another department.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      throw new ConflictException(
        'The department changed concurrently. Refresh and try again.',
      );
    }

    throw error;
  }
}
