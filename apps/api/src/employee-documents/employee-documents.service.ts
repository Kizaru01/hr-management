import { Injectable, NotFoundException } from '@nestjs/common';
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
    input: CreateEmployeeDocumentInput,
  ) {
    const employee = await this.employeeRepository.findById(employeeId);

    if (!employee) {
      throw new NotFoundException('Employee not found.');
    }

    const document = await this.employeeDocumentRepository.create({
      title: input.title.trim(),
      type: input.type.trim(),
      fileUrl: input.fileUrl,
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
}
