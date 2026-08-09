// update-employee.dto.ts
import { updateEmployeeSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateEmployeeDto extends createZodDto(updateEmployeeSchema) {}
