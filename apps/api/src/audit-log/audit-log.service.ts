import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from './audit-log.repository.js';
import { successResponse } from '../common/responses/success-response.js';
import { Prisma } from '../generated/prisma/client.js';

interface CreateAuditLogInput {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  create(input: CreateAuditLogInput) {
    return this.auditLogRepository.create({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,

      ...(input.actorUserId && {
        actorUser: {
          connect: {
            id: input.actorUserId,
          },
        },
      }),
    });
  }
  async findRecent() {
    const logs = await this.auditLogRepository.findRecent(50);

    return successResponse(logs, 'Audit logs retrieved successfully.');
  }
}
