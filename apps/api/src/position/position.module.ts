import { Module } from '@nestjs/common';

import { AuditLogModule } from '../audit-log/audit-log.module.js';
import { DepartmentModule } from '../department/department.module.js';
import {
  DepartmentPositionController,
  PositionController,
} from './position.controller.js';
import { PositionRepository } from './position.repository.js';
import { PositionService } from './position.service.js';

@Module({
  imports: [DepartmentModule, AuditLogModule],
  controllers: [PositionController, DepartmentPositionController],
  providers: [PositionService, PositionRepository],
  exports: [PositionRepository],
})
export class PositionModule {}
