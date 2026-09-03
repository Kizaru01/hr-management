import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from '@hr-management/validation';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { successResponse } from '../common/responses/success-response.js';
import { mapBranch } from './branch.mapper.js';
import { BranchRepository, type BranchRecord } from './branch.respository.js';

@Injectable()
export class BranchService {
  constructor(
    private readonly branchRepository: BranchRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll() {
    const branches = await this.branchRepository.findAll();

    return successResponse(
      branches.map(mapBranch),
      'Branches retrieved successfully.',
    );
  }

  async findOne(id: string) {
    const branch = await this.branchRepository.findById(id);

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return successResponse(mapBranch(branch), 'Branch retrieved successfully.');
  }

  async create(currentUserId: string, input: CreateBranchInput) {
    const code = input.code.trim().toUpperCase();
    const name = input.name.trim();

    try {
      const branch = await this.branchRepository.transaction(
        async (transaction) => {
          const [duplicateCode, duplicateName] = await Promise.all([
            this.branchRepository.findByCode(code, transaction),
            this.branchRepository.findByName(name, transaction),
          ]);

          if (duplicateCode) {
            this.throwFieldConflict('code', 'Branch code already exists.');
          }

          if (duplicateName) {
            this.throwFieldConflict('name', 'Branch name already exists.');
          }

          const createdBranch = await this.branchRepository.create(
            {
              code,
              name,
              address: input.address.trim(),
              city: this.normalizeOptionalString(input.city),
              province: this.normalizeOptionalString(input.province),
              latitude: input.latitude,
              longitude: input.longitude,
              allowedRadius: input.allowedRadius,
            },
            transaction,
          );

          await this.auditLogService.create(
            {
              actorUserId: currentUserId,
              action: 'branch.create',
              entityType: 'Branch',
              entityId: createdBranch.id,
              metadata: {
                code: createdBranch.code,
                name: createdBranch.name,
              },
            },
            transaction,
          );

          return createdBranch;
        },
      );

      return successResponse(mapBranch(branch), 'Branch created successfully.');
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  async update(id: string, currentUserId: string, input: UpdateBranchInput) {
    try {
      const branch = await this.branchRepository.transaction(
        async (transaction) => {
          const existingBranch = await this.branchRepository.findById(
            id,
            transaction,
          );

          if (!existingBranch) {
            throw new NotFoundException('Branch not found.');
          }

          const nextCode = input.code?.trim().toUpperCase();
          const nextName = input.name?.trim();
          const [duplicateCode, duplicateName] = await Promise.all([
            nextCode
              ? this.branchRepository.findByCode(nextCode, transaction)
              : null,
            nextName
              ? this.branchRepository.findByName(nextName, transaction)
              : null,
          ]);

          if (duplicateCode && duplicateCode.id !== id) {
            this.throwFieldConflict('code', 'Branch code already exists.');
          }

          if (duplicateName && duplicateName.id !== id) {
            this.throwFieldConflict('name', 'Branch name already exists.');
          }

          const normalizedInput = {
            code: nextCode,
            name: nextName,
            address: input.address?.trim(),
            city:
              input.city === undefined
                ? undefined
                : this.normalizeOptionalString(input.city),
            province:
              input.province === undefined
                ? undefined
                : this.normalizeOptionalString(input.province),
            latitude: input.latitude,
            longitude: input.longitude,
            allowedRadius: input.allowedRadius,
          };
          const changedFields = this.getChangedFields(
            existingBranch,
            normalizedInput,
          );
          const updatedBranch =
            changedFields.length > 0
              ? await this.branchRepository.update(
                  id,
                  normalizedInput,
                  transaction,
                )
              : existingBranch;

          if (changedFields.length > 0) {
            await this.auditLogService.create(
              {
                actorUserId: currentUserId,
                action: 'branch.update',
                entityType: 'Branch',
                entityId: id,
                metadata: {
                  code: updatedBranch.code,
                  name: updatedBranch.name,
                  changedFields,
                },
              },
              transaction,
            );
          }

          return updatedBranch;
        },
      );

      return successResponse(mapBranch(branch), 'Branch updated successfully.');
    } catch (error) {
      this.rethrowMutationError(error);
    }
  }

  async deactivate(id: string, currentUserId: string) {
    const branch = await this.changeActiveState(id, currentUserId, false);

    return successResponse(
      mapBranch(branch),
      'Branch deactivated successfully.',
    );
  }

  async reactivate(id: string, currentUserId: string) {
    const branch = await this.changeActiveState(id, currentUserId, true);

    return successResponse(
      mapBranch(branch),
      'Branch reactivated successfully.',
    );
  }

  private changeActiveState(
    id: string,
    currentUserId: string,
    isActive: boolean,
  ) {
    return this.branchRepository.transaction(async (transaction) => {
      const existingBranch = await this.branchRepository.findById(
        id,
        transaction,
      );

      if (!existingBranch) {
        throw new NotFoundException('Branch not found.');
      }

      if (existingBranch.isActive === isActive) {
        throw new ConflictException(
          isActive
            ? 'Branch is already active.'
            : 'Branch is already deactivated.',
        );
      }

      if (!isActive && existingBranch._count.employees > 0) {
        const count = existingBranch._count.employees;

        throw new ConflictException(
          `Cannot deactivate this branch while ${count} active ${count === 1 ? 'employee is' : 'employees are'} assigned. Reassign them first.`,
        );
      }

      const branch = await this.branchRepository.update(
        id,
        { isActive },
        transaction,
      );

      await this.auditLogService.create(
        {
          actorUserId: currentUserId,
          action: isActive ? 'branch.reactivate' : 'branch.deactivate',
          entityType: 'Branch',
          entityId: branch.id,
          metadata: {
            code: branch.code,
            name: branch.name,
            previousStatus: isActive ? 'inactive' : 'active',
            newStatus: isActive ? 'active' : 'inactive',
          },
        },
        transaction,
      );

      return branch;
    });
  }

  private getChangedFields(
    branch: BranchRecord,
    input: {
      code?: string;
      name?: string;
      address?: string;
      city?: string | null;
      province?: string | null;
      latitude?: number;
      longitude?: number;
      allowedRadius?: number;
    },
  ) {
    const candidates: Array<[string, unknown, unknown]> = [
      ['code', branch.code, input.code],
      ['name', branch.name, input.name],
      ['address', branch.address, input.address],
      ['city', branch.city, input.city],
      ['province', branch.province, input.province],
      [
        'latitude',
        branch.latitude === null ? null : Number(branch.latitude),
        input.latitude,
      ],
      [
        'longitude',
        branch.longitude === null ? null : Number(branch.longitude),
        input.longitude,
      ],
      ['allowedRadius', branch.allowedRadius, input.allowedRadius],
    ];

    return candidates
      .filter(([, , value]) => value !== undefined)
      .filter(([, currentValue, nextValue]) => currentValue !== nextValue)
      .map(([field]) => field);
  }

  private normalizeOptionalString(value: string | undefined) {
    const normalized = value?.trim();

    return normalized ? normalized : null;
  }

  private throwFieldConflict(field: 'code' | 'name', message: string): never {
    throw new ConflictException({
      message,
      errors: [{ path: [field], message }],
    });
  }

  private rethrowMutationError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      this.throwFieldConflict('code', 'Branch code already exists.');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      throw new ConflictException(
        'The branch changed concurrently. Refresh and try again.',
      );
    }

    throw error;
  }
}
