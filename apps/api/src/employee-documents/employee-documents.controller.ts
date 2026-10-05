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
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { NotFoundException } from '@nestjs/common';
import { get } from '@vercel/blob';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { basename, join } from 'node:path';
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
      storage: memoryStorage(),

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

    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');

    // Support existing files stored on local disk.
    const localPrefix = 'uploads/employee-documents/';

    if (document.fileUrl.startsWith(localPrefix)) {
      const filename = document.fileUrl.slice(localPrefix.length);

      if (!/^[\w-]+\.(pdf|jpe?g|png)$/i.test(filename)) {
        throw new NotFoundException('Document file not found.');
      }

      const directory = join(process.cwd(), 'uploads', 'employee-documents');

      return response.download(join(directory, filename));
    }

    // Accept only the private Blob URL format created by our upload flow.
    let blobUrl: URL;

    try {
      blobUrl = new URL(document.fileUrl);
    } catch {
      throw new NotFoundException('Document file not found.');
    }

    if (
      blobUrl.protocol !== 'https:' ||
      !/^[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/i.test(
        blobUrl.hostname,
      ) ||
      !/^\/employee-documents\/[\w-]+\.(pdf|jpe?g|png)$/i.test(blobUrl.pathname)
    ) {
      throw new NotFoundException('Document file not found.');
    }

    // Use the pathname so the SDK reads from our configured store.
    const result = await get(blobUrl.pathname.slice(1), {
      access: 'private',
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      throw new NotFoundException('Document file not found.');
    }

    response.attachment(basename(result.blob.pathname));
    response.setHeader(
      'Content-Type',
      result.blob.contentType ?? 'application/octet-stream',
    );

    const reader = result.stream.getReader();

    async function* chunks() {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) return;

          yield value;
        }
      } finally {
        try {
          await reader.cancel();
        } finally {
          reader.releaseLock();
        }
      }
    }

    await pipeline(Readable.from(chunks()), response);
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
