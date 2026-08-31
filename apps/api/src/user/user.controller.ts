import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { CreateUserDto } from './dto/create-user.schema.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UserService } from './user.service.js';

@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  create(
    @Body() input: CreateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.userService.create(input, currentUser.id);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id') id: string,
    @Body() input: UpdateUserRoleDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.userService.updateRole(id, input, currentUser.id);
  }

  @Patch(':id/activate')
  activateAccess(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.userService.activateAccess(id, currentUser.id);
  }

  @Patch(':id/deactivate')
  deactivateAccess(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.userService.deactivateAccess(id, currentUser.id);
  }
}
