import { createHolidaySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateHolidayDto extends createZodDto(createHolidaySchema) {}
