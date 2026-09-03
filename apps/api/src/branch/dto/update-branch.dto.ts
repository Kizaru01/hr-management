import { updateBranchSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class UpdateBranchDto extends createZodDto(updateBranchSchema) {}
