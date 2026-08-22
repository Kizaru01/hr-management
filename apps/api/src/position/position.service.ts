import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type {
  CreatePositionInput,
  UpdatePositionInput,
} from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response.js';
import { DepartmentRepository } from '../department/department.repository.js';
import { PositionRepository } from './position.repository.js';
import { Prisma } from '../generated/prisma/client.js';
import { normalizeName } from '@hr-management/domain';

@Injectable()
export class PositionService {
  constructor(
    private readonly positionRepository: PositionRepository,
    private readonly departmentRepository: DepartmentRepository,
  ) {}

  async findAll(departmentId?: string) {
    const positions = await this.positionRepository.findAll(departmentId);

    return successResponse(positions, 'Positions retrieved successfully.');
  }

  async findOne(id: string) {
    const position = await this.positionRepository.findById(id);

    if (!position) {
      throw new NotFoundException('Position not found.');
    }

    return successResponse(position, 'Position retrieved successfully.');
  }

  async create(input: CreatePositionInput) {
    const department = await this.departmentRepository.findById(
      input.departmentId,
    );

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    const name = normalizeName(input.name);

    const existingPosition =
      await this.positionRepository.findByDepartmentAndName(
        input.departmentId,
        name,
      );

    if (existingPosition) {
      throw new ConflictException(
        'Position already exists in this department.',
      );
    }

    try {
      const position = await this.positionRepository.create({
        ...input,
        name,
      });

      return successResponse(position, 'Position created successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Position already exists in this department.',
        );
      }

      throw error;
    }
  }

  async update(id: string, input: UpdatePositionInput) {
    const existingPosition = await this.positionRepository.findById(id);

    if (!existingPosition) {
      throw new NotFoundException('Position not found.');
    }

    const nextName =
      input.name !== undefined
        ? normalizeName(input.name)
        : existingPosition.name;

    const nextDepartmentId =
      input.departmentId ?? existingPosition.departmentId;

    if (input.departmentId !== undefined) {
      const department =
        await this.departmentRepository.findById(nextDepartmentId);

      if (!department) {
        throw new NotFoundException('Department not found.');
      }
    }

    const duplicate = await this.positionRepository.findByDepartmentAndName(
      nextDepartmentId,
      nextName,
    );

    if (duplicate && duplicate.id !== id) {
      throw new ConflictException(
        'Position already exists in this department.',
      );
    }

    try {
      const position = await this.positionRepository.update(id, {
        ...input,
        ...(input.name !== undefined && {
          name: nextName,
        }),
      });

      return successResponse(position, 'Position updated successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Position already exists in this department.',
        );
      }

      throw error;
    }
  }

  async remove(id: string) {
    const existingPosition = await this.positionRepository.findById(id);

    if (!existingPosition) {
      throw new NotFoundException('Position not found.');
    }

    const position = await this.positionRepository.remove(id);

    return successResponse(position, 'Position deleted successfully.');
  }
}
