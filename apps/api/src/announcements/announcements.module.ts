import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsRepository } from './announcements.repository';
import { DepartmentModule } from '../department/department.module';
import { BranchModule } from '../branch/branch.module';
import { EmployeeModule } from '../employee/employee.module';
import { NotificationModule } from '../notification/notification.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    DepartmentModule,
    BranchModule,
    EmployeeModule,
    NotificationModule,
    AuditLogModule,
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, AnnouncementsRepository],
  exports: [AnnouncementsRepository],
})
export class AnnouncementsModule {}
