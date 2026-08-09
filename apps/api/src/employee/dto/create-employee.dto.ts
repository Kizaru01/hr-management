// create-employee.dto.ts
import { createEmployeeSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateEmployeeDto extends createZodDto(createEmployeeSchema) {}
