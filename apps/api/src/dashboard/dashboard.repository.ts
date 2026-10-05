import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async employeeCounts() {
    const groups = await this.prisma.employee.groupBy({
      by: ['employmentStatus'],
      _count: { _all: true },
    });
    const count = (status: string) =>
      groups.find((group) => group.employmentStatus === status)?._count._all ??
      0;
    const total = groups.reduce((sum, group) => sum + group._count._all, 0);
    const active = count('active');
    const inactive = count('inactive');
    return { total, active, inactive, other: total - active - inactive };
  }

  countExpiringDocuments(from: Date, through: Date) {
    return this.prisma.employeeDocument.count({
      where: { isActive: true, expiresAt: { gte: from, lte: through } },
    });
  }

  countPendingEmployeeAccounts() {
    return this.prisma.user.count({
      where: {
        status: 'pending',
        employee: { is: { employmentStatus: 'active' } },
      },
    });
  }
}
