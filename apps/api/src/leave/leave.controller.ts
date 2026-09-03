import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { LeaveService } from './leave.service.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RejectLeaveDto } from './dto/reject-leave.dto.js';

@ApiBearerAuth()
@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateLeaveDto,
  ) {
    return this.leaveService.create(user.id, input);
  }
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  findAll() {
    return this.leaveService.findAll();
  }
  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.findMine(user.id);
  }
  @Get('team')
  @UseGuards(RolesGuard)
  @Roles('manager')
  findMyTeamLeaveRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.findMyTeamLeaveRequests(user.id);
  }
  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.approve(id, user.id, user.role);
  }
  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: RejectLeaveDto,
  ) {
    return this.leaveService.reject(id, user.id, user.role, input);
  }
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(
    @Param('id') leaveRequestId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.leaveService.cancel(leaveRequestId, user.id);
  }
}
