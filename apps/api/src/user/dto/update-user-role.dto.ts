import { updateUserRoleSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserRoleDto extends createZodDto(updateUserRoleSchema) {}
