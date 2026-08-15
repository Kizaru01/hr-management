import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/user.type';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcements.dto';

@Controller('announcements')
@UseGuards(JwtAuthGuard)
export class AnnouncementsController {
  constructor(private readonly announcementService: AnnouncementsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateAnnouncementDto,
  ) {
    return this.announcementService.create(user.id, input);
  }
  @Get()
  findActive(@CurrentUser() user: AuthenticatedUser) {
    return this.announcementService.findActive(user.id);
  }
  @Get('manage')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  findAllForManagement() {
    return this.announcementService.findAllForManagement();
  }
}
