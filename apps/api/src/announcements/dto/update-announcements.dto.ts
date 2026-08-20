import { updateAnnouncementSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateAnnouncementDto extends createZodDto(
  updateAnnouncementSchema,
) {}
