// create-position.dto.ts

import { activateAccountSchema } from '@hr-management/validation';
import { createZodDto } from 'nestjs-zod';

export class ActivateAccountDto extends createZodDto(activateAccountSchema) {}
