import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { PositionService } from './position.service.js';

@ApiBearerAuth()
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  findActiveLookup(@Query('departmentId') departmentId?: string) {
    return this.positionService.findActiveLookup(departmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreatePositionDto,
  ) {
    return this.positionService.create(user.id, input);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.positionService.deactivate(id, user.id);
  }

  @Patch(':id/reactivate')
  reactivate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.positionService.reactivate(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdatePositionDto,
  ) {
    return this.positionService.update(id, user.id, input);
  }
}

@ApiBearerAuth()
@Controller('departments/:departmentId/positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class DepartmentPositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  findAll(@Param('departmentId') departmentId: string) {
    return this.positionService.findAllForDepartment(departmentId);
  }
}
