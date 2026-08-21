import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentRepository } from './department.repository';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@hr-management/validation';
import { Prisma } from '../generated/prisma/client.js';
import { successResponse } from '../common/responses/success-response';
@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async findAll() {
    const departments = await this.departmentRepository.findAll();

    return successResponse(departments, 'Department retrieved successfully');
  }

  async create(input: CreateDepartmentInput) {
    const code = input.code.trim().toUpperCase();

    const existingDepartmentCode =
      await this.departmentRepository.findByCode(code);

    if (existingDepartmentCode) {
      throw new ConflictException('Department code already exists.');
    }
    const name = input.name.trim();

    const nameKey = name.toUpperCase();

    const existingDepartmentName =
      await this.departmentRepository.findByName(nameKey);

    if (existingDepartmentName) {
      throw new ConflictException('Department name already exists.');
    }
    try {
      const department = await this.departmentRepository.create({
        ...input,
        code,
        name,
        nameKey,
      });

      return successResponse(department, 'Department created successfully');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Department code or name already exists.');
      }

      throw error;
    }
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findById(id);

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    return successResponse(department, 'Department retrieved successfully');
  }

  async update(id: string, input: UpdateDepartmentInput) {
    const department = await this.departmentRepository.findById(id);

    if (!department) {
      throw new NotFoundException('Department not found.');
    }

    const nextCode = input.code?.trim().toUpperCase() ?? department.code;
    const nextName = input.name?.trim() ?? department.name;
    const nextNameKey = nextName.toUpperCase();

    const [duplicateCode, duplicateName] = await Promise.all([
      this.departmentRepository.findByCode(nextCode),
      this.departmentRepository.findByName(nextNameKey),
    ]);

    if (duplicateCode && duplicateCode.id !== id) {
      throw new ConflictException('Department code already exists.');
    }

    if (duplicateName && duplicateName.id !== id) {
      throw new ConflictException('Department name already exists.');
    }

    try {
      const updatedDepartment = await this.departmentRepository.update(id, {
        ...input,
        ...(input.code !== undefined && { code: nextCode }),
        ...(input.name !== undefined && {
          name: nextName,
          nameKey: nextNameKey,
        }),
      });

      return successResponse(
        updatedDepartment,
        'Updated department successfully',
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Department code or name already exists.');
      }

      throw error;
    }
  }

  async remove(id: string) {
    const existingDepartment = await this.departmentRepository.findById(id);

    if (!existingDepartment) {
      throw new NotFoundException('Department not found.');
    }

    const department = await this.departmentRepository.remove(id);

    return successResponse(department, 'Department deleted successfully');
  }
}
