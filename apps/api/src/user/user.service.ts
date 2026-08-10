import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateUserInput } from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response.js';
import { EmployeeRepository } from '../employee/employee.repository.js';
import { UserRepository } from './user.repository.js';
import { PrismaService } from '../prisma/prisma.service';
import { ActivationTokenService } from '../common/security/activation-token.service.js';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly activationTokenService: ActivationTokenService,
    private readonly employeeRepository: EmployeeRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(input: CreateUserInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    if (input.role === 'employee') {
      if (!input.employeeId) {
        throw new BadRequestException('Employee is required.');
      }

      const employee = await this.employeeRepository.findByEmployeeId(
        input.employeeId,
      );

      if (!employee) {
        throw new NotFoundException('Employee not found.');
      }

      if (employee.userId) {
        throw new ConflictException('Employee already has an account.');
      }
    }

    const activation = this.activationTokenService.generate();

    const user = await this.prisma.$transaction(async (tx) => {
      const createdUser = await this.userRepository.create(
        {
          email: normalizedEmail,
          role: input.role,
          activationTokenHash: activation.tokenHash,
          activationExpiresAt: activation.expiresAt,
        },
        tx,
      );

      if (input.employeeId) {
        const employee = await this.employeeRepository.findByEmployeeId(
          input.employeeId,
        );
        if (!employee) {
          throw new NotFoundException('Employee not found.');
        }

        await this.employeeRepository.linkUser(employee.id, createdUser.id, tx);
      }

      return createdUser;
    });

    return successResponse(
      {
        user,
        activationToken: activation.token,
      },
      'User created successfully.',
    );
  }
}
