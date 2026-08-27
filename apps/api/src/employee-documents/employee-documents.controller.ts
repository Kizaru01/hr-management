import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Res,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeDocumentService } from './employee-documents.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/user.type';
import { CreateEmployeeDocumentDto } from './dto/create-employee-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';
import type { Response } from 'express';

@ApiBearerAuth()
@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeDocumentsController {
  constructor(
    private readonly employeeDocumentService: EmployeeDocumentService,
  ) {}
  @Post(':employeeId/documents')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/employee-documents',

        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

          callback(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),

      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  createDocument(
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile()
    file: Express.Multer.File,
    @Body() input: CreateEmployeeDocumentDto,
  ) {
    return this.employeeDocumentService.create(
      employeeId,
      user.id,
      file,
      input,
    );
  }
  @Get('me/documents')
  findMyDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.employeeDocumentService.findMyDocuments(user.id);
  }
  @Get('documents')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  findAllDocuments() {
    return this.employeeDocumentService.findAll();
  }
  @Get(':employeeId/documents')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  findEmployeeDocuments(@Param('employeeId') employeeId: string) {
    return this.employeeDocumentService.findByEmployeeId(employeeId);
  }
  @Get('documents/:id/download')
  async downloadDocument(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() response: Response,
  ) {
    const document = await this.employeeDocumentService.getDocumentForDownload(
      id,
      user.id,
      user.role,
    );

    const filePath = join(process.cwd(), document.fileUrl);

    return response.sendFile(filePath);
  }
  @Patch('documents/:id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'hr')
  deactivateDocument(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeeDocumentService.deactivate(id, user.id);
  }
}
