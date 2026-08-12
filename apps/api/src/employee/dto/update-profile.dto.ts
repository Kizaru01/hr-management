import { updateMyProfileSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateMyProfileDto extends createZodDto(updateMyProfileSchema) {}
