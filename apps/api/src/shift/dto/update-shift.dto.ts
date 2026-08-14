import { updateShiftSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateShiftDto extends createZodDto(updateShiftSchema) {}
