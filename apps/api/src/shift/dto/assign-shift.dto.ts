import { assignShiftSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class AssignShiftDto extends createZodDto(assignShiftSchema) {}
