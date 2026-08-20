import { createPerformanceReviewSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreatePerformanceReviewDto extends createZodDto(
  createPerformanceReviewSchema,
) {}
