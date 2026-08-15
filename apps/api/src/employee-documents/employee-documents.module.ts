import { Module } from '@nestjs/common';
import { EmployeeDocumentService } from './employee-documents.service';
import { EmployeeDocumentsController } from './employee-documents.controller';
import { EmployeeDocumentRepository } from './employee-document.repository';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  imports: [EmployeeModule],
  providers: [EmployeeDocumentService, EmployeeDocumentRepository],
  controllers: [EmployeeDocumentsController],
  exports: [EmployeeDocumentRepository],
})
export class EmployeeDocumentsModule {}
