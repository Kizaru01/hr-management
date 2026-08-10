import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../employee/employee.repository.js';
import { UserController } from './user.controller.js';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';
import { SecurityModule } from '../common/security/security.module.js';

@Module({
  imports: [SecurityModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, EmployeeRepository],
  exports: [UserRepository],
})
export class UserModule {}
