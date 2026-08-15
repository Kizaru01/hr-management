import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { EmployeeDocumentService } from './employee-documents.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/user.type';
import { CreateEmployeeDocumentDto } from './dto/create-employee-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeDocumentsController {
  constructor(
    private readonly employeeDocumentService: EmployeeDocumentService,
  ) {}
  @Post(':employeeId/documents')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  createDocument(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CreateEmployeeDocumentDto,
  ) {
    return this.employeeDocumentService.create(employeeId, user.id, input);
  }
}
