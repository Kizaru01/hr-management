import { Controller, Post, UseGuards, Get, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AttendanceService } from './attendance.service.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { AttendanceQueryDto } from './dto/attendance-query.dto.js';
import { getWorkDate } from './attendance-date.js';
import { AttendanceRangeQueryDto } from './dto/attendance-range-query.dto.js';

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
  @Roles('employee')
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.attendanceService.findMine(user.id, from, to);
  }

  @Get('daily')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  getCompanyDailyAttendance(@Query() query: AttendanceQueryDto) {
    const date = query.date ?? getWorkDate().toISOString().slice(0, 10);

    return this.attendanceService.getCompanyDailyAttendance(date);
  }

  @Get('summary')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  getCompanySummary(@Query() query: AttendanceQueryDto) {
    const date = query.date ?? getWorkDate().toISOString().slice(0, 10);

    return this.attendanceService.getCompanyDailySummary(date);
  }
  @Get('team')
  getMyTeamDailyAttendance(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AttendanceQueryDto,
  ) {
    const date = query.date ?? getWorkDate().toISOString().slice(0, 10);

    return this.attendanceService.getMyTeamDailyAttendance(user.id, date);
  }
  @Get('me/summary')
  @Roles('employee')
  getMySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AttendanceRangeQueryDto,
  ) {
    return this.attendanceService.getMySummary(user.id, query.from, query.to);
  }

  @Get('me/status')
  @Roles('employee')
  getMyDailyStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Query('date') date?: string,
  ) {
    const workDate = date ? new Date(`${date}T00:00:00.000Z`) : getWorkDate();

    return this.attendanceService.getDailyStatus(user.id, workDate);
  }

  @Get('employee/:employeeId/summary')
  @Roles('admin', 'hr')
  getEmployeeSummary(
    @Param('employeeId') employeeId: string,
    @Query() query: AttendanceRangeQueryDto,
  ) {
    return this.attendanceService.getEmployeeSummary(
      employeeId,
      query.from,
      query.to,
    );
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
