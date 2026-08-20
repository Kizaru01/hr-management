import { updateHolidaySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateHolidayDto extends createZodDto(updateHolidaySchema) {}
