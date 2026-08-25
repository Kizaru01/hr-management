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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateHolidayDto } from './dto/create-holliday.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HolidayService } from './holliday.service';
import { UpdateHolidayDto } from './dto/update-holliday.dto';

@ApiBearerAuth()
@Controller('holidays')
@UseGuards(JwtAuthGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  create(@Body() input: CreateHolidayDto) {
    return this.holidayService.create(input);
  }
  @Get()
  findAll() {
    return this.holidayService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holidayService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  update(@Param('id') id: string, @Body() input: UpdateHolidayDto) {
    return this.holidayService.update(id, input);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  deactivate(@Param('id') id: string) {
    return this.holidayService.deactivate(id);
  }
}
