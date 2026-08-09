import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';

@Injectable()
export class ActivationTokenService {
  generate() {
    const token = randomBytes(32).toString('hex');

    const tokenHash = this.hash(token);

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return {
      token,
      tokenHash,
      expiresAt,
    };
  }

  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
