// create-position.dto.ts
import { createUserSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(createUserSchema) {}
