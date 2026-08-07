import { Injectable } from '@nestjs/common';
import { DepartmentRepository } from './department.repository';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@hr-management/validation';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async findAll() {
    const departments = await this.departmentRepository.findAll();

    return {
      success: true,
      message: 'Departments retrieved successfully.',
      data: departments,
    };
  }

  async create(input: CreateDepartmentInput) {
    const department = await this.departmentRepository.create(input);

    return {
      success: true,
      message: 'Department created successfully.',
      data: department,
    };
  }

  async findOne(id: string) {
    const department = await this.departmentRepository.findById(id);

    if (!department) {
      return {
        success: false,
        message: 'Department not found.',
      };
    }

    return {
      success: true,
      message: 'Department retrieved successfully.',
      data: department,
    };
  }

  async update(id: string, input: UpdateDepartmentInput) {
    const department = await this.departmentRepository.findById(id);

    if (!department) {
      return {
        success: false,
        message: 'Department not found.',
      };
    }

    const updatedDepartment = await this.departmentRepository.update(id, input);

    return {
      success: true,
      message: 'Department updated successfully.',
      data: updatedDepartment,
    };
  }

  async remove(id: string) {
    const existingDepartment = await this.departmentRepository.findById(id);

    if (!existingDepartment) {
      return {
        success: false,
        message: 'Department not found.',
      };
    }

    const department = await this.departmentRepository.remove(id);

    return {
      success: true,
      message: 'Department deleted successfully.',
      data: department,
    };
  }
}
