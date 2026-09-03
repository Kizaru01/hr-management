import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateShiftDto } from './dto/create-shift.dto.js';
import { ShiftService } from './shift.service.js';
import { UpdateShiftDto } from './dto/update-shift.dto.js';
import { AssignShiftDto } from './dto/assign-shift.dto.js';

@ApiBearerAuth()
@Controller('shift')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr', 'manager')
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Get()
  findAll() {
    return this.shiftService.findAll();
  }
  @Get('employee/:employeeId')
  findEmployeeShifts(@Param('employeeId') employeeId: string) {
    return this.shiftService.findEmployeeShifts(employeeId);
  }
  @Get(':id')
  findOne(@Param('id') shiftId: string) {
    return this.shiftService.findOne(shiftId);
  }

  @Post()
  create(@Body() input: CreateShiftDto) {
    return this.shiftService.create(input);
  }

  @Post('employee/:employeeId')
  assignToEmployee(
    @Param('employeeId') employeeId: string,
    @Body() input: AssignShiftDto,
  ) {
    return this.shiftService.assignToEmployee(employeeId, input);
  }

  @Delete('assignment/:assignmentId')
  removeAssignment(@Param('assignmentId') assignmentId: string) {
    return this.shiftService.removeAssignment(assignmentId);
  }

  @Patch(':id')
  update(@Param('id') shiftId: string, @Body() input: UpdateShiftDto) {
    return this.shiftService.update(shiftId, input);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') shiftId: string) {
    return this.shiftService.deactivate(shiftId);
  }
}
