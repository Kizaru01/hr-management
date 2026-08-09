import { Module } from '@nestjs/common';
import { DepartmentRepository } from '../department/department.repository.js';
import { PositionController } from './position.controller.js';
import { PositionRepository } from './position.repository.js';
import { PositionService } from './position.service.js';

@Module({
  imports: [DepartmentRepository],
  controllers: [PositionController],
  providers: [PositionService, PositionRepository],
  exports: [PositionService],
})
export class PositionModule {}
