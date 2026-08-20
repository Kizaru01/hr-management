import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { EmployeeModule } from '../employee/employee.module';
import { LeaveRepository } from './leave.repository';
import { NotificationModule } from '../notification/notification.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [EmployeeModule, NotificationModule, AuditLogModule],
  providers: [LeaveService, LeaveRepository],
  controllers: [LeaveController],
  exports: [LeaveRepository, LeaveService],
})
export class LeaveModule {}
