import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { UpdateMyProfileDto } from './dto/update-profile.dto.js';
import { AssignManagerDto } from './dto/create-manager.dto.js';

@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @Get()
  findAll() {
    return this.employeeService.findAll();
  }
  @Post()
  create(@Body() input: CreateEmployeeDto) {
    return this.employeeService.create(input);
  }
  @Get('me')
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.employeeService.findMe(user.id);
  }
  @Get('me/team')
  findMyTeam(@CurrentUser() user: AuthenticatedUser) {
    return this.employeeService.findMyTeam(user.id);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }
  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateMyProfileDto,
  ) {
    return this.employeeService.updateMe(user.id, input);
  }
  @Patch(':id/manager')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  assignManager(@Param('id') id: string, @Body() input: AssignManagerDto) {
    return this.employeeService.assignManager(id, input);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdateEmployeeDto) {
    return this.employeeService.update(id, input);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
