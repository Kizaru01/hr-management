import { Module } from '@nestjs/common';
import { EmployeeRepository } from '../employee/employee.repository.js';
import { UserController } from './user.controller.js';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';
import { SecurityModule } from '../common/security/security.module.js';
import { AuditLogModule } from '../audit-log/audit-log.module.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [SecurityModule, AuditLogModule, EmailModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, EmployeeRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
