import { attendanceRangeQuerySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class AttendanceRangeQueryDto extends createZodDto(
  attendanceRangeQuerySchema,
) {}
