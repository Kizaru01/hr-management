import { createLeaveSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateLeaveDto extends createZodDto(createLeaveSchema) {}
