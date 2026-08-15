import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class HolidayRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.HolidayCreateInput) {
    return this.prisma.holiday.create({
      data,
    });
  }

  findById(id: string) {
    return this.prisma.holiday.findUnique({
      where: { id },
    });
  }

  findByDate(date: Date) {
    return this.prisma.holiday.findUnique({
      where: { date },
    });
  }

  findAll() {
    return this.prisma.holiday.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  update(id: string, data: Prisma.HolidayUpdateInput) {
    return this.prisma.holiday.update({
      where: { id },
      data,
    });
  }
  findForDateRange(from: Date, to: Date) {
    return this.prisma.holiday.findMany({
      where: {
        isActive: true,
        date: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
