import { Injectable } from '@nestjs/common';
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
  UpdateMyProfileInput,
} from '@hr-management/validation';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

type CreateEmployeeData = Omit<CreateEmployeeInput, 'hireDate'> & {
  employeeNumber: string;
  hireDate: Date;
};

type UpdateEmployeeData = Omit<UpdateEmployeeInput, 'hireDate'> & {
  hireDate?: Date;
};

type UpdateMyProfileData = Omit<UpdateMyProfileInput, 'birthDate'> & {
  birthDate?: Date;
};

const workProfileSelect = {
  id: true,
  employeeNumber: true,
  firstName: true,
  middleName: true,
  lastName: true,
  email: true,
  avatar: true,
  departmentId: true,
  positionId: true,
  branchId: true,
  employmentType: true,
  employmentStatus: true,
  department: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  position: {
    select: {
      id: true,
      name: true,
    },
  },
  branch: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
} satisfies Prisma.EmployeeSelect;

@Injectable()
export class EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateEmployeeData) {
    return this.prisma.employee.create({
      data: input,
      include: {
        department: true,
        position: true,
        branch: true,
      },
    });
  }
  findAll() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        position: true,
        branch: true,
      },
    });
  }
  findAllForAttendance() {
    return this.prisma.employee.findMany({
      where: {
        employmentStatus: 'active',
      },

      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },

      orderBy: {
        employeeNumber: 'asc',
      },
    });
  }
  findById(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
      },
    });
  }
  findByUserId(userId: string) {
    return this.prisma.employee.findUnique({
      where: {
        userId,
      },
      include: {
        department: true,
        position: true,
        branch: true,
        subordinates: {
          select: workProfileSelect,
        },
        manager: {
          select: workProfileSelect,
        },
      },
    });
  }
  findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
    });
  }
  findByEmployeeNumber(employeeNumber: string) {
    return this.prisma.employee.findUnique({
      where: { employeeNumber },
    });
  }
  update(id: string, input: UpdateEmployeeData) {
    return this.prisma.employee.update({
      where: { id },
      data: input,
    });
  }
  updateByUserId(userId: string, input: UpdateMyProfileData) {
    return this.prisma.employee.update({
      where: {
        userId,
      },
      data: input,
    });
  }
  updateByEmployeeIdAvatar(id: string, avatar: string | null) {
    return this.prisma.employee.update({
      where: {
        id,
      },
      data: {
        avatar,
      },
    });
  }
  remove(id: string) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async generateEmployeeNumber() {
    const counter = await this.prisma.counter.upsert({
      where: {
        key: 'employeeId',
      },
      update: {
        value: {
          increment: 1,
        },
      },
      create: {
        key: 'employeeId',
        value: 1,
      },
    });

    return `EMP-${counter.value.toString().padStart(4, '0')}`;
  }
  linkUserIfUnlinked(
    id: string,
    userId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const client = tx ?? this.prisma;

    return client.employee.updateMany({
      where: {
        id,
        userId: null,
      },
      data: {
        userId,
      },
    });
  }

  assignManager(employeeId: string, managerId: string) {
    return this.prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        manager: {
          connect: {
            id: managerId,
          },
        },
      },
      include: {
        manager: true,
      },
    });
  }
  findByManagerId(managerId: string) {
    return this.prisma.employee.findMany({
      where: {
        managerId,
        employmentStatus: 'active',
      },
      select: workProfileSelect,
      orderBy: {
        firstName: 'asc',
      },
    });
  }
  findNotificationRecipients(
    audience: string,
    departmentId?: string,
    branchId?: string,
  ) {
    return this.prisma.employee.findMany({
      where: {
        employmentStatus: 'active',
        userId: {
          not: null,
        },
        ...(audience === 'department' && {
          departmentId,
        }),

        ...(audience === 'branch' && {
          branchId,
        }),
      },
      select: {
        userId: true,
      },
    });
  }
  countAll() {
    return this.prisma.employee.count();
  }
  countByEmploymentStatus(employmentStatus: string) {
    return this.prisma.employee.count({
      where: {
        employmentStatus,
      },
    });
  }
  async terminateWithUserDeactivation(
    employeeId: string,
    userId: string | null,
    terminationDate: Date,
    terminationReason: string,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        if (userId) {
          const linkedUser = await tx.user.findUnique({
            where: {
              id: userId,
            },
            select: {
              role: true,
              status: true,
              isActive: true,
            },
          });

          if (
            linkedUser?.role === 'admin' &&
            linkedUser.status === 'active' &&
            linkedUser.isActive
          ) {
            const activeAdministratorCount = await tx.user.count({
              where: {
                role: 'admin',
                status: 'active',
                isActive: true,
              },
            });

            if (activeAdministratorCount <= 1) {
              return {
                blockedByLastAdministrator: true as const,
                employee: null,
              };
            }
          }
        }

        const employee = await tx.employee.update({
          where: {
            id: employeeId,
          },

          data: {
            employmentStatus: 'terminated',
            terminationDate,
            terminationReason,
          },
        });

        if (userId) {
          await tx.user.update({
            where: {
              id: userId,
            },
            data: {
              isActive: false,
            },
          });
        }

        return {
          blockedByLastAdministrator: false as const,
          employee,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
