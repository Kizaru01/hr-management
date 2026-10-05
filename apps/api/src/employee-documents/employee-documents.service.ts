import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BlobError, put, del } from '@vercel/blob';
import { Prisma } from '../generated/prisma/client.js';
import { randomUUID } from 'node:crypto';
import { EmployeeRepository } from '../employee/employee.repository';
import { CreateEmployeeDocumentInput } from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response';
import { EmployeeDocumentRepository } from './employee-document.repository';
import { NotificationService } from '../notification/notification.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { dateOnlyToUtc } from '../common/dates/date-conversion.js';
import {
  mapEmployeeDocumentListItem,
  mapManagedEmployeeDocumentListItem,
} from './employee-document.mapper.js';

@Injectable()
export class EmployeeDocumentService {
  private readonly logger = new Logger(EmployeeDocumentService.name);

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly employeeDocumentRepository: EmployeeDocumentRepository,
    private readonly notificationService: NotificationService,
    private readonly auditLogService: AuditLogService,
  ) {}
  async create(
    employeeId: string,
    uploadedByUserId: string,
    file: Express.Multer.File,
    input: CreateEmployeeDocumentInput,
  ) {
    if (!file) {
      throw new BadRequestException('Document file is required.');
    }
    let stage = 'validation';
    let documentPersisted = false;
    let uploadedBlobUrl: string | undefined;

    try {
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Only PDF, JPEG, and PNG files are allowed.',
        );
      }

      if (!Buffer.isBuffer(file.buffer)) {
        throw new InternalServerErrorException('Internal server error.');
      }

      stage = 'employee lookup';
      const employee = await this.employeeRepository.findById(employeeId);

      if (!employee) {
        throw new NotFoundException('Employee not found.');
      }

      stage = 'storage configuration';
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new InternalServerErrorException('Internal server error.');
      }

      const extension =
        file.mimetype === 'application/pdf'
          ? 'pdf'
          : file.mimetype === 'image/jpeg'
            ? 'jpg'
            : 'png';

      stage = 'blob upload';
      const blob = await put(
        `employee-documents/${randomUUID()}.${extension}`,
        file.buffer,
        {
          access: 'private',
          contentType: file.mimetype,
        },
      );

      uploadedBlobUrl = blob.url;

      stage = 'document persistence';
      const document = await this.employeeDocumentRepository.create({
        title: input.title.trim(),
        type: input.type.trim(),
        fileUrl: blob.url,
        issuedAt: input.issuedAt ? dateOnlyToUtc(input.issuedAt) : undefined,
        expiresAt: input.expiresAt ? dateOnlyToUtc(input.expiresAt) : undefined,

        employee: {
          connect: {
            id: employee.id,
          },
        },

        uploadedBy: {
          connect: {
            id: uploadedByUserId,
          },
        },
      });
      documentPersisted = true;

      if (employee.userId) {
        try {
          await this.notificationService.create({
            userId: employee.userId,
            title: 'New employee document',
            message: `${document.title} has been added to your employee documents.`,
            type: 'document',
            resourceType: 'employee_document',
            resourceId: document.id,
          });
        } catch (error) {
          this.logCreateFailure('notification after persistence', error);
        }
      }
      try {
        await this.auditLogService.create({
          actorUserId: uploadedByUserId,
          action: 'employee_document.create',
          entityType: 'EmployeeDocument',
          entityId: document.id,
          metadata: {
            employeeId: employee.id,
            title: document.title,
            type: document.type,
          },
        });
      } catch (error) {
        this.logCreateFailure('audit after persistence', error);
      }
      return successResponse(
        { id: document.id },
        'Employee document created successfully.',
      );
    } catch (error) {
      this.logCreateFailure(stage, error);

      if (uploadedBlobUrl && !documentPersisted) {
        try {
          await del(uploadedBlobUrl);
        } catch (cleanupError) {
          this.logCreateFailure(
            'blob cleanup before persistence',
            cleanupError,
          );
        }
      }

      throw error;
    }
  }
  private logCreateFailure(stage: string, error: unknown) {
    // Never log exception messages/stacks: providers can include credentials or data.
    const category =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? 'database'
        : error instanceof BlobError
          ? 'blob'
          : error instanceof Error
            ? 'application'
            : 'unknown';
    const code =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      /^P\d{4}$/.test(error.code)
        ? error.code
        : 'unavailable';
    this.logger.error(
      `Employee document creation stage=${stage} category=${category} code=${code}`,
    );
  }

  async findByEmployeeId(employeeId: string) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const documents = await this.employeeDocumentRepository.findByEmployeeId(
      employee.id,
    );
    const data = documents.map(mapEmployeeDocumentListItem);

    return successResponse(data, 'Employee documents retrieved successfully.');
  }
  async findAll() {
    const documents = await this.employeeDocumentRepository.findAllActive();
    const data = documents.map(mapManagedEmployeeDocumentListItem);

    return successResponse(data, 'Employee documents retrieved successfully.');
  }
  async findMyDocuments(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const documents = await this.employeeDocumentRepository.findByEmployeeId(
      employee.id,
    );
    const data = documents.map(mapEmployeeDocumentListItem);

    return successResponse(data, 'Employee documents retrieved successfully.');
  }
  async deactivate(id: string, currentUserId: string) {
    const document = await this.employeeDocumentRepository.findById(id);

    if (!document) {
      throw new NotFoundException('Employee document not found.');
    }

    if (!document.isActive) {
      throw new BadRequestException('Employee document is already inactive.');
    }

    const updatedDocument = await this.employeeDocumentRepository.update(id, {
      isActive: false,
    });

    await this.auditLogService.create({
      actorUserId: currentUserId,
      action: 'employee_document.deactivate',
      entityType: 'EmployeeDocument',
      entityId: document.id,
      metadata: {
        employeeId: document.employeeId,
      },
    });

    return successResponse(
      {
        id: updatedDocument.id,
        isActive: false as const,
      },
      'Employee document deactivated successfully.',
    );
  }
  async getDocumentForDownload(
    documentId: string,
    currentUserId: string,
    currentUserRole: string,
  ) {
    const document = await this.employeeDocumentRepository.findById(documentId);

    if (!document || !document.isActive) {
      throw new NotFoundException('Employee document not found.');
    }

    if (currentUserRole !== 'admin' && currentUserRole !== 'hr') {
      const employee =
        await this.employeeRepository.findByUserId(currentUserId);

      if (!employee) {
        throw new ForbiddenException();
      }

      if (document.employeeId !== employee.id) {
        throw new ForbiddenException(
          'You are not authorized to access this document.',
        );
      }
    }

    return document;
  }
}
