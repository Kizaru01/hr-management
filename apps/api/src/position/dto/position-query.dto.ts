import { positionQuerySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class PositionQueryDto extends createZodDto(positionQuerySchema) {}
