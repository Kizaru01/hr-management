import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateEmployeeDto } from './dto/create-employee.dto.js';
import { UpdateEmployeeDto } from './dto/update-employee.dto.js';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/user.type.js';
import { UpdateMyProfileDto } from './dto/update-profile.dto.js';
import { AssignManagerDto } from './dto/create-manager.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import { TerminateEmployeeDto } from './dto/create-termination.dto.js';

@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
  @Roles('admin', 'hr')
  @Get()
  findAll() {
    return this.employeeService.findAll();
  }
  @Roles('admin', 'hr')
  @Post()
  create(
    @Body() input: CreateEmployeeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeeService.create(input, user.id);
  }
  @Get('me')
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.employeeService.findMe(user.id);
  }
  @Get('me/team')
  findMyTeam(@CurrentUser() user: AuthenticatedUser) {
    return this.employeeService.findMyTeam(user.id);
  }
  @Roles('admin', 'hr')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }
  @Patch('me/profile')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateMyProfileDto,
  ) {
    return this.employeeService.updateMe(user.id, input);
  }
  @Patch('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatars',

        filename: (_req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

          callback(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  updateMyAvatar(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5 * 1024 * 1024,
          }),

          new FileTypeValidator({
            fileType: /(jpeg|jpg|png|webp)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.employeeService.updateMyAvatar(user.id, file);
  }
  @Patch(':id/manager')
  @Roles('admin', 'hr')
  assignManager(
    @Param('id') id: string,
    @Body() input: AssignManagerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.employeeService.assignManager(id, input, user.id);
  }
  @Patch(':id/terminate')
  @Roles('admin', 'hr')
  terminate(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: TerminateEmployeeDto,
  ) {
    return this.employeeService.terminate(id, user.id, input);
  }
  @Patch(':id')
  @Roles('admin', 'hr')
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: UpdateEmployeeDto,
  ) {
    return this.employeeService.update(id, input, user.id);
  }
  @Delete('me/avatar')
  removeMyAvatar(@CurrentUser() user: AuthenticatedUser) {
    return this.employeeService.removeMyAvatar(user.id);
  }
  @Roles('admin', 'hr')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
