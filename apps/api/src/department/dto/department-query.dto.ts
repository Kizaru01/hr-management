import { departmentQuerySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class DepartmentQueryDto extends createZodDto(departmentQuerySchema) {}
