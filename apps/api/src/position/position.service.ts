import { normalizeName } from '@hr-management/domain';
import type {
  CreatePositionInput,
  UpdatePositionInput,
} from '@hr-management/validation';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { successResponse } from '../common/responses/success-response.js';
import { DepartmentRepository } from '../department/department.repository.js';
import { Prisma } from '../generated/prisma/client.js';
import { mapPosition } from './position.mapper.js';
import {
  PositionRepository,
  type PositionRecord,
} from './position.repository.js';

@Injectable()
export class PositionService {
  constructor(
    private readonly positionRepository: PositionRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findActiveLookup(departmentId?: string) {
    if (departmentId) {
      const department = await this.departmentRepository.findById(departmentId);

      if (!department) {
        throw new NotFoundException('Department not found.');
      }
    }

    const positions =
      await this.positionRepository.findActiveLookup(departmentId);

    return successResponse(positions, 'Positions retrieved successfully.');
  }

  async findAllForDepartment(departmentId: string) {
    const department = await this.departmentRepository.findById(departmentId);

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    const positions =
      await this.positionRepository.findAllForDepartment(departmentId);

    return successResponse(
      positions.map(mapPosition),
      'Department positions retrieved successfully.',
    );
  }

  async findOne(id: string) {
    const position = await this.positionRepository.findById(id);

    if (!position) {
      throw new NotFoundException('Position not found.');
    }

    return successResponse(
      mapPosition(position),
      'Position retrieved successfully.',
    );
  }

  async create(currentUserId: string, input: CreatePositionInput) {
    const name = normalizeName(input.name);
    const description = this.normalizeDescription(input.description);

    try {
      const position = await this.positionRepository.transaction(
        async (transaction) => {
          const department = await this.departmentRepository.findById(
            input.departmentId,
            transaction,
          );

          if (!department) {
            throw new NotFoundException('Department not found.');
          }

          if (!department.isActive) {
            throw new BadRequestException({
              message: 'Positions can only be created in an active department.',
              errors: [
                {
                  path: ['departmentId'],
                  message:
                    'Positions can only be created in an active department.',
                },
              ],
            });
          }

          const duplicate =
            await this.positionRepository.findByDepartmentAndName(
              input.departmentId,
              name,
              transaction,
            );

          if (duplicate) {
            this.throwDuplicateName();
          }

          const createdPosition = await this.positionRepository.create(
            {
              name,
              description,
              salary: input.salary,
              allowance: input.allowance,
              departmentId: input.departmentId,
            },
            transaction,
          );

          await this.auditLogService.create(
            {
              actorUserId: currentUserId,
              action: 'position.create',
              entityType: 'Position',
              entityId: createdPosition.id,
              metadata: {
                name: createdPosition.name,
                departmentId: createdPosition.department.id,
                departmentName: createdPosition.department.name,
              },
            },
            transaction,
          );

          return createdPosition;
        },
      );

      return successResponse(
        mapPosition(position),
        'Position created successfully.',
      );
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  async update(id: string, currentUserId: string, input: UpdatePositionInput) {
    try {
      const position = await this.positionRepository.transaction(
        async (transaction) => {
          const existingPosition = await this.positionRepository.findById(
            id,
            transaction,
          );

          if (!existingPosition) {
            throw new NotFoundException('Position not found.');
          }

          const nextName =
            input.name === undefined ? undefined : normalizeName(input.name);

          if (nextName !== undefined) {
            const duplicate =
              await this.positionRepository.findByDepartmentAndName(
                existingPosition.departmentId,
                nextName,
                transaction,
              );

            if (duplicate && duplicate.id !== id) {
              this.throwDuplicateName();
            }
          }

          const description =
            input.description === undefined
              ? undefined
              : this.normalizeDescription(input.description);
          const changedFields = this.getChangedFields(existingPosition, {
            name: nextName,
            description,
          });
          const updatedPosition =
            changedFields.length > 0
              ? await this.positionRepository.update(
                  id,
                  {
                    ...(nextName !== undefined && { name: nextName }),
                    ...(description !== undefined && { description }),
                  },
                  transaction,
                )
              : existingPosition;

          if (changedFields.length > 0) {
            await this.auditLogService.create(
              {
                actorUserId: currentUserId,
                action: 'position.update',
                entityType: 'Position',
                entityId: id,
                metadata: {
                  name: updatedPosition.name,
                  departmentId: updatedPosition.department.id,
                  departmentName: updatedPosition.department.name,
                  changedFields,
                },
              },
              transaction,
            );
          }

          return updatedPosition;
        },
      );

      return successResponse(
        mapPosition(position),
        'Position updated successfully.',
      );
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  async deactivate(id: string, currentUserId: string) {
    const position = await this.changeActiveState(id, currentUserId, false);

    return successResponse(
      mapPosition(position),
      'Position deactivated successfully.',
    );
  }

  async reactivate(id: string, currentUserId: string) {
    const position = await this.changeActiveState(id, currentUserId, true);

    return successResponse(
      mapPosition(position),
      'Position reactivated successfully.',
    );
  }

  private changeActiveState(
    id: string,
    currentUserId: string,
    isActive: boolean,
  ) {
    return this.positionRepository.transaction(async (transaction) => {
      const existingPosition = await this.positionRepository.findById(
        id,
        transaction,
      );

      if (!existingPosition) {
        throw new NotFoundException('Position not found.');
      }

      if (existingPosition.isActive === isActive) {
        throw new ConflictException(
          isActive
            ? 'Position is already active.'
            : 'Position is already deactivated.',
        );
      }

      if (!isActive && existingPosition._count.employees > 0) {
        throw new ConflictException(
          `Cannot deactivate this position while ${existingPosition._count.employees} active ${existingPosition._count.employees === 1 ? 'employee is' : 'employees are'} assigned. Reassign them first.`,
        );
      }

      if (isActive && !existingPosition.department.isActive) {
        throw new ConflictException(
          'Reactivate the parent department before reactivating this position.',
        );
      }

      const position = await this.positionRepository.update(
        id,
        { isActive },
        transaction,
      );

      await this.auditLogService.create(
        {
          actorUserId: currentUserId,
          action: isActive ? 'position.reactivate' : 'position.deactivate',
          entityType: 'Position',
          entityId: position.id,
          metadata: {
            name: position.name,
            departmentId: position.department.id,
            departmentName: position.department.name,
            previousStatus: isActive ? 'inactive' : 'active',
            newStatus: isActive ? 'active' : 'inactive',
          },
        },
        transaction,
      );

      return position;
    });
  }

  private getChangedFields(
    position: PositionRecord,
    input: { name?: string; description?: string | null },
  ) {
    return (['name', 'description'] as const).filter(
      (field) => input[field] !== undefined && input[field] !== position[field],
    );
  }

  private normalizeDescription(value: string | undefined) {
    const description = value?.trim();

    return description ? description : null;
  }

  private throwDuplicateName(): never {
    const message = 'Position already exists in this department.';

    throw new ConflictException({
      message,
      errors: [{ path: ['name'], message }],
    });
  }

  private rethrowMutationError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      this.throwDuplicateName();
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      throw new ConflictException(
        'The position changed concurrently. Refresh and try again.',
      );
    }

    throw error;
  }
}
