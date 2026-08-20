import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HolidayRepository } from './holliday.repository';
import {
  CreateHolidayInput,
  UpdateHolidayInput,
} from '@hr-management/validation';
import { successResponse } from '../common/responses/success-response';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class HolidayService {
  constructor(private readonly holidayRepository: HolidayRepository) {}
  async create(input: CreateHolidayInput) {
    const existingHoliday = await this.holidayRepository.findByDate(input.date);

    if (existingHoliday) {
      throw new ConflictException('A holiday already exists on this date.');
    }

    try {
      const holiday = await this.holidayRepository.create({
        name: input.name.trim(),
        date: input.date,
      });

      return successResponse(holiday, 'Holiday created successfully.');
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A holiday already exists on this date.');
      }

      throw error;
    }
  }
  async findAll() {
    const holidays = await this.holidayRepository.findAll();

    return successResponse(holidays, 'Holidays retrieved successfully.');
  }

  async findOne(id: string) {
    const holiday = await this.holidayRepository.findById(id);

    if (!holiday) {
      throw new NotFoundException('Holiday not found.');
    }

    return successResponse(holiday, 'Holiday retrieved successfully.');
  }

  async update(id: string, input: UpdateHolidayInput) {
    const existingHoliday = await this.holidayRepository.findById(id);

    if (!existingHoliday) {
      throw new NotFoundException('Holiday not found.');
    }

    const nextDate = input.date ?? existingHoliday.date;

    if (input.date !== undefined) {
      const duplicate = await this.holidayRepository.findByDate(nextDate);

      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('A holiday already exists on this date.');
      }
    }

    const holiday = await this.holidayRepository.update(id, {
      ...input,
      ...(input.name !== undefined && {
        name: input.name.trim(),
      }),
    });

    return successResponse(holiday, 'Holiday updated successfully.');
  }

  async deactivate(id: string) {
    const holiday = await this.holidayRepository.findById(id);

    if (!holiday) {
      throw new NotFoundException('Holiday not found.');
    }

    if (!holiday.isActive) {
      throw new BadRequestException('Holiday is already inactive.');
    }

    const updatedHoliday = await this.holidayRepository.update(id, {
      isActive: false,
    });

    return successResponse(updatedHoliday, 'Holiday deactivated successfully.');
  }
}
