import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { EmployeeModule } from '../employee/employee.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { LeaveModule } from '../leave/leave.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { DashboardRepository } from './dashboard.repository';

@Module({
  imports: [EmployeeModule, AttendanceModule, LeaveModule, AnnouncementsModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
