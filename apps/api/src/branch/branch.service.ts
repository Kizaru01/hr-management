import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from '@hr-management/validation';
import { Prisma } from '../generated/prisma/client.js';
import { successResponse } from '../common/responses/success-response.js';
import { BranchRepository } from './branch.respository.js';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepository: BranchRepository) {}

  async findAll() {
    const branches = await this.branchRepository.findAll();

    return successResponse(branches, 'Branches retrieved successfully.');
  }

  async findOne(id: string) {
    const branch = await this.branchRepository.findById(id);

    if (!branch) {
      throw new NotFoundException('Branch not found.');
    }

    return successResponse(branch, 'Branch retrieved successfully.');
  }

  async create(input: CreateBranchInput) {
    const code = input.code.trim().toUpperCase();

    const existingBranch = await this.branchRepository.findByCode(code);

    if (existingBranch) {
      throw new ConflictException('Branch code already exists.');
    }

    try {
      const branch = await this.branchRepository.create({
        ...input,
        code,
        name: input.name.trim(),
        address: input.address.trim(),
      });

      return successResponse(branch, 'Branch created successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Branch code already exists.');
      }

      throw error;
    }
  }

  async update(id: string, input: UpdateBranchInput) {
    const existingBranch = await this.branchRepository.findById(id);

    if (!existingBranch) {
      throw new NotFoundException('Branch not found.');
    }

    const nextCode = input.code?.trim().toUpperCase() ?? existingBranch.code;

    const duplicate = await this.branchRepository.findByCode(nextCode);

    if (duplicate && duplicate.id !== id) {
      throw new ConflictException('Branch code already exists.');
    }

    try {
      const branch = await this.branchRepository.update(id, {
        ...input,
        ...(input.code !== undefined && {
          code: nextCode,
        }),
        ...(input.name !== undefined && {
          name: input.name.trim(),
        }),
        ...(input.address !== undefined && {
          address: input.address.trim(),
        }),
      });

      return successResponse(branch, 'Branch updated successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Branch code already exists.');
      }

      throw error;
    }
  }

  async remove(id: string) {
    const existingBranch = await this.branchRepository.findById(id);

    if (!existingBranch) {
      throw new NotFoundException('Branch not found.');
    }

    const branch = await this.branchRepository.remove(id);

    return successResponse(branch, 'Branch deleted successfully.');
  }
}
