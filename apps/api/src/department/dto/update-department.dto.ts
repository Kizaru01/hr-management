import { updateDepartmentSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateDepartmentDto extends createZodDto(updateDepartmentSchema) {}
