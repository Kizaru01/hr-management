// update-position.dto.ts
import { updatePositionSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdatePositionDto extends createZodDto(updatePositionSchema) {}
