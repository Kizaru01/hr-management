import { Module } from '@nestjs/common';
import { PerformanceReviewController } from './performance-review.controller';
import { PerformanceReviewService } from './performance-review.service';
import { PerformanceReviewRepository } from './performance-review-repository';
import { EmployeeModule } from '../employee/employee.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [EmployeeModule, NotificationModule],
  controllers: [PerformanceReviewController],
  providers: [PerformanceReviewService, PerformanceReviewRepository],
  exports: [PerformanceReviewService, PerformanceReviewRepository],
})
export class PerformanceReviewModule {}
