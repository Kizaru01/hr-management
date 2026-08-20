import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentModule } from './department/department.module';
import { PrismaModule } from './prisma/prisma.module';
import { PositionModule } from './position/position.module';
import { EmployeeModule } from './employee/employee.module';
import { BranchModule } from './branch/branch.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LeaveModule } from './leave/leave.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ShiftModule } from './shift/shift.module';
import { HolidayModule } from './holliday/holliday.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { EmployeeDocumentsModule } from './employee-documents/employee-documents.module';
import { PerformanceReviewController } from './performance-review/performance-review.controller';
import { PerformanceReviewService } from './performance-review/performance-review.service';
import { PerformanceReviewModule } from './performance-review/performance-review.module';
import { NotificationModule } from './notification/notification.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    DepartmentModule,
    PrismaModule,
    PositionModule,
    EmployeeModule,
    BranchModule,
    UserModule,
    AuthModule,
    LeaveModule,
    AttendanceModule,
    ShiftModule,
    HolidayModule,
    AnnouncementsModule,
    EmployeeDocumentsModule,
    PerformanceReviewModule,
    NotificationModule,
    DashboardModule,
  ],
  controllers: [AppController, PerformanceReviewController],
  providers: [AppService, PerformanceReviewService],
})
export class AppModule {}
