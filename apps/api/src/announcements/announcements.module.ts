import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsRepository } from './announcements.repository';
import { DepartmentModule } from '../department/department.module';
import { BranchModule } from '../branch/branch.module';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [DepartmentModule, BranchModule, EmployeeModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService, AnnouncementsRepository],
  exports: [AnnouncementsRepository],
})
export class AnnouncementsModule {}
