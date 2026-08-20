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
import { Prisma } from '../generated/prisma/client.js';

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

    if (input.role === 'employee' && !input.employeeNumber) {
      throw new BadRequestException('Employee is required.');
    }

    let employeeId: string | undefined;

    if (input.employeeNumber) {
      const employee = await this.employeeRepository.findByEmployeeNumber(
        input.employeeNumber,
      );

      if (!employee) {
        throw new NotFoundException('Employee not found.');
      }

      employeeId = employee.id;

      if (input.role === 'employee') {
        if (employee.userId) {
          throw new ConflictException('Employee already has an account.');
        }
        if (employee.email.trim().toLowerCase() !== normalizedEmail) {
          throw new BadRequestException(
            'Email does not match the employee record.',
          );
        }
      }
    }

    const activation = this.activationTokenService.generate();

    const user = await this.prisma
      .$transaction(async (tx) => {
        const createdUser = await this.userRepository.create(
          {
            email: normalizedEmail,
            role: input.role,
            activationTokenHash: activation.tokenHash,
            activationExpiresAt: activation.expiresAt,
          },
          tx,
        );

        if (employeeId) {
          const result = await this.employeeRepository.linkUserIfUnlinked(
            employeeId,
            createdUser.id,
            tx,
          );

          if (result.count !== 1) {
            throw new ConflictException('Employee already has an account.');
          }
        }

        return createdUser;
      })
      .catch((error: unknown) => {
        if (error instanceof ConflictException) {
          throw error;
        }

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('A user with this email already exists.');
        }

        throw error;
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
