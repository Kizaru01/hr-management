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
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreatePositionDto } from './dto/create-position.dto.js';
import { UpdatePositionDto } from './dto/update-position.dto.js';
import { PositionService } from './position.service.js';

@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'hr')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  @Post()
  create(@Body() input: CreatePositionDto) {
    return this.positionService.create(input);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() input: UpdatePositionDto) {
    return this.positionService.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.positionService.remove(id);
  }
}
