import { createShiftSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateShiftDto extends createZodDto(createShiftSchema) {}
