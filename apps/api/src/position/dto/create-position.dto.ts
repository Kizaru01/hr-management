// create-position.dto.ts
import { createPositionSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreatePositionDto extends createZodDto(createPositionSchema) {}
