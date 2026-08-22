import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.schema';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() input: CreateUserDto) {
    return this.userService.create(input);
  }
}
