import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { EmployeeModule } from '../employee/employee.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { LeaveModule } from '../leave/leave.module';
import { NotificationModule } from '../notification/notification.module';
import { AnnouncementsModule } from '../announcements/announcements.module';

@Module({
  imports: [
    EmployeeModule,
    AttendanceModule,
    LeaveModule,
    NotificationModule,
    AnnouncementsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
