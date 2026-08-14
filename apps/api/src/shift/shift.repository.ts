import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ShiftCreateInput) {
    return this.prisma.shift.create({
      data,
    });
  }

  findById(id: string) {
    return this.prisma.shift.findUnique({
      where: { id },
    });
  }

  findByName(name: string) {
    return this.prisma.shift.findUnique({
      where: { name },
    });
  }

  findAll() {
    return this.prisma.shift.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  update(id: string, data: Prisma.ShiftUpdateInput) {
    return this.prisma.shift.update({
      where: { id },
      data,
    });
  }
}
