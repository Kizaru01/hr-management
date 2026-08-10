import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { PositionModule } from '../position/position.module';
import { BranchModule } from '../branch/branch.module';
import { DepartmentModule } from '../department/department.module';

@Module({
  imports: [PositionModule, BranchModule, DepartmentModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
  exports: [EmployeeRepository, EmployeeService],
})
export class EmployeeModule {}
