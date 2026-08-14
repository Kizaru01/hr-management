import { assignManagerSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class AssignManagerDto extends createZodDto(assignManagerSchema) {}
