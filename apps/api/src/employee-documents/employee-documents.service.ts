import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeeRepository } from '../employee/employee.repository';
import { CreateEmployeeDocumentInput } from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response';
import { EmployeeDocumentRepository } from './employee-document.repository';

@Injectable()
export class EmployeeDocumentService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly employeeDocumentRepository: EmployeeDocumentRepository,
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
    const fileUrl = `uploads/employee-documents/${file.filename}`;
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const document = await this.employeeDocumentRepository.create({
      title: input.title.trim(),
      type: input.type.trim(),
      fileUrl,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,

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

    return successResponse(document, 'Employee document created successfully.');
  }
  async findByEmployeeId(employeeId: string) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const documents = await this.employeeDocumentRepository.findByEmployeeId(
      employee.id,
    );

    return successResponse(
      documents,
      'Employee documents retrieved successfully.',
    );
  }
  async findMyDocuments(userId: string) {
    const employee = await this.employeeRepository.findByUserId(userId);

    if (!employee) {
      throw new NotFoundException('Employee profile not found.');
    }

    const documents = await this.employeeDocumentRepository.findByEmployeeId(
      employee.id,
    );

    return successResponse(
      documents,
      'Employee documents retrieved successfully.',
    );
  }
  async deactivate(id: string) {
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

    return successResponse(
      updatedDocument,
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
