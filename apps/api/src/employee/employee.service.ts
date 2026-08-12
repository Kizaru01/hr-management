import type {
  CreateEmployeeInput,
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

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly positionRepository: PositionRepository,
    private readonly branchRepository: BranchRepository,
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

    const employeeId = await this.employeeRepository.generateEmployeeId();

    try {
      const employee = await this.employeeRepository.create({
        ...input,
        email: normalizedEmail,
        employeeId,
      });

      return successResponse(employee, 'Employee created successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'An employee with this email or employee ID already exists.',
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
      throw new NotFoundException('Employee not found.');
    }

    const updatedEmployee = await this.employeeRepository.updateByUserId(
      userId,
      input,
    );

    return successResponse(updatedEmployee, 'Profile updated successfully.');
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
