import { Module } from '@nestjs/common';

import { PositionController } from './position.controller.js';
import { PositionRepository } from './position.repository.js';
import { PositionService } from './position.service.js';
import { DepartmentModule } from '../department/department.module.js';

@Module({
  imports: [DepartmentModule],
  controllers: [PositionController],
  providers: [PositionService, PositionRepository],
  exports: [PositionRepository],
})
export class PositionModule {}
