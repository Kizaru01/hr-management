import { employeeQuerySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class EmployeeQueryDto extends createZodDto(employeeQuerySchema) {}
