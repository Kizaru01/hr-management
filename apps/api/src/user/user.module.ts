import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { EmployeeRepository } from '../employee/employee.repository';
import { ActivationTokenService } from '../auth/auth-activation.service';

@Module({
  imports: [EmployeeRepository, ActivationTokenService],
  controllers: [UserController],
  providers: [UserService, UserRepository],
})
export class UserModule {}
