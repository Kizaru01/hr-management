// create-branch.dto.ts
import { createBranchSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class CreateBranchDto extends createZodDto(createBranchSchema) {}
