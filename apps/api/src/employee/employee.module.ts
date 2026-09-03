import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { PositionModule } from '../position/position.module';
import { BranchModule } from '../branch/branch.module';
import { DepartmentModule } from '../department/department.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { UserModule } from '../user/user.module';
import { SecurityModule } from '../common/security/security.module.js';
import { EmailModule } from '../email/email.module.js';

@Module({
  imports: [
    PositionModule,
    BranchModule,
    DepartmentModule,
    AuditLogModule,
    UserModule,
    SecurityModule,
    EmailModule,
  ],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeRepository, EmployeeService],
})
export class EmployeeModule {}
