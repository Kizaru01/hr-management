import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ActivateAccountDto } from './dto/create-activate.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { successResponse } from '../common/responses/success-response.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from './types/user.type.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('activate')
  activate(@Body() input: ActivateAccountDto) {
    return this.authService.activate(input);
  }
  @Post('login')
  login(@Body() input: LoginDto) {
    return this.authService.login(input);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return successResponse(user, 'Current user retrieved successfully.');
  }
}
