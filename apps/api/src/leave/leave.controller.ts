import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { CreateLeaveDto } from './dto/create-leave.dto.js';
import { LeaveService } from './leave.service.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RejectLeaveDto } from './dto/reject-leave.dto.js';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateLeaveDto,
  ) {
    return this.leaveService.create(user.id, input);
  }
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  findAll() {
    return this.leaveService.findAll();
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.findMine(user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  approve(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.leaveService.approve(id, user.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'hr')
  reject(
    @Param('id') leaveRequestId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: RejectLeaveDto,
  ) {
    return this.leaveService.reject(leaveRequestId, user.id, input);
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
