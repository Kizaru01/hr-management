import { Module } from '@nestjs/common';
import { ActivationTokenService } from './activation-token.service.js';

@Module({
  providers: [ActivationTokenService],
  exports: [ActivationTokenService],
})
export class SecurityModule {}
