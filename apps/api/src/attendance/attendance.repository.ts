import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AttendanceCreateInput) {
    return this.prisma.attendance.create({
      data,
    });
  }
  update(id: string, data: Prisma.AttendanceUpdateInput) {
    return this.prisma.attendance.update({
      where: { id },
      data,
    });
  }
  findByEmployeeAndWorkDate(employeeId: string, workDate: Date) {
    return this.prisma.attendance.findUnique({
      where: {
        employeeId_workDate: {
          employeeId,
          workDate,
        },
      },
    });
  }
  findByEmployeeId(employeeId: string) {
    return this.prisma.attendance.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        workDate: 'desc',
      },
    });
  }
  findAllByWorkDate(workDate: Date) {
    return this.prisma.attendance.findMany({
      where: {
        workDate,
      },
      include: {
        employee: {
          include: {
            department: true,
            position: true,
            branch: true,
          },
        },
      },
      orderBy: {
        checkInAt: 'asc',
      },
    });
  }
  findByEmployeeAndDateRange(employeeId: string, from: Date, to: Date) {
    return this.prisma.attendance.findMany({
      where: {
        employeeId,
        workDate: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        workDate: 'asc',
      },
    });
  }
}
