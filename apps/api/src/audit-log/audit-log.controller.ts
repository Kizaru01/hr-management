import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findRecent() {
    return this.auditLogService.findRecent();
  }
}
