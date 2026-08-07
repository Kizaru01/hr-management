import { createDepartmentSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateDepartmentDto extends createZodDto(createDepartmentSchema) {}
