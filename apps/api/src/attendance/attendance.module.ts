import { Module } from '@nestjs/common';
import { EmployeeModule } from '../employee/employee.module.js';
import { AttendanceController } from './attendance.controller.js';
import { AttendanceRepository } from './attendance.repository.js';
import { AttendanceService } from './attendance.service.js';
import { ShiftModule } from '../shift/shift.module.js';
import { LeaveModule } from '../leave/leave.module.js';
import { HolidayModule } from '../holliday/holliday.module.js';

@Module({
  imports: [
    EmployeeModule,
    ShiftModule,
    LeaveModule,
    AttendanceModule,
    HolidayModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
