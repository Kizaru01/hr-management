import { attendanceQuerySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class AttendanceQueryDto extends createZodDto(attendanceQuerySchema) {}
