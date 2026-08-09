import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';
import { ActivationTokenService } from './auth-activation.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordService, ActivationTokenService],
  exports: [PasswordService, ActivationTokenService],
})
export class AuthModule {}
