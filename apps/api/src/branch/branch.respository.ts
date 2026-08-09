import { Injectable } from '@nestjs/common';
import type {
  CreateBranchInput,
  UpdateBranchInput,
} from '@hr-management/validation';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.branch.findMany();
  }

  findById(id: string) {
    return this.prisma.branch.findUnique({
      where: { id },
    });
  }

  findByCode(code: string) {
    return this.prisma.branch.findUnique({
      where: { code },
    });
  }

  create(input: CreateBranchInput) {
    return this.prisma.branch.create({
      data: input,
    });
  }

  update(id: string, input: UpdateBranchInput) {
    return this.prisma.branch.update({
      where: { id },
      data: input,
    });
  }

  remove(id: string) {
    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
