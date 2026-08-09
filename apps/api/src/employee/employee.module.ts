import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { DepartmentRepository } from '../department/department.repository';
import { PositionRepository } from '../position/position.repository';
import { BranchRepository } from '../branch/branch.respository';

@Module({
  imports: [DepartmentRepository, PositionRepository, BranchRepository],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository],
})
export class EmployeeModule {}
