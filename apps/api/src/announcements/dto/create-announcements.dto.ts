import { createAnnouncementSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateAnnouncementDto extends createZodDto(
  createAnnouncementSchema,
) {}
