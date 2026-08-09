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
import { errorResponse } from '../common/responses/failed-response';
@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async findAll() {
    try {
      const departments = await this.departmentRepository.findAll();

      return successResponse(departments, 'Department retrieved successfully');
    } catch (error) {
      return errorResponse(error);
    }
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

    const updatedDepartment = await this.departmentRepository.update(id, input);

    return successResponse(
      updatedDepartment,
      'Updated department successfully',
    );
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
