import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { EmployeeModule } from '../employee/employee.module';
import { LeaveRepository } from './leave.repository';

@Module({
  imports: [EmployeeModule],
  providers: [LeaveService, LeaveRepository],
  controllers: [LeaveController],
  exports: [LeaveRepository, LeaveService],
})
export class LeaveModule {}
