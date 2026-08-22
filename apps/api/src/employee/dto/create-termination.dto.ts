// create-employee.dto.ts
import { terminateEmployeeSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class TerminateEmployeeDto extends createZodDto(
  terminateEmployeeSchema,
) {}
