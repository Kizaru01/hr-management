import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { PasswordService } from './password.service';
import { ActivateAccountInput, LoginInput } from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response';
import { ActivationTokenService } from '../common/security/activation-token.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly activationTokenService: ActivationTokenService,
    private readonly jwtService: JwtService,
  ) {}
  async activate(input: ActivateAccountInput) {
    const tokenHash = this.activationTokenService.hash(input.token);

    const user = await this.userRepository.findByActivationTokenHash(tokenHash);

    if (!user) {
      throw new BadRequestException('Invalid activation token.');
    }

    if (!user.activationExpiresAt || user.activationExpiresAt < new Date()) {
      throw new BadRequestException('Activation token has expired.');
    }

    const passwordHash = await this.passwordService.hash(input.password);

    const updatedUser = await this.userRepository.activate(
      user.id,
      passwordHash,
    );
    const payload = {
      sub: user.id,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return successResponse(
      {
        accessToken,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          lastLoginAt: updatedUser.lastLoginAt,
        },
      },
      'Login successful.',
    );
  }
  async login(input: LoginInput) {
    const normalizedEmail = input.email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active.');
    }

    const passwordMatches = await this.passwordService.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const updatedUser = await this.userRepository.updateLastLogin(user.id);

    return successResponse(
      {
        accessToken,
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        lastLoginAt: updatedUser.lastLoginAt,
      },
      'Login successful.',
    );
  }
}
