import { branchQuerySchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class BranchQueryDto extends createZodDto(branchQuerySchema) {}
