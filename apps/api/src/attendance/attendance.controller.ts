import { Controller, Post, UseGuards, Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AttendanceService } from './attendance.service.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto.js';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  findAll(@Query() query: AttendanceQueryDto) {
    return this.attendanceService.findAll(query);
  }
  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.findMine(user.id);
  }
  @Post('check-in')
  checkIn(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.checkIn(user.id);
  }
  @Post('check-out')
  checkOut(@CurrentUser() user: AuthenticatedUser) {
    return this.attendanceService.checkOut(user.id);
  }
}
