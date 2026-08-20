import { Body, Controller, Param, Post, UseGuards, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/user.type';
import { CreatePerformanceReviewDto } from './dto/create-performance.dto';
import { PerformanceReviewService } from './performance-review.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('employee')
@UseGuards(JwtAuthGuard)
export class PerformanceReviewController {
  constructor(
    private readonly performanceReviewService: PerformanceReviewService,
  ) {}

  @Post(':employeeId/performance-reviews')
  @Roles('admin', 'hr')
  create(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreatePerformanceReviewDto,
  ) {
    return this.performanceReviewService.create(employeeId, user, input);
  }
  @Get('me/performance-reviews')
  findMyReviews(@CurrentUser() user: AuthenticatedUser) {
    return this.performanceReviewService.findMyReviews(user.id);
  }
  @Get(':employeeId/performance-reviews')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  findByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.performanceReviewService.findByEmployeeId(employeeId);
  }
  @Get('me/team/performance-reviews')
  findMyTeamReviews(@CurrentUser() user: AuthenticatedUser) {
    return this.performanceReviewService.findMyTeamReviews(user.id);
  }
}
