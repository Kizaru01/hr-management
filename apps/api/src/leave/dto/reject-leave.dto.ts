import { rejectLeaveSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class RejectLeaveDto extends createZodDto(rejectLeaveSchema) {}
