import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { ShiftRepository } from './shift.repository';
import { EmployeeShiftRepository } from './employee-shift.repository';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [EmployeeModule],
  controllers: [ShiftController],
  providers: [ShiftService, ShiftRepository, EmployeeShiftRepository],
  exports: [ShiftRepository, EmployeeShiftRepository],
})
export class ShiftModule {}
