import { createEmployeeDocumentSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateEmployeeDocumentDto extends createZodDto(
  createEmployeeDocumentSchema,
) {}
