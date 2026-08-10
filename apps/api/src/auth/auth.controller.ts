import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ActivateAccountDto } from './dto/create-activate.dto.js';
import { LoginDto } from './dto/login.dto.js';

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
}
